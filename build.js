import { build } from 'esbuild';
import fs from 'fs';

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

await build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.devDependencies)],
  target: 'es2022',
  format: 'esm',
  platform: 'node',
  outfile: 'dist/main.js',
  // minify: true,
});
