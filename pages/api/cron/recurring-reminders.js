/**
 * Cron Job API for Recurring Expenses Reminders
 * 
 * This endpoint should be called daily by a cron service (e.g., Vercel Cron, GitHub Actions, or external cron service)
 * 
 * Setup instructions:
 * 1. Vercel: Create vercel.json with cron configuration
 * 2. External: Use a service like cron-job.org to hit this endpoint daily
 * 3. GitHub Actions: Use workflow with schedule trigger
 * 
 * Example Vercel configuration (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/recurring-reminders",
 *     "schedule": "0 9 * * *"
 *   }]
 * }
 */

import { getSheetsClient } from '../../../lib/googleClient'
import { sendEmail } from '../../../lib/emailHelper'

const SHEET_NAME = 'RecurringExpenses'

export default async function handler(req, res) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = req.headers.authorization
  const cronSecret = process.env.CRON_SECRET || 'your-secret-key-here'
  
  if (authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const spreadsheetId = process.env.GOOGLE_SHEET_ID

  try {
    // Use service account for cron jobs
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
    if (!serviceAccountKey) {
      return res.status(500).json({ 
        error: 'Service account key not configured',
        message: 'Please set GOOGLE_SERVICE_ACCOUNT_KEY environment variable'
      })
    }

    const sheets = getSheetsClient(serviceAccountKey)

    // Get all active recurring expenses
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_NAME}!A2:H`
    })

    const rows = response.data.values || []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const remindersToSend = []

    for (const row of rows) {
      const isActive = row[7] === 'true'
      if (!isActive) continue

      const recurringId = row[0]
      const title = row[1]
      const amount = Number(row[2])
      const category = row[3]
      const frequency = row[4]
      const nextDue = new Date(row[6])
      nextDue.setHours(0, 0, 0, 0)

      // Calculate days until due
      const daysUntilDue = Math.ceil((nextDue - today) / (1000 * 60 * 60 * 24))

      // Send reminder 3 days before due date
      if (daysUntilDue === 3) {
        remindersToSend.push({
          id: recurringId,
          title,
          amount,
          category,
          frequency,
          nextDue: row[6],
          daysUntilDue
        })
      }
    }

    console.log(`[Cron] Found ${remindersToSend.length} reminders to send`)

    const emailResults = []

    // Send emails
    for (const reminder of remindersToSend) {
      const userEmail = process.env.ADMIN_EMAIL || process.env.USER_EMAIL

      if (!userEmail) {
        console.error('[Cron] No email configured')
        emailResults.push({
          ...reminder,
          emailSent: false,
          error: 'No email configured'
        })
        continue
      }

      const emailSubject = `🔔 Nhắc nhở: ${reminder.title} sắp đến hạn`
      const emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 15px;">
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #667eea; margin-bottom: 20px;">🔔 Chi tiêu định kỳ sắp đến hạn</h2>
            
            <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="margin-top: 0; color: #2d3748;">${reminder.title}</h3>
              <p style="font-size: 24px; font-weight: bold; color: #e53e3e; margin: 10px 0;">
                ${reminder.amount.toLocaleString('vi-VN')}đ
              </p>
              <p style="color: #718096; margin: 5px 0;">
                <strong>Danh mục:</strong> ${reminder.category}
              </p>
              <p style="color: #718096; margin: 5px 0;">
                <strong>Tần suất:</strong> ${getFrequencyText(reminder.frequency)}
              </p>
              <p style="color: #718096; margin: 5px 0;">
                <strong>Ngày đến hạn:</strong> ${new Date(reminder.nextDue).toLocaleDateString('vi-VN')}
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
        console.log(`[Cron] Email sent successfully for: ${reminder.title}`)
        
        emailResults.push({
          ...reminder,
          emailSent: true,
          sentTo: userEmail
        })
      } catch (emailError) {
        console.error(`[Cron] Failed to send email for ${reminder.title}:`, emailError)
        emailResults.push({
          ...reminder,
          emailSent: false,
          error: emailError.message
        })
      }
    }

    return res.status(200).json({
      success: true,
      message: `Cron job completed`,
      timestamp: new Date().toISOString(),
      remindersFound: remindersToSend.length,
      emailsSent: emailResults.filter(r => r.emailSent).length,
      results: emailResults
    })

  } catch (error) {
    console.error('[Cron] Error:', error)
    return res.status(500).json({
      success: false,
      error: 'Cron job failed',
      message: error.message,
      timestamp: new Date().toISOString()
    })
  }
}

function getFrequencyText(frequency) {
  const frequencyMap = {
    'daily': 'Hàng ngày',
    'weekly': 'Hàng tuần',
    'monthly': 'Hàng tháng',
    'yearly': 'Hàng năm'
  }
  return frequencyMap[frequency] || frequency
}
