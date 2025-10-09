# 📦 Hướng dẫn Import Environment Variables lên Vercel

## 🎯 3 Cách Import (Chọn 1)

---

## ✅ CÁCH 1: Qua Vercel Dashboard (Đơn giản nhất)

### Bước 1: Mở Vercel Dashboard
```
https://vercel.com/manhlhs-projects/financial-management-application/settings/environment-variables
```

### Bước 2: Thêm từng biến
1. Click **"Add New"**
2. Chọn tab **"Plaintext"**
3. Nhập **Key** và **Value**
4. Chọn **Environments**: ✅ Production, ✅ Preview, ✅ Development
5. Click **"Save"**

### Bước 3: Danh sách biến cần thêm

#### 1. NEXTAUTH_URL
- **Environment**: Production only
- **Value**: 
```
https://financial-management-application.vercel.app
```

#### 2. NEXTAUTH_SECRET
- **Environment**: All (Production, Preview, Development)
- **Value**: 
```
bncYSV6y5NOfw9TY2c9A/0DyrmUW0aSed6/nqOTjoaE=
```

#### 3. GOOGLE_CLIENT_ID
- **Environment**: All
- **Value**: `YOUR_NEW_CLIENT_ID.apps.googleusercontent.com`
- ⚠️ **Tạo mới tại**: https://console.cloud.google.com/apis/credentials

#### 4. GOOGLE_CLIENT_SECRET
- **Environment**: All
- **Value**: `YOUR_NEW_CLIENT_SECRET`
- ⚠️ **Tạo mới tại**: https://console.cloud.google.com/apis/credentials

#### 5. GOOGLE_SHEET_ID
- **Environment**: All
- **Value**: ID từ URL Google Sheet của bạn
- Ví dụ: `1J_wLCRt5FBffBR95YkJZ0CbaTL3scLTBIphgtx9KNTg`

#### 6. EMAIL_USER (Optional)
- **Environment**: All
- **Value**: `your-email@gmail.com`

#### 7. EMAIL_PASSWORD (Optional)
- **Environment**: All
- **Value**: Gmail App Password (16 ký tự)

---

## 🚀 CÁCH 2: Dùng Vercel CLI (Nhanh)

### Bước 1: Tạo file .env.production
```bash
# Copy từ template
copy .env.production.example .env.production

# Hoặc từ .env.local hiện tại
copy .env.local .env.production
```

### Bước 2: Chỉnh sửa .env.production
```bash
# Mở bằng editor
notepad .env.production
```

**Thay đổi:**
- ❌ Xóa hoặc thay GOOGLE_CLIENT_ID cũ
- ❌ Xóa hoặc thay GOOGLE_CLIENT_SECRET cũ
- ✅ Cập nhật NEXTAUTH_URL thành production URL
- ✅ Kiểm tra tất cả giá trị

### Bước 3: Import bằng CLI

#### Tự động (Windows):
```powershell
.\import-env-to-vercel.ps1
```

#### Tự động (Mac/Linux):
```bash
chmod +x import-env-to-vercel.sh
./import-env-to-vercel.sh
```

#### Thủ công (All platforms):
```bash
# Thêm từng biến
vercel env add NEXTAUTH_URL production
# Paste value: https://financial-management-application.vercel.app

vercel env add NEXTAUTH_SECRET production
# Paste value: bncYSV6y5NOfw9TY2c9A/0DyrmUW0aSed6/nqOTjoaE=

vercel env add GOOGLE_CLIENT_ID production
# Paste value: YOUR_NEW_CLIENT_ID.apps.googleusercontent.com

vercel env add GOOGLE_CLIENT_SECRET production
# Paste value: YOUR_NEW_CLIENT_SECRET

vercel env add GOOGLE_SHEET_ID production
# Paste value: YOUR_GOOGLE_SHEET_ID

# Optional
vercel env add EMAIL_USER production
vercel env add EMAIL_PASSWORD production
```

### Bước 4: Kiểm tra
```bash
vercel env ls
```

---

## 🔄 CÁCH 3: Copy từ .env.local (Nhanh nhất nếu đã có)

### Bước 1: Đọc file .env.local hiện tại
```powershell
Get-Content .env.local
```

### Bước 2: Copy từng biến vào Vercel
```bash
# Đọc từng dòng và thêm vào Vercel
$env_content = Get-Content .env.local
foreach ($line in $env_content) {
    if ($line -match '^([^#][^=]+)=(.+)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        Write-Host "Adding $key..."
        # Paste value khi được hỏi
        vercel env add $key production
    }
}
```

---

## ⚠️ QUAN TRỌNG: Tạo Google OAuth Credentials MỚI

### Tại sao cần tạo mới?
- ❌ Credentials cũ đã bị lộ trên GitHub
- ❌ Ai cũng có thể xem được trong commit history
- ✅ PHẢI xóa và tạo mới để bảo mật

### Cách tạo:

1. **Xóa credentials cũ:**
   - Vào: https://console.cloud.google.com/apis/credentials
   - Tìm: `745870655061-ic87qnfsk8mn91es6ic3k3anpfn6dqf9`
   - Click Delete (🗑️)

2. **Tạo credentials mới:**
   - Click **"CREATE CREDENTIALS"** → **"OAuth client ID"**
   - Application type: **Web application**
   - Name: `Financial Management App - Production`
   - **Authorized redirect URIs**:
     ```
     https://financial-management-application.vercel.app/api/auth/callback/google
     http://localhost:3000/api/auth/callback/google
     ```
   - Click **"CREATE"**
   - Copy **Client ID** và **Client Secret**

3. **Thêm vào Vercel:**
   - Vào Vercel Dashboard → Environment Variables
   - Add `GOOGLE_CLIENT_ID` = (Client ID mới)
   - Add `GOOGLE_CLIENT_SECRET` = (Client Secret mới)

---

## 🎯 Sau khi Import Environment Variables

### 1. Kiểm tra variables đã thêm:
```bash
vercel env ls
```

### 2. Deploy production:
```bash
vercel --prod
```

### 3. Kiểm tra logs:
```bash
vercel logs
```

### 4. Mở app:
```
https://financial-management-application.vercel.app
```

### 5. Test login:
- Click "Sign in with Google"
- Chọn tài khoản
- Kiểm tra redirect về app
- Test các chức năng

---

## 📋 Checklist

- [ ] Đã xóa Google OAuth credentials cũ
- [ ] Đã tạo Google OAuth credentials mới
- [ ] Đã thêm NEXTAUTH_URL
- [ ] Đã thêm NEXTAUTH_SECRET
- [ ] Đã thêm GOOGLE_CLIENT_ID (mới)
- [ ] Đã thêm GOOGLE_CLIENT_SECRET (mới)
- [ ] Đã thêm GOOGLE_SHEET_ID
- [ ] Đã thêm EMAIL_USER (nếu dùng)
- [ ] Đã thêm EMAIL_PASSWORD (nếu dùng)
- [ ] Đã cập nhật Authorized redirect URIs
- [ ] Đã chạy `vercel --prod`
- [ ] Đã test login trên production
- [ ] App hoạt động bình thường

---

## 🔧 Troubleshooting

### Lỗi: "vercel: command not found"
```bash
npm install -g vercel
```

### Lỗi: "Not authorized"
```bash
vercel login
```

### Lỗi: "Environment variable already exists"
- Xóa biến cũ: `vercel env rm VARIABLE_NAME production`
- Thêm lại: `vercel env add VARIABLE_NAME production`

### Variables không apply?
- Redeploy: `vercel --prod --force`
- Hoặc vào Dashboard → Deployments → Redeploy

---

## 📞 Support

- 📖 Docs: `VERCEL_DEPLOYMENT.md`
- 🔐 Env Guide: `ENV_VARIABLES_GUIDE.md`
- 📊 Summary: `DEPLOYMENT_SUMMARY.md`
- 🌐 Dashboard: https://vercel.com/manhlhs-projects/financial-management-application

---

**Generated**: October 10, 2025
