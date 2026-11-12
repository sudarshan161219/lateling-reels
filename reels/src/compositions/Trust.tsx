import React from 'react';
import {AbsoluteFill, interpolate, Series, useCurrentFrame, useVideoConfig} from 'remotion';
import {BrowserIcon, CheckIcon, CrossIcon, LockIcon, ServerIcon, StoreIcon} from '../components/Icons';
import {AudioLayer, Background, Caption, EndCard, Hook, Scene, Stage, useEnter} from '../components/primitives';
import {mono, serif} from '../fonts';
import type {TrustProps} from '../schemas';
import {theme} from '../theme';

// Facts about the app. Fixed here so a props file cannot change them.
const CAN = [
  {scope: 'read_orders', label: 'Read orders'},
  {scope: 'read_customers', label: 'Read customers'},
];
const CANNOT = ['Refund an order', 'Cancel an order', 'Change anything'];

const Heading: React.FC<{text: string}> = ({text}) => {
  const p = useEnter(0);
  return (
    <div
      style={{
        fontFamily: serif,
        fontWeight: 700,
        fontSize: text.length <= 22 ? 92 : 76,
        lineHeight: 1.14,
        letterSpacing: '-0.02em',
        textWrap: 'balance',
        marginBottom: 44,
        opacity: p,
        transform: `translateY(${(1 - p) * 24}px)`,
      }}
    >
      {text}
    </div>
  );
};

const Row: React.FC<{at: number; ok: boolean; label: string; scope?: string}> = ({at, ok, label, scope}) => {
  const p = useEnter(at);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        padding: '22px 0',
        opacity: p,
        transform: `translateX(${(1 - p) * -30}px)`,
      }}
    >
      <div
        style={{
          width: 68,
          height: 68,
          borderRadius: 34,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: ok ? theme.primaryTint : theme.clayTint,
          color: ok ? theme.primary : theme.clay,
        }}
      >
        {ok ? <CheckIcon size={40} strokeWidth={2.8} /> : <CrossIcon size={38} strokeWidth={2.8} />}
      </div>
      <div style={{fontSize: 46, fontWeight: 600, color: ok ? theme.ink : theme.inkMuted}}>{label}</div>
      {scope ? (
        <div
          style={{
            marginLeft: 'auto',
            fontFamily: mono,
            fontSize: 28,
            color: theme.primary,
            background: theme.primaryTint,
            borderRadius: 10,
            padding: '8px 14px',
          }}
        >
          {scope}
        </div>
      ) : null}
    </div>
  );
};

/** Rows come in one by one across the first two thirds of the scene. */
const ReadOnlyScene: React.FC<{heading: string; frames: number}> = ({heading, frames}) => {
  const at = (share: number) => Math.round(frames * share);
  return (
  <Stage>
    <Heading text={heading} />
    <div
      style={{
        background: theme.surface,
        border: `2px solid ${theme.line}`,
        borderRadius: 28,
        boxShadow: theme.shadowLift,
        padding: '26px 36px',
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 14, fontSize: 30, fontWeight: 600, color: theme.inkMuted, marginBottom: 6}}>
        <LockIcon size={34} /> What Lateling can do
      </div>
      {CAN.map((c, i) => (
        <Row key={c.scope} at={at(0.08 + i * 0.1)} ok label={c.label} scope={c.scope} />
      ))}
      <div style={{borderTop: `2px solid ${theme.line}`, margin: '10px 0'}} />
      {CANNOT.map((c, i) => (
        <Row key={c} at={at(0.36 + i * 0.1)} ok={false} label={c} />
      ))}
    </div>
  </Stage>
  );
};

const Node: React.FC<{icon: React.ReactNode; label: string; muted?: boolean; at: number}> = ({icon, label, muted, at}) => {
  const p = useEnter(at);
  return (
    <div
      style={{
        width: 330,
        padding: '34px 16px',
        borderRadius: 28,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        background: muted ? 'transparent' : theme.surface,
        border: muted ? `4px dashed ${theme.lineStrong}` : `2px solid ${theme.line}`,
        boxShadow: muted ? 'none' : theme.shadowLift,
        color: muted ? theme.inkSubtle : theme.primary,
        opacity: p,
        transform: `scale(${0.9 + 0.1 * p})`,
      }}
    >
      {icon}
      <div style={{fontSize: 40, fontWeight: 700, color: muted ? theme.inkSubtle : theme.ink, textAlign: 'center'}}>{label}</div>
    </div>
  );
};

const DataScene: React.FC<{heading: string; frames: number}> = ({heading, frames}) => {
  const frame = useCurrentFrame();
  const flow = useEnter(22);
  const serverAt = Math.round(frames * 0.4);
  const no = useEnter(serverAt + Math.round(frames * 0.12));
  return (
    <Stage>
      <Heading text={heading} />
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <Node at={6} icon={<StoreIcon size={96} strokeWidth={1.6} />} label="Your store" />
        <div style={{flex: 1, height: 10, margin: '0 18px', position: 'relative', opacity: flow}}>
          <div style={{position: 'absolute', inset: 0, borderRadius: 5, background: theme.primaryLine}} />
          {[0, 1, 2].map((i) => {
            const t = ((frame + i * 12) % 36) / 36;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: -9,
                  left: `${t * 100}%`,
                  width: 28,
                  height: 28,
                  marginLeft: -14,
                  borderRadius: 14,
                  background: theme.primary,
                  opacity: interpolate(t, [0, 0.15, 0.85, 1], [0, 1, 1, 0]),
                }}
              />
            );
          })}
        </div>
        <Node at={12} icon={<BrowserIcon size={96} strokeWidth={1.6} />} label="Your browser" />
      </div>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 30, marginTop: 56}}>
        <Node at={serverAt} muted icon={<ServerIcon size={96} strokeWidth={1.6} />} label="Our servers" />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 42,
            fontWeight: 700,
            color: theme.clay,
            opacity: no,
            transform: `translateX(${(1 - no) * -20}px)`,
          }}
        >
          <CrossIcon size={48} strokeWidth={3} />
          Not stored here
        </div>
      </div>
    </Stage>
  );
};

/** Read-only access, and order data that goes from the store to the browser. */
export const Trust: React.FC<TrustProps> = (props) => {
  const {fps} = useVideoConfig();
  const f = (s: number) => Math.round(s * fps);
  const s = props.seconds;
  return (
    <AbsoluteFill>
      <Background />
      <Series>
        <Series.Sequence durationInFrames={f(s.hook)}>
          <Scene fadeIn={false}>
            <Hook text={props.hook} />
          </Scene>
        </Series.Sequence>
        <Series.Sequence durationInFrames={f(s.readOnly)}>
          <Scene>
            <ReadOnlyScene heading={props.readOnly.heading} frames={f(s.readOnly)} />
            <Caption text={props.readOnly.caption} at={10} />
          </Scene>
        </Series.Sequence>
        <Series.Sequence durationInFrames={f(s.data)}>
          <Scene>
            <DataScene heading={props.data.heading} frames={f(s.data)} />
            <Caption text={props.data.caption} at={10} />
          </Scene>
        </Series.Sequence>
        <Series.Sequence durationInFrames={f(s.endCard)}>
          <Scene fadeOut={false}>
            <EndCard />
          </Scene>
        </Series.Sequence>
      </Series>
      <AudioLayer audio={props.audio} />
    </AbsoluteFill>
  );
};
