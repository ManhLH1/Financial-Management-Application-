const cron = require('node-cron')

let isSchedulerRunning = false

/**
 * Schedule daily warning checks
 * Runs every day at 9:00 AM
 */
export function startWarningScheduler() {
  if (isSchedulerRunning) {
    console.log('⏰ Warning scheduler is already running')
    return
  }

  // Schedule: Run every day at 9:00 AM
  // Format: minute hour day month weekday
  // '0 9 * * *' = At 09:00 every day
  cron.schedule('0 9 * * *', async () => {
    console.log('🔔 Running scheduled warning check...')
    
    try {
      // Call check-warnings API
      const response = await fetch('http://localhost:3003/api/check-warnings', {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Scheduled check completed:')
        console.log(`  - Total warnings: ${data.warnings}`)
        console.log(`  - Urgent: ${data.urgent}`)
        console.log(`  - Emails sent: ${data.autoSent?.length || 0}`)
      } else {
        console.error('❌ Scheduled check failed:', response.status)
      }
    } catch (error) {
      console.error('❌ Error in scheduled check:', error)
    }
  })

  isSchedulerRunning = true
  console.log('✅ Warning scheduler started - Will run daily at 9:00 AM')
}

/**
 * Schedule for testing - runs every minute
 */
export function startTestScheduler() {
  if (isSchedulerRunning) {
    console.log('⏰ Scheduler is already running')
    return
  }

  // For testing: Run every minute
  cron.schedule('* * * * *', async () => {
    console.log('🔔 [TEST] Running warning check...')
    
    try {
      const response = await fetch('http://localhost:3003/api/check-warnings', {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ [TEST] Check completed - Warnings:', data.warnings)
      }
    } catch (error) {
      console.error('❌ [TEST] Error:', error.message)
    }
  })

  isSchedulerRunning = true
  console.log('✅ [TEST] Scheduler started - Runs every minute')
}

/**
 * Custom schedule
 */
export function scheduleWarningCheck(cronExpression) {
  if (isSchedulerRunning) {
    console.log('⏰ Scheduler is already running')
    return
  }

  cron.schedule(cronExpression, async () => {
    console.log(`🔔 Custom scheduled check (${cronExpression})...`)
    
    try {
      const response = await fetch('http://localhost:3003/api/check-warnings', {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Custom check completed:', data)
      }
    } catch (error) {
      console.error('❌ Custom check error:', error)
    }
  })

  isSchedulerRunning = true
  console.log(`✅ Custom scheduler started: ${cronExpression}`)
}

// Common cron patterns:
// '0 9 * * *'     - Every day at 9:00 AM
// '0 */6 * * *'   - Every 6 hours
// '0 9,15 * * *'  - Every day at 9:00 AM and 3:00 PM
// '0 9 * * 1'     - Every Monday at 9:00 AM
// '0 9 1 * *'     - First day of every month at 9:00 AM
// '*/5 * * * *'   - Every 5 minutes (for testing)
