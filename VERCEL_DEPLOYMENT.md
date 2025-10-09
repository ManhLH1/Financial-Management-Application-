# 🚀 Hướng dẫn Deploy lên Vercel

## ✅ Bước 1: Deploy đã hoàn thành!

- 🔗 **Preview URL**: https://financial-management-application-imo3z5hcg-manhlhs-projects.vercel.app
- 📊 **Project Dashboard**: https://vercel.com/manhlhs-projects/financial-management-application

---

## ⚙️ Bước 2: Thêm Environment Variables

### Truy cập Vercel Dashboard:
1. Mở: https://vercel.com/manhlhs-projects/financial-management-application/settings/environment-variables
2. Hoặc: Dashboard → Settings → Environment Variables

### Thêm các biến sau:

#### 🔐 Google OAuth (Quan trọng!)
```
GOOGLE_CLIENT_ID=YOUR_NEW_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_NEW_CLIENT_SECRET
```

⚠️ **LƯU Ý**: Bạn cần tạo OAuth credentials MỚI vì credentials cũ đã bị lộ!

#### 🔗 NextAuth Configuration
```
NEXTAUTH_URL=https://financial-management-application.vercel.app
NEXTAUTH_SECRET=YOUR_RANDOM_SECRET_STRING
```

💡 **Tạo NEXTAUTH_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### 📧 Email Configuration (Tùy chọn)
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

#### 🔥 Firebase (Nếu có)
```
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abc123
```

### Cách thêm từng biến:
1. Click **"Add New"**
2. Nhập **Key** (ví dụ: `GOOGLE_CLIENT_ID`)
3. Nhập **Value** (ví dụ: `745...googleusercontent.com`)
4. Chọn **Environment**: `Production`, `Preview`, `Development` (chọn tất cả)
5. Click **"Save"**

---

## 🔑 Bước 3: Tạo Google OAuth Credentials MỚI

⚠️ **QUAN TRỌNG**: Credentials cũ đã bị lộ trên GitHub!

### 3.1. Xóa credentials cũ:
1. Vào: https://console.cloud.google.com/apis/credentials
2. Tìm OAuth Client ID cũ: `745870655061-ic87qnfsk8mn91es6ic3k3anpfn6dqf9`
3. Click **Delete** (biểu tượng thùng rác)

### 3.2. Tạo credentials mới:
1. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
2. Application type: **Web application**
3. Name: `Financial Management App - Production`
4. **Authorized redirect URIs**:
   ```
   https://financial-management-application.vercel.app/api/auth/callback/google
   http://localhost:3000/api/auth/callback/google
   ```
5. Click **"CREATE"**
6. Copy **Client ID** và **Client Secret**
7. Thêm vào Vercel Environment Variables

---

## 🚀 Bước 4: Deploy Production

Sau khi thêm environment variables:

```bash
vercel --prod
```

Hoặc:
1. Vào Vercel Dashboard
2. Click **"Deployments"**
3. Tìm deployment preview
4. Click **"Promote to Production"**

---

## 🌐 Bước 5: Cấu hình Domain (Tùy chọn)

### Domain miễn phí từ Vercel:
- URL: `financial-management-application.vercel.app`
- Tự động có HTTPS
- ✅ Đã sẵn sàng sử dụng!

### Domain tùy chỉnh (Nếu có):
1. Dashboard → Settings → Domains
2. Click **"Add"**
3. Nhập domain của bạn (ví dụ: `myfinance.com`)
4. Follow hướng dẫn cấu hình DNS

---

## ✅ Checklist Deploy

- [x] Deploy preview thành công
- [ ] Thêm tất cả Environment Variables
- [ ] Tạo OAuth credentials MỚI
- [ ] Cập nhật Authorized redirect URIs
- [ ] Deploy production với `vercel --prod`
- [ ] Test đăng nhập Google OAuth
- [ ] Test các chức năng chính

---

## 🔧 Troubleshooting

### Lỗi: "Callback URL mismatch"
- Kiểm tra Authorized redirect URIs trong Google Cloud Console
- Phải có: `https://financial-management-application.vercel.app/api/auth/callback/google`

### Lỗi: "Environment variables not found"
- Vào Vercel Dashboard → Settings → Environment Variables
- Đảm bảo tất cả biến đã được thêm
- Redeploy sau khi thêm biến

### Lỗi 500 - Internal Server Error
- Kiểm tra Vercel Logs: Dashboard → Deployments → View Function Logs
- Có thể thiếu environment variables

---

## 📱 Sau khi Deploy

### URLs quan trọng:
- **Production**: https://financial-management-application.vercel.app
- **Dashboard**: https://vercel.com/manhlhs-projects/financial-management-application
- **Logs**: https://vercel.com/manhlhs-projects/financial-management-application/logs

### Auto-deploy từ GitHub:
✅ Vercel đã tự động kết nối với GitHub repository!
- Mỗi lần push code → Auto deploy preview
- Merge vào main branch → Auto deploy production

---

## 🎉 Hoàn thành!

Sau khi hoàn tất các bước trên, ứng dụng của bạn sẽ:
- ✅ Chạy trên production
- ✅ Có HTTPS miễn phí
- ✅ Auto-deploy khi push code
- ✅ Có monitoring và logs
- ✅ Performance tối ưu

**URL Production**: https://financial-management-application.vercel.app

---

## 📞 Support

- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- NextAuth.js: https://next-auth.js.org/deployment
