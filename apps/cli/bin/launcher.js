#!/usr/bin/env node
// code-os launcher: runs the Rust TUI binary (code) from this repo.
// Falls back with a helpful message if the binary is missing.

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __file = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.join(path.dirname(__file), '..', '..', '..'));
const devFast = path.join(repoRoot, 'codex-rs', 'target', 'dev-fast', 'code');
const release = path.join(repoRoot, 'codex-rs', 'target', 'release', 'code');

const candidate = fs.existsSync(devFast) ? devFast : (fs.existsSync(release) ? release : null);
if (!candidate) {
  console.error('\ncode-os: could not find the Rust TUI binary.');
  console.error('Please build it first:  ./build-fast.sh');
  process.exit(1);
}

const child = spawn(candidate, process.argv.slice(2), { stdio: 'inherit' });
child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
