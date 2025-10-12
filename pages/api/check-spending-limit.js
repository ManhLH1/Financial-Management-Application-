import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { getSheetsClient } from '../../lib/googleClient'
import { getOrCreateSpreadsheet, SHEETS } from '../../lib/sheetsHelper'

/**
 * API to check if an expense would exceed spending limits
 * POST /api/check-spending-limit
 * Body: { category, amount }
 * Returns: { canProceed, alerts[], recommendation }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)
  
  if (!session?.accessToken) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  const { category, amount } = req.body

  if (!category || !amount) {
    return res.status(400).json({ error: 'Category and amount are required' })
  }

  try {
    const spreadsheetId = await getOrCreateSpreadsheet(session.accessToken, session.user.email)
    const sheets = getSheetsClient(session.accessToken)

    // 1. Get budget for this category
    const budgetResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `Budgets!A2:H`
    })

    const budgetRows = budgetResponse.data.values || []
    const budget = budgetRows.find(row => row[1] === category)

    if (!budget) {
      // No budget set for this category - allow but warn
      return res.status(200).json({
        canProceed: true,
        alerts: [{
          level: 'INFO',
          type: 'NO_BUDGET',
          message: `Chưa có ngân sách cho danh mục "${category}"`,
          recommendation: 'Nên thiết lập ngân sách để kiểm soát chi tiêu tốt hơn'
        }],
        suggestedAction: 'CREATE_BUDGET'
      })
    }

    // Parse budget data
    const budgetData = {
      id: budget[0],
      category: budget[1],
      monthlyLimit: Number(budget[2]),
      period: budget[3],
      alertThreshold: Number(budget[4]) || 80,
      dailyLimit: Number(budget[5]) || Math.round(Number(budget[2]) / 30),
      weeklyLimit: Number(budget[6]) || Math.round(Number(budget[2]) / 4),
      blockOnExceed: budget[7] === 'true'
    }

    // 2. Get current month/week/day spending
    const expensesResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEETS.EXPENSES}!A2:H`
    })

    const expenseRows = expensesResponse.data.values || []
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay()) // Sunday
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    let monthSpending = 0
    let weekSpending = 0
    let daySpending = 0

    expenseRows.forEach(row => {
      // Skip if not matching category or inactive
      if (row[3] !== category || row[6] === '1') return
      
      const expenseDate = new Date(row[4])
      const expenseAmount = Number(row[2]) || 0
      const expenseType = row[5] || 'expense'

      // Only count expenses, not income
      if (expenseType !== 'expense') return

      if (expenseDate >= startOfMonth) {
        monthSpending += expenseAmount
      }
      if (expenseDate >= startOfWeek) {
        weekSpending += expenseAmount
      }
      if (expenseDate >= startOfDay) {
        daySpending += expenseAmount
      }
    })

    // 3. Calculate what would happen if we add this expense
    const newDayTotal = daySpending + Number(amount)
    const newWeekTotal = weekSpending + Number(amount)
    const newMonthTotal = monthSpending + Number(amount)

    // 4. Generate alerts
    const alerts = []

    // Check daily limit
    const dayPercentage = (newDayTotal / budgetData.dailyLimit * 100).toFixed(1)
    if (newDayTotal > budgetData.dailyLimit) {
      alerts.push({
        level: budgetData.blockOnExceed ? 'BLOCKED' : 'DANGER',
        type: 'DAILY_EXCEEDED',
        message: `Vượt hạn mức ngày! (${formatCurrency(newDayTotal)}/${formatCurrency(budgetData.dailyLimit)})`,
        recommendation: `Bạn đã chi ${formatCurrency(daySpending)} hôm nay. Thêm ${formatCurrency(amount)} sẽ vượt ${formatCurrency(newDayTotal - budgetData.dailyLimit)}`,
        percentage: dayPercentage
      })
    } else if (dayPercentage >= 80) {
      alerts.push({
        level: 'WARNING',
        type: 'DAILY_WARNING',
        message: `Sắp đạt hạn mức ngày (${dayPercentage}%)`,
        recommendation: `Còn ${formatCurrency(budgetData.dailyLimit - newDayTotal)} cho hôm nay`,
        percentage: dayPercentage
      })
    }

    // Check weekly limit
    const weekPercentage = (newWeekTotal / budgetData.weeklyLimit * 100).toFixed(1)
    if (newWeekTotal > budgetData.weeklyLimit) {
      alerts.push({
        level: 'DANGER',
        type: 'WEEKLY_EXCEEDED',
        message: `Vượt hạn mức tuần! (${formatCurrency(newWeekTotal)}/${formatCurrency(budgetData.weeklyLimit)})`,
        recommendation: `Đã chi ${formatCurrency(weekSpending)} tuần này. Cân nhắc hoãn chi tiêu này`,
        percentage: weekPercentage
      })
    } else if (weekPercentage >= 80) {
      alerts.push({
        level: 'WARNING',
        type: 'WEEKLY_WARNING',
        message: `Sắp đạt hạn mức tuần (${weekPercentage}%)`,
        recommendation: `Còn ${formatCurrency(budgetData.weeklyLimit - newWeekTotal)} cho tuần này`,
        percentage: weekPercentage
      })
    }

    // Check monthly limit
    const monthPercentage = (newMonthTotal / budgetData.monthlyLimit * 100).toFixed(1)
    if (newMonthTotal > budgetData.monthlyLimit) {
      alerts.push({
        level: 'DANGER',
        type: 'MONTHLY_EXCEEDED',
        message: `Vượt ngân sách tháng! (${formatCurrency(newMonthTotal)}/${formatCurrency(budgetData.monthlyLimit)})`,
        recommendation: `Đã chi ${monthPercentage}% ngân sách tháng. Rất nguy hiểm!`,
        percentage: monthPercentage
      })
    } else if (monthPercentage >= budgetData.alertThreshold) {
      alerts.push({
        level: 'WARNING',
        type: 'MONTHLY_WARNING',
        message: `Ngân sách tháng đạt ${monthPercentage}% (ngưỡng cảnh báo: ${budgetData.alertThreshold}%)`,
        recommendation: `Còn ${formatCurrency(budgetData.monthlyLimit - newMonthTotal)} cho tháng này`,
        percentage: monthPercentage
      })
    }

    // 5. Calculate spending velocity (for info)
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
    const daysElapsed = today.getDate()
    const daysRemaining = daysInMonth - daysElapsed
    
    const avgDailySpending = monthSpending / daysElapsed
    const projectedMonthEnd = avgDailySpending * daysInMonth
    
    if (projectedMonthEnd > budgetData.monthlyLimit && alerts.length === 0) {
      const daysUntilEmpty = Math.floor((budgetData.monthlyLimit - monthSpending) / avgDailySpending)
      
      alerts.push({
        level: 'INFO',
        type: 'VELOCITY_WARNING',
        message: `Tốc độ chi tiêu hiện tại: ${formatCurrency(avgDailySpending)}/ngày`,
        recommendation: `Với tốc độ này, bạn sẽ hết ngân sách trong ${daysUntilEmpty} ngày. Nên giảm xuống ${formatCurrency(budgetData.monthlyLimit / daysInMonth)}/ngày`,
        projectedTotal: projectedMonthEnd,
        velocity: avgDailySpending
      })
    }

    // 6. Determine if can proceed
    const hasBlockedAlert = alerts.some(a => a.level === 'BLOCKED')
    const hasDangerAlert = alerts.some(a => a.level === 'DANGER')

    let suggestedAction = 'PROCEED'
    if (hasBlockedAlert) {
      suggestedAction = 'BLOCKED'
    } else if (hasDangerAlert) {
      suggestedAction = 'CONFIRM_REQUIRED'
    } else if (alerts.length > 0) {
      suggestedAction = 'WARNING_SHOWN'
    }

    return res.status(200).json({
      canProceed: !hasBlockedAlert,
      requireConfirmation: hasDangerAlert || alerts.length > 0,
      alerts,
      suggestedAction,
      currentSpending: {
        today: daySpending,
        thisWeek: weekSpending,
        thisMonth: monthSpending
      },
      limits: {
        daily: budgetData.dailyLimit,
        weekly: budgetData.weeklyLimit,
        monthly: budgetData.monthlyLimit
      },
      afterExpense: {
        today: newDayTotal,
        thisWeek: newWeekTotal,
        thisMonth: newMonthTotal
      }
    })

  } catch (error) {
    console.error('Check spending limit error:', error)
    return res.status(500).json({ 
      error: 'Failed to check spending limit',
      details: error.message 
    })
  }
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount) + 'đ'
}
