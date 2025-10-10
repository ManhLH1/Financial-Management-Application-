import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function CleanupDuplicates() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl">Loading...</div>
    </div>
  }

  if (!session) {
    router.push('/auth')
    return null
  }

  async function handleCleanup() {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/cleanup-duplicates', {
        method: 'POST'
      })

      const data = await res.json()

      if (res.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Failed to cleanup')
      }
    } catch (err) {
      setError('Network error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">🧹 Cleanup Duplicate Spreadsheets</h1>
              <p className="text-gray-600 mt-2">Remove duplicate Google Sheets files</p>
            </div>
            <div className="flex gap-3">
              <Link href="/" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                ← Back
              </Link>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">⚠️ Important Information:</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
              <p className="text-sm text-gray-700">
                • This will search for all "FinTrack - {session.user.email}" spreadsheets
              </p>
              <p className="text-sm text-gray-700">
                • <strong>Keeps the OLDEST file</strong> (first created)
              </p>
              <p className="text-sm text-gray-700">
                • Moves duplicates to Google Drive Trash (can be restored)
              </p>
              <p className="text-sm text-gray-700">
                • Data from deleted files will be lost
              </p>
            </div>
          </div>

          <button
            onClick={handleCleanup}
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '🔄 Cleaning up...' : '🧹 Start Cleanup'}
          </button>

          {/* Result Display */}
          {result && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-800 mb-3">✅ {result.message}</h3>
              
              {result.kept && (
                <div className="mb-4">
                  <p className="font-semibold text-gray-700 mb-2">📌 Active Spreadsheet:</p>
                  <div className="bg-white rounded p-3">
                    <p className="text-sm"><strong>Name:</strong> {result.kept.name}</p>
                    <p className="text-sm"><strong>ID:</strong> {result.kept.id}</p>
                    <p className="text-sm"><strong>Created:</strong> {new Date(result.kept.created).toLocaleString()}</p>
                    <a 
                      href={result.kept.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:underline"
                    >
                      Open in Google Sheets →
                    </a>
                  </div>
                </div>
              )}

              {result.deleted && result.deleted.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-700 mb-2">🗑️ Deleted Files:</p>
                  <div className="space-y-2">
                    {result.deleted.map((file, idx) => (
                      <div key={idx} className="bg-white rounded p-2 text-sm">
                        <p><strong>Name:</strong> {file.name}</p>
                        <p className="text-gray-600">ID: {file.id}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-800 mb-2">❌ Error</h3>
              <p className="text-sm text-red-700">{error}</p>
              {error.includes('Drive API') && (
                <div className="mt-3 text-sm text-red-700">
                  <p><strong>Fix:</strong></p>
                  <ol className="list-decimal ml-5 mt-2">
                    <li>Enable Google Drive API in Google Cloud Console</li>
                    <li>Logout and login again</li>
                    <li>Try cleanup again</li>
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Why do duplicates happen?</h3>
          <p className="text-sm text-blue-800">
            When multiple API requests happen simultaneously (e.g., loading Dashboard and Expenses page at the same time),
            each request might create its own spreadsheet if Drive API search fails. This tool helps clean them up.
          </p>
        </div>
      </div>
    </div>
  )
}
