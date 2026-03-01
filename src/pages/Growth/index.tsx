import { useRef } from 'react'
import useHabitStore from '@/stores/useHabitStore'
import useProfileStore from '@/stores/useProfileStore'

// ── Helpers ───────────────────────────────────────────────
function PageHeader({ title, badge }: { title: string; badge: string }) {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px 12px', position: 'relative', zIndex: 10 }}>
        <span style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 18, letterSpacing: 5, color: 'var(--white)', transform: 'skewX(-4deg)', display: 'inline-block' }}>{title}</span>
        <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 9, color: 'var(--red)', letterSpacing: 2, border: '1px solid rgba(195,0,47,0.4)', padding: '3px 8px', clipPath: 'polygon(4px 0,100% 0,calc(100% - 4px) 100%,0 100%)' }}>{badge}</span>
      </div>
      <div style={{ height: 2, background: 'var(--red)', transform: 'skewX(-12deg)', boxShadow: '0 0 16px rgba(195,0,47,0.6)', marginBottom: 0 }} />
    </>
  )
}

function SectionHead({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0 10px' }}>
      <div className="section-tag" style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 13, letterSpacing: 4, color: 'var(--white)', transform: 'skewX(-5deg)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
        {label}
      </div>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,var(--dim),transparent)' }} />
    </div>
  )
}

// ── Heatmap ───────────────────────────────────────────────
function Heatmap() {
  const cells = Array.from({ length: 90 }, (_, _i) => {
    const level = Math.random() > 0.4 ? Math.floor(Math.random() * 5) : 0
    return level
  })
  const colors = ['var(--dim)', 'rgba(195,0,47,0.2)', 'rgba(195,0,47,0.4)', 'rgba(195,0,47,0.65)', 'var(--red)']
  return (
    <div style={{
      position: 'relative', background: 'var(--card)', marginBottom: 14, padding: '14px 16px',
      clipPath: 'polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,0 100%)', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,var(--red),transparent 70%)' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Share Tech Mono,monospace', fontSize: 8, color: 'var(--muted)', letterSpacing: 1, marginBottom: 8, padding: '0 2px' }}>
        <span>DEC</span><span>JAN</span><span>FEB</span><span>MAR</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(15, 1fr)', gap: 3, marginBottom: 10 }}>
        {cells.map((level, i) => (
          <div key={i} style={{ aspectRatio: '1', background: colors[level] }} />
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 8, color: 'var(--muted)', letterSpacing: 1 }}>少</span>
        <div style={{ display: 'flex', gap: 3 }}>
          {colors.map((c, i) => <div key={i} style={{ width: 12, height: 12, background: c }} />)}
        </div>
        <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 8, color: 'var(--muted)', letterSpacing: 1 }}>多</span>
      </div>
    </div>
  )
}

// ── Line Chart ────────────────────────────────────────────
function GrowthChart() {
  const svgRef = useRef<SVGSVGElement>(null)
  const W = 340, H = 100
  const weeks = 8
  // Simulated growth data for 3 dims
  const data = {
    pro:    [10, 30, 55, 70, 90, 120, 150, 180],
    fitness:[5,  15, 25, 40, 55, 65,  70,  75],
    create: [0,  10, 20, 30, 50, 60,  80,  100],
  }
  const maxVal = 200
  const pts = (arr: number[]) =>
    arr.map((v, i) => `${(i / (weeks - 1)) * W},${H - (v / maxVal) * H}`).join(' ')

  return (
    <div style={{ position: 'relative', background: 'var(--card)', padding: 16, marginBottom: 14, clipPath: 'polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,0 100%)', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,var(--red),transparent 70%)' }} />
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 100, display: 'block' }}>
        {/* grid */}
        {[0.25, 0.5, 0.75].map(r => (
          <line key={r} x1={0} y1={H * r} x2={W} y2={H * r} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
        ))}
        {/* lines */}
        <polyline points={pts(data.pro)} fill="none" stroke="var(--red)" strokeWidth={1.5} strokeLinejoin="round" />
        <polyline points={pts(data.fitness)} fill="none" stroke="#5b9bd5" strokeWidth={1.5} strokeLinejoin="round" />
        <polyline points={pts(data.create)} fill="none" stroke="var(--gold)" strokeWidth={1.5} strokeLinejoin="round" />
      </svg>
      <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
        {[['var(--red)', '专业力'], ['#5b9bd5', '体能'], ['var(--gold)', '创造力']].map(([color, label]) => (
          <span key={label as string} style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'Share Tech Mono,monospace', fontSize: 9, color: 'var(--muted)', letterSpacing: 1 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: color as string, display: 'inline-block' }} />
            {label as string}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Milestone card ────────────────────────────────────────
function MsCard({ name, desc, progress, done }: { name: string; desc: string; progress: string; done: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: 'var(--card)', padding: '12px 14px', marginBottom: 2,
      clipPath: 'polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%)',
      position: 'relative', overflow: 'hidden',
      borderLeft: `2px solid ${done ? 'var(--gold)' : 'var(--dim)'}`,
    }}>
      <div style={{ width: 8, height: 8, background: done ? 'var(--gold)' : 'var(--dim)', transform: 'rotate(45deg)', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: done ? 'var(--white)' : 'rgba(239,239,239,0.5)', marginBottom: 2 }}>{name}</div>
        <div style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 8, color: 'var(--muted)', letterSpacing: 0.5, lineHeight: 1.4 }}>{desc}</div>
      </div>
      <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 13, letterSpacing: 1, color: done ? 'var(--gold)' : 'var(--muted)', background: done ? 'rgba(232,200,64,0.1)' : 'transparent', padding: done ? '1px 6px' : 0, flexShrink: 0 }}>
        {progress}
      </div>
    </div>
  )
}

// ── GROWTH PAGE ───────────────────────────────────────────
export default function Growth() {
  const { getStreak } = useHabitStore()
  const { dimensions } = useProfileStore()

  const streak = getStreak()
  const totalExp = dimensions.reduce((s, d) => s + d.exp + d.level * d.maxExp, 0)
  const weekExp = Math.floor(totalExp * 0.14) // simulated

  const milestones = [
    { name: '初心者', desc: '完成第一次打卡', progress: '完成', done: true },
    { name: '怪盗团员', desc: '连续打卡 7 天', progress: streak >= 7 ? '完成' : `${streak}/7`, done: streak >= 7 },
    { name: '学者之路', desc: '专业力达到 Lv5', progress: `${dimensions.find(d=>d.id==='pro')?.level ?? 0}/5`, done: (dimensions.find(d=>d.id==='pro')?.level ?? 0) >= 5 },
    { name: '月之怪盗', desc: '连续打卡 30 天', progress: `${streak}/30`, done: streak >= 30 },
    { name: '全能怪盗', desc: '所有维度达到 Lv3', progress: `${dimensions.filter(d=>d.level>=3).length}/6`, done: dimensions.every(d=>d.level>=3) },
  ]

  return (
    <div className="page-container">
      <PageHeader title="成长" badge="90天" />
      <div style={{ padding: '18px 16px 0' }}>

        {/* Overview row */}
        <div style={{ display: 'flex', background: 'var(--card)', marginBottom: 14, clipPath: 'polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,0 100%)', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,var(--red),transparent 70%)' }} />
          {[
            { num: weekExp > 999 ? `${(weekExp/1000).toFixed(1)}K` : weekExp, lbl: '本周经验', color: 'var(--red)' },
            { num: streak, lbl: '连击天', color: 'var(--gold)' },
            { num: totalExp > 999 ? `${(totalExp/1000).toFixed(1)}K` : totalExp, lbl: '累计经验', color: 'var(--white)' },
          ].map((item, i, arr) => (
            <>
              <div key={item.lbl} style={{ flex: 1, padding: '16px 12px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 34, color: item.color, lineHeight: 1 }}>{item.num}</div>
                <div style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 9, color: 'var(--muted)', letterSpacing: 1, marginTop: 4 }}>{item.lbl}</div>
              </div>
              {i < arr.length - 1 && <div style={{ width: 1, background: 'var(--dim)', margin: '12px 0' }} />}
            </>
          ))}
        </div>

        <SectionHead label="活跃地图" />
        <Heatmap />

        <SectionHead label="维度成长" />
        <GrowthChart />

        <SectionHead label="成就里程碑" />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {milestones.map(m => <MsCard key={m.name} {...m} />)}
        </div>

      </div>
    </div>
  )
}
