import React from 'react'

export type TabId = 'today' | 'status' | 'habits' | 'growth' | 'profile' | 'arcana'

interface BottomNavProps {
  active: TabId
  onChange: (id: TabId) => void
}

const navItems = [
  {
    id: 'today' as TabId, label: '今日',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><polygon points="12,2 22,20 2,20" fill="currentColor"/></svg>
  },
  {
    id: 'status' as TabId, label: '属性',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="currentColor"/>
    </svg>
  },
  {
    id: 'habits' as TabId, label: '习惯',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="2.5" fill="currentColor" transform="skewX(-8)"/><rect x="3" y="10" width="13" height="2.5" fill="currentColor" opacity="0.7" transform="skewX(-8)"/><rect x="3" y="16" width="16" height="2.5" fill="currentColor" opacity="0.5" transform="skewX(-8)"/></svg>
  },
  {
    id: 'growth' as TabId, label: '成长',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><polyline points="3,17 8,11 13,14 21,5" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/><line x1="3" y1="21" x2="21" y2="21" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/></svg>
  },
  {
    id: 'profile' as TabId, label: '档案',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" fill="currentColor"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>
  },
]

const BottomNav: React.FC<BottomNavProps> = ({ active, onChange }) => {
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: 'min(390px, 100vw)',
      background: 'rgba(10,10,10,0.98)',
      borderTop: '1px solid var(--dim)',
      display: 'flex', zIndex: 100,
      backdropFilter: 'blur(10px)',
    }}>
      {navItems.map(item => {
        const isActive = item.id === active
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '8px 0 10px', gap: 4,
              cursor: 'pointer', background: 'none', border: 'none',
              color: isActive ? 'var(--red)' : 'var(--muted)',
              position: 'relative', transition: 'color 0.2s',
            }}
          >
            {isActive && (
              <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 2, background: 'var(--red)', boxShadow: '0 0 10px rgba(195,0,47,0.8)' }} />
            )}
            <span style={{ transform: isActive ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.2s', display: 'flex' }}>
              {item.icon}
            </span>
            <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 8, letterSpacing: 1.5, textTransform: 'uppercase' }}>
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

export default BottomNav
export type { BottomNavProps }
