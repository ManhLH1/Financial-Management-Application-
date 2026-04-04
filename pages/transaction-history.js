import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import AppShell from '../components/layout/AppShell'
import Notification, { useNotification } from '../components/Notification'

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
      setDebts(debtsData.notes || [])
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
      merged.push({
        ...expense,
        transactionType: expense.type || 'expense',
        source: 'expense'
      })
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
        status: debt.status,
        due: debt.due
      })
    })

    return merged.sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [expenses, debts])

  const filteredTransactions = useMemo(() => allTransactions.filter(transaction => {
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
  }), [allTransactions, dateFrom, dateTo, typeFilter, searchTerm])

  const summary = useMemo(() => {
    const income = filteredTransactions.filter(t => t.transactionType === 'income').reduce((sum, t) => sum + (t.amount || 0), 0)
    const expense = filteredTransactions.filter(t => t.transactionType === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0)
    const debt = filteredTransactions.filter(t => t.transactionType === 'debt').reduce((sum, t) => {
      if (t.status === 'owed-to-me') return sum + (t.amount || 0)
      return sum - (t.amount || 0)
    }, 0)
    const savings = income - expense
    return { income, expense, debt, savings }
  }, [filteredTransactions])

  const formatCurrency = (amount) => `${Number(amount || 0).toLocaleString('vi-VN')} ₫`

  const getAmountUI = (transaction) => {
    if (transaction.transactionType === 'income') return { sign: '+', cls: 'text-[#4edea3]' }
    if (transaction.transactionType === 'debt') {
      return transaction.status === 'owed-to-me'
        ? { sign: '+', cls: 'text-[#b8c3ff]' }
        : { sign: '-', cls: 'text-[#ffb3b6]' }
    }
    return { sign: '-', cls: 'text-[#ffb3b6]' }
  }

  if (status === 'loading') {
    return <div className="min-h-screen bg-[#0b1326] text-[#dae2fd] flex items-center justify-center">Đang tải...</div>
  }

  if (!session) return null

  return (
    <>
      <AppShell
        title="Báo cáo Tài chính"
        activeMenu="reports"
        session={session}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchPlaceholder="Tìm theo tên, danh mục..."
        primaryActionLabel="Xuất PDF"
        onPrimaryAction={() => showNotification('Tính năng xuất PDF sẽ được bổ sung API ở bước sau', 'info')}
        headerTabs={(
          <>
            <button className="text-[#dae2fd]/60 hover:text-[#b8c3ff] text-sm">Dashboard</button>
            <button className="text-[#b8c3ff] border-b-2 border-[#2e5bff] pb-1 text-sm">Analytics</button>
            <button className="text-[#dae2fd]/60 hover:text-[#b8c3ff] text-sm">Forecasting</button>
            <button className="text-[#dae2fd]/60 hover:text-[#b8c3ff] text-sm">Vault</button>
          </>
        )}
        rightActions={(
          <div className="flex items-center gap-2">
            <button className="p-2 text-[#dae2fd]/60 hover:bg-[#2d3449]/50 rounded-full"><span className="material-symbols-outlined">notifications</span></button>
            <button className="p-2 text-[#dae2fd]/60 hover:bg-[#2d3449]/50 rounded-full"><span className="material-symbols-outlined">settings</span></button>
          </div>
        )}
      >
        <section className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2 uppercase">Báo cáo Tài chính</h1>
            <p className="text-[#c4c5d9] max-w-md">Phân tích chuyên sâu về sức khỏe tài chính và dòng tiền của bạn với hỗ trợ AI.</p>
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
          <SummaryCard icon="monitoring" label="Dòng tiền nợ" value={Math.abs(summary.debt)} trend="+15.7%" color={summary.debt >= 0 ? 'text-[#4edea3]' : 'text-[#ffb3b6]'} />
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">
          <div className="xl:col-span-2 bg-[rgba(45,52,73,0.6)] backdrop-blur-[20px] p-8 rounded-3xl border border-[#434656]/10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-xl font-bold mb-1">Xu hướng Dòng tiền</h2>
                <p className="text-[#c4c5d9] text-xs">So sánh thu nhập & chi tiêu 6 tháng gần nhất</p>
              </div>
            </div>
            <div className="h-72 flex items-end gap-3">
              {Array.from({ length: 6 }).map((_, i) => {
                const incomeH = 55 + i * 7
                const expenseH = 35 + i * 4
                return (
                  <div key={`bar-${i}`} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex items-end gap-1 h-48">
                      <div className="flex-1 bg-[#4edea3]/40 rounded-t-lg" style={{ height: `${Math.min(incomeH, 95)}%` }} />
                      <div className="flex-1 bg-[#ffb3b6]/40 rounded-t-lg" style={{ height: `${Math.min(expenseH, 90)}%` }} />
                    </div>
                    <span className="text-[10px] text-[#c4c5d9] font-bold">T{i + 1}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-[#2e5bff]/10 p-8 rounded-3xl border border-[#b8c3ff]/20">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-[#b8c3ff]">psychology</span>
              <h3 className="text-lg font-bold">Insight AI</h3>
            </div>
            <p className="text-sm text-[#c4c5d9] leading-relaxed mb-4">Tỷ trọng chi cho nhóm ăn uống đang cao hơn mức khuyến nghị. Nếu giảm 10% nhóm không thiết yếu, bạn có thể tăng tiết kiệm đáng kể trong quý tới.</p>
            <button className="w-full py-3 bg-[#222a3d] border border-[#434656]/30 rounded-xl text-xs font-bold uppercase tracking-widest">Xem chi tiết phân tích AI</button>
          </div>
        </section>

        <section className="bg-[rgba(45,52,73,0.6)] backdrop-blur-[20px] rounded-3xl border border-[#434656]/10 overflow-hidden">
          <div className="p-6 border-b border-[#434656]/10 flex justify-between items-center bg-[#131b2e]/50">
            <h2 className="text-xl font-bold tracking-tight">Lịch sử giao dịch chi tiết</h2>
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
                  <tr><td colSpan="6" className="px-6 py-8 text-center text-[#8e90a2]">Không có giao dịch nào phù hợp.</td></tr>
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
                          <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${tx.transactionType === 'debt' ? 'bg-[#b8c3ff]/10 text-[#b8c3ff]' : 'bg-[#4edea3]/10 text-[#4edea3]'}`}>
                            {tx.transactionType === 'debt' && tx.status === 'borrowed' ? 'Cảnh báo' : 'Ổn định'}
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

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
          duration={notification.duration}
        />
      )}
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
