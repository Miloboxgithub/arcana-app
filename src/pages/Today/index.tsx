import { useState, useCallback } from 'react'
import useHabitStore, { type TimeSlot, type Habit } from '@/stores/useHabitStore'
import useProfileStore from '@/stores/useProfileStore'
import { useStarBurst } from '@/hooks/useStarBurst'
import { analyzeAndAddExp } from '@/lib/morgana'

// ── Constants ─────────────────────────────────────────────
const DIM_LABELS: Record<string, string> = {
  pro: '专业力', fitness: '体能', social: '社交',
  create: '创造力', self: '自律', charm: '魅力',
}
const MORGANA_LINES = [
  '干得不错！每次打卡都是怪盗的行动证明。继续！',
  '经验值到手！你的成长我都记录在案了，侦探。',
  '连击还在继续——别停下来，怪盗不会轻易放弃的！',
  '这个习惯正在改变你，数据不会说谎。',
  '又完成了一个！今天的你比昨天的你更强。',
  '完美执行！这就是怪盗团的行动力！',
]
let morganaIdx = 0
const SLOTS: TimeSlot[] = ['morning', 'afternoon', 'evening', 'night']
const SLOT_LABELS: Record<TimeSlot, string> = { morning: '早晨', afternoon: '白天', evening: '傍晚', night: '夜晚' }

function getDateStr() {
  const d = new Date()
  const days = ['SUN','MON','TUE','WED','THU','FRI','SAT']
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
  return `${days[d.getDay()]} · ${String(d.getDate()).padStart(2,'0')} ${months[d.getMonth()]}`
}

function getTimeSlot() {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return '上午'
  if (h >= 12 && h < 18) return '下午'
  if (h >= 18 && h < 22) return '傍晚'
  return '深夜'
}

// ── EXP Toast ─────────────────────────────────────────────
function ExpToast({ visible, exp, dim }: { visible: boolean; exp: number; dim: string }) {
  return (
    <div style={{
      position: 'fixed', top: '50%', left: '50%', zIndex: 300,
      transform: `translate(-50%,-50%) scale(${visible ? 1 : 0}) rotate(-1deg)`,
      transition: 'transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275)',
      pointerEvents: 'none',
      background: 'var(--card)', border: '2px solid var(--gold)',
      padding: '16px 40px', textAlign: 'center',
      clipPath: 'polygon(10px 0,100% 0,calc(100% - 10px) 100%,0 100%)',
      boxShadow: '0 0 40px rgba(232,200,64,0.15)',
    }}>
      <div style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 9, letterSpacing: 3, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 2 }}>获得经验</div>
      <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 56, color: 'var(--gold)', letterSpacing: 4, lineHeight: 1 }}>+{exp}</div>
      <div style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 10, color: 'var(--red)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 3 }}>{dim}</div>
    </div>
  )
}

// ── Morgana Dialog ────────────────────────────────────────
function MorganaDialog({ visible, text, onClose }: { visible: boolean; text: string; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', bottom: 80, left: '50%', zIndex: 500,
      transform: `translateX(-50%) translateY(${visible ? 0 : 20}px)`,
      opacity: visible ? 1 : 0,
      transition: 'all 0.35s cubic-bezier(0.175,0.885,0.32,1.275)',
      pointerEvents: visible ? 'auto' : 'none',
      width: 'calc(min(390px,100vw) - 32px)',
      background: 'var(--card)', border: '1px solid rgba(195,0,47,0.4)',
      clipPath: 'polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,16px 100%,0 calc(100% - 16px))',
      display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px',
      boxShadow: '0 8px 40px rgba(195,0,47,0.15)',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,var(--red),var(--gold) 50%,transparent)' }} />
      <div style={{ width: 52, height: 52, flexShrink: 0, borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(195,0,47,0.25)', background: 'rgba(195,0,47,0.05)' }}>
        <img src="/morgana-avatar.png" alt="莫尔加纳" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 13, letterSpacing: 3, color: 'var(--red)', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 5, height: 5, background: 'var(--gold)', transform: 'rotate(45deg)', display: 'inline-block' }} />
          莫尔加纳
        </div>
        <div style={{ fontSize: 12, color: 'var(--white)', lineHeight: 1.65 }}>{text}</div>
      </div>
      <button onClick={onClose} style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', color: 'var(--muted)', fontSize: 14, cursor: 'pointer', padding: '2px 4px', lineHeight: 1 }}>✕</button>
    </div>
  )
}

// ── Habit Card ─────────────────────────────────────────────
function HabitCard({ habit, done, onToggle, index }: { habit: Habit; done: boolean; onToggle: () => void; index: number }) {
  return (
    <div
      onClick={onToggle}
      style={{
        position: 'relative',
        background: 'var(--card)',
        borderLeft: `3px solid ${done ? '#1DB954' : 'var(--red)'}`,
        padding: '12px 14px',
        display: 'flex', alignItems: 'center', gap: 12,
        cursor: 'pointer',
        clipPath: 'polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,0 100%)',
        marginBottom: 2, overflow: 'hidden',
        userSelect: 'none', transition: 'all 0.2s',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* corner triangle */}
      <div style={{ position: 'absolute', top: 0, right: 0, borderTop: '12px solid var(--card2)', borderLeft: '12px solid transparent' }} />
      {/* background number */}
      <div style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', fontFamily: 'Bebas Neue,sans-serif', fontSize: 48, color: 'rgba(255,255,255,0.03)', userSelect: 'none', pointerEvents: 'none', lineHeight: 1 }}>
        {String(index + 1).padStart(2, '0')}
      </div>
      {/* diamond checkbox */}
      <div style={{
        width: 28, height: 28,
        border: `2px solid ${done ? '#1DB954' : 'var(--red)'}`,
        background: done ? '#1DB954' : 'transparent',
        transform: 'rotate(45deg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, transition: 'all 0.2s', position: 'relative', zIndex: 1,
      }}>
        <span style={{ transform: 'rotate(-45deg)', fontSize: 12, color: 'var(--white)', opacity: done ? 1 : 0, transition: 'opacity 0.2s' }}>✓</span>
      </div>
      {/* content */}
      <div style={{ flex: 1, position: 'relative', zIndex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--white)', marginBottom: 5, opacity: done ? 0.4 : 1, textDecoration: done ? 'line-through' : 'none', transition: 'all 0.2s' }}>
          {habit.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {habit.dimensions?.map(d => (
            <span key={d.dimension} style={{ fontSize: 9, fontFamily: 'Share Tech Mono,monospace', letterSpacing: 1, padding: '2px 8px', background: 'rgba(195,0,47,0.12)', color: 'var(--red)', clipPath: 'polygon(4px 0,100% 0,calc(100% - 4px) 100%,0 100%)', display: 'inline-block', border: '1px solid rgba(195,0,47,0.25)' }}>
              {DIM_LABELS[d.dimension] || d.dimension} +{d.exp}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Chain Connector ───────────────────────────────────────
function ChainConn() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: '0 0 0 21px', height: 18 }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <polygon points="7,14 0,0 14,0" fill="rgba(195,0,47,0.35)" />
      </svg>
    </div>
  )
}

// ── Slot Button ───────────────────────────────────────────
function SlotBtn({ slot, active, onClick }: { slot: TimeSlot; active: boolean; onClick: () => void }) {
  const icons: Record<TimeSlot, JSX.Element> = {
    morning: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="4" fill="currentColor"/>
        <line x1="12" y1="2" x2="12" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="2" y1="12" x2="5" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="19" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    afternoon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="5" fill="currentColor"/>
        <line x1="12" y1="2" x2="12" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="4.22" y1="4.22" x2="7.05" y2="7.05" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="16.95" y1="16.95" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="2" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="18" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="4.22" y1="19.78" x2="7.05" y2="16.95" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="16.95" y1="7.05" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    evening: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 3a9 9 0 0 0 0 18 9 9 0 0 0 6.36-2.64A7 7 0 0 1 9 8a7 7 0 0 1 6.36-5A9 9 0 0 0 12 3z" fill="currentColor" opacity="0.6"/>
        <circle cx="12" cy="12" r="3" fill="currentColor"/>
        <line x1="12" y1="2" x2="12" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
        <line x1="20" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      </svg>
    ),
    night: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" fill="currentColor"/>
        <circle cx="18" cy="5" r="0.9" fill="currentColor" opacity="0.6"/>
        <circle cx="21" cy="9" r="0.6" fill="currentColor" opacity="0.4"/>
        <circle cx="19" cy="3" r="0.5" fill="currentColor" opacity="0.35"/>
      </svg>
    ),
  }
  return (
    <button
      className={`slot-btn${active ? ' active' : ''}`}
      onClick={onClick}
      style={{ flex: 1, minWidth: 0 }}
    >
      <div className="slot-icon-wrap" style={{ transform: 'scale(0.85)' }}>
        {icons[slot]}
      </div>
      <span className="slot-label">{SLOT_LABELS[slot]}</span>
    </button>
  )
}

// ── Section Head ──────────────────────────────────────────
function SectionHead({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0 10px' }}>
      <div className="section-tag" style={{
        fontFamily: 'Bebas Neue,sans-serif', fontSize: 13, letterSpacing: 4,
        color: 'var(--white)', transform: 'skewX(-5deg)', whiteSpace: 'nowrap',
        display: 'flex', alignItems: 'center',
      }}>
        {label}
      </div>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,var(--dim),transparent)' }} />
    </div>
  )
}

// ── AI Input Bar ──────────────────────────────────────────
function AIInputBar({ onSubmit, disabled }: { onSubmit: (text: string) => void; disabled?: boolean }) {
  const [val, setVal] = useState('')
  const send = () => { if (val.trim() && !disabled) { onSubmit(val.trim()); setVal('') } }
  return (
    <div style={{ position: 'fixed', bottom: 64, left: '50%', transform: 'translateX(-50%)', width: 'calc(min(390px,100vw) - 24px)', zIndex: 50 }}>
      <div style={{ background: 'rgba(14,14,14,0.97)', border: `1px solid ${disabled ? 'var(--dim)' : 'var(--red)'}`, display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', clipPath: 'polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%)', boxShadow: disabled ? 'none' : '0 0 24px rgba(195,0,47,0.3),0 8px 32px rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }}>
        <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 10, color: disabled ? 'var(--muted)' : 'var(--red)', letterSpacing: 1, whiteSpace: 'nowrap', flexShrink: 0 }}>{disabled ? '分析中' : '// 输入'}</span>
        <input
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder={disabled ? "AI 正在分析..." : "今天做了什么？AI 自动分配经验值…"}
          disabled={disabled}
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: disabled ? 'var(--muted)' : 'var(--white)', fontSize: 13, fontFamily: 'Noto Sans SC,sans-serif', opacity: disabled ? 0.5 : 1 }}
        />
        <button onClick={send} disabled={disabled} style={{ flexShrink: 0, background: 'none', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', padding: 2, opacity: disabled ? 0.3 : 0.7 }}>
          {disabled ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}><circle cx="12" cy="12" r="10" stroke="var(--muted)" strokeWidth="2" strokeDasharray="30 15" /></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><polygon points="5,3 19,12 5,21" fill="var(--red)" /></svg>
          )}
        </button>
      </div>
    </div>
  )
}

// ── MAIN TODAY PAGE ────────────────────────────────────────
export default function Today() {
  const { habits, todayCompleted, toggleToday, getHabitsBySlot, getStreak, getHabitDimensions } = useHabitStore()
  const { dimensions, addExp, addMultiExp, removeExp, getTotalLevel } = useProfileStore()
  const { burst } = useStarBurst()

  const [activeSlot, setActiveSlot] = useState<TimeSlot>('afternoon')
  const [toast, setToast] = useState({ visible: false, exp: 0, dim: '' })
  const [morgana, setMorgana] = useState({ visible: false, text: '' })
  const [aiLoading, setAiLoading] = useState(false)

  const streak = getStreak()
  const slotHabits = getHabitsBySlot(activeSlot)
  const todayExp = habits.filter(h => todayCompleted.includes(h.id)).reduce((s, h) => {
    const dims = h.dimensions || []
    return s + dims.reduce((sum, d) => sum + d.exp, 0)
  }, 0)
  const allHabits = habits.length
  const totalLevel = getTotalLevel()

  const showToast = useCallback((exp: number, dim: string) => {
    setToast({ visible: true, exp, dim })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 1800)
  }, [])

  const showMorgana = useCallback((text?: string) => {
    const t = text || MORGANA_LINES[morganaIdx++ % MORGANA_LINES.length]
    setMorgana({ visible: true, text: t })
    setTimeout(() => setMorgana(m => ({ ...m, visible: false })), 4000)
  }, [])

  const handleToggle = useCallback((habit: Habit) => {
    const checked = toggleToday(habit.id)
    if (checked) {
      burst(window.innerWidth / 2, window.innerHeight * 0.45, 22)
      // Use multi-dimension EXP if available, fallback to single dimension
      const dims = getHabitDimensions(habit.id)
      if (dims.length > 0) {
        addMultiExp(dims)
        const totalExp = dims.reduce((s, d) => s + d.exp, 0)
        const dimNames = dims.map(d => DIM_LABELS[d.dimension]).join('/')
        showToast(totalExp, dimNames)
      } else {
        // Legacy single dimension support
        const dim = habit.dimensions?.[0]?.dimension || 'pro'
        const exp = habit.dimensions?.[0]?.exp || 10
        addExp(dim, exp)
        showToast(exp, DIM_LABELS[dim])
      }
      setTimeout(() => showMorgana(), 600)
    } else {
      // Remove EXP for all dimensions on uncheck
      const dims = getHabitDimensions(habit.id)
      if (dims.length > 0) {
        dims.forEach(d => removeExp(d.dimension, d.exp))
      } else {
        const dim = habit.dimensions?.[0]?.dimension || 'pro'
        const exp = habit.dimensions?.[0]?.exp || 10
        removeExp(dim, exp)
      }
    }
  }, [toggleToday, addExp, addMultiExp, removeExp, getHabitDimensions, burst, showToast, showMorgana])

  const handleAI = useCallback(async (text: string) => {
    // 构建用户上下文（用于 AI 分析）
    const ctx = {
      username: 'USER',
      dimensions: dimensions.map(d => ({ id: d.id, name: d.name, level: d.level, exp: d.exp, maxExp: d.maxExp })),
      habits: habits.map(h => ({ 
        name: h.name, 
        dimensions: h.dimensions?.map(d => ({ dimension: d.dimension, exp: d.exp })) || [{ dimension: 'pro', exp: 10 }], 
        timeSlot: h.timeSlot || 'morning'
      })),
      todayCompleted,
      habitIds: Object.fromEntries(habits.map(h => [h.id, h.name])),
      streak,
      totalExp: 0,
      weekExp: 0,
      recentChecks: 0,
    }

    // 用 AI 智能分析输入（后端会直接写库）
    setAiLoading(true)
    showToast(0, '分析中...')
    
    const result = await analyzeAndAddExp(text, ctx)
    setAiLoading(false)
    
    burst(window.innerWidth / 2, window.innerHeight / 2, 14)
    
    if (result.shouldAddExp && result.dimension) {
      // 同步本地状态（后端已写入）
      addExp(result.dimension, result.exp)
      showToast(result.exp, result.dimension)
      setTimeout(() => showMorgana(`收到！${result.reason} +${result.exp} EXP 已记录在案。`), 500)
    } else {
      // AI 判断不加经验，也给个反馈
      showToast(0, '未识别')
      setTimeout(() => showMorgana(`收到！但这段内容没有实际行动，暂时不给予经验值。继续加油！`), 500)
    }
  }, [dimensions, habits, todayCompleted, streak, addExp, burst, showToast, showMorgana])

  
  return (
    <>
      {/* PAGE wrapper — natural height, body scrolls */}
      <div className="page-container">

        {/* ── HEADER ── */}
        <div style={{ padding: '16px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 52, lineHeight: 0.9, letterSpacing: 6, color: 'var(--white)', transform: 'skewX(-5deg)', display: 'inline-block', position: 'relative' }}>
              ARC<span style={{ color: 'var(--red)' }}>A</span>NA
              <div style={{ position: 'absolute', top: 3, left: 3, fontFamily: 'Bebas Neue,sans-serif', fontSize: 52, letterSpacing: 6, lineHeight: 0.9, color: 'var(--red)', opacity: 0.2, pointerEvents: 'none', userSelect: 'none', transform: 'skewX(-5deg)' }}>ARCANA</div>
            </div>
            <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 9, letterSpacing: 4, color: 'var(--muted)', textTransform: 'uppercase', marginTop: 4, transform: 'skewX(-3deg)', display: 'block' }}>命运由你书写 · YOUR ARCANA</span>
          </div>
          {/* P5风格日期天气时间段 - 右上角 */}
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 20, color: 'var(--white)', letterSpacing: 2, lineHeight: 1 }}>
              {getDateStr().replace(' · ', ' ')}
            </div>
            <div style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 11, color: 'var(--gold)', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
              <span>☀️ +22°C</span>
              <span style={{ color: 'var(--muted)' }}>|</span>
              <span style={{ color: 'var(--red)' }}>{getTimeSlot()}</span>
            </div>
            <div style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 9, color: 'var(--muted)', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'flex-end', marginTop: 2 }}>
              <span style={{ width: 6, height: 6, background: 'var(--red)', transform: 'rotate(45deg)', display: 'inline-block' }} />
              运行中
            </div>
          </div>
        </div>

        {/* ── SLASH DIVIDER ── */}
        <div style={{ position: 'relative', padding: '14px 0 0' }}>
          <div style={{ height: 2, background: 'var(--red)', transform: 'skewX(-12deg)', boxShadow: '0 0 16px rgba(195,0,47,0.6)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 4, left: 0, right: 20, height: 1, background: 'rgba(195,0,47,0.2)' }} />
            <div style={{ position: 'absolute', top: 7, left: 0, right: 60, height: 1, background: 'rgba(195,0,47,0.08)' }} />
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div style={{ padding: '18px 16px 0' }}>

          {/* STREAK BANNER */}
          <div style={{ position: 'relative', background: 'var(--card)', marginBottom: 14, overflow: 'hidden', clipPath: 'polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,14px 100%,0 calc(100% - 14px))' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,var(--red),transparent 70%)' }} />
            <div style={{ position: 'absolute', right: -8, top: '50%', transform: 'translateY(-50%)', fontFamily: 'Bebas Neue,sans-serif', fontSize: 96, lineHeight: 1, color: 'rgba(195,0,47,0.05)', letterSpacing: -4, userSelect: 'none', pointerEvents: 'none' }}>{streak}</div>
            <div style={{ display: 'flex', alignItems: 'center', padding: '12px 18px', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexShrink: 0 }}>
                <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 56, lineHeight: 1, color: 'var(--red)', textShadow: '0 0 30px rgba(195,0,47,0.5)' }}>
                  {streak}
                </div>
                <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 10, letterSpacing: 2, color: 'var(--muted)' }}>DAY</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 9, letterSpacing: 3, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 3 }}>连续打卡</div>
                <div style={{ fontSize: 12, color: 'var(--white)', marginBottom: 6 }}>加油，今天也不能停！</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} style={{ width: 8, height: 8, background: i < (streak % 7 || (streak > 0 ? 7 : 0)) ? 'var(--red)' : 'var(--dim)', transform: 'rotate(45deg)' }} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* QUICK STATS */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            background: 'var(--card)', 
            marginBottom: 14, 
            padding: '12px 16px',
            clipPath: 'polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--white)" strokeWidth="2">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 11, color: 'var(--white)' }}>
                {todayCompleted.length}/{allHabits}
              </span>
              <span style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: 1 }}>完成</span>
            </div>
            <div style={{ width: 1, height: 16, background: 'var(--dim)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <span style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 16, color: 'var(--gold)', letterSpacing: 1 }}>
                +{todayExp}
              </span>
              <span style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: 1 }}>经验</span>
            </div>
            <div style={{ width: 1, height: 16, background: 'var(--dim)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
              <span style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 16, color: 'var(--red)', letterSpacing: 1 }}>
                {totalLevel}
              </span>
              <span style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: 1 }}>Lv</span>
            </div>
          </div>

          {/* TODAY SCHEDULE */}
          <SectionHead label="今日计划" />
          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            {SLOTS.map(slot => (
              <SlotBtn key={slot} slot={slot} active={activeSlot === slot} onClick={() => setActiveSlot(slot)} />
            ))}
          </div>

          {/* HABIT CHAIN */}
          <SectionHead label="习惯链" />
          {slotHabits.length === 0 ? (
            <div style={{ background: 'var(--card)', padding: '24px', textAlign: 'center', clipPath: 'polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%)' }}>
              <div style={{ color: 'var(--muted)', fontFamily: 'Share Tech Mono,monospace', fontSize: 12, letterSpacing: 2 }}>暂无习惯，去习惯页面添加</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {slotHabits.map((habit, i) => (
                <div key={habit.id}>
                  <HabitCard
                    habit={habit}
                    done={todayCompleted.includes(habit.id)}
                    onToggle={() => handleToggle(habit)}
                    index={i}
                  />
                  {i < slotHabits.length - 1 && <ChainConn />}
                </div>
              ))}
            </div>
          )}

        </div>{/* end main content */}
      </div>{/* end page-container */}

      {/* Fixed overlays */}
      <AIInputBar onSubmit={handleAI} disabled={aiLoading} />
      <ExpToast visible={toast.visible} exp={toast.exp} dim={toast.dim} />
      <MorganaDialog
        visible={morgana.visible}
        text={morgana.text}
        onClose={() => setMorgana(m => ({ ...m, visible: false }))}
      />
    </>
  )
}