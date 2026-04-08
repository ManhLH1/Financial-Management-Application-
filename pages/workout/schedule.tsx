import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useWorkoutStore } from '../../store/useWorkoutStore'
import { useExerciseStore } from '../../store/useExerciseStore'
import DaySchedule from '../../components/workout/DaySchedule'
import WorkoutHeader from '../../components/workout/WorkoutHeader'
import type { WorkoutDay, WorkoutItem } from '../../types/workout'
import { DAYS_OF_WEEK } from '../../types/workout'
import { v4 as uuidv4 } from 'uuid'

export default function WorkoutSchedulePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { workoutDays, setWorkoutDays, addWorkoutDay } = useWorkoutStore()
  const { exercises, setExercises } = useExerciseStore()
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)
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
    if (session) {
      loadData()
    }
  }, [session])

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const loadData = async () => {
    try {
      setLoading(true)
      const [weekRes, exercisesRes] = await Promise.all([
        fetch('/api/workout/week'),
        fetch('/api/exercises')
      ])

      if (weekRes.ok) {
        const weekData = await weekRes.json()
        setWorkoutDays(weekData)
      }

      if (exercisesRes.ok) {
        const exercisesData = await exercisesRes.json()
        setExercises(exercisesData)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
      setInitialized(true)
    }
  }

  const handleAddDay = async (dayOfWeek: number) => {
    try {
      const res = await fetch('/api/workout/week', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day_of_week: dayOfWeek })
      })
      if (res.ok) {
        const newDay = await res.json()
        addWorkoutDay(newDay)
      }
    } catch (error) {
      console.error('Error adding day:', error)
    }
  }

  const handleAddItem = async (dayId: string, item: Omit<WorkoutItem, 'id' | 'created_at'>) => {
    try {
      const res = await fetch('/api/workout/item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, day_id: dayId })
      })
      if (res.ok) {
        const newItem = await res.json()
        // Reload week data to get updated items
        loadData()
      }
    } catch (error) {
      console.error('Error adding item:', error)
    }
  }

  const handleUpdateItem = async (itemId: string, updates: Partial<WorkoutItem>) => {
    try {
      const res = await fetch(`/api/workout/item/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (res.ok) {
        loadData()
      }
    } catch (error) {
      console.error('Error updating item:', error)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Bạn có chắc muốn xóa bài tập này khỏi lịch?')) return

    try {
      const res = await fetch(`/api/workout/item/${itemId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        loadData()
      }
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  // Create days for all 7 days of week
  const allDays = DAYS_OF_WEEK.map((dayName, index) => {
    const dayOfWeek = index + 1
    const existingDay = workoutDays.find(d => d.day_of_week === dayOfWeek)
    return existingDay || { day_of_week: dayOfWeek, id: '', user_id: '', created_at: '' }
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

        {!initialized ? (
          <div className="flex justify-center items-center py-16 text-lg text-gray-600 dark:text-gray-300">
            Đang tải dữ liệu...
          </div>
        ) : (
          <>
            {loading && (
              <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                Đang đồng bộ lịch tập...
              </div>
            )}
            {allDays.map((day, index) => {
              const dayName = DAYS_OF_WEEK[index]
              const hasSchedule = workoutDays.some(d => d.day_of_week === day.day_of_week)

              if (!hasSchedule) {
                return (
                  <div
                    key={day.day_of_week}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {dayName}
                      </h3>
                      <button
                        onClick={() => handleAddDay(day.day_of_week)}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                      >
                        Tạo lịch tập
                      </button>
                    </div>
                  </div>
                )
              }

              const fullDay = workoutDays.find(d => d.day_of_week === day.day_of_week)!
              return (
                <DaySchedule
                  key={fullDay.id}
                  day={fullDay}
                  exercises={exercises}
                  onAddItem={handleAddItem}
                  onUpdateItem={handleUpdateItem}
                  onDeleteItem={handleDeleteItem}
                />
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}

