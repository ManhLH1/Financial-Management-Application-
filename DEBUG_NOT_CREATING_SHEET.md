# 🔍 DEBUG: Không Tạo Được Google Sheet

## ❓ Câu hỏi

"Tại sao khi user đăng nhập Gmail mới (chưa có data) vẫn KHÔNG tự động tạo Google Sheet?"

## 🎯 Debug Steps

### Step 1: Check Session & Access Token

**Vào:** http://localhost:3000/diagnostic

**Kiểm tra:**
- [ ] Session status: `authenticated`
- [ ] Access Token: `✅ Present`
- [ ] Refresh Token: `✅ Present`

**Nếu Access Token MISSING:**
```
❌ Vấn đề: NextAuth không lưu access token
✅ Fix: Đăng xuất → Đăng nhập lại
```

### Step 2: Test Create Permission

**Vào:** http://localhost:3000/test-create-sheet

**Click:** "🚀 Bắt đầu Test"

**Kết quả mong đợi:**
```
✅ Success: Spreadsheet created
📊 URL: https://docs.google.com/spreadsheets/d/...
```

**Nếu FAIL:**

#### Error: "Insufficient permissions"
```
❌ Vấn đề: User chưa approve quyền Sheets
✅ Fix:
   1. Đăng xuất
   2. Đăng nhập lại
   3. ⚠️ QUAN TRỌNG: Khi popup OAuth xuất hiện
      - Scroll down xem tất cả permissions
      - Phải có: "See, edit, create, and delete all your Google Sheets spreadsheets"
      - Click "Allow"
```

#### Error: "Invalid credentials"
```
❌ Vấn đề: Token không hợp lệ
✅ Fix:
   1. Clear browser cache/cookies
   2. Đăng xuất
   3. Đăng nhập lại
```

#### Error: "Request had insufficient authentication scopes"
```
❌ Vấn đề: Scope không đủ trong NextAuth config
✅ Fix: Check file pages/api/auth/[...nextauth].js
   
   Phải có:
   scope: 'openid email profile https://www.googleapis.com/auth/spreadsheets'
```

### Step 3: Test Auto-Create Flow

**Chuẩn bị:**
```powershell
# 1. Stop server (Ctrl+C)

# 2. Xóa data folder
Remove-Item .data -Recurse -Force -ErrorAction SilentlyContinue

# 3. Restart server
npm run dev
```

**Test:**
```
1. Đăng xuất
2. Đăng nhập lại (để clear cache)
3. Vào: http://localhost:3000/expenses
4. Xem terminal logs
```

**Logs mong đợi:**
```
🔍 [EXPENSES API] Session check:
  - Has session: true
  - Has accessToken: true
  - User email: your@gmail.com

🔄 [EXPENSES API] Getting or creating spreadsheet...

🔍 [getOrCreateSpreadsheet] Checking for user: your@gmail.com
  - Per-user mapping: NOT FOUND
  - ENV fallback: xxx

📝 No per-user spreadsheet found, creating new spreadsheet...

✅ Created new spreadsheet: NEW_ID
📊 URL: https://docs.google.com/spreadsheets/d/NEW_ID/edit
💾 Saved spreadsheet mapping for your@gmail.com

✅ [EXPENSES API] Using spreadsheet: NEW_ID
```

**Nếu KHÔNG thấy logs này:**

#### Case 1: Không thấy "Creating new spreadsheet"
```
❌ Vấn đề: Logic vẫn dùng env fallback
✅ Fix: Check lib/sheetsHelper.js line 40-110
   
   Phải có:
   let spreadsheetId = mapping[userEmail]  // ❌ KHÔNG có || process.env.GOOGLE_SHEET_ID
   
   if (!spreadsheetId) {
     // Create new
   }
```

#### Case 2: Thấy error trong logs
```
❌ Error: "The caller does not have permission"
✅ Fix: Permissions issue - làm lại Step 2

❌ Error: "Cannot write to .data folder"
✅ Fix: 
   mkdir .data
   # hoặc
   New-Item -Path .data -ItemType Directory -Force
```

#### Case 3: Không có logs gì cả
```
❌ Vấn đề: API không được gọi
✅ Debug:
   1. Check browser console
   2. Check Network tab
   3. Verify /api/expenses được call
```

## 🧪 Complete Debug Checklist

### Diagnostic Page Check
- [ ] Vào http://localhost:3000/diagnostic
- [ ] Session authenticated
- [ ] Access token present
- [ ] Expenses API returns 200
- [ ] Spreadsheet ID shown OR "Not created yet"

### Test Create Check
- [ ] Vào http://localhost:3000/test-create-sheet
- [ ] Click test
- [ ] Success message
- [ ] Spreadsheet URL works
- [ ] Can open spreadsheet in browser

### Auto-Create Flow Check
- [ ] Clean .data folder
- [ ] Restart server
- [ ] Re-login
- [ ] Visit /expenses
- [ ] See "Creating new spreadsheet" in terminal
- [ ] See "Created new spreadsheet: ID" in terminal
- [ ] See "Saved spreadsheet mapping" in terminal
- [ ] Spreadsheet accessible via URL

### File System Check
- [ ] .data folder exists
- [ ] .data folder writable
- [ ] .data/spreadsheets.json created
- [ ] User email in spreadsheets.json
- [ ] Spreadsheet ID correct

## 🔧 Common Issues & Fixes

### Issue 1: Access Token Missing

**Symptoms:**
- Diagnostic shows "❌ Missing"
- Test create fails immediately

**Root Cause:**
- NextAuth callback not saving token
- Session expired

**Fix:**
```javascript
// Check pages/api/auth/[...nextauth].js

callbacks: {
  async jwt({ token, account }) {
    if (account) {
      return {
        ...token,
        accessToken: account.access_token,  // ← Must have this
        refreshToken: account.refresh_token
      }
    }
    return token
  },
  async session({ session, token }) {
    session.accessToken = token.accessToken  // ← Must have this
    session.refreshToken = token.refreshToken
    return session
  }
}
```

### Issue 2: Insufficient Permissions

**Symptoms:**
- Test create fails with 403
- "insufficient permissions" error

**Root Cause:**
- User didn't approve spreadsheets scope
- Scope missing in OAuth config

**Fix:**
```
1. Sign out
2. Revoke app access in Google account:
   https://myaccount.google.com/permissions
3. Sign in again
4. CAREFULLY approve all permissions
```

### Issue 3: Logic Still Using Env

**Symptoms:**
- Terminal shows env fallback ID
- No "Creating new spreadsheet" message
- All users share same spreadsheet

**Root Cause:**
- Code still using old logic

**Fix:**
```javascript
// In lib/sheetsHelper.js - line ~46

// ❌ OLD (WRONG):
let spreadsheetId = mapping[userEmail] || process.env.GOOGLE_SHEET_ID

// ✅ NEW (CORRECT):
let spreadsheetId = mapping[userEmail]
if (!spreadsheetId) {
  // Create new for this user
}
```

### Issue 4: Cannot Write to .data

**Symptoms:**
- "Failed to persist spreadsheetId mapping" in logs
- Spreadsheet created but not saved

**Root Cause:**
- .data folder doesn't exist
- No write permissions

**Fix:**
```powershell
# Create folder with proper permissions
New-Item -Path .data -ItemType Directory -Force

# Or in terminal
mkdir .data
```

## 📊 Debug Workflow Diagram

```
User Login
    ↓
Check Diagnostic Page
    ├─ Access Token Present? 
    │   ├─ Yes → Continue
    │   └─ No → Re-login
    ↓
Test Create Sheet
    ├─ Success?
    │   ├─ Yes → Permission OK, continue
    │   └─ No → Fix permissions
    ↓
Test Auto-Create Flow
    ├─ Clean .data
    ├─ Restart server
    ├─ Re-login
    ├─ Visit /expenses
    ↓
Check Terminal Logs
    ├─ See "Creating new spreadsheet"?
    │   ├─ Yes → Check if successful
    │   └─ No → Logic issue
    ↓
Check Result
    ├─ Spreadsheet created?
    │   ├─ Yes → ✅ WORKING!
    │   └─ No → Check errors
```

## 🎯 Quick Commands

```powershell
# Clean reset
Remove-Item .data -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item .next -Recurse -Force -ErrorAction SilentlyContinue

# Restart
npm run dev

# Test flow
# 1. http://localhost:3000/diagnostic → Check status
# 2. http://localhost:3000/test-create-sheet → Test permissions
# 3. http://localhost:3000/expenses → Test auto-create
```

## 📝 Report Template

When reporting issues, include:

```
### Diagnostic Results
- Session: [authenticated/not authenticated]
- Access Token: [present/missing]
- Test Create: [success/failed]
- Error: [error message if any]

### Terminal Logs
[Copy relevant logs here]

### Expected vs Actual
Expected: [what should happen]
Actual: [what actually happened]
```

---

## 🚀 Start Debug Now

1. **Open:** http://localhost:3000/diagnostic
2. **Check:** All status indicators
3. **Follow:** Steps above based on results
4. **Report:** Findings so we can help

**Let's fix this together! 💪**
