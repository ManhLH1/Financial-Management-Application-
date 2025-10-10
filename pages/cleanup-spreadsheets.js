import { useSession } from 'next-auth/react'
import { useState } from 'react'
import Link from 'next/link'

export default function CleanupSpreadsheets() {
  const { data: session } = useSession()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  async function cleanupLocal() {
    setLoading(true)
    setResult(null)
    
    try {
      const res = await fetch('/api/cleanup-local', {
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

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4">⚠️ Chưa đăng nhập</h1>
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
    <div className="min-h-screen bg-gradient-to-br from-red-100 to-orange-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">
              🧹 Cleanup Spreadsheets
            </h1>
            <Link 
              href="/" 
              className="text-blue-600 hover:underline"
            >
              ← Quay lại
            </Link>
          </div>
          
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
            <p className="text-yellow-800 font-medium mb-2">
              ⚠️ Cảnh báo
            </p>
            <p className="text-yellow-700 text-sm">
              Action này sẽ xóa mapping file local. Bạn sẽ cần tạo spreadsheet mới hoặc cấu hình lại.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Actions</h2>
          
          <div className="space-y-4">
            <div className="border-2 border-gray-200 rounded-lg p-4">
              <h3 className="font-bold text-lg mb-2">🗑️ Xóa Local Mapping</h3>
              <p className="text-gray-600 text-sm mb-3">
                Xóa file .data/spreadsheets.json để reset mapping. Lần sau bạn login sẽ tạo spreadsheet mới.
              </p>
              <button
                onClick={cleanupLocal}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? '⏳ Đang xóa...' : '🗑️ Xóa Local Mapping'}
              </button>
            </div>

            <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
              <h3 className="font-bold text-lg mb-2 text-blue-800">📝 Xóa Spreadsheets thủ công</h3>
              <p className="text-blue-600 text-sm mb-3">
                Để xóa các spreadsheets đã tạo nhầm, vào Google Drive:
              </p>
              <a
                href="https://drive.google.com/drive/my-drive"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                🔗 Mở Google Drive
              </a>
              <p className="text-blue-600 text-xs mt-2">
                Tìm các file "FinTrack - ..." hoặc "TEST - ..." và xóa chúng
              </p>
            </div>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Kết quả</h2>
            
            {result.success ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-bold mb-2">✅ Thành công!</p>
                <p className="text-green-600 text-sm">{result.message}</p>
                {result.deletedFile && (
                  <p className="text-green-600 text-xs mt-2">
                    Đã xóa: {result.deletedFile}
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-bold mb-2">❌ Lỗi</p>
                <p className="text-red-600 text-sm">{result.error || result.message}</p>
              </div>
            )}

            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 font-medium mb-2">📝 Bước tiếp theo:</p>
              <ol className="list-decimal list-inside space-y-1 text-blue-600 text-sm">
                <li>Đăng xuất khỏi app</li>
                <li>Đăng nhập lại</li>
                <li>Vào trang Expenses</li>
                <li>Hệ thống sẽ tạo spreadsheet MỚI duy nhất</li>
              </ol>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📖 Hướng dẫn</h2>
          
          <div className="space-y-4 text-sm text-gray-600">
            <div>
              <p className="font-medium text-gray-800">1. Tại sao bị tạo nhiều spreadsheet?</p>
              <p>Có thể do mapping file không được lưu hoặc không đọc được, nên mỗi lần gọi API nó tạo mới.</p>
            </div>
            
            <div>
              <p className="font-medium text-gray-800">2. Fix như thế nào?</p>
              <p>Xóa mapping file cũ, đảm bảo folder .data tồn tại và có quyền ghi, sau đó test lại.</p>
            </div>
            
            <div>
              <p className="font-medium text-gray-800">3. Sau khi cleanup?</p>
              <p>Đăng xuất → Đăng nhập lại → Vào /expenses → Kiểm tra terminal logs để verify chỉ TẠO 1 lần.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
