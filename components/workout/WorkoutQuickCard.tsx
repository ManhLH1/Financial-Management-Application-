import React from 'react'
import Link from 'next/link'

interface WorkoutQuickCardProps {
  darkMode?: boolean
}

export default function WorkoutQuickCard({ darkMode = false }: WorkoutQuickCardProps) {
  const workoutLinks = [
    { href: '/workout/dashboard', icon: '🏋️', label: 'Tổng quan', desc: 'Tình trạng' },
    { href: '/workout/exercises', icon: '💪', label: 'Bài tập', desc: 'Quản lý' },
    { href: '/workout/schedule', icon: '📅', label: 'Lịch tập', desc: 'Theo tuần' },
    { href: '/workout/logs', icon: '📝', label: 'Nhật ký', desc: 'Ghi nhận' },
    { href: '/workout/progress', icon: '📈', label: 'Tiến độ', desc: 'Thống kê' },
  ]

  return (
    <div className={`rounded-[32px] p-6 border transition-all duration-300 ${darkMode
      ? 'bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20 backdrop-blur-md'
      : 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 shadow-lg'
      }`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-2xl ${darkMode
          ? 'bg-orange-500/20 border border-orange-500/30'
          : 'bg-orange-100 border border-orange-200'
          }`}>
          🏋️
        </div>
        <div>
          <h3 className={`text-lg font-bold ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>
            Khu vực luyện tập
          </h3>
          <p className={`text-xs ${darkMode ? 'text-orange-400/70' : 'text-orange-600/70'}`}>
            Quản lý lịch tập & tiến độ
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {workoutLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`group flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${darkMode
              ? 'bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20'
              : 'bg-white/60 hover:bg-white border border-orange-200/50'
              }`}
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">
              {link.icon}
            </span>
            <div className="text-center">
              <div className={`text-xs font-bold ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>
                {link.label}
              </div>
              <div className={`text-[10px] ${darkMode ? 'text-orange-400/60' : 'text-orange-600/60'}`}>
                {link.desc}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Link
        href="/workout/dashboard"
        className={`mt-4 w-full py-2.5 rounded-xl text-sm font-bold text-center transition-all ${darkMode
          ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-500/30'
          : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md'
          }`}
      >
        Đi tới khu luyện tập →
      </Link>
    </div>
  )
}

