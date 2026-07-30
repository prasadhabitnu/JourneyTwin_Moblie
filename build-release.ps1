# Habitnu Nu - one-shot release APK build for Windows.
#
# Assumes:
#   - Flutter toolchain is on PATH
#   - `bootstrap.ps1` has been run once already (so android/ scaffold exists)
#   - Signing keystore is configured per RELEASE.md (optional; will build
#     debug-signed release if not present)
#
# Run:
#     powershell -ExecutionPolicy Bypass -File .\build-release.ps1

$ErrorActionPreference = "Stop"

Write-Host "== Habitnu Nu - release APK build ==" -ForegroundColor Cyan

if (-not (Get-Command flutter -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: flutter is not on PATH." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "android\key.properties")) {
    Write-Host "WARN: android\key.properties not found." -ForegroundColor Yellow
    Write-Host "      The APK will be signed with the debug key."
    Write-Host "      Fine for sideload demos; not for Play Store."
    Write-Host ""
}

$stampLine = (Select-String -Path lib\screens\universe_screen.dart -Pattern "_buildStamp = " -ErrorAction SilentlyContinue).Line
if ($stampLine) { Write-Host "Source build stamp: $stampLine" -ForegroundColor Magenta }

Write-Host "`n[1/5] flutter clean..." -ForegroundColor Yellow
flutter clean

Write-Host "`n[2/5] Removing stale build artifacts..." -ForegroundColor Yellow
Remove-Item -Recurse -Force build -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .dart_tool -ErrorAction SilentlyContinue

Write-Host "`n[3/5] flutter pub get..." -ForegroundColor Yellow
flutter pub get

Write-Host "`n[4/5] flutter build apk --release..." -ForegroundColor Yellow
flutter build apk --release

$src = "build\app\outputs\flutter-apk\app-release.apk"
if (-not (Test-Path $src)) {
    Write-Host "ERROR: build output not found at $src" -ForegroundColor Red
    Write-Host "       Scroll up for the compile error." -ForegroundColor Red
    exit 1
}

# Find a Desktop location that ACTUALLY exists. On Windows 11 with OneDrive,
# %USERPROFILE%\Desktop is often redirected to OneDrive\Desktop and the
# original path doesn't exist. Try a series of candidates.
Write-Host "`n[5/5] Locating Desktop..." -ForegroundColor Yellow
$candidates = @(
    [Environment]::GetFolderPath("Desktop"),
    "$env:OneDrive\Desktop",
    "$env:USERPROFILE\OneDrive\Desktop",
    "$env:USERPROFILE\Desktop"
) | Where-Object { $_ -and $_.Trim().Length -gt 0 } | Select-Object -Unique

$desktop = $null
foreach ($c in $candidates) {
    if (Test-Path $c) { $desktop = $c; break }
}
if (-not $desktop) {
    # Last resort: use the project folder itself
    $desktop = (Get-Location).Path
    Write-Host "    WARN: no Desktop folder found. Publishing to $desktop instead." -ForegroundColor Yellow
} else {
    Write-Host "    Using Desktop: $desktop"
}

# Purge older habitnu-nu-*.apk from the Desktop we found.
$oldApks = Get-ChildItem "$desktop\habitnu-nu-*.apk" -ErrorAction SilentlyContinue
if ($oldApks) {
    Write-Host "    Removing $($oldApks.Count) older APK(s):"
    foreach ($a in $oldApks) { Write-Host "      del $($a.Name)" }
    $oldApks | Remove-Item -Force
}

$stamp = Get-Date -Format 'yyyy-MM-dd-HHmm'
$dstStamped = Join-Path $desktop "habitnu-nu-$stamp.apk"
$dstLatest  = Join-Path $desktop "habitnu-nu-LATEST.apk"
Copy-Item $src $dstStamped -Force
Copy-Item $src $dstLatest -Force

$size = [math]::Round((Get-Item $dstLatest).Length / 1MB, 1)
$buildTime = (Get-Item $src).LastWriteTime

Write-Host "`n== Build complete ==" -ForegroundColor Green
Write-Host "Latest APK  : $dstLatest    ($size MB, built $buildTime)"
Write-Host "Timestamped : $dstStamped"
Write-Host ""
Write-Host "TRANSFER TO PHONE:" -ForegroundColor Cyan
Write-Host "  1. Copy  habitnu-nu-LATEST.apk  to your phone (email/Drive/USB)"
Write-Host "  2. On the phone: uninstall the existing Nu app FIRST"
Write-Host "     (long-press icon -> App info -> Uninstall)"
Write-Host "  3. Then tap the APK to install"
Write-Host ""
Write-Host "ON APP OPEN:" -ForegroundColor Cyan
Write-Host "  Universe screen top-right should show the build tag from the source line above."
