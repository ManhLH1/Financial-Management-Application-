const typeStyles = {
  income: {
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    amount: 'text-emerald-500'
  },
  expense: {
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    amount: 'text-rose-500'
  },
  default: {
    badge: 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-white',
    amount: 'text-gray-500'
  }
}

export default function DashboardActivity({ items = [], darkMode, cardBgClass, textClass }) {
  if (!items.length) return null

  const subtleText = darkMode ? 'text-gray-400' : 'text-gray-500'
  const borderClass = darkMode ? 'border-white/10' : 'border-gray-100'

  return (
    <section className={`${cardBgClass} rounded-3xl border ${borderClass} p-6 shadow-xl`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm uppercase tracking-[0.35em] ${subtleText}`}>Hoạt động gần đây</p>
          <h3 className={`text-2xl font-semibold ${textClass}`}>Timeline giao dịch mới nhất</h3>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {items.map((item) => {
          const style = typeStyles[item.type] || typeStyles.default
          return (
            <div key={item.id} className={`flex items-center justify-between rounded-2xl border ${borderClass} p-4`}>
              <div className="flex items-center gap-4">
                <div className={`rounded-2xl px-3 py-1 text-xs font-semibold ${style.badge}`}>
                  {item.type === 'income' ? 'Thu' : item.type === 'expense' ? 'Chi' : 'Khác'}
                </div>
                <div>
                  <p className={`font-semibold ${textClass}`}>{item.title}</p>
                  <p className={`text-sm ${subtleText}`}>
                    {item.category} • {item.dateLabel}
                  </p>
                </div>
              </div>
              <div className={`text-lg font-bold ${style.amount}`}>
                {item.type === 'expense' ? '-' : '+'}
                {item.amount.toLocaleString('vi-VN')}đ
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}


