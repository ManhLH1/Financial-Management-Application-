import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { getSheetsClient } from '../../lib/googleClient'

const SHEET_NAME = 'ExportHistory'

/**
 * API endpoint for Export History
 * GET - Get all export history
 * POST - Add new export record
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
      // Get all export history
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${SHEET_NAME}!A2:F`
      })

      const rows = response.data.values || []
      const history = rows.map(row => ({
        id: row[0],
        filename: row[1],
        format: row[2],
        month: row[3],
        exportDate: row[4],
        fileSize: row[5]
      }))

      return res.status(200).json({ history })
    }

    if (req.method === 'POST') {
      // Add new export record
      const { filename, format, month, fileSize } = req.body

      const newRecord = [
        Date.now().toString(),
        filename,
        format,
        month,
        new Date().toISOString(),
        fileSize || 'N/A'
      ]

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${SHEET_NAME}!A:F`,
        valueInputOption: 'RAW',
        resource: {
          values: [newRecord]
        }
      })

      return res.status(200).json({ 
        success: true, 
        message: 'Export history saved',
        record: {
          id: newRecord[0],
          filename: newRecord[1],
          format: newRecord[2],
          month: newRecord[3],
          exportDate: newRecord[4],
          fileSize: newRecord[5]
        }
      })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Export History API Error:', error)
    return res.status(500).json({ error: error.message })
  }
}
