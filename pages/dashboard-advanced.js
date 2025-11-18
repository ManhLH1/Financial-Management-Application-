import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect, useRef } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement } from 'chart.js'
import Notification, { useNotification } from '../components/Notification'
import Footer from '../components/Footer'
import Header from '../components/Header'
import DashboardFilters from '../components/dashboard/DashboardFilters'
import DashboardTabs from '../components/dashboard/DashboardTabs'
import DashboardHero from '../components/dashboard/DashboardHero'
import DashboardQuickActions from '../components/dashboard/DashboardQuickActions'
import DashboardStats from '../components/dashboard/DashboardStats'
import DashboardInsights from '../components/dashboard/DashboardInsights'
import DashboardCharts from '../components/dashboard/DashboardCharts'
import DashboardActivity from '../components/dashboard/DashboardActivity'
import AnalyticsOverview from '../components/dashboard/AnalyticsOverview'
import BudgetOverview from '../components/dashboard/BudgetOverview'
import ExportHistoryTable from '../components/dashboard/ExportHistoryTable'

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
  
  // Initialize dark mode from localStorage (with SSR safety)
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode')
      return saved ? JSON.parse(saved) : false
    }
    return false
  })
  
  const [activeTab, setActiveTab] = useState('overview') // overview, analytics, budget, history
  const [lastFetchTime, setLastFetchTime] = useState(0)
  
  // Chart refs for exporting
  const lineChartRef = useRef(null)
  const doughnutChartRef = useRef(null)
  const barChartRef = useRef(null)

  // Sync document class and save to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

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

  // Derived insights
  const startDateObj = dateRange.startDate ? new Date(dateRange.startDate) : new Date()
  const endDateObj = dateRange.endDate ? new Date(dateRange.endDate) : new Date()
  const dayDiff = Math.max(Math.round((endDateObj - startDateObj) / (1000 * 60 * 60 * 24)) + 1, 1)

  const dailyExpense = {}
  filteredExpenses
    .filter((e) => e.type === 'expense' && e.date)
    .forEach((expense) => {
      dailyExpense[expense.date] = (dailyExpense[expense.date] || 0) + (expense.amount || 0)
    })

  const peakEntry = Object.entries(dailyExpense).sort((a, b) => b[1] - a[1])[0]
  const peakDay = peakEntry
    ? {
        label: new Date(peakEntry[0]).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' }),
        value: `${peakEntry[1].toLocaleString('vi-VN')}đ`
      }
    : null

  const savingsRate =
    stats.totalIncome > 0 ? ((stats.totalIncome - stats.totalExpense) / stats.totalIncome) * 100 : stats.totalExpense === 0 ? 100 : 0

  const heroSummary = {
    totalIncome: stats.totalIncome,
    totalExpense: stats.totalExpense,
    balance: stats.balance,
    savingsRate,
    peakDay
  }

  const topCategoryEntry = Object.entries(categoryData).sort((a, b) => b[1] - a[1])[0]
  const topCategoryPercent =
    topCategoryEntry && stats.totalExpense > 0 ? ((topCategoryEntry[1] / stats.totalExpense) * 100).toFixed(1) : 0

  const averageExpense =
    stats.expenseCount > 0 ? stats.totalExpense / stats.expenseCount : 0

  const categoryFrequency = {}
  filteredExpenses
    .filter((e) => e.type === 'expense')
    .forEach((expense) => {
      const label = expense.category || 'Khác'
      categoryFrequency[label] = (categoryFrequency[label] || 0) + 1
    })
  const recurringEntry = Object.entries(categoryFrequency).sort((a, b) => b[1] - a[1])[0]

  const spendingVelocity = dayDiff > 0 ? stats.totalExpense / dayDiff : stats.totalExpense

  const insights = [
    topCategoryEntry && {
      id: 'top-category',
      icon: '🏷️',
      label: 'Danh mục chi nhiều nhất',
      value: topCategoryEntry ? topCategoryEntry[0] : '—',
      description: `${(topCategoryEntry?.[1] || 0).toLocaleString('vi-VN')}đ • ${topCategoryPercent}% tổng chi`,
      trend: topCategoryPercent > 40 ? 'down' : 'neutral',
      trendLabel: topCategoryPercent > 40 ? 'Cảnh báo' : 'Ổn định'
    },
    {
      id: 'avg-expense',
      icon: '💳',
      label: 'Chi tiêu trung bình / giao dịch',
      value: `${Math.round(averageExpense || 0).toLocaleString('vi-VN')}đ`,
      description: `${stats.expenseCount} khoản chi`,
      trend: 'neutral',
      trendLabel: 'Insight'
    },
    {
      id: 'velocity',
      icon: '⚡',
      label: 'Tốc độ chi tiêu / ngày',
      value: `${Math.round(spendingVelocity || 0).toLocaleString('vi-VN')}đ`,
      description: `${dayDiff} ngày trong phạm vi`,
      trend: spendingVelocity > (stats.totalIncome / Math.max(dayDiff, 1) || 0) ? 'down' : 'up',
      trendLabel: spendingVelocity > (stats.totalIncome / Math.max(dayDiff, 1) || 0) ? 'Chi mạnh' : 'Đang kiểm soát'
    },
    {
      id: 'savings-rate',
      icon: '🛡️',
      label: 'Tỷ lệ tiết kiệm',
      value: `${savingsRate.toFixed(1)}%`,
      description: `Số dư ${stats.balance.toLocaleString('vi-VN')}đ`,
      trend: savingsRate >= 20 ? 'up' : savingsRate >= 0 ? 'neutral' : 'down',
      trendLabel: savingsRate >= 20 ? 'Tốt' : savingsRate >= 0 ? 'Cần theo dõi' : 'Âm'
    },
    recurringEntry && {
      id: 'recurring',
      icon: '🔁',
      label: 'Danh mục lặp lại nhiều nhất',
      value: recurringEntry ? recurringEntry[0] : '—',
      description: `${recurringEntry ? recurringEntry[1] : 0} lần trong kỳ`,
      trend: recurringEntry && recurringEntry[1] >= 4 ? 'down' : 'neutral',
      trendLabel: recurringEntry && recurringEntry[1] >= 4 ? 'Kiểm soát' : 'Phổ biến'
    }
  ].filter(Boolean)

  const recentActivities = filteredExpenses
    .slice()
    .sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0
      const dateB = b.date ? new Date(b.date).getTime() : 0
      return dateB - dateA
    })
    .slice(0, 6)
    .map((item, index) => ({
      id: item.id || `${item.date}-${index}`,
      title: item.description || item.note || item.category || 'Giao dịch',
      amount: item.amount || 0,
      type: item.type || 'other',
      category: item.category || 'Khác',
      dateLabel: item.date
        ? new Date(item.date).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })
        : 'Chưa rõ'
    }))

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
      <Header 
        title="Dashboard Nâng Cao"
        subtitle="Tổng quan quản lý tài chính thông minh"
        icon="🚀"
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        showDarkModeToggle={true}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardFilters
          dateRange={dateRange}
          setDateRange={setDateRange}
          onExport={exportData}
          onBackup={handleBackup}
          isLoading={isLoading}
          darkMode={darkMode}
          cardBgClass={cardBgClass}
          textClass={textClass}
        />

        <DashboardTabs
          activeTab={activeTab}
          onChange={setActiveTab}
          darkMode={darkMode}
        />

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <DashboardHero
              userName={session.user?.name?.split(' ')[0] || 'bạn'}
              summary={heroSummary}
              dateRange={dateRange}
              darkMode={darkMode}
            />

            <DashboardQuickActions darkMode={darkMode} />

            <DashboardStats stats={stats} darkMode={darkMode} />

            <DashboardInsights
              insights={insights}
              darkMode={darkMode}
              cardBgClass={cardBgClass}
              textClass={textClass}
            />

            <div className="grid gap-8 lg:grid-cols-3">
              <div className="space-y-8 lg:col-span-2">
                <DashboardCharts
                  lineChartData={lineChartData}
                  doughnutData={doughnutData}
                  barData={barData}
                  downloadChartAsImage={downloadChartAsImage}
                  lineChartRef={lineChartRef}
                  doughnutChartRef={doughnutChartRef}
                  barChartRef={barChartRef}
                  darkMode={darkMode}
                  cardBgClass={cardBgClass}
                  textClass={textClass}
                />
              </div>
              <DashboardActivity
                items={recentActivities}
                darkMode={darkMode}
                cardBgClass={cardBgClass}
                textClass={textClass}
              />
            </div>
          </div>
        )}

        {/* Analytics Tab - Enhanced */}
        {activeTab === 'analytics' && analytics && (
          <AnalyticsOverview
            analytics={analytics}
            darkMode={darkMode}
            cardBgClass={cardBgClass}
            textClass={textClass}
          />
        )}

        {/* Budget Tab */}
        {activeTab === 'budget' && (
          <BudgetOverview
            budgetWarnings={budgetWarnings}
            darkMode={darkMode}
            cardBgClass={cardBgClass}
            textClass={textClass}
          />
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <ExportHistoryTable
            exportHistory={exportHistory}
            darkMode={darkMode}
            cardBgClass={cardBgClass}
            textClass={textClass}
          />
        )}
      </div>

      <Footer />
    </div>
  )
}
