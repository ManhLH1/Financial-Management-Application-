import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { getOrCreateVocabularySpreadsheet, getVocabularyWords } from '../../../lib/vocabularyHelper'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)

  if (!session?.accessToken) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const spreadsheetId = await getOrCreateVocabularySpreadsheet(
      session.accessToken,
      session.user.email
    )

    const words = await getVocabularyWords(session.accessToken, spreadsheetId)

    return res.status(200).json({ words, count: words.length })
  } catch (error) {
    console.error('Error getting vocabulary list:', error)
    return res.status(500).json({ error: 'Failed to get vocabulary list', details: error.message })
  }
}


