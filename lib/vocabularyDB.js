/**
 * Vocabulary Database Helper - New & Improved
 * Simple, fast, efficient vocabulary storage using Google Sheets
 * Optimized for learning experience
 */

import { getSheetsClient, getDriveClient } from './googleClient'

const VOCABULARY_SHEET_NAME = 'Vocabulary'
const HEADERS = ['Word', 'Definition', 'DefinitionEN', 'Example', 'ExampleEN', 'Phonetic', 'PartOfSpeech', 'AudioUS', 'AudioUK', 'AddedAt', 'LastReviewed', 'NextReview', 'Level', 'Correct', 'Wrong', 'Mastered']

/**
 * Get or create vocabulary spreadsheet for user
 */
export async function getVocabularySpreadsheet(accessToken, userEmail) {
  try {
    const drive = getDriveClient(accessToken)
    const fileName = `VocabLearn - ${userEmail}`
    
    // Search for existing spreadsheet
    const response = await drive.files.list({
      q: `name='${fileName}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
      fields: 'files(id, name)',
      pageSize: 1
    })
    
    if (response.data.files && response.data.files.length > 0) {
      const spreadsheetId = response.data.files[0].id
      await ensureSheetExists(accessToken, spreadsheetId)
      return spreadsheetId
    }
    
    // Create new spreadsheet
    const createResponse = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType: 'application/vnd.google-apps.spreadsheet'
      }
    })
    
    const spreadsheetId = createResponse.data.id
    await initializeSheet(accessToken, spreadsheetId)
    
    return spreadsheetId
  } catch (error) {
    console.error('❌ Error getting vocabulary spreadsheet:', error)
    throw error
  }
}

/**
 * Ensure sheet exists and has headers
 */
async function ensureSheetExists(accessToken, spreadsheetId) {
  const sheets = getSheetsClient(accessToken)
  
  try {
    // Check if headers exist
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${VOCABULARY_SHEET_NAME}!A1:P1`
    })
    
    if (response.data.values && response.data.values.length > 0) {
      return // Headers already exist
    }
  } catch (error) {
    // Sheet might not exist
  }
  
  // Initialize if needed
  await initializeSheet(accessToken, spreadsheetId)
}

/**
 * Initialize vocabulary sheet with headers
 */
async function initializeSheet(accessToken, spreadsheetId) {
  const sheets = getSheetsClient(accessToken)
  
  try {
    // Check if sheet exists
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId })
    const sheetExists = spreadsheet.data.sheets.some(s => s.properties.title === VOCABULARY_SHEET_NAME)
    
    if (!sheetExists) {
      // Create sheet
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: VOCABULARY_SHEET_NAME
              }
            }
          }]
        }
      })
    }
    
    // Add headers
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${VOCABULARY_SHEET_NAME}!A1:P1`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [HEADERS] }
    })
    
    console.log('✅ Vocabulary sheet initialized')
  } catch (error) {
    console.error('Error initializing sheet:', error)
    throw error
  }
}

/**
 * Save a vocabulary word
 */
export async function saveWord(accessToken, spreadsheetId, wordData) {
  try {
    const sheets = getSheetsClient(accessToken)
    const now = new Date().toISOString()
    const nextReview = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
    
    const row = [
      wordData.word || '',
      wordData.definition || '', // Vietnamese
      wordData.definitionEN || '',
      wordData.example || '', // Vietnamese
      wordData.exampleEN || '',
      wordData.phonetic || '',
      wordData.partOfSpeech || '',
      wordData.audioUS || '',
      wordData.audioUK || '',
      now, // AddedAt
      now, // LastReviewed
      nextReview, // NextReview
      1, // Level (starts at 1)
      0, // Correct
      0, // Wrong
      false // Mastered
    ]
    
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${VOCABULARY_SHEET_NAME}!A:P`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [row] }
    })
    
    return { success: true }
  } catch (error) {
    console.error('❌ Error saving word:', error)
    throw error
  }
}

/**
 * Get all vocabulary words
 */
export async function getAllWords(accessToken, spreadsheetId) {
  try {
    const sheets = getSheetsClient(accessToken)
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${VOCABULARY_SHEET_NAME}!A2:P`
    })
    
    if (!response.data.values || response.data.values.length === 0) {
      return []
    }
    
    return response.data.values.map((row, index) => ({
      id: index + 2, // Row number (1-indexed, +1 for header)
      word: row[0] || '',
      definition: row[1] || '',
      definitionEN: row[2] || '',
      example: row[3] || '',
      exampleEN: row[4] || '',
      phonetic: row[5] || '',
      partOfSpeech: row[6] || '',
      audioUS: row[7] || '',
      audioUK: row[8] || '',
      addedAt: row[9] || '',
      lastReviewed: row[10] || '',
      nextReview: row[11] || '',
      level: parseInt(row[12]) || 1,
      correct: parseInt(row[13]) || 0,
      wrong: parseInt(row[14]) || 0,
      mastered: row[15] === 'TRUE' || row[15] === true
    }))
  } catch (error) {
    console.error('❌ Error getting words:', error)
    throw error
  }
}

/**
 * Check if word already exists
 */
export async function wordExists(accessToken, spreadsheetId, word) {
  try {
    const words = await getAllWords(accessToken, spreadsheetId)
    return words.some(w => w.word.toLowerCase() === word.toLowerCase())
  } catch (error) {
    console.error('❌ Error checking word existence:', error)
    return false
  }
}

/**
 * Update word review (for SRS)
 */
export async function updateReview(accessToken, spreadsheetId, rowId, isCorrect) {
  try {
    const sheets = getSheetsClient(accessToken)
    
    // Get current row
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${VOCABULARY_SHEET_NAME}!A${rowId}:P${rowId}`
    })
    
    if (!response.data.values || response.data.values.length === 0) {
      throw new Error('Word not found')
    }
    
    const row = response.data.values[0]
    let level = parseInt(row[12]) || 1
    let correct = parseInt(row[13]) || 0
    let wrong = parseInt(row[14]) || 0
    let mastered = row[15] === 'TRUE' || row[15] === true
    
    // Update stats
    if (isCorrect) {
      correct++
      level = Math.min(level + 1, 10) // Max level 10
      if (level >= 10) mastered = true
    } else {
      wrong++
      level = Math.max(level - 1, 1) // Min level 1
      mastered = false
    }
    
    // Calculate next review (Spaced Repetition)
    const now = new Date()
    const daysUntilNextReview = Math.pow(2, level - 1) // 1, 2, 4, 8, 16, 32, 64, 128, 256, 512 days
    const nextReview = new Date(now.getTime() + daysUntilNextReview * 24 * 60 * 60 * 1000)
    
    // Update row
    const updateRow = [
      row[0], // Word
      row[1], // Definition
      row[2], // DefinitionEN
      row[3], // Example
      row[4], // ExampleEN
      row[5], // Phonetic
      row[6], // PartOfSpeech
      row[7], // AudioUS
      row[8], // AudioUK
      row[9], // AddedAt
      now.toISOString(), // LastReviewed
      nextReview.toISOString(), // NextReview
      level, // Level
      correct, // Correct
      wrong, // Wrong
      mastered // Mastered
    ]
    
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${VOCABULARY_SHEET_NAME}!A${rowId}:P${rowId}`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [updateRow] }
    })
    
    return { level, correct, wrong, mastered, nextReview: nextReview.toISOString() }
  } catch (error) {
    console.error('❌ Error updating review:', error)
    throw error
  }
}

/**
 * Get words due for review (Spaced Repetition)
 */
export async function getWordsDueForReview(accessToken, spreadsheetId) {
  try {
    const words = await getAllWords(accessToken, spreadsheetId)
    const now = new Date()
    
    return words.filter(word => {
      if (!word.nextReview) return true // New words
      if (word.mastered) return false // Skip mastered words
      const nextReviewDate = new Date(word.nextReview)
      return nextReviewDate <= now
    })
  } catch (error) {
    console.error('❌ Error getting words due for review:', error)
    throw error
  }
}

/**
 * Delete a word
 */
export async function deleteWord(accessToken, spreadsheetId, rowId) {
  try {
    const sheets = getSheetsClient(accessToken)
    
    // Get sheet ID
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId })
    const sheet = spreadsheet.data.sheets.find(s => s.properties.title === VOCABULARY_SHEET_NAME)
    if (!sheet) throw new Error('Sheet not found')
    
    // Delete row
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: sheet.properties.sheetId,
              dimension: 'ROWS',
              startIndex: rowId - 1, // 0-indexed
              endIndex: rowId
            }
          }
        }]
      }
    })
    
    return { success: true }
  } catch (error) {
    console.error('❌ Error deleting word:', error)
    throw error
  }
}

/**
 * Get statistics
 */
export async function getStats(accessToken, spreadsheetId) {
  try {
    const words = await getAllWords(accessToken, spreadsheetId)
    
    const stats = {
      total: words.length,
      mastered: words.filter(w => w.mastered).length,
      dueForReview: (await getWordsDueForReview(accessToken, spreadsheetId)).length,
      totalCorrect: words.reduce((sum, w) => sum + (w.correct || 0), 0),
      totalWrong: words.reduce((sum, w) => sum + (w.wrong || 0), 0),
      averageLevel: words.length > 0 
        ? words.reduce((sum, w) => sum + (w.level || 1), 0) / words.length 
        : 0
    }
    
    return stats
  } catch (error) {
    console.error('❌ Error getting stats:', error)
    throw error
  }
}

