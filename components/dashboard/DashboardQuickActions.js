import Link from 'next/link'

const DEFAULT_ACTIONS = [
  {
    id: 'add-transaction',
    label: 'Ghi giao dịch mới',
    description: 'Thu hoặc chi',
    href: '/transactions/new',
    accent: 'from-sky-500 to-cyan-500',
    icon: '➕'
  },
  {
    id: 'add-budget',
    label: 'Thiết lập ngân sách',
    description: 'Kiểm soát từng danh mục',
    href: '/budgets',
    accent: 'from-emerald-500 to-lime-500',
    icon: '🎯'
  },
  {
    id: 'add-debt',
    label: 'Theo dõi khoản nợ',
    description: 'Ghi chú và nhắc hạn',
    href: '/debts',
    accent: 'from-amber-500 to-orange-500',
    icon: '📝'
  },
  {
    id: 'export-data',
    label: 'Xuất dữ liệu',
    description: 'Excel • PDF • CSV',
    href: '/exports',
    accent: 'from-purple-500 to-indigo-500',
    icon: '📤'
  }
]

export default function DashboardQuickActions({ actions = DEFAULT_ACTIONS, darkMode }) {
  const baseClass = darkMode
    ? 'bg-white/5 border-white/10 hover:bg-white/10'
    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg'

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className={`text-sm uppercase tracking-[0.35em] ${darkMode ? 'text-white/60' : 'text-gray-400'}`}>
            Tác vụ nhanh
          </p>
          <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Thao tác chỉ với một chạm
          </h3>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {actions.map((action) => (
          <Link
            key={action.id}
            href={action.href}
            className={`${baseClass} group relative overflow-hidden rounded-2xl border p-4 transition-all duration-300`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${action.accent} text-xl text-white shadow-lg shadow-black/10`}
              >
                {action.icon}
              </div>
              <div>
                <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{action.label}</p>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{action.description}</p>
              </div>
            </div>
            <div
              className={`pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-gradient-to-br opacity-0 transition group-hover:opacity-60 ${action.accent}`}
            />
          </Link>
        ))}
      </div>
    </section>
  )
}


