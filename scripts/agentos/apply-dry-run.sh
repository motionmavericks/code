#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/../.. && pwd)"
PATCH_FILE=${1:-"$ROOT_DIR/fixtures/patches/dry-run.patch"}
WORKTREES_DIR="$ROOT_DIR/.tmp/worktrees"
STAMP=$(date +%Y%m%d-%H%M%S)
WT_PATH="$WORKTREES_DIR/agentos-$STAMP"

if [[ ! -f "$PATCH_FILE" ]]; then
  echo "apply-dry-run: patch not found: $PATCH_FILE" >&2
  exit 1
fi

mkdir -p "$WORKTREES_DIR"
echo "[apply] creating detached worktree: $WT_PATH"
git -C "$ROOT_DIR" worktree add --detach "$WT_PATH" >/dev/null

echo "[apply] applying patch..."
if ! git -C "$WT_PATH" apply --index "$PATCH_FILE"; then
  echo "[apply] failed to apply patch" >&2
  git -C "$ROOT_DIR" worktree remove --force "$WT_PATH" || true
  exit 1
fi

echo "[apply] staged changes summary:" 
git -C "$WT_PATH" --no-pager diff --staged --stat || true

echo "[apply] cleanup: remove worktree"
git -C "$ROOT_DIR" worktree remove --force "$WT_PATH" >/dev/null || true
echo "[apply] done"

