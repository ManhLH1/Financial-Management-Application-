import { getSheetsClient, getDriveClient } from './googleClient'

// Sheet name for vocabulary data
export const VOCABULARY_SHEET = 'Vocabulary'

/**
 * Get or create vocabulary spreadsheet for user
 * Creates a separate spreadsheet for vocabulary learning
 */
export async function getOrCreateVocabularySpreadsheet(accessToken, userEmail) {
  console.log(`🔍 [getOrCreateVocabularySpreadsheet] User: ${userEmail}`)
  
  try {
    const drive = getDriveClient(accessToken)
    
    // Search for vocabulary spreadsheet
    const fileName = `VocabLearn - ${userEmail}`
    console.log(`🔍 Searching Drive for: "${fileName}"`)
    
    const response = await drive.files.list({
      q: `name contains '${fileName}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
      fields: 'files(id, name, createdTime)',
      orderBy: 'createdTime desc',
      pageSize: 10
    })
    
    const files = response.data.files || []
    console.log(`📊 Found ${files.length} vocabulary spreadsheet(s) for ${userEmail}`)
    
    if (files.length > 0) {
      const spreadsheet = files[0]
      console.log(`✅ Using vocabulary spreadsheet: ${spreadsheet.name} (ID: ${spreadsheet.id})`)
      
      // Initialize headers if needed
      await initializeVocabularyHeaders(accessToken, spreadsheet.id)
      
      return spreadsheet.id
    }
    
    // Create new spreadsheet
    console.log(`📝 Creating new vocabulary spreadsheet...`)
    const sheets = getSheetsClient(accessToken)
    
    const createResponse = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType: 'application/vnd.google-apps.spreadsheet'
      }
    })
    
    const spreadsheetId = createResponse.data.id
    console.log(`✅ Created vocabulary spreadsheet: ${spreadsheetId}`)
    
    // Initialize headers
    await initializeVocabularyHeaders(accessToken, spreadsheetId)
    
    return spreadsheetId
  } catch (error) {
    console.error('❌ Error getting/creating vocabulary spreadsheet:', error)
    throw error
  }
}

/**
 * Initialize vocabulary sheet headers
 */
async function initializeVocabularyHeaders(accessToken, spreadsheetId) {
  try {
    const sheets = getSheetsClient(accessToken)
    
    // Check if sheet exists and has headers
    try {
      const checkResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${VOCABULARY_SHEET}!A1:M1`
      })
      
      if (checkResponse.data.values && checkResponse.data.values.length > 0) {
        console.log('✅ Vocabulary headers already exist')
        return
      }
    } catch (error) {
      // Sheet might not exist, will create it
      console.log('Sheet might not exist, will create...')
    }
    
    // Check if sheet exists by getting spreadsheet metadata
    let sheetExists = false
    try {
      const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId })
      sheetExists = spreadsheet.data.sheets.some(s => s.properties.title === VOCABULARY_SHEET)
    } catch (error) {
      console.error('Error checking sheet existence:', error)
    }
    
    // Create sheet if it doesn't exist
    if (!sheetExists) {
      try {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [{
              addSheet: {
                properties: {
                  title: VOCABULARY_SHEET
                }
              }
            }]
          }
        })
        console.log('✅ Created vocabulary sheet')
      } catch (error) {
        // Sheet might already exist, ignore
        if (!error.message.includes('already exists') && !error.message.includes('duplicate')) {
          throw error
        }
      }
    }
    
    // Add headers
    const headers = [
      ['Word', 'Phonetic', 'PartOfSpeech', 'Definition', 'Example', 'AudioUS', 'AudioUK', 'AddedDate', 'LastReviewed', 'NextReview', 'Level', 'CorrectCount', 'WrongCount']
    ]
    
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${VOCABULARY_SHEET}!A1:M1`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: headers }
    })
    
    // Format headers
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          repeatCell: {
            range: {
              sheetId: await getSheetId(sheets, spreadsheetId, VOCABULARY_SHEET),
              startRowIndex: 0,
              endRowIndex: 1
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.2, green: 0.4, blue: 0.8 },
                textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true }
              }
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat)'
          }
        }]
      }
    })
    
    console.log('✅ Vocabulary headers initialized')
  } catch (error) {
    console.error('Error initializing vocabulary headers:', error)
    throw error
  }
}

/**
 * Get sheet ID by name
 */
async function getSheetId(sheets, spreadsheetId, sheetName) {
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId })
  const sheet = spreadsheet.data.sheets.find(s => s.properties.title === sheetName)
  return sheet ? sheet.properties.sheetId : null
}

/**
 * Save vocabulary word to Google Sheet
 */
export async function saveVocabularyWord(accessToken, spreadsheetId, wordData) {
  try {
    const sheets = getSheetsClient(accessToken)
    
    const now = new Date().toISOString()
    const nextReview = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Next day
    
    const values = [[
      wordData.word,
      wordData.phonetic || '',
      wordData.partOfSpeech || '',
      wordData.definition || '',
      wordData.example || '',
      wordData.audioUS || '',
      wordData.audioUK || '',
      now, // AddedDate
      now, // LastReviewed
      nextReview, // NextReview
      1, // Level (starts at 1)
      0, // CorrectCount
      0  // WrongCount
    ]]
    
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${VOCABULARY_SHEET}!A:M`,
      valueInputOption: 'USER_ENTERED',
      resource: { values }
    })
    
    return response.data
  } catch (error) {
    console.error('Error saving vocabulary word:', error)
    throw error
  }
}

/**
 * Get all vocabulary words from Google Sheet
 */
export async function getVocabularyWords(accessToken, spreadsheetId) {
  try {
    const sheets = getSheetsClient(accessToken)
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${VOCABULARY_SHEET}!A2:M`
    })
    
    if (!response.data.values) {
      return []
    }
    
    return response.data.values.map((row, index) => ({
      id: index + 2, // Row number (1-indexed, +1 for header)
      word: row[0] || '',
      phonetic: row[1] || '',
      partOfSpeech: row[2] || '',
      definition: row[3] || '',
      example: row[4] || '',
      audioUS: row[5] || '',
      audioUK: row[6] || '',
      addedDate: row[7] || '',
      lastReviewed: row[8] || '',
      nextReview: row[9] || '',
      level: parseInt(row[10]) || 1,
      correctCount: parseInt(row[11]) || 0,
      wrongCount: parseInt(row[12]) || 0
    }))
  } catch (error) {
    console.error('Error getting vocabulary words:', error)
    throw error
  }
}

/**
 * Update vocabulary word review data
 */
export async function updateVocabularyReview(accessToken, spreadsheetId, rowId, isCorrect) {
  try {
    const sheets = getSheetsClient(accessToken)
    
    // Get current data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${VOCABULARY_SHEET}!A${rowId}:M${rowId}`
    })
    
    if (!response.data.values || response.data.values.length === 0) {
      throw new Error('Word not found')
    }
    
    const row = response.data.values[0]
    let level = parseInt(row[10]) || 1
    let correctCount = parseInt(row[11]) || 0
    let wrongCount = parseInt(row[12]) || 0
    
    // Update counts
    if (isCorrect) {
      correctCount++
      level = Math.min(level + 1, 10) // Max level 10
    } else {
      wrongCount++
      level = Math.max(level - 1, 1) // Min level 1
    }
    
    // Calculate next review date based on level (Spaced Repetition)
    const now = new Date()
    const daysUntilNextReview = Math.pow(2, level - 1) // 1, 2, 4, 8, 16, 32, 64, 128, 256, 512 days
    const nextReview = new Date(now.getTime() + daysUntilNextReview * 24 * 60 * 60 * 1000)
    
    // Update row
    const updateValues = [
      row[0], // Word
      row[1], // Phonetic
      row[2], // PartOfSpeech
      row[3], // Definition
      row[4], // Example
      row[5], // AudioUS
      row[6], // AudioUK
      row[7], // AddedDate
      now.toISOString(), // LastReviewed
      nextReview.toISOString(), // NextReview
      level, // Level
      correctCount, // CorrectCount
      wrongCount  // WrongCount
    ]
    
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${VOCABULARY_SHEET}!A${rowId}:M${rowId}`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [updateValues] }
    })
    
    return { level, correctCount, wrongCount, nextReview: nextReview.toISOString() }
  } catch (error) {
    console.error('Error updating vocabulary review:', error)
    throw error
  }
}

/**
 * Get words due for review (Spaced Repetition)
 */
export async function getWordsDueForReview(accessToken, spreadsheetId) {
  try {
    const words = await getVocabularyWords(accessToken, spreadsheetId)
    const now = new Date()
    
    return words.filter(word => {
      if (!word.nextReview) return false
      const nextReviewDate = new Date(word.nextReview)
      return nextReviewDate <= now
    })
  } catch (error) {
    console.error('Error getting words due for review:', error)
    throw error
  }
}

