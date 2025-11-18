import { Line, Doughnut, Bar } from 'react-chartjs-2'

function ChartCard({ title, actionLabel = '💾 Tải ảnh', onAction, darkMode, cardBgClass, textClass, children }) {
  return (
    <div
      className={`${cardBgClass} rounded-2xl shadow-xl p-6 border backdrop-blur-sm ${
        darkMode ? 'border-slate-700/50' : 'border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-bold ${textClass}`}>{title}</h3>
        {onAction && (
          <button
            onClick={onAction}
            className={`px-3 py-1 rounded-lg text-sm transition-all duration-200 ${
              darkMode
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-purple-500/30'
                : 'bg-[#234C6A] text-white hover:bg-[#1B3C53]'
            }`}
          >
            {actionLabel}
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

export default function DashboardCharts({
  lineChartData,
  doughnutData,
  barData,
  downloadChartAsImage,
  lineChartRef,
  doughnutChartRef,
  barChartRef,
  darkMode,
  cardBgClass,
  textClass
}) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ChartCard
          title="📈 Xu hướng 6 tháng"
          onAction={() => downloadChartAsImage(lineChartRef, 'trend-chart')}
          darkMode={darkMode}
          cardBgClass={cardBgClass}
          textClass={textClass}
        >
          <Line ref={lineChartRef} data={lineChartData} />
        </ChartCard>

        <ChartCard
          title="🍩 Phân bố danh mục"
          onAction={() => downloadChartAsImage(doughnutChartRef, 'category-chart')}
          darkMode={darkMode}
          cardBgClass={cardBgClass}
          textClass={textClass}
        >
          <Doughnut ref={doughnutChartRef} data={doughnutData} />
        </ChartCard>
      </div>

      <ChartCard
        title="📊 Chi tiết danh mục"
        onAction={() => downloadChartAsImage(barChartRef, 'detail-chart')}
        darkMode={darkMode}
        cardBgClass={cardBgClass}
        textClass={textClass}
      >
        <Bar ref={barChartRef} data={barData} />
      </ChartCard>
    </div>
  )
}


