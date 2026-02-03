import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import {
  getOrCreateWorkoutSpreadsheet,
  updateExerciseInSheet,
  deleteExerciseFromSheet
} from '../../../lib/workoutSheetsHelper'
import { exerciseSchema } from '../../../lib/validators'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session?.accessToken || !session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const accessToken = session.accessToken as string
  const userEmail = session.user.email
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid exercise ID' })
  }

  try {
    const spreadsheetId = await getOrCreateWorkoutSpreadsheet(accessToken, userEmail)

    if (req.method === 'PUT') {
      const validated = exerciseSchema.partial().parse(req.body)
      await updateExerciseInSheet(accessToken, spreadsheetId, id, validated)
      return res.status(200).json({ success: true })
    }

    if (req.method === 'DELETE') {
      await deleteExerciseFromSheet(accessToken, spreadsheetId, id)
      return res.status(200).json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error: any) {
    console.error('Exercise API error:', error)
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation error', details: error.errors })
    }
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}

