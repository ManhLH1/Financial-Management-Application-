export interface WorkoutDay {
  id: string
  user_id: string
  day_of_week: number // 1-7 (Monday = 1, Sunday = 7)
  note?: string
  created_at: string
}

export interface WorkoutItem {
  id: string
  day_id: string
  exercise_id: string
  target_sets: number
  target_reps: number
  target_weight?: number
  target_duration?: number // For cardio (in seconds)
  created_at: string
}

export interface WorkoutLog {
  id: string
  user_id: string
  exercise_id: string
  date: string // ISO date
  actual_sets: number
  actual_reps: number
  actual_weight?: number
  actual_duration?: number // For cardio
  rating: number // 1-5
  note?: string
  created_at: string
}

export interface WorkoutStatistics {
  total_sessions: number
  sessions_this_week: number
  volume_this_week: number // Total kg lifted
  prs: Array<{
    exercise_id: string
    exercise_name: string
    max_weight: number
    max_reps: number
    date: string
  }>
  weekly_volume: Array<{
    week: string
    volume: number
  }>
  training_frequency: Array<{
    week: string
    sessions: number
  }>
}

export const DAYS_OF_WEEK = [
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
  'Chủ nhật'
] as const

