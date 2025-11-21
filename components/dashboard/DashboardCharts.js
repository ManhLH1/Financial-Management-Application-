import { Line, Doughnut, Bar } from 'react-chartjs-2'

function ChartCard({ title, actionLabel = '💾 Tải ảnh', onAction, darkMode, cardBgClass, textClass, children, className = '' }) {
  return (
    <div
      className={`${cardBgClass} rounded-[22px] shadow-[0_24px_60px_rgba(15,23,42,0.06)] p-6 border ${
        darkMode ? 'border-slate-700/50' : 'border-gray-100'
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-lg font-bold ${textClass}`}>{title}</h3>
        {onAction && (
          <button
            onClick={onAction}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              darkMode
                ? 'bg-gradient-to-r from-[#3B82F6] to-[#6D28D9] text-white hover:shadow-lg shadow-md shadow-purple-500/30'
                : 'bg-gradient-to-r from-[#3B82F6] to-[#6D28D9] text-white hover:shadow-lg'
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
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 15,
          font: {
            size: 12,
            weight: '500'
          },
          color: darkMode ? '#E2E8F0' : '#475569'
        }
      },
      tooltip: {
        backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: darkMode ? '#E2E8F0' : '#1E293B',
        bodyColor: darkMode ? '#CBD5E1' : '#475569',
        borderColor: darkMode ? '#475569' : '#E2E8F0',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
        displayColors: true
      }
    },
    scales: darkMode ? {
      x: {
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: { color: '#94A3B8' }
      },
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: { color: '#94A3B8' }
      }
    } : {
      x: {
        grid: { color: 'rgba(226, 232, 240, 0.5)' },
        ticks: { color: '#64748B' }
      },
      y: {
        grid: { color: 'rgba(226, 232, 240, 0.5)' },
        ticks: { color: '#64748B' }
      }
    }
  }

  const lineChartOptions = {
    ...chartOptions,
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 3
      },
      point: {
        radius: 4,
        hoverRadius: 6
      }
    }
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12,
            weight: '500'
          },
          color: darkMode ? '#E2E8F0' : '#475569'
        }
      },
      tooltip: {
        backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: darkMode ? '#E2E8F0' : '#1E293B',
        bodyColor: darkMode ? '#CBD5E1' : '#475569',
        borderColor: darkMode ? '#475569' : '#E2E8F0',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
        displayColors: true
      }
    }
    // Doughnut charts don't need scales
  }

  return (
    <div className="space-y-6">
      {/* Line Chart - Full Width */}
      <ChartCard
        title="📈 Xu hướng Thu/Chi 6 tháng"
        onAction={() => downloadChartAsImage(lineChartRef, 'trend-chart')}
        darkMode={darkMode}
        cardBgClass={cardBgClass}
        textClass={textClass}
      >
        <div className="h-96 w-full">
          <Line ref={lineChartRef} data={lineChartData} options={lineChartOptions} />
        </div>
      </ChartCard>

      {/* Doughnut and Bar Charts - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="🍩 Phân bổ chi tiêu"
          onAction={() => downloadChartAsImage(doughnutChartRef, 'category-chart')}
          darkMode={darkMode}
          cardBgClass={cardBgClass}
          textClass={textClass}
        >
          <div className="h-96 w-full">
            <Doughnut ref={doughnutChartRef} data={doughnutData} options={doughnutOptions} />
          </div>
        </ChartCard>

        <ChartCard
          title="📊 Tình hình khoản nợ"
          onAction={() => downloadChartAsImage(barChartRef, 'debt-chart')}
          darkMode={darkMode}
          cardBgClass={cardBgClass}
          textClass={textClass}
        >
          <div className="h-96 w-full">
            <Bar 
              ref={barChartRef} 
              data={barData} 
              options={{
                ...chartOptions,
                scales: {
                  ...chartOptions.scales,
                  x: {
                    ...chartOptions.scales.x,
                    stacked: true
                  },
                  y: {
                    ...chartOptions.scales.y,
                    stacked: true
                  }
                }
              }} 
            />
          </div>
        </ChartCard>
      </div>
    </div>
  )
}


