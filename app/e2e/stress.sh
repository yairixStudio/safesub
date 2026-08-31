#!/usr/bin/env bash
# Production stress battery on the connected emulator:
#   1. monkey storm  — 5,000 random events, fail on any crash/ANR
#   2. memory soak   — PSS sampled across repeated heavy UI cycles (leak check)
#   3. font scale    — XL accessibility font, screenshot for review
# Artifacts land in ../../test-artifacts/stress/<timestamp>/.
set -u
cd "$(dirname "$0")/.."
export ANDROID_HOME="${ANDROID_HOME:-/opt/homebrew/share/android-commandlinetools}"
ADB="$ANDROID_HOME/platform-tools/adb"
PKG=studio.yairix.safesub
export JAVA_HOME="${JAVA_HOME:-/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home}"
export PATH="$HOME/.maestro/bin:$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"
# Maestro's analytics init blocks on a Homebrew flutter wrapper — keep it off PATH
FL="$(dirname "$(command -v flutter 2>/dev/null || echo /nonexistent/flutter)")"
export PATH="$(echo "$PATH" | tr ':' '\n' | grep -vx "$FL" | paste -sd: -)"
OUT="../test-artifacts/stress/$(date +%Y%m%d-%H%M%S)"; mkdir -p "$OUT"
fail=0

echo "=== 1. monkey storm (5000 events)"
"$ADB" logcat -c
"$ADB" shell monkey -p $PKG --throttle 60 --pct-syskeys 0 --ignore-security-exceptions -v 5000 > "$OUT/monkey.log" 2>&1
"$ADB" logcat -d > "$OUT/monkey-logcat.txt"
if grep -qE "CRASH|ANR in $PKG|FATAL EXCEPTION" "$OUT/monkey.log" "$OUT/monkey-logcat.txt"; then
  echo "MONKEY: CRASH/ANR DETECTED"; fail=1
else
  echo "MONKEY: clean ($(grep -oE 'Events injected: [0-9]+' "$OUT/monkey.log" | tail -1))"
fi

echo "=== 2. memory soak (Maestro-driven, PSS sampled in parallel)"
"$ADB" shell am force-stop $PKG; sleep 1
export MAESTRO_CLI_NO_ANALYTICS=1 MAESTRO_DISABLE_UPDATE_CHECK=true
( cd e2e && maestro test _soak.yaml > "$OLDPWD/$OUT/soak-maestro.log" 2>&1 )&
SOAK=$!
pss(){ "$ADB" shell dumpsys meminfo $PKG 2>/dev/null | awk '/TOTAL PSS:/{gsub(/,/,"",$3); print $3; f=1; exit} END{if(!f) print 0}'; }
echo "sample,pss_kb" > "$OUT/pss.csv"; i=0
while kill -0 $SOAK 2>/dev/null; do
  sleep 10; i=$((i+1)); echo "$i,$(pss)" >> "$OUT/pss.csv"
done
wait $SOAK; SRC=$?
[ $SRC -ne 0 ] && { echo "MEMORY: soak flow failed (see soak-maestro.log)"; fail=1; }
python3 - "$OUT/pss.csv" <<'PYEOF' || fail=1
import sys, csv
rows=[int(r[1]) for r in list(csv.reader(open(sys.argv[1])))[1:] if r[1].isdigit() and int(r[1])>0]
if len(rows)<4:
    print("MEMORY: not enough live samples", rows); sys.exit(1)
base=min(rows[:3]); last=max(rows[-2:])
print(f"MEMORY: base={base}kB end={last}kB samples={len(rows)}")
if last > base*1.5:
    print("MEMORY: SUSPICIOUS GROWTH"); sys.exit(1)
print("MEMORY: stable")
PYEOF

echo "=== 3. font scale 1.3 screenshot"
"$ADB" shell am force-stop $PKG; "$ADB" shell settings put system font_scale 1.3; sleep 1
"$ADB" shell monkey -p $PKG -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1; sleep 8
"$ADB" shell pidof $PKG >/dev/null || { echo "FONT: app failed to launch"; fail=1; }
"$ADB" exec-out screencap -p > "$OUT/font-1.3.png"
"$ADB" shell settings put system font_scale 1.0
sleep 1

echo "artifacts: $OUT"
[ "$fail" -eq 0 ] && echo "STRESS: ALL CLEAN" || echo "STRESS: FAILURES — inspect $OUT"
exit $fail
