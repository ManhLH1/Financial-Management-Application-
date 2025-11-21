import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect, useRef } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Filler } from 'chart.js'
import Notification, { useNotification } from '../components/Notification'
import Footer from '../components/Footer'
import Header from '../components/Header'
import DashboardFilters from '../components/dashboard/DashboardFilters'

import DashboardHero from '../components/dashboard/DashboardHero'
import DashboardQuickActions from '../components/dashboard/DashboardQuickActions'
import DashboardStats from '../components/dashboard/DashboardStats'
import DashboardInsights from '../components/dashboard/DashboardInsights'
import DashboardCharts from '../components/dashboard/DashboardCharts'
import DashboardActivity from '../components/dashboard/DashboardActivity'
import AnalyticsOverview from '../components/dashboard/AnalyticsOverview'
import BudgetOverview from '../components/dashboard/BudgetOverview'
import ExportHistoryTable from '../components/dashboard/ExportHistoryTable'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Filler)

export default function AdvancedDashboard() {
  const { data: session } = useSession()
  const [expenses, setExpenses] = useState([])
  const [debts, setDebts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const { notification, showNotification, hideNotification } = useNotification()

  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })

  const [analytics, setAnalytics] = useState(null)
  const [budgets, setBudgets] = useState([])
  const [exportHistory, setExportHistory] = useState([])

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode')
      return saved ? JSON.parse(saved) : true // Default to dark mode for premium feel
    }
    return true
  })

  const [activeTab, setActiveTab] = useState('overview')
  const [lastFetchTime, setLastFetchTime] = useState(0)

  const lineChartRef = useRef(null)
  const doughnutChartRef = useRef(null)
  const barChartRef = useRef(null)

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

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
      }
    }
  }, [])

  useEffect(() => {
    if (session) {
      const now = Date.now()
      if (now - lastFetchTime > 5 * 60 * 1000) {
        fetchMainData()
      }
      if (activeTab === 'analytics' && !analytics) fetchAnalytics()
      else if (activeTab === 'budget' && budgets.length === 0) fetchBudgets()
      else if (activeTab === 'history' && exportHistory.length === 0) fetchExportHistory()
    }
  }, [session, activeTab])

  async function fetchMainData() {
    try {
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

      localStorage.setItem('expenses_cache', JSON.stringify(expensesList))
      localStorage.setItem('debts_cache', JSON.stringify(debtsList))
      localStorage.setItem('data_cache_timestamp', Date.now().toString())
      setLastFetchTime(Date.now())
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
    if (activeTab === 'analytics') await fetchAnalytics()
    if (activeTab === 'budget') await fetchBudgets()
    if (activeTab === 'history') await fetchExportHistory()
  }

  const filteredExpenses = expenses.filter(e => {
    if (!e.date) return false
    return e.date >= dateRange.startDate && e.date <= dateRange.endDate
  })

  const stats = {
    totalExpense: filteredExpenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + (e.amount || 0), 0),
    totalIncome: filteredExpenses.filter(e => e.type === 'income').reduce((sum, e) => sum + (e.amount || 0), 0),
    totalDebt: debts.filter(d => d.status !== 'paid').reduce((sum, d) => sum + (d.amount || 0), 0),
    expenseCount: filteredExpenses.filter(e => e.type === 'expense').length,
    incomeCount: filteredExpenses.filter(e => e.type === 'income').length,
    debtCount: debts.filter(d => d.status !== 'paid').length
  }
  stats.balance = stats.totalIncome - stats.totalExpense

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

  const categoryData = {}
  filteredExpenses.filter(e => e.type === 'expense').forEach(e => {
    categoryData[e.category] = (categoryData[e.category] || 0) + e.amount
  })

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
        body: JSON.stringify({ format, expenses: filteredExpenses, debts, stats, dateRange })
      })
      const data = await response.json()
      if (response.ok) {
        if (data.downloadUrl) {
          const link = document.createElement('a')
          link.href = data.downloadUrl
          link.download = data.filename
          link.click()
        }
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
        await fetchAllData()
        showNotification(`✅ Xuất thành công!`, 'success')
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
        showNotification(`✅ Backup thành công!`, 'success')
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
          showNotification('✅ Đã tải ảnh biểu đồ!', 'success')
        })
      }
    }
  }

  const savingsRate = stats.totalIncome > 0 ? ((stats.totalIncome - stats.totalExpense) / stats.totalIncome) * 100 : 0
  const heroSummary = {
    totalIncome: stats.totalIncome,
    totalExpense: stats.totalExpense,
    balance: stats.balance,
    savingsRate
  }

  const recentActivities = filteredExpenses
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6)
    .map((item, index) => ({
      id: item.id || `${item.date}-${index}`,
      title: item.description || item.note || item.category || 'Giao dịch',
      amount: item.amount || 0,
      type: item.type || 'other',
      category: item.category || 'Khác',
      dateLabel: item.date ? new Date(item.date).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' }) : 'Chưa rõ'
    }))

  const lineChartData = {
    labels: Object.keys(monthlyData),
    datasets: [
      {
        label: 'Thu nhập',
        data: Object.values(monthlyData).map(m => m.income),
        borderColor: '#34D399', // Emerald 400
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(52, 211, 153, 0.2)');
          gradient.addColorStop(1, 'rgba(52, 211, 153, 0)');
          return gradient;
        },
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 6,
        borderWidth: 3
      },
      {
        label: 'Chi tiêu',
        data: Object.values(monthlyData).map(m => m.expense),
        borderColor: '#FB7185', // Rose 400
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(251, 113, 133, 0.2)');
          gradient.addColorStop(1, 'rgba(251, 113, 133, 0)');
          return gradient;
        },
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 6,
        borderWidth: 3
      }
    ]
  }

  const doughnutData = {
    labels: Object.keys(categoryData),
    datasets: [{
      data: Object.values(categoryData),
      backgroundColor: [
        '#60A5FA', // Blue 400
        '#A78BFA', // Violet 400
        '#34D399', // Emerald 400
        '#FB7185', // Rose 400
        '#FBBF24', // Amber 400
        '#F472B6', // Pink 400
        '#818CF8', // Indigo 400
        '#2DD4BF'  // Teal 400
      ],
      borderWidth: 0,
      hoverOffset: 4
    }]
  }

  const debtBarData = {
    labels: debts.slice(0, 5).map(d => d.description || 'Khoản nợ'),
    datasets: [
      { label: 'Gốc', data: debts.slice(0, 5).map(d => (d.amount || 0) * 0.7), backgroundColor: '#3B82F6' },
      { label: 'Lãi', data: debts.slice(0, 5).map(d => (d.amount || 0) * 0.2), backgroundColor: '#F59E0B' },
      { label: 'Đã trả', data: debts.slice(0, 5).map(d => (d.amount || 0) * 0.1), backgroundColor: '#10B981' }
    ]
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Quản Lý Chi Tiêu</h2>
          <Link href="/auth" className="px-8 py-4 bg-indigo-600 rounded-2xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/30">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans ${darkMode ? 'bg-[#020617] text-slate-200' : 'bg-slate-50 text-slate-900'
      }`}>

      {/* Background Gradients */}
      {darkMode && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-indigo-900/20 rounded-full blur-[120px] opacity-30"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-blue-900/20 rounded-full blur-[120px] opacity-30"></div>
        </div>
      )}

      <div className="relative z-10">
        <Header
          title="Dashboard"
          subtitle="Tổng quan tài chính"
          icon="⚡"
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          showDarkModeToggle={true}
        />

        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={hideNotification}
            duration={notification.duration}
          />
        )}

        <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Top Controls */}
          <div className="flex flex-col md:flex-row justify-end items-center gap-4">

            <DashboardFilters
              dateRange={dateRange}
              setDateRange={setDateRange}
              onExport={exportData}
              onBackup={handleBackup}
              isLoading={isLoading}
              darkMode={darkMode}
            />
          </div>

          {activeTab === 'overview' && (
            <div className="animate-fade-in space-y-8">
              {/* Hero Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <DashboardHero
                    userName={session.user?.name?.split(' ')[0] || 'bạn'}
                    summary={heroSummary}
                    dateRange={dateRange}
                    darkMode={darkMode}
                  />
                </div>
                <div className="flex flex-col justify-between gap-6">
                  <DashboardStats stats={stats} darkMode={darkMode} />
                  <DashboardQuickActions darkMode={darkMode} />
                </div>
              </div>

              {/* Charts & Activity */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2">
                  <DashboardCharts
                    lineChartData={lineChartData}
                    doughnutData={doughnutData}
                    barData={debtBarData}
                    downloadChartAsImage={downloadChartAsImage}
                    lineChartRef={lineChartRef}
                    doughnutChartRef={doughnutChartRef}
                    barChartRef={barChartRef}
                    darkMode={darkMode}
                  />
                </div>
                <div className="h-full">
                  <DashboardActivity items={recentActivities} darkMode={darkMode} />
                </div>
              </div>

              {/* Insights */}
              <DashboardInsights
                insights={[]} // Pass actual insights if available
                darkMode={darkMode}
                stats={stats}
                categoryData={categoryData}
              />
            </div>
          )}

          {activeTab === 'analytics' && analytics && (
            <AnalyticsOverview analytics={analytics} darkMode={darkMode} />
          )}

          {activeTab === 'budget' && (
            <BudgetOverview budgetWarnings={budgetWarnings} darkMode={darkMode} />
          )}

          {activeTab === 'history' && (
            <ExportHistoryTable exportHistory={exportHistory} darkMode={darkMode} />
          )}
        </main>

        <Footer />
      </div>
    </div>
  )
}
