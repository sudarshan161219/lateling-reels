import React from 'react';
import {Composition} from 'remotion';
import type {AnyZodObject} from 'remotion';
import type {z} from 'zod';
import beforeAfterExample from '../props/examples/before-after.json';
import featureDemoExample from '../props/examples/feature-demo.json';
import tipsExample from '../props/examples/tips.json';
import trustExample from '../props/examples/trust.json';
import {BeforeAfter} from './compositions/BeforeAfter';
import {FeatureDemo} from './compositions/FeatureDemo';
import {Tips} from './compositions/Tips';
import {Trust} from './compositions/Trust';
import {beforeAfterSchema, DURATION_LIMITS, featureDemoSchema, tipsSchema, totalSeconds, trustSchema} from './schemas';
import {VIDEO} from './theme';

type Loose = Record<string, unknown>;

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
    component={component as unknown as React.FC<Loose>}
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
  </>
);
