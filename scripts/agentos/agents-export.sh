#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/../.. && pwd)"
OUT_DIR="$ROOT_DIR/fixtures/agent-outputs"
MERGED="$ROOT_DIR/fixtures/patches/agents-merged.patch"
mkdir -p "$OUT_DIR" "$ROOT_DIR/fixtures/patches"
> "$MERGED"

if [[ $# -lt 1 ]]; then
  echo "usage: agents-export.sh <worktree_path> [more_worktrees...]" >&2
  exit 1
fi

for WT in "$@"; do
  if [[ ! -d "$WT/.git" && ! -f "$WT/.git" ]]; then
    echo "skip (not a git worktree): $WT" >&2
    continue
  fi
  NAME=$(echo "$WT" | sed 's#[^A-Za-z0-9._-]#_#g')
  PATCH="$OUT_DIR/${NAME}.patch"
  echo "[export] $WT -> $PATCH"
  git -C "$WT" --no-pager diff --binary main..HEAD > "$PATCH" || true
  {
    echo "# ===== Patch from $WT =====";
    cat "$PATCH";
    echo;
  } >> "$MERGED"
done

echo "Combined patch: $MERGED"

