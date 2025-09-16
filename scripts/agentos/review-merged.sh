#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/../.. && pwd)"
PATCH_FILE=${1:-"$ROOT_DIR/fixtures/patches/agents-merged.patch"}

if [[ ! -f "$PATCH_FILE" ]]; then
  echo "review-merged: not found: $PATCH_FILE" >&2
  exit 1
fi

adds=$(grep -c "^\*\*\* Add File: " "$PATCH_FILE" || true)
updates=$(grep -c "^\*\*\* Update File: " "$PATCH_FILE" || true)
deletes=$(grep -c "^\*\*\* Delete File: " "$PATCH_FILE" || true)

echo "Files added  : $adds"
echo "Files updated: $updates"
echo "Files deleted: $deletes"
echo
echo "Top 20 patch headers:"
grep -E "^\*\*\* (Add|Update|Delete) File: " "$PATCH_FILE" | head -n 20 | sed 's/^/** /'

