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
    ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white'
    : 'bg-gradient-to-br from-[#0F172A] via-[#162347] to-[#0F172A] text-white'

  const surfaceClass = darkMode
    ? 'bg-white/5 border-white/10'
    : 'bg-white/10 border-white/20'

  const isActive = (href) =>
    router.pathname === href || router.pathname.startsWith(`${href}/`)

  return (
    <header className={`${bgClass} relative overflow-visible`}>
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute w-80 h-80 bg-blue-500/30 rounded-full blur-3xl -top-10 -left-16"></div>
        <div className="absolute w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl bottom-0 right-0"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_55%)]"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4 min-w-0">
              <div className="h-14 w-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-2xl shadow-lg shadow-black/20">
                <span>{icon}</span>
              </div>
              <div className="min-w-0 space-y-1">
                <p className="text-[11px] uppercase tracking-[0.35em] text-white/60">{greeting}</p>
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                  <p className="text-sm text-white/70 truncate">{subtitle}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-between lg:justify-end">
              <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border ${surfaceClass}`}>
                <div className="text-left">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/60">Hôm nay</p>
                  <p className="text-sm font-semibold">{formattedDate}</p>
                </div>
                <span className="text-white/30">•</span>
                <div className="text-left">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/60">Đồng bộ</p>
                  <p className="text-sm font-semibold">{formattedTime}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {showDarkModeToggle && setDarkMode && (
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="px-4 py-2 rounded-2xl border border-white/15 text-sm font-medium text-white/90 hover:bg-white/10 transition-all"
                    title={darkMode ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
                  >
                    {darkMode ? '☀️ Sáng' : '🌙 Tối'}
                  </button>
                )}
                <Link
                  href="/dashboard-advanced"
                  className="px-5 py-2 rounded-2xl bg-white text-slate-900 font-semibold shadow-lg shadow-black/25 hover:-translate-y-0.5 transition-transform whitespace-nowrap"
                >
                  Trung tâm báo cáo
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <nav className="flex flex-wrap gap-2 flex-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium transition-all backdrop-blur-sm ${
                    isActive(item.href)
                      ? 'bg-white text-slate-900 shadow-lg shadow-black/25'
                      : `${surfaceClass} text-white/80 hover:text-white`
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl min-w-[240px] ${surfaceClass}`}>
                <span className="text-lg text-white/60">⌕</span>
                <input
                  type="text"
                  placeholder="Tìm kiếm báo cáo, giao dịch..."
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  className="bg-transparent text-sm text-white placeholder-white/40 focus:outline-none flex-1"
                />
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/50">Ctrl K</span>
              </div>
              <button
                type="button"
                className={`h-11 w-11 rounded-2xl flex items-center justify-center text-lg shadow-lg shadow-black/20 ${surfaceClass}`}
                title="Thông báo"
              >
                🔔
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            {session?.user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu((prev) => !prev)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-2xl border text-left shadow-lg shadow-black/20 ${surfaceClass} hover:bg-white/20 transition-colors min-w-[220px]`}
                >
                  <div className="hidden sm:block">
                    <p className="text-xs text-white/60 uppercase tracking-[0.3em]">
                      {session.user.name?.split(' ')[0] || 'Người dùng'}
                    </p>
                    <p className="text-sm font-semibold text-white">Quản lý tài khoản</p>
                  </div>
                  <div className="flex items-center gap-2 ms-auto">
                    <img
                      src={session.user.image || '/icons/icon-72x72.png'}
                      alt="avatar"
                      className="w-10 h-10 rounded-full border-2 border-white/40 object-cover"
                    />
                    <span className="text-xs text-white/70">
                      {showUserMenu ? '▲' : '▼'}
                    </span>
                  </div>
                </button>

                {showUserMenu && (
                  <div
                    className={`absolute right-0 mt-3 w-80 rounded-3xl border shadow-2xl shadow-black/40 overflow-hidden backdrop-blur-xl z-50 ${darkMode ? 'bg-slate-900/95 border-white/10' : 'bg-white/95 border-slate-200'}`}
                  >
                    <div className={`${darkMode ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/60 text-white' : 'bg-gradient-to-br from-blue-50 to-blue-100 text-slate-900'} px-5 py-4`}>
                      <p className="text-xs uppercase tracking-[0.4em] opacity-70">
                        Tài khoản
                      </p>
                      <p className="text-lg font-semibold truncate">
                        {session.user.name}
                      </p>
                      <p className="text-sm opacity-80 truncate">
                        {session.user.email}
                      </p>
                    </div>

                    <div className="p-3 space-y-2">
                      <Link
                        href="/settings"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-2xl text-sm font-medium hover:bg-black/5 transition-colors"
                      >
                        <span>⚙️</span>
                        <span>Cài đặt tài khoản</span>
                      </Link>
                      <Link
                        href="/transaction-history"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-2xl text-sm font-medium hover:bg-black/5 transition-colors"
                      >
                        <span>🧾</span>
                        <span>Lịch sử giao dịch</span>
                      </Link>
                      <button
                        onClick={() => {
                          setShowUserMenu(false)
                          signOut()
                        }}
                        className="flex items-center gap-3 w-full px-3 py-2 rounded-2xl text-sm font-semibold text-red-500 hover:bg-red-50/50 transition-colors"
                      >
                        <span>🚪</span>
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth"
                className="px-5 py-2 rounded-2xl bg-white text-slate-900 font-semibold shadow-lg shadow-black/20 hover:translate-y-0.5 transition-transform"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

