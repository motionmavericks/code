#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/../.. && pwd)"
OUT_DIR="$ROOT_DIR/fixtures/golden"
mkdir -p "$OUT_DIR"

PROMPT=${1:-"basic plan"}
SEED=${SEED:-42}

echo "[record] prompt='$PROMPT' seed=$SEED"
node "$ROOT_DIR/apps/cli/bin/code-os.js" plan --seed "$SEED" "$PROMPT" > "$OUT_DIR/plan-basic.json"
echo "wrote $OUT_DIR/plan-basic.json"

