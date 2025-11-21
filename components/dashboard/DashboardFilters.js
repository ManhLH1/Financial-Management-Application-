const QUICK_RANGES = [
  { id: '7d', label: '7 ngày', days: 7 },
  { id: '30d', label: '30 ngày', days: 30 },
  { id: 'ytd', label: 'Năm nay', from: (today) => new Date(today.getFullYear(), 0, 1) }
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
  darkMode
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

  return (
    <div className={`w-full rounded-[32px] p-2 transition-all duration-300 ${darkMode
        ? 'bg-[#0F172A]/80 border border-white/5 backdrop-blur-xl shadow-2xl shadow-black/20'
        : 'bg-white/80 border border-white/60 shadow-xl shadow-blue-500/5 backdrop-blur-xl'
      }`}>
      <div className="flex flex-col lg:flex-row items-center gap-2 p-2">

        {/* Date Inputs Group */}
        <div className={`flex-1 w-full flex items-center gap-2 p-1.5 rounded-[24px] ${darkMode ? 'bg-slate-900/50' : 'bg-slate-100/50'}`}>
          <div className="relative flex-1 group">
            <div className={`absolute inset-y-0 left-3 flex items-center pointer-events-none ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className={`w-full pl-10 pr-4 py-2.5 text-sm font-semibold rounded-[20px] outline-none transition-all ${darkMode
                  ? 'bg-transparent text-white focus:bg-white/5 placeholder-slate-500'
                  : 'bg-transparent text-slate-900 focus:bg-white placeholder-slate-400'
                }`}
            />
          </div>
          <div className={darkMode ? 'text-slate-600' : 'text-slate-400'}>→</div>
          <div className="relative flex-1 group">
            <div className={`absolute inset-y-0 left-3 flex items-center pointer-events-none ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className={`w-full pl-10 pr-4 py-2.5 text-sm font-semibold rounded-[20px] outline-none transition-all ${darkMode
                  ? 'bg-transparent text-white focus:bg-white/5 placeholder-slate-500'
                  : 'bg-transparent text-slate-900 focus:bg-white placeholder-slate-400'
                }`}
            />
          </div>
        </div>

        {/* Quick Actions & Buttons */}
        <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto scrollbar-hide">
          <div className={`flex p-1 rounded-[20px] ${darkMode ? 'bg-slate-900/50' : 'bg-slate-100/50'}`}>
            {QUICK_RANGES.map((range) => (
              <button
                key={range.id}
                onClick={() => handleQuickRange(range)}
                className={`px-4 py-2 rounded-[16px] text-xs font-bold transition-all duration-200 whitespace-nowrap ${darkMode
                    ? 'text-slate-400 hover:text-white hover:bg-white/10'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white shadow-sm'
                  }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          <div className="h-8 w-[1px] mx-2 bg-gradient-to-b from-transparent via-slate-500/20 to-transparent"></div>

          <button
            onClick={() => onExport('csv')}
            disabled={isLoading}
            className={`p-3 rounded-[20px] transition-all duration-200 active:scale-95 group relative overflow-hidden ${darkMode
                ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20'
                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-100'
              }`}
            title="Xuất CSV"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>

          <button
            onClick={onBackup}
            disabled={isLoading}
            className={`p-3 rounded-[20px] transition-all duration-200 active:scale-95 group relative overflow-hidden ${darkMode
                ? 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white border border-indigo-500/20'
                : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-500 hover:text-white border border-indigo-100'
              }`}
            title="Sao lưu dữ liệu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
