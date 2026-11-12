import React from 'react';
import {AbsoluteFill, Series, useVideoConfig} from 'remotion';
import {AudioLayer, Background, Caption, EndCard, Hook, Scene, StepCaptions} from '../components/primitives';
import {FindOrderScene, PainScene, ReplyTemplateScene} from '../scenes';
import type {BeforeAfterProps} from '../schemas';

/** Hook, the six-tab manual search, then Lateling finds the order and fills the reply. */
export const BeforeAfter: React.FC<BeforeAfterProps> = (props) => {
  const {fps} = useVideoConfig();
  const f = (s: number) => Math.round(s * fps);
  const s = props.seconds;
  const findStep = Math.floor(f(s.find) / 3);
  const replyStep = Math.floor(f(s.reply) / 3);
  return (
    <AbsoluteFill>
      <Background />
      <Series>
        <Series.Sequence durationInFrames={f(s.hook)}>
          <Scene fadeIn={false}>
            <Hook text={props.hook} />
          </Scene>
        </Series.Sequence>
        <Series.Sequence durationInFrames={f(s.pain)}>
          <Scene>
            <PainScene email={props.customerEmail} tabs={props.painTabs} frames={f(s.pain)} />
            <Caption text={props.painCaption} at={8} />
          </Scene>
        </Series.Sequence>
        <Series.Sequence durationInFrames={f(s.find)}>
          <Scene>
            <FindOrderScene order={props.order} step={findStep} label="With Lateling" />
            <Caption text={props.findCaption} at={6} />
          </Scene>
        </Series.Sequence>
        <Series.Sequence durationInFrames={f(s.reply)}>
          <Scene>
            <ReplyTemplateScene order={props.order} template={props.template} step={replyStep} label="With Lateling" />
            <StepCaptions captions={[props.replyCaption]} stepFrames={f(s.reply)} />
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
