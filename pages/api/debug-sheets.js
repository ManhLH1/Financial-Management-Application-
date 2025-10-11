import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { getSheetsClient } from '../../lib/googleClient'
import { getOrCreateSpreadsheet } from '../../lib/sheetsHelper'

/**
 * Debug endpoint to check existing sheets
 */
export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)

  if (!session?.accessToken) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  try {
    const spreadsheetId = await getOrCreateSpreadsheet(session.accessToken, session.user.email)
    const sheets = getSheetsClient(session.accessToken)

    console.log('🔍 Checking spreadsheet:', spreadsheetId)

    // Get spreadsheet metadata to see all sheets
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId
    })

    const sheetsList = spreadsheet.data.sheets.map(sheet => ({
      title: sheet.properties.title,
      sheetId: sheet.properties.sheetId,
      index: sheet.properties.index,
      rowCount: sheet.properties.gridProperties.rowCount,
      columnCount: sheet.properties.gridProperties.columnCount
    }))

    console.log('📊 Sheets found:', sheetsList)

    // Try to read from RecurringExpenses
    let recurringData = null
    let recurringError = null
    
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'RecurringExpenses!A1:H10'
      })
      recurringData = response.data.values || []
    } catch (err) {
      recurringError = err.message
    }

    return res.status(200).json({
      spreadsheetId,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
      totalSheets: sheetsList.length,
      sheets: sheetsList,
      recurringExpensesSheet: {
        exists: sheetsList.some(s => s.title === 'RecurringExpenses'),
        data: recurringData,
        error: recurringError
      }
    })

  } catch (error) {
    console.error('❌ Debug error:', error)
    return res.status(500).json({
      error: 'Debug failed',
      details: error.message
    })
  }
}
