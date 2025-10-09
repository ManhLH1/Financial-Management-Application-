import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { sendEmail } from '../../lib/emailHelper'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const { format, expenses, debts, stats, month } = req.body
    
    // Generate CSV content
    const csvContent = generateCSV(expenses, debts, stats, month)
    
    // Convert to base64 for email attachment
    const base64Content = Buffer.from(csvContent).toString('base64')
    
    const filename = `expense-report-${month || new Date().toISOString().slice(0, 7)}.${format === 'excel' ? 'csv' : 'csv'}`
    
    // Send email with attachment
    const emailHTML = generateEmailHTML(stats, month, filename)
    
    await sendEmail({
      to: session.user.email,
      subject: `📊 Báo cáo chi tiêu - ${month || 'Tháng này'}`,
      html: emailHTML,
      attachments: [{
        filename: filename,
        content: base64Content,
        encoding: 'base64',
        contentType: format === 'excel' ? 'text/csv' : 'text/csv'
      }]
    })
    
    // Return download data
    const downloadUrl = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`
    
    return res.status(200).json({
      success: true,
      message: 'Export thành công và đã gửi email',
      filename,
      downloadUrl
    })
    
  } catch (error) {
    console.error('Export error:', error)
    return res.status(500).json({ 
      error: 'Lỗi khi xuất dữ liệu',
      details: error.message 
    })
  }
}

function generateCSV(expenses, debts, stats, month) {
  let csv = ''
  
  // Header
  csv += `BÁO CÁO CHI TIÊU - ${month || new Date().toISOString().slice(0, 7)}\n\n`
  
  // Summary
  csv += `TỔNG QUAN\n`
  csv += `Thu nhập,${stats.totalIncome}\n`
  csv += `Chi tiêu,${stats.totalExpense}\n`
  csv += `Số dư,${stats.balance}\n`
  csv += `Khoản nợ,${stats.totalDebt}\n\n`
  
  // Expenses
  csv += `CHI TIẾT CHI TIÊU\n`
  csv += `Ngày,Tiêu đề,Danh mục,Số tiền,Loại\n`
  expenses.forEach(e => {
    csv += `${e.date},${e.title},${e.category},${e.amount},${e.type}\n`
  })
  
  csv += `\n`
  
  // Debts
  csv += `CHI TIẾT KHOẢN NỢ\n`
  csv += `Người,Số tiền,Ngày vay,Hạn trả,Trạng thái\n`
  debts.forEach(d => {
    csv += `${d.person},${d.amount},${d.date},${d.due},${d.status}\n`
  })
  
  return csv
}

function generateEmailHTML(stats, month, filename) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1B3C53 0%, #234C6A 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 2px solid #D2C1B6; border-radius: 0 0 10px 10px; }
        .stats { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .stat-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; }
        .stat-label { font-weight: bold; color: #1B3C53; }
        .stat-value { color: #456882; font-weight: bold; }
        .positive { color: #10b981; }
        .negative { color: #ef4444; }
        .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
        .button { display: inline-block; padding: 12px 24px; background: #234C6A; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Báo cáo Chi tiêu</h1>
          <p>Tháng: ${month || new Date().toISOString().slice(0, 7)}</p>
        </div>
        <div class="content">
          <p>Xin chào,</p>
          
          <p>Đây là báo cáo chi tiêu chi tiết của bạn. File dữ liệu đính kèm: <strong>${filename}</strong></p>
          
          <div class="stats">
            <h3 style="margin-top: 0;">Tổng quan tài chính</h3>
            
            <div class="stat-row">
              <span class="stat-label">💰 Thu nhập:</span>
              <span class="stat-value positive">${stats.totalIncome.toLocaleString('vi-VN')}đ</span>
            </div>
            
            <div class="stat-row">
              <span class="stat-label">💸 Chi tiêu:</span>
              <span class="stat-value negative">${stats.totalExpense.toLocaleString('vi-VN')}đ</span>
            </div>
            
            <div class="stat-row">
              <span class="stat-label">💵 Số dư:</span>
              <span class="stat-value ${stats.balance >= 0 ? 'positive' : 'negative'}">${stats.balance.toLocaleString('vi-VN')}đ</span>
            </div>
            
            <div class="stat-row" style="border-bottom: none;">
              <span class="stat-label">📝 Khoản nợ:</span>
              <span class="stat-value">${stats.totalDebt.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>
          
          <p>Giao dịch: ${stats.incomeCount} thu nhập, ${stats.expenseCount} chi tiêu</p>
          <p>Khoản nợ: ${stats.debtCount} khoản chưa trả</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:3000" class="button">Xem Dashboard</a>
          </div>
          
          <div class="footer">
            <p>Email này được gửi tự động từ hệ thống quản lý chi tiêu</p>
            <p>Thời gian: ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}
