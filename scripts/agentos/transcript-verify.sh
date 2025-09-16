#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/../.. && pwd)"
FILE=${1:?"usage: transcript-verify.sh <transcript.json>"}

node "$ROOT_DIR/apps/cli/bin/code-os.js" replay "$FILE" | jq -e '.ok == true' >/dev/null 2>&1 || {
  echo "transcript verify failed: $FILE" >&2
  exit 1
}
echo "transcript ok: $FILE"

