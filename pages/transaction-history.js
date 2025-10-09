import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Notification, { useNotification } from '../components/Notification'

// Category icons (same as expenses)
const categoryIcons = {
  'Ăn uống': '🍽️',
  'Di chuyển': '🚗',
  'Giải trí': '🎮',
  'Mua sắm': '🛍️',
  'Sức khỏe': '💊',
  'Học tập': '📚',
  'Hóa đơn': '📄',
  'Lương': '💰',
  'Thưởng': '🎁',
  'Đầu tư': '📈',
  'Kinh doanh': '💼',
  'Khác': '📦'
}

const categoryColors = {
  'Ăn uống': 'bg-[#D2C1B6]/30 text-[#1B3C53] border-[#D2C1B6]',
  'Di chuyển': 'bg-[#456882]/20 text-[#1B3C53] border-[#456882]',
  'Mua sắm': 'bg-[#D2C1B6]/40 text-[#1B3C53] border-[#D2C1B6]',
  'Sức khỏe': 'bg-[#456882]/30 text-[#1B3C53] border-[#456882]',
}

export default function TransactionHistory() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showNotification } = useNotification()
  
  const [expenses, setExpenses] = useState([])
  const [debts, setDebts] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Filter states with current date default
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0])
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0])
  const [typeFilter, setTypeFilter] = useState('all') // all, expense, income, debt
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth')
      return
    }
    
    fetchData()
  }, [session, status, router])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch expenses
      const expensesRes = await fetch('/api/expenses')
      const expensesData = await expensesRes.json()
      setExpenses(expensesData.notes || [])
      
      // Fetch debts
      const debtsRes = await fetch('/api/debts')
      const debtsData = await debtsRes.json()
      setDebts(debtsData.notes || [])
      
    } catch (error) {
      console.error('Error fetching data:', error)
      showNotification('Lỗi khi tải dữ liệu', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Combine and filter all transactions
  const getAllTransactions = () => {
    let allTransactions = []
    
    // Add expenses
    expenses.forEach(expense => {
      allTransactions.push({
        ...expense,
        transactionType: expense.type || 'expense', // expense or income
        source: 'expense'
      })
    })
    
    // Add debts
    debts.forEach(debt => {
      allTransactions.push({
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
    
    return allTransactions
  }

  const filteredTransactions = getAllTransactions().filter(transaction => {
    // Date filter
    if (dateFrom && transaction.date < dateFrom) return false
    if (dateTo && transaction.date > dateTo) return false
    
    // Type filter
    if (typeFilter !== 'all') {
      if (typeFilter === 'expense' && transaction.transactionType !== 'expense') return false
      if (typeFilter === 'income' && transaction.transactionType !== 'income') return false
      if (typeFilter === 'debt' && transaction.transactionType !== 'debt') return false
    }
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        transaction.title.toLowerCase().includes(searchLower) ||
        transaction.category.toLowerCase().includes(searchLower) ||
        (transaction.person && transaction.person.toLowerCase().includes(searchLower))
      )
    }
    
    return true
  }).sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date desc

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const getTransactionColor = (transaction) => {
    if (transaction.transactionType === 'income') return 'text-green-600'
    if (transaction.transactionType === 'debt') {
      return transaction.status === 'owed-to-me' ? 'text-blue-600' : 'text-red-600'
    }
    return 'text-red-600' // expense
  }

  const getTransactionPrefix = (transaction) => {
    if (transaction.transactionType === 'income') return '+'
    if (transaction.transactionType === 'debt') {
      return transaction.status === 'owed-to-me' ? '+' : '-'
    }
    return '-' // expense
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#F5F3F1] flex items-center justify-center">
        <div className="text-[#1B3C53]">Đang tải...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F3F1] dark:bg-gray-900">
      <Notification />
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-[#D2C1B6]/30">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard-advanced" className="text-[#456882] hover:text-[#1B3C53] transition-colors">
                ← Quay lại
              </Link>
              <h1 className="text-2xl font-bold text-[#1B3C53] dark:text-white">Lịch sử giao dịch</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-sm text-[#456882] dark:text-gray-400">
                {session?.user?.email}
              </span>
              <button 
                onClick={() => signOut()} 
                className="px-3 py-1 text-sm bg-[#456882] text-white rounded hover:bg-[#1B3C53] transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-[#D2C1B6]/30 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-[#1B3C53] dark:text-white mb-1">
                Từ ngày
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-[#D2C1B6] rounded-md text-[#1B3C53] dark:text-white dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-[#456882] focus:border-transparent"
              />
            </div>
            
            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-[#1B3C53] dark:text-white mb-1">
                Đến ngày
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-[#D2C1B6] rounded-md text-[#1B3C53] dark:text-white dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-[#456882] focus:border-transparent"
              />
            </div>
            
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-[#1B3C53] dark:text-white mb-1">
                Loại giao dịch
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-[#D2C1B6] rounded-md text-[#1B3C53] dark:text-white dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-[#456882] focus:border-transparent"
              >
                <option value="all">Tất cả</option>
                <option value="expense">Chi tiêu</option>
                <option value="income">Thu nhập</option>
                <option value="debt">Nợ</option>
              </select>
            </div>
            
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-[#1B3C53] dark:text-white mb-1">
                Tìm kiếm
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo tên, danh mục..."
                className="w-full px-3 py-2 border border-[#D2C1B6] rounded-md text-[#1B3C53] dark:text-white dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-[#456882] focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Quick date filters */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => {
                const today = new Date().toISOString().split('T')[0]
                setDateFrom(today)
                setDateTo(today)
              }}
              className="px-3 py-1 text-sm bg-[#456882] text-white rounded hover:bg-[#1B3C53] transition-colors"
            >
              Hôm nay
            </button>
            <button
              onClick={() => {
                const today = new Date()
                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
                setDateFrom(firstDay.toISOString().split('T')[0])
                setDateTo(today.toISOString().split('T')[0])
              }}
              className="px-3 py-1 text-sm bg-[#456882] text-white rounded hover:bg-[#1B3C53] transition-colors"
            >
              Tháng này
            </button>
            <button
              onClick={() => {
                setDateFrom('')
                setDateTo('')
              }}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Tất cả
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {['expense', 'income', 'debt'].map(type => {
            const typeTransactions = filteredTransactions.filter(t => t.transactionType === type)
            const total = typeTransactions.reduce((sum, t) => {
              if (type === 'debt') {
                return sum + (t.status === 'owed-to-me' ? t.amount : -t.amount)
              }
              return sum + t.amount
            }, 0)
            
            const labels = {
              expense: 'Chi tiêu',
              income: 'Thu nhập', 
              debt: 'Nợ'
            }
            
            const colors = {
              expense: 'text-red-600',
              income: 'text-green-600',
              debt: total >= 0 ? 'text-blue-600' : 'text-red-600'
            }
            
            return (
              <div key={type} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-[#D2C1B6]/30 p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">{labels[type]}</div>
                <div className={`text-lg font-semibold ${colors[type]}`}>
                  {formatCurrency(Math.abs(total))}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  {typeTransactions.length} giao dịch
                </div>
              </div>
            )
          })}
        </div>

        {/* Transaction List */}
        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Không có giao dịch nào trong khoảng thời gian này
            </div>
          ) : (
            filteredTransactions.map(transaction => (
              <div key={`${transaction.source}-${transaction.id}`} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-[#D2C1B6]/30 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-xl">
                      {categoryIcons[transaction.category] || '📦'}
                    </div>
                    <div>
                      <div className="font-medium text-[#1B3C53] dark:text-white">
                        {transaction.title}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className={`inline-block px-2 py-1 rounded text-xs ${categoryColors[transaction.category] || 'bg-gray-100 text-gray-800 border-gray-300'} border`}>
                          {transaction.category}
                        </span>
                        <span>{transaction.date}</span>
                        {transaction.source === 'debt' && (
                          <span className="text-xs">
                            (Đến hạn: {transaction.due})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`text-lg font-semibold ${getTransactionColor(transaction)}`}>
                    {getTransactionPrefix(transaction)}{formatCurrency(transaction.amount)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}