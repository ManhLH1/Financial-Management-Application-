// Script to cleanup duplicate spreadsheets
// Run this after enabling Drive API to remove old duplicate files

import { getDriveClient } from '../lib/googleClient.js'

async function cleanupDuplicateSpreadsheets(accessToken, userEmail) {
  const drive = getDriveClient(accessToken)
  
  console.log(`🔍 Searching for all spreadsheets for: ${userEmail}`)
  
  // Search for all files matching the pattern
  const response = await drive.files.list({
    q: `name contains 'FinTrack - ${userEmail}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
    fields: 'files(id, name, createdTime)',
    orderBy: 'createdTime asc', // Oldest first
    spaces: 'drive'
  })
  
  const files = response.data.files || []
  console.log(`📊 Found ${files.length} spreadsheet(s)`)
  
  if (files.length <= 1) {
    console.log('✅ No duplicates found!')
    return
  }
  
  // Keep the first one (oldest), delete the rest
  const keepFile = files[0]
  const deleteFiles = files.slice(1)
  
  console.log(`\n✅ KEEPING: ${keepFile.name}`)
  console.log(`   ID: ${keepFile.id}`)
  console.log(`   Created: ${keepFile.createdTime}`)
  console.log(`   URL: https://docs.google.com/spreadsheets/d/${keepFile.id}/edit`)
  
  console.log(`\n🗑️  WILL DELETE ${deleteFiles.length} duplicate(s):`)
  
  for (const file of deleteFiles) {
    console.log(`\n   - ${file.name}`)
    console.log(`     ID: ${file.id}`)
    console.log(`     Created: ${file.createdTime}`)
    
    try {
      // Move to trash instead of permanent delete
      await drive.files.update({
        fileId: file.id,
        resource: { trashed: true }
      })
      console.log(`     ✅ Moved to trash`)
    } catch (error) {
      console.error(`     ❌ Error: ${error.message}`)
    }
  }
  
  console.log(`\n✅ Cleanup complete!`)
  console.log(`📋 Active spreadsheet: ${keepFile.id}`)
}

// Export for use in API endpoint
export { cleanupDuplicateSpreadsheets }

// Example usage:
// In your API endpoint, call:
// await cleanupDuplicateSpreadsheets(session.accessToken, session.user.email)
