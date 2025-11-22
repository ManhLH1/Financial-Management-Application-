# 📱 HƯỚNG DẪN CÀI ANDROID STUDIO & BUILD APK

## 🎯 MỤC TIÊU
Sau khi hoàn thành, bạn sẽ có thể build APK bất cứ lúc nào chỉ với 1 lệnh!

---

## BƯỚC 1: DOWNLOAD ANDROID STUDIO

### 1.1 Tải Android Studio

**Link download:** https://developer.android.com/studio

- Chọn phiên bản Windows
- File size: ~1.1 GB
- Thời gian download: 5-15 phút (tùy mạng)

### 1.2 Yêu cầu hệ thống

- ✅ Windows 10/11 64-bit
- ✅ RAM: 8GB+ (khuyến nghị 16GB)
- ✅ Dung lượng: 8GB+ trống
- ✅ Java JDK (tự động cài với Android Studio)

---

## BƯỚC 2: CÀI ĐẶT ANDROID STUDIO

### 2.1 Chạy installer

1. Double-click file `android-studio-XXX.exe`
2. Click "Next"
3. Chọn components (giữ mặc định):
   - ✅ Android Studio
   - ✅ Android Virtual Device
4. Click "Next" → "Install"

### 2.2 Setup wizard (Lần đầu mở)

1. Click "Next" ở màn hình welcome
2. Chọn "Standard" setup
3. Chọn theme (Light/Dark - tùy thích)
4. Click "Next"
5. **QUAN TRỌNG:** Đợi download SDK components
   - Size: ~2-3 GB
   - Thời gian: 10-20 phút
   - ☕ Uống cafe trong lúc đợi!

### 2.3 Verify SDK installation

Sau khi SDK download xong:
1. Click "Finish"
2. Android Studio sẽ mở
3. Đóng Android Studio lại

---

## BƯỚC 3: SETUP BIẾN MÔI TRƯỜNG

### 3.1 Tìm Android SDK location

Mặc định: `C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk`

### 3.2 Thêm biến môi trường

**Cách 1: Tự động (PowerShell Script)**

Chạy script tôi tạo sẵn:
```powershell
.\setup-android-env.ps1
```

**Cách 2: Thủ công**

1. Mở "Environment Variables"
   - Win + R → `sysdm.cpl` → Advanced → Environment Variables
   
2. Thêm System Variables mới:
   - **ANDROID_HOME**: `C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk`
   - **JAVA_HOME**: `C:\Program Files\Android\Android Studio\jbr`

3. Thêm vào PATH:
   - `%ANDROID_HOME%\platform-tools`
   - `%ANDROID_HOME%\tools`
   - `%ANDROID_HOME%\tools\bin`

4. Click OK → OK → OK

5. **Khởi động lại PowerShell/CMD**

---

## BƯỚC 4: VERIFY INSTALLATION

Mở PowerShell mới và test:

```bash
# Check Java
java -version
# Nên hiện: openjdk version "17..." hoặc "11..."

# Check Android SDK
echo $env:ANDROID_HOME
# Nên hiện: C:\Users\...\Android\Sdk

# Check ADB
adb version
# Nên hiện: Android Debug Bridge version...
```

Nếu tất cả đều OK → Bạn đã setup thành công! ✅

---

## BƯỚC 5: BUILD APK LẦN ĐẦU

### 5.1 Build và mở Android Studio

```bash
npm run cap:open
```

Lệnh này sẽ:
1. Build Next.js app
2. Sync với Capacitor
3. Mở project trong Android Studio

### 5.2 Trong Android Studio

1. Đợi Gradle sync xong (5-10 phút lần đầu)
   - Progress bar ở dưới cùng
   - Đợi đến khi hết "Building..."

2. Build APK:
   - Menu: **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**
   - Hoặc: **Build** > **Generate Signed Bundle / APK**

3. Đợi build (3-5 phút)

4. Khi xong, click **locate** để mở folder chứa APK

### 5.3 Vị trí file APK

```
android/app/build/outputs/apk/debug/app-debug.apk
```

hoặc

```
android/app/build/outputs/apk/release/app-release-unsigned.apk
```

---

## BƯỚC 6: BUILD APK NHANH (SAU KHI ĐÃ SETUP)

Từ lần sau, chỉ cần:

### Option A: Qua Android Studio
```bash
npm run cap:build
npm run cap:open
# Build > Build APK
```

### Option B: Command line (nhanh hơn)
```bash
npm run cap:build
cd android
.\gradlew assembleRelease
```

File APK tại: `android/app/build/outputs/apk/release/app-release.apk`

---

## BƯỚC 7: INSTALL APK VÀO ĐIỆN THOẠI

### Cách 1: USB Cable

1. Bật USB Debugging trên phone:
   - Settings → About phone → Tap "Build number" 7 lần
   - Settings → Developer options → USB Debugging ON

2. Kết nối phone với máy tính

3. Run APK:
```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

### Cách 2: Transfer file

1. Copy file APK vào phone (USB/Google Drive/Telegram)
2. Mở file APK trên phone
3. Install
4. Done!

---

## 🎯 TÓM TẮT COMMANDS

```bash
# Build web + open Android Studio
npm run cap:open

# Build web + sync (không mở Studio)
npm run cap:build

# Build APK qua Gradle
cd android && .\gradlew assembleRelease

# Install APK lên phone
adb install path/to/app.apk

# Check devices
adb devices
```

---

## ⚡ SHORTCUTS

Tạo file `build-apk.bat`:
```batch
@echo off
echo Building APK...
call npm run build
call npx cap sync
cd android
call gradlew assembleRelease
echo APK ready at: android\app\build\outputs\apk\release\
pause
```

Chạy: Double-click `build-apk.bat` → Có APK!

---

## 🐛 TROUBLESHOOTING

### Lỗi: "ANDROID_HOME is not set"
→ Thiết lập lại biến môi trường (Bước 3)

### Lỗi: "SDK location not found"
→ Tạo file `android/local.properties`:
```
sdk.dir=C:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk
```

### Lỗi: Gradle build failed
→ Chạy:
```bash
cd android
.\gradlew clean
.\gradlew assembleRelease
```

### APK không install được
→ Dùng APK signed (xem phần Sign APK trong BUILD_APK_GUIDE.md)

---

## ✅ CHECKLIST

- [ ] Downloaded Android Studio
- [ ] Installed Android Studio
- [ ] Downloaded SDK components
- [ ] Setup environment variables
- [ ] Verified with `java -version` và `adb version`
- [ ] Ran `npm run cap:open` successfully
- [ ] Built APK in Android Studio
- [ ] Found APK file
- [ ] Installed on phone
- [ ] App works! 🎉

---

## 🎊 HOÀN THÀNH!

Giờ bạn có thể build APK bất cứ lúc nào chỉ với:

```bash
npm run cap:open
# Build > Build APK
```

Hoặc:

```bash
npm run apk:build
```

**Chúc mừng! Bạn đã có môi trường build APK hoàn chỉnh!** 🚀

---

**Thời gian ước tính:**
- Download Android Studio: 10 phút
- Cài đặt: 5 phút  
- Download SDK: 15 phút
- Setup biến môi trường: 2 phút
- Build APK lần đầu: 10 phút
- **TỔNG: ~40-50 phút** (chủ yếu là download)

---

**Sau khi setup xong, build APK mới chỉ mất 3-5 phút!** ⚡
