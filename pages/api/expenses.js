import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { getExpensesFromSheet, addExpenseToSheet, updateExpenseInSheet, deleteExpenseFromSheet, getOrCreateSpreadsheet } from '../../lib/sheetsHelper'

// Fallback in-memory storage if not authenticated
let items = [
  { id: 1, title: 'Cà phê', amount: 30, category: 'Ăn uống', date: '2025-10-01', type: 'expense' },
  { id: 2, title: 'Grab', amount: 50, category: 'Di chuyển', date: '2025-10-02', type: 'expense' }
]

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  const { method } = req

  // Debug logging
  console.log('🔍 [EXPENSES API] Session check:')
  console.log('  - Has session:', !!session)
  console.log('  - Has accessToken:', !!session?.accessToken)
  console.log('  - User email:', session?.user?.email)
  
  // If user is authenticated, use Google Sheets
  if (session?.accessToken) {
    try {
      // Get or create spreadsheet automatically
      console.log('🔄 [EXPENSES API] Getting or creating spreadsheet...')
      const spreadsheetId = await getOrCreateSpreadsheet(session.accessToken, session.user.email)
      console.log(`✅ [EXPENSES API] Using spreadsheet: ${spreadsheetId}`)
      
      if (method === 'GET') {
        const expenses = await getExpensesFromSheet(session.accessToken, spreadsheetId)
        return res.status(200).json({ items: expenses, spreadsheetId })
      }

      if (method === 'POST') {
        const body = req.body
        const expense = { id: Date.now(), ...body }
        await addExpenseToSheet(session.accessToken, spreadsheetId, expense)
        return res.status(201).json(expense)
      }

      if (method === 'PUT') {
        const { id, ...updates } = req.body
        await updateExpenseInSheet(session.accessToken, spreadsheetId, id, updates)
        return res.status(200).json({ ok: true })
      }

      if (method === 'DELETE') {
        const { id } = req.query
        const { reason } = req.body
        
        if (!reason || !reason.trim()) {
          return res.status(400).json({ error: 'Lý do xóa là bắt buộc' })
        }
        
        await deleteExpenseFromSheet(session.accessToken, spreadsheetId, id, reason.trim())
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
  if (method === 'GET') {
    return res.status(200).json({ items })
  }

  if (method === 'POST') {
    const body = req.body
    const next = { id: Date.now(), ...body }
    items = [next, ...items]
    return res.status(201).json(next)
  }

  if (method === 'PUT') {
    const { id, ...rest } = req.body
    items = items.map(i => i.id === id ? { ...i, ...rest } : i)
    return res.status(200).json({ ok: true })
  }

  if (method === 'DELETE') {
    const { id } = req.query
    items = items.filter(i => String(i.id) !== String(id))
    return res.status(200).json({ ok: true })
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
  res.status(405).end(`Method ${method} Not Allowed`)
}
