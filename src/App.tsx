import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import BottomNav, { type TabId } from '@/components/layout/BottomNav'
import Today from '@/pages/Today'
import Habits from '@/pages/Habits'
import Growth from '@/pages/Growth'
import ArcanaPage from '@/pages/Arcana'
import Profile from '@/pages/Profile'
import AuthPage from '@/pages/Auth'
import Onboarding from '@/pages/Onboarding'
import MorganaPage from '@/pages/Morgana'
import CreateHabit from '@/pages/Habits/CreateHabit'
import NotificationPanel from '@/components/ui/NotificationPanel'
import useAuthStore from '@/stores/useAuthStore'
import useUIStore from '@/stores/useUIStore'
import { syncFromCloud } from '@/lib/sync'
import { AchievementUnlockProvider } from '@/components/ui/AchievementUnlock'
import { useNotificationStore } from '@/stores/useNotificationStore'

const pageVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -6 },
}
const pageTransition = { duration: 0.18, ease: 'easeInOut' as const }

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('today')
  const [showMorgana, setShowMorgana] = useState(false)
  const [showCreateHabit, setShowCreateHabit] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const { user, loading, init } = useAuthStore()
  const { unreadCount, fetchUnreadCount } = useNotificationStore()

  useEffect(() => {
    init()
    const timeout = setTimeout(() => {
      if (useAuthStore.getState().loading) useAuthStore.setState({ loading: false })
    }, 10000)
    return () => clearTimeout(timeout)
  }, [init])

  useEffect(() => {
    if (user) syncFromCloud(user.id)
    fetchUnreadCount()
  }, [user?.id])

  useEffect(() => {
    const interval = setInterval(async () => {
      await useAuthStore.getState().refreshUser()
    }, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const handleTabChange = (id: TabId) => {
    if (id === 'arcana') return // arcana only accessible via profile button
    setActiveTab(id)
    useUIStore.getState().closeModal()
    window.scrollTo(0, 0)
  }

  const openArcana = () => setActiveTab('arcana')
  const closeArcana = () => setActiveTab('profile')

  const renderPage = () => {
    switch (activeTab) {
      case 'today':   return <Today />
      case 'habits':  return <Habits onCreateHabit={() => setShowCreateHabit(true)} />
      case 'growth':  return <Growth />
      case 'arcana':  return <ArcanaPage onBack={closeArcana} />
      case 'profile': return <Profile onOpenArcana={openArcana} />
      default:        return <Today />
    }
  }

  const showNav = activeTab !== 'arcana' && !showCreateHabit

  // Loading
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, letterSpacing: 6, color: 'var(--red)', opacity: 0.7 }}>ARCANA</div>
      </div>
    )
  }

  if (!user) return <AuthPage />
  if (!user.onboarding_done) {
    return <Onboarding onComplete={() => useAuthStore.getState().refreshUser()} />
  }

  return (
    <AchievementUnlockProvider>
      {/* ── Create Habit Modal ── */}
      <AnimatePresence>
        {showCreateHabit && (
          <motion.div
            key="create-habit"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25, ease: [0.175, 0.885, 0.32, 1.275] }}
            style={{
              position: 'fixed', inset: 0, zIndex: 800,
              background: 'var(--black)',
              overflowY: 'auto',
            }}
          >
            <CreateHabit onClose={() => setShowCreateHabit(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Notification Panel ── */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            key="notif-panel"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ duration: 0.25, ease: [0.175, 0.885, 0.32, 1.275] }}
          >
            <NotificationPanel onClose={() => setShowNotifications(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Morgana Chat ── */}
      <AnimatePresence>
        {showMorgana && (
          <motion.div
            key="morgana"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ duration: 0.28, ease: [0.175, 0.885, 0.32, 1.275] }}
            style={{
              position: 'fixed', inset: 0, zIndex: 900,
              background: 'var(--black)',
            }}
          >
            <MorganaPage onClose={() => setShowMorgana(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main App ── */}
      <div style={{ minHeight: '100vh', background: 'var(--black)', position: 'relative', display: showMorgana || showCreateHabit ? 'none' : 'block' }}>
        {/* Background */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(195,0,47,0.06) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        </div>
        <div style={{
          position: 'fixed', top: -10, right: -18,
          fontFamily: 'Bebas Neue,sans-serif', fontSize: 180, letterSpacing: -4, lineHeight: 1,
          color: 'transparent', WebkitTextStroke: '1px rgba(195,0,47,0.07)',
          transform: 'skewX(-8deg) rotate(-8deg)',
          pointerEvents: 'none', zIndex: 0, userSelect: 'none', whiteSpace: 'nowrap',
        }}>ARCANA</div>
        <div style={{ position: 'fixed', left: 0, right: 0, height: 1, background: 'rgba(195,0,47,0.05)', pointerEvents: 'none', zIndex: 999, animation: 'scan 6s linear infinite' }} />

        {/* Morgana FAB */}
        {showNav && (
          <>
            {/* Notification bell — top right when on Today tab */}
            {activeTab === 'today' && (
              <button
                onClick={() => setShowNotifications(true)}
                title="通知"
                style={{
                  position: 'fixed', top: 14, right: 16,
                  width: 38, height: 38,
                  background: 'var(--card)', border: '1px solid var(--dim)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', zIndex: 150,
                  clipPath: 'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="var(--white)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13.73 21a2 2 0 01-3.46 0" stroke="var(--white)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {unreadCount > 0 && (
                  <div style={{
                    position: 'absolute', top: -4, right: -4,
                    width: 16, height: 16, background: 'var(--red)',
                    borderRadius: '50%', border: '2px solid var(--black)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Share Tech Mono,monospace', fontSize: 7,
                    color: 'white', fontWeight: 700,
                    zIndex: 1,
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </div>
                )}
              </button>
            )}

            {/* Morgana FAB */}
            <button
              onClick={() => setShowMorgana(true)}
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
          </>
        )}

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

        {showNav && <BottomNav active={activeTab} onChange={handleTabChange} />}
      </div>
    </AchievementUnlockProvider>
  )
}

export default App
