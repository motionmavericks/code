#!/usr/bin/env bash
set -euo pipefail

# Orchestrate: plan -> solve -> code with transcripts
# usage: orchestrate.sh "<prompt>" [seed]

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/../.. && pwd)"
PROMPT=${1:?"usage: orchestrate.sh <prompt> [seed]"}
SEED=${2:-42}
OUT_DIR="$ROOT_DIR/fixtures/runs/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$OUT_DIR"

PLAN_JSON="$OUT_DIR/plan.json"
SOLVE_JSON="$OUT_DIR/solve.json"
STREAM_JSONL="$OUT_DIR/solve.jsonl"
CODE_JSON="$OUT_DIR/code.json"

echo "[orchestrate] plan -> $PLAN_JSON"
node "$ROOT_DIR/apps/cli/bin/code-os.js" plan --seed "$SEED" --transcript "$PLAN_JSON" "$PROMPT"

echo "[orchestrate] solve -> $SOLVE_JSON (stream to $STREAM_JSONL)"
node "$ROOT_DIR/apps/cli/bin/code-os.js" solve --provider local --stream-to "$STREAM_JSONL" --transcript "$SOLVE_JSON" "$PLAN_JSON"

echo "[orchestrate] code -> $CODE_JSON"
node "$ROOT_DIR/apps/cli/bin/code-os.js" code --transcript "$CODE_JSON" "$PROMPT"

echo "[orchestrate] done\n  plan:  $PLAN_JSON\n  solve: $SOLVE_JSON\n  stream:$STREAM_JSONL\n  code:  $CODE_JSON"

