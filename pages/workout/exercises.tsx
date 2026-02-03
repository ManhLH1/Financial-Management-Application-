import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useExerciseStore } from '../../store/useExerciseStore'
import ExerciseCard from '../../components/workout/ExerciseCard'
import ExerciseForm from '../../components/workout/ExerciseForm'
import WorkoutHeader from '../../components/workout/WorkoutHeader'
import type { Exercise } from '../../types/exercise'
import { MUSCLE_GROUPS } from '../../types/exercise'

export default function ExercisesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { exercises, setExercises, addExercise, updateExercise, deleteExercise, setLoading } = useExerciseStore()
  const [showForm, setShowForm] = useState(false)
  const [editingExercise, setEditingExercise] = useState<Exercise | undefined>()
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('')
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
      loadExercises()
    }
  }, [session])

  const loadExercises = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/exercises')
      if (res.ok) {
        const data = await res.json()
        setExercises(data)
      }
    } catch (error) {
      console.error('Error loading exercises:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (exerciseData: Omit<Exercise, 'id' | 'created_at'>) => {
    try {
      if (editingExercise) {
        const res = await fetch(`/api/exercises/${editingExercise.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(exerciseData)
        })
        if (res.ok) {
          updateExercise(editingExercise.id, exerciseData)
          setEditingExercise(undefined)
          setShowForm(false)
        }
      } else {
        const res = await fetch('/api/exercises', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(exerciseData)
        })
        if (res.ok) {
          const newExercise = await res.json()
          addExercise(newExercise)
          setShowForm(false)
        }
      }
    } catch (error) {
      console.error('Error saving exercise:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa bài tập này?')) return

    try {
      const res = await fetch(`/api/exercises/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        deleteExercise(id)
      }
    } catch (error) {
      console.error('Error deleting exercise:', error)
    }
  }

  const filteredExercises = selectedMuscleGroup
    ? exercises.filter(e => e.muscle_group === selectedMuscleGroup)
    : exercises

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
            Quản lý bài tập
          </h1>
          <button
            onClick={() => {
              setEditingExercise(undefined)
              setShowForm(true)
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            + Thêm bài tập
          </button>
        </div>

        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {editingExercise ? 'Sửa bài tập' : 'Thêm bài tập mới'}
            </h2>
            <ExerciseForm
              exercise={editingExercise}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false)
                setEditingExercise(undefined)
              }}
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Lọc theo nhóm cơ
          </label>
          <select
            value={selectedMuscleGroup}
            onChange={(e) => setSelectedMuscleGroup(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">Tất cả</option>
            {MUSCLE_GROUPS.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExercises.map(exercise => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onEdit={() => {
                setEditingExercise(exercise)
                setShowForm(true)
              }}
              onDelete={() => handleDelete(exercise.id)}
            />
          ))}
        </div>

        {filteredExercises.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {selectedMuscleGroup ? 'Không có bài tập nào trong nhóm cơ này' : 'Chưa có bài tập nào'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

