import { getSheetsClient, getDriveClient } from './googleClient'

// In-memory cache for spreadsheet IDs (per serverless instance)
const spreadsheetCache = new Map() // email -> { id, timestamp }
const CACHE_TTL = 30 * 60 * 1000 // 30 minutes (increased to reduce API calls)

// In-memory lock to prevent race conditions within same instance
const creationLocks = new Map() // email -> Promise

// Persistent cache using global object (survives across hot reloads in dev)
// In production, each serverless instance will have its own cache
if (!global.__spreadsheetMapping) {
  global.__spreadsheetMapping = {}
}

/**
 * Search for user's spreadsheet using Google Drive API
 * This works on Vercel because it uses Google's servers, not local filesystem
 */
async function findUserSpreadsheet(accessToken, userEmail) {
  try {
    const drive = getDriveClient(accessToken)
    
    // Search for spreadsheet with user's email in the name
    const fileName = `FinTrack - ${userEmail}`
    console.log(`� Searching Drive for: "${fileName}"`)
    
    const response = await drive.files.list({
      q: `name contains '${fileName}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
      fields: 'files(id, name, createdTime)',
      orderBy: 'createdTime desc',
      pageSize: 10
    })
    
    const files = response.data.files || []
    console.log(`📊 Found ${files.length} spreadsheet(s) for ${userEmail}`)
    
    if (files.length > 0) {
      // Return the most recent one
      const spreadsheet = files[0]
      console.log(`✅ Using spreadsheet: ${spreadsheet.name} (ID: ${spreadsheet.id})`)
      return spreadsheet.id
    }
    
    return null
  } catch (error) {
    console.error('❌ Error searching Drive:', error.message)
    return null
  }
}

// Sheet names for different data types
export const SHEETS = {
  BUDGET_SUMMARY: 'Ngân sách',      // Budget overview with charts
  TRANSACTIONS: 'Chi tiết',          // Detailed transactions
  EXPENSES: 'Expenses',              // Keep old for migration
  DEBTS: 'Debts',                    // Keep old for migration
  DELETED_LOG: 'Deleted_Log',
  BUDGETS: 'Budgets',
  RECURRING_EXPENSES: 'RecurringExpenses',
  EXPORT_HISTORY: 'ExportHistory'
}

/**
 * Get or create spreadsheet for user
 * ✅ VERCEL-COMPATIBLE: Uses Google Drive API instead of local filesystem
 * 
 * Strategy:
 * 1. Check in-memory cache (per serverless instance)
 * 2. Search Google Drive for existing spreadsheet
 * 3. Create new spreadsheet if not found (with lock protection)
 */
export async function getOrCreateSpreadsheet(accessToken, userEmail) {
  console.log(`🔍 [getOrCreateSpreadsheet] User: ${userEmail}`)
  
  // Step 1: Check in-memory cache (fast path for same instance)
  const cached = spreadsheetCache.get(userEmail)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`⚡ Using cached spreadsheet: ${cached.id}`)
    return cached.id
  }
  
  // Step 1.5: Check global persistent cache
  if (global.__spreadsheetMapping[userEmail]) {
    const globalCached = global.__spreadsheetMapping[userEmail]
    console.log(`🌍 Using global cached spreadsheet: ${globalCached}`)
    spreadsheetCache.set(userEmail, { id: globalCached, timestamp: Date.now() })
    return globalCached
  }
  
  // Step 2: Check if another request in THIS instance is creating
  if (creationLocks.has(userEmail)) {
    console.log(`⏳ Another request in this instance is creating, waiting...`)
    try {
      const spreadsheetId = await creationLocks.get(userEmail)
      console.log(`✅ Got spreadsheet from concurrent request: ${spreadsheetId}`)
      return spreadsheetId
    } catch (error) {
      console.error(`❌ Concurrent creation failed:`, error.message)
    }
  }
  
  // Step 3: Search Google Drive for existing spreadsheet
  let spreadsheetId = await findUserSpreadsheet(accessToken, userEmail)
  
  if (spreadsheetId) {
    // Cache it in both memory and global
    spreadsheetCache.set(userEmail, { id: spreadsheetId, timestamp: Date.now() })
    global.__spreadsheetMapping[userEmail] = spreadsheetId
    console.log(`✅ Found existing spreadsheet: ${spreadsheetId}`)
    console.log(`💾 Cached in memory and global storage`)
    return spreadsheetId
  }
  
  // Step 4: Create new spreadsheet (with lock)
  console.log('📝 No spreadsheet found, creating new one...')
  
  const creationPromise = (async () => {
    try {
      console.log(`🔐 Acquired creation lock for ${userEmail}`)
      
      // Double-check: Search again in case another instance just created it
      const existingId = await findUserSpreadsheet(accessToken, userEmail)
      if (existingId) {
        console.log(`✅ Found spreadsheet created by another instance: ${existingId}`)
        spreadsheetCache.set(userEmail, { id: existingId, timestamp: Date.now() })
        return existingId
      }
      
      // Create new spreadsheet with FIXED name (no date) for easy searching
      const sheets = getSheetsClient(accessToken)
      const response = await sheets.spreadsheets.create({
        resource: {
          properties: {
            title: `FinTrack - ${userEmail}`,
          },
          sheets: [
            {
              properties: {
                title: SHEETS.BUDGET_SUMMARY,
                gridProperties: { frozenRowCount: 3 },
                tabColor: { red: 0.2, green: 0.6, blue: 0.9 }
              }
            },
            {
              properties: {
                title: SHEETS.TRANSACTIONS,
                gridProperties: { frozenRowCount: 1 },
                tabColor: { red: 0.9, green: 0.6, blue: 0.2 }
              }
            },
            {
              properties: {
                title: SHEETS.EXPENSES,
                gridProperties: { frozenRowCount: 1 }
              }
            },
            {
              properties: {
                title: SHEETS.DEBTS,
                gridProperties: { frozenRowCount: 1 }
              }
            }
          ]
        }
      })
      
      spreadsheetId = response.data.spreadsheetId
      console.log(`✅ Created spreadsheet: ${spreadsheetId}`)
      console.log(`📊 URL: https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`)
      
      // Cache immediately in both memory and global
      spreadsheetCache.set(userEmail, { id: spreadsheetId, timestamp: Date.now() })
      global.__spreadsheetMapping[userEmail] = spreadsheetId
      console.log(`💾 Cached new spreadsheet in memory and global storage`)
      
      // Initialize headers (non-blocking)
      try {
        await initializeSheets(accessToken, spreadsheetId)
      } catch (err) {
        console.warn('⚠️ Failed to initialize headers:', err.message)
      }
      
      return spreadsheetId
      
    } catch (error) {
      console.error('❌ Error creating spreadsheet:', error.message)
      throw error
    } finally {
      creationLocks.delete(userEmail)
      console.log(`🔓 Released creation lock for ${userEmail}`)
    }
  })()
  
  // Store promise to prevent duplicate creation in same instance
  creationLocks.set(userEmail, creationPromise)
  
  try {
    spreadsheetId = await creationPromise
    return spreadsheetId
  } catch (error) {
    console.error('❌ Error in creation promise:', error.message)
    throw error
  }
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

    await ensureSheet(accessToken, spreadsheetId, SHEETS.BUDGETS, [
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

    await ensureSheet(accessToken, spreadsheetId, SHEETS.RECURRING_EXPENSES, [
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

    await ensureSheet(accessToken, spreadsheetId, SHEETS.EXPORT_HISTORY, [
      'ID',
      'Filename',
      'Format',
      'Month',
      'Export Date',
      'File Size',
      'User Email'
    ])
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

    // Get all debts to find the row number and current values
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
    const current = rows[rowIndex] || []

    // Merge updates into full row to support editing all debt fields
    const updatedRow = [
      current[0] || String(debtId), // ID
      updates.person !== undefined ? updates.person : (current[1] || ''), // Person
      updates.amount !== undefined ? updates.amount : (current[2] || 0), // Amount
      updates.date !== undefined ? updates.date : (current[3] || ''), // Date
      updates.due !== undefined ? updates.due : (current[4] || ''), // Due Date
      updates.status !== undefined ? updates.status : (current[5] || 'i-owe'), // Status
      updates.monthlyPayment !== undefined ? updates.monthlyPayment : (current[6] || 0), // Monthly Payment
      updates.paymentDay !== undefined ? updates.paymentDay : (current[7] || ''), // Payment Day
      updates.totalPeriods !== undefined ? updates.totalPeriods : (current[8] || 1), // Total Periods
      updates.paidPeriods !== undefined ? updates.paidPeriods : (current[9] || 0), // Paid Periods
      updates.active !== undefined ? updates.active : (current[10] !== undefined ? current[10] : 0), // Active
      current[11] || new Date().toISOString() // Created At
    ]

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEETS.DEBTS}!A${rowNumber}:L${rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [updatedRow] }
    })

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
    // Initialize new sheets
    await initializeBudgetSummarySheet(accessToken, spreadsheetId)
    await initializeTransactionsSheet(accessToken, spreadsheetId)
    
    // Initialize old sheets for backward compatibility
    await initializeExpensesHeaders(accessToken, spreadsheetId)
    await initializeDebtsHeaders(accessToken, spreadsheetId)

    await ensureSheet(accessToken, spreadsheetId, SHEETS.BUDGETS, [
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

    await ensureSheet(accessToken, spreadsheetId, SHEETS.RECURRING_EXPENSES, [
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

    await ensureSheet(accessToken, spreadsheetId, SHEETS.EXPORT_HISTORY, [
      'ID',
      'Filename',
      'Format',
      'Month',
      'Export Date',
      'File Size',
      'User Email'
    ])
    
    // Only initialize Deleted_Log if the sheet exists
    // (It's created on-demand when first deletion happens)
    try {
      const sheets = getSheetsClient(accessToken)
      const response = await sheets.spreadsheets.get({
        spreadsheetId,
        fields: 'sheets.properties.title'
      })
      const sheetTitles = response.data.sheets.map(s => s.properties.title)
      
      if (sheetTitles.includes(SHEETS.DELETED_LOG)) {
        await initializeDeletedLogHeaders(accessToken, spreadsheetId)
      } else {
        console.log('ℹ️ Deleted_Log sheet not created yet, will be created on first deletion')
      }
    } catch (err) {
      console.warn('⚠️ Could not check/initialize Deleted_Log sheet:', err.message)
      // Don't throw - it's not critical
    }
    
    return { ok: true }
  } catch (error) {
    console.error('Error initializing sheets:', error)
    throw error
  }
}

/**
 * Initialize Budget Summary Sheet (Ngân sách)
 * Format theo hình: Biểu đồ + Bảng tổng hợp Chi phí/Thu nhập
 */
async function initializeBudgetSummarySheet(accessToken, spreadsheetId) {
  const sheets = getSheetsClient(accessToken)
  
  try {
    // Header and structure
    const data = [
      // Row 1: Title
      ['Ngân sách hàng tháng', '', '', '', 'Số dư đầu kỳ:', '1.000 đ'],
      // Row 2: Empty for spacing
      ['', '', '', '', '', ''],
      // Row 3: Subtitle with percentages
      ['SỐ DƯ ĐẦU KỲ', 'SỐ DƯ CUỐI KỲ', '', '', '+50%', 'Mức tăng đẳng dần xấp xỉ'],
      // Row 4: Values
      ['1.500 đ', '1.500 đ', '', '', '500 đ', 'Tất kiếm tháng này'],
      // Row 5: Empty
      ['', '', '', '', '', ''],
      // Row 6: Chi phí header
      ['Chi phí', '', '', 'Thu nhập', '', ''],
      // Row 7: Column headers
      ['', 'Dự kiến', 'Thực tế', 'Chênh lệch', '', 'Dự kiến', 'Thực tế', 'Chênh lệch'],
      // Row 8: Categories start
      ['Tổng', '950 đ', '1.000 đ', '-50 đ', '', '1.450 đ', '1.500 đ', '+50 đ'],
      ['Thực phẩm', '0 đ', '0 đ', '0 đ', 'Tiết kiệm', '0 đ', '0 đ', '0 đ'],
      ['Quà tặng', '0 đ', '0 đ', '0 đ', 'Chi phẩu trẻ lương', '1.450 đ', '1.500 đ', '+50 đ'],
      ['Sức khỏe và lành', '0 đ', '0 đ', '0 đ', 'Tiền thưởng', '0 đ', '0 đ', '0 đ'],
      ['Nhà', '950 đ', '1.000 đ', '-50 đ', 'Lãi', '0 đ', '0 đ', '0 đ'],
      ['Phương tiện vận chuyển', '0 đ', '0 đ', '0 đ', 'Khác', '0 đ', '0 đ', '0 đ'],
      ['Cá nhân', '0 đ', '0 đ', '0 đ', 'Đánh mục lựa chính', '0 đ', '0 đ', '0 đ'],
      ['Vật nuôi', '0 đ', '0 đ', '0 đ', '', '', '', ''],
      ['Dịch vụ công cộng', '0 đ', '0 đ', '0 đ', '', '', '', ''],
      ['Di lại', '0 đ', '0 đ', '0 đ', '', '', '', ''],
      ['Hộ', '0 đ', '0 đ', '0 đ', '', '', '', ''],
      ['Khác', '0 đ', '0 đ', '0 đ', '', '', '', ''],
      ['Đánh mục lựa chính 1', '0 đ', '0 đ', '0 đ', '', '', '', ''],
      ['Đánh mục lựa chính 2', '0 đ', '0 đ', '0 đ', '', '', '', ''],
      ['Đánh mục lựa chính 3', '0 đ', '0 đ', '0 đ', '', '', '', '']
    ]
    
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEETS.BUDGET_SUMMARY}!A1:H24`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: data }
    })
    
    // Format the sheet
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [
          // Merge title cell
          {
            mergeCells: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: 4
              },
              mergeType: 'MERGE_ALL'
            }
          },
          // Bold and center title
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: 4
              },
              cell: {
                userEnteredFormat: {
                  textFormat: { bold: true, fontSize: 14 },
                  horizontalAlignment: 'CENTER'
                }
              },
              fields: 'userEnteredFormat(textFormat,horizontalAlignment)'
            }
          },
          // Set column widths
          {
            updateDimensionProperties: {
              range: {
                sheetId: 0,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 8
              },
              properties: {
                pixelSize: 120
              },
              fields: 'pixelSize'
            }
          }
        ]
      }
    })
    
    console.log('✅ Budget Summary sheet initialized')
  } catch (error) {
    console.error('Error initializing Budget Summary:', error)
    throw error
  }
}

/**
 * Initialize Transactions Sheet (Chi tiết)
 * Format: Danh sách giao dịch chi tiết
 */
async function initializeTransactionsSheet(accessToken, spreadsheetId) {
  const sheets = getSheetsClient(accessToken)
  
  try {
    // Headers for transactions
    const headers = [[
      'Ngày',
      'Số tiền',
      'Mô tả',
      'Danh mục',
      'Chi phí',
      'Thu nhập',
      'Số dư'
    ]]
    
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEETS.TRANSACTIONS}!A1:G1`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: headers }
    })
    
    // Format header row
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 1,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: 7
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.2, green: 0.6, blue: 0.9 },
                  textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
                  horizontalAlignment: 'CENTER'
                }
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
            }
          },
          {
            updateDimensionProperties: {
              range: {
                sheetId: 1,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 7
              },
              properties: {
                pixelSize: 120
              },
              fields: 'pixelSize'
            }
          }
        ]
      }
    })
    
    console.log('✅ Transactions sheet initialized')
  } catch (error) {
    console.error('Error initializing Transactions:', error)
    throw error
  }
}

export async function getSheetId(accessToken, spreadsheetId, sheetTitle) {
  const sheets = getSheetsClient(accessToken)
  const metadata = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets.properties'
  })

  const sheet = metadata.data.sheets.find(
    s => s.properties.title === sheetTitle
  )

  return sheet?.properties?.sheetId ?? null
}

export async function ensureSheet(accessToken, spreadsheetId, sheetTitle, headers = null) {
  const sheets = getSheetsClient(accessToken)

  const metadata = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets.properties'
  })

  const existingSheet = metadata.data.sheets.find(
    s => s.properties.title === sheetTitle
  )

  if (!existingSheet) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [{
          addSheet: {
            properties: {
              title: sheetTitle,
              gridProperties: { frozenRowCount: 1 }
            }
          }
        }]
      }
    })
  }

  if (headers && headers.length > 0) {
    const headerRange = `${sheetTitle}!A1:${String.fromCharCode(64 + headers.length)}1`
    const headerData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: headerRange
    })

    if (!headerData.data.values || headerData.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: headerRange,
        valueInputOption: 'USER_ENTERED',
        resource: { values: [headers] }
      })
    }
  }
}
