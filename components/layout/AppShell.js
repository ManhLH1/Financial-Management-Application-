import Link from 'next/link'
import { signOut } from 'next-auth/react'

const navItems = [
  { href: '/dashboard-advanced', icon: 'dashboard', label: 'Tổng quan', key: 'overview' },
  { href: '/expenses', icon: 'receipt_long', label: 'Giao dịch', key: 'expenses' },
  { href: '/budget-dashboard', icon: 'account_balance_wallet', label: 'Ngân sách', key: 'budgets' },
  { href: '/transaction-history', icon: 'analytics', label: 'Báo cáo', key: 'reports' },
  { href: '/debts', icon: 'credit_card', label: 'Khoản nợ', key: 'debts' },
  { href: '/vocabulary', icon: 'menu_book', label: 'Học từ', key: 'vocabulary' },
  { href: '/workout/dashboard', icon: 'fitness_center', label: 'Gym', key: 'gym' }
]

export default function AppShell({
  title,
  activeMenu,
  searchPlaceholder = 'Tìm kiếm...',
  searchTerm = '',
  setSearchTerm,
  primaryActionLabel,
  onPrimaryAction,
  session,
  children,
  headerTabs,
  rightActions
}) {
  return (
    <div className="bg-[#0b1326] min-h-screen text-[#dae2fd] overflow-x-hidden">
      <aside className="fixed left-0 top-0 bottom-0 flex flex-col p-6 z-40 bg-[#060e20] w-64 shadow-[10px_0px_40px_rgba(18,74,240,0.05)]">
        <div className="mb-10 px-2">
          <h1 className="text-xl font-bold text-[#b8c3ff]">Orbit Ken</h1>
          {/* <p className="text-xs text-[#dae2fd]/40 font-medium tracking-widest uppercase">Private Banking</p> */}
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map(item => {
            const active = item.key === activeMenu
            if (active) {
              return (
                <div key={item.key} className="flex items-center gap-3 px-4 py-3 bg-[#2e5bff] text-white rounded-lg shadow-lg translate-x-1 text-sm font-semibold">
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              )
            }
            return (
              <Link key={item.key} href={item.href} className="flex items-center gap-3 px-4 py-3 text-[#dae2fd]/50 hover:text-[#dae2fd] hover:bg-[#2d3449] rounded-lg transition-all text-sm font-semibold">
                <span className="material-symbols-outlined">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto space-y-2">
          {primaryActionLabel && (
            <button onClick={onPrimaryAction} className="w-full mb-6 bg-gradient-to-br from-[#b8c3ff] to-[#2e5bff] text-[#001356] py-3 rounded-xl font-bold text-xs tracking-wider uppercase shadow-lg shadow-[#2e5bff]/20">
              {primaryActionLabel}
            </button>
          )}
          <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-4 py-3 text-[#dae2fd]/50 hover:text-[#dae2fd] hover:bg-[#2d3449] rounded-lg transition-all text-sm font-semibold">
            <span className="material-symbols-outlined">logout</span>
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      <header className="fixed top-0 right-0 left-64 z-30 flex justify-between items-center px-8 py-4 bg-slate-900/70 backdrop-blur-xl shadow-[0px_4px_20px_rgba(0,0,0,0.2)]">
        <div className="flex items-center gap-6">
          <h2 className="text-2xl font-bold tracking-tighter">{title}</h2>
          {headerTabs ? <div className="hidden md:flex items-center gap-8 ml-4">{headerTabs}</div> : null}
        </div>

        <div className="flex items-center gap-4">
          {setSearchTerm && (
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#8e90a2] text-sm">search</span>
              <input
                className="bg-[#060e20] border-none rounded-full py-2 pl-10 pr-4 text-sm w-64 focus:ring-1 focus:ring-[#b8c3ff]/40"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                type="text"
              />
            </div>
          )}
          {rightActions}
          <div className="h-8 w-8 rounded-full border border-[#b8c3ff]/20 bg-[#2d3449] grid place-items-center text-xs font-bold">
            {(session?.user?.name || 'U').slice(0, 1).toUpperCase()}
          </div>
        </div>
      </header>

      <main className="ml-64 pt-24 pb-12 px-8">{children}</main>
    </div>
  )
}
