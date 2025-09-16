#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "usage: agents-compare.sh <worktree_a> <worktree_b>" >&2
  exit 1
fi

A=$1
B=$2

die() { echo "$*" >&2; exit 1; }

[[ -d "$A" ]] || die "not a dir: $A"
[[ -d "$B" ]] || die "not a dir: $B"

echo "Comparing agent worktrees:"
echo "  A: $A"
echo "  B: $B"

echo
echo "=== Summary vs main ==="
for WT in "$A" "$B"; do
  echo "-- $WT"
  git -C "$WT" --no-pager diff --stat main..HEAD || true
done

echo
echo "=== Changed files vs main (name-status) ==="
for WT in "$A" "$B"; do
  echo "-- $WT"
  git -C "$WT" --no-pager diff --name-status main..HEAD || true
done

echo
echo "=== Direct diff between A and B (sample unified) ==="
git -C "$A" --no-pager diff --unified=0 HEAD --no-index "$A" "$B" | head -n 200 || true

