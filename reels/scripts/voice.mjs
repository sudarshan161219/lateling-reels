// AI voiceover. Turns the "voiceover" lines of a props file into one WAV file,
// with each line starting at its scene, and stretches scenes that are too short for their line.
// Speech comes from Gemini text-to-speech and needs GEMINI_API_KEY in the environment.
import {buildSync} from 'esbuild';
import {mkdirSync, mkdtempSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const MODEL = process.env.TTS_MODEL || 'gemini-3.8-flash-tts';
const VOICE = process.env.TTS_VOICE || 'Sulafat';
const STYLE = process.env.TTS_STYLE ?? 'Calm, friendly and clear. Natural pace.';
// The end card always says the same thing, so a script cannot change it.
const END_CARD_LINE = 'Lateling. Free plan on the Shopify App Store.';

const RATE = 24000; // Hz, mono, 16-bit
const LEAD = 0.2; // seconds of quiet before a line
const TAIL = 0.3; // seconds of quiet after a line
const MAX_TOTAL = 25;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Reads the 16-bit samples out of a WAV file. */
const wavSamples = (buf) => {
  if (buf.toString('ascii', 0, 4) !== 'RIFF') return new Int16Array(buf.buffer, buf.byteOffset, buf.length >> 1);
  let at = 12;
  while (at + 8 <= buf.length) {
    const id = buf.toString('ascii', at, at + 4);
    const size = buf.readUInt32LE(at + 4);
    if (id === 'data') {
      const end = Math.min(buf.length, at + 8 + size);
      const copy = Buffer.from(buf.subarray(at + 8, end));
      return new Int16Array(copy.buffer, copy.byteOffset, copy.length >> 1);
    }
    at += 8 + size + (size % 2);
  }
  throw new Error('no audio data in the answer');
};

const speak = async (text, key) => {
  // TTS_MOCK=1 makes a tone of about the right length, to check timing without a key.
  if (process.env.TTS_MOCK) {
    const n = Math.round((0.4 + text.length / 15) * RATE);
    return Int16Array.from({length: n}, (_, i) => Math.round(Math.sin((i / RATE) * 2 * Math.PI * 220) * 4000));
  }
  const body = {
    model: MODEL,
    input: [
      {
        type: 'user_input',
        content: [{type: 'text', text, annotations: STYLE ? [{type: 'speech_metadata', style: STYLE}] : []}],
      },
    ],
    response_format: {type: 'audio'},
    generation_config: {speech_config: [{voice: VOICE}]},
  };
  for (let attempt = 1; ; attempt++) {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
      method: 'POST',
      headers: {'x-goog-api-key': key, 'Content-Type': 'application/json'},
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const json = await res.json();
      const audio = (json.steps ?? [])
        .filter((s) => s.type === 'model_output')
        .flatMap((s) => s.content ?? [])
        .filter((c) => c.type === 'audio')
        .pop();
      if (!audio?.data) throw new Error('the answer contains no audio');
      return wavSamples(Buffer.from(audio.data, 'base64'));
    }
    const message = (await res.text()).slice(0, 300);
    // Rate limits and server errors are worth waiting for. Anything else is not.
    if ((res.status === 429 || res.status >= 500) && attempt < 5) {
      await sleep(attempt * 15000);
      continue;
    }
    throw new Error(`Gemini speech request failed (${res.status}): ${message}`);
  }
};

/** Scene order and the allowed length of each scene, read from src/schemas.ts. */
const loadTiming = async (root, comp) => {
  const outfile = path.join(mkdtempSync(path.join(tmpdir(), 'lateling-voice-')), 'schemas.mjs');
  buildSync({
    stdin: {contents: `export * from './src/schemas.ts'; export {z} from 'zod';`, resolveDir: root, loader: 'ts'},
    bundle: true,
    format: 'esm',
    platform: 'node',
    outfile,
  });
  const s = await import(pathToFileURL(outfile).href);
  const schema = {
    BeforeAfter: s.beforeAfterSchema,
    FeatureDemo: s.featureDemoSchema,
    Tips: s.tipsSchema,
    Trust: s.trustSchema,
  }[comp];
  const ranges = s.z.toJSONSchema(schema, {io: 'input'}).properties.seconds.properties;
  return {scenes: s.SCENES[comp], ranges};
};

/**
 * Returns the props to render with: "seconds" adjusted to fit the lines and
 * audio.voiceoverSrc set. Returns the props unchanged when there is nothing to say.
 * Throws if the speech cannot be made; the caller decides what to do then.
 */
export const addVoiceover = async ({root, comp, props}) => {
  const lines = props.voiceover;
  if (!Array.isArray(lines) || lines.length === 0 || props.audio?.voiceoverSrc) return props;
  const key = process.env.GEMINI_API_KEY;
  if (!key && !process.env.TTS_MOCK) throw new Error('GEMINI_API_KEY is not set');

  const {scenes, ranges} = await loadTiming(root, comp);
  const spoken = [...lines, END_CARD_LINE];
  if (spoken.length !== scenes.length) {
    throw new Error(`${comp} needs ${scenes.length - 1} voiceover lines, got ${lines.length}`);
  }

  const clips = [];
  for (const line of spoken) clips.push(await speak(line, key)); // one at a time, to stay under rate limits
  const need = clips.map((c) => LEAD + c.length / RATE + TAIL);

  // Start from the script's scene lengths, then make each scene long enough for its line.
  const seconds = {};
  for (const k of new Set(scenes)) seconds[k] = props.seconds?.[k] ?? ranges[k].default;
  scenes.forEach((k, i) => {
    seconds[k] = Math.min(ranges[k].maximum, Math.max(seconds[k], Math.ceil(need[i] * 10) / 10));
  });
  // If that made the video too long, take time back from the scenes with the most room.
  const total = () => scenes.reduce((sum, k) => sum + seconds[k], 0);
  for (let guard = 0; total() > MAX_TOTAL + 1e-6 && guard < 500; guard++) {
    const keys = Object.keys(seconds).filter((k) => seconds[k] - 0.1 >= ranges[k].minimum - 1e-6);
    if (keys.length === 0) break;
    const slack = (k) => seconds[k] - Math.max(...scenes.map((s, i) => (s === k ? need[i] : 0)));
    keys.sort((a, b) => slack(b) - slack(a));
    seconds[keys[0]] = Math.round((seconds[keys[0]] - 0.1) * 10) / 10;
  }

  // Lay the lines on one track. A line never starts before the one before it has ended.
  const mix = new Int16Array(Math.round(total() * RATE));
  let sceneStart = 0;
  let free = 0;
  scenes.forEach((k, i) => {
    const start = Math.max(Math.round((sceneStart + LEAD) * RATE), free);
    const clip = clips[i].subarray(0, Math.max(0, mix.length - start));
    mix.set(clip, start);
    free = start + clip.length + Math.round(0.12 * RATE);
    sceneStart += seconds[k];
  });

  const header = Buffer.alloc(44);
  const bytes = mix.length * 2;
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + bytes, 4);
  header.write('WAVEfmt ', 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(RATE, 24);
  header.writeUInt32LE(RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(bytes, 40);
  const dir = path.join(root, 'public', 'generated');
  mkdirSync(dir, {recursive: true});
  writeFileSync(path.join(dir, 'voiceover.wav'), Buffer.concat([header, Buffer.from(mix.buffer, mix.byteOffset, bytes)]));

  console.log(`render: voiceover, ${spoken.length} lines, voice ${VOICE}, ${total().toFixed(1)} s`);
  return {...props, seconds, audio: {...props.audio, voiceoverSrc: 'generated/voiceover.wav'}};
};
