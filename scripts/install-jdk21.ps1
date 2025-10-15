# Install JDK 21 - PowerShell Script
# This script helps download and install JDK 21 (Eclipse Adoptium - Temurin)

Write-Host "=== Java 21 Installation Helper ===" -ForegroundColor Cyan
Write-Host ""

# Check current Java version
Write-Host "Current Java version:" -ForegroundColor Yellow
try {
    java -version 2>&1 | ForEach-Object { Write-Host $_ -ForegroundColor Gray }
} catch {
    Write-Host "Java not found or not in PATH" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Installation Options ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "Option 1: Install via winget (Recommended - Easiest)" -ForegroundColor Green
Write-Host "Command: winget install EclipseAdoptium.Temurin.21.JDK"
Write-Host ""

Write-Host "Option 2: Download Manually" -ForegroundColor Yellow
Write-Host "URL: https://adoptium.net/temurin/releases/?version=21"
Write-Host "Download the Windows x64 MSI installer for JDK 21"
Write-Host ""

Write-Host "Option 3: Microsoft Build of OpenJDK" -ForegroundColor Yellow
Write-Host "URL: https://learn.microsoft.com/en-us/java/openjdk/download#openjdk-21"
Write-Host ""

# Ask user if they want to install using winget
Write-Host "=== Automatic Installation ===" -ForegroundColor Cyan
$response = Read-Host "Do you want to install JDK 21 using winget now? (y/n)"

if ($response -eq 'y' -or $response -eq 'Y') {
    Write-Host ""
    Write-Host "Installing Eclipse Adoptium JDK 21..." -ForegroundColor Green
    
    try {
        winget install EclipseAdoptium.Temurin.21.JDK
        
        Write-Host ""
        Write-Host "Installation completed!" -ForegroundColor Green
        Write-Host ""
        Write-Host "=== Important: Configure JAVA_HOME ===" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "The JDK has been installed, but you need to set JAVA_HOME:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "1. The JDK is typically installed in one of these locations:"
        Write-Host "   - C:\Program Files\Eclipse Adoptium\jdk-21.*-hotspot"
        Write-Host "   - C:\Program Files\Java\jdk-21.*"
        Write-Host ""
        Write-Host "2. Set JAVA_HOME environment variable:"
        Write-Host "   - Press Win + X, select 'System'"
        Write-Host "   - Click 'Advanced system settings'"
        Write-Host "   - Click 'Environment Variables'"
        Write-Host "   - Under System Variables, add/edit JAVA_HOME"
        Write-Host "   - Set value to JDK 21 installation path"
        Write-Host ""
        Write-Host "3. Add to PATH:"
        Write-Host "   - Add %JAVA_HOME%\bin to your PATH variable"
        Write-Host ""
        Write-Host "4. Restart your terminal/PowerShell"
        Write-Host ""
        Write-Host "5. Verify installation:"
        Write-Host "   java -version"
        Write-Host ""
        
    } catch {
        Write-Host "Installation failed. Error: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please try manual installation from:" -ForegroundColor Yellow
        Write-Host "https://adoptium.net/temurin/releases/?version=21"
    }
} else {
    Write-Host ""
    Write-Host "Skipping automatic installation." -ForegroundColor Yellow
    Write-Host "Please install JDK 21 manually using one of the options above."
    Write-Host ""
}

Write-Host ""
Write-Host "=== Next Steps After Installation ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Set JAVA_HOME to JDK 21 installation path"
Write-Host "2. Restart terminal/IDE"
Write-Host "3. Verify: java -version"
Write-Host "4. Build project: .\gradlew clean build"
Write-Host ""
Write-Host "For detailed instructions, see: docs\JAVA_21_UPGRADE_SUMMARY.md"
Write-Host ""

# Pause at the end
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
