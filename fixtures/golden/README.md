Golden transcript fixtures
==========================

Use scripts/agentos/record.sh to produce deterministic plan outputs and store
them as JSON files in this directory. Then validate structure with
scripts/agentos/replay.sh.

These fixtures are optional and do not affect the Rust build. The single
required build gate remains ./build-fast.sh.

For CI or local checks, you can also run:

  scripts/agentos/transcript-verify.sh fixtures/golden/plan-basic.json

To stream a simulated solve to JSONL with stable ids:

  node apps/cli/bin/code-os.js solve --stream-to fixtures/golden/solve-basic.jsonl \
    fixtures/golden/plan-basic.json

