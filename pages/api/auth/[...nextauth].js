import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          // Xin quyền truy cập Google Sheets để tự động tạo và quản lý spreadsheet
          scope: 'openid email profile https://www.googleapis.com/auth/spreadsheets',
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account }) {
      // On initial sign in, persist tokens and expiry
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          // expires_at may be provided (seconds since epoch) or use expires_in
          accessTokenExpires: account.expires_at ? account.expires_at * 1000 : (Date.now() + (account.expires_in ? account.expires_in * 1000 : 60 * 60 * 1000))
        }
      }

      // If token is still valid, return it
      if (Date.now() < token.accessTokenExpires) {
        return token
      }

      // Access token has expired, try to refresh
      console.log('🔁 Refreshing access token...')
      try {
        const refreshed = await refreshAccessToken(token)
        return {
          ...token,
          accessToken: refreshed.accessToken,
          accessTokenExpires: refreshed.accessTokenExpires,
          refreshToken: refreshed.refreshToken || token.refreshToken
        }
      } catch (err) {
        console.error('Failed to refresh access token', err)
        return {
          ...token,
          error: 'RefreshAccessTokenError'
        }
      }
    },
    async session({ session, token }) {
      // Expose access token to the client session for API calls
      session.accessToken = token.accessToken
      session.refreshToken = token.refreshToken
      session.error = token.error
      return session
    }
  },
  pages: {
    signIn: '/auth'
  },
  debug: true // Enable debug mode to see detailed error messages
}

export default NextAuth(authOptions)

/**
 * Refresh OAuth access token using refresh_token
 */
async function refreshAccessToken(token) {
  const url = 'https://oauth2.googleapis.com/token'

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    grant_type: 'refresh_token',
    refresh_token: token.refreshToken
  })

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  })

  const refreshedTokens = await res.json()

  if (!res.ok) {
    console.error('Refresh token error:', refreshedTokens)
    throw refreshedTokens
  }

  return {
    accessToken: refreshedTokens.access_token,
    accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
    refreshToken: refreshedTokens.refresh_token ?? token.refreshToken
  }
}
