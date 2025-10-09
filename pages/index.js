import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Doughnut, Bar, Line } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement } from 'chart.js'
import Notification, { useNotification } from '../components/Notification'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement)

export default function Home(){
  const { data: session } = useSession()
  const [expenses, setExpenses] = useState([])
  const [debts, setDebts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const { notification, showNotification, hideNotification } = useNotification()
  
  // New states for enhanced features
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  const [analytics, setAnalytics] = useState(null)
  const [budgets, setBudgets] = useState([])
  const [exportHistory, setExportHistory] = useState([])
  const [showAdvancedView, setShowAdvancedView] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [lastFetchTime, setLastFetchTime] = useState(0)

  // Load dark mode preference from localStorage on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode')
    if (savedDarkMode === 'true') {
      setDarkMode(true)
    }
  }, [])

  // Save dark mode preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString())
  }, [darkMode])

  // Load cached data from localStorage on mount
  useEffect(() => {
    const cachedExpenses = localStorage.getItem('expenses_cache')
    const cachedDebts = localStorage.getItem('debts_cache')
    const cachedTimestamp = localStorage.getItem('data_cache_timestamp')
    
    if (cachedExpenses && cachedDebts) {
      const timestamp = parseInt(cachedTimestamp || '0')
      const now = Date.now()
      // Cache valid for 5 minutes
      if (now - timestamp < 5 * 60 * 1000) {
        setExpenses(JSON.parse(cachedExpenses))
        setDebts(JSON.parse(cachedDebts))
        setLastFetchTime(timestamp)
        console.log('✅ Loaded data from cache')
      }
    }
  }, [])

  useEffect(() => {
    if (session) {
      const now = Date.now()
      // Only fetch if more than 5 minutes since last fetch
      if (now - lastFetchTime > 5 * 60 * 1000) {
        fetchData()
      }
      // Don't fetch analytics/budgets on Dashboard page - only needed on Advanced Dashboard
    }
  }, [session])

  useEffect(() => {
    // Apply dark mode class
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  async function fetchData() {
    try {
      console.log('🔄 Fetching fresh data from API...')
      const [expRes, debtRes] = await Promise.all([
        fetch('/api/expenses'),
        fetch('/api/debts')
      ])
      const expData = await expRes.json()
      const debtData = await debtRes.json()
      
      const expensesList = expData.items || []
      const debtsList = debtData.notes || []
      
      setExpenses(expensesList)
      setDebts(debtsList)
      
      // Cache data to localStorage
      localStorage.setItem('expenses_cache', JSON.stringify(expensesList))
      localStorage.setItem('debts_cache', JSON.stringify(debtsList))
      localStorage.setItem('data_cache_timestamp', Date.now().toString())
      setLastFetchTime(Date.now())
      
      console.log('✅ Data cached successfully')
    } catch (error) {
      console.error('Error fetching data:', error)
      showNotification('❌ Không thể tải dữ liệu. Sử dụng cache cũ.', 'warning')
    }
  }

  async function fetchAnalytics() {
    try {
      const res = await fetch('/api/analytics')
      const data = await res.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  async function fetchBudgets() {
    try {
      const res = await fetch('/api/budgets')
      const data = await res.json()
      setBudgets(data.budgets || [])
    } catch (error) {
      console.error('Error fetching budgets:', error)
    }
  }

  async function fetchExportHistory() {
    try {
      const res = await fetch('/api/export-history')
      const data = await res.json()
      setExportHistory(data.history || [])
    } catch (error) {
      console.error('Error fetching export history:', error)
    }
  }

  async function handleBackup() {
    setIsLoading(true)
    try {
      showNotification('💾 Đang tạo backup...', 'info', 3000)
      
      const response = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'backup' })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        const link = document.createElement('a')
        link.href = data.downloadUrl
        link.download = data.filename
        link.click()
        
        showNotification(
          `✅ Backup thành công!\n\n📧 File đã được gửi đến ${session.user.email}\n📥 ${data.filename}`,
          'success',
          8000
        )
      } else {
        showNotification(`❌ ${data.error || 'Lỗi tạo backup'}`, 'error')
      }
    } catch (error) {
      showNotification('❌ Không thể tạo backup', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  function downloadChartAsImage(chartId) {
    const canvas = document.getElementById(chartId)
    if (canvas) {
      const url = canvas.toCanvas ? canvas.toCanvas().toDataURL('image/png') : canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `${chartId}-${new Date().toISOString().split('T')[0]}.png`
      link.href = url
      link.click()
      showNotification('✅ Biểu đồ đã được tải xuống!', 'success')
    }
  }

  // Calculate statistics
  const stats = {
    totalExpense: expenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + (e.amount || 0), 0),
    totalIncome: expenses.filter(e => e.type === 'income').reduce((sum, e) => sum + (e.amount || 0), 0),
    totalDebt: debts.filter(d => d.status !== 'paid').reduce((sum, d) => sum + (d.amount || 0), 0),
    expenseCount: expenses.filter(e => e.type === 'expense').length,
    incomeCount: expenses.filter(e => e.type === 'income').length,
    debtCount: debts.filter(d => d.status !== 'paid').length
  }

  stats.balance = stats.totalIncome - stats.totalExpense

  // Group by category
  const categoryData = {}
  expenses.filter(e => e.type === 'expense').forEach(e => {
    categoryData[e.category] = (categoryData[e.category] || 0) + e.amount
  })

  // Monthly data (last 6 months)
  const monthlyData = {}
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = date.toISOString().slice(0, 7)
    monthlyData[key] = { expense: 0, income: 0 }
  }
  
  expenses.forEach(e => {
    const month = e.date?.slice(0, 7)
    if (monthlyData[month]) {
      if (e.type === 'expense') monthlyData[month].expense += e.amount
      else monthlyData[month].income += e.amount
    }
  })

  // Export function
  async function exportData(format = 'excel') {
    setIsLoading(true)
    try {
      showNotification('⏳ Đang xuất dữ liệu...', 'info', 3000)
      
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          format, 
          expenses, 
          debts,
          stats,
          month: selectedMonth
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Download file
        if (data.downloadUrl) {
          const link = document.createElement('a')
          link.href = data.downloadUrl
          link.download = data.filename
          link.click()
        }
        
        showNotification(
          `✅ Xuất dữ liệu thành công!\n\n📧 Email đã được gửi đến ${session.user.email}\n📥 File: ${data.filename}`,
          'success',
          8000
        )
      } else {
        showNotification(`❌ ${data.error || 'Lỗi xuất dữ liệu'}`, 'error')
      }
    } catch (error) {
      console.error('Export error:', error)
      showNotification('❌ Không thể xuất dữ liệu', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const bgClass = darkMode 
    ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900' 
    : 'bg-gradient-to-br from-[#D2C1B6]/20 via-white to-[#456882]/10'
  const cardBgClass = darkMode 
    ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 shadow-2xl' 
    : 'bg-white'
  const textClass = darkMode ? 'text-gray-100' : 'text-gray-900'

  return (
    <div className={`min-h-screen ${bgClass} transition-all duration-500`}>
      {/* Header - Optimized & Compact */}
      <header className={darkMode 
        ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-2xl border-b border-slate-700' 
        : 'bg-gradient-to-r from-[#1B3C53] via-[#234C6A] to-[#1B3C53] shadow-xl'
      }>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logo + Title + Navigation */}
            <div className="flex items-center gap-6">
              {/* Logo & Title - Compact */}
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                  <span className="text-2xl">📊</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-white">Dashboard</h1>
                  <p className="text-[#D2C1B6] text-xs">Tổng quan tài chính</p>
                </div>
              </div>

              {/* Navigation - Inline */}
              <nav className="hidden lg:flex items-center gap-2">
                <Link 
                  href="/" 
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#456882] text-white rounded-lg text-sm font-medium border-2 border-[#D2C1B6] shadow-lg"
                >
                  <span>📊</span>
                  <span>Dashboard</span>
                </Link>
                <Link 
                  href="/expenses" 
                  className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all duration-200 text-sm font-medium border border-white/10 hover:border-white/20"
                >
                  <span>💰</span>
                  <span>Chi tiêu</span>
                </Link>
                <Link 
                  href="/debts" 
                  className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all duration-200 text-sm font-medium border border-white/10 hover:border-white/20"
                >
                  <span>📝</span>
                  <span>Khoản nợ</span>
                </Link>
                <Link 
                  href="/transaction-history" 
                  className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all duration-200 text-sm font-medium border border-white/10 hover:border-white/20"
                >
                  <span>📜</span>
                  <span>Lịch sử</span>
                </Link>
              </nav>
            </div>

            {/* Right: Dark Mode + User */}
            <div className="flex items-center gap-2">
              {/* Dark Mode Toggle - Smaller */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                  darkMode 
                    ? 'bg-gradient-to-br from-yellow-400 to-orange-400 shadow-md shadow-yellow-500/20' 
                    : 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-purple-500/20'
                }`}
                title={darkMode ? 'Chế độ sáng' : 'Chế độ tối'}
              >
                <span className="text-lg">{darkMode ? '☀️' : '🌙'}</span>
              </button>
              
              {/* User Info - Compact */}
              {session?.user && (
                <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5 backdrop-blur-sm border border-white/10">
                  <img 
                    src={session.user.image} 
                    alt="avatar" 
                    className="w-8 h-8 rounded-full ring-2 ring-[#D2C1B6]" 
                  />
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-white leading-tight">{session.user.name?.split(' ')[0]}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation - Below header */}
          <nav className="lg:hidden flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
            <Link 
              href="/" 
              className="flex items-center gap-1.5 px-3 py-2 bg-[#456882] text-white rounded-lg text-sm font-medium border-2 border-[#D2C1B6] shadow-lg"
            >
              <span>📊</span>
              <span>Dashboard</span>
            </Link>
            <Link 
              href="/expenses" 
              className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all duration-200 text-sm font-medium border border-white/10"
            >
              <span>💰</span>
              <span>Chi tiêu</span>
            </Link>
            <Link 
              href="/debts" 
              className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all duration-200 text-sm font-medium border border-white/10"
            >
              <span>📝</span>
              <span>Khoản nợ</span>
            </Link>
            <Link 
              href="/transaction-history" 
              className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all duration-200 text-sm font-medium border border-white/10"
            >
              <span>📜</span>
              <span>Lịch sử</span>
            </Link>

            {/* Logout/Login button on mobile */}
            {session ? (
              <button 
                onClick={() => signOut()}
                className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-sm font-medium ml-auto"
              >
                <span>🚪</span>
                <span>Thoát</span>
              </button>
            ) : (
              <Link 
                href="/auth"
                className="flex items-center gap-1.5 px-3 py-2 bg-[#D2C1B6] text-[#1B3C53] rounded-lg text-sm font-medium ml-auto"
              >
                <span>🔐</span>
                <span>Đăng nhập</span>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
          duration={notification.duration}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cache Info - Hidden for cleaner UI */}

        {/* Quick Actions */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className={`w-full px-4 py-2 border-2 rounded-lg transition-all duration-200 ${
                darkMode
                  ? 'bg-slate-700 border-slate-600 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
                  : 'bg-white border-[#D2C1B6] focus:ring-2 focus:ring-[#234C6A] focus:border-transparent'
              }`}
            />
          </div>
          <button
            onClick={() => exportData('excel')}
            disabled={isLoading}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
          >
            <span>📊</span>
            <span>Xuất CSV & Email</span>
          </button>
          <button
            onClick={() => exportData('csv')}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
          >
            <span>📄</span>
            <span>Xuất CSV</span>
          </button>
        </div>

        {/* Stats Cards - Enhanced with Dark Mode */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Income */}
          <div className={`rounded-2xl shadow-2xl p-6 text-white transform hover:scale-105 transition-all duration-300 ${
            darkMode 
              ? 'bg-gradient-to-br from-emerald-600 to-teal-700 shadow-emerald-500/30' 
              : 'bg-gradient-to-br from-green-500 to-green-600'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium opacity-90">Thu nhập</h3>
              <span className="text-3xl">💰</span>
            </div>
            <p className="text-3xl font-bold mb-1">{stats.totalIncome.toLocaleString('vi-VN')}đ</p>
            <p className="text-sm opacity-80">{stats.incomeCount} giao dịch</p>
          </div>

          {/* Total Expense */}
          <div className={`rounded-2xl shadow-2xl p-6 text-white transform hover:scale-105 transition-all duration-300 ${
            darkMode 
              ? 'bg-gradient-to-br from-rose-600 to-pink-700 shadow-rose-500/30' 
              : 'bg-gradient-to-br from-red-500 to-red-600'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium opacity-90">Chi tiêu</h3>
              <span className="text-3xl">💸</span>
            </div>
            <p className="text-3xl font-bold mb-1">{stats.totalExpense.toLocaleString('vi-VN')}đ</p>
            <p className="text-sm opacity-80">{stats.expenseCount} giao dịch</p>
          </div>

          {/* Balance */}
          <div className={`rounded-2xl shadow-2xl p-6 text-white transform hover:scale-105 transition-all duration-300 ${
            stats.balance >= 0 
              ? darkMode 
                ? 'bg-gradient-to-br from-blue-600 to-cyan-700 shadow-blue-500/30' 
                : 'bg-gradient-to-br from-blue-500 to-blue-600'
              : darkMode
                ? 'bg-gradient-to-br from-orange-600 to-amber-700 shadow-orange-500/30'
                : 'bg-gradient-to-br from-orange-500 to-orange-600'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium opacity-90">Số dư</h3>
              <span className="text-3xl">💵</span>
            </div>
            <p className="text-3xl font-bold mb-1">{stats.balance.toLocaleString('vi-VN')}đ</p>
            <p className="text-sm opacity-80">{stats.balance >= 0 ? 'Dương' : 'Âm'}</p>
          </div>

          {/* Total Debt */}
          <div className={`rounded-2xl shadow-2xl p-6 text-white transform hover:scale-105 transition-all duration-300 ${
            darkMode 
              ? 'bg-gradient-to-br from-purple-600 to-indigo-700 shadow-purple-500/30' 
              : 'bg-gradient-to-br from-purple-500 to-purple-600'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium opacity-90">Khoản nợ</h3>
              <span className="text-3xl">📝</span>
            </div>
            <p className="text-3xl font-bold mb-1">{stats.totalDebt.toLocaleString('vi-VN')}đ</p>
            <p className="text-sm opacity-80">{stats.debtCount} khoản</p>
          </div>
        </div>

        {/* Charts - Enhanced */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Monthly Trend */}
          <div className={`lg:col-span-2 ${cardBgClass} rounded-2xl shadow-xl p-6 border backdrop-blur-sm ${
            darkMode ? 'border-slate-700/50' : 'border-[#D2C1B6]/30'
          }`}>
            <h2 className={`text-xl font-bold ${textClass} mb-4 flex items-center gap-2`}>
              <span>📈</span> Xu hướng 6 tháng
            </h2>
            <Line 
              data={{
                labels: Object.keys(monthlyData),
                datasets: [
                  {
                    label: 'Thu nhập',
                    data: Object.values(monthlyData).map(m => m.income),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4
                  },
                  {
                    label: 'Chi tiêu',
                    data: Object.values(monthlyData).map(m => m.expense),
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4
                  }
                ]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' }
                },
                scales: {
                  y: { beginAtZero: true }
                }
              }}
            />
          </div>

          {/* Category Pie */}
          <div className={`${cardBgClass} rounded-2xl shadow-xl p-6 border backdrop-blur-sm ${
            darkMode ? 'border-slate-700/50' : 'border-[#D2C1B6]/30'
          }`}>
            <h3 className={`text-xl font-bold ${textClass} mb-4 flex items-center gap-2`}>
              <span>🎯</span> Chi theo danh mục
            </h3>
            <Doughnut 
              data={{
                labels: Object.keys(categoryData),
                datasets: [{
                  data: Object.values(categoryData),
                  backgroundColor: ['#1B3C53','#234C6A','#456882','#D2C1B6','#10b981','#f59e0b']
                }]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'bottom' }
                }
              }}
            />
          </div>
        </div>

        {/* Category Bar Chart */}
        <div className={`${cardBgClass} rounded-2xl shadow-xl p-6 border backdrop-blur-sm ${
          darkMode ? 'border-slate-700/50' : 'border-[#D2C1B6]/30'
        }`}>
          <h2 className={`text-xl font-bold ${textClass} mb-4 flex items-center gap-2`}>
            <span>📊</span> Chi tiết theo danh mục
          </h2>
          <Bar 
            data={{
              labels: Object.keys(categoryData),
              datasets: [{
                label: 'Chi tiêu (VNĐ)',
                data: Object.values(categoryData),
                backgroundColor: '#234C6A'
              }]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false }
              },
              scales: {
                y: { beginAtZero: true }
              }
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#1B3C53] border-t border-[#234C6A] mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* About */}
            <div>
              <h3 className="text-white font-bold text-lg mb-3">📊 Expense Manager</h3>
              <p className="text-[#D2C1B6] text-sm leading-relaxed">
                Giải pháp toàn diện để quản lý tài chính cá nhân thông minh và hiệu quả.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-bold text-lg mb-3">Liên kết nhanh</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-[#D2C1B6] hover:text-white transition-colors text-sm">
                    📊 Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/expenses" className="text-[#D2C1B6] hover:text-white transition-colors text-sm">
                    💰 Quản lý Chi tiêu
                  </Link>
                </li>
                <li>
                  <Link href="/debts" className="text-[#D2C1B6] hover:text-white transition-colors text-sm">
                    📝 Quản lý Khoản nợ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Info */}
            <div>
              <h3 className="text-white font-bold text-lg mb-3">Tính năng nổi bật</h3>
              <ul className="space-y-2 text-[#D2C1B6] text-sm">
                <li>✅ Đồng bộ Google Sheets</li>
                <li>✅ Thống kê chi tiêu</li>
                <li>✅ Quản lý khoản nợ</li>
                <li>✅ Nhắc nhở tự động</li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-[#234C6A] mt-8 pt-6 text-center">
            <p className="text-[#D2C1B6] text-sm">
              © {new Date().getFullYear()} Expense Manager. Made with ❤️
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
