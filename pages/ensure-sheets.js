import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Header from '../components/Header'

export default function EnsureSheets() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  
  // Initialize dark mode from localStorage (with SSR safety)
  const [darkMode, setDarkMode] = useState(false)

  // Load dark mode on mount
  useEffect(() => {
    const saved = localStorage.getItem('darkMode')
    if (saved) {
      setDarkMode(JSON.parse(saved))
    }
  }, [])

  // Sync document class and save to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-xl">Loading...</div>
    </div>
  }

  if (status === 'unauthenticated') {
    router.push('/auth')
    return null
  }

  const handleEnsureSheets = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/ensure-sheets', {
        method: 'POST'
      })

      const data = await res.json()

      if (res.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Failed to ensure sheets')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
      <Header darkMode={darkMode} setDarkMode={setDarkMode} />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className={`rounded-2xl shadow-2xl p-8 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🔧</div>
            <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Kiểm tra & Tạo Sheets
            </h1>
            <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
              Đảm bảo Google Sheet của bạn có đầy đủ các tabs cần thiết
            </p>
          </div>

          {/* Info Box */}
          <div className={`border-l-4 border-blue-500 p-4 mb-6 ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                  <strong>Chức năng này sẽ:</strong>
                </p>
                <ul className={`mt-2 text-sm list-disc list-inside ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                  <li>Kiểm tra các sheets hiện có trong Google Sheet của bạn</li>
                  <li>Tự động tạo các sheets còn thiếu (RecurringExpenses, Budgets)</li>
                  <li>Thêm headers chuẩn cho các sheets mới</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Required Sheets List */}
          <div className="mb-6">
            <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              📋 Các Sheets cần thiết:
            </h3>
            <div className="space-y-2">
              <div className={`flex items-center p-3 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
                <span className="text-2xl mr-3">📊</span>
                <div>
                  <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Expenses</div>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Chi tiêu thường</div>
                </div>
              </div>
              <div className={`flex items-center p-3 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
                <span className="text-2xl mr-3">💳</span>
                <div>
                  <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Debts</div>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Khoản nợ</div>
                </div>
              </div>
              <div className={`flex items-center p-3 rounded-lg border ${darkMode ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200'}`}>
                <span className="text-2xl mr-3">🔄</span>
                <div>
                  <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>RecurringExpenses</div>
                  <div className={`text-sm ${darkMode ? 'text-yellow-300' : 'text-gray-600'}`}>Chi tiêu định kỳ (có thể thiếu)</div>
                </div>
              </div>
              <div className={`flex items-center p-3 rounded-lg border ${darkMode ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200'}`}>
                <span className="text-2xl mr-3">💰</span>
                <div>
                  <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Budgets</div>
                  <div className={`text-sm ${darkMode ? 'text-yellow-300' : 'text-gray-600'}`}>Ngân sách (có thể thiếu)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleEnsureSheets}
            disabled={loading}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-white text-lg transition-all duration-300 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang kiểm tra...
              </span>
            ) : (
              '🔍 Kiểm tra & Tạo Sheets'
            )}
          </button>

          {/* Success Result */}
          {result && (
            <div className="mt-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-lg font-medium text-green-800 mb-2">
                    ✅ {result.message}
                  </h3>
                  
                  {result.created && result.created.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm text-green-700 font-semibold mb-1">
                        Đã tạo sheets mới:
                      </p>
                      <ul className="list-disc list-inside text-sm text-green-700">
                        {result.created.map(sheet => (
                          <li key={sheet}>{sheet}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.existing && (
                    <div className="mb-3">
                      <p className="text-sm text-green-700 font-semibold mb-1">
                        Sheets hiện có:
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {result.existing.map(sheet => (
                          <span key={sheet} className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            {sheet}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.spreadsheetUrl && (
                    <a
                      href={result.spreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 mt-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Mở Google Sheet
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error Result */}
          {error && (
            <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    <strong>Lỗi:</strong> {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className={`mt-8 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <p>
              💡 Tip: Sau khi tạo sheets, bạn có thể vào Google Sheet để xem cấu trúc dữ liệu
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
