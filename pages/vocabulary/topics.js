import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import VocabularyHeader from '../../components/vocabulary/VocabularyHeader'
import Notification, { useNotification } from '../../components/Notification'

const PREDEFINED_TOPICS = [
  { name: 'Technology', label: 'Công nghệ', icon: '💻' },
  { name: 'Food', label: 'Ẩm thực', icon: '🍕' },
  { name: 'Travel', label: 'Du lịch', icon: '✈️' },
  { name: 'Sports', label: 'Thể thao', icon: '⚽' },
  { name: 'Music', label: 'Âm nhạc', icon: '🎵' },
  { name: 'Nature', label: 'Thiên nhiên', icon: '🌳' },
  { name: 'Business', label: 'Kinh doanh', icon: '💼' },
  { name: 'Health', label: 'Sức khỏe', icon: '🏥' },
  { name: 'Education', label: 'Giáo dục', icon: '📚' },
  { name: 'Art', label: 'Nghệ thuật', icon: '🎨' },
  { name: 'Science', label: 'Khoa học', icon: '🔬' },
  { name: 'Animals', label: 'Động vật', icon: '🐾' }
]

const SESSION_WORD_LIMITS = [8, 12, 16, 20]

export default function VocabularyTopics() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedTopic, setSelectedTopic] = useState('')
  const [customTopic, setCustomTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [words, setWords] = useState([])
  const [error, setError] = useState(null)
  const [savingWords, setSavingWords] = useState(new Set())
  const [savedWords, setSavedWords] = useState(new Set())
  const [expandedWord, setExpandedWord] = useState(null)
  const [sessionTopic, setSessionTopic] = useState('')
  const [learningQueue, setLearningQueue] = useState([])
  const [sessionStatus, setSessionStatus] = useState('idle') // idle | learning | completed | empty
  const [sessionStats, setSessionStats] = useState({
    total: 0,
    mastered: 0,
    reviewing: 0,
    answered: 0
  })
  const [sessionHistory, setSessionHistory] = useState([])
  const [wordLimit, setWordLimit] = useState(12)
  const { notification, showNotification, hideNotification } = useNotification()

  if (status === 'unauthenticated') {
    router.push('/auth')
    return null
  }

  const currentWord = learningQueue[0] || null
  const progressPercent = sessionStats.total
    ? Math.min(100, Math.round((sessionStats.mastered / sessionStats.total) * 100))
    : 0
  const remainingWords = learningQueue.length

  const buildLearningQueue = (dataset) => {
    const timestamp = Date.now()
    return dataset.map((word, index) => ({
      ...word,
      sessionKey: `${word.word}-${index}-${timestamp}`
    }))
  }

  const startLearningSession = (topicLabel, dataset) => {
    setSessionTopic(topicLabel)
    setLearningQueue(buildLearningQueue(dataset))
    setSessionStats({
      total: dataset.length,
      mastered: 0,
      reviewing: 0,
      answered: 0
    })
    setSessionHistory([])
    setSessionStatus(dataset.length ? 'learning' : 'empty')
    setExpandedWord(null)
  }

  const fetchTopicWords = async (topicName, { autoStart = true } = {}) => {
    if (!topicName) {
      showNotification('❌ Vui lòng chọn hoặc nhập chủ đề', 'error')
      return
    }

    setLoading(true)
    setError(null)
    setWords([])
    setExpandedWord(null)

    try {
      const response = await fetch(
        `/api/vocabulary/topics?topic=${encodeURIComponent(topicName)}&max=${wordLimit}&useDictionary=true`
      )
      const data = await response.json()

      if (!response.ok) {
        const errorMsg = data.error || 'Failed to load words'
        setError(errorMsg)
        showNotification(`❌ ${errorMsg}`, 'error')
        setSessionStatus('idle')
        return
      }

      if (data.words && data.words.length > 0) {
        setWords(data.words)
        showNotification(`✅ Đã tạo ${data.words.length} từ cho chủ đề "${topicName}"`, 'success', 2000)
        if (autoStart) {
          startLearningSession(topicName, data.words)
        }
      } else {
        setError('Không tìm thấy từ vựng nào cho chủ đề này')
        showNotification('⚠️ Không tìm thấy từ vựng', 'error')
        setSessionStatus('empty')
      }
    } catch (err) {
      const errorMsg = 'Failed to load words. Please try again.'
      setError(errorMsg)
      showNotification(`❌ ${errorMsg}`, 'error')
      console.error('Load words error:', err)
      setSessionStatus('idle')
    } finally {
      setLoading(false)
    }
  }

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic)
    setCustomTopic('')
    setError(null)
    fetchTopicWords(topic, { autoStart: true })
  }

  const handleCustomTopicChange = (e) => {
    setCustomTopic(e.target.value)
    setSelectedTopic('')
    setError(null)
  }

  const handleCustomTopicSubmit = () => {
    const topic = customTopic.trim()
    if (!topic) {
      showNotification('❌ Vui lòng nhập chủ đề tùy chỉnh', 'error')
      return
    }
    fetchTopicWords(topic, { autoStart: true })
  }

  const handleSaveWord = async (wordData) => {
    if (!session?.accessToken || savingWords.has(wordData.word)) return

    setSavingWords(prev => new Set(prev).add(wordData.word))
    setError(null)

    try {
      const response = await fetch('/api/vocabulary/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: wordData.word,
          phonetic: wordData.phonetic || '',
          partOfSpeech: wordData.partOfSpeech || '',
          definition: wordData.definition || wordData.simpleMeaning || wordData.word,
          definitionEN: wordData.definitionEN || '',
          example: wordData.example || '',
          exampleEN: wordData.exampleEN || '',
          audioUS: wordData.audioUS || '',
          audioUK: wordData.audioUK || ''
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to save word')
        showNotification(`❌ Không thể lưu từ "${wordData.word}"`, 'error')
        return
      }

      setSavedWords(prev => new Set(prev).add(wordData.word))
      showNotification(`✅ Đã lưu từ "${wordData.word}"!`, 'success')
    } catch (err) {
      setError('Failed to save word. Please try again.')
      showNotification(`❌ Không thể lưu từ "${wordData.word}"`, 'error')
      console.error('Save error:', err)
    } finally {
      setSavingWords(prev => {
        const newSet = new Set(prev)
        newSet.delete(wordData.word)
        return newSet
      })
    }
  }

  const handleSessionAction = (action) => {
    if (!currentWord) return

    const { word } = currentWord
    setSessionHistory(prev => [...prev, { word, action }])

    setSessionStats(prev => ({
      ...prev,
      mastered: prev.mastered + (action === 'mastered' ? 1 : 0),
      reviewing: prev.reviewing + (action === 'review' ? 1 : 0),
      answered: prev.answered + 1
    }))

    setLearningQueue(prev => {
      const [, ...rest] = prev
      let nextQueue = rest

      if (action === 'review') {
        nextQueue = [
          ...rest,
          {
            ...currentWord,
            sessionKey: `${currentWord.sessionKey}-r${Date.now()}`,
            reviewCount: (currentWord.reviewCount || 0) + 1
          }
        ]
      }

      if (action === 'skip') {
        nextQueue = [
          ...rest,
          {
            ...currentWord,
            sessionKey: `${currentWord.sessionKey}-s${Date.now()}`
          }
        ]
      }

      if (nextQueue.length === 0) {
        setSessionStatus('completed')
      }

      return nextQueue
    })
  }

  const handleRestartSession = () => {
    if (words.length === 0 || !sessionTopic) return
    startLearningSession(sessionTopic, words)
  }

  const handleSaveCurrentWord = () => {
    if (currentWord) {
      handleSaveWord(currentWord)
    }
  }

  const sessionStatusLabel = {
    idle: 'Chưa bắt đầu',
    learning: 'Đang học',
    completed: 'Hoàn thành',
    empty: 'Không có dữ liệu'
  }

  const playAudio = (audioUrl) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl)
      audio.play().catch(err => console.error('Error playing audio:', err))
    }
  }

  const currentTopic = customTopic.trim() || selectedTopic || sessionTopic
  const infoCards = [
    { label: 'Từ đã đồng bộ', value: savedWords.size, hint: 'Google Sheets' },
    { label: 'Nguồn dữ liệu', value: 'Datamuse + DictionaryAPI', hint: 'Realtime' },
    { label: 'Bộ nhớ tạm', value: `${words.length || 0} từ`, hint: 'Phiên hiện tại' }
  ]

  return (
    <>
      <Head>
        <title>Học Từ Vựng Theo Chủ Đề - Financial Management</title>
      </Head>

      <div className="relative min-h-screen bg-[#020617] text-white">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-indigo-500/30 blur-[150px]" />
          <div className="absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full bg-blue-500/20 blur-[160px]" />
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
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-white/60">Topic explorer</p>
                  <h1 className="mt-2 text-3xl font-bold">📖 Học từ vựng theo lĩnh vực</h1>
                  <p className="mt-2 text-white/70">
                    Đưa bối cảnh tài chính vào hành trình học ngôn ngữ. Chọn chủ đề, nhận danh sách song ngữ và lưu về dashboard tài chính.
                  </p>
                </div>
                <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70">
                  Tối ưu khái niệm
                </span>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {PREDEFINED_TOPICS.map((topic) => {
                  const isActive = selectedTopic === topic.name
                  return (
                    <button
                      key={topic.name}
                      onClick={() => handleTopicSelect(topic.name)}
                      className={`rounded-2xl border px-4 py-3 text-left transition-all ${
                        isActive
                          ? 'border-indigo-400/60 bg-indigo-500/20 shadow-lg shadow-indigo-900/40'
                          : 'border-white/10 bg-white/5 hover:border-white/40'
                      }`}
                    >
                      <span className="text-2xl">{topic.icon}</span>
                      <p className="mt-2 text-sm font-semibold text-white">{topic.label}</p>
                      <p className="text-xs uppercase tracking-[0.3em] text-white/50">{topic.name}</p>
                    </button>
                  )
                })}
              </div>

              <div className="mt-6 space-y-3">
                <label className="text-xs uppercase tracking-[0.4em] text-white/50">
                  Hoặc nhập chủ đề tùy chỉnh
                </label>
                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="flex-1 rounded-2xl border border-white/10 bg-[#050b1e] px-5 py-4 shadow-inner shadow-black/40 focus-within:border-indigo-400">
                    <input
                      type="text"
                      value={customTopic}
                      onChange={handleCustomTopicChange}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleCustomTopicSubmit()
                        }
                      }}
                      placeholder="Ví dụ: fintech, blockchain, marketing..."
                      className="w-full bg-transparent text-white placeholder-white/40 focus:outline-none"
                      disabled={loading}
                    />
                  </div>
                  <button
                    onClick={handleCustomTopicSubmit}
                    disabled={loading || !customTopic.trim()}
                    className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-8 py-4 text-sm font-semibold shadow-lg shadow-indigo-900/40 transition hover:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
                  >
                    {loading ? 'Đang tải...' : '✨ Tạo danh sách'}
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/40">
                  {SESSION_WORD_LIMITS.map(limit => {
                    const isSelected = wordLimit === limit
                    return (
                      <button
                        key={limit}
                        onClick={() => setWordLimit(limit)}
                        disabled={loading}
                        className={`rounded-full border px-3 py-1 transition ${
                          isSelected
                            ? 'border-indigo-400/60 bg-indigo-500/20 text-white'
                            : 'border-white/10 bg-transparent text-white/60 hover:border-white/40'
                        } disabled:opacity-40`}
                      >
                        {limit} từ
                      </button>
                    )
                  })}
                </div>
                {currentTopic && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
                    <span className="font-semibold text-white">Chủ đề: </span>
                    {currentTopic}
                  </div>
                )}
                {error && !words.length && (
                  <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                    {error}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-white/10 bg-[#050b1e]/80 p-6 shadow-lg shadow-black/40">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-white/50">Phiên học</p>
                    <h2 className="text-xl font-bold text-white">
                      {sessionTopic ? `Chủ đề "${sessionTopic}"` : 'Chưa có chủ đề'}
                    </h2>
                  </div>
                  <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70">
                    {sessionStatusLabel[sessionStatus]}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/40">
                    <span>Tiến độ</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-white">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/70">Đã nhớ</p>
                    <p className="text-2xl font-bold">{sessionStats.mastered}</p>
                  </div>
                  <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-3 text-sm text-white">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/70">Cần ôn</p>
                    <p className="text-2xl font-bold">{sessionStats.reviewing}</p>
                  </div>
                  <div className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-3 text-sm text-white">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/70">Còn lại</p>
                    <p className="text-2xl font-bold">{remainingWords}</p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                  {loading && (
                    <p className="text-sm text-white/70">Đang tạo danh sách từ vựng...</p>
                  )}

                  {!loading && currentWord && sessionStatus !== 'completed' && (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Từ hiện tại</p>
                          <h3 className="mt-1 text-2xl font-bold text-white">{currentWord.word}</h3>
                          {currentWord.phonetic && (
                            <p className="text-sm text-white/60 italic">{currentWord.phonetic}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {currentWord.audioUS && (
                            <button
                              onClick={() => playAudio(currentWord.audioUS)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/5 text-white transition hover:bg-white/20"
                              title="Phát âm US"
                            >
                              🔊
                            </button>
                          )}
                          {currentWord.audioUK && (
                            <button
                              onClick={() => playAudio(currentWord.audioUK)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/5 text-white transition hover:bg-white/20"
                              title="Phát âm UK"
                            >
                              🔊
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 space-y-3 text-sm text-white/80">
                        <p>{currentWord.definition || currentWord.simpleMeaning || currentWord.word}</p>
                        {currentWord.example && (
                          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs italic text-white/70">
                            &ldquo;{currentWord.example}&rdquo;
                          </div>
                        )}
                        {(currentWord.definitionEN || currentWord.exampleEN) && (
                          <details className="rounded-xl border border-white/10 bg-[#050b1e] px-3 py-2 text-xs text-white/60">
                            <summary className="cursor-pointer text-white">Xem tiếng Anh</summary>
                            {currentWord.definitionEN && <p className="mt-2">{currentWord.definitionEN}</p>}
                            {currentWord.exampleEN && (
                              <p className="mt-2 italic text-white/70">&ldquo;{currentWord.exampleEN}&rdquo;</p>
                            )}
                          </details>
                        )}
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <button
                          onClick={() => handleSessionAction('mastered')}
                          className="rounded-2xl bg-gradient-to-r from-emerald-500 to-lime-400 px-4 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-emerald-900/30 transition hover:translate-y-0.5"
                        >
                          ✅ Đã nhớ
                        </button>
                        <button
                          onClick={() => handleSessionAction('review')}
                          className="rounded-2xl border border-amber-400/60 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-100 transition hover:border-amber-300"
                        >
                          🔁 Cần ôn
                        </button>
                        <button
                          onClick={() => handleSessionAction('skip')}
                          className="rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/40"
                        >
                          ⏭️ Bỏ qua
                        </button>
                      </div>

                      <button
                        onClick={handleSaveCurrentWord}
                        disabled={savingWords.has(currentWord.word) || savedWords.has(currentWord.word)}
                        className="mt-4 w-full rounded-2xl border border-cyan-400/50 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-900/30 transition hover:border-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {savingWords.has(currentWord.word)
                          ? 'Đang lưu...'
                          : savedWords.has(currentWord.word)
                            ? '✓ Đã đồng bộ'
                            : '💾 Lưu vào kho từ'}
                      </button>
                    </>
                  )}

                  {!loading && !currentWord && sessionStatus === 'completed' && (
                    <div className="text-center text-sm text-white/70">
                      <p className="font-semibold text-white">🎉 Đã hoàn thành phiên học!</p>
                      <p className="mt-1">Bạn có thể tạo danh sách mới hoặc ôn lại danh sách hiện tại.</p>
                      <div className="mt-4 flex flex-wrap justify-center gap-3">
                        <button
                          onClick={handleRestartSession}
                          className="rounded-2xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40"
                        >
                          🔁 Ôn lại danh sách
                        </button>
                        <button
                          onClick={() => fetchTopicWords(sessionTopic || selectedTopic || customTopic, { autoStart: true })}
                          className="rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40"
                        >
                          🔀 Tạo danh sách mới
                        </button>
                      </div>
                    </div>
                  )}

                  {!loading && sessionStatus === 'idle' && (
                    <p className="text-sm text-white/70">
                      Chọn một chủ đề hoặc nhập lĩnh vực tùy chỉnh để bắt đầu phiên học tự động.
                    </p>
                  )}

                  {!loading && sessionStatus === 'empty' && (
                    <p className="text-sm text-white/70">
                      Không có dữ liệu cho chủ đề này. Hãy thử một lĩnh vực khác hoặc rút gọn từ khóa.
                    </p>
                  )}
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {infoCards.map((card) => (
                    <div
                      key={card.label}
                      className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/30"
                    >
                      <p className="text-xs uppercase tracking-[0.3em] text-white/50">{card.hint}</p>
                      <p className="mt-1 text-sm text-white/70">{card.label}</p>
                      <p className="text-2xl font-bold text-white">{card.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent p-5 text-sm text-white/80">
                <p className="font-semibold">🎯 Ghi nhớ chủ đề</p>
                <p className="mt-2 text-white/70">
                  Mỗi từ lưu sẽ được liên kết với kế hoạch chi tiêu, giúp bạn vừa học ngoại ngữ vừa hiểu sâu bối cảnh tài chính.
                </p>
                {sessionHistory.length > 0 && (
                  <p className="mt-2 text-xs uppercase tracking-[0.3em] text-white/50">
                    Đã tương tác {sessionHistory.length} từ trong phiên này
                  </p>
                )}
              </div>
            </div>
          </section>

          {words.length > 0 && (
            <section className="mt-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-white/60">Kho từ đã tạo</p>
                  <h2 className="text-2xl font-bold text-white">
                    {words.length} từ vựng về &ldquo;{sessionTopic || currentTopic}&rdquo;
                  </h2>
                </div>
                <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs text-white/60">
                  {wordLimit} từ / phiên
                </span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {words.map((wordData, index) => {
                  const isExpanded = expandedWord === wordData.word
                  const isSaved = savedWords.has(wordData.word)
                  const isSaving = savingWords.has(wordData.word)

                  return (
                    <div
                      key={`${wordData.word}-${index}`}
                      className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/30 transition hover:border-white/30"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Từ khóa</p>
                          <h3 className="text-xl font-bold text-white">{wordData.word}</h3>
                          {wordData.phonetic && (
                            <p className="text-sm text-white/60 italic">{wordData.phonetic}</p>
                          )}
                          {wordData.partOfSpeech && (
                            <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-indigo-200">
                              {wordData.partOfSpeech}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {wordData.audioUS && (
                            <button
                              onClick={() => playAudio(wordData.audioUS)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/5 text-white transition hover:bg-white/20"
                              title="Phát âm US"
                            >
                              🔊
                            </button>
                          )}
                          {wordData.audioUK && (
                            <button
                              onClick={() => playAudio(wordData.audioUK)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/5 text-white transition hover:bg-white/20"
                              title="Phát âm UK"
                            >
                              🔊
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 space-y-3 text-sm text-white/80">
                        <p>{wordData.definition || wordData.simpleMeaning || wordData.word}</p>

                        {wordData.example && (
                          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs italic text-white/70">
                            &ldquo;{wordData.example}&rdquo;
                            {wordData.exampleEN && isExpanded && (
                              <p className="mt-1 text-white/60">&ldquo;{wordData.exampleEN}&rdquo;</p>
                            )}
                          </div>
                        )}

                        {(wordData.definitionEN || wordData.exampleEN) && (
                          <button
                            onClick={() => setExpandedWord(isExpanded ? null : wordData.word)}
                            className="text-xs font-semibold text-indigo-200 hover:text-white"
                          >
                            {isExpanded ? 'Ẩn tiếng Anh' : 'Hiển thị tiếng Anh'}
                          </button>
                        )}

                        {wordData.definitionEN && isExpanded && (
                          <div className="rounded-xl border border-white/10 bg-[#050b1e] px-3 py-2 text-xs text-white/70">
                            {wordData.definitionEN}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleSaveWord(wordData)}
                        disabled={isSaving || isSaved}
                        className="mt-4 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-lime-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-emerald-900/30 transition hover:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSaving ? 'Đang lưu...' : isSaved ? '✓ Đã đồng bộ' : '💾 Lưu từ vựng'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {loading && (
            <div className="mt-10 text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-indigo-500" />
              <p className="mt-4 text-sm text-white/60">Đang tải từ vựng...</p>
            </div>
          )}
        </main>
      </div>
    </>
  )
}
