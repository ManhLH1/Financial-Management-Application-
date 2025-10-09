# 📧 Hướng dẫn cấu hình Email

## 🎯 Mục đích
Hệ thống sẽ gửi email tự động để:
- ⏰ Nhắc nhở thanh toán khoản nợ
- 🚨 Cảnh báo khẩn cấp (còn 3 ngày)
- ⚠️ Cảnh báo thông thường (còn 5 ngày)
- 📊 Báo cáo định kỳ

## 🔧 Cấu hình Gmail (Khuyến nghị)

### Bước 1: Bật xác thực 2 bước
1. Truy cập https://myaccount.google.com/security
2. Tìm phần "Xác minh 2 bước"
3. Bật tính năng này nếu chưa bật

### Bước 2: Tạo App Password
1. Truy cập https://myaccount.google.com/apppasswords
2. Chọn "Mail" và "Windows Computer"
3. Click "Generate"
4. Copy mật khẩu 16 ký tự (dạng: xxxx xxxx xxxx xxxx)

### Bước 3: Cập nhật .env.local
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

## 📝 Test Email

### 1. Khởi động server
```bash
cd d:\app-1\web
npm run dev
```

### 2. Truy cập trang Khoản nợ
http://localhost:3003/debts

### 3. Click nút "📧 Test Email"
- Nếu thành công: Nhận email trong vài giây
- Nếu lỗi: Xem thông báo lỗi và sửa cấu hình

## 🔔 Tính năng Email

### 1. Gửi email thủ công
- Click nút "📨 Gửi nhắc" trên từng khoản nợ
- Email được gửi ngay lập tức

### 2. Kiểm tra cảnh báo
- Click nút "🔔 Kiểm tra"
- Tự động gửi email cho các khoản còn ≤ 3 ngày

### 3. Scheduled Job (Tự động hàng ngày)
- Click nút "⏰ Bật Auto"
- Hệ thống sẽ chạy tự động lúc 9:00 AM mỗi ngày
- Tự động gửi email cho các khoản khẩn cấp

## 🎨 Mẫu Email

Email được gửi đi sẽ có:
- ✅ Thiết kế đẹp mắt với HTML
- 🏷️ Badge khẩn cấp/bình thường
- 📊 Thông tin đầy đủ (người nợ, số tiền, ngày trả)
- ⚠️ Warning box với màu sắc theo mức độ
- 🔗 Link trở về app

## 🐛 Troubleshooting

### Lỗi "EAUTH" - Xác thực thất bại
**Nguyên nhân**: Sai email hoặc mật khẩu
**Giải pháp**:
- Kiểm tra EMAIL_USER và EMAIL_PASSWORD trong .env.local
- Đảm bảo sử dụng App Password, không phải mật khẩu Gmail thường
- Xóa khoảng trắng trong mật khẩu

### Lỗi "ECONNECTION" - Không kết nối được
**Nguyên nhân**: Lỗi mạng hoặc firewall
**Giải pháp**:
- Kiểm tra kết nối internet
- Tạm tắt firewall/antivirus
- Thử port khác (465, 587)

### Không nhận được email
**Nguyên nhân**: Email vào spam
**Giải pháp**:
- Kiểm tra thư mục Spam/Junk
- Đánh dấu email là "Not Spam"
- Thêm địa chỉ gửi vào danh bạ

## 🚀 Sử dụng SMTP khác (Nâng cao)

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=465
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
```

### Custom SMTP
```env
SMTP_HOST=your-smtp-host
SMTP_PORT=465
SMTP_USER=your-username
SMTP_PASSWORD=your-password
```

Sau đó sửa file `lib/emailHelper.js` để dùng SMTP thay vì Gmail.

## 📅 Scheduled Jobs

### Mặc định (9:00 AM mỗi ngày)
```
Cron: 0 9 * * *
```

### Tùy chỉnh schedule khác:
- Mỗi 6 giờ: `0 */6 * * *`
- 9 AM và 3 PM mỗi ngày: `0 9,15 * * *`
- Thứ 2 hàng tuần: `0 9 * * 1`
- Đầu mỗi tháng: `0 9 1 * *`

Sửa trong file `lib/scheduler.js`.

## ✅ Checklist Setup

- [ ] Bật xác thực 2 bước Gmail
- [ ] Tạo App Password
- [ ] Cập nhật EMAIL_USER và EMAIL_PASSWORD trong .env.local
- [ ] Restart server
- [ ] Click "📧 Test Email"
- [ ] Kiểm tra email đã nhận
- [ ] Click "⏰ Bật Auto" để bật scheduled job

## 💡 Tips

1. **Bảo mật**: Không commit file .env.local lên Git
2. **Test trước**: Luôn test với "📧 Test Email" trước
3. **Monitor**: Xem console log để debug
4. **Backup**: Lưu App Password ở nơi an toàn

## 🆘 Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
1. Console log (F12 > Console)
2. Terminal log (nơi chạy `npm run dev`)
3. File .env.local có đúng không
4. Gmail App Password có còn hoạt động không
