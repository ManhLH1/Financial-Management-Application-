export default function DashboardInsights({ insights = [], darkMode, stats = {}, categoryData = {} }) {
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
      {/* Insight 1: Tình hình tài chính */}
      <div className={`lg:col-span-2 rounded-[32px] p-8 transition-all duration-300 ${darkMode
        ? 'bg-[#0F172A]/60 border border-white/5 backdrop-blur-md'
        : 'bg-white border border-slate-100 shadow-sm'
        }`}>
        <div className="mb-8">
          <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
            Insight tài chính
          </p>
          <h3 className={`text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Phân tích tổng quan
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className={`rounded-[24px] p-6 ${darkMode ? 'bg-slate-800/50 border border-white/5' : 'bg-slate-50 border border-slate-100'}`}>
            <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Tổng giao dịch
            </p>
            <p className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              {(stats.expenseCount || 0) + (stats.incomeCount || 0)}
            </p>
          </div>
          <div className={`rounded-[24px] p-6 ${darkMode ? 'bg-slate-800/50 border border-white/5' : 'bg-slate-50 border border-slate-100'}`}>
            <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Ngày vượt mức
            </p>
            <p className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>0</p>
          </div>
          <div className={`rounded-[24px] p-6 ${darkMode ? 'bg-slate-800/50 border border-white/5' : 'bg-slate-50 border border-slate-100'}`}>
            <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Tỷ lệ kiểm soát
            </p>
            <p className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              {stats.totalIncome > 0 ? ((stats.totalIncome - stats.totalExpense) / stats.totalIncome * 100).toFixed(0) : 0}%
            </p>
          </div>
        </div>

        <div className={`rounded-[24px] p-6 relative overflow-hidden ${darkMode
          ? 'bg-gradient-to-br from-indigo-900/20 to-blue-900/20 border border-indigo-500/20'
          : 'bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100'
          }`}>
          <div className="flex items-start gap-5 relative z-10">
            <div className={`p-3.5 rounded-2xl shadow-lg ${darkMode ? 'bg-indigo-500 text-white' : 'bg-white text-indigo-600'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className={`text-sm font-bold uppercase tracking-wider mb-1 ${darkMode ? 'text-indigo-300' : 'text-indigo-800'}`}>
                AI Assistant
              </p>
              <p className={`text-base font-medium leading-relaxed ${darkMode ? 'text-indigo-100' : 'text-indigo-900'}`}>
                {financialHealth}. Dựa trên dữ liệu chi tiêu hiện tại, bạn nên cân nhắc điều chỉnh ngân sách cho danh mục <span className="font-bold underline decoration-2 decoration-indigo-400">{topCategoryEntry?.[0] || 'chi tiêu'}</span>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Insight 2: Cảnh báo */}
      <div className={`rounded-[32px] p-8 transition-all duration-300 ${darkMode
        ? 'bg-[#0F172A]/60 border border-white/5 backdrop-blur-md'
        : 'bg-white border border-slate-100 shadow-sm'
        }`}>
        <div className="mb-8">
          <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${darkMode ? 'text-rose-400' : 'text-rose-600'}`}>
            Cảnh báo
          </p>
          <h3 className={`text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Theo dõi chi tiêu
          </h3>
        </div>

        <div className="space-y-4">
          {topCategoryEntry && (
            <div className={`rounded-[24px] p-5 ${darkMode ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-100'}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
                <p className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                  Chi nhiều nhất
                </p>
              </div>
              <p className={`text-xl font-bold mb-2 ${darkMode ? 'text-amber-100' : 'text-amber-900'}`}>
                {topCategoryEntry[0]}
              </p>
              <div className="w-full bg-amber-200/20 rounded-full h-2 mb-2">
                <div className="bg-amber-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.min(topCategoryPercent, 100)}%` }}></div>
              </div>
              <p className={`text-xs font-medium ${darkMode ? 'text-amber-300/80' : 'text-amber-700/80'}`}>
                Chiếm {topCategoryPercent}% tổng chi tiêu
              </p>
            </div>
          )}

          {daysUntilExhausted > 0 && daysUntilExhausted < 10 && (
            <div className={`rounded-[24px] p-5 ${darkMode ? 'bg-rose-500/10 border border-rose-500/20' : 'bg-rose-50 border border-rose-100'}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
                <p className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-rose-400' : 'text-rose-700'}`}>
                  Dự báo
                </p>
              </div>
              <p className={`text-sm font-medium leading-relaxed ${darkMode ? 'text-rose-200' : 'text-rose-800'}`}>
                Ngân sách có thể hết trong <span className="font-bold text-lg mx-1">{daysUntilExhausted} ngày</span> tới nếu duy trì mức chi hiện tại.
              </p>
            </div>
          )}

          <div className={`rounded-[24px] p-5 ${darkMode ? 'bg-slate-800/50 border border-white/5' : 'bg-slate-50 border border-slate-100'}`}>
            <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Gợi ý hành động
            </p>
            <p className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              {topCategoryEntry ? `👉 Cắt giảm chi tiêu cho ${topCategoryEntry[0]} để cân bằng ngân sách.` : '👉 Theo dõi chi tiêu hàng ngày để tối ưu hóa.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
