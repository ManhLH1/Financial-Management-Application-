import Link from 'next/link'

const DEFAULT_ACTIONS = [
  {
    id: 'add-transaction',
    label: 'Ghi giao dịch',
    description: 'Thu hoặc chi',
    href: '/transactions/new',
    bgColor: '#EFF6FF',
    iconColor: '#3B82F6',
    icon: '➕'
  },
  {
    id: 'add-budget',
    label: 'Thiết lập ngân sách',
    description: 'Kiểm soát từng danh mục',
    href: '/budgets',
    bgColor: '#F3E8FF',
    iconColor: '#6D28D9',
    icon: '💰'
  },
  {
    id: 'add-debt',
    label: 'Theo dõi khoản nợ',
    description: 'Ghi chú và nhắc hạn',
    href: '/debts',
    bgColor: '#FEF3C7',
    iconColor: '#F59E0B',
    icon: '📌'
  },
  {
    id: 'export-data',
    label: 'Xuất dữ liệu',
    description: 'Excel • PDF • CSV',
    href: '/exports',
    bgColor: '#ECFDF5',
    iconColor: '#10B981',
    icon: '📤'
  }
]

export default function DashboardQuickActions({ actions = DEFAULT_ACTIONS, darkMode }) {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className={`text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Tác vụ nhanh
          </p>
          <h3 className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Thao tác chỉ với một chạm
          </h3>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action) => (
          <Link
            key={action.id}
            href={action.href}
            className={`group relative overflow-hidden rounded-[22px] p-6 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)] ${
              darkMode 
                ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/50' 
                : 'bg-white border border-gray-100'
            }`}
            style={!darkMode ? { backgroundColor: action.bgColor } : {}}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl shadow-lg"
                style={{ backgroundColor: action.iconColor + '20', color: action.iconColor }}
              >
                {action.icon}
              </div>
              <div>
                <p className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>{action.label}</p>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{action.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}


