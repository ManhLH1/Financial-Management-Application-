// Import nodemailer at the top level
import nodemailer from 'nodemailer'

/**
 * Create email transporter
 * Configure with Gmail or other SMTP service
 */
export function createTransporter() {
  // Option 1: Gmail with App Password
  // You need to enable 2-factor auth and create an App Password
  // Go to: https://myaccount.google.com/apppasswords
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASSWORD || 'your-app-password'
    }
  })

  // Option 2: Custom SMTP
  // const transporter = nodemailer.createTransport({
  //   host: process.env.SMTP_HOST,
  //   port: process.env.SMTP_PORT,
  //   secure: true,
  //   auth: {
  //     user: process.env.SMTP_USER,
  //     pass: process.env.SMTP_PASSWORD
  //   }
  // })

  return transporter
}

/**
 * Send email with Nodemailer
 */
export async function sendEmail({ to, subject, html, text, attachments }) {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: `"Quản lý Chi tiêu" <${process.env.EMAIL_USER || 'noreply@example.com'}>`,
      to,
      subject,
      html,
      text: text || 'Vui lòng bật HTML để xem email này.',
      attachments: attachments || [] // Support attachments
    }

    const info = await transporter.sendMail(mailOptions)
    
    console.log('✅ Email sent successfully:', info.messageId)
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info))
    
    return {
      success: true,
      messageId: info.messageId,
      preview: nodemailer.getTestMessageUrl(info)
    }
  } catch (error) {
    console.error('❌ Error sending email:', error)
    throw error
  }
}

/**
 * Send test email
 */
export async function sendTestEmail(to) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1B3C53 0%, #234C6A 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 2px solid #D2C1B6; border-radius: 0 0 10px 10px; }
        .success-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .button { display: inline-block; padding: 12px 24px; background: #234C6A; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Test Email Thành công!</h1>
          <p>Hệ thống quản lý chi tiêu</p>
        </div>
        <div class="content">
          <p>Xin chào,</p>
          
          <div class="success-box">
            <strong>✅ Hệ thống email đã hoạt động!</strong><br>
            Email này được gửi từ ứng dụng quản lý chi tiêu của bạn.
          </div>
          
          <p>Các tính năng email đang hoạt động:</p>
          <ul>
            <li>📧 Gửi email nhắc nợ</li>
            <li>⏰ Cảnh báo tự động</li>
            <li>🔔 Thông báo thanh toán</li>
            <li>📊 Báo cáo định kỳ</li>
          </ul>
          
          <p>Thời gian gửi: ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:3003/debts" class="button">Trở về ứng dụng</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  return await sendEmail({
    to,
    subject: '✅ Test Email - Hệ thống quản lý chi tiêu',
    html,
    text: 'Test email từ hệ thống quản lý chi tiêu'
  })
}

/**
 * Generate reminder email HTML
 */
export function generateReminderEmailHTML({ debt, session, daysUntilDue, urgencyLevel, urgencyColor }) {
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
        .urgency-badge { 
          display: inline-block; 
          padding: 8px 16px; 
          background: ${urgencyColor}; 
          color: white; 
          border-radius: 20px; 
          font-weight: bold;
          margin: 10px 0;
        }
        .debt-info { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .debt-row { display: flex; justify-content: space-between; margin: 10px 0; }
        .debt-label { font-weight: bold; color: #1B3C53; }
        .debt-value { color: #456882; }
        .warning-box { 
          background: ${daysUntilDue <= 3 ? '#fee2e2' : '#fef3c7'}; 
          border-left: 4px solid ${urgencyColor}; 
          padding: 15px; 
          margin: 20px 0;
          border-radius: 4px;
        }
        .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
        .button { 
          display: inline-block; 
          padding: 12px 24px; 
          background: #234C6A; 
          color: white; 
          text-decoration: none; 
          border-radius: 6px;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📝 Nhắc nhở thanh toán khoản nợ</h1>
          <p>Hệ thống quản lý chi tiêu</p>
        </div>
        <div class="content">
          <p>Xin chào <strong>${session.user.name}</strong>,</p>
          
          <div class="urgency-badge">${urgencyLevel}</div>
          
          <p>Đây là email nhắc nhở về khoản nợ sắp đến hạn thanh toán:</p>
          
          <div class="debt-info">
            <div class="debt-row">
              <span class="debt-label">👤 Người nợ/cho vay:</span>
              <span class="debt-value">${debt.person}</span>
            </div>
            <div class="debt-row">
              <span class="debt-label">💰 Tổng tiền:</span>
              <span class="debt-value">${debt.amount?.toLocaleString('vi-VN')}đ</span>
            </div>
            <div class="debt-row">
              <span class="debt-label">💳 Trả hằng tháng:</span>
              <span class="debt-value">${debt.monthlyPayment?.toLocaleString('vi-VN')}đ</span>
            </div>
            <div class="debt-row">
              <span class="debt-label">📅 Ngày trả tiếp theo:</span>
              <span class="debt-value">${new Date(debt.paymentDay).toLocaleDateString('vi-VN')}</span>
            </div>
            <div class="debt-row">
              <span class="debt-label">📊 Kỳ trả:</span>
              <span class="debt-value">${debt.paidPeriods || 0}/${debt.totalPeriods}</span>
            </div>
            <div class="debt-row">
              <span class="debt-label">🏁 Hạn cuối:</span>
              <span class="debt-value">${debt.due ? new Date(debt.due).toLocaleDateString('vi-VN') : 'Không có'}</span>
            </div>
          </div>
          
          <div class="warning-box">
            ${daysUntilDue <= 3 
              ? `<strong>⚠️ CẢNH BÁO KHẨN:</strong> Chỉ còn <strong>${daysUntilDue} ngày</strong> nữa là đến hạn thanh toán!` 
              : `<strong>⏰ Thông báo:</strong> Còn <strong>${daysUntilDue} ngày</strong> nữa là đến hạn thanh toán.`
            }
          </div>
          
          <p>Vui lòng chuẩn bị thanh toán đúng hạn để tránh phát sinh chi phí không mong muốn.</p>
          
          <div style="text-align: center;">
            <a href="http://localhost:3003/debts" class="button">Xem chi tiết</a>
          </div>
          
          <div class="footer">
            <p>Email này được gửi tự động từ hệ thống quản lý chi tiêu</p>
            <p>Thời gian: ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</p>
            <p>Vui lòng không trả lời email này</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}
