import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { getDebtsFromSheet, addDebtToSheet, updateDebtInSheet, deleteDebtFromSheet, getOrCreateSpreadsheet } from '../../lib/sheetsHelper'
import { debtSchema, debtUpdateSchema, deleteSchema } from '../../lib/financeSchemas'

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
        return res.status(200).json({ items: debts, meta: { count: debts.length }, spreadsheetId })
      }

      if (method === 'POST') {
        const parsed = debtSchema.safeParse(req.body)
        if (!parsed.success) {
          return res.status(400).json({ error: 'Dữ liệu không hợp lệ', details: parsed.error.flatten() })
        }

        const debt = { id: Date.now(), ...parsed.data }
        await addDebtToSheet(session.accessToken, spreadsheetId, debt)
        return res.status(201).json({ item: debt })
      }

      if (method === 'PUT') {
        const parsed = debtUpdateSchema.safeParse(req.body)
        if (!parsed.success) {
          return res.status(400).json({ error: 'Dữ liệu không hợp lệ', details: parsed.error.flatten() })
        }

        const { id, ...rest } = parsed.data
        await updateDebtInSheet(session.accessToken, spreadsheetId, id, rest)
        return res.status(200).json({ ok: true })
      }

      if (method === 'DELETE') {
        const parsed = deleteSchema.safeParse({ id: req.body?.id || req.query?.id, reason: req.body?.reason })
        if (!parsed.success) {
          return res.status(400).json({ error: 'Lý do xóa là bắt buộc', details: parsed.error.flatten() })
        }

        await deleteDebtFromSheet(session.accessToken, spreadsheetId, parsed.data.id, parsed.data.reason.trim())
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
  if (method === 'GET') return res.status(200).json({ items: notes, meta: { count: notes.length } })

  if (method === 'POST') {
    const body = req.body
    const next = { id: Date.now(), ...body }
    notes = [next, ...notes]
    return res.status(201).json({ item: next })
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
