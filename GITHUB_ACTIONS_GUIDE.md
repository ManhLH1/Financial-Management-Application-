# 🤖 GitHub Actions - Tự Động Build APK

## 🎯 Tổng quan

Dự án đã được cấu hình với **GitHub Actions** để tự động build APK mỗi khi push code!

## ✅ Đã setup

2 workflows đã được tạo:

### 1️⃣ **build-apk.yml** - Build APK tự động
- **Kích hoạt:** Mỗi khi push lên `main`, `master`, hoặc `develop`
- **Output:** APK unsigned (để test)
- **Thời gian build:** ~5-10 phút

### 2️⃣ **build-apk-signed.yml** - Build APK production (có chữ ký)
- **Kích hoạt:** Khi push tag version (vd: `v1.0.0`)
- **Output:** APK signed (để release)
- **Tạo GitHub Release tự động**

---

## 🚀 CÁCH SỬ DỤNG

### Bước 1: Push code lên GitHub

```bash
git add .
git commit -m "feat: add APK auto-build"
git push origin main
```

### Bước 2: Xem quá trình build

1. Mở repository trên GitHub
2. Click tab **Actions**
3. Xem workflow "Build Android APK" đang chạy
4. Đợi ~5-10 phút cho build hoàn tất

### Bước 3: Download APK

Sau khi build xong:
1. Click vào workflow run (màu xanh ✓)
2. Scroll xuống phần **Artifacts**
3. Download file `financial-manager-apk-XXX.zip`
4. Giải nén để có file `.apk`

---

## 📱 CÀI ĐẶT APK

1. **Chuyển APK vào điện thoại:**
   - USB cable hoặc
   - Upload lên Google Drive/Telegram rồi download trên phone

2. **Cài đặt:**
   - Mở file APK
   - Cho phép "Install from unknown sources" (nếu cần)
   - Click Install

---

## 🎨 BUILD APK PRODUCTION (Signed)

Khi muốn release version chính thức:

```bash
# Tạo tag version
git tag v1.0.0
git push origin v1.0.0
```

Workflow sẽ tự động:
- Build APK signed
- Tạo GitHub Release
- Upload APK vào Release

### Setup Signing (Optional - để APK có chữ ký)

Tạo keystore:
```bash
keytool -genkey -v -keystore release.keystore -alias financial-manager -keyalg RSA -keysize 2048 -validity 10000
```

Thêm secrets vào GitHub:
1. Vào **Settings** > **Secrets and variables** > **Actions**
2. Thêm các secrets:
   - `KEYSTORE_BASE64`: keystore file encoded base64
   - `KEYSTORE_PASSWORD`: mật khẩu keystore
   - `KEY_ALIAS`: alias của key
   - `KEY_PASSWORD`: mật khẩu key

Encode keystore:
```bash
# Windows PowerShell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("release.keystore"))

# Mac/Linux
base64 -i release.keystore | tr -d '\n'
```

---

## ⚡ BUILD MANUAL (Không push code)

Nếu muốn build APK mà không push code mới:

1. Vào tab **Actions**
2. Chọn workflow "Build Android APK"
3. Click **Run workflow**
4. Chọn branch và click **Run workflow**

---

## 📁 Cấu trúc Artifacts

Sau mỗi lần build, bạn sẽ có:

```
financial-manager-apk-123.zip
└── app-release-unsigned.apk   (~10-20 MB)
```

Với signed build:
```
financial-manager-production-456.zip
└── financial-manager-v1.0.0.apk   (~10-20 MB)
```

---

## 🐛 Troubleshooting

### ❌ Build failed

**Kiểm tra:**
1. Tab Actions > Click vào run bị lỗi
2. Xem log để biết lỗi ở đâu
3. Thường là:
   - Dependencies issue → Fix `package.json`
   - Build error → Fix code
   - Gradle issue → Cập nhật `android/build.gradle`

### ⏱️ Build quá lâu

- Build lần đầu mất 10-15 phút
- Lần sau nhanh hơn nhờ cache (~5-7 phút)
- Nếu >20 phút → Check logs xem bị treo ở đâu

### 📦 APK không chạy

- APK unsigned chỉ để test, có thể bị Warning
- Dùng signed APK cho production
- Kiểm tra Android version tối thiểu (5.0+)

---

## 📊 WORKFLOW STATUS BADGES

Thêm vào README.md:

```markdown
![Build APK](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/build-apk.yml/badge.svg)
```

---

## 🎯 NEXT STEPS

1. ✅ Push code lên GitHub
2. ✅ Xem Actions tab
3. ✅ Download APK từ Artifacts
4. ✅ Test APK trên điện thoại
5. 🚀 Release version với tags

---

## 📝 NOTES

- **Retention:** Artifacts lưu 30 ngày (unsigned), 90 ngày (signed)
- **Cost:** GitHub Actions miễn phí cho public repos
- **Build limit:** 2000 phút/tháng (free tier)
- **Concurrent builds:** Tối đa 20 builds đồng thời

---

## 🤝 Hỗ trợ

Nếu gặp vấn đề:
1. Check Actions logs
2. Đọc error messages
3. Google error nếu không rõ
4. Create GitHub Issue

---

**Chúc mừng! Bạn đã setup thành công auto-build APK! 🎉**

Mỗi lần push code = Có APK mới tự động! 🚀
