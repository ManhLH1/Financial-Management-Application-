const STAT_CONFIG = [
  {
    key: 'totalIncome',
    label: 'Thu nhập',
    icon: '💰',
    gradientLight: 'from-emerald-400 to-emerald-600',
    gradientDark: 'from-emerald-600 to-teal-700',
    footKey: 'incomeCount',
    footLabel: 'giao dịch'
  },
  {
    key: 'totalExpense',
    label: 'Chi tiêu',
    icon: '💸',
    gradientLight: 'from-rose-400 to-rose-600',
    gradientDark: 'from-rose-600 to-pink-700',
    footKey: 'expenseCount',
    footLabel: 'giao dịch'
  },
  {
    key: 'balance',
    label: 'Số dư',
    icon: '⚖️',
    positiveGradientLight: 'from-sky-400 to-blue-600',
    positiveGradientDark: 'from-blue-600 to-cyan-700',
    negativeGradientLight: 'from-amber-400 to-orange-600',
    negativeGradientDark: 'from-orange-600 to-amber-700',
    footKey: 'balanceStatus'
  },
  {
    key: 'totalDebt',
    label: 'Khoản nợ',
    icon: '📝',
    gradientLight: 'from-purple-400 to-violet-600',
    gradientDark: 'from-purple-600 to-indigo-700',
    footKey: 'debtCount',
    footLabel: 'khoản'
  }
]

export default function DashboardStats({ stats, darkMode }) {
  const formattedStats = {
    ...stats,
    balanceStatus: stats.balance >= 0 ? 'Dương' : 'Âm'
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {STAT_CONFIG.map((stat) => {
        const value = formattedStats[stat.key] || 0
        const isBalance = stat.key === 'balance'
        const positive = value >= 0

        const gradient = isBalance
          ? darkMode
            ? positive
              ? stat.positiveGradientDark
              : stat.negativeGradientDark
            : positive
              ? stat.positiveGradientLight
              : stat.negativeGradientLight
          : darkMode
            ? stat.gradientDark
            : stat.gradientLight

        return (
          <div
            key={stat.key}
            className={`rounded-2xl shadow-lg p-6 text-white transform hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br ${gradient}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex flex-col gap-1">
                <p className="text-xs uppercase tracking-[0.35em] text-white/70">
                  {stat.label}
                </p>
                <p className="text-3xl font-semibold">
                  {typeof value === 'number'
                    ? `${value.toLocaleString('vi-VN')}đ`
                    : value}
                </p>
              </div>
              <span className="text-3xl">{stat.icon}</span>
            </div>
            {stat.footKey && (
              <p className="text-sm text-white/80">
                {stat.footKey === 'balanceStatus'
                  ? formattedStats.balanceStatus
                  : `${formattedStats[stat.footKey] || 0} ${stat.footLabel}`}
              </p>
            )}
          </div>
        )
      })}
    </section>
  )
}


