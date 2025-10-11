import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useState, useEffect, useRef } from 'react'

export default function Header({ 
  title = 'Dashboard', 
  subtitle = 'Tổng quan tài chính', 
  icon = '📊',
  darkMode = false,
  setDarkMode = null,
  showDarkModeToggle = true
}) {
  const { data: session } = useSession()
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  const bgClass = darkMode 
    ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-2xl border-b border-slate-700' 
    : 'bg-gradient-to-r from-[#1B3C53] via-[#234C6A] to-[#1B3C53] shadow-xl'

  // Navigation items with active state
  const navItems = [
    { href: '/', icon: '📊', label: 'Dashboard' },
    { href: '/budget-dashboard', icon: '📋', label: 'Ngân sách' },
    { href: '/expenses', icon: '💰', label: 'Chi tiêu' },
    { href: '/debts', icon: '📝', label: 'Khoản nợ' },
    { href: '/recurring', icon: '🔄', label: 'Định kỳ' },
  ]

  const isActive = (href) => router.pathname === href

  return (
    <header className={bgClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo + Title + Navigation */}
          <div className="flex items-center gap-6">
            {/* Logo & Title - Compact */}
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                <span className="text-2xl">{icon}</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-white">{title}</h1>
                <p className="text-[#D2C1B6] text-xs">{subtitle}</p>
              </div>
            </div>

            {/* Navigation - Inline */}
            <nav className="hidden lg:flex items-center gap-2">
              {navItems.map((item) => (
                <Link 
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-[#456882] text-white border-2 border-[#D2C1B6] shadow-lg'
                      : 'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: User Menu */}
          <div className="flex items-center gap-2">
            {/* User Menu - Dropdown */}
            {session?.user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 rounded-lg px-3 py-1.5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer"
                  title="Menu người dùng"
                >
                  <img 
                    src={session.user.image} 
                    alt="avatar" 
                    className="w-8 h-8 rounded-full ring-2 ring-[#D2C1B6]" 
                  />
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-white leading-tight">{session.user.name?.split(' ')[0]}</p>
                  </div>
                  <span className="text-white text-xs">{showUserMenu ? '▲' : '▼'}</span>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className={`absolute right-0 mt-2 w-64 rounded-xl shadow-2xl border overflow-hidden z-50 ${
                    darkMode 
                      ? 'bg-slate-800 border-slate-700' 
                      : 'bg-white border-gray-200'
                  }`}>
                    {/* User Info */}
                    <div className={`px-4 py-3 border-b ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                      <div className="flex items-center gap-3">
                        <img 
                          src={session.user.image} 
                          alt="avatar" 
                          className="w-12 h-12 rounded-full ring-2 ring-[#D2C1B6]" 
                        />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {session.user.name}
                          </p>
                          <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {session.user.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      {/* Transaction History Link */}
                      <Link
                        href="/transaction-history"
                        onClick={() => setShowUserMenu(false)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${
                          darkMode 
                            ? 'hover:bg-slate-700 text-white' 
                            : 'hover:bg-gray-100 text-gray-700'
                        } ${
                          isActive('/transaction-history') 
                            ? darkMode ? 'bg-slate-700' : 'bg-gray-100'
                            : ''
                        }`}
                      >
                        <span className="text-xl">📜</span>
                        <span className="text-sm font-medium">Lịch sử giao dịch</span>
                      </Link>

                      {/* Divider */}
                      <div className={`my-1 border-t ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}></div>

                      {/* Dark Mode Toggle */}
                      {showDarkModeToggle && setDarkMode && (
                        <button
                          onClick={() => {
                            setDarkMode(!darkMode)
                            setShowUserMenu(false)
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${
                            darkMode 
                              ? 'hover:bg-slate-700 text-white' 
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          <span className="text-xl">{darkMode ? '☀️' : '🌙'}</span>
                          <span className="text-sm font-medium">
                            {darkMode ? 'Chế độ sáng' : 'Chế độ tối'}
                          </span>
                        </button>
                      )}

                      {/* Logout Button */}
                      <button
                        onClick={() => {
                          setShowUserMenu(false)
                          signOut()
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${
                          darkMode 
                            ? 'hover:bg-red-900/20 text-red-400' 
                            : 'hover:bg-red-50 text-red-600'
                        }`}
                      >
                        <span className="text-xl">🚪</span>
                        <span className="text-sm font-medium">Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Login Button when not authenticated */
              <Link
                href="/auth"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D2C1B6] to-[#456882] hover:from-[#456882] hover:to-[#234C6A] text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <span>🔐</span>
                <span>Đăng nhập</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation - Below header */}
        <nav className="lg:hidden flex items-center gap-2 mt-3 pt-3 border-t border-white/10 overflow-x-auto">
          {navItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                isActive(item.href)
                  ? 'bg-[#456882] text-white border-2 border-[#D2C1B6] shadow-lg'
                  : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
