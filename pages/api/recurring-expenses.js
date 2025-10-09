import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { getSheetsClient } from '../../lib/googleClient'

const SHEET_NAME = 'RecurringExpenses'

/**
 * API endpoint for Recurring Expenses
 * GET - Get all recurring expenses
 * POST - Create new recurring expense
 * PUT - Update recurring expense
 * DELETE - Delete recurring expense
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
      // Get all recurring expenses
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${SHEET_NAME}!A2:H`
      })

      const rows = response.data.values || []
      const recurringExpenses = rows.map(row => ({
        id: row[0],
        title: row[1],
        amount: Number(row[2]),
        category: row[3],
        frequency: row[4], // 'daily', 'weekly', 'monthly', 'yearly'
        dayOfMonth: row[5] ? Number(row[5]) : null, // For monthly: 1-31
        nextDue: row[6],
        isActive: row[7] === 'true'
      }))

      return res.status(200).json({ recurringExpenses })
    }

    if (req.method === 'POST') {
      // Create new recurring expense
      const { title, amount, category, frequency, dayOfMonth, nextDue } = req.body

      const newRecurring = [
        Date.now().toString(),
        title,
        amount,
        category,
        frequency,
        dayOfMonth || '',
        nextDue || new Date().toISOString().split('T')[0],
        'true'
      ]

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${SHEET_NAME}!A:H`,
        valueInputOption: 'RAW',
        resource: {
          values: [newRecurring]
        }
      })

      return res.status(200).json({ 
        success: true, 
        message: 'Recurring expense created',
        recurring: {
          id: newRecurring[0],
          title: newRecurring[1],
          amount: Number(newRecurring[2]),
          category: newRecurring[3],
          frequency: newRecurring[4],
          dayOfMonth: newRecurring[5] ? Number(newRecurring[5]) : null,
          nextDue: newRecurring[6],
          isActive: true
        }
      })
    }

    if (req.method === 'PUT') {
      // Update recurring expense
      const { id, title, amount, category, frequency, dayOfMonth, nextDue, isActive } = req.body

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${SHEET_NAME}!A2:H`
      })

      const rows = response.data.values || []
      const rowIndex = rows.findIndex(row => row[0] === id)

      if (rowIndex === -1) {
        return res.status(404).json({ error: 'Recurring expense not found' })
      }

      const updatedRecurring = [
        id,
        title,
        amount,
        category,
        frequency,
        dayOfMonth || '',
        nextDue,
        isActive ? 'true' : 'false'
      ]

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${SHEET_NAME}!A${rowIndex + 2}:H${rowIndex + 2}`,
        valueInputOption: 'RAW',
        resource: {
          values: [updatedRecurring]
        }
      })

      return res.status(200).json({ 
        success: true, 
        message: 'Recurring expense updated'
      })
    }

    if (req.method === 'DELETE') {
      // Delete recurring expense
      const { id } = req.body

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${SHEET_NAME}!A2:H`
      })

      const rows = response.data.values || []
      const rowIndex = rows.findIndex(row => row[0] === id)

      if (rowIndex === -1) {
        return res.status(404).json({ error: 'Recurring expense not found' })
      }

      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [{
            deleteDimension: {
              range: {
                sheetId: 0,
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
        message: 'Recurring expense deleted'
      })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Recurring Expenses API Error:', error)
    return res.status(500).json({ error: error.message })
  }
}
