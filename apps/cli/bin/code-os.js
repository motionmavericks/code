#!/usr/bin/env node
// Minimal, dependency-free CLI stubs for Code‑OS Agent‑OS flows.
// Commands:
//   code-os plan [--seed N] <prompt>
//   code-os solve <graph.json>
//   code-os replay <replay.json>
//   code-os code <prompt>            # stub to mirror /code flow
//   code-os stream-plan <prompt>     # prints words with stable ids

import fs from 'node:fs';
import path from 'node:path';

function usage(code = 0) {
  const msg = `\nUsage:\n  code-os plan [--seed N] <prompt>\n  code-os solve <graph.json>\n  code-os replay <replay.json>\n`;
  process.stdout.write(msg);
  process.exit(code);
}

// Deterministic utilities (mirrors packages/planning/src/index.ts)
function xorshift32(seed) {
  let s = seed >>> 0;
  return () => {
    s ^= (s << 13);
    s ^= (s >>> 17);
    s ^= (s << 5);
    return (s >>> 0) / 0xffffffff;
  };
}

function uuidFromSeed(rand) {
  const hex = () => Math.floor(rand() * 0xffffffff).toString(16).padStart(8, '0');
  return `${hex()}-${hex().slice(0,4)}-${hex().slice(0,4)}-${hex().slice(0,4)}-${hex()}${hex()}`;
}

function plan(prompt, seedOpt) {
  const seed = (seedOpt ?? 1337) >>> 0;
  const rand = xorshift32(seed);
  const now = new Date().toISOString();
  const planId = uuidFromSeed(rand);
  const codeId = uuidFromSeed(rand);
  const evalId = uuidFromSeed(rand);
  const graph = {
    seed,
    createdAt: now,
    nodes: [
      { id: planId, kind: 'plan', label: 'Analyze prompt', params: { prompt } },
      { id: codeId, kind: 'code', label: 'Produce code changes', params: {} },
      { id: evalId, kind: 'evaluate', label: 'Self-check output', params: {} }
    ],
    edges: [
      { from: planId, to: codeId, label: 'route:code' },
      { from: codeId, to: evalId, label: 'route:evaluate' }
    ],
    version: 1
  };
  const frames = [
    { ts: now, event: 'begin' },
    ...graph.nodes.map(n => ({ ts: now, event: 'node', meta: { id: n.id, kind: n.kind, label: n.label } })),
    { ts: now, event: 'end' }
  ];
  return { ok: true, graph, replay: { graph, frames } };
}

function solve(graphPath) {
  const abs = path.resolve(process.cwd(), graphPath);
  const graph = JSON.parse(fs.readFileSync(abs, 'utf8'));
  const ts = new Date().toISOString();
  const frames = [
    { ts, event: 'begin' },
    ...graph.nodes.map(n => ({ ts, event: 'node', meta: { id: n.id, status: 'ok' } })),
    { ts, event: 'end' }
  ];
  return { ok: true, run: { startedAt: ts, finishedAt: ts, frames } };
}

function replay(replayPath) {
  const abs = path.resolve(process.cwd(), replayPath);
  const data = JSON.parse(fs.readFileSync(abs, 'utf8'));
  const ok = Boolean(data && data.graph && Array.isArray(data.frames));
  return { ok, details: ok ? 'valid' : 'invalid' };
}

function main(argv) {
  const args = argv.slice(2);
  if (args.length === 0) usage(1);
  const cmd = args[0];
  if (cmd === 'plan') {
    let seed = undefined; let i = 1;
    if (args[1] === '--seed') { seed = Number(args[2]); i = 3; }
    const prompt = args.slice(i).join(' ').trim();
    if (!prompt) { process.stderr.write('error: missing <prompt>\n'); usage(1); }
    const out = plan(prompt, seed);
    process.stdout.write(JSON.stringify(out, null, 2) + '\n');
    return;
  }
  if (cmd === 'code') {
    const prompt = args.slice(1).join(' ').trim();
    if (!prompt) { process.stderr.write('error: missing <prompt>\n'); usage(1); }
    const out = { ok: true, changes: [], notes: `stub code for: ${prompt}` };
    process.stdout.write(JSON.stringify(out, null, 2) + '\n');
    return;
  }
  if (cmd === 'stream-plan') {
    const prompt = args.slice(1).join(' ').trim();
    if (!prompt) { process.stderr.write('error: missing <prompt>\n'); usage(1); }
    let seq = 0; const seed = 0;
    const parts = prompt.split(/(\s+)/).filter(Boolean);
    for (const p of parts) {
      const id = `cli:${seed}:${++seq}`;
      process.stdout.write(JSON.stringify({ kind: 'answer', id, text: p }) + '\n');
    }
    process.stdout.write(JSON.stringify({ done: true }) + '\n');
    return;
  }
  if (cmd === 'solve') {
    const file = args[1];
    if (!file) { process.stderr.write('error: missing <graph.json>\n'); usage(1); }
    const out = solve(file);
    process.stdout.write(JSON.stringify(out, null, 2) + '\n');
    return;
  }
  if (cmd === 'replay') {
    const file = args[1];
    if (!file) { process.stderr.write('error: missing <replay.json>\n'); usage(1); }
    const out = replay(file);
    process.stdout.write(JSON.stringify(out, null, 2) + '\n');
    return;
  }
  usage(1);
}

main(process.argv);
