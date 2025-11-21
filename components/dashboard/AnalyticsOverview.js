export default function AnalyticsOverview({ analytics, darkMode }) {
  if (!analytics) return null

  const sectionClass = `rounded-[24px] p-6 transition-all duration-300 ${darkMode
      ? 'bg-slate-800/50 border border-slate-700/50 shadow-xl'
      : 'bg-white border border-gray-100 shadow-sm'
    }`

  return (
    <div className="space-y-6">
      <section className={sectionClass}>
        <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          <span>📊</span> <span>So sánh tháng này vs tháng trước</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`rounded-2xl p-4 ${darkMode ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
            <p className={`text-sm font-medium mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Tháng hiện tại</p>
            <p className={`text-3xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              {Number(analytics.comparison.currentMonth.total).toLocaleString('vi-VN')}đ
            </p>
            <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {analytics.comparison.currentMonth.count} giao dịch
            </p>
          </div>
          <div className={`rounded-2xl p-4 ${darkMode ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
            <p className={`text-sm font-medium mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Tháng trước</p>
            <p className={`text-3xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              {Number(analytics.comparison.lastMonth.total).toLocaleString('vi-VN')}đ
            </p>
            <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {analytics.comparison.lastMonth.count} giao dịch
            </p>
          </div>
          <div className={`rounded-2xl p-4 ${darkMode ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
            <p className={`text-sm font-medium mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Thay đổi</p>
            <p
              className={`text-3xl font-bold tracking-tight ${analytics.comparison.change.trend === 'up'
                  ? 'text-rose-500'
                  : analytics.comparison.change.trend === 'down'
                    ? 'text-emerald-500'
                    : darkMode ? 'text-slate-400' : 'text-slate-500'
                }`}
            >
              {analytics.comparison.change.trend === 'up'
                ? '↑'
                : analytics.comparison.change.trend === 'down'
                  ? '↓'
                  : '→'}
              {Math.abs(analytics.comparison.change.percent)}%
            </p>
            <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {Number(analytics.comparison.change.amount).toLocaleString('vi-VN')}đ
            </p>
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          <span>🏆</span> <span>Top 5 chi tiêu lớn nhất</span>
        </h3>
        <div className="space-y-2">
          {analytics.top5.map((expense, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-200 ${darkMode
                  ? 'bg-slate-700/30 hover:bg-slate-700/50'
                  : 'bg-slate-50 hover:bg-slate-100'
                }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold ${darkMode ? 'bg-slate-600 text-white' : 'bg-white text-slate-700 shadow-sm'
                    }`}
                >
                  #{index + 1}
                </div>
                <div>
                  <p className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{expense.title}</p>
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {expense.category} • {expense.date}
                  </p>
                </div>
              </div>
              <p className={`text-lg font-bold ${darkMode ? 'text-rose-400' : 'text-rose-600'}`}>
                {expense.amount.toLocaleString('vi-VN')}đ
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className={sectionClass}>
        <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          <span>🔮</span> <span>Dự báo tháng này</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`rounded-2xl p-4 ${darkMode ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
            <p className={`text-xs font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Trung bình/ngày</p>
            <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              {analytics.currentMonthProjection.dailyAverage.toLocaleString('vi-VN')}đ
            </p>
          </div>
          <div className={`rounded-2xl p-4 ${darkMode ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
            <p className={`text-xs font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Đã chi</p>
            <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              {analytics.currentMonthProjection.actualSoFar.toLocaleString('vi-VN')}đ
            </p>
          </div>
          <div className={`rounded-2xl p-4 ${darkMode ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
            <p className={`text-xs font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Dự kiến cuối tháng</p>
            <p className="text-xl font-bold text-amber-500">
              {analytics.currentMonthProjection.projectedTotal.toLocaleString('vi-VN')}đ
            </p>
          </div>
          <div className={`rounded-2xl p-4 ${darkMode ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
            <p className={`text-xs font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Tháng sau (dự đoán)</p>
            <p className="text-xl font-bold text-purple-500">
              {analytics.prediction.nextMonthPrediction.toLocaleString('vi-VN')}đ
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
