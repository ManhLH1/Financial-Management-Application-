import { z } from 'zod'

export const exerciseSchema = z.object({
  name: z.string().min(1, 'Tên bài tập không được để trống'),
  muscle_group: z.string().min(1, 'Vui lòng chọn nhóm cơ'),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  equipment: z.enum(['Machine', 'Dumbbell', 'Barbell', 'Cable', 'Bodyweight', 'Other']),
  media_url: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  mistakes: z.string().optional()
})

export const workoutDaySchema = z.object({
  day_of_week: z.number().min(1).max(7),
  note: z.string().optional()
})

export const workoutItemSchema = z.object({
  exercise_id: z.string().min(1, 'Vui lòng chọn bài tập'),
  target_sets: z.number().min(1, 'Số sets phải lớn hơn 0'),
  target_reps: z.number().min(1, 'Số reps phải lớn hơn 0'),
  target_weight: z.number().optional(),
  target_duration: z.number().optional()
})

export const workoutLogSchema = z.object({
  exercise_id: z.string().min(1, 'Vui lòng chọn bài tập'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày không hợp lệ'),
  actual_sets: z.number().min(1, 'Số sets phải lớn hơn 0'),
  actual_reps: z.number().min(1, 'Số reps phải lớn hơn 0'),
  actual_weight: z.number().optional(),
  actual_duration: z.number().optional(),
  rating: z.number().min(1).max(5, 'Rating từ 1-5'),
  note: z.string().optional()
})

