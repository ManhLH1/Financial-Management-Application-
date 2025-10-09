import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect, useRef } from 'react'
import { Doughnut, Bar, Line } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement } from 'chart.js'
import Notification, { useNotification } from '../components/Notification'
import Footer from '../components/Footer'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement)

export default function AdvancedDashboard(){
  const { data: session } = useSession()
  const [expenses, setExpenses] = useState([])
  const [debts, setDebts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const { notification, showNotification, hideNotification } = useNotification()
  
  // Date Range instead of single month
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  
  // New features state
  const [analytics, setAnalytics] = useState(null)
  const [budgets, setBudgets] = useState([])
  const [exportHistory, setExportHistory] = useState([])
  const [showAdvancedView, setShowAdvancedView] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [activeTab, setActiveTab] = useState('overview') // overview, analytics, budget, history
  const [lastFetchTime, setLastFetchTime] = useState(0)
  
  // Chart refs for exporting
  const lineChartRef = useRef(null)
  const doughnutChartRef = useRef(null)
  const barChartRef = useRef(null)

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

  // Load from cache on mount
  useEffect(() => {
    const cachedExpenses = localStorage.getItem('expenses_cache')
    const cachedDebts = localStorage.getItem('debts_cache')
    const cachedTimestamp = localStorage.getItem('data_cache_timestamp')
    
    if (cachedExpenses && cachedDebts) {
      const timestamp = parseInt(cachedTimestamp || '0')
      const now = Date.now()
      if (now - timestamp < 5 * 60 * 1000) {
        setExpenses(JSON.parse(cachedExpenses))
        setDebts(JSON.parse(cachedDebts))
        setLastFetchTime(timestamp)
        console.log('✅ Loaded from cache (Advanced Dashboard)')
      }
    }
  }, [])

  useEffect(() => {
    if (session) {
      const now = Date.now()
      // Fetch main data only if cache is stale
      if (now - lastFetchTime > 5 * 60 * 1000) {
        fetchMainData()
      }
      // Fetch analytics/budgets/history based on active tab (lazy loading)
      if (activeTab === 'analytics' && !analytics) {
        fetchAnalytics()
      } else if (activeTab === 'budget' && budgets.length === 0) {
        fetchBudgets()
      } else if (activeTab === 'history' && exportHistory.length === 0) {
        fetchExportHistory()
      }
    }
  }, [session, activeTab])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  async function fetchMainData() {
    try {
      console.log('🔄 Fetching main data (Advanced)...')
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
      
      // Update cache
      localStorage.setItem('expenses_cache', JSON.stringify(expensesList))
      localStorage.setItem('debts_cache', JSON.stringify(debtsList))
      localStorage.setItem('data_cache_timestamp', Date.now().toString())
      setLastFetchTime(Date.now())
      
      console.log('✅ Main data cached')
    } catch (error) {
      console.error('Error fetching main data:', error)
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

  async function fetchAllData() {
    await fetchMainData()
    // Lazy load others based on tab
    if (activeTab === 'analytics') await fetchAnalytics()
    if (activeTab === 'budget') await fetchBudgets()
    if (activeTab === 'history') await fetchExportHistory()
  }

  // Filter expenses by date range
  const filteredExpenses = expenses.filter(e => {
    if (!e.date) return false
    return e.date >= dateRange.startDate && e.date <= dateRange.endDate
  })

  // Calculate statistics based on date range
  const stats = {
    totalExpense: filteredExpenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + (e.amount || 0), 0),
    totalIncome: filteredExpenses.filter(e => e.type === 'income').reduce((sum, e) => sum + (e.amount || 0), 0),
    totalDebt: debts.filter(d => d.status !== 'paid').reduce((sum, d) => sum + (d.amount || 0), 0),
    expenseCount: filteredExpenses.filter(e => e.type === 'expense').length,
    incomeCount: filteredExpenses.filter(e => e.type === 'income').length,
    debtCount: debts.filter(d => d.status !== 'paid').length
  }
  stats.balance = stats.totalIncome - stats.totalExpense

  // Check budget warnings
  const budgetWarnings = budgets.map(budget => {
    const categoryExpenses = filteredExpenses
      .filter(e => e.type === 'expense' && e.category === budget.category)
      .reduce((sum, e) => sum + (e.amount || 0), 0)
    
    const percentage = budget.amount > 0 ? (categoryExpenses / budget.amount * 100).toFixed(1) : 0
    const isWarning = percentage >= budget.alertThreshold
    
    return {
      ...budget,
      spent: categoryExpenses,
      percentage,
      isWarning,
      remaining: budget.amount - categoryExpenses
    }
  })

  // Group by category
  const categoryData = {}
  filteredExpenses.filter(e => e.type === 'expense').forEach(e => {
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

  async function exportData(format = 'csv') {
    setIsLoading(true)
    try {
      showNotification('⏳ Đang xuất dữ liệu...', 'info', 3000)
      
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          format, 
          expenses: filteredExpenses, 
          debts,
          stats,
          dateRange
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        if (data.downloadUrl) {
          const link = document.createElement('a')
          link.href = data.downloadUrl
          link.download = data.filename
          link.click()
        }
        
        // Save to export history
        await fetch('/api/export-history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: data.filename,
            format,
            month: `${dateRange.startDate} to ${dateRange.endDate}`,
            fileSize: 'N/A'
          })
        })
        
        await fetchAllData() // Refresh history
        
        showNotification(
          `✅ Xuất dữ liệu thành công!\n\n📧 Email đã được gửi đến ${session.user.email}\n📥 File: ${data.filename}`,
          'success',
          8000
        )
      } else {
        showNotification(`❌ ${data.error || 'Lỗi xuất dữ liệu'}`, 'error')
      }
    } catch (error) {
      showNotification('❌ Không thể xuất dữ liệu', 'error')
    } finally {
      setIsLoading(false)
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
          `✅ Backup thành công!\n\n📧 File: ${data.filename}\nĐã gửi về email: ${session.user.email}`,
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

  function downloadChartAsImage(chartRef, chartName) {
    if (chartRef.current) {
      const canvas = chartRef.current.canvas
      if (canvas) {
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.download = `${chartName}-${new Date().toISOString().split('T')[0]}.png`
          link.href = url
          link.click()
          showNotification('✅ Biểu đồ đã được tải xuống!', 'success')
        })
      }
    }
  }

  // Chart configurations
  const lineChartData = {
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
  }

  const doughnutData = {
    labels: Object.keys(categoryData),
    datasets: [{
      data: Object.values(categoryData),
      backgroundColor: [
        '#1B3C53', '#234C6A', '#456882', '#D2C1B6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'
      ]
    }]
  }

  const barData = {
    labels: Object.keys(categoryData),
    datasets: [{
      label: 'Chi tiêu theo danh mục',
      data: Object.values(categoryData),
      backgroundColor: '#234C6A'
    }]
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#D2C1B6]/20 via-white to-[#456882]/10">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-[#1B3C53]">Vui lòng đăng nhập</h2>
          <Link href="/auth" className="btn btn-primary">
            Đăng nhập với Google
          </Link>
        </div>
      </div>
    )
  }

  const bgClass = darkMode 
    ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900' 
    : 'bg-gradient-to-br from-[#D2C1B6]/20 via-white to-[#456882]/10'
  const textClass = darkMode ? 'text-gray-100' : 'text-gray-900'
  const cardBgClass = darkMode 
    ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 shadow-2xl' 
    : 'bg-white'

  return (
    <div className={`min-h-screen ${bgClass} transition-all duration-500`}>
      {/* Header */}
      <header className={darkMode 
        ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-2xl border-b border-slate-700' 
        : 'bg-gradient-to-r from-[#1B3C53] via-[#234C6A] to-[#1B3C53] shadow-xl'
      }>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-5">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                <span className="text-3xl">📊</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard Nâng Cao</h1>
                <p className="text-[#D2C1B6] text-sm mt-1">Tổng quan quản lý tài chính thông minh</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Dark Mode Toggle - Enhanced */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative p-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  darkMode 
                    ? 'bg-gradient-to-br from-yellow-400 to-orange-400 shadow-lg shadow-yellow-500/30' 
                    : 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-purple-500/30'
                }`}
                title={darkMode ? 'Chế độ sáng' : 'Chế độ tối'}
              >
                <span className="text-xl">{darkMode ? '☀️' : '🌙'}</span>
              </button>
              
              {session?.user && (
                <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2 backdrop-blur-sm border border-white/10">
                  <img 
                    src={session.user.image} 
                    alt="avatar" 
                    className="w-10 h-10 rounded-full ring-2 ring-[#D2C1B6]" 
                  />
                  <div className="hidden md:block">
                    <p className="text-sm font-semibold text-white">{session.user.name}</p>
                    <p className="text-xs text-[#D2C1B6]">{session.user.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center justify-between pb-4 border-t border-white/10 pt-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Link 
                href="/" 
                className="group flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all duration-200 font-medium border border-white/10 hover:border-white/20"
              >
                <span className="text-lg">📊</span>
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <Link 
                href="/dashboard-advanced" 
                className="group flex items-center gap-2 px-4 py-2.5 bg-[#456882] text-white rounded-lg font-medium border-2 border-[#D2C1B6] shadow-lg"
              >
                <span className="text-lg">🚀</span>
                <span className="hidden sm:inline">Nâng cao</span>
              </Link>
              <Link 
                href="/expenses" 
                className="group flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all duration-200 font-medium border border-white/10 hover:border-white/20"
              >
                <span className="text-lg">💰</span>
                <span className="hidden sm:inline">Chi tiêu</span>
              </Link>
              <Link 
                href="/debts" 
                className="group flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all duration-200 font-medium border border-white/10 hover:border-white/20"
              >
                <span className="text-lg">📝</span>
                <span className="hidden sm:inline">Khoản nợ</span>
              </Link>
              <Link 
                href="/transaction-history" 
                className="group flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all duration-200 font-medium border border-white/10 hover:border-white/20"
              >
                <span className="text-lg">📜</span>
                <span className="hidden sm:inline">Lịch sử</span>
              </Link>
            </div>
            
            <button 
              onClick={() => signOut()}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 font-medium border border-white/20 hover:border-white/40"
            >
              <span>🚪</span>
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
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
        {/* Date Range Picker & Actions - Enhanced */}
        <div className={`${cardBgClass} rounded-2xl shadow-xl p-6 mb-8 border backdrop-blur-sm ${
          darkMode ? 'border-slate-700/50' : 'border-gray-200'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${textClass}`}>Từ ngày</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                className={`w-full px-4 py-2 border-2 rounded-lg transition-all duration-200 ${
                  darkMode
                    ? 'bg-slate-700 border-slate-600 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
                    : 'bg-white border-[#D2C1B6] focus:ring-2 focus:ring-[#234C6A] focus:border-transparent'
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${textClass}`}>Đến ngày</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                className={`w-full px-4 py-2 border-2 rounded-lg transition-all duration-200 ${
                  darkMode
                    ? 'bg-slate-700 border-slate-600 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
                    : 'bg-white border-[#D2C1B6] focus:ring-2 focus:ring-[#234C6A] focus:border-transparent'
                }`}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => exportData('csv')}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>📊</span>
                <span>Xuất CSV</span>
              </button>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleBackup}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>💾</span>
                <span>Backup</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs - Enhanced */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Tổng quan', icon: '📊', color: 'blue' },
            { id: 'analytics', label: 'Phân tích', icon: '📈', color: 'green' },
            { id: 'budget', label: 'Ngân sách', icon: '💰', color: 'purple' },
            { id: 'history', label: 'Lịch sử', icon: '📜', color: 'orange' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 transform hover:scale-105 ${
                activeTab === tab.id
                  ? darkMode
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-purple-500/30 border border-purple-400'
                    : 'bg-gradient-to-r from-[#234C6A] to-[#456882] text-white shadow-xl'
                  : darkMode
                  ? 'bg-slate-800 text-gray-300 hover:bg-slate-700 border border-slate-700 backdrop-blur-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md border border-gray-200'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards - Enhanced with Dark Mode */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                  <span className="text-3xl">{stats.balance >= 0 ? '📈' : '📉'}</span>
                </div>
                <p className="text-3xl font-bold mb-1">{stats.balance.toLocaleString('vi-VN')}đ</p>
                <p className="text-sm opacity-80">{stats.balance >= 0 ? 'Dương' : 'Âm'}</p>
              </div>

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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className={`${cardBgClass} rounded-2xl shadow-xl p-6 border backdrop-blur-sm ${
                darkMode ? 'border-slate-700/50' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-bold ${textClass}`}>📈 Xu hướng 6 tháng</h3>
                  <button
                    onClick={() => downloadChartAsImage(lineChartRef, 'trend-chart')}
                    className={`px-3 py-1 rounded-lg text-sm transition-all duration-200 ${
                      darkMode
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-purple-500/30'
                        : 'bg-[#234C6A] text-white hover:bg-[#1B3C53]'
                    }`}
                  >
                    💾 Tải ảnh
                  </button>
                </div>
                <Line ref={lineChartRef} data={lineChartData} />
              </div>

              <div className={`${cardBgClass} rounded-2xl shadow-xl p-6 border backdrop-blur-sm ${
                darkMode ? 'border-slate-700/50' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-bold ${textClass}`}>🍩 Phân bố danh mục</h3>
                  <button
                    onClick={() => downloadChartAsImage(doughnutChartRef, 'category-chart')}
                    className={`px-3 py-1 rounded-lg text-sm transition-all duration-200 ${
                      darkMode
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-purple-500/30'
                        : 'bg-[#234C6A] text-white hover:bg-[#1B3C53]'
                    }`}
                  >
                    💾 Tải ảnh
                  </button>
                </div>
                <Doughnut ref={doughnutChartRef} data={doughnutData} />
              </div>
            </div>

            <div className={`${cardBgClass} rounded-2xl shadow-xl p-6 border backdrop-blur-sm ${
              darkMode ? 'border-slate-700/50' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-bold ${textClass}`}>📊 Chi tiết danh mục</h3>
                <button
                  onClick={() => downloadChartAsImage(barChartRef, 'detail-chart')}
                  className={`px-3 py-1 rounded-lg text-sm transition-all duration-200 ${
                    darkMode
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-purple-500/30'
                      : 'bg-[#234C6A] text-white hover:bg-[#1B3C53]'
                  }`}
                >
                  💾 Tải ảnh
                </button>
              </div>
              <Bar ref={barChartRef} data={barData} />
            </div>
          </>
        )}

        {/* Analytics Tab - Enhanced */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            {/* Month Comparison */}
            <div className={`${cardBgClass} rounded-2xl shadow-xl p-6 border backdrop-blur-sm ${
              darkMode ? 'border-slate-700/50' : 'border-gray-200'
            }`}>
              <h3 className={`text-xl font-bold mb-6 ${textClass} flex items-center gap-2`}>
                <span>📊</span>
                <span>So sánh tháng này vs tháng trước</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Tháng hiện tại</p>
                  <p className={`text-3xl font-bold ${textClass}`}>
                    {Number(analytics.comparison.currentMonth.total).toLocaleString('vi-VN')}đ
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {analytics.comparison.currentMonth.count} giao dịch
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">Tháng trước</p>
                  <p className={`text-3xl font-bold ${textClass}`}>
                    {Number(analytics.comparison.lastMonth.total).toLocaleString('vi-VN')}đ
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {analytics.comparison.lastMonth.count} giao dịch
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">Thay đổi</p>
                  <p className={`text-3xl font-bold ${
                    analytics.comparison.change.trend === 'up' ? 'text-red-500' :
                    analytics.comparison.change.trend === 'down' ? 'text-green-500' : 'text-gray-500'
                  }`}>
                    {analytics.comparison.change.trend === 'up' ? '↑' : analytics.comparison.change.trend === 'down' ? '↓' : '→'}
                    {Math.abs(analytics.comparison.change.percent)}%
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {Number(analytics.comparison.change.amount).toLocaleString('vi-VN')}đ
                  </p>
                </div>
              </div>
            </div>

            {/* Top 5 Expenses - Enhanced */}
            <div className={`${cardBgClass} rounded-2xl shadow-xl p-6 border backdrop-blur-sm ${
              darkMode ? 'border-slate-700/50' : 'border-gray-200'
            }`}>
              <h3 className={`text-xl font-bold mb-4 ${textClass} flex items-center gap-2`}>
                <span>🏆</span>
                <span>Top 5 chi tiêu lớn nhất</span>
              </h3>
              <div className="space-y-3">
                {analytics.top5.map((expense, index) => (
                  <div key={index} className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200 hover:scale-102 ${
                    darkMode 
                      ? 'bg-slate-700/50 border border-slate-600/50 hover:bg-slate-700' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className={`text-2xl font-bold ${
                        darkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}>#{index + 1}</span>
                      <div>
                        <p className={`font-semibold ${textClass}`}>{expense.title}</p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {expense.category} • {expense.date}
                        </p>
                      </div>
                    </div>
                    <p className={`text-lg font-bold ${
                      darkMode ? 'text-rose-400' : 'text-red-500'
                    }`}>
                      {expense.amount.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Projection - Enhanced */}
            <div className={`${cardBgClass} rounded-2xl shadow-xl p-6 border backdrop-blur-sm ${
              darkMode ? 'border-slate-700/50' : 'border-gray-200'
            }`}>
              <h3 className={`text-xl font-bold mb-4 ${textClass} flex items-center gap-2`}>
                <span>🔮</span>
                <span>Dự báo tháng này</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Trung bình/ngày</p>
                  <p className={`text-2xl font-bold ${textClass}`}>
                    {analytics.currentMonthProjection.dailyAverage.toLocaleString('vi-VN')}đ
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Đã chi</p>
                  <p className={`text-2xl font-bold ${textClass}`}>
                    {analytics.currentMonthProjection.actualSoFar.toLocaleString('vi-VN')}đ
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Dự kiến cuối tháng</p>
                  <p className={`text-2xl font-bold text-orange-500`}>
                    {analytics.currentMonthProjection.projectedTotal.toLocaleString('vi-VN')}đ
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Dự đoán tháng sau</p>
                  <p className={`text-2xl font-bold text-purple-500`}>
                    {analytics.prediction.nextMonthPrediction.toLocaleString('vi-VN')}đ
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Budget Tab */}
        {activeTab === 'budget' && (
          <div className="space-y-6">
            <div className={`${cardBgClass} rounded-2xl shadow-lg p-6 border`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-bold ${textClass}`}>💰 Quản lý ngân sách</h3>
                <Link
                  href="/budgets"
                  className="px-4 py-2 bg-[#234C6A] text-white rounded-lg hover:bg-[#1B3C53] transition-colors"
                >
                  + Thêm ngân sách
                </Link>
              </div>
              
              {budgetWarnings.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Chưa có ngân sách nào. Hãy tạo ngân sách mới!</p>
              ) : (
                <div className="space-y-4">
                  {budgetWarnings.map(budget => (
                    <div key={budget.id} className={`p-4 rounded-lg border-2 ${
                      budget.isWarning ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`font-bold ${textClass}`}>{budget.category}</h4>
                        <span className={`text-2xl ${budget.isWarning ? 'text-red-500' : 'text-green-500'}`}>
                          {budget.isWarning ? '⚠️' : '✅'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-4">
                            <div
                              className={`h-4 rounded-full ${budget.isWarning ? 'bg-red-500' : 'bg-green-500'}`}
                              style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className={`font-bold ${budget.isWarning ? 'text-red-500' : 'text-green-500'}`}>
                          {budget.percentage}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Đã chi: <span className="font-semibold">{budget.spent.toLocaleString('vi-VN')}đ</span>
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          Ngân sách: <span className="font-semibold">{budget.amount.toLocaleString('vi-VN')}đ</span>
                        </span>
                        <span className={budget.remaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                          Còn lại: <span className="font-semibold">{budget.remaining.toLocaleString('vi-VN')}đ</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className={`${cardBgClass} rounded-2xl shadow-lg p-6 border`}>
            <h3 className={`text-xl font-bold mb-6 ${textClass}`}>📜 Lịch sử xuất dữ liệu</h3>
            {exportHistory.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Chưa có lịch sử xuất dữ liệu</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                      <th className={`text-left py-3 px-4 ${textClass}`}>Tên file</th>
                      <th className={`text-left py-3 px-4 ${textClass}`}>Định dạng</th>
                      <th className={`text-left py-3 px-4 ${textClass}`}>Khoảng thời gian</th>
                      <th className={`text-left py-3 px-4 ${textClass}`}>Ngày xuất</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exportHistory.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className={`py-3 px-4 ${textClass}`}>{item.filename}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                            {item.format.toUpperCase()}
                          </span>
                        </td>
                        <td className={`py-3 px-4 ${textClass}`}>{item.month}</td>
                        <td className={`py-3 px-4 text-sm text-gray-500`}>
                          {new Date(item.exportDate).toLocaleString('vi-VN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
