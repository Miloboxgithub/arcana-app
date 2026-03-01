import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import BottomNav, { type TabId } from '@/components/layout/BottomNav'
import Today from '@/pages/Today'
import Status from '@/pages/Status'
import Habits from '@/pages/Habits'
import Growth from '@/pages/Growth'
import ArcanaPage from '@/pages/Arcana'
import Profile from '@/pages/Profile'

const pageVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -6 },
}
const pageTransition = { duration: 0.2, ease: 'easeInOut' as const }

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('today')
  const [prevArcana, setPrevArcana] = useState<TabId>('profile')

  const handleTabChange = (id: TabId) => {
    if (id === 'arcana') {
      setPrevArcana(activeTab)
    }
    setActiveTab(id)
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'today':   return <Today />
      case 'status':  return <Status />
      case 'habits':  return <Habits />
      case 'growth':  return <Growth />
      case 'arcana':  return <ArcanaPage onBack={() => setActiveTab(prevArcana)} />
      case 'profile': return <Profile onOpenArcana={() => handleTabChange('arcana')} />
      default:        return <Today />
    }
  }

  // Hide bottom nav on arcana page (it's a sub-page)
  const showNav = activeTab !== 'arcana'

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--black)', maxWidth: 390, margin: '0 auto', position: 'relative' }}>
      {/* Background decorations */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(195,0,47,0.06) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      </div>
      <div style={{ position: 'fixed', top: -10, right: -18, fontFamily: 'Bebas Neue,sans-serif', fontSize: 180, letterSpacing: -4, lineHeight: 1, color: 'transparent', WebkitTextStroke: '1px rgba(195,0,47,0.07)', transform: 'skewX(-8deg) rotate(-8deg)', pointerEvents: 'none', zIndex: 0, userSelect: 'none', whiteSpace: 'nowrap' }}>ARCANA</div>

      {/* Scanline */}
      <div style={{ position: 'fixed', left: 0, right: 0, height: 1, background: 'rgba(195,0,47,0.05)', pointerEvents: 'none', zIndex: 999, animation: 'scan 6s linear infinite' }} />

      {/* Morgana FAB (shown everywhere except arcana page) */}
      {showNav && (
        <button
          onClick={() => handleTabChange('arcana')}
          title="找莫尔加纳聊聊"
          style={{
            position: 'fixed', right: 16, bottom: 78, width: 48, height: 48,
            background: 'var(--card)', border: '1.5px solid rgba(195,0,47,0.5)',
            clipPath: 'polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))',
            cursor: 'pointer', zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(195,0,47,0.2)',
          }}
        >
          <img src="/morgana-avatar.png" alt="莫尔加纳" style={{ width: 36, height: 36, objectFit: 'contain' }} />
        </button>
      )}

      {/* Page Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
          style={{ flex: 1, overflow: 'hidden', position: 'relative', zIndex: 10 }}
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>

      {/* Bottom Nav */}
      {showNav && <BottomNav active={activeTab} onChange={handleTabChange} />}
    </div>
  )
}

export default App
