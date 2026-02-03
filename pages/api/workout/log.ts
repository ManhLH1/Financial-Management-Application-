import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import {
  getOrCreateWorkoutSpreadsheet,
  addWorkoutLogToSheet,
  getWorkoutLogsFromSheet
} from '../../../lib/workoutSheetsHelper'
import { workoutLogSchema } from '../../../lib/validators'
import { v4 as uuidv4 } from 'uuid'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session?.accessToken || !session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const accessToken = session.accessToken as string
  const userEmail = session.user.email
  const userId = session.user.email

  try {
    const spreadsheetId = await getOrCreateWorkoutSpreadsheet(accessToken, userEmail)

    if (req.method === 'POST') {
      const validated = workoutLogSchema.parse(req.body)
      const log = {
        id: uuidv4(),
        user_id: userId,
        ...validated,
        actual_weight: validated.actual_weight || undefined,
        actual_duration: validated.actual_duration || undefined,
        note: validated.note || undefined
      }
      
      await addWorkoutLogToSheet(accessToken, spreadsheetId, log)
      return res.status(201).json(log)
    }

    if (req.method === 'GET') {
      const { exercise_id } = req.query
      const logs = await getWorkoutLogsFromSheet(
        accessToken,
        spreadsheetId,
        userId,
        exercise_id as string | undefined
      )
      return res.status(200).json(logs)
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error: any) {
    console.error('Workout log API error:', error)
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}

