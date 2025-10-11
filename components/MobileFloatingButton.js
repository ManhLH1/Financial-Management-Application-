// Floating Action Button (FAB) - iOS/Android style
export default function MobileFloatingButton({ 
  icon = '➕', 
  label = 'Thêm',
  onClick,
  position = 'bottom-right', // 'bottom-right', 'bottom-center', 'bottom-left'
  color = 'blue' // 'blue', 'green', 'red', 'purple'
}) {
  const positionClasses = {
    'bottom-right': 'bottom-20 right-4',
    'bottom-center': 'bottom-20 left-1/2 transform -translate-x-1/2',
    'bottom-left': 'bottom-20 left-4'
  }

  const colorClasses = {
    'blue': 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/50',
    'green': 'bg-gradient-to-br from-green-500 to-green-600 shadow-green-500/50',
    'red': 'bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/50',
    'purple': 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-500/50'
  }

  return (
    <button
      onClick={onClick}
      className={`lg:hidden fixed ${positionClasses[position]} z-40 ${colorClasses[color]} text-white rounded-full shadow-2xl active:scale-95 transition-all duration-200 hover:shadow-3xl group`}
      aria-label={label}
    >
      <div className="flex items-center gap-2 px-5 py-4">
        <span className="text-2xl">{icon}</span>
        <span className="text-sm font-semibold">{label}</span>
      </div>
      
      {/* Ripple effect on tap */}
      <div className="absolute inset-0 rounded-full bg-white opacity-0 group-active:opacity-20 transition-opacity duration-200" />
    </button>
  )
}
