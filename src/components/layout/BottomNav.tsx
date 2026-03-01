import React from 'react'

type TabId = 'today' | 'status' | 'habits' | 'growth' | 'arcana'

interface NavItem {
  id: TabId
  label: string
  icon: React.ReactNode
}

interface BottomNavProps {
  active: TabId
  onChange: (id: TabId) => void
}

const TodayIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="3" y1="9" x2="21" y2="9"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
  </svg>
)

const StatusIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
  </svg>
)

const HabitsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9,11 12,14 22,4"/>
    <path d="M21,12v7a2,2,0,0,1-2,2H5a2,2,0,0,1-2-2V5a2,2,0,0,1,2-2h11"/>
  </svg>
)

const GrowthIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
  </svg>
)

const ArcanaIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12,2 L15.5,8.5 L22,9.5 L17,14.5 L18.5,21 L12,17.5 L5.5,21 L7,14.5 L2,9.5 L8.5,8.5 Z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const navItems: NavItem[] = [
  { id: 'today',  label: '今日',  icon: <TodayIcon /> },
  { id: 'status', label: '属性',  icon: <StatusIcon /> },
  { id: 'habits', label: '习惯',  icon: <HabitsIcon /> },
  { id: 'growth', label: '成长',  icon: <GrowthIcon /> },
  { id: 'arcana', label: 'ARCANA', icon: <ArcanaIcon /> },
]

const BottomNav: React.FC<BottomNavProps> = ({ active, onChange }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-arcana-card border-t border-arcana-dim">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = item.id === active
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 transition-all ${
                isActive
                  ? 'text-arcana-red'
                  : 'text-arcana-muted hover:text-arcana-white'
              }`}
            >
              <span className={`transition-transform ${isActive ? 'scale-110' : ''}`}>
                {item.icon}
              </span>
              <span className={`text-[10px] font-display tracking-wider ${
                item.id === 'arcana' ? 'text-[9px]' : ''
              }`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-arcana-red" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNav
export type { TabId }
