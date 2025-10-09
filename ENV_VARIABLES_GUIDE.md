# 📋 Environment Variables Checklist cho Vercel

Thêm các biến sau vào Vercel Dashboard:
https://vercel.com/manhlhs-projects/financial-management-application/settings/environment-variables

---

## ✅ Required Variables (Bắt buộc)

### 1. NEXTAUTH_URL
```
Production: https://financial-management-application.vercel.app
Preview: https://financial-management-application-git-main-manhlhs-projects.vercel.app
Development: http://localhost:3000
```
**Environment**: All (Production, Preview, Development)

---

### 2. NEXTAUTH_SECRET
Tạo random string:
```bash
# Chạy lệnh này trong terminal:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
**Value**: Kết quả từ lệnh trên (ví dụ: `a1b2c3d4e5f6...`)
**Environment**: All (Production, Preview, Development)

---

### 3. GOOGLE_CLIENT_ID
⚠️ **CHÚ Ý**: TẠO MỚI credentials vì cái cũ đã bị lộ!

**Cách tạo:**
1. Vào: https://console.cloud.google.com/apis/credentials
2. Create Credentials → OAuth client ID
3. Authorized redirect URIs:
   - `https://financial-management-application.vercel.app/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google`

**Value**: `YOUR_NEW_CLIENT_ID.apps.googleusercontent.com`
**Environment**: All

---

### 4. GOOGLE_CLIENT_SECRET
**Value**: Secret từ OAuth client ID vừa tạo
**Environment**: All

---

### 5. GOOGLE_SHEET_ID
**Value**: ID của Google Sheet (từ URL)
Ví dụ: `1J_wLCRt5FBffBR95YkJZ0CbaTL3scLTBIphgtx9KNTg`
**Environment**: All

---

## 📧 Optional Variables (Tùy chọn - cho email notifications)

### 6. EMAIL_USER
**Value**: `your-email@gmail.com`
**Environment**: All

---

### 7. EMAIL_PASSWORD
**Value**: App Password từ Gmail
**Cách tạo**: 
1. Vào Google Account → Security
2. 2-Step Verification phải được bật
3. App passwords → Generate
4. Copy password (16 ký tự không có khoảng trắng)

**Environment**: All

---

## 🚀 Quick Add Commands

### Cách 1: Qua Vercel Dashboard (Khuyên dùng)
1. Vào: https://vercel.com/manhlhs-projects/financial-management-application/settings/environment-variables
2. Click "Add New" cho mỗi biến
3. Paste Key và Value
4. Chọn environments: Production, Preview, Development
5. Save

### Cách 2: Qua Vercel CLI
```bash
# NEXTAUTH_URL
vercel env add NEXTAUTH_URL production
# Nhập: https://financial-management-application.vercel.app

# NEXTAUTH_SECRET
vercel env add NEXTAUTH_SECRET production
# Nhập: (secret từ crypto.randomBytes)

# GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_ID production
# Nhập: YOUR_CLIENT_ID.apps.googleusercontent.com

# GOOGLE_CLIENT_SECRET
vercel env add GOOGLE_CLIENT_SECRET production
# Nhập: YOUR_CLIENT_SECRET

# GOOGLE_SHEET_ID
vercel env add GOOGLE_SHEET_ID production
# Nhập: YOUR_SHEET_ID

# EMAIL_USER (optional)
vercel env add EMAIL_USER production
# Nhập: your-email@gmail.com

# EMAIL_PASSWORD (optional)
vercel env add EMAIL_PASSWORD production
# Nhập: your-app-password
```

---

## ⚡ Sau khi thêm Environment Variables:

### Redeploy để áp dụng:
```bash
vercel --prod
```

Hoặc:
1. Vào Vercel Dashboard
2. Deployments tab
3. Click ... (3 dots) trên deployment mới nhất
4. Click "Redeploy"

---

## 🔍 Kiểm tra:

### Xem environment variables đã thêm:
```bash
vercel env ls
```

### Xem logs:
```bash
vercel logs
```
Hoặc: https://vercel.com/manhlhs-projects/financial-management-application/logs

---

## ✅ Checklist

- [ ] NEXTAUTH_URL added (Production, Preview, Development)
- [ ] NEXTAUTH_SECRET added (All environments)
- [ ] GOOGLE_CLIENT_ID added (NEW credentials)
- [ ] GOOGLE_CLIENT_SECRET added (NEW credentials)
- [ ] GOOGLE_SHEET_ID added
- [ ] EMAIL_USER added (optional)
- [ ] EMAIL_PASSWORD added (optional)
- [ ] Updated Google OAuth Authorized redirect URIs
- [ ] Redeployed with `vercel --prod`
- [ ] Tested login on production URL

---

## 🎯 Production URL

**Sau khi deploy production:**
https://financial-management-application.vercel.app

**Test ngay:**
1. Mở URL trên
2. Click "Sign in with Google"
3. Chọn tài khoản Google
4. Kiểm tra có redirect về app không
5. Test tạo expense, debt, budget

---

## 🆘 Nếu có lỗi:

### Check Vercel Logs:
https://vercel.com/manhlhs-projects/financial-management-application/logs

### Common Issues:

**Error: "Callback URL mismatch"**
→ Check Authorized redirect URIs trong Google Cloud Console

**Error: "Missing environment variables"**
→ Vào Settings → Environment Variables → Check tất cả biến

**Error: "Invalid credentials"**
→ Tạo lại Google OAuth credentials

**Error 500**
→ Check Vercel Function Logs để xem error message cụ thể
