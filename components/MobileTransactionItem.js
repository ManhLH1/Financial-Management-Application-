// Mobile-optimized transaction list item
export default function MobileTransactionItem({ 
  icon, 
  title, 
  category,
  amount, 
  date,
  type, // 'income' or 'expense'
  onEdit = null,
  onDelete = null,
  darkMode = false
}) {
  const isIncome = type === 'income'
  
  return (
    <div className={`rounded-xl border transition-all duration-200 active:scale-98 ${
      darkMode 
        ? 'bg-slate-800 border-slate-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0 ${
            isIncome
              ? 'bg-green-100 dark:bg-green-900/20'
              : 'bg-red-100 dark:bg-red-900/20'
          }`}>
            <span className="text-2xl">{icon}</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-semibold truncate ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {title}
                </h3>
                <p className={`text-xs ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {category}
                </p>
              </div>
              
              {/* Amount */}
              <div className="text-right flex-shrink-0">
                <p className={`text-base font-bold ${
                  isIncome
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {isIncome ? '+' : '-'}{amount}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-2 mt-2">
              <span className={`text-xs ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                📅 {date}
              </span>

              {/* Actions */}
              {(onEdit || onDelete) && (
                <div className="flex items-center gap-2">
                  {onEdit && (
                    <button
                      onClick={onEdit}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        darkMode
                          ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      ✏️ Sửa
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={onDelete}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        darkMode
                          ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
