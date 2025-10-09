import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'

/**
 * API endpoint for Advanced Analytics
 * GET - Get analytics data
 */
export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)

  if (!session?.accessToken) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  try {
    // Fetch expenses and debts
    const [expRes, debtRes] = await Promise.all([
      fetch(`http://localhost:3000/api/expenses`, {
        headers: { cookie: req.headers.cookie }
      }),
      fetch(`http://localhost:3000/api/debts`, {
        headers: { cookie: req.headers.cookie }
      })
    ])

    const expData = await expRes.json()
    const debtData = await debtRes.json()

    const expenses = expData.items || []
    const debts = debtData.notes || []

    // Calculate current month stats
    const now = new Date()
    const currentMonth = now.toISOString().slice(0, 7)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7)

    const getCurrentMonthExpenses = () => {
      return expenses.filter(e => e.date?.startsWith(currentMonth) && e.type === 'expense')
    }

    const getLastMonthExpenses = () => {
      return expenses.filter(e => e.date?.startsWith(lastMonth) && e.type === 'expense')
    }

    const currentMonthExpenses = getCurrentMonthExpenses()
    const lastMonthExpenses = getLastMonthExpenses()

    const currentTotal = currentMonthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)
    const lastTotal = lastMonthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)

    // Month comparison
    const percentChange = lastTotal > 0 ? ((currentTotal - lastTotal) / lastTotal * 100).toFixed(2) : 0

    // Top 5 expenses
    const top5Expenses = [...expenses]
      .filter(e => e.type === 'expense')
      .sort((a, b) => (b.amount || 0) - (a.amount || 0))
      .slice(0, 5)

    // Category breakdown for current month
    const categoryBreakdown = {}
    currentMonthExpenses.forEach(e => {
      if (!categoryBreakdown[e.category]) {
        categoryBreakdown[e.category] = { amount: 0, count: 0 }
      }
      categoryBreakdown[e.category].amount += e.amount || 0
      categoryBreakdown[e.category].count++
    })

    // Prediction for next month (simple average of last 3 months)
    const predictions = calculatePrediction(expenses)

    // Daily average
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const currentDay = now.getDate()
    const dailyAverage = currentDay > 0 ? (currentTotal / currentDay).toFixed(2) : 0
    const projectedEndOfMonth = (dailyAverage * daysInMonth).toFixed(2)

    return res.status(200).json({
      comparison: {
        currentMonth: {
          total: currentTotal,
          count: currentMonthExpenses.length,
          average: currentMonthExpenses.length > 0 ? (currentTotal / currentMonthExpenses.length).toFixed(2) : 0
        },
        lastMonth: {
          total: lastTotal,
          count: lastMonthExpenses.length,
          average: lastMonthExpenses.length > 0 ? (lastTotal / lastMonthExpenses.length).toFixed(2) : 0
        },
        change: {
          amount: (currentTotal - lastTotal).toFixed(2),
          percent: percentChange,
          trend: percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'stable'
        }
      },
      top5: top5Expenses.map(e => ({
        title: e.title,
        amount: e.amount,
        category: e.category,
        date: e.date
      })),
      categoryBreakdown,
      prediction: predictions,
      currentMonthProjection: {
        dailyAverage: Number(dailyAverage),
        daysElapsed: currentDay,
        daysRemaining: daysInMonth - currentDay,
        projectedTotal: Number(projectedEndOfMonth),
        actualSoFar: currentTotal
      }
    })
  } catch (error) {
    console.error('Analytics API Error:', error)
    return res.status(500).json({ error: error.message })
  }
}

function calculatePrediction(expenses) {
  const now = new Date()
  const last3Months = []

  for (let i = 1; i <= 3; i++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = monthDate.toISOString().slice(0, 7)
    
    const monthExpenses = expenses.filter(e => 
      e.date?.startsWith(monthKey) && e.type === 'expense'
    )
    
    const total = monthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)
    last3Months.push(total)
  }

  const average = last3Months.length > 0 
    ? (last3Months.reduce((a, b) => a + b, 0) / last3Months.length).toFixed(2)
    : 0

  return {
    nextMonthPrediction: Number(average),
    basedOn: 'Average of last 3 months',
    last3MonthsData: last3Months
  }
}
