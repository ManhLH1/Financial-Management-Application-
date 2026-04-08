import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Notification, { useNotification } from '../components/Notification'
import SpendingWarningModal from '../components/SpendingWarningModal'
import AppShell from '../components/layout/AppShell'
import { computeFinanceSummary } from '../lib/financeSummary'

const expenseCategories = {
  'Ăn uống': 'restaurant',
  'Di chuyển': 'commute',
  'Giải trí': 'sports_esports',
  'Mua sắm': 'shopping_bag',
  'Sức khỏe': 'health_and_safety',
  'Học tập': 'school',
  'Hóa đơn': 'receipt_long',
  'Khác': 'category'
}

const incomeCategories = {
  'Lương': 'payments',
  'Thưởng': 'redeem',
  'Đầu tư': 'trending_up',
  'Kinh doanh': 'business_center',
  'Khác': 'account_balance_wallet'
}

const categoryIconMap = { ...expenseCategories, ...incomeCategories }

export default function Expenses() {
  const { data: session, status } = useSession()
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [deleteReason, setDeleteReason] = useState('')

  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: 'Ăn uống',
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    customCategory: '',
    debtId: ''
  })

  const [editingId, setEditingId] = useState(null)
  const [filter, setFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const [showWarningModal, setShowWarningModal] = useState(false)
  const [warningData, setWarningData] = useState(null)
  const [pendingExpense, setPendingExpense] = useState(null)
  const [debts, setDebts] = useState([])

  const { notification, showNotification, hideNotification } = useNotification()

  const formatAmountInput = (value) => {
    if (!value) return ''
    const numeric = String(value).replace(/\D/g, '')
    return numeric ? Number(numeric).toLocaleString('vi-VN') : ''
  }

  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  useEffect(() => {
    if (status === 'loading') return
    const cached = localStorage.getItem('expenses_cache')
    if (cached) {
      try {
        setItems(JSON.parse(cached))
      } catch (e) {
        console.error('Cache parse error:', e)
      }
    }
    fetchItems()
    fetchDebts()
  }, [status])

  async function fetchItems() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/expenses')
      const data = await res.json()
      const list = data.items || []
      setItems(list)
      localStorage.setItem('expenses_cache', JSON.stringify(list))
      localStorage.setItem('data_cache_timestamp', Date.now().toString())
    } catch (error) {
      console.error('Error fetching expenses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchDebts() {
    try {
      const res = await fetch('/api/debts')
      const data = await res.json()
      setDebts((data.items || data.notes || []).filter(d => d.status !== 'paid'))
    } catch (error) {
      console.error('Error fetching debts:', error)
    }
  }

  function editItem(item) {
    setEditingId(item.id)
    setForm({
      title: item.title || '',
      amount: item.amount || '',
      category: item.category || 'Ăn uống',
      date: item.date?.split('T')[0] || new Date().toISOString().split('T')[0],
      type: item.type || 'expense',
      customCategory: '',
      debtId: ''
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm({
      title: '',
      amount: '',
      category: 'Ăn uống',
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      customCategory: '',
      debtId: ''
    })
  }

  async function deleteItem(id) {
    if (!deleteReason.trim()) {
      showNotification('⚠️ Vui lòng nhập lý do xóa!', 'warning')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/expenses?id=${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: deleteReason.trim() })
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
      console.error('Delete error:', error)
      showNotification('Có lỗi xảy ra khi xóa giao dịch', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  async function add() {
    if (!form.title || !form.amount) {
      showNotification('⚠️ Vui lòng điền đầy đủ thông tin!', 'warning')
      return
    }

    if (form.category === 'Khác' && !form.customCategory) {
      showNotification('⚠️ Vui lòng nhập danh mục khác!', 'warning')
      return
    }

    if (form.type === 'expense' && form.category === 'Trả nợ' && !form.debtId) {
      showNotification('⚠️ Vui lòng chọn khoản vay cần trả!', 'warning')
      return
    }

    const finalCategory = form.category === 'Khác' && form.customCategory ? form.customCategory : form.category

    if (form.type === 'income' || editingId) {
      await saveExpense(finalCategory)
      return
    }

    setIsLoading(true)
    try {
      const checkRes = await fetch('/api/check-spending-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: finalCategory, amount: Number(form.amount) })
      })

      const checkData = await checkRes.json()
      if (!checkRes.ok) {
        showNotification(`❌ ${checkData.error}`, 'error')
        return
      }

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
        return
      }

      await saveExpense(finalCategory)
    } catch (error) {
      console.error('Limit check error:', error)
      showNotification('⚠️ Không thể kiểm tra hạn mức. Vẫn cho phép lưu.', 'warning')
      await saveExpense(finalCategory)
    } finally {
      setIsLoading(false)
    }
  }

  async function saveExpense(finalCategory, skipNotification = false) {
    setIsLoading(true)
    try {
      if (editingId) {
        const res = await fetch('/api/expenses', {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            id: editingId,
            title: form.title,
            amount: Number(form.amount),
            category: finalCategory,
            date: form.date,
            type: form.type,
            debtId: form.type === 'expense' && form.category === 'Trả nợ' ? form.debtId || '' : ''
          })
        })

        if (res.ok) {
          cancelEdit()
          await fetchItems()
          if (!skipNotification) showNotification('✅ Cập nhật thành công!', 'success')
        }
      } else {
        const res = await fetch('/api/expenses', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            title: form.title,
            amount: Number(form.amount),
            category: finalCategory,
            date: form.date,
            type: form.type,
            debtId: form.type === 'expense' && form.category === 'Trả nợ' ? form.debtId || '' : ''
          })
        })

        if (res.ok) {
          setForm({
            title: '',
            amount: '',
            category: 'Ăn uống',
            date: new Date().toISOString().split('T')[0],
            type: 'expense',
            customCategory: ''
          })
          await fetchItems()
          if (!skipNotification) showNotification('✅ Đã thêm giao dịch!', 'success')
        }
      }
    } catch (error) {
      console.error('Save error:', error)
      showNotification('❌ Có lỗi xảy ra!', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleWarningConfirm() {
    setShowWarningModal(false)
    if (pendingExpense) {
      await saveExpense(pendingExpense.category)
      setPendingExpense(null)
      setWarningData(null)
    }
  }

  function handleWarningEdit() {
    setShowWarningModal(false)
    showNotification('💡 Hãy điều chỉnh số tiền phù hợp', 'info')
  }

  const summary = computeFinanceSummary(items, [])
  const expenses = summary.expenseItems
  const totalExpense = summary.totalExpense
  const totalIncome = summary.totalIncome
  const balance = summary.balance

  const categoryBreakdown = expenses.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + (item.amount || 0)
    return acc
  }, {})
  const topCategory = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Chưa có dữ liệu'

  const filteredItems = useMemo(
    () => items
      .filter(item => typeFilter === 'all' || item.type === typeFilter)
      .filter(item => filter === 'all' || item.category === filter)
      .filter(item => item.title?.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [items, typeFilter, filter, searchTerm]
  )

  const incomePercent = summary.incomePercent
  const expensePercent = summary.expensePercent

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1326] text-[#dae2fd]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#b8c3ff]" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1326] text-[#dae2fd]">
        <Link href="/auth" className="px-6 py-3 rounded-xl bg-[#2e5bff] font-semibold">Đăng nhập</Link>
      </div>
    )
  }

  return (
    <>
    <AppShell
      title="Quản lý Tài chính"
      activeMenu="expenses"
      primaryActionLabel="Thêm Giao Dịch"
      onPrimaryAction={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      session={session}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      searchPlaceholder="Tìm kiếm giao dịch..."
      headerTabs={(
        <>
          <button className="text-[#b8c3ff] border-b-2 border-[#b8c3ff] pb-1 text-sm font-medium">Cá nhân</button>
          <button className="text-[#dae2fd]/60 hover:text-[#dae2fd] text-sm font-medium">Doanh nghiệp</button>
          <button className="text-[#dae2fd]/60 hover:text-[#dae2fd] text-sm font-medium">Đầu tư</button>
        </>
      )}
      rightActions={(
        <div className="flex items-center gap-2">
          <button className="p-2 text-[#dae2fd]/60 hover:bg-[#2d3449]/50 rounded-full"><span className="material-symbols-outlined">notifications</span></button>
          <button className="p-2 text-[#dae2fd]/60 hover:bg-[#2d3449]/50 rounded-full"><span className="material-symbols-outlined">settings</span></button>
        </div>
      )}
    >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <SummaryCard icon="account_balance" label="Số dư khả dụng" value={balance} valueColor="text-[#dae2fd]" trend="+2.4% tháng này" trendColor="text-[#4edea3]" />
          <SummaryCard icon="arrow_downward" label="Tổng thu nhập" value={totalIncome} valueColor="text-[#4edea3]" progress={incomePercent} progressColor="bg-[#4edea3]" />
          <SummaryCard icon="arrow_upward" label="Tổng chi tiêu" value={totalExpense} valueColor="text-[#ffb3b6]" progress={expensePercent} progressColor="bg-[#ffb3b6]" />
          <div className="p-6 rounded-3xl bg-[#171f33] shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-2xl bg-[#a388ff]/10 text-[#a388ff]">
                <span className="material-symbols-outlined">category</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8e90a2]">Hạng mục chính</span>
            </div>
            <h3 className="text-2xl font-bold">{topCategory}</h3>
            <p className="text-sm text-[#8e90a2] mt-1">{Math.round((categoryBreakdown[topCategory] || 0) * 100 / (totalExpense || 1))}% chi tiêu</p>
            <div className="mt-4 flex -space-x-2">
              <div className="h-8 w-8 rounded-full border-2 border-[#0b1326] bg-[#2d3449] flex items-center justify-center">
                <span className="material-symbols-outlined text-xs">restaurant</span>
              </div>
              <div className="h-8 w-8 rounded-full border-2 border-[#0b1326] bg-[#2d3449] flex items-center justify-center">
                <span className="material-symbols-outlined text-xs">shopping_bag</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <div className="bg-[rgba(45,52,73,0.6)] backdrop-blur-[20px] rounded-[2rem] p-8 shadow-2xl border border-[#434656]/20">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                  <h2 className="text-xl font-bold">Lịch sử giao dịch</h2>
                  <p className="text-sm text-[#8e90a2]">Dưới đây là các giao dịch gần nhất của bạn</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-4 py-2 bg-[#222a3d] rounded-xl text-xs font-semibold border-none"
                  >
                    <option value="all">Tất cả loại</option>
                    <option value="expense">Khoản chi</option>
                    <option value="income">Khoản thu</option>
                  </select>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-4 py-2 bg-[#222a3d] rounded-xl text-xs font-semibold border-none"
                  >
                    <option value="all">Tất cả danh mục</option>
                    {[...new Set(items.map(item => item.category))].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8 text-[#8e90a2]">Đang tải dữ liệu...</div>
                ) : filteredItems.length === 0 ? (
                  <div className="text-center py-8 text-[#8e90a2]">Chưa có giao dịch nào phù hợp.</div>
                ) : (
                  filteredItems.map(item => {
                    const isIncome = item.type === 'income'
                    return (
                      <div key={item.id} className="group relative flex items-center justify-between p-4 rounded-2xl hover:bg-[#222a3d] transition-all">
                        <div className="flex items-center gap-4">
                          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${isIncome ? 'bg-[#4edea3]/10 text-[#4edea3]' : 'bg-[#ffb3b6]/10 text-[#ffb3b6]'}`}>
                            <span className="material-symbols-outlined">{categoryIconMap[item.category] || 'receipt_long'}</span>
                          </div>
                          <div>
                            <p className="font-bold group-hover:text-[#b8c3ff] transition-colors">{item.title}</p>
                            <p className="text-xs text-[#8e90a2]">{new Date(item.date).toLocaleDateString('vi-VN')} • {item.category}</p>
                          </div>
                        </div>

                        <div className="text-right flex items-center gap-3">
                          <div>
                            <p className={`font-bold ${isIncome ? 'text-[#4edea3]' : 'text-[#ffb3b6]'}`}>
                              {isIncome ? '+' : '-'} {Number(item.amount || 0).toLocaleString('vi-VN')}đ
                            </p>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${item.status === 'pending' ? 'bg-[#8e90a2]/10 text-[#8e90a2]' : 'bg-[#4edea3]/10 text-[#4edea3]'}`}>
                              {item.status === 'pending' ? 'Đang chờ' : 'Hoàn tất'}
                            </span>
                          </div>

                          <button onClick={() => editItem(item)} className="p-2 rounded-lg hover:bg-[#2d3449]">
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button onClick={() => setShowDeleteConfirm(item.id)} className="p-2 rounded-lg hover:bg-[#2d3449] text-[#ffb3b6]">
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>

                        {showDeleteConfirm === item.id && (
                          <div className="absolute z-20 right-2 top-[calc(100%+8px)] p-3 rounded-lg shadow-lg border border-[#434656] min-w-[280px] bg-[#171f33]">
                            <p className="text-sm font-medium mb-3">Xác nhận xóa giao dịch</p>
                            <textarea
                              value={deleteReason}
                              onChange={(e) => setDeleteReason(e.target.value)}
                              placeholder="Nhập lý do xóa..."
                              className="w-full px-2 py-1 text-xs border border-[#434656] rounded resize-none bg-[#060e20]"
                              rows={2}
                              maxLength={200}
                            />
                            <div className="flex gap-2 mt-2">
                              <button onClick={() => deleteItem(item.id)} disabled={!deleteReason.trim() || isLoading} className="flex-1 px-3 py-1.5 text-xs rounded bg-[#ffb3b6] text-[#690005] font-semibold disabled:opacity-50">Xóa</button>
                              <button onClick={() => { setShowDeleteConfirm(null); setDeleteReason('') }} className="flex-1 px-3 py-1.5 text-xs rounded border border-[#434656]">Hủy</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-[rgba(45,52,73,0.6)] backdrop-blur-[20px] rounded-[2rem] p-8 shadow-2xl border border-[#434656]/20 sticky top-24">
              <h2 className="text-xl font-bold mb-6">{editingId ? 'Cập nhật giao dịch' : 'Thêm giao dịch mới'}</h2>

              <div className="space-y-5">
                <div className="flex p-1 bg-[#060e20] rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, type: 'expense', category: 'Ăn uống' }))}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${form.type === 'expense' ? 'bg-[#222a3d] text-[#dae2fd]' : 'text-[#8e90a2]'}`}
                  >
                    KHOẢN CHI
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, type: 'income', category: 'Lương' }))}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${form.type === 'income' ? 'bg-[#222a3d] text-[#dae2fd]' : 'text-[#8e90a2]'}`}
                  >
                    KHOẢN THU
                  </button>
                </div>

                <Field label="Tên giao dịch">
                  <input
                    className="w-full bg-[#060e20] border-none rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-[#b8c3ff]/40"
                    placeholder="VD: Mua sắm quần áo"
                    value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    type="text"
                  />
                </Field>

                <Field label="Số tiền (VND)">
                  <input
                    className="w-full bg-[#060e20] border-none rounded-xl py-3 px-4 text-xl font-bold focus:ring-1 focus:ring-[#b8c3ff]/40"
                    placeholder="0"
                    value={formatAmountInput(form.amount)}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/\D/g, '')
                      setForm(prev => ({ ...prev, amount: rawValue }))
                    }}
                    inputMode="numeric"
                    type="text"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Hạng mục">
                    <select
                      className="w-full bg-[#060e20] border-none rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-[#b8c3ff]/40"
                      value={form.category}
                      onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value, customCategory: '' }))}
                    >
                      {(form.type === 'expense' ? [...Object.keys(expenseCategories), 'Trả nợ'] : Object.keys(incomeCategories)).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Ngày">
                    <input
                      className="w-full bg-[#060e20] border-none rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-[#b8c3ff]/40"
                      value={form.date}
                      onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
                      type="date"
                    />
                  </Field>
                </div>

                {form.category === 'Khác' && (
                  <Field label="Danh mục khác">
                    <input
                      className="w-full bg-[#060e20] border-none rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-[#b8c3ff]/40"
                      placeholder="VD: Quà tặng"
                      value={form.customCategory}
                      onChange={(e) => setForm(prev => ({ ...prev, customCategory: e.target.value }))}
                      type="text"
                    />
                  </Field>
                )}

                {form.type === 'expense' && form.category === 'Trả nợ' && (
                  <Field label="Khoản vay cần trả">
                    <select
                      className="w-full bg-[#060e20] border-none rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-[#b8c3ff]/40"
                      value={form.debtId}
                      onChange={(e) => setForm(prev => ({ ...prev, debtId: e.target.value }))}
                    >
                      <option value="">-- Chọn khoản vay --</option>
                      {debts.filter(d => d.status === 'i-owe').map(debt => (
                        <option key={debt.id} value={debt.id}>{debt.person} • {Number(debt.amount || 0).toLocaleString('vi-VN')}₫</option>
                      ))}
                    </select>
                  </Field>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={add}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-br from-[#b8c3ff] to-[#2e5bff] text-[#001356] py-4 rounded-2xl font-bold text-sm tracking-wider uppercase shadow-xl shadow-[#2e5bff]/20 disabled:opacity-60"
                    type="button"
                  >
                    {isLoading ? 'Đang xử lý...' : editingId ? 'Lưu thay đổi' : 'Xác nhận giao dịch'}
                  </button>
                  {editingId && (
                    <button onClick={cancelEdit} className="px-4 rounded-2xl border border-[#434656]" type="button">
                      Hủy
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
    </AppShell>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
          duration={notification.duration}
        />
      )}

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
    </>
  )
}

function SummaryCard({ icon, label, value, valueColor, trend, trendColor, progress, progressColor }) {
  return (
    <div className="relative overflow-hidden p-6 rounded-3xl bg-[#171f33] shadow-xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#b8c3ff]/10 rounded-full -mr-16 -mt-16 blur-3xl" />
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-2xl bg-[#b8c3ff]/20 text-[#b8c3ff]">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#8e90a2]">{label}</span>
      </div>
      <h3 className={`text-3xl font-bold ${valueColor}`}>{Number(value || 0).toLocaleString('vi-VN')}</h3>
      <p className="text-sm text-[#8e90a2] mt-1">VND</p>

      {typeof progress === 'number' && (
        <div className="mt-4 h-1.5 w-full bg-[#2d3449] rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${progressColor}`} style={{ width: `${progress}%` }} />
        </div>
      )}

      {trend && (
        <div className={`mt-4 flex items-center gap-2 text-xs font-semibold ${trendColor}`}>
          <span className="material-symbols-outlined text-sm">trending_up</span>
          <span>{trend}</span>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-widest text-[#8e90a2] ml-1">{label}</label>
      {children}
    </div>
  )
}
