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
OUT="../test-artifacts/stress/$(date +%Y%m%d-%H%M%S)"; mkdir -p "$OUT"
fail=0

echo "=== 1. monkey storm (5000 events)"
"$ADB" logcat -c
"$ADB" shell monkey -p $PKG --throttle 60 --pct-syskeys 0 --ignore-security-exceptions -v 5000 > "$OUT/monkey.log" 2>&1
"$ADB" logcat -d > "$OUT/monkey-logcat.txt"
if grep -qE "CRASH|ANR in $PKG|FATAL EXCEPTION" "$OUT/monkey.log" "$OUT/monkey-logcat.txt"; then
  echo "MONKEY: CRASH/ANR DETECTED"; fail=1
else
  echo "MONKEY: clean ($(grep -c 'Sending' "$OUT/monkey.log" 2>/dev/null || echo '?') events)"
fi

echo "=== 2. memory soak (10 heavy UI cycles)"
"$ADB" shell am force-stop $PKG; sleep 1
"$ADB" shell monkey -p $PKG -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1; sleep 6
pss(){ "$ADB" shell dumpsys meminfo $PKG 2>/dev/null | awk '/TOTAL PSS:/{print $3; found=1} END{if(!found) print 0}'; }
echo "cycle,pss_kb" > "$OUT/pss.csv"
BASE=$(pss); echo "0,$BASE" >> "$OUT/pss.csv"
for i in $(seq 1 10); do
  # a heavy cycle: pane swipes, page opens, scrolls
  "$ADB" shell input swipe 800 1200 200 1200 120; sleep 0.6
  "$ADB" shell input swipe 200 1200 800 1200 120; sleep 0.6
  "$ADB" shell input swipe 800 1200 200 1200 120; sleep 0.6
  "$ADB" shell input tap 80 178;  sleep 1.0     # settings
  "$ADB" shell input swipe 540 1800 540 600 200; sleep 0.5
  "$ADB" shell input keyevent BACK; sleep 0.7
  "$ADB" shell input tap 176 178; sleep 1.0     # profile
  "$ADB" shell input keyevent BACK; sleep 0.7
  P=$(pss); echo "$i,$P" >> "$OUT/pss.csv"
done
LAST=$(tail -1 "$OUT/pss.csv" | cut -d, -f2)
echo "MEMORY: base=${BASE}kB last=${LAST}kB"
# leak heuristic: >40% growth over baseline after GC settle
python3 - "$BASE" "$LAST" <<'PY' || fail=1
import sys
base, last = int(sys.argv[1] or 0), int(sys.argv[2] or 0)
if base and last > base * 1.4:
    print(f"MEMORY: SUSPICIOUS GROWTH {base} -> {last} kB"); sys.exit(1)
print("MEMORY: stable")
PY

echo "=== 3. font scale 1.3 screenshot"
"$ADB" shell settings put system font_scale 1.3
sleep 2; "$ADB" exec-out screencap -p > "$OUT/font-1.3.png"
"$ADB" shell settings put system font_scale 1.0
sleep 1

echo "artifacts: $OUT"
[ "$fail" -eq 0 ] && echo "STRESS: ALL CLEAN" || echo "STRESS: FAILURES — inspect $OUT"
exit $fail
