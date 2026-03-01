import { useState } from 'react'

interface ArcanaPageProps {
  onBack: () => void
}

const MORGANA_REPLIES = [
  '了解。继续保持，每一次记录都会成为你成长的证据。',
  '侦探，根据你的描述，我判断这属于专业力的提升。给你 +20 EXP，记录在案了。',
  '有趣。你的创造力这周有点停滞——要不要试试每天写 100 字的记录？',
  '收到。今天你又进步了一点点，虽然你可能感觉不到，但数据不会说谎。',
  '我一直在看着你，侦探。你比你自己想象的要努力。但别让我发现你在偷懒……',
]
let replyIdx = 0

interface Message { role: 'ai' | 'user'; text: string }

export default function ArcanaPage({ onBack }: ArcanaPageProps) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: '侦探，今天你完成了下午的习惯链。专业力又涨了，不错。但我注意到你 3 天没有社交记录了……是在闭关修炼？' },
    { role: 'user', text: '最近在刷题，没时间' },
    { role: 'ai', text: '刷题是好事，但社交不是可以完全忽略的维度。就算 Joker 在渗透宫殿之余，也会和队友保持联系。试试每天 5 分钟，我帮你加进夜晚习惯链？' },
  ])

  const send = () => {
    if (!input.trim()) return
    const userMsg = input.trim()
    setInput('')
    setMessages(m => [...m, { role: 'user', text: userMsg }])
    setTimeout(() => {
      setMessages(m => [...m, { role: 'ai', text: MORGANA_REPLIES[replyIdx++ % MORGANA_REPLIES.length] }])
    }, 900)
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--black)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 12px', position: 'relative', zIndex: 10 }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontFamily: 'Share Tech Mono,monospace', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><polyline points="10,2 4,8 10,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          返回
        </button>
        <span style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 18, letterSpacing: 5, color: 'var(--white)', transform: 'skewX(-4deg)' }}>奥义</span>
        <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 9, color: 'var(--red)', letterSpacing: 2, border: '1px solid rgba(195,0,47,0.4)', padding: '3px 8px', clipPath: 'polygon(4px 0,100% 0,calc(100% - 4px) 100%,0 100%)' }}>莫尔加纳</span>
      </div>
      <div style={{ height: 2, background: 'var(--red)', transform: 'skewX(-12deg)', boxShadow: '0 0 16px rgba(195,0,47,0.6)' }} />

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 0' }}>
        {/* Morgana Status Card */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card)', padding: '14px 16px', marginBottom: 14, clipPath: 'polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,0 100%)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,var(--red),transparent 70%)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, background: 'rgba(195,0,47,0.08)', clipPath: 'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px))', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(195,0,47,0.25)', flexShrink: 0, overflow: 'hidden' }}>
              <img src="/morgana-avatar.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="莫尔加纳" />
            </div>
            <div>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 18, letterSpacing: 3, color: 'var(--white)' }}>MORGANA</div>
              <div style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 9, color: 'var(--muted)', letterSpacing: 1 }}>// AI PHANTOM ADVISOR</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 7, height: 7, background: '#1DB954', borderRadius: '50%', animation: 'aipulse 2s ease-in-out infinite' }} />
            <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 9, color: '#1DB954', letterSpacing: 2 }}>ONLINE</span>
          </div>
        </div>

        {/* Weekly Report */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 12px' }}>
          <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 13, letterSpacing: 4, color: 'var(--white)', transform: 'skewX(-5deg)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 3, height: 14, background: 'var(--red)', display: 'inline-block' }} />本周报告
          </div>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,var(--dim),transparent)' }} />
        </div>

        <div style={{ background: 'var(--card)', padding: '14px 16px', marginBottom: 14, clipPath: 'polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,0 100%)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,var(--red),transparent 70%)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 10, color: 'var(--red)', letterSpacing: 2 }}>WEEK 07 · 2026</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--white)', lineHeight: 1.7 }}>
            本周完成 <span style={{ color: 'var(--gold)', fontWeight: 700 }}>23 次打卡</span>，专业力增长最快 <span style={{ color: 'var(--gold)', fontWeight: 700 }}>+180 EXP</span>。连击 7 天，开局不错。
          </p>
          <p style={{ fontSize: 12, color: 'var(--white)', lineHeight: 1.7, marginTop: 8 }}>
            但社交和魅力这周几乎零进展——<span style={{ color: 'var(--red)' }}>你在逃避什么？建议本周加入至少 1 个社交习惯。</span>
          </p>
        </div>

        {/* Chat */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 12px' }}>
          <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 13, letterSpacing: 4, color: 'var(--white)', transform: 'skewX(-5deg)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 3, height: 14, background: 'var(--red)', display: 'inline-block' }} />与莫尔加纳对话
          </div>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,var(--dim),transparent)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 16 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-end', gap: 8, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
              {msg.role === 'ai' && (
                <div style={{ width: 26, height: 26, background: 'rgba(195,0,47,0.12)', border: '1px solid rgba(195,0,47,0.25)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue,sans-serif', fontSize: 11, color: 'var(--red)', clipPath: 'polygon(0 0,calc(100% - 5px) 0,100% 5px,100% 100%,5px 100%,0 calc(100% - 5px))' }}>M</div>
              )}
              <div style={{
                background: msg.role === 'ai' ? 'var(--card)' : 'rgba(195,0,47,0.1)',
                border: `1px solid ${msg.role === 'ai' ? 'var(--dim)' : 'rgba(195,0,47,0.25)'}`,
                padding: '9px 13px', fontSize: 12, color: 'var(--white)', lineHeight: 1.65, maxWidth: '82%',
                clipPath: msg.role === 'ai'
                  ? 'polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)'
                  : 'polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px))',
              }}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input */}
      <div style={{ padding: '8px 16px 24px', background: 'rgba(14,14,14,0.97)', borderTop: '1px solid var(--dim)' }}>
        <div style={{ background: 'var(--card2)', border: '1px solid var(--red)', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', clipPath: 'polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%)' }}>
          <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 10, color: 'var(--red)', letterSpacing: 1, whiteSpace: 'nowrap', flexShrink: 0 }}>// 莫尔加纳</span>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="问我任何事，或记录今天做了什么…"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--white)', fontSize: 13, fontFamily: 'Noto Sans SC,sans-serif' }}
          />
          <button onClick={send} style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 2, opacity: 0.7 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><polygon points="5,3 19,12 5,21" fill="var(--red)"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}
