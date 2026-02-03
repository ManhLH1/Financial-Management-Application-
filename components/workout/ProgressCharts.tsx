import React from 'react'
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import type { WorkoutStatistics } from '../../types/workout'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface ProgressChartsProps {
  statistics: WorkoutStatistics
}

export default function ProgressCharts({ statistics }: ProgressChartsProps) {
  const weeklyVolumeData = {
    labels: statistics.weekly_volume.map(v => {
      const date = new Date(v.week)
      return `${date.getDate()}/${date.getMonth() + 1}`
    }),
    datasets: [
      {
        label: 'Khối lượng (kg)',
        data: statistics.weekly_volume.map(v => v.volume),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }
    ]
  }

  const trainingFrequencyData = {
    labels: statistics.training_frequency.map(f => {
      const date = new Date(f.week)
      return `${date.getDate()}/${date.getMonth() + 1}`
    }),
    datasets: [
      {
        label: 'Số buổi tập',
        data: statistics.training_frequency.map(f => f.sessions),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Khối lượng theo tuần
        </h3>
        <div style={{ height: '300px' }}>
          <Line data={weeklyVolumeData} options={chartOptions} />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Tần suất tập luyện
        </h3>
        <div style={{ height: '300px' }}>
          <Bar data={trainingFrequencyData} options={chartOptions} />
        </div>
      </div>

      {statistics.prs.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Kỷ lục cá nhân (PR)
          </h3>
          <div className="space-y-2">
            {statistics.prs.map((pr, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded"
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {pr.exercise_name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(pr.date).toLocaleDateString('vi-VN')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-blue-600 dark:text-blue-400">
                    {pr.max_weight}kg × {pr.max_reps} lần
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

