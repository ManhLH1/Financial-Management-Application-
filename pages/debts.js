import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Notification, { useNotification } from '../components/Notification'
import Header from '../components/Header'

export default function Debts(){
  const { data: session, status } = useSession()
  const router = useRouter()
  const [notes, setNotes] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const { notification, showNotification, hideNotification } = useNotification()
  const [lastFetchTime, setLastFetchTime] = useState(0)
  // Initialize dark mode from localStorage (with SSR safety)
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode')
      return saved ? JSON.parse(saved) : false
    }
    return false
  })
  const [form, setForm] = useState({ 
    person: '', 
    amount: '', 
    date: new Date().toISOString().split('T')[0], 
    due: '', 
    status: 'pending',
    monthlyPayment: '',
    paymentDay: '',
    totalPeriods: 1,
    paidPeriods: 0
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

  // Load from cache on mount
  useEffect(() => {
    const cachedDebts = localStorage.getItem('debts_cache')
    const cachedTimestamp = localStorage.getItem('data_cache_timestamp')
    
    if (cachedDebts) {
      const timestamp = parseInt(cachedTimestamp || '0')
      const now = Date.now()
      // Cache valid for 5 minutes
      if (now - timestamp < 5 * 60 * 1000) {
        setNotes(JSON.parse(cachedDebts))
        setLastFetchTime(timestamp)
        console.log('✅ [Debts Page] Loaded from cache')
        return
      }
    }
  }, [])

  useEffect(() => {
    // Apply dark mode class
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  useEffect(()=>{ 
    if (status === 'unauthenticated') {
      router.push('/auth')
    } else if (status === 'authenticated') {
      const now = Date.now()
      // Only fetch if cache is stale (>5 min)
      if (now - lastFetchTime > 5 * 60 * 1000) {
        fetchNotes()
      }
    }
  }, [status, router])

  async function fetchNotes(){
    console.log('🔄 [Debts Page] Fetching fresh data...')
    setIsLoading(true)
    try {
      const res = await fetch('/api/debts')
      const data = await res.json()
      const debtsList = data.notes || []
      setNotes(debtsList)
      
      // Cache the result
      localStorage.setItem('debts_cache', JSON.stringify(debtsList))
      localStorage.setItem('data_cache_timestamp', Date.now().toString())
      setLastFetchTime(Date.now())
      console.log('✅ [Debts Page] Data cached successfully')
    } catch (error) {
      console.error('Error fetching debts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function markPaid(id){
    try {
      await fetch('/api/debts', { method: 'PUT', headers: {'content-type':'application/json'}, body: JSON.stringify({ id, status: 'paid' }) })
      fetchNotes()
    } catch (error) {
      console.error('Error marking paid:', error)
    }
  }

  async function addDebt(){
    if (!form.person || !form.amount) {
      alert('Vui lòng điền đầy đủ thông tin!')
      return
    }
    
    setIsLoading(true)
    try {
      const res = await fetch('/api/debts', { 
        method: 'POST', 
        headers: {'content-type':'application/json'}, 
        body: JSON.stringify({...form, amount: Number(form.amount)}) 
      })
      if(res.ok){
        setForm({ 
          person: '', 
          amount: '', 
          date: new Date().toISOString().split('T')[0], 
          due: '', 
          status: 'pending',
          monthlyPayment: '',
          paymentDay: '',
          totalPeriods: 1,
          paidPeriods: 0
        })
        await fetchNotes()
      }
    } catch (error) {
      console.error('Error adding debt:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to calculate days until payment
  function getDaysUntilPayment(paymentDay) {
    if (!paymentDay) return null
    const today = new Date()
    const payment = new Date(paymentDay)
    const diffTime = payment - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Helper function to get warning level
  function getWarningLevel(daysUntil) {
    if (daysUntil === null) return null
    if (daysUntil <= 3 && daysUntil >= 0) return 'urgent' // Khẩn cấp
    if (daysUntil <= 5) return 'warning' // Cảnh báo
    return 'normal'
  }

  const totalDebt = notes.reduce((sum, n) => sum + (n.status !== 'paid' ? (n.amount || 0) : 0), 0)
  const paidDebt = notes.reduce((sum, n) => sum + (n.status === 'paid' ? (n.amount || 0) : 0), 0)
  const pendingCount = notes.filter(n => n.status === 'pending').length

  // Count warnings
  const urgentWarnings = notes.filter(n => {
    if (n.status === 'paid' || !n.paymentDay) return false
    const daysUntil = getDaysUntilPayment(n.paymentDay)
    return daysUntil !== null && daysUntil <= 3 && daysUntil >= 0
  }).length

  const normalWarnings = notes.filter(n => {
    if (n.status === 'paid' || !n.paymentDay) return false
    const daysUntil = getDaysUntilPayment(n.paymentDay)
    return daysUntil !== null && daysUntil > 3 && daysUntil <= 5
  }).length

  // Send reminder email
  async function sendReminder(debt) {
    try {
      const res = await fetch('/api/send-reminder', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ debt })
      })
      const data = await res.json()
      if (res.ok) {
        alert(`✅ ${data.message}\n\nMức độ: ${data.urgencyLevel}\nCòn ${data.daysUntilDue} ngày`)
      } else {
        alert(`❌ Lỗi: ${data.error}`)
      }
    } catch (error) {
      console.error('Error sending reminder:', error)
      alert('❌ Có lỗi xảy ra khi gửi email nhắc nợ')
    }
  }

  // Check all warnings and auto-send emails
  async function checkWarnings() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/check-warnings', {
        method: 'POST'
      })
      const data = await res.json()
      
      if (res.ok) {
        let message = `🔔 Kết quả kiểm tra:\n\n`
        message += `📊 Tổng khoản nợ: ${data.totalDebts}\n`
        message += `⚠️ Cảnh báo: ${data.warnings}\n`
        message += `🚨 Khẩn cấp: ${data.urgent}\n`
        message += `⏰ Bình thường: ${data.normal}\n\n`
        
        if (data.autoSent && data.autoSent.length > 0) {
          message += `📧 Đã gửi email tự động:\n`
          data.autoSent.forEach(s => {
            message += `  • ${s.person} (còn ${s.daysUntil} ngày)\n`
          })
        }
        
        if (data.details && data.details.length > 0) {
          message += `\n📋 Chi tiết cảnh báo:\n`
          data.details.forEach(d => {
            const icon = d.level === 'urgent' ? '🚨' : '⏰'
            message += `  ${icon} ${d.person}: ${d.amount.toLocaleString('vi-VN')}đ (còn ${d.daysUntil} ngày)\n`
          })
        }
        
        showNotification(message, 'success', 10000)
      } else {
        showNotification(`❌ Lỗi: ${data.error}`, 'error')
      }
    } catch (error) {
      console.error('Error checking warnings:', error)
      showNotification('❌ Có lỗi xảy ra khi kiểm tra cảnh báo', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // Test email configuration
  async function testEmail() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/test-email', {
        method: 'POST'
      })
      const data = await res.json()
      
      if (res.ok) {
        showNotification(
          `✅ ${data.message}\n\nMessage ID: ${data.messageId}\n\nKiểm tra hộp thư đến của bạn!`,
          'success',
          8000
        )
      } else {
        showNotification(
          `❌ ${data.error}\n\n${data.hint || data.details}`,
          'error',
          10000
        )
      }
    } catch (error) {
      console.error('Error testing email:', error)
      showNotification('❌ Không thể gửi test email', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // Start scheduler
  async function startScheduler(mode = 'daily') {
    setIsLoading(true)
    try {
      const action = mode === 'test' ? 'start-test' : 'start'
      const res = await fetch('/api/scheduler-control', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action })
      })
      const data = await res.json()
      
      if (res.ok) {
        showNotification(
          `✅ ${data.message}\n\nSchedule: ${data.schedule}`,
          'success'
        )
      } else {
        showNotification(`❌ ${data.error}`, 'error')
      }
    } catch (error) {
      console.error('Error starting scheduler:', error)
      showNotification('❌ Không thể khởi động scheduler', 'error')
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

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#D2C1B6]/20 via-white to-[#456882]/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#234C6A] mx-auto"></div>
          <p className="mt-4 text-[#456882]">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${bgClass} transition-all duration-500`}>
      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
          duration={notification.duration}
        />
      )}

      {/* Header */}
      <Header 
        title="Quản lý Khoản nợ"
        subtitle="Theo dõi cho vay/mượn"
        icon="📝"
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        showDarkModeToggle={true}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`rounded-2xl shadow-2xl p-6 text-white transform hover:scale-105 transition-all duration-300 ${
            darkMode 
              ? 'bg-gradient-to-br from-blue-600 to-cyan-700 shadow-blue-500/30' 
              : 'bg-gradient-to-br from-[#234C6A] to-[#1B3C53]'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <p className={darkMode ? 'text-blue-100 text-sm font-medium' : 'text-[#D2C1B6] text-sm font-medium'}>Tổng nợ chưa trả</p>
              <span className="text-3xl">💳</span>
            </div>
            <p className="text-3xl font-bold">{totalDebt.toLocaleString('vi-VN')}đ</p>
            <p className={darkMode ? 'text-blue-100 text-sm mt-2' : 'text-[#D2C1B6] text-sm mt-2'}>{pendingCount} khoản</p>
          </div>

          <div className={`rounded-2xl shadow-2xl p-6 text-white transform hover:scale-105 transition-all duration-300 ${
            darkMode 
              ? 'bg-gradient-to-br from-emerald-600 to-teal-700 shadow-emerald-500/30' 
              : 'bg-gradient-to-br from-[#456882] to-[#234C6A]'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <p className={darkMode ? 'text-emerald-100 text-sm font-medium' : 'text-[#D2C1B6] text-sm font-medium'}>Đã thanh toán</p>
              <span className="text-3xl">✅</span>
            </div>
            <p className="text-3xl font-bold">{paidDebt.toLocaleString('vi-VN')}đ</p>
            <p className={darkMode ? 'text-emerald-100 text-sm mt-2' : 'text-[#D2C1B6] text-sm mt-2'}>{notes.length - pendingCount} khoản</p>
          </div>

          <div className={`rounded-2xl shadow-2xl p-6 text-white transform hover:scale-105 transition-all duration-300 ${
            darkMode 
              ? urgentWarnings > 0 ? 'bg-gradient-to-br from-rose-600 to-pink-700 shadow-rose-500/30' : 
                normalWarnings > 0 ? 'bg-gradient-to-br from-orange-500 to-amber-600 shadow-orange-500/30' : 
                'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30'
              : urgentWarnings > 0 ? 'bg-gradient-to-br from-red-600 to-red-700' : 
                normalWarnings > 0 ? 'bg-gradient-to-br from-orange-500 to-orange-600' : 
                'bg-gradient-to-br from-green-500 to-green-600'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/90 text-sm font-medium">Cảnh báo</p>
              <span className="text-3xl">{urgentWarnings > 0 ? '🚨' : normalWarnings > 0 ? '⏰' : '✅'}</span>
            </div>
            <p className="text-3xl font-bold">{urgentWarnings + normalWarnings}</p>
            <p className="text-white/90 text-sm mt-2">
              {urgentWarnings > 0 && `${urgentWarnings} khẩn • `}
              {normalWarnings > 0 && `${normalWarnings} bình thường`}
              {urgentWarnings === 0 && normalWarnings === 0 && 'Không có cảnh báo'}
            </p>
          </div>

          <div className={`rounded-2xl shadow-2xl p-6 transform hover:scale-105 transition-all duration-300 ${
            darkMode 
              ? 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-purple-500/30' 
              : 'bg-gradient-to-br from-[#D2C1B6] to-[#D2C1B6]/80 text-[#1B3C53]'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <p className={darkMode ? 'text-purple-100 text-sm font-medium' : 'text-[#1B3C53]/70 text-sm font-medium'}>Tổng giao dịch</p>
              <span className="text-3xl">📊</span>
            </div>
            <p className="text-3xl font-bold">{notes.length}</p>
            <p className={darkMode ? 'text-purple-100 text-sm mt-2' : 'text-[#1B3C53]/70 text-sm mt-2'}>Khoản nợ</p>
          </div>
        </div>

        {/* Cache Info - Hidden for cleaner UI */}

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Add Debt */}
          <div className="lg:col-span-1">
            <div className={`rounded-2xl shadow-2xl p-6 sticky top-24 ${
              darkMode 
                ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 backdrop-blur-sm' 
                : 'bg-white border-2 border-[#D2C1B6]/30'
            }`}>
              <div className="flex items-center space-x-2 mb-6">
                <span className="text-2xl">➕</span>
                <h3 className={`text-xl font-bold ${textClass}`}>Thêm khoản nợ</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textClass}`}>
                    Người vay/cho <span className="text-red-500">*</span>
                  </label>
                  <input 
                    className={`w-full px-4 py-3 border-2 rounded-lg transition-all ${
                      darkMode 
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500' 
                        : 'bg-white border-[#D2C1B6] focus:ring-2 focus:ring-[#234C6A] focus:border-[#234C6A]'
                    }`}
                    placeholder="VD: Nguyễn Văn A" 
                    value={form.person} 
                    onChange={e=>setForm(f=>({...f,person:e.target.value}))} 
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${textClass}`}>
                    Số tiền (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="number"
                    className={`w-full px-4 py-3 border-2 rounded-lg transition-all ${
                      darkMode 
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500' 
                        : 'bg-white border-[#D2C1B6] focus:ring-2 focus:ring-[#234C6A] focus:border-[#234C6A]'
                    }`}
                    placeholder="VD: 500000" 
                    value={form.amount} 
                    onChange={e=>setForm(f=>({...f,amount:e.target.value}))} 
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${textClass}`}>
                    Ngày tạo
                  </label>
                  <input 
                    type="date" 
                    className={`w-full px-4 py-3 border-2 rounded-lg transition-all ${
                      darkMode 
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500' 
                        : 'bg-white border-[#D2C1B6] focus:ring-2 focus:ring-[#234C6A] focus:border-[#234C6A]'
                    }`}
                    value={form.date} 
                    onChange={e=>setForm(f=>({...f,date:e.target.value}))} 
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${textClass}`}>
                    Hạn trả cuối cùng
                  </label>
                  <input 
                    type="date" 
                    className={`w-full px-4 py-3 border-2 rounded-lg transition-all ${
                      darkMode 
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500' 
                        : 'bg-white border-[#D2C1B6] focus:ring-2 focus:ring-[#234C6A] focus:border-[#234C6A]'
                    }`}
                    value={form.due} 
                    onChange={e=>setForm(f=>({...f,due:e.target.value}))} 
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${textClass}`}>
                    💳 Trả hằng tháng (VNĐ)
                  </label>
                  <input 
                    type="number"
                    className={`w-full px-4 py-3 border-2 rounded-lg transition-all ${
                      darkMode 
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500' 
                        : 'bg-white border-[#D2C1B6] focus:ring-2 focus:ring-[#234C6A] focus:border-[#234C6A]'
                    }`}
                    placeholder="VD: 1000000" 
                    value={form.monthlyPayment} 
                    onChange={e=>setForm(f=>({...f,monthlyPayment:e.target.value}))} 
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${textClass}`}>
                    📅 Ngày trả tiếp theo
                  </label>
                  <input 
                    type="date" 
                    className={`w-full px-4 py-3 border-2 rounded-lg transition-all ${
                      darkMode 
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500' 
                        : 'bg-white border-[#D2C1B6] focus:ring-2 focus:ring-[#234C6A] focus:border-[#234C6A]'
                    }`}
                    value={form.paymentDay} 
                    onChange={e=>setForm(f=>({...f,paymentDay:e.target.value}))} 
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${textClass}`}>
                    📊 Tổng số kỳ vay
                  </label>
                  <input 
                    type="number"
                    min="1"
                    className={`w-full px-4 py-3 border-2 rounded-lg transition-all ${
                      darkMode 
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500' 
                        : 'bg-white border-[#D2C1B6] focus:ring-2 focus:ring-[#234C6A] focus:border-[#234C6A]'
                    }`}
                    placeholder="VD: 12" 
                    value={form.totalPeriods} 
                    onChange={e=>setForm(f=>({...f,totalPeriods:e.target.value}))} 
                  />
                </div>

                <button 
                  className={`w-full py-3 font-semibold rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 ${
                    darkMode 
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/30' 
                      : 'bg-gradient-to-r from-[#234C6A] to-[#1B3C53] hover:from-[#1B3C53] hover:to-[#234C6A] text-white'
                  }`}
                  onClick={addDebt}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Đang thêm...</span>
                    </>
                  ) : (
                    <>
                      <span>➕</span>
                      <span>Thêm khoản nợ</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Debts List */}
          <div className="lg:col-span-2">
            <div className={`rounded-2xl shadow-2xl p-6 ${
              darkMode 
                ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 backdrop-blur-sm' 
                : 'bg-white border-2 border-[#D2C1B6]/30'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">📋</span>
                  <h3 className={`text-xl font-bold ${textClass}`}>Danh sách khoản nợ</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    darkMode 
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' 
                      : 'bg-[#234C6A] text-white'
                  }`}>
                    {notes.length}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[700px] overflow-y-auto">
                {isLoading ? (
                  <div className="col-span-2 text-center py-12">
                    <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto ${
                      darkMode ? 'border-purple-400' : 'border-[#234C6A]'
                    }`}></div>
                    <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-[#456882]'}`}>Đang tải...</p>
                  </div>
                ) : notes.length === 0 ? (
                  <div className="col-span-2 text-center py-12">
                    <span className="text-6xl mb-4 block">📭</span>
                    <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-[#456882]'}`}>Chưa có khoản nợ nào</p>
                    <p className={`text-sm mt-2 ${darkMode ? 'text-gray-500' : 'text-[#D2C1B6]'}`}>Thêm khoản nợ đầu tiên của bạn!</p>
                  </div>
                ) : (
                  notes.map(n=> {
                    const daysUntil = getDaysUntilPayment(n.paymentDay)
                    const warningLevel = getWarningLevel(daysUntil)
                    
                    return (
                      <div key={n.id} className={`border-2 rounded-lg p-4 transition-all ${
                        darkMode 
                          ? warningLevel === 'urgent' ? 'border-rose-500 bg-gradient-to-br from-rose-900/40 to-pink-900/40 backdrop-blur-sm shadow-lg shadow-rose-500/20' :
                            warningLevel === 'warning' ? 'border-orange-500 bg-gradient-to-br from-orange-900/40 to-amber-900/40 backdrop-blur-sm shadow-lg shadow-orange-500/20' :
                            'border-slate-600 bg-gradient-to-br from-slate-700 to-slate-800 hover:border-purple-500 shadow-lg hover:shadow-purple-500/20'
                          : warningLevel === 'urgent' ? 'border-red-500 bg-red-50' :
                            warningLevel === 'warning' ? 'border-orange-500 bg-orange-50' :
                            'border-[#D2C1B6]/50 hover:border-[#234C6A] hover:shadow-md'
                      }`}>
                        {/* Warning Badge */}
                        {warningLevel && n.status !== 'paid' && (
                          <div className={`mb-2 px-3 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-2 ${
                            warningLevel === 'urgent' ? 'bg-red-600 text-white' :
                            'bg-orange-500 text-white'
                          }`}>
                            {warningLevel === 'urgent' ? '🚨 KHẨN CẤP' : '⏰ CẢNH BÁO'}
                            <span>Còn {daysUntil} ngày</span>
                          </div>
                        )}

                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className={`font-bold text-lg ${textClass}`}>{n.person}</div>
                            <div className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-[#456882]'}`}>
                              📅 Ngày tạo: {new Date(n.date).toLocaleDateString('vi-VN')}
                            </div>
                            {n.paymentDay && (
                              <div className={`text-sm mt-1 font-medium ${
                                warningLevel === 'urgent' ? darkMode ? 'text-rose-300' : 'text-red-600' :
                                warningLevel === 'warning' ? darkMode ? 'text-orange-300' : 'text-orange-600' :
                                darkMode ? 'text-gray-400' : 'text-[#456882]'
                              }`}>
                                💳 Ngày trả: {new Date(n.paymentDay).toLocaleDateString('vi-VN')}
                              </div>
                            )}
                            {n.due && (
                              <div className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-[#456882]'}`}>
                                🏁 Hạn cuối: {new Date(n.due).toLocaleDateString('vi-VN')}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className={`font-bold text-lg ${textClass}`}>{n.amount?.toLocaleString('vi-VN')}đ</div>
                            {n.monthlyPayment > 0 && (
                              <div className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-[#456882]'}`}>
                                💰 {n.monthlyPayment?.toLocaleString('vi-VN')}đ/tháng
                              </div>
                            )}
                            <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
                              n.status === 'paid' 
                                ? darkMode ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white' : 'bg-[#234C6A] text-white'
                                : darkMode ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-gray-200' : 'bg-[#D2C1B6] text-[#1B3C53]'
                            }`}>
                              {n.status === 'paid' ? '✅ Đã trả' : '⏳ Chưa trả'}
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        {n.totalPeriods > 1 && (
                          <div className="mb-3">
                            <div className={`flex justify-between text-xs mb-1 ${darkMode ? 'text-gray-400' : 'text-[#456882]'}`}>
                              <span>Tiến độ: {n.paidPeriods || 0}/{n.totalPeriods} kỳ</span>
                              <span>{Math.round(((n.paidPeriods || 0) / n.totalPeriods) * 100)}%</span>
                            </div>
                            <div className={`w-full rounded-full h-2 ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                              <div 
                                className={`h-2 rounded-full transition-all ${
                                  darkMode ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 'bg-[#234C6A]'
                                }`}
                                style={{ width: `${((n.paidPeriods || 0) / n.totalPeriods) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        <div className={`flex gap-2 pt-3 border-t ${darkMode ? 'border-slate-600' : 'border-[#D2C1B6]'}`}>
                          {n.status !== 'paid' && (
                            <button 
                              className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                                darkMode 
                                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/30' 
                                  : 'bg-[#234C6A] text-white hover:bg-[#1B3C53]'
                              }`}
                              onClick={()=>markPaid(n.id)}
                            >
                              ✅ Đã trả
                            </button>
                          )}
                          <button 
                            className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                              darkMode 
                                ? warningLevel === 'urgent' 
                                  ? 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-lg shadow-rose-500/30' 
                                  : warningLevel === 'warning'
                                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white shadow-lg shadow-orange-500/30'
                                  : 'border-2 border-slate-600 text-gray-300 hover:bg-slate-700'
                                : warningLevel === 'urgent' 
                                  ? 'bg-red-600 text-white hover:bg-red-700' 
                                  : warningLevel === 'warning'
                                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                                  : 'border-2 border-[#D2C1B6] text-[#1B3C53] hover:bg-[#D2C1B6]'
                            }`}
                            onClick={()=>sendReminder(n)}
                          >
                            📨 {warningLevel ? 'Gửi nhắc' : 'Nhắc nợ'}
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#1B3C53] border-t border-[#234C6A] mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* About */}
            <div>
              <h3 className="text-white font-bold text-lg mb-3">📝 Quản lý Khoản nợ</h3>
              <p className="text-[#D2C1B6] text-sm leading-relaxed">
                Ứng dụng giúp bạn theo dõi và quản lý các khoản cho vay/mượn một cách dễ dàng và hiệu quả.
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
              <h3 className="text-white font-bold text-lg mb-3">Tính năng</h3>
              <ul className="space-y-2 text-[#D2C1B6] text-sm">
                <li>✅ Đồng bộ Google Sheets</li>
                <li>✅ Nhắc nhở qua Email</li>
                <li>✅ Cảnh báo tự động</li>
                <li>✅ Theo dõi kỳ trả góp</li>
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
