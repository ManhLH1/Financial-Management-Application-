import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

export default function VocabularyList() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [words, setWords] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, due, mastered

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.accessToken) {
      fetchWords()
    }
  }, [session])

  const fetchWords = async () => {
    try {
      const response = await fetch('/api/vocabulary/list')
      if (response.ok) {
        const data = await response.json()
        setWords(data.words || [])
      }
    } catch (error) {
      console.error('Error fetching words:', error)
    } finally {
      setLoading(false)
    }
  }

  const playAudio = (audioUrl) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl)
      audio.play().catch(err => console.error('Error playing audio:', err))
    }
  }

  const getFilteredWords = () => {
    const now = new Date()
    switch (filter) {
      case 'due':
        return words.filter(word => {
          if (!word.nextReview) return false
          return new Date(word.nextReview) <= now
        })
      case 'mastered':
        return words.filter(word => word.level >= 7)
      default:
        return words
    }
  }

  const getLevelColor = (level) => {
    if (level >= 7) return 'bg-green-100 text-green-700'
    if (level >= 4) return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const filteredWords = getFilteredWords()

  return (
    <>
      <Head>
        <title>Danh Sách Từ Vựng - VocabLearn</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Navigation */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/vocabulary" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                ← Quay lại
              </Link>
              <Link
                href="/"
                className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold hover:bg-indigo-200 transition-colors"
              >
                💰 Quản Lý Chi Tiêu
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">📚 Danh Sách Từ Vựng</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                  filter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Tất cả ({words.length})
              </button>
              <button
                onClick={() => setFilter('due')}
                className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                  filter === 'due'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Cần ôn ({words.filter(w => w.nextReview && new Date(w.nextReview) <= new Date()).length})
              </button>
              <button
                onClick={() => setFilter('mastered')}
                className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                  filter === 'mastered'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Đã thuộc ({words.filter(w => w.level >= 7).length})
              </button>
            </div>
          </div>

          {filteredWords.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {filter === 'all' ? 'Chưa có từ vựng' : filter === 'due' ? 'Không có từ nào cần ôn' : 'Chưa có từ nào đã thuộc'}
              </h2>
              <p className="text-gray-600 mb-6">
                {filter === 'all' && 'Hãy tra cứu và lưu từ vựng để bắt đầu học!'}
              </p>
              {filter === 'all' && (
                <Link
                  href="/vocabulary/search"
                  className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Tra cứu từ vựng
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWords.map((word) => (
                <div
                  key={word.id}
                  className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{word.word}</h3>
                      {word.phonetic && (
                        <p className="text-sm text-gray-600 italic mb-2">{word.phonetic}</p>
                      )}
                      {word.partOfSpeech && (
                        <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-semibold">
                          {word.partOfSpeech}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {word.audioUS && (
                        <button
                          onClick={() => playAudio(word.audioUS)}
                          className="w-8 h-8 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors"
                          title="Phát âm US"
                        >
                          <span className="text-sm">🔊</span>
                        </button>
                      )}
                      {word.audioUK && (
                        <button
                          onClick={() => playAudio(word.audioUK)}
                          className="w-8 h-8 bg-purple-100 hover:bg-purple-200 rounded-full flex items-center justify-center transition-colors"
                          title="Phát âm UK"
                        >
                          <span className="text-sm">🔊</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-700 mb-3 leading-relaxed">{word.definition}</p>

                  {word.example && (
                    <p className="text-sm text-gray-600 italic mb-4">"{word.example}"</p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span className={`px-2 py-1 rounded ${getLevelColor(word.level)} font-semibold`}>
                        Level {word.level}
                      </span>
                      <span>✓ {word.correctCount}</span>
                      <span>✗ {word.wrongCount}</span>
                    </div>
                  </div>

                  {word.nextReview && (
                    <p className="text-xs text-gray-500 mt-2">
                      Ôn lại: {new Date(word.nextReview).toLocaleDateString('vi-VN')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}


