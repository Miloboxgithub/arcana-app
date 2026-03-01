import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import BottomNav, { type TabId } from '@/components/layout/BottomNav'
import Today from '@/pages/Today'
import Status from '@/pages/Status'
import Habits from '@/pages/Habits'
import Growth from '@/pages/Growth'
import ArcanaPage from '@/pages/Arcana'
import Profile from '@/pages/Profile'
import AuthPage from '@/pages/Auth'
import useAuthStore from '@/stores/useAuthStore'
import { syncFromCloud } from '@/lib/sync'
import { supabase } from '@/lib/supabase'

const pageVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -6 },
}
const pageTransition = { duration: 0.18, ease: 'easeInOut' as const }

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('today')
  const [prevArcana, setPrevArcana] = useState<TabId>('profile')
  const { user, loading, init } = useAuthStore()

  useEffect(() => { init() }, [init])

  // 登录后自动从云端同步数据
  useEffect(() => {
    if (user) syncFromCloud(user.id)
  }, [user?.id])

  // 每5分钟验证一次session有效性
  useEffect(() => {
    const interval = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        // session 已失效（后台删除用户等）
        useAuthStore.getState().signOut()
      }
    }, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const handleTabChange = (id: TabId) => {
    if (id === 'arcana') setPrevArcana(activeTab)
    setActiveTab(id)
    // Scroll to top on tab change
    window.scrollTo(0, 0)
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

  const showNav = activeTab !== 'arcana'

  // Loading state
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, letterSpacing: 6, color: 'var(--red)', opacity: 0.7 }}>
          ARCANA
        </div>
      </div>
    )
  }

  // Not logged in → show auth page
  if (!user) return <AuthPage />

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', position: 'relative' }}>

      {/* Background layer */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(195,0,47,0.06) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      </div>

      {/* Background watermark */}
      <div style={{
        position: 'fixed', top: -10, right: -18,
        fontFamily: 'Bebas Neue,sans-serif', fontSize: 180, letterSpacing: -4, lineHeight: 1,
        color: 'transparent', WebkitTextStroke: '1px rgba(195,0,47,0.07)',
        transform: 'skewX(-8deg) rotate(-8deg)',
        pointerEvents: 'none', zIndex: 0, userSelect: 'none', whiteSpace: 'nowrap',
      }}>ARCANA</div>

      {/* Left diamond decoration */}
      <div style={{ position: 'fixed', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', width: 80, height: 80, top: 120, left: -30, border: '1px solid rgba(195,0,47,0.10)', transform: 'rotate(45deg)' }} />
        <div style={{ position: 'absolute', width: 44, height: 44, top: 160, left: 12, border: '1px solid rgba(195,0,47,0.10)', transform: 'rotate(45deg)' }} />
      </div>

      {/* Scanline */}
      <div style={{ position: 'fixed', left: 0, right: 0, height: 1, background: 'rgba(195,0,47,0.05)', pointerEvents: 'none', zIndex: 999, animation: 'scan 6s linear infinite' }} />

      {/* Morgana FAB */}
      {showNav && (
        <button
          onClick={() => handleTabChange('arcana')}
          title="找莫尔加纳聊聊"
          className="morgana-fab-ring"
          style={{
            position: 'fixed', right: 16, bottom: 78,
            width: 48, height: 48,
            background: 'var(--card)', border: '1.5px solid rgba(195,0,47,0.5)',
            clipPath: 'polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))',
            cursor: 'pointer', zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <img src="/morgana-avatar.png" alt="莫尔加纳" style={{ width: 36, height: 36, objectFit: 'contain' }} />
        </button>
      )}

      {/* Page content — NO overflow:hidden here, let body scroll naturally */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
          style={{ position: 'relative', zIndex: 10 }}
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>

      {/* Bottom Nav — fixed at bottom */}
      {showNav && <BottomNav active={activeTab} onChange={handleTabChange} />}
    </div>
  )
}

export default App
