import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import fs from 'fs'
import path from 'path'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const dataDir = path.join(process.cwd(), '.data')
  const mappingFile = path.join(dataDir, 'spreadsheets.json')

  const result = {
    dataDir: {
      path: dataDir,
      exists: fs.existsSync(dataDir),
      writable: false
    },
    mappingFile: {
      path: mappingFile,
      exists: fs.existsSync(mappingFile),
      content: null
    },
    currentUser: session.user.email
  }

  // Check if directory is writable
  if (result.dataDir.exists) {
    try {
      const testFile = path.join(dataDir, '.write-test')
      fs.writeFileSync(testFile, 'test')
      fs.unlinkSync(testFile)
      result.dataDir.writable = true
    } catch (error) {
      result.dataDir.writable = false
      result.dataDir.error = error.message
    }
  } else {
    // Try to create directory
    try {
      fs.mkdirSync(dataDir, { recursive: true })
      result.dataDir.exists = true
      result.dataDir.writable = true
      result.dataDir.created = true
    } catch (error) {
      result.dataDir.error = error.message
    }
  }

  // Read mapping file
  if (result.mappingFile.exists) {
    try {
      const content = fs.readFileSync(mappingFile, 'utf8')
      result.mappingFile.content = JSON.parse(content)
      result.mappingFile.userHasMapping = !!result.mappingFile.content[session.user.email]
      result.mappingFile.userSpreadsheetId = result.mappingFile.content[session.user.email]
    } catch (error) {
      result.mappingFile.error = error.message
    }
  }

  return res.status(200).json(result)
}
