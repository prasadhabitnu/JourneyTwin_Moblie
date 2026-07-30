#!/usr/bin/env bash
# Habitnu Nu Flutter POC - one-time bootstrap for macOS/Linux.
#
# `flutter create --overwrite` clobbers pubspec.yaml + lib/main.dart. We back
# them up first and restore after so re-running this script is safe.
set -euo pipefail

echo "== Habitnu Nu Flutter - bootstrap =="

if ! command -v flutter >/dev/null 2>&1; then
  echo "ERROR: flutter is not on PATH."
  echo "Install: https://docs.flutter.dev/get-started/install"
  exit 1
fi

BACKUP=".bootstrap-backup"
rm -rf "$BACKUP"
mkdir -p "$BACKUP/lib"

echo ""
echo "[1/5] Backing up Nu source files..."
for f in pubspec.yaml README.md lib/main.dart analysis_options.yaml; do
  if [ -f "$f" ]; then
    mkdir -p "$BACKUP/$(dirname "$f")"
    cp "$f" "$BACKUP/$f"
    echo "    saved $f"
  fi
done

echo ""
echo "[2/5] Generating platform scaffold..."
flutter create . \
  --project-name habitnu_nu \
  --org com.habitnu.nu \
  --platforms android \
  --template app \
  --overwrite

echo ""
echo "[3/5] Restoring Nu source files..."
for f in pubspec.yaml README.md lib/main.dart analysis_options.yaml; do
  if [ -f "$BACKUP/$f" ]; then
    cp "$BACKUP/$f" "$f"
    echo "    restored $f"
  fi
done
rm -rf "$BACKUP"

echo ""
echo "[4/5] Patching AndroidManifest.xml..."
if [ -f platform-overrides/AndroidManifest.xml ]; then
  cp platform-overrides/AndroidManifest.xml android/app/src/main/AndroidManifest.xml
  echo "    OK"
fi

echo ""
echo "[5/5] flutter pub get..."
flutter pub get

echo ""
echo "== Bootstrap complete =="
echo "Next: flutter devices ; flutter run"
