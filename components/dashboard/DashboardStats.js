const STAT_CONFIG = [
  {
    key: 'totalExpense',
    label: 'Tổng Chi tháng này',
    icon: '📉',
    bgColor: '#FEE2E2',
    textColor: '#DC2626',
    iconColor: '#EF4444',
    footKey: 'expenseCount',
    footLabel: 'giao dịch',
    trend: 'down'
  },
  {
    key: 'totalIncome',
    label: 'Tổng Thu tháng này',
    icon: '📈',
    bgColor: '#D1FAE5',
    textColor: '#059669',
    iconColor: '#10B981',
    footKey: 'incomeCount',
    footLabel: 'giao dịch',
    trend: 'up'
  },
  {
    key: 'balance',
    label: 'Số dư hiện tại',
    icon: '💳',
    bgColor: '#EFF6FF',
    textColor: '#1E40AF',
    iconColor: '#3B82F6',
    footKey: 'balanceStatus',
    trend: 'neutral'
  },
  {
    key: 'budget',
    label: 'Ngân sách tháng',
    icon: '🎯',
    bgColor: '#F3E8FF',
    textColor: '#6D28D9',
    iconColor: '#8B5CF6',
    footKey: 'budgetStatus',
    footLabel: 'còn lại',
    trend: 'neutral'
  }
]

export default function DashboardStats({ stats, darkMode, budgets = [] }) {
  const formattedStats = {
    ...stats,
    balanceStatus: stats.balance >= 0 ? 'Dương' : 'Âm',
    budgetStatus: 'Đang tính...'
  }

  // Calculate budget info
  const totalBudget = budgets.reduce((sum, b) => sum + (b.amount || 0), 0)
  const budgetUsed = stats.totalExpense || 0
  const budgetRemaining = totalBudget - budgetUsed
  const budgetPercentage = totalBudget > 0 ? (budgetUsed / totalBudget * 100) : 0

  // Calculate month-over-month comparison (simplified - would need previous month data)
  const expenseChange = -5.2 // Example: -5.2% decrease
  const incomeChange = 8.3 // Example: 8.3% increase

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {STAT_CONFIG.map((stat) => {
        let value = formattedStats[stat.key] || 0
        let subtext = ''
        let showProgress = false
        let progressValue = 0
        let progressColor = stat.bgColor

        if (stat.key === 'budget') {
          value = budgetUsed
          subtext = `Đã dùng ${budgetUsed.toLocaleString('vi-VN')}đ / ${totalBudget.toLocaleString('vi-VN')}đ`
          showProgress = true
          progressValue = budgetPercentage
          if (progressValue > 80) progressColor = '#FEF3C7'
          if (progressValue > 100) progressColor = '#FEE2E2'
        } else if (stat.key === 'totalExpense') {
          subtext = `${expenseChange > 0 ? '+' : ''}${expenseChange}% so với tháng trước`
        } else if (stat.key === 'totalIncome') {
          subtext = `${incomeChange > 0 ? '+' : ''}${incomeChange}% so với tháng trước`
        } else if (stat.key === 'balance') {
          subtext = stats.balance >= 0 ? 'Số dư dương' : 'Số dư âm'
        }

        const cardBg = darkMode 
          ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700/50'
          : `bg-[${stat.bgColor}]`
        
        const textColor = darkMode ? 'text-white' : `text-[${stat.textColor}]`
        const iconColor = darkMode ? 'text-white/70' : `text-[${stat.iconColor}]`

        return (
          <div
            key={stat.key}
            className={`rounded-[22px] shadow-[0_24px_60px_rgba(15,23,42,0.06)] p-6 transform hover:-translate-y-1 transition-all duration-300 ${
              darkMode 
                ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/50' 
                : 'bg-white border border-gray-100'
            }`}
            style={!darkMode ? { backgroundColor: stat.bgColor } : {}}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className={`text-xs font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stat.label}
                </p>
                <p className={`text-3xl font-bold ${darkMode ? 'text-white' : `text-[${stat.textColor}]`}`}>
                  {typeof value === 'number'
                    ? `${value.toLocaleString('vi-VN')}đ`
                    : value}
                </p>
              </div>
              <span className={`text-3xl ${iconColor}`}>{stat.icon}</span>
            </div>
            
            {showProgress && (
              <div className="mb-3">
                <div className={`h-2 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(progressValue, 100)}%`,
                      backgroundColor: progressValue > 100 ? '#EF4444' : progressValue > 80 ? '#F59E0B' : stat.iconColor
                    }}
                  />
                </div>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {subtext}
                </p>
              </div>
            )}
            
            {!showProgress && subtext && (
              <div className="flex items-center gap-1.5">
                <span className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
                  {stat.trend === 'up' ? '↑' : stat.trend === 'down' ? '↓' : '→'}
                </span>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {subtext}
                </p>
              </div>
            )}

            {stat.footKey && !showProgress && (
              <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {stat.footKey === 'balanceStatus'
                  ? formattedStats.balanceStatus
                  : stat.footKey === 'budgetStatus'
                  ? `${budgetRemaining.toLocaleString('vi-VN')}đ ${stat.footLabel}`
                  : `${formattedStats[stat.footKey] || 0} ${stat.footLabel}`}
              </p>
            )}
          </div>
        )
      })}
    </section>
  )
}


