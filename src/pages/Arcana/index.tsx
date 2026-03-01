import { useState, useRef, useEffect, useMemo } from 'react'
import useProfileStore from '@/stores/useProfileStore'
import useHabitStore from '@/stores/useHabitStore'
import useAuthStore from '@/stores/useAuthStore'
import { askMorgana, type ChatMessage, type UserContext } from '@/lib/morgana'
import { classifyInput } from '@/utils/classifyInput'

interface ArcanaPageProps {
  onBack: () => void
}

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}


export default function ArcanaPage({ onBack }: ArcanaPageProps) {
  const { dimensions, addExp, totalExp } = useProfileStore()
  const { habits, todayCompleted, checkRecords } = useHabitStore()
  const { user } = useAuthStore()

  const username = (user?.username || user?.email?.split('@')[0] || 'PHANTOM').toUpperCase()
  const streak = useHabitStore(s => s.getStreak())

  // 本周打卡次数
  const weekChecks = useMemo(() => {
    const weekAgo = Date.now() - 7 * 86400000
    return checkRecords.filter(r => r.completedAt >= weekAgo).length
  }, [checkRecords])

  // 本周经验
  const weekExp = useMemo(() => {
    const weekAgo = Date.now() - 7 * 86400000
    return checkRecords
      .filter(r => r.completedAt >= weekAgo)
      .reduce((s, r) => {
        const h = habits.find(x => x.id === r.habitId)
        return s + (h?.exp ?? 0)
      }, 0)
  }, [checkRecords, habits])

  // 各维度今日已打卡
  const todayDoneNames = todayCompleted
    .map(id => habits.find(h => h.id === id)?.name)
    .filter(Boolean) as string[]

  // 薄弱维度（exp 最少的）
  const weakestDim = useMemo(() => {
    return [...dimensions].sort((a, b) => (a.exp + a.level * a.maxExp) - (b.exp + b.level * b.maxExp))[0]
  }, [dimensions])

  // Build context for AI
  const ctx: UserContext = {
    username,
    dimensions,
    habits,
    todayCompleted,
    habitIds: Object.fromEntries(habits.map(h => [h.id, h.name])),
    streak,
    totalExp,
    weekExp,
    recentChecks: weekChecks,
  }

  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 首次进入生成开场白
  useEffect(() => {
    let cancelled = false
    const today = todayStr()
    const todayCount = checkRecords.filter(r => r.date === today).length

    // 构造开场 prompt
    const openingPrompt = todayCount > 0
      ? `用户今天已经完成了 ${todayCount} 次打卡（${todayDoneNames.join('、')}），给一个简短的开场问候，提到具体进展，然后问今天还有什么计划或者遇到什么困难。`
      : `用户今天还没有打卡，给一个简短的激励开场，根据他们的习惯列表提一个具体的建议。`

    askMorgana(openingPrompt, [], ctx).then(reply => {
      if (!cancelled) {
        setMessages([{ role: 'assistant', content: reply }])
        setInitializing(false)
      }
    })
    return () => { cancelled = true }
  }, []) // eslint-disable-line

  // 自动滚到底部
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userMsg }]
    setMessages(newMessages)
    setLoading(true)

    // 同时用规则分类器给 EXP（不等 AI 回复）
    const { dimension, exp } = classifyInput(userMsg)
    addExp(dimension, exp)

    const reply = await askMorgana(userMsg, messages, ctx)
    setMessages([...newMessages, { role: 'assistant', content: reply }])
    setLoading(false)

    // 把 EXP 信息插入到 AI 回复后（通过一个小 tag 显示）
    setTimeout(() => {
      setMessages(prev => {
        const last = prev[prev.length - 1]
        if (last.role === 'assistant' && !last.content.includes('[EXP]')) {
          return [...prev.slice(0, -1), {
            ...last,
            _exp: { dim: dimension, amount: exp },
          } as any]
        }
        return prev
      })
    }, 100)
  }

  // 维度颜色
  const DIM_COLOR: Record<string, string> = {
    pro: 'var(--red)', fitness: '#E8C840', social: '#4FC3F7',
    create: '#A5D6A7', self: '#CE93D8', charm: '#FF8A65',
  }

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--black)', overflow: 'hidden' }}>

      {/* ── Header ── */}
      <div style={{ flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px 10px', position: 'relative', zIndex: 10 }}>
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontFamily: 'Share Tech Mono,monospace', fontSize: 10, letterSpacing: 2 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><polyline points="10,2 4,8 10,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            返回
          </button>
          <span style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 18, letterSpacing: 5, color: 'var(--white)', transform: 'skewX(-4deg)' }}>奥义</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 7, height: 7, background: loading ? 'var(--gold)' : '#1DB954', borderRadius: '50%', animation: 'aipulse 2s ease-in-out infinite', transition: 'background 0.3s' }} />
            <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 9, color: loading ? 'var(--gold)' : '#1DB954', letterSpacing: 2, transition: 'color 0.3s' }}>
              {loading ? 'THINKING' : 'ONLINE'}
            </span>
          </div>
        </div>
        <div style={{ height: 2, background: 'var(--red)', transform: 'skewX(-12deg)', boxShadow: '0 0 16px rgba(195,0,47,0.6)' }} />

        {/* Morgana identity bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: 'var(--card)', borderBottom: '1px solid var(--dim)' }}>
          <div style={{ width: 36, height: 36, background: 'rgba(195,0,47,0.08)', clipPath: 'polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px))', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(195,0,47,0.25)', flexShrink: 0, overflow: 'hidden' }}>
            <img src="/morgana-avatar.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="莫尔加纳" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 15, letterSpacing: 3, color: 'var(--white)', lineHeight: 1 }}>MORGANA</div>
            <div style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 8, color: 'var(--muted)', letterSpacing: 1, marginTop: 2 }}>// AI PHANTOM ADVISOR · 连击 {streak}天</div>
          </div>
          {/* Quick stats */}
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { v: `${todayCompleted.length}/${habits.length}`, l: '今日', c: 'var(--red)' },
              { v: `+${weekExp}`, l: '本周EXP', c: 'var(--gold)' },
            ].map(s => (
              <div key={s.l} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 16, color: s.c, lineHeight: 1 }}>{s.v}</div>
                <div style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 7, color: 'var(--muted)', letterSpacing: 0.5 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Chat area ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 0' }}>

        {/* Loading skeleton */}
        {initializing && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 26, height: 26, background: 'rgba(195,0,47,0.12)', border: '1px solid rgba(195,0,47,0.25)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue,sans-serif', fontSize: 11, color: 'var(--red)', clipPath: 'polygon(0 0,calc(100% - 5px) 0,100% 5px,100% 100%,5px 100%,0 calc(100% - 5px))' }}>M</div>
            <div style={{ background: 'var(--card)', border: '1px solid var(--dim)', padding: '10px 14px', clipPath: 'polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)', display: 'flex', gap: 5, alignItems: 'center' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: 7, height: 7, background: 'var(--red)', borderRadius: '50%', animation: `aipulse 1.2s ease-in-out ${i*0.2}s infinite`, opacity: 0.6 }} />
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-end', gap: 8, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', marginBottom: 14 }}>
            {msg.role === 'assistant' && (
              <div style={{ width: 26, height: 26, background: 'rgba(195,0,47,0.12)', border: '1px solid rgba(195,0,47,0.25)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue,sans-serif', fontSize: 11, color: 'var(--red)', clipPath: 'polygon(0 0,calc(100% - 5px) 0,100% 5px,100% 100%,5px 100%,0 calc(100% - 5px))' }}>M</div>
            )}
            <div style={{ maxWidth: '82%' }}>
              <div style={{
                background: msg.role === 'assistant' ? 'var(--card)' : 'rgba(195,0,47,0.1)',
                border: `1px solid ${msg.role === 'assistant' ? 'var(--dim)' : 'rgba(195,0,47,0.25)'}`,
                padding: '10px 13px', fontSize: 13, color: 'var(--white)', lineHeight: 1.7,
                clipPath: msg.role === 'assistant'
                  ? 'polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)'
                  : 'polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px))',
                whiteSpace: 'pre-wrap',
              }}>
                {msg.content}
              </div>
              {/* EXP tag */}
              {msg.role === 'user' && (msg as any)._exp && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                  <span style={{
                    fontFamily: 'Share Tech Mono,monospace', fontSize: 9, letterSpacing: 1,
                    color: DIM_COLOR[(msg as any)._exp.dim] || 'var(--red)',
                    background: 'rgba(0,0,0,0.3)', padding: '2px 8px',
                    clipPath: 'polygon(4px 0,100% 0,calc(100% - 4px) 100%,0 100%)',
                    border: `1px solid ${DIM_COLOR[(msg as any)._exp.dim] || 'var(--red)'}`,
                  }}>
                    +{(msg as any)._exp.amount} EXP
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 14 }}>
            <div style={{ width: 26, height: 26, background: 'rgba(195,0,47,0.12)', border: '1px solid rgba(195,0,47,0.25)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue,sans-serif', fontSize: 11, color: 'var(--red)', clipPath: 'polygon(0 0,calc(100% - 5px) 0,100% 5px,100% 100%,5px 100%,0 calc(100% - 5px))' }}>M</div>
            <div style={{ background: 'var(--card)', border: '1px solid var(--dim)', padding: '10px 14px', clipPath: 'polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)', display: 'flex', gap: 5, alignItems: 'center' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: 7, height: 7, background: 'var(--red)', borderRadius: '50%', animation: `aipulse 1.2s ease-in-out ${i*0.2}s infinite`, opacity: 0.6 }} />
              ))}
            </div>
          </div>
        )}

        {/* Quick prompts — show when no user messages yet */}
        {!initializing && messages.filter(m => m.role === 'user').length === 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 9, color: 'var(--muted)', letterSpacing: 1, marginBottom: 8 }}>// 快捷提问</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                `今天${todayDoneNames.length > 0 ? `完成了${todayDoneNames[0]}` : '还没打卡'}，有什么建议？`,
                weakestDim ? `${weakestDim.name}一直很低，怎么提升？` : '怎么均衡提升各项属性？',
                '帮我分析一下我的成长瓶颈',
              ].map(q => (
                <button key={q} onClick={() => { setInput(q); inputRef.current?.focus() }}
                  style={{ textAlign: 'left', background: 'var(--card)', border: '1px solid var(--dim)', padding: '9px 13px', color: 'var(--muted)', fontSize: 12, cursor: 'pointer', fontFamily: 'Noto Sans SC,sans-serif', clipPath: 'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100)', transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = 'var(--red)'; (e.target as HTMLElement).style.color = 'var(--white)' }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = 'var(--dim)'; (e.target as HTMLElement).style.color = 'var(--muted)' }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} style={{ height: 16 }} />
      </div>

      {/* ── Input ── */}
      <div style={{ flexShrink: 0, padding: '8px 16px 28px', background: 'rgba(14,14,14,0.97)', borderTop: '1px solid var(--dim)' }}>
        <div style={{ background: 'var(--card2)', border: `1px solid ${loading ? 'var(--gold)' : 'var(--red)'}`, display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', clipPath: 'polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%)', transition: 'border-color 0.3s' }}>
          <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 10, color: loading ? 'var(--gold)' : 'var(--red)', letterSpacing: 1, whiteSpace: 'nowrap', flexShrink: 0, transition: 'color 0.3s' }}>// 侦探</span>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder={loading ? '莫尔加纳思考中…' : '问莫尔加纳，或记录今天做了什么…'}
            disabled={loading || initializing}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--white)', fontSize: 13, fontFamily: 'Noto Sans SC,sans-serif', opacity: (loading || initializing) ? 0.5 : 1 }}
          />
          <button
            onClick={send}
            disabled={loading || initializing || !input.trim()}
            style={{ flexShrink: 0, background: 'none', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', padding: 2, opacity: (loading || !input.trim()) ? 0.3 : 0.9, transition: 'opacity 0.2s' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><polygon points="5,3 19,12 5,21" fill="var(--red)"/></svg>
          </button>
        </div>
        <div style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 8, color: 'var(--muted)', letterSpacing: 0.5, marginTop: 6, textAlign: 'center', opacity: 0.5 }}>
          AI 对话自动记录经验值 · 按 Enter 发送
        </div>
      </div>
    </div>
  )
}
