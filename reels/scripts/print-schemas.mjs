#!/usr/bin/env node
// Prints the JSON Schema of every composition's props, generated from src/schemas.ts.
// Use it to refresh the prompts after changing a schema:
//   npm run schemas             Lateling compositions, for prompts/script-writer.md
//   npm run schemas -- --tool   Tool compositions, for prompts/tool-script-writer.md
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

const names = process.argv.includes('--tool') ? s.TOOL_COMPOSITIONS : s.LATELING_COMPOSITIONS;
for (const name of names) {
  const schema = s.SCHEMAS[name];
  const json = s.z.toJSONSchema(schema, {io: 'input'});
  delete json.$schema;
  console.log(`### ${name}\n\n\`\`\`json\n${JSON.stringify(json)}\n\`\`\`\n`);
}
