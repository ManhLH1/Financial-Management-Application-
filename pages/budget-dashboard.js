import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import Header from '../components/Header'
import MobileHeader from '../components/MobileHeader'
import MobileBottomNav from '../components/MobileBottomNav'
import Notification, { useNotification } from '../components/Notification'
import { formatMobileCurrency } from '../lib/mobileHelpers'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function BudgetDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview') // 'overview' or 'manage'
  const { notification, showNotification, hideNotification } = useNotification()
  
  // Budget management states
  const [budgets, setBudgets] = useState([])
  const [isLoadingBudgets, setIsLoadingBudgets] = useState(false)
  const [form, setForm] = useState({
    category: '',
    amount: '',
    period: 'monthly',
    alertThreshold: 80,
    dailyLimit: '',
    weeklyLimit: '',
    blockOnExceed: false
  })
  const [editingId, setEditingId] = useState(null)

  const categories = [
    'Ăn uống', 'Di chuyển', 'Giải trí', 'Mua sắm', 
    'Sức khỏe', 'Học tập', 'Hóa đơn', 'Khác'
  ]
  
  // Initialize dark mode - start with false to match server render
  const [darkMode, setDarkMode] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Load dark mode from localStorage after mount (client-side only)
  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('darkMode')
    if (saved) {
      setDarkMode(JSON.parse(saved))
    }
  }, [])

  // Sync document class and save to localStorage
  useEffect(() => {
    if (!mounted) return // Skip on server
    
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode, mounted])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth')
    } else if (status === 'authenticated') {
      fetchSummary()
      fetchBudgets()
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

  async function fetchBudgets() {
    setIsLoadingBudgets(true)
    try {
      const res = await fetch('/api/budgets')
      const data = await res.json()
      setBudgets(data.budgets || [])
    } catch (error) {
      console.error('Error fetching budgets:', error)
    } finally {
      setIsLoadingBudgets(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.category || !form.amount) {
      showNotification('⚠️ Vui lòng điền đầy đủ thông tin!', 'warning')
      return
    }

    setIsLoadingBudgets(true)
    try {
      const method = editingId ? 'PUT' : 'POST'
      const body = editingId ? { ...form, id: editingId } : form

      const res = await fetch('/api/budgets', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()

      if (res.ok) {
        showNotification(
          editingId ? '✅ Cập nhật ngân sách thành công!' : '✅ Thêm ngân sách thành công!',
          'success'
        )
        setForm({ 
          category: '', 
          amount: '', 
          period: 'monthly', 
          alertThreshold: 80,
          dailyLimit: '',
          weeklyLimit: '',
          blockOnExceed: false
        })
        setEditingId(null)
        await fetchBudgets()
      } else {
        showNotification(`❌ ${data.error || 'Có lỗi xảy ra'}`, 'error')
      }
    } catch (error) {
      showNotification('❌ Không thể lưu ngân sách', 'error')
    } finally {
      setIsLoadingBudgets(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Bạn có chắc muốn xóa ngân sách này?')) return

    setIsLoadingBudgets(true)
    try {
      const res = await fetch('/api/budgets', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })

      if (res.ok) {
        showNotification('✅ Xóa ngân sách thành công!', 'success')
        await fetchBudgets()
      } else {
        showNotification('❌ Không thể xóa ngân sách', 'error')
      }
    } catch (error) {
      showNotification('❌ Có lỗi xảy ra', 'error')
    } finally {
      setIsLoadingBudgets(false)
    }
  }

  function handleEdit(budget) {
    setEditingId(budget.id)
    setForm({
      category: budget.category,
      amount: budget.amount,
      period: budget.period,
      alertThreshold: budget.alertThreshold,
      dailyLimit: budget.dailyLimit || '',
      weeklyLimit: budget.weeklyLimit || '',
      blockOnExceed: budget.blockOnExceed || false
    })
    setActiveTab('manage')
    window.scrollTo({ top: 0, behavior: 'smooth' })
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

  // Helper to safely use darkMode (prevents hydration mismatch)
  const isDark = mounted && darkMode

  // Use mounted state to determine dark mode class to prevent hydration mismatch
  const bgClass = isDark
    ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900' 
    : 'bg-gradient-to-br from-blue-50 to-indigo-100'

  return (
    <div className={`min-h-screen ${bgClass} transition-all duration-500`}>
      {/* Desktop Header */}
      <div className="hidden lg:block">
        <Header 
          title="Ngân sách hàng tháng"
          subtitle="Tổng quan chi tiêu và thu nhập"
          icon="📋"
          darkMode={mounted ? darkMode : false}
          setDarkMode={setDarkMode}
          showDarkModeToggle={true}
        />
      </div>

      {/* Mobile Header */}
      <MobileHeader
        title="Ngân sách"
        icon="📋"
        darkMode={mounted ? darkMode : false}
        setDarkMode={setDarkMode}
      />

      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
          duration={notification.duration}
        />
      )}

      <div className="max-w-7xl mx-auto px-0 sm:px-4 lg:px-6 py-4 lg:py-6 pb-20 lg:pb-6">
        {/* Tabs */}
        <div className={`flex gap-2 mb-6 px-4 sm:px-0 ${(mounted && darkMode) ? 'text-white' : 'text-gray-900'}`}>
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 sm:flex-none px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'overview'
                ? darkMode 
                  ? 'bg-orange-600 text-white shadow-lg' 
                  : 'bg-indigo-600 text-white shadow-lg'
                : darkMode
                  ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            📊 Tổng quan
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`flex-1 sm:flex-none px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'manage'
                ? darkMode 
                  ? 'bg-orange-600 text-white shadow-lg' 
                  : 'bg-indigo-600 text-white shadow-lg'
                : darkMode
                  ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            💰 Quản lý ngân sách
          </button>
        </div>

        {/* Loading State */}
        {(status === 'loading' || loading) && activeTab === 'overview' && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Đang tải dữ liệu...
            </div>
          </div>
        )}

        {/* No Data State */}
        {!loading && !summary && status === 'authenticated' && activeTab === 'overview' && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Không có dữ liệu ngân sách
            </div>
          </div>
        )}

        {/* Tab: Tổng quan */}
        {activeTab === 'overview' && !loading && summary && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Chart */}
          <div className={`lg:col-span-1 rounded-lg shadow-lg p-6 ${
            isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'
          }`}>
            <h2 className={`text-xl font-semibold mb-4 ${
              isDark ? 'text-orange-400' : 'text-orange-600'
            }`}>Ngân sách hàng tháng</h2>
            
            {/* Chart */}
            <div className="h-64 mb-6">
              {chartData && <Bar data={chartData} options={chartOptions} />}
            </div>

            {/* Balance labels */}
            <div className="grid grid-cols-2 gap-4 text-center mb-6">
              <div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  SỐ DƯ ĐẦU KỲ
                </div>
                <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(summary.startingBalance)}
                </div>
              </div>
              <div>
                <div className={`text-sm ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                  SỐ DƯ CUỐI KỲ
                </div>
                <div className={`text-lg font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                  {formatCurrency(summary.endingBalance)}
                </div>
              </div>
            </div>

            {/* Savings box */}
            <div className={`rounded-lg p-4 border ${
              isDark ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="text-center">
                <div className={`text-3xl font-bold mb-1 ${
                  summary.savingsPercent > 0 
                    ? isDark ? 'text-green-400' : 'text-green-600'
                    : isDark ? 'text-red-400' : 'text-red-600'
                }`}>
                  {summary.savingsPercent > 0 ? '+' : ''}{summary.savingsPercent}%
                </div>
                <div className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Mức tăng đẳng dần xấp xỉ
                </div>
                <div className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(summary.savings)}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Tiết kiệm tháng này
                </div>
              </div>
            </div>
          </div>

          {/* Right: Tables */}
          <div className={`lg:col-span-2 rounded-lg shadow-lg p-6 ${
            isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Chi phí */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${
                  isDark ? 'text-orange-400' : 'text-orange-600'
                }`}>Chi phí</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className={isDark ? 'bg-slate-700' : 'bg-gray-50'}>
                      <tr className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                        <th className="px-3 py-2 text-left">Danh mục</th>
                        <th className="px-3 py-2 text-right">Dự kiến</th>
                        <th className="px-3 py-2 text-right">Thực tế</th>
                        <th className="px-3 py-2 text-right">Chênh lệch</th>
                      </tr>
                    </thead>
                    <tbody className={isDark ? 'text-gray-300' : 'text-gray-900'}>
                      {/* Total row */}
                      <tr className={`font-bold ${isDark ? 'bg-slate-700' : 'bg-blue-50'}`}>
                        <td className="px-3 py-2">Tổng</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(0)}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(summary.totalExpenses)}</td>
                        <td className={`px-3 py-2 text-right ${isDark ? 'text-red-400' : 'text-red-600'}`}>
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

        {/* Tab: Quản lý ngân sách */}
        {activeTab === 'manage' && (
          <div className="space-y-6 px-4 sm:px-0">
            {/* Form */}
            <div className={`rounded-2xl shadow-lg p-6 ${
              isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'
            }`}>
              <h2 className={`text-xl font-bold mb-4 ${
                isDark ? 'text-orange-400' : 'text-indigo-600'
              }`}>
                {editingId ? '✏️ Chỉnh sửa ngân sách' : '➕ Thêm ngân sách mới'}
              </h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>Danh mục *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({...form, category: e.target.value})}
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:border-transparent ${
                      darkMode 
                        ? 'bg-slate-700 border-slate-600 text-white focus:ring-orange-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-500'
                    }`}
                    required
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>Ngân sách tháng (VND) *</label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm({...form, amount: e.target.value})}
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:border-transparent ${
                      darkMode 
                        ? 'bg-slate-700 border-slate-600 text-white focus:ring-orange-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-500'
                    }`}
                    placeholder="5000000"
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Hạn mức ngày (VND)
                    <span className="text-xs ml-1 opacity-70">(Tự động: tháng/30)</span>
                  </label>
                  <input
                    type="number"
                    value={form.dailyLimit}
                    onChange={(e) => setForm({...form, dailyLimit: e.target.value})}
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:border-transparent ${
                      darkMode 
                        ? 'bg-slate-700 border-slate-600 text-white focus:ring-orange-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-500'
                    }`}
                    placeholder="Tự động tính"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Hạn mức tuần (VND)
                    <span className="text-xs ml-1 opacity-70">(Tự động: tháng/4)</span>
                  </label>
                  <input
                    type="number"
                    value={form.weeklyLimit}
                    onChange={(e) => setForm({...form, weeklyLimit: e.target.value})}
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:border-transparent ${
                      darkMode 
                        ? 'bg-slate-700 border-slate-600 text-white focus:ring-orange-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-500'
                    }`}
                    placeholder="Tự động tính"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>Cảnh báo khi đạt (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={form.alertThreshold}
                    onChange={(e) => setForm({...form, alertThreshold: e.target.value})}
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:border-transparent ${
                      darkMode 
                        ? 'bg-slate-700 border-slate-600 text-white focus:ring-orange-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-500'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>Chu kỳ</label>
                  <select
                    value={form.period}
                    onChange={(e) => setForm({...form, period: e.target.value})}
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:border-transparent ${
                      darkMode 
                        ? 'bg-slate-700 border-slate-600 text-white focus:ring-orange-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-500'
                    }`}
                  >
                    <option value="monthly">📅 Tháng</option>
                    <option value="yearly">📆 Năm</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.blockOnExceed}
                      onChange={(e) => setForm({...form, blockOnExceed: e.target.checked})}
                      className="w-5 h-5 rounded focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    />
                    <span className={`text-sm font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      🚫 Chặn khi vượt hạn mức
                    </span>
                  </label>
                </div>

                <div className="flex items-end gap-2">
                  <button
                    type="submit"
                    disabled={isLoadingBudgets}
                    className={`flex-1 px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 ${
                      darkMode
                        ? 'bg-orange-600 hover:bg-orange-700 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {editingId ? '💾 Cập nhật' : '➕ Thêm'}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null)
                        setForm({ 
                          category: '', 
                          amount: '', 
                          period: 'monthly', 
                          alertThreshold: 80,
                          dailyLimit: '',
                          weeklyLimit: '',
                          blockOnExceed: false
                        })
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        darkMode
                          ? 'bg-slate-600 hover:bg-slate-700 text-white'
                          : 'bg-gray-500 hover:bg-gray-600 text-white'
                      }`}
                    >
                      ✖️
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Budget List */}
            <div className={`rounded-2xl shadow-lg p-6 ${
              isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'
            }`}>
              <h2 className={`text-xl font-bold mb-6 ${
                isDark ? 'text-orange-400' : 'text-indigo-600'
              }`}>📋 Danh sách ngân sách</h2>
              
              {isLoadingBudgets && (
                <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Đang tải...
                </div>
              )}

              {!isLoadingBudgets && budgets.length === 0 && (
                <div className="text-center py-12">
                  <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Chưa có ngân sách nào
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Hãy thêm ngân sách mới ở trên!
                  </p>
                </div>
              )}

              {!isLoadingBudgets && budgets.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {budgets.map(budget => (
                    <div 
                      key={budget.id} 
                      className={`p-4 border-2 rounded-lg hover:shadow-md transition-shadow ${
                        darkMode 
                          ? 'border-slate-600 hover:border-orange-500' 
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className={`font-bold text-lg ${
                          isDark ? 'text-orange-400' : 'text-indigo-600'
                        }`}>{budget.category}</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(budget)}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium transition-colors"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(budget.id)}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium transition-colors"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                            Ngân sách tháng:
                          </span>
                          <span className={`font-semibold ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            {budget.amount.toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                        
                        {budget.dailyLimit && (
                          <div className="flex justify-between text-sm">
                            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                              Hạn mức ngày:
                            </span>
                            <span className="font-semibold text-green-600">
                              {budget.dailyLimit.toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                        )}
                        
                        {budget.weeklyLimit && (
                          <div className="flex justify-between text-sm">
                            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                              Hạn mức tuần:
                            </span>
                            <span className="font-semibold text-blue-600">
                              {budget.weeklyLimit.toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                        )}
                        
                        <div className="flex justify-between text-sm">
                          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                            Chu kỳ:
                          </span>
                          <span className="font-semibold">
                            {budget.period === 'monthly' ? '📅 Tháng' : '📆 Năm'}
                          </span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                            Cảnh báo:
                          </span>
                          <span className="font-semibold text-orange-500">
                            {budget.alertThreshold}%
                          </span>
                        </div>
                        
                        {budget.blockOnExceed && (
                          <div className="pt-2 border-t border-gray-200 dark:border-slate-600">
                            <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded">
                              🚫 Chặn khi vượt
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  )
}
