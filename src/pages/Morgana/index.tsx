import React, { useState, useRef, useEffect, useCallback } from 'react'
import { askMorgana, type ChatMessage, type UserContext } from '@/lib/morgana'
import useHabitStore from '@/stores/useHabitStore'
import useProfileStore from '@/stores/useProfileStore'
import useAuthStore from '@/stores/useAuthStore'

// ── Helpers ─────────────────────────────────────────────
const TIPS = [
  '提示：直接告诉莫尔加纳你今天的进展，他会帮你记录经验值',
  '提示：询问属性建议，莫尔加纳会根据你的短板给出推荐',
  '提示：抱怨没用，只有行动才能改变数据',
  '提示：连击断了？莫尔加纳不会嘲笑你，但他会记下来的',
]

const AVATAR_KEY = 'arcana-avatar'

const PRESET_AVATARS_DATA = [
  { id: 'joker', node: <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}><rect width="100" height="100" fill="#0a0a0a"/><polygon points="0,0 22,0 0,22" fill="#C3002F" opacity="0.8"/><path d="M20 100 Q25 72 50 68 Q75 72 80 100 Z" fill="#1a1a2e"/><path d="M36 100 Q41 76 50 73 Q59 76 64 100 Z" fill="#f0f0f0" opacity="0.9"/><path d="M48 74 L52 74 L54 100 L46 100 Z" fill="#C3002F"/><ellipse cx="50" cy="44" rx="18" ry="20" fill="#f5dcc8"/><ellipse cx="50" cy="30" rx="19" ry="14" fill="#111"/><rect x="35" y="44" width="11" height="7" rx="3" fill="none" stroke="#333" strokeWidth="1.2"/><rect x="54" y="44" width="11" height="7" rx="3" fill="none" stroke="#333" strokeWidth="1.2"/><line x1="46" y1="47" x2="54" y2="47" stroke="#333" strokeWidth="1.2"/><ellipse cx="40" cy="48" rx="3" ry="3.5" fill="#1a1a1a"/><ellipse cx="59" cy="48" rx="3" ry="3.5" fill="#1a1a1a"/><circle cx="41" cy="47" r="0.8" fill="white" opacity="0.8"/><circle cx="60" cy="47" r="0.8" fill="white" opacity="0.8"/><rect x="0" y="95" width="100" height="2" fill="#C3002F" opacity="0.6"/></svg> },
  { id: 'ryuji', node: <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}><rect width="100" height="100" fill="#0a0a0a"/><polygon points="0,0 22,0 0,22" fill="#E8C840" opacity="0.8"/><path d="M22 100 Q26 72 50 68 Q74 72 78 100 Z" fill="#1a1220"/><ellipse cx="50" cy="44" rx="18" ry="20" fill="#f0c880"/><ellipse cx="50" cy="29" rx="19" ry="13" fill="#E8C840"/><ellipse cx="40" cy="48" rx="4" ry="4" fill="#1a1a1a"/><ellipse cx="60" cy="48" rx="4" ry="4" fill="#1a1a1a"/><circle cx="42" cy="46" r="1.2" fill="white" opacity="0.9"/><circle cx="62" cy="46" r="1.2" fill="white" opacity="0.9"/><rect x="0" y="95" width="100" height="2" fill="#E8C840" opacity="0.6"/></svg> },
]

function getAvatarNode(avatarId: string): React.ReactNode {
  if (avatarId.startsWith('data:')) return <img src={avatarId} alt="avatar" style={{width:'100%',height:'100%',objectFit:'cover'}} />
  const preset = PRESET_AVATARS_DATA.find(p => p.id === avatarId)
  return preset ? preset.node : PRESET_AVATARS_DATA[0].node
}

// ── Components ───────────────────────────────────────────
function MorganaAvatar({ size = 40 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size, flexShrink: 0, background: 'rgba(195,0,47,0.1)', border: '1px solid rgba(195,0,47,0.25)', borderRadius: 4, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src="/morgana-avatar.png" alt="莫尔加纳" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={e => {
          const canvas = document.createElement('canvas'); canvas.width = size; canvas.height = size
          const ctx = canvas.getContext('2d')!
          ctx.fillStyle = '#1a1a1a'; ctx.fillRect(0, 0, size, size)
          ctx.fillStyle = '#E8C840'; ctx.font = `${Math.round(size * 0.5)}px serif`
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
          ctx.fillText('M', size / 2, size / 2 + 1)
          ;(e.target as HTMLImageElement).replaceWith(canvas)
        }}
      />
    </div>
  )
}

function UserBubble({ text, avatarNode, username }: { text: string; avatarNode?: React.ReactNode; username?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 10 }}>
      <div style={{ maxWidth: '75%', background: 'rgba(195,0,47,0.18)', border: '1px solid rgba(195,0,47,0.3)', padding: '10px 14px', clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))', fontSize: 13, lineHeight: 1.65, color: 'var(--white)' }}>{text}</div>
      <div style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 4, overflow: 'hidden', background: 'rgba(232,200,64,0.15)', border: '1px solid rgba(232,200,64,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {avatarNode ? <div style={{ width: 32, height: 32, overflow: 'hidden' }}>{avatarNode}</div> : <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 8, color: 'var(--gold)', letterSpacing: 0.5 }}>{username ? username.slice(0,2).toUpperCase() : 'ME'}</span>}
      </div>
    </div>
  )
}

function MorganaBubble({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 10 }}>
      <MorganaAvatar size={36} />
      <div style={{ maxWidth: '75%' }}>
        <div style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 8, letterSpacing: 2, color: 'var(--red)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 4, height: 4, background: 'var(--gold)', transform: 'rotate(45deg)', display: 'inline-block' }} />MORGANA
        </div>
        <div style={{ background: 'rgba(14,14,14,0.9)', border: '1px solid rgba(195,0,47,0.2)', padding: '10px 14px', clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))', fontSize: 13, lineHeight: 1.7, color: 'var(--white)', boxShadow: '0 4px 20px rgba(195,0,47,0.08)' }}>
          {text}
        </div>
      </div>
    </div>
  )
}

function SystemBubble({ text }: { text: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '6px 0' }}>
      <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 8, letterSpacing: 2, color: 'var(--muted)', background: 'var(--card2)', padding: '3px 12px', borderRadius: 2, display: 'inline-block' }}>{text}</span>
    </div>
  )
}

function InitLoader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 10 }}>
      <MorganaAvatar size={36} />
      <div style={{ background: 'var(--card2)', padding: '12px 18px', clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))', display: 'flex', alignItems: 'center', gap: 10 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
          <circle cx="12" cy="12" r="10" stroke="var(--muted)" strokeWidth="2" strokeDasharray="30 15" />
        </svg>
        <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 9, color: 'var(--muted)', letterSpacing: 2 }}>莫尔加纳连线中…</span>
      </div>
    </div>
  )
}

function InputBar({ onSend, disabled }: { onSend: (text: string) => void; disabled?: boolean }) {
  const [val, setVal] = useState('')
  const send = () => { if (val.trim() && !disabled) { onSend(val.trim()); setVal('') } }
  return (
    <div style={{ position: 'sticky', bottom: 0, zIndex: 20, background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(12px)', borderTop: '1px solid var(--dim)', padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
      <input value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="对莫尔加纳说些什么…" disabled={disabled}
        style={{ flex: 1, background: 'var(--card2)', border: '1px solid var(--dim)', outline: 'none', color: 'var(--white)', fontSize: 13, fontFamily: 'Noto Sans SC,sans-serif', padding: '9px 12px', clipPath: 'polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)', transition: 'border-color 0.2s' }}
      />
      <button onClick={send} disabled={disabled || !val.trim()} style={{ width: 38, height: 38, flexShrink: 0, background: disabled ? 'var(--dim)' : 'var(--red)', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', clipPath: 'polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)', transition: 'all 0.2s', opacity: disabled ? 0.4 : 1 }}>
        {disabled ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}><circle cx="12" cy="12" r="10" stroke="var(--muted)" strokeWidth="2" strokeDasharray="30 15" /></svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><polygon points="5,3 19,12 5,21" fill="var(--white)" /></svg>
        )}
      </button>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────
interface MorganaPageProps { onClose?: () => void }

export default function MorganaPage({ onClose }: MorganaPageProps) {
  const { dimensions } = useProfileStore()
  const { habits, todayCompleted } = useHabitStore()
  const { user } = useAuthStore()

  const avatarId = user?.avatar_id || localStorage.getItem(AVATAR_KEY) || 'joker'
  const username = (user?.username || user?.email?.split('@')[0] || 'PHANTOM').toUpperCase()
  const avatarNode = getAvatarNode(avatarId)

  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant' | 'system'; content: string }>>([])
  const [initLoading, setInitLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [tipIdx] = useState(() => Math.floor(Math.random() * TIPS.length))

  const buildCtx = useCallback((): UserContext => {
    const dims = useProfileStore.getState().dimensions
    const hbits = useHabitStore.getState().habits
    const completed = useHabitStore.getState().todayCompleted
    const { checkRecords } = useHabitStore.getState()
    const weekAgo = Date.now() - 7 * 86400000
    const recentChecks = checkRecords.filter(r => r.completedAt >= weekAgo).length
    const totalExp = dims.reduce((s, d) => s + (d.totalExp ?? 0), 0)
    return {
      username,
      dimensions: dims.map(d => ({ id: d.id, name: d.name, level: d.level, exp: d.exp, maxExp: d.maxExp })),
      habits: hbits.map(h => ({ name: h.name, dimensions: h.dimensions?.map(d => ({ dimension: d.dimension, exp: d.exp })) || [{ dimension: 'pro', exp: 10 }], timeSlot: h.timeSlot })),
      todayCompleted: completed,
      habitIds: Object.fromEntries(hbits.map(h => [h.id, h.name])),
      streak: useHabitStore.getState().getStreak(),
      totalExp,
      weekExp: 0,
      recentChecks,
    }
  }, [username])

  // Generate dynamic opening — same logic as old ArcanaPage
  useEffect(() => {
    let cancelled = false
    const ctx = buildCtx()
    const todayCount = ctx.todayCompleted.length
    const todayDoneNames = ctx.todayCompleted.map(id => ctx.habitIds[id] || '未知习惯').filter(Boolean)
    const todayTotal = ctx.habits.length

    const openingPrompt = todayCount > 0
      ? `用户今天已经完成了 ${todayCount} 次打卡（${todayDoneNames.join('、')}），给一个简短的开场问候，提到具体进展，然后问今天还有什么计划或者遇到什么困难。`
      : `用户今天还没有打卡，给一个简短的激励开场，根据他们的习惯列表提一个具体的建议。`

    askMorgana(openingPrompt, [], ctx).then(reply => {
      if (!cancelled) {
        setMessages([{ role: 'assistant', content: reply }])
        setInitLoading(false)
      }
    }).catch(() => {
      if (!cancelled) {
        setMessages([{ role: 'assistant', content: '侦探，欢迎回来。你的数据我都看到了，今天想聊点什么？' }])
        setInitLoading(false)
      }
    })

    return () => { cancelled = true }
  }, [buildCtx])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleSend = async (text: string) => {
    if (loading) return
    const userMsg = { role: 'user' as const, content: text }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    try {
      const ctx = buildCtx()
      const history: ChatMessage[] = messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))
      const reply = await askMorgana(text, history, ctx)
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '……稍微有点卡，但没关系。你刚才说的我记住了，继续行动。' }])
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    { label: '今天做了什么', text: '我今天完成了……' },
    { label: '属性建议', text: '给我一些属性提升建议' },
    { label: '习惯推荐', text: '推荐一些适合我的习惯' },
    { label: '最近如何', text: '我最近的成长怎么样？' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxWidth: 390, margin: '0 auto', position: 'relative' }}>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(8,8,8,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--dim)' }}>
        <div style={{ padding: '14px 16px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 4 }}>←</button>
          <div style={{ position: 'relative' }}>
            <MorganaAvatar size={44} />
            <div style={{ position: 'absolute', bottom: -2, right: -2, width: 10, height: 10, background: '#1DB954', borderRadius: '50%', border: '2px solid var(--black)', animation: 'pulse 2s infinite' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 20, letterSpacing: 4, color: 'var(--white)', transform: 'skewX(-4deg)', display: 'inline-block' }}>MORG<span style={{ color: 'var(--red)' }}>A</span>NA</div>
            <div style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 8, color: 'var(--muted)', letterSpacing: 2, marginTop: 1 }}>AI 顾问 · 在线</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: 120 }}>
            {dimensions.slice(0, 3).map(d => (
              <div key={d.id} style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 7, padding: '2px 6px', background: 'rgba(195,0,47,0.1)', border: `1px solid ${d.color}33`, color: d.color, clipPath: 'polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)', letterSpacing: 0.5 }}>
                {d.name} Lv{d.level}
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: 2, background: 'var(--red)', transform: 'skewX(-12deg)', boxShadow: '0 0 16px rgba(195,0,47,0.6)', marginTop: -2 }} />
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {initLoading ? (
          <InitLoader />
        ) : (
          <>
            {messages.map((msg, i) => {
              if (msg.role === 'system') return <SystemBubble key={i} text={msg.content} />
              if (msg.role === 'user') return <UserBubble key={i} text={msg.content} avatarNode={avatarNode} username={username} />
              return <MorganaBubble key={i} text={msg.content} />
            })}

            {messages.length === 1 && (
              <div>
                <div style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 8, color: 'var(--muted)', letterSpacing: 2, marginBottom: 8, paddingLeft: 4 }}>快捷指令</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {quickActions.map(a => (
                    <button key={a.label} onClick={() => handleSend(a.text)} disabled={loading} style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 9, padding: '5px 12px', background: 'rgba(195,0,47,0.08)', border: '1px solid rgba(195,0,47,0.2)', color: 'var(--white)', cursor: 'pointer', clipPath: 'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)', transition: 'all 0.2s', letterSpacing: 1 }}>
                      {a.label}
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: 14, padding: '8px 12px', background: 'rgba(232,200,64,0.05)', border: '1px solid rgba(232,200,64,0.15)', fontFamily: 'Share Tech Mono,monospace', fontSize: 8, color: 'rgba(232,200,64,0.7)', letterSpacing: 1, lineHeight: 1.6 }}>
                  💡 {TIPS[tipIdx]}
                </div>
              </div>
            )}

            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 10 }}>
                <MorganaAvatar size={36} />
                <div style={{ background: 'var(--card2)', padding: '10px 16px', clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" stroke="var(--muted)" strokeWidth="2" strokeDasharray="30 15" />
                  </svg>
                  <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 9, color: 'var(--muted)', letterSpacing: 2 }}>莫尔加纳思考中…</span>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {!initLoading && <InputBar onSend={handleSend} disabled={loading} />}
    </div>
  )
}
