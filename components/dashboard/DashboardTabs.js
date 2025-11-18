const DEFAULT_TABS = [
  {
    id: 'overview',
    label: 'Tổng quan',
    icon: '📊',
    activeClass: 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
  },
  {
    id: 'analytics',
    label: 'Phân tích',
    icon: '📈',
    activeClass: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
  },
  {
    id: 'budget',
    label: 'Ngân sách',
    icon: '💰',
    activeClass: 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/30'
  },
  {
    id: 'history',
    label: 'Lịch sử',
    icon: '📜',
    activeClass: 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-amber-500/30'
  }
]

export default function DashboardTabs({ activeTab, onChange, darkMode, tabs = DEFAULT_TABS }) {
  return (
    <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-400/40">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-2 shrink-0 ${
              isActive
                ? tab.activeClass
                : darkMode
                  ? 'bg-slate-800/70 text-gray-200 border border-white/5 hover:bg-slate-700/80'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 shadow-sm'
            }`}
            aria-pressed={isActive}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}


