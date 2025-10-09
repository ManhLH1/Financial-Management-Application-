import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Notification, { useNotification } from '../components/Notification'
import Footer from '../components/Footer'

export default function RecurringExpenses() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [recurring, setRecurring] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const { notification, showNotification, hideNotification } = useNotification()
  
  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: 'Hóa đơn',
    frequency: 'monthly',
    dayOfMonth: 1,
    nextDue: '',
    isActive: true
  })

  const [editingId, setEditingId] = useState(null)

  const categories = [
    'Ăn uống', 'Di chuyển', 'Giải trí', 'Mua sắm', 
    'Sức khỏe', 'Học tập', 'Hóa đơn', 'Khác'
  ]

  const frequencies = [
    { value: 'daily', label: '📅 Hàng ngày' },
    { value: 'weekly', label: '📅 Hàng tuần' },
    { value: 'monthly', label: '📅 Hàng tháng' },
    { value: 'yearly', label: '📅 Hàng năm' }
  ]

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth')
    } else if (status === 'authenticated') {
      fetchRecurring()
    }
  }, [status, router])

  async function fetchRecurring() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/recurring-expenses')
      const data = await res.json()
      setRecurring(data.recurringExpenses || [])
    } catch (error) {
      console.error('Error fetching recurring expenses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title || !form.amount) {
      showNotification('⚠️ Vui lòng điền đầy đủ thông tin!', 'warning')
      return
    }

    setIsLoading(true)
    try {
      const method = editingId ? 'PUT' : 'POST'
      const body = editingId ? { ...form, id: editingId } : form

      const res = await fetch('/api/recurring-expenses', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()

      if (res.ok) {
        showNotification(
          editingId ? '✅ Cập nhật thành công!' : '✅ Thêm chi tiêu định kỳ thành công!',
          'success'
        )
        setForm({
          title: '',
          amount: '',
          category: 'Hóa đơn',
          frequency: 'monthly',
          dayOfMonth: 1,
          nextDue: '',
          isActive: true
        })
        setEditingId(null)
        await fetchRecurring()
      } else {
        showNotification(`❌ ${data.error || 'Có lỗi xảy ra'}`, 'error')
      }
    } catch (error) {
      showNotification('❌ Không thể lưu chi tiêu định kỳ', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleToggleActive(id, currentStatus) {
    setIsLoading(true)
    try {
      const item = recurring.find(r => r.id === id)
      const res = await fetch('/api/recurring-expenses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, id, isActive: !currentStatus })
      })

      if (res.ok) {
        showNotification(
          !currentStatus ? '✅ Đã kích hoạt!' : '⏸️ Đã tạm dừng!',
          'success'
        )
        await fetchRecurring()
      }
    } catch (error) {
      showNotification('❌ Có lỗi xảy ra', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Bạn có chắc muốn xóa chi tiêu định kỳ này?')) return

    setIsLoading(true)
    try {
      const res = await fetch('/api/recurring-expenses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })

      if (res.ok) {
        showNotification('✅ Xóa thành công!', 'success')
        await fetchRecurring()
      } else {
        showNotification('❌ Không thể xóa', 'error')
      }
    } catch (error) {
      showNotification('❌ Có lỗi xảy ra', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  function handleEdit(item) {
    setEditingId(item.id)
    setForm({
      title: item.title,
      amount: item.amount,
      category: item.category,
      frequency: item.frequency,
      dayOfMonth: item.dayOfMonth || 1,
      nextDue: item.nextDue,
      isActive: item.isActive
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!session) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D2C1B6]/20 via-white to-[#456882]/10">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#1B3C53] via-[#234C6A] to-[#1B3C53] shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-5">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                <span className="text-3xl">🔄</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Chi tiêu Định kỳ</h1>
                <p className="text-[#D2C1B6] text-sm mt-1">Quản lý hóa đơn và chi phí lặp lại</p>
              </div>
            </div>
            
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
                href="/budgets" 
                className="group flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all duration-200 font-medium border border-white/10 hover:border-white/20"
              >
                <span className="text-lg">💰</span>
                <span className="hidden sm:inline">Ngân sách</span>
              </Link>
              <Link 
                href="/recurring" 
                className="group flex items-center gap-2 px-4 py-2.5 bg-[#456882] text-white rounded-lg font-medium border-2 border-[#D2C1B6] shadow-lg"
              >
                <span className="text-lg">🔄</span>
                <span className="hidden sm:inline">Định kỳ</span>
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

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
          duration={notification.duration}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-[#1B3C53]">
            {editingId ? '✏️ Chỉnh sửa chi tiêu định kỳ' : '➕ Thêm chi tiêu định kỳ'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tiêu đề *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({...form, title: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-[#D2C1B6] rounded-lg focus:ring-2 focus:ring-[#234C6A] focus:border-transparent"
                  placeholder="Hóa đơn điện"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Số tiền (VND) *</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({...form, amount: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-[#D2C1B6] rounded-lg focus:ring-2 focus:ring-[#234C6A] focus:border-transparent"
                  placeholder="500000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Danh mục</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({...form, category: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-[#D2C1B6] rounded-lg focus:ring-2 focus:ring-[#234C6A] focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tần suất</label>
                <select
                  value={form.frequency}
                  onChange={(e) => setForm({...form, frequency: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-[#D2C1B6] rounded-lg focus:ring-2 focus:ring-[#234C6A] focus:border-transparent"
                >
                  {frequencies.map(freq => (
                    <option key={freq.value} value={freq.value}>{freq.label}</option>
                  ))}
                </select>
              </div>

              {form.frequency === 'monthly' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Ngày trong tháng</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={form.dayOfMonth}
                    onChange={(e) => setForm({...form, dayOfMonth: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-[#D2C1B6] rounded-lg focus:ring-2 focus:ring-[#234C6A] focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Ngày đến hạn tiếp theo</label>
                <input
                  type="date"
                  value={form.nextDue}
                  onChange={(e) => setForm({...form, nextDue: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-[#D2C1B6] rounded-lg focus:ring-2 focus:ring-[#234C6A] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-[#234C6A] hover:bg-[#1B3C53] text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {editingId ? '💾 Cập nhật' : '➕ Thêm'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null)
                    setForm({
                      title: '',
                      amount: '',
                      category: 'Hóa đơn',
                      frequency: 'monthly',
                      dayOfMonth: 1,
                      nextDue: '',
                      isActive: true
                    })
                  }}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200"
                >
                  ✖️ Hủy
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Recurring List */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-6 text-[#1B3C53]">📋 Danh sách chi tiêu định kỳ</h2>
          
          {isLoading && (
            <div className="text-center py-8 text-gray-500">Đang tải...</div>
          )}

          {!isLoading && recurring.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Chưa có chi tiêu định kỳ nào</p>
              <p className="text-sm text-gray-400">Thêm hóa đơn điện, nước, internet, v.v...</p>
            </div>
          )}

          {!isLoading && recurring.length > 0 && (
            <div className="space-y-4">
              {recurring.map(item => (
                <div key={item.id} className={`p-4 border-2 rounded-lg ${
                  item.isActive ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg text-[#1B3C53]">{item.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          item.isActive ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
                        }`}>
                          {item.isActive ? '✅ Hoạt động' : '⏸️ Tạm dừng'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Số tiền:</span>
                          <p className="font-semibold text-red-600">{item.amount.toLocaleString('vi-VN')}đ</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Danh mục:</span>
                          <p className="font-semibold text-[#234C6A]">{item.category}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Tần suất:</span>
                          <p className="font-semibold">
                            {frequencies.find(f => f.value === item.frequency)?.label || item.frequency}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Đến hạn:</span>
                          <p className="font-semibold text-orange-600">
                            {new Date(item.nextDue).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleToggleActive(item.id, item.isActive)}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          item.isActive 
                            ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        {item.isActive ? '⏸️' : '▶️'}
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium transition-colors"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
