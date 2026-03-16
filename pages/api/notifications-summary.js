import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { getOrCreateSpreadsheet } from '../../lib/sheetsHelper'
import { getDebtsFromSheet } from '../../lib/sheetsHelper'
import { getSheetsClient } from '../../lib/googleClient'
import { SHEETS } from '../../lib/sheetsHelper'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)

  if (!session?.accessToken) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const spreadsheetId = await getOrCreateSpreadsheet(session.accessToken, session.user.email)
    const sheets = getSheetsClient(session.accessToken)

    const debts = await getDebtsFromSheet(session.accessToken, spreadsheetId)

    const today = new Date()

    const debtWarnings = debts
      .filter(d => d.status !== 'paid' && d.paymentDay)
      .map(d => {
        const paymentDate = new Date(d.paymentDay)
        const daysUntil = Math.ceil((paymentDate - today) / (1000 * 60 * 60 * 24))
        return { debt: d, daysUntil }
      })
      .filter(w => w.daysUntil <= 7 && w.daysUntil >= 0)

    const recurringResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEETS.RECURRING_EXPENSES}!A2:I`
    })

    const recurringRows = recurringResponse.data.values || []
    const recurringUpcoming = recurringRows
      .filter(row => row[7] === 'true' || row[7] === true)
      .map(row => {
        const nextDue = new Date(row[6])
        const daysUntil = Math.ceil((nextDue - today) / (1000 * 60 * 60 * 24))
        return {
          id: row[0],
          title: row[1],
          amount: Number(row[2]),
          category: row[3],
          frequency: row[4],
          nextDue: row[6],
          daysUntil
        }
      })
      .filter(item => item.daysUntil <= 7 && item.daysUntil >= 0)

    return res.status(200).json({
      debts: {
        count: debtWarnings.length,
        items: debtWarnings.map(w => ({
          person: w.debt.person,
          amount: w.debt.amount,
          paymentDay: w.debt.paymentDay,
          daysUntil: w.daysUntil
        }))
      },
      recurring: {
        count: recurringUpcoming.length,
        items: recurringUpcoming
      },
      meta: {
        checkedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Notifications summary error:', error)
    return res.status(500).json({ error: 'Failed to build notifications summary', details: error.message })
  }
}
