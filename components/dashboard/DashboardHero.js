import { useMemo } from 'react'

export default function DashboardHero({ userName, summary, dateRange, darkMode }) {
  const expenseRatio = summary.totalIncome > 0 ? summary.totalExpense / summary.totalIncome : 0
  const safeExpenseRatio = Math.min(Math.max(expenseRatio, 0), 1)

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  return (
    <div className={`relative overflow-hidden rounded-[40px] p-8 md:p-10 transition-all duration-500 group ${darkMode
      ? 'bg-[#0F172A] border border-white/5 shadow-2xl shadow-indigo-500/10'
      : 'bg-white border border-slate-100 shadow-2xl shadow-blue-500/10'
      }`}>

      {/* Dynamic Background Mesh */}
      <div className={`absolute inset-0 opacity-40 transition-opacity duration-700 ${darkMode ? 'opacity-40' : 'opacity-60'}`}>
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-indigo-600/30 to-purple-600/30 blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-blue-600/20 to-cyan-500/20 blur-[80px] animate-pulse-slow delay-1000" />
      </div>

      {/* Glass Overlay Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>

      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
        <div className="space-y-6 flex-1">
          <div className="flex items-center gap-4">
            <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border backdrop-blur-md ${darkMode
                ? 'bg-white/5 border-white/10 text-indigo-300 shadow-lg shadow-indigo-500/20'
                : 'bg-slate-900/5 border-slate-900/10 text-indigo-600'
              }`}>
              Tổng tài sản
            </div>
            <div className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {new Date().toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
            </div>
          </div>

          <div>
            <h2 className={`text-5xl md:text-7xl font-black tracking-tighter mb-2 bg-clip-text text-transparent bg-gradient-to-r ${darkMode
                ? 'from-white via-indigo-100 to-slate-400'
                : 'from-slate-900 via-indigo-800 to-slate-700'
              }`}>
              {formatCurrency(summary.balance)}
            </h2>
            <div className="flex items-center gap-3">
              <div className={`h-2 w-2 rounded-full ${summary.savingsRate > 20 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-amber-500'}`}></div>
              <p className={`text-base font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Xin chào, <span className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{userName}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-4">
          {/* Income Card */}
          <div className={`flex-1 sm:w-48 p-5 rounded-3xl border backdrop-blur-xl transition-transform hover:-translate-y-1 duration-300 ${darkMode
              ? 'bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10'
              : 'bg-emerald-50 border-emerald-100 hover:bg-emerald-100/50'
            }`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-xl ${darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>Thu nhập</span>
            </div>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{formatCurrency(summary.totalIncome)}</p>
          </div>

          {/* Expense Card */}
          <div className={`flex-1 sm:w-48 p-5 rounded-3xl border backdrop-blur-xl transition-transform hover:-translate-y-1 duration-300 ${darkMode
              ? 'bg-rose-500/5 border-rose-500/20 hover:bg-rose-500/10'
              : 'bg-rose-50 border-rose-100 hover:bg-rose-100/50'
            }`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-xl ${darkMode ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-100 text-rose-600'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-rose-400' : 'text-rose-700'}`}>Chi tiêu</span>
            </div>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{formatCurrency(summary.totalExpense)}</p>
          </div>
        </div>
      </div>

      {/* Modern Progress Bar */}
      <div className="mt-10">
        <div className="flex justify-between items-end mb-3">
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Tiến độ ngân sách</p>
            <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Đã dùng <span className={safeExpenseRatio > 0.8 ? 'text-rose-500' : 'text-emerald-500'}>{(safeExpenseRatio * 100).toFixed(1)}%</span> thu nhập
            </p>
          </div>
          <div className={`text-xs font-bold px-2 py-1 rounded-lg ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
            {summary.savingsRate.toFixed(1)}% Tiết kiệm
          </div>
        </div>
        <div className={`h-3 w-full rounded-full overflow-hidden p-[2px] ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${safeExpenseRatio > 0.8
                ? 'bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                : 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
              }`}
            style={{ width: `${safeExpenseRatio * 100}%` }}
          >
            <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite] skew-x-12"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
