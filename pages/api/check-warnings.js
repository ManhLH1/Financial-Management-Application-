import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { getOrCreateSpreadsheet } from '../../lib/sheetsHelper'
import { getDebtsFromSheet } from '../../lib/sheetsHelper'

/**
 * Check for debt payment warnings and send reminders automatically
 */
export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    
    if (!session?.accessToken) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Get spreadsheet ID
    const spreadsheetId = await getOrCreateSpreadsheet(session.accessToken, session.user.email)
    
    // Get all debts
    const debts = await getDebtsFromSheet(session.accessToken, spreadsheetId)
    
    // Filter pending debts with payment dates
    const pendingDebts = debts.filter(d => d.status !== 'paid' && d.paymentDay)
    
    const warnings = []
    const today = new Date()
    
    for (const debt of pendingDebts) {
      const paymentDate = new Date(debt.paymentDay)
      const diffTime = paymentDate - today
      const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      let level = 'normal'
      let shouldSendEmail = false
      
      if (daysUntil <= 3 && daysUntil >= 0) {
        level = 'urgent'
        shouldSendEmail = true
      } else if (daysUntil <= 5 && daysUntil > 3) {
        level = 'warning'
      }
      
      if (level !== 'normal') {
        warnings.push({
          debt,
          daysUntil,
          level,
          shouldSendEmail
        })
      }
    }
    
    // Auto-send emails for urgent cases (3 days or less)
    const autoSent = []
    if (req.method === 'POST') {
      for (const warning of warnings) {
        if (warning.shouldSendEmail) {
          try {
            // Call send-reminder API
            const reminderRes = await fetch(`${req.headers.origin}/api/send-reminder`, {
              method: 'POST',
              headers: { 
                'content-type': 'application/json',
                'cookie': req.headers.cookie // Pass session cookie
              },
              body: JSON.stringify({ debt: warning.debt })
            })
            
            if (reminderRes.ok) {
              autoSent.push({
                person: warning.debt.person,
                daysUntil: warning.daysUntil
              })
            }
          } catch (error) {
            console.error('Error auto-sending reminder:', error)
          }
        }
      }
    }
    
    return res.status(200).json({
      totalDebts: pendingDebts.length,
      warnings: warnings.length,
      urgent: warnings.filter(w => w.level === 'urgent').length,
      normal: warnings.filter(w => w.level === 'warning').length,
      details: warnings.map(w => ({
        person: w.debt.person,
        amount: w.debt.amount,
        paymentDay: w.debt.paymentDay,
        daysUntil: w.daysUntil,
        level: w.level
      })),
      autoSent
    })
    
  } catch (error) {
    console.error('❌ Error checking warnings:', error)
    return res.status(500).json({ 
      error: 'Failed to check warnings',
      details: error.message 
    })
  }
}
