# Hướng dẫn setup Google Sheets Integration

## Bước 1: Cấu hình Google Cloud Console

✅ Đã hoàn thành - Bạn đã có client credentials:
- Client ID: `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com`
- Client Secret: `YOUR_GOOGLE_CLIENT_SECRET`

### Cần kiểm tra thêm:

1. Vào [Google Cloud Console](https://console.cloud.google.com/)
2. Chọn project: **fintrack-474515**
3. Vào **APIs & Services > Credentials**
4. Tìm OAuth 2.0 Client ID của bạn
5. Thêm **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/google
   ```

6. Vào **APIs & Services > Library**
7. Tìm và **Enable** các APIs sau:
   - Google Sheets API
   - Google Drive API (optional, nếu muốn tự động tạo spreadsheet)

## Bước 2: Tạo Google Spreadsheet

1. Vào [Google Sheets](https://sheets.google.com)
2. Tạo spreadsheet mới
3. Đặt tên: "Expense Manager Data" (hoặc tên bạn muốn)
4. Tạo 2 sheets:
   - Sheet 1: Đổi tên thành **Expenses**
   - Sheet 2: Tạo mới và đặt tên **Debts**

5. Copy **Spreadsheet ID** từ URL:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit
   ```

6. Paste ID vào file `.env.local`:
   ```
   GOOGLE_SHEET_ID=YOUR_SPREADSHEET_ID
   ```

## Bước 3: Thiết lập headers cho sheets

Sau khi đăng nhập lần đầu, ứng dụng sẽ tự động tạo headers. Hoặc bạn có thể tự tạo:

### Sheet "Expenses":
| ID | Title | Amount | Category | Date | Created At |
|----|-------|--------|----------|------|------------|

### Sheet "Debts":
| ID | Person | Amount | Date | Due Date | Status | Created At |
|----|--------|--------|------|----------|--------|------------|

## Bước 4: Chạy ứng dụng

```powershell
cd d:\app-1\web
npm run dev
```

Truy cập: http://localhost:3000

## Bước 5: Test Google Login

1. Click "Đăng nhập" trên trang chủ
2. Click "Đăng nhập bằng Google"
3. Chọn tài khoản Google
4. Cho phép ứng dụng truy cập Google Sheets
5. Sau khi đăng nhập thành công, bạn sẽ được chuyển về Dashboard

## Cách hoạt động

- **Khi chưa đăng nhập**: Dữ liệu lưu trong bộ nhớ tạm (RAM), sẽ mất khi restart server
- **Sau khi đăng nhập**: Dữ liệu tự động lưu vào Google Sheets của bạn
- Mỗi user có Google Sheets riêng
- Dữ liệu được sync real-time

## Troubleshooting

### Lỗi "redirect_uri_mismatch"
- Kiểm tra lại Authorized redirect URIs trong Google Cloud Console
- Đảm bảo có đúng: `http://localhost:3000/api/auth/callback/google`

### Lỗi "Access to Google Sheets denied"
- Kiểm tra đã enable Google Sheets API chưa
- Kiểm tra scope trong authorization

### Lỗi "Spreadsheet not found"
- Kiểm tra GOOGLE_SHEET_ID trong .env.local
- Đảm bảo tài khoản đăng nhập có quyền truy cập spreadsheet

## Production Deployment

Khi deploy lên production (Vercel, Netlify, etc.):

1. Thêm environment variables trên platform
2. Cập nhật Authorized redirect URIs:
   ```
   https://your-domain.com/api/auth/callback/google
   ```
3. Cập nhật NEXTAUTH_URL trong env:
   ```
   NEXTAUTH_URL=https://your-domain.com
   ```
4. Generate NEXTAUTH_SECRET mới:
   ```bash
   openssl rand -base64 32
   ```
