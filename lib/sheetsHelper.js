import { getSheetsClient } from './googleClient'
import fs from 'fs'
import path from 'path'

// Simple per-user spreadsheet mapping persisted to disk to avoid using a single global env var
const MAPPING_DIR = path.join(process.cwd(), '.data')
const MAPPING_FILE = path.join(MAPPING_DIR, 'spreadsheets.json')

function readSpreadsheetMapping() {
  try {
    if (!fs.existsSync(MAPPING_FILE)) return {}
    const raw = fs.readFileSync(MAPPING_FILE, 'utf8')
    return JSON.parse(raw || '{}')
  } catch (err) {
    console.warn('Could not read spreadsheet mapping file:', err.message)
    return {}
  }
}

function writeSpreadsheetMapping(map) {
  try {
    fs.mkdirSync(MAPPING_DIR, { recursive: true })
    fs.writeFileSync(MAPPING_FILE, JSON.stringify(map, null, 2), 'utf8')
  } catch (err) {
    console.warn('Could not write spreadsheet mapping file:', err.message)
  }
}

// Sheet names for different data types
export const SHEETS = {
  EXPENSES: 'Expenses',
  DEBTS: 'Debts',
  DELETED_LOG: 'Deleted_Log'
}

/**
 * Get or create spreadsheet for user
 * Stores spreadsheet ID in a simple JSON file per user
 */
export async function getOrCreateSpreadsheet(accessToken, userEmail) {
  const sheets = getSheetsClient(accessToken)
  
  // Try to get existing spreadsheet ID: prefer a per-user mapping, fallback to environment
  const mapping = readSpreadsheetMapping()
  let spreadsheetId = mapping[userEmail] || process.env.GOOGLE_SHEET_ID
  
  // Check if spreadsheetId is valid (not placeholder)
  if (!spreadsheetId || spreadsheetId === 'YOUR_SPREADSHEET_ID_HERE' || spreadsheetId.trim() === '') {
    console.log('📝 No valid spreadsheet ID found, creating new spreadsheet...')
    // Create new spreadsheet
    try {
      const response = await sheets.spreadsheets.create({
        resource: {
          properties: {
            title: `Expense Manager - ${userEmail}`,
          },
          sheets: [
            {
              properties: {
                title: SHEETS.EXPENSES,
                gridProperties: {
                  frozenRowCount: 1
                }
              }
            },
            {
              properties: {
                title: SHEETS.DEBTS,
                gridProperties: {
                  frozenRowCount: 1
                }
              }
            }
          ]
        }
      })
      
      spreadsheetId = response.data.spreadsheetId
      
      // Initialize headers
      await initializeSheets(accessToken, spreadsheetId)
      
      // Persist mapping for this user so we reuse the same spreadsheet next time
      try {
        mapping[userEmail] = spreadsheetId
        writeSpreadsheetMapping(mapping)
      } catch (err) {
        console.warn('Failed to persist spreadsheetId mapping:', err.message)
      }
      
      console.log(`✅ Created new spreadsheet: ${spreadsheetId}`)
      console.log(`📊 URL: https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`)
      console.log(`💡 TIP: Add this to your .env.local file to reuse:`)
      console.log(`   GOOGLE_SHEET_ID=${spreadsheetId}`)
      
      return spreadsheetId
    } catch (error) {
      console.error('Error creating spreadsheet:', error)
      throw error
    }
  }
  
  // Verify spreadsheet exists and has correct structure
  console.log(`🔍 Checking if spreadsheet exists: ${spreadsheetId}`)
  
  try {
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'sheets.properties'
    })
    
    console.log(`✅ Spreadsheet exists: ${spreadsheetId}`)
    console.log(`📊 URL: https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`)
    
    const sheetTitles = response.data.sheets.map(s => s.properties.title)
    console.log(`📋 Found sheets: ${sheetTitles.join(', ')}`)
    
    // Check if required sheets exist
    if (!sheetTitles.includes(SHEETS.EXPENSES)) {
      console.log(`➕ Creating missing sheet: ${SHEETS.EXPENSES}`)
      await createSheet(accessToken, spreadsheetId, SHEETS.EXPENSES)
    }
    
    if (!sheetTitles.includes(SHEETS.DEBTS)) {
      console.log(`➕ Creating missing sheet: ${SHEETS.DEBTS}`)
      await createSheet(accessToken, spreadsheetId, SHEETS.DEBTS)
    }
    
    // Ensure headers exist
    await ensureHeaders(accessToken, spreadsheetId)
    
  } catch (error) {
    console.error('❌ Error verifying spreadsheet:', error.message)
    
    // If spreadsheet doesn't exist, create new one
    if (error.code === 404 || error.status === 404 || error.message?.includes('not found')) {
      console.log('📝 Spreadsheet not found, creating new one...')
      // Clear invalid ID for this user and create new
      try {
        if (mapping[userEmail]) {
          delete mapping[userEmail]
          writeSpreadsheetMapping(mapping)
        }
      } catch (err) {
        console.warn('Failed to clear spreadsheet mapping:', err.message)
      }
      return await getOrCreateSpreadsheet(accessToken, userEmail)
    }
    
    throw error
  }
  
  console.log(`✅ Spreadsheet ready: ${spreadsheetId}`)
  return spreadsheetId
}

/**
 * Create a new sheet in existing spreadsheet
 */
async function createSheet(accessToken, spreadsheetId, sheetTitle) {
  const sheets = getSheetsClient(accessToken)
  
  try {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [{
          addSheet: {
            properties: {
              title: sheetTitle,
              gridProperties: {
                frozenRowCount: 1
              }
            }
          }
        }]
      }
    })
    
    console.log(`✅ Created sheet: ${sheetTitle}`)
  } catch (error) {
    console.error(`Error creating sheet ${sheetTitle}:`, error)
    throw error
  }
}

/**
 * Ensure headers exist in all sheets
 */
async function ensureHeaders(accessToken, spreadsheetId) {
  const sheets = getSheetsClient(accessToken)
  
  try {
    // Check Expenses sheet
    const expensesData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEETS.EXPENSES}!A1:G1`
    })
    
    if (!expensesData.data.values || expensesData.data.values.length === 0) {
      await initializeExpensesHeaders(accessToken, spreadsheetId)
    } else {
      // Run migration if needed
      await migrateExpensesData(accessToken, spreadsheetId)
    }
    
    // Check Debts sheet
    const debtsData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEETS.DEBTS}!A1:G1`
    })
    
    if (!debtsData.data.values || debtsData.data.values.length === 0) {
      await initializeDebtsHeaders(accessToken, spreadsheetId)
    }
  } catch (error) {
    // If error reading, initialize headers
    await initializeSheets(accessToken, spreadsheetId)
  }
}

/**
 * Initialize headers for Expenses sheet
 */
async function initializeExpensesHeaders(accessToken, spreadsheetId) {
  const sheets = getSheetsClient(accessToken)
  
  const headers = [['ID', 'Title', 'Amount', 'Category', 'Date', 'Type', 'Active', 'Created At']]
  
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SHEETS.EXPENSES}!A1:H1`,
    valueInputOption: 'USER_ENTERED',
    resource: { values: headers }
  })
  
  console.log('✅ Expenses headers initialized')
}

/**
 * Migrate existing data to new structure with Type column
 */
async function migrateExpensesData(accessToken, spreadsheetId) {
  try {
    const sheets = getSheetsClient(accessToken)
    
    console.log('🔄 Checking if migration is needed...')
    
    // Read all existing data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEETS.EXPENSES}!A1:H`
    })
    
    const rows = response.data.values || []
    
    if (rows.length === 0) {
      console.log('✅ No data to migrate')
      return
    }
    
    // Check if Active column exists in header
    const header = rows[0]
    const hasActiveColumn = header.length === 8 && header[6] === 'Active'
    
    if (hasActiveColumn) {
      console.log('✅ Data structure is already up to date')
      return
    }
    
    console.log('🔄 Migrating data structure...')
    
    // Migration path: Add Active column (Active = 0 for all existing data)
    // Old structure: ID, Title, Amount, Category, Date, Type, Created At (7 columns)
    // New structure: ID, Title, Amount, Category, Date, Type, Active, Created At (8 columns)
    
    const migratedData = rows.map((row, index) => {
      if (index === 0) {
        // Update header
        return ['ID', 'Title', 'Amount', 'Category', 'Date', 'Type', 'Active', 'Created At']
      }
      
      if (row.length === 6) {
        // Very old format: insert 'expense' as default type and Active = 0
        return [
          row[0], // ID
          row[1], // Title
          row[2], // Amount
          row[3], // Category
          row[4], // Date
          'expense', // Type (default)
          0, // Active = 0 (hiển thị)
          row[5]  // Created At
        ]
      } else if (row.length === 7) {
        // Previous format: insert Active = 0
        return [
          row[0], // ID
          row[1], // Title
          row[2], // Amount
          row[3], // Category
          row[4], // Date
          row[5], // Type
          0, // Active = 0 (hiển thị)
          row[6]  // Created At
        ]
      } else if (row.length === 8) {
        // Already has 8 columns, keep as is
        return row
      } else {
        // Handle incomplete rows
        return row
      }
    })
    
    // Write back the migrated data
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEETS.EXPENSES}!A1:H${migratedData.length}`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: migratedData }
    })
    
    console.log(`✅ Migrated ${migratedData.length - 1} rows to new structure with Active column`)
    
  } catch (error) {
    console.error('❌ Error during migration:', error)
    // Don't throw - allow app to continue even if migration fails
  }
}

/**
 * Initialize headers for Debts sheet
 */
async function initializeDebtsHeaders(accessToken, spreadsheetId) {
  const sheets = getSheetsClient(accessToken)
  
  const headers = [['ID', 'Person', 'Amount', 'Date', 'Due Date', 'Status', 'Monthly Payment', 'Payment Day', 'Total Periods', 'Paid Periods', 'Active', 'Created At']]
  
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SHEETS.DEBTS}!A1:L1`,
    valueInputOption: 'USER_ENTERED',
    resource: { values: headers }
  })
  
  console.log('✅ Debts headers initialized')
}

/**
 * Add expense to Google Sheet
 */
export async function addExpenseToSheet(accessToken, spreadsheetId, expense) {
  try {
    const sheets = getSheetsClient(accessToken)
    
    const values = [[
      expense.id,
      expense.title,
      expense.amount,
      expense.category,
      expense.date,
      expense.type || 'expense',
      0, // Active = 0 (hiển thị)
      new Date().toISOString()
    ]]
    
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${SHEETS.EXPENSES}!A:H`,
      valueInputOption: 'USER_ENTERED',
      resource: { values }
    })
    
    return response.data
  } catch (error) {
    console.error('Error adding expense to sheet:', error)
    throw error
  }
}

/**
 * Get expenses from Google Sheet
 */
export async function getExpensesFromSheet(accessToken, spreadsheetId) {
  try {
    const sheets = getSheetsClient(accessToken)
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEETS.EXPENSES}!A2:H`
    })
    
    const rows = response.data.values || []
    return rows
      .filter(row => row[6] === '0' || row[6] === 0) // Chỉ lấy Active = 0
      .map(row => ({
        id: row[0],
        title: row[1],
        amount: Number(row[2]),
        category: row[3],
        date: row[4],
        type: row[5] || 'expense',
        active: row[6],
        createdAt: row[7]
      }))
  } catch (error) {
    console.error('Error getting expenses from sheet:', error)
    throw error
  }
}

/**
 * Update expense in Google Sheet
 */
export async function updateExpenseInSheet(accessToken, spreadsheetId, expenseId, updates) {
  try {
    const sheets = getSheetsClient(accessToken)
    
    // Get all expenses to find the row number
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEETS.EXPENSES}!A2:H`
    })
    
    const rows = response.data.values || []
    const rowIndex = rows.findIndex(row => row[0] === String(expenseId))
    
    if (rowIndex === -1) {
      throw new Error('Expense not found')
    }
    
    // Update the entire row (row number is rowIndex + 2 because of header and 0-index)
    const rowNumber = rowIndex + 2
    const currentRow = rows[rowIndex]
    
    const updatedRow = [
      currentRow[0], // ID stays same
      updates.title !== undefined ? updates.title : currentRow[1],
      updates.amount !== undefined ? updates.amount : currentRow[2],
      updates.category !== undefined ? updates.category : currentRow[3],
      updates.date !== undefined ? updates.date : currentRow[4],
      updates.type !== undefined ? updates.type : (currentRow[5] || 'expense'),
      updates.active !== undefined ? updates.active : (currentRow[6] || 0), // Active
      currentRow[7] // Created at stays same
    ]
    
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEETS.EXPENSES}!A${rowNumber}:H${rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [updatedRow]
      }
    })
    
    return { ok: true }
  } catch (error) {
    console.error('Error updating expense in sheet:', error)
    throw error
  }
}

/**
 * Delete expense from Google Sheet
 */
export async function deleteExpenseFromSheet(accessToken, spreadsheetId, expenseId, reason) {
  try {
    const sheets = getSheetsClient(accessToken)
    
    // Get all expenses to find the row number
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEETS.EXPENSES}!A2:H`
    })
    
    const rows = response.data.values || []
    const rowIndex = rows.findIndex(row => row[0] === String(expenseId))
    
    if (rowIndex === -1) {
      throw new Error('Expense not found')
    }
    
    // Get the expense data before marking as deleted
    const expenseData = rows[rowIndex]
    
    // Log the deletion to Deleted_Log sheet first
    await logDeletedExpense(accessToken, spreadsheetId, expenseData, reason)
    
    // Update the row to set Active = 1 (soft delete)
    const rowNumber = rowIndex + 2 // +2 because of header and 0-index
    const updatedRow = [
      expenseData[0], // ID
      expenseData[1], // Title
      expenseData[2], // Amount
      expenseData[3], // Category
      expenseData[4], // Date
      expenseData[5], // Type
      1, // Active = 1 (ẩn)
      expenseData[7] // Created At
    ]
    
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEETS.EXPENSES}!A${rowNumber}:H${rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [updatedRow]
      }
    })
    
    return { ok: true }
  } catch (error) {
    console.error('Error deleting expense from sheet:', error)
    throw error
  }
}

/**
 * Add debt to Google Sheet
 */
export async function addDebtToSheet(accessToken, spreadsheetId, debt) {
  try {
    const sheets = getSheetsClient(accessToken)
    
    const values = [[
      debt.id,
      debt.person,
      debt.amount,
      debt.date,
      debt.due,
      debt.status,
      debt.monthlyPayment || 0,
      debt.paymentDay || '',
      debt.totalPeriods || 1,
      debt.paidPeriods || 0,
      0, // Active = 0 (hiển thị)
      new Date().toISOString()
    ]]
    
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${SHEETS.DEBTS}!A:L`,
      valueInputOption: 'USER_ENTERED',
      resource: { values }
    })
    
    return response.data
  } catch (error) {
    console.error('Error adding debt to sheet:', error)
    throw error
  }
}

/**
 * Get debts from Google Sheet
 */
export async function getDebtsFromSheet(accessToken, spreadsheetId) {
  try {
    const sheets = getSheetsClient(accessToken)
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEETS.DEBTS}!A2:L`
    })
    
    const rows = response.data.values || []
    return rows
      .filter(row => row[10] === '0' || row[10] === 0) // Chỉ lấy Active = 0
      .map(row => ({
        id: row[0],
        person: row[1],
        amount: Number(row[2]),
        date: row[3],
        due: row[4],
        status: row[5],
        monthlyPayment: Number(row[6]) || 0,
        paymentDay: row[7] || '',
        totalPeriods: Number(row[8]) || 1,
        paidPeriods: Number(row[9]) || 0,
        active: row[10],
        createdAt: row[11]
      }))
  } catch (error) {
    console.error('Error getting debts from sheet:', error)
    throw error
  }
}

/**
 * Update debt in Google Sheet
 */
export async function updateDebtInSheet(accessToken, spreadsheetId, debtId, updates) {
  try {
    const sheets = getSheetsClient(accessToken)
    
    // Get all debts to find the row number
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEETS.DEBTS}!A2:L`
    })
    
    const rows = response.data.values || []
    const rowIndex = rows.findIndex(row => row[0] === String(debtId))
    
    if (rowIndex === -1) {
      throw new Error('Debt not found')
    }
    
    const rowNumber = rowIndex + 2
    
    // Update specific columns
    if (updates.status !== undefined) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${SHEETS.DEBTS}!F${rowNumber}`,
        valueInputOption: 'USER_ENTERED',
        resource: { values: [[updates.status]] }
      })
    }
    
    if (updates.paidPeriods !== undefined) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${SHEETS.DEBTS}!J${rowNumber}`,
        valueInputOption: 'USER_ENTERED',
        resource: { values: [[updates.paidPeriods]] }
      })
    }
    
    if (updates.active !== undefined) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${SHEETS.DEBTS}!K${rowNumber}`,
        valueInputOption: 'USER_ENTERED',
        resource: { values: [[updates.active]] }
      })
    }
    
    return { ok: true }
  } catch (error) {
    console.error('Error updating debt in sheet:', error)
    throw error
  }
}

/**
 * Delete debt from Google Sheet (soft delete by setting Active = 1)
 */
export async function deleteDebtFromSheet(accessToken, spreadsheetId, debtId, reason) {
  try {
    const sheets = getSheetsClient(accessToken)
    
    // Get all debts to find the row number
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEETS.DEBTS}!A2:L`
    })
    
    const rows = response.data.values || []
    const rowIndex = rows.findIndex(row => row[0] === String(debtId))
    
    if (rowIndex === -1) {
      throw new Error('Debt not found')
    }
    
    // Get the debt data before marking as deleted
    const debtData = rows[rowIndex]
    
    // Update the row to set Active = 1 (soft delete)
    const rowNumber = rowIndex + 2 // +2 because of header and 0-index
    const updatedRow = [
      debtData[0], // ID
      debtData[1], // Person
      debtData[2], // Amount
      debtData[3], // Date
      debtData[4], // Due Date
      debtData[5], // Status
      debtData[6], // Monthly Payment
      debtData[7], // Payment Day
      debtData[8], // Total Periods
      debtData[9], // Paid Periods
      1, // Active = 1 (ẩn)
      debtData[11] // Created At
    ]
    
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEETS.DEBTS}!A${rowNumber}:L${rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [updatedRow]
      }
    })
    
    console.log(`Debt ${debtId} marked as deleted (Active=1)`)
    return { ok: true }
  } catch (error) {
    console.error('Error deleting debt from sheet:', error)
    throw error
  }
}

/**
 * Ensure a sheet exists in the spreadsheet
 */
async function ensureSheetExists(accessToken, spreadsheetId, sheetTitle) {
  try {
    const sheets = getSheetsClient(accessToken)
    
    // Get existing sheets
    const sheetMetadata = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'sheets.properties'
    })
    
    const existingSheet = sheetMetadata.data.sheets.find(
      s => s.properties.title === sheetTitle
    )
    
    if (existingSheet) {
      return // Sheet already exists
    }
    
    // Create the sheet
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [{
          addSheet: {
            properties: {
              title: sheetTitle,
            }
          }
        }]
      }
    })
    
    console.log(`Created sheet: ${sheetTitle}`)
  } catch (error) {
    console.error(`Error ensuring sheet ${sheetTitle} exists:`, error)
    throw error
  }
}

/**
 * Log deleted expense to audit trail
 */
async function logDeletedExpense(accessToken, spreadsheetId, expenseData, reason) {
  try {
    const sheets = getSheetsClient(accessToken)
    
    // Ensure Deleted_Log sheet exists
    await ensureSheetExists(accessToken, spreadsheetId, SHEETS.DELETED_LOG)
    
    // Initialize headers if needed
    await initializeDeletedLogHeaders(accessToken, spreadsheetId)
    
    // Prepare deleted expense data
    const deletedAt = new Date().toISOString()
    const logEntry = [
      expenseData[0], // Original ID
      expenseData[1], // Title
      expenseData[2], // Amount
      expenseData[3], // Category
      expenseData[4], // Date
      expenseData[5], // Type
      expenseData[7], // Original Created At (moved before reason)
      reason,         // Delete Reason
      deletedAt       // Deleted At
    ]
    
    // Add to Deleted_Log sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${SHEETS.DELETED_LOG}!A:I`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [logEntry]
      }
    })
    
    console.log(`Logged deleted expense ${expenseData[0]} to audit trail`)
  } catch (error) {
    console.error('Error logging deleted expense:', error)
    throw error
  }
}

/**
 * Initialize Deleted_Log sheet headers
 */
async function initializeDeletedLogHeaders(accessToken, spreadsheetId) {
  try {
    const sheets = getSheetsClient(accessToken)
    
    // Always update headers to ensure correct structure
    const headers = [
      'Original ID',
      'Title', 
      'Amount',
      'Category',
      'Date',
      'Type',
      'Original Created At',
      'Delete Reason',
      'Deleted At'
    ]
    
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEETS.DELETED_LOG}!A1:I1`,
      valueInputOption: 'RAW',
      resource: {
        values: [headers]
      }
    })
    
    console.log('Updated Deleted_Log sheet headers')
  } catch (error) {
    console.error('Error initializing Deleted_Log headers:', error)
    throw error
  }
}

/**
 * Initialize sheets with headers if they don't exist
 */
export async function initializeSheets(accessToken, spreadsheetId) {
  try {
    await initializeExpensesHeaders(accessToken, spreadsheetId)
    await initializeDebtsHeaders(accessToken, spreadsheetId)
    await initializeDeletedLogHeaders(accessToken, spreadsheetId)
    
    return { ok: true }
  } catch (error) {
    console.error('Error initializing sheets:', error)
    throw error
  }
}
