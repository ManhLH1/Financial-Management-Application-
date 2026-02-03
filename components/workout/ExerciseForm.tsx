import React, { useState, useEffect } from 'react'
import type { Exercise } from '../../types/exercise'
import { MUSCLE_GROUPS, EQUIPMENT_TYPES, EXERCISE_LEVELS } from '../../types/exercise'
import { getMuscleGroupLabel, getEquipmentLabel, getLevelLabel } from '../../lib/workoutLabels'

interface ExerciseFormProps {
  exercise?: Exercise
  onSubmit: (exercise: Omit<Exercise, 'id' | 'created_at'>) => void
  onCancel: () => void
}

export default function ExerciseForm({ exercise, onSubmit, onCancel }: ExerciseFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    muscle_group: '',
    level: 'Beginner' as Exercise['level'],
    equipment: 'Other' as Exercise['equipment'],
    media_url: '',
    description: '',
    mistakes: ''
  })

  useEffect(() => {
    if (exercise) {
      setFormData({
        name: exercise.name,
        muscle_group: exercise.muscle_group,
        level: exercise.level,
        equipment: exercise.equipment,
        media_url: exercise.media_url || '',
        description: exercise.description || '',
        mistakes: exercise.mistakes || ''
      })
    }
  }, [exercise])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      media_url: formData.media_url || undefined,
      description: formData.description || undefined,
      mistakes: formData.mistakes || undefined
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Tên bài tập *
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nhóm cơ *
        </label>
        <select
          required
          value={formData.muscle_group}
          onChange={(e) => setFormData({ ...formData, muscle_group: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="">Chọn nhóm cơ</option>
          {MUSCLE_GROUPS.map(group => (
            <option key={group} value={group}>{getMuscleGroupLabel(group)}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Cấp độ *
          </label>
          <select
            required
            value={formData.level}
            onChange={(e) => setFormData({ ...formData, level: e.target.value as Exercise['level'] })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {EXERCISE_LEVELS.map(level => (
              <option key={level} value={level}>{getLevelLabel(level)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Thiết bị *
          </label>
          <select
            required
            value={formData.equipment}
            onChange={(e) => setFormData({ ...formData, equipment: e.target.value as Exercise['equipment'] })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {EQUIPMENT_TYPES.map(type => (
              <option key={type} value={type}>{getEquipmentLabel(type)}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          URL hình/video
        </label>
        <input
          type="url"
          value={formData.media_url}
          onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Mô tả kỹ thuật
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Lỗi thường gặp
        </label>
        <textarea
          value={formData.mistakes}
          onChange={(e) => setFormData({ ...formData, mistakes: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          {exercise ? 'Cập nhật' : 'Tạo mới'}
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

