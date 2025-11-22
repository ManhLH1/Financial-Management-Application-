import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { getOrCreateVocabularySpreadsheet, saveVocabularyWord } from '../../../lib/vocabularyHelper'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)

  if (!session?.accessToken) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const { word, phonetic, partOfSpeech, definition, example, audioUS, audioUK } = req.body

    if (!word || typeof word !== 'string' || word.trim() === '') {
      return res.status(400).json({ error: 'Word is required' })
    }

    // Get or create vocabulary spreadsheet
    const spreadsheetId = await getOrCreateVocabularySpreadsheet(
      session.accessToken,
      session.user.email
    )

    // Check if word already exists
    const { getVocabularyWords } = await import('../../../lib/vocabularyHelper')
    const existingWords = await getVocabularyWords(session.accessToken, spreadsheetId)
    const wordExists = existingWords.some(w => w.word.toLowerCase() === word.toLowerCase())

    if (wordExists) {
      return res.status(409).json({ error: 'Word already exists in your vocabulary list' })
    }

    // Save word
    await saveVocabularyWord(session.accessToken, spreadsheetId, {
      word: word.trim(),
      phonetic: phonetic || '',
      partOfSpeech: partOfSpeech || '',
      definition: definition || '',
      example: example || '',
      audioUS: audioUS || '',
      audioUK: audioUK || ''
    })

    return res.status(201).json({ success: true, message: 'Word saved successfully' })
  } catch (error) {
    console.error('Error saving vocabulary word:', error)
    return res.status(500).json({ error: 'Failed to save word', details: error.message })
  }
}


