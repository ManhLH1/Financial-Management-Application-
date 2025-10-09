import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { getSheetsClient } from '../../lib/googleClient'

const SHEETS = {
  EXPENSES: 'Expenses',
  DEBTS: 'Debts'
}

/**
 * Migrate existing data to new 7-column structure
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    
    if (!session?.accessToken) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const spreadsheetId = process.env.GOOGLE_SHEET_ID
    
    if (!spreadsheetId) {
      return res.status(400).json({ error: 'No spreadsheet ID configured' })
    }

    const sheets = getSheetsClient(session.accessToken)
    
    console.log('🔄 Starting data migration...')
    
    // Read all existing data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEETS.EXPENSES}!A1:G`
    })
    
    const rows = response.data.values || []
    
    if (rows.length === 0) {
      return res.status(200).json({ 
        message: 'No data to migrate',
        rowsMigrated: 0
      })
    }
    
    // Check if Type column exists in header
    const header = rows[0]
    const hasTypeColumn = header.length === 7 && header[5] === 'Type'
    
    if (hasTypeColumn) {
      // Check if any data rows need migration
      let needsMigration = false
      for (let i = 1; i < rows.length; i++) {
        if (rows[i].length === 6) {
          needsMigration = true
          break
        }
      }
      
      if (!needsMigration) {
        return res.status(200).json({ 
          message: 'Data structure is already up to date',
          rowsMigrated: 0
        })
      }
    }
    
    console.log('🔄 Migrating data structure...')
    
    // Old structure: ID, Title, Amount, Category, Date, Created At (6 columns)
    // New structure: ID, Title, Amount, Category, Date, Type, Created At (7 columns)
    
    const migratedData = rows.map((row, index) => {
      if (index === 0) {
        // Update header
        return ['ID', 'Title', 'Amount', 'Category', 'Date', 'Type', 'Created At']
      }
      
      if (row.length === 6) {
        // Old format: insert 'expense' as default type
        return [
          row[0], // ID
          row[1], // Title
          row[2], // Amount
          row[3], // Category
          row[4], // Date
          'expense', // Type (default)
          row[5]  // Created At
        ]
      } else if (row.length === 7) {
        // Already has 7 columns, keep as is
        return row
      } else {
        // Handle incomplete rows - pad with empty strings
        const paddedRow = [...row]
        while (paddedRow.length < 7) {
          paddedRow.push('')
        }
        return paddedRow
      }
    })
    
    // Write back the migrated data
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEETS.EXPENSES}!A1:G${migratedData.length}`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: migratedData }
    })
    
    const rowsMigrated = migratedData.length - 1
    
    console.log(`✅ Migrated ${rowsMigrated} rows to new structure`)
    
    return res.status(200).json({ 
      message: 'Migration completed successfully',
      rowsMigrated,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`
    })
    
  } catch (error) {
    console.error('❌ Error during migration:', error)
    return res.status(500).json({ 
      error: 'Migration failed',
      details: error.message 
    })
  }
}
