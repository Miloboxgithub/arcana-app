import useProfileStore from '@/stores/useProfileStore'
import useHabitStore from '@/stores/useHabitStore'

function PageHeader({ title, badge }: { title: string; badge: string }) {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px 12px', position: 'relative', zIndex: 10 }}>
        <span style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 18, letterSpacing: 5, color: 'var(--white)', transform: 'skewX(-4deg)', display: 'inline-block' }}>{title}</span>
        <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 9, color: 'var(--red)', letterSpacing: 2, border: '1px solid rgba(195,0,47,0.4)', padding: '3px 8px', clipPath: 'polygon(4px 0,100% 0,calc(100% - 4px) 100%,0 100%)' }}>{badge}</span>
      </div>
      <div style={{ height: 2, background: 'var(--red)', transform: 'skewX(-12deg)', boxShadow: '0 0 16px rgba(195,0,47,0.6)' }} />
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

const ACHIEVEMENTS = [
  { ico: '⚡', name: '怪盗初临', desc: '完成第一次打卡', badge: '完成', done: true },
  { ico: '🔥', name: '连锁之力', desc: '连续打卡 7 天', badge: '完成', done: true },
  { ico: '📚', name: '学者之路', desc: '专业力达到 Lv.5', badge: '72%', done: false },
  { ico: '🌙', name: '月之怪盗', desc: '连续打卡 30 天', badge: '7/30', done: false },
  { ico: '👑', name: '全能怪盗', desc: '所有维度 Lv.3+', badge: '锁定', done: false, locked: true },
  { ico: '💎', name: '传说之心', desc: '累计 10000 EXP', badge: '锁定', done: false, locked: true },
]

const SETTINGS = [
  {
    ico: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
    name: '打卡提醒', val: '开启',
  },
  {
    ico: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><polygon points="12,2 14.5,9 22,9 16,13.5 18,21 12,17 6,21 8,13.5 2,9 9.5,9" fill="currentColor" opacity="0.7"/></svg>,
    name: '摆烂预警', val: '开启',
  },
  {
    ico: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" fill="currentColor"/><path d="M19.07 4.93A10 10 0 115 19.07" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    name: '主题皮肤', val: '红黑 · 默认',
  },
  {
    ico: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
    name: '数据导出', val: null,
  },
]

interface ProfileProps {
  onOpenArcana: () => void
}

export default function Profile({ onOpenArcana }: ProfileProps) {
  const { dimensions, getTotalLevel } = useProfileStore()
  const { getStreak } = useHabitStore()

  const streak = getStreak()
  const totalLevel = getTotalLevel()
  const totalExp = dimensions.reduce((s, d) => s + d.exp + d.level * d.maxExp, 0)
  const totalExpDisplay = totalExp > 999 ? `${(totalExp / 1000).toFixed(1)}K` : String(totalExp)

  return (
    <div className="page-container">
      <PageHeader title="档案" badge="怪盗团" />

      <div style={{ padding: '18px 16px 0' }}>

        {/* Profile Hero */}
        <div style={{
          position: 'relative', margin: '0 0 16px', padding: '20px 20px 0',
          background: 'var(--card)',
          clipPath: 'polygon(0 0,calc(100% - 20px) 0,100% 20px,100% 100%,0 100%)',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,var(--red),var(--gold) 60%,transparent)' }} />
          {/* bg watermark */}
          <div style={{ position: 'absolute', right: -10, top: -10, fontFamily: 'Bebas Neue,sans-serif', fontSize: 100, letterSpacing: -2, color: 'transparent', WebkitTextStroke: '1px rgba(195,0,47,0.08)', pointerEvents: 'none', userSelect: 'none', lineHeight: 1, transform: 'skewX(-5deg)' }}>ARCANA</div>

          {/* Avatar + Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
            <div style={{ width: 72, height: 72, border: '2px solid rgba(195,0,47,0.4)', clipPath: 'polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px))', overflow: 'hidden', background: 'rgba(195,0,47,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <img src="/morgana-avatar.png" alt="头像" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'hue-rotate(200deg) brightness(0.8) contrast(1.2)' }} />
            </div>
            <div>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 28, letterSpacing: 4, color: 'var(--white)', transform: 'skewX(-3deg)', display: 'inline-block', lineHeight: 1 }}>MILO</div>
              <div style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 9, letterSpacing: 2, color: 'var(--gold)', marginTop: 3 }}>◆ 怪盗团见习成员 · Lv.{totalLevel}</div>
              <div style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 8, color: 'var(--muted)', letterSpacing: 1, marginTop: 2 }}>ID·2026·PHANTOM·007</div>
            </div>
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, background: 'var(--dim)' }}>
            {[
              { num: totalExpDisplay, lbl: '累计经验' },
              { num: String(streak), lbl: '连击天' },
              { num: '89%', lbl: '完成率' },
            ].map(({ num, lbl }) => (
              <div key={lbl} style={{ background: 'var(--black)', padding: '10px 0', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 26, color: 'var(--white)', letterSpacing: 2, lineHeight: 1 }}>{num}</div>
                <div style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 8, color: 'var(--muted)', letterSpacing: 1, marginTop: 2 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <SectionHead label="成就徽章" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          {ACHIEVEMENTS.map(ach => (
            <div key={ach.name} style={{
              background: 'var(--card)', padding: '12px 14px',
              clipPath: 'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)',
              position: 'relative', overflow: 'hidden',
              opacity: ach.locked ? 0.4 : 1,
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: ach.done ? 'var(--gold)' : 'var(--dim)' }} />
              <div style={{ fontSize: 22, marginBottom: 6, filter: ach.locked ? 'none' : 'drop-shadow(0 0 6px rgba(232,200,64,0.5))' }}>{ach.ico}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--white)', marginBottom: 2 }}>{ach.name}</div>
              <div style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 8, color: 'var(--muted)', letterSpacing: 0.5, lineHeight: 1.4 }}>{ach.desc}</div>
              <div style={{ position: 'absolute', top: 6, right: 6, fontFamily: 'Bebas Neue,sans-serif', fontSize: 8, letterSpacing: 1, color: ach.done ? 'var(--gold)' : 'var(--muted)', background: ach.done ? 'rgba(232,200,64,0.1)' : 'transparent', padding: ach.done ? '1px 5px' : 0 }}>
                {ach.badge}
              </div>
            </div>
          ))}
        </div>

        {/* Arcana entry */}
        <SectionHead label="AI 顾问" />
        <div
          onClick={onOpenArcana}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--card)', padding: '14px 16px', marginBottom: 16, cursor: 'pointer',
            clipPath: 'polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%)',
            position: 'relative', overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,var(--red),transparent 70%)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(195,0,47,0.3)', flexShrink: 0 }}>
              <img src="/morgana-avatar.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="莫尔加纳" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)', marginBottom: 4 }}>与莫尔加纳对话</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 9, fontFamily: 'Share Tech Mono,monospace', letterSpacing: 1, padding: '2px 8px', background: 'rgba(195,0,47,0.12)', color: 'var(--red)', clipPath: 'polygon(4px 0,100% 0,calc(100% - 4px) 100%,0 100%)', display: 'inline-block', border: '1px solid rgba(195,0,47,0.25)' }}>AI 顾问</span>
                <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 9, color: '#1DB954', letterSpacing: 1 }}>● 在线</span>
              </div>
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><polyline points="9,18 15,12 9,6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round"/></svg>
        </div>

        {/* Settings */}
        <SectionHead label="设置" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {SETTINGS.map(s => (
            <div key={s.name} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--card)', padding: '14px 16px',
              clipPath: 'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)',
              cursor: 'pointer',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, background: 'rgba(195,0,47,0.08)', clipPath: 'polygon(4px 0,100% 0,calc(100% - 4px) 100%,0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
                  {s.ico}
                </div>
                <span style={{ fontSize: 13, color: 'var(--white)' }}>{s.name}</span>
              </div>
              {s.val ? (
                <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 9, color: 'var(--muted)', letterSpacing: 1 }}>{s.val}</span>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><polyline points="9,18 15,12 9,6" stroke="var(--dim)" strokeWidth="2" strokeLinecap="round"/></svg>
              )}
            </div>
          ))}
          {/* Danger row */}
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--card)', padding: '14px 16px', borderTop: '1px solid var(--dim)', marginTop: 2, clipPath: 'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, background: 'rgba(195,0,47,0.1)', clipPath: 'polygon(4px 0,100% 0,calc(100% - 4px) 100%,0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="var(--red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <span style={{ fontSize: 13, color: 'var(--red)' }}>退出登录</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
