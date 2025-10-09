# ============================================
# VERCEL ENV IMPORT SCRIPT
# ============================================
# Script này giúp import environment variables lên Vercel
# 
# Cách sử dụng:
# 1. Copy file .env.local thành .env.production
# 2. Update các giá trị cần thiết trong .env.production
# 3. Chạy script: .\import-env-to-vercel.ps1
# ============================================

Write-Host "🚀 Vercel Environment Variables Import Script" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra file .env.production
if (-not (Test-Path ".env.production")) {
    Write-Host "❌ File .env.production không tồn tại!" -ForegroundColor Red
    Write-Host "📝 Tạo file .env.production từ template..." -ForegroundColor Yellow
    
    if (Test-Path ".env.production.example") {
        Copy-Item ".env.production.example" ".env.production"
        Write-Host "✅ Đã tạo .env.production từ .env.production.example" -ForegroundColor Green
        Write-Host "⚠️  Vui lòng điền các giá trị trong .env.production và chạy lại script!" -ForegroundColor Yellow
        exit
    } else {
        Write-Host "❌ Không tìm thấy .env.production.example" -ForegroundColor Red
        exit
    }
}

Write-Host "✅ Tìm thấy file .env.production" -ForegroundColor Green
Write-Host ""

# Đọc environment variables
$envVars = @{}
Get-Content ".env.production" | ForEach-Object {
    if ($_ -match '^([^#][^=]+)=(.+)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        
        # Bỏ qua nếu là placeholder
        if ($value -notmatch '^YOUR_|^your-') {
            $envVars[$key] = $value
        }
    }
}

Write-Host "📋 Tìm thấy $($envVars.Count) environment variables:" -ForegroundColor Cyan
$envVars.Keys | ForEach-Object {
    $displayValue = if ($envVars[$_].Length -gt 20) {
        $envVars[$_].Substring(0, 20) + "..."
    } else {
        $envVars[$_]
    }
    Write-Host "   - $_" -ForegroundColor White -NoNewline
    Write-Host " = $displayValue" -ForegroundColor Gray
}
Write-Host ""

# Xác nhận
$confirm = Read-Host "Bạn có muốn thêm các biến này vào Vercel? (y/n)"
if ($confirm -ne 'y') {
    Write-Host "❌ Hủy bỏ!" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "🔧 Đang thêm environment variables vào Vercel..." -ForegroundColor Yellow
Write-Host ""

# Thêm từng biến vào Vercel
$success = 0
$failed = 0

foreach ($key in $envVars.Keys) {
    Write-Host "➕ Thêm $key..." -ForegroundColor White -NoNewline
    
    try {
        # Thêm cho production
        $value = $envVars[$key]
        $env:VERCEL_ENV_VALUE = $value
        
        # Sử dụng echo để pipe value vào vercel env add
        $result = echo $value | vercel env add $key production 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host " ✅" -ForegroundColor Green
            $success++
        } else {
            Write-Host " ⚠️ (Có thể đã tồn tại)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host " ❌" -ForegroundColor Red
        $failed++
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "📊 Kết quả:" -ForegroundColor Cyan
Write-Host "   ✅ Thành công: $success" -ForegroundColor Green
Write-Host "   ⚠️  Đã tồn tại/Lỗi: $failed" -ForegroundColor Yellow
Write-Host ""

# Hướng dẫn tiếp theo
Write-Host "🎯 Các bước tiếp theo:" -ForegroundColor Cyan
Write-Host "   1. Kiểm tra env variables: vercel env ls" -ForegroundColor White
Write-Host "   2. Deploy production: vercel --prod" -ForegroundColor White
Write-Host "   3. Xem logs: vercel logs" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Dashboard: https://vercel.com/manhlhs-projects/financial-management-application/settings/environment-variables" -ForegroundColor Cyan
Write-Host ""
