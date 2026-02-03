import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { getOrCreateWorkoutSpreadsheet, getExercisesFromSheet, addExerciseToSheet } from '../../../lib/workoutSheetsHelper'
import { exerciseSchema } from '../../../lib/validators'
import { v4 as uuidv4 } from 'uuid'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session?.accessToken || !session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const accessToken = session.accessToken as string
  const userEmail = session.user.email

  try {
    const spreadsheetId = await getOrCreateWorkoutSpreadsheet(accessToken, userEmail)

    if (req.method === 'GET') {
      const exercises = await getExercisesFromSheet(accessToken, spreadsheetId)
      return res.status(200).json(exercises)
    }

    if (req.method === 'POST') {
      const validated = exerciseSchema.parse(req.body)
      const exercise = {
        id: uuidv4(),
        ...validated,
        media_url: validated.media_url || undefined,
        description: validated.description || undefined,
        mistakes: validated.mistakes || undefined
      }
      
      await addExerciseToSheet(accessToken, spreadsheetId, exercise)
      return res.status(201).json(exercise)
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error: any) {
    console.error('Exercises API error:', error)
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}

