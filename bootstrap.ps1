# Habitnu Nu Flutter POC - one-time bootstrap for Windows.
#
# Generates the Android platform scaffold via `flutter create`, then patches
# AndroidManifest.xml with our mic permissions.
#
# IMPORTANT: `flutter create --overwrite` will clobber `pubspec.yaml` and
# `lib/main.dart` if they exist. We back them up first and restore after,
# so re-running this script never destroys hand-written Nu code.
#
# Run from this directory:
#     powershell -ExecutionPolicy Bypass -File .\bootstrap.ps1

$ErrorActionPreference = "Stop"

Write-Host "== Habitnu Nu Flutter - bootstrap ==" -ForegroundColor Cyan

# 1. Sanity check
if (-not (Get-Command flutter -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Flutter is not on PATH." -ForegroundColor Red
    Write-Host "Install Flutter first: https://docs.flutter.dev/get-started/install/windows"
    exit 1
}

# 2. Back up Nu files that `flutter create --overwrite` would clobber.
Write-Host "`n[1/5] Backing up Nu source files..." -ForegroundColor Yellow
$backupDir = ".bootstrap-backup"
if (Test-Path $backupDir) { Remove-Item $backupDir -Recurse -Force }
New-Item -ItemType Directory -Path $backupDir | Out-Null

$filesToPreserve = @(
    "pubspec.yaml",
    "README.md",
    "lib\main.dart",
    "analysis_options.yaml"
)

foreach ($f in $filesToPreserve) {
    if (Test-Path $f) {
        $dst = Join-Path $backupDir $f
        $dstDir = Split-Path $dst
        if (-not (Test-Path $dstDir)) { New-Item -ItemType Directory -Path $dstDir -Force | Out-Null }
        Copy-Item $f $dst -Force
        Write-Host "    saved $f"
    }
}

# 3. Generate android/ scaffolding
Write-Host "`n[2/5] Generating platform scaffold..." -ForegroundColor Yellow
flutter create . `
    --project-name habitnu_nu `
    --org com.habitnu.nu `
    --platforms android `
    --template app `
    --overwrite

# 4. Restore Nu files
Write-Host "`n[3/5] Restoring Nu source files..." -ForegroundColor Yellow
foreach ($f in $filesToPreserve) {
    $src = Join-Path $backupDir $f
    if (Test-Path $src) {
        $dstDir = Split-Path $f
        if ($dstDir -and -not (Test-Path $dstDir)) { New-Item -ItemType Directory -Path $dstDir -Force | Out-Null }
        Copy-Item $src $f -Force
        Write-Host "    restored $f"
    }
}
Remove-Item $backupDir -Recurse -Force

# 5. Patch AndroidManifest.xml
Write-Host "`n[4/5] Patching AndroidManifest.xml..." -ForegroundColor Yellow
$manifestSrc = "platform-overrides\AndroidManifest.xml"
$manifestDst = "android\app\src\main\AndroidManifest.xml"
if (Test-Path $manifestSrc) {
    Copy-Item $manifestSrc $manifestDst -Force
    Write-Host "    OK: $manifestDst"
} else {
    Write-Host "    WARN: $manifestSrc not found; skipping manifest patch"
}

# 6. Pull deps
Write-Host "`n[5/5] flutter pub get..." -ForegroundColor Yellow
flutter pub get

Write-Host "`n== Bootstrap complete ==" -ForegroundColor Green
Write-Host "Next steps:"
Write-Host "  1. Plug in your Android device (USB debugging on) OR start an emulator"
Write-Host "  2. Run:  flutter devices     # confirm your device is listed"
Write-Host "  3. Run:  flutter run"
Write-Host ""
Write-Host "On first launch, Android will prompt for microphone permission - accept it."
