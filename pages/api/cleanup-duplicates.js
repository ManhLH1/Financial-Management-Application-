import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { getDriveClient } from '../../lib/googleClient'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session?.accessToken) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  try {
    const drive = getDriveClient(session.accessToken)
    const userEmail = session.user.email
    
    console.log(`🔍 Searching for duplicate spreadsheets for: ${userEmail}`)
    
    // Search for all files matching the pattern
    const response = await drive.files.list({
      q: `name contains 'FinTrack - ${userEmail}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
      fields: 'files(id, name, createdTime)',
      orderBy: 'createdTime asc',
      spaces: 'drive'
    })
    
    const files = response.data.files || []
    console.log(`📊 Found ${files.length} spreadsheet(s)`)
    
    if (files.length <= 1) {
      return res.status(200).json({ 
        message: 'No duplicates found!',
        files: files.length,
        kept: files[0] || null
      })
    }
    
    // Keep the first one (oldest), delete the rest
    const keepFile = files[0]
    const deleteFiles = files.slice(1)
    
    console.log(`✅ KEEPING: ${keepFile.name} (${keepFile.id})`)
    
    const deletedFiles = []
    
    for (const file of deleteFiles) {
      try {
        await drive.files.update({
          fileId: file.id,
          resource: { trashed: true }
        })
        console.log(`🗑️  Deleted: ${file.name}`)
        deletedFiles.push(file)
      } catch (error) {
        console.error(`❌ Error deleting ${file.id}:`, error.message)
      }
    }
    
    return res.status(200).json({
      message: `Cleaned up ${deletedFiles.length} duplicate(s)`,
      kept: {
        id: keepFile.id,
        name: keepFile.name,
        created: keepFile.createdTime,
        url: `https://docs.google.com/spreadsheets/d/${keepFile.id}/edit`
      },
      deleted: deletedFiles.map(f => ({
        id: f.id,
        name: f.name,
        created: f.createdTime
      }))
    })
    
  } catch (error) {
    console.error('Error cleaning up duplicates:', error)
    return res.status(500).json({ 
      error: 'Failed to cleanup duplicates',
      details: error.message 
    })
  }
}
