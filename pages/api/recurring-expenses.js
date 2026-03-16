import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { getSheetsClient } from '../../lib/googleClient'
import { getOrCreateSpreadsheet, SHEETS, ensureSheet, getSheetId } from '../../lib/sheetsHelper'
import { recurringExpenseSchema, recurringExpenseUpdateSchema, deleteSchema } from '../../lib/financeSchemas'

const SHEET_NAME = SHEETS.RECURRING_EXPENSES

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

  try {
    // Get user's spreadsheet (not fixed env variable)
    const spreadsheetId = await getOrCreateSpreadsheet(session.accessToken, session.user.email)
    const sheets = getSheetsClient(session.accessToken)
    
    console.log(`🔄 [Recurring Expenses] Using spreadsheet: ${spreadsheetId}`)

    await ensureSheet(session.accessToken, spreadsheetId, SHEET_NAME, [
      'ID',
      'Title',
      'Amount',
      'Category',
      'Frequency',
      'Day Of Month',
      'Next Due',
      'Is Active',
      'Created At'
    ])

    if (req.method === 'GET') {
      // Get all recurring expenses
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${SHEET_NAME}!A2:I`
      })

      const rows = response.data.values || []
      const recurringExpenses = rows.map(row => ({
        id: row[0],
        title: row[1],
        amount: Number(row[2]),
        category: row[3],
        frequency: row[4],
        dayOfMonth: row[5] ? Number(row[5]) : null,
        nextDue: row[6],
        isActive: row[7] === 'true' || row[7] === true,
        createdAt: row[8]
      }))

      return res.status(200).json({ items: recurringExpenses, meta: { count: recurringExpenses.length } })
    }

    if (req.method === 'POST') {
      const parsed = recurringExpenseSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ error: 'Dữ liệu không hợp lệ', details: parsed.error.flatten() })
      }

      const { title, amount, category, frequency, dayOfMonth, nextDue, isActive } = parsed.data

      const newRecurring = [
        Date.now().toString(),
        title,
        amount,
        category,
        frequency,
        dayOfMonth || '',
        nextDue || new Date().toISOString().split('T')[0],
        isActive ? 'true' : 'false',
        new Date().toISOString()
      ]

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${SHEET_NAME}!A:I`,
        valueInputOption: 'RAW',
        resource: {
          values: [newRecurring]
        }
      })

      return res.status(201).json({
        item: {
          id: newRecurring[0],
          title: newRecurring[1],
          amount: Number(newRecurring[2]),
          category: newRecurring[3],
          frequency: newRecurring[4],
          dayOfMonth: newRecurring[5] ? Number(newRecurring[5]) : null,
          nextDue: newRecurring[6],
          isActive: newRecurring[7] === 'true',
          createdAt: newRecurring[8]
        }
      })
    }

    if (req.method === 'PUT') {
      const parsed = recurringExpenseUpdateSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ error: 'Dữ liệu không hợp lệ', details: parsed.error.flatten() })
      }

      const { id, title, amount, category, frequency, dayOfMonth, nextDue, isActive } = parsed.data

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${SHEET_NAME}!A2:I`
      })

      const rows = response.data.values || []
      const rowIndex = rows.findIndex(row => row[0] === id)

      if (rowIndex === -1) {
        return res.status(404).json({ error: 'Recurring expense not found' })
      }

      const currentRow = rows[rowIndex]

      const updatedRecurring = [
        id,
        title ?? currentRow[1],
        amount ?? currentRow[2],
        category ?? currentRow[3],
        frequency ?? currentRow[4],
        dayOfMonth ?? currentRow[5] ?? '',
        nextDue ?? currentRow[6],
        isActive !== undefined ? (isActive ? 'true' : 'false') : currentRow[7],
        currentRow[8] || new Date().toISOString()
      ]

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${SHEET_NAME}!A${rowIndex + 2}:I${rowIndex + 2}`,
        valueInputOption: 'RAW',
        resource: {
          values: [updatedRecurring]
        }
      })

      return res.status(200).json({ ok: true })
    }

    if (req.method === 'DELETE') {
      const parsed = deleteSchema.safeParse({ id: req.body?.id || req.query?.id, reason: req.body?.reason })
      if (!parsed.success) {
        return res.status(400).json({ error: 'Lý do xóa là bắt buộc', details: parsed.error.flatten() })
      }

      const sheetId = await getSheetId(session.accessToken, spreadsheetId, SHEET_NAME)

      if (sheetId === null) {
        return res.status(404).json({ error: 'RecurringExpenses sheet not found' })
      }

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${SHEET_NAME}!A2:I`
      })

      const rows = response.data.values || []
      const rowIndex = rows.findIndex(row => row[0] === String(parsed.data.id))

      if (rowIndex === -1) {
        return res.status(404).json({ error: 'Recurring expense not found' })
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

      console.log(`✅ Deleted recurring expense: ${parsed.data.id}`)

      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Recurring Expenses API Error:', error)
    return res.status(500).json({ error: error.message })
  }
}
