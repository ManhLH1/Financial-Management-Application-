import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { getSheetsClient } from '../../lib/googleClient'
import { getOrCreateSpreadsheet, SHEETS } from '../../lib/sheetsHelper'

/**
 * API to calculate spending velocity and forecast
 * GET /api/spending-velocity?category=X
 * Returns velocity, projected spending, days until budget empty
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)
  
  if (!session?.accessToken) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  const { category } = req.query

  try {
    const spreadsheetId = await getOrCreateSpreadsheet(session.accessToken, session.user.email)
    const sheets = getSheetsClient(session.accessToken)

    // Get expenses for current month
    const expensesResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEETS.EXPENSES}!A2:H`
    })

    const expenseRows = expensesResponse.data.values || []
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    // Filter expenses
    let expenses = expenseRows
      .filter(row => {
        const expenseDate = new Date(row[4])
        const isThisMonth = expenseDate >= startOfMonth
        const isActive = row[6] !== '1'
        const isExpense = (row[5] || 'expense') === 'expense'
        const matchesCategory = category ? row[3] === category : true
        
        return isThisMonth && isActive && isExpense && matchesCategory
      })
      .map(row => ({
        id: row[0],
        title: row[1],
        amount: Number(row[2]),
        category: row[3],
        date: row[4],
        type: row[5]
      }))

    // Calculate statistics
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
    const daysElapsed = today.getDate()
    const daysRemaining = daysInMonth - daysElapsed

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
    const velocity = daysElapsed > 0 ? totalSpent / daysElapsed : 0
    const projectedEndOfMonth = velocity * daysInMonth

    // Get budget limit
    let budgetLimit = null
    let daysUntilEmpty = null
    let status = 'UNKNOWN'
    let recommendation = null

    if (category) {
      const budgetResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `Budgets!A2:H`
      })

      const budgetRows = budgetResponse.data.values || []
      const budget = budgetRows.find(row => row[1] === category)

      if (budget) {
        budgetLimit = Number(budget[2])
        const remaining = budgetLimit - totalSpent

        if (velocity > 0) {
          daysUntilEmpty = Math.floor(remaining / velocity)
        }

        // Determine status
        if (projectedEndOfMonth > budgetLimit * 1.2) {
          status = 'CRITICAL'
          const targetVelocity = budgetLimit / daysInMonth
          recommendation = `Giảm chi tiêu xuống ${formatCurrency(targetVelocity)}/ngày để tránh vượt ngân sách`
        } else if (projectedEndOfMonth > budgetLimit) {
          status = 'WARNING'
          const targetVelocity = budgetLimit / daysInMonth
          recommendation = `Với tốc độ hiện tại sẽ vượt ${formatCurrency(projectedEndOfMonth - budgetLimit)}. Nên giảm xuống ${formatCurrency(targetVelocity)}/ngày`
        } else if (projectedEndOfMonth > budgetLimit * 0.8) {
          status = 'MODERATE'
          recommendation = 'Đang chi tiêu ở mức cao nhưng vẫn trong tầm kiểm soát'
        } else {
          status = 'GOOD'
          recommendation = 'Tốc độ chi tiêu ổn định, tiếp tục duy trì'
        }
      }
    }

    // Calculate daily breakdown
    const dailySpending = {}
    expenses.forEach(e => {
      const date = e.date.split('T')[0]
      dailySpending[date] = (dailySpending[date] || 0) + e.amount
    })

    const dailyValues = Object.values(dailySpending)
    const avgDaily = dailyValues.length > 0 
      ? dailyValues.reduce((a, b) => a + b, 0) / dailyValues.length 
      : 0

    const maxDaily = dailyValues.length > 0 ? Math.max(...dailyValues) : 0
    const minDaily = dailyValues.length > 0 ? Math.min(...dailyValues) : 0

    // Calculate variance (stability)
    const variance = dailyValues.length > 1
      ? Math.sqrt(
          dailyValues
            .map(val => Math.pow(val - avgDaily, 2))
            .reduce((a, b) => a + b, 0) / dailyValues.length
        )
      : 0

    const coefficientOfVariation = avgDaily > 0 ? (variance / avgDaily * 100).toFixed(1) : 0

    return res.status(200).json({
      category: category || 'All',
      period: {
        startDate: startOfMonth.toISOString().split('T')[0],
        endDate: new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0],
        daysElapsed,
        daysRemaining,
        daysInMonth
      },
      spending: {
        total: totalSpent,
        count: expenses.length,
        average: velocity,
        projected: projectedEndOfMonth
      },
      velocity: {
        daily: velocity,
        weekly: velocity * 7,
        formatted: `${formatCurrency(velocity)}/ngày`
      },
      budget: budgetLimit ? {
        limit: budgetLimit,
        spent: totalSpent,
        remaining: budgetLimit - totalSpent,
        percentUsed: ((totalSpent / budgetLimit) * 100).toFixed(1),
        daysUntilEmpty,
        status,
        recommendation
      } : null,
      analysis: {
        avgDaily,
        maxDaily,
        minDaily,
        variance: variance.toFixed(0),
        stability: coefficientOfVariation < 30 ? 'STABLE' : 
                   coefficientOfVariation < 60 ? 'MODERATE' : 'VOLATILE',
        stabilityScore: coefficientOfVariation
      },
      forecast: {
        endOfMonth: projectedEndOfMonth,
        worstCase: projectedEndOfMonth * 1.2, // 20% buffer
        bestCase: projectedEndOfMonth * 0.8,
        confidence: dailyValues.length >= 7 ? 'HIGH' : 
                    dailyValues.length >= 3 ? 'MEDIUM' : 'LOW'
      },
      recentExpenses: expenses.slice(-5).reverse() // Last 5 expenses
    })

  } catch (error) {
    console.error('Spending velocity error:', error)
    return res.status(500).json({ 
      error: 'Failed to calculate spending velocity',
      details: error.message 
    })
  }
}

function formatCurrency(amount) {
  if (!amount) return '0đ'
  return new Intl.NumberFormat('vi-VN', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount) + 'đ'
}
