import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

export default function Flashcard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [words, setWords] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [loading, setLoading] = useState(true)

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

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleNext = () => {
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev + 1) % words.length)
  }

  const handlePrevious = () => {
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev - 1 + words.length) % words.length)
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
          <title>Flashcard - VocabLearn</title>
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa có từ vựng</h2>
            <p className="text-gray-600 mb-6">Hãy tra cứu và lưu một số từ vựng để bắt đầu học!</p>
            <Link
              href="/vocabulary/search"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              Tra cứu từ vựng
            </Link>
          </div>
        </div>
      </>
    )
  }

  const currentWord = words[currentIndex]

  return (
    <>
      <Head>
        <title>Flashcard - VocabLearn</title>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">🎴 Flashcard</h1>

          {/* Progress */}
          <div className="text-center mb-6">
            <p className="text-gray-600">
              Từ {currentIndex + 1} / {words.length}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Flashcard */}
          <div className="mb-8">
            <div
              className="relative w-full h-96 cursor-pointer perspective-1000"
              onClick={handleFlip}
            >
              <div
                className={`absolute inset-0 transition-transform duration-500 transform-style-preserve-3d ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* Front */}
                <div className="absolute inset-0 backface-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8 text-white">
                    <div className="text-6xl mb-6">📖</div>
                    <h2 className="text-5xl font-bold mb-4 text-center">{currentWord.word}</h2>
                    {currentWord.phonetic && (
                      <p className="text-2xl text-indigo-100 italic mb-4">{currentWord.phonetic}</p>
                    )}
                    {currentWord.partOfSpeech && (
                      <span className="px-4 py-2 bg-white/20 rounded-full text-sm font-semibold">
                        {currentWord.partOfSpeech}
                      </span>
                    )}
                    <p className="mt-6 text-indigo-100 text-sm">Click để xem định nghĩa</p>
                  </div>
                </div>

                {/* Back */}
                <div className="absolute inset-0 backface-hidden rotate-y-180">
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8 text-white">
                    <div className="text-6xl mb-6">💡</div>
                    <h3 className="text-2xl font-bold mb-4 text-center">Định nghĩa</h3>
                    <p className="text-xl text-center mb-4 leading-relaxed">{currentWord.definition}</p>
                    {currentWord.example && (
                      <div className="mt-4 p-4 bg-white/20 rounded-xl">
                        <p className="text-sm font-semibold mb-1">Ví dụ:</p>
                        <p className="text-lg italic">"{currentWord.example}"</p>
                      </div>
                    )}
                    <div className="flex gap-2 mt-6">
                      {currentWord.audioUS && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            playAudio(currentWord.audioUS)
                          }}
                          className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                        >
                          <span className="text-xl">🔊</span>
                        </button>
                      )}
                      {currentWord.audioUK && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            playAudio(currentWord.audioUK)
                          }}
                          className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                        >
                          <span className="text-xl">🔊</span>
                        </button>
                      )}
                    </div>
                    <p className="mt-4 text-purple-100 text-sm">Click để quay lại</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handlePrevious}
              className="px-6 py-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold text-gray-700"
            >
              ← Trước
            </button>
            <button
              onClick={handleFlip}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
            >
              {isFlipped ? 'Xem từ' : 'Xem nghĩa'}
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold text-gray-700"
            >
              Sau →
            </button>
          </div>
        </div>

        <style jsx>{`
          .perspective-1000 {
            perspective: 1000px;
          }
          .transform-style-preserve-3d {
            transform-style: preserve-3d;
          }
          .backface-hidden {
            backface-visibility: hidden;
          }
          .rotate-y-180 {
            transform: rotateY(180deg);
          }
        `}</style>
      </div>
    </>
  )
}


