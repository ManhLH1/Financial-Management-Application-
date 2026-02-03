import React, { useState } from 'react'
import type { Exercise } from '../../types/exercise'
import type { WorkoutLog } from '../../types/workout'

interface LogFormProps {
  exercises: Exercise[]
  onSubmit: (log: Omit<WorkoutLog, 'id' | 'user_id' | 'created_at'>) => void
  onCancel: () => void
}

export default function LogForm({ exercises, onSubmit, onCancel }: LogFormProps) {
  const [formData, setFormData] = useState({
    exercise_id: '',
    date: new Date().toISOString().split('T')[0],
    actual_sets: 3,
    actual_reps: 10,
    actual_weight: '',
    actual_duration: '',
    rating: 3,
    note: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      exercise_id: formData.exercise_id,
      date: formData.date,
      actual_sets: formData.actual_sets,
      actual_reps: formData.actual_reps,
      actual_weight: formData.actual_weight ? Number(formData.actual_weight) : undefined,
      actual_duration: formData.actual_duration ? Number(formData.actual_duration) : undefined,
      rating: formData.rating,
      note: formData.note || undefined
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Bài tập *
        </label>
        <select
          required
          value={formData.exercise_id}
          onChange={(e) => setFormData({ ...formData, exercise_id: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="">Chọn bài tập</option>
          {exercises.map(ex => (
            <option key={ex.id} value={ex.id}>{ex.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Ngày tập *
        </label>
        <input
          type="date"
          required
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Số hiệp *
          </label>
          <input
            type="number"
            required
            min="1"
            value={formData.actual_sets}
            onChange={(e) => setFormData({ ...formData, actual_sets: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Số lần lặp *
          </label>
          <input
            type="number"
            required
            min="1"
            value={formData.actual_reps}
            onChange={(e) => setFormData({ ...formData, actual_reps: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Mức tạ (kg)
          </label>
          <input
            type="number"
            min="0"
            step="0.5"
            value={formData.actual_weight}
            onChange={(e) => setFormData({ ...formData, actual_weight: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Thời gian (giây)
          </label>
          <input
            type="number"
            min="0"
            value={formData.actual_duration}
            onChange={(e) => setFormData({ ...formData, actual_duration: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Đánh giá (1-5) *
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(rating => (
            <button
              key={rating}
              type="button"
              onClick={() => setFormData({ ...formData, rating })}
              className={`flex-1 py-2 rounded ${
                formData.rating === rating
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {rating}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Ghi chú
        </label>
        <textarea
          value={formData.note}
          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Lưu nhật ký
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-700"
        >
          Hủy
        </button>
      </div>
    </form>
  )
}

