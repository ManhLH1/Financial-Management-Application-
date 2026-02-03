export interface Exercise {
  id: string
  name: string
  muscle_group: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  equipment: 'Machine' | 'Dumbbell' | 'Barbell' | 'Cable' | 'Bodyweight' | 'Other'
  media_url?: string
  description?: string
  mistakes?: string
  created_at: string
}

export const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Shoulders',
  'Legs',
  'Arms',
  'Core',
  'Full Body'
] as const

export const EQUIPMENT_TYPES = [
  'Machine',
  'Dumbbell',
  'Barbell',
  'Cable',
  'Bodyweight',
  'Other'
] as const

export const EXERCISE_LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced'
] as const

