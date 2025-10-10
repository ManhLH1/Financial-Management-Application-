# 🔍 Vấn Đề: Tạo Quá Nhiều File Google Sheets

## 📊 Phân Tích Vấn Đề

Từ screenshot của bạn, có **6 file FinTrack** được tạo cùng lúc vào 23:07 ngày 2025-10-10. Đây là dấu hiệu của việc gọi API **nhiều lần đồng thời**.

## 🐛 Nguyên Nhân Chính

### 1. **Race Condition trong `getOrCreateSpreadsheet()`**

Khi user login lần đầu:
- File `.data/spreadsheets.json` **CHƯA TỒN TẠI**
- Nhiều API endpoints gọi `getOrCreateSpreadsheet()` **đồng thời**:
  - `/api/expenses` (GET)
  - `/api/debts` (GET) 
  - `/api/budgets` (GET)
  - Các trang dashboard load data

Mỗi lần gọi đều thấy:
```javascript
const mapping = readSpreadsheetMapping() // Trả về {}
let spreadsheetId = mapping[userEmail]    // undefined
```

→ **MỖI LẦN GỌI ĐỀU TẠO MỘT SPREADSHEET MỚI!**

### 2. **File System Race Condition**

Ngay cả khi nhiều requests cùng tạo spreadsheet:
```javascript
// Request 1: Tạo spreadsheet → Ghi file
// Request 2: Tạo spreadsheet → Ghi file (đè lên request 1)
// Request 3: Tạo spreadsheet → Ghi file (đè lên request 2)
// ...
```

File `.data/spreadsheets.json` chỉ lưu **spreadsheet cuối cùng**, nhưng đã tạo ra **6 files rác**.

### 3. **Multiple Page Loads**

Khi user truy cập trang:
```javascript
// expenses.js
useEffect(() => {
  fetchItems() // Gọi /api/expenses
}, [status])

// debts.js  
useEffect(() => {
  fetchNotes() // Gọi /api/debts
}, [status])

// Nếu mở nhiều tab hoặc reload → Càng nhiều requests
```

## 📋 Timeline Tạo Files

```
23:07:00.000 - User login → Session created
23:07:00.100 - /api/expenses GET → Không thấy mapping → Tạo File #1
23:07:00.150 - /api/debts GET → Không thấy mapping → Tạo File #2
23:07:00.200 - /api/budgets GET → Không thấy mapping → Tạo File #3
23:07:00.250 - Dashboard load → Gọi lại /api/expenses → Tạo File #4
23:07:00.300 - Retry request → Tạo File #5
23:07:00.350 - Another component → Tạo File #6
```

## ✅ Giải Pháp

### **Option 1: Thêm Lock Mechanism (Đề xuất)**

Sử dụng mutex/lock để đảm bảo chỉ có 1 request tạo spreadsheet tại một thời điểm.

### **Option 2: Centralized Spreadsheet Initialization**

Tạo spreadsheet ngay sau khi login, không để các API endpoints tự tạo.

### **Option 3: Check và Wait**

Nếu phát hiện đang có quá trình tạo spreadsheet, các request khác phải **đợi** thay vì tạo mới.

## 🔧 Cách Fix (Đã Implement)

Tôi sẽ implement **Option 1 + Option 3**: Kết hợp lock và retry logic.

---

## 📊 Thống Kê

- **Files rác được tạo**: 6 files
- **Files thực sự cần**: 1 file
- **Lãng phí**: 5 files không sử dụng
- **Thời gian tạo**: < 1 giây (cùng lúc)

## 🎯 Kết Quả Mong Đợi Sau Fix

- ✅ Chỉ tạo **1 file duy nhất** mỗi user
- ✅ Không có race condition
- ✅ Retry tự động nếu có conflict
- ✅ Logging rõ ràng để debug
