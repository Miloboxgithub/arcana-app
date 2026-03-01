import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import BottomNav, { TabId } from '@/components/layout/BottomNav'
import Today from '@/pages/Today'
import Status from '@/pages/Status'
import Habits from '@/pages/Habits'
import Growth from '@/pages/Growth'
import ArcanaPage from '@/pages/Arcana'

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
}

const pageTransition = { duration: 0.2, ease: 'easeInOut' }

const pages: Record<TabId, React.ReactNode> = {
  today:  <Today />,
  status: <Status />,
  habits: <Habits />,
  growth: <Growth />,
  arcana: <ArcanaPage />,
}

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('today')

  return (
    <div className="h-full flex flex-col bg-arcana-black max-w-md mx-auto relative">
      {/* Page Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
          className="flex-1 overflow-hidden"
        >
          {pages[activeTab]}
        </motion.div>
      </AnimatePresence>

      {/* Bottom Nav */}
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  )
}

export default App
