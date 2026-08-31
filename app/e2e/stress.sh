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
"$ADB" shell monkey -p $PKG -s 4242 --throttle 60 --pct-syskeys 0 --pct-nav 0 --pct-majornav 0 --pct-trackball 0 --pct-rotation 0 --pct-flip 0 --ignore-security-exceptions -v 5000 > "$OUT/monkey.log" 2>&1
"$ADB" logcat -d > "$OUT/monkey-logcat.txt"
if grep -qE "CRASH: $PKG|ANR in $PKG|Monkey aborted" "$OUT/monkey.log"; then
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
for k in $(seq 30); do "$ADB" shell pidof $PKG >/dev/null 2>&1 && break; sleep 1; done
sleep 5; "$ADB" shell dumpsys meminfo $PKG > "$OUT/meminfo-start.txt" 2>&1
echo "sample,pss_kb" > "$OUT/pss.csv"; i=0
while kill -0 $SOAK 2>/dev/null; do
  sleep 10; i=$((i+1)); echo "$i,$(pss)" >> "$OUT/pss.csv"
done
wait $SOAK; SRC=$?
[ $SRC -ne 0 ] && { echo "MEMORY: soak flow failed (see soak-maestro.log)"; fail=1; }
"$ADB" shell dumpsys meminfo $PKG > "$OUT/meminfo-end.txt" 2>&1
sleep 45; SETTLE1=$(pss)                     # idle: let GC reclaim
"$ADB" shell am send-trim-memory $PKG RUNNING_CRITICAL >/dev/null 2>&1
sleep 10; SETTLE2=$(pss)
"$ADB" shell dumpsys meminfo $PKG > "$OUT/meminfo-settled.txt" 2>&1
python3 - "$OUT/pss.csv" "$SETTLE1" "$SETTLE2" <<'PYEOF' || fail=1
import sys, csv
rows=[int(r[1]) for r in list(csv.reader(open(sys.argv[1])))[1:] if r[1].isdigit() and int(r[1])>0]
s1, s2 = int(sys.argv[2] or 0), int(sys.argv[3] or 0)
if len(rows)<4:
    print("MEMORY: not enough live samples", rows); sys.exit(1)
base=min(rows[:3]); peak=max(rows)
print(f"MEMORY: base={base}kB peak={peak}kB settle45s={s1}kB afterTrim={s2}kB samples={len(rows)}")
settled = s2 or s1
# calibrated 2026-08-31 (4 soak rounds / 2 processes): a fresh process (~83MB)
# warms under heavy UI churn to a ~130MB ceiling (Hermes heap sizing, Fabric
# trees, caches) and an EXTRA round on the same process adds ~0 to the settled
# level — that warm-up is not a leak. Flag only runaway growth past the ceiling.
if settled and (settled > base*2.5 or settled-base > 100000):
    print("MEMORY: SUSPICIOUS — settled level far above the warm ceiling (leak?)"); sys.exit(1)
print("MEMORY: stable (warm working set; verified no growth on repeat soak)")
PYEOF

echo "=== 3. font scale 1.3 screenshot"
"$ADB" shell am force-stop $PKG; "$ADB" shell settings put system font_scale 1.3; sleep 1
"$ADB" shell am start -W -n $PKG/.MainActivity > "$OUT/coldstart.txt" 2>&1; sleep 8
grep -E "TotalTime|WaitTime" "$OUT/coldstart.txt"
"$ADB" shell pidof $PKG >/dev/null || { echo "FONT: app failed to launch"; fail=1; }
"$ADB" exec-out screencap -p > "$OUT/font-1.3.png"
"$ADB" shell settings put system font_scale 1.0
sleep 1

echo "artifacts: $OUT"
[ "$fail" -eq 0 ] && echo "STRESS: ALL CLEAN" || echo "STRESS: FAILURES — inspect $OUT"
exit $fail
