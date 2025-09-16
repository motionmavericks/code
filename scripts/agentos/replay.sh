#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/../.. && pwd)"
FILE=${1:-"$ROOT_DIR/fixtures/golden/plan-basic.json"}

if [[ ! -f "$FILE" ]]; then
  echo "replay: no such file: $FILE" >&2
  exit 1
fi

node "$ROOT_DIR/apps/cli/bin/code-os.js" replay "$FILE"

