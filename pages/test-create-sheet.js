import { useSession } from 'next-auth/react'
import { useState } from 'react'
import Link from 'next/link'

export default function TestCreateSheet() {
  const { data: session } = useSession()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  async function testCreate() {
    setLoading(true)
    setResult(null)
    
    try {
      const res = await fetch('/api/test-create-sheet')
      const data = await res.json()
      setResult({ success: res.ok, ...data })
    } catch (error) {
      setResult({ 
        success: false, 
        error: error.message 
      })
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
            Bạn cần đăng nhập để test tạo spreadsheet
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
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">
              🧪 Test Tạo Google Spreadsheet
            </h1>
            <Link 
              href="/" 
              className="text-blue-600 hover:underline"
            >
              ← Quay lại
            </Link>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 mb-2">
              <strong>User:</strong> {session.user.email}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Access Token:</strong> {session.accessToken ? '✅ Có' : '❌ Không'}
            </p>
          </div>
        </div>

        {/* Test Button */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Test tạo Spreadsheet</h2>
          
          <p className="text-gray-600 mb-4">
            Test này sẽ thử tạo một spreadsheet mới để kiểm tra:
          </p>
          
          <ul className="list-disc list-inside text-sm text-gray-600 mb-6 space-y-2">
            <li>✅ Access token có hoạt động không</li>
            <li>✅ Có quyền tạo spreadsheet không</li>
            <li>✅ OAuth scopes có đầy đủ không</li>
            <li>✅ Google API có hoạt động không</li>
          </ul>
          
          <button
            onClick={testCreate}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-4 rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {loading ? '⏳ Đang test...' : '🚀 Bắt đầu Test'}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600"></div>
              <span className="ml-4 text-gray-600 text-lg">Đang tạo spreadsheet...</span>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Kết quả</h2>
            
            {/* Success */}
            {result.success && (
              <>
                <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 mb-6">
                  <div className="flex items-center mb-4">
                    <span className="text-4xl mr-3">✅</span>
                    <div>
                      <p className="text-green-800 font-bold text-xl">Thành công!</p>
                      <p className="text-green-600">{result.message}</p>
                    </div>
                  </div>
                </div>

                {/* Spreadsheet Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-blue-800 font-medium mb-2">📊 Spreadsheet đã tạo:</p>
                  <code className="bg-white px-3 py-2 rounded text-sm text-blue-600 block mb-3 break-all">
                    {result.spreadsheetId}
                  </code>
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <span>🔗</span>
                    <span>Mở trong Google Sheets</span>
                  </a>
                </div>

                {/* Instructions */}
                {result.instructions && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-purple-800 font-medium mb-2">📋 Hướng dẫn tiếp theo:</p>
                    <ul className="list-decimal list-inside space-y-2">
                      {result.instructions.map((instruction, i) => (
                        <li key={i} className="text-purple-600 text-sm">{instruction}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {/* Error */}
            {!result.success && (
              <>
                <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6 mb-6">
                  <div className="flex items-center mb-4">
                    <span className="text-4xl mr-3">❌</span>
                    <div>
                      <p className="text-red-800 font-bold text-xl">Lỗi!</p>
                      <p className="text-red-600">{result.message || result.error}</p>
                    </div>
                  </div>
                  
                  {result.code && (
                    <p className="text-red-700 text-sm">Error Code: {result.code}</p>
                  )}
                </div>

                {/* Possible Causes */}
                {result.possibleCauses && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                    <p className="text-orange-800 font-medium mb-2">🔍 Nguyên nhân có thể:</p>
                    <ul className="space-y-1">
                      {result.possibleCauses.map((cause, i) => (
                        <li key={i} className="text-orange-600 text-sm">{cause}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Solutions */}
                {result.solutions && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 font-medium mb-2">💡 Giải pháp:</p>
                    <ol className="list-decimal list-inside space-y-2">
                      {result.solutions.map((solution, i) => (
                        <li key={i} className="text-green-600 text-sm">{solution}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </>
            )}

            {/* Raw JSON */}
            <details className="mt-6">
              <summary className="cursor-pointer text-gray-600 hover:text-gray-800 font-medium">
                🔍 Chi tiết kỹ thuật
              </summary>
              <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-2 overflow-auto text-xs">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📖 Về test này</h2>
          
          <div className="space-y-4 text-sm text-gray-600">
            <p>
              <strong className="text-gray-800">Mục đích:</strong> Kiểm tra xem user có thể tạo spreadsheet mới hay không.
            </p>
            
            <p>
              <strong className="text-gray-800">Nếu thành công:</strong> Tính năng tạo spreadsheet hoạt động bình thường. Vấn đề có thể ở logic getOrCreateSpreadsheet.
            </p>
            
            <p>
              <strong className="text-gray-800">Nếu thất bại:</strong> Có vấn đề với OAuth permissions hoặc access token. Cần đăng xuất và đăng nhập lại.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
