// Compositions that work for any product in reels/products. They use the product's real
// screenshots where it has them, and its name, logo and facts from the product file.
import React from 'react';
import {AbsoluteFill, Sequence, Series, useVideoConfig} from 'remotion';
import {CheckIcon, CrossIcon, LockIcon} from '../components/Icons';
import {
  accentOf,
  AudioLayer,
  Background,
  Caption,
  EndCard,
  Hook,
  Scene,
  SceneLabel,
  Stage,
  StepCaptions,
  useEnter,
  useProduct,
} from '../components/primitives';
import {ScreenFrame, ScreenOrCard} from '../components/ScreenFrame';
import {serif} from '../fonts';
import type {ToolDemoProps, ToolStoryProps, ToolTipsProps, ToolTrustProps} from '../schemas';
import {theme} from '../theme';
import {Tip} from './Tips';
import {Heading} from './Trust';

const useFrames = () => {
  const {fps} = useVideoConfig();
  return (s: number) => Math.round(s * fps);
};

const Row: React.FC<{at: number; ok: boolean; text: string; size?: number; strike?: boolean}> = ({
  at,
  ok,
  text,
  size = 46,
  strike,
}) => {
  const product = useProduct();
  const p = useEnter(at);
  const icon = Math.round(size * 1.45);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        padding: `${Math.round(size * 0.36)}px 0`,
        opacity: p,
        transform: `translateX(${(1 - p) * -30}px)`,
      }}
    >
      <div
        style={{
          width: icon,
          height: icon,
          borderRadius: icon / 2,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: ok ? theme.primaryTint : theme.clayTint,
          color: ok ? accentOf(product) : theme.clay,
        }}
      >
        {ok ? <CheckIcon size={icon * 0.58} strokeWidth={2.8} /> : <CrossIcon size={icon * 0.55} strokeWidth={2.8} />}
      </div>
      <div
        style={{
          fontSize: size,
          fontWeight: 600,
          lineHeight: 1.2,
          color: ok ? theme.ink : theme.inkMuted,
          textDecoration: strike ? 'line-through' : 'none',
          textDecorationColor: theme.clay,
        }}
      >
        {text}
      </div>
    </div>
  );
};

const Panel: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div
    style={{
      background: theme.surface,
      border: `2px solid ${theme.line}`,
      borderRadius: 28,
      boxShadow: theme.shadowLift,
      padding: '22px 36px',
    }}
  >
    {children}
  </div>
);

/** ToolDemo: three steps, each on a real screenshot, with one caption each. */
export const ToolDemo: React.FC<ToolDemoProps> = (props) => {
  const product = useProduct();
  const f = useFrames();
  const step = f(props.seconds.step);
  return (
    <AbsoluteFill>
      <Background />
      <Series>
        <Series.Sequence durationInFrames={f(props.seconds.hook)}>
          <Scene fadeIn={false}>
            <Hook text={props.hook} />
          </Scene>
        </Series.Sequence>
        {props.steps.map((s, i) => (
          <Series.Sequence key={i} durationInFrames={step}>
            <Scene>
              <Stage>
                <SceneLabel text={`${product.name} · step ${i + 1} of 3`} tone="brand" />
                <ScreenFrame product={product} file={s.screen} zoomFrom={Math.round(step * 0.3)} zoomTo={Math.round(step * 0.6)} />
              </Stage>
              <Caption text={s.caption} at={8} />
            </Scene>
          </Series.Sequence>
        ))}
        <Series.Sequence durationInFrames={f(props.seconds.endCard)}>
          <Scene fadeOut={false}>
            <EndCard />
          </Scene>
        </Series.Sequence>
      </Series>
      <AudioLayer audio={props.audio} />
    </AbsoluteFill>
  );
};

/** ToolStory: the old way, what the product does instead, then one calm closing thought. */
export const ToolStory: React.FC<ToolStoryProps> = (props) => {
  const product = useProduct();
  const f = useFrames();
  const s = props.seconds;
  const problemFrames = f(s.problem);
  const fixFrames = f(s.fix);
  const every = (frames: number, n: number) => Math.floor((frames * 0.55) / n);
  return (
    <AbsoluteFill>
      <Background />
      <Series>
        <Series.Sequence durationInFrames={f(s.hook)}>
          <Scene fadeIn={false}>
            <Hook text={props.hook} />
          </Scene>
        </Series.Sequence>
        <Series.Sequence durationInFrames={problemFrames}>
          <Scene>
            <Stage>
              <Heading text={props.problem.heading} />
              <Panel>
                {props.problem.items.map((t, i) => (
                  <Row
                    key={i}
                    at={8 + i * every(problemFrames, props.problem.items.length)}
                    ok={false}
                    text={t}
                  />
                ))}
              </Panel>
            </Stage>
            <Caption text={props.problem.caption} at={10} />
          </Scene>
        </Series.Sequence>
        <Series.Sequence durationInFrames={fixFrames}>
          <Scene>
            {/* The three rows first. With a screen, the screen takes over for the second half. */}
            <Sequence durationInFrames={props.fix.screen ? Math.round(fixFrames * 0.52) : fixFrames} layout="none">
              <Stage>
                <SceneLabel text={`With ${product.name}`} tone="brand" />
                <Heading text={props.fix.heading} />
                <Panel>
                  {props.fix.items.map((t, i) => (
                    <Row key={i} at={10 + i * every(fixFrames * (props.fix.screen ? 0.5 : 1), 3)} ok text={t} />
                  ))}
                </Panel>
              </Stage>
            </Sequence>
            {props.fix.screen ? (
              <Sequence from={Math.round(fixFrames * 0.52)} layout="none">
                <Stage>
                  <SceneLabel text={product.name} tone="brand" />
                  <ScreenFrame product={product} file={props.fix.screen} zoomFrom={14} zoomTo={44} />
                </Stage>
              </Sequence>
            ) : null}
            <Caption text={props.fix.caption} at={10} />
          </Scene>
        </Series.Sequence>
        <Series.Sequence durationInFrames={f(s.perspective)}>
          <Scene>
            <Hook text={props.perspective.line} />
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

/** ToolTips: three tips as text, then the product in one scene. */
export const ToolTips: React.FC<ToolTipsProps> = (props) => {
  const product = useProduct();
  const f = useFrames();
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
        {props.tips.map((t, i) => (
          <Series.Sequence key={i} durationInFrames={f(s.tip)}>
            <Scene>
              <Tip n={i + 1} total={props.tips.length} title={t.title} body={t.body} />
            </Scene>
          </Series.Sequence>
        ))}
        <Series.Sequence durationInFrames={f(s.outro)}>
          <Scene>
            <Stage>
              <ScreenOrCard product={product} screen={props.outro.screen} />
            </Stage>
            <Caption text={props.outro.caption} at={6} />
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

/** ToolTrust: the product's fixed trust rows, then the product itself. */
export const ToolTrust: React.FC<ToolTrustProps> = (props) => {
  const product = useProduct();
  const f = useFrames();
  const s = props.seconds;
  const trustFrames = f(s.trust);
  const rows = product.trust ?? [];
  const every = Math.floor((trustFrames * 0.5) / Math.max(1, rows.length));
  return (
    <AbsoluteFill>
      <Background />
      <Series>
        <Series.Sequence durationInFrames={f(s.hook)}>
          <Scene fadeIn={false}>
            <Hook text={props.hook} />
          </Scene>
        </Series.Sequence>
        <Series.Sequence durationInFrames={trustFrames}>
          <Scene>
            <Stage>
              <Heading text={props.trust.heading} />
              <Panel>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    fontSize: 30,
                    fontWeight: 600,
                    color: theme.inkMuted,
                    marginBottom: 6,
                    fontFamily: serif,
                  }}
                >
                  <LockIcon size={34} /> {product.name}
                </div>
                {rows.map((r, i) => (
                  <Row key={i} at={10 + i * every} ok={r.ok} text={r.text} />
                ))}
              </Panel>
            </Stage>
            <Caption text={props.trust.caption} at={10} />
          </Scene>
        </Series.Sequence>
        <Series.Sequence durationInFrames={f(s.outro)}>
          <Scene>
            <Stage>
              <ScreenOrCard product={product} screen={props.outro.screen} />
            </Stage>
            <Caption text={props.outro.caption} at={8} />
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
