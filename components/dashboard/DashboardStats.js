const STAT_CONFIG = [
  {
    key: 'expenseCount',
    label: 'Giao dịch chi',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
      </svg>
    ),
    color: 'rose',
    gradient: 'from-rose-500 to-pink-600'
  },
  {
    key: 'incomeCount',
    label: 'Giao dịch thu',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    key: 'debtCount',
    label: 'Khoản nợ',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    key: 'savingsRate',
    label: 'Tiết kiệm',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-600',
    isPercent: true
  }
]

export default function DashboardStats({ stats, darkMode }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {STAT_CONFIG.map((stat) => {
        const value = stat.isPercent
          ? `${(stats[stat.key] || 0).toFixed(1)}%`
          : (stats[stat.key] || 0)

        return (
          <div
            key={stat.key}
            className={`group relative p-5 rounded-[24px] border backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 ${darkMode
                ? 'bg-slate-800/40 border-white/5 hover:bg-slate-800/60 hover:border-white/10'
                : 'bg-white border-slate-100 hover:shadow-xl shadow-sm'
              }`}
          >
            <div className={`absolute inset-0 rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${stat.gradient} blur-xl -z-10 opacity-20`}></div>

            <div className="flex flex-col gap-4">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br ${stat.gradient}`}>
                {stat.icon}
              </div>

              <div>
                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {stat.label}
                </p>
                <p className={`text-3xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {value}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
