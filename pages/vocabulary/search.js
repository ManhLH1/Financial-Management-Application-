import { useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import VocabularyHeader from '../../components/vocabulary/VocabularyHeader'
import Notification, { useNotification } from '../../components/Notification'

export default function VocabularySearch() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [searchWord, setSearchWord] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showEnglish, setShowEnglish] = useState(true)
  const { notification, showNotification, hideNotification } = useNotification()
  const quickMeaning = useMemo(() => {
    if (!result) return ''
    const text = result.simpleMeaning || result.definition || result.definitionEN || ''
    if (!text) return ''
    return text.length > 80 ? `${text.substring(0, 80)}…` : text
  }, [result])

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
        const errorMsg = data.error || 'Word not found'
        setError(errorMsg)
        showNotification(`❌ ${errorMsg}`, 'error')
        return
      }

      setResult(data)
      showNotification('✅ Tìm thấy từ vựng!', 'success', 2000)
    } catch (err) {
      const errorMsg = 'Failed to search word. Please try again.'
      setError(errorMsg)
      showNotification(`❌ ${errorMsg}`, 'error')
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
          definitionEN: result.definitionEN,
          example: result.example,
          exampleEN: result.exampleEN,
          audioUS: result.audioUS,
          audioUK: result.audioUK
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to save word')
        showNotification(`❌ ${data.error || 'Failed to save word'}`, 'error')
        return
      }

      setSaved(true)
      showNotification('✅ Đã lưu từ vựng vào danh sách của bạn!', 'success')
    } catch (err) {
      const errorMsg = 'Failed to save word. Please try again.'
      setError(errorMsg)
      showNotification('❌ Không thể lưu từ vựng. Vui lòng thử lại.', 'error')
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

  const heroStats = [
    {
      label: 'Chế độ hiển thị',
      value: showEnglish ? 'Song ngữ' : 'Chỉ tiếng Việt',
      badge: 'Tùy chọn nhanh'
    },
    {
      label: 'Trạng thái lưu',
      value: saved ? 'Đã đồng bộ Google Sheets' : 'Chưa lưu',
      badge: saved ? 'Đồng bộ' : 'Chờ lưu'
    },
    {
      label: 'Nguồn dữ liệu',
      value: 'DictionaryAPI + LibreTranslate',
      badge: 'Realtime'
    }
  ]

  return (
    <>
      <Head>
        <title>Tra Cứu Từ Vựng - Financial Management</title>
      </Head>

      <div className="relative min-h-screen bg-[#020617] text-white">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-32 left-1/3 h-[420px] w-[420px] rounded-full bg-indigo-600/30 blur-[140px]" />
          <div className="absolute top-1/2 right-10 h-[380px] w-[380px] rounded-full bg-purple-500/30 blur-[160px]" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
        </div>

        <VocabularyHeader />

        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={hideNotification}
            duration={notification.duration}
          />
        )}

        <main className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <section className="grid gap-8 lg:grid-cols-[1.8fr,1fr]">
            <form
              onSubmit={handleSearch}
              className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-indigo-900/30"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.4em] text-white/60">Vocab Insight</p>
                  <h1 className="mt-2 text-3xl font-bold">🔍 Tra cứu & đồng bộ ngay</h1>
                  <p className="mt-1 text-white/70">
                    Tìm nghĩa song ngữ, nghe phát âm và lưu trực tiếp vào sổ tay tài chính.
                  </p>
                </div>
                <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                  Realtime Translate
                </span>
              </div>

              <div className="mt-6 flex flex-col gap-4 md:flex-row">
                <div className="flex-1 rounded-2xl border border-white/10 bg-[#050b1e] px-5 py-4 shadow-inner shadow-black/30 focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-400">
                  <label className="text-xs uppercase tracking-[0.3em] text-white/40">Từ cần tra cứu</label>
                  <input
                    type="text"
                    value={searchWord}
                    onChange={(e) => setSearchWord(e.target.value)}
                    placeholder="Ví dụ: wealth, diversify, liability..."
                    className="mt-1 w-full bg-transparent text-lg font-semibold text-white placeholder-white/30 focus:outline-none"
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !searchWord.trim()}
                  className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-8 py-4 text-lg font-semibold shadow-lg shadow-indigo-900/40 transition hover:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
                >
                  {loading ? 'Đang tìm...' : 'Tra cứu ngay'}
                </button>
              </div>

              {error && (
                <div className="mt-4 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                  {error}
                </div>
              )}
            </form>

            <div className="space-y-4">
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/20"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">{stat.badge}</p>
                  <p className="mt-1 text-sm text-white/70">{stat.label}</p>
                  <p className="text-xl font-semibold text-white">{stat.value}</p>
                </div>
              ))}

              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-transparent p-5 shadow-lg shadow-indigo-900/40">
                <p className="text-sm font-semibold text-white/80">📈 Đồng bộ hệ sinh thái</p>
                <p className="mt-2 text-sm text-white/60">
                  Mọi từ vựng đã lưu sẽ xuất hiện trong báo cáo học tập và sổ tay tài chính,
                  giúp bạn ghi nhớ khái niệm khi phân tích chi tiêu.
                </p>
              </div>
            </div>
          </section>

          {result && (
            <section className="mt-10 space-y-6">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-white/60">Từ khóa</p>
                    <h2 className="text-4xl font-bold">{result.word}</h2>
                    {quickMeaning && (
                      <p className="mt-2 text-emerald-200 text-xl font-semibold">
                        {result.word} = <span className="text-white">{quickMeaning}</span>
                      </p>
                    )}
                    {result.phonetic && <p className="mt-2 text-lg text-white/70 italic">{result.phonetic}</p>}
                    {result.partOfSpeech && (
                      <span className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-semibold text-indigo-200">
                        🏷️ {result.partOfSpeech}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {result.audioUS && (
                      <button
                        onClick={() => playAudio(result.audioUS)}
                        className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-xl text-white transition hover:bg-white/20"
                        title="Phát âm US"
                      >
                        🔊
                      </button>
                    )}
                    {result.audioUK && (
                      <button
                        onClick={() => playAudio(result.audioUK)}
                        className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-xl text-white transition hover:bg-white/20"
                        title="Phát âm UK"
                      >
                        🔊
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <span className="rounded-full border border-white/15 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/60">
                    Dịch sân chơi tài chính
                  </span>
                  <button
                    onClick={() => setShowEnglish(!showEnglish)}
                    className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40"
                  >
                    {showEnglish ? '🇻🇳 Chỉ hiển thị tiếng Việt' : '🇬🇧 Hiển thị song ngữ'}
                  </button>
                </div>

                <div className="mt-8 grid gap-6 md:grid-cols-2">
                  {result.definition && (
                    <div className="rounded-2xl border border-indigo-400/30 bg-indigo-500/10 p-6">
                      <div className="flex items-center justify-between text-sm text-indigo-100/80">
                        <span className="font-semibold uppercase tracking-[0.2em]">Định nghĩa</span>
                        <span>🇻🇳</span>
                      </div>
                      <p className="mt-3 text-lg text-white/90">{result.definition}</p>

                      {showEnglish && result.definitionEN && result.definitionEN !== result.definition && (
                        <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                          <span className="text-xs uppercase tracking-[0.3em] text-white/40">English</span>
                          <p className="mt-1 italic">{result.definitionEN}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {result.example && (
                    <div className="rounded-2xl border border-pink-400/30 bg-pink-500/10 p-6">
                      <div className="flex items-center justify-between text-sm text-pink-100/80">
                        <span className="font-semibold uppercase tracking-[0.2em]">Ví dụ thực tế</span>
                        <span>🇻🇳</span>
                      </div>
                      <p className="mt-3 text-lg italic text-white/90">&ldquo;{result.example}&rdquo;</p>

                      {showEnglish && result.exampleEN && result.exampleEN !== result.example && (
                        <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                          <span className="text-xs uppercase tracking-[0.3em] text-white/40">English</span>
                          <p className="mt-1 italic">&ldquo;{result.exampleEN}&rdquo;</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {result.fullData?.meanings?.length > 0 && (
                  <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
                    <p className="text-sm uppercase tracking-[0.3em] text-white/50">Các nghĩa bổ sung</p>
                    <div className="mt-4 space-y-4">
                      {result.fullData.meanings.map((meaning, idx) => (
                        <div key={`${meaning.partOfSpeech}-${idx}`} className="rounded-2xl border border-white/10 bg-[#050b1e] p-4">
                          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-200">
                            {meaning.partOfSpeech}
                          </p>
                          <ul className="mt-3 space-y-2 text-sm text-white/80">
                            {meaning.definitions?.slice(0, 3).map((def, defIdx) => (
                              <li key={defIdx}>
                                <span className="font-semibold text-indigo-200">#{defIdx + 1}</span> {def.definition}
                                {def.example && <p className="ml-4 text-white/60 italic">&ldquo;{def.example}&rdquo;</p>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleSave}
                  disabled={saving || saved}
                  className="mt-8 w-full rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-lime-400 px-6 py-4 text-lg font-semibold text-slate-900 shadow-xl shadow-emerald-900/30 transition hover:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? 'Đang lưu...' : saved ? '✓ Đã đồng bộ với Google Sheets' : '💾 Lưu vào danh sách học'}
                </button>
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  )
}
