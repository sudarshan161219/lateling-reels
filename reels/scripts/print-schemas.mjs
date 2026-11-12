#!/usr/bin/env node
// Prints the JSON Schema of every composition's props, generated from src/schemas.ts.
// Use it to refresh prompts/script-writer.md after changing a schema:
//   npm run schemas
import {buildSync} from 'esbuild';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outfile = path.join(mkdtempSync(path.join(tmpdir(), 'lateling-schemas-')), 'schemas.mjs');
buildSync({
  stdin: {
    contents: `export * from './src/schemas.ts'; export {z} from 'zod';`,
    resolveDir: root,
    loader: 'ts',
  },
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile,
});
const s = await import(pathToFileURL(outfile).href);

const schemas = {
  BeforeAfter: s.beforeAfterSchema,
  FeatureDemo: s.featureDemoSchema,
  Tips: s.tipsSchema,
  Trust: s.trustSchema,
};
for (const [name, schema] of Object.entries(schemas)) {
  const json = s.z.toJSONSchema(schema, {io: 'input'});
  delete json.$schema;
  console.log(`### ${name}\n\n\`\`\`json\n${JSON.stringify(json)}\n\`\`\`\n`);
}
