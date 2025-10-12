# 🚀 PWA Setup - Quick Start

Ứng dụng của bạn đã được cấu hình thành Progressive Web App (PWA)!

## ✅ Đã Hoàn Thành

- ✅ Cài đặt `next-pwa`
- ✅ Cấu hình Service Worker với caching strategies
- ✅ Tạo `manifest.json` với metadata đầy đủ
- ✅ Generate tất cả PWA icons (72x72 → 512x512)
- ✅ Thêm PWA meta tags vào `_app.js`
- ✅ Tạo offline fallback page
- ✅ Thêm npm scripts tiện ích

## 🧪 Test PWA Ngay Bây Giờ

### Bước 1: Build Production

```bash
npm run build
npm run start
```

### Bước 2: Test trên Chrome

1. Mở `http://localhost:3000`
2. Nhấn **F12** để mở DevTools
3. Vào tab **Application**
4. Kiểm tra:
   - **Manifest**: Xem thông tin app
   - **Service Workers**: Đảm bảo đã registered
   - **Cache Storage**: Xem các file đã cache
5. Thử offline mode:
   - DevTools → Network → Offline
   - Reload page → App vẫn hoạt động!

### Bước 3: Test "Add to Home Screen"

#### Chrome Desktop:
- Nhìn lên thanh địa chỉ → Click biểu tượng ➕ (hoặc ⚙️)
- Chọn "Install Quản Lý Chi Tiêu"

#### Chrome Mobile:
- Menu (⋮) → "Add to Home screen"
- App sẽ xuất hiện như native app!

## 🌐 Deploy lên Production

### Deploy Vercel (Khuyến nghị):

```bash
# Cài Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Sau khi Deploy:

1. Lấy URL production: `https://your-app.vercel.app`
2. Test PWA trên URL thật
3. Test "Add to Home Screen" trên mobile

## 📱 Build APK Android

Xem hướng dẫn chi tiết trong file: **[BUILD_APK_GUIDE.md](./BUILD_APK_GUIDE.md)**

Tóm tắt nhanh:

```bash
# 1. Cài Bubblewrap
npm install -g @bubblewrap/cli

# 2. Init TWA project
bubblewrap init --manifest="https://your-app.vercel.app/manifest.json"

# 3. Build APK
cd twa
bubblewrap build

# APK output: twa/app/build/outputs/apk/debug/app-debug.apk
```

## 🎨 Tùy Chỉnh PWA

### Thay Đổi Icon:

1. Thay file `public/icons/icon-512x512.png` bằng logo của bạn (512x512px)
2. Chạy: `npm run generate-icons`
3. Các sizes khác sẽ tự động được tạo

### Thay Đổi Màu Theme:

Edit `public/manifest.json`:

```json
{
  "theme_color": "#3b82f6",     // Màu thanh status bar
  "background_color": "#ffffff"  // Màu nền splash screen
}
```

### Thay Đổi Tên App:

Edit `public/manifest.json`:

```json
{
  "name": "Tên Dài Của App",
  "short_name": "TênNgắn"
}
```

## 🔧 PWA Configuration

### Service Worker Strategies:

File `next.config.js` đã được cấu hình với:

- **CacheFirst**: Google Fonts, Firebase Storage
- **StaleWhileRevalidate**: Images, JS, CSS

Thay đổi strategy nếu cần trong `next.config.js`.

### Disable PWA trong Development:

PWA tự động disable khi `NODE_ENV=development` để dễ debug.

## 📊 PWA Features

### ✅ Đã Có:
- 📱 Installable (Add to Home Screen)
- 🔌 Offline support
- ⚡ Fast loading với caching
- 📳 Push notifications ready
- 🎨 Custom icons
- 🌐 Responsive design

### 🚧 Có Thể Thêm:
- 🔔 Push notifications (cần backend)
- 📤 Background sync
- 📍 Geolocation features
- 📸 Camera/file access

## 🐛 Troubleshooting

### Service Worker không register:

```bash
# Xóa cache và rebuild
rm -rf .next
npm run build
npm run start
```

### Manifest không load:

- Check URL: `http://localhost:3000/manifest.json`
- Đảm bảo file trong `public/`
- Check console errors

### Icons không hiển thị:

```bash
# Re-generate icons
npm run generate-icons
```

### PWA không offline:

- Build production mode (dev mode tắt PWA)
- Check Service Worker đã active
- Test với Chrome DevTools → Network → Offline

## 📚 Resources

- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Next-PWA Docs](https://github.com/shadowwalker/next-pwa)
- [Service Worker Guide](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

## 🎯 Next Steps

1. **Test PWA**: `npm run build && npm run start`
2. **Deploy**: Vercel/Netlify với HTTPS
3. **Test on Mobile**: Install từ browser
4. **Build APK**: Xem [BUILD_APK_GUIDE.md](./BUILD_APK_GUIDE.md)
5. **Publish**: Upload lên Google Play Store

---

**🎉 Chúc mừng!** Ứng dụng của bạn giờ đây là một Progressive Web App và sẵn sàng để build thành APK Android!

**Cần trợ giúp?** Check [BUILD_APK_GUIDE.md](./BUILD_APK_GUIDE.md) để biết chi tiết về build APK.
