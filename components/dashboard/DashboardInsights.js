const trendColors = {
  up: 'text-emerald-500 bg-emerald-500/15',
  down: 'text-rose-500 bg-rose-500/15',
  neutral: 'text-slate-500 bg-slate-500/15'
}

export default function DashboardInsights({ insights = [], darkMode, cardBgClass, textClass }) {
  if (!insights.length) return null

  const borderClass = darkMode ? 'border-white/10' : 'border-gray-100'
  const subtleText = darkMode ? 'text-gray-300' : 'text-gray-500'

  return (
    <section className={`${cardBgClass} rounded-3xl border ${borderClass} p-6 shadow-xl`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className={`text-sm uppercase tracking-[0.35em] ${subtleText}`}>Insight tự động</p>
          <h3 className={`text-2xl font-semibold ${textClass}`}>Nhìn nhanh các tín hiệu quan trọng</h3>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {insights.map((item) => (
          <div
            key={item.id}
            className={`rounded-2xl border ${borderClass} p-4 transition hover:-translate-y-1 hover:shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div className="text-2xl">{item.icon}</div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${trendColors[item.trend || 'neutral']}`}
              >
                {item.trendLabel}
              </span>
            </div>
            <p className={`mt-3 text-sm ${subtleText}`}>{item.label}</p>
            <p className={`mt-1 text-2xl font-semibold ${textClass}`}>{item.value}</p>
            {item.description && <p className={`mt-2 text-sm ${subtleText}`}>{item.description}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}


