import { useState, useEffect, useRef } from 'react'
import useAuthStore from '@/stores/useAuthStore'
import useProfileStore from '@/stores/useProfileStore'
import useHabitStore from '@/stores/useHabitStore'
import { supabase } from '@/lib/supabase'
import type { DimensionId } from '@/stores/useHabitStore'

// ── Types ─────────────────────────────────────────────────
interface DimConfig { id: DimensionId; label: string; desc: string; emoji: string }

const ALL_DIMS: DimConfig[] = [
  { id: 'pro',     label: '专业力', desc: '学习、技术、工作能力',   emoji: '⚙' },
  { id: 'fitness', label: '体能',   desc: '运动、健康、身体状态',   emoji: '◈' },
  { id: 'social',  label: '社交',   desc: '人际关系、沟通、网络',   emoji: '◇' },
  { id: 'create',  label: '创造力', desc: '创作、设计、艺术表达',   emoji: '✦' },
  { id: 'self',    label: '自律',   desc: '习惯、规律、执行力',     emoji: '▲' },
  { id: 'charm',   label: '魅力',   desc: '形象、气质、表达力',     emoji: '◉' },
]

// ── AI 评估引擎（规则式，无需 API）────────────────────────
const EVAL_KEYWORDS: Record<DimensionId, string[]> = {
  pro:     ['学习','技术','代码','编程','算法','研究','工作','考研','专业','实习','项目','英语','数学','考试'],
  fitness: ['跑步','健身','运动','锻炼','游泳','篮球','足球','爬山','减肥','体重','公里'],
  social:  ['朋友','社交','聚会','聊天','活动','认识','交流','团队','组织','演讲'],
  create:  ['写作','设计','画画','音乐','创作','摄影','视频','博客','作品','灵感'],
  self:    ['早起','规律','计划','打卡','坚持','自律','冥想','日记','复盘','总结','习惯'],
  charm:   ['穿搭','形象','气质','表达','自信','护肤','礼仪','演讲'],
}

const LEVEL_KEYWORDS = {
  high: ['很强','非常','精通','大神','擅长','专业','高手','厉害','优秀','多年','丰富'],
  low:  ['差','弱','不好','没有','从来','很少','极少','不太','零基础','新手','菜'],
}

function analyzeDescription(text: string, selectedDims: DimensionId[]): Record<DimensionId, number> {
  const lower = text.toLowerCase()
  const result: Record<DimensionId, number> = {} as any

  for (const id of selectedDims) {
    const keywords = EVAL_KEYWORDS[id]
    const hits = keywords.filter(k => lower.includes(k)).length
    // Base score 200-600 EXP, adjusted by keyword hits + sentiment
    let base = 200 + hits * 40

    // High/low modifiers
    if (LEVEL_KEYWORDS.high.some(k => lower.includes(k))) base = Math.min(800, base + 200)
    if (LEVEL_KEYWORDS.low.some(k => lower.includes(k)))  base = Math.max(50,  base - 150)

    // Small random variance ±50
    base += Math.floor(Math.random() * 101) - 50
    result[id] = Math.max(50, Math.min(900, base))
  }
  return result
}

// Convert raw EXP to level + remaining exp
function expToLevel(totalExp: number): { level: number; exp: number; maxExp: number } {
  let level = 1, maxExp = 1000, remaining = totalExp
  while (remaining >= maxExp) {
    remaining -= maxExp
    level++
    maxExp = Math.floor(maxExp * 1.3)
  }
  return { level, exp: remaining, maxExp }
}

// ── Radar (mini, for result preview) ─────────────────────
const CX = 110, CY = 100, R = 75
const TIPS6: [number,number][] = Array.from({length:6},(_,i)=>{
  const angle = (i * Math.PI * 2) / 6 - Math.PI / 2
  return [+(CX + R * Math.cos(angle)).toFixed(1), +(CY + R * Math.sin(angle)).toFixed(1)]
})

function buildRadarPts(ratios: number[]) {
  return ratios.map((r,i)=>{
    const t = Math.max(0,Math.min(1,r))
    return `${(CX+(TIPS6[i][0]-CX)*t).toFixed(1)},${(CY+(TIPS6[i][1]-CY)*t).toFixed(1)}`
  }).join(' ')
}

// ── Components ─────────────────────────────────────────────
function StepDot({ n, active, done }: { n: number; active: boolean; done: boolean }) {
  return (
    <div style={{
      width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: done ? 'var(--red)' : active ? 'rgba(195,0,47,0.2)' : 'var(--card2)',
      border: `1px solid ${active || done ? 'var(--red)' : 'var(--dim)'}`,
      clipPath: 'polygon(6px 0,100% 0,calc(100% - 6px) 100%,0 100%)',
      transition: 'all 0.3s',
    }}>
      {done
        ? <span style={{color:'var(--white)',fontSize:12}}>✓</span>
        : <span style={{fontFamily:'Bebas Neue,sans-serif',fontSize:13,color:active?'var(--red)':'var(--muted)'}}>{n}</span>
      }
    </div>
  )
}

// ── MAIN ONBOARDING ────────────────────────────────────────
interface OnboardingProps { onComplete: () => void }

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { user } = useAuthStore()
  const { setDimensionExp } = useProfileStore()
  const { addHabit } = useHabitStore()

  const [step, setStep] = useState(1)
  const [selectedDims, setSelectedDims] = useState<DimensionId[]>(['pro','fitness','social','create','self','charm'])
  const [description, setDescription] = useState('')
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisLines, setAnalysisLines] = useState<string[]>([])
  const [initExp, setInitExp] = useState<Record<DimensionId, number>>(() => {
    // Pre-fill with defaults so Step 4 never renders empty
    const defaults: Partial<Record<DimensionId, number>> = {}
    ALL_DIMS.forEach(d => { defaults[d.id] = 200 })
    return defaults as Record<DimensionId, number>
  })
  const [radarProgress, setRadarProgress] = useState(0)
  const [firstHabitName, setFirstHabitName] = useState('')
  const [firstHabitDim, setFirstHabitDim] = useState<DimensionId>('pro')
  const [firstHabitSlot, setFirstHabitSlot] = useState<'morning'|'afternoon'|'evening'|'night'>('morning')
  const [saving, setSaving] = useState(false)
  const rafRef = useRef<number>(0)

  const username = user?.user_metadata?.username || 'PHANTOM'

  // Toggle dim selection
  const toggleDim = (id: DimensionId) => {
    setSelectedDims(prev => {
      if (prev.includes(id)) {
        if (prev.length <= 3) return prev // min 3
        return prev.filter(d => d !== id)
      }
      if (prev.length >= 6) return prev // max 6
      return [...prev, id]
    })
  }

  // Step 3: run fake analysis animation then compute results
  useEffect(() => {
    if (step !== 3) return
    const lines = [
      '// 正在扫描你的档案数据...',
      '// 分析能力维度关键词...',
      '// 匹配怪盗团历史记录...',
      '// 计算初始属性分布...',
      '// 生成专属命运牌...',
      '// 分析完成 ✓',
    ]
    let i = 0
    const iv = setInterval(() => {
      i++
      setAnalysisProgress(Math.min(100, Math.round((i / lines.length) * 100)))
      setAnalysisLines(prev => [...prev, lines[i-1]])
      if (i >= lines.length) {
        clearInterval(iv)
        // Compute initExp synchronously and store before transitioning
        const result = analyzeDescription(description, selectedDims)
        setInitExp(result)
        // Give React one frame to commit the state before moving to step 4
        requestAnimationFrame(() => {
          setTimeout(() => setStep(4), 600)
        })
      }
    }, 500)
    return () => clearInterval(iv)
  }, [step])

  // Step 4: radar animation
  useEffect(() => {
    if (step !== 4) return
    const start = performance.now()
    const DURATION = 1600
    const ease = (t:number) => t<0.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2
    const tick = (now:number) => {
      const t = Math.min(1,(now-start)/DURATION)
      setRadarProgress(ease(t))
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [step])

  const handleFinish = async () => {
    setSaving(true)
    // Apply initial exp to profile store
    const expMap: Record<string, number> = {}
    for (const [id, exp] of Object.entries(initExp)) {
      expMap[id] = exp
    }
    setDimensionExp(expMap as Record<DimensionId, number>)

    // Add first habit if provided
    if (firstHabitName.trim()) {
      addHabit({
        name: firstHabitName.trim(),
        dimension: firstHabitDim,
        timeSlot: firstHabitSlot,
        exp: 20,
        isAnchor: true,
      })
    }

    // Mark onboarding done in Supabase
    await supabase.auth.updateUser({ data: { onboarding_done: true } })

    setSaving(false)
    onComplete()
  }

  // ── RENDER ─────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--black)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '0 0 60px', position: 'relative', overflowY: 'auto',
    }}>
      {/* BG watermark */}
      <div style={{
        position:'fixed', top:-20, right:-20, fontFamily:'Bebas Neue,sans-serif',
        fontSize:200, letterSpacing:-8, lineHeight:1, color:'transparent',
        WebkitTextStroke:'1px rgba(195,0,47,0.05)', pointerEvents:'none',
        transform:'skewX(-8deg) rotate(-6deg)', userSelect:'none',
      }}>ARCANA</div>

      {/* Scanline */}
      <div style={{position:'fixed',left:0,right:0,height:2,background:'rgba(195,0,47,0.04)',pointerEvents:'none',animation:'scan 6s linear infinite',zIndex:1}}/>

      <div style={{width:'100%',maxWidth:480,padding:'0 20px',position:'relative',zIndex:10}}>

        {/* Header */}
        <div style={{paddingTop:48,marginBottom:32,textAlign:'center'}}>
          <div style={{
            fontFamily:'Bebas Neue,sans-serif', fontSize:42, letterSpacing:8,
            color:'var(--white)', transform:'skewX(-5deg)', display:'inline-block', lineHeight:1,
            position:'relative',
          }}>
            ARC<span style={{color:'var(--red)'}}>A</span>NA
            <div style={{
              position:'absolute',top:3,left:3,fontFamily:'Bebas Neue,sans-serif',
              fontSize:42,letterSpacing:8,lineHeight:1,color:'var(--red)',
              opacity:0.15,pointerEvents:'none',transform:'skewX(-5deg)',
            }}>ARCANA</div>
          </div>
          <div style={{fontFamily:'Share Tech Mono,monospace',fontSize:9,letterSpacing:3,color:'var(--muted)',marginTop:6}}>
            // 前世档案初始化
          </div>
        </div>

        {/* Step indicators */}
        {step <= 5 && (
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,marginBottom:32}}>
            {[1,2,3,4,5].map((n,i) => (
              <>
                <StepDot key={n} n={n} active={step===n} done={step>n}/>
                {i < 4 && (
                  <div key={`line-${n}`} style={{
                    flex:1, height:1, maxWidth:32,
                    background: step > n ? 'var(--red)' : 'var(--dim)',
                    transition:'background 0.5s',
                  }}/>
                )}
              </>
            ))}
          </div>
        )}

        {/* ── STEP 1: 选维度 ── */}
        {step === 1 && (
          <div>
            <div style={{marginBottom:20}}>
              <div style={{fontFamily:'Bebas Neue,sans-serif',fontSize:22,letterSpacing:4,color:'var(--white)',marginBottom:6}}>
                选择你的成长维度
              </div>
              <div style={{fontFamily:'Share Tech Mono,monospace',fontSize:10,color:'var(--muted)',letterSpacing:1,lineHeight:1.7}}>
                选 3-6 个你想追踪的维度。这是你的人生面板，随时可以调整。
              </div>
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:32}}>
              {ALL_DIMS.map(d => {
                const selected = selectedDims.includes(d.id)
                return (
                  <div
                    key={d.id}
                    onClick={() => toggleDim(d.id)}
                    style={{
                      display:'flex', alignItems:'center', gap:14, padding:'14px 16px',
                      background: selected ? 'rgba(195,0,47,0.12)' : 'var(--card)',
                      border: `1px solid ${selected ? 'var(--red)' : 'var(--dim)'}`,
                      clipPath:'polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%)',
                      cursor:'pointer', transition:'all 0.2s',
                      boxShadow: selected ? '0 0 12px rgba(195,0,47,0.15)' : 'none',
                    }}
                  >
                    <div style={{
                      width:36, height:36, flexShrink:0,
                      background: selected ? 'rgba(195,0,47,0.2)' : 'var(--card2)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      clipPath:'polygon(6px 0,100% 0,calc(100% - 6px) 100%,0 100%)',
                      fontSize:16, transition:'background 0.2s',
                    }}>
                      {d.emoji}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{
                        fontSize:14, fontWeight:700,
                        color: selected ? 'var(--white)' : 'var(--muted)',
                        transition:'color 0.2s',
                      }}>{d.label}</div>
                      <div style={{fontFamily:'Share Tech Mono,monospace',fontSize:9,color:'var(--muted)',letterSpacing:1,marginTop:2}}>
                        {d.desc}
                      </div>
                    </div>
                    <div style={{
                      width:20, height:20, border:`1.5px solid ${selected?'var(--red)':'var(--dim)'}`,
                      background: selected ? 'var(--red)' : 'transparent',
                      transform:'rotate(45deg)', flexShrink:0, transition:'all 0.2s',
                      display:'flex', alignItems:'center', justifyContent:'center',
                    }}>
                      {selected && <span style={{transform:'rotate(-45deg)',color:'var(--white)',fontSize:10,lineHeight:1}}>✓</span>}
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{fontFamily:'Share Tech Mono,monospace',fontSize:9,color:'var(--muted)',textAlign:'center',marginBottom:16}}>
              已选 {selectedDims.length} / 6 个维度
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={selectedDims.length < 3}
              style={{
                width:'100%', background:'var(--red)', border:'none', color:'var(--white)',
                fontFamily:'Bebas Neue,sans-serif', fontSize:16, letterSpacing:5,
                padding:'16px', cursor: selectedDims.length < 3 ? 'not-allowed' : 'pointer',
                clipPath:'polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px))',
                opacity: selectedDims.length < 3 ? 0.4 : 1,
                transition:'opacity 0.2s',
              }}
            >
              下一步 →
            </button>
          </div>
        )}

        {/* ── STEP 2: 描述现状 ── */}
        {step === 2 && (
          <div>
            <div style={{marginBottom:20}}>
              <div style={{fontFamily:'Bebas Neue,sans-serif',fontSize:22,letterSpacing:4,color:'var(--white)',marginBottom:6}}>
                描述你的现状
              </div>
              <div style={{fontFamily:'Share Tech Mono,monospace',fontSize:10,color:'var(--muted)',letterSpacing:1,lineHeight:1.7}}>
                用自己的话说说你现在的水平和生活状态。AI 会根据描述给你分配合理的初始属性值——就像 P5 开头的"前世记忆"测试。
              </div>
            </div>

            <div style={{
              background:'var(--card)', border:'1px solid var(--dim)', marginBottom:12,
              clipPath:'polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,0 100%)',
              position:'relative', overflow:'hidden',
            }}>
              <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,var(--red),transparent 60%)'}}/>
              <div style={{padding:'6px 14px 4px',fontFamily:'Share Tech Mono,monospace',fontSize:9,color:'var(--red)',letterSpacing:2}}>
                // 档案输入
              </div>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder={`例如：我是大三学生，学计算机，平时会刷 LeetCode，英语一般，很少运动，社交圈子不大，偶尔写写博客…`}
                style={{
                  width:'100%', minHeight:140, background:'transparent', border:'none',
                  color:'var(--white)', fontSize:13, padding:'8px 14px 16px',
                  outline:'none', resize:'none', boxSizing:'border-box',
                  fontFamily:'Noto Sans SC,sans-serif', lineHeight:1.7,
                  caretColor:'var(--red)',
                }}
              />
            </div>

            <div style={{fontFamily:'Share Tech Mono,monospace',fontSize:9,color:'var(--muted)',letterSpacing:1,marginBottom:24,textAlign:'right'}}>
              {description.length} 字 / 越详细越准确
            </div>

            <div style={{display:'flex',gap:10}}>
              <button
                onClick={() => setStep(1)}
                style={{
                  flex:1, background:'var(--card)', border:'1px solid var(--dim)', color:'var(--muted)',
                  fontFamily:'Bebas Neue,sans-serif', fontSize:14, letterSpacing:3,
                  padding:'14px', cursor:'pointer',
                  clipPath:'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px))',
                }}
              >
                ← 返回
              </button>
              <button
                onClick={() => { setAnalysisLines([]); setAnalysisProgress(0); setStep(3) }}
                style={{
                  flex:2, background:'var(--red)', border:'none', color:'var(--white)',
                  fontFamily:'Bebas Neue,sans-serif', fontSize:16, letterSpacing:4,
                  padding:'14px', cursor:'pointer',
                  clipPath:'polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))',
                }}
              >
                AI 分析 →
              </button>
            </div>

            <div style={{textAlign:'center',marginTop:14}}>
              <span
                onClick={() => { setDescription(''); setAnalysisLines([]); setAnalysisProgress(0); setStep(3) }}
                style={{fontFamily:'Share Tech Mono,monospace',fontSize:9,color:'var(--dim)',cursor:'pointer',letterSpacing:1}}
              >
                跳过，使用默认值
              </span>
            </div>
          </div>
        )}

        {/* ── STEP 3: AI 分析中 ── */}
        {step === 3 && (
          <div>
            <div style={{marginBottom:32,textAlign:'center'}}>
              <div style={{fontFamily:'Bebas Neue,sans-serif',fontSize:22,letterSpacing:4,color:'var(--white)',marginBottom:6}}>
                正在分析档案
              </div>
              <div style={{fontFamily:'Share Tech Mono,monospace',fontSize:10,color:'var(--muted)',letterSpacing:1}}>
                ARCANA 系统扫描中…
              </div>
            </div>

            {/* Progress bar */}
            <div style={{marginBottom:24}}>
              <div style={{
                display:'flex', justifyContent:'space-between',
                fontFamily:'Share Tech Mono,monospace', fontSize:9, color:'var(--muted)', marginBottom:8,
              }}>
                <span>SCAN PROGRESS</span>
                <span style={{color:'var(--red)'}}>{analysisProgress}%</span>
              </div>
              <div style={{height:4, background:'var(--dim)', position:'relative'}}>
                <div style={{
                  height:'100%', background:'linear-gradient(90deg,var(--red),#e03060)',
                  width:`${analysisProgress}%`, transition:'width 0.5s ease',
                  position:'relative',
                }}>
                  <div style={{
                    position:'absolute', right:-3, top:-4, width:12, height:12,
                    background:'var(--white)', border:'2px solid var(--red)', transform:'rotate(45deg)',
                  }}/>
                </div>
              </div>
            </div>

            {/* Log lines */}
            <div style={{
              background:'var(--card)', border:'1px solid var(--dim)', padding:'16px',
              clipPath:'polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%)',
              minHeight:140, fontFamily:'Share Tech Mono,monospace', fontSize:11,
              color:'var(--muted)', lineHeight:2,
            }}>
              {analysisLines.map((l,i) => (
                <div key={i} style={{color: i === analysisLines.length-1 ? 'var(--red)' : 'var(--muted)'}}>
                  {l}
                </div>
              ))}
              {analysisProgress < 100 && (
                <span style={{color:'var(--red)',animation:'blink 1s step-end infinite'}}>█</span>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 4: 初始面板展示 ── */}
        {step === 4 && (
          <div>
            <div style={{marginBottom:20,textAlign:'center'}}>
              <div style={{fontFamily:'Share Tech Mono,monospace',fontSize:9,color:'var(--red)',letterSpacing:3,marginBottom:6}}>
                // 档案生成完毕
              </div>
              <div style={{fontFamily:'Bebas Neue,sans-serif',fontSize:26,letterSpacing:4,color:'var(--white)'}}>
                {username.toUpperCase()} 的命运牌
              </div>
            </div>

            {/* Radar */}
            <div style={{
              background:'var(--card)', marginBottom:16, padding:'16px 10px 12px',
              clipPath:'polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,14px 100%,0 calc(100% - 14px))',
              position:'relative', overflow:'hidden',
            }}>
              <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,var(--red),transparent 70%)'}}/>
              {(() => {
                const orderedDims = ALL_DIMS.filter(d => selectedDims.includes(d.id))
                const ratios = orderedDims.map(d => {
                  const exp = initExp[d.id] || 0
                  return Math.min(1, exp / 1000)
                })
                const animRatios = ratios.map(r => r * radarProgress)
                const pts = buildRadarPts(animRatios)
                const tips = TIPS6.slice(0, orderedDims.length)
                return (
                  <svg viewBox="0 0 220 200" fill="none" style={{display:'block',margin:'0 auto',width:'100%',maxWidth:300,height:'auto'}}>
                    {/* Grid */}
                    <g opacity="0.15" stroke="var(--red)" strokeWidth="0.5">
                      {[0.25,0.5,0.75,1.0].map(t=>(
                        <polygon key={t} points={tips.map(([tx,ty])=>`${(CX+(tx-CX)*t).toFixed(1)},${(CY+(ty-CY)*t).toFixed(1)}`).join(' ')} fill="none"/>
                      ))}
                      {tips.map(([tx,ty],i)=>(
                        <line key={i} x1={CX} y1={CY} x2={tx} y2={ty}/>
                      ))}
                    </g>
                    {/* Data */}
                    <polygon points={pts} fill="rgba(195,0,47,0.25)" stroke="var(--red)" strokeWidth="1.5" strokeLinejoin="round"
                      style={{filter:radarProgress>0.1?'drop-shadow(0 0 8px rgba(195,0,47,0.5))':'none'}}/>
                    {/* Points */}
                    {radarProgress > 0.85 && animRatios.map((r,i)=>{
                      const t = Math.max(0,Math.min(1,r))
                      const px = CX+(tips[i][0]-CX)*t, py = CY+(tips[i][1]-CY)*t
                      return <rect key={i} x={px-3.5} y={py-3.5} width={7} height={7} fill="var(--white)" stroke="var(--red)" strokeWidth="1" transform={`rotate(45,${px},${py})`} opacity={Math.min(1,(radarProgress-0.85)/0.15)}/>
                    })}
                    {/* Labels */}
                    {orderedDims.map((d,i)=>{
                      const [tx,ty] = TIPS6[i]
                      const lx = CX+(tx-CX)*1.22, ly = CY+(ty-CY)*1.22
                      return <text key={d.id} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fill="var(--white)" fontFamily="Share Tech Mono,monospace" fontSize="8" letterSpacing="0.5">{d.label}</text>
                    })}
                  </svg>
                )
              })()}
            </div>

            {/* Dimension stats */}
            <div style={{display:'flex',flexDirection:'column',gap:4,marginBottom:24}}>
              {ALL_DIMS.filter(d => selectedDims.includes(d.id)).map(d => {
                const raw = initExp[d.id] || 0
                const { level, exp, maxExp } = expToLevel(raw)
                const pct = Math.min(100,(exp/maxExp)*100)
                return (
                  <div key={d.id} style={{
                    display:'flex', alignItems:'center', gap:12, padding:'10px 14px',
                    background:'var(--card)',
                    clipPath:'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)',
                    borderLeft:'2px solid var(--red)',
                  }}>
                    <span style={{fontSize:16,flexShrink:0}}>{d.emoji}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:4}}>
                        <span style={{fontSize:12,fontWeight:700,color:'var(--white)'}}>{d.label}</span>
                        <span style={{fontFamily:'Bebas Neue,sans-serif',fontSize:16,color:'var(--red)',lineHeight:1}}>Lv{level}</span>
                      </div>
                      <div style={{height:3,background:'var(--dim)'}}>
                        <div style={{
                          height:'100%', background:'var(--red)',
                          width: radarProgress > 0.5 ? `${pct}%` : '0%',
                          transition:'width 0.8s ease 0.3s',
                        }}/>
                      </div>
                    </div>
                    <span style={{fontFamily:'Share Tech Mono,monospace',fontSize:9,color:'var(--muted)',flexShrink:0}}>
                      {exp}/{maxExp}
                    </span>
                  </div>
                )
              })}
            </div>

            <button
              onClick={() => setStep(5)}
              style={{
                width:'100%', background:'var(--red)', border:'none', color:'var(--white)',
                fontFamily:'Bebas Neue,sans-serif', fontSize:16, letterSpacing:5,
                padding:'16px', cursor:'pointer', marginBottom:20,
                clipPath:'polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px))',
              }}
            >
              继续 →
            </button>
          </div>
        )}

        {/* ── STEP 5: 设定第一个习惯 ── */}
        {step === 5 && (
          <div>
            <div style={{marginBottom:20}}>
              <div style={{fontFamily:'Bebas Neue,sans-serif',fontSize:22,letterSpacing:4,color:'var(--white)',marginBottom:6}}>
                设定第一个习惯
              </div>
              <div style={{fontFamily:'Share Tech Mono,monospace',fontSize:10,color:'var(--muted)',letterSpacing:1,lineHeight:1.7}}>
                每个怪盗都有自己的第一步。设定一个习惯，正式开启你的成长之旅。
              </div>
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:24}}>
              {/* Habit name */}
              <div>
                <div style={{fontFamily:'Share Tech Mono,monospace',fontSize:9,color:'var(--muted)',letterSpacing:2,marginBottom:8}}>// 习惯名称</div>
                <input
                  value={firstHabitName}
                  onChange={e => setFirstHabitName(e.target.value)}
                  placeholder="例如：每天刷题 2 题"
                  style={{
                    width:'100%', background:'var(--card)', border:'1px solid var(--dim)',
                    color:'var(--white)', fontSize:13, padding:'12px 14px', outline:'none',
                    boxSizing:'border-box', fontFamily:'Noto Sans SC,sans-serif',
                    clipPath:'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)',
                  }}
                  onFocus={e => e.target.style.borderColor='var(--red)'}
                  onBlur={e => e.target.style.borderColor='var(--dim)'}
                />
              </div>

              {/* Dimension */}
              <div>
                <div style={{fontFamily:'Share Tech Mono,monospace',fontSize:9,color:'var(--muted)',letterSpacing:2,marginBottom:8}}>// 关联维度</div>
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  {ALL_DIMS.filter(d => selectedDims.includes(d.id)).map(d => (
                    <div
                      key={d.id}
                      onClick={() => setFirstHabitDim(d.id)}
                      style={{
                        padding:'6px 14px', cursor:'pointer',
                        background: firstHabitDim===d.id ? 'rgba(195,0,47,0.2)' : 'var(--card)',
                        border: `1px solid ${firstHabitDim===d.id ? 'var(--red)' : 'var(--dim)'}`,
                        clipPath:'polygon(4px 0,100% 0,calc(100% - 4px) 100%,0 100%)',
                        fontFamily:'Share Tech Mono,monospace', fontSize:10, letterSpacing:1,
                        color: firstHabitDim===d.id ? 'var(--red)' : 'var(--muted)',
                        transition:'all 0.15s',
                      }}
                    >
                      {d.emoji} {d.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Time slot */}
              <div>
                <div style={{fontFamily:'Share Tech Mono,monospace',fontSize:9,color:'var(--muted)',letterSpacing:2,marginBottom:8}}>// 时间段</div>
                <div style={{display:'flex',gap:6}}>
                  {(['morning','afternoon','evening','night'] as const).map(slot => {
                    const labels = {morning:'早晨',afternoon:'白天',evening:'傍晚',night:'夜晚'}
                    return (
                      <div
                        key={slot}
                        onClick={() => setFirstHabitSlot(slot)}
                        style={{
                          flex:1, textAlign:'center', padding:'10px 0', cursor:'pointer',
                          background: firstHabitSlot===slot ? 'rgba(195,0,47,0.2)' : 'var(--card)',
                          border: `1px solid ${firstHabitSlot===slot ? 'var(--red)' : 'var(--dim)'}`,
                          fontFamily:'Share Tech Mono,monospace', fontSize:10, letterSpacing:1,
                          color: firstHabitSlot===slot ? 'var(--red)' : 'var(--muted)',
                          clipPath:'polygon(4px 0,100% 0,calc(100% - 4px) 100%,0 100%)',
                          transition:'all 0.15s',
                        }}
                      >
                        {labels[slot]}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div style={{display:'flex',gap:10}}>
              <button
                onClick={() => setStep(4)}
                style={{
                  flex:1, background:'var(--card)', border:'1px solid var(--dim)', color:'var(--muted)',
                  fontFamily:'Bebas Neue,sans-serif', fontSize:14, letterSpacing:3,
                  padding:'14px', cursor:'pointer',
                  clipPath:'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px))',
                }}
              >
                ← 返回
              </button>
              <button
                onClick={handleFinish}
                disabled={saving}
                style={{
                  flex:2, background:'var(--red)', border:'none', color:'var(--white)',
                  fontFamily:'Bebas Neue,sans-serif', fontSize:16, letterSpacing:4,
                  padding:'14px', cursor: saving ? 'not-allowed' : 'pointer',
                  clipPath:'polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))',
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? '保存中…' : '进入 ARCANA ⚡'}
              </button>
            </div>

            <div style={{textAlign:'center',marginTop:14}}>
              <span
                onClick={handleFinish}
                style={{fontFamily:'Share Tech Mono,monospace',fontSize:9,color:'var(--dim)',cursor:'pointer',letterSpacing:1}}
              >
                跳过，直接进入
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
