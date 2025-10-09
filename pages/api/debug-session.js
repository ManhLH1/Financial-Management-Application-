import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  
  console.log('🔍 Debug Session:')
  console.log('Has session:', !!session)
  console.log('Has accessToken:', !!session?.accessToken)
  console.log('User email:', session?.user?.email)
  
  if (!session) {
    return res.status(401).json({ 
      error: 'Not authenticated',
      message: 'Vui lòng đăng nhập lại với Google'
    })
  }

  if (!session.accessToken) {
    return res.status(401).json({ 
      error: 'No access token',
      message: 'Session không có access token. Vui lòng đăng xuất và đăng nhập lại.',
      hasSession: true,
      hasAccessToken: false,
      user: session.user
    })
  }

  return res.status(200).json({
    success: true,
    hasSession: true,
    hasAccessToken: true,
    user: session.user,
    accessTokenLength: session.accessToken?.length || 0
  })
}
