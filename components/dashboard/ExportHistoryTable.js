export default function ExportHistoryTable({ exportHistory, darkMode, cardBgClass, textClass }) {
  const borderClass = darkMode ? 'border-slate-700/50' : 'border-gray-200'
  const subtleText = darkMode ? 'text-gray-400' : 'text-gray-500'

  return (
    <section className={`${cardBgClass} rounded-2xl shadow-lg p-6 border ${borderClass}`}>
      <h3 className={`text-2xl font-bold mb-6 ${textClass}`}>📜 Lịch sử xuất dữ liệu</h3>
      {exportHistory.length === 0 ? (
        <p className={`text-center py-10 ${subtleText}`}>Chưa có lịch sử xuất dữ liệu</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-sm uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">
                <th className="py-3 pr-4">Tên file</th>
                <th className="py-3 pr-4">Định dạng</th>
                <th className="py-3 pr-4">Khoảng thời gian</th>
                <th className="py-3 pr-4">Ngày xuất</th>
              </tr>
            </thead>
            <tbody>
              {exportHistory.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/70 dark:hover:bg-white/5 transition-colors"
                >
                  <td className={`py-3 pr-4 font-semibold ${textClass}`}>{item.filename}</td>
                  <td className="py-3 pr-4">
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                      {item.format?.toUpperCase()}
                    </span>
                  </td>
                  <td className={`py-3 pr-4 ${subtleText}`}>{item.month}</td>
                  <td className={`py-3 pr-4 ${subtleText}`}>
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


