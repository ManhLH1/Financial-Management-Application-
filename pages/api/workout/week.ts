import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import {
  getOrCreateWorkoutSpreadsheet,
  getWorkoutDaysFromSheet,
  getWorkoutItemsFromSheet,
  addWorkoutDayToSheet
} from '../../../lib/workoutSheetsHelper'
import { workoutDaySchema } from '../../../lib/validators'
import { v4 as uuidv4 } from 'uuid'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session?.accessToken || !session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const accessToken = session.accessToken as string
  const userEmail = session.user.email
  const userId = session.user.email // Using email as user_id

  try {
    const spreadsheetId = await getOrCreateWorkoutSpreadsheet(accessToken, userEmail)

    if (req.method === 'GET') {
      const days = await getWorkoutDaysFromSheet(accessToken, spreadsheetId, userId)
      
      // Get items for each day
      const daysWithItems = await Promise.all(
        days.map(async (day) => {
          const items = await getWorkoutItemsFromSheet(accessToken, spreadsheetId, day.id)
          return { ...day, items }
        })
      )

      return res.status(200).json(daysWithItems)
    }

    if (req.method === 'POST') {
      const validated = workoutDaySchema.parse(req.body)
      const day = {
        id: uuidv4(),
        user_id: userId,
        ...validated,
        note: validated.note || undefined
      }
      
      await addWorkoutDayToSheet(accessToken, spreadsheetId, day)
      return res.status(201).json(day)
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error: any) {
    console.error('Workout week API error:', error)
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}

