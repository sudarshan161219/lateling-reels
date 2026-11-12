import React from 'react';
import {AbsoluteFill, Series, useVideoConfig} from 'remotion';
import {AudioLayer, Background, Caption, EndCard, Hook, Scene, useEnter} from '../components/primitives';
import {serif} from '../fonts';
import {NeedsAttentionScene} from '../scenes';
import type {TipsProps} from '../schemas';
import {SAFE, theme} from '../theme';

const Tip: React.FC<{n: number; total: number; title: string; body: string}> = ({n, total, title, body}) => {
  const a = useEnter(0);
  const b = useEnter(8);
  const c = useEnter(16);
  const rise = (p: number) => ({opacity: p, transform: `translateY(${(1 - p) * 26}px)`});
  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        padding: `${SAFE.top}px ${SAFE.rightRail}px ${SAFE.bottom}px ${SAFE.side + 20}px`,
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 22, ...rise(a)}}>
        <div
          style={{
            width: 110,
            height: 110,
            borderRadius: 55,
            background: theme.primary,
            color: '#fff',
            fontFamily: serif,
            fontWeight: 700,
            fontSize: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {n}
        </div>
        <div style={{fontSize: 36, fontWeight: 600, color: theme.inkMuted}}>
          Tip {n} of {total}
        </div>
      </div>
      <div
        style={{
          fontFamily: serif,
          fontWeight: 700,
          fontSize: title.length <= 26 ? 96 : 80,
          lineHeight: 1.14,
          letterSpacing: '-0.02em',
          marginTop: 44,
          textWrap: 'balance',
          ...rise(b),
        }}
      >
        {title}
      </div>
      <div style={{fontSize: 50, lineHeight: 1.4, color: theme.inkMuted, marginTop: 36, ...rise(c)}}>{body}</div>
    </AbsoluteFill>
  );
};

/** Three tips as text on screen. Lateling appears only in the last scene and the end card. */
export const Tips: React.FC<TipsProps> = (props) => {
  const {fps} = useVideoConfig();
  const f = (s: number) => Math.round(s * fps);
  const s = props.seconds;
  const latelingFrames = f(s.lateling);
  return (
    <AbsoluteFill>
      <Background />
      <Series>
        <Series.Sequence durationInFrames={f(s.hook)}>
          <Scene fadeIn={false}>
            <Hook text={props.hook} />
          </Scene>
        </Series.Sequence>
        {props.tips.map((t, i) => (
          <Series.Sequence key={i} durationInFrames={f(s.tip)}>
            <Scene>
              <Tip n={i + 1} total={props.tips.length} title={t.title} body={t.body} />
            </Scene>
          </Series.Sequence>
        ))}
        <Series.Sequence durationInFrames={latelingFrames}>
          <Scene>
            <NeedsAttentionScene orders={props.lateling.orders} step={Math.floor(latelingFrames / 2)} copy={false} />
            <Caption text={props.lateling.caption} at={6} />
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
