# 🧪 HƯỚNG DẪN TEST PHASE 1 - REAL-TIME SPENDING CONTROL

## ✅ Implementation Complete!

Đã hoàn thành:
- ✅ Cập nhật Budgets API - thêm daily_limit, weekly_limit, blockOnExceed
- ✅ API check-spending-limit - kiểm tra real-time
- ✅ API spending-velocity - tính toán tốc độ chi tiêu
- ✅ SpendingWarningModal component - modal cảnh báo đẹp
- ✅ Tích hợp validation vào expenses.js

## 🚀 Server Status

Server đang chạy: **http://localhost:3001**

---

## 📋 CÁC BƯỚC TEST

### **Test Case 1: Thiết lập Budget với Daily/Weekly Limits**

1. **Truy cập trang Budgets:**
   ```
   http://localhost:3001/budgets
   ```

2. **Tạo budget mới cho category "Ăn uống":**
   - Category: **Ăn uống**
   - Monthly Amount: **5,000,000đ**
   - Period: **monthly**
   - Alert Threshold: **80%**
   - Daily Limit: **200,000đ** (tự động tính = 5M/30)
   - Weekly Limit: **1,200,000đ** (tự động tính = 5M/4)
   - Block on Exceed: **false**

   **Lưu ý:** API sẽ tự động tính daily/weekly limit nếu không nhập

3. **Verify trong Google Sheets:**
   - Mở Google Sheet của bạn
   - Kiểm tra sheet "Budgets" có 8 cột:
     - A: ID
     - B: Category
     - C: Amount (Monthly)
     - D: Period
     - E: Alert Threshold
     - F: Daily Limit ← MỚI
     - G: Weekly Limit ← MỚI
     - H: Block On Exceed ← MỚI

---

### **Test Case 2: Tạo Expense - Không vượt limit (GREEN)**

1. **Truy cập trang Expenses:**
   ```
   http://localhost:3001/expenses
   ```

2. **Tạo expense nhỏ:**
   - Title: **Cơm trưa**
   - Amount: **50,000đ**
   - Category: **Ăn uống**
   - Date: Hôm nay
   - Type: **expense**

3. **Kết quả mong đợi:**
   - ✅ Không có modal warning
   - ✅ Lưu thành công ngay lập tức
   - ✅ Notification: "✅ Đã thêm chi tiêu!"

---

### **Test Case 3: Tạo Expense - Cảnh báo WARNING (YELLOW)**

1. **Tạo expense vượt 80% daily limit:**
   - Title: **Nhà hàng sang trọng**
   - Amount: **180,000đ** (90% của 200k daily limit)
   - Category: **Ăn uống**
   - Date: Hôm nay

2. **Kết quả mong đợi:**
   - ⚠️ **Modal hiện ra** với màu vàng
   - Hiển thị alerts:
     * "Sắp đạt hạn mức ngày (90%)"
     * Progress bar màu vàng
     * Recommendation: "Còn 20,000đ cho hôm nay"
   
3. **So sánh chi tiêu:**
   - Hôm nay: 50,000đ → 230,000đ (vượt!)
   - Tuần này: 50,000đ → 230,000đ
   - Tháng này: 50,000đ → 230,000đ

4. **Thử các actions:**
   - Click **"✏️ Chỉnh sửa số tiền"** → Modal đóng, giữ form
   - Click **"✅ Xác nhận"** → Lưu expense, modal đóng

---

### **Test Case 4: Tạo Expense - DANGER (ORANGE/RED)**

1. **Tạo thêm vài expenses trong ngày để đạt gần limit**

2. **Tạo expense vượt daily limit:**
   - Title: **Buffet tối**
   - Amount: **300,000đ**
   - Category: **Ăn uống**

3. **Kết quả mong đợi:**
   - 🚫 **Modal màu đỏ/cam**
   - Alerts level DANGER:
     * "Vượt hạn mức ngày! (265%)"
     * "Vượt ngân sách tháng!"
     * Progress bar màu đỏ
   
4. **Button text:**
   - "⚠️ Vẫn tiếp tục" (màu đỏ, nhấn mạnh rủi ro)
   - "✏️ Chỉnh sửa số tiền"

---

### **Test Case 5: Test Spending Velocity API**

1. **Mở browser console hoặc dùng Postman/curl:**

   ```bash
   # Get velocity for "Ăn uống" category
   curl http://localhost:3001/api/spending-velocity?category=Ăn%20uống
   ```

2. **Response mong đợi:**
   ```json
   {
     "category": "Ăn uống",
     "period": {
       "startDate": "2025-10-01",
       "endDate": "2025-10-31",
       "daysElapsed": 13,
       "daysRemaining": 18,
       "daysInMonth": 31
     },
     "spending": {
       "total": 530000,
       "count": 3,
       "average": 40769,
       "projected": 1263839
     },
     "velocity": {
       "daily": 40769,
       "weekly": 285384,
       "formatted": "40,769đ/ngày"
     },
     "budget": {
       "limit": 5000000,
       "spent": 530000,
       "remaining": 4470000,
       "percentUsed": "10.6",
       "daysUntilEmpty": 109,
       "status": "GOOD",
       "recommendation": "Tốc độ chi tiêu ổn định, tiếp tục duy trì"
     },
     "analysis": {
       "avgDaily": 176666,
       "maxDaily": 230000,
       "minDaily": 50000,
       "variance": "73029",
       "stability": "MODERATE",
       "stabilityScore": "41.3"
     }
   }
   ```

---

### **Test Case 6: Multiple Categories**

1. **Tạo budget cho category khác:**
   - Category: **Di chuyển**
   - Monthly: **2,000,000đ**
   - Daily: **70,000đ**
   - Weekly: **500,000đ**

2. **Tạo expense:**
   - Category: **Di chuyển**
   - Amount: **80,000đ** (vượt daily)

3. **Verify:**
   - Modal hiện cho category "Di chuyển"
   - Không ảnh hưởng đến budget "Ăn uống"

---

### **Test Case 7: Income (Skip Validation)**

1. **Tạo income:**
   - Title: **Lương tháng**
   - Amount: **15,000,000đ**
   - Type: **income**
   - Category: **Lương**

2. **Kết quả mong đợi:**
   - ✅ Không có modal warning
   - ✅ Lưu ngay lập tức
   - Income không bị check limit

---

### **Test Case 8: Edit Expense (Skip Validation)**

1. **Click edit một expense cũ**
2. **Sửa amount lên cao**
3. **Kết quả mong đợi:**
   - ✅ Không có modal warning
   - ✅ Update thành công
   - Edit mode không check limit (chỉ check khi tạo mới)

---

## 🎨 UI/UX Features to Verify

### **Modal Design:**
- ✅ Animation fade-in + slide-up mượt mà
- ✅ Backdrop blur effect
- ✅ Color-coded by severity:
  - 🟢 INFO: Blue
  - 🟡 WARNING: Yellow
  - 🔴 DANGER: Red/Orange
  - 🚫 BLOCKED: Dark Red

### **Alert Types:**
- ✅ Daily limit warnings
- ✅ Weekly limit warnings
- ✅ Monthly budget warnings
- ✅ Spending velocity warnings

### **Spending Comparison Table:**
- ✅ Before → After visualization
- ✅ Shows: Today, This Week, This Month
- ✅ Displays limits for each period

---

## 🐛 Common Issues & Solutions

### Issue 1: Modal không hiện
**Nguyên nhân:** Budget chưa được tạo cho category
**Solution:** Tạo budget trước khi test

### Issue 2: API trả về 401 Unauthorized
**Nguyên nhân:** Chưa đăng nhập
**Solution:** Login với Google account

### Issue 3: Budgets sheet chưa có cột mới
**Nguyên nhân:** Sheet cũ chưa có cột F, G, H
**Solution:** 
1. Mở Google Sheet
2. Thêm 3 cột: "Daily Limit", "Weekly Limit", "Block On Exceed"
3. Hoặc tạo budget mới (API tự động thêm)

### Issue 4: Check spending limit trả về error
**Nguyên nhân:** Expenses sheet không có data
**Solution:** Tạo ít nhất 1 expense để test

---

## 📊 Test Results Template

```
✅ Test Case 1: Setup Budget - PASS
✅ Test Case 2: No Warning - PASS
✅ Test Case 3: Warning Alert - PASS
✅ Test Case 4: Danger Alert - PASS
✅ Test Case 5: Velocity API - PASS
✅ Test Case 6: Multiple Categories - PASS
✅ Test Case 7: Income Skip - PASS
✅ Test Case 8: Edit Skip - PASS

Overall: 8/8 PASSED ✅
```

---

## 🎯 Next Steps After Testing

1. ✅ Verify tất cả test cases
2. 📸 Chụp screenshots các modal states
3. 🐛 Fix bugs nếu có
4. 📝 Document edge cases
5. 🚀 Ready for Phase 2 implementation

---

## 📞 Need Help?

Nếu gặp lỗi, check:
1. Terminal logs: Xem terminal đang chạy `npm run dev`
2. Browser console: F12 → Console tab
3. Network tab: Kiểm tra API calls
4. Google Sheets: Verify data structure

Happy Testing! 🎉
