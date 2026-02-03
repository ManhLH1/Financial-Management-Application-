import { create } from 'zustand'
import type { WorkoutDay, WorkoutItem, WorkoutLog, WorkoutStatistics } from '../types/workout'

interface WorkoutState {
  workoutDays: WorkoutDay[]
  workoutItems: Record<string, WorkoutItem[]> // day_id -> items
  workoutLogs: WorkoutLog[]
  statistics: WorkoutStatistics | null
  loading: boolean
  error: string | null
  
  // Actions
  setWorkoutDays: (days: WorkoutDay[]) => void
  addWorkoutDay: (day: WorkoutDay) => void
  setWorkoutItems: (dayId: string, items: WorkoutItem[]) => void
  addWorkoutItem: (item: WorkoutItem) => void
  updateWorkoutItem: (id: string, updates: Partial<WorkoutItem>) => void
  deleteWorkoutItem: (id: string) => void
  setWorkoutLogs: (logs: WorkoutLog[]) => void
  addWorkoutLog: (log: WorkoutLog) => void
  setStatistics: (stats: WorkoutStatistics) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useWorkoutStore = create<WorkoutState>((set) => ({
  workoutDays: [],
  workoutItems: {},
  workoutLogs: [],
  statistics: null,
  loading: false,
  error: null,
  
  setWorkoutDays: (days) => set({ workoutDays: days }),
  addWorkoutDay: (day) => set((state) => ({
    workoutDays: [...state.workoutDays, day]
  })),
  setWorkoutItems: (dayId, items) => set((state) => ({
    workoutItems: { ...state.workoutItems, [dayId]: items }
  })),
  addWorkoutItem: (item) => set((state) => ({
    workoutItems: {
      ...state.workoutItems,
      [item.day_id]: [...(state.workoutItems[item.day_id] || []), item]
    }
  })),
  updateWorkoutItem: (id, updates) => set((state) => {
    const newItems = { ...state.workoutItems }
    Object.keys(newItems).forEach(dayId => {
      newItems[dayId] = newItems[dayId].map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    })
    return { workoutItems: newItems }
  }),
  deleteWorkoutItem: (id) => set((state) => {
    const newItems = { ...state.workoutItems }
    Object.keys(newItems).forEach(dayId => {
      newItems[dayId] = newItems[dayId].filter(item => item.id !== id)
    })
    return { workoutItems: newItems }
  }),
  setWorkoutLogs: (logs) => set({ workoutLogs: logs }),
  addWorkoutLog: (log) => set((state) => ({
    workoutLogs: [...state.workoutLogs, log]
  })),
  setStatistics: (stats) => set({ statistics: stats }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error })
}))

