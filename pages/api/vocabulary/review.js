import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { getOrCreateVocabularySpreadsheet, updateVocabularyReview } from '../../../lib/vocabularyHelper'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)

  if (!session?.accessToken) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const { wordId, isCorrect } = req.body

    if (typeof wordId !== 'number' || typeof isCorrect !== 'boolean') {
      return res.status(400).json({ error: 'wordId (number) and isCorrect (boolean) are required' })
    }

    const spreadsheetId = await getOrCreateVocabularySpreadsheet(
      session.accessToken,
      session.user.email
    )

    const result = await updateVocabularyReview(
      session.accessToken,
      spreadsheetId,
      wordId,
      isCorrect
    )

    return res.status(200).json({ success: true, ...result })
  } catch (error) {
    console.error('Error updating vocabulary review:', error)
    return res.status(500).json({ error: 'Failed to update review', details: error.message })
  }
}


