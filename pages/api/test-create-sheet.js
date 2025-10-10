import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { getSheetsClient } from '../../lib/googleClient'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session || !session.accessToken) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Please login first'
    })
  }

  console.log('🧪 [TEST CREATE] Starting spreadsheet creation test')
  console.log('   User:', session.user.email)
  console.log('   Has access token:', !!session.accessToken)

  try {
    const sheets = getSheetsClient(session.accessToken)
    
    console.log('✅ Google Sheets client created')
    
    // Try to create a simple spreadsheet
    console.log('📝 Creating test spreadsheet...')
    
    const response = await sheets.spreadsheets.create({
      resource: {
        properties: {
          title: `TEST - ${session.user.email} - ${new Date().toISOString()}`,
        },
        sheets: [
          {
            properties: {
              title: 'Test Sheet',
              gridProperties: {
                rowCount: 100,
                columnCount: 10
              }
            }
          }
        ]
      }
    })
    
    const spreadsheetId = response.data.spreadsheetId
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`
    
    console.log('✅ TEST SPREADSHEET CREATED!')
    console.log('   ID:', spreadsheetId)
    console.log('   URL:', url)
    
    // Try to write some data
    console.log('📝 Writing test data...')
    
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Test Sheet!A1:C1',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [['Test', 'Data', 'Success!']]
      }
    })
    
    console.log('✅ Test data written successfully!')
    
    return res.status(200).json({
      success: true,
      message: '✅ Spreadsheet created successfully!',
      spreadsheetId,
      url,
      user: session.user.email,
      timestamp: new Date().toISOString(),
      instructions: [
        '1. Open the URL above to see your test spreadsheet',
        '2. If this works, the create function is working correctly',
        '3. The issue might be in the getOrCreateSpreadsheet logic',
        '4. Check the terminal logs for more details'
      ]
    })
    
  } catch (error) {
    console.error('❌ [TEST CREATE] Error:', error)
    console.error('   Code:', error.code)
    console.error('   Status:', error.status)
    console.error('   Message:', error.message)
    console.error('   Details:', JSON.stringify(error.errors || [], null, 2))
    
    return res.status(500).json({
      error: 'Failed to create spreadsheet',
      code: error.code,
      status: error.status,
      message: error.message,
      details: error.errors,
      possibleCauses: [
        '❌ Access token expired or invalid',
        '❌ Missing OAuth scope: https://www.googleapis.com/auth/spreadsheets',
        '❌ User did not grant permission to create spreadsheets',
        '❌ Google API quota exceeded',
        '❌ Network/connectivity issue'
      ],
      solutions: [
        '1. Sign out and sign in again',
        '2. Make sure to approve all permissions during OAuth',
        '3. Check that GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct',
        '4. Verify OAuth consent screen settings in Google Cloud Console'
      ]
    })
  }
}
