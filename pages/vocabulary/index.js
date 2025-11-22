import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

export default function VocabularyHome() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({ total: 0, due: 0 })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.accessToken) {
      fetchStats()
    }
  }, [session])

  const fetchStats = async () => {
    try {
      const [listRes, dueRes] = await Promise.all([
        fetch('/api/vocabulary/list'),
        fetch('/api/vocabulary/due-for-review')
      ])

      if (listRes.ok) {
        const listData = await listRes.json()
        setStats(prev => ({ ...prev, total: listData.count || 0 }))
      }

      if (dueRes.ok) {
        const dueData = await dueRes.json()
        setStats(prev => ({ ...prev, due: dueData.count || 0 }))
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Học Từ Vựng - VocabLearn</title>
        <meta name="description" content="Ứng dụng học từ vựng tiếng Anh với Flashcard, Quiz và Spaced Repetition" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Navigation Button to Financial App */}
        <div className="fixed top-4 right-4 z-50">
          <Link
            href="/"
            className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-indigo-600 border border-gray-200"
          >
            <span>💰</span>
            <span>Quản Lý Chi Tiêu</span>
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  📚 VocabLearn
                </h1>
                <p className="text-sm text-gray-600 mt-1">Học từ vựng tiếng Anh hiệu quả</p>
              </div>
              {session && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Xin chào,</p>
                  <p className="font-semibold text-gray-900">{session.user.name || session.user.email}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tổng từ vựng</p>
                  <p className="text-3xl font-bold text-indigo-600">{stats.total}</p>
                </div>
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📖</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Cần ôn tập</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.due}</p>
                </div>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⏰</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Link
              href="/vocabulary/search"
              className="group bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="text-white">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-bold mb-2">Tra Cứu Từ Vựng</h3>
                <p className="text-indigo-100 text-sm">Tìm kiếm định nghĩa, phát âm và ví dụ</p>
              </div>
            </Link>

            <Link
              href="/vocabulary/flashcard"
              className="group bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="text-white">
                <div className="text-4xl mb-4">🎴</div>
                <h3 className="text-xl font-bold mb-2">Flashcard</h3>
                <p className="text-purple-100 text-sm">Học từ vựng bằng thẻ ghi nhớ</p>
              </div>
            </Link>

            <Link
              href="/vocabulary/quiz"
              className="group bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="text-white">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-xl font-bold mb-2">Quiz</h3>
                <p className="text-pink-100 text-sm">Kiểm tra kiến thức với câu hỏi 4 đáp án</p>
              </div>
            </Link>

            <Link
              href="/vocabulary/list"
              className="group bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="text-white">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-xl font-bold mb-2">Danh Sách Từ Vựng</h3>
                <p className="text-blue-100 text-sm">Xem tất cả từ vựng đã lưu</p>
              </div>
            </Link>

            <Link
              href="/vocabulary/review"
              className="group bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="text-white">
                <div className="text-4xl mb-4">🔄</div>
                <h3 className="text-xl font-bold mb-2">Ôn Tập (SRS)</h3>
                <p className="text-green-100 text-sm">Ôn tập từ vựng với Spaced Repetition</p>
              </div>
            </Link>

            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-lg p-8">
              <div className="text-white">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-bold mb-2">Thống Kê</h3>
                <p className="text-yellow-100 text-sm">
                  Tổng: {stats.total} từ | Cần ôn: {stats.due} từ
                </p>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">💡 Tính năng</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <span className="text-indigo-600 text-lg">✓</span>
                <div>
                  <p className="font-semibold text-gray-900">Tra cứu từ vựng</p>
                  <p>Sử dụng Free Dictionary API để tra cứu định nghĩa, phát âm và ví dụ</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-600 text-lg">✓</span>
                <div>
                  <p className="font-semibold text-gray-900">Flashcard</p>
                  <p>Học từ vựng hiệu quả với phương pháp flashcard</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-pink-600 text-lg">✓</span>
                <div>
                  <p className="font-semibold text-gray-900">Quiz</p>
                  <p>Kiểm tra kiến thức với câu hỏi trắc nghiệm 4 đáp án</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-600 text-lg">✓</span>
                <div>
                  <p className="font-semibold text-gray-900">Spaced Repetition</p>
                  <p>Hệ thống ôn tập thông minh giúp ghi nhớ lâu dài</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}


