import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#1B3C53] border-t border-[#234C6A] mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white font-bold text-lg mb-3">📊 Expense Manager</h3>
            <p className="text-[#D2C1B6] text-sm leading-relaxed">
              Giải pháp toàn diện để quản lý tài chính cá nhân thông minh và hiệu quả.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-3">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-[#D2C1B6] hover:text-white transition-colors text-sm">
                  📊 Dashboard
                </Link>
              </li>
              <li>
                <Link href="/expenses" className="text-[#D2C1B6] hover:text-white transition-colors text-sm">
                  💰 Quản lý Chi tiêu
                </Link>
              </li>
              <li>
                <Link href="/debts" className="text-[#D2C1B6] hover:text-white transition-colors text-sm">
                  📝 Quản lý Khoản nợ
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-white font-bold text-lg mb-3">Tính năng nổi bật</h3>
            <ul className="space-y-2 text-[#D2C1B6] text-sm">
              <li>✅ Đồng bộ Google Sheets</li>
              <li>✅ Thống kê chi tiêu</li>
              <li>✅ Quản lý khoản nợ</li>
              <li>✅ Nhắc nhở tự động qua Email</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-[#234C6A] mt-8 pt-6 text-center">
          <p className="text-[#D2C1B6] text-sm">
            © {new Date().getFullYear()} Expense Manager. Made with ❤️
          </p>
        </div>
      </div>
    </footer>
  )
}
