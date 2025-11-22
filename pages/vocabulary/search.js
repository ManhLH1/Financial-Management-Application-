import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

export default function VocabularySearch() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [searchWord, setSearchWord] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  if (status === 'unauthenticated') {
    router.push('/auth')
    return null
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchWord.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)
    setSaved(false)

    try {
      const response = await fetch(`/api/vocabulary/search?word=${encodeURIComponent(searchWord.trim())}`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Word not found')
        return
      }

      setResult(data)
    } catch (err) {
      setError('Failed to search word. Please try again.')
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!result || !session?.accessToken) return

    setSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/vocabulary/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: result.word,
          phonetic: result.phonetic,
          partOfSpeech: result.partOfSpeech,
          definition: result.definition,
          example: result.example,
          audioUS: result.audioUS,
          audioUK: result.audioUK
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to save word')
        return
      }

      setSaved(true)
    } catch (err) {
      setError('Failed to save word. Please try again.')
      console.error('Save error:', err)
    } finally {
      setSaving(false)
    }
  }

  const playAudio = (audioUrl) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl)
      audio.play().catch(err => console.error('Error playing audio:', err))
    }
  }

  return (
    <>
      <Head>
        <title>Tra Cứu Từ Vựng - VocabLearn</title>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">🔍 Tra Cứu Từ Vựng</h1>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex gap-4">
              <input
                type="text"
                value={searchWord}
                onChange={(e) => setSearchWord(e.target.value)}
                placeholder="Nhập từ vựng cần tra cứu..."
                className="flex-1 px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none text-lg"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !searchWord.trim()}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang tìm...' : 'Tìm kiếm'}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {saved && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
              <p className="text-green-800">✓ Đã lưu từ vựng vào danh sách của bạn!</p>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{result.word}</h2>
                  {result.phonetic && (
                    <p className="text-lg text-gray-600 italic">{result.phonetic}</p>
                  )}
                  {result.partOfSpeech && (
                    <span className="inline-block mt-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                      {result.partOfSpeech}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {result.audioUS && (
                    <button
                      onClick={() => playAudio(result.audioUS)}
                      className="w-12 h-12 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors"
                      title="Phát âm US"
                    >
                      <span className="text-xl">🔊</span>
                    </button>
                  )}
                  {result.audioUK && (
                    <button
                      onClick={() => playAudio(result.audioUK)}
                      className="w-12 h-12 bg-purple-100 hover:bg-purple-200 rounded-full flex items-center justify-center transition-colors"
                      title="Phát âm UK"
                    >
                      <span className="text-xl">🔊</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                {/* Definition */}
                {result.definition && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Định nghĩa:</h3>
                    <p className="text-gray-700 leading-relaxed">{result.definition}</p>
                  </div>
                )}

                {/* Example */}
                {result.example && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Ví dụ:</h3>
                    <p className="text-gray-700 italic leading-relaxed">"{result.example}"</p>
                  </div>
                )}

                {/* Full Meanings */}
                {result.fullData?.meanings && result.fullData.meanings.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Các nghĩa khác:</h3>
                    <div className="space-y-4">
                      {result.fullData.meanings.map((meaning, idx) => (
                        <div key={idx} className="border-l-4 border-indigo-500 pl-4">
                          <p className="font-semibold text-indigo-700 mb-2">{meaning.partOfSpeech}</p>
                          <ul className="space-y-2">
                            {meaning.definitions?.slice(0, 3).map((def, defIdx) => (
                              <li key={defIdx} className="text-gray-700">
                                <span className="font-medium">{defIdx + 1}.</span> {def.definition}
                                {def.example && (
                                  <p className="text-gray-600 italic mt-1 ml-4">"{def.example}"</p>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <button
                  onClick={handleSave}
                  disabled={saving || saved}
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Đang lưu...' : saved ? '✓ Đã lưu' : '💾 Lưu vào danh sách từ vựng'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}


