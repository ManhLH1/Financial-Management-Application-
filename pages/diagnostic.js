import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function DiagnosticPage() {
  const { data: session, status } = useSession()
  const [diagnostics, setDiagnostics] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session) {
      runDiagnostics()
    }
  }, [session])

  async function runDiagnostics() {
    setLoading(true)
    
    const results = {
      timestamp: new Date().toISOString(),
      session: {
        status: status,
        hasSession: !!session,
        user: session?.user ? {
          name: session.user.name,
          email: session.user.email,
          image: session.user.image
        } : null,
        hasAccessToken: !!session?.accessToken,
        accessTokenPreview: session?.accessToken ? 
          `${session.accessToken.substring(0, 20)}...` : null,
        hasRefreshToken: !!session?.refreshToken,
      },
      tests: {}
    }

    // Test 1: Check if we can reach expenses API
    try {
      const res = await fetch('/api/expenses')
      results.tests.expensesAPI = {
        success: res.ok,
        status: res.status,
        statusText: res.statusText
      }
      
      if (res.ok) {
        const data = await res.json()
        results.tests.expensesAPI.hasSpreadsheetId = !!data.spreadsheetId
        results.tests.expensesAPI.spreadsheetId = data.spreadsheetId
        results.tests.expensesAPI.itemCount = data.items?.length || 0
      }
    } catch (error) {
      results.tests.expensesAPI = {
        success: false,
        error: error.message
      }
    }

    // Test 2: Check debug-spreadsheet API
    try {
      const res = await fetch('/api/debug-spreadsheet')
      results.tests.debugSpreadsheet = {
        success: res.ok,
        status: res.status
      }
      
      if (res.ok) {
        const data = await res.json()
        results.tests.debugSpreadsheet.data = data
      } else {
        const data = await res.json()
        results.tests.debugSpreadsheet.error = data
      }
    } catch (error) {
      results.tests.debugSpreadsheet = {
        success: false,
        error: error.message
      }
    }

    // Test 3: Check file system (.data folder)
    try {
      const res = await fetch('/api/check-data-folder')
      if (res.ok) {
        const data = await res.json()
        results.tests.dataFolder = data
      }
    } catch (error) {
      results.tests.dataFolder = {
        error: error.message
      }
    }

    setDiagnostics(results)
    setLoading(false)
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8 max-w-md w-full border border-gray-700">
          <h1 className="text-2xl font-bold mb-4 text-white">⚠️ Chưa đăng nhập</h1>
          <p className="text-gray-300 mb-6">
            Bạn cần đăng nhập để xem thông tin chẩn đoán
          </p>
          <Link 
            href="/auth" 
            className="block w-full bg-blue-600 text-white text-center px-4 py-3 rounded-lg hover:bg-blue-700 font-medium"
          >
            🔐 Đăng nhập
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg shadow-2xl p-6 mb-6 border border-blue-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <span>🔍</span>
              <span>System Diagnostics</span>
            </h1>
            <div className="flex gap-2">
              <button
                onClick={runDiagnostics}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
              >
                🔄 Refresh
              </button>
              <Link 
                href="/" 
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium"
              >
                ← Back
              </Link>
            </div>
          </div>
          
          <p className="text-blue-200">
            Comprehensive system check for Google Sheets integration
          </p>
        </div>

        {loading && (
          <div className="bg-gray-800 rounded-lg shadow-xl p-8 border border-gray-700">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
              <span className="ml-4 text-lg">Running diagnostics...</span>
            </div>
          </div>
        )}

        {diagnostics && (
          <>
            {/* Session Info */}
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 mb-6 border border-gray-700">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span>👤</span>
                <span>Session Information</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                  <p className="text-gray-400 text-sm mb-1">Status</p>
                  <p className={`text-lg font-bold ${
                    diagnostics.session.status === 'authenticated' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {diagnostics.session.status}
                  </p>
                </div>
                
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                  <p className="text-gray-400 text-sm mb-1">User Email</p>
                  <p className="text-lg font-bold text-blue-400">
                    {diagnostics.session.user?.email || 'N/A'}
                  </p>
                </div>
                
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                  <p className="text-gray-400 text-sm mb-1">Access Token</p>
                  <p className={`text-lg font-bold ${
                    diagnostics.session.hasAccessToken ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {diagnostics.session.hasAccessToken ? '✅ Present' : '❌ Missing'}
                  </p>
                  {diagnostics.session.accessTokenPreview && (
                    <p className="text-xs text-gray-500 mt-1 font-mono">
                      {diagnostics.session.accessTokenPreview}
                    </p>
                  )}
                </div>
                
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                  <p className="text-gray-400 text-sm mb-1">Refresh Token</p>
                  <p className={`text-lg font-bold ${
                    diagnostics.session.hasRefreshToken ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {diagnostics.session.hasRefreshToken ? '✅ Present' : '❌ Missing'}
                  </p>
                </div>
              </div>
            </div>

            {/* API Tests */}
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 mb-6 border border-gray-700">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span>🧪</span>
                <span>API Tests</span>
              </h2>
              
              {/* Expenses API Test */}
              <div className="mb-4 bg-gray-900 p-4 rounded-lg border border-gray-700">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <span>{diagnostics.tests.expensesAPI?.success ? '✅' : '❌'}</span>
                  <span>Expenses API</span>
                </h3>
                
                {diagnostics.tests.expensesAPI?.success ? (
                  <div className="space-y-2">
                    <p className="text-green-400">Status: {diagnostics.tests.expensesAPI.status} OK</p>
                    <p className="text-gray-300">
                      Spreadsheet ID: {diagnostics.tests.expensesAPI.hasSpreadsheetId ? 
                        <code className="bg-gray-800 px-2 py-1 rounded text-blue-400">
                          {diagnostics.tests.expensesAPI.spreadsheetId}
                        </code> : 
                        <span className="text-red-400">Not created yet</span>
                      }
                    </p>
                    <p className="text-gray-300">
                      Items count: {diagnostics.tests.expensesAPI.itemCount}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-red-400">Status: {diagnostics.tests.expensesAPI?.status} Error</p>
                    <p className="text-gray-400 text-sm">{diagnostics.tests.expensesAPI?.error}</p>
                  </div>
                )}
              </div>

              {/* Debug Spreadsheet Test */}
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <span>{diagnostics.tests.debugSpreadsheet?.success ? '✅' : '❌'}</span>
                  <span>Debug Spreadsheet API</span>
                </h3>
                
                {diagnostics.tests.debugSpreadsheet?.success ? (
                  <div>
                    <p className="text-green-400 mb-2">Status: Working</p>
                    {diagnostics.tests.debugSpreadsheet.data?.spreadsheetId && (
                      <p className="text-gray-300">
                        Spreadsheet: 
                        <a 
                          href={diagnostics.tests.debugSpreadsheet.data.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline ml-2"
                        >
                          {diagnostics.tests.debugSpreadsheet.data.spreadsheetId}
                        </a>
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-red-400">Status: Error</p>
                    <pre className="text-xs text-gray-400 mt-2 overflow-auto">
                      {JSON.stringify(diagnostics.tests.debugSpreadsheet?.error, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Action Items */}
            <div className="bg-gradient-to-r from-orange-900 to-red-900 rounded-lg shadow-xl p-6 border border-orange-700">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span>🎯</span>
                <span>Action Items</span>
              </h2>
              
              <div className="space-y-3">
                {!diagnostics.session.hasAccessToken && (
                  <div className="bg-red-900/50 p-4 rounded-lg border border-red-700">
                    <p className="font-bold text-red-300 mb-2">❌ No Access Token</p>
                    <p className="text-sm text-red-200 mb-3">
                      The session doesn't have an access token. This is required for Google Sheets access.
                    </p>
                    <button
                      onClick={() => signOut({ callbackUrl: '/auth' })}
                      className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-medium"
                    >
                      Sign out and re-login
                    </button>
                  </div>
                )}
                
                {diagnostics.tests.expensesAPI && !diagnostics.tests.expensesAPI.success && (
                  <div className="bg-orange-900/50 p-4 rounded-lg border border-orange-700">
                    <p className="font-bold text-orange-300 mb-2">⚠️ Expenses API Failed</p>
                    <p className="text-sm text-orange-200">
                      The expenses API is not working. Check terminal logs for errors.
                    </p>
                  </div>
                )}
                
                {diagnostics.tests.expensesAPI?.success && !diagnostics.tests.expensesAPI.hasSpreadsheetId && (
                  <div className="bg-yellow-900/50 p-4 rounded-lg border border-yellow-700">
                    <p className="font-bold text-yellow-300 mb-2">⚠️ No Spreadsheet Created</p>
                    <p className="text-sm text-yellow-200 mb-3">
                      The API works but spreadsheet was not created. Check terminal logs for "Creating new spreadsheet" message.
                    </p>
                    <Link
                      href="/test-create-sheet"
                      className="inline-block bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded font-medium"
                    >
                      Run Create Test
                    </Link>
                  </div>
                )}
                
                {diagnostics.tests.expensesAPI?.success && diagnostics.tests.expensesAPI.hasSpreadsheetId && (
                  <div className="bg-green-900/50 p-4 rounded-lg border border-green-700">
                    <p className="font-bold text-green-300 mb-2">✅ All Systems Operational</p>
                    <p className="text-sm text-green-200">
                      Everything is working correctly. Your spreadsheet is ready to use!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Raw Data */}
            <details className="mt-6 bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700">
              <summary className="cursor-pointer font-bold text-lg mb-4">
                🔍 Raw Diagnostic Data
              </summary>
              <pre className="bg-gray-900 p-4 rounded-lg text-xs overflow-auto border border-gray-700">
                {JSON.stringify(diagnostics, null, 2)}
              </pre>
            </details>
          </>
        )}
      </div>
    </div>
  )
}
