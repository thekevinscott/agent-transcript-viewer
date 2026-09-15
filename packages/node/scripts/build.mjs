#!/usr/bin/env node
// Builds the internal frontend workspace: type-checks and emits dist/ via tsc.
// This package is never published — the built viewer artifact is eventually
// bundled into the Python wheel at packages/python build time.

import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const nodePkg = resolve(dirname(fileURLToPath(import.meta.url)), '..');

run('npx', ['--no-install', 'tsc', '-b', '--clean', 'tsconfig.json'], { cwd: nodePkg });
run('npx', ['--no-install', 'tsc', '-p', 'tsconfig.json'], { cwd: nodePkg });

function run(cmd, args, opts) {
  // shell: true so Windows resolves `.cmd` shims (npx.cmd) without each call
  // hard-coding extensions. Args are static — no injection.
  const res = spawnSync(cmd, args, { stdio: 'inherit', shell: true, ...opts });
  if (res.status !== 0) {
    console.error(`failed: ${cmd} ${args.join(' ')} (exit ${res.status})`);
    process.exit(res.status ?? 1);
  }
}
