import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { getSheetsClient } from '../../lib/googleClient'

const SHEET_NAME = 'Budgets'

/**
 * API endpoint for Budget Management
 * GET - Get all budgets
 * POST - Create new budget
 * PUT - Update budget
 * DELETE - Delete budget
 */
export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)

  if (!session?.accessToken) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  const spreadsheetId = process.env.GOOGLE_SHEET_ID

  try {
    const sheets = getSheetsClient(session.accessToken)

    if (req.method === 'GET') {
      // Get all budgets with daily/weekly limits
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${SHEET_NAME}!A2:H`
      })

      const rows = response.data.values || []
      const budgets = rows.map(row => ({
        id: row[0],
        category: row[1],
        amount: Number(row[2]),
        period: row[3], // 'monthly' or 'yearly'
        alertThreshold: Number(row[4]) || 80, // Alert when spending reaches X%
        dailyLimit: Number(row[5]) || Math.round(Number(row[2]) / 30), // Auto-calculate if not set
        weeklyLimit: Number(row[6]) || Math.round(Number(row[2]) / 4), // Auto-calculate if not set
        blockOnExceed: row[7] === 'true' || row[7] === true || false // Block spending when limit reached
      }))

      return res.status(200).json({ budgets })
    }

    if (req.method === 'POST') {
      // Create new budget with daily/weekly limits
      const { 
        category, 
        amount, 
        period = 'monthly', 
        alertThreshold = 80,
        dailyLimit,
        weeklyLimit,
        blockOnExceed = false
      } = req.body

      // Auto-calculate limits if not provided
      const calculatedDailyLimit = dailyLimit || Math.round(amount / 30)
      const calculatedWeeklyLimit = weeklyLimit || Math.round(amount / 4)

      const newBudget = [
        Date.now().toString(),
        category,
        amount,
        period,
        alertThreshold,
        calculatedDailyLimit,
        calculatedWeeklyLimit,
        blockOnExceed.toString()
      ]

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${SHEET_NAME}!A:H`,
        valueInputOption: 'RAW',
        resource: {
          values: [newBudget]
        }
      })

      return res.status(200).json({ 
        success: true, 
        message: 'Budget created',
        budget: {
          id: newBudget[0],
          category: newBudget[1],
          amount: Number(newBudget[2]),
          period: newBudget[3],
          alertThreshold: Number(newBudget[4]),
          dailyLimit: Number(newBudget[5]),
          weeklyLimit: Number(newBudget[6]),
          blockOnExceed: newBudget[7] === 'true'
        }
      })
    }

    if (req.method === 'PUT') {
      // Update budget with daily/weekly limits
      const { 
        id, 
        category, 
        amount, 
        period, 
        alertThreshold,
        dailyLimit,
        weeklyLimit,
        blockOnExceed = false
      } = req.body

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${SHEET_NAME}!A2:H`
      })

      const rows = response.data.values || []
      const rowIndex = rows.findIndex(row => row[0] === id)

      if (rowIndex === -1) {
        return res.status(404).json({ error: 'Budget not found' })
      }

      // Auto-calculate if not provided
      const calculatedDailyLimit = dailyLimit || Math.round(amount / 30)
      const calculatedWeeklyLimit = weeklyLimit || Math.round(amount / 4)

      const updatedBudget = [
        id, 
        category, 
        amount, 
        period, 
        alertThreshold,
        calculatedDailyLimit,
        calculatedWeeklyLimit,
        blockOnExceed.toString()
      ]

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${SHEET_NAME}!A${rowIndex + 2}:H${rowIndex + 2}`,
        valueInputOption: 'RAW',
        resource: {
          values: [updatedBudget]
        }
      })

      return res.status(200).json({ 
        success: true, 
        message: 'Budget updated',
        budget: {
          id,
          category,
          amount: Number(amount),
          period,
          alertThreshold: Number(alertThreshold),
          dailyLimit: Number(calculatedDailyLimit),
          weeklyLimit: Number(calculatedWeeklyLimit),
          blockOnExceed: blockOnExceed.toString() === 'true'
        }
      })
    }

    if (req.method === 'DELETE') {
      // Delete budget
      const { id } = req.body

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${SHEET_NAME}!A2:H`
      })

      const rows = response.data.values || []
      const rowIndex = rows.findIndex(row => row[0] === id)

      if (rowIndex === -1) {
        return res.status(404).json({ error: 'Budget not found' })
      }

      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [{
            deleteDimension: {
              range: {
                sheetId: 0, // You may need to get the correct sheet ID
                dimension: 'ROWS',
                startIndex: rowIndex + 1,
                endIndex: rowIndex + 2
              }
            }
          }]
        }
      })

      return res.status(200).json({ 
        success: true, 
        message: 'Budget deleted'
      })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Budget API Error:', error)
    return res.status(500).json({ error: error.message })
  }
}
