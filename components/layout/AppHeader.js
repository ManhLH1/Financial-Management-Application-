import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useRef, useState } from 'react'

const NAV_ITEMS = [
  { href: '/', icon: '📊', label: 'Dashboard' },
  { href: '/budget-dashboard', icon: '🧭', label: 'Ngân sách' },
  { href: '/expenses', icon: '💸', label: 'Chi tiêu' },
  { href: '/debts', icon: '📑', label: 'Khoản nợ' },
  { href: '/recurring', icon: '🔁', label: 'Định kỳ' },
]

export default function AppHeader({
  title = 'Dashboard',
  subtitle = 'Tổng quan tài chính',
  icon = '📊',
  darkMode = false,
  setDarkMode = null,
  showDarkModeToggle = true,
}) {
  const { data: session } = useSession()
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [now, setNow] = useState(() => new Date())
  const userMenuRef = useRef(null)

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const greeting = useMemo(() => {
    const hour = now.getHours()
    if (hour < 11) return 'Chào buổi sáng'
    if (hour < 14) return 'Chúc buổi trưa hiệu quả'
    if (hour < 18) return 'Buổi chiều năng suất'
    return 'Tối thư giãn'
  }, [now])

  const formattedDate = useMemo(
    () =>
      now.toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    [now]
  )

  const formattedTime = useMemo(
    () =>
      now.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    [now]
  )

  const bgClass = darkMode
    ? 'bg-slate-950 text-white border-b border-white/10'
    : 'bg-white text-slate-900 border-b border-gray-200 shadow-sm'

  const surfaceClass = darkMode
    ? 'bg-white/5 border border-white/10 hover:bg-white/10 text-white'
    : 'bg-gray-100 border border-gray-200 hover:bg-gray-200 text-slate-900'

  const isActive = (href) =>
    router.pathname === href || router.pathname.startsWith(`${href}/`)

  return (
    <header className={`relative z-30 ${bgClass} transition-colors duration-300`}>
      {/* Background Effects - Only for Dark Mode */}
      {darkMode && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2"></div>
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]"></div>
        </div>
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col gap-6">
          {/* Top Section: Brand & User */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Brand */}
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg ${darkMode ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/20' : 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-blue-500/30'
                }`}>
                {icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight">{title}</h1>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${darkMode ? 'bg-white/10 text-white/80' : 'bg-blue-100 text-blue-700'
                    }`}>
                    Beta
                  </span>
                </div>
                <p className={`text-sm font-medium ${darkMode ? 'text-white/60' : 'text-slate-500'}`}>
                  {greeting}, {session?.user?.name?.split(' ')[0] || 'bạn'}
                </p>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 self-end lg:self-auto">
              {/* Search */}
              <div className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-xl w-64 group focus-within:w-80 transition-all ${surfaceClass}`}>
                <span className={`${darkMode ? 'text-white/40' : 'text-slate-400'}`}>🔍</span>
                <input
                  type="text"
                  placeholder="Tìm kiếm nhanh..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className={`bg-transparent border-none outline-none text-sm w-full ${darkMode ? 'placeholder-white/40 text-white' : 'placeholder-slate-400 text-slate-900'}`}
                />
                <kbd className={`hidden group-focus-within:inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium ${darkMode ? 'border-white/20 bg-white/5 text-white/50' : 'border-gray-300 bg-white text-slate-500'
                  }`}>
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>

              {/* Notifications */}
              <button className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${surfaceClass}`}>
                <span className="text-lg">🔔</span>
              </button>

              {/* User Menu */}
              {session?.user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className={`flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-xl transition-all ${surfaceClass} ${showUserMenu ? (darkMode ? 'bg-white/15' : 'bg-gray-200') : ''}`}
                  >
                    <img
                      src={session.user.image || '/icons/icon-72x72.png'}
                      alt="avatar"
                      className="w-8 h-8 rounded-lg object-cover ring-2 ring-white/10"
                    />
                    <div className="hidden sm:block text-left">
                      <p className={`text-xs font-bold ${darkMode ? 'text-white/90' : 'text-slate-900'}`}>{session.user.name}</p>
                      <p className={`text-[10px] ${darkMode ? 'text-white/50' : 'text-slate-500'}`}>Premium</p>
                    </div>
                  </button>

                  {/* Dropdown */}
                  {showUserMenu && (
                    <div className={`absolute right-0 mt-2 w-72 rounded-2xl border shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 ${darkMode ? 'bg-slate-900 border-white/10 shadow-black/50' : 'bg-white border-gray-200 shadow-slate-200'
                      }`}>
                      <div className={`p-4 border-b ${darkMode ? 'border-white/5 bg-white/5' : 'border-gray-100 bg-gray-50'}`}>
                        <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>{session.user.name}</p>
                        <p className={`text-xs truncate ${darkMode ? 'text-white/50' : 'text-slate-500'}`}>{session.user.email}</p>
                      </div>
                      <div className="p-2 space-y-1">
                        <Link href="/settings" className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${darkMode ? 'hover:bg-white/5 text-white/80 hover:text-white' : 'hover:bg-gray-100 text-slate-600 hover:text-slate-900'
                          }`}>
                          <span>⚙️</span> Cài đặt
                        </Link>
                        <button onClick={() => signOut()} className="flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-red-500/10 text-sm text-red-500 hover:text-red-600 transition-colors">
                          <span>🚪</span> Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/auth" className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                  Đăng nhập
                </Link>
              )}
            </div>
          </div>

          {/* Bottom Section: Navigation & Stats */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <nav className={`flex items-center gap-1 p-1.5 rounded-2xl border overflow-x-auto max-w-full ${darkMode ? 'bg-white/5 border-white/5' : 'bg-gray-100 border-gray-200'
              }`}>
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${isActive(item.href)
                      ? 'bg-blue-600 text-white shadow-md'
                      : darkMode
                        ? 'text-white/60 hover:text-white hover:bg-white/5'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-white shadow-sm'
                    }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className={`flex items-center gap-4 text-sm hidden lg:flex ${darkMode ? 'text-white/60' : 'text-slate-500'}`}>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-200'
                }`}>
                <span>📅</span>
                <span className="font-medium">{formattedDate}</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-200'
                }`}>
                <span>⏰</span>
                <span className="font-medium">{formattedTime}</span>
              </div>
              {showDarkModeToggle && setDarkMode && (
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-white/10 text-yellow-400' : 'hover:bg-gray-200 text-slate-600'
                    }`}
                  title={darkMode ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
                >
                  {darkMode ? '🌙' : '☀️'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
