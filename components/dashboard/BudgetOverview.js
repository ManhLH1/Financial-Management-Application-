import Link from 'next/link'

export default function BudgetOverview({ budgetWarnings, darkMode }) {
  return (
    <div className="space-y-6">
      <section className={`rounded-[32px] p-8 transition-all duration-300 ${darkMode
        ? 'bg-[#0F172A]/60 border border-white/5 backdrop-blur-md'
        : 'bg-white border border-slate-100 shadow-sm'
        }`}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className={`text-xs font-bold tracking-widest uppercase mb-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
              Ngân sách
            </p>
            <h3 className={`text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Quản lý ngân sách
            </h3>
          </div>
          <Link
            href="/budgets"
            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${darkMode
              ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm ngân sách
          </Link>
        </div>

        {budgetWarnings.length === 0 ? (
          <div className={`text-center py-16 rounded-[24px] border-2 border-dashed transition-colors ${darkMode ? 'border-slate-700/50 bg-slate-800/20' : 'border-slate-200 bg-slate-50'}`}>
            <div className="text-4xl mb-4">💰</div>
            <p className={`font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Chưa có ngân sách nào. Hãy tạo ngân sách mới!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {budgetWarnings.map((budget) => (
              <div
                key={budget.id}
                className={`p-6 rounded-[24px] border transition-all duration-300 hover:-translate-y-1 ${budget.isWarning
                  ? (darkMode ? 'bg-rose-500/5 border-rose-500/20 hover:bg-rose-500/10' : 'bg-rose-50 border-rose-100 hover:bg-rose-100/50')
                  : (darkMode ? 'bg-slate-800/40 border-white/5 hover:bg-slate-800/60' : 'bg-white border-slate-100 hover:shadow-md')
                  }`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${budget.isWarning
                      ? (darkMode ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-100 text-rose-600')
                      : (darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600')
                      }`}>
                      {budget.isWarning ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {budget.category}
                      </p>
                      <h4 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        {budget.amount.toLocaleString('vi-VN')}đ
                      </h4>
                    </div>
                  </div>
                  <div className={`text-right ${budget.isWarning ? 'text-rose-500' : 'text-emerald-500'}`}>
                    <span className="text-3xl font-black tracking-tight">{budget.percentage}%</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className={`w-full rounded-full h-3 overflow-hidden p-[2px] ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${budget.isWarning
                        ? 'bg-gradient-to-r from-rose-600 to-rose-400'
                        : 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                        }`}
                      style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite] skew-x-12"></div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between text-xs font-semibold">
                  <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>
                    Đã chi: <span className={darkMode ? 'text-white' : 'text-slate-900'}>{budget.spent.toLocaleString('vi-VN')}đ</span>
                  </span>
                  <span className={
                    budget.remaining >= 0
                      ? (darkMode ? 'text-emerald-400' : 'text-emerald-600')
                      : (darkMode ? 'text-rose-400' : 'text-rose-600')
                  }>
                    Còn lại: {budget.remaining.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
