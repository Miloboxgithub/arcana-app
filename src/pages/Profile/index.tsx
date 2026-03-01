// Profile page — 档案 (个人中心)
// Full implementation coming in feat/profile-page
// For now renders a "coming soon" with link to Arcana

interface ProfileProps {
  onOpenArcana: () => void
}

export default function Profile({ onOpenArcana }: ProfileProps) {
  return (
    <div className="page-container" style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 }}>
        <span style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 18, letterSpacing: 5, color: 'var(--white)', transform: 'skewX(-4deg)', display: 'inline-block' }}>档案</span>
        <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 9, color: 'var(--red)', letterSpacing: 2, border: '1px solid rgba(195,0,47,0.4)', padding: '3px 8px', clipPath: 'polygon(4px 0,100% 0,calc(100% - 4px) 100%,0 100%)' }}>怪盗团</span>
      </div>
      <div style={{ height: 2, background: 'var(--red)', transform: 'skewX(-12deg)', boxShadow: '0 0 16px rgba(195,0,47,0.6)', margin: '12px 0 20px' }} />

      {/* Profile Hero */}
      <div style={{ position: 'relative', background: 'var(--card)', marginBottom: 16, padding: '20px 20px 0', clipPath: 'polygon(0 0,calc(100% - 20px) 0,100% 20px,100% 100%,0 100%)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,var(--red),var(--gold) 60%,transparent)' }} />
        <div style={{ position: 'absolute', right: -10, top: -10, fontFamily: 'Bebas Neue,sans-serif', fontSize: 100, letterSpacing: -2, color: 'transparent', WebkitTextStroke: '1px rgba(195,0,47,0.08)', pointerEvents: 'none', userSelect: 'none', lineHeight: 1, transform: 'skewX(-5deg)' }}>ARCANA</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
          <div style={{ width: 72, height: 72, border: '2px solid rgba(195,0,47,0.4)', clipPath: 'polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px))', overflow: 'hidden', background: 'rgba(195,0,47,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 36, color: 'var(--red)' }}>M</span>
          </div>
          <div>
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 28, letterSpacing: 4, color: 'var(--white)', transform: 'skewX(-3deg)', display: 'inline-block', lineHeight: 1 }}>MILO</div>
            <div style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 9, letterSpacing: 2, color: 'var(--gold)', marginTop: 3 }}>◆ 怪盗团见习成员 · Lv.7</div>
            <div style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 8, color: 'var(--muted)', letterSpacing: 1, marginTop: 2 }}>ID·2026·PHANTOM·007</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, background: 'var(--dim)' }}>
          {[['2.4K', '累计经验'], ['7', '连击天'], ['89%', '完成率']].map(([num, lbl]) => (
            <div key={lbl} style={{ background: '#080808', padding: '10px 0', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 26, color: 'var(--white)', letterSpacing: 2, lineHeight: 1 }}>{num}</div>
              <div style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 8, color: 'var(--muted)', letterSpacing: 1, marginTop: 2 }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Advisor Entry → Arcana */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0 12px' }}>
        <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 13, letterSpacing: 4, color: 'var(--white)', transform: 'skewX(-5deg)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 3, height: 14, background: 'var(--red)', display: 'inline-block' }} />AI 顾问
        </div>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,var(--dim),transparent)' }} />
      </div>

      <div
        onClick={onOpenArcana}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card)', padding: '14px 16px', clipPath: 'polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%)', cursor: 'pointer', marginBottom: 16 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(195,0,47,0.3)', flexShrink: 0 }}>
            <img src="/morgana-avatar.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="莫尔加纳" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)', marginBottom: 4 }}>与莫尔加纳对话</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 9, fontFamily: 'Share Tech Mono,monospace', letterSpacing: 1, padding: '2px 8px', background: 'rgba(195,0,47,0.12)', color: 'var(--red)', clipPath: 'polygon(4px 0,100% 0,calc(100% - 4px) 100%,0 100%)', border: '1px solid rgba(195,0,47,0.25)' }}>AI 顾问</span>
              <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 9, color: '#1DB954', letterSpacing: 1 }}>● 在线</span>
            </div>
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><polyline points="9,18 15,12 9,6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round"/></svg>
      </div>

      {/* Achievements */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 12px' }}>
        <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 13, letterSpacing: 4, color: 'var(--white)', transform: 'skewX(-5deg)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 3, height: 14, background: 'var(--red)', display: 'inline-block' }} />成就徽章
        </div>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,var(--dim),transparent)' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        {[
          { ico: '⚡', name: '怪盗初临', desc: '完成第一次打卡', done: true },
          { ico: '🔥', name: '连锁之力', desc: '连续打卡 7 天', done: true },
          { ico: '📚', name: '学者之路', desc: '专业力达到 Lv.5', done: false, prog: '72%' },
          { ico: '🌙', name: '月之怪盗', desc: '连续打卡 30 天', done: false, prog: '7/30' },
          { ico: '👑', name: '全能怪盗', desc: '所有维度 Lv.3+', done: false, locked: true },
          { ico: '💎', name: '传说之心', desc: '累计 10000 EXP', done: false, locked: true },
        ].map(({ ico, name, desc, done, prog, locked }) => (
          <div key={name} style={{ background: 'var(--card)', padding: '12px 14px', clipPath: 'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)', position: 'relative', overflow: 'hidden', opacity: locked ? 0.4 : 1 }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: done ? 'var(--gold)' : 'var(--dim)' }} />
            <div style={{ fontSize: 22, marginBottom: 6 }}>{ico}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--white)', marginBottom: 2 }}>{name}</div>
            <div style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 8, color: 'var(--muted)', letterSpacing: 0.5, lineHeight: 1.4 }}>{desc}</div>
            {(done || prog) && (
              <div style={{ position: 'absolute', top: 6, right: 6, fontFamily: 'Bebas Neue,sans-serif', fontSize: 8, letterSpacing: 1, color: done ? 'var(--gold)' : 'var(--muted)', background: done ? 'rgba(232,200,64,0.1)' : 'var(--dim)', padding: '1px 5px' }}>
                {done ? '完成' : prog}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Settings */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 12px' }}>
        <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 13, letterSpacing: 4, color: 'var(--white)', transform: 'skewX(-5deg)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 3, height: 14, background: 'var(--red)', display: 'inline-block' }} />设置
        </div>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,var(--dim),transparent)' }} />
      </div>

      {[['打卡提醒', '开启'], ['摆烂预警', '开启'], ['主题皮肤', '红黑 · 默认'], ['数据导出', '']].map(([name, val]) => (
        <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card)', padding: '14px 16px', clipPath: 'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)', cursor: 'pointer', marginBottom: 2 }}>
          <span style={{ fontSize: 13, color: 'var(--white)' }}>{name}</span>
          <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 9, color: 'var(--muted)', letterSpacing: 1 }}>{val}</span>
        </div>
      ))}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card)', padding: '14px 16px', clipPath: 'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)', cursor: 'pointer', marginTop: 4 }}>
        <span style={{ fontSize: 13, color: 'var(--red)' }}>退出登录</span>
      </div>
    </div>
  )
}
