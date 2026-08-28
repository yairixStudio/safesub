#!/usr/bin/env bash
# Install the release APK on the connected emulator, launch, and grab a screenshot.
#   ./e2e/smoke.sh [name]   → test-artifacts/smoke/<name>.png
set -eu
cd "$(dirname "$0")/.."
export ANDROID_HOME="${ANDROID_HOME:-/opt/homebrew/share/android-commandlinetools}"
ADB="$ANDROID_HOME/platform-tools/adb"
APK=android/app/build/outputs/apk/release/app-release.apk
PKG=studio.yairix.safesub
NAME="${1:-launch}"
mkdir -p ../test-artifacts/smoke
if [ "${SKIP_INSTALL:-0}" != "1" ]; then "$ADB" install -r "$APK" >/dev/null; fi
"$ADB" shell am force-stop "$PKG"
"$ADB" shell monkey -p "$PKG" -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1
sleep "${WAIT:-4}"
"$ADB" exec-out screencap -p > "../test-artifacts/smoke/$NAME.png"
echo "../test-artifacts/smoke/$NAME.png"
