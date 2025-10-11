import Link from 'next/link'
import { useRouter } from 'next/router'

export default function MobileBottomNav() {
  const router = useRouter()
  
  const navItems = [
    { 
      href: '/', 
      icon: '📊', 
      label: 'Trang chủ',
      activeIcon: '📊'
    },
    { 
      href: '/expenses', 
      icon: '💰', 
      label: 'Chi tiêu',
      activeIcon: '💰'
    },
    { 
      href: '/budget-dashboard', 
      icon: '📋', 
      label: 'Ngân sách',
      activeIcon: '📋'
    },
    { 
      href: '/debts', 
      icon: '📝', 
      label: 'Khoản nợ',
      activeIcon: '📝'
    },
    { 
      href: '/recurring', 
      icon: '🔄', 
      label: 'Định kỳ',
      activeIcon: '🔄'
    },
  ]

  const isActive = (href) => {
    if (href === '/') return router.pathname === '/'
    return router.pathname.startsWith(href)
  }

  return (
    <>
      {/* Bottom Navigation - Fixed */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 z-50 safe-bottom">
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 transition-all duration-200 relative ${
                  active
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {/* Active Indicator */}
                {active && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-blue-600 dark:bg-blue-400 rounded-b-full" />
                )}
                
                {/* Icon */}
                <span className={`text-2xl transition-transform duration-200 ${
                  active ? 'scale-110' : 'scale-100'
                }`}>
                  {active ? item.activeIcon : item.icon}
                </span>
                
                {/* Label */}
                <span className={`text-xs font-medium ${
                  active ? 'font-semibold' : 'font-normal'
                }`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Spacer for bottom nav */}
      <div className="lg:hidden h-16" />
    </>
  )
}
