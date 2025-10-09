// Debug endpoint to check NextAuth configuration
export default function handler(req, res) {
  const config = {
    nextAuthUrl: process.env.NEXTAUTH_URL,
    hasClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    hasSheetId: !!process.env.GOOGLE_SHEET_ID,
    expectedRedirectUri: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/callback/google`,
    nodeEnv: process.env.NODE_ENV
  }

  return res.status(200).json({
    status: 'ok',
    config,
    instructions: {
      redirectUri: config.expectedRedirectUri,
      message: 'Add this exact URI to Google Cloud Console > Credentials > OAuth 2.0 Client > Authorized redirect URIs'
    }
  })
}
