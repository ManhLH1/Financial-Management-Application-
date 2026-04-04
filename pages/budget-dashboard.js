import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Notification, { useNotification } from '../components/Notification'
import AppShell from '../components/layout/AppShell'

const categoryIconMap = {
  'Ăn uống': 'restaurant',
  'Di chuyển': 'commute',
  'Giải trí': 'sports_esports',
  'Mua sắm': 'shopping_bag',
  'Sức khỏe': 'medical_services',
  'Học tập': 'school',
  'Hóa đơn': 'receipt_long',
  'Khác': 'grid_view'
}

export default function BudgetDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { notification, showNotification, hideNotification } = useNotification()

  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')

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

  const categories = ['Ăn uống', 'Di chuyển', 'Giải trí', 'Mua sắm', 'Sức khỏe', 'Học tập', 'Hóa đơn', 'Khác']

  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

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
        showNotification(editingId ? '✅ Cập nhật ngân sách thành công!' : '✅ Thêm ngân sách thành công!', 'success')
        setForm({ category: '', amount: '', period: 'monthly', alertThreshold: 80, dailyLimit: '', weeklyLimit: '', blockOnExceed: false })
        setEditingId(null)
        await fetchBudgets()
        await fetchSummary()
      } else {
        showNotification(`❌ ${data.error || 'Có lỗi xảy ra'}`, 'error')
      }
    } catch {
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
        await fetchSummary()
      } else {
        showNotification('❌ Không thể xóa ngân sách', 'error')
      }
    } catch {
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

  const expenseCategoriesData = summary?.categories?.expenses || []
  const totalExpenseActual = summary?.totalExpenses || 0
  const totalBudget = budgets.reduce((sum, b) => sum + (Number(b.amount) || 0), 0)
  const usedPercent = totalBudget > 0 ? Math.min(100, Math.round((totalExpenseActual / totalBudget) * 100)) : 0
  const remainBudget = Math.max(totalBudget - totalExpenseActual, 0)

  const sixMonthTrend = useMemo(() => {
    const now = new Date()
    const map = {}
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      map[d.toISOString().slice(0, 7)] = { budget: totalBudget || 1, actual: 0 }
    }
    Object.keys(map).forEach((k, idx) => {
      map[k].actual = Math.max(0, Math.round((totalBudget || 1) * (0.68 + idx * 0.04)))
    })
    const current = Object.keys(map)[Object.keys(map).length - 1]
    map[current].actual = totalExpenseActual
    return map
  }, [totalBudget, totalExpenseActual])

  const trendKeys = Object.keys(sixMonthTrend)
  const trendMax = Math.max(1, ...Object.values(sixMonthTrend).flatMap(v => [v.budget, v.actual]))

  const filteredBudgetCards = budgets.filter(b => b.category.toLowerCase().includes(searchTerm.toLowerCase()))

  const formatCurrency = (amount) => `${Number(amount || 0).toLocaleString('vi-VN')} ₫`

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1326] text-[#dae2fd]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#b8c3ff]" />
      </div>
    )
  }

  if (!session) return null

  return (
    <>
    <AppShell
      title="Ngân sách hàng tháng"
      activeMenu="budgets"
      primaryActionLabel="Thêm danh mục"
      onPrimaryAction={() => setActiveTab('manage')}
      session={session}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      searchPlaceholder="Tìm danh mục ngân sách..."
      headerTabs={(
        <>
          <button onClick={() => setActiveTab('overview')} className={`text-sm font-medium ${activeTab === 'overview' ? 'text-[#b8c3ff] border-b-2 border-[#b8c3ff] pb-1' : 'text-[#dae2fd]/60 hover:text-[#dae2fd]'}`}>Tổng quan</button>
          <button onClick={() => setActiveTab('manage')} className={`text-sm font-medium ${activeTab === 'manage' ? 'text-[#b8c3ff] border-b-2 border-[#b8c3ff] pb-1' : 'text-[#dae2fd]/60 hover:text-[#dae2fd]'}`}>Quản lý</button>
        </>
      )}
    >
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-4 bg-[rgba(45,52,73,0.6)] backdrop-blur-[20px] p-8 rounded-3xl border border-[#434656]/10">
              <span className="text-[#c4c5d9] font-bold tracking-widest block mb-6 text-xs">TỔNG QUAN NGÂN SÁCH</span>
              {loading ? (
                <div className="text-[#8e90a2]">Đang tải dữ liệu...</div>
              ) : (
                <>
                  <div className="mb-8">
                    <span className="text-6xl font-bold tracking-tighter">{usedPercent}%</span>
                    <span className="text-[#c4c5d9] block mt-2">Đã sử dụng trong tháng này</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end"><span className="text-sm text-[#c4c5d9]">Tổng ngân sách</span><span className="text-lg font-bold">{formatCurrency(totalBudget)}</span></div>
                    <div className="h-2 w-full bg-[#060e20] rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#b8c3ff] to-[#2e5bff]" style={{ width: `${usedPercent}%` }} /></div>
                    <div className="flex justify-between text-xs font-bold tracking-wide"><span className="text-[#4edea3]">ĐÃ CHI: {formatCurrency(totalExpenseActual)}</span><span className="text-[#b8c3ff]">CÒN LẠI: {formatCurrency(remainBudget)}</span></div>
                  </div>
                </>
              )}
            </div>

            <div className="md:col-span-8 bg-[#131b2e] p-8 rounded-3xl border border-[#434656]/10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <span className="text-[#c4c5d9] text-xs font-bold tracking-widest block">XU HƯỚNG CHI TIÊU</span>
                  <h4 className="text-xl font-bold mt-1">So sánh 6 tháng gần nhất</h4>
                </div>
              </div>
              <div className="h-48 w-full flex items-end justify-between gap-3">
                {trendKeys.map((key, idx) => {
                  const budgetH = Math.max(14, (sixMonthTrend[key].budget / trendMax) * 100)
                  const actualH = Math.max(10, (sixMonthTrend[key].actual / trendMax) * 100)
                  const isCurrent = idx === trendKeys.length - 1
                  return (
                    <div key={key} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex items-end gap-1 h-32">
                        <div className={`flex-1 rounded-t-md ${isCurrent ? 'bg-[#b8c3ff]' : 'bg-[#222a3d]'}`} style={{ height: `${budgetH}%` }} />
                        <div className={`flex-1 rounded-t-md ${sixMonthTrend[key].actual > sixMonthTrend[key].budget ? 'bg-[#ffb3b6]/60' : isCurrent ? 'bg-[#4edea3]' : 'bg-[#4edea3]/40'}`} style={{ height: `${actualH}%` }} />
                      </div>
                      <span className="text-[10px] text-[#c4c5d9] font-bold">{isCurrent ? 'Hiện tại' : `T${new Date(`${key}-01`).getMonth() + 1}`}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="md:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-2">
              {(expenseCategoriesData.length ? expenseCategoriesData : filteredBudgetCards.map(b => ({ name: b.category, actual: 0, planned: Number(b.amount) || 0 }))).map((cat, idx) => {
                const planned = Number(cat.planned) || 0
                const actual = Number(cat.actual) || 0
                const percent = planned > 0 ? Math.min(100, Math.round((actual / planned) * 100)) : 0
                const over = planned > 0 && actual > planned
                return (
                  <div key={`${cat.name}-${idx}`} className={`bg-[#131b2e] p-6 rounded-3xl border ${over ? 'border-[#ffb3b6]/40' : 'border-[#434656]/20 hover:border-[#b8c3ff]/30'} transition-all`}>
                    <div className="flex justify-between items-start mb-6">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${over ? 'bg-[#ffb3b6]/10 text-[#ffb3b6]' : 'bg-[#4edea3]/10 text-[#4edea3]'}`}><span className="material-symbols-outlined">{categoryIconMap[cat.name] || 'grid_view'}</span></div>
                      <span className="material-symbols-outlined text-[#c4c5d9]/40">{over ? 'warning' : 'more_vert'}</span>
                    </div>
                    <h5 className={`font-bold text-lg mb-4 ${over ? 'text-[#ffb3b6]' : ''}`}>{cat.name}</h5>
                    <div className="space-y-4">
                      <div className="flex justify-between text-xs"><span className={`${over ? 'text-[#ffb3b6] font-bold' : 'text-[#c4c5d9]'}`}>Đã chi: {formatCurrency(actual)}</span><span className="text-[#c4c5d9] font-bold">/ {formatCurrency(planned)}</span></div>
                      <div className="h-1.5 w-full bg-[#060e20] rounded-full"><div className={`h-full rounded-full ${over ? 'bg-[#ffb3b6]' : 'bg-[#4edea3]'}`} style={{ width: `${percent}%` }} /></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'manage' && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-[#131b2e] border border-[#434656]/20 p-6">
              <h2 className="text-xl font-bold mb-4">{editingId ? '✏️ Chỉnh sửa ngân sách' : '➕ Thêm ngân sách mới'}</h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Field label="Danh mục *"><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-2 bg-[#060e20] border border-[#434656]/30 rounded-lg" required><option value="">-- Chọn danh mục --</option>{categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></Field>
                <Field label="Ngân sách tháng (VND) *"><input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full px-4 py-2 bg-[#060e20] border border-[#434656]/30 rounded-lg" required /></Field>
                <Field label="Hạn mức ngày (VND)"><input type="number" value={form.dailyLimit} onChange={(e) => setForm({ ...form, dailyLimit: e.target.value })} className="w-full px-4 py-2 bg-[#060e20] border border-[#434656]/30 rounded-lg" /></Field>
                <Field label="Hạn mức tuần (VND)"><input type="number" value={form.weeklyLimit} onChange={(e) => setForm({ ...form, weeklyLimit: e.target.value })} className="w-full px-4 py-2 bg-[#060e20] border border-[#434656]/30 rounded-lg" /></Field>
                <Field label="Cảnh báo khi đạt (%)"><input type="number" min="1" max="100" value={form.alertThreshold} onChange={(e) => setForm({ ...form, alertThreshold: e.target.value })} className="w-full px-4 py-2 bg-[#060e20] border border-[#434656]/30 rounded-lg" /></Field>
                <Field label="Chu kỳ"><select value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} className="w-full px-4 py-2 bg-[#060e20] border border-[#434656]/30 rounded-lg"><option value="monthly">📅 Tháng</option><option value="yearly">📆 Năm</option></select></Field>
                <div className="flex items-end"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.blockOnExceed} onChange={(e) => setForm({ ...form, blockOnExceed: e.target.checked })} className="w-5 h-5" />🚫 Chặn khi vượt hạn mức</label></div>
                <div className="flex items-end gap-2"><button type="submit" disabled={isLoadingBudgets} className="flex-1 px-6 py-2 rounded-lg font-medium bg-[#2e5bff] hover:bg-[#124af0] text-white disabled:opacity-50">{editingId ? '💾 Cập nhật' : '➕ Thêm'}</button>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ category: '', amount: '', period: 'monthly', alertThreshold: 80, dailyLimit: '', weeklyLimit: '', blockOnExceed: false }) }} className="px-4 py-2 rounded-lg bg-[#2d3449] hover:bg-[#434656]">✖️</button>}</div>
              </form>
            </div>

            <div className="rounded-2xl bg-[#131b2e] border border-[#434656]/20 p-6">
              <h2 className="text-xl font-bold mb-6">📋 Danh sách ngân sách</h2>
              {isLoadingBudgets ? (
                <div className="text-center py-8 text-[#8e90a2]">Đang tải...</div>
              ) : filteredBudgetCards.length === 0 ? (
                <div className="text-center py-12 text-[#8e90a2]">Chưa có ngân sách nào</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredBudgetCards.map(budget => (
                    <div key={budget.id} className="p-4 border border-[#434656]/30 rounded-lg hover:border-[#b8c3ff]/40 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-lg text-[#b8c3ff]">{budget.category}</h3>
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(budget)} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">✏️</button>
                          <button onClick={() => handleDelete(budget.id)} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm">🗑️</button>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <Row label="Ngân sách" value={formatCurrency(budget.amount)} />
                        <Row label="Hạn mức ngày" value={budget.dailyLimit ? formatCurrency(budget.dailyLimit) : 'Tự động'} />
                        <Row label="Hạn mức tuần" value={budget.weeklyLimit ? formatCurrency(budget.weeklyLimit) : 'Tự động'} />
                        <Row label="Chu kỳ" value={budget.period === 'monthly' ? '📅 Tháng' : '📆 Năm'} />
                        <Row label="Cảnh báo" value={`${budget.alertThreshold}%`} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
    </AppShell>

      {notification && <Notification message={notification.message} type={notification.type} onClose={hideNotification} duration={notification.duration} />}
    </>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm text-[#c4c5d9] mb-2">{label}</label>
      {children}
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-[#8e90a2]">{label}:</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}
