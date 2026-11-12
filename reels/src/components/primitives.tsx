import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {sans, serif} from '../fonts';
import type {AudioProps} from '../schemas';
import {END_CARD_LINE, LANDING_URL, SAFE, STAGE, theme} from '../theme';
import {LatelingMark} from './Icons';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 0 to 1 spring that starts at frame `at`. */
export const useEnter = (at = 0, damping = 200) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - at, fps, config: {damping}});
};

export const Background: React.FC = () => (
  <AbsoluteFill
    style={{background: `linear-gradient(180deg, ${theme.sunken} 0%, ${theme.paper} 55%, ${theme.sunken} 100%)`}}
  />
);

/** Wraps one scene. Fades in at the start and out at the end of its Sequence. */
export const Scene: React.FC<{children: React.ReactNode; fadeIn?: boolean; fadeOut?: boolean}> = ({
  children,
  fadeIn = true,
  fadeOut = true,
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const inO = fadeIn ? interpolate(frame, [0, 7], [0, 1], clamp) : 1;
  const outO = fadeOut ? interpolate(frame, [durationInFrames - 6, durationInFrames], [1, 0], clamp) : 1;
  return <AbsoluteFill style={{opacity: Math.min(inO, outO), fontFamily: sans, color: theme.ink}}>{children}</AbsoluteFill>;
};

/** The safe box for UI mock-ups. Children are positioned relative to it. */
export const Stage: React.FC<{children: React.ReactNode; justify?: 'flex-start' | 'center'}> = ({
  children,
  justify = 'center',
}) => (
  <div
    style={{
      position: 'absolute',
      left: STAGE.left,
      top: STAGE.top,
      width: STAGE.width,
      height: STAGE.height,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: justify,
    }}
  >
    {children}
  </div>
);

/** Big opening line. Readable from frame 0, words settle in over the first third of a second. */
export const Hook: React.FC<{text: string; sub?: string}> = ({text, sub}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const words = text.split(/\s+/);
  const size = text.length <= 24 ? 132 : text.length <= 42 ? 112 : 94;
  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: `${SAFE.top}px ${SAFE.side + 16}px ${SAFE.bottom}px`,
      }}
    >
      <div
        style={{
          fontFamily: serif,
          fontWeight: 700,
          fontSize: size,
          lineHeight: 1.12,
          letterSpacing: '-0.02em',
          textAlign: 'center',
          color: theme.ink,
          textWrap: 'balance',
        }}
      >
        {words.map((w, i) => {
          const p = spring({frame: frame - i * 1.5 + 7, fps, config: {damping: 200}});
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                marginRight: '0.26em',
                opacity: 0.5 + 0.5 * p,
                transform: `translateY(${(1 - p) * 26}px)`,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
      {sub ? (
        <div
          style={{
            marginTop: 44,
            fontSize: 44,
            lineHeight: 1.35,
            color: theme.inkMuted,
            textAlign: 'center',
            opacity: interpolate(frame, [10, 20], [0, 1], clamp),
          }}
        >
          {sub}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/** Burned-in caption, bottom of the safe area, narrow enough to miss the right-hand button column. */
export const Caption: React.FC<{text: string; at?: number}> = ({text, at = 0}) => {
  const p = useEnter(at);
  if (!text) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: SAFE.bottom,
        display: 'flex',
        justifyContent: 'center',
        opacity: p,
        transform: `translateY(${(1 - p) * 20}px)`,
      }}
    >
      <div
        style={{
          maxWidth: 1080 - SAFE.rightRail * 2,
          background: theme.ink,
          color: '#fff',
          fontFamily: sans,
          fontWeight: 600,
          fontSize: 50,
          lineHeight: 1.26,
          textAlign: 'center',
          padding: '22px 34px 26px',
          borderRadius: 26,
          textWrap: 'balance',
          boxShadow: '0 10px 30px rgba(42,37,32,0.22)',
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** Shows `captions[i]` during step i, each step being `stepFrames` long. */
export const StepCaptions: React.FC<{captions: string[]; stepFrames: number}> = ({captions, stepFrames}) => {
  const frame = useCurrentFrame();
  const i = Math.min(captions.length - 1, Math.floor(frame / stepFrames));
  return <Caption key={i} text={captions[i]} at={i * stepFrames} />;
};

/** Small label above a mock-up, for example "Before" or "With Lateling". */
export const SceneLabel: React.FC<{text: string; tone?: 'neutral' | 'brand'}> = ({text, tone = 'neutral'}) => (
  <div
    style={{
      alignSelf: 'flex-start',
      fontSize: 30,
      fontWeight: 600,
      lineHeight: 1,
      padding: '14px 24px',
      borderRadius: 999,
      marginBottom: 22,
      color: tone === 'brand' ? theme.primary : theme.inkMuted,
      background: tone === 'brand' ? theme.primaryTint : theme.surface,
      border: `2px solid ${tone === 'brand' ? theme.primaryLine : theme.line}`,
    }}
  >
    {text}
  </div>
);

/** Animated ring around its children, starting at frame `at`. */
export const Highlight: React.FC<{
  at: number;
  until?: number;
  children: React.ReactNode;
  pad?: number;
  radius?: number;
  color?: string;
  block?: boolean;
}> = ({at, until, children, pad = 10, radius = 18, color = theme.clay, block}) => {
  const frame = useCurrentFrame();
  const p = useEnter(at);
  const out = until === undefined ? 1 : interpolate(frame, [until, until + 6], [1, 0], clamp);
  return (
    <span style={{position: 'relative', display: block ? 'block' : 'inline-block'}}>
      {children}
      <span
        style={{
          position: 'absolute',
          inset: -pad,
          borderRadius: radius,
          border: `5px solid ${color}`,
          background: `${color}14`,
          opacity: p * out,
          transform: `scale(${1.08 - 0.08 * p})`,
          pointerEvents: 'none',
        }}
      />
    </span>
  );
};

export type CursorKey = {f: number; x: number; y: number; click?: boolean};

/**
 * Pointer that travels between key positions. It arrives at each key on frame `f`
 * and clicks there if `click` is set. Coordinates are relative to the parent.
 */
export const Cursor: React.FC<{keys: CursorKey[]; travel?: number}> = ({keys, travel = 16}) => {
  const frame = useCurrentFrame();
  if (keys.length === 0) return null;
  let x = keys[0].x;
  let y = keys[0].y;
  for (let i = 1; i < keys.length; i++) {
    const prev = keys[i - 1];
    const k = keys[i];
    const start = Math.max(prev.f, k.f - travel);
    const t = interpolate(frame, [start, k.f], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
    x = x + (k.x - x) * t;
    y = y + (k.y - y) * t;
  }
  const last = keys[keys.length - 1].f;
  const opacity = Math.min(
    interpolate(frame, [keys[0].f - 6, keys[0].f], [0, 1], clamp),
    interpolate(frame, [last + 22, last + 30], [1, 0], clamp),
  );
  const click = keys.find((k) => k.click && frame >= k.f && frame < k.f + 14);
  const sinceClick = click ? frame - click.f : 0;
  const press = click ? interpolate(sinceClick, [0, 3, 8], [1, 0.82, 1], clamp) : 1;
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity, zIndex: 50, pointerEvents: 'none'}}>
      {click ? (
        <div
          style={{
            position: 'absolute',
            left: -50,
            top: -50,
            width: 100,
            height: 100,
            borderRadius: 50,
            border: `5px solid ${theme.primary}`,
            opacity: interpolate(sinceClick, [0, 13], [0.8, 0], clamp),
            transform: `scale(${interpolate(sinceClick, [0, 13], [0.3, 1.15], clamp)})`,
          }}
        />
      ) : null}
      <svg
        width={62}
        height={62}
        viewBox="0 0 24 24"
        style={{
          transform: `translate(-6px, -4px) scale(${press})`,
          transformOrigin: '6px 4px',
          filter: 'drop-shadow(0 4px 6px rgba(42,37,32,0.35))',
        }}
      >
        <path
          d="M5 3l14 8-6.2 1.5L10 19 5 3Z"
          fill={theme.ink}
          stroke="#fff"
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

/**
 * Wraps something clickable. If `clickAt` is set, a cursor glides in from the offset `from`
 * and clicks the middle of the children on that frame.
 */
export const ClickTarget: React.FC<{
  clickAt?: number;
  from?: [number, number];
  children: React.ReactNode;
  block?: boolean;
}> = ({clickAt, from = [-220, 240], children, block}) => (
  <span style={{position: 'relative', display: block ? 'block' : 'inline-flex'}}>
    {children}
    {clickAt === undefined ? null : (
      <span style={{position: 'absolute', left: '58%', top: '58%', zIndex: 50}}>
        <Cursor
          keys={[
            {f: clickAt - 20, x: from[0], y: from[1]},
            {f: clickAt, x: 0, y: 0, click: true},
          ]}
        />
      </span>
    )}
  </span>
);

/** The closing card. Identical in every composition. */
export const EndCard: React.FC = () => {
  const a = useEnter(0);
  const b = useEnter(6);
  const c = useEnter(12);
  const rise = (p: number) => ({opacity: p, transform: `translateY(${(1 - p) * 24}px)`});
  return (
    <AbsoluteFill
      style={{
        background: theme.paper,
        fontFamily: sans,
        color: theme.ink,
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${SAFE.top}px ${SAFE.side}px ${SAFE.bottom}px`,
      }}
    >
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', ...rise(a)}}>
        <LatelingMark size={170} />
        <div style={{fontFamily: serif, fontWeight: 700, fontSize: 150, letterSpacing: '-0.02em', marginTop: 30, lineHeight: 1.15}}>
          Lateling
        </div>
      </div>
      <div
        style={{
          marginTop: 44,
          background: theme.primary,
          color: '#fff',
          fontSize: 46,
          fontWeight: 600,
          lineHeight: 1.25,
          padding: '26px 40px',
          borderRadius: 22,
          textAlign: 'center',
          ...rise(b),
        }}
      >
        {END_CARD_LINE}
      </div>
      <div style={{marginTop: 40, fontSize: 36, fontWeight: 500, color: theme.inkMuted, ...rise(c)}}>{LANDING_URL}</div>
    </AbsoluteFill>
  );
};

const resolveSrc = (src: string) => (/^https?:\/\//.test(src) ? src : staticFile(src));

/** Optional music bed (looped, faded out at the end) and optional voiceover. */
export const AudioLayer: React.FC<{audio: AudioProps}> = ({audio}) => {
  const {durationInFrames, fps} = useVideoConfig();
  const base = audio.voiceoverSrc ? audio.musicVolume * 0.3 : audio.musicVolume;
  return (
    <>
      {audio.musicSrc ? (
        <Audio
          src={resolveSrc(audio.musicSrc)}
          loop
          volume={(f) =>
            base *
            interpolate(f, [0, fps * 0.5, durationInFrames - fps, durationInFrames], [0, 1, 1, 0], clamp)
          }
        />
      ) : null}
      {audio.voiceoverSrc ? <Audio src={resolveSrc(audio.voiceoverSrc)} /> : null}
    </>
  );
};
