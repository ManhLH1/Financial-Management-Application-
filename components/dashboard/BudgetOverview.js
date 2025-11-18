import Link from 'next/link'

export default function BudgetOverview({ budgetWarnings, darkMode, cardBgClass, textClass }) {
  const borderClass = darkMode ? 'border-slate-700/50' : 'border-gray-200'
  const emptyStateClass = darkMode ? 'text-gray-400' : 'text-gray-500'

  return (
    <div className="space-y-6">
      <section className={`${cardBgClass} rounded-2xl shadow-lg p-6 border ${borderClass}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-[0.3em]">
              Ngân sách
            </p>
            <h3 className={`text-2xl font-bold ${textClass}`}>💰 Quản lý ngân sách</h3>
          </div>
          <Link
            href="/budgets"
            className="px-4 py-2 bg-[#234C6A] text-white rounded-xl hover:bg-[#1B3C53] transition-colors text-sm font-semibold"
          >
            + Thêm ngân sách
          </Link>
        </div>

        {budgetWarnings.length === 0 ? (
          <p className={`text-center py-10 ${emptyStateClass}`}>
            Chưa có ngân sách nào. Hãy tạo ngân sách mới!
          </p>
        ) : (
          <div className="space-y-4">
            {budgetWarnings.map((budget) => (
              <div
                key={budget.id}
                className={`p-5 rounded-2xl border-2 ${
                  budget.isWarning
                    ? 'border-red-500/80 bg-red-50 dark:bg-red-900/20'
                    : 'border-emerald-500/80 bg-emerald-50 dark:bg-emerald-900/10'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">
                      Danh mục
                    </p>
                    <h4 className={`text-xl font-semibold ${textClass}`}>{budget.category}</h4>
                  </div>
                  <span className="text-3xl">
                    {budget.isWarning ? '⚠️' : '✅'}
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-3">
                  <div className="flex-1">
                    <div className="w-full bg-white/40 dark:bg-black/20 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full ${
                          budget.isWarning ? 'bg-red-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                  <span
                    className={`font-bold ${
                      budget.isWarning ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {budget.percentage}%
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  <p className="text-gray-600 dark:text-gray-400">
                    Đã chi:{' '}
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {budget.spent.toLocaleString('vi-VN')}đ
                    </span>
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Ngân sách:{' '}
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {budget.amount.toLocaleString('vi-VN')}đ
                    </span>
                  </p>
                  <p
                    className={
                      budget.remaining >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    }
                  >
                    Còn lại:{' '}
                    <span className="font-semibold">
                      {budget.remaining.toLocaleString('vi-VN')}đ
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}


