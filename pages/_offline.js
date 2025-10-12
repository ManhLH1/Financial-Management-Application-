import Head from 'next/head'
import { WifiOff } from 'lucide-react'

export default function OfflinePage() {
  return (
    <>
      <Head>
        <title>Offline - Quản Lý Chi Tiêu</title>
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <WifiOff className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Bạn đang offline
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Vui lòng kiểm tra kết nối internet của bạn và thử lại.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Thử lại
            </button>
            
            <button
              onClick={() => window.history.back()}
              className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Quay lại
            </button>
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              💡 <strong>Mẹo:</strong> Một số tính năng vẫn có thể hoạt động khi offline nhờ dữ liệu đã lưu trong bộ nhớ cache.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
