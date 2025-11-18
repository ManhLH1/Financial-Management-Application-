const QUICK_RANGES = [
  { id: '7d', label: '7 ngày', days: 7 },
  { id: '30d', label: '30 ngày', days: 30 },
  { id: 'ytd', label: 'YTD', from: (today) => new Date(today.getFullYear(), 0, 1) }
]

function formatDate(date) {
  return date.toISOString().split('T')[0]
}

export default function DashboardFilters({
  dateRange,
  setDateRange,
  onExport,
  onBackup,
  isLoading,
  darkMode,
  cardBgClass,
  textClass
}) {
  const handleQuickRange = (range) => {
    const today = new Date()
    const endDate = formatDate(today)

    let startDate
    if (range.from) {
      startDate = formatDate(range.from(today))
    } else {
      const date = new Date()
      date.setDate(date.getDate() - (range.days - 1))
      startDate = formatDate(date)
    }

    setDateRange({ startDate, endDate })
  }

  const inputBaseClasses = darkMode
    ? 'bg-slate-700 border-slate-600 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
    : 'bg-white border-[#D2C1B6] focus:ring-2 focus:ring-[#234C6A] focus:border-transparent'

  return (
    <section
      className={`${cardBgClass} rounded-2xl shadow-xl border backdrop-blur-sm mb-8 ${
        darkMode ? 'border-slate-700/50' : 'border-gray-200'
      }`}
    >
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs tracking-[0.35em] text-gray-500 dark:text-gray-400 uppercase mb-1">
              Khoảng thời gian
            </p>
            <h2 className={`text-2xl font-semibold ${textClass}`}>
              Tùy chỉnh dữ liệu hiển thị
            </h2>
          </div>
          <div className="flex gap-2 flex-wrap">
            {QUICK_RANGES.map((range) => (
              <button
                key={range.id}
                onClick={() => handleQuickRange(range)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  darkMode
                    ? 'bg-white/5 text-gray-100 border border-white/10 hover:bg-white/10'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-white'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className={`text-sm font-medium ${textClass}`}>Từ ngày</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${inputBaseClasses}`}
            />
          </div>

          <div className="space-y-2">
            <label className={`text-sm font-medium ${textClass}`}>Đến ngày</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${inputBaseClasses}`}
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => onExport('csv')}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/25 transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <span>📤</span>
              <span>Xuất CSV</span>
            </button>
          </div>

          <div className="flex items-end">
            <button
              onClick={onBackup}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/25 transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <span>💾</span>
              <span>Tạo backup</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}


