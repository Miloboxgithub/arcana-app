import { useState, useMemo } from 'react'
import useHabitStore, { type TimeSlot, type DimensionId, type DimensionExp } from '@/stores/useHabitStore'

// ── Constants ─────────────────────────────────────────────
const TIME_SLOTS: { id: TimeSlot; label: string; icon: string }[] = [
  { id: 'morning',   label: '早晨', icon: '🌅' },
  { id: 'afternoon', label: '白天', icon: '☀️' },
  { id: 'evening',   label: '傍晚', icon: '🌆' },
  { id: 'night',     label: '深夜', icon: '🌙' },
]

const DIMENSIONS: { id: DimensionId; label: string; color: string; icon: string; tip: string }[] = [
  { id: 'pro',     label: '专业力', color: '#C3002F', icon: '💻', tip: '学习、coding、阅读、技术提升' },
  { id: 'fitness', label: '体能',   color: '#E8C840', icon: '🏃', tip: '跑步、健身、锻炼、游泳' },
  { id: 'social',  label: '社交',   color: '#4FC3F7', icon: '💬', tip: '社交、聚会、聊天、组队' },
  { id: 'create',  label: '创造力', color: '#A5D6A7', icon: '🎨', tip: '创作、写作、绘画、设计、音乐' },
  { id: 'self',    label: '自律',   color: '#CE93D8', icon: '🧘', tip: '冥想、早起、计划、复盘' },
  { id: 'charm',   label: '魅力',   color: '#FF8A65', icon: '✨', tip: '穿搭、演讲、展示、沟通' },
]

const PRESET_HABITS = [
  { name: '晨跑 / 跑步 30 分钟', dims: [{ dimension: 'fitness' as DimensionId, exp: 20 }], slot: 'morning' as TimeSlot },
  { name: '背单词 30 个', dims: [{ dimension: 'pro' as DimensionId, exp: 15 }], slot: 'morning' as TimeSlot },
  { name: '阅读技术书籍 1 小时', dims: [{ dimension: 'pro' as DimensionId, exp: 25 }], slot: 'afternoon' as TimeSlot },
  { name: '刷算法题 2 道', dims: [{ dimension: 'pro' as DimensionId, exp: 20 }], slot: 'afternoon' as TimeSlot },
  { name: '写作 / 博客 1 篇', dims: [{ dimension: 'create' as DimensionId, exp: 20 }], slot: 'evening' as TimeSlot },
  { name: '冥想 10 分钟', dims: [{ dimension: 'self' as DimensionId, exp: 10 }], slot: 'morning' as TimeSlot },
  { name: '健身 / 力量训练', dims: [{ dimension: 'fitness' as DimensionId, exp: 20 }], slot: 'evening' as TimeSlot },
  { name: '学英语 30 分钟', dims: [{ dimension: 'pro' as DimensionId, exp: 15 }], slot: 'afternoon' as TimeSlot },
  { name: '和朋友聊天 / 社交', dims: [{ dimension: 'social' as DimensionId, exp: 15 }], slot: 'evening' as TimeSlot },
  { name: '绘画 / 创作', dims: [{ dimension: 'create' as DimensionId, exp: 15 }], slot: 'night' as TimeSlot },
]

const DEFAULT_EXP = 15

// ── Sub-components ────────────────────────────────────────

function DiamondCheckbox({ checked, onChange, color }: { checked: boolean; onChange: () => void; color: string }) {
  return (
    <div
      onClick={onChange}
      style={{
        width: 24, height: 24,
        border: `2px solid ${checked ? color : 'var(--muted)'}`,
        background: checked ? color : 'transparent',
        transform: 'rotate(45deg)',
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <span style={{ transform: 'rotate(-45deg)', fontSize: 11, color: 'var(--white)', opacity: checked ? 1 : 0 }}>✓</span>
    </div>
  )
}

function ExpSlider({ value, onChange, color }: { value: number; onChange: (v: number) => void; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <input
        type="range" min="5" max="50" step="5" value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          flex: 1, accentColor: color,
          height: 3,
          cursor: 'pointer',
        }}
      />
      <div style={{
        fontFamily: 'Bebas Neue,sans-serif', fontSize: 16, color,
        minWidth: 36, textAlign: 'right', letterSpacing: 1,
      }}>
        +{value}
      </div>
    </div>
  )
}

function SectionHead({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0 10px' }}>
      <div style={{
        fontFamily: 'Bebas Neue,sans-serif', fontSize: 12, letterSpacing: 3,
        color: 'var(--white)', transform: 'skewX(-4deg)', whiteSpace: 'nowrap',
        display: 'flex', alignItems: 'center',
      }}>
        <span style={{ width: 3, height: 12, background: 'var(--red)', marginRight: 6 }} />
        {label}
      </div>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,var(--dim),transparent)' }} />
    </div>
  )
}

// ── Main Component ──────────────────────────────────────────
interface CreateHabitProps {
  onClose: () => void
}

export default function CreateHabit({ onClose }: CreateHabitProps) {
  const { addHabit, habits } = useHabitStore()

  const [name, setName] = useState('')
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot>('morning')
  // Multi-dimension: each selected dimension has its own exp
  const [dimExps, setDimExps] = useState<Record<DimensionId, { selected: boolean; exp: number }>>({
    pro:     { selected: false, exp: DEFAULT_EXP },
    fitness: { selected: false, exp: DEFAULT_EXP },
    social:  { selected: false, exp: DEFAULT_EXP },
    create:  { selected: false, exp: DEFAULT_EXP },
    self:    { selected: false, exp: DEFAULT_EXP },
    charm:   { selected: false, exp: DEFAULT_EXP },
  })
  const [showPresets, setShowPresets] = useState(true)

  const selectedDimList = useMemo(() => {
    return (Object.entries(dimExps) as [DimensionId, { selected: boolean; exp: number }][])
      .filter(([, v]) => v.selected)
      .map(([dim, v]) => ({ dimension: dim, exp: v.exp }))
  }, [dimExps])

  const totalExp = selectedDimList.reduce((s, d) => s + d.exp, 0)
  const canSave = name.trim().length > 0 && selectedDimList.length > 0

  const handlePreset = (preset: typeof PRESET_HABITS[0]) => {
    setName(preset.name)
    setSelectedSlot(preset.slot)
    const newDimExps = { ...dimExps }
    Object.keys(newDimExps).forEach(k => {
      newDimExps[k as DimensionId] = { selected: false, exp: DEFAULT_EXP }
    })
    preset.dims.forEach(d => {
      if (newDimExps[d.dimension]) {
        newDimExps[d.dimension] = { selected: true, exp: d.exp }
      }
    })
    setDimExps(newDimExps)
    setShowPresets(false)
  }

  const handleSave = () => {
    if (!canSave) return
    addHabit({
      name: name.trim(),
      timeSlot: selectedSlot,
      dimensions: selectedDimList,
      isAnchor: false,
    })
    onClose()
  }


  return (
    <div style={{ maxWidth: 390, margin: '0 auto', padding: '0 0 80px' }}>

      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(8,8,8,0.97)', backdropFilter: 'blur(12px)' }}>
        <div style={{ padding: '14px 16px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 18, padding: 4, lineHeight: 1 }}
          >
            ←
          </button>
          <span style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 20, letterSpacing: 4, color: 'var(--white)', transform: 'skewX(-4deg)', display: 'inline-block' }}>
            新建习惯
          </span>
          <div style={{ marginLeft: 'auto' }}>
            <button
              onClick={handleSave}
              disabled={!canSave}
              style={{
                fontFamily: 'Share Tech Mono,monospace', fontSize: 10, letterSpacing: 2,
                padding: '7px 18px',
                background: canSave ? 'var(--red)' : 'var(--dim)',
                border: 'none', cursor: canSave ? 'pointer' : 'not-allowed',
                clipPath: 'polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)',
                color: canSave ? 'var(--white)' : 'var(--muted)',
                opacity: canSave ? 1 : 0.5,
                transition: 'all 0.2s',
              }}
            >
              保存
            </button>
          </div>
        </div>
        <div style={{ height: 2, background: 'var(--red)', transform: 'skewX(-12deg)', boxShadow: '0 0 16px rgba(195,0,47,0.6)' }} />
      </div>

      <div style={{ padding: '18px 16px 0' }}>

        {/* Habit name */}
        <SectionHead label="习惯名称" />
        <div style={{ position: 'relative' }}>
          <input
            value={name}
            onChange={e => { setName(e.target.value); setShowPresets(false) }}
            placeholder="例如：晨跑 30 分钟、刷算法题 2 道…"
            style={{
              width: '100%', background: 'var(--card)', border: `1px solid ${name.trim() ? 'var(--red)' : 'var(--dim)'}`,
              outline: 'none', color: 'var(--white)', fontSize: 14,
              fontFamily: 'Noto Sans SC,sans-serif',
              padding: '12px 16px',
              clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
              boxShadow: name.trim() ? '0 0 16px rgba(195,0,47,0.15)' : 'none',
              transition: 'all 0.3s',
            }}
          />
          {name.trim() && (
            <div style={{
              position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
              width: 16, height: 16, background: 'var(--red)', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, color: 'white', cursor: 'pointer',
            }}
              onClick={() => { setName(''); setShowPresets(true) }}
            >
              ✕
            </div>
          )}
        </div>

        {/* Presets */}
        {showPresets && (
          <>
            <SectionHead label="快速模板" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {PRESET_HABITS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handlePreset(p)}
                  style={{
                    fontFamily: 'Noto Sans SC,sans-serif', fontSize: 11,
                    padding: '5px 12px',
                    background: 'rgba(195,0,47,0.07)',
                    border: '1px solid rgba(195,0,47,0.15)',
                    color: 'rgba(255,255,255,0.7)',
                    cursor: 'pointer',
                    clipPath: 'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)',
                    transition: 'all 0.2s',
                    textAlign: 'left',
                    letterSpacing: 0.3,
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Time slot */}
        <SectionHead label="时间段" />
        <div style={{ display: 'flex', gap: 6 }}>
          {TIME_SLOTS.map(slot => (
            <button
              key={slot.id}
              onClick={() => setSelectedSlot(slot.id)}
              style={{
                flex: 1, padding: '10px 4px',
                background: selectedSlot === slot.id ? 'rgba(195,0,47,0.2)' : 'var(--card2)',
                border: `1px solid ${selectedSlot === slot.id ? 'var(--red)' : 'var(--dim)'}`,
                color: selectedSlot === slot.id ? 'var(--white)' : 'var(--muted)',
                cursor: 'pointer',
                clipPath: 'polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)',
                transition: 'all 0.2s',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}
            >
              <span style={{ fontSize: 16 }}>{slot.icon}</span>
              <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 8, letterSpacing: 1 }}>{slot.label}</span>
            </button>
          ))}
        </div>

        {/* Dimension selection */}
        <SectionHead label="绑定维度（可多选）" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {DIMENSIONS.map(dim => {
            const state = dimExps[dim.id]
            return (
              <div key={dim.id} style={{
                background: 'var(--card)',
                padding: '10px 12px',
                clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
                borderLeft: `3px solid ${state.selected ? dim.color : 'transparent'}`,
                transition: 'all 0.2s',
                opacity: state.selected ? 1 : 0.5,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <DiamondCheckbox
                    checked={state.selected}
                    onChange={() => setDimExps(prev => ({
                      ...prev,
                      [dim.id]: { ...prev[dim.id], selected: !prev[dim.id].selected }
                    }))}
                    color={dim.color}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 14 }}>{dim.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: state.selected ? dim.color : 'var(--muted)' }}>
                        {dim.label}
                      </span>
                    </div>
                    <div style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 8, color: 'var(--muted)', letterSpacing: 0.5, paddingLeft: 24 }}>
                      {dim.tip}
                    </div>
                  </div>
                </div>
                {state.selected && (
                  <div style={{ paddingLeft: 34, paddingTop: 8 }}>
                    <ExpSlider
                      value={state.exp}
                      onChange={v => setDimExps(prev => ({
                        ...prev,
                        [dim.id]: { ...prev[dim.id], exp: v }
                      }))}
                      color={dim.color}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Summary */}
        {selectedDimList.length > 0 && (
          <div style={{
            marginTop: 20, background: 'rgba(195,0,47,0.06)',
            border: '1px solid rgba(195,0,47,0.2)',
            padding: '12px 16px',
            clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 100%)',
          }}>
            <div style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 8, color: 'var(--muted)', letterSpacing: 2, marginBottom: 8 }}>
              习惯预览
            </div>
            <div style={{ fontSize: 13, color: 'var(--white)', marginBottom: 6, fontWeight: 700 }}>
              {name || '（习惯名称）'}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {selectedDimList.map(d => {
                const dim = DIMENSIONS.find(dim => dim.id === d.dimension)!
                return (
                  <span key={d.dimension} style={{
                    fontFamily: 'Share Tech Mono,monospace', fontSize: 9,
                    padding: '2px 8px',
                    background: `${dim.color}20`,
                    border: `1px solid ${dim.color}55`,
                    color: dim.color,
                    clipPath: 'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)',
                    letterSpacing: 1,
                  }}>
                    {dim.label} +{d.exp}
                  </span>
                )
              })}
              <span style={{
                fontFamily: 'Bebas Neue,sans-serif', fontSize: 14,
                color: 'var(--gold)', marginLeft: 4,
              }}>
                = +{totalExp} EXP
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
