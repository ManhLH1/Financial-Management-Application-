import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import Header from '../components/Header'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function BudgetDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Initialize dark mode from localStorage (with SSR safety)
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode')
      return saved ? JSON.parse(saved) : false
    }
    return false
  })

  // Sync document class and save to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth')
    } else if (status === 'authenticated') {
      fetchSummary()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  async function fetchSummary() {
    setLoading(true)
    try {
      const res = await fetch('/api/budget-summary')
      const data = await res.json()
      setSummary(data)
    } catch (error) {
      console.error('Error fetching summary:', error)
    } finally {
      setLoading(false)
    }
  }

  // Don't return early - always render Header/Footer
  // Only show loading state in content area

  // Chart data
  const chartData = summary ? {
    labels: ['Số dư đầu kỳ', 'Số dư cuối kỳ'],
    datasets: [
      {
        label: 'Số dư (đ)',
        data: [summary.startingBalance, summary.endingBalance],
        backgroundColor: ['rgba(54, 73, 98, 0.8)', 'rgba(255, 127, 80, 0.8)'],
        borderColor: ['rgba(54, 73, 98, 1)', 'rgba(255, 127, 80, 1)'],
        borderWidth: 1
      }
    ]
  } : null

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value.toLocaleString('vi-VN') + ' đ'
          }
        }
      }
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ'
  }

  const bgClass = darkMode 
    ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900' 
    : 'bg-gradient-to-br from-blue-50 to-indigo-100'

  return (
    <div className={`min-h-screen ${bgClass} transition-all duration-500`}>
      {/* Header */}
      <Header 
        title="Ngân sách hàng tháng"
        subtitle="Tổng quan chi tiêu và thu nhập"
        icon="📋"
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        showDarkModeToggle={true}
      />

      <div className="max-w-7xl mx-auto p-6">
        {/* Loading State */}
        {(status === 'loading' || loading) && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className={`text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Đang tải dữ liệu...
            </div>
          </div>
        )}

        {/* No Data State */}
        {!loading && !summary && status === 'authenticated' && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className={`text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Không có dữ liệu ngân sách
            </div>
          </div>
        )}

        {/* Main Content */}
        {!loading && summary && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Chart */}
          <div className={`lg:col-span-1 rounded-lg shadow-lg p-6 ${
            darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'
          }`}>
            <h2 className={`text-xl font-semibold mb-4 ${
              darkMode ? 'text-orange-400' : 'text-orange-600'
            }`}>Ngân sách hàng tháng</h2>
            
            {/* Chart */}
            <div className="h-64 mb-6">
              {chartData && <Bar data={chartData} options={chartOptions} />}
            </div>

            {/* Balance labels */}
            <div className="grid grid-cols-2 gap-4 text-center mb-6">
              <div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  SỐ DƯ ĐẦU KỲ
                </div>
                <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(summary.startingBalance)}
                </div>
              </div>
              <div>
                <div className={`text-sm ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                  SỐ DƯ CUỐI KỲ
                </div>
                <div className={`text-lg font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                  {formatCurrency(summary.endingBalance)}
                </div>
              </div>
            </div>

            {/* Savings box */}
            <div className={`rounded-lg p-4 border ${
              darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="text-center">
                <div className={`text-3xl font-bold mb-1 ${
                  summary.savingsPercent > 0 
                    ? darkMode ? 'text-green-400' : 'text-green-600'
                    : darkMode ? 'text-red-400' : 'text-red-600'
                }`}>
                  {summary.savingsPercent > 0 ? '+' : ''}{summary.savingsPercent}%
                </div>
                <div className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Mức tăng đẳng dần xấp xỉ
                </div>
                <div className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(summary.savings)}
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Tiết kiệm tháng này
                </div>
              </div>
            </div>
          </div>

          {/* Right: Tables */}
          <div className={`lg:col-span-2 rounded-lg shadow-lg p-6 ${
            darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Chi phí */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${
                  darkMode ? 'text-orange-400' : 'text-orange-600'
                }`}>Chi phí</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className={darkMode ? 'bg-slate-700' : 'bg-gray-50'}>
                      <tr className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        <th className="px-3 py-2 text-left">Danh mục</th>
                        <th className="px-3 py-2 text-right">Dự kiến</th>
                        <th className="px-3 py-2 text-right">Thực tế</th>
                        <th className="px-3 py-2 text-right">Chênh lệch</th>
                      </tr>
                    </thead>
                    <tbody className={darkMode ? 'text-gray-300' : 'text-gray-900'}>
                      {/* Total row */}
                      <tr className={`font-bold ${darkMode ? 'bg-slate-700' : 'bg-blue-50'}`}>
                        <td className="px-3 py-2">Tổng</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(0)}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(summary.totalExpenses)}</td>
                        <td className={`px-3 py-2 text-right ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                          -{formatCurrency(summary.totalExpenses)}
                        </td>
                      </tr>
                      {/* Categories */}
                      {summary.categories.expenses.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-3 py-2 text-center text-gray-400">
                            Chưa có dữ liệu
                          </td>
                        </tr>
                      ) : (
                        summary.categories.expenses.map((cat, idx) => (
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            <td className="px-3 py-2">{cat.name}</td>
                            <td className="px-3 py-2 text-right">{formatCurrency(cat.planned)}</td>
                            <td className="px-3 py-2 text-right">{formatCurrency(cat.actual)}</td>
                            <td className={`px-3 py-2 text-right ${cat.difference < 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {cat.difference !== 0 && (cat.difference > 0 ? '+' : '')}{formatCurrency(Math.abs(cat.difference))}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Thu nhập */}
              <div>
                <h3 className="text-lg font-semibold text-orange-600 mb-4">Thu nhập</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left">Danh mục</th>
                        <th className="px-3 py-2 text-right">Dự kiến</th>
                        <th className="px-3 py-2 text-right">Thực tế</th>
                        <th className="px-3 py-2 text-right">Chênh lệch</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Total row */}
                      <tr className="font-bold bg-blue-50">
                        <td className="px-3 py-2">Tổng</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(0)}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(summary.totalIncome)}</td>
                        <td className="px-3 py-2 text-right text-green-600">
                          +{formatCurrency(summary.totalIncome)}
                        </td>
                      </tr>
                      {/* Categories */}
                      {summary.categories.income.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-3 py-2 text-center text-gray-400">
                            Chưa có dữ liệu
                          </td>
                        </tr>
                      ) : (
                        summary.categories.income.map((cat, idx) => (
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            <td className="px-3 py-2">{cat.name}</td>
                            <td className="px-3 py-2 text-right">{formatCurrency(cat.planned)}</td>
                            <td className="px-3 py-2 text-right">{formatCurrency(cat.actual)}</td>
                            <td className={`px-3 py-2 text-right ${cat.difference < 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {cat.difference !== 0 && (cat.difference > 0 ? '+' : '')}{formatCurrency(Math.abs(cat.difference))}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Bottom: Transaction details table */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-semibold mb-4">Chi tiết giao dịch</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Ngày</th>
                      <th className="px-3 py-2 text-right">Số tiền</th>
                      <th className="px-3 py-2 text-left">Mô tả</th>
                      <th className="px-3 py-2 text-left">Danh mục</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan="4" className="px-3 py-4 text-center text-gray-400">
                        Xem chi tiết tại trang Expenses và Debts
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex gap-3 justify-center">
                <Link href="/expenses" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Xem Chi tiêu
                </Link>
                <Link href="/debts" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Xem Công nợ
                </Link>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  )
}
