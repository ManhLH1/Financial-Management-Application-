# ✅ FILE .ENV.IMPORT ĐÃ TẠO SẴN!

## 📦 File quan trọng nhất: `.env.import`

File này chứa **TẤT CẢ** environment variables cần thiết để deploy lên Vercel.

### 📍 Vị trí file:
```
d:\My-Fin\App-Fin\.env.import
```

### 🔐 Nội dung:
File chứa đầy đủ 7 environment variables:
1. ✅ NEXTAUTH_URL (production)
2. ✅ NEXTAUTH_SECRET (đã generate)
3. ✅ GOOGLE_CLIENT_ID (từ .env.local)
4. ✅ GOOGLE_CLIENT_SECRET (từ .env.local)
5. ✅ GOOGLE_SHEET_ID (từ .env.local)
6. ✅ EMAIL_USER (từ .env.local)
7. ✅ EMAIL_PASSWORD (từ .env.local)

---

## 🚀 CÁCH SỬ DỤNG (3 BƯỚC ĐƠN GIẢN)

### Bước 1: Mở Vercel Dashboard
```
https://vercel.com/manhlhs-projects/financial-management-application/settings/environment-variables
```

### Bước 2: Import file
1. Cuộn xuống phần **"Import .env"**
2. Click nút **"Import .env"**
3. Chọn file `.env.import` hoặc paste nội dung
4. Chọn environments: ✅ Production ✅ Preview ✅ Development
5. Click **"Import"**

### Bước 3: Deploy
```bash
vercel --prod
```

---

## ⚠️ QUAN TRỌNG SAU KHI IMPORT

### Cập nhật Google OAuth Authorized Redirect URIs:

1. Vào: https://console.cloud.google.com/apis/credentials
2. Tìm OAuth 2.0 Client ID của bạn
3. Click "Edit" (✏️)
4. Thêm URLs sau vào **Authorized redirect URIs**:

```
https://financial-management-application.vercel.app/api/auth/callback/google
https://financial-management-application-git-main-manhlhs-projects.vercel.app/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
http://localhost:3001/api/auth/callback/google
```

5. Click "Save"

---

## 📖 Hướng dẫn chi tiết

Xem file: **`HOW_TO_IMPORT_ENV.md`**

---

## ✅ CHECKLIST

- [ ] File .env.import đã tạo ✅
- [ ] Mở Vercel Dashboard
- [ ] Import file .env.import vào Vercel
- [ ] Chọn environments (Production, Preview, Development)
- [ ] Import thành công
- [ ] Update Google OAuth Authorized redirect URIs
- [ ] Deploy production: `vercel --prod`
- [ ] Test app: https://financial-management-application.vercel.app
- [ ] Test Google OAuth login
- [ ] Kiểm tra tất cả chức năng

---

## 🎯 ONE-LINE COMMAND (Optional - CLI)

Nếu muốn dùng CLI thay vì Dashboard:

```powershell
# Windows
.\import-env-to-vercel.ps1
```

```bash
# Mac/Linux
./import-env-to-vercel.sh
```

---

## 📞 Files tham khảo

1. **`.env.import`** ← File chính để import
2. **`HOW_TO_IMPORT_ENV.md`** ← Hướng dẫn chi tiết
3. **`IMPORT_ENV_GUIDE.md`** ← 3 cách import
4. **`VERCEL_DEPLOYMENT.md`** ← Deploy guide
5. **`DEPLOYMENT_PACKAGE.md`** ← Tổng quan

---

## ⚡ QUICK LINKS

- 📊 Vercel Dashboard: https://vercel.com/manhlhs-projects/financial-management-application
- ⚙️ Environment Variables: https://vercel.com/manhlhs-projects/financial-management-application/settings/environment-variables
- 🔐 Google Cloud Console: https://console.cloud.google.com/apis/credentials
- 📝 Vercel Logs: https://vercel.com/manhlhs-projects/financial-management-application/logs
- 🌐 Production URL: https://financial-management-application.vercel.app

---

**Status**: ✅ File .env.import READY TO IMPORT!
**Last Updated**: October 10, 2025
