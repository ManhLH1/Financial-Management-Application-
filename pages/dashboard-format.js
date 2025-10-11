import React, { useEffect, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import chart to avoid SSR issues
const Doughnut = dynamic(() => import('react-chartjs-2').then(mod => mod.Doughnut), { ssr: false })
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function DashboardFormat() {
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState([])
  const [spreadsheetId, setSpreadsheetId] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      try {
        const res = await fetch('/api/expenses')
        if (!res.ok) {
          const txt = await res.text()
          throw new Error(`Failed to load: ${res.status} ${txt}`)
        }
        const data = await res.json()
        if (!mounted) return
        setTransactions(Array.isArray(data.items) ? data.items : [])
        setSpreadsheetId(data.spreadsheetId || null)
      } catch (err) {
        console.error('Error fetching expenses:', err)
        setError(err.message)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [])

  const totalsByCategory = useMemo(() => {
    const map = {}
    transactions.forEach(t => {
      const cat = t.category || 'Uncategorized'
      map[cat] = (map[cat] || 0) + (Number(t.amount) || 0)
    })
    return map
  }, [transactions])

  const chartData = useMemo(() => {
    const labels = Object.keys(totalsByCategory)
    const data = labels.map(l => totalsByCategory[l])
    return {
      labels,
      datasets: [{ data, backgroundColor: labels.map((_, i) => `hsl(${(i * 47) % 360} 70% 50%)`) }]
    }
  }, [totalsByCategory])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">Dashboard — Budget Summary & Transactions</h1>
          {spreadsheetId && (
            <p className="text-sm text-gray-500">Using spreadsheet: <a className="text-blue-600" href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`} target="_blank" rel="noreferrer">{spreadsheetId}</a></p>
          )}
        </header>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">Error: {error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <section className="md:col-span-1 bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-3">Budget Summary</h2>
            <div className="flex flex-col items-center">
              <div style={{ width: 220, height: 220 }}>
                <Doughnut data={chartData} />
              </div>
              <div className="mt-4 w-full">
                {Object.entries(totalsByCategory).length === 0 && !loading ? (
                  <p className="text-sm text-gray-500">No transactions yet. Add an expense to create the sheets and populate data.</p>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {Object.entries(totalsByCategory).map(([cat, amt]) => (
                      <li key={cat} className="py-2 flex justify-between">
                        <span className="text-sm">{cat}</span>
                        <span className="font-medium">{Number(amt).toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>

          <section className="md:col-span-2 bg-white p-4 rounded shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Transactions</h2>
              <div className="text-sm text-gray-500">{loading ? 'Loading...' : `${transactions.length} items`}</div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm table-auto">
                <thead>
                  <tr className="text-left border-b">
                    <th className="p-2">Date</th>
                    <th className="p-2">Title</th>
                    <th className="p-2">Category</th>
                    <th className="p-2">Type</th>
                    <th className="p-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 align-top text-xs text-gray-600">{tx.date}</td>
                      <td className="p-2 align-top">{tx.title}</td>
                      <td className="p-2 align-top">{tx.category}</td>
                      <td className="p-2 align-top text-sm text-gray-700">{tx.type}</td>
                      <td className="p-2 align-top text-right font-medium">{Number(tx.amount).toLocaleString()}</td>
                    </tr>
                  ))}

                  {!loading && transactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-500">No transactions to show.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
