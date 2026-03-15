import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { Achievement } from '@/stores/useAchievementStore'

interface AchievementsModalProps {
  achievements: Achievement[]
  onClose: () => void
}

// 稀有度颜色映射
const RARITY_COLORS: Record<string, { border: string; glow: string; bg: string; text: string; label: string }> = {
  legendary: { border: '#FFD700', glow: 'rgba(255,215,0,0.6)', bg: 'linear-gradient(135deg, #1a1405 0%, #2a2010 100%)', text: '#FFD700', label: '传说' },
  epic: { border: '#9B59B6', glow: 'rgba(155,89,182,0.5)', bg: 'linear-gradient(135deg, #1a1025 0%, #251535 100%)', text: '#9B59B6', label: '史诗' },
  rare: { border: '#3498DB', glow: 'rgba(52,152,219,0.5)', bg: 'linear-gradient(135deg, #0f1a25 0%, #152535 100%)', text: '#3498DB', label: '稀有' },
  uncommon: { border: '#27AE60', glow: 'rgba(39,174,96,0.4)', bg: 'linear-gradient(135deg, #0a1a12 0%, #122520 100%)', text: '#27AE60', label: '优秀' },
  common: { border: '#95A5A6', glow: 'rgba(149,165,166,0.3)', bg: 'linear-gradient(135deg, #151515 0%, #1a1a1a 100%)', text: '#95A5A6', label: '普通' },
}

// 稀有度排序
const RARITY_ORDER = ['legendary', 'epic', 'rare', 'uncommon', 'common']

function AchievementDetailCard({ achievement, onClick }: { achievement: Achievement; onClick: () => void }) {
  const rarity = RARITY_COLORS[achievement.rarity] || RARITY_COLORS.common
  const { done, progress, target, progressPct } = achievement
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        background: done ? rarity.bg : 'var(--card)',
        padding: '14px',
        clipPath: 'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)',
        position: 'relative',
        overflow: 'hidden',
        opacity: !done && progress === 0 ? 0.4 : 1,
        cursor: 'pointer',
        border: done ? `1px solid ${rarity.border}` : '1px solid var(--dim)',
      }}
    >
      {/* 顶部进度条 */}
      {!done && progress > 0 && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--dim)' }}>
          <div style={{
            height: '100%',
            background: rarity.border,
            width: `${progressPct}%`,
            transition: 'width 0.3s ease',
          }}/>
        </div>
      )}

      {/* 已完成标记 */}
      {done && (
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: 0, height: 0,
          borderLeft: '24px solid transparent',
          borderTop: '24px solid var(--gold)',
        }}>
          <div style={{
            position: 'absolute', top: -22, right: 2,
            fontSize: 10, color: '#000', fontWeight: 'bold',
          }}>✓</div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        {/* 图标 */}
        <div style={{
          fontSize: 28,
          filter: done ? `drop-shadow(0 0 8px ${rarity.glow})` : 'none',
          flexShrink: 0,
        }}>{achievement.icon}</div>

        {/* 内容 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ 
            fontSize: 13, 
            fontWeight: 700, 
            color: done ? rarity.text : 'var(--white)',
            marginBottom: 4,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {achievement.name}
          </div>
          <div style={{ 
            fontFamily: 'Share Tech Mono,monospace', 
            fontSize: 9, 
            color: 'var(--muted)', 
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {achievement.description}
          </div>
          
          {/* 进度信息 */}
          {!done && progress > 0 && (
            <div style={{
              marginTop: 8,
              fontFamily: 'Share Tech Mono,monospace',
              fontSize: 10,
              color: rarity.text,
              letterSpacing: 1,
            }}>
              {progress} / {target} ({progressPct}%)
            </div>
          )}
        </div>

        {/* 稀有度标签 */}
        <div style={{
          fontFamily: 'Share Tech Mono,monospace',
          fontSize: 8,
          color: rarity.text,
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          letterSpacing: 2,
          opacity: 0.7,
        }}>
          {rarity.label}
        </div>
      </div>
    </motion.div>
  )
}

// 成就详情弹窗
function AchievementInfoModal({ achievement, onClose }: { achievement: Achievement; onClose: () => void }) {
  const rarity = RARITY_COLORS[achievement.rarity] || RARITY_COLORS.common
  const { done, progress, target, progressPct } = achievement

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.9)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 10001, backdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: 320,
          background: done ? rarity.bg : 'var(--card)',
          border: `1px solid ${done ? rarity.border : 'var(--dim)'}`,
          clipPath: 'polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px))',
          padding: '24px 20px',
          position: 'relative',
        }}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 12, right: 12,
            background: 'none', border: 'none',
            color: 'var(--muted)', fontSize: 20,
            cursor: 'pointer', padding: 4,
          }}
        >×</button>

        {/* 图标 */}
        <div style={{
          fontSize: 56,
          textAlign: 'center',
          marginBottom: 16,
          filter: done ? `drop-shadow(0 0 16px ${rarity.glow})` : 'none',
        }}>
          {achievement.icon}
        </div>

        {/* 名称 */}
        <div style={{
          fontFamily: 'Bebas Neue,sans-serif',
          fontSize: 22,
          letterSpacing: 3,
          color: done ? rarity.text : 'var(--white)',
          textAlign: 'center',
          marginBottom: 8,
        }}>
          {achievement.name}
        </div>

        {/* 稀有度 */}
        <div style={{
          fontFamily: 'Share Tech Mono,monospace',
          fontSize: 10,
          color: rarity.text,
          textAlign: 'center',
          letterSpacing: 2,
          marginBottom: 16,
        }}>
          {rarity.label}
        </div>

        {/* 描述 */}
        <div style={{
          fontFamily: 'Share Tech Mono,monospace',
          fontSize: 12,
          color: 'var(--muted)',
          textAlign: 'center',
          lineHeight: 1.6,
          marginBottom: 20,
          padding: '0 8px',
        }}>
          {achievement.description}
        </div>

        {/* 进度条 */}
        <div style={{ marginBottom: 16 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 6,
            fontFamily: 'Share Tech Mono,monospace',
            fontSize: 10,
            color: 'var(--muted)',
            letterSpacing: 1,
          }}>
            <span>进度</span>
            <span>{progress} / {target}</span>
          </div>
          <div style={{
            height: 6,
            background: 'var(--dim)',
            borderRadius: 3,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              background: done ? rarity.border : 'var(--red)',
              width: `${progressPct}%`,
              transition: 'width 0.3s ease',
            }}/>
          </div>
        </div>

        {/* 经验奖励 */}
        <div style={{
          textAlign: 'center',
          padding: '10px 16px',
          background: 'rgba(232,200,64,0.1)',
          border: '1px solid rgba(232,200,64,0.2)',
          borderRadius: 8,
        }}>
          <div style={{
            fontFamily: 'Share Tech Mono,monospace',
            fontSize: 11,
            color: 'var(--gold)',
            letterSpacing: 1,
          }}>
            ✦ 奖励: +{achievement.expReward} EXP
          </div>
        </div>

        {/* 解锁时间 */}
        {done && achievement.unlockedAt && (
          <div style={{
            marginTop: 16,
            textAlign: 'center',
            fontFamily: 'Share Tech Mono,monospace',
            fontSize: 9,
            color: 'var(--muted)',
            letterSpacing: 1,
          }}>
            解锁于: {new Date(achievement.unlockedAt).toLocaleDateString('zh-CN')}
          </div>
        )}
      </motion.div>
    </div>,
    document.body
  )
}

export default function AchievementsModal({ achievements, onClose }: AchievementsModalProps) {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)

  // 按稀有度分组
  const groupedAchievements = RARITY_ORDER.map(rarity => ({
    rarity,
    ...RARITY_COLORS[rarity],
    achievements: achievements.filter(a => a.rarity === rarity),
  })).filter(g => g.achievements.length > 0)

  // 统计
  const doneCount = achievements.filter(a => a.done).length

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex', flexDirection: 'column',
        zIndex: 10000, backdropFilter: 'blur(12px)',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '16px 20px 12px',
        borderBottom: '1px solid var(--dim)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{
            fontFamily: 'Bebas Neue,sans-serif',
            fontSize: 20,
            letterSpacing: 4,
            color: 'var(--white)',
          }}>
            成就徽章
          </div>
          <div style={{
            fontFamily: 'Share Tech Mono,monospace',
            fontSize: 10,
            color: 'var(--gold)',
            letterSpacing: 1,
            marginTop: 4,
          }}>
            {doneCount} / {achievements.length} 已解锁
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'var(--card)',
            border: '1px solid var(--dim)',
            color: 'var(--muted)',
            fontSize: 18,
            width: 36, height: 36,
            clipPath: 'polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px))',
            cursor: 'pointer',
          }}
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
      }}>
        {groupedAchievements.map(group => (
          <div key={group.rarity} style={{ marginBottom: 24 }}>
            {/* 稀有度标题 */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              marginBottom: 12,
            }}>
              <div style={{
                width: 8, height: 8,
                borderRadius: '50%',
                background: group.border,
                boxShadow: `0 0 8px ${group.glow}`,
              }}/>
              <div style={{
                fontFamily: 'Bebas Neue,sans-serif',
                fontSize: 14,
                letterSpacing: 3,
                color: group.text,
              }}>
                {group.label}
              </div>
              <div style={{
                flex: 1, height: 1,
                background: `linear-gradient(90deg, ${group.border}44, transparent)`,
              }}/>
            </div>

            {/* 成就列表 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: 8,
            }}>
              {group.achievements.map(ach => (
                <AchievementDetailCard
                  key={ach.id}
                  achievement={ach}
                  onClick={() => setSelectedAchievement(ach)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 详情弹窗 */}
      <AnimatePresence>
        {selectedAchievement && (
          <AchievementInfoModal
            achievement={selectedAchievement}
            onClose={() => setSelectedAchievement(null)}
          />
        )}
      </AnimatePresence>
    </div>,
    document.body
  )
}
