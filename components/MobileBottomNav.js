import Link from 'next/link'
import { useRouter } from 'next/router'

export default function MobileBottomNav() {
  const router = useRouter()
  
  const navItems = [
    { 
      href: '/', 
      icon: '📊', 
      label: 'Trang chủ',
      activeIcon: '📊',
      color: 'blue'
    },
    { 
      href: '/expenses', 
      icon: '💰', 
      label: 'Chi tiêu',
      activeIcon: '💰',
      color: 'emerald'
    },
    { 
      href: '/budget-dashboard', 
      icon: '📋', 
      label: 'Ngân sách',
      activeIcon: '📋',
      color: 'purple'
    },
    { 
      href: '/debts', 
      icon: '📝', 
      label: 'Khoản nợ',
      activeIcon: '📝',
      color: 'orange'
    },
    { 
      href: '/recurring', 
      icon: '🔄', 
      label: 'Định kỳ',
      activeIcon: '🔄',
      color: 'pink'
    },
  ]

  const isActive = (href) => {
    if (href === '/') return router.pathname === '/'
    return router.pathname.startsWith(href)
  }

  const getColorClass = (color, active) => {
    const colors = {
      blue: active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-500',
      emerald: active ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-500',
      purple: active ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-500',
      orange: active ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-gray-500',
      pink: active ? 'text-pink-600 dark:text-pink-400' : 'text-gray-500 dark:text-gray-500',
    }
    return colors[color] || colors.blue
  }

  const getBgClass = (color) => {
    const colors = {
      blue: 'bg-blue-500',
      emerald: 'bg-emerald-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      pink: 'bg-pink-500',
    }
    return colors[color] || colors.blue
  }

  return (
    <>
      {/* Bottom Navigation - Modern Floating Design */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-3 pb-safe">
        {/* Glass morphism container */}
        <div className="mx-auto max-w-md mb-3">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-slate-700/50 rounded-2xl shadow-2xl">
            <div className="grid grid-cols-5 h-16">
              {navItems.map((item) => {
                const active = isActive(item.href)
                const colorClass = getColorClass(item.color, active)
                const bgClass = getBgClass(item.color)
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex flex-col items-center justify-center gap-0.5 transition-all duration-300 relative group ${colorClass}`}
                  >
                    {/* Active Indicator - Pill */}
                    {active && (
                      <div className={`absolute inset-x-2 inset-y-2 ${bgClass} opacity-10 rounded-xl`} />
                    )}
                    
                    {/* Icon Container */}
                    <div className={`relative transition-all duration-300 ${
                      active ? 'scale-110 -translate-y-0.5' : 'scale-100 group-hover:scale-105'
                    }`}>
                      <span className="text-2xl drop-shadow-sm">
                        {active ? item.activeIcon : item.icon}
                      </span>
                    </div>
                    
                    {/* Label */}
                    <span className={`text-[10px] leading-tight transition-all duration-300 ${
                      active ? 'font-bold' : 'font-medium group-hover:font-semibold'
                    }`}>
                      {item.label}
                    </span>

                    {/* Ripple effect on tap */}
                    <div className="absolute inset-0 rounded-xl group-active:bg-black/5 dark:group-active:bg-white/5 transition-colors" />
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer for bottom nav */}
      <div className="lg:hidden h-20" />
    </>
  )
}
