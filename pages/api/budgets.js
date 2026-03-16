import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { getSheetsClient } from '../../lib/googleClient'
import { getOrCreateSpreadsheet, SHEETS, getSheetId, ensureSheet } from '../../lib/sheetsHelper'
import { budgetSchema, budgetUpdateSchema, deleteSchema } from '../../lib/financeSchemas'

const SHEET_NAME = SHEETS.BUDGETS

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

  const spreadsheetId = await getOrCreateSpreadsheet(session.accessToken, session.user.email)

  try {
    const sheets = getSheetsClient(session.accessToken)

    await ensureSheet(session.accessToken, spreadsheetId, SHEET_NAME, [
      'ID',
      'Category',
      'Amount',
      'Period',
      'Alert Threshold',
      'Daily Limit',
      'Weekly Limit',
      'Block On Exceed',
      'Created At'
    ])

    if (req.method === 'GET') {
      // Get all budgets with daily/weekly limits
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${SHEET_NAME}!A2:I`
      })

      const rows = response.data.values || []
      const budgets = rows.map(row => ({
        id: row[0],
        category: row[1],
        amount: Number(row[2]),
        period: row[3] || 'monthly',
        alertThreshold: Number(row[4]) || 80,
        dailyLimit: Number(row[5]) || Math.round(Number(row[2]) / 30),
        weeklyLimit: Number(row[6]) || Math.round(Number(row[2]) / 4),
        blockOnExceed: row[7] === 'true' || row[7] === true || false,
        createdAt: row[8]
      }))

      return res.status(200).json({ items: budgets, meta: { count: budgets.length } })
    }

    if (req.method === 'POST') {
      const parsed = budgetSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ error: 'Dữ liệu không hợp lệ', details: parsed.error.flatten() })
      }

      const {
        category,
        amount,
        period,
        alertThreshold,
        dailyLimit,
        weeklyLimit,
        blockOnExceed
      } = parsed.data

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
        blockOnExceed ? 'true' : 'false',
        new Date().toISOString()
      ]

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${SHEET_NAME}!A:I`,
        valueInputOption: 'RAW',
        resource: {
          values: [newBudget]
        }
      })

      return res.status(201).json({
        item: {
          id: newBudget[0],
          category: newBudget[1],
          amount: Number(newBudget[2]),
          period: newBudget[3],
          alertThreshold: Number(newBudget[4]),
          dailyLimit: Number(newBudget[5]),
          weeklyLimit: Number(newBudget[6]),
          blockOnExceed: newBudget[7] === 'true',
          createdAt: newBudget[8]
        }
      })
    }

    if (req.method === 'PUT') {
      const parsed = budgetUpdateSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ error: 'Dữ liệu không hợp lệ', details: parsed.error.flatten() })
      }

      const { 
        id, 
        category, 
        amount, 
        period, 
        alertThreshold,
        dailyLimit,
        weeklyLimit,
        blockOnExceed
      } = parsed.data

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${SHEET_NAME}!A2:I`
      })

      const rows = response.data.values || []
      const rowIndex = rows.findIndex(row => row[0] === String(id))

      if (rowIndex === -1) {
        return res.status(404).json({ error: 'Budget not found' })
      }

      const currentRow = rows[rowIndex]

      const resolvedAmount = amount !== undefined ? amount : Number(currentRow[2])
      const resolvedPeriod = period || currentRow[3] || 'monthly'
      const resolvedAlertThreshold = alertThreshold !== undefined ? alertThreshold : Number(currentRow[4]) || 80
      const calculatedDailyLimit = dailyLimit ?? (Number(currentRow[5]) || Math.round(resolvedAmount / 30))
      const calculatedWeeklyLimit = weeklyLimit ?? (Number(currentRow[6]) || Math.round(resolvedAmount / 4))
      const resolvedBlockOnExceed = blockOnExceed !== undefined ? blockOnExceed : (currentRow[7] === 'true' || currentRow[7] === true)
      const resolvedCategory = category || currentRow[1]

      const updatedBudget = [
        String(id),
        resolvedCategory,
        resolvedAmount,
        resolvedPeriod,
        resolvedAlertThreshold,
        calculatedDailyLimit,
        calculatedWeeklyLimit,
        resolvedBlockOnExceed ? 'true' : 'false',
        currentRow[8] || new Date().toISOString()
      ]

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${SHEET_NAME}!A${rowIndex + 2}:I${rowIndex + 2}`,
        valueInputOption: 'RAW',
        resource: {
          values: [updatedBudget]
        }
      })

      return res.status(200).json({ ok: true })
    }

    if (req.method === 'DELETE') {
      const parsed = deleteSchema.safeParse({ id: req.body?.id || req.query?.id, reason: req.body?.reason })
      if (!parsed.success) {
        return res.status(400).json({ error: 'Lý do xóa là bắt buộc', details: parsed.error.flatten() })
      }

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${SHEET_NAME}!A2:I`
      })

      const rows = response.data.values || []
      const rowIndex = rows.findIndex(row => row[0] === String(parsed.data.id))

      if (rowIndex === -1) {
        return res.status(404).json({ error: 'Budget not found' })
      }

      const sheetId = await getSheetId(session.accessToken, spreadsheetId, SHEET_NAME)

      if (sheetId === null) {
        return res.status(404).json({ error: 'Sheet not found' })
      }

      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [{
            deleteDimension: {
              range: {
                sheetId,
                dimension: 'ROWS',
                startIndex: rowIndex + 1,
                endIndex: rowIndex + 2
              }
            }
          }]
        }
      })

      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Budget API Error:', error)
    return res.status(500).json({ error: error.message })
  }
}
