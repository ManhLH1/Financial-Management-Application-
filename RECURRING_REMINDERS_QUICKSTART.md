# 🚀 Quick Start - Recurring Reminders

## ⚡ Cách sử dụng nhanh

### 1. Setup Environment Variables
```bash
# Thêm vào file .env.local
CRON_SECRET=your-secret-key-here  # Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ADMIN_EMAIL=your-email@gmail.com   # Email nhận nhắc nhở
```

### 2. Test trên Local
```bash
# Start dev server
npm run dev

# Truy cập trang Định kỳ
http://localhost:3000/recurring

# Thêm chi tiêu với nextDue = today + 3 days

# Click button "📧 Gửi email nhắc nhở"
# Check email inbox
```

### 3. Deploy lên Vercel
```bash
git add .
git commit -m "Add recurring reminders"
git push

vercel --prod
```

### 4. Set Environment Variables trên Vercel
```bash
# In Vercel Dashboard:
Settings → Environment Variables → Add

CRON_SECRET=your-secret-key
ADMIN_EMAIL=your-email@gmail.com
```

### 5. Verify Cron Job
```
Vercel Dashboard → Your Project → Settings → Cron Jobs

Should see:
✅ /api/cron/recurring-reminders
✅ Schedule: 0 9 * * *
✅ Status: Active
```

## 📧 Test Email

### Manual Test
1. Go to `/recurring`
2. Add recurring expense:
   - Title: "Test reminder"
   - Amount: 100000
   - Next Due: Today + 3 days
3. Click "📧 Gửi email nhắc nhở"
4. Check email

### Cron Test
```bash
curl -X POST https://your-app.vercel.app/api/cron/recurring-reminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## ✅ Expected Results

### UI
```
🔔 Sắp đến hạn [1]

┌─────────────────────────────┐
│ Test reminder          3    │
│ 💰 100,000đ        ngày nữa │
│ 📅 Đến hạn: 15/01/2025      │
└─────────────────────────────┘
```

### Email
```
Subject: 🔔 Nhắc nhở: Test reminder sắp đến hạn

Body:
- ✅ Show title, amount, category
- ✅ Show due date
- ✅ "Còn 3 ngày!" warning
- ✅ Button link to /recurring
```

## 🔍 Troubleshooting

### Email không gửi được?
```bash
# Check email config
curl -X POST http://localhost:3000/api/test-email

# Check logs
vercel logs | grep "email"
```

### Cron không chạy?
```bash
# Verify in Vercel dashboard
Settings → Cron Jobs

# Test manually
curl -X POST https://your-app.vercel.app/api/cron/recurring-reminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Không thấy upcoming reminders?
1. Check có recurring expense nào với nextDue trong 7 ngày?
2. Check isActive = true?
3. Refresh trang

## 📝 Example Usage

### Add Recurring Expense
```javascript
{
  title: "Hóa đơn điện",
  amount: 500000,
  category: "Hóa đơn",
  frequency: "monthly",
  dayOfMonth: 15,
  nextDue: "2025-01-15",  // Today + 3 days
  isActive: true
}
```

### Reminder Timeline
```
Day 7: No reminder
Day 4: No reminder
Day 3: 🔔 Email sent ✅
Day 2: No reminder
Day 1: No reminder
Day 0: Due date (đến hạn)
```

## 🎯 Done!

Bây giờ bạn đã có:
- ✅ Email nhắc nhở tự động
- ✅ UI hiển thị chi tiêu sắp đến hạn
- ✅ Cron job chạy hàng ngày
- ✅ Test button để gửi thủ công

**Next:** Add more recurring expenses và đợi email! 📧
