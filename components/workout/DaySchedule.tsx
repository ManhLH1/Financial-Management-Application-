import React, { useState } from 'react'
import type { WorkoutDay, WorkoutItem } from '../../types/workout'
import type { Exercise } from '../../types/exercise'
import { DAYS_OF_WEEK } from '../../types/workout'

interface DayScheduleProps {
  day: WorkoutDay & { items?: WorkoutItem[] }
  exercises: Exercise[]
  onAddItem: (dayId: string, item: Omit<WorkoutItem, 'id' | 'created_at'>) => void
  onUpdateItem: (itemId: string, updates: Partial<WorkoutItem>) => void
  onDeleteItem: (itemId: string) => void
}

export default function DaySchedule({
  day,
  exercises,
  onAddItem,
  onUpdateItem,
  onDeleteItem
}: DayScheduleProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItem, setNewItem] = useState({
    exercise_id: '',
    target_sets: 3,
    target_reps: 10,
    target_weight: '',
    target_duration: ''
  })

  const handleAddItem = () => {
    if (!newItem.exercise_id) return

    onAddItem(day.id, {
      day_id: day.id,
      exercise_id: newItem.exercise_id,
      target_sets: newItem.target_sets,
      target_reps: newItem.target_reps,
      target_weight: newItem.target_weight ? Number(newItem.target_weight) : undefined,
      target_duration: newItem.target_duration ? Number(newItem.target_duration) : undefined
    })

    setNewItem({
      exercise_id: '',
      target_sets: 3,
      target_reps: 10,
      target_weight: '',
      target_duration: ''
    })
    setShowAddForm(false)
  }

  const dayName = DAYS_OF_WEEK[day.day_of_week - 1] || `Ngày ${day.day_of_week}`

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {dayName}
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          {showAddForm ? 'Hủy' : '+ Thêm bài tập'}
        </button>
      </div>

      {showAddForm && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <select
              value={newItem.exercise_id}
              onChange={(e) => setNewItem({ ...newItem, exercise_id: e.target.value })}
              className="col-span-2 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="">Chọn bài tập</option>
              {exercises.map(ex => (
                <option key={ex.id} value={ex.id}>{ex.name}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Số hiệp"
              value={newItem.target_sets}
              onChange={(e) => setNewItem({ ...newItem, target_sets: Number(e.target.value) })}
              className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            />
            <input
              type="number"
              placeholder="Số lần lặp"
              value={newItem.target_reps}
              onChange={(e) => setNewItem({ ...newItem, target_reps: Number(e.target.value) })}
              className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            />
            <input
              type="number"
              placeholder="Mức tạ (kg)"
              value={newItem.target_weight}
              onChange={(e) => setNewItem({ ...newItem, target_weight: e.target.value })}
              className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            />
            <input
              type="number"
              placeholder="Thời gian (giây)"
              value={newItem.target_duration}
              onChange={(e) => setNewItem({ ...newItem, target_duration: e.target.value })}
              className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            />
          </div>
          <button
            onClick={handleAddItem}
            className="w-full px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
          >
            Thêm
          </button>
        </div>
      )}

      <div className="space-y-2">
        {day.items && day.items.length > 0 ? (
          day.items.map((item) => {
            const exercise = exercises.find(e => e.id === item.exercise_id)
            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {exercise?.name || 'Không xác định'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {item.target_sets} hiệp × {item.target_reps} lần
                    {item.target_weight && ` @ ${item.target_weight}kg`}
                    {item.target_duration && ` (${item.target_duration}s)`}
                  </div>
                </div>
                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                >
                  Xóa
                </button>
              </div>
            )
          })
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
            Chưa có bài tập nào
          </p>
        )}
      </div>
    </div>
  )
}

