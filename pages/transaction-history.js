import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import AppShell from '../components/layout/AppShell'
import Notification, { useNotification } from '../components/Notification'
import { computeFinanceSummary } from '../lib/financeSummary'

const categoryIconMap = {
  'Ăn uống': 'restaurant',
  'Di chuyển': 'commute',
  'Giải trí': 'sports_esports',
  'Mua sắm': 'shopping_bag',
  'Sức khỏe': 'medical_services',
  'Học tập': 'school',
  'Hóa đơn': 'receipt_long',
  'Lương': 'payments',
  'Thưởng': 'redeem',
  'Đầu tư': 'monitoring',
  'Kinh doanh': 'business_center',
  'Khác': 'grid_view',
  'Cho vay': 'account_balance',
  'Đi vay': 'credit_card'
}

export default function TransactionHistory() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { notification, showNotification, hideNotification } = useNotification()

  const [expenses, setExpenses] = useState([])
  const [debts, setDebts] = useState([])
  const [loading, setLoading] = useState(true)

  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth')
      return
    }
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status])

  async function fetchData() {
    setLoading(true)
    try {
      const [expensesRes, debtsRes] = await Promise.all([fetch('/api/expenses'), fetch('/api/debts')])
      const expensesData = await expensesRes.json()
      const debtsData = await debtsRes.json()
      setExpenses(expensesData.items || expensesData.notes || [])
      setDebts(debtsData.items || debtsData.notes || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      showNotification('Lỗi khi tải dữ liệu', 'error')
    } finally {
      setLoading(false)
    }
  }

  const allTransactions = useMemo(() => {
    const merged = []

    expenses.forEach(expense => {
      merged.push({ ...expense, transactionType: expense.type || 'expense', source: 'expense' })
    })

    debts.forEach(debt => {
      merged.push({
        id: debt.id,
        title: `${debt.status === 'owed-to-me' ? 'Cho vay' : 'Đi vay'}: ${debt.person}`,
        amount: debt.amount,
        category: debt.status === 'owed-to-me' ? 'Cho vay' : 'Đi vay',
        date: debt.date,
        transactionType: 'debt',
        source: 'debt',
        person: debt.person,
        status: debt.status
      })
    })

    return merged.sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [expenses, debts])

  const filteredTransactions = useMemo(
    () =>
      allTransactions.filter(transaction => {
        if (dateFrom && transaction.date < dateFrom) return false
        if (dateTo && transaction.date > dateTo) return false
        if (typeFilter !== 'all' && transaction.transactionType !== typeFilter) return false

        if (searchTerm) {
          const q = searchTerm.toLowerCase()
          return (
            String(transaction.title || '').toLowerCase().includes(q) ||
            String(transaction.category || '').toLowerCase().includes(q) ||
            String(transaction.person || '').toLowerCase().includes(q)
          )
        }

        return true
      }),
    [allTransactions, dateFrom, dateTo, typeFilter, searchTerm]
  )

  const summary = useMemo(() => {
    const txItems = filteredTransactions
      .filter(t => t.source === 'expense')
      .map(t => ({ type: t.transactionType, amount: t.amount }))

    const debtItems = filteredTransactions
      .filter(t => t.source === 'debt')
      .map(t => ({ status: t.status, amount: t.amount }))

    const base = computeFinanceSummary(txItems, debtItems)
    return {
      income: base.totalIncome,
      expense: base.totalExpense,
      debtFlow: base.debtFlow,
      savings: base.balance
    }
  }, [filteredTransactions])

  const monthlyFlow = useMemo(() => {
    const now = new Date()
    const data = {}
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      data[d.toISOString().slice(0, 7)] = { income: 0, expense: 0 }
    }

    allTransactions.forEach(tx => {
      const key = tx.date?.slice(0, 7)
      if (!key || !data[key]) return
      if (tx.transactionType === 'income') data[key].income += Number(tx.amount) || 0
      if (tx.transactionType === 'expense') data[key].expense += Number(tx.amount) || 0
    })

    return data
  }, [allTransactions])

  const flowKeys = Object.keys(monthlyFlow)
  const maxFlow = Math.max(1, ...Object.values(monthlyFlow).flatMap(m => [m.income, m.expense]))

  const categoryBreakdown = useMemo(() => {
    const map = {}
    filteredTransactions
      .filter(t => t.transactionType === 'expense')
      .forEach(t => {
        map[t.category] = (map[t.category] || 0) + (t.amount || 0)
      })
    const total = Object.values(map).reduce((a, b) => a + b, 0)
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, value]) => ({ name, value, percent: total > 0 ? Math.round((value / total) * 100) : 0 }))
  }, [filteredTransactions])

  const formatCurrency = (amount) => `${Number(amount || 0).toLocaleString('vi-VN')} ₫`

  const getAmountUI = tx => {
    if (tx.transactionType === 'income') return { sign: '+', cls: 'text-[#4edea3]' }
    if (tx.transactionType === 'debt') return tx.status === 'owed-to-me' ? { sign: '+', cls: 'text-[#b8c3ff]' } : { sign: '-', cls: 'text-[#ffb3b6]' }
    return { sign: '-', cls: 'text-[#ffb3b6]' }
  }

  if (status === 'loading') {
    return <div className="min-h-screen bg-[#0b1326] text-[#dae2fd] flex items-center justify-center">Đang tải...</div>
  }

  if (!session) return null

  return (
    <>
      <AppShell
        title="Báo cáo Tài chính Chuyên sâu"
        activeMenu="reports"
        session={session}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchPlaceholder="Tìm theo tên, danh mục..."
        primaryActionLabel="Xuất PDF"
        onPrimaryAction={() => showNotification('Tính năng xuất PDF đang được kết nối API', 'info')}
        headerTabs={
          <>
            <button className="text-[#dae2fd]/60 hover:text-[#b8c3ff] text-sm">Dashboard</button>
            <button className="text-[#b8c3ff] border-b-2 border-[#2e5bff] pb-1 text-sm">Analytics</button>
            <button className="text-[#dae2fd]/60 hover:text-[#b8c3ff] text-sm">Forecasting</button>
            <button className="text-[#dae2fd]/60 hover:text-[#b8c3ff] text-sm">Vault</button>
          </>
        }
        rightActions={
          <div className="flex items-center gap-2">
            <button className="p-2 text-[#dae2fd]/60 hover:bg-[#2d3449]/50 rounded-full"><span className="material-symbols-outlined">notifications</span></button>
            <button className="p-2 text-[#dae2fd]/60 hover:bg-[#2d3449]/50 rounded-full"><span className="material-symbols-outlined">settings</span></button>
          </div>
        }
      >
        <section className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2 uppercase">Báo cáo Tài chính</h1>
            <p className="text-[#c4c5d9] max-w-md">Phân tích chuyên sâu về sức khỏe tài chính và dòng tiền của bạn với sự hỗ trợ từ AI.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bg-[#060e20] border border-[#434656]/20 rounded-xl px-3 py-2 text-sm" />
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="bg-[#060e20] border border-[#434656]/20 rounded-xl px-3 py-2 text-sm" />
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="bg-[#060e20] border border-[#434656]/20 rounded-xl px-3 py-2 text-sm">
              <option value="all">Tất cả</option>
              <option value="expense">Chi tiêu</option>
              <option value="income">Thu nhập</option>
              <option value="debt">Nợ</option>
            </select>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <SummaryCard icon="trending_up" label="Tổng Thu nhập" value={summary.income} trend="+12.4%" color="text-[#4edea3]" />
          <SummaryCard icon="payments" label="Tổng Chi tiêu" value={summary.expense} trend="+4.2%" color="text-[#ffb3b6]" />
          <SummaryCard icon="savings" label="Tiết kiệm" value={summary.savings} trend="+8.1%" color="text-[#b8c3ff]" />
          <SummaryCard icon="monitoring" label="Dòng tiền nợ" value={Math.abs(summary.debtFlow)} trend="+15.7%" color={summary.debtFlow >= 0 ? 'text-[#4edea3]' : 'text-[#ffb3b6]'} />
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">
          <div className="xl:col-span-2 bg-[rgba(45,52,73,0.6)] backdrop-blur-[20px] p-8 rounded-3xl border border-[#434656]/10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-xl font-bold mb-1">Xu hướng Dòng tiền</h2>
                <p className="text-[#c4c5d9] text-xs">So sánh thu nhập & chi tiêu trong 6 tháng gần nhất</p>
              </div>
            </div>
            <div className="h-72 flex items-end gap-3">
              {flowKeys.map((key, i) => {
                const incomeH = Math.max(8, (monthlyFlow[key].income / maxFlow) * 95)
                const expenseH = Math.max(8, (monthlyFlow[key].expense / maxFlow) * 95)
                const monthLabel = `T${new Date(`${key}-01`).getMonth() + 1}`
                return (
                  <div key={`bar-${key}`} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex items-end gap-1 h-48">
                      <div className="flex-1 bg-[#4edea3]/40 rounded-t-lg" style={{ height: `${incomeH}%` }} />
                      <div className="flex-1 bg-[#ffb3b6]/40 rounded-t-lg" style={{ height: `${expenseH}%` }} />
                    </div>
                    <span className={`text-[10px] font-bold ${i === flowKeys.length - 1 ? 'text-[#dae2fd]' : 'text-[#c4c5d9]'}`}>{monthLabel}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-[#2e5bff]/10 p-8 rounded-3xl border border-[#b8c3ff]/20">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-[#b8c3ff]">psychology</span>
              <h3 className="text-lg font-bold">Insight AI Thông minh</h3>
            </div>
            <p className="text-sm text-[#c4c5d9] leading-relaxed">Bạn đang chi tiêu mạnh ở nhóm đứng đầu. Nếu giảm 10% nhóm không thiết yếu, bạn có thể tăng tốc mục tiêu tiết kiệm theo quý.</p>
            <button className="mt-8 w-full py-3 bg-[#222a3d] border border-[#434656]/30 rounded-xl text-xs font-bold uppercase tracking-widest">Xem chi tiết phân tích AI</button>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <div className="bg-[rgba(45,52,73,0.6)] backdrop-blur-[20px] p-8 rounded-3xl border border-[#434656]/10">
            <h2 className="text-xl font-bold mb-6">Phân bổ Chi tiêu</h2>
            <div className="space-y-4">
              {(categoryBreakdown.length ? categoryBreakdown : [{ name: 'Chưa có dữ liệu', value: 0, percent: 0 }]).map((c, idx) => (
                <div key={`${c.name}-${idx}`} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#c4c5d9]">{c.name}</span>
                    <span className="font-bold">{c.percent}%</span>
                  </div>
                  <div className="h-1.5 bg-[#060e20] rounded-full overflow-hidden">
                    <div className="h-full bg-[#4edea3] rounded-full" style={{ width: `${c.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[rgba(45,52,73,0.6)] backdrop-blur-[20px] p-8 rounded-3xl border border-[#434656]/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Dự báo Số dư (3 tháng)</h2>
              <span className="text-[10px] font-bold bg-[#b8c3ff]/10 text-[#b8c3ff] px-3 py-1 rounded-full">PROJECTION</span>
            </div>
            <div className="h-44 flex items-end gap-2 mb-4">
              {[32, 40, 35, 48, 58, 66].map((v, i) => (
                <div key={`fc-${i}`} className="flex-1 bg-[#b8c3ff]/30 rounded-t-lg" style={{ height: `${v}%` }} />
              ))}
            </div>
            <p className="text-xs text-[#c4c5d9]">Dựa trên dữ liệu hiện tại, số dư có xu hướng tích cực nếu duy trì tỷ lệ tiết kiệm hiện tại.</p>
          </div>
        </section>

        <section className="bg-[rgba(45,52,73,0.6)] backdrop-blur-[20px] rounded-3xl border border-[#434656]/10 overflow-hidden">
          <div className="p-6 border-b border-[#434656]/10 flex justify-between items-center bg-[#131b2e]/50">
            <h2 className="text-xl font-bold tracking-tight">Thống kê Chi tiết theo Giao dịch</h2>
            <button className="text-xs font-bold text-[#b8c3ff] flex items-center gap-2">XEM TOÀN BỘ <span className="material-symbols-outlined text-sm">arrow_forward</span></button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#060e20]/50 text-[10px] font-bold text-[#c4c5d9] uppercase tracking-widest">
                  <th className="px-6 py-4">Ngày</th>
                  <th className="px-6 py-4">Hạng mục</th>
                  <th className="px-6 py-4">Mô tả</th>
                  <th className="px-6 py-4">Loại</th>
                  <th className="px-6 py-4 text-right">Số tiền</th>
                  <th className="px-6 py-4">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#434656]/10">
                {loading ? (
                  <tr><td colSpan="6" className="px-6 py-8 text-center text-[#8e90a2]">Đang tải dữ liệu...</td></tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-8 text-center text-[#8e90a2]">Không có giao dịch phù hợp.</td></tr>
                ) : (
                  filteredTransactions.map((tx, idx) => {
                    const amountUI = getAmountUI(tx)
                    const typeText = tx.transactionType === 'expense' ? 'Chi tiêu' : tx.transactionType === 'income' ? 'Thu nhập' : 'Nợ'
                    return (
                      <tr key={`${tx.source}-${tx.id || idx}`} className="hover:bg-[#2d3449]/20 transition-colors">
                        <td className="px-6 py-5 font-semibold">{tx.date}</td>
                        <td className="px-6 py-5">
                          <div className="inline-flex items-center gap-2 text-sm">
                            <span className="material-symbols-outlined text-[#b8c3ff]">{categoryIconMap[tx.category] || 'grid_view'}</span>
                            <span>{tx.category}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-[#c4c5d9]">{tx.title}</td>
                        <td className="px-6 py-5 text-xs font-bold uppercase">{typeText}</td>
                        <td className={`px-6 py-5 text-right font-bold ${amountUI.cls}`}>{amountUI.sign}{formatCurrency(tx.amount)}</td>
                        <td className="px-6 py-5">
                          <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${tx.transactionType === 'expense' ? 'bg-[#ffb3b6]/10 text-[#ffb3b6]' : 'bg-[#4edea3]/10 text-[#4edea3]'}`}>
                            {tx.transactionType === 'expense' ? 'Cảnh báo' : 'Ổn định'}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </AppShell>

      {notification && <Notification message={notification.message} type={notification.type} onClose={hideNotification} duration={notification.duration} />}
    </>
  )
}

function SummaryCard({ icon, label, value, trend, color }) {
  return (
    <div className="bg-[rgba(45,52,73,0.6)] backdrop-blur-[20px] p-6 rounded-2xl border border-[#434656]/10">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-lg bg-current/10 flex items-center justify-center ${color}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${color} bg-current/10`}>{trend}</span>
      </div>
      <div className="text-[#c4c5d9] text-xs font-semibold uppercase tracking-widest mb-1">{label}</div>
      <div className="text-3xl font-bold">{Number(value || 0).toLocaleString('vi-VN')} ₫</div>
    </div>
  )
}
