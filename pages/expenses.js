import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Notification, { useNotification } from '../components/Notification'
import Header from '../components/Header'
import MobileHeader from '../components/MobileHeader'
import MobileBottomNav from '../components/MobileBottomNav'
import MobileSummaryCard from '../components/MobileSummaryCard'
import MobileTransactionItem from '../components/MobileTransactionItem'
import MobileFloatingButton from '../components/MobileFloatingButton'
import SpendingWarningModal from '../components/SpendingWarningModal'
import { useIsMobile, vibrateOnAction, formatMobileCurrency } from '../lib/mobileHelpers'

// Category icons and color helpers (kept small and readable)
const expenseCategories = {
  'Ăn uống': '🍽️',
  'Di chuyển': '🚗',
  'Giải trí': '🎮',
  'Mua sắm': '🛍️',
  'Sức khỏe': '💊',
  'Học tập': '📚',
  'Hóa đơn': '📄',
  'Khác': '📦'
}
const incomeCategories = {
  'Lương': '💰',
  'Thưởng': '🎁',
  'Đầu tư': '📈',
  'Kinh doanh': '💼',
  'Khác': '💵'
}
const categoryIcons = { ...expenseCategories, ...incomeCategories }
const categoryColors = {
  'Ăn uống': 'bg-[#D2C1B6]/30 text-[#1B3C53] border-[#D2C1B6]',
  'Di chuyển': 'bg-[#456882]/20 text-[#1B3C53] border-[#456882]',
  'Mua sắm': 'bg-[#D2C1B6]/40 text-[#1B3C53] border-[#D2C1B6]',
  'Sức khỏe': 'bg-[#456882]/30 text-[#1B3C53] border-[#456882]',
}

export default function Expenses(){
  const { data: session, status } = useSession()
  const router = useRouter()
  const [items, setItems] = useState([])
  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: 'Ăn uống',
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    customCategory: ''
  })
  
  const [filter, setFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [deleteReason, setDeleteReason] = useState('')
  // Spending warning modal states
  const [showWarningModal, setShowWarningModal] = useState(false)
  const [warningData, setWarningData] = useState(null)
  const [pendingExpense, setPendingExpense] = useState(null)
  // Initialize dark mode from localStorage (with SSR safety)
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode')
      return saved ? JSON.parse(saved) : false
    }
    return false
  })
  const [lastFetchTime, setLastFetchTime] = useState(0)
  const { notification, showNotification, hideNotification } = useNotification()

  // Sync document class and save to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // Load cached data and fetch fresh data
  useEffect(() => {
    if (status === 'loading') return
    
    // Load from cache first
    const cached = localStorage.getItem('expenses_cache')
    if (cached) {
      try {
        setItems(JSON.parse(cached))
      } catch (e) {
        console.error('Error parsing cached data:', e)
      }
    }
    
    // Then fetch fresh data
    fetchItems()
  }, [status])

  // Set default dateFilter to today on mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDateFilter(today);
  }, []);

  function editItem(item) {
    setEditingId(item.id)
    setForm({
      title: item.title || '',
      amount: item.amount || '',
      category: item.category || 'Ăn uống',
      date: item.date?.split('T')[0] || new Date().toISOString().split('T')[0],
      type: item.type || 'expense',
      customCategory: ''
    })
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm({
      title: '',
      amount: '',
      category: 'Ăn uống',
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      customCategory: ''
    })
  }

  async function deleteItem(id) {
    if (!deleteReason.trim()) {
      alert('Vui lòng nhập lý do xóa!')
      return
    }
    
    setIsLoading(true)
    try {
      const res = await fetch(`/api/expenses?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: deleteReason.trim()
        })
      })
      if (res.ok) {
        setShowDeleteConfirm(null)
        setDeleteReason('')
        await fetchItems()
        showNotification('Đã xóa giao dịch thành công', 'success')
      } else {
        const error = await res.json()
        showNotification(`Lỗi: ${error.error}`, 'error')
      }
    } catch (error) {
      console.error('Error deleting expense:', error)
      showNotification('Có lỗi xảy ra khi xóa giao dịch', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  async function migrateData() {
    if (!confirm('Bạn có chắc muốn di chuyển dữ liệu sang cấu trúc mới? Thao tác này sẽ thêm cột "Type" cho các giao dịch cũ.')) {
      return
    }
    
    setIsLoading(true)
    try {
      const res = await fetch('/api/migrate-data', { 
        method: 'POST'
      })
      const data = await res.json()
      
      if(res.ok){
        alert(`✅ Thành công! Đã di chuyển ${data.rowsMigrated} dòng dữ liệu.\n\nVui lòng kiểm tra lại Google Sheet và reload lại trang.`)
        await fetchItems()
      } else {
        alert(`❌ Lỗi: ${data.error}\n${data.details || ''}`)
      }
    } catch (error) {
      console.error('Error migrating data:', error)
      alert('❌ Có lỗi xảy ra khi di chuyển dữ liệu')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch latest items from API and cache
  async function fetchItems(){
    console.log('🔄 [Expenses Page] Fetching fresh data...')
    setIsLoading(true)
    try {
      const res = await fetch('/api/expenses')
      const data = await res.json()
      const itemsList = data.items || []
      setItems(itemsList)
      // Cache the result
      localStorage.setItem('expenses_cache', JSON.stringify(itemsList))
      localStorage.setItem('data_cache_timestamp', Date.now().toString())
      setLastFetchTime(Date.now())
      console.log('✅ [Expenses Page] Data cached successfully')
    } catch (error) {
      console.error('Error fetching expenses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Add or update an expense with spending limit check
  async function add(){
    if (!form.title || !form.amount) {
      showNotification('⚠️ Vui lòng điền đầy đủ thông tin!', 'warning')
      return
    }
    if (form.category === 'Khác' && !form.customCategory) {
      showNotification('⚠️ Vui lòng nhập danh mục khác!', 'warning')
      return
    }
    
    const finalCategory = form.category === 'Khác' && form.customCategory ? form.customCategory : form.category
    
    // Skip limit check for income or when editing
    if (form.type === 'income' || editingId) {
      await saveExpense(finalCategory)
      return
    }
    
    // Check spending limit for new expenses only
    setIsLoading(true)
    try {
      const checkRes = await fetch('/api/check-spending-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: finalCategory,
          amount: Number(form.amount)
        })
      })
      
      const checkData = await checkRes.json()
      
      if (!checkRes.ok) {
        showNotification(`❌ ${checkData.error}`, 'error')
        setIsLoading(false)
        return
      }
      
      // If there are alerts, show warning modal
      if (checkData.alerts && checkData.alerts.length > 0) {
        setPendingExpense({
          title: form.title,
          amount: Number(form.amount),
          category: finalCategory,
          date: form.date,
          type: form.type
        })
        setWarningData(checkData)
        setShowWarningModal(true)
        setIsLoading(false)
        return
      }
      
      // No warnings, proceed directly
      await saveExpense(finalCategory)
      
    } catch (error) {
      console.error('Error checking spending limit:', error)
      showNotification('⚠️ Không thể kiểm tra hạn mức. Vẫn cho phép lưu.', 'warning')
      // Allow saving even if check fails
      await saveExpense(finalCategory)
    }
  }
  
  // Actual save function
  async function saveExpense(finalCategory, skipNotification = false) {
    setIsLoading(true)
    try {
      if (editingId) {
        // Update existing
        const res = await fetch('/api/expenses', { 
          method: 'PUT', 
          headers: {'content-type':'application/json'}, 
          body: JSON.stringify({
            id: editingId,
            title: form.title,
            amount: Number(form.amount),
            category: finalCategory,
            date: form.date,
            type: form.type
          }) 
        })
        if(res.ok){
          setEditingId(null)
          setForm({title:'',amount:'',category:'Ăn uống',date:new Date().toISOString().split('T')[0], type: 'expense', customCategory: ''})
          await fetchItems()
          if (!skipNotification) {
            showNotification('✅ Cập nhật thành công!', 'success')
          }
        }
      } else {
        // Add new
        const res = await fetch('/api/expenses', { 
          method: 'POST', 
          headers: {'content-type':'application/json'}, 
          body: JSON.stringify({
            title: form.title,
            amount: Number(form.amount),
            category: finalCategory,
            date: form.date,
            type: form.type
          }) 
        })
        if(res.ok){
          setForm({title:'',amount:'',category:'Ăn uống',date:new Date().toISOString().split('T')[0], type: 'expense', customCategory: ''})
          await fetchItems()
          if (!skipNotification) {
            showNotification('✅ Đã thêm chi tiêu!', 'success')
          }
        }
      }
    } catch (error) {
      console.error('Error saving expense:', error)
      showNotification('❌ Có lỗi xảy ra!', 'error')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Handle confirm from warning modal
  async function handleWarningConfirm() {
    setShowWarningModal(false)
    if (pendingExpense) {
      await saveExpense(pendingExpense.category)
      setPendingExpense(null)
      setWarningData(null)
    }
  }
  
  // Handle edit from warning modal
  function handleWarningEdit() {
    setShowWarningModal(false)
    // Keep the form as is, user can edit the amount
    showNotification('💡 Hãy điều chỉnh số tiền phù hợp', 'info')
  }

  // Calculate stats
  const expenses = items.filter(item => item.type === 'expense')
  const incomes = items.filter(item => item.type === 'income')
  
  const totalExpense = expenses.reduce((sum, item) => sum + (item.amount || 0), 0)
  const totalIncome = incomes.reduce((sum, item) => sum + (item.amount || 0), 0)
  const balance = totalIncome - totalExpense
  
  const thisMonthExpenses = items.filter(item => {
    const itemDate = new Date(item.date)
    const now = new Date()
    return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear()
  })
  const thisMonthTotal = thisMonthExpenses.reduce((sum, item) => {
    return sum + (item.type === 'expense' ? -(item.amount || 0) : (item.amount || 0))
  }, 0)
  
  const categoryBreakdown = expenses.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + (item.amount || 0)
    return acc
  }, {})
  const topCategory = Object.entries(categoryBreakdown).sort((a,b) => b[1] - a[1])[0]

  // Filter items
  const filteredItems = items
    .filter(item => typeFilter === 'all' || item.type === typeFilter)
    .filter(item => filter === 'all' || item.category === filter)
    .filter(item => item.title?.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(item => {
      if (!dateFilter) return true // Nếu không có filter ngày, hiển thị tất cả
      const itemDate = item.date?.split('T')[0] // Lấy phần ngày (YYYY-MM-DD)
      return itemDate === dateFilter
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  // Keep backward-compatible name used in JSX (was referenced but not defined)
  const filteredAndSortedItems = filteredItems

  const bgClass = darkMode 
    ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900' 
    : 'bg-gradient-to-br from-[#D2C1B6]/20 via-white to-[#456882]/10'
  const cardBgClass = darkMode 
    ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 shadow-2xl' 
    : 'bg-white'
  const textClass = darkMode ? 'text-gray-100' : 'text-gray-900'

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${bgClass} transition-all duration-500`}>
      {/* Desktop Header */}
      <div className="hidden lg:block">
        <Header 
          title="Quản lý Chi tiêu"
          subtitle="Theo dõi và quản lý chi tiêu"
          icon="💰"
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          showDarkModeToggle={true}
        />
      </div>

      {/* Mobile Header */}
      <MobileHeader
        title="Chi tiêu"
        icon="💰"
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <div className="max-w-7xl mx-auto px-0 sm:px-4 lg:px-8 py-4 lg:py-8 pb-20 lg:pb-8">
        {/* Cache Info - Hidden for cleaner UI */}

        {/* Stats Cards - Desktop */}
        <div className="hidden lg:grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 px-4 lg:px-0">
          <div className={`rounded-xl shadow-lg p-4 text-white transform hover:scale-105 transition-all duration-300 ${
            darkMode 
              ? 'bg-gradient-to-br from-rose-600 to-pink-700' 
              : 'bg-gradient-to-br from-red-500 to-red-600'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium opacity-90">Tổng chi tiêu</p>
              <span className="text-2xl">💸</span>
            </div>
            <p className="text-2xl font-bold mb-0.5">{totalExpense.toLocaleString('vi-VN')}đ</p>
            <p className="text-xs opacity-80">{expenses.length} giao dịch</p>
          </div>

          <div className={`rounded-xl shadow-lg p-4 text-white transform hover:scale-105 transition-all duration-300 ${
            darkMode 
              ? 'bg-gradient-to-br from-emerald-600 to-teal-700' 
              : 'bg-gradient-to-br from-green-500 to-green-600'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium opacity-90">Tổng thu nhập</p>
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-2xl font-bold mb-0.5">{totalIncome.toLocaleString('vi-VN')}đ</p>
            <p className="text-xs opacity-80">{incomes.length} giao dịch</p>
          </div>

          <div className={`rounded-xl shadow-lg p-4 text-white transform hover:scale-105 transition-all duration-300 ${
            darkMode 
              ? balance >= 0 
                ? 'bg-gradient-to-br from-blue-600 to-cyan-700' 
                : 'bg-gradient-to-br from-orange-500 to-amber-600'
              : balance >= 0 
                ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                : 'bg-gradient-to-br from-orange-500 to-orange-600'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium opacity-90">Số dư</p>
              <span className="text-2xl">{balance >= 0 ? '📊' : '⚠️'}</span>
            </div>
            <p className="text-2xl font-bold mb-0.5">{balance.toLocaleString('vi-VN')}đ</p>
            <p className="text-xs opacity-80">{balance >= 0 ? 'Dương' : 'Âm'}</p>
          </div>

          <div className={`rounded-xl shadow-lg p-4 text-white transform hover:scale-105 transition-all duration-300 ${
            darkMode 
              ? 'bg-gradient-to-br from-purple-600 to-indigo-700' 
              : 'bg-gradient-to-br from-purple-500 to-purple-600'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium opacity-90">Danh mục top</p>
              <span className="text-2xl">{categoryIcons[topCategory] || '📦'}</span>
            </div>
            <p className="text-2xl font-bold truncate mb-0.5">{topCategory || 'Chưa có'}</p>
            <p className="text-xs opacity-80">
              {items.filter(i => i.category === topCategory).length} giao dịch
            </p>
          </div>
        </div>

        {/* Stats Cards - Mobile (2x2 grid) - With formatMobileCurrency */}
        <div className="lg:hidden grid grid-cols-2 gap-3 mb-6 px-4">
          <MobileSummaryCard
            icon="💸"
            label="Chi tiêu"
            value={`${formatMobileCurrency(totalExpense)}đ`}
            subtitle={`${expenses.length} giao dịch`}
            gradient={darkMode 
              ? 'bg-gradient-to-br from-rose-600 to-pink-700' 
              : 'bg-gradient-to-br from-red-500 to-red-600'}
          />
          
          <MobileSummaryCard
            icon="💰"
            label="Thu nhập"
            value={`${formatMobileCurrency(totalIncome)}đ`}
            subtitle={`${incomes.length} giao dịch`}
            gradient={darkMode 
              ? 'bg-gradient-to-br from-emerald-600 to-teal-700' 
              : 'bg-gradient-to-br from-green-500 to-green-600'}
          />
          
          <MobileSummaryCard
            icon={balance >= 0 ? '📊' : '⚠️'}
            label="Số dư"
            value={`${formatMobileCurrency(balance)}đ`}
            subtitle={balance >= 0 ? 'Dương' : 'Âm'}
            gradient={darkMode 
              ? balance >= 0 
                ? 'bg-gradient-to-br from-blue-600 to-cyan-700' 
                : 'bg-gradient-to-br from-orange-500 to-amber-600'
              : balance >= 0 
                ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                : 'bg-gradient-to-br from-orange-500 to-orange-600'}
          />
          
          <MobileSummaryCard
            icon={categoryIcons[topCategory] || '📦'}
            label="Top"
            value={topCategory || 'Chưa có'}
            subtitle={`${items.filter(i => i.category === topCategory).length} giao dịch`}
            gradient={darkMode 
              ? 'bg-gradient-to-br from-purple-600 to-indigo-700' 
              : 'bg-gradient-to-br from-purple-500 to-purple-600'}
          />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8 px-4 lg:px-0">
          {/* Form Add Expense/Income */}
          <div className="lg:col-span-1">
            <div className={`rounded-2xl shadow-2xl p-6 sticky top-24 ${
              darkMode 
                ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 backdrop-blur-sm' 
                : 'bg-white border-2 border-[#D2C1B6]/30'
            }`}>
              <div className="flex items-center space-x-2 mb-6">
                <span className="text-2xl">➕</span>
                <h3 className={`text-xl font-bold ${textClass}`}>
                  {editingId ? 'Sửa giao dịch' : 'Thêm giao dịch mới'}
                </h3>
              </div>
              
              <div className="space-y-4">
                {/* Type Selection - Radio buttons */}
                <div>
                  <label className={`block text-sm font-medium mb-3 ${textClass}`}>
                    Loại giao dịch <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setForm(f => ({...f, type: 'expense', category: 'Ăn uống'}))}
                      className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                        form.type === 'expense'
                          ? darkMode
                            ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-500/30'
                            : 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                          : darkMode
                            ? 'bg-slate-700 text-gray-300 hover:bg-slate-600 border border-slate-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                      }`}
                    >
                      <span>💸</span>
                      <span>Khoản chi</span>
                    </button>
                    <button
                      onClick={() => setForm(f => ({...f, type: 'income', category: 'Lương'}))}
                      className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                        form.type === 'income'
                          ? darkMode
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                            : 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                          : darkMode
                            ? 'bg-slate-700 text-gray-300 hover:bg-slate-600 border border-slate-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                      }`}
                    >
                      <span>💰</span>
                      <span>Khoản thu</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${textClass}`}>
                    Tên giao dịch <span className="text-red-500">*</span>
                  </label>
                  <input 
                    className={`w-full px-4 py-3 border-2 rounded-lg transition-all ${
                      darkMode 
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500' 
                        : 'bg-white border-[#D2C1B6] focus:ring-2 focus:ring-[#234C6A] focus:border-[#234C6A]'
                    }`}
                    placeholder="VD: Cà phê sáng" 
                    value={form.title} 
                    onChange={e=>setForm(f=>({...f,title:e.target.value}))} 
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
                    placeholder="VD: 35000" 
                    value={form.amount} 
                    onChange={e=>setForm(f=>({...f,amount:e.target.value}))} 
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${textClass}`}>
                    Danh mục
                  </label>
                  <select 
                    className={`w-full px-4 py-3 border-2 rounded-lg transition-all ${
                      darkMode 
                        ? 'bg-slate-700 border-slate-600 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500' 
                        : 'bg-white border-[#D2C1B6] focus:ring-2 focus:ring-[#234C6A] focus:border-[#234C6A]'
                    }`}
                    value={form.category} 
                    onChange={e=>setForm(f=>({...f,category:e.target.value, customCategory: ''}))}
                  >
                    {form.type === 'expense' ? (
                      <>
                        {Object.keys(expenseCategories).map(cat => (
                          <option key={cat} value={cat}>{expenseCategories[cat]} {cat}</option>
                        ))}
                      </>
                    ) : (
                      <>
                        {Object.keys(incomeCategories).map(cat => (
                          <option key={cat} value={cat}>{incomeCategories[cat]} {cat}</option>
                        ))}
                      </>
                    )}
                  </select>
                </div>

                {form.category === 'Khác' && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${textClass}`}>
                      Danh mục khác <span className="text-red-500">*</span>
                    </label>
                    <input 
                      className={`w-full px-4 py-3 border-2 rounded-lg transition-all ${
                        darkMode 
                          ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500' 
                          : 'bg-white border-[#D2C1B6] focus:ring-2 focus:ring-[#234C6A] focus:border-[#234C6A]'
                      }`}
                      placeholder="VD: Quà tặng" 
                      value={form.customCategory} 
                      onChange={e=>setForm(f=>({...f,customCategory:e.target.value}))} 
                    />
                  </div>
                )}

                <div>
                  <label className={`block text-sm font-medium mb-2 ${textClass}`}>
                    Ngày giao dịch
                  </label>
                  <input 
                    type="date" 
                    className={`w-full px-4 py-3 border-2 rounded-lg transition-all ${
                      darkMode 
                        ? 'bg-slate-700 border-slate-600 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500' 
                        : 'bg-white border-[#D2C1B6] focus:ring-2 focus:ring-[#234C6A] focus:border-[#234C6A]'
                    }`}
                    value={form.date} 
                    onChange={e=>setForm(f=>({...f,date:e.target.value}))} 
                  />
                </div>

                {editingId ? (
                  <div className="flex gap-3">
                    <button 
                      className={`flex-1 py-3 font-semibold rounded-lg shadow-lg transition-all transform hover:scale-105 ${
                        darkMode 
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/30' 
                          : 'bg-gradient-to-r from-[#234C6A] to-[#1B3C53] hover:from-[#1B3C53] hover:to-[#234C6A] text-white'
                      }`}
                      onClick={add}
                      disabled={isLoading}
                    >
                      {isLoading ? '⏳ Đang lưu...' : '💾 Lưu thay đổi'}
                    </button>
                    <button 
                      className={`px-4 py-3 font-semibold rounded-lg transition-all ${
                        darkMode 
                          ? 'bg-slate-700 hover:bg-slate-600 text-gray-300 border border-slate-600' 
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                      onClick={cancelEdit}
                    >
                      ❌
                    </button>
                  </div>
                ) : (
                  <button 
                    className={`w-full py-3 font-semibold rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                      darkMode 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/30' 
                        : 'bg-gradient-to-r from-[#234C6A] to-[#1B3C53] hover:from-[#1B3C53] hover:to-[#234C6A] text-white'
                    }`}
                    onClick={add}
                    disabled={isLoading}
                  >
                    {isLoading ? '⏳ Đang thêm...' : `➕ Thêm ${form.type === 'expense' ? 'chi tiêu' : 'thu nhập'}`}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Expense List */}
          <div className="lg:col-span-2">
            <div className={`rounded-2xl shadow-2xl p-6 ${
              darkMode 
                ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 backdrop-blur-sm' 
                : 'bg-white border-2 border-[#D2C1B6]/30'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">📋</span>
                  <h3 className={`text-xl font-bold ${textClass}`}>Lịch sử giao dịch</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    darkMode 
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' 
                      : 'bg-[#234C6A] text-white'
                  }`}>
                    {filteredAndSortedItems.length}
                  </span>
                </div>
              </div>

              {/* Filters - Compact */}
              <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select 
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className={`px-3 py-2 border-2 rounded-lg text-sm transition-all ${
                    darkMode 
                      ? 'bg-slate-700 border-slate-600 text-white focus:ring-2 focus:ring-purple-500' 
                      : 'bg-white border-[#D2C1B6] focus:ring-2 focus:ring-[#234C6A]'
                  }`}
                >
                  <option value="all">📊 Tất cả loại</option>
                  <option value="expense">💸 Chỉ chi tiêu</option>
                  <option value="income">💰 Chỉ thu nhập</option>
                </select>

                <select 
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className={`px-3 py-2 border-2 rounded-lg text-sm transition-all ${
                    darkMode 
                      ? 'bg-slate-700 border-slate-600 text-white focus:ring-2 focus:ring-purple-500' 
                      : 'bg-white border-[#D2C1B6] focus:ring-2 focus:ring-[#234C6A]'
                  }`}
                >
                  <option value="all">📂 Tất cả danh mục</option>
                  {[...new Set(items.map(item => item.category))].map(cat => (
                    <option key={cat} value={cat}>{categoryIcons[cat] || '📦'} {cat}</option>
                  ))}
                </select>

                <input 
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className={`px-3 py-2 border-2 rounded-lg text-sm transition-all ${
                    darkMode 
                      ? 'bg-slate-700 border-slate-600 text-white focus:ring-2 focus:ring-purple-500' 
                      : 'bg-white border-[#D2C1B6] focus:ring-2 focus:ring-[#234C6A]'
                  }`}
                />
              </div>

              {/* Search */}
              <div className="mb-4">
                <input 
                  type="text"
                  placeholder="🔍 Tìm kiếm giao dịch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full px-4 py-2 border-2 rounded-lg text-sm transition-all ${
                    darkMode 
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500' 
                      : 'bg-white border-[#D2C1B6] placeholder-gray-400 focus:ring-2 focus:ring-[#234C6A]'
                  }`}
                />
              </div>

              {/* Items List - Scrollable */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto ${
                      darkMode ? 'border-purple-400' : 'border-[#234C6A]'
                    }`}></div>
                    <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-[#456882]'}`}>Đang tải...</p>
                  </div>
                ) : filteredAndSortedItems.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-6xl mb-4 block">📭</span>
                    <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-[#456882]'}`}>Chưa có giao dịch nào</p>
                    <p className={`text-sm mt-2 ${darkMode ? 'text-gray-500' : 'text-[#D2C1B6]'}`}>Thêm giao dịch đầu tiên của bạn!</p>
                  </div>
                ) : (
                  filteredAndSortedItems.map(item => (
                    <div 
                      key={item.id}
                      className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 transition-colors border ${
                        darkMode
                          ? item.type === 'income' ? 'bg-emerald-900/10 border-emerald-700/20' : 'bg-rose-900/10 border-rose-700/20'
                          : item.type === 'income' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="text-base flex-shrink-0">{categoryIcons[item.category] || '📦'}</div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <div className={`text-sm font-medium truncate ${textClass}`}>{item.title}</div>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                              darkMode ? 'bg-slate-700 text-gray-200' : 'bg-white/60 text-gray-700 border'
                            }`}>{item.category}</span>
                          </div>
                          <div className="text-xs text-gray-400 truncate">{new Date(item.date).toLocaleDateString('vi-VN')}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className={`font-semibold text-sm ${item.type === 'income' ? (darkMode ? 'text-emerald-400' : 'text-green-700') : (darkMode ? 'text-rose-400' : 'text-red-700')}`}>
                          {item.type === 'income' ? '+' : '-'}{item.amount?.toLocaleString('vi-VN')}đ
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            className={`text-xs px-2 py-1 rounded border ${darkMode ? 'bg-slate-700 text-gray-200 border-slate-600' : 'bg-white text-gray-700 border-gray-200'}`}
                            onClick={() => editItem(item)}
                          >
                            ✏️
                          </button>
                          <button
                            className={`text-xs px-2 py-1 rounded border ${darkMode ? 'bg-rose-700 text-white border-rose-600' : 'bg-red-500 text-white'}`}
                            onClick={() => setShowDeleteConfirm(item.id)}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      {/* Delete Confirmation */}
                      {showDeleteConfirm === item.id && (
                        <div className={`absolute z-20 right-0 top-full mt-1 p-3 rounded-lg shadow-lg border-2 min-w-[280px] ${darkMode ? 'bg-slate-900 text-gray-200 border-slate-700' : 'bg-white border-gray-200'}`}>
                          <p className="text-sm font-medium mb-3">⚠️ Xác nhận xóa giao dịch</p>
                          <div className="mb-3">
                            <label className="block text-xs font-medium mb-1">
                              Lý do xóa <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              value={deleteReason}
                              onChange={(e) => setDeleteReason(e.target.value)}
                              placeholder="VD: Nhập sai, trùng lặp, hủy giao dịch..."
                              className={`w-full px-2 py-1 text-xs border rounded resize-none ${
                                darkMode 
                                  ? 'bg-slate-800 border-slate-600 text-gray-200 placeholder-gray-400' 
                                  : 'bg-white border-gray-300 placeholder-gray-500'
                              }`}
                              rows={2}
                              maxLength={200}
                            />
                            <div className="text-xs text-gray-400 mt-1">{deleteReason.length}/200</div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              className="flex-1 px-3 py-1.5 text-xs rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                              onClick={() => deleteItem(item.id)}
                              disabled={!deleteReason.trim() || isLoading}
                            >
                              {isLoading ? '⏳ Xóa...' : 'Xóa'}
                            </button>
                            <button 
                              className="flex-1 px-3 py-1.5 text-xs rounded border hover:bg-gray-50"
                              onClick={() => {
                                setShowDeleteConfirm(null)
                                setDeleteReason('')
                              }}
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Compact (Hidden on mobile) */}
      <footer className={`hidden lg:block ${darkMode ? 'bg-slate-900 border-t border-slate-700' : 'bg-[#1B3C53] border-t border-[#234C6A]'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <p className="text-[#D2C1B6] text-sm">
              💰 Quản lý Chi tiêu © 2025 • Made with ❤️
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile Floating Action Button */}
      <MobileFloatingButton
        icon="➕"
        label={editingId ? "Hủy" : "Thêm mới"}
        onClick={() => {
          vibrateOnAction()
          if (editingId) {
            setEditingId(null)
            setForm({
              title: '',
              amount: '',
              category: 'Ăn uống',
              date: new Date().toISOString().split('T')[0],
              type: 'expense',
              customCategory: ''
            })
          } else {
            // Scroll to form
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }
        }}
        color={editingId ? "red" : "blue"}
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
      
      {/* Spending Warning Modal */}
      {showWarningModal && warningData && (
        <SpendingWarningModal
          isOpen={showWarningModal}
          onClose={() => {
            setShowWarningModal(false)
            setPendingExpense(null)
            setWarningData(null)
          }}
          alerts={warningData.alerts}
          currentSpending={warningData.currentSpending}
          limits={warningData.limits}
          afterExpense={warningData.afterExpense}
          amount={pendingExpense?.amount || 0}
          category={pendingExpense?.category || ''}
          onConfirm={handleWarningConfirm}
          onEdit={handleWarningEdit}
        />
      )}
    </div>
  )
}
