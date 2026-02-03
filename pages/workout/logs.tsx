import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useWorkoutStore } from '../../store/useWorkoutStore'
import { useExerciseStore } from '../../store/useExerciseStore'
import LogForm from '../../components/workout/LogForm'
import WorkoutHeader from '../../components/workout/WorkoutHeader'
import type { WorkoutLog } from '../../types/workout'

export default function WorkoutLogsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { workoutLogs, setWorkoutLogs, addWorkoutLog } = useWorkoutStore()
  const { exercises, setExercises } = useExerciseStore()
  const [showForm, setShowForm] = useState(false)
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('')
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode')
      return saved ? JSON.parse(saved) : true
    }
    return true
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth')
    }
  }, [status, router])

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  useEffect(() => {
    if (session?.accessToken) {
      loadData()
    }
  }, [session])

  const loadData = async () => {
    try {
      const [logsRes, exercisesRes] = await Promise.all([
        fetch('/api/workout/log'),
        fetch('/api/exercises')
      ])

      if (logsRes.ok) {
        const logsData = await logsRes.json()
        setWorkoutLogs(logsData)
      }

      if (exercisesRes.ok) {
        const exercisesData = await exercisesRes.json()
        setExercises(exercisesData)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const handleSubmit = async (logData: Omit<WorkoutLog, 'id' | 'user_id' | 'created_at'>) => {
    try {
      const res = await fetch('/api/workout/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData)
      })
      if (res.ok) {
        const newLog = await res.json()
        addWorkoutLog(newLog)
        setShowForm(false)
        loadData() // Reload to get all logs
      }
    } catch (error) {
      console.error('Error saving log:', error)
    }
  }

  const filteredLogs = selectedExerciseId
    ? workoutLogs.filter(log => log.exercise_id === selectedExerciseId)
    : workoutLogs

  const sortedLogs = [...filteredLogs].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Đang tải...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? 'bg-[#020617] text-slate-200' : 'bg-gray-50 text-slate-900'}`}>
      <div className="max-w-7xl mx-auto p-4">
        <WorkoutHeader darkMode={darkMode} />
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Nhật ký luyện tập
          </h1>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            + Thêm nhật ký
          </button>
        </div>

        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Ghi log tập luyện
            </h2>
            <LogForm
              exercises={exercises}
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Lọc theo bài tập
          </label>
          <select
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">Tất cả</option>
            {exercises.map(ex => (
              <option key={ex.id} value={ex.id}>{ex.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          {sortedLogs.map(log => {
            const exercise = exercises.find(e => e.id === log.exercise_id)
            return (
              <div
                key={log.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {exercise?.name || 'Không xác định'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(log.date).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <span
                        key={rating}
                        className={`text-lg ${
                          rating <= log.rating
                            ? 'text-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {log.actual_sets} sets × {log.actual_reps} reps
                  {log.actual_weight && ` @ ${log.actual_weight}kg`}
                  {log.actual_duration && ` (${log.actual_duration}s)`}
                </div>

                {log.note && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                    {log.note}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {sortedLogs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {selectedExerciseId ? 'Chưa có log nào cho bài tập này' : 'Chưa có log nào'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

