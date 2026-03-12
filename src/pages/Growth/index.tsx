import { useMemo, useState } from 'react'
import useProfileStore from '@/stores/useProfileStore'
import useHabitStore from '@/stores/useHabitStore'
import { useAchievementStore } from '@/stores/useAchievementStore'

// ── Helpers ───────────────────────────────────────────────
const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
const WEEKDAYS = ['日','一','二','三','四','五','六']

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function PageHeader({ title, badge }: { title: string; badge: string }) {
  return (
    <>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px 12px' }}>
        <span style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:18, letterSpacing:5, color:'var(--white)', transform:'skewX(-4deg)', display:'inline-block' }}>{title}</span>
        <span style={{ fontFamily:'Share Tech Mono,monospace', fontSize:9, color:'var(--red)', letterSpacing:2, border:'1px solid rgba(195,0,47,0.4)', padding:'3px 8px', clipPath:'polygon(4px 0,100% 0,calc(100% - 4px) 100%,0 100%)' }}>{badge}</span>
      </div>
      <div style={{ height:2, background:'var(--red)', transform:'skewX(-12deg)', boxShadow:'0 0 16px rgba(195,0,47,0.6)' }} />
    </>
  )
}

function SH({ label }: { label: string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, margin:'20px 0 10px' }}>
      <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:13, letterSpacing:4, color:'var(--white)', transform:'skewX(-5deg)', whiteSpace:'nowrap' }}>{label}</div>
      <div style={{ flex:1, height:1, background:'linear-gradient(90deg,var(--dim),transparent)' }} />
    </div>
  )
}

// ── Heatmap ───────────────────────────────────────────────
function Heatmap({ checksByDate }: { checksByDate: Map<string, number> }) {
  const [tooltip, setTooltip] = useState<{date:string; count:number; x:number; y:number} | null>(null)

  // Build a 91-day grid aligned to weeks (Sun→Sat)
  const { weeks, monthMarks } = useMemo(() => {
    const today = new Date()
    // Go back to last Sunday (or today if Sunday)
    const end = new Date(today)
    const endDow = today.getDay() // 0=Sun
    end.setDate(today.getDate() + (6 - endDow)) // extend to next Sat for full week

    // Start: 14 weeks back from end Sunday
    const start = new Date(end)
    start.setDate(end.getDate() - 14 * 7 + 1)
    // align to Sunday
    const startDow = start.getDay()
    start.setDate(start.getDate() - startDow)

    const totalDays = Math.round((end.getTime() - start.getTime()) / 86400000) + 1
    const numWeeks = Math.ceil(totalDays / 7)

    const weeks: Array<Array<{ date: string; count: number; inRange: boolean }>> = []
    for (let w = 0; w < numWeeks; w++) {
      const week = []
      for (let d = 0; d < 7; d++) {
        const cur = new Date(start)
        cur.setDate(start.getDate() + w * 7 + d)
        const dateStr = toDateStr(cur)
        const isFuture = cur > today
        week.push({
          date: dateStr,
          count: isFuture ? -1 : (checksByDate.get(dateStr) ?? 0),
          inRange: !isFuture,
        })
      }
      weeks.push(week)
    }

    // Month labels: for each week column, check if first day of week is a new month
    const marks: Array<{ weekIdx: number; label: string }> = []
    let lastMonth = -1
    for (let w = 0; w < numWeeks; w++) {
      const cur = new Date(start)
      cur.setDate(start.getDate() + w * 7)
      const m = cur.getMonth()
      if (m !== lastMonth) {
        marks.push({ weekIdx: w, label: MONTHS[m] })
        lastMonth = m
      }
    }

    return { weeks, monthMarks: marks }
  }, [checksByDate])

  const maxCount = useMemo(() => {
    let m = 1
    checksByDate.forEach(v => { if (v > m) m = v })
    return m
  }, [checksByDate])

  const getColor = (count: number, inRange: boolean) => {
    if (!inRange || count < 0) return 'rgba(255,255,255,0.04)'
    if (count === 0) return 'rgba(255,255,255,0.07)'
    const r = count / maxCount
    if (r < 0.25) return 'rgba(195,0,47,0.25)'
    if (r < 0.5)  return 'rgba(195,0,47,0.45)'
    if (r < 0.75) return 'rgba(195,0,47,0.7)'
    return 'var(--red)'
  }

  const CELL = 17, GAP = 3
  const gridW = weeks.length * (CELL + GAP)

  return (
    <div style={{ position:'relative', background:'var(--card)', marginBottom:14, padding:'14px 14px 16px', clipPath:'polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,0 100%)', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,var(--red),transparent 70%)' }}/>

      <div style={{ overflowX:'auto', overflowY:'visible', paddingBottom:4 }}>
        {/* Month labels row */}
        <div style={{ display:'flex', marginBottom:4, paddingLeft:20, minWidth:gridW+20 }}>
          {weeks.map((_, wi) => {
            const mark = monthMarks.find(m => m.weekIdx === wi)
            return (
              <div key={wi} style={{ width:CELL+GAP, flexShrink:0, fontFamily:'Share Tech Mono,monospace', fontSize:7, color:'var(--muted)', letterSpacing:0.5 }}>
                {mark ? mark.label : ''}
              </div>
            )
          })}
        </div>

        <div style={{ display:'flex', gap:0 }}>
          {/* Weekday labels */}
          <div style={{ display:'flex', flexDirection:'column', gap:GAP, marginRight:4 }}>
            {[0,1,2,3,4,5,6].map(d => (
              <div key={d} style={{ width:16, height:CELL, fontFamily:'Share Tech Mono,monospace', fontSize:7, color:'var(--muted)', display:'flex', alignItems:'center', justifyContent:'flex-end' }}>
                {d % 2 === 1 ? WEEKDAYS[d] : ''}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div style={{ display:'flex', gap:GAP }}>
            {weeks.map((week, wi) => (
              <div key={wi} style={{ display:'flex', flexDirection:'column', gap:GAP }}>
                {week.map((cell, di) => (
                  <div
                    key={di}
                    title={cell.inRange ? `${cell.date}: ${cell.count} 次打卡` : ''}
                    onMouseEnter={e => {
                      if (!cell.inRange) return
                      const rect = (e.target as HTMLElement).getBoundingClientRect()
                      setTooltip({ date: cell.date, count: cell.count, x: rect.left + rect.width/2, y: rect.top })
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    style={{
                      width: CELL, height: CELL,
                      background: getColor(cell.count, cell.inRange),
                      transition: 'background 0.2s',
                      cursor: cell.inRange ? 'pointer' : 'default',
                      flexShrink: 0,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:10, paddingLeft:20 }}>
        <span style={{ fontFamily:'Share Tech Mono,monospace', fontSize:8, color:'var(--muted)', letterSpacing:1 }}>少</span>
        {['rgba(255,255,255,0.07)','rgba(195,0,47,0.25)','rgba(195,0,47,0.45)','rgba(195,0,47,0.7)','var(--red)'].map((c,i) => (
          <div key={i} style={{ width:12, height:12, background:c }}/>
        ))}
        <span style={{ fontFamily:'Share Tech Mono,monospace', fontSize:8, color:'var(--muted)', letterSpacing:1 }}>多</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position:'fixed', top: tooltip.y - 44, left: tooltip.x,
          transform:'translateX(-50%)',
          background:'var(--card2)', border:'1px solid var(--red)',
          padding:'5px 10px', zIndex:9999, pointerEvents:'none',
          clipPath:'polygon(4px 0,100% 0,calc(100% - 4px) 100%,0 100%)',
        }}>
          <div style={{ fontFamily:'Share Tech Mono,monospace', fontSize:9, color:'var(--white)', letterSpacing:1, whiteSpace:'nowrap' }}>
            {tooltip.date}
          </div>
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:14, color:tooltip.count>0?'var(--red)':'var(--muted)', letterSpacing:2 }}>
            {tooltip.count} 次打卡
          </div>
        </div>
      )}
    </div>
  )
}

// ── Milestone Card ────────────────────────────────────────
function MilestoneCard({ name, desc, icon, current, target, done }: {
  name: string; desc: string; icon: string
  current: number; target: number; done: boolean
}) {
  const pct = Math.min(100, (current / target) * 100)
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:12,
      background: done ? 'rgba(232,200,64,0.06)' : 'var(--card)',
      padding:'13px 14px', marginBottom:3,
      clipPath:'polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%)',
      borderLeft:`2px solid ${done ? 'var(--gold)' : 'var(--dim)'}`,
      position:'relative', overflow:'hidden',
    }}>
      {done && <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg,var(--gold),transparent 60%)' }}/>}

      {/* Icon */}
      <div style={{
        width:36, height:36, flexShrink:0,
        background: done ? 'rgba(232,200,64,0.15)' : 'var(--card2)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:18,
        clipPath:'polygon(6px 0,100% 0,calc(100% - 6px) 100%,0 100%)',
        filter: done ? 'drop-shadow(0 0 6px rgba(232,200,64,0.5))' : 'none',
      }}>
        {icon}
      </div>

      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:5 }}>
          <span style={{ fontSize:13, fontWeight:700, color: done ? 'var(--white)' : 'rgba(255,255,255,0.5)' }}>{name}</span>
          <span style={{
            fontFamily:'Bebas Neue,sans-serif', fontSize:11, letterSpacing:1,
            color: done ? 'var(--gold)' : 'var(--muted)',
            background: done ? 'rgba(232,200,64,0.12)' : 'transparent',
            padding: done ? '1px 7px' : '0',
          }}>
            {done ? '✓ 完成' : `${current} / ${target}`}
          </span>
        </div>
        <div style={{ fontFamily:'Share Tech Mono,monospace', fontSize:8, color:'var(--muted)', letterSpacing:0.5, marginBottom:5 }}>{desc}</div>
        {/* Progress bar */}
        <div style={{ height:2, background:'var(--dim)' }}>
          <div style={{
            height:'100%',
            background: done ? 'var(--gold)' : 'rgba(195,0,47,0.5)',
            width:`${pct}%`,
            transition:'width 1s ease',
          }}/>
        </div>
      </div>
    </div>
  )
}

// ── GROWTH PAGE ───────────────────────────────────────────
export default function Growth() {
  const { checkRecords, getStreak, habits } = useHabitStore()
  const { dimensions } = useProfileStore()
  const { achievements, fetchAchievements } = useAchievementStore()

  // Fetch achievements on mount
  useMemo(() => {
    fetchAchievements()
  }, [])

  const streak = getStreak()
  const totalExp = dimensions.reduce((s,d) => s + (d.totalExp ?? 0), 0)

  const weekExp = useMemo(() => {
    const weekAgo = Date.now() - 7 * 86400000
    return checkRecords
      .filter(r => r.completedAt >= weekAgo)
      .reduce((s, r) => {
        const h = habits.find(x => x.id === r.habitId)
        const dims = h?.dimensions || []
        return s + dims.reduce((sum, d) => sum + d.exp, 0)
      }, 0)
  }, [checkRecords, habits])

  const totalChecks = checkRecords.length
  const totalDays = useMemo(() => {
    const dates = new Set(checkRecords.map(r => r.date))
    return dates.size
  }, [checkRecords])

  // Completion rate: days with at least 1 check / last 30 days
  const completionRate = useMemo(() => {
    if (totalDays === 0) return 0
    const days30 = new Set<string>()
    for (let i = 0; i < 30; i++) {
      const d = new Date(); d.setDate(d.getDate() - i)
      days30.add(toDateStr(d))
    }
    const activeDays = [...days30].filter(d => checkRecords.some(r => r.date === d)).length
    return Math.round((activeDays / 30) * 100)
  }, [checkRecords, totalDays])

  const checksByDate = useMemo(() => {
    const m = new Map<string, number>()
    for (const r of checkRecords) {
      m.set(r.date, (m.get(r.date) ?? 0) + 1)
    }
    return m
  }, [checkRecords])

  // Milestones - use achievements from store
  const milestones = achievements.map(a => ({
    name: a.name,
    desc: a.description,
    icon: a.icon,
    current: a.progress,
    target: a.target,
    done: a.done,
  }))

  return (
    <div className="page-container">
      <PageHeader title="成长" badge="GROWTH" />
      <div style={{ padding:'18px 16px 0' }}>

        {/* Overview stats */}
        <div style={{ position:'relative', background:'var(--card)', marginBottom:14, overflow:'hidden', clipPath:'polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,0 100%)' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,var(--red),var(--gold) 50%,transparent)' }}/>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:1, background:'var(--dim)' }}>
            {[
              { num: weekExp > 999 ? `${(weekExp/1000).toFixed(1)}K` : String(weekExp), lbl:'本周经验', c:'var(--red)' },
              { num: String(streak),   lbl:'连击天数', c:'var(--gold)' },
              { num: `${completionRate}%`, lbl:'30天完成率', c:'var(--white)' },
              { num: totalExp > 9999 ? `${(totalExp/1000).toFixed(1)}K` : String(totalExp), lbl:'累计经验', c:'var(--white)' },
              { num: String(totalDays), lbl:'活跃天数', c:'var(--white)' },
              { num: String(habits.length), lbl:'习惯数量', c:'var(--white)' },
            ].map(({ num, lbl, c }) => (
              <div key={lbl} style={{ background:'var(--black)', padding:'12px 8px', textAlign:'center' }}>
                <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:26, color:c, letterSpacing:1, lineHeight:1 }}>{num}</div>
                <div style={{ fontFamily:'Share Tech Mono,monospace', fontSize:7, color:'var(--muted)', letterSpacing:0.5, marginTop:3 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap */}
        <SH label="打卡热力图" />
        <Heatmap checksByDate={checksByDate} />

        {/* Milestones */}
        <SH label="成就里程碑" />
        <div style={{ display:'flex', flexDirection:'column', paddingBottom:20 }}>
          {milestones.map(m => <MilestoneCard key={m.name} {...m} />)}
        </div>

      </div>
    </div>
  )
}
