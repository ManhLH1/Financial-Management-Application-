# ✅ XÁC NHẬN: URI cần thêm vào Google Cloud Console

## 🎯 Từ log debug, tôi xác nhận URI chính xác là:

```
http://localhost:3000/api/auth/callback/google
```

---

## 📋 HƯỚNG DẪN CHI TIẾT (TỪNG BƯỚC)

### BƯỚC 1: Mở Google Cloud Console

**Link trực tiếp:**
```
https://console.cloud.google.com/apis/credentials?project=fintrack-474515
```

Copy link trên và paste vào browser, hoặc click nếu đang đọc file này trong browser.

---

### BƯỚC 2: Xác nhận đang ở đúng project

Góc trên cùng bên trái, bạn sẽ thấy:
```
┌─────────────────────────┐
│ Google Cloud            │
│ fintrack-474515  ▼      │ ← Phải là project này
└─────────────────────────┘
```

---

### BƯỚC 3: Tìm OAuth 2.0 Client ID

Trong danh sách "Credentials", tìm mục có dạng:

```
OAuth 2.0 Client IDs
─────────────────────────────────────────────────────
Type: Web application

📱 Web client 1                                [⋮]
   Client ID
   YOUR_CLIENT_ID.apps.googleusercontent.com
   
   Created: ...
   
   [EDIT] [DELETE]                            ← Click EDIT này
```

---

### BƯỚC 4: Click nút EDIT (✏️)

Sẽ mở ra màn hình "Edit OAuth client ID"

---

### BƯỚC 5: Scroll xuống tìm "Authorized redirect URIs"

Bạn sẽ thấy section này:

```
Authorized redirect URIs
─────────────────────────────────────────────────────
URIs này xác định nơi mà OAuth 2.0 server có thể 
gửi responses.

┌──────────────────────────────────────────────┐
│ (Có thể đang trống hoặc có vài URIs khác)   │
│                                              │
└──────────────────────────────────────────────┘

[+ ADD URI]                                    ← Click nút này
```

---

### BƯỚC 6: Click "+ ADD URI"

Sẽ xuất hiện một textbox trống:

```
Authorized redirect URIs
─────────────────────────────────────────────────────

┌──────────────────────────────────────────────┐
│ http://localhost:3000/api/auth/callback/... │ ← Paste vào đây
└──────────────────────────────────────────────┘

[+ ADD URI]
```

---

### BƯỚC 7: Copy và Paste URI chính xác

**Copy URI này (click để select all):**

```
http://localhost:3000/api/auth/callback/google
```

**Paste vào textbox**

**Kiểm tra kỹ:**
- ✅ Bắt đầu bằng `http://` (KHÔNG phải `https://`)
- ✅ Port là `3000`
- ✅ Path là `/api/auth/callback/google`
- ✅ KHÔNG có dấu `/` ở cuối
- ✅ KHÔNG có khoảng trắng ở đầu hoặc cuối

---

### BƯỚC 8: Sau khi paste, sẽ trông như này:

```
Authorized redirect URIs
─────────────────────────────────────────────────────

1 ┌─────────────────────────────────────────────┐
  │ http://localhost:3000/api/auth/callback/   │
  │ google                                      │  [🗑️]
  └─────────────────────────────────────────────┘

[+ ADD URI]
```

---

### BƯỚC 9: Click nút SAVE

Ở cuối trang, bạn sẽ thấy:

```
                                   [CANCEL]  [SAVE]
                                              ↑
                                        Click đây
```

---

### BƯỚC 10: Đợi thông báo thành công

Bạn sẽ thấy thông báo xanh ở góc trên:

```
┌──────────────────────────────────────┐
│ ✓ OAuth client updated successfully  │
└──────────────────────────────────────┘
```

---

### BƯỚC 11: Đợi 5-10 giây

Google cần vài giây để propagate cấu hình mới.

---

## 🧪 TEST NGAY

### 1. Mở trình duyệt mới hoặc Incognito (Ctrl + Shift + N)

### 2. Vào địa chỉ:
```
http://localhost:3001/auth
```
(Hoặc port mà server đang chạy)

### 3. Click "Đăng nhập bằng Google"

### 4. Bạn sẽ thấy màn hình Google:

```
┌─────────────────────────────────────┐
│ Sign in with Google                 │
│                                     │
│ Choose an account                   │
│                                     │
│ 📧 huynhmanhmirco@gmail.com         │ ← Click vào đây
│                                     │
│ Use another account                 │
└─────────────────────────────────────┘
```

### 5. Màn hình xin quyền:

```
┌─────────────────────────────────────┐
│ FinTrack wants to access your       │
│ Google Account                      │
│                                     │
│ This will allow FinTrack to:        │
│                                     │
│ ✓ See, edit, create, and delete    │
│   all your Google Sheets            │
│                                     │
│ ✓ See your email address            │
│                                     │
│ ✓ See your personal info            │
│                                     │
│         [Cancel]  [Allow]           │ ← Click Allow
└─────────────────────────────────────┘
```

### 6. THÀNH CÔNG! 🎉

Bạn sẽ được redirect về Dashboard và thấy:

```
┌──────────────────────────────────────────────────┐
│ Dashboard                huynhmanhmirco@gmail.com│
│                          [Đăng xuất]             │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ ✅ Đã kết nối với Google Sheets. Dữ liệu sẽ     │
│    được lưu vào tài khoản của bạn.               │
└──────────────────────────────────────────────────┘
```

---

## ❌ NẾU VẪN LỖI

### Lỗi vẫn là "redirect_uri_mismatch"

**Nguyên nhân:**
1. URI trong Google Console chưa chính xác
2. Có khoảng trắng thừa
3. Có dấu `/` ở cuối
4. Dùng `https` thay vì `http`

**Giải pháp:**
1. Quay lại Google Console
2. Click Edit lại
3. XÓA URI vừa thêm
4. Thêm lại CHÍNH XÁC: `http://localhost:3000/api/auth/callback/google`
5. Save
6. Clear browser cache (Ctrl + Shift + Delete)
7. Thử lại

---

### Lỗi "Invalid client"

**Kiểm tra file `.env.local`:**

```bash
# Phải có đầy đủ 3 dòng này:
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
```

Nếu thiếu, thêm vào và restart server:
```powershell
cd d:\app-1\web
npm run dev
```

---

### Lỗi "Port already in use"

```powershell
# Kill tất cả node processes
taskkill /IM node.exe /F

# Chạy lại
cd d:\app-1\web
npm run dev
```

---

## 📸 SCREENSHOT CHECKLIST

Để đảm bảo bạn làm đúng, chụp lại màn hình này trong Google Console:

```
Authorized redirect URIs
─────────────────────────────────────
☑ http://localhost:3000/api/auth/callback/google

[+ ADD URI]
```

Và gửi cho tôi nếu vẫn lỗi.

---

## ⏱️ THỜI GIAN DỰ KIẾN

- Thêm URI vào Google Console: **1 phút**
- Đợi Google cập nhật: **10 giây**
- Test đăng nhập: **30 giây**

**Tổng: ~2 phút**

---

## 🎁 SAU KHI ĐĂNG NHẬP THÀNH CÔNG

### Bước tiếp theo:

1. **Tạo Google Spreadsheet**
   - Vào https://sheets.google.com
   - Tạo mới: "Expense Manager Data"
   - Tạo 2 sheets: "Expenses" và "Debts"

2. **Lấy Spreadsheet ID**
   ```
   https://docs.google.com/spreadsheets/d/1Abc...XYZ/edit
                                         ↑ Copy phần này
   ```

3. **Thêm vào .env.local**
   ```
   GOOGLE_SHEET_ID=1Abc...XYZ
   ```

4. **Restart server**
   ```powershell
   # Ctrl + C để stop
   npm run dev
   ```

5. **Test lưu dữ liệu**
   - Vào trang "Chi tiêu"
   - Thêm khoản chi
   - Kiểm tra Google Sheets → Dữ liệu đã được lưu! 🎉

---

## 🚀 READY TO GO!

Bạn có tất cả thông tin cần thiết. Bắt đầu từ **BƯỚC 1** ở trên và follow từng bước!

Good luck! 💪
