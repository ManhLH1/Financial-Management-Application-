const fs = require('fs');
const path = require('path');

console.log('🔍 Kiểm tra cấu hình PWA...\n');

let errors = [];
let warnings = [];
let success = [];

// Check 1: next-pwa installed
try {
  require('next-pwa');
  success.push('✅ next-pwa đã được cài đặt');
} catch (e) {
  errors.push('❌ next-pwa chưa được cài đặt. Chạy: npm install next-pwa');
}

// Check 2: manifest.json exists
const manifestPath = path.join(__dirname, '..', 'public', 'manifest.json');
if (fs.existsSync(manifestPath)) {
  success.push('✅ manifest.json tồn tại');
  
  // Validate manifest content
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    if (manifest.name && manifest.short_name) {
      success.push('✅ manifest.json có name và short_name');
    } else {
      warnings.push('⚠️  manifest.json thiếu name hoặc short_name');
    }
    
    if (manifest.icons && manifest.icons.length >= 2) {
      success.push(`✅ manifest.json có ${manifest.icons.length} icons`);
    } else {
      errors.push('❌ manifest.json cần ít nhất 2 icons (192x192, 512x512)');
    }
    
    if (manifest.start_url) {
      success.push('✅ manifest.json có start_url');
    } else {
      warnings.push('⚠️  manifest.json thiếu start_url');
    }
    
    if (manifest.display) {
      success.push(`✅ manifest.json display mode: ${manifest.display}`);
    }
    
    if (manifest.theme_color && manifest.background_color) {
      success.push('✅ manifest.json có theme_color và background_color');
    }
    
  } catch (e) {
    errors.push('❌ manifest.json không phải JSON hợp lệ');
  }
} else {
  errors.push('❌ manifest.json không tồn tại trong public/');
}

// Check 3: Icons exist
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
const requiredIcons = ['192x192', '512x512'];
let iconCount = 0;

if (fs.existsSync(iconsDir)) {
  const icons = fs.readdirSync(iconsDir);
  iconCount = icons.length;
  
  requiredIcons.forEach(size => {
    const iconExists = icons.some(icon => icon.includes(size));
    if (iconExists) {
      success.push(`✅ Icon ${size} tồn tại`);
    } else {
      errors.push(`❌ Thiếu icon ${size}. Chạy: npm run generate-icons`);
    }
  });
  
  if (iconCount >= 6) {
    success.push(`✅ Tổng cộng ${iconCount} icons`);
  }
} else {
  errors.push('❌ Thư mục public/icons không tồn tại. Chạy: npm run generate-icons');
}

// Check 4: next.config.js configured
const nextConfigPath = path.join(__dirname, '..', 'next.config.js');
if (fs.existsSync(nextConfigPath)) {
  const configContent = fs.readFileSync(nextConfigPath, 'utf8');
  
  if (configContent.includes('next-pwa') || configContent.includes('withPWA')) {
    success.push('✅ next.config.js đã cấu hình next-pwa');
  } else {
    errors.push('❌ next.config.js chưa cấu hình next-pwa');
  }
  
  if (configContent.includes('runtimeCaching')) {
    success.push('✅ next.config.js có runtime caching strategies');
  } else {
    warnings.push('⚠️  next.config.js chưa có runtime caching (không bắt buộc)');
  }
}

// Check 5: _app.js has PWA meta tags
const appPath = path.join(__dirname, '..', 'pages', '_app.js');
if (fs.existsSync(appPath)) {
  const appContent = fs.readFileSync(appPath, 'utf8');
  
  if (appContent.includes('manifest')) {
    success.push('✅ _app.js đã link tới manifest');
  } else {
    errors.push('❌ _app.js chưa link tới manifest.json');
  }
  
  if (appContent.includes('apple-mobile-web-app-capable')) {
    success.push('✅ _app.js có Apple PWA meta tags');
  } else {
    warnings.push('⚠️  _app.js thiếu Apple PWA meta tags');
  }
  
  if (appContent.includes('theme-color')) {
    success.push('✅ _app.js có theme-color meta tag');
  } else {
    warnings.push('⚠️  _app.js thiếu theme-color meta tag');
  }
}

// Check 6: Favicon
const faviconPath = path.join(__dirname, '..', 'public', 'favicon.ico');
if (fs.existsSync(faviconPath)) {
  success.push('✅ favicon.ico tồn tại');
} else {
  warnings.push('⚠️  favicon.ico không tồn tại. Chạy: npm run generate-icons');
}

// Check 7: Build folder (service worker)
const buildPath = path.join(__dirname, '..', '.next');
if (fs.existsSync(buildPath)) {
  success.push('✅ Project đã được build (.next folder tồn tại)');
} else {
  warnings.push('⚠️  Project chưa build. Chạy: npm run build để test PWA');
}

// Print results
console.log('═══════════════════════════════════════════════════════\n');

if (success.length > 0) {
  console.log('✅ THÀNH CÔNG:\n');
  success.forEach(msg => console.log('  ' + msg));
  console.log('');
}

if (warnings.length > 0) {
  console.log('⚠️  CẢNH BÁO:\n');
  warnings.forEach(msg => console.log('  ' + msg));
  console.log('');
}

if (errors.length > 0) {
  console.log('❌ LỖI CẦN SỬA:\n');
  errors.forEach(msg => console.log('  ' + msg));
  console.log('');
}

console.log('═══════════════════════════════════════════════════════\n');

// Summary
const total = success.length + warnings.length + errors.length;
const score = Math.round((success.length / total) * 100);

console.log(`📊 Tổng kết: ${success.length}/${total} checks passed (${score}%)\n`);

if (errors.length === 0 && warnings.length === 0) {
  console.log('🎉 HOÀN HẢO! PWA của bạn đã sẵn sàng!\n');
  console.log('📱 Next steps:');
  console.log('   1. npm run build && npm run start');
  console.log('   2. Test tại http://localhost:3000');
  console.log('   3. Deploy lên production (Vercel)');
  console.log('   4. Build APK (xem BUILD_APK_GUIDE.md)\n');
} else if (errors.length === 0) {
  console.log('✅ PWA cơ bản đã OK! Có một vài warnings nhỏ.\n');
  console.log('📱 Bạn có thể tiếp tục test:');
  console.log('   npm run build && npm run start\n');
} else {
  console.log('⚠️  Cần sửa các lỗi trên trước khi tiếp tục.\n');
  process.exit(1);
}
