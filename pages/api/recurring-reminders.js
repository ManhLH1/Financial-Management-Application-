import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { getSheetsClient } from '../../lib/googleClient'
import { getOrCreateSpreadsheet, SHEETS, ensureSheet } from '../../lib/sheetsHelper'
import { sendEmail } from '../../lib/emailHelper'

const SHEET_NAME = SHEETS.RECURRING_EXPENSES

/**
 * API endpoint for Recurring Expenses Reminders
 * Checks upcoming recurring expenses and sends email reminders 3 days before due date
 */
export default async function handler(req, res) {
  // Allow cron job without session for automated checks
  const session = await getServerSession(req, res, authOptions)

  if (!session?.accessToken) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  try {
    if (req.method === 'POST') {
      // Get user's spreadsheet
      const spreadsheetId = await getOrCreateSpreadsheet(session.accessToken, session.user.email)
      const sheets = getSheetsClient(session.accessToken)
      
      console.log(`🔔 [Recurring Reminders] Using spreadsheet: ${spreadsheetId}`)

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

      // Get all active recurring expenses
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${SHEET_NAME}!A2:I`
      })

      const rows = response.data.values || []
      const today = new Date()

      const upcomingReminders = []

      for (const row of rows) {
        const isActive = row[7] === 'true' || row[7] === true
        if (!isActive) continue

        const recurringId = row[0]
        const title = row[1]
        const amount = Number(row[2])
        const category = row[3]
        const frequency = row[4]
        const nextDue = new Date(row[6])

        // Check if reminder should be sent (3 days before)
        const daysUntilDue = Math.ceil((nextDue - today) / (1000 * 60 * 60 * 24))

        if (daysUntilDue === 3) {
          // Send reminder email
          const userEmail = session?.user?.email || process.env.ADMIN_EMAIL

          const emailSubject = `🔔 Nhắc nhở: ${title} sắp đến hạn`
          const emailBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 15px;">
              <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h2 style="color: #667eea; margin-bottom: 20px;">🔔 Chi tiêu định kỳ sắp đến hạn</h2>
                
                <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                  <h3 style="margin-top: 0; color: #2d3748;">${title}</h3>
                  <p style="font-size: 24px; font-weight: bold; color: #e53e3e; margin: 10px 0;">
                    ${amount.toLocaleString('vi-VN')}đ
                  </p>
                  <p style="color: #718096; margin: 5px 0;">
                    <strong>Danh mục:</strong> ${category}
                  </p>
                  <p style="color: #718096; margin: 5px 0;">
                    <strong>Tần suất:</strong> ${getFrequencyText(frequency)}
                  </p>
                  <p style="color: #718096; margin: 5px 0;">
                    <strong>Ngày đến hạn:</strong> ${nextDue.toLocaleDateString('vi-VN')}
                  </p>
                  <p style="background: #fef5e7; padding: 10px; border-radius: 5px; color: #d68910; margin-top: 10px;">
                    ⏰ <strong>Còn 3 ngày!</strong> Hãy chuẩn bị thanh toán.
                  </p>
                </div>

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                  <p style="color: #718096; font-size: 14px; margin: 5px 0;">
                    💡 <strong>Lưu ý:</strong> Đây là email nhắc nhở tự động từ hệ thống quản lý chi tiêu.
                  </p>
                  <p style="color: #718096; font-size: 14px; margin: 5px 0;">
                    📱 Truy cập ứng dụng để xem chi tiết hoặc cập nhật thông tin.
                  </p>
                </div>

                <div style="text-align: center; margin-top: 30px;">
                  <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/recurring" 
                     style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 25px; font-weight: bold; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4);">
                    🔄 Xem Chi tiêu Định kỳ
                  </a>
                </div>
              </div>

              <div style="text-align: center; margin-top: 20px; color: white; font-size: 12px;">
                <p>© ${new Date().getFullYear()} Financial Management App</p>
                <p>Email tự động, vui lòng không trả lời.</p>
              </div>
            </div>
          `

          try {
            await sendEmail(userEmail, emailSubject, emailBody)
            
            upcomingReminders.push({
              id: recurringId,
              title,
              amount,
              nextDue: nextDue.toISOString().split('T')[0],
              daysUntilDue,
              emailSent: true
            })
          } catch (emailError) {
            console.error('Failed to send reminder email:', emailError)
            upcomingReminders.push({
              id: recurringId,
              title,
              amount,
              nextDue: nextDue.toISOString().split('T')[0],
              daysUntilDue,
              emailSent: false,
              error: emailError.message
            })
          }
        }
      }

      return res.status(200).json({
        success: true,
        message: `Processed ${upcomingReminders.length} upcoming reminders`,
        reminders: upcomingReminders,
        checkedAt: new Date().toISOString()
      })
    }

    if (req.method === 'GET') {
      // Get upcoming recurring expenses (next 7 days)
      if (!session?.accessToken) {
        return res.status(401).json({ error: 'Not authenticated' })
      }

      const spreadsheetId = await getOrCreateSpreadsheet(session.accessToken, session.user.email)
      const sheets = getSheetsClient(session.accessToken)

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

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${SHEET_NAME}!A2:I`
      })

      const rows = response.data.values || []
      const today = new Date()
      const upcoming = []

      for (const row of rows) {
        const isActive = row[7] === 'true' || row[7] === true
        if (!isActive) continue

        const nextDue = new Date(row[6])
        const daysUntilDue = Math.ceil((nextDue - today) / (1000 * 60 * 60 * 24))

        if (daysUntilDue >= 0 && daysUntilDue <= 7) {
          upcoming.push({
            id: row[0],
            title: row[1],
            amount: Number(row[2]),
            category: row[3],
            frequency: row[4],
            nextDue: row[6],
            daysUntilDue,
            reminderSent: daysUntilDue === 3
          })
        }
      }

      // Sort by days until due
      upcoming.sort((a, b) => a.daysUntilDue - b.daysUntilDue)

      return res.status(200).json({
        success: true,
        upcoming,
        count: upcoming.length
      })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Recurring reminder error:', error)
    return res.status(500).json({ 
      error: 'Failed to process recurring reminders',
      details: error.message 
    })
  }
}

// Helper function to get frequency text in Vietnamese
function getFrequencyText(frequency) {
  const frequencyMap = {
    'daily': 'Hàng ngày',
    'weekly': 'Hàng tuần',
    'monthly': 'Hàng tháng',
    'yearly': 'Hàng năm'
  }
  return frequencyMap[frequency] || frequency
}
