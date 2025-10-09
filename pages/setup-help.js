import { useRouter } from 'next/router'

export default function SetupHelp() {
  const router = useRouter()
  const redirectUri = 'http://localhost:3000/api/auth/callback/google'
  
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-red-600">Lỗi đăng nhập Google</h1>
              <p className="text-slate-600">redirect_uri_mismatch</p>
            </div>
          </div>

          {/* Problem */}
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h2 className="font-semibold mb-2">🔍 Vấn đề:</h2>
            <p className="text-sm">
              Google OAuth không tìm thấy redirect URI trong danh sách được phép của project.
            </p>
          </div>

          {/* Solution */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">✅ Giải pháp (3 phút):</h2>
            
            {/* Step 1 */}
            <div className="mb-6 p-4 border-l-4 border-primary bg-green-50">
              <h3 className="font-semibold mb-2">Bước 1: Vào Google Cloud Console</h3>
              <a 
                href="https://console.cloud.google.com/apis/credentials?project=fintrack-474515"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-primary text-white rounded hover:bg-green-700"
              >
                🔗 Mở Google Cloud Console
              </a>
            </div>

            {/* Step 2 */}
            <div className="mb-6 p-4 border-l-4 border-blue-500 bg-blue-50">
              <h3 className="font-semibold mb-2">Bước 2: Tìm OAuth 2.0 Client</h3>
              <p className="text-sm mb-2">Tìm trong danh sách:</p>
              <div className="bg-white p-3 rounded border font-mono text-sm">
                <div>Web client 1</div>
                <div className="text-xs text-slate-600">
                  Client ID: 745870655061-ic87qnfsk8mn91es6ic3k3anpfn6dqf9...
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="mb-6 p-4 border-l-4 border-purple-500 bg-purple-50">
              <h3 className="font-semibold mb-2">Bước 3: Click Edit (nút bút chì ✏️)</h3>
            </div>

            {/* Step 4 */}
            <div className="mb-6 p-4 border-l-4 border-orange-500 bg-orange-50">
              <h3 className="font-semibold mb-2">Bước 4: Thêm Redirect URI</h3>
              <p className="text-sm mb-2">Scroll xuống phần <strong>"Authorized redirect URIs"</strong></p>
              <p className="text-sm mb-2">Click <strong>+ ADD URI</strong></p>
              <p className="text-sm mb-2">Copy và paste chính xác URI này:</p>
              
              <div className="bg-white p-3 rounded border">
                <div className="flex items-center justify-between">
                  <code className="text-sm font-mono text-primary">{redirectUri}</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(redirectUri)
                      alert('✅ Đã copy!')
                    }}
                    className="px-3 py-1 bg-primary text-white text-sm rounded hover:bg-green-700"
                  >
                    📋 Copy
                  </button>
                </div>
              </div>

              <div className="mt-3 text-xs text-slate-600">
                <div>✅ Đúng: <code>http://localhost:3000/api/auth/callback/google</code></div>
                <div>❌ Sai: <code>http://localhost:3000/api/auth/callback/google/</code> (có dấu / cuối)</div>
                <div>❌ Sai: <code>https://localhost:3000/...</code> (dùng https)</div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="mb-6 p-4 border-l-4 border-green-500 bg-green-50">
              <h3 className="font-semibold mb-2">Bước 5: Click SAVE (nút màu xanh)</h3>
            </div>

            {/* Step 6 */}
            <div className="mb-6 p-4 border-l-4 border-yellow-500 bg-yellow-50">
              <h3 className="font-semibold mb-2">Bước 6: Đợi 5 giây</h3>
              <p className="text-sm">Google cần vài giây để cập nhật cấu hình</p>
            </div>
          </div>

          {/* Test */}
          <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
            <h2 className="text-xl font-bold mb-4">🧪 Test ngay:</h2>
            <p className="text-sm mb-4">Sau khi hoàn thành các bước trên, click nút này để thử đăng nhập:</p>
            <button
              onClick={() => router.push('/auth')}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-700 font-semibold"
            >
              🚀 Thử đăng nhập lại
            </button>
          </div>

          {/* Troubleshooting */}
          <div className="mt-8 p-4 bg-slate-100 rounded-lg">
            <h3 className="font-semibold mb-2">❓ Nếu vẫn lỗi:</h3>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Clear browser cache (Ctrl + Shift + Delete)</li>
              <li>Thử Incognito mode (Ctrl + Shift + N)</li>
              <li>Đợi thêm 1 phút để Google cập nhật</li>
              <li>Kiểm tra lại URI đã thêm có chính xác không</li>
            </ul>
          </div>

          {/* Back button */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-primary hover:underline"
            >
              ← Quay về Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
