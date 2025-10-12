import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Head from 'next/head'

export default function Auth(){
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (session) {
      router.push('/')
    }
  }, [session, router])

  async function handleGoogleSignIn() {
    setIsLoading(true)
    await signIn('google', { callbackUrl: '/' })
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-white text-xl font-semibold animate-pulse">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Đăng nhập - FinTrack</title>
        <meta name="description" content="Đăng nhập vào FinTrack để quản lý tài chính cá nhân một cách thông minh" />
      </Head>
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative overflow-hidden p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-white/10 rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-yellow-200/20 rounded-full mix-blend-overlay filter blur-3xl animate-blob" style={{animationDelay: '2s'}}></div>
          <div className="absolute -bottom-40 left-20 w-96 h-96 bg-pink-200/20 rounded-full mix-blend-overlay filter blur-3xl animate-blob" style={{animationDelay: '4s'}}></div>
        </div>

        <div className="relative z-10 w-full max-w-lg animate-slide-up">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-[28px] shadow-2xl mb-6 transform hover:scale-110 hover:rotate-6 transition-all duration-500 cursor-pointer">
              <div className="text-5xl"></div>
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-white mb-3 tracking-tight">FinTrack</h1>
            <p className="text-white/90 text-lg md:text-xl font-medium mb-4">Quản lý tài chính thông minh</p>
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/20 backdrop-blur-lg rounded-full border border-white/30">
              <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
              <span className="text-white font-medium text-sm">An toàn & Miễn phí</span>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-2xl rounded-[32px] shadow-2xl p-8 md:p-10 border border-white/50">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">Chào mừng! </h2>
              <p className="text-gray-600 text-base md:text-lg">Bắt đầu hành trình quản lý tài chính</p>
            </div>

            <button 
              className="w-full px-6 py-5 bg-white border-2 border-gray-200 hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-200/50 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 font-semibold text-gray-800 group disabled:opacity-60 disabled:cursor-not-allowed mb-8"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                  <span className="text-lg">Đang đăng nhập...</span>
                </>
              ) : (
                <>
                  <svg className="w-7 h-7 group-hover:scale-110 transition-transform flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-lg">Tiếp tục với Google</span>
                </>
              )}
            </button>

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-gray-200"></div></div>
              <div className="relative flex justify-center"><span className="px-4 bg-white text-gray-500 font-semibold text-sm">Tính năng nổi bật</span></div>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-6">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 group hover:shadow-lg transition-all cursor-pointer">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-base mb-1">Đồng bộ Google Sheets</h3>
                  <p className="text-sm text-gray-600">Dữ liệu tự động lưu vào tài khoản Google</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 group hover:shadow-lg transition-all cursor-pointer">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-base mb-1">Thống kê trực quan</h3>
                  <p className="text-sm text-gray-600">Biểu đồ chi tiết theo danh mục</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100 group hover:shadow-lg transition-all cursor-pointer">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-base mb-1">Nhắc nhở thông minh</h3>
                  <p className="text-sm text-gray-600">Email nhắc thanh toán đúng hạn</p>
                </div>
              </div>
            </div>

            <div className="p-5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-lg">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold text-base mb-1">Bảo mật & Riêng tư 100%</p>
                  <p className="text-white/90 text-sm">Dữ liệu chỉ lưu trên Google Drive của bạn</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8 space-y-2">
            <p className="text-white font-semibold drop-shadow-lg"> 2025 FinTrack</p>
            <p className="text-white/90 text-sm">Được phát triển với  tại Việt Nam</p>
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
    </>
  )
}
