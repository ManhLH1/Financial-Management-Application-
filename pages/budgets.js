import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Notification, { useNotification } from '../components/Notification'
import Footer from '../components/Footer'

export default function Budgets() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [budgets, setBudgets] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const { notification, showNotification, hideNotification } = useNotification()
  
  const [form, setForm] = useState({
    category: '',
    amount: '',
    period: 'monthly',
    alertThreshold: 80
  })

  const [editingId, setEditingId] = useState(null)

  const categories = [
    'Ăn uống', 'Di chuyển', 'Giải trí', 'Mua sắm', 
    'Sức khỏe', 'Học tập', 'Hóa đơn', 'Khác'
  ]

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth')
    } else if (status === 'authenticated') {
      fetchBudgets()
    }
  }, [status, router])

  async function fetchBudgets() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/budgets')
      const data = await res.json()
      setBudgets(data.budgets || [])
    } catch (error) {
      console.error('Error fetching budgets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.category || !form.amount) {
      showNotification('⚠️ Vui lòng điền đầy đủ thông tin!', 'warning')
      return
    }

    setIsLoading(true)
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
        setForm({ category: '', amount: '', period: 'monthly', alertThreshold: 80 })
        setEditingId(null)
        await fetchBudgets()
      } else {
        showNotification(`❌ ${data.error || 'Có lỗi xảy ra'}`, 'error')
      }
    } catch (error) {
      showNotification('❌ Không thể lưu ngân sách', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Bạn có chắc muốn xóa ngân sách này?')) return

    setIsLoading(true)
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
      setIsLoading(false)
    }
  }

  function handleEdit(budget) {
    setEditingId(budget.id)
    setForm({
      category: budget.category,
      amount: budget.amount,
      period: budget.period,
      alertThreshold: budget.alertThreshold
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
                <span className="text-3xl">💰</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Quản lý Ngân sách</h1>
                <p className="text-[#D2C1B6] text-sm mt-1">Đặt và theo dõi ngân sách cho từng danh mục</p>
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
                className="group flex items-center gap-2 px-4 py-2.5 bg-[#456882] text-white rounded-lg font-medium border-2 border-[#D2C1B6] shadow-lg"
              >
                <span className="text-lg">💰</span>
                <span className="hidden sm:inline">Ngân sách</span>
              </Link>
              <Link 
                href="/recurring" 
                className="group flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all duration-200 font-medium border border-white/10 hover:border-white/20"
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
            {editingId ? '✏️ Chỉnh sửa ngân sách' : '➕ Thêm ngân sách mới'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Danh mục *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({...form, category: e.target.value})}
                className="w-full px-4 py-2 border-2 border-[#D2C1B6] rounded-lg focus:ring-2 focus:ring-[#234C6A] focus:border-transparent"
                required
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Số tiền (VND) *</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({...form, amount: e.target.value})}
                className="w-full px-4 py-2 border-2 border-[#D2C1B6] rounded-lg focus:ring-2 focus:ring-[#234C6A] focus:border-transparent"
                placeholder="1000000"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Cảnh báo khi đạt (%)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={form.alertThreshold}
                onChange={(e) => setForm({...form, alertThreshold: e.target.value})}
                className="w-full px-4 py-2 border-2 border-[#D2C1B6] rounded-lg focus:ring-2 focus:ring-[#234C6A] focus:border-transparent"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-2 bg-[#234C6A] hover:bg-[#1B3C53] text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {editingId ? '💾 Cập nhật' : '➕ Thêm'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null)
                    setForm({ category: '', amount: '', period: 'monthly', alertThreshold: 80 })
                  }}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200"
                >
                  ✖️
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Budget List */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-6 text-[#1B3C53]">📋 Danh sách ngân sách</h2>
          
          {isLoading && (
            <div className="text-center py-8 text-gray-500">Đang tải...</div>
          )}

          {!isLoading && budgets.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Chưa có ngân sách nào</p>
              <p className="text-sm text-gray-400">Hãy thêm ngân sách mới ở trên!</p>
            </div>
          )}

          {!isLoading && budgets.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {budgets.map(budget => (
                <div key={budget.id} className="p-4 border-2 border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg text-[#1B3C53]">{budget.category}</h3>
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
                      <span className="text-gray-600">Ngân sách:</span>
                      <span className="font-semibold text-[#234C6A]">
                        {budget.amount.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Chu kỳ:</span>
                      <span className="font-semibold">
                        {budget.period === 'monthly' ? '📅 Tháng' : '📆 Năm'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Cảnh báo:</span>
                      <span className="font-semibold text-orange-500">
                        {budget.alertThreshold}%
                      </span>
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
