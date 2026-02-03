import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

interface WorkoutHeaderProps {
  darkMode?: boolean
}

const WORKOUT_NAV_ITEMS = [
  { href: '/workout/dashboard', icon: '🏋️', label: 'Tổng quan' },
  { href: '/workout/exercises', icon: '💪', label: 'Bài tập' },
  { href: '/workout/schedule', icon: '📅', label: 'Lịch tập' },
  { href: '/workout/logs', icon: '📝', label: 'Nhật ký' },
  { href: '/workout/progress', icon: '📈', label: 'Tiến độ' },
]

export default function WorkoutHeader({ darkMode = false }: WorkoutHeaderProps) {
  const router = useRouter()

  const isActive = (href: string) =>
    router.pathname === href || router.pathname.startsWith(`${href}/`)

  return (
    <div className={`mb-6 ${darkMode ? 'bg-slate-900/50' : 'bg-white'} rounded-2xl border ${darkMode ? 'border-white/10' : 'border-gray-200'} p-4`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-2xl ${darkMode
            ? 'bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/30'
            : 'bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg'
            }`}>
            🏋️
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Khu vực luyện tập
            </h1>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Quản lý bài tập, lịch tập và tiến độ
            </p>
          </div>
        </div>
        <Link
          href="/"
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${darkMode
            ? 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
            }`}
        >
          ← Quay lại Dashboard tài chính
        </Link>
      </div>

      <nav className={`flex items-center gap-1 p-1.5 rounded-xl border overflow-x-auto ${darkMode
        ? 'bg-white/5 border-white/10'
        : 'bg-gray-50 border-gray-200'
        }`}>
        {WORKOUT_NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${isActive(item.href)
                ? darkMode
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-orange-500 text-white shadow-md'
                : darkMode
                  ? 'text-gray-400 hover:text-white hover:bg-white/5'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white'
              }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}

