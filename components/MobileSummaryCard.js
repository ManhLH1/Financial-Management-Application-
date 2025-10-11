// Mobile-optimized summary card component
export default function MobileSummaryCard({ 
  icon, 
  label, 
  value, 
  subtitle, 
  gradient,
  trend = null, // { value: '+5%', positive: true }
  onClick = null
}) {
  return (
    <div 
      onClick={onClick}
      className={`rounded-2xl shadow-lg p-4 text-white transform transition-all duration-300 ${
        onClick ? 'active:scale-95 cursor-pointer' : ''
      } ${gradient}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xl">{icon}</span>
          <h3 className="text-xs font-medium opacity-90 truncate">{label}</h3>
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
            trend.positive 
              ? 'bg-green-500/20 text-green-200' 
              : 'bg-red-500/20 text-red-200'
          }`}>
            {trend.value}
          </span>
        )}
      </div>

      {/* Value - Truncate if too long */}
      <p className="text-xl font-bold mb-1 leading-tight truncate" title={value}>
        {value}
      </p>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-xs opacity-80 leading-tight truncate">
          {subtitle}
        </p>
      )}
    </div>
  )
}
