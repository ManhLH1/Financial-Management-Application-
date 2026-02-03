import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useWorkoutStore } from '../../store/useWorkoutStore'
import { useExerciseStore } from '../../store/useExerciseStore'
import ProgressCharts from '../../components/workout/ProgressCharts'
import WorkoutHeader from '../../components/workout/WorkoutHeader'

export default function WorkoutDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { statistics, setStatistics, setLoading } = useWorkoutStore()
  const { exercises } = useExerciseStore()
  const [todayMuscleGroups, setTodayMuscleGroups] = useState<string[]>([])
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
      loadStatistics()
    }
  }, [session])

  const loadStatistics = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/workout/statistics', {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (res.ok) {
        const data = await res.json()
        setStatistics(data)
      }
    } catch (error) {
      console.error('Error loading statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get today's workout
  useEffect(() => {
    const today = new Date().getDay() // 0 = Sunday, 1 = Monday, etc.
    const dayOfWeek = today === 0 ? 7 : today // Convert to 1-7 format

    fetch('/api/workout/week')
      .then(res => res.json())
      .then(days => {
        const todayWorkout = days.find((d: any) => d.day_of_week === dayOfWeek)
        if (todayWorkout?.items) {
          const muscleGroups = new Set<string>()
          todayWorkout.items.forEach((item: any) => {
            const exercise = exercises.find(e => e.id === item.exercise_id)
            if (exercise) {
              muscleGroups.add(exercise.muscle_group)
            }
          })
          setTodayMuscleGroups(Array.from(muscleGroups))
        }
      })
      .catch(console.error)
  }, [exercises])

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Tổng số buổi tập</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {statistics?.total_sessions || 0}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Buổi tập tuần này</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {statistics?.sessions_this_week || 0}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Volume tuần này</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {statistics?.volume_this_week?.toFixed(0) || 0} kg
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Hôm nay tập nhóm cơ gì?
          </h2>
          {todayMuscleGroups.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {todayMuscleGroups.map(group => (
                <span
                  key={group}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
                >
                  {group}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Chưa có lịch tập cho hôm nay</p>
          )}
        </div>

        {statistics && <ProgressCharts statistics={statistics} />}
      </div>
    </div>
  )
}

