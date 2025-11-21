import Link from 'next/link'

const ACTIONS = [
  {
    id: 'add-transaction',
    label: 'Ghi mới',
    href: '/transactions/new',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
    color: 'blue'
  },
  {
    id: 'add-budget',
    label: 'Ngân sách',
    href: '/budgets',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'purple'
  },
  {
    id: 'add-debt',
    label: 'Khoản nợ',
    href: '/debts',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    color: 'amber'
  },
  {
    id: 'export',
    label: 'Xuất file',
    href: '/exports',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
    color: 'emerald'
  },
]

export default function DashboardQuickActions({ darkMode }) {
  return (
    <div className={`p-3 rounded-[32px] border mb-8 flex justify-around items-center ${darkMode
      ? 'bg-[#0F172A]/60 border-white/5 backdrop-blur-md'
      : 'bg-white border-slate-100 shadow-sm'
      }`}>
      {ACTIONS.map((action) => (
        <Link
          key={action.id}
          href={action.href}
          className={`flex flex-col items-center gap-3 p-4 rounded-[24px] transition-all duration-300 group ${darkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'
            }`}
        >
          <div className={`h-14 w-14 rounded-[20px] flex items-center justify-center text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1 ${darkMode
            ? 'bg-slate-800 border border-white/10 shadow-black/20'
            : 'bg-white border border-slate-100 text-slate-700 shadow-slate-200'
            }`}>
            <div className={`transition-colors duration-300 ${darkMode ? 'text-white' : 'text-slate-700 group-hover:text-indigo-600'}`}>
              {action.icon}
            </div>
          </div>
          <span className={`text-xs font-bold tracking-wide uppercase ${darkMode ? 'text-slate-400 group-hover:text-white' : 'text-slate-500 group-hover:text-slate-900'}`}>
            {action.label}
          </span>
        </Link>
      ))}
    </div>
  )
}
