# Script tự động setup Android environment variables
# Chạy sau khi cài xong Android Studio

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Android Environment Setup" -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Find Android SDK
$defaultSdkPath = "$env:LOCALAPPDATA\Android\Sdk"
$sdkPath = $defaultSdkPath

if (Test-Path $defaultSdkPath) {
    Write-Host "✓ Found Android SDK at: $sdkPath" -ForegroundColor Green
}
else {
    Write-Host "✗ Android SDK not found at default location!" -ForegroundColor Red
    Write-Host "  Please install Android Studio first" -ForegroundColor Yellow
    Write-Host "  Download: https://developer.android.com/studio" -ForegroundColor Yellow
    exit 1
}

# Find Java (from Android Studio)
$javaPath = "C:\Program Files\Android\Android Studio\jbr"
if (-not (Test-Path $javaPath)) {
    # Try alternative path
    $javaPath = "C:\Program Files\Android\Android Studio\jre"
    if (-not (Test-Path $javaPath)) {
        Write-Host "! Java not found, will use system Java" -ForegroundColor Yellow
        $javaPath = $null
    }
}

Write-Host ""
Write-Host "Setting up environment variables..." -ForegroundColor Yellow

# Set ANDROID_HOME
[Environment]::SetEnvironmentVariable("ANDROID_HOME", $sdkPath, "User")
Write-Host "✓ ANDROID_HOME = $sdkPath" -ForegroundColor Green

# Set ANDROID_SDK_ROOT  
[Environment]::SetEnvironmentVariable("ANDROID_SDK_ROOT", $sdkPath, "User")
Write-Host "✓ ANDROID_SDK_ROOT = $sdkPath" -ForegroundColor Green

# Set JAVA_HOME if found
if ($javaPath) {
    [Environment]::SetEnvironmentVariable("JAVA_HOME", $javaPath, "User")
    Write-Host "✓ JAVA_HOME = $javaPath" -ForegroundColor Green
}

# Add to PATH
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
$pathsToAdd = @(
    "$sdkPath\platform-tools",
    "$sdkPath\tools",
    "$sdkPath\tools\bin"
)

$pathUpdated = $false
foreach ($pathToAdd in $pathsToAdd) {
    if ($userPath -notlike "*$pathToAdd*") {
        $userPath += ";$pathToAdd"
        $pathUpdated = $true
    }
}

if ($pathUpdated) {
    [Environment]::SetEnvironmentVariable("Path", $userPath, "User")
    Write-Host "✓ Updated PATH with Android SDK tools" -ForegroundColor Green
}
else {
    Write-Host "✓ PATH already contains Android SDK tools" -ForegroundColor Green
}

# Create local.properties for Android project
Write-Host ""
Write-Host "Creating android/local.properties..." -ForegroundColor Yellow
$localPropsPath = Join-Path $PSScriptRoot "android\local.properties"
$localPropsContent = "sdk.dir=$($sdkPath -replace '\\', '\\')"

if (Test-Path "android") {
    Set-Content -Path $localPropsPath -Value $localPropsContent -Force
    Write-Host "✓ Created android/local.properties" -ForegroundColor Green
}
else {
    Write-Host "! android folder not found (run 'npx cap add android' first)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANT: Please restart your terminal/PowerShell" -ForegroundColor Yellow
Write-Host "   for environment variables to take effect!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart PowerShell" -ForegroundColor White
Write-Host "2. Run: npm run cap:open" -ForegroundColor White
Write-Host "3. Build APK in Android Studio" -ForegroundColor White
Write-Host ""
Write-Host "Verify setup by running:" -ForegroundColor Cyan
Write-Host "  java -version" -ForegroundColor White
Write-Host "  adb version" -ForegroundColor White
Write-Host ""
