import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function Auth(){
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push('/')
    }
  }, [session, router])

  async function handleGoogleSignIn() {
    await signIn('google', { callbackUrl: '/' })
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1B3C53] via-[#234C6A] to-[#456882] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-[#D2C1B6]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo/Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#D2C1B6] to-[#456882] rounded-2xl shadow-2xl mb-4 transform hover:scale-110 transition-transform duration-300">
            <span className="text-4xl">📊</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">FinTrack</h1>
          <p className="text-[#D2C1B6] text-lg">Quản lý tài chính thông minh</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-[#1B3C53] mb-2 text-center">Chào mừng bạn! 👋</h2>
          <p className="text-gray-600 text-center mb-8">Đăng nhập để bắt đầu quản lý chi tiêu</p>

          {/* Google Sign In Button */}
          <button 
            className="w-full px-6 py-4 bg-white border-2 border-gray-200 hover:border-[#456882] rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3 font-semibold text-gray-700 hover:text-[#1B3C53] group"
            onClick={handleGoogleSignIn}
          >
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Đăng nhập với Google</span>
          </button>

          {/* Features List */}
          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">✓</span>
              <span>Đồng bộ tự động với Google Sheets</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">✓</span>
              <span>Thống kê chi tiêu trực quan</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">✓</span>
              <span>Nhắc nhở thanh toán qua email</span>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              🔒 Dữ liệu của bạn được lưu trữ an toàn trên Google Sheets.<br/>
              Chúng tôi không lưu trữ thông tin cá nhân.
            </p>
          </div>

          {/* Help Link */}
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-800 mb-2 flex items-center gap-2">
              <span>⚠️</span>
              <strong>Gặp lỗi khi đăng nhập?</strong>
            </p>
            <a 
              href="/setup-help" 
              className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-1"
            >
              → Xem hướng dẫn fix lỗi redirect_uri_mismatch
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-white/70 text-sm">
          <p>© 2025 FinTrack - Made with ❤️</p>
        </div>
      </div>
    </div>
  )
}
