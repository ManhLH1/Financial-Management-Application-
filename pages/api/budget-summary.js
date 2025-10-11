import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { getSheetsClient } from '../../lib/googleClient'
import { getOrCreateSpreadsheet, SHEETS } from '../../lib/sheetsHelper'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session?.accessToken) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  try {
    const spreadsheetId = await getOrCreateSpreadsheet(session.accessToken, session.user.email)
    const sheets = getSheetsClient(session.accessToken)
    
    // Get all expenses and income from Expenses sheet
    const expensesData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEETS.EXPENSES}!A2:G1000`
    })
    
    const rows = expensesData.data.values || []
    
    // Calculate totals by category
    const categories = {
      expenses: {},
      income: {}
    }
    
    let totalExpenses = 0
    let totalIncome = 0
    let startingBalance = 1000 // Default starting balance
    
    rows.forEach(row => {
      if (!row[0]) return // Skip empty rows
      
      const amount = parseFloat(row[2]) || 0
      const category = row[3] || 'Khác'
      const type = row[6] || 'expense' // type: expense or income
      
      if (type === 'income') {
        totalIncome += amount
        if (!categories.income[category]) {
          categories.income[category] = {
            planned: 0,
            actual: 0,
            count: 0
          }
        }
        categories.income[category].actual += amount
        categories.income[category].count++
      } else {
        totalExpenses += amount
        if (!categories.expenses[category]) {
          categories.expenses[category] = {
            planned: 0,
            actual: 0,
            count: 0
          }
        }
        categories.expenses[category].actual += amount
        categories.expenses[category].count++
      }
    })
    
    const endingBalance = startingBalance + totalIncome - totalExpenses
    const savings = endingBalance - startingBalance
    const savingsPercent = startingBalance > 0 ? (savings / startingBalance * 100).toFixed(0) : 0
    
    // Format data for response
    const summary = {
      startingBalance,
      endingBalance,
      savings,
      savingsPercent,
      totalExpenses,
      totalIncome,
      categories: {
        expenses: Object.entries(categories.expenses).map(([name, data]) => ({
          name,
          planned: data.planned,
          actual: data.actual,
          difference: data.actual - data.planned,
          count: data.count
        })),
        income: Object.entries(categories.income).map(([name, data]) => ({
          name,
          planned: data.planned,
          actual: data.actual,
          difference: data.actual - data.planned,
          count: data.count
        }))
      }
    }
    
    return res.status(200).json(summary)
    
  } catch (error) {
    console.error('Error fetching budget summary:', error)
    return res.status(500).json({ 
      error: 'Failed to fetch budget summary',
      details: error.message 
    })
  }
}
