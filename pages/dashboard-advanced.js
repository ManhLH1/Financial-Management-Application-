import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import AppShell from '../components/layout/AppShell'
import { computeFinanceSummary } from '../lib/financeSummary'

const translations = {
  vi: {
    privateBanking: 'Private Banking',
    overview: 'Tổng quan',
    wallet: 'Ví',
    budgets: 'Ngân sách',
    reports: 'Báo cáo',
    settings: 'Cài đặt',
    newTransaction: 'Giao dịch mới',
    searchPlaceholder: 'Tìm kiếm giao dịch hoặc báo cáo...',
    headerTagline: 'Trí tuệ Tài chính Biên tập',
    premiumMember: 'Premium Member',
    totalAssets: 'TỔNG TÀI SẢN HIỆN TẠI',
    comparedLastMonth: 'so với tháng trước',
    totalIncome: 'Tổng Thu Nhập',
    totalExpense: 'Tổng Chi Tiêu',
    aiAnalysis: 'Phân tích từ AI',
    aiDetail: 'Xem chi tiết phân tích',
    expenseTx: 'Giao dịch chi',
    incomeTx: 'Giao dịch thu',
    debt: 'Khoản nợ',
    savings: 'Tiết kiệm',
    expense: 'Expense',
    income: 'Income',
    debtBadge: 'Debt',
    savingsBadge: 'Savings',
    cashflow: 'Xu hướng dòng tiền',
    sixMonths: 'Dữ liệu 6 tháng gần nhất',
    incomeLegend: 'Thu nhập',
    expenseLegend: 'Chi tiêu',
    spendingAllocation: 'Phân bổ chi tiêu',
    month: 'Tháng',
    noData: 'Chưa có dữ liệu',
    recentTransactions: 'Giao dịch gần đây',
    viewAll: 'Xem tất cả lịch sử',
    categoryNote: 'Danh mục & Ghi chú',
    date: 'Ngày thực hiện',
    amount: 'Số tiền',
    status: 'Trạng thái',
    completed: 'Hoàn tất',
    pending: 'Đang chờ',
    emptyTx: 'Chưa có giao dịch trong khoảng thời gian đã chọn.',
    logout: 'Đăng xuất',
    helpCenter: 'Trung tâm trợ giúp',
    terms: 'Điều khoản dịch vụ',
    privacy: 'Chính sách bảo mật',
    footerBrand: 'TRÍ TUỆ TÀI CHÍNH BIÊN TẬP',
    user: 'Người dùng',
    overBudgetPart1: 'Bạn đang có',
    overBudgetPart2: 'giao dịch chi trong kỳ.',
    overBudgetWarning: 'ngân sách đang gần chạm ngưỡng cảnh báo, ưu tiên kiểm soát nhóm chi lớn nhất.',
    overBudgetNormal: 'Mức chi hiện ổn định so với ngân sách đã đặt.'
  },
  en: {
    privateBanking: 'Private Banking',
    overview: 'Overview',
    wallet: 'Wallet',
    budgets: 'Budgets',
    reports: 'Reports',
    settings: 'Settings',
    newTransaction: 'New transaction',
    searchPlaceholder: 'Search transactions or reports...',
    headerTagline: 'Curated Financial Intelligence',
    premiumMember: 'Premium Member',
    totalAssets: 'TOTAL CURRENT ASSETS',
    comparedLastMonth: 'vs last month',
    totalIncome: 'Total Income',
    totalExpense: 'Total Expense',
    aiAnalysis: 'AI Analysis',
    aiDetail: 'View detailed analysis',
    expenseTx: 'Expense transactions',
    incomeTx: 'Income transactions',
    debt: 'Debt',
    savings: 'Savings',
    expense: 'Expense',
    income: 'Income',
    debtBadge: 'Debt',
    savingsBadge: 'Savings',
    cashflow: 'Cashflow trend',
    sixMonths: 'Last 6 months',
    incomeLegend: 'Income',
    expenseLegend: 'Expense',
    spendingAllocation: 'Spending allocation',
    month: 'Month',
    noData: 'No data',
    recentTransactions: 'Recent transactions',
    viewAll: 'View full history',
    categoryNote: 'Category & Note',
    date: 'Date',
    amount: 'Amount',
    status: 'Status',
    completed: 'Completed',
    pending: 'Pending',
    emptyTx: 'No transactions in selected date range.',
    logout: 'Sign out',
    helpCenter: 'Help Center',
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
    footerBrand: 'CURATED FINANCIAL INTELLIGENCE',
    user: 'User',
    overBudgetPart1: 'You have',
    overBudgetPart2: 'expense transactions in this period.',
    overBudgetWarning: 'budgets are near warning threshold, prioritize highest spending groups.',
    overBudgetNormal: 'Your spending is currently stable against budgets.'
  }
}

export default function AdvancedDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [expenses, setExpenses] = useState([])
  const [debts, setDebts] = useState([])
  const [budgets, setBudgets] = useState([])
  const [lastFetchTime, setLastFetchTime] = useState(0)
  const [language, setLanguage] = useState('vi')

  const [dateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })

  const t = translations[language] || translations.vi

  useEffect(() => {
    document.documentElement.classList.add('dark')
    const savedLanguage = localStorage.getItem('app_language')
    if (savedLanguage === 'vi' || savedLanguage === 'en') setLanguage(savedLanguage)

    const cachedExpenses = localStorage.getItem('expenses_cache')
    const cachedDebts = localStorage.getItem('debts_cache')
    const cachedTimestamp = localStorage.getItem('data_cache_timestamp')

    if (cachedExpenses && cachedDebts) {
      const timestamp = parseInt(cachedTimestamp || '0', 10)
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        setExpenses(JSON.parse(cachedExpenses))
        setDebts(JSON.parse(cachedDebts))
        setLastFetchTime(timestamp)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('app_language', language)
  }, [language])

  useEffect(() => {
    if (!session) return
    if (Date.now() - lastFetchTime > 5 * 60 * 1000) {
      fetchMainData()
      fetchBudgets()
    }
  }, [session])

  async function fetchMainData() {
    try {
      const [expRes, debtRes] = await Promise.all([fetch('/api/expenses'), fetch('/api/debts')])
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

  async function fetchBudgets() {
    try {
      const res = await fetch('/api/budgets')
      const data = await res.json()
      setBudgets(data.items || data.budgets || [])
    } catch (error) {
      console.error('Error fetching budgets:', error)
    }
  }

  const filteredExpenses = useMemo(
    () => expenses.filter(e => e.date && e.date >= dateRange.startDate && e.date <= dateRange.endDate),
    [expenses, dateRange]
  )

  const statsSummary = computeFinanceSummary(expenses, debts)
  const stats = {
    totalExpense: statsSummary.totalExpense,
    totalIncome: statsSummary.totalIncome,
    totalDebtFlow: statsSummary.debtFlow,
    expenseCount: statsSummary.expenseCount,
    incomeCount: statsSummary.incomeCount,
    balance: statsSummary.balance,
    netWorthApprox: statsSummary.netWorthApprox
  }

  const budgetWarnings = budgets.map(budget => {
    const categoryExpenses = filteredExpenses
      .filter(e => e.type === 'expense' && e.category === budget.category)
      .reduce((sum, e) => sum + (e.amount || 0), 0)

    const percentage = budget.amount > 0 ? Number(((categoryExpenses / budget.amount) * 100).toFixed(1)) : 0
    return { ...budget, percentage }
  })

  const categoryData = {}
  filteredExpenses
    .filter(e => e.type === 'expense')
    .forEach(e => {
      const key = e.category || t.noData
      categoryData[key] = (categoryData[key] || 0) + (e.amount || 0)
    })

  const topCategories = Object.entries(categoryData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)

  const monthlyData = {}
  const now = new Date()
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    monthlyData[d.toISOString().slice(0, 7)] = { expense: 0, income: 0 }
  }

  expenses.forEach(e => {
    const month = e.date?.slice(0, 7)
    if (monthlyData[month]) {
      if (e.type === 'expense') monthlyData[month].expense += e.amount || 0
      if (e.type === 'income') monthlyData[month].income += e.amount || 0
    }
  })

  const monthKeys = Object.keys(monthlyData)
  const maxFlow = Math.max(1, ...Object.values(monthlyData).flatMap(m => [m.expense, m.income]))
  const savingsValue = Math.max(stats.balance, 0)
  const savingsRate = stats.totalIncome > 0 ? ((savingsValue / stats.totalIncome) * 100).toFixed(1) : '0.0'
  const budgetAlert = budgetWarnings.filter(b => b.percentage >= (b.alertThreshold || 80)).length

  const recentActivities = filteredExpenses.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)

  const formatMoney = value => {
    const locale = language === 'en' ? 'en-US' : 'vi-VN'
    const currency = language === 'en' ? 'USD' : 'VND'
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0
    }).format(value || 0)
  }

  const displayDate = date => {
    if (!date) return t.noData
    return new Date(date).toLocaleDateString(language === 'en' ? 'en-US' : 'vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1326] text-[#dae2fd]">
        <Link href="/auth" className="px-8 py-4 bg-[#2e5bff] rounded-2xl font-bold">
          Login
        </Link>
      </div>
    )
  }

  return (
    <AppShell
      title="Dashboard"
      activeMenu="overview"
      primaryActionLabel={t.newTransaction}
      onPrimaryAction={() => router.push('/transactions/new')}
      session={session}
      searchPlaceholder={t.searchPlaceholder}
      rightActions={(
        <div className="flex items-center gap-2">
          <button onClick={() => setLanguage(prev => (prev === 'vi' ? 'en' : 'vi'))} className="px-3 py-1.5 rounded-lg bg-[#2e5bff]/10 text-[#b8c3ff] font-bold text-xs">{language === 'vi' ? 'VI' : 'EN'}</button>
          <button className="p-2 text-[#dae2fd]/60 hover:bg-[#2d3449]/50 rounded-full"><span className="material-symbols-outlined">notifications</span></button>
          <button className="p-2 text-[#dae2fd]/60 hover:bg-[#2d3449]/50 rounded-full"><span className="material-symbols-outlined">settings</span></button>
        </div>
      )}
      headerTabs={<span className="text-[#c4c5d9] text-sm">{t.headerTagline}</span>}
    >
      <div className="space-y-10">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-[rgba(45,52,73,0.6)] backdrop-blur-[20px] border border-[#434656]/15 rounded-[2rem] p-10 relative overflow-hidden min-h-[340px] flex flex-col justify-between">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#2e5bff]/10 blur-[100px] rounded-full"></div>
            <div className="relative z-10">
              <p className="text-[0.75rem] font-semibold text-[#b8c3ff] uppercase tracking-[0.2em] mb-4">{t.totalAssets}</p>
              <h2 className="text-6xl font-bold tracking-tighter mb-2">{formatMoney(stats.netWorthApprox)}</h2>
              <div className="flex items-center gap-3 px-3 py-1 bg-[#4edea3]/10 border border-[#4edea3]/20 rounded-full w-fit">
                <span className="material-symbols-outlined text-[#4edea3] text-sm">trending_up</span>
                <span className="text-sm font-bold text-[#4edea3]">+{savingsRate}% {t.comparedLastMonth}</span>
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-2 gap-8 mt-12">
              <div className="space-y-1">
                <p className="text-[0.7rem] font-semibold text-[#c4c5d9]/60 uppercase tracking-widest">{t.totalIncome}</p>
                <span className="text-2xl font-bold text-[#4edea3] tracking-tight">{formatMoney(stats.totalIncome)}</span>
              </div>
              <div className="space-y-1">
                <p className="text-[0.7rem] font-semibold text-[#c4c5d9]/60 uppercase tracking-widest">{t.totalExpense}</p>
                <span className="text-2xl font-bold text-[#ffb3b6] tracking-tight">{formatMoney(stats.totalExpense)}</span>
              </div>
            </div>
          </div>

          <div className="bg-[rgba(45,52,73,0.6)] backdrop-blur-[20px] border border-[#434656]/15 rounded-[2rem] p-8 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-[#2e5bff]/20 rounded-xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[#b8c3ff]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              </div>
              <h3 className="text-xl font-bold mb-4">{t.aiAnalysis}</h3>
              <p className="text-[#c4c5d9] leading-relaxed">
                {t.overBudgetPart1} <span className="text-[#b8c3ff] font-bold">{stats.expenseCount}</span> {t.overBudgetPart2}{' '}
                {budgetAlert > 0 ? `${budgetAlert} ${t.overBudgetWarning}` : t.overBudgetNormal}
              </p>
            </div>
            <Link href="/budgets" className="mt-8 text-[#b8c3ff] text-sm font-bold flex items-center gap-2 hover:gap-3 transition-all">
              {t.aiDetail}
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon="payments" badge={t.expense} title={t.expenseTx} value={formatMoney(stats.totalExpense)} color="text-[#ffb3b6]" iconBg="bg-[#ffb3b6]/10" />
          <StatCard icon="account_balance" badge={t.income} title={t.incomeTx} value={formatMoney(stats.totalIncome)} color="text-[#4edea3]" iconBg="bg-[#4edea3]/10" />
          <StatCard icon="credit_card" badge={t.debtBadge} title={t.debt} value={formatMoney(Math.abs(stats.totalDebtFlow))} color={stats.totalDebtFlow >= 0 ? 'text-[#4edea3]' : 'text-orange-400'} iconBg={stats.totalDebtFlow >= 0 ? 'bg-[#4edea3]/10' : 'bg-orange-400/10'} />
          <StatCard icon="savings" badge={t.savingsBadge} title={t.savings} value={formatMoney(savingsValue)} color="text-[#b8c3ff]" iconBg="bg-[#b8c3ff]/10" />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-[rgba(45,52,73,0.6)] backdrop-blur-[20px] border border-[#434656]/15 rounded-[2rem] p-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-xl font-bold">{t.cashflow}</h3>
                <p className="text-xs text-[#c4c5d9]/60 mt-1">{t.sixMonths}</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#4edea3]"></span>
                  <span className="text-xs font-semibold">{t.incomeLegend}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#ffb3b6]"></span>
                  <span className="text-xs font-semibold">{t.expenseLegend}</span>
                </div>
              </div>
            </div>

            <div className="relative h-64 w-full flex items-end justify-between px-4">
              <div className="absolute inset-x-0 bottom-0 h-[1px] bg-[#434656]/20"></div>
              {monthKeys.map((month, index) => {
                const incomeHeight = Math.max(12, (monthlyData[month].income / maxFlow) * 95)
                const expenseHeight = Math.max(12, (monthlyData[month].expense / maxFlow) * 95)
                const label = index === monthKeys.length - 1 ? (language === 'en' ? 'Now' : 'Hiện tại') : `T${new Date(`${month}-01`).getMonth() + 1}`
                return (
                  <div key={`${month}-${index}`} className="flex flex-col items-center gap-2 flex-1 group cursor-pointer">
                    <div className="w-full flex items-end justify-center gap-1.5 h-full pb-4">
                      <div className="w-6 bg-[#4edea3]/20 rounded-t-lg group-hover:bg-[#4edea3]/40 transition-all" style={{ height: `${incomeHeight}%` }}></div>
                      <div className="w-6 bg-[#ffb3b6]/20 rounded-t-lg group-hover:bg-[#ffb3b6]/40 transition-all" style={{ height: `${expenseHeight}%` }}></div>
                    </div>
                    <span className={`text-[0.65rem] font-bold uppercase ${index === monthKeys.length - 1 ? 'text-[#b8c3ff]' : 'text-[#c4c5d9]'}`}>{label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-[rgba(45,52,73,0.6)] backdrop-blur-[20px] border border-[#434656]/15 rounded-[2rem] p-8">
            <h3 className="text-xl font-bold mb-8">{t.spendingAllocation}</h3>
            <div className="relative flex items-center justify-center h-48 mb-10">
              <div className="w-40 h-40 rounded-full border-[12px] border-[#2d3449] relative">
                <div className="absolute inset-0 rounded-full border-[12px] border-t-[#4edea3] border-r-[#b8c3ff] border-l-transparent border-b-transparent -rotate-45"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[0.6rem] font-bold text-[#c4c5d9] uppercase">{t.month} {new Date().getMonth() + 1}</span>
                  <span className="text-lg font-bold">100%</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {(topCategories.length ? topCategories : [[t.noData, 0]]).map(([name, amount], idx) => {
                const total = topCategories.reduce((sum, item) => sum + item[1], 0) || 1
                const ratio = Math.round((amount / total) * 100)
                const dots = ['bg-[#4edea3]', 'bg-[#b8c3ff]', 'bg-[#ffb3b6]', 'bg-orange-400']
                return (
                  <div key={`${name}-${idx}`} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${dots[idx % dots.length]}`}></div>
                      <span className="text-sm font-medium">{name}</span>
                    </div>
                    <span className="text-sm font-bold">{ratio}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="bg-[rgba(45,52,73,0.6)] backdrop-blur-[20px] border border-[#434656]/15 rounded-[2rem] p-10">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-bold">{t.recentTransactions}</h3>
            <Link href="/transaction-history" className="text-sm font-bold text-[#b8c3ff] hover:underline underline-offset-8">{t.viewAll}</Link>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 text-[0.7rem] font-bold text-[#c4c5d9] uppercase tracking-[0.1em] opacity-60">
              <div className="col-span-5">{t.categoryNote}</div>
              <div className="col-span-3">{t.date}</div>
              <div className="col-span-2 text-right">{t.amount}</div>
              <div className="col-span-2 text-right">{t.status}</div>
            </div>

            {recentActivities.map((item, idx) => {
              const isExpense = item.type === 'expense'
              const amountColor = isExpense ? 'text-[#ffb3b6]' : 'text-[#4edea3]'
              const amountPrefix = isExpense ? '-' : '+'
              return (
                <div key={`${item.id || idx}`} className="grid grid-cols-12 gap-4 px-6 py-6 items-center rounded-2xl hover:bg-[#222a3d]/50 transition-colors">
                  <div className="col-span-5 flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isExpense ? 'bg-orange-400/10 text-orange-400' : 'bg-[#4edea3]/10 text-[#4edea3]'}`}>
                      <span className="material-symbols-outlined">{isExpense ? 'restaurant' : 'work'}</span>
                    </div>
                    <div>
                      <p className="font-bold">{item.description || item.note || t.noData}</p>
                      <p className="text-xs text-[#c4c5d9]">{item.category || t.noData}</p>
                    </div>
                  </div>
                  <div className="col-span-3 text-sm font-medium text-[#c4c5d9]">{displayDate(item.date)}</div>
                  <div className={`col-span-2 text-right font-bold ${amountColor}`}>{amountPrefix} {formatMoney(item.amount)}</div>
                  <div className="col-span-2 flex justify-end">
                    <span className="px-3 py-1 rounded-full bg-[#4edea3]/10 text-[#4edea3] text-[0.65rem] font-bold uppercase tracking-wider">{idx === 2 ? t.pending : t.completed}</span>
                  </div>
                </div>
              )
            })}

            {recentActivities.length === 0 && <div className="py-10 text-center text-[#c4c5d9]">{t.emptyTx}</div>}
          </div>
        </section>

        <footer className="w-full py-12 flex flex-col md:flex-row justify-between items-center opacity-60">
          <div className="text-[0.75rem] uppercase tracking-widest text-[#c4c5d9]/60 mb-4 md:mb-0">© 2026 {t.footerBrand}</div>
          <div className="flex items-center gap-8">
            <span className="text-[0.75rem] uppercase tracking-widest hover:text-[#b8c3ff] transition-colors">{t.helpCenter}</span>
            <span className="text-[0.75rem] uppercase tracking-widest hover:text-[#b8c3ff] transition-colors">{t.terms}</span>
            <span className="text-[0.75rem] uppercase tracking-widest hover:text-[#b8c3ff] transition-colors">{t.privacy}</span>
          </div>
        </footer>
      </div>
    </AppShell>
  )
}

function StatCard({ icon, badge, title, value, color, iconBg }) {
  return (
    <div className="bg-[#131b2e] rounded-2xl p-6 hover:bg-[#171f33] transition-colors group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${iconBg} ${color} group-hover:scale-110 transition-transform`}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        </div>
        <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${iconBg} ${color}`}>{badge}</span>
      </div>
      <p className="text-[0.7rem] font-semibold text-[#c4c5d9] uppercase tracking-widest mb-1">{title}</p>
      <h4 className="text-xl font-bold">{value}</h4>
    </div>
  )
}
