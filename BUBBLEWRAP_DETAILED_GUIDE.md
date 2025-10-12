# 📦 Hướng Dẫn Chi Tiết: Build APK với Bubblewrap

## 📋 Yêu Cầu Trước Khi Bắt Đầu

### ✅ Checklist:

- [ ] PWA đã deploy lên production với HTTPS
- [ ] URL production: ________________
- [ ] Manifest.json accessible tại: `https://your-domain.com/manifest.json`
- [ ] Service Worker hoạt động
- [ ] Test PWA trên mobile browser thành công

## 🔧 Cài Đặt Dependencies

### 1. Java Development Kit (JDK)

**Windows - Cách 1: Chocolatey (Khuyến nghị)**

```powershell
# Cài Chocolatey nếu chưa có
# https://chocolatey.org/install

# Cài JDK
choco install openjdk17
```

**Windows - Cách 2: Manual**

1. Download từ: https://adoptium.net/
2. Chọn OpenJDK 17 (LTS)
3. Cài đặt và thêm vào PATH

**Verify:**

```bash
java -version
# Should show: openjdk version "17.x.x"
```

**Set JAVA_HOME (nếu cần):**

```powershell
# PowerShell
[System.Environment]::SetEnvironmentVariable('JAVA_HOME', 'C:\Program Files\Eclipse Adoptium\jdk-17.0.x-hotspot', 'Machine')
```

### 2. Android Command Line Tools

**Bước 1: Download**

Tải từ: https://developer.android.com/studio#command-tools
- Chọn: **Command line tools only**
- Windows: `commandlinetools-win-xxx_latest.zip`

**Bước 2: Giải nén**

```powershell
# Tạo thư mục
New-Item -ItemType Directory -Path C:\Android\cmdline-tools

# Giải nén vào C:\Android\cmdline-tools\latest
# Cấu trúc: C:\Android\cmdline-tools\latest\bin\sdkmanager.bat
```

**Bước 3: Thêm vào PATH**

```powershell
# PowerShell (Admin)
$androidPath = "C:\Android\cmdline-tools\latest\bin;C:\Android\platform-tools"
[System.Environment]::SetEnvironmentVariable('Path', $env:Path + ";$androidPath", 'Machine')

# Set ANDROID_HOME
[System.Environment]::SetEnvironmentVariable('ANDROID_HOME', 'C:\Android', 'Machine')
```

**Bước 4: Cài SDK Components**

```bash
# Mở PowerShell mới
sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.0"

# Accept licenses
sdkmanager --licenses
# Gõ 'y' cho tất cả
```

**Verify:**

```bash
adb version
# Should show: Android Debug Bridge version...
```

### 3. Cài Bubblewrap

```bash
npm install -g @bubblewrap/cli
```

**Verify:**

```bash
bubblewrap --version
```

## 🚀 Build APK - Từng Bước

### Bước 1: Khởi Tạo TWA Project

```bash
# CD vào thư mục project
cd D:\My-Fi1n\Financial-Management-Application-

# Init TWA
bubblewrap init --manifest="https://YOUR-DOMAIN.vercel.app/manifest.json"
```

**Trả lời các câu hỏi:**

```
? Domain being opened in the TWA: 
  → YOUR-DOMAIN.vercel.app

? URL path for the app start:
  → / (để trống, nhấn Enter)

? Name of the application:
  → Quan Ly Chi Tieu

? Short name:
  → ChiTieu

? Color for the status bar:
  → #3b82f6 (hoặc màu bạn thích)

? Color for the splash screen background:
  → #ffffff

? Application ID (must be unique):
  → com.yourname.chitieu
  (Thay 'yourname' bằng tên bạn, ví dụ: com.john.chitieu)

? Display mode:
  → standalone

? Orientation:
  → portrait

? Icon URL:
  → https://YOUR-DOMAIN.vercel.app/icons/icon-512x512.png

? Fallback behavior:
  → customtabs

? Enable site settings shortcut?
  → No

? Maskable icon URL:
  → (để trống, nhấn Enter)

? Monochrome icon URL:
  → (để trống, nhấn Enter)

? Include app shortcuts?
  → No
```

Bubblewrap sẽ tạo thư mục `twa/` với cấu trúc Android project.

### Bước 2: Verify twa-manifest.json

```bash
cd twa
cat twa-manifest.json
```

Kiểm tra các thông tin đúng chưa. Nếu cần sửa:

```bash
# Edit file
notepad twa-manifest.json

# Update project
bubblewrap update
```

### Bước 3: Build APK Debug (Test)

```bash
# Từ trong thư mục twa/
bubblewrap build
```

**Output:** `app/build/outputs/apk/debug/app-debug.apk`

**Nếu gặp lỗi "Gradle build failed":**

```bash
# Thử với Java heap size lớn hơn
$env:JAVA_OPTS="-Xmx2048m"
bubblewrap build
```

### Bước 4: Test APK

**Cách 1: Android Emulator**

```bash
# List devices
adb devices

# Install
adb install app/build/outputs/apk/debug/app-debug.apk
```

**Cách 2: Physical Device**

1. Bật Developer Options trên điện thoại
2. Bật USB Debugging
3. Connect USB
4. Run `adb install...`

**Cách 3: Copy APK**

Copy file `app-debug.apk` vào điện thoại và cài thủ công.

### Bước 5: Tạo Keystore cho Release

```bash
# Từ trong thư mục twa/
keytool -genkey -v -keystore chitieu-release.keystore -alias chitieu-key -keyalg RSA -keysize 2048 -validity 10000
```

**Câu hỏi:**

```
Enter keystore password: [Nhập password - LƯU LẠI]
Re-enter new password: [Nhập lại]

What is your first and last name?
  → Your Name

What is the name of your organizational unit?
  → Personal

What is the name of your organization?
  → Personal

What is the name of your City or Locality?
  → Your City

What is the name of your State or Province?
  → Your State

What is the two-letter country code for this unit?
  → VN

Is CN=..., correct?
  → yes

Enter key password for <chitieu-key>
  → [Nhấn Enter để dùng password giống keystore]
```

**⚠️ QUAN TRỌNG:**

- Lưu file `.keystore` an toàn
- Lưu password
- **KHÔNG** commit vào Git
- Cần để update app sau này

### Bước 6: Build APK Release

```bash
bubblewrap build --release
```

Bubblewrap sẽ hỏi đường dẫn keystore và passwords.

**Output:** `app/build/outputs/apk/release/app-release.apk`

### Bước 7: Get SHA256 Fingerprint

```bash
keytool -list -v -keystore chitieu-release.keystore -alias chitieu-key
```

Tìm dòng:
```
SHA256: AA:BB:CC:DD:...
```

Copy SHA256 này.

### Bước 8: Tạo assetlinks.json

Tạo file `public/.well-known/assetlinks.json`:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.yourname.chitieu",
    "sha256_cert_fingerprints": [
      "AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99"
    ]
  }
}]
```

Thay `package_name` và `sha256_cert_fingerprints` bằng giá trị thực.

**Deploy lại app:**

```bash
# Từ thư mục gốc
git add public/.well-known/assetlinks.json
git commit -m "Add assetlinks for TWA"
git push

# Vercel tự động deploy
```

**Verify:**

```bash
curl https://YOUR-DOMAIN.vercel.app/.well-known/assetlinks.json
```

## 📤 Upload lên Google Play Store

### Bước 1: Tạo Tài Khoản Developer

1. Truy cập: https://play.google.com/console/signup
2. Phí: $25 USD (một lần)
3. Điền thông tin

### Bước 2: Tạo App

1. Click **Create app**
2. Điền:
   - **App name**: Quản Lý Chi Tiêu
   - **Default language**: Vietnamese
   - **App or game**: App
   - **Free or paid**: Free

### Bước 3: Complete Store Listing

**App details:**
- Short description (80 chars)
- Full description (4000 chars)
- App icon (512x512)
- Feature graphic (1024x500)
- Phone screenshots (ít nhất 2)

**Contact details:**
- Email
- Phone (optional)
- Website

**Privacy policy:**
- URL tới privacy policy (bắt buộc)

### Bước 4: Content Rating

1. Vào **Content rating**
2. Chọn category: Productivity
3. Trả lời questionnaire
4. Submit

### Bước 5: Create Release

1. Vào **Production** → **Create new release**
2. Upload `app-release.apk`
3. Release name: `1.0`
4. Release notes:
   ```
   - Phiên bản đầu tiên
   - Quản lý chi tiêu cá nhân
   - Sync với Google Sheets
   ```
5. Save → Review release → Start rollout

### Bước 6: Chờ Review

- Thời gian: 1-7 ngày
- Google sẽ gửi email thông báo

## 🔄 Update App Sau Này

```bash
# 1. Update code PWA
# 2. Deploy lên production

# 3. Update TWA
cd twa
bubblewrap update

# 4. Increment version trong twa-manifest.json
notepad twa-manifest.json
# Edit: "versionCode": 2, "versionName": "1.1"

# 5. Build release mới
bubblewrap build --release

# 6. Upload APK mới lên Play Console
```

## 🐛 Troubleshooting Common Issues

### Build Failed: "Could not find or load main class"

```bash
# Reinstall Gradle
cd twa
rmdir /s .gradle
bubblewrap build
```

### "ANDROID_HOME not set"

```powershell
[System.Environment]::SetEnvironmentVariable('ANDROID_HOME', 'C:\Android', 'Machine')
# Restart terminal
```

### "License not accepted"

```bash
sdkmanager --licenses
# Press 'y' for all
```

### APK cài được nhưng không mở được

- Check assetlinks.json accessible
- Check package name match
- Check SHA256 fingerprint đúng
- Test với debug APK trước

### "App not approved for production"

Reasons thường gặp:
- Thiếu privacy policy
- Screenshots không đủ
- App description không rõ ràng
- Content rating chưa complete

## 📱 Test Checklist

Trước khi submit Play Store:

- [ ] APK cài được trên device
- [ ] App mở được
- [ ] Không crash khi launch
- [ ] Navigation hoạt động
- [ ] Offline mode works
- [ ] Icons hiển thị đúng
- [ ] assetlinks.json verify OK
- [ ] Privacy policy URL works
- [ ] Screenshots captured

## 📚 Resources

- [Bubblewrap GitHub](https://github.com/GoogleChromeLabs/bubblewrap)
- [TWA Guide](https://developer.chrome.com/docs/android/trusted-web-activity/)
- [Play Console Help](https://support.google.com/googleplay/android-developer)
- [assetlinks.json Generator](https://developers.google.com/digital-asset-links/tools/generator)

## 💡 Tips

1. **Test debug APK thoroughly** trước khi build release
2. **Backup keystore file** - mất là không update được app
3. **Version codes** phải tăng dần: 1, 2, 3...
4. **Keep passwords safe** - lưu vào password manager
5. **Test assetlinks** trước khi submit Play Store

---

**Chúc bạn thành công!** 🎉

Nếu gặp vấn đề, check [Troubleshooting](#-troubleshooting-common-issues) section hoặc search error trên Google.
