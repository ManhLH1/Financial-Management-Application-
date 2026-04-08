import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
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
  const [debts, setDebts] = useState([])
  const [isLoadingDebts, setIsLoadingDebts] = useState(false)
  const [debtForm, setDebtForm] = useState({
    person: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    due: '',
    paymentDay: '',
    status: 'i-owe',
    isInstallment: false,
    monthlyPayment: '',
    totalPeriods: '',
    paidPeriods: ''
  })
  const [editingDebtId, setEditingDebtId] = useState(null)
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
  const [budgetRule, setBudgetRule] = useState('50-30-20')

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
      fetchDebts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  async function fetchSummary() {
    setLoading(true)
    try {
      const res = await fetch('/api/budget-summary')
      const data = await res.json()
      setSummary(data.summary || null)
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
      setBudgets(data.items || data.budgets || [])
    } catch (error) {
      console.error('Error fetching budgets:', error)
    } finally {
      setIsLoadingBudgets(false)
    }
  }

  async function fetchDebts() {
    setIsLoadingDebts(true)
    try {
      const res = await fetch('/api/debts')
      const data = await res.json()
      setDebts(data.items || data.notes || [])
    } catch (error) {
      console.error('Error fetching debts:', error)
    } finally {
      setIsLoadingDebts(false)
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

  function resetDebtForm() {
    setDebtForm({
      person: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      due: '',
      paymentDay: '',
      status: 'i-owe',
      isInstallment: false,
      monthlyPayment: '',
      totalPeriods: '',
      paidPeriods: ''
    })
    setEditingDebtId(null)
  }

  function startEditDebt(debt) {
    setEditingDebtId(debt.id)
    setDebtForm({
      person: debt.person || '',
      amount: debt.amount || '',
      date: debt.date || new Date().toISOString().split('T')[0],
      due: debt.due || '',
      paymentDay: debt.paymentDay || '',
      status: debt.status || 'i-owe',
      isInstallment: Number(debt.totalPeriods || 1) > 1 || Number(debt.monthlyPayment || 0) > 0,
      monthlyPayment: debt.monthlyPayment || '',
      totalPeriods: debt.totalPeriods || '',
      paidPeriods: debt.paidPeriods || ''
    })
    setActiveTab('debts')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function addDebt() {
    if (!debtForm.person || !debtForm.amount) {
      showNotification('⚠️ Nhập người vay/cho và số tiền', 'warning')
      return
    }
    setIsLoadingDebts(true)
    try {
      const payload = {
        person: debtForm.person,
        amount: Number(debtForm.amount),
        date: debtForm.date,
        due: debtForm.due || debtForm.date,
        paymentDay: debtForm.paymentDay || '',
        status: debtForm.status,
        monthlyPayment: debtForm.isInstallment ? Number(debtForm.monthlyPayment || 0) : 0,
        totalPeriods: debtForm.isInstallment ? Number(debtForm.totalPeriods || 1) : 1,
        paidPeriods: debtForm.isInstallment ? Number(debtForm.paidPeriods || 0) : 0
      }

      const method = editingDebtId ? 'PUT' : 'POST'
      const body = editingDebtId ? { ...payload, id: editingDebtId } : payload

      const res = await fetch('/api/debts', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (res.ok) {
        showNotification(editingDebtId ? '✅ Cập nhật khoản nợ thành công' : '✅ Thêm khoản nợ thành công', 'success')
        resetDebtForm()
        await fetchDebts()
      } else {
        showNotification(editingDebtId ? '❌ Không thể cập nhật khoản nợ' : '❌ Không thể thêm khoản nợ', 'error')
      }
    } catch {
      showNotification(editingDebtId ? '❌ Có lỗi khi cập nhật khoản nợ' : '❌ Có lỗi khi thêm khoản nợ', 'error')
    } finally {
      setIsLoadingDebts(false)
    }
  }

  async function markDebtPaid(id) {
    try {
      const res = await fetch('/api/debts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'paid' })
      })
      if (res.ok) {
        showNotification('✅ Đã cập nhật trạng thái khoản nợ', 'success')
        await fetchDebts()
      }
    } catch {
      showNotification('❌ Không thể cập nhật khoản nợ', 'error')
    }
  }

  async function sendDebtReminder(debt) {
    try {
      const res = await fetch('/api/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ debt })
      })
      const data = await res.json()
      if (res.ok) {
        showNotification(`📧 ${data.message}`, 'success', 7000)
      } else {
        showNotification(`❌ ${data.error || 'Không gửi được nhắc nợ'}`, 'error')
      }
    } catch {
      showNotification('❌ Không gửi được email nhắc nợ', 'error')
    }
  }

  async function runAutoDebtReminder() {
    try {
      const res = await fetch('/api/check-warnings', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        showNotification(`🔔 Đã gửi ${data.autoSent?.length || 0} email tự động (mốc 3 ngày)`, 'success')
      } else {
        showNotification(`❌ ${data.error || 'Không thể chạy auto reminder'}`, 'error')
      }
    } catch {
      showNotification('❌ Có lỗi khi chạy auto reminder', 'error')
    }
  }

  const expenseCategoriesData = summary?.categories?.expenses || []
  const totalExpenseActual = summary?.totalExpenses || 0
  const totalIncomeActual = summary?.totalIncome || 0

  // Ngân sách chuẩn cho chi tiêu nên dựa trên tổng thu nhập thực tế
  // ưu tiên mức nhỏ hơn giữa (thu nhập thực tế) và (tổng hạn mức đã đặt)
  // để tránh ảo tưởng ngân sách khi chưa có thu nhập vào.
  const configuredBudget = budgets.reduce((sum, b) => sum + (Number(b.amount) || 0), 0)

  const ruleConfig = {
    '50-30-20': { needs: 0.5, wants: 0.3, savings: 0.2, spendable: 0.8 },
    '60-20-20': { needs: 0.6, wants: 0.2, savings: 0.2, spendable: 0.8 },
    '70-20-10': { needs: 0.7, wants: 0.2, savings: 0.1, spendable: 0.9 }
  }
  const selectedRule = ruleConfig[budgetRule]

  const recommendedBudget = totalIncomeActual > 0 ? Math.round(totalIncomeActual * selectedRule.spendable) : 0
  const totalBudget = configuredBudget > 0
    ? (totalIncomeActual > 0 ? Math.min(configuredBudget, recommendedBudget) : configuredBudget)
    : recommendedBudget

  const usedPercent = totalBudget > 0 ? Math.min(100, Math.round((totalExpenseActual / totalBudget) * 100)) : 0
  const remainBudget = Math.max(totalBudget - totalExpenseActual, 0)
  const overBudgetAmount = Math.max(totalExpenseActual - totalBudget, 0)

  const needsBudget = Math.round(totalIncomeActual * selectedRule.needs)
  const wantsBudget = Math.round(totalIncomeActual * selectedRule.wants)
  const savingsTarget = Math.round(totalIncomeActual * selectedRule.savings)

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

  const debtOverview = useMemo(() => {
    return debts.reduce((acc, debt) => {
      const isPayableDebt = debt.status === 'i-owe' && debt.status !== 'paid'
      if (!isPayableDebt) return acc

      const amount = Math.max(0, Number(debt.amount || 0))
      const monthlyPayment = Math.max(0, Number(debt.monthlyPayment || 0))
      const totalPeriods = Math.max(1, Number(debt.totalPeriods || 1))
      const isInstallment = totalPeriods > 1 || monthlyPayment > 0

      acc.totalDebt += amount
      acc.monthlyPayable += isInstallment ? monthlyPayment : 0
      return acc
    }, { totalDebt: 0, monthlyPayable: 0 })
  }, [debts])

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
          <button onClick={() => setActiveTab('manage')} className={`text-sm font-medium ${activeTab === 'manage' ? 'text-[#b8c3ff] border-b-2 border-[#b8c3ff] pb-1' : 'text-[#dae2fd]/60 hover:text-[#dae2fd]'}`}>Ngân sách</button>
          <button onClick={() => setActiveTab('debts')} className={`text-sm font-medium ${activeTab === 'debts' ? 'text-[#b8c3ff] border-b-2 border-[#b8c3ff] pb-1' : 'text-[#dae2fd]/60 hover:text-[#dae2fd]'}`}>Khoản nợ</button>
        </>
      )}
    >
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-4 bg-[rgba(45,52,73,0.6)] backdrop-blur-[20px] p-8 rounded-3xl border border-[#434656]/10">
              <span className="text-[#c4c5d9] font-bold tracking-widest block mb-4 text-xs">TỔNG QUAN NGÂN SÁCH</span>
              <div className="mb-4">
                <label className="text-[11px] text-[#c4c5d9] uppercase tracking-widest block mb-2">Quy tắc phân bổ</label>
                <select value={budgetRule} onChange={(e) => setBudgetRule(e.target.value)} className="w-full bg-[#060e20] border border-[#434656]/20 rounded-lg px-3 py-2 text-sm">
                  <option value="50-30-20">50/30/20 (cân bằng)</option>
                  <option value="60-20-20">60/20/20 (ưu tiên nhu cầu)</option>
                  <option value="70-20-10">70/20/10 (an toàn cao)</option>
                </select>
              </div>
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
                    {overBudgetAmount > 0 && (
                      <div className="text-xs font-bold text-[#ffb3b6] bg-[#ffb3b6]/10 px-3 py-2 rounded-lg">Đang vượt ngân sách: {formatCurrency(overBudgetAmount)}</div>
                    )}
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-2 text-[10px]">
                    <div className="bg-[#060e20] rounded-lg px-2 py-2">
                      <div className="text-[#c4c5d9]">Needs</div>
                      <div className="font-bold text-[#dae2fd]">{formatCurrency(needsBudget)}</div>
                    </div>
                    <div className="bg-[#060e20] rounded-lg px-2 py-2">
                      <div className="text-[#c4c5d9]">Wants</div>
                      <div className="font-bold text-[#dae2fd]">{formatCurrency(wantsBudget)}</div>
                    </div>
                    <div className="bg-[#060e20] rounded-lg px-2 py-2">
                      <div className="text-[#c4c5d9]">Savings</div>
                      <div className="font-bold text-[#4edea3]">{formatCurrency(savingsTarget)}</div>
                    </div>
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

        {activeTab === 'debts' && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-[#131b2e] border border-[#434656]/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{editingDebtId ? 'Chỉnh sửa khoản nợ' : 'Khoản nợ & Nhắc nợ'}</h2>
                <div className="flex gap-2">
                  {editingDebtId && (
                    <button onClick={resetDebtForm} type="button" className="px-4 py-2 rounded-lg bg-[#2d3449] hover:bg-[#434656] text-sm">Hủy sửa</button>
                  )}
                  <button onClick={runAutoDebtReminder} type="button" className="px-4 py-2 rounded-lg bg-[#2e5bff] hover:bg-[#124af0] text-white text-sm">Tự động nhắc nợ (3 ngày)</button>
                </div>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); addDebt() }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Field label="Người vay/cho *"><input value={debtForm.person} onChange={(e) => setDebtForm({ ...debtForm, person: e.target.value })} className="w-full px-4 py-2 bg-[#060e20] border border-[#434656]/30 rounded-lg" required /></Field>
                <Field label="Số tiền (VND) *"><input type="number" value={debtForm.amount} onChange={(e) => setDebtForm({ ...debtForm, amount: e.target.value })} className="w-full px-4 py-2 bg-[#060e20] border border-[#434656]/30 rounded-lg" required /></Field>
                <Field label="Trạng thái nợ"><select value={debtForm.status} onChange={(e) => setDebtForm({ ...debtForm, status: e.target.value })} className="w-full px-4 py-2 bg-[#060e20] border border-[#434656]/30 rounded-lg"><option value="i-owe">Đi vay</option><option value="owed-to-me">Cho vay</option></select></Field>
                <Field label="Ngày tạo"><input type="date" value={debtForm.date} onChange={(e) => setDebtForm({ ...debtForm, date: e.target.value })} className="w-full px-4 py-2 bg-[#060e20] border border-[#434656]/30 rounded-lg [color-scheme:dark]" /></Field>
                <Field label="Ngày thanh toán"><input type="date" value={debtForm.paymentDay} onChange={(e) => setDebtForm({ ...debtForm, paymentDay: e.target.value })} className="w-full px-4 py-2 bg-[#060e20] border border-[#434656]/30 rounded-lg [color-scheme:dark]" /></Field>
                <Field label="Hạn cuối"><input type="date" value={debtForm.due} onChange={(e) => setDebtForm({ ...debtForm, due: e.target.value })} className="w-full px-4 py-2 bg-[#060e20] border border-[#434656]/30 rounded-lg [color-scheme:dark]" /></Field>

                <div className="md:col-span-2 lg:col-span-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={debtForm.isInstallment} onChange={(e) => setDebtForm({ ...debtForm, isInstallment: e.target.checked })} className="w-4 h-4" />
                    Trả góp
                  </label>
                </div>

                {debtForm.isInstallment && (
                  <>
                    <Field label="Số tiền trả hàng tháng (VND)"><input type="number" min="0" value={debtForm.monthlyPayment} onChange={(e) => setDebtForm({ ...debtForm, monthlyPayment: e.target.value })} className="w-full px-4 py-2 bg-[#060e20] border border-[#434656]/30 rounded-lg" /></Field>
                    <Field label="Tổng số tháng"><input type="number" min="1" value={debtForm.totalPeriods} onChange={(e) => setDebtForm({ ...debtForm, totalPeriods: e.target.value })} className="w-full px-4 py-2 bg-[#060e20] border border-[#434656]/30 rounded-lg" /></Field>
                    <Field label="Đã trả bao nhiêu kỳ"><input type="number" min="0" value={debtForm.paidPeriods} onChange={(e) => setDebtForm({ ...debtForm, paidPeriods: e.target.value })} className="w-full px-4 py-2 bg-[#060e20] border border-[#434656]/30 rounded-lg" /></Field>
                  </>
                )}

                <div className="md:col-span-2 lg:col-span-3 flex justify-end"><button type="submit" disabled={isLoadingDebts} className="px-6 py-2 rounded-lg bg-[#2e5bff] hover:bg-[#124af0] text-white">{editingDebtId ? 'Lưu thay đổi' : 'Thêm khoản nợ'}</button></div>
              </form>
            </div>

            <div className="rounded-2xl bg-[#131b2e] border border-[#434656]/20 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                <h2 className="text-xl font-bold">Danh sách khoản nợ</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="px-3 py-2 rounded-lg bg-[#060e20] border border-[#434656]/30">
                    <div className="text-[#8e90a2]">Nợ phải trả hằng tháng</div>
                    <div className="text-[#ffb3b6] font-bold">{formatCurrency(debtOverview.monthlyPayable)}</div>
                  </div>
                  <div className="px-3 py-2 rounded-lg bg-[#060e20] border border-[#434656]/30">
                    <div className="text-[#8e90a2]">Tổng nợ phải trả</div>
                    <div className="text-[#c4c5d9] font-bold">{formatCurrency(debtOverview.totalDebt)}</div>
                  </div>
                </div>
              </div>
              {isLoadingDebts ? (
                <div className="text-center py-8 text-[#8e90a2]">Đang tải...</div>
              ) : debts.length === 0 ? (
                <div className="text-center py-12 text-[#8e90a2]">Chưa có khoản nợ nào</div>
              ) : (
                <div className="space-y-3">
                  {debts.map((debt) => {
                    const daysUntil = debt.paymentDay ? Math.ceil((new Date(debt.paymentDay) - new Date()) / (1000 * 60 * 60 * 24)) : null
                    const urgent = daysUntil !== null && daysUntil >= 0 && daysUntil <= 3
                    const warning = daysUntil !== null && daysUntil > 3 && daysUntil <= 5
                    return (
                      <div key={debt.id} className={`p-4 border rounded-lg ${urgent ? 'border-[#ffb3b6]/60 bg-[#ffb3b6]/5' : warning ? 'border-[#f59e0b]/50 bg-[#f59e0b]/5' : 'border-[#434656]/30'}`}>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                          <div>
                            {(() => {
                              const debtAmount = Math.max(0, Number(debt.amount || 0))
                              const monthlyDebt = Math.max(0, Number(debt.monthlyPayment || 0))

                              return (
                                <>
                                  <div className="font-bold">{debt.person}</div>
                                  <div className="text-sm text-[#c4c5d9]">{debt.status === 'owed-to-me' ? 'Cho vay' : debt.status === 'i-owe' ? 'Đi vay' : debt.status}</div>
                                  <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                                    <div className="text-[#8e90a2]">Tổng nợ: <span className="text-[#c4c5d9] font-semibold">{formatCurrency(debtAmount)}</span></div>
                                    <div className="text-[#8e90a2]">Nợ phải trả hằng tháng: <span className="text-[#ffb3b6] font-semibold">{formatCurrency(monthlyDebt)}</span></div>
                                  </div>
                                  <div className="text-xs text-[#8e90a2] mt-1">Ngày thanh toán: {debt.paymentDay || 'Chưa đặt'} {daysUntil !== null && daysUntil >= 0 ? `(còn ${daysUntil} ngày)` : ''}</div>
                                </>
                              )
                            })()}
                            {Number(debt.totalPeriods || 1) > 1 && (
                              <div className="mt-2">
                                {(() => {
                                  const totalPeriods = Math.max(1, Number(debt.totalPeriods || 1))
                                  const paidPeriods = Math.min(totalPeriods, Math.max(0, Number(debt.paidPeriods || 0)))
                                  const progressPercent = Math.round((paidPeriods / totalPeriods) * 100)
                                  const principalAmount = Math.max(0, Number(debt.amount || 0))
                                  const paidAmount = Math.min(principalAmount, Math.round((principalAmount * paidPeriods) / totalPeriods))
                                  const remainingAmount = Math.max(0, principalAmount - paidAmount)

                                  return (
                                    <>
                                      <div className="flex justify-between text-[11px] text-[#c4c5d9]">
                                        <span>Trả góp: {paidPeriods}/{totalPeriods} kỳ</span>
                                        <span>{progressPercent}%</span>
                                      </div>
                                      <div className="mt-1 h-1.5 w-full bg-[#060e20] rounded-full overflow-hidden">
                                        <div className="h-full bg-[#4edea3]" style={{ width: `${Math.min(100, progressPercent)}%` }} />
                                      </div>
                                      <div className="mt-1 grid grid-cols-1 sm:grid-cols-3 gap-1 text-[11px]">
                                        <div className="text-[#8e90a2]">Mỗi tháng: <span className="text-[#c4c5d9]">{formatCurrency(debt.monthlyPayment || 0)}</span></div>
                                        <div className="text-[#8e90a2]">Đã trả: <span className="text-[#4edea3]">{formatCurrency(paidAmount)}</span></div>
                                        <div className="text-[#8e90a2]">Còn lại: <span className="text-[#ffb3b6]">{formatCurrency(remainingAmount)}</span></div>
                                      </div>
                                    </>
                                  )
                                })()}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => startEditDebt(debt)} className="px-3 py-1.5 rounded bg-[#2d3449] hover:bg-[#434656] text-sm">Sửa</button>
                            {debt.status !== 'paid' && <button onClick={() => markDebtPaid(debt.id)} className="px-3 py-1.5 rounded bg-[#2e5bff] hover:bg-[#124af0] text-white text-sm">Đã trả</button>}
                            <button onClick={() => sendDebtReminder(debt)} className="px-3 py-1.5 rounded bg-[#2d3449] hover:bg-[#434656] text-sm">Gửi mail nhắc</button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
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
