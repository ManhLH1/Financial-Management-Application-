import Link from 'next/link'

const HIGHLIGHTS = [
  { id: 'income', label: 'Thu nhập', accent: 'from-emerald-400/90 to-emerald-500/80' },
  { id: 'expense', label: 'Chi tiêu', accent: 'from-rose-400/90 to-rose-500/80' },
  { id: 'balance', label: 'Số dư', accent: 'from-sky-400/90 to-blue-500/80' }
]

export default function DashboardHero({ userName, summary, dateRange, darkMode }) {
  const expenseRatio = summary.totalIncome > 0 ? summary.totalExpense / summary.totalIncome : 0
  const safeExpenseRatio = Math.min(Math.max(expenseRatio, 0), 2)
  const savingsRate = Number.isFinite(summary.savingsRate) ? summary.savingsRate : 0

  const containerClass = darkMode
    ? 'bg-gradient-to-br from-slate-900 via-slate-900/80 to-slate-800 border-white/5'
    : 'bg-gradient-to-br from-[#E3F0FF] via-white to-[#FDF4FF] border-white shadow-lg'

  const textMuted = darkMode ? 'text-gray-300' : 'text-gray-600'

  return (
    <section className={`relative overflow-hidden rounded-3xl border px-8 py-10 ${containerClass}`}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col gap-10 lg:flex-row">
        <div className="flex-1 space-y-6">
          <div>
            <p
              className={`text-sm uppercase tracking-[0.4em] ${
                darkMode ? 'text-white/70' : 'text-gray-500'
              }`}
            >
              Xin chào, {userName}
            </p>
            <h1 className={`mt-3 text-3xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Theo dõi tài chính của bạn cực kỳ trực quan
            </h1>
            <p className={`mt-2 max-w-xl ${textMuted}`}>
              Giai đoạn {dateRange.startDate} → {dateRange.endDate}. Cập nhật tức thời theo từng giao dịch,
              kèm dự báo và cảnh báo chi tiêu thông minh.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <span
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                darkMode ? 'bg-white/10 text-white' : 'bg-white text-gray-800 shadow'
              }`}
            >
              Phạm vi: {dateRange.startDate} → {dateRange.endDate}
            </span>
            <Link
              href="/reports"
              className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 hover:scale-[1.02] transition"
            >
              📄 Xem báo cáo chi tiết
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {HIGHLIGHTS.map((item) => {
              const value = summary[`total${item.id.charAt(0).toUpperCase()}${item.id.slice(1)}`] ?? summary[item.id]
              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border p-4 backdrop-blur-sm ${
                    darkMode ? 'border-white/10 bg-white/5' : 'border-white/60 bg-white/70'
                  }`}
                >
                  <p
                    className={`text-sm uppercase tracking-[0.3em] ${
                      darkMode ? 'text-white/60' : 'text-gray-500'
                    }`}
                  >
                    {item.label}
                  </p>
                  <p className={`mt-2 text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {Number(value || 0).toLocaleString('vi-VN')}đ
                  </p>
                  <div className={`mt-4 h-1.5 rounded-full ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${item.accent}`}
                      style={{
                        width: `${
                          item.id === 'balance'
                            ? 100
                            : Math.min((Math.abs(value) / (Math.abs(summary.totalIncome) || 1)) * 100, 100)
                        }%`
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div
          className={`w-full max-w-sm rounded-3xl border px-6 py-6 backdrop-blur ${
            darkMode ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-white shadow-xl'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className={`text-sm font-semibold ${textMuted}`}>Tiến độ chi tiêu</p>
            <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {Math.round(Math.min(expenseRatio * 100, 200))}%
            </span>
          </div>
          <div className={`mt-3 h-2.5 rounded-full ${darkMode ? 'bg-white/10' : 'bg-gray-100'}`}>
            <div
              className="h-full rounded-full bg-gradient-to-r from-rose-500 to-orange-400"
              style={{ width: `${Math.min(safeExpenseRatio * 100, 100)}%` }}
            />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <p className={`text-xs uppercase tracking-[0.3em] ${textMuted}`}>Đã tiết kiệm</p>
              <p className={`mt-1 text-2xl font-semibold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                {savingsRate.toFixed(1)}%
              </p>
              <p className={`text-xs ${textMuted}`}>Tỷ lệ so với thu nhập</p>
            </div>
            <div>
              <p className={`text-xs uppercase tracking-[0.3em] ${textMuted}`}>Ngày cao điểm</p>
              <p className={`mt-1 text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {summary.peakDay?.label || '—'}
              </p>
              <p className={`text-xs ${textMuted}`}>{summary.peakDay?.value || ''}</p>
            </div>
          </div>

          <div
            className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${
              darkMode ? 'border-white/10 bg-white/5 text-white' : 'border-gray-100 bg-gray-50 text-gray-800'
            }`}
          >
            <p className="font-semibold">Gợi ý</p>
            <p className={`${darkMode ? 'text-white/80' : 'text-gray-600'} mt-1`}>
              Duy trì mức chi tiêu dưới {Math.round((summary.totalIncome || 1) * 0.7).toLocaleString('vi-VN')}đ để đảm bảo
              mục tiêu tiết kiệm trong tháng này.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}


