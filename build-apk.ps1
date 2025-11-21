# Script to build APK using Gradle
$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Building Financial Manager APK" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if Android SDK is setup
$sdkRoot = Join-Path $PSScriptRoot "android-sdk"
if (-not (Test-Path $sdkRoot)) {
    Write-Host "✗ Android SDK not found!" -ForegroundColor Red
    Write-Host "  Please run './setup-android-sdk.ps1' first" -ForegroundColor Yellow
    exit 1
}

# Set environment
$env:ANDROID_HOME = $sdkRoot
$env:ANDROID_SDK_ROOT = $sdkRoot

Write-Host "[1/3] Building Next.js app..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Next.js build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "      ✓ Next.js build complete!" -ForegroundColor Green

Write-Host "[2/3] Syncing with Capacitor..." -ForegroundColor Yellow
npx cap sync
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Capacitor sync failed!" -ForegroundColor Red
    exit 1
}
Write-Host "      ✓ Sync complete!" -ForegroundColor Green

Write-Host "[3/3] Building APK with Gradle..." -ForegroundColor Yellow
Write-Host "      This may take 5-10 minutes on first build..." -ForegroundColor Gray

Set-Location android
.\gradlew assembleRelease --no-daemon
$buildResult = $LASTEXITCODE
Set-Location ..

if ($buildResult -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  ✓ APK BUILD SUCCESSFUL!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    $apkPath = "android\app\build\outputs\apk\release\app-release-unsigned.apk"
    if (Test-Path $apkPath) {
        $apkSize = (Get-Item $apkPath).Length / 1MB
        Write-Host "📦 APK Location:" -ForegroundColor Cyan
        Write-Host "   $apkPath" -ForegroundColor White
        Write-Host ""
        Write-Host "📊 APK Size: $([math]::Round($apkSize, 2)) MB" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "🎉 Your APK is ready to install!" -ForegroundColor Green
        Write-Host ""
        Write-Host "To install on device:" -ForegroundColor Yellow
        Write-Host "   adb install $apkPath" -ForegroundColor White
    }
} else {
    Write-Host ""
    Write-Host "✗ APK build failed!" -ForegroundColor Red
    Write-Host "  Check the error messages above" -ForegroundColor Yellow
    exit 1
}
