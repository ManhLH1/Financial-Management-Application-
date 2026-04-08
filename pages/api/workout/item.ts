import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import {
  getOrCreateWorkoutSpreadsheet,
  addWorkoutItemToSheet
} from '../../../lib/workoutSheetsHelper'
import { workoutItemSchema } from '../../../lib/validators'
import { v4 as uuidv4 } from 'uuid'
import type { WorkoutItem } from '../../../types/workout'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session?.accessToken || !session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const accessToken = session.accessToken as string
  const userEmail = session.user.email

  try {
    const spreadsheetId = await getOrCreateWorkoutSpreadsheet(accessToken, userEmail)

    if (req.method === 'POST') {
      const validated = workoutItemSchema.parse(req.body)
      const { day_id } = req.body
      
      if (!day_id) {
        return res.status(400).json({ error: 'day_id is required' })
      }

      const item: Omit<WorkoutItem, 'created_at'> = {
        id: uuidv4(),
        day_id: String(day_id),
        exercise_id: validated.exercise_id,
        target_sets: validated.target_sets,
        target_reps: validated.target_reps,
        target_weight: validated.target_weight ?? undefined,
        target_duration: validated.target_duration ?? undefined
      }
      
      await addWorkoutItemToSheet(accessToken, spreadsheetId, item)
      return res.status(201).json(item)
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error: any) {
    console.error('Workout item API error:', error)
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}

