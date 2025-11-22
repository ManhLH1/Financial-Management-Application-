import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'

export default function AuthError() {
  const router = useRouter()
  const { error } = router.query

  const getErrorMessage = (errorCode) => {
    const errorMessages = {
      Configuration: 'Có lỗi cấu hình với dịch vụ đăng nhập. Vui lòng liên hệ hỗ trợ.',
      AccessDenied: 'Bạn đã từ chối quyền truy cập. Vui lòng cấp quyền để tiếp tục.',
      Verification: 'Mã xác minh không hợp lệ hoặc đã hết hạn.',
      Default: 'Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.'
    }
    return errorMessages[errorCode] || errorMessages.Default
  }

  const errorMessage = getErrorMessage(error)

  return (
    <>
      <Head>
        <title>Lỗi đăng nhập - FinTrack</title>
        <meta name="description" content="Đã xảy ra lỗi khi đăng nhập" />
      </Head>
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative overflow-hidden p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-white/10 rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-yellow-200/20 rounded-full mix-blend-overlay filter blur-3xl animate-blob" style={{animationDelay: '2s'}}></div>
          <div className="absolute -bottom-40 left-20 w-96 h-96 bg-pink-200/20 rounded-full mix-blend-overlay filter blur-3xl animate-blob" style={{animationDelay: '4s'}}></div>
        </div>

        <div className="relative z-10 w-full max-w-lg animate-slide-up">
          <div className="bg-white/95 backdrop-blur-2xl rounded-[32px] shadow-2xl p-8 md:p-10 border border-white/50">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Lỗi đăng nhập</h1>
              <p className="text-gray-600 text-base md:text-lg mb-6">{errorMessage}</p>
              
              {error && (
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <p className="text-xs text-gray-500 font-mono">Mã lỗi: {error}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Link 
                href="/auth"
                className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold hover:shadow-2xl hover:shadow-indigo-500/50 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>🔄</span>
                <span>Thử lại đăng nhập</span>
              </Link>
              
              <Link 
                href="/"
                className="w-full px-6 py-4 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>🏠</span>
                <span>Về trang chủ</span>
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                Nếu vấn đề vẫn tiếp tục, vui lòng kiểm tra:
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600">•</span>
                  <span>Đảm bảo bạn đã cấp quyền truy cập Google Sheets và Drive</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600">•</span>
                  <span>Kiểm tra kết nối internet của bạn</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600">•</span>
                  <span>Thử xóa cache trình duyệt và đăng nhập lại</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes blob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
          }
          .animate-blob { animation: blob 7s infinite; }
          @keyframes slide-up {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-slide-up { animation: slide-up 0.6s ease-out; }
        `}</style>
      </div>
    </>
  )
}

