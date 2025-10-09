import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { sendEmail, generateReminderEmailHTML } from '../../lib/emailHelper'

/**
 * Send reminder email for debt payment
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { debt } = req.body
    
    if (!debt) {
      return res.status(400).json({ error: 'Debt information required' })
    }

    // Calculate days until due
    const dueDate = new Date(debt.paymentDay)
    const today = new Date()
    const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))

    // Prepare email content
    const subject = daysUntilDue <= 3 
      ? `🚨 KHẨN: Nhắc nhở thanh toán khoản nợ - ${debt.person}`
      : `⏰ Nhắc nhở thanh toán khoản nợ - ${debt.person}`
    
    const urgencyLevel = daysUntilDue <= 3 ? 'KHẨN CẤP' : 'Bình thường'
    const urgencyColor = daysUntilDue <= 3 ? '#dc2626' : '#f59e0b'
    
    const htmlContent = generateReminderEmailHTML({
      debt,
      session,
      daysUntilDue,
      urgencyLevel,
      urgencyColor
    })

    // Send email with Nodemailer
    try {
      const emailResult = await sendEmail({
        to: session.user.email,
        subject,
        html: htmlContent
      })

      console.log('✅ Email sent successfully to:', session.user.email)
      console.log('Message ID:', emailResult.messageId)

      return res.status(200).json({ 
        success: true,
        message: `Email nhắc nhở đã được gửi đến ${session.user.email}`,
        daysUntilDue,
        urgencyLevel,
        messageId: emailResult.messageId
      })
    } catch (emailError) {
      console.error('⚠️ Email sending failed:', emailError.message)
      
      // Return success with warning if email fails
      return res.status(200).json({ 
        success: true,
        warning: 'Email không thể gửi. Vui lòng kiểm tra cấu hình email.',
        message: `Reminder đã được tạo nhưng email chưa gửi được`,
        daysUntilDue,
        urgencyLevel,
        error: emailError.message
      })
    }
    
  } catch (error) {
    console.error('❌ Error sending reminder:', error)
    return res.status(500).json({ 
      error: 'Failed to send reminder',
      details: error.message 
    })
  }
}
