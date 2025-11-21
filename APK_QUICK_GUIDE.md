# ⚡ QUICK: Lấy APK từ GitHub Actions

## 🚀 3 BƯỚC ĐƠN GIẢN

### 1️⃣ Push code
```bash
git add .
git commit -m "Your message"
git push origin main
```

### 2️⃣ Vào GitHub Actions
```
https://github.com/YOUR_USERNAME/YOUR_REPO/actions
```

### 3️⃣ Download APK
- Click vào workflow run (màu xanh ✓)
- Scroll xuống **Artifacts**
- Download ZIP
- Giải nén → File `.apk`

---

## 📱 Cài APK vào điện thoại

1. Chuyển file `.apk` vào phone
2. Mở file → Install
3. Done! 🎉

---

## 🎯 Build Manual (không push)

1. Vào Actions tab
2. "Build Android APK" → Run workflow
3. Chọn branch → Run
4. Đợi → Download

---

## 🏷️ Release Version

```bash
git tag v1.0.0
git push origin v1.0.0
```
→ Tự động tạo Release với APK!

---

📖 Chi tiết: `GITHUB_ACTIONS_GUIDE.md`
