# 🔧 Hướng Dẫn Bổ Sung Sheets Còn Thiếu

## ⚠️ Vấn đề

Google Sheet hiện tại chỉ có 2 tabs:
- ✅ Expenses (Chi tiêu)
- ✅ Debts (Khoản nợ)

**Còn thiếu:**
- ❌ RecurringExpenses (Chi tiêu định kỳ)
- ❌ Budgets (Ngân sách)

---

## 🚀 Giải pháp

Tôi đã tạo công cụ tự động để kiểm tra và tạo các sheets còn thiếu.

---

## 📖 Cách sử dụng

### Bước 1: Truy cập trang ensure-sheets
```
https://your-app.vercel.app/ensure-sheets
```

### Bước 2: Đăng nhập (nếu chưa)
- Sử dụng tài khoản Google của bạn

### Bước 3: Click nút "Kiểm tra & Tạo Sheets"
- Tool sẽ tự động:
  1. Kiểm tra các sheets hiện có
  2. Tìm sheets còn thiếu
  3. Tạo sheets mới với headers chuẩn
  4. Hiển thị kết quả

### Bước 4: Xem kết quả
- Nếu thành công, bạn sẽ thấy:
  - ✅ Message xác nhận
  - 📋 Danh sách sheets đã tạo
  - 🔗 Link trực tiếp đến Google Sheet

---

## 📊 Cấu trúc Sheets được tạo

### 1. RecurringExpenses (Chi tiêu định kỳ)

**Headers:**
```
id | title | amount | category | frequency | dayOfMonth | nextDue | isActive
```

**Ví dụ:**
```
1728123456789 | Tiền nhà | 5000000 | Nhà ở | monthly | 5 | 2025-11-05 | true
```

**Tab Color:** 🔵 Light Blue

---

### 2. Budgets (Ngân sách)

**Headers:**
```
id | category | planned | spent | month | createdAt
```

**Ví dụ:**
```
1728234567890 | Ăn uống | 3000000 | 2500000 | 2025-10 | 2025-10-01
```

**Tab Color:** 🟢 Light Green

---

## 🔍 Kiểm tra thủ công

### Cách 1: Qua Google Drive
1. Mở Google Drive
2. Tìm file: `FinTrack - {your-email}`
3. Mở file
4. Kiểm tra các tabs bên dưới

### Cách 2: Qua URL trực tiếp
```
https://docs.google.com/spreadsheets/d/{GOOGLE_SHEET_ID}/edit
```

### Cách 3: Qua API (F12 Console)
```javascript
// Check existing sheets
fetch('/api/ensure-sheets', { method: 'POST' })
  .then(r => r.json())
  .then(data => console.log(data))
```

---

## 🛠️ API Endpoint

### POST /api/ensure-sheets

**Request:**
```bash
curl -X POST https://your-app.vercel.app/api/ensure-sheets \
  -H "Cookie: next-auth.session-token=..."
```

**Response (Success - Sheets created):**
```json
{
  "success": true,
  "message": "Created 2 missing sheet(s)",
  "created": ["RecurringExpenses", "Budgets"],
  "spreadsheetId": "1hNlfw5F48w9paS48mdUK_-T6bCqWPCJAGRTKdrHfLts",
  "spreadsheetUrl": "https://docs.google.com/spreadsheets/d/1hNlfw5F.../edit"
}
```

**Response (Success - All exist):**
```json
{
  "success": true,
  "message": "All required sheets already exist",
  "existing": ["Expenses", "Debts", "RecurringExpenses", "Budgets"],
  "spreadsheetId": "1hNlfw5F48w9paS48mdUK_-T6bCqWPCJAGRTKdrHfLts",
  "spreadsheetUrl": "https://docs.google.com/spreadsheets/d/1hNlfw5F.../edit"
}
```

**Response (Error):**
```json
{
  "error": "Failed to ensure sheets",
  "details": "Error message here"
}
```

---

## 🔒 Security

- ✅ Yêu cầu authentication (session)
- ✅ Chỉ tạo sheets cho user hiện tại
- ✅ Không xóa/sửa sheets hiện có
- ✅ Chỉ thêm sheets còn thiếu

---

## ⚙️ Technical Details

### Code Files:

1. **API Backend:**
   - File: `pages/api/ensure-sheets.js`
   - Function: Check và tạo sheets
   - Uses: Google Sheets API (batchUpdate)

2. **UI Frontend:**
   - File: `pages/ensure-sheets.js`
   - Component: React page với form
   - Features: Loading state, success/error messages

3. **Utilities:**
   - File: `lib/sheetsHelper.js`
   - Functions: getOrCreateSpreadsheet, getSheetsClient

---

## 🧪 Testing

### Test trên localhost:
```bash
npm run dev
# Mở: http://localhost:3000/ensure-sheets
```

### Test trên production:
```bash
# Deploy lên Vercel
git push origin main
# Đợi build hoàn thành
# Truy cập: https://your-app.vercel.app/ensure-sheets
```

---

## ❓ Troubleshooting

### ❌ Error: "Failed to ensure sheets"
**Nguyên nhân:** Lỗi Google API hoặc permissions

**Giải pháp:**
1. Kiểm tra Google Sheets API enabled
2. Verify OAuth scopes:
   ```javascript
   scope: 'https://www.googleapis.com/auth/spreadsheets'
   ```
3. Re-login để refresh token

---

### ❌ Error: "Not authenticated"
**Nguyên nhân:** Session hết hạn

**Giải pháp:**
1. Logout
2. Login lại
3. Retry

---

### ❌ Sheets tạo thành công nhưng không thấy
**Nguyên nhân:** Cache browser hoặc Google Sheets

**Giải pháp:**
1. Hard refresh Google Sheet (Ctrl+F5)
2. Mở trong tab mới
3. Clear cache

---

## 📝 Changelog

### Version 1.0 (2025-10-11)
- ✅ Tạo API endpoint `/api/ensure-sheets`
- ✅ Tạo UI page `/ensure-sheets`
- ✅ Support tự động tạo RecurringExpenses
- ✅ Support tự động tạo Budgets
- ✅ Thêm headers chuẩn cho sheets mới
- ✅ Thêm tab colors (blue/green)
- ✅ Frozen header row
- ✅ Link trực tiếp đến Google Sheet

---

## 🎯 Next Steps

Sau khi tạo sheets thành công:

1. ✅ **Test RecurringExpenses:**
   - Vào trang `/recurring`
   - Thêm khoản định kỳ mới
   - Verify data trong Google Sheet

2. ✅ **Test Budgets:**
   - Vào trang `/budgets`
   - Tạo ngân sách mới
   - Verify data trong Google Sheet

3. ✅ **Test Email Reminders:**
   - Vào trang `/recurring`
   - Click "Test Email Reminder"
   - Kiểm tra email

---

## 📚 Related Documentation

- [DATA_STORAGE_GUIDE.md](./DATA_STORAGE_GUIDE.md) - Chi tiết lưu trữ dữ liệu
- [RECURRING_REMINDERS_COMPLETE.md](./RECURRING_REMINDERS_COMPLETE.md) - Hệ thống nhắc nhở
- [SETUP_GOOGLE_SHEETS.md](./SETUP_GOOGLE_SHEETS.md) - Setup Google Sheets API

---

## 🆘 Support

Nếu gặp vấn đề:
1. Kiểm tra logs trong browser console (F12)
2. Kiểm tra Google Sheet permissions
3. Verify environment variables
4. Contact support

---

**Tóm tắt:**
- 🚀 Tool tự động tạo sheets thiếu
- 🔗 URL: `/ensure-sheets`
- ⚡ 1-click setup
- ✅ Safe & secure

Chúc bạn thành công! 🎉
