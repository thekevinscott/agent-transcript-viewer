#!/usr/bin/env node
// Builds the internal frontend workspace: type-checks and emits dist/ via
// tsc, then assembles dist/viewer.html — a single self-contained HTML file
// with the compiled entry JS inlined and no external asset requests. That
// file is what packages/python's build copies in as package data.

import { spawnSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const nodePkg = resolve(dirname(fileURLToPath(import.meta.url)), '..');

run('npx', ['--no-install', 'tsc', '-b', '--clean', 'tsconfig.json'], { cwd: nodePkg });
run('npx', ['--no-install', 'tsc', '-p', 'tsconfig.json'], { cwd: nodePkg });

const { buildViewerHtml } = await import(resolve(nodePkg, 'dist/build-viewer-html.js'));
const entryJs = await readFile(resolve(nodePkg, 'dist/index.js'), 'utf8');
await writeFile(resolve(nodePkg, 'dist/viewer.html'), buildViewerHtml(entryJs));

function run(cmd, args, opts) {
  // shell: true so Windows resolves `.cmd` shims (npx.cmd) without each call
  // hard-coding extensions. Args are static — no injection.
  const res = spawnSync(cmd, args, { stdio: 'inherit', shell: true, ...opts });
  if (res.status !== 0) {
    console.error(`failed: ${cmd} ${args.join(' ')} (exit ${res.status})`);
    process.exit(res.status ?? 1);
  }
}
