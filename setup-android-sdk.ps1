# Script to download and setup Android SDK for APK build
# This will download minimal Android SDK to build APK

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Android SDK Quick Setup for APK Build" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Define paths
$projectRoot = $PSScriptRoot
$sdkRoot = Join-Path $projectRoot "android-sdk"
$cmdlineToolsZip = Join-Path $projectRoot "commandlinetools-win-latest.zip"
$cmdlineToolsUrl = "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"

# Step 1: Download Android Command Line Tools
Write-Host "[1/5] Downloading Android Command Line Tools..." -ForegroundColor Yellow
if (-not (Test-Path $sdkRoot)) {
    New-Item -ItemType Directory -Path $sdkRoot -Force | Out-Null
}

if (-not (Test-Path $cmdlineToolsZip)) {
    Write-Host "      Downloading from Google... (~150 MB)" -ForegroundColor Gray
    try {
        Invoke-WebRequest -Uri $cmdlineToolsUrl -OutFile $cmdlineToolsZip -UseBasicParsing
        Write-Host "      ✓ Download complete!" -ForegroundColor Green
    } catch {
        Write-Host "      ✗ Download failed: $_" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "      ✓ Already downloaded, skipping..." -ForegroundColor Green
}

# Step 2: Extract Command Line Tools
Write-Host "[2/5] Extracting tools..." -ForegroundColor Yellow
$cmdlineToolsPath = Join-Path $sdkRoot "cmdline-tools"
if (-not (Test-Path $cmdlineToolsPath)) {
    Expand-Archive -Path $cmdlineToolsZip -DestinationPath $sdkRoot -Force
    
    # Rename to proper structure
    $extractedPath = Join-Path $sdkRoot "cmdline-tools"
    $latestPath = Join-Path $cmdlineToolsPath "latest"
    
    if (Test-Path $extractedPath) {
        if (-not (Test-Path $latestPath)) {
            New-Item -ItemType Directory -Path $cmdlineToolsPath -Force | Out-Null
            Move-Item -Path $extractedPath -Destination $latestPath -Force
        }
    }
    Write-Host "      ✓ Extraction complete!" -ForegroundColor Green
} else {
    Write-Host "      ✓ Already extracted, skipping..." -ForegroundColor Green
}

# Step 3: Set environment variables
Write-Host "[3/5] Setting environment variables..." -ForegroundColor Yellow
$env:ANDROID_HOME = $sdkRoot
$env:ANDROID_SDK_ROOT = $sdkRoot
$sdkManager = Join-Path $sdkRoot "cmdline-tools\latest\bin\sdkmanager.bat"

Write-Host "      ANDROID_HOME = $sdkRoot" -ForegroundColor Gray
Write-Host "      ✓ Environment set!" -ForegroundColor Green

# Step 4: Accept licenses
Write-Host "[4/5] Accepting Android SDK licenses..." -ForegroundColor Yellow
if (Test-Path $sdkManager) {
    $licenses = "y`ny`ny`ny`ny`ny`ny`ny`n"
    $licenses | & $sdkManager --licenses 2>&1 | Out-Null
    Write-Host "      ✓ Licenses accepted!" -ForegroundColor Green
} else {
    Write-Host "      ✗ SDK manager not found!" -ForegroundColor Red
    exit 1
}

# Step 5: Install required SDK packages
Write-Host "[5/5] Installing required SDK packages..." -ForegroundColor Yellow
Write-Host "      This may take 5-10 minutes..." -ForegroundColor Gray

$packages = @(
    "platform-tools",
    "platforms;android-33",
    "build-tools;33.0.0"
)

foreach ($package in $packages) {
    Write-Host "      Installing $package..." -ForegroundColor Gray
    & $sdkManager $package 2>&1 | Out-Null
}
Write-Host "      ✓ SDK packages installed!" -ForegroundColor Green

# Create local.properties for Android project
Write-Host ""
Write-Host "Creating android/local.properties..." -ForegroundColor Yellow
$localPropsPath = Join-Path $projectRoot "android\local.properties"
$localPropsContent = "sdk.dir=$($sdkRoot -replace '\\', '\\')"
Set-Content -Path $localPropsPath -Value $localPropsContent -Force
Write-Host "✓ local.properties created!" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete! Ready to build APK" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next step: Run './build-apk.ps1' to build the APK" -ForegroundColor Yellow
Write-Host ""
