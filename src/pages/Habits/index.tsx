import { useState } from 'react'
import useHabitStore, { type TimeSlot, type DimensionId } from '@/stores/useHabitStore'

// ── Constants ──────────────────────────────────────────────
const DIM_LABELS: Record<DimensionId, string> = {
  pro: '专业力', fitness: '体能', social: '社交',
  create: '创造力', self: '自律', charm: '魅力',
}

const SLOT_CONFIG: Record<TimeSlot, { label: string; cn: string }> = {
  morning:   { label: '早晨', cn: 'morning'   },
  afternoon: { label: '下午', cn: 'afternoon' },
  evening:   { label: '夜晚', cn: 'evening'   },
}

const SLOTS: TimeSlot[] = ['morning', 'afternoon', 'evening']

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
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
        fill="currentColor" opacity="0.9"/>
    </svg>
  )
  // evening / moon
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" fill="currentColor"/>
    </svg>
  )
}

// Slot icon background/color
const SLOT_ICO_STYLE: Record<TimeSlot, { background: string; color: string }> = {
  morning:   { background: 'rgba(255,175,0,0.1)',   color: 'rgba(255,175,0,0.75)' },
  afternoon: { background: 'rgba(195,0,47,0.1)',    color: 'var(--red)' },
  evening:   { background: 'rgba(110,100,200,0.1)', color: 'rgba(150,140,230,0.75)' },
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

// ── Add Habit Modal ────────────────────────────────────────
interface AddModalProps {
  open: boolean
  onClose: () => void
  onAdd: (name: string, dim: DimensionId, slot: TimeSlot, exp: number) => void
}

function AddModal({ open, onClose, onAdd }: AddModalProps) {
  const [name, setName]     = useState('')
  const [dim, setDim]       = useState<DimensionId>('pro')
  const [slot, setSlot]     = useState<TimeSlot>('afternoon')
  const [exp, setExp]       = useState(20)

  if (!open) return null

  const handleConfirm = () => {
    if (!name.trim()) return
    onAdd(name.trim(), dim, slot, exp)
    // reset
    setName(''); setDim('pro'); setSlot('afternoon'); setExp(20)
    onClose()
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

        {/* Name field */}
        <div style={{ marginBottom: 14 }}>
          <label style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 9, color: 'var(--muted)', letterSpacing: 2,
            textTransform: 'uppercase', display: 'block', marginBottom: 7,
          }}>
            习惯名称
          </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleConfirm()}
            placeholder="例：跑步 5km"
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

        {/* Dimension chips */}
        <div style={{ marginBottom: 14 }}>
          <label style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 9, color: 'var(--muted)', letterSpacing: 2,
            textTransform: 'uppercase', display: 'block', marginBottom: 7,
          }}>
            绑定维度
          </label>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {DIMS.map(d => (
              <button
                key={d}
                onClick={() => setDim(d)}
                style={d === dim ? chipActive : chipBase}
              >
                {DIM_LABELS[d]}
              </button>
            ))}
          </div>
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

        {/* EXP slider */}
        <div style={{ marginBottom: 14 }}>
          <label style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 9, color: 'var(--muted)', letterSpacing: 2,
            textTransform: 'uppercase', display: 'block', marginBottom: 7,
          }}>
            EXP 奖励
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              type="range" min={5} max={50} step={5} value={exp}
              onChange={e => setExp(Number(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--red)' }}
            />
            <span style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 18, color: 'var(--gold)', minWidth: 72,
            }}>
              +{exp} EXP
            </span>
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
            opacity: name.trim() ? 1 : 0.5,
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
  const [modalOpen, setModalOpen] = useState(false)

  const handleAdd = (name: string, dimension: DimensionId, slot: TimeSlot, exp: number) => {
    addHabit({ name, dimension, timeSlot: slot, exp, isAnchor: false })
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
            onClick={() => setModalOpen(true)}
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
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                {/* htag */}
                                <span style={{
                                  fontSize: 9, fontFamily: "'Share Tech Mono', monospace",
                                  letterSpacing: 1, padding: '2px 8px',
                                  background: 'rgba(195,0,47,0.12)', color: 'var(--red)',
                                  clipPath: 'polygon(4px 0,100% 0,calc(100% - 4px) 100%,0 100%)',
                                  display: 'inline-block',
                                  border: '1px solid rgba(195,0,47,0.25)',
                                }}>
                                  {DIM_LABELS[habit.dimension]}
                                </span>
                                {/* hexp */}
                                <span style={{
                                  fontSize: 10, fontFamily: "'Share Tech Mono', monospace",
                                  color: 'var(--gold)',
                                }}>
                                  +{habit.exp} EXP
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
                            onClick={() => removeHabit(habit.id)}
                            style={{
                              background: 'none', border: 'none',
                              color: 'var(--muted)', cursor: 'pointer',
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
        onClose={() => setModalOpen(false)}
        onAdd={handleAdd}
      />
    </>
  )
}
