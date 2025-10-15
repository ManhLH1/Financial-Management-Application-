// Mobile-optimized transaction list item - Modern Design
export default function MobileTransactionItem({ 
  icon, 
  title, 
  category,
  amount, 
  date,
  type, // 'income' or 'expense'
  onEdit = null,
  onDelete = null,
  darkMode = false,
  badge = null // Optional badge like "Mới", "Định kỳ"
}) {
  const isIncome = type === 'income'
  
  return (
    <div className={`group relative rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-300 active:scale-98 overflow-hidden ${
      darkMode 
        ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800' 
        : 'bg-white border-gray-200 hover:border-gray-300'
    }`}>
      {/* Colored stripe on left */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
        isIncome ? 'bg-green-500' : 'bg-red-500'
      }`}></div>

      <div className="p-4 pl-5">
        <div className="flex items-start gap-3">
          {/* Icon with gradient background */}
          <div className={`relative flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0 shadow-md ${
            isIncome
              ? 'bg-gradient-to-br from-green-400 to-green-600'
              : 'bg-gradient-to-br from-red-400 to-red-600'
          }`}>
            <span className="text-2xl filter drop-shadow-sm">{icon}</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`text-sm font-bold truncate ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {title}
                  </h3>
                  {badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500 text-white font-semibold flex-shrink-0">
                      {badge}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                    darkMode 
                      ? 'bg-slate-700 text-gray-300' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {category}
                  </span>
                </div>
              </div>
              
              {/* Amount - Larger & More Prominent */}
              <div className="text-right flex-shrink-0">
                <p className={`text-lg font-black ${
                  isIncome
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {isIncome ? '+' : '-'}{amount}
                </p>
              </div>
            </div>

            {/* Footer - Modern Design */}
            <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-gray-100 dark:border-slate-700">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px]">📅</span>
                <span className={`text-xs font-medium ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {date}
                </span>
              </div>

              {/* Actions - Icon Buttons */}
              {(onEdit || onDelete) && (
                <div className="flex items-center gap-1.5">
                  {onEdit && (
                    <button
                      onClick={onEdit}
                      className={`p-2 rounded-lg text-xs font-medium transition-all active:scale-95 ${
                        darkMode
                          ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50'
                          : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                      }`}
                      title="Chỉnh sửa"
                    >
                      <span className="text-sm">✏️</span>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={onDelete}
                      className={`p-2 rounded-lg text-xs font-medium transition-all active:scale-95 ${
                        darkMode
                          ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                      title="Xóa"
                    >
                      <span className="text-sm">🗑️</span>
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
