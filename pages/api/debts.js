import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { getDebtsFromSheet, addDebtToSheet, updateDebtInSheet, deleteDebtFromSheet, getOrCreateSpreadsheet } from '../../lib/sheetsHelper'

// Fallback in-memory storage if not authenticated
let notes = [
  { id: 1, person: 'An', amount: 200, date: '2025-09-20', due: '2025-10-10', status: 'owed-to-me' },
  { id: 2, person: 'Bình', amount: 150, date: '2025-09-25', due: '2025-10-05', status: 'i-owe' }
]

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  const { method } = req

  // Debug logging
  console.log('🔍 [DEBTS API] Session check:')
  console.log('  - Has session:', !!session)
  console.log('  - Has accessToken:', !!session?.accessToken)
  console.log('  - User email:', session?.user?.email)
  
  // If user is authenticated, use Google Sheets
  if (session?.accessToken) {
    try {
      // Get or create spreadsheet automatically
      const spreadsheetId = await getOrCreateSpreadsheet(session.accessToken, session.user.email)
      
      if (method === 'GET') {
        const debts = await getDebtsFromSheet(session.accessToken, spreadsheetId)
        return res.status(200).json({ notes: debts, spreadsheetId })
      }

      if (method === 'POST') {
        const body = req.body
        const debt = { id: Date.now(), ...body }
        await addDebtToSheet(session.accessToken, spreadsheetId, debt)
        return res.status(201).json(debt)
      }

      if (method === 'PUT') {
        const { id, ...rest } = req.body
        await updateDebtInSheet(session.accessToken, spreadsheetId, id, rest)
        return res.status(200).json({ ok: true })
      }

      if (method === 'DELETE') {
        const { id } = req.query
        const { reason } = req.body
        
        if (!reason || reason.trim() === '') {
          return res.status(400).json({ error: 'Deletion reason is required' })
        }
        
        await deleteDebtFromSheet(session.accessToken, spreadsheetId, id, reason)
        return res.status(200).json({ ok: true })
      }

      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
      return res.status(405).end(`Method ${method} Not Allowed`)
    } catch (error) {
      console.error('Google Sheets error:', error)
      return res.status(500).json({ error: 'Failed to access Google Sheets', details: error.message })
    }
  }

  // Fallback to in-memory if not authenticated
  if (method === 'GET') return res.status(200).json({ notes })

  if (method === 'POST') {
    const body = req.body
    const next = { id: Date.now(), ...body }
    notes = [next, ...notes]
    return res.status(201).json(next)
  }

  if (method === 'PUT') {
    const { id, ...rest } = req.body
    notes = notes.map(n => n.id === id ? { ...n, ...rest } : n)
    return res.status(200).json({ ok: true })
  }

  if (method === 'DELETE') {
    const { id } = req.query
    notes = notes.filter(n => String(n.id) !== String(id))
    return res.status(200).json({ ok: true })
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
  res.status(405).end(`Method ${method} Not Allowed`)
}
