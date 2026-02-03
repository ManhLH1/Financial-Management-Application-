import { create } from 'zustand'
import type { Exercise } from '../types/exercise'

interface ExerciseState {
  exercises: Exercise[]
  loading: boolean
  error: string | null
  setExercises: (exercises: Exercise[]) => void
  addExercise: (exercise: Exercise) => void
  updateExercise: (id: string, updates: Partial<Exercise>) => void
  deleteExercise: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useExerciseStore = create<ExerciseState>((set) => ({
  exercises: [],
  loading: false,
  error: null,
  setExercises: (exercises) => set({ exercises }),
  addExercise: (exercise) => set((state) => ({
    exercises: [...state.exercises, exercise]
  })),
  updateExercise: (id, updates) => set((state) => ({
    exercises: state.exercises.map(ex => ex.id === id ? { ...ex, ...updates } : ex)
  })),
  deleteExercise: (id) => set((state) => ({
    exercises: state.exercises.filter(ex => ex.id !== id)
  })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error })
}))

