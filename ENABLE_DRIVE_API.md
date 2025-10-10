# 🔧 Hướng dẫn Enable Google Drive API

## ❌ Lỗi hiện tại:
```
Google Drive API has not been used in project 745870655061 before or it is disabled
```

## ✅ Cách fix:

### Bước 1: Truy cập Google Cloud Console
1. Mở link: https://console.developers.google.com/apis/api/drive.googleapis.com/overview?project=745870655061
2. Hoặc đi tới: https://console.cloud.google.com/
3. Chọn project: **745870655061**

### Bước 2: Enable Google Drive API
1. Tìm kiếm "Google Drive API" trong search bar
2. Click vào **Google Drive API**
3. Click nút **ENABLE** (Bật)
4. Đợi vài giây để API được kích hoạt

### Bước 3: Verify Permissions
Đảm bảo OAuth consent screen có các scope:
- `https://www.googleapis.com/auth/spreadsheets`
- `https://www.googleapis.com/auth/drive.file`
- `https://www.googleapis.com/auth/userinfo.email`
- `https://www.googleapis.com/auth/userinfo.profile`

### Bước 4: Re-login
1. Logout khỏi app
2. Login lại để có token mới với Drive permission
3. Test tạo expense mới

## 🎯 Kết quả mong đợi:
- App sẽ search được spreadsheet đã tồn tại
- Không tạo duplicate files
- Sử dụng lại file cũ
