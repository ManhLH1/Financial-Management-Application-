export default function DashboardActivity({ items = [], darkMode }) {
  return (
    <div className={`h-full p-6 md:p-8 rounded-[32px] border transition-all duration-300 ${darkMode
      ? 'bg-[#0F172A]/60 border-white/5 backdrop-blur-md hover:border-white/10'
      : 'bg-white border-slate-100 shadow-sm hover:shadow-md'
      }`}>
      <div className="flex items-center justify-between mb-8">
        <h3 className={`text-lg font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Giao dịch gần đây</h3>
        <button className={`text-xs font-bold uppercase tracking-wider transition-colors ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}>
          Xem tất cả
        </button>
      </div>

      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 opacity-50">
            <div className="text-4xl mb-3">📝</div>
            <p className={`text-sm font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Chưa có giao dịch nào</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={`group flex items-center justify-between p-4 rounded-2xl transition-all duration-200 ${darkMode
                  ? 'hover:bg-white/5 border border-transparent hover:border-white/5'
                  : 'hover:bg-slate-50 border border-transparent hover:border-slate-100'
                }`}
            >
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-xl shadow-sm transition-transform group-hover:scale-110 ${item.type === 'income'
                  ? (darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600')
                  : (darkMode ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50 text-rose-600')
                  }`}>
                  {item.type === 'income' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className={`font-bold text-sm mb-0.5 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</p>
                  <p className={`text-xs font-medium ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>{item.dateLabel} • {item.category}</p>
                </div>
              </div>
              <span className={`font-bold text-sm tracking-tight ${item.type === 'income'
                ? (darkMode ? 'text-emerald-400' : 'text-emerald-600')
                : (darkMode ? 'text-white' : 'text-slate-900')
                }`}>
                {item.type === 'income' ? '+' : '-'}{Number(item.amount).toLocaleString('vi-VN')}đ
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
