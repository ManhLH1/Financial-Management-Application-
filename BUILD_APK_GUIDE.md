# 📱 Hướng Dẫn Build APK Android từ PWA

Sau khi setup PWA thành công, đây là hướng dẫn chi tiết để build file APK Android.

## ✅ Các Bước Đã Hoàn Thành

- [x] Cài đặt `next-pwa` 
- [x] Cấu hình PWA trong `next.config.js`
- [x] Tạo `manifest.json` với đầy đủ metadata
- [x] Thêm PWA meta tags vào `_app.js`
- [x] Generate tất cả icons cần thiết (72x72 → 512x512)
- [x] Cấu hình Service Worker với caching strategies

## 🚀 Bước 1: Test PWA Locally

```bash
# Build production
npm run build

# Start production server
npm run start
```

Mở trình duyệt tại `http://localhost:3000` và:
1. Mở DevTools (F12)
2. Vào tab **Application** → **Manifest**
3. Kiểm tra manifest.json hiển thị đúng
4. Vào tab **Service Workers** → Kiểm tra SW đã register
5. Test "Add to Home Screen" trên mobile hoặc Chrome Desktop

## 🌐 Bước 2: Deploy lên Production

### Option A: Deploy lên Vercel (Khuyến nghị)

```bash
# Cài Vercel CLI (nếu chưa có)
npm i -g vercel

# Deploy
vercel --prod
```

### Option B: Deploy lên Netlify/Railway/etc

Làm theo hướng dẫn của platform bạn chọn. **Quan trọng:** URL production phải là HTTPS.

**Lưu URL production**, ví dụ: `https://your-app.vercel.app`

## 📦 Bước 3: Cài Đặt Bubblewrap CLI

Bubblewrap là công cụ của Google để chuyển PWA thành APK.

### Yêu cầu:
- Node.js v16+ (đã có)
- Java Development Kit (JDK) 8+
- Android SDK

### Cài đặt JDK:

**Windows:**
```bash
# Download và cài đặt JDK từ:
# https://www.oracle.com/java/technologies/downloads/

# Hoặc dùng Chocolatey:
choco install openjdk
```

Kiểm tra:
```bash
java -version
```

### Cài đặt Android Command Line Tools:

1. Download từ: https://developer.android.com/studio#command-tools
2. Giải nén vào `C:\Android\cmdline-tools`
3. Thêm vào PATH:
   - `C:\Android\cmdline-tools\bin`
   - `C:\Android\platform-tools`

### Cài đặt Bubblewrap:

```bash
npm install -g @bubblewrap/cli
```

Kiểm tra:
```bash
bubblewrap help
```

## 🏗️ Bước 4: Tạo Project TWA

```bash
# Khởi tạo project TWA
bubblewrap init --manifest="https://your-app.vercel.app/manifest.json"
```

**Trả lời các câu hỏi:**
- **Domain being opened in the TWA:** `your-app.vercel.app`
- **URL path for the app start:** `/`
- **Name of the application:** `Quan Ly Chi Tieu`
- **Short name:** `ChiTieu`
- **Color for status bar:** `#3b82f6`
- **Application ID:** `com.yourname.chitieu` (quan trọng - dùng tên duy nhất)
- **Display mode:** `standalone`
- **Orientation:** `portrait`
- **Icon URL:** `https://your-app.vercel.app/icons/icon-512x512.png`

Lệnh này sẽ tạo thư mục `twa` với các file cần thiết.

## 🔐 Bước 5: Tạo Signing Key

```bash
cd twa

# Tạo keystore (thay YOUR_NAME bằng tên bạn)
keytool -genkey -v -keystore chitieu-release-key.keystore -alias chitieu -keyalg RSA -keysize 2048 -validity 10000
```

**Lưu ý quan trọng:**
- Nhớ password bạn nhập
- Lưu file `.keystore` an toàn - cần để update app sau này
- **KHÔNG** commit file này lên Git

## 🔨 Bước 6: Build APK

```bash
# Build APK debug (test nhanh)
bubblewrap build

# Build APK release (production)
bubblewrap build --release
```

File APK sẽ được tạo tại:
- Debug: `twa/app/build/outputs/apk/debug/app-debug.apk`
- Release: `twa/app/build/outputs/apk/release/app-release.apk`

## 📲 Bước 7: Test APK

### Trên Android Device/Emulator:

```bash
# Cài APK
adb install twa/app/build/outputs/apk/debug/app-debug.apk

# Hoặc copy file APK vào điện thoại và cài thủ công
```

## 🏪 Bước 8: Upload lên Google Play Store

### 8.1. Verify Digital Asset Links

Tạo file `.well-known/assetlinks.json` trong thư mục `public`:

```bash
# Get SHA256 fingerprint
keytool -list -v -keystore chitieu-release-key.keystore -alias chitieu
```

Tạo file `public/.well-known/assetlinks.json`:

\`\`\`json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.yourname.chitieu",
    "sha256_cert_fingerprints": [
      "YOUR_SHA256_FINGERPRINT_HERE"
    ]
  }
}]
\`\`\`

Deploy lại app sau khi thêm file này.

Verify tại: `https://your-app.vercel.app/.well-known/assetlinks.json`

### 8.2. Tạo Google Play Console Account

1. Đăng ký tại: https://play.google.com/console
2. Phí một lần: $25 USD
3. Điền thông tin developer

### 8.3. Upload APK

1. **Create new app** trong Play Console
2. Điền app details (name, description, screenshots, category)
3. Vào **Production** → **Create new release**
4. Upload file `app-release.apk`
5. Fill out content rating questionnaire
6. Set pricing (free/paid)
7. Submit for review

**Thời gian review:** 1-7 ngày

## 🔄 Update App Sau Này

```bash
# Update PWA code
# Deploy lên production
# Build APK mới với version code cao hơn

cd twa
bubblewrap update
bubblewrap build --release

# Upload APK mới lên Play Store
```

## 🐛 Troubleshooting

### Lỗi: "JDK not found"
```bash
# Set JAVA_HOME
setx JAVA_HOME "C:\Program Files\Java\jdk-17"
```

### Lỗi: "Android SDK not found"
```bash
# Set ANDROID_HOME
setx ANDROID_HOME "C:\Android"
```

### Lỗi: "License not accepted"
```bash
sdkmanager --licenses
```

### PWA không hiển thị "Add to Home Screen"
- Kiểm tra app chạy trên HTTPS
- Manifest.json phải accessible
- Service Worker phải register thành công
- Icons phải có đầy đủ sizes

## 📋 Checklist Trước Khi Submit

- [ ] PWA hoạt động hoàn hảo trên production
- [ ] Manifest.json accessible và valid
- [ ] Service Worker hoạt động
- [ ] Icons đầy đủ tất cả sizes
- [ ] assetlinks.json deployed và accessible
- [ ] APK test thành công trên device
- [ ] App không crash khi mở
- [ ] Privacy policy URL (bắt buộc cho Play Store)
- [ ] Screenshots app (ít nhất 2 ảnh)
- [ ] App description viết đầy đủ

## 🎯 Next Steps

Sau khi hoàn thành setup PWA:

1. ✅ Chạy `npm run build` để test
2. ✅ Deploy lên Vercel/Netlify
3. ⏳ Test PWA trên mobile browser
4. ⏳ Cài JDK và Android SDK
5. ⏳ Cài Bubblewrap
6. ⏳ Build APK
7. ⏳ Upload lên Play Store

## 📚 Resources

- [Next-PWA Docs](https://github.com/shadowwalker/next-pwa)
- [Bubblewrap Docs](https://github.com/GoogleChromeLabs/bubblewrap)
- [TWA Guide](https://developer.chrome.com/docs/android/trusted-web-activity/)
- [Play Store Guidelines](https://play.google.com/console/about/guides/app-basics/)

---

**💡 Tips:**
- PWA phải hoạt động tốt trước khi build APK
- Dùng APK debug để test nhanh
- APK release để submit lên Play Store
- Keep keystore file safe - mất là không update được app!

Chúc bạn thành công! 🚀
