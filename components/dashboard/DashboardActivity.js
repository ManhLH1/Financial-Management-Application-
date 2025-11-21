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

const categoryIcons = {
  'Ăn uống': '🍽️',
  'Di chuyển': '🚗',
  'Giải trí': '🎮',
  'Mua sắm': '🛍️',
  'Sức khỏe': '💊',
  'Học tập': '📚',
  'Hóa đơn': '📄',
  'Lương': '💰',
  'Thưởng': '🎁',
  'Đầu tư': '📈',
  'Kinh doanh': '💼',
  'Khác': '📦'
}

export default function DashboardActivity({ items = [], darkMode, cardBgClass, textClass }) {
  if (!items.length) return null

  const subtleText = darkMode ? 'text-gray-400' : 'text-gray-500'
  const borderClass = darkMode ? 'border-slate-700/50' : 'border-gray-100'

  return (
    <section className={`${cardBgClass} rounded-[22px] border ${borderClass} p-6 shadow-[0_24px_60px_rgba(15,23,42,0.06)]`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className={`text-xs font-medium uppercase tracking-wider ${subtleText}`}>Giao dịch gần đây</p>
          <h3 className={`text-xl font-bold mt-1 ${textClass}`}>Chi tiết giao dịch mới nhất</h3>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => {
          const style = typeStyles[item.type] || typeStyles.default
          const categoryIcon = categoryIcons[item.category] || '📦'
          
          return (
            <div 
              key={item.id} 
              className={`group flex items-center justify-between rounded-xl border ${borderClass} p-4 transition-all hover:shadow-md ${
                darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                  item.type === 'income' 
                    ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                    : 'bg-rose-100 dark:bg-rose-900/30'
                }`}>
                  {categoryIcon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold truncate ${textClass}`}>{item.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${style.badge}`}>
                      {item.type === 'income' ? 'Thu' : item.type === 'expense' ? 'Chi' : 'Khác'}
                    </span>
                    <span className={`text-xs ${subtleText}`}>
                      {item.category} • {item.dateLabel}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`text-right ${style.amount}`}>
                  <p className="text-lg font-bold">
                    {item.type === 'expense' ? '-' : '+'}
                    {item.amount.toLocaleString('vi-VN')}đ
                  </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <button className={`p-2 rounded-lg ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`} title="Chỉnh sửa">
                    ✏️
                  </button>
                  <button className={`p-2 rounded-lg ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`} title="Xóa">
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}


