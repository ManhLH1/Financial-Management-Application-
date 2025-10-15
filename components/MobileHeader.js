import { useSession, signOut, signIn } from 'next-auth/react'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function MobileHeader({ 
  title = 'Dashboard', 
  icon = '📊',
  darkMode = false,
  setDarkMode = null,
  showBackButton = false,
  onBack = null
}) {
  const { data: session } = useSession()
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const userMenuRef = useRef(null)
  const mobileMenuRef = useRef(null)

  // Detect scroll for dynamic header effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  const bgClass = darkMode 
    ? 'bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700' 
    : 'bg-gradient-to-r from-blue-600 to-blue-700'

  const shadowClass = isScrolled ? 'shadow-2xl' : 'shadow-md'

  return (
    <>
      {/* Mobile Header - Modern & Compact */}
      <header className={`lg:hidden sticky top-0 z-40 transition-all duration-300 ${bgClass} ${shadowClass}`}>
        <div className="px-3 py-2.5">
          <div className="flex items-center justify-between">
            {/* Left: Back button or Logo */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {showBackButton ? (
                <button
                  onClick={onBack}
                  className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex-shrink-0"
                >
                  <span className="text-white text-lg">←</span>
                </button>
              ) : (
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 flex-shrink-0">
                  <span className="text-xl">{icon}</span>
                </div>
              )}
              
              {/* Title - Truncated */}
              <h1 className="text-base font-bold text-white truncate">
                {title}
              </h1>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Dark Mode Toggle */}
              {setDarkMode && (
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all backdrop-blur-sm"
                  title={darkMode ? 'Chế độ sáng' : 'Chế độ tối'}
                >
                  <span className="text-base">{darkMode ? '☀️' : '🌙'}</span>
                </button>
              )}

              {/* Login Button - Show when not logged in */}
              {!session && (
                <button
                  onClick={() => signIn('google', { callbackUrl: '/' })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-blue-600 hover:bg-blue-50 active:scale-95 transition-all font-medium text-sm shadow-md"
                >
                  <span>🔐</span>
                  <span>Đăng nhập</span>
                </button>
              )}

              {/* User Avatar - Dropdown */}
              {session?.user && (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center justify-center w-9 h-9 rounded-full ring-2 ring-white/40 hover:ring-white/60 overflow-hidden transition-all active:scale-95 shadow-md"
                  >
                    <img 
                      src={session.user.image} 
                      alt="avatar" 
                      className="w-full h-full object-cover" 
                    />
                  </button>

                  {/* Dropdown Menu - Modern Design */}
                  {showUserMenu && (
                    <div className={`absolute right-0 mt-3 w-72 rounded-2xl shadow-2xl border overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200 ${
                      darkMode 
                        ? 'bg-slate-800/95 border-slate-700' 
                        : 'bg-white/95 border-gray-200'
                    }`}>
                      {/* User Info - Enhanced */}
                      <div className={`px-4 py-4 border-b ${
                        darkMode 
                          ? 'border-slate-700 bg-gradient-to-br from-slate-700/50 to-slate-800/50' 
                          : 'border-gray-100 bg-gradient-to-br from-blue-50/50 to-indigo-50/50'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img 
                              src={session.user.image} 
                              alt="avatar" 
                              className="w-14 h-14 rounded-full ring-2 ring-blue-400 shadow-lg" 
                            />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {session.user.name}
                            </p>
                            <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {session.user.email}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 font-medium">
                                ✨ Premium
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items - Modern Design */}
                      <div className="py-1">
                        {/* Quick Actions Grid */}
                        <div className="grid grid-cols-2 gap-2 px-3 py-3">
                          <Link
                            href="/transaction-history"
                            onClick={() => setShowUserMenu(false)}
                            className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all active:scale-95 ${
                              darkMode 
                                ? 'bg-slate-700/50 hover:bg-slate-700 text-white' 
                                : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            <span className="text-2xl">📜</span>
                            <span className="text-xs font-medium text-center">Lịch sử</span>
                          </Link>

                          <Link
                            href="/dashboard-advanced"
                            onClick={() => setShowUserMenu(false)}
                            className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all active:scale-95 ${
                              darkMode 
                                ? 'bg-slate-700/50 hover:bg-slate-700 text-white' 
                                : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            <span className="text-2xl">📊</span>
                            <span className="text-xs font-medium text-center">Phân tích</span>
                          </Link>
                        </div>

                        {/* Divider */}
                        <div className={`mx-3 my-2 border-t ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}></div>

                        {/* Settings & Logout */}
                        <div className="px-3 pb-2 space-y-1">
                          <Link
                            href="/settings"
                            onClick={() => setShowUserMenu(false)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all active:scale-95 ${
                              darkMode 
                                ? 'hover:bg-slate-700 text-white' 
                                : 'hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            <span className="text-lg">⚙️</span>
                            <span className="text-sm font-medium">Cài đặt</span>
                          </Link>

                          <button
                            onClick={() => {
                              setShowUserMenu(false)
                              signOut({ callbackUrl: '/auth' })
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all active:scale-95 ${
                              darkMode 
                                ? 'hover:bg-red-900/30 text-red-400' 
                                : 'hover:bg-red-50 text-red-600'
                            }`}
                          >
                            <span className="text-lg">🚪</span>
                            <span className="text-sm font-medium">Đăng xuất</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
