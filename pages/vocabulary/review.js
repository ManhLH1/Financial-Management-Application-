import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

export default function Review() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [words, setWords] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [loading, setLoading] = useState(true)
  const [completed, setCompleted] = useState(0)

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
      const response = await fetch('/api/vocabulary/due-for-review')
      if (response.ok) {
        const data = await response.json()
        const shuffled = (data.words || []).sort(() => Math.random() - 0.5)
        setWords(shuffled)
      }
    } catch (error) {
      console.error('Error fetching words:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = async (isCorrect) => {
    if (!showAnswer) return

    const currentWord = words[currentIndex]

    try {
      await fetch('/api/vocabulary/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wordId: currentWord.id,
          isCorrect
        })
      })
    } catch (error) {
      console.error('Error saving review:', error)
    }

    // Move to next word
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setShowAnswer(false)
      setCompleted(prev => prev + 1)
    } else {
      // Finished
      setCompleted(prev => prev + 1)
      setShowAnswer(true)
    }
  }

  const playAudio = (audioUrl) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl)
      audio.play().catch(err => console.error('Error playing audio:', err))
    }
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

  if (words.length === 0) {
    return (
      <>
        <Head>
          <title>Ôn Tập (SRS) - VocabLearn</title>
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Không có từ nào cần ôn tập</h2>
            <p className="text-gray-600 mb-6">Tất cả từ vựng của bạn đã được ôn tập đầy đủ!</p>
            <Link
              href="/vocabulary"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              Quay lại trang chủ
            </Link>
          </div>
        </div>
      </>
    )
  }

  const currentWord = words[currentIndex]
  const isFinished = completed >= words.length

  return (
    <>
      <Head>
        <title>Ôn Tập (SRS) - VocabLearn</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Navigation */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">🔄 Ôn Tập (Spaced Repetition)</h1>

          {/* Progress */}
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-2">
              {isFinished ? 'Hoàn thành!' : `Từ ${completed + 1} / ${words.length}`}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((completed + 1) / words.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {!isFinished ? (
            <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">{currentWord.word}</h2>
                {currentWord.phonetic && (
                  <p className="text-xl text-gray-600 italic mb-4">{currentWord.phonetic}</p>
                )}
                {currentWord.partOfSpeech && (
                  <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold mb-4">
                    {currentWord.partOfSpeech}
                  </span>
                )}
                <div className="flex items-center justify-center gap-2 mb-6">
                  {currentWord.audioUS && (
                    <button
                      onClick={() => playAudio(currentWord.audioUS)}
                      className="w-12 h-12 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors"
                      title="Phát âm US"
                    >
                      <span className="text-xl">🔊</span>
                    </button>
                  )}
                  {currentWord.audioUK && (
                    <button
                      onClick={() => playAudio(currentWord.audioUK)}
                      className="w-12 h-12 bg-purple-100 hover:bg-purple-200 rounded-full flex items-center justify-center transition-colors"
                      title="Phát âm UK"
                    >
                      <span className="text-xl">🔊</span>
                    </button>
                  )}
                </div>
              </div>

              {!showAnswer ? (
                <div className="text-center">
                  <button
                    onClick={() => setShowAnswer(true)}
                    className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all text-lg"
                  >
                    Hiển thị đáp án
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-indigo-50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Định nghĩa:</h3>
                    <p className="text-gray-700 text-lg leading-relaxed">{currentWord.definition}</p>
                  </div>

                  {currentWord.example && (
                    <div className="bg-purple-50 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Ví dụ:</h3>
                      <p className="text-gray-700 italic text-lg">"{currentWord.example}"</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <button
                      onClick={() => handleAnswer(false)}
                      className="px-6 py-4 bg-red-500 text-white rounded-2xl font-semibold hover:bg-red-600 transition-all text-lg"
                    >
                      ❌ Không nhớ
                    </button>
                    <button
                      onClick={() => handleAnswer(true)}
                      className="px-6 py-4 bg-green-500 text-white rounded-2xl font-semibold hover:bg-green-600 transition-all text-lg"
                    >
                      ✅ Đã nhớ
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Hoàn thành ôn tập!</h2>
              <p className="text-xl text-gray-600 mb-8">
                Bạn đã ôn tập <span className="font-bold text-indigo-600">{words.length}</span> từ vựng
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/vocabulary"
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Quay lại
                </Link>
                <button
                  onClick={() => {
                    setCurrentIndex(0)
                    setShowAnswer(false)
                    setCompleted(0)
                    fetchWords()
                  }}
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                >
                  Ôn tập lại
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}


