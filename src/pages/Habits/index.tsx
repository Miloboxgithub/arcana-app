import { useState } from 'react'
import useHabitStore, { type TimeSlot, type Habit } from '@/stores/useHabitStore'
import { toast } from '@/components/ui/Toast'

const TIME_SLOTS: { id: TimeSlot; label: string; color: string }[] = [
  { id: 'morning',   label: '早晨', color: '#FFD54F' },
  { id: 'afternoon', label: '白天', color: '#FF7043' },
  { id: 'evening',   label: '傍晚', color: '#AB47BC' },
  { id: 'night',     label: '深夜', color: '#42A5F5' },
]

const DIM_COLORS: Record<string, string> = {
  pro: '#C3002F', fitness: '#E8C840', social: '#4FC3F7',
  create: '#A5D6A7', self: '#CE93D8', charm: '#FF8A65',
}

function SlotGroup({ slot, habits, onDelete }: { slot: typeof TIME_SLOTS[0]; habits: Habit[]; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(true)
  const todayCompleted = useHabitStore(s => s.todayCompleted)
  const done = habits.filter(h => todayCompleted.includes(h.id)).length

  return (
    <div style={{ marginBottom: 14 }}>
      <div onClick={() => setExpanded(!expanded)} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: expanded && habits.length > 0 ? 8 : 0 }}>
        <div style={{ width: 8, height: 8, background: slot.color, transform: 'rotate(45deg)', flexShrink: 0 }} />
        <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 9, letterSpacing: 2, color: slot.color }}>{slot.label}</span>
        <div style={{ flex: 1, height: 1, background: `${slot.color}33` }} />
        <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 9, color: 'var(--muted)' }}>{done}/{habits.length}</span>
        <span style={{ fontSize: 10, color: 'var(--muted)', transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>›</span>
      </div>

      {expanded && habits.length > 0 && habits.map(h => (
        <HabitRow key={h.id} habit={h} onDelete={onDelete} />
      ))}
      {expanded && habits.length === 0 && (
        <div style={{ padding: '8px 12px', fontFamily: 'Share Tech Mono,monospace', fontSize: 8, color: 'var(--muted)', letterSpacing: 1 }}>
          暂无习惯
        </div>
      )}
    </div>
  )
}

function HabitRow({ habit, onDelete }: { habit: Habit; onDelete: (id: string) => void }) {
  const todayCompleted = useHabitStore(s => s.todayCompleted)
  const todayDone = todayCompleted.includes(habit.id)
  const totalExp = habit.dimensions?.reduce((s, d) => s + d.exp, 0) || 0

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'var(--card)', padding: '10px 12px', marginBottom: 3,
      clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
      borderLeft: `2px solid ${todayDone ? '#1DB954' : 'var(--dim)'}`,
      opacity: todayDone ? 0.6 : 1,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: todayDone ? 'rgba(255,255,255,0.4)' : 'var(--white)', textDecoration: todayDone ? 'line-through' : 'none', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {habit.name}
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {habit.dimensions?.map(d => (
            <span key={d.dimension} style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 7, padding: '1px 6px', background: `${DIM_COLORS[d.dimension] || '#888'}18`, border: `1px solid ${DIM_COLORS[d.dimension] || '#888'}44`, color: DIM_COLORS[d.dimension] || '#888', clipPath: 'polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)', letterSpacing: 0.5 }}>
              +{d.exp}
            </span>
          ))}
          {habit.streak > 0 && (
            <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 7, padding: '1px 6px', background: 'rgba(195,0,47,0.1)', border: '1px solid rgba(195,0,47,0.25)', color: 'var(--red)', letterSpacing: 0.5 }}>
              🔥 {habit.streak}
            </span>
          )}
        </div>
      </div>
      <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 18, color: 'var(--gold)', letterSpacing: 1, flexShrink: 0 }}>+{totalExp}</div>
      <button onClick={() => onDelete(habit.id)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 14, padding: 4, flexShrink: 0 }}>✕</button>
    </div>
  )
}

export default function Habits({ onCreateHabit }: { onCreateHabit: () => void }) {
  const { habits, removeHabit } = useHabitStore()
  const todayCompleted = useHabitStore(s => s.todayCompleted)
  const checkRecords = useHabitStore(s => s.checkRecords)
  const getStreak = useHabitStore.getState().getStreak

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const habitsBySlot = (slot: TimeSlot) => habits.filter(h => h.timeSlot === slot)
  const todayExp = habits.filter(h => todayCompleted.includes(h.id)).reduce((s, h) => s + (h.dimensions?.reduce((sum, d) => sum + d.exp, 0) || 0), 0)
  const weekChecks = checkRecords.filter(r => r.completedAt >= Date.now() - 7 * 86400000).length
  const streak = getStreak()

  const handleDelete = (id: string) => {
    if (confirmDelete === id) {
      removeHabit(id)
      setConfirmDelete(null)
      toast.success('习惯已删除', '✦')
    } else {
      setConfirmDelete(id)
      setTimeout(() => setConfirmDelete(null), 3000)
    }
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ padding: '16px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 36, letterSpacing: 5, color: 'var(--white)', transform: 'skewX(-4deg)', display: 'inline-block' }}>
            HABIT<span style={{ color: 'var(--red)' }}>S</span>
          </div>
          <div style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 8, color: 'var(--muted)', letterSpacing: 2, marginTop: 2 }}>
            习惯管理 · {habits.length} 个习惯
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 28, color: 'var(--gold)', letterSpacing: 2 }}>+{todayExp}</div>
          <div style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 8, color: 'var(--muted)', letterSpacing: 1 }}>今日经验</div>
        </div>
      </div>
      <div style={{ height: 2, background: 'var(--red)', transform: 'skewX(-12deg)', boxShadow: '0 0 16px rgba(195,0,47,0.6)', margin: '0 0 4px' }} />

      <div style={{ padding: '14px 16px 100px' }}>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 1, background: 'var(--dim)', marginBottom: 14, clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)', overflow: 'hidden' }}>
          {[
            { label: '今日完成', value: `${todayCompleted.length}/${habits.length}`, color: 'var(--red)' },
            { label: '连续打卡', value: String(streak), color: 'var(--gold)' },
            { label: '本周打卡', value: String(weekChecks), color: 'var(--white)' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ flex: 1, background: 'var(--black)', padding: '10px 8px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 22, color, letterSpacing: 1 }}>{value}</div>
              <div style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 7, color: 'var(--muted)', letterSpacing: 0.5, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Habits by slot */}
        {TIME_SLOTS.map(slot => (
          <SlotGroup key={slot.id} slot={slot} habits={habitsBySlot(slot.id)} onDelete={handleDelete} />
        ))}

        {/* Empty state */}
        {habits.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--card)', clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))' }}>
            <div style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 11, color: 'var(--muted)', letterSpacing: 2, marginBottom: 12 }}>还没有习惯</div>
            <div style={{ fontSize: 13, color: 'var(--white)', lineHeight: 1.7, marginBottom: 16 }}>点击下方「+」添加你的第一个习惯<br />莫尔加纳会帮你追踪进度</div>
          </div>
        )}

        {/* Tip */}
        {habits.length > 0 && (
          <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(195,0,47,0.05)', border: '1px solid rgba(195,0,47,0.12)', fontFamily: 'Share Tech Mono,monospace', fontSize: 8, color: 'rgba(195,0,47,0.6)', letterSpacing: 1, lineHeight: 1.8 }}>
            💡 点击「+」添加新习惯 · 连续点击✕可删除习惯 · 点击莫尔加纳聊进展
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={onCreateHabit}
        style={{
          position: 'fixed', right: 16, bottom: 78,
          width: 52, height: 52,
          background: 'var(--red)', border: 'none',
          clipPath: 'polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px))',
          cursor: 'pointer', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 24px rgba(195,0,47,0.4)',
          fontFamily: 'Bebas Neue,sans-serif', fontSize: 28, color: 'var(--white)',
        }}
      >
        +
      </button>
    </div>
  )
}
