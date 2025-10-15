// Mobile-optimized summary card component - Modern Design
export default function MobileSummaryCard({ 
  icon, 
  label, 
  value, 
  subtitle, 
  gradient,
  trend = null, // { value: '+5%', positive: true }
  onClick = null,
  badge = null // Optional badge text like "Mới" or "Hot"
}) {
  return (
    <div 
      onClick={onClick}
      className={`group relative rounded-2xl shadow-xl p-4 text-white transform transition-all duration-300 overflow-hidden ${
        onClick ? 'active:scale-95 cursor-pointer hover:shadow-2xl hover:-translate-y-1' : ''
      } ${gradient}`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full blur-2xl transform translate-x-8 -translate-y-8"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white rounded-full blur-2xl transform -translate-x-8 translate-y-8"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Icon with animation */}
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
              <span className="text-lg">{icon}</span>
            </div>
            <h3 className="text-xs font-semibold opacity-90 truncate uppercase tracking-wide">
              {label}
            </h3>
          </div>
          
          {/* Trend Badge */}
          {trend && (
            <div className={`flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0 backdrop-blur-sm ${
              trend.positive 
                ? 'bg-green-500/30 text-green-100' 
                : 'bg-red-500/30 text-red-100'
            }`}>
              <span>{trend.positive ? '📈' : '📉'}</span>
              <span>{trend.value}</span>
            </div>
          )}

          {/* Optional Badge */}
          {badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-400 text-yellow-900 flex-shrink-0 animate-pulse">
              {badge}
            </span>
          )}
        </div>

        {/* Value - Large & Bold */}
        <div className="mb-2">
          <p className="text-2xl font-black leading-tight truncate drop-shadow-md" title={value}>
            {value}
          </p>
        </div>

        {/* Subtitle with icon */}
        {subtitle && (
          <div className="flex items-center gap-1">
            <div className="h-px flex-grow bg-white/30"></div>
            <p className="text-[11px] font-medium opacity-80 leading-tight truncate px-2">
              {subtitle}
            </p>
            <div className="h-px flex-grow bg-white/30"></div>
          </div>
        )}

        {/* Hover indicator */}
        {onClick && (
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-xs text-white/60">→</span>
          </div>
        )}
      </div>
    </div>
  )
}
