import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { sendEmail } from '../../lib/emailHelper'

/**
 * API endpoint for Backup & Restore
 * POST - Create backup and send via email
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
    const { action } = req.body

    if (action === 'backup') {
      // Fetch all data
      const [expRes, debtRes, budgetRes, recurringRes] = await Promise.all([
        fetch(`http://localhost:3000/api/expenses`, {
          headers: { cookie: req.headers.cookie }
        }),
        fetch(`http://localhost:3000/api/debts`, {
          headers: { cookie: req.headers.cookie }
        }),
        fetch(`http://localhost:3000/api/budgets`, {
          headers: { cookie: req.headers.cookie }
        }).catch(() => ({ json: async () => ({ budgets: [] }) })),
        fetch(`http://localhost:3000/api/recurring-expenses`, {
          headers: { cookie: req.headers.cookie }
        }).catch(() => ({ json: async () => ({ recurringExpenses: [] }) }))
      ])

      const expenses = await expRes.json()
      const debts = await debtRes.json()
      const budgets = await budgetRes.json()
      const recurring = await recurringRes.json()

      // Create backup JSON
      const backup = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        user: session.user.email,
        data: {
          expenses: expenses.items || [],
          debts: debts.notes || [],
          budgets: budgets.budgets || [],
          recurringExpenses: recurring.recurringExpenses || []
        }
      }

      const backupJson = JSON.stringify(backup, null, 2)
      const filename = `expense-backup-${new Date().toISOString().split('T')[0]}.json`

      // Convert to base64 for email attachment
      const base64Content = Buffer.from(backupJson).toString('base64')

      // Send backup via email
      await sendEmail({
        to: session.user.email,
        subject: `💾 Backup dữ liệu - ${new Date().toLocaleDateString('vi-VN')}`,
        html: generateBackupEmailHTML(backup),
        attachments: [{
          filename: filename,
          content: base64Content,
          encoding: 'base64',
          contentType: 'application/json'
        }]
      })

      // Also return as download
      const downloadUrl = `data:application/json;base64,${base64Content}`

      return res.status(200).json({
        success: true,
        message: 'Backup created and sent to email',
        filename,
        downloadUrl,
        stats: {
          expenses: backup.data.expenses.length,
          debts: backup.data.debts.length,
          budgets: backup.data.budgets.length,
          recurring: backup.data.recurringExpenses.length
        }
      })
    }

    return res.status(400).json({ error: 'Invalid action' })
  } catch (error) {
    console.error('Backup API Error:', error)
    return res.status(500).json({ error: error.message })
  }
}

function generateBackupEmailHTML(backup) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1B3C53 0%, #234C6A 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .stats { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .stat-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💾 Backup Dữ Liệu</h1>
          <p>Ngày: ${new Date(backup.timestamp).toLocaleString('vi-VN')}</p>
        </div>
        <div class="content">
          <p>Xin chào <strong>${backup.user}</strong>,</p>
          <p>Backup dữ liệu của bạn đã được tạo thành công!</p>
          
          <div class="stats">
            <h3>📊 Thống kê dữ liệu:</h3>
            <div class="stat-row">
              <span>Chi tiêu/Thu nhập:</span>
              <strong>${backup.data.expenses.length} giao dịch</strong>
            </div>
            <div class="stat-row">
              <span>Khoản nợ:</span>
              <strong>${backup.data.debts.length} khoản</strong>
            </div>
            <div class="stat-row">
              <span>Ngân sách:</span>
              <strong>${backup.data.budgets.length} mục</strong>
            </div>
            <div class="stat-row">
              <span>Chi tiêu định kỳ:</span>
              <strong>${backup.data.recurringExpenses.length} mục</strong>
            </div>
          </div>

          <p><strong>📎 File backup đính kèm:</strong> Lưu trữ file JSON này ở nơi an toàn.</p>
          <p><strong>🔄 Để khôi phục:</strong> Sử dụng chức năng "Restore" trên Dashboard và chọn file backup này.</p>
          
          <p style="margin-top: 30px;">
            <a href="http://localhost:3000" style="background: #234C6A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Quay lại Dashboard
            </a>
          </p>
        </div>
        <div class="footer">
          <p>Expense Manager - Quản lý chi tiêu thông minh</p>
          <p>Spreadsheet ID: ${backup.spreadsheetId}</p>
        </div>
      </div>
    </body>
    </html>
  `
}
