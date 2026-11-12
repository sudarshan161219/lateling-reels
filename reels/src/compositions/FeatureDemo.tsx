import React from 'react';
import {AbsoluteFill, Series, useVideoConfig} from 'remotion';
import {AudioLayer, Background, EndCard, Hook, Scene, StepCaptions} from '../components/primitives';
import {
  FindOrderScene,
  GmailPanelScene,
  NeedsAttentionScene,
  OrderDetailScene,
  ReplyTemplateScene,
} from '../scenes';
import type {FeatureDemoProps} from '../schemas';

/** One feature, shown in three steps with one caption each. */
export const FeatureDemo: React.FC<FeatureDemoProps> = (props) => {
  const {fps} = useVideoConfig();
  const f = (s: number) => Math.round(s * fps);
  const step = f(props.seconds.step);
  const order = props.orders[0];
  const scene = {
    'needs-attention': <NeedsAttentionScene orders={props.orders} step={step} />,
    'find-order': <FindOrderScene order={order} step={step} />,
    'order-detail': <OrderDetailScene order={order} step={step} />,
    'reply-template': <ReplyTemplateScene order={order} template={props.template} step={step} />,
    'gmail-panel': <GmailPanelScene order={order} template={props.template} step={step} />,
  }[props.feature];
  return (
    <AbsoluteFill>
      <Background />
      <Series>
        <Series.Sequence durationInFrames={f(props.seconds.hook)}>
          <Scene fadeIn={false}>
            <Hook text={props.hook} />
          </Scene>
        </Series.Sequence>
        <Series.Sequence durationInFrames={step * 3}>
          <Scene>
            {scene}
            <StepCaptions captions={props.steps} stepFrames={step} />
          </Scene>
        </Series.Sequence>
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
