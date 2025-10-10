import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import fs from 'fs'
import path from 'path'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const dataDir = path.join(process.cwd(), '.data')
  const mappingFile = path.join(dataDir, 'spreadsheets.json')

  try {
    let message = ''
    let deletedFile = false

    // Check if mapping file exists
    if (fs.existsSync(mappingFile)) {
      // Read current content
      const content = fs.readFileSync(mappingFile, 'utf8')
      const mapping = JSON.parse(content)
      
      // Delete the file
      fs.unlinkSync(mappingFile)
      deletedFile = true
      
      message = `Đã xóa mapping file với ${Object.keys(mapping).length} user(s)`
      
      console.log('🗑️ [CLEANUP] Deleted mapping file')
      console.log('   Users mapped:', Object.keys(mapping).length)
      console.log('   File:', mappingFile)
    } else {
      message = 'Mapping file không tồn tại (đã sạch rồi)'
    }

    // Check if directory is empty, remove it too
    if (fs.existsSync(dataDir)) {
      const files = fs.readdirSync(dataDir)
      if (files.length === 0) {
        fs.rmdirSync(dataDir)
        message += '. Đã xóa folder .data rỗng.'
        console.log('🗑️ [CLEANUP] Removed empty .data directory')
      }
    }

    return res.status(200).json({
      success: true,
      message,
      deletedFile,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ [CLEANUP] Error:', error)
    
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
