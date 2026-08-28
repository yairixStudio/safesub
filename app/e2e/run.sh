#!/usr/bin/env bash
# Runs every numbered flow against the connected emulator; screenshots + a
# summary land in ../../test-artifacts/e2e/<timestamp>/.
set -u
cd "$(dirname "$0")"
OUT="../../test-artifacts/e2e/$(date +%Y%m%d-%H%M%S)"; mkdir -p "$OUT"
export PATH="$HOME/.maestro/bin:$PATH"
pass=0; fail=0; failed=()
for f in [0-9]*.yaml; do
  echo "=== $f"
  if maestro test --test-output-dir "$OUT/$(basename "$f" .yaml)" "$f" > "$OUT/$(basename "$f" .yaml).log" 2>&1; then
    echo "PASS $f"; pass=$((pass+1))
  else
    echo "FAIL $f"; fail=$((fail+1)); failed+=("$f"); tail -25 "$OUT/$(basename "$f" .yaml).log"
  fi
done
# maestro drops screenshots in the cwd
mv -f *.png "$OUT/" 2>/dev/null || true
echo "---"; echo "passed=$pass failed=$fail ${failed[*]:-}"; echo "artifacts: $OUT"
[ "$fail" -eq 0 ]
