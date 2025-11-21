# 🚀 Quick APK Build Commands

## Chuẩn bị lần đầu
```bash
# 1. Install dependencies
npm install

# 2. Build web app
npm run build

# 3. Sync với Android
npm run cap:sync
```

## Build APK nhanh (Recommended)
```bash
npm run apk:build
```
📦 APK location: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

## Build APK debug qua Android Studio
```bash
npm run cap:open
```
Trong Android Studio: `Build > Build Bundle(s) / APK(s) > Build APK(s)`

## Update sau khi sửa code
```bash
npm run cap:build
```

## 📱 Install APK
```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

---
📖 Chi tiết xem: `BUILD_APK_GUIDE.md`
