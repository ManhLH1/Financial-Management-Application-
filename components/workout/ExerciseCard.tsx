import React from 'react'
import type { Exercise } from '../../types/exercise'
import { getMuscleGroupLabel, getEquipmentLabel, getLevelLabel } from '../../lib/workoutLabels'

interface ExerciseCardProps {
  exercise: Exercise
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export default function ExerciseCard({ exercise, onClick, onEdit, onDelete }: ExerciseCardProps) {
  const levelColors = {
    Beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    Intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    Advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {exercise.name}
        </h3>
        <span className={`px-2 py-1 rounded text-xs font-medium ${levelColors[exercise.level]}`}>
          {getLevelLabel(exercise.level)}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
          {getMuscleGroupLabel(exercise.muscle_group)}
        </span>
        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-xs">
          {getEquipmentLabel(exercise.equipment)}
        </span>
      </div>

      {exercise.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {exercise.description}
        </p>
      )}

      {exercise.media_url && (
        <div className="mb-3">
          <img
            src={exercise.media_url}
            alt={exercise.name}
            className="w-full h-32 object-cover rounded"
          />
        </div>
      )}

      {(onEdit || onDelete) && (
        <div className="flex gap-2 mt-3">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className="flex-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              Sửa
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="flex-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
            >
              Xóa
            </button>
          )}
        </div>
      )}
    </div>
  )
}

