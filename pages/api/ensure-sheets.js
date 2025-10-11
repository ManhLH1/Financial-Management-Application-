import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { getSheetsClient } from '../../lib/googleClient'
import { getOrCreateSpreadsheet } from '../../lib/sheetsHelper'

/**
 * API endpoint to ensure all required sheets exist
 * This will check and create missing sheets: RecurringExpenses, Budgets
 */
export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)

  if (!session?.accessToken) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const spreadsheetId = await getOrCreateSpreadsheet(session.accessToken, session.user.email)
    const sheets = getSheetsClient(session.accessToken)

    console.log('🔍 Checking existing sheets...')

    // Get all existing sheets
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId
    })

    const existingSheets = spreadsheet.data.sheets.map(sheet => sheet.properties.title)
    console.log('📊 Existing sheets:', existingSheets)

    // Required sheets with their headers
    const requiredSheets = {
      'RecurringExpenses': [
        ['id', 'title', 'amount', 'category', 'frequency', 'dayOfMonth', 'nextDue', 'isActive']
      ],
      'Budgets': [
        ['id', 'category', 'planned', 'spent', 'month', 'createdAt']
      ]
    }

    const sheetsToCreate = []
    const headersToAdd = []

    // Check which sheets are missing
    for (const [sheetName, headers] of Object.entries(requiredSheets)) {
      if (!existingSheets.includes(sheetName)) {
        console.log(`⚠️ Missing sheet: ${sheetName}`)
        sheetsToCreate.push(sheetName)
        headersToAdd.push({ sheetName, headers })
      } else {
        console.log(`✅ Sheet exists: ${sheetName}`)
      }
    }

    // Create missing sheets
    if (sheetsToCreate.length > 0) {
      console.log(`📝 Creating ${sheetsToCreate.length} missing sheet(s)...`)

      const requests = sheetsToCreate.map(sheetName => ({
        addSheet: {
          properties: {
            title: sheetName,
            gridProperties: {
              frozenRowCount: 1,
              rowCount: 1000,
              columnCount: 10
            },
            tabColor: sheetName === 'RecurringExpenses' 
              ? { red: 0.5, green: 0.8, blue: 1.0 }  // Light blue
              : { red: 0.4, green: 0.9, blue: 0.4 }  // Light green
          }
        }
      }))

      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: { requests }
      })

      console.log(`✅ Created sheets: ${sheetsToCreate.join(', ')}`)

      // Add headers to newly created sheets
      for (const { sheetName, headers } of headersToAdd) {
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${sheetName}!A1`,
          valueInputOption: 'RAW',
          resource: {
            values: headers
          }
        })
        console.log(`✅ Added headers to ${sheetName}`)
      }

      return res.status(200).json({
        success: true,
        message: `Created ${sheetsToCreate.length} missing sheet(s)`,
        created: sheetsToCreate,
        spreadsheetId,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`
      })
    } else {
      return res.status(200).json({
        success: true,
        message: 'All required sheets already exist',
        existing: existingSheets,
        spreadsheetId,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`
      })
    }

  } catch (error) {
    console.error('❌ Error ensuring sheets:', error)
    return res.status(500).json({
      error: 'Failed to ensure sheets',
      details: error.message
    })
  }
}
