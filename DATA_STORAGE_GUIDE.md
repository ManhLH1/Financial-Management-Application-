# 📊 Hướng Dẫn Lưu Trữ Dữ Liệu

## 🗂️ Tổng quan

Ứng dụng Financial Management sử dụng **Google Sheets** làm database chính để lưu trữ tất cả dữ liệu.

---

## 📍 Vị trí lưu trữ

### 1. **Google Sheet ID**
- Được cấu hình trong biến môi trường: `GOOGLE_SHEET_ID`
- Mỗi user có 1 spreadsheet riêng với format tên: `FinTrack - {email}`
- Ví dụ: `FinTrack - huynhmanhmirco@gmail.com`

### 2. **Cấu trúc Sheets (Tabs)**

```
📁 Google Spreadsheet: FinTrack - {email}
├── 📄 Expenses          (Chi tiêu thường)
├── 📄 Debts             (Khoản nợ)
├── 📄 Budgets           (Ngân sách)
└── 📄 RecurringExpenses (Chi tiêu định kỳ) ⭐
```

---

## 🔄 Sheet: RecurringExpenses (Khoản định kỳ)

### Cấu trúc cột (A-H):

| Cột | Tên Field     | Kiểu dữ liệu | Mô tả                           | Ví dụ              |
|-----|---------------|--------------|----------------------------------|-------------------|
| A   | `id`          | String       | Timestamp unique ID             | `1728123456789`   |
| B   | `title`       | String       | Tên khoản chi                   | `Tiền nhà`        |
| C   | `amount`      | Number       | Số tiền                         | `5000000`         |
| D   | `category`    | String       | Danh mục                        | `Nhà ở`           |
| E   | `frequency`   | String       | Tần suất (daily/weekly/monthly) | `monthly`         |
| F   | `dayOfMonth`  | Number       | Ngày trong tháng (1-31)         | `5`               |
| G   | `nextDue`     | Date String  | Ngày đến hạn tiếp theo          | `2025-11-05`      |
| H   | `isActive`    | Boolean      | Trạng thái active               | `true`            |

### Ví dụ dữ liệu thực tế:

```
A                  | B           | C       | D       | E       | F  | G          | H
-------------------|-------------|---------|---------|---------|----|-----------|---------
1728123456789      | Tiền nhà    | 5000000 | Nhà ở   | monthly | 5  | 2025-11-05| true
1728234567890      | Điện nước   | 800000  | Hóa đơn | monthly | 10 | 2025-11-10| true
1728345678901      | Netflix     | 260000  | Giải trí| monthly | 1  | 2025-11-01| true
```

---

## 🔌 API Endpoints

### 1. **GET /api/recurring-expenses**
- **Mục đích**: Lấy tất cả khoản định kỳ
- **Google Sheets Range**: `RecurringExpenses!A2:H`
- **Response**:
```json
{
  "recurringExpenses": [
    {
      "id": "1728123456789",
      "title": "Tiền nhà",
      "amount": 5000000,
      "category": "Nhà ở",
      "frequency": "monthly",
      "dayOfMonth": 5,
      "nextDue": "2025-11-05",
      "isActive": true
    }
  ]
}
```

### 2. **POST /api/recurring-expenses**
- **Mục đích**: Tạo khoản định kỳ mới
- **Body**:
```json
{
  "title": "Tiền điện thoại",
  "amount": 200000,
  "category": "Hóa đơn",
  "frequency": "monthly",
  "dayOfMonth": 1,
  "nextDue": "2025-11-01"
}
```
- **Google Sheets Action**: `APPEND` to `RecurringExpenses!A:H`

### 3. **PUT /api/recurring-expenses**
- **Mục đích**: Cập nhật khoản định kỳ
- **Body**:
```json
{
  "id": "1728123456789",
  "title": "Tiền nhà (updated)",
  "amount": 5500000,
  "isActive": true
}
```
- **Google Sheets Action**: `UPDATE` row matching ID

### 4. **DELETE /api/recurring-expenses?id={id}**
- **Mục đích**: Xóa khoản định kỳ
- **Google Sheets Action**: `DELETE` row matching ID

---

## 🔔 Email Reminder System

### Workflow:

1. **Cron Job** (Daily 9 AM UTC):
   - Endpoint: `/api/cron/recurring-reminders`
   - Auth: Bearer token (`CRON_SECRET`)

2. **Logic**:
   - Query `RecurringExpenses!A2:H`
   - Filter items where `nextDue - today = 3 days`
   - Send email via `sendEmail()` helper

3. **Email Template**:
   - Gradient design với màu sắc
   - Hiển thị: title, amount, category, due date
   - Link đến app

### Manual Test:
```javascript
// Từ trang /recurring
const sendTestReminder = async () => {
  const res = await fetch('/api/recurring-reminders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      testMode: true,
      specificId: '1728123456789' // Optional
    })
  })
}
```

---

## 🔍 Cách truy cập Google Sheet

### Option 1: Qua Google Drive
1. Đăng nhập Google Drive với email của bạn
2. Tìm kiếm: `FinTrack - {your-email}`
3. Click vào spreadsheet
4. Chọn tab **RecurringExpenses**

### Option 2: Trực tiếp qua URL
```
https://docs.google.com/spreadsheets/d/{GOOGLE_SHEET_ID}/edit
```
Thay `{GOOGLE_SHEET_ID}` bằng ID trong file `.env`

### Option 3: Qua App
1. Vào trang `/recurring`
2. Click "Xuất dữ liệu" để download JSON
3. Hoặc dùng F12 → Network tab để xem API response

---

## 🛠️ Troubleshooting

### ❌ Error: "Unable to parse range: RecurringExpenses!A2:H"
**Nguyên nhân**: Sheet "RecurringExpenses" chưa tồn tại trong spreadsheet

**Giải pháp**:
1. Mở Google Sheet của bạn
2. Tạo tab mới tên: `RecurringExpenses`
3. Thêm header row (A1-H1):
   ```
   id | title | amount | category | frequency | dayOfMonth | nextDue | isActive
   ```
4. Refresh app

### ❌ Error: 401 Unauthorized
**Nguyên nhân**: Session hết hạn hoặc thiếu quyền

**Giải pháp**:
1. Logout và login lại
2. Kiểm tra Google Sheets API enabled
3. Verify scopes trong NextAuth config:
   ```javascript
   scope: 'openid email profile https://www.googleapis.com/auth/spreadsheets'
   ```

### ❌ Data không đồng bộ
**Nguyên nhân**: Cache cũ trong localStorage

**Giải pháp**:
```javascript
// Clear cache
localStorage.removeItem('recurring_cache')
localStorage.removeItem('data_cache_timestamp')
// Refresh page
location.reload()
```

---

## 📦 Backup & Export

### Auto Backup (qua API):
```bash
GET /api/backup
```
Response sẽ bao gồm:
- Expenses
- Debts
- Budgets
- **RecurringExpenses** ⭐

### Manual Export:
1. Vào Google Sheet
2. File → Download → Excel (.xlsx) hoặc CSV
3. Hoặc dùng Google Takeout để backup toàn bộ Drive

---

## 🔐 Security

### Environment Variables Required:
```env
GOOGLE_SHEET_ID=1hNlfw5F48w9paS48mdUK_-T6bCqWPCJAGRTKdrHfLts
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-secret
NEXTAUTH_SECRET=your-nextauth-secret
CRON_SECRET=your-cron-secret

# For email reminders
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Permissions:
- User chỉ truy cập được spreadsheet của chính họ
- OAuth2 token được manage bởi NextAuth
- Cron job dùng Service Account (read-only recommended)

---

## 📚 Related Files

### Backend:
- `/pages/api/recurring-expenses.js` - CRUD operations
- `/pages/api/recurring-reminders.js` - Email reminders
- `/pages/api/cron/recurring-reminders.js` - Automated cron
- `/lib/sheetsHelper.js` - Google Sheets utilities
- `/lib/emailHelper.js` - Email sending logic

### Frontend:
- `/pages/recurring.js` - UI page
- `/lib/mobileHelpers.js` - formatMobileCurrency()

### Config:
- `vercel.json` - Cron schedule
- `.env.local` - Environment variables
- `next.config.js` - Next.js config

---

## 📊 Data Flow Diagram

```
┌─────────────┐
│   Browser   │
│  /recurring │
└──────┬──────┘
       │
       │ GET /api/recurring-expenses
       │
       ▼
┌─────────────────────────┐
│   Next.js API Route     │
│  recurring-expenses.js  │
└──────────┬──────────────┘
           │
           │ Google Sheets API
           │ spreadsheets.values.get()
           │
           ▼
┌──────────────────────────────┐
│      Google Sheets           │
│  📄 RecurringExpenses Tab    │
│  ┌────┬─────┬────────┬──┐   │
│  │ id │title│ amount │..│   │
│  ├────┼─────┼────────┼──┤   │
│  │1728│Nhà  │5000000 │..│   │
│  │1729│Điện │ 800000 │..│   │
│  └────┴─────┴────────┴──┘   │
└──────────────────────────────┘
```

---

## 🎯 Summary

**Data khoản định kỳ được lưu ở:**
1. ✅ **Google Sheets** - Tab `RecurringExpenses`
2. ✅ **Range**: `A2:H` (8 cột)
3. ✅ **API**: `/api/recurring-expenses`
4. ✅ **Cache**: localStorage (5 phút)
5. ✅ **Backup**: `/api/backup` endpoint

**Để xem data:**
- UI: https://your-app.vercel.app/recurring
- Google Sheet: Tìm file `FinTrack - {email}` trong Drive
- API: GET https://your-app.vercel.app/api/recurring-expenses

---

Cần thêm thông tin gì liên hệ! 📨
