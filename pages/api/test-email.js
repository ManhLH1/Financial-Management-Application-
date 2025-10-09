import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { sendTestEmail } from '../../lib/emailHelper'

/**
 * Send test email to verify email configuration
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

    console.log('📧 Sending test email to:', session.user.email)

    const result = await sendTestEmail(session.user.email)

    return res.status(200).json({
      success: true,
      message: `Test email đã được gửi đến ${session.user.email}`,
      messageId: result.messageId,
      preview: result.preview
    })

  } catch (error) {
    console.error('❌ Error sending test email:', error)
    
    // Return detailed error for debugging
    return res.status(500).json({
      error: 'Failed to send test email',
      details: error.message,
      code: error.code,
      hint: error.code === 'EAUTH' 
        ? 'Lỗi xác thực email. Vui lòng kiểm tra EMAIL_USER và EMAIL_PASSWORD trong .env.local'
        : error.code === 'ECONNECTION'
        ? 'Không thể kết nối đến SMTP server. Kiểm tra kết nối internet.'
        : 'Kiểm tra cấu hình email trong .env.local'
    })
  }
}
