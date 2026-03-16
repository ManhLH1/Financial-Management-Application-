# Tổng hợp review & kế hoạch tối ưu theo module

> Tài liệu tổng hợp nhanh dựa trên cấu trúc dự án hiện tại. Có thể cập nhật chi tiết hơn sau khi review sâu từng API/module.

## 1) Tổng quan kiến trúc
- **Frontend**: Next.js 13, Tailwind, Chart.js, Zustand.
- **Backend**: Next.js API routes, tích hợp Google Sheets/Drive, Firebase, email, cron.
- **Auth**: NextAuth Google + refresh token.
- **PWA & Capacitor**: hỗ trợ chạy web + APK.

---

## 2) Kế hoạch tối ưu & hoàn thiện theo module

### 2.1 Auth & Session (NextAuth)
**Mục tiêu:** ổn định đăng nhập và bảo mật session.
- Chuẩn hoá xử lý lỗi refresh token (fallback đăng nhập lại).
- Bảo vệ API routes bằng middleware/guard server-side.
- Tách cấu hình auth ra `lib/authOptions` để tái sử dụng.
- Trang error hiển thị rõ lỗi OAuth.

**Hoàn thiện đề xuất:**
- Cảnh báo token hết hạn và hướng dẫn relogin.

---

### 2.2 Core Finance (expenses, debts, budgets)
**Mục tiêu:** chuẩn hóa dữ liệu, tính nhất quán giữa các API và tăng hiệu năng.

**Hiện trạng (review nhanh):**
- `expenses`/`debts` đang dùng `getOrCreateSpreadsheet` theo user -> đa tenant đúng hướng.
- `budgets` lại dùng `process.env.GOOGLE_SHEET_ID` cố định -> không đồng bộ multi-user.
- `expenses`/`debts` có fallback in-memory khi chưa auth (dữ liệu demo), nhưng `budgets`/`recurring` trả 401.
- Tên field không thống nhất: `expenses` dùng `title`/`description`/`note`, `debts` dùng `person`/`paymentDay`.
- Chưa có validation đầu vào (amount, date, category, status).
- `DELETE` dùng query + body (reason) chưa đồng nhất giữa modules.
- `budgets` delete dùng `sheetId: 0` cố định -> có thể sai sheetId.
- Không có paging / limit, load toàn bộ rows trên mỗi request.

**Vấn đề ưu tiên cần fix:**
1) **Đồng nhất data source**: `budgets` phải dùng `getOrCreateSpreadsheet` theo user (như expenses/debts).
2) **Validation**: thêm `zod` schema cho mọi `POST/PUT`, check `amount > 0`, `date` format, `category` bắt buộc.
3) **Chuẩn hoá fields**: thống nhất `title/description`, `date`, `type`, `category`, `amount`, `status`.
4) **Delete logic**: chuẩn hóa `DELETE` dùng body (id, reason) hoặc query thống nhất.
5) **Sheets delete**: lấy đúng `sheetId` theo sheet name, không hardcode `0`.

**Tối ưu hiệu năng:**
- Thêm `limit/offset` khi fetch từ Sheets (hoặc cache kết quả ngắn hạn 1-5 phút).
- Tạo endpoint `finance-summary` trả về tổng hợp expenses/income/debts để giảm fetch nhiều lần.
- Chuẩn hoá response shape: `{ items, meta }`.

**Hoàn thiện đề xuất:**
- Thêm `category` constants và mapping để tránh dữ liệu rác.
- Bổ sung audit log cơ bản khi delete/update (reason, time, user).
- Thêm `status` cho debts (`paid/owed-to-me/i-owe`) và validate.

---

### 2.3 Analytics & Dashboard
**Mục tiêu:** giảm load client, tập trung logic ở server.
- Đưa các phép tổng hợp sang server.
- Thêm endpoint `dashboard-summary` trả về stats + chart data.

**Hoàn thiện đề xuất:**
- Loading skeleton cho chart/sections.
- Đồng bộ time range và timezone.

---

### 2.4 Export & Backup
**Mục tiêu:** quản trị xuất dữ liệu ổn định và có audit.
- Lưu lịch sử export/backup có audit (file, thời gian, người dùng).
- Kiểm tra lỗi file size, dữ liệu rỗng.

**Hoàn thiện đề xuất:**
- Cho phép chọn fields export.
- Thêm format XLSX.

---

### 2.5 Recurring & Cron
**Mục tiêu:** ổn định job định kỳ và dễ bảo trì.
- Tách scheduler rules ra module config riêng.
- Thêm retry và log kết quả gửi mail.

**Hoàn thiện đề xuất:**
- UI quản lý recurring rules.

---

### 2.6 Notifications & Warnings
**Mục tiêu:** cảnh báo chính xác và realtime.
- Đưa logic warning sang server.
- Thêm endpoint `warnings/summary`.

**Hoàn thiện đề xuất:**
- Cảnh báo realtime trên dashboard + badge.

---

### 2.7 Vocabulary / Workout Modules (nếu không liên quan tài chính)
**Mục tiêu:** giảm nhiễu và dễ bảo trì.
- Nếu không liên quan tài chính: tách module hoặc tách repo.
- Chuẩn hóa cấu trúc module: `components`, `store`, `api`, `types`.

---

### 2.8 Technical Debt / Cleanup
**Mục tiêu:** làm sạch dự án và tăng maintainability.
- Đảm bảo `.next` có trong `.gitignore`.
- Kiểm tra `.env` & secrets.
- Bổ sung lint rules / format.

**Hoàn thiện đề xuất:**
- README rõ luồng cài đặt.
- Health checks cho API.

---

## 3) Lộ trình triển khai đề xuất
1) **Core Finance**: chuẩn hóa schema + endpoint summary.
2) **Dashboard/Analytics**: chuyển logic tính toán sang server.
3) **Export/Backup**: nâng format + lịch sử.
4) **Recurring/Notifications**: log + UI quản lý.
5) **Cleanup**: tách module workout/vocabulary nếu không cần.

---

## 4) Bước tiếp theo
- Nếu bạn muốn, mình sẽ review sâu từng module theo thứ tự ưu tiên và cập nhật tài liệu này.
