import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useWorkoutStore } from '../../store/useWorkoutStore'
import ProgressCharts from '../../components/workout/ProgressCharts'
import WorkoutHeader from '../../components/workout/WorkoutHeader'

export default function ProgressPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { statistics, setStatistics, setLoading } = useWorkoutStore()
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
      const res = await fetch('/api/workout/statistics')
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

        {statistics ? (
          <ProgressCharts statistics={statistics} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Chưa có dữ liệu</p>
          </div>
        )}
      </div>
    </div>
  )
}

