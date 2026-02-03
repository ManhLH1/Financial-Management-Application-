import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import {
  getOrCreateWorkoutSpreadsheet,
  getWorkoutLogsFromSheet
} from '../../../lib/workoutSheetsHelper'
import { getExercisesFromSheet } from '../../../lib/workoutSheetsHelper'
import type { WorkoutStatistics } from '../../../types/workout'

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

    if (req.method === 'GET') {
      const logs = await getWorkoutLogsFromSheet(accessToken, spreadsheetId, userId)
      const exercises = await getExercisesFromSheet(accessToken, spreadsheetId)

      // Calculate statistics
      const now = new Date()
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1))
      startOfWeek.setHours(0, 0, 0, 0)

      const logsThisWeek = logs.filter(log => {
        const logDate = new Date(log.date)
        return logDate >= startOfWeek
      })

      // Calculate volume (total kg lifted)
      const volumeThisWeek = logsThisWeek.reduce((sum, log) => {
        if (log.actual_weight && log.actual_sets && log.actual_reps) {
          return sum + (log.actual_weight * log.actual_sets * log.actual_reps)
        }
        return sum
      }, 0)

      // Calculate PRs
      const prsMap = new Map<string, { weight: number; reps: number; date: string }>()
      
      logs.forEach(log => {
        if (log.actual_weight && log.actual_reps) {
          const current = prsMap.get(log.exercise_id)
          const exercise = exercises.find(e => e.id === log.exercise_id)
          
          if (!current || 
              log.actual_weight > current.weight || 
              (log.actual_weight === current.weight && log.actual_reps > current.reps)) {
            prsMap.set(log.exercise_id, {
              weight: log.actual_weight,
              reps: log.actual_reps,
              date: log.date
            })
          }
        }
      })

      const prs = Array.from(prsMap.entries()).map(([exercise_id, data]) => {
        const exercise = exercises.find(e => e.id === exercise_id)
        return {
          exercise_id,
          exercise_name: exercise?.name || 'Unknown',
          max_weight: data.weight,
          max_reps: data.reps,
          date: data.date
        }
      })

      // Weekly volume (last 12 weeks)
      const weeklyVolume: Array<{ week: string; volume: number }> = []
      for (let i = 11; i >= 0; i--) {
        const weekStart = new Date(startOfWeek)
        weekStart.setDate(weekStart.getDate() - (i * 7))
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate() + 6)

        const weekLogs = logs.filter(log => {
          const logDate = new Date(log.date)
          return logDate >= weekStart && logDate <= weekEnd
        })

        const volume = weekLogs.reduce((sum, log) => {
          if (log.actual_weight && log.actual_sets && log.actual_reps) {
            return sum + (log.actual_weight * log.actual_sets * log.actual_reps)
          }
          return sum
        }, 0)

        weeklyVolume.push({
          week: weekStart.toISOString().split('T')[0],
          volume
        })
      }

      // Training frequency (last 12 weeks)
      const trainingFrequency: Array<{ week: string; sessions: number }> = []
      for (let i = 11; i >= 0; i--) {
        const weekStart = new Date(startOfWeek)
        weekStart.setDate(weekStart.getDate() - (i * 7))
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate() + 6)

        const uniqueDates = new Set(
          logs
            .filter(log => {
              const logDate = new Date(log.date)
              return logDate >= weekStart && logDate <= weekEnd
            })
            .map(log => log.date)
        )

        trainingFrequency.push({
          week: weekStart.toISOString().split('T')[0],
          sessions: uniqueDates.size
        })
      }

      const statistics: WorkoutStatistics = {
        total_sessions: new Set(logs.map(log => log.date)).size,
        sessions_this_week: new Set(logsThisWeek.map(log => log.date)).size,
        volume_this_week: volumeThisWeek,
        prs,
        weekly_volume: weeklyVolume,
        training_frequency: trainingFrequency
      }

      return res.status(200).json(statistics)
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error: any) {
    console.error('Statistics API error:', error)
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}

