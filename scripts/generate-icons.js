const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Tạo SVG icon mẫu nếu chưa có icon gốc
const createBaseSVG = () => {
  return `
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="100" fill="url(#grad1)"/>
  <g transform="translate(256,256)">
    <!-- Icon tiền -->
    <circle cx="0" cy="0" r="120" fill="white" opacity="0.2"/>
    <text x="0" y="0" font-size="180" text-anchor="middle" dominant-baseline="middle" fill="white" font-family="Arial">₫</text>
  </g>
  <g transform="translate(140,380)">
    <rect width="240" height="60" rx="10" fill="white" opacity="0.9"/>
    <text x="120" y="38" font-size="32" font-weight="bold" text-anchor="middle" fill="#1d4ed8" font-family="Arial">Chi Tiêu</text>
  </g>
</svg>
  `.trim();
};

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const publicDir = path.join(__dirname, '..', 'public');
const iconsDir = path.join(publicDir, 'icons');

// Tạo thư mục nếu chưa tồn tại
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

async function generateIcons() {
  try {
    console.log('🎨 Đang tạo icons cho PWA...\n');
    
    // Tạo SVG base
    const svgContent = createBaseSVG();
    const svgBuffer = Buffer.from(svgContent);
    
    // Generate tất cả các kích thước
    for (const size of sizes) {
      const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
      
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Đã tạo: icon-${size}x${size}.png`);
    }
    
    // Tạo favicon
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'favicon.ico'));
    
    console.log('✅ Đã tạo: favicon.ico');
    
    console.log('\n🎉 Hoàn thành! Đã tạo tất cả icons cần thiết cho PWA.');
    console.log('\n💡 Lưu ý: Bạn có thể thay thế icon-512x512.png bằng logo riêng của bạn,');
    console.log('   sau đó chạy lại script này để tạo các kích thước khác.');
    
  } catch (error) {
    console.error('❌ Lỗi khi tạo icons:', error);
    process.exit(1);
  }
}

generateIcons();
