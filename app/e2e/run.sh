#!/usr/bin/env bash
# Runs every numbered flow against the connected emulator; screenshots + a
# summary land in ../../test-artifacts/e2e/<timestamp>/.
set -u
cd "$(dirname "$0")"
OUT="../../test-artifacts/e2e/$(date +%Y%m%d-%H%M%S)"; mkdir -p "$OUT"
export JAVA_HOME="${JAVA_HOME:-/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home}"
export ANDROID_HOME="${ANDROID_HOME:-/opt/homebrew/share/android-commandlinetools}"
export PATH="$HOME/.maestro/bin:$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"
# Maestro's analytics init shells out to `flutter --version` and blocks on it if a
# Homebrew flutter wrapper is present — keep flutter's directory off its PATH.
FL="$(dirname "$(command -v flutter 2>/dev/null || echo /nonexistent/flutter)")"
export PATH="$(echo "$PATH" | tr ':' '\n' | grep -vx "$FL" | paste -sd: -)"
export MAESTRO_CLI_NO_ANALYTICS=1 MAESTRO_DISABLE_UPDATE_CHECK=true
pass=0; fail=0; failed=()
for f in [0-9]*.yaml; do
  echo "=== $f"
  n="$(basename "$f" .yaml)"
  if maestro test --test-output-dir "$OUT/$n" "$f" > "$OUT/$n.log" 2>&1; then
    echo "PASS $f"; pass=$((pass+1))
  else
    # one retry: emulator input occasionally drops a tap; a real regression fails twice
    echo "RETRY $f"
    if maestro test --test-output-dir "$OUT/$n-retry" "$f" > "$OUT/$n-retry.log" 2>&1; then
      echo "PASS $f (on retry)"; pass=$((pass+1))
    else
      echo "FAIL $f"; fail=$((fail+1)); failed+=("$f"); tail -25 "$OUT/$n-retry.log"
    fi
  fi
done
# maestro drops screenshots in the cwd
mv -f *.png "$OUT/" 2>/dev/null || true
echo "---"; echo "passed=$pass failed=$fail ${failed[*]:-}"; echo "artifacts: $OUT"
[ "$fail" -eq 0 ]
