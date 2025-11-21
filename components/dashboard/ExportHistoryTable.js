export default function ExportHistoryTable({ exportHistory, darkMode }) {
  return (
    <section className={`rounded-[24px] p-6 transition-all duration-300 ${darkMode
        ? 'bg-slate-800/50 border border-slate-700/50 shadow-xl'
        : 'bg-white border border-gray-100 shadow-sm'
      }`}>
      <div className="mb-6">
        <p className={`text-xs font-bold tracking-wider uppercase mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Lịch sử
        </p>
        <h3 className={`text-xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          Lịch sử xuất dữ liệu
        </h3>
      </div>

      {exportHistory.length === 0 ? (
        <div className={`text-center py-12 rounded-2xl border-2 border-dashed ${darkMode ? 'border-slate-700 text-slate-400' : 'border-gray-200 text-slate-500'}`}>
          <p>Chưa có lịch sử xuất dữ liệu</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`text-left text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400 border-slate-700' : 'text-slate-500 border-gray-200'} border-b`}>
                <th className="py-4 pr-4 pl-2">Tên file</th>
                <th className="py-4 pr-4">Định dạng</th>
                <th className="py-4 pr-4">Khoảng thời gian</th>
                <th className="py-4 pr-4">Ngày xuất</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
              {exportHistory.map((item, index) => (
                <tr
                  key={index}
                  className={`transition-colors ${darkMode ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'}`}
                >
                  <td className={`py-4 pr-4 pl-2 font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📄</span>
                      {item.filename}
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${darkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'
                      }`}>
                      {item.format?.toUpperCase()}
                    </span>
                  </td>
                  <td className={`py-4 pr-4 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{item.month}</td>
                  <td className={`py-4 pr-4 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {new Date(item.exportDate).toLocaleString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
