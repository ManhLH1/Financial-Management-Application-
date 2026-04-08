import { getSheetsClient, getDriveClient } from './googleClient'
import type { WorkoutDay, WorkoutItem, WorkoutLog } from '../types/workout'
import type { Exercise as ExerciseType } from '../types/exercise'

// Sheet names for workout data
export const WORKOUT_SHEETS = {
  EXERCISES: 'exercises',
  WORKOUT_DAYS: 'workout_days',
  WORKOUT_ITEMS: 'workout_items',
  WORKOUT_LOGS: 'workout_logs'
}

// In-memory cache for workout spreadsheet IDs
const workoutSpreadsheetCache = new Map()
const CACHE_TTL = 30 * 60 * 1000 // 30 minutes

/**
 * Get or create workout spreadsheet for user
 */
export async function getOrCreateWorkoutSpreadsheet(accessToken: string, userEmail: string): Promise<string> {
  const cacheKey = `workout_${userEmail}`
  const cached = workoutSpreadsheetCache.get(cacheKey)
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.id
  }

  // Search for existing spreadsheet
  const drive = getDriveClient(accessToken)
  const fileName = `GymWorkout - ${userEmail}`
  
  try {
    const response = await drive.files.list({
      q: `name contains '${fileName}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
      fields: 'files(id, name)',
      orderBy: 'createdTime desc',
      pageSize: 1
    })

    const files = response.data.files || []
    if (files.length > 0) {
      const spreadsheetId = files[0].id!
      workoutSpreadsheetCache.set(cacheKey, { id: spreadsheetId, timestamp: Date.now() })
      await ensureWorkoutSheetsExist(accessToken, spreadsheetId)
      return spreadsheetId
    }
  } catch (error) {
    console.error('Error searching for workout spreadsheet:', error)
  }

  // Create new spreadsheet
  const sheets = getSheetsClient(accessToken)
  const response = await sheets.spreadsheets.create({
    requestBody: {
      properties: {
        title: fileName,
      },
      sheets: [
        {
          properties: {
            title: WORKOUT_SHEETS.EXERCISES,
            gridProperties: { frozenRowCount: 1 }
          }
        },
        {
          properties: {
            title: WORKOUT_SHEETS.WORKOUT_DAYS,
            gridProperties: { frozenRowCount: 1 }
          }
        },
        {
          properties: {
            title: WORKOUT_SHEETS.WORKOUT_ITEMS,
            gridProperties: { frozenRowCount: 1 }
          }
        },
        {
          properties: {
            title: WORKOUT_SHEETS.WORKOUT_LOGS,
            gridProperties: { frozenRowCount: 1 }
          }
        }
      ]
    }
  })

  const spreadsheetId = response.data.spreadsheetId!
  workoutSpreadsheetCache.set(cacheKey, { id: spreadsheetId, timestamp: Date.now() })
  
  // Initialize headers
  await initializeWorkoutSheets(accessToken, spreadsheetId)
  
  return spreadsheetId
}

/**
 * Ensure all workout sheets exist and have headers
 */
async function ensureWorkoutSheetsExist(accessToken: string, spreadsheetId: string) {
  const sheets = getSheetsClient(accessToken)
  
  try {
    const metadata = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'sheets.properties.title'
    })

    const existingTitles = metadata.data.sheets?.map(s => s.properties?.title) || []
    
    // Check if headers exist for each sheet
    for (const sheetName of Object.values(WORKOUT_SHEETS)) {
      if (!existingTitles.includes(sheetName)) {
        await createSheet(accessToken, spreadsheetId, sheetName)
      }
      
      // Check if headers exist
      const headerCheck = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1:Z1`
      })
      
      if (!headerCheck.data.values || headerCheck.data.values.length === 0) {
        await initializeSheetHeaders(accessToken, spreadsheetId, sheetName)
      }
    }
  } catch (error) {
    console.error('Error ensuring workout sheets:', error)
    await initializeWorkoutSheets(accessToken, spreadsheetId)
  }
}

/**
 * Create a new sheet
 */
async function createSheet(accessToken: string, spreadsheetId: string, sheetTitle: string) {
  const sheets = getSheetsClient(accessToken)
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{
        addSheet: {
          properties: {
            title: sheetTitle,
            gridProperties: { frozenRowCount: 1 }
          }
        }
      }]
    }
  })
}

/**
 * Initialize all workout sheets with headers
 */
async function initializeWorkoutSheets(accessToken: string, spreadsheetId: string) {
  await initializeSheetHeaders(accessToken, spreadsheetId, WORKOUT_SHEETS.EXERCISES)
  await initializeSheetHeaders(accessToken, spreadsheetId, WORKOUT_SHEETS.WORKOUT_DAYS)
  await initializeSheetHeaders(accessToken, spreadsheetId, WORKOUT_SHEETS.WORKOUT_ITEMS)
  await initializeSheetHeaders(accessToken, spreadsheetId, WORKOUT_SHEETS.WORKOUT_LOGS)
}

/**
 * Initialize headers for a specific sheet
 */
async function initializeSheetHeaders(accessToken: string, spreadsheetId: string, sheetName: string) {
  const sheets = getSheetsClient(accessToken)
  let headers: string[][] = []

  switch (sheetName) {
    case WORKOUT_SHEETS.EXERCISES:
      headers = [[
        'id', 'name', 'muscle_group', 'level', 'equipment',
        'media_url', 'description', 'mistakes', 'created_at'
      ]]
      break
    case WORKOUT_SHEETS.WORKOUT_DAYS:
      headers = [['id', 'user_id', 'day_of_week', 'note', 'created_at']]
      break
    case WORKOUT_SHEETS.WORKOUT_ITEMS:
      headers = [[
        'id', 'day_id', 'exercise_id', 'target_sets', 'target_reps',
        'target_weight', 'target_duration', 'created_at'
      ]]
      break
    case WORKOUT_SHEETS.WORKOUT_LOGS:
      headers = [[
        'id', 'user_id', 'exercise_id', 'date', 'actual_sets', 'actual_reps',
        'actual_weight', 'actual_duration', 'rating', 'note', 'created_at'
      ]]
      break
  }

  if (headers.length > 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1:Z1`,
      valueInputOption: 'RAW',
      requestBody: { values: headers }
    })
  }
}

// ========== EXERCISES CRUD ==========

export async function getExercisesFromSheet(accessToken: string, spreadsheetId: string): Promise<ExerciseType[]> {
  const sheets = getSheetsClient(accessToken)
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${WORKOUT_SHEETS.EXERCISES}!A2:I`
  })

  const rows = response.data.values || []
  return rows.map(row => ({
    id: row[0] || '',
    name: row[1] || '',
    muscle_group: row[2] || '',
    level: (row[3] || 'Beginner') as ExerciseType['level'],
    equipment: (row[4] || 'Other') as ExerciseType['equipment'],
    media_url: row[5] || undefined,
    description: row[6] || undefined,
    mistakes: row[7] || undefined,
    created_at: row[8] || new Date().toISOString()
  }))
}

export async function addExerciseToSheet(
  accessToken: string,
  spreadsheetId: string,
  exercise: Omit<ExerciseType, 'created_at'>
): Promise<void> {
  const sheets = getSheetsClient(accessToken)
  const values = [[
    exercise.id,
    exercise.name,
    exercise.muscle_group,
    exercise.level,
    exercise.equipment,
    exercise.media_url || '',
    exercise.description || '',
    exercise.mistakes || '',
    new Date().toISOString()
  ]]

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${WORKOUT_SHEETS.EXERCISES}!A:I`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values }
  })
}

export async function updateExerciseInSheet(
  accessToken: string,
  spreadsheetId: string,
  exerciseId: string,
  updates: Partial<ExerciseType>
): Promise<void> {
  const sheets = getSheetsClient(accessToken)
  
  // Get all exercises to find row
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${WORKOUT_SHEETS.EXERCISES}!A2:I`
  })

  const rows = response.data.values || []
  const rowIndex = rows.findIndex(row => row[0] === exerciseId)
  
  if (rowIndex === -1) throw new Error('Exercise not found')

  const rowNumber = rowIndex + 2
  const currentRow = rows[rowIndex]

  const updatedRow = [
    currentRow[0], // id
    updates.name !== undefined ? updates.name : currentRow[1],
    updates.muscle_group !== undefined ? updates.muscle_group : currentRow[2],
    updates.level !== undefined ? updates.level : currentRow[3],
    updates.equipment !== undefined ? updates.equipment : currentRow[4],
    updates.media_url !== undefined ? updates.media_url : (currentRow[5] || ''),
    updates.description !== undefined ? updates.description : (currentRow[6] || ''),
    updates.mistakes !== undefined ? updates.mistakes : (currentRow[7] || ''),
    currentRow[8] // created_at
  ]

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${WORKOUT_SHEETS.EXERCISES}!A${rowNumber}:I${rowNumber}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [updatedRow] }
  })
}

export async function deleteExerciseFromSheet(
  accessToken: string,
  spreadsheetId: string,
  exerciseId: string
): Promise<void> {
  const sheets = getSheetsClient(accessToken)
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${WORKOUT_SHEETS.EXERCISES}!A2:I`
  })

  const rows = response.data.values || []
  const rowIndex = rows.findIndex(row => row[0] === exerciseId)
  
  if (rowIndex === -1) throw new Error('Exercise not found')

  const rowNumber = rowIndex + 2

  // Delete the row
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId: await getSheetId(sheets, spreadsheetId, WORKOUT_SHEETS.EXERCISES),
            dimension: 'ROWS',
            startIndex: rowNumber - 1,
            endIndex: rowNumber
          }
        }
      }]
    }
  })
}

// ========== WORKOUT DAYS CRUD ==========

export async function getWorkoutDaysFromSheet(
  accessToken: string,
  spreadsheetId: string,
  userId: string
): Promise<WorkoutDay[]> {
  const sheets = getSheetsClient(accessToken)
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${WORKOUT_SHEETS.WORKOUT_DAYS}!A2:E`
  })

  const rows = response.data.values || []
  return rows
    .filter(row => row[1] === userId)
    .map(row => ({
      id: row[0] || '',
      user_id: row[1] || '',
      day_of_week: Number(row[2]) || 1,
      note: row[3] || undefined,
      created_at: row[4] || new Date().toISOString()
    }))
}

export async function addWorkoutDayToSheet(
  accessToken: string,
  spreadsheetId: string,
  day: Omit<WorkoutDay, 'created_at'>
): Promise<void> {
  const sheets = getSheetsClient(accessToken)
  const values = [[
    day.id,
    day.user_id,
    day.day_of_week,
    day.note || '',
    new Date().toISOString()
  ]]

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${WORKOUT_SHEETS.WORKOUT_DAYS}!A:E`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values }
  })
}

// ========== WORKOUT ITEMS CRUD ==========

export async function getWorkoutItemsFromSheet(
  accessToken: string,
  spreadsheetId: string,
  dayId: string
): Promise<WorkoutItem[]> {
  const sheets = getSheetsClient(accessToken)
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${WORKOUT_SHEETS.WORKOUT_ITEMS}!A2:H`
  })

  const rows = response.data.values || []
  return rows
    .filter(row => row[1] === dayId)
    .map(row => ({
      id: row[0] || '',
      day_id: row[1] || '',
      exercise_id: row[2] || '',
      target_sets: Number(row[3]) || 0,
      target_reps: Number(row[4]) || 0,
      target_weight: row[5] ? Number(row[5]) : undefined,
      target_duration: row[6] ? Number(row[6]) : undefined,
      created_at: row[7] || new Date().toISOString()
    }))
}

export async function addWorkoutItemToSheet(
  accessToken: string,
  spreadsheetId: string,
  item: Omit<WorkoutItem, 'created_at'>
): Promise<void> {
  const sheets = getSheetsClient(accessToken)
  const values = [[
    item.id,
    item.day_id,
    item.exercise_id,
    item.target_sets,
    item.target_reps,
    item.target_weight || '',
    item.target_duration || '',
    new Date().toISOString()
  ]]

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${WORKOUT_SHEETS.WORKOUT_ITEMS}!A:H`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values }
  })
}

export async function updateWorkoutItemInSheet(
  accessToken: string,
  spreadsheetId: string,
  itemId: string,
  updates: Partial<WorkoutItem>
): Promise<void> {
  const sheets = getSheetsClient(accessToken)
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${WORKOUT_SHEETS.WORKOUT_ITEMS}!A2:H`
  })

  const rows = response.data.values || []
  const rowIndex = rows.findIndex(row => row[0] === itemId)
  
  if (rowIndex === -1) throw new Error('Workout item not found')

  const rowNumber = rowIndex + 2
  const currentRow = rows[rowIndex]

  const updatedRow = [
    currentRow[0], // id
    updates.day_id !== undefined ? updates.day_id : currentRow[1],
    updates.exercise_id !== undefined ? updates.exercise_id : currentRow[2],
    updates.target_sets !== undefined ? updates.target_sets : currentRow[3],
    updates.target_reps !== undefined ? updates.target_reps : currentRow[4],
    updates.target_weight !== undefined ? (updates.target_weight || '') : currentRow[5],
    updates.target_duration !== undefined ? (updates.target_duration || '') : currentRow[6],
    currentRow[7] // created_at
  ]

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${WORKOUT_SHEETS.WORKOUT_ITEMS}!A${rowNumber}:H${rowNumber}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [updatedRow] }
  })
}

export async function deleteWorkoutItemFromSheet(
  accessToken: string,
  spreadsheetId: string,
  itemId: string
): Promise<void> {
  const sheets = getSheetsClient(accessToken)
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${WORKOUT_SHEETS.WORKOUT_ITEMS}!A2:H`
  })

  const rows = response.data.values || []
  const rowIndex = rows.findIndex(row => row[0] === itemId)
  
  if (rowIndex === -1) throw new Error('Workout item not found')

  const rowNumber = rowIndex + 2

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId: await getSheetId(sheets, spreadsheetId, WORKOUT_SHEETS.WORKOUT_ITEMS),
            dimension: 'ROWS',
            startIndex: rowNumber - 1,
            endIndex: rowNumber
          }
        }
      }]
    }
  })
}

// ========== WORKOUT LOGS CRUD ==========

export async function addWorkoutLogToSheet(
  accessToken: string,
  spreadsheetId: string,
  log: Omit<WorkoutLog, 'created_at'>
): Promise<void> {
  const sheets = getSheetsClient(accessToken)
  const values = [[
    log.id,
    log.user_id,
    log.exercise_id,
    log.date,
    log.actual_sets,
    log.actual_reps,
    log.actual_weight || '',
    log.actual_duration || '',
    log.rating,
    log.note || '',
    new Date().toISOString()
  ]]

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${WORKOUT_SHEETS.WORKOUT_LOGS}!A:K`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values }
  })
}

export async function getWorkoutLogsFromSheet(
  accessToken: string,
  spreadsheetId: string,
  userId: string,
  exerciseId?: string
): Promise<WorkoutLog[]> {
  const sheets = getSheetsClient(accessToken)
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${WORKOUT_SHEETS.WORKOUT_LOGS}!A2:K`
  })

  const rows = response.data.values || []
  return rows
    .filter(row => {
      if (row[1] !== userId) return false
      if (exerciseId && row[2] !== exerciseId) return false
      return true
    })
    .map(row => ({
      id: row[0] || '',
      user_id: row[1] || '',
      exercise_id: row[2] || '',
      date: row[3] || '',
      actual_sets: Number(row[4]) || 0,
      actual_reps: Number(row[5]) || 0,
      actual_weight: row[6] ? Number(row[6]) : undefined,
      actual_duration: row[7] ? Number(row[7]) : undefined,
      rating: Number(row[8]) || 1,
      note: row[9] || undefined,
      created_at: row[10] || new Date().toISOString()
    }))
}

// Helper function to get sheet ID
async function getSheetId(sheets: any, spreadsheetId: string, sheetTitle: string): Promise<number> {
  const metadata = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets.properties'
  })

  const sheet = metadata.data.sheets?.find(
    (s: any) => s.properties?.title === sheetTitle
  )

  return sheet?.properties?.sheetId || 0
}

