import React from 'react';
import {Composition, Still} from 'remotion';
import type {AnyZodObject} from 'remotion';
import type {z} from 'zod';
import beforeAfterExample from '../props/examples/before-after.json';
import featureDemoExample from '../props/examples/feature-demo.json';
import tipsExample from '../props/examples/tips.json';
import trustExample from '../props/examples/trust.json';
import toolDemoExample from '../props/examples/tool-demo.json';
import toolStoryExample from '../props/examples/tool-story.json';
import toolTipsExample from '../props/examples/tool-tips.json';
import toolTrustExample from '../props/examples/tool-trust.json';
import {ProductProvider} from './components/primitives';
import {BeforeAfter} from './compositions/BeforeAfter';
import {AVATAR, BANNER, ChannelAvatar, ChannelBanner} from './compositions/Channel';
import {FeatureDemo} from './compositions/FeatureDemo';
import {Tips} from './compositions/Tips';
import {ToolDemo, ToolStory, ToolTips, ToolTrust} from './compositions/Tool';
import {Trust} from './compositions/Trust';
import {getProduct} from './products';
import {
  beforeAfterSchema,
  DURATION_LIMITS,
  featureDemoSchema,
  tipsSchema,
  toolDemoSchema,
  toolStorySchema,
  toolTipsSchema,
  toolTrustSchema,
  totalSeconds,
  trustSchema,
} from './schemas';
import {VIDEO} from './theme';

type Loose = Record<string, unknown>;

/**
 * Checks that need the product file: a script may only use screens the product has,
 * and ToolTrust needs the product's "trust" rows. Returns the problems found.
 */
const productProblems = (id: string, props: Loose): string[] => {
  if (!('product' in props)) return [];
  const product = getProduct(props.product as string);
  const files = new Set(product.screens.map((s) => s.file));
  const used: string[] = [];
  const walk = (v: unknown, key = '') => {
    if (key === 'screen' && typeof v === 'string') used.push(v);
    else if (Array.isArray(v)) v.forEach((x) => walk(x));
    else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => walk(x, k));
  };
  walk(props);
  const problems = used
    .filter((f) => !files.has(f))
    .map((f) => `screen "${f}" is not one of ${product.id}'s screens (${[...files].join(', ') || 'it has none'})`);
  if (id === 'ToolTrust' && !(product.trust?.length)) problems.push(`${product.id} has no "trust" rows in its product file`);
  return problems;
};

// Each composition is wrapped so its parts (end card, logo, screens) know the product.
const wrapped = new Map<React.FC<Loose>, React.FC<Loose>>();
const withProduct = (C: React.FC<Loose>): React.FC<Loose> => {
  if (!wrapped.has(C)) {
    const W: React.FC<Loose> = (props) => (
      <ProductProvider id={props.product as string | undefined}>
        <C {...props} />
      </ProductProvider>
    );
    wrapped.set(C, W);
  }
  return wrapped.get(C)!;
};

/**
 * Registers one composition. Before rendering, the input props are checked against the schema
 * (a bad props file fails with a readable message), defaults are applied, and the video length
 * is set from the scene lengths in `seconds`.
 */
const reel = <S extends z.ZodType>(
  id: keyof typeof DURATION_LIMITS,
  component: React.FC<z.infer<S>>,
  schema: S,
  example: unknown,
  seconds: (p: z.infer<S>) => number,
) => (
  <Composition
    id={id}
    component={withProduct(component as unknown as React.FC<Loose>)}
    schema={schema as unknown as AnyZodObject}
    defaultProps={example as Loose}
    width={VIDEO.width}
    height={VIDEO.height}
    fps={VIDEO.fps}
    durationInFrames={300}
    calculateMetadata={({props}: {props: Loose}) => {
      const result = schema.safeParse(props);
      if (!result.success) {
        const issues = result.error.issues.map((i) => `  ${i.path.join('.') || '(root)'}: ${i.message}`).join('\n');
        throw new Error(`Invalid props for ${id}:\n${issues}`);
      }
      const problems = productProblems(id, result.data as Loose);
      if (problems.length) throw new Error(`Invalid props for ${id}:\n${problems.map((p) => `  ${p}`).join('\n')}`);
      const total = seconds(result.data);
      const [min, max] = DURATION_LIMITS[id];
      if (total < min - 0.01 || total > max + 0.01) {
        throw new Error(`${id} must be ${min} to ${max} seconds long, but "seconds" adds up to ${total.toFixed(1)}.`);
      }
      return {durationInFrames: Math.round(total * VIDEO.fps), props: result.data as Loose};
    }}
  />
);

export const Root: React.FC = () => (
  <>
    {reel('BeforeAfter', BeforeAfter, beforeAfterSchema, beforeAfterExample, totalSeconds.BeforeAfter)}
    {reel('FeatureDemo', FeatureDemo, featureDemoSchema, featureDemoExample, totalSeconds.FeatureDemo)}
    {reel('Tips', Tips, tipsSchema, tipsExample, totalSeconds.Tips)}
    {reel('Trust', Trust, trustSchema, trustExample, totalSeconds.Trust)}
    {reel('ToolDemo', ToolDemo, toolDemoSchema, toolDemoExample, totalSeconds.ToolDemo)}
    {reel('ToolStory', ToolStory, toolStorySchema, toolStoryExample, totalSeconds.ToolStory)}
    {reel('ToolTips', ToolTips, toolTipsSchema, toolTipsExample, totalSeconds.ToolTips)}
    {reel('ToolTrust', ToolTrust, toolTrustSchema, toolTrustExample, totalSeconds.ToolTrust)}
    <Still id="ChannelBanner" component={ChannelBanner} width={BANNER.width} height={BANNER.height} />
    <Still id="ChannelAvatar" component={ChannelAvatar} width={AVATAR.width} height={AVATAR.height} />
  </>
);
