import { Line, Doughnut, Bar } from 'react-chartjs-2'

function ChartContainer({ title, children, darkMode, action }) {
  return (
    <div className={`p-6 md:p-8 rounded-[32px] border h-full flex flex-col transition-all duration-300 ${darkMode
      ? 'bg-[#0F172A]/60 border-white/5 backdrop-blur-md hover:border-white/10'
      : 'bg-white border-slate-100 shadow-sm hover:shadow-md'
      }`}>
      <div className="flex justify-between items-center mb-8">
        <h3 className={`text-lg font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
        {action}
      </div>
      <div className="flex-1 min-h-[300px] relative w-full">
        {children}
      </div>
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
  darkMode
}) {
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 8,
          font: { family: 'Inter, sans-serif', size: 12, weight: '600' },
          color: darkMode ? '#94a3b8' : '#64748b'
        }
      },
      tooltip: {
        backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: darkMode ? '#fff' : '#0f172a',
        bodyColor: darkMode ? '#cbd5e1' : '#334155',
        borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
        borderWidth: 1,
        padding: 16,
        cornerRadius: 16,
        displayColors: true,
        boxPadding: 6,
        titleFont: { family: 'Inter, sans-serif', size: 14, weight: '700' },
        bodyFont: { family: 'Inter, sans-serif', size: 13, weight: '500' },
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: {
          color: darkMode ? '#64748b' : '#94a3b8',
          font: { family: 'Inter, sans-serif', size: 11, weight: '500' },
          padding: 10
        }
      },
      y: {
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
          drawBorder: false,
          tickLength: 0
        },
        ticks: {
          color: darkMode ? '#64748b' : '#94a3b8',
          font: { family: 'Inter, sans-serif', size: 11, weight: '500' },
          padding: 10,
          callback: (value) => value >= 1000000 ? `${value / 1000000}M` : value >= 1000 ? `${value / 1000}k` : value
        },
        border: { display: false }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  }

  const doughnutOptions = {
    ...commonOptions,
    cutout: '75%',
    scales: { x: { display: false }, y: { display: false } },
    plugins: {
      ...commonOptions.plugins,
      legend: {
        ...commonOptions.plugins.legend,
        position: 'right',
        align: 'center'
      }
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <ChartContainer
        title="Xu hướng dòng tiền"
        darkMode={darkMode}
        action={
          <button
            onClick={() => downloadChartAsImage(lineChartRef, 'cashflow')}
            className={`p-2.5 rounded-xl transition-all ${darkMode
                ? 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900'
              }`}
            title="Tải ảnh biểu đồ"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        }
      >
        <Line ref={lineChartRef} data={lineChartData} options={commonOptions} />
      </ChartContainer>

      <ChartContainer
        title="Phân bổ chi tiêu"
        darkMode={darkMode}
        action={
          <button
            onClick={() => downloadChartAsImage(doughnutChartRef, 'spending')}
            className={`p-2.5 rounded-xl transition-all ${darkMode
                ? 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900'
              }`}
            title="Tải ảnh biểu đồ"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        }
      >
        <div className="h-full flex items-center justify-center p-4">
          <Doughnut ref={doughnutChartRef} data={doughnutData} options={doughnutOptions} />
        </div>
      </ChartContainer>
    </div>
  )
}
