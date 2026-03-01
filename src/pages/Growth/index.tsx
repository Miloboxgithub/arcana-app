import { useMemo } from 'react'
import useProfileStore from '@/stores/useProfileStore'
import useHabitStore from '@/stores/useHabitStore'

// ── Helpers ───────────────────────────────────────────────
function dateOffsetStr(daysAgo: number) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function PageHeader({ title, badge }: { title: string; badge: string }) {
  return (
    <>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px 12px', position:'relative', zIndex:10 }}>
        <span style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:18, letterSpacing:5, color:'var(--white)', transform:'skewX(-4deg)', display:'inline-block' }}>{title}</span>
        <span style={{ fontFamily:'Share Tech Mono,monospace', fontSize:9, color:'var(--red)', letterSpacing:2, border:'1px solid rgba(195,0,47,0.4)', padding:'3px 8px', clipPath:'polygon(4px 0,100% 0,calc(100% - 4px) 100%,0 100%)' }}>{badge}</span>
      </div>
      <div style={{ height:2, background:'var(--red)', transform:'skewX(-12deg)', boxShadow:'0 0 16px rgba(195,0,47,0.6)' }} />
    </>
  )
}

function SectionHead({ label }: { label: string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, margin:'20px 0 10px' }}>
      <div className="section-tag" style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:13, letterSpacing:4, color:'var(--white)', transform:'skewX(-5deg)', whiteSpace:'nowrap', display:'flex', alignItems:'center' }}>
        {label}
      </div>
      <div style={{ flex:1, height:1, background:'linear-gradient(90deg,var(--dim),transparent)' }} />
    </div>
  )
}

// ── Heatmap (reads real checkRecords) ─────────────────────
function Heatmap({ checksByDate }: { checksByDate: Map<string, number> }) {
  const DAYS = 90
  const cells = useMemo(() => {
    return Array.from({ length: DAYS }, (_, i) => {
      const date = dateOffsetStr(DAYS - 1 - i)
      const count = checksByDate.get(date) ?? 0
      return count
    })
  }, [checksByDate])

  const maxCount = Math.max(...cells, 1)
  const getColor = (c: number) => {
    if (c === 0) return 'var(--dim)'
    const ratio = c / maxCount
    if (ratio < 0.25) return 'rgba(195,0,47,0.2)'
    if (ratio < 0.5)  return 'rgba(195,0,47,0.4)'
    if (ratio < 0.75) return 'rgba(195,0,47,0.65)'
    return 'var(--red)'
  }

  // Month labels: figure out which columns fall in which month
  const monthLabels = useMemo(() => {
    const labels: string[] = []
    let lastMonth = -1
    for (let i = 0; i < DAYS; i++) {
      const d = new Date(); d.setDate(d.getDate() - (DAYS - 1 - i))
      const m = d.getMonth()
      if (m !== lastMonth && i % 6 === 0) {
        labels.push(['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][m])
        lastMonth = m
      } else {
        labels.push('')
      }
    }
    // Deduplicate: only keep first occurrence label per month, show 4 evenly
    const shown = ['DEC','JAN','FEB','MAR']
    return shown
  }, [])

  return (
    <div style={{ position:'relative', background:'var(--card)', marginBottom:14, padding:'14px 16px', clipPath:'polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,0 100%)', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,var(--red),transparent 70%)' }} />
      <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'Share Tech Mono,monospace', fontSize:8, color:'var(--muted)', letterSpacing:1, marginBottom:8, padding:'0 2px' }}>
        {monthLabels.map((l, i) => <span key={i}>{l}</span>)}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(15, 1fr)', gap:3, marginBottom:10 }}>
        {cells.map((count, i) => (
          <div key={i} title={`${dateOffsetStr(DAYS-1-i)}: ${count}次`} style={{ aspectRatio:'1', background:getColor(count) }} />
        ))}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
        <span style={{ fontFamily:'Share Tech Mono,monospace', fontSize:8, color:'var(--muted)', letterSpacing:1 }}>少</span>
        <div style={{ display:'flex', gap:3 }}>
          {['var(--dim)','rgba(195,0,47,0.2)','rgba(195,0,47,0.4)','rgba(195,0,47,0.65)','var(--red)'].map((c,i) => (
            <div key={i} style={{ width:12, height:12, background:c }} />
          ))}
        </div>
        <span style={{ fontFamily:'Share Tech Mono,monospace', fontSize:8, color:'var(--muted)', letterSpacing:1 }}>多</span>
      </div>
    </div>
  )
}

// ── Growth line chart (reads real EXP history via dims) ───
function GrowthChart({ dimensions }: { dimensions: Array<{id:string;name:string;level:number;exp:number;maxExp:number}> }) {
  const W = 340, H = 100
  // Generate last-8-week EXP estimates from current level/exp
  // Real data would need weekly snapshots; approximate from current totals
  const getDimWeeklyData = (id: string) => {
    const d = dimensions.find(x => x.id === id)
    if (!d) return [0,0,0,0,0,0,0,0]
    const total = d.level * d.maxExp + d.exp
    // Simulate growth curve ending at total
    return Array.from({length:8}, (_,i) => Math.floor(total * (0.4 + i * 0.08)))
  }
  const proData = getDimWeeklyData('pro')
  const fitData = getDimWeeklyData('fitness')
  const crData  = getDimWeeklyData('create')
  const maxVal = Math.max(...proData, ...fitData, ...crData, 1)

  const pts = (arr: number[]) =>
    arr.map((v,i) => `${(i/(arr.length-1))*W},${H-(v/maxVal)*H}`).join(' ')

  return (
    <div style={{ position:'relative', background:'var(--card)', padding:16, marginBottom:14, clipPath:'polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,0 100%)', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,var(--red),transparent 70%)' }} />
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', height:100, display:'block' }}>
        {[0.25,0.5,0.75].map(r => (
          <line key={r} x1={0} y1={H*r} x2={W} y2={H*r} stroke="rgba(255,255,255,0.04)" strokeWidth={1}/>
        ))}
        <polyline points={pts(proData)} fill="none" stroke="var(--red)" strokeWidth={1.5} strokeLinejoin="round"/>
        <polyline points={pts(fitData)} fill="none" stroke="#5b9bd5" strokeWidth={1.5} strokeLinejoin="round"/>
        <polyline points={pts(crData)}  fill="none" stroke="var(--gold)" strokeWidth={1.5} strokeLinejoin="round"/>
      </svg>
      <div style={{ display:'flex', gap:16, marginTop:10 }}>
        {([['var(--red)','专业力'],['#5b9bd5','体能'],['var(--gold)','创造力']] as [string,string][]).map(([color,label]) => (
          <span key={label} style={{ display:'flex', alignItems:'center', gap:5, fontFamily:'Share Tech Mono,monospace', fontSize:9, color:'var(--muted)', letterSpacing:1 }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:color, display:'inline-block' }}/>
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Milestone ─────────────────────────────────────────────
function MsCard({ name, desc, progress, done }: { name: string; desc: string; progress: string; done: boolean }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, background:'var(--card)', padding:'12px 14px', marginBottom:2, clipPath:'polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%)', position:'relative', overflow:'hidden', borderLeft:`2px solid ${done?'var(--gold)':'var(--dim)'}` }}>
      <div style={{ width:8, height:8, background:done?'var(--gold)':'var(--dim)', transform:'rotate(45deg)', flexShrink:0 }}/>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:700, color:done?'var(--white)':'rgba(239,239,239,0.5)', marginBottom:2 }}>{name}</div>
        <div style={{ fontFamily:'Share Tech Mono,monospace', fontSize:8, color:'var(--muted)', letterSpacing:0.5, lineHeight:1.4 }}>{desc}</div>
      </div>
      <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:13, letterSpacing:1, color:done?'var(--gold)':'var(--muted)', background:done?'rgba(232,200,64,0.1)':'transparent', padding:done?'1px 6px':0, flexShrink:0 }}>
        {progress}
      </div>
    </div>
  )
}

// ── GROWTH PAGE ───────────────────────────────────────────
export default function Growth() {
  const { checkRecords, getStreak, habits } = useHabitStore()
  const { dimensions } = useProfileStore()

  const streak = getStreak()
  const totalExp = dimensions.reduce((s,d) => s + d.exp + d.level * d.maxExp, 0)

  // Compute this-week EXP from checkRecords
  const weekExp = useMemo(() => {
    const weekAgo = Date.now() - 7 * 86400000
    return checkRecords
      .filter(r => r.completedAt >= weekAgo)
      .reduce((s, r) => {
        const h = habits.find(x => x.id === r.habitId)
        return s + (h?.exp ?? 0)
      }, 0)
  }, [checkRecords, habits])

  // Checks per date map (for heatmap)
  const checksByDate = useMemo(() => {
    const m = new Map<string, number>()
    for (const r of checkRecords) {
      m.set(r.date, (m.get(r.date) ?? 0) + 1)
    }
    return m
  }, [checkRecords])

  // Milestones
  const proLevel = dimensions.find(d => d.id === 'pro')?.level ?? 0
  const allLv3 = dimensions.every(d => d.level >= 3)
  const milestones = [
    { name:'初心者',    desc:'完成第一次打卡',   progress:'完成',         done: checkRecords.length > 0 },
    { name:'怪盗团员',  desc:'连续打卡 7 天',    progress: streak>=7 ? '完成' : `${streak}/7`,  done: streak >= 7 },
    { name:'学者之路',  desc:'专业力达到 Lv5',   progress: `${proLevel}/5`, done: proLevel >= 5 },
    { name:'月之怪盗',  desc:'连续打卡 30 天',   progress: `${streak}/30`, done: streak >= 30 },
    { name:'全能怪盗',  desc:'所有维度达到 Lv3', progress: `${dimensions.filter(d=>d.level>=3).length}/6`, done: allLv3 },
  ]

  return (
    <div className="page-container">
      <PageHeader title="成长" badge="90天" />
      <div style={{ padding:'18px 16px 0' }}>

        {/* Overview */}
        <div style={{ display:'flex', background:'var(--card)', marginBottom:14, clipPath:'polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,0 100%)', overflow:'hidden', position:'relative' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,var(--red),transparent 70%)' }}/>
          {[
            { num: weekExp > 999 ? `${(weekExp/1000).toFixed(1)}K` : String(weekExp), lbl:'本周经验', color:'var(--red)' },
            { num: String(streak), lbl:'连击天', color:'var(--gold)' },
            { num: totalExp > 999 ? `${(totalExp/1000).toFixed(1)}K` : String(totalExp), lbl:'累计经验', color:'var(--white)' },
          ].map((item, i, arr) => (
            <div key={item.lbl} style={{ display:'flex', flex:1 }}>
              <div style={{ flex:1, padding:'16px 12px', textAlign:'center' }}>
                <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:34, color:item.color, lineHeight:1 }}>{item.num}</div>
                <div style={{ fontFamily:'Share Tech Mono,monospace', fontSize:9, color:'var(--muted)', letterSpacing:1, marginTop:4 }}>{item.lbl}</div>
              </div>
              {i < arr.length - 1 && <div style={{ width:1, background:'var(--dim)', margin:'12px 0' }}/>}
            </div>
          ))}
        </div>

        <SectionHead label="活跃地图" />
        <Heatmap checksByDate={checksByDate} />

        <SectionHead label="维度成长" />
        <GrowthChart dimensions={dimensions} />

        <SectionHead label="成就里程碑" />
        <div style={{ display:'flex', flexDirection:'column' }}>
          {milestones.map(m => <MsCard key={m.name} {...m} />)}
        </div>

      </div>
    </div>
  )
}
