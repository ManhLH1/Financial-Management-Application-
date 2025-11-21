# 📱 Hướng dẫn Build APK cho Financial Manager

## 🎯 Tổng quan
Dự án này đã được cấu hình với Capacitor để có thể build thành APK cho Android.

## ⚙️ Yêu cầu hệ thống

### 1. **Android Studio**
- Tải và cài đặt [Android Studio](https://developer.android.com/studio)
- Trong Android Studio, cài đặt:
  - Android SDK (API 33 trở lên)
  - Android SDK Build-Tools
  - Android Emulator (tùy chọn - để test)

### 2. **Java Development Kit (JDK)**
- Tải và cài đặt [JDK 17](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html)
- Thiết lập biến môi trường `JAVA_HOME`

### 3. **Gradle** (Tự động cài với Android Studio)
- Gradle sẽ được tự động cài khi mở project Android

## 🚀 Các bước build APK

### Phương pháp 1: Build tự động (Khuyến nghị)

```bash
# Chạy lệnh để build và sync
npm run apk:build
```

**Lưu ý:** Lệnh này sẽ:
1. Build Next.js app thành static files
2. Sync files vào Android project
3. Build APK release

File APK sẽ được tạo tại:
```
android/app/build/outputs/apk/release/app-release-unsigned.apk
```

### Phương pháp 2: Build thủ công (Chi tiết hơn)

#### Bước 1: Build web app
```bash
npm run build
```

#### Bước 2: Sync với Capacitor
```bash
npm run cap:sync
```

#### Bước 3: Mở Android Studio
```bash
npm run cap:open
```

#### Bước 4: Build APK trong Android Studio
1. Trong Android Studio, chọn **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**
2. Đợi build hoàn tất
3. APK sẽ ở: `android/app/build/outputs/apk/debug/app-debug.apk`

### Phương pháp 3: Build APK release với Gradle

```bash
# Trên Windows
cd android
.\gradlew assembleRelease

# Trên Mac/Linux
cd android
./gradlew assembleRelease
```

File APK release sẽ ở:
```
android/app/build/outputs/apk/release/app-release-unsigned.apk
```

## 🔐 Ký APK (Sign APK)

### Tạo keystore

```bash
keytool -genkey -v -keystore financial-manager.keystore -alias financial-manager -keyalg RSA -keysize 2048 -validity 10000
```

### Cấu hình signing trong `android/app/build.gradle`

Thêm vào file `android/app/build.gradle`:

```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file("financial-manager.keystore")
            storePassword "YOUR_STORE_PASSWORD"
            keyAlias "financial-manager"
            keyPassword "YOUR_KEY_PASSWORD"
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Build APK đã ký

```bash
cd android
.\gradlew assembleRelease
```

File APK đã ký sẽ ở:
```
android/app/build/outputs/apk/release/app-release.apk
```

## 📦 Cài đặt APK

### Trên thiết bị thật:
1. Bật **Developer Options** và **USB Debugging**
2. Kết nối thiết bị với máy tính
3. Chạy:
```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

### Trên emulator:
1. Khởi động emulator từ Android Studio
2. Kéo thả file APK vào emulator

## 🛠️ Các lệnh hữu ích

```bash
# Sync code sau khi thay đổi web app
npm run cap:sync

# Build web app và sync
npm run cap:build

# Mở Android Studio
npm run cap:open

# Build APK debug
cd android && .\gradlew assembleDebug

# Build APK release
cd android && .\gradlew assembleRelease

# Clean build
cd android && .\gradlew clean

# Xem danh sách thiết bị kết nối
adb devices

# Cài đặt APK lên thiết bị
adb install path/to/app.apk
```

## 🐛 Xử lý lỗi thường gặp

### Lỗi: "JAVA_HOME is not set"
```bash
# Windows
setx JAVA_HOME "C:\Program Files\Java\jdk-17"

# Mac/Linux
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home
```

### Lỗi: "SDK location not found"
Tạo file `android/local.properties`:
```
sdk.dir=C:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk
```

### Lỗi: Build failed với Gradle
```bash
# Clean và rebuild
cd android
.\gradlew clean
.\gradlew assembleRelease
```

### Lỗi: Permission denied
```bash
# Trên Mac/Linux
chmod +x android/gradlew
```

## 📱 Thông tin APK

- **App Name:** Financial Manager
- **Package ID:** com.financial.manager
- **Min SDK:** 22 (Android 5.1)
- **Target SDK:** 33 (Android 13)

## 🎨 Icons & Splash Screen

Icons và splash screen đã được cấu hình với:
- **Background color:** #020617 (Dark blue)
- **Spinner color:** #6366f1 (Indigo)

Để thay đổi icons, update files trong:
```
android/app/src/main/res/
```

## 📝 Notes

- APK unsigned chỉ dùng để test, không thể upload lên Google Play Store
- APK signed có thể upload lên Play Store hoặc phân phối trực tiếp
- Luôn test APK trên thiết bị thật trước khi phát hành
- Cập nhật version code trong `android/app/build.gradle` trước mỗi lần build mới

## 📚 Tài liệu tham khảo

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Android Build Guide](https://developer.android.com/studio/build)
- [Signing Your App](https://developer.android.com/studio/publish/app-signing)

---

**Version:** 1.0.0  
**Last Updated:** 2025-11-21
