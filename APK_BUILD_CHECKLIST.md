# ✅ CHECKLIST: Build APK với Android Studio

## 📋 BƯỚC THỰC HIỆN

### ☐ BƯỚC 1: Download & Install Android Studio (25 phút)

1. ☐ Vào trang download (đã mở sẵn):
   - https://developer.android.com/studio
   
2. ☐ Click "Download Android Studio Otter"

3. ☐ Accept terms → Download (~1.1 GB)

4. ☐ Chạy installer → Install
   - Chọn "Standard" setup
   - Chọn theme
   - Đợi download SDK (~2-3 GB, mất 10-15 phút)

5. ☐ Finish → Đóng Android Studio

---

### ☐ BƯỚC 2: Setup Environment (2 phút)

1. ☐ Mở PowerShell (Admin mode)

2. ☐ Chạy script tự động:
```bash
cd "d:\Work\Obit\Financial-Management-Application-"
powershell -ExecutionPolicy Bypass -File .\setup-android-env.ps1
```

3. ☐ Restart PowerShell

4. ☐ Verify setup:
```bash
java -version      # Phải có output
adb version        # Phải có output  
```

---

### ☐ BƯỚC 3: Build APK (10 phút)

1. ☐ Build và mở Android Studio:
```bash
npm run cap:open
```

2. ☐ Trong Android Studio:
   - Đợi Gradle sync xong (5-10 phút lần đầu)
   - Menu: Build → Build Bundle(s) / APK(s) → Build APK(s)
   - Đợi build (~3-5 phút)
   - Click "locate" khi xong

3. ☐ File APK tại:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

---

### ☐ BƯỚC 4: Install APK (2 phút)

**Option A: USB Cable**
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

**Option B: Transfer file**
- Copy APK vào phone
- Mở file → Install

---

## 🎯 SAU KHI SETUP XONG

Build APK mới chỉ cần:

```bash
npm run cap:build
npm run cap:open
# Build → Build APK
```

Hoặc nhanh hơn:

```bash
npm run apk:build
```

---

## ⏱️ THỜI GIAN DỰ KIẾN

| Công việc | Thời gian |
|-----------|-----------|
| Download Android Studio | 5-10 phút |
| Install Android Studio | 5 phút |
| Download SDK | 10-15 phút |
| Setup environment | 2 phút |
| Build APK lần đầu | 10 phút |
| **TỔNG CỘNG** | **~40-50 phút** |

*Lần build sau chỉ mất 3-5 phút!* ⚡

---

## 📚 TÀI LIỆU

- **Chi tiết đầy đủ:** `ANDROID_STUDIO_SETUP.md`
- **Script tự động:** `setup-android-env.ps1`
- **Build APK guide:** `BUILD_APK_GUIDE.md`

---

## 🐛 NẾU GẶP LỖI

| Lỗi | Giải pháp |
|-----|-----------|
| ANDROID_HOME not set | Chạy lại `setup-android-env.ps1` |
| SDK location not found | Tạo `android/local.properties` |
| Gradle build failed | `cd android && .\gradlew clean` |
| Java version wrong | Dùng Java từ Android Studio |

---

## ✨ HOÀN TẤT!

Sau khi check hết checklist:
- ☐ Có file APK
- ☐ App chạy được trên phone
- ☐ Có thể build APK mới bất cứ lúc nào

**Chúc mừng! Bạn đã master build APK! 🎉**

---

**HIỆN TẠI:**
1. ✅ Trang download đã mở sẵn
2. ✅ Script setup đã sẵn sàng
3. ✅ Hướng dẫn chi tiết đã có
4. ⏳ Đang đợi bạn download & cài Android Studio

**BẮT ĐẦU NGAY!** 🚀
