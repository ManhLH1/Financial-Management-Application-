import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { startWarningScheduler, startTestScheduler, scheduleWarningCheck } from '../../lib/scheduler'

/**
 * Control the warning scheduler
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { action, schedule } = req.body

    switch (action) {
      case 'start':
        startWarningScheduler()
        return res.status(200).json({
          success: true,
          message: 'Scheduler started - Will run daily at 9:00 AM',
          schedule: '0 9 * * *'
        })

      case 'start-test':
        startTestScheduler()
        return res.status(200).json({
          success: true,
          message: 'Test scheduler started - Runs every minute',
          schedule: '* * * * *'
        })

      case 'custom':
        if (!schedule) {
          return res.status(400).json({ error: 'Schedule is required for custom action' })
        }
        scheduleWarningCheck(schedule)
        return res.status(200).json({
          success: true,
          message: `Custom scheduler started`,
          schedule
        })

      default:
        return res.status(400).json({ error: 'Invalid action. Use: start, start-test, or custom' })
    }

  } catch (error) {
    console.error('❌ Error controlling scheduler:', error)
    return res.status(500).json({
      error: 'Failed to control scheduler',
      details: error.message
    })
  }
}
