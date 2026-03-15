import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { Achievement } from '@/stores/useAchievementStore'

interface AchievementUnlockModalProps {
  achievement: Achievement | null
  onClose: () => void
}

// 稀有度颜色映射
const RARITY_COLORS: Record<string, { border: string; glow: string; bg: string; text: string }> = {
  legendary: { border: '#FFD700', glow: 'rgba(255,215,0,0.6)', bg: 'linear-gradient(135deg, #1a1405 0%, #2a2010 100%)', text: '#FFD700' },
  epic: { border: '#9B59B6', glow: 'rgba(155,89,182,0.5)', bg: 'linear-gradient(135deg, #1a1025 0%, #251535 100%)', text: '#9B59B6' },
  rare: { border: '#3498DB', glow: 'rgba(52,152,219,0.5)', bg: 'linear-gradient(135deg, #0f1a25 0%, #152535 100%)', text: '#3498DB' },
  uncommon: { border: '#27AE60', glow: 'rgba(39,174,96,0.4)', bg: 'linear-gradient(135deg, #0a1a12 0%, #122520 100%)', text: '#27AE60' },
  common: { border: '#95A5A6', glow: 'rgba(149,165,166,0.3)', bg: 'linear-gradient(135deg, #151515 0%, #1a1a1a 100%)', text: '#95A5A6' },
}

function AchievementUnlockModal({ achievement, onClose }: AchievementUnlockModalProps) {
  const [showDetail, setShowDetail] = useState(false)

  // 3秒后自动显示详情
  useEffect(() => {
    const timer = setTimeout(() => setShowDetail(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  // 点击任意处关闭
  const handleClose = () => {
    onClose()
  }

  if (!achievement) return null

  const rarity = RARITY_COLORS[achievement.rarity] || RARITY_COLORS.common

  // 粒子效果模拟（CSS 动画）
  const particles = Array.from({ length: 12 }, (_, i) => ({
    angle: (i * 30) * (Math.PI / 180),
    delay: Math.random() * 0.5,
  }))

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 10000, backdropFilter: 'blur(8px)',
      }}
      onClick={handleClose}
    >
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          width: 300,
          background: rarity.bg,
          border: `2px solid ${rarity.border}`,
          clipPath: 'polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,16px 100%,0 calc(100% - 16px))',
          boxShadow: `0 0 40px ${rarity.glow}, 0 0 80px ${rarity.glow}`,
          overflow: 'hidden',
        }}
      >
        {/* 闪光边框动画 */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(45deg, transparent 40%, ${rarity.border}22 50%, transparent 60%)`,
          backgroundSize: '200% 200%',
          animation: 'shine 2s ease-in-out infinite',
          pointerEvents: 'none',
        }} />

        {/* 粒子爆炸效果 */}
        {particles.map((p, i) => (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(p.angle) * 80,
              y: Math.sin(p.angle) * 80,
              opacity: 0,
              scale: 0,
            }}
            transition={{ duration: 1, delay: p.delay, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: '50%', top: '50%',
              width: 6, height: 6,
              borderRadius: '50%',
              background: rarity.border,
              boxShadow: `0 0 8px ${rarity.border}`,
            }}
          />
        ))}

        {/* 顶部装饰 */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, ${rarity.border}, transparent)`,
        }} />

        {/* 内容 */}
        <div style={{ padding: '28px 24px 24px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* 成就图标 */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
            style={{
              fontSize: 48,
              marginBottom: 12,
              filter: `drop-shadow(0 0 12px ${rarity.glow})`,
            }}
          >
            {achievement.icon}
          </motion.div>

          {/* 标题 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              fontFamily: 'Bebas Neue,sans-serif',
              fontSize: 24,
              letterSpacing: 4,
              color: rarity.text,
              marginBottom: 6,
              textShadow: `0 0 20px ${rarity.glow}`,
            }}
          >
            成就解锁
          </motion.div>

          {/* 成就名称 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              fontFamily: 'Bebas Neue,sans-serif',
              fontSize: 20,
              letterSpacing: 2,
              color: 'var(--white)',
              marginBottom: 8,
            }}
          >
            {achievement.name}
          </motion.div>

          {/* 成就描述 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              fontFamily: 'Share Tech Mono,monospace',
              fontSize: 11,
              color: 'var(--muted)',
              lineHeight: 1.5,
              marginBottom: 16,
            }}
          >
            {achievement.description}
          </motion.div>

          {/* 经验奖励 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              background: 'rgba(232,200,64,0.1)',
              border: '1px solid rgba(232,200,64,0.3)',
              borderRadius: 20,
            }}
          >
            <span style={{ color: 'var(--gold)', fontSize: 14 }}>✦</span>
            <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 12, color: 'var(--gold)', letterSpacing: 1 }}>
              +{achievement.expReward} EXP
            </span>
          </motion.div>

          {/* 点击提示 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: showDetail ? 1 : 0.5 }}
            transition={{ delay: 1 }}
            style={{
              marginTop: 20,
              fontFamily: 'Share Tech Mono,monospace',
              fontSize: 10,
              color: 'var(--muted)',
              letterSpacing: 1,
            }}
          >
            {showDetail ? '◆ 点击任意处关闭' : '•••'}
          </motion.div>
        </div>
      </motion.div>

      <style>{`
        @keyframes shine {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>,
    document.body
  )
}

// 全局成就解锁弹窗管理器
let globalOnUnlock: ((achievement: Achievement) => void) | null = null

export function showAchievementUnlock(achievement: Achievement) {
  if (globalOnUnlock) {
    globalOnUnlock(achievement)
  }
}

interface AchievementUnlockProviderProps {
  children: React.ReactNode
}

export function AchievementUnlockProvider({ children }: AchievementUnlockProviderProps) {
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null)

  useEffect(() => {
    globalOnUnlock = setUnlockedAchievement
    return () => { globalOnUnlock = null }
  }, [])

  const handleClose = () => {
    setUnlockedAchievement(null)
  }

  return (
    <>
      <AnimatePresence>
        {unlockedAchievement && (
          <AchievementUnlockModal
            achievement={unlockedAchievement}
            onClose={handleClose}
          />
        )}
      </AnimatePresence>
      {children}
    </>
  )
}

export default AchievementUnlockModal
