## 🤖 Automatic APK Build

This project is configured with **GitHub Actions** to automatically build Android APK on every push!

### 🚀 Quick Start

1. **Push your code:**
   ```bash
   git push origin main
   ```

2. **Get your APK:**
   - Go to [Actions](../../actions) tab
   - Wait for build to complete (~5-10 min)
   - Download APK from **Artifacts** section

### 📱 Build Status

![Build APK](https://github.com/ManhLH1/Financial-Management-Application-/actions/workflows/build-apk.yml/badge.svg)

### 📚 Documentation

- **[GitHub Actions Guide](GITHUB_ACTIONS_GUIDE.md)** - Full documentation
- **[Quick Guide](APK_QUICK_GUIDE.md)** - Fast reference
- **[Setup Complete](SETUP_COMPLETE.md)** - Current status & next steps

### 🎯 Features

- ✅ Auto-build APK on push
- ✅ Manual workflow trigger
- ✅ APK artifacts (30-day retention)
- ✅ GitHub Releases support
- ✅ Version tagging support

### 🏷️ Release Version

To create a signed release:

```bash
git tag v1.0.0
git push origin v1.0.0
```

This will automatically create a GitHub Release with the APK attached.

---

**No Android Studio needed!** Build APK from anywhere! 🎉
