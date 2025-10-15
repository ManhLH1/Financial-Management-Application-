import { useState } from 'react'

// Floating Action Button (FAB) - Modern iOS/Android style
export default function MobileFloatingButton({ 
  icon = '➕', 
  label = 'Thêm',
  onClick,
  position = 'bottom-right', // 'bottom-right', 'bottom-center', 'bottom-left'
  color = 'blue', // 'blue', 'green', 'red', 'purple', 'gradient'
  size = 'normal', // 'small', 'normal', 'large'
  pulse = false // Add pulse animation
}) {
  const [isPressed, setIsPressed] = useState(false)

  const positionClasses = {
    'bottom-right': 'bottom-24 right-4',
    'bottom-center': 'bottom-24 left-1/2 transform -translate-x-1/2',
    'bottom-left': 'bottom-24 left-4'
  }

  const colorClasses = {
    'blue': 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/50',
    'green': 'bg-gradient-to-br from-green-500 to-green-600 shadow-green-500/50',
    'red': 'bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/50',
    'purple': 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-500/50',
    'gradient': 'bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 shadow-purple-500/50'
  }

  const sizeClasses = {
    'small': 'px-4 py-3',
    'normal': 'px-5 py-4',
    'large': 'px-6 py-5'
  }

  return (
    <button
      onClick={onClick}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={`lg:hidden fixed ${positionClasses[position]} z-40 ${colorClasses[color]} text-white rounded-2xl shadow-2xl transition-all duration-300 group overflow-hidden ${
        isPressed ? 'scale-95' : 'scale-100 hover:scale-105'
      } ${pulse ? 'animate-pulse' : ''}`}
      aria-label={label}
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
      
      {/* Content */}
      <div className={`relative flex items-center gap-2 ${sizeClasses[size]}`}>
        <span className="text-2xl drop-shadow-md filter">{icon}</span>
        <span className="text-sm font-bold tracking-wide">{label}</span>
      </div>
      
      {/* Ripple effect on tap */}
      <div className={`absolute inset-0 rounded-2xl bg-white transition-opacity duration-200 ${
        isPressed ? 'opacity-20' : 'opacity-0'
      }`} />

      {/* Shine effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000" />
    </button>
  )
}
