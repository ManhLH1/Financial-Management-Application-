import { useSession } from 'next-auth/react'
import { useState } from 'react'
import Link from 'next/link'

export default function DebugSpreadsheet() {
  const { data: session } = useSession()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  async function checkSpreadsheet() {
    setLoading(true)
    setResult(null)
    
    try {
      const res = await fetch('/api/debug-spreadsheet')
      const data = await res.json()
      setResult(data)
    } catch (error) {
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  async function createNewSpreadsheet() {
    setLoading(true)
    setResult(null)
    
    try {
      const res = await fetch('/api/debug-spreadsheet', {
        method: 'POST'
      })
      const data = await res.json()
      setResult(data)
    } catch (error) {
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  async function testExpensesAPI() {
    setLoading(true)
    setResult(null)
    
    try {
      const res = await fetch('/api/expenses')
      const data = await res.json()
      setResult({ 
        success: res.ok,
        status: res.status,
        data 
      })
    } catch (error) {
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4">⚠️ Chưa đăng nhập</h1>
          <p className="text-gray-600 mb-4">
            Bạn cần đăng nhập để kiểm tra Google Spreadsheet
          </p>
          <Link 
            href="/auth" 
            className="block w-full bg-blue-600 text-white text-center px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">
              🔍 Debug Google Spreadsheet
            </h1>
            <Link 
              href="/" 
              className="text-blue-600 hover:underline"
            >
              ← Quay lại
            </Link>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>User:</strong> {session.user.email}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Access Token:</strong> {session.accessToken ? '✅ Có' : '❌ Không'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Hành động</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={checkSpreadsheet}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📋 Kiểm tra Spreadsheet
            </button>
            
            <button
              onClick={createNewSpreadsheet}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ➕ Tạo mới Spreadsheet
            </button>
            
            <button
              onClick={testExpensesAPI}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🧪 Test Expenses API
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Đang xử lý...</span>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Kết quả</h2>
            
            {result.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 font-medium">❌ Lỗi:</p>
                <p className="text-red-600 text-sm mt-2">{result.error}</p>
              </div>
            )}

            {result.success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-green-800 font-medium">✅ Thành công!</p>
              </div>
            )}

            {result.spreadsheetId && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-blue-800 font-medium mb-2">📊 Spreadsheet ID:</p>
                <code className="bg-white px-3 py-1 rounded text-sm text-blue-600 block">
                  {result.spreadsheetId}
                </code>
                <a
                  href={`https://docs.google.com/spreadsheets/d/${result.spreadsheetId}/edit`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                >
                  → Mở trong Google Sheets
                </a>
              </div>
            )}

            {result.url && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-blue-800 font-medium mb-2">🔗 URL:</p>
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm break-all"
                >
                  {result.url}
                </a>
              </div>
            )}

            {result.sheets && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                <p className="text-purple-800 font-medium mb-2">📋 Sheets có sẵn:</p>
                <ul className="list-disc list-inside">
                  {result.sheets.map((sheet, i) => (
                    <li key={i} className="text-purple-600 text-sm">{sheet}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Raw JSON */}
            <details className="mt-4">
              <summary className="cursor-pointer text-gray-600 hover:text-gray-800 font-medium">
                🔍 Chi tiết JSON
              </summary>
              <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-2 overflow-auto text-xs">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📖 Hướng dẫn</h2>
          
          <div className="space-y-4 text-sm text-gray-600">
            <div>
              <p className="font-medium text-gray-800">1. Kiểm tra Spreadsheet:</p>
              <p>Kiểm tra xem spreadsheet hiện tại có tồn tại và có quyền truy cập không</p>
            </div>
            
            <div>
              <p className="font-medium text-gray-800">2. Tạo mới Spreadsheet:</p>
              <p>Tạo một spreadsheet mới với cấu trúc đầy đủ (Expenses, Debts sheets)</p>
            </div>
            
            <div>
              <p className="font-medium text-gray-800">3. Test Expenses API:</p>
              <p>Kiểm tra API expenses có hoạt động và tự động tạo spreadsheet không</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
