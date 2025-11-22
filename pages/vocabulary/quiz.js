import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

export default function Quiz() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [words, setWords] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [reviewResults, setReviewResults] = useState([])

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
        const shuffled = (data.words || []).sort(() => Math.random() - 0.5).slice(0, 10)
        setWords(shuffled)
      }
    } catch (error) {
      console.error('Error fetching words:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateOptions = (correctWord) => {
    if (words.length < 4) return [correctWord]

    const otherWords = words
      .filter(w => w.id !== correctWord.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)

    const options = [correctWord, ...otherWords].sort(() => Math.random() - 0.5)
    return options
  }

  const handleAnswer = async (selectedWord) => {
    if (showResult) return

    setSelectedAnswer(selectedWord)
    setShowResult(true)

    const currentWord = words[currentIndex]
    const isCorrect = selectedWord.id === currentWord.id

    if (isCorrect) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }))
    }
    setScore(prev => ({ ...prev, total: prev.total + 1 }))

    // Save review result
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

    setReviewResults(prev => [...prev, { wordId: currentWord.id, isCorrect }])
  }

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    }
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore({ correct: 0, total: 0 })
    setReviewResults([])
    fetchWords()
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
          <title>Quiz - VocabLearn</title>
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa có từ vựng</h2>
            <p className="text-gray-600 mb-6">Hãy tra cứu và lưu ít nhất 4 từ vựng để làm quiz!</p>
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

  if (words.length < 4) {
    return (
      <>
        <Head>
          <title>Quiz - VocabLearn</title>
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa đủ từ vựng</h2>
            <p className="text-gray-600 mb-6">Cần ít nhất 4 từ vựng để làm quiz. Hiện tại bạn có {words.length} từ.</p>
            <Link
              href="/vocabulary/search"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              Tra cứu thêm từ vựng
            </Link>
          </div>
        </div>
      </>
    )
  }

  const currentWord = words[currentIndex]
  const options = generateOptions(currentWord)
  const isFinished = currentIndex === words.length - 1 && showResult

  return (
    <>
      <Head>
        <title>Quiz - VocabLearn</title>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">📝 Quiz</h1>

          {/* Progress */}
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-2">
              Câu {currentIndex + 1} / {words.length}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
              ></div>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Điểm: {score.correct} / {score.total}
            </p>
          </div>

          {/* Quiz Card */}
          {!isFinished ? (
            <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Từ nào có nghĩa là:
                </h2>
                <p className="text-3xl text-indigo-600 font-semibold mb-2">
                  "{currentWord.definition}"
                </p>
                {currentWord.example && (
                  <p className="text-gray-600 italic mt-2">Ví dụ: "{currentWord.example}"</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {options.map((option, idx) => {
                  const isSelected = selectedAnswer?.id === option.id
                  const isCorrect = option.id === currentWord.id
                  const showCorrect = showResult && isCorrect
                  const showWrong = showResult && isSelected && !isCorrect

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleAnswer(option)}
                      disabled={showResult}
                      className={`p-6 rounded-2xl text-left transition-all font-semibold text-lg ${
                        showCorrect
                          ? 'bg-green-500 text-white shadow-lg'
                          : showWrong
                          ? 'bg-red-500 text-white shadow-lg'
                          : isSelected
                          ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-500'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-transparent'
                      } disabled:cursor-not-allowed`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option.word}</span>
                        {showCorrect && <span className="text-2xl">✓</span>}
                        {showWrong && <span className="text-2xl">✗</span>}
                      </div>
                    </button>
                  )
                })}
              </div>

              {showResult && (
                <div className="mt-6 text-center">
                  <button
                    onClick={handleNext}
                    className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    {currentIndex < words.length - 1 ? 'Câu tiếp theo →' : 'Xem kết quả'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 text-center">
              <div className="text-6xl mb-4">
                {score.correct === score.total ? '🎉' : score.correct >= score.total / 2 ? '👍' : '💪'}
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Hoàn thành!</h2>
              <p className="text-xl text-gray-600 mb-6">
                Bạn đã trả lời đúng <span className="font-bold text-indigo-600">{score.correct}</span> /{' '}
                <span className="font-bold">{score.total}</span> câu
              </p>
              <p className="text-2xl font-bold text-indigo-600 mb-8">
                {Math.round((score.correct / score.total) * 100)}%
              </p>
              <button
                onClick={handleRestart}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Làm lại
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}


