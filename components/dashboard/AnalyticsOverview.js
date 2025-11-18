export default function AnalyticsOverview({ analytics, darkMode, cardBgClass, textClass }) {
  if (!analytics) return null

  const sectionClass = `${cardBgClass} rounded-2xl shadow-xl p-6 border backdrop-blur-sm ${
    darkMode ? 'border-slate-700/50' : 'border-gray-200'
  }`

  const subtleText = darkMode ? 'text-gray-400' : 'text-gray-500'

  return (
    <div className="space-y-6">
      <section className={sectionClass}>
        <h3 className={`text-xl font-bold mb-6 ${textClass} flex items-center gap-2`}>
          <span>📊</span> <span>So sánh tháng này vs tháng trước</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className={`${subtleText} mb-2 text-sm`}>Tháng hiện tại</p>
            <p className={`text-3xl font-bold ${textClass}`}>
              {Number(analytics.comparison.currentMonth.total).toLocaleString('vi-VN')}đ
            </p>
            <p className={`${subtleText} mt-1 text-sm`}>
              {analytics.comparison.currentMonth.count} giao dịch
            </p>
          </div>
          <div>
            <p className={`${subtleText} mb-2 text-sm`}>Tháng trước</p>
            <p className={`text-3xl font-bold ${textClass}`}>
              {Number(analytics.comparison.lastMonth.total).toLocaleString('vi-VN')}đ
            </p>
            <p className={`${subtleText} mt-1 text-sm`}>
              {analytics.comparison.lastMonth.count} giao dịch
            </p>
          </div>
          <div>
            <p className={`${subtleText} mb-2 text-sm`}>Thay đổi</p>
            <p
              className={`text-3xl font-bold ${
                analytics.comparison.change.trend === 'up'
                  ? 'text-red-500'
                  : analytics.comparison.change.trend === 'down'
                    ? 'text-emerald-500'
                    : subtleText
              }`}
            >
              {analytics.comparison.change.trend === 'up'
                ? '↑'
                : analytics.comparison.change.trend === 'down'
                  ? '↓'
                  : '→'}
              {Math.abs(analytics.comparison.change.percent)}%
            </p>
            <p className={`${subtleText} mt-1 text-sm`}>
              {Number(analytics.comparison.change.amount).toLocaleString('vi-VN')}đ
            </p>
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <h3 className={`text-xl font-bold mb-4 ${textClass} flex items-center gap-2`}>
          <span>🏆</span> <span>Top 5 chi tiêu lớn nhất</span>
        </h3>
        <div className="space-y-3">
          {analytics.top5.map((expense, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-200 ${
                darkMode
                  ? 'bg-slate-800/60 border border-white/5 hover:bg-slate-800/80'
                  : 'bg-gray-50 hover:bg-white border border-gray-100'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`h-12 w-12 rounded-2xl flex items-center justify-center text-lg font-bold ${
                    darkMode ? 'bg-white/5 text-white' : 'bg-white text-gray-700'
                  }`}
                >
                  #{index + 1}
                </div>
                <div>
                  <p className={`font-semibold ${textClass}`}>{expense.title}</p>
                  <p className={`${subtleText} text-sm`}>
                    {expense.category} • {expense.date}
                  </p>
                </div>
              </div>
              <p className={`text-lg font-bold ${darkMode ? 'text-rose-300' : 'text-red-500'}`}>
                {expense.amount.toLocaleString('vi-VN')}đ
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className={sectionClass}>
        <h3 className={`text-xl font-bold mb-4 ${textClass} flex items-center gap-2`}>
          <span>🔮</span> <span>Dự báo tháng này</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className={`${subtleText} text-sm mb-1`}>Trung bình/ngày</p>
            <p className={`text-2xl font-bold ${textClass}`}>
              {analytics.currentMonthProjection.dailyAverage.toLocaleString('vi-VN')}đ
            </p>
          </div>
          <div>
            <p className={`${subtleText} text-sm mb-1`}>Đã chi</p>
            <p className={`text-2xl font-bold ${textClass}`}>
              {analytics.currentMonthProjection.actualSoFar.toLocaleString('vi-VN')}đ
            </p>
          </div>
          <div>
            <p className={`${subtleText} text-sm mb-1`}>Dự kiến cuối tháng</p>
            <p className="text-2xl font-bold text-orange-500">
              {analytics.currentMonthProjection.projectedTotal.toLocaleString('vi-VN')}đ
            </p>
          </div>
          <div>
            <p className={`${subtleText} text-sm mb-1`}>Tháng sau (dự đoán)</p>
            <p className="text-2xl font-bold text-purple-500">
              {analytics.prediction.nextMonthPrediction.toLocaleString('vi-VN')}đ
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}


