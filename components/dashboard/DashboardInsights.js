const trendColors = {
  up: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400',
  down: 'text-rose-600 bg-rose-50 dark:bg-rose-900/30 dark:text-rose-400',
  neutral: 'text-slate-600 bg-slate-50 dark:bg-slate-700/50 dark:text-slate-400'
}

export default function DashboardInsights({ insights = [], darkMode, cardBgClass, textClass, stats = {}, categoryData = {} }) {
  const borderClass = darkMode ? 'border-slate-700/50' : 'border-gray-100'
  const subtleText = darkMode ? 'text-gray-400' : 'text-gray-600'

  // Calculate additional insights
  const topCategoryEntry = Object.entries(categoryData).sort((a, b) => b[1] - a[1])[0]
  const topCategoryPercent = topCategoryEntry && stats.totalExpense > 0 
    ? ((topCategoryEntry[1] / stats.totalExpense) * 100).toFixed(1) 
    : 0

  // Calculate days until budget exhausted (simplified)
  const dailyAverage = stats.totalExpense / 30 // Assuming 30 days
  const daysUntilExhausted = dailyAverage > 0 ? Math.ceil((stats.totalIncome - stats.totalExpense) / dailyAverage) : 0

  // Financial health insight
  const financialHealth = stats.balance >= 0 && stats.totalIncome > 0 
    ? (stats.balance / stats.totalIncome) * 100 > 20 
      ? 'Bạn đang chi tiêu ổn định' 
      : 'Cần theo dõi chi tiêu'
    : 'Cần cải thiện tình hình tài chính'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Insight 1: Tình hình tài chính */}
      <div className={`lg:col-span-2 ${cardBgClass} rounded-[22px] border ${borderClass} p-6 shadow-[0_24px_60px_rgba(15,23,42,0.06)]`}>
        <div className="mb-6">
          <p className={`text-xs font-medium uppercase tracking-wider ${subtleText}`}>Insight tài chính</p>
          <h3 className={`text-xl font-bold mt-1 ${textClass}`}>Tình hình tài chính</h3>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className={`rounded-xl p-4 ${darkMode ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
            <p className={`text-xs ${subtleText} mb-1`}>Tổng giao dịch</p>
            <p className={`text-2xl font-bold ${textClass}`}>
              {(stats.expenseCount || 0) + (stats.incomeCount || 0)}
            </p>
          </div>
          <div className={`rounded-xl p-4 ${darkMode ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
            <p className={`text-xs ${subtleText} mb-1`}>Ngày vượt mức</p>
            <p className={`text-2xl font-bold ${textClass}`}>0</p>
          </div>
          <div className={`rounded-xl p-4 ${darkMode ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
            <p className={`text-xs ${subtleText} mb-1`}>Tỷ lệ kiểm soát</p>
            <p className={`text-2xl font-bold ${textClass}`}>
              {stats.totalIncome > 0 ? ((stats.totalIncome - stats.totalExpense) / stats.totalIncome * 100).toFixed(0) : 0}%
            </p>
          </div>
        </div>

        <div className={`rounded-xl p-4 ${darkMode ? 'bg-blue-900/20 border border-blue-800/30' : 'bg-blue-50 border border-blue-100'}`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🤖</span>
            <div>
              <p className={`text-sm font-semibold ${darkMode ? 'text-blue-300' : 'text-blue-900'} mb-1`}>
                Nhận xét AI
              </p>
              <p className={`text-sm ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                {financialHealth}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Insight 2: Cảnh báo */}
      <div className={`${cardBgClass} rounded-[22px] border ${borderClass} p-6 shadow-[0_24px_60px_rgba(15,23,42,0.06)]`}>
        <div className="mb-6">
          <p className={`text-xs font-medium uppercase tracking-wider ${subtleText}`}>Cảnh báo</p>
          <h3 className={`text-xl font-bold mt-1 ${textClass}`}>Theo dõi chi tiêu</h3>
        </div>

        <div className="space-y-4">
          {topCategoryEntry && (
            <div className={`rounded-xl p-4 ${darkMode ? 'bg-amber-900/20 border border-amber-800/30' : 'bg-amber-50 border border-amber-100'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <p className={`text-xs font-semibold ${darkMode ? 'text-amber-300' : 'text-amber-900'}`}>
                  Danh mục chi nhiều nhất
                </p>
              </div>
              <p className={`text-lg font-bold ${darkMode ? 'text-amber-200' : 'text-amber-800'}`}>
                {topCategoryEntry[0]}
              </p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}>
                {topCategoryPercent}% tổng chi
              </p>
            </div>
          )}

          {daysUntilExhausted > 0 && daysUntilExhausted < 10 && (
            <div className={`rounded-xl p-4 ${darkMode ? 'bg-red-900/20 border border-red-800/30' : 'bg-red-50 border border-red-100'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <p className={`text-xs font-semibold ${darkMode ? 'text-red-300' : 'text-red-900'}`}>
                  Dự báo hết ngân sách
                </p>
              </div>
              <p className={`text-lg font-bold ${darkMode ? 'text-red-200' : 'text-red-800'}`}>
                {daysUntilExhausted} ngày
              </p>
            </div>
          )}

          <div className={`rounded-xl p-4 ${darkMode ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
            <p className={`text-xs font-semibold ${subtleText} mb-2`}>Gợi ý cắt giảm</p>
            <p className={`text-sm ${textClass}`}>
              {topCategoryEntry ? `Giảm chi tiêu cho ${topCategoryEntry[0]}` : 'Theo dõi chi tiêu hàng ngày'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


