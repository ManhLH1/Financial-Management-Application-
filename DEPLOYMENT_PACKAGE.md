# 📦 DEPLOYMENT PACKAGE - READY TO IMPORT

## 🎯 Files đã tạo sẵn để deploy lên Vercel

### ✅ 1. `.env.production.example`
Template cho environment variables production
- Copy thành `.env.production`
- Điền các giá trị cần thiết
- Import lên Vercel

### ✅ 2. `.env.vercel`
Format đơn giản để tham khảo
- Copy/paste từng dòng vào Vercel Dashboard

### ✅ 3. `import-env-to-vercel.ps1`
Script PowerShell tự động import (Windows)
```powershell
.\import-env-to-vercel.ps1
```

### ✅ 4. `import-env-to-vercel.sh`
Script Bash tự động import (Mac/Linux)
```bash
chmod +x import-env-to-vercel.sh
./import-env-to-vercel.sh
```

---

## 📚 Hướng dẫn chi tiết

### 📖 `IMPORT_ENV_GUIDE.md`
**3 cách import environment variables:**
1. Qua Vercel Dashboard (đơn giản)
2. Dùng Vercel CLI (nhanh)
3. Copy từ .env.local (tự động)

### 📖 `VERCEL_DEPLOYMENT.md`
**Hướng dẫn deploy từ A-Z:**
- Tạo Google OAuth credentials mới
- Thêm environment variables
- Deploy production
- Troubleshooting

### 📖 `ENV_VARIABLES_GUIDE.md`
**Chi tiết từng environment variable:**
- Required vs Optional
- Cách tạo mỗi giá trị
- Quick add commands

### 📖 `DEPLOYMENT_SUMMARY.md`
**Tóm tắt deployment:**
- URLs quan trọng
- Checklist hoàn thành
- Next steps

---

## 🚀 QUICK START - 3 Steps

### Step 1: Tạo OAuth Credentials MỚI
```
⚠️ QUAN TRỌNG: Credentials cũ đã bị lộ!

1. Vào: https://console.cloud.google.com/apis/credentials
2. Xóa credentials cũ: 745870655061-ic87qnfsk8mn91es6ic3k3anpfn6dqf9
3. Tạo mới với Authorized redirect URIs:
   - https://financial-management-application.vercel.app/api/auth/callback/google
   - http://localhost:3000/api/auth/callback/google
```

### Step 2: Import Environment Variables

**Option A - Vercel Dashboard (Recommended):**
1. Mở: https://vercel.com/manhlhs-projects/financial-management-application/settings/environment-variables
2. Mở file `.env.vercel` để tham khảo
3. Add từng biến (Key + Value)
4. Chọn: Production, Preview, Development

**Option B - Vercel CLI:**
```bash
# Copy template
copy .env.production.example .env.production

# Điền giá trị
notepad .env.production

# Import tự động
.\import-env-to-vercel.ps1
```

### Step 3: Deploy Production
```bash
vercel --prod
```

---

## ✅ Environment Variables Checklist

### Required (Bắt buộc):
- [ ] `NEXTAUTH_URL` = `https://financial-management-application.vercel.app`
- [ ] `NEXTAUTH_SECRET` = `bncYSV6y5NOfw9TY2c9A/0DyrmUW0aSed6/nqOTjoaE=`
- [ ] `GOOGLE_CLIENT_ID` = YOUR_NEW_CLIENT_ID (⚠️ TẠO MỚI!)
- [ ] `GOOGLE_CLIENT_SECRET` = YOUR_NEW_CLIENT_SECRET (⚠️ TẠO MỚI!)
- [ ] `GOOGLE_SHEET_ID` = YOUR_GOOGLE_SHEET_ID

### Optional (Tùy chọn):
- [ ] `EMAIL_USER` = your-email@gmail.com
- [ ] `EMAIL_PASSWORD` = your-gmail-app-password

---

## 🔗 Links

### Production:
- **App URL**: https://financial-management-application.vercel.app
- **Dashboard**: https://vercel.com/manhlhs-projects/financial-management-application
- **Env Settings**: https://vercel.com/manhlhs-projects/financial-management-application/settings/environment-variables
- **Logs**: https://vercel.com/manhlhs-projects/financial-management-application/logs

### Development:
- **GitHub Repo**: https://github.com/ManhLH1/Financial-Management-Application-
- **Local**: http://localhost:3000

### Google Cloud:
- **Credentials**: https://console.cloud.google.com/apis/credentials
- **OAuth Consent**: https://console.cloud.google.com/apis/credentials/consent

---

## 📊 Deployment Status

```
✅ GitHub Repository: Created
✅ Vercel Project: Connected
✅ Preview Deploy: Success
⏳ Environment Variables: Pending
⏳ Production Deploy: Pending
⏳ OAuth Credentials: Need NEW credentials
```

---

## 🎯 After Deploy Checklist

- [ ] All environment variables added
- [ ] Google OAuth credentials created (NEW)
- [ ] Authorized redirect URIs updated
- [ ] Production deployed (`vercel --prod`)
- [ ] Can access app URL
- [ ] Google login works
- [ ] Can create expense
- [ ] Can view expenses
- [ ] Google Sheets integration works
- [ ] All features tested

---

## 🆘 Need Help?

### Documentation:
1. **Import Guide**: `IMPORT_ENV_GUIDE.md` ← START HERE
2. **Deployment Guide**: `VERCEL_DEPLOYMENT.md`
3. **Env Variables**: `ENV_VARIABLES_GUIDE.md`
4. **Summary**: `DEPLOYMENT_SUMMARY.md`

### Commands:
```bash
# Check environment variables
vercel env ls

# View logs
vercel logs

# Redeploy
vercel --prod --force

# Open dashboard
vercel open
```

### Common Issues:
- **"Callback URL mismatch"** → Check Authorized redirect URIs
- **"Missing env variables"** → Add all required variables
- **"Invalid credentials"** → Create NEW OAuth credentials
- **Error 500** → Check Vercel logs

---

## 📞 Support

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- NextAuth Docs: https://next-auth.js.org

---

**Ready to deploy?** Follow `IMPORT_ENV_GUIDE.md` 🚀
