import { useState } from 'react'
import useHabitStore, { type TimeSlot, type DimensionId } from '@/stores/useHabitStore'
import useUIStore from '@/stores/useUIStore'

// ── Constants ──────────────────────────────────────────────
const DIM_LABELS: Record<DimensionId, string> = {
  pro: '专业力', fitness: '体能', social: '社交',
  create: '创造力', self: '自律', charm: '魅力',
}

const SLOT_CONFIG: Record<TimeSlot, { label: string; cn: string }> = {
  morning:   { label: '早晨', cn: 'morning'   },
  afternoon: { label: '白天', cn: 'afternoon' },
  evening:   { label: '傍晚', cn: 'evening'   },
  night:     { label: '夜晚', cn: 'night'     },
}

const SLOTS: TimeSlot[] = ['morning', 'afternoon', 'evening', 'night']

const DIMS: DimensionId[] = ['pro', 'fitness', 'social', 'create', 'self', 'charm']

// ── SVG slot icons (same as prototype) ─────────────────────
function SlotIcon({ slot }: { slot: TimeSlot }) {
  if (slot === 'morning') return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4" fill="currentColor"/>
      <line x1="12" y1="2" x2="12" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="2" y1="12" x2="5" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="19" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
  if (slot === 'afternoon') return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="5" fill="currentColor"/>
      <line x1="12" y1="2" x2="12" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="2" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="18" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
  if (slot === 'evening') return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M12 3a9 9 0 0 0 0 18 9 9 0 0 0 6.36-2.64A7 7 0 0 1 9 8a7 7 0 0 1 6.36-5A9 9 0 0 0 12 3z" fill="currentColor" opacity="0.7"/>
      <circle cx="12" cy="12" r="2.5" fill="currentColor"/>
    </svg>
  )
  // night / moon
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" fill="currentColor"/>
      <circle cx="18" cy="5" r="0.8" fill="currentColor" opacity="0.6"/>
      <circle cx="21" cy="9" r="0.5" fill="currentColor" opacity="0.4"/>
    </svg>
  )
}

// Slot icon background/color
const SLOT_ICO_STYLE: Record<TimeSlot, { background: string; color: string }> = {
  morning:   { background: 'rgba(255,175,0,0.1)',   color: 'rgba(255,175,0,0.75)' },
  afternoon: { background: 'rgba(255,120,0,0.1)',   color: 'rgba(255,120,0,0.8)' },
  evening:   { background: 'rgba(195,0,47,0.1)',    color: 'var(--red)' },
  night:     { background: 'rgba(110,100,200,0.1)', color: 'rgba(150,140,230,0.75)' },
}

// ── Chain connector (div-based, no ::before) ───────────────
function ChainSm() {
  return (
    <div style={{
      display: 'flex', padding: '0 0 0 15px',
      height: 12, alignItems: 'center', position: 'relative',
    }}>
      {/* vertical line replacing ::before */}
      <div style={{
        position: 'absolute', left: 16, top: 0, bottom: 0,
        width: 1, background: 'rgba(195,0,47,0.12)',
      }} />
      {/* small arrow triangle */}
      <svg width="8" height="8" viewBox="0 0 14 14" fill="none" style={{ position: 'relative', zIndex: 1 }}>
        <polygon points="7,14 0,0 14,0" fill="rgba(195,0,47,0.3)"/>
      </svg>
    </div>
  )
}

// ── Section head ───────────────────────────────────────────
function SectionHead({ label, count }: { label: string; count: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0 14px' }}>
      {/* section-tag: red bar + skewed label */}
      <div style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 13, letterSpacing: 4, color: 'var(--white)',
        transform: 'skewX(-5deg)', whiteSpace: 'nowrap',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        {/* ::before red bar — inlined */}
        <span style={{ display: 'inline-block', width: 3, height: 14, background: 'var(--red)', flexShrink: 0 }} />
        {label}
      </div>
      {/* rule */}
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,var(--dim),transparent)' }} />
      {/* slot-cnt badge */}
      <span style={{
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: 9, color: 'var(--muted)', whiteSpace: 'nowrap',
        padding: '2px 8px', border: '1px solid var(--dim)',
      }}>
        {count}
      </span>
    </div>
  )
}

// ── AI Analysis Function ───────────────────────────────────
async function analyzeHabitWithAI(habitName: string): Promise<{ dimensions: { dimension: DimensionId; exp: number }[] }> {
  // Simple rule-based analysis (can be replaced with real AI later)
  const name = habitName.toLowerCase()
  
  // Keywords mapping to dimensions
  const keywordMap: Record<string, { dimension: DimensionId; weight: number }[]> = {
    '跑步': [{ dimension: 'fitness', weight: 1.0 }],
    '足球': [{ dimension: 'fitness', weight: 0.8 }, { dimension: 'social', weight: 0.5 }],
    '篮球': [{ dimension: 'fitness', weight: 0.8 }, { dimension: 'social', weight: 0.4 }],
    '健身': [{ dimension: 'fitness', weight: 1.0 }],
    '运动': [{ dimension: 'fitness', weight: 1.0 }],
    '游泳': [{ dimension: 'fitness', weight: 1.0 }],
    '瑜伽': [{ dimension: 'fitness', weight: 0.6 }, { dimension: 'self', weight: 0.4 }],
    
    '学习': [{ dimension: 'pro', weight: 1.0 }],
    '读书': [{ dimension: 'pro', weight: 0.8 }, { dimension: 'self', weight: 0.4 }],
    '编程': [{ dimension: 'pro', weight: 1.0 }],
    '写代码': [{ dimension: 'pro', weight: 1.0 }],
    '英语': [{ dimension: 'pro', weight: 1.0 }],
    '背单词': [{ dimension: 'pro', weight: 1.0 }],
    '听力': [{ dimension: 'pro', weight: 0.8 }],
    
    '社交': [{ dimension: 'social', weight: 1.0 }],
    '聚会': [{ dimension: 'social', weight: 1.0 }, { dimension: 'charm', weight: 0.3 }],
    '聊天': [{ dimension: 'social', weight: 0.6 }],
    '朋友': [{ dimension: 'social', weight: 0.7 }],
    '交流': [{ dimension: 'social', weight: 0.8 }],
    
    '画画': [{ dimension: 'create', weight: 1.0 }],
    '音乐': [{ dimension: 'create', weight: 1.0 }],
    '创作': [{ dimension: 'create', weight: 1.0 }],
    '写作': [{ dimension: 'create', weight: 0.9 }, { dimension: 'pro', weight: 0.3 }],
    '设计': [{ dimension: 'create', weight: 1.0 }],
    
    '冥想': [{ dimension: 'self', weight: 1.0 }],
    '反思': [{ dimension: 'self', weight: 1.0 }],
    '计划': [{ dimension: 'self', weight: 0.8 }],
    '总结': [{ dimension: 'self', weight: 0.8 }],
    '早起': [{ dimension: 'self', weight: 1.0 }],
    '早睡': [{ dimension: 'self', weight: 1.0 }, { dimension: 'fitness', weight: 0.3 }],
    '睡眠': [{ dimension: 'self', weight: 0.5 }, { dimension: 'fitness', weight: 0.3 }],
    
    '穿搭': [{ dimension: 'charm', weight: 1.0 }],
    '美容': [{ dimension: 'charm', weight: 1.0 }],
    '护肤': [{ dimension: 'charm', weight: 1.0 }],
    '化妆': [{ dimension: 'charm', weight: 1.0 }],
    '自拍': [{ dimension: 'charm', weight: 0.6 }, { dimension: 'social', weight: 0.3 }],
  }
  
  // Default: pro dimension
  let results: { dimension: DimensionId; exp: number }[] = []
  
  for (const [keyword, dims] of Object.entries(keywordMap)) {
    if (name.includes(keyword)) {
      for (const d of dims) {
        const existing = results.find(r => r.dimension === d.dimension)
        if (existing) {
          existing.exp = Math.max(existing.exp, Math.round(20 * d.weight))
        } else {
          results.push({ dimension: d.dimension, exp: Math.round(20 * d.weight) })
        }
      }
    }
  }
  
  // If no match, default to pro
  if (results.length === 0) {
    results = [{ dimension: 'pro', exp: 20 }]
  }
  
  return { dimensions: results }
}

// ── Add Habit Modal ────────────────────────────────────────
interface AddModalProps {
  open: boolean
  onClose: () => void
  onAdd: (name: string, dims: { dimension: DimensionId; exp: number }[], slot: TimeSlot) => void
}

function AddModal({ open, onClose, onAdd }: AddModalProps) {
  const [name, setName] = useState('')
  const [dims, setDims] = useState<{ dimension: DimensionId; exp: number }[]>([{ dimension: 'pro', exp: 20 }])
  const [slot, setSlot] = useState<TimeSlot>('afternoon')
  const [analyzing, setAnalyzing] = useState(false)

  if (!open) return null

  const handleConfirm = () => {
    if (!name.trim() || dims.length === 0) return
    onAdd(name.trim(), dims, slot)
    // reset
    setName(''); setDims([{ dimension: 'pro', exp: 20 }]); setSlot('afternoon')
    onClose()
  }

  const handleAIAnalyze = async () => {
    if (!name.trim()) return
    setAnalyzing(true)
    try {
      const result = await analyzeHabitWithAI(name)
      setDims(result.dimensions)
    } catch (e) {
      console.error('AI分析失败', e)
    }
    setAnalyzing(false)
  }

  const updateDimExp = (dimId: DimensionId, newExp: number) => {
    setDims(prev => prev.map(d => d.dimension === dimId ? { ...d, exp: newExp } : d))
  }

  const removeDim = (dimId: DimensionId) => {
    if (dims.length <= 1) return // Keep at least one
    setDims(prev => prev.filter(d => d.dimension !== dimId))
  }

  const addDim = (dimId: DimensionId) => {
    if (dims.find(d => d.dimension === dimId)) return // Already exists
    setDims(prev => [...prev, { dimension: dimId, exp: 10 }])
  }

  // chip base styles
  const chipBase: React.CSSProperties = {
    background: 'var(--card2)', border: '1px solid var(--dim)',
    color: 'var(--muted)', fontFamily: "'Share Tech Mono', monospace",
    fontSize: 9, letterSpacing: 1, padding: '5px 11px',
    cursor: 'pointer',
    clipPath: 'polygon(4px 0,100% 0,calc(100% - 4px) 100%,0 100%)',
    transition: 'all 0.15s',
  }
  const chipActive: React.CSSProperties = {
    ...chipBase,
    background: 'rgba(195,0,47,0.15)', borderColor: 'var(--red)', color: 'var(--red)',
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.8)',
        zIndex: 200, display: 'flex', alignItems: 'flex-end',
        backdropFilter: 'blur(6px)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'var(--card)',
        width: '100%', maxWidth: 390, margin: '0 auto',
        padding: '22px 20px 36px',
        clipPath: 'polygon(10px 0,100% 0,100% 100%,0 100%,0 10px)',
        borderTop: '2px solid var(--red)',
      }}>
        {/* Modal title */}
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 18, letterSpacing: 5, color: 'var(--white)',
          marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ width: 3, height: 18, background: 'var(--red)', display: 'inline-block' }} />
          新建习惯
        </div>

        {/* Name field - with AI Analyze button */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
            <label style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 9, color: 'var(--muted)', letterSpacing: 2,
              textTransform: 'uppercase',
            }}>
              习惯名称
            </label>
            <button
              onClick={handleAIAnalyze}
              disabled={!name.trim() || analyzing}
              style={{
                background: 'transparent', border: '1px solid var(--gold)',
                color: 'var(--gold)', fontFamily: "'Share Tech Mono', monospace",
                fontSize: 8, letterSpacing: 1, padding: '3px 8px',
                cursor: analyzing ? 'wait' : 'pointer', opacity: analyzing ? 0.6 : 1,
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              {analyzing ? (
                <>分析中...</>
              ) : (
                <>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  AI 分析
                </>
              )}
            </button>
          </div>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleConfirm()}
            placeholder="例：踢足球、跑步、读书"
            style={{
              width: '100%', background: 'var(--card2)',
              border: `1px solid ${name ? 'var(--red)' : 'var(--dim)'}`,
              color: 'var(--white)', padding: '9px 14px',
              fontSize: 13, fontFamily: "'Noto Sans SC', sans-serif",
              outline: 'none',
              clipPath: 'polygon(6px 0,100% 0,calc(100% - 6px) 100%,0 100%)',
              transition: 'border-color 0.2s', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Multi-dimension selector */}
        <div style={{ marginBottom: 14 }}>
          <label style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 9, color: 'var(--muted)', letterSpacing: 2,
            textTransform: 'uppercase', display: 'block', marginBottom: 7,
          }}>
            经验维度 {dims.length > 1 && <span style={{ color: 'var(--gold)' }}>(多维)</span>}
          </label>
          
          {/* Selected dimensions with EXP sliders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
            {dims.map(d => (
              <div key={d.dimension} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'var(--card2)', padding: '6px 10px',
                  border: '1px solid var(--dim)',
                }}>
                  <span style={{ color: 'var(--white)', fontSize: 11 }}>{DIM_LABELS[d.dimension]}</span>
                  <span style={{ color: 'var(--gold)', fontFamily: "'Bebas Neue', sans-serif", fontSize: 14 }}>
                    +{d.exp}
                  </span>
                </div>
                <input
                  type="range" min={5} max={50} step={5} value={d.exp}
                  onChange={e => updateDimExp(d.dimension, Number(e.target.value))}
                  style={{ flex: 1, accentColor: 'var(--red)' }}
                />
                {dims.length > 1 && (
                  <button
                    onClick={() => removeDim(d.dimension)}
                    style={{
                      background: 'transparent', border: 'none', color: 'var(--muted)',
                      cursor: 'pointer', padding: 4, fontSize: 14,
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {/* Add more dimensions - can add all 6 dims */}
          {dims.length < 6 && (
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {DIMS.filter(d => !dims.find(sel => sel.dimension === d)).map(d => (
                <button
                  key={d}
                  onClick={() => addDim(d)}
                  style={chipBase}
                >
                  + {DIM_LABELS[d]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Time slot chips */}
        <div style={{ marginBottom: 14 }}>
          <label style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 9, color: 'var(--muted)', letterSpacing: 2,
            textTransform: 'uppercase', display: 'block', marginBottom: 7,
          }}>
            时间槽
          </label>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {SLOTS.map(s => (
              <button
                key={s}
                onClick={() => setSlot(s)}
                style={s === slot ? chipActive : chipBase}
              >
                {SLOT_CONFIG[s].label}
              </button>
            ))}
          </div>
        </div>

        {/* Confirm button */}
        <button
          onClick={handleConfirm}
          style={{
            width: '100%', background: 'var(--red)',
            border: 'none', color: 'var(--white)',
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 16, letterSpacing: 4,
            padding: 14, cursor: 'pointer',
            clipPath: 'polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%)',
            marginTop: 4, transition: 'opacity 0.2s',
            opacity: name.trim() && dims.length > 0 ? 1 : 0.5,
          }}
          onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.8' }}
          onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.opacity = name.trim() ? '1' : '0.5' }}
        >
          确认 ▶
        </button>
      </div>
    </div>
  )
}

// ── MAIN: Habits Page ──────────────────────────────────────
export default function Habits() {
  const { getHabitsBySlot, addHabit, removeHabit } = useHabitStore()
  const { openModal, closeModal } = useUIStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const openAddModal = () => { setModalOpen(true); openModal() }
  const closeAddModal = () => { setModalOpen(false); closeModal() }

  const handleAdd = async (name: string, dims: { dimension: DimensionId; exp: number }[], slot: TimeSlot) => {
    setActionLoading('add')
    await new Promise(r => setTimeout(r, 300))
    addHabit({ name, dimensions: dims, timeSlot: slot, isAnchor: false })
    setActionLoading(null)
  }

  const handleRemove = async (habitId: string) => {
    setActionLoading('remove_' + habitId)
    await new Promise(r => setTimeout(r, 300))
    removeHabit(habitId)
    setActionLoading(null)
  }

  return (
    <>
      <div className="page-container">

        {/* ── PAGE HEADER ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px 0',
        }}>
          <span style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 18, letterSpacing: 5, color: 'var(--white)',
            transform: 'skewX(-4deg)', display: 'inline-block',
          }}>
            习惯
          </span>
          <span style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 9, color: 'var(--red)', letterSpacing: 2,
            border: '1px solid rgba(195,0,47,0.4)', padding: '3px 8px',
            clipPath: 'polygon(4px 0,100% 0,calc(100% - 4px) 100%,0 100%)',
          }}>
            连锁模式
          </span>
        </div>

        {/* ── SLASH DIVIDER ── */}
        <div style={{ position: 'relative', padding: '14px 0 0' }}>
          <div style={{
            height: 2, background: 'var(--red)',
            transform: 'skewX(-12deg)',
            boxShadow: '0 0 16px rgba(195,0,47,0.6)',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: 4, left: 0, right: 20,
              height: 1, background: 'rgba(195,0,47,0.2)',
            }} />
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div style={{ padding: '18px 16px 0' }}>

          {/* Add button */}
          <button
            onClick={openAddModal}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 8, background: 'transparent',
              border: '1px dashed rgba(195,0,47,0.35)', color: 'var(--red)',
              padding: 11, cursor: 'pointer',
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 13, letterSpacing: 3,
              marginBottom: 16,
              clipPath: 'polygon(6px 0,100% 0,calc(100% - 6px) 100%,0 100%)',
              width: '100%',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <line x1="7" y1="1" x2="7" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="1" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            新建习惯
          </button>

          {/* ── THREE SLOT SECTIONS ── */}
          {SLOTS.map(slot => {
            const habits = getHabitsBySlot(slot)
            const { label } = SLOT_CONFIG[slot]
            const icoStyle = SLOT_ICO_STYLE[slot]

            return (
              <div key={slot}>
                <SectionHead label={label} count={habits.length} />

                {habits.length === 0 ? (
                  <div style={{
                    background: 'var(--card)', padding: '18px 14px',
                    textAlign: 'center',
                    clipPath: 'polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%)',
                    marginBottom: 2,
                  }}>
                    <span style={{
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: 11, color: 'var(--muted)', letterSpacing: 2,
                    }}>
                      暂无习惯
                    </span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 4 }}>
                    {habits.map((habit, idx) => (
                      <div key={habit.id}>
                        {/* ── Habit Card ── */}
                        <div style={{
                          position: 'relative',
                          background: 'var(--card)',
                          padding: '11px 14px',
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'space-between', gap: 10,
                          clipPath: 'polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%)',
                          marginBottom: 2, overflow: 'hidden',
                          borderLeft: habit.isAnchor ? '2px solid var(--gold)' : '2px solid var(--dim)',
                        }}>
                          {/* Anchor label */}
                          {habit.isAnchor && (
                            <div style={{
                              position: 'absolute', top: 5, right: 38,
                              fontFamily: "'Share Tech Mono', monospace",
                              fontSize: 7, letterSpacing: 2,
                              color: 'var(--gold)', opacity: 0.6,
                            }}>
                              锚点
                            </div>
                          )}

                          {/* Left side: icon + info */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                            {/* slot icon box */}
                            <div style={{
                              width: 30, height: 30,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0,
                              clipPath: 'polygon(4px 0,100% 0,calc(100% - 4px) 100%,0 100%)',
                              background: icoStyle.background,
                              color: icoStyle.color,
                            }}>
                              <SlotIcon slot={slot} />
                            </div>

                            {/* name + tags */}
                            <div style={{ minWidth: 0 }}>
                              <div style={{
                                fontSize: 13, fontWeight: 700,
                                color: 'var(--white)', marginBottom: 4,
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                              }}>
                                {habit.name}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                {/* htag - show all dimensions */}
                                {habit.dimensions?.map(d => (
                                  <span key={d.dimension} style={{
                                    fontSize: 9, fontFamily: "'Share Tech Mono', monospace",
                                    letterSpacing: 1, padding: '2px 8px',
                                    background: 'rgba(195,0,47,0.12)', color: 'var(--red)',
                                    clipPath: 'polygon(4px 0,100% 0,calc(100% - 4px) 100%,0 100%)',
                                    display: 'inline-block',
                                    border: '1px solid rgba(195,0,47,0.25)',
                                  }}>
                                    {DIM_LABELS[d.dimension] || d.dimension}
                                  </span>
                                ))}
                                {/* hexp - total exp */}
                                <span style={{
                                  fontSize: 10, fontFamily: "'Share Tech Mono', monospace",
                                  color: 'var(--gold)',
                                }}>
                                  +{habit.dimensions?.reduce((s, d) => s + d.exp, 0) || 0} EXP
                                </span>
                                {/* hm-freq */}
                                <span style={{
                                  fontFamily: "'Share Tech Mono', monospace",
                                  fontSize: 8, color: 'var(--muted)', letterSpacing: 1,
                                }}>
                                  每天
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right side: streak */}
                          <div style={{
                            fontFamily: "'Bebas Neue', sans-serif",
                            fontSize: 22, color: 'var(--red)', lineHeight: 1,
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            flexShrink: 0,
                          }}>
                            {habit.streak}
                            <span style={{
                              fontFamily: "'Share Tech Mono', monospace",
                              fontSize: 7, color: 'var(--muted)',
                            }}>
                              天
                            </span>
                          </div>

                          {/* Delete × button */}
                          <button
                            onClick={() => handleRemove(habit.id)}
                            disabled={actionLoading === 'remove_' + habit.id}
                            style={{
                              background: 'none', border: 'none',
                              color: actionLoading === 'remove_' + habit.id ? 'var(--gold)' : 'var(--muted)', 
                              cursor: actionLoading === 'remove_' + habit.id ? 'wait' : 'pointer',
                              fontSize: 14, lineHeight: 1,
                              padding: '2px 4px', flexShrink: 0,
                              transition: 'color 0.15s',
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--red)' }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted)' }}
                            title="删除习惯"
                          >
                            ×
                          </button>
                        </div>

                        {/* chain-sm connector (between cards only) */}
                        {idx < habits.length - 1 && <ChainSm />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {/* bottom padding */}
          <div style={{ height: 100 }} />
        </div>
      </div>

      {/* ── ADD HABIT MODAL ── */}
      <AddModal
        open={modalOpen}
        onClose={closeAddModal}
        onAdd={handleAdd}
      />
    </>
  )
}
