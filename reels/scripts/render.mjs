#!/usr/bin/env node
// Renders one composition to out/<name>.mp4.
//   npm run render -- --comp BeforeAfter --props props/examples/before-after.json [--out out/my-reel.mp4]
//   npm run render -- --comp ToolStory --props props/examples/tool-story.json
import {spawnSync} from 'node:child_process';
import {existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {addVoiceover} from './voice.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const COMPS = ['BeforeAfter', 'FeatureDemo', 'Tips', 'Trust', 'ToolDemo', 'ToolStory', 'ToolTips', 'ToolTrust'];

const args = process.argv.slice(2);
const arg = (name) => {
  const i = args.indexOf(`--${name}`);
  if (i !== -1) return args[i + 1];
  const eq = args.find((a) => a.startsWith(`--${name}=`));
  return eq ? eq.slice(name.length + 3) : undefined;
};
const fail = (msg) => {
  console.error(`render: ${msg}`);
  process.exit(1);
};

const comp = arg('comp');
const propsArg = arg('props');
if (!comp || !COMPS.includes(comp)) fail(`--comp must be one of ${COMPS.join(', ')}`);
if (!propsArg) fail('--props <file.json> is required');

let propsPath = path.resolve(process.cwd(), propsArg);
if (!existsSync(propsPath)) fail(`props file not found: ${propsPath}`);
let props;
try {
  props = JSON.parse(readFileSync(propsPath, 'utf8'));
} catch (e) {
  fail(`props file is not valid JSON: ${e.message}`);
}

// Music: if the props name no track, pick one at random from public/music.
// --no-music turns this off.
const MUSIC_VOLUME = 0.5;
const musicDir = path.join(root, 'public', 'music');
const tracks = existsSync(musicDir) ? readdirSync(musicDir).filter((f) => /\.(mp3|m4a|wav|ogg)$/i.test(f)).sort() : [];
if (!args.includes('--no-music') && !props.audio?.musicSrc && tracks.length > 0) {
  const track = tracks[Math.floor(Math.random() * tracks.length)];
  props.audio = {...props.audio, musicSrc: `music/${track}`, musicVolume: MUSIC_VOLUME};
  console.log(`render: music ${track}`);
}

// Voiceover: if the props have "voiceover" lines, speak them. --no-voice turns this off.
// A video without a voice is better than no video, so a failure here does not stop the render.
if (!args.includes('--no-voice')) {
  try {
    props = await addVoiceover({root, comp, props});
  } catch (e) {
    console.warn(`render: no voiceover: ${e.message}`);
  }
}

mkdirSync(path.join(root, 'out'), {recursive: true});
propsPath = path.join(root, 'out', '.props-final.json');
writeFileSync(propsPath, JSON.stringify(props));

const stamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15);
const out = path.resolve(process.cwd(), arg('out') ?? path.join(root, 'out', `${props.product ?? 'lateling'}-${comp}-${stamp}.mp4`));
mkdirSync(path.dirname(out), {recursive: true});

const bin = path.join(root, 'node_modules', '.bin', process.platform === 'win32' ? 'remotion.cmd' : 'remotion');
const res = spawnSync(bin, ['render', 'src/index.ts', comp, out, `--props=${propsPath}`], {
  cwd: root,
  stdio: 'inherit',
});
if (res.status !== 0) process.exit(res.status ?? 1);
console.log(`\nRendered ${out}`);
