import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { getOrCreateSpreadsheet } from '../../lib/sheetsHelper'
import { getSheetsClient } from '../../lib/googleClient'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session || !session.accessToken) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Bạn cần đăng nhập để sử dụng tính năng này'
    })
  }

  const { method } = req

  // GET: Check existing spreadsheet
  if (method === 'GET') {
    try {
      console.log('🔍 [DEBUG] Checking spreadsheet for user:', session.user.email)
      
      const spreadsheetId = await getOrCreateSpreadsheet(
        session.accessToken, 
        session.user.email
      )
      
      // Get spreadsheet details
      const sheets = getSheetsClient(session.accessToken)
      const response = await sheets.spreadsheets.get({
        spreadsheetId,
        fields: 'spreadsheetId,properties,sheets.properties'
      })
      
      const sheetTitles = response.data.sheets.map(s => s.properties.title)
      
      return res.status(200).json({
        success: true,
        spreadsheetId,
        url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
        title: response.data.properties.title,
        sheets: sheetTitles,
        message: '✅ Spreadsheet đã tồn tại và có thể truy cập'
      })
    } catch (error) {
      console.error('❌ [DEBUG] Error checking spreadsheet:', error)
      
      return res.status(500).json({
        error: 'Failed to check spreadsheet',
        message: error.message,
        details: {
          code: error.code,
          status: error.status,
          errors: error.errors
        }
      })
    }
  }

  // POST: Force create new spreadsheet
  if (method === 'POST') {
    try {
      console.log('➕ [DEBUG] Creating new spreadsheet for user:', session.user.email)
      
      const sheets = getSheetsClient(session.accessToken)
      
      // Create new spreadsheet
      const response = await sheets.spreadsheets.create({
        resource: {
          properties: {
            title: `FinTrack - ${session.user.email} - ${new Date().toISOString().split('T')[0]}`,
          },
          sheets: [
            {
              properties: {
                title: 'Expenses',
                gridProperties: {
                  frozenRowCount: 1
                }
              }
            },
            {
              properties: {
                title: 'Debts',
                gridProperties: {
                  frozenRowCount: 1
                }
              }
            },
            {
              properties: {
                title: 'Deleted_Log',
                gridProperties: {
                  frozenRowCount: 1
                }
              }
            }
          ]
        }
      })
      
      const spreadsheetId = response.data.spreadsheetId
      
      // Initialize headers
      // Expenses headers
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Expenses!A1:H1',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [['ID', 'Title', 'Amount', 'Category', 'Date', 'Type', 'Active', 'Created At']]
        }
      })
      
      // Debts headers
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Debts!A1:G1',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [['ID', 'Title', 'Amount', 'Date', 'Due Date', 'Status', 'Created At']]
        }
      })
      
      // Deleted_Log headers
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Deleted_Log!A1:E1',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [['Deleted At', 'Type', 'ID', 'Title', 'Reason']]
        }
      })
      
      console.log('✅ [DEBUG] Successfully created spreadsheet:', spreadsheetId)
      
      return res.status(201).json({
        success: true,
        spreadsheetId,
        url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
        title: response.data.properties.title,
        message: '✅ Đã tạo spreadsheet mới thành công!',
        instructions: {
          step1: 'Copy Spreadsheet ID bên dưới',
          step2: 'Thêm vào file .env.local:',
          envVariable: `GOOGLE_SHEET_ID=${spreadsheetId}`
        }
      })
    } catch (error) {
      console.error('❌ [DEBUG] Error creating spreadsheet:', error)
      
      return res.status(500).json({
        error: 'Failed to create spreadsheet',
        message: error.message,
        details: {
          code: error.code,
          status: error.status,
          errors: error.errors
        },
        possibleReasons: [
          'Access token đã hết hạn',
          'Không có quyền tạo spreadsheet',
          'Scopes không đủ (cần: https://www.googleapis.com/auth/spreadsheets)',
          'Google API quotas đã vượt quá giới hạn'
        ]
      })
    }
  }

  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).end(`Method ${method} Not Allowed`)
}
