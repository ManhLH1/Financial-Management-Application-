# 📦 Cách Import .env vào Vercel

## ✅ CÁCH NHANH NHẤT: Import file .env

### Bước 1: Sử dụng file đã tạo sẵn
File: `.env.import` đã được tạo với đầy đủ environment variables

### Bước 2: Import vào Vercel Dashboard

#### Option A: Qua Web UI (Đơn giản)
1. Mở Vercel Dashboard:
   ```
   https://vercel.com/manhlhs-projects/financial-management-application/settings/environment-variables
   ```

2. Cuộn xuống phần **"Import .env"**

3. Click nút **"Import .env"** (hoặc paste)

4. Có 2 cách:
   - **Upload file**: Chọn file `.env.import`
   - **Paste content**: Copy nội dung file `.env.import` và paste

5. Chọn **Environments**:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development

6. Click **"Import"** hoặc **"Save"**

#### Option B: Qua Vercel CLI
```bash
# Import file .env.import
vercel env pull .env.import

# Hoặc từ .env.local
vercel env pull
```

---

## 📋 Nội dung file .env.import

File `.env.import` chứa:

```env
# NextAuth Configuration
NEXTAUTH_URL="https://financial-management-application.vercel.app"
NEXTAUTH_SECRET="your-generated-secret-from-crypto"

# Google OAuth Credentials
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Google Sheets Integration
GOOGLE_SHEET_ID="your-google-sheet-id"

# Email Configuration
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-gmail-app-password"
```

---

## ⚠️ QUAN TRỌNG: Cập nhật Authorized Redirect URIs

Sau khi import, cần cập nhật Google OAuth:

### 1. Vào Google Cloud Console:
```
https://console.cloud.google.com/apis/credentials
```

### 2. Tìm OAuth 2.0 Client ID của bạn

Tìm OAuth client đang sử dụng trong project

### 3. Click "Edit" (✏️) và thêm Authorized redirect URIs:

**Thêm URIs sau:**
```
https://financial-management-application.vercel.app/api/auth/callback/google
https://financial-management-application-git-main-manhlhs-projects.vercel.app/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
http://localhost:3001/api/auth/callback/google
```

### 4. Click "Save"

---

## 🚀 Sau khi Import

### 1. Kiểm tra variables đã import:
```bash
vercel env ls
```

Expected output:
```
Environment Variables
  NEXTAUTH_URL          Production, Preview, Development
  NEXTAUTH_SECRET       Production, Preview, Development
  GOOGLE_CLIENT_ID      Production, Preview, Development
  GOOGLE_CLIENT_SECRET  Production, Preview, Development
  GOOGLE_SHEET_ID       Production, Preview, Development
  EMAIL_USER            Production, Preview, Development
  EMAIL_PASSWORD        Production, Preview, Development
```

### 2. Deploy Production:
```bash
vercel --prod
```

### 3. Test App:
```
https://financial-management-application.vercel.app
```

---

## 📊 Verification Checklist

Sau khi deploy, kiểm tra:

- [ ] App loads successfully
- [ ] Click "Sign in with Google" works
- [ ] Can login with Google account
- [ ] Redirects back to app after login
- [ ] Can view dashboard
- [ ] Can create expense
- [ ] Can edit expense
- [ ] Can delete expense
- [ ] Google Sheets integration works
- [ ] Data syncs properly

---

## 🔧 Troubleshooting

### Lỗi: "redirect_uri_mismatch"
**Nguyên nhân**: Authorized redirect URIs chưa đúng

**Giải pháp**:
1. Vào Google Cloud Console
2. Edit OAuth client
3. Thêm đầy đủ URIs như hướng dẫn trên
4. Save và đợi 5-10 phút
5. Test lại

### Lỗi: "Environment variable not found"
**Nguyên nhân**: Import chưa thành công

**Giải pháp**:
1. Check lại Vercel Dashboard → Environment Variables
2. Nếu thiếu, import lại hoặc add từng biến
3. Redeploy: `vercel --prod --force`

### Lỗi: "Invalid credentials"
**Nguyên nhân**: Google OAuth credentials sai

**Giải pháp**:
1. Check GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET
2. Copy lại từ Google Cloud Console
3. Update trong Vercel
4. Redeploy

### App shows blank/error 500
**Kiểm tra**:
```bash
# Xem logs
vercel logs --prod

# Hoặc qua Dashboard
https://vercel.com/manhlhs-projects/financial-management-application/logs
```

---

## 📝 Notes

### About .env.import file:
- ✅ Safe to use - contains current working credentials
- ✅ Pre-configured for production
- ✅ Includes all required variables
- ⚠️ DO NOT commit to Git (already in .gitignore)

### About OAuth Credentials:
- Check your credentials in .env.import file
- Status: ✅ Active and working locally
- Action needed: ✅ Add Vercel URLs to Authorized redirect URIs

### About NEXTAUTH_SECRET:
- Generated using crypto.randomBytes(32).toString('base64')
- Strong random 32-byte base64 string
- ✅ Production ready
- Check .env.import for your secret

---

## 🎯 Quick Commands Reference

```bash
# List all environment variables
vercel env ls

# View specific environment variable
vercel env pull NEXTAUTH_URL

# Remove a variable (if needed to re-add)
vercel env rm VARIABLE_NAME production

# Deploy production
vercel --prod

# Deploy with force rebuild
vercel --prod --force

# View logs
vercel logs

# View real-time logs
vercel logs --follow

# Open project dashboard
vercel open
```

---

## ✨ Success Indicators

After successful import and deploy, you should see:

1. ✅ All 7 environment variables in Vercel Dashboard
2. ✅ Production deployment successful
3. ✅ App loads at production URL
4. ✅ Google OAuth login works
5. ✅ No errors in Vercel logs
6. ✅ All features functional

---

## 📞 Next Steps

1. ✅ Import `.env.import` vào Vercel
2. ✅ Update Google OAuth Authorized redirect URIs
3. ✅ Deploy production: `vercel --prod`
4. ✅ Test app thoroughly
5. ✅ Monitor logs for any issues

**Ready?** Open Vercel Dashboard and click "Import .env"! 🚀

---

**File location**: `.env.import`
**Last updated**: October 10, 2025
