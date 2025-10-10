import { google } from 'googleapis'

// Google OAuth credentials from your client_secret
export const googleConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/google'
}

// Create OAuth2 client
export function getOAuth2Client() {
  return new google.auth.OAuth2(
    googleConfig.clientId,
    googleConfig.clientSecret,
    googleConfig.redirectUri
  )
}

// Get Google Sheets API instance
export function getSheetsClient(accessToken) {
  const oauth2Client = getOAuth2Client()
  oauth2Client.setCredentials({ access_token: accessToken })
  
  return google.sheets({ version: 'v4', auth: oauth2Client })
}

// Get Google Drive API instance
export function getDriveClient(accessToken) {
  const oauth2Client = getOAuth2Client()
  oauth2Client.setCredentials({ access_token: accessToken })
  
  return google.drive({ version: 'v3', auth: oauth2Client })
}

// Scopes needed for Sheets + Drive access
export const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file', // Access files created by app
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email'
]
