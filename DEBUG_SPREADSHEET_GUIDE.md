# 🔍 Debug Tính Năng Tạo Google Spreadsheet

## ✅ Tính năng đã được implement

Tính năng tự động tạo Google Spreadsheet **ĐÃ CÓ** trong code và hoạt động tự động.

## 📋 Cách hoạt động

### 1. **Tự động tạo khi login lần đầu**

Khi bạn đăng nhập lần đầu, hệ thống sẽ:
- Kiểm tra `GOOGLE_SHEET_ID` trong `.env.local`
- Nếu không có hoặc invalid → **Tự động tạo spreadsheet mới**
- Lưu spreadsheet ID vào file `.data/spreadsheets.json`

### 2. **Kiểm tra và tạo sheets tự động**

File: `lib/sheetsHelper.js` - Function: `getOrCreateSpreadsheet()`

```javascript
// Tự động:
- Kiểm tra spreadsheet có tồn tại không
- Tạo mới nếu không tồn tại
- Tạo sheets: Expenses, Debts, Deleted_Log
- Initialize headers tự động
- Migrate data structure nếu cần
```

### 3. **Mapping per-user**

Mỗi user có spreadsheet riêng, được lưu trong:
```
.data/spreadsheets.json
```

Format:
```json
{
  "user@gmail.com": "spreadsheet-id-1",
  "user2@gmail.com": "spreadsheet-id-2"
}
```

## 🧪 Test tính năng

### Cách 1: Sử dụng trang Debug

1. **Truy cập trang debug:**
   ```
   http://localhost:3000/debug-spreadsheet
   ```

2. **Các nút test:**
   - **📋 Kiểm tra Spreadsheet** - Check spreadsheet hiện tại
   - **➕ Tạo mới Spreadsheet** - Force tạo spreadsheet mới
   - **🧪 Test Expenses API** - Test API có tự động tạo không

### Cách 2: Test trực tiếp qua API

**Check spreadsheet:**
```bash
curl http://localhost:3000/api/debug-spreadsheet
```

**Tạo mới:**
```bash
curl -X POST http://localhost:3000/api/debug-spreadsheet
```

### Cách 3: Test tự nhiên

1. Đăng xuất (nếu đã login)
2. Xóa/comment dòng `GOOGLE_SHEET_ID` trong `.env.local`
3. Đăng nhập lại
4. Vào trang Expenses
5. Hệ thống sẽ **tự động tạo spreadsheet mới**

## ⚠️ Các vấn đề có thể gặp

### 1. **Access Token hết hạn**

**Triệu chứng:**
- Lỗi 401 hoặc 403
- "Invalid credentials"

**Giải pháp:**
```javascript
// NextAuth đã có token refresh tự động
// Chỉ cần đăng xuất và đăng nhập lại
```

### 2. **Thiếu permissions**

**Triệu chứng:**
- "Insufficient permissions"
- "The caller does not have permission"

**Giải pháp:**
- Đăng xuất
- Đăng nhập lại
- Approve quyền `https://www.googleapis.com/auth/spreadsheets`

### 3. **Spreadsheet bị xóa**

**Triệu chứng:**
- Error 404 "Spreadsheet not found"

**Giải pháp:**
```javascript
// Hệ thống tự động phát hiện và tạo mới
// Hoặc dùng nút "➕ Tạo mới Spreadsheet"
```

### 4. **Rate Limit**

**Triệu chứng:**
- "Quota exceeded"
- "Rate limit exceeded"

**Giải pháp:**
- Đợi vài phút
- Giảm tần suất requests

## 🔧 Code locations

### Main function: `getOrCreateSpreadsheet()`
**File:** `lib/sheetsHelper.js` (lines 40-150)

**Logic:**
```javascript
1. Đọc mapping từ file .data/spreadsheets.json
2. Fallback to process.env.GOOGLE_SHEET_ID
3. Nếu không có → Create new spreadsheet
4. Verify spreadsheet exists
5. Check & create missing sheets
6. Ensure headers
7. Return spreadsheet ID
```

### API endpoints sử dụng:
- `/api/expenses.js` - line 25
- `/api/debts.js` - line 25
- `/api/check-warnings.js` - line 22

### Debug endpoints (MỚI):
- `/api/debug-spreadsheet.js` - GET/POST
- `/debug-spreadsheet` - UI page

## 📊 Flow chart

```
User Login
    ↓
API Call (GET /api/expenses)
    ↓
getOrCreateSpreadsheet(accessToken, email)
    ↓
Check mapping file → Check env var
    ↓
    ├─ Has ID? → Verify spreadsheet exists
    │              ↓
    │              ├─ Exists? → Return ID
    │              └─ Not found? → Create new
    │
    └─ No ID? → Create new spreadsheet
                    ↓
                Initialize sheets & headers
                    ↓
                Save to mapping file
                    ↓
                Return new ID
```

## 🎯 Checklist hoạt động

- [x] Function `getOrCreateSpreadsheet()` implemented
- [x] Auto-create spreadsheet if not exists
- [x] Auto-create missing sheets (Expenses, Debts)
- [x] Auto-initialize headers
- [x] Per-user mapping system
- [x] Token refresh mechanism
- [x] Error handling & recovery
- [x] Debug UI page created
- [x] Debug API endpoint created

## 🚀 Test ngay

### Bước 1: Khởi động server
```powershell
npm run dev
```

### Bước 2: Truy cập debug page
```
http://localhost:3000/debug-spreadsheet
```

### Bước 3: Test các tính năng
1. Click "📋 Kiểm tra Spreadsheet"
2. Xem kết quả
3. Click "➕ Tạo mới Spreadsheet" nếu muốn tạo mới
4. Copy Spreadsheet ID và thêm vào `.env.local`

### Bước 4: Verify
- Mở link Google Sheets được hiển thị
- Kiểm tra có 3 sheets: Expenses, Debts, Deleted_Log
- Kiểm tra headers đã được tạo

## 💡 Tips

1. **Mỗi user nên có spreadsheet riêng** để tránh conflict
2. **Backup spreadsheet ID** vào .env.local
3. **Không share spreadsheet ID** giữa nhiều users
4. **Check logs** trong terminal để debug
5. **Dùng debug page** để troubleshoot

---

## 📝 Kết luận

✅ **Tính năng TẠO GOOGLE SPREADSHEET đã hoạt động**

Nếu gặp vấn đề:
1. Vào `/debug-spreadsheet`
2. Click test buttons
3. Xem error messages
4. Follow hướng dẫn fix

**Tính năng đã sẵn sàng sử dụng! 🎉**
