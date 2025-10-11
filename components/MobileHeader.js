import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

export default function MobileHeader({ 
  title = 'Dashboard', 
  icon = '📊',
  darkMode = false,
  setDarkMode = null,
  showBackButton = false,
  onBack = null
}) {
  const { data: session } = useSession()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const userMenuRef = useRef(null)
  const mobileMenuRef = useRef(null)

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
    ? 'bg-gradient-to-r from-slate-900 to-slate-800 shadow-lg border-b border-slate-700' 
    : 'bg-gradient-to-r from-[#1B3C53] to-[#234C6A] shadow-lg'

  return (
    <>
      {/* Mobile Header - Compact */}
      <header className={`lg:hidden sticky top-0 z-40 ${bgClass}`}>
        <div className="px-4 py-3">
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
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Dark Mode Toggle */}
              {setDarkMode && (
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  title={darkMode ? 'Chế độ sáng' : 'Chế độ tối'}
                >
                  <span className="text-lg">{darkMode ? '☀️' : '🌙'}</span>
                </button>
              )}

              {/* User Avatar - Dropdown */}
              {session?.user && (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center justify-center w-9 h-9 rounded-full ring-2 ring-white/30 overflow-hidden"
                  >
                    <img 
                      src={session.user.image} 
                      alt="avatar" 
                      className="w-full h-full object-cover" 
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className={`absolute right-0 mt-2 w-64 rounded-xl shadow-2xl border overflow-hidden ${
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
                            className="w-12 h-12 rounded-full ring-2 ring-blue-400" 
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
                        {/* Transaction History */}
                        <Link
                          href="/transaction-history"
                          onClick={() => setShowUserMenu(false)}
                          className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                            darkMode 
                              ? 'hover:bg-slate-700 text-white' 
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          <span className="text-xl">📜</span>
                          <span className="text-sm font-medium">Lịch sử giao dịch</span>
                        </Link>

                        {/* Dashboard Advanced */}
                        <Link
                          href="/dashboard-advanced"
                          onClick={() => setShowUserMenu(false)}
                          className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                            darkMode 
                              ? 'hover:bg-slate-700 text-white' 
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          <span className="text-xl">📊</span>
                          <span className="text-sm font-medium">Phân tích nâng cao</span>
                        </Link>

                        {/* Divider */}
                        <div className={`my-1 border-t ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}></div>

                        {/* Logout */}
                        <button
                          onClick={() => {
                            setShowUserMenu(false)
                            signOut({ callbackUrl: '/auth' })
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
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
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
