const DEFAULT_TABS = [
  {
    id: 'overview',
    label: 'Tổng quan',
    icon: '📊',
    activeClass: 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
  },
  {
    id: 'analytics',
    label: 'Phân tích',
    icon: '📈',
    activeClass: 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
  },
  {
    id: 'budget',
    label: 'Ngân sách',
    icon: '💰',
    activeClass: 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
  },
  {
    id: 'history',
    label: 'Lịch sử',
    icon: '📜',
    activeClass: 'bg-amber-600 text-white shadow-lg shadow-amber-500/30'
  }
]

export default function DashboardTabs({ activeTab, onChange, darkMode, tabs = DEFAULT_TABS }) {
  return (
    <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
      <div className={`flex p-1.5 rounded-[20px] ${darkMode ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white border border-gray-200 shadow-sm'}`}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`relative px-6 py-2.5 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-2 shrink-0 ${isActive
                  ? tab.activeClass
                  : darkMode
                    ? 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-gray-50'
                }`}
              aria-pressed={isActive}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
