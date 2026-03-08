import { useState, useEffect, useRef } from 'react'
import useAuthStore from '@/stores/useAuthStore'
import useProfileStore from '@/stores/useProfileStore'
import useHabitStore from '@/stores/useHabitStore'
import { pushOnboardingDims } from '@/lib/sync'
import { api } from '@/lib/api'
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

// AI System Prompt for onboarding analysis
const ONBOARDING_SYSTEM_PROMPT = `你是 ARCANA 系统的"命运档案"分析师。用户正在创建游戏档案，需要你根据他们的"前世档案"描述来分析他们的初始属性。

## 你的任务
根据用户的描述，分析他们在6个维度上的初始经验值（EXP），并给出理由。

## 维度说明
- pro（专业力）：学习、技术、工作能力
- fitness（体能）：运动、健康、身体状态  
- social（社交）：人际关系、沟通、网络
- create（创造力）：创作、设计、艺术表达
- self（自律）：习惯、规律、执行力
- charm（魅力）：形象、气质、表达力

## 评分规则
1. 根据描述中的关键词、能力描述、经验年限等综合评估
2. 初始经验值范围：300-1200 EXP
   - 新手/零基础：300-500
   - 有一定基础：500-800
   - 经验丰富：800-1000
   - 高手/多年经验：1000-1200
3. 如果用户明确提到在某领域很强/很弱，相应调整

## 输出格式
请返回 JSON 格式，包含每个维度的经验和简短理由：
{
  "pro": {"exp": 500, "reason": "因为...所以..."},
  "fitness": {"exp": 400, "reason": "因为...所以..."},
  ...
}

注意：只返回 JSON，不要其他文字。`

async function analyzeWithAI(description: string, selectedDims: DimensionId[]): Promise<{ expMap: Record<DimensionId, number>; analysisText: string }> {
  // 如果描述为空，返回默认值
  if (!description.trim()) {
    const defaults: Record<DimensionId, number> = {} as any
    selectedDims.forEach(id => { defaults[id] = 500 })
    return { expMap: defaults, analysisText: '描述为空，使用默认初始值。' }
  }

  try {
    // 使用 chat API 直接获取分析结果
    const result = await api.chat.send(
      [
        { role: 'user', content: `请根据以下"前世档案"描述，分析我的初始属性。只返回JSON，不要其他文字。\n\n我的描述：${description}` }
      ],
      ONBOARDING_SYSTEM_PROMPT
    )
    
    // 解析返回的 JSON（新格式包含 reason）
    const parsed = JSON.parse(result.reply)
    const validDims = ['pro', 'fitness', 'social', 'create', 'self', 'charm'] as DimensionId[]
    const dimLabels: Record<DimensionId, string> = { pro: '专业力', fitness: '体能', social: '社交', create: '创造力', self: '自律', charm: '魅力' }
    
    // 确保所有选择的维度都有值，并生成分析说明
    const resultMap: Record<DimensionId, number> = {} as any
    const reasons: string[] = []
    for (const id of selectedDims) {
      if (validDims.includes(id) && parsed[id] !== undefined) {
        const data = parsed[id]
        const exp = typeof data === 'number' ? data : (data?.exp ?? 500)
        const reason = typeof data === 'object' ? (data?.reason ?? '') : ''
        // 限制在合理范围内
        resultMap[id] = Math.max(300, Math.min(1200, exp))
        if (reason) {
          reasons.push(`${dimLabels[id]}：${reason} → ${resultMap[id]} EXP`)
        }
      } else {
        resultMap[id] = 500 // 默认值
      }
    }
    
    const analysisText = reasons.length > 0 
      ? reasons.join('\n')
      : '分析完成。'
    
    return { expMap: resultMap, analysisText }
  } catch (e) {
    console.error('[Onboarding AI] 分析失败，使用默认值:', e)
    // AI 失败时返回默认值
    const defaults: Record<DimensionId, number> = {} as any
    selectedDims.forEach(id => { defaults[id] = 500 })
    return { expMap: defaults, analysisText: 'AI分析失败，使用默认初始值。' }
  }
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
function StepDot({ n, active, done, onClick }: { n: number; active: boolean; done: boolean; onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      style={{
        width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: done ? 'var(--red)' : active ? 'rgba(195,0,47,0.2)' : 'var(--card2)',
        border: `1px solid ${active || done ? 'var(--red)' : 'var(--dim)'}`,
        clipPath: 'polygon(6px 0,100% 0,calc(100% - 6px) 100%,0 100%)',
        transition: 'all 0.3s',
        cursor: done && !active ? 'pointer' : 'default',
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
  const [filledTags, setFilledTags] = useState<Array<{ label: string; value: string }>>([])
  const [tipModal, setTipModal] = useState<{ label: string; key: string } | null>(null)
  const [tipValue, setTipValue] = useState('')
  const [selectedDims, setSelectedDims] = useState<DimensionId[]>(['pro','fitness','social','create','self','charm'])
  const [description, setDescription] = useState('')
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisLines, setAnalysisLines] = useState<string[]>([])
  const [aiAnalysisResult, setAiAnalysisResult] = useState('')
  const [initExp, setInitExp] = useState<Record<DimensionId, number>>(() => {
    // Pre-fill with defaults (500 base for better radar chart display)
    const defaults: Partial<Record<DimensionId, number>> = {}
    ALL_DIMS.forEach(d => { defaults[d.id] = 500 })
    return defaults as Record<DimensionId, number>
  })
  const [radarProgress, setRadarProgress] = useState(0)
  const [firstHabitName, setFirstHabitName] = useState('')
  const [firstHabitDim, setFirstHabitDim] = useState<DimensionId>('pro')
  const [firstHabitSlot, setFirstHabitSlot] = useState<'morning'|'afternoon'|'evening'|'night'>('morning')
  const [saving, setSaving] = useState(false)
  const rafRef = useRef<number>(0)

  const username = user?.username || 'PHANTOM'

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

  // Step 3: run AI analysis animation then compute results
  useEffect(() => {
    if (step !== 3) return

    // 先发送AI请求
    const tagText = filledTags.map(t => `#${t.label}：${t.value}`).join('；')
    const fullDescription = description + (tagText ? '；' + tagText : '')
    
    const analysisPromise = analyzeWithAI(fullDescription, selectedDims)

    // 动画进度条
    const lines = [
      '// 正在连接命运档案系统...',
      '// 读取你的前世档案...',
      '// AI 正在分析能力维度...',
      '// 计算初始属性分布...',
      '// 生成专属命运牌...',
    ]
    let i = 0
    const iv = setInterval(() => {
      i++
      setAnalysisProgress(Math.min(90, Math.round((i / lines.length) * 100)))
      setAnalysisLines(prev => [...prev, lines[i-1]])
      if (i >= lines.length) {
        clearInterval(iv)
        // 等待AI响应
        analysisPromise.then(({ expMap, analysisText }) => {
          setInitExp(expMap)
          setAiAnalysisResult(analysisText)
          setAnalysisProgress(100)
          setAnalysisLines(prev => [...prev, '// 分析完成 ✓'])
          setTimeout(() => setStep(4), 500)
        })
      }
    }, 400)
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

    // Apply initial exp to profile store (local)
    const expMap: Record<DimensionId, number> = {} as any
    for (const [id, exp] of Object.entries(initExp)) {
      expMap[id as DimensionId] = exp
    }
    setDimensionExp(expMap)

    // Add first habit if provided (addHabit already pushes to cloud)
    if (firstHabitName.trim()) {
      addHabit({
        name: firstHabitName.trim(),
        dimensions: [{ dimension: firstHabitDim, exp: 20 }],
        timeSlot: firstHabitSlot,
        isAnchor: true,
      })
    }

    // Push initial dimension exp to cloud
    await pushOnboardingDims(expMap)

    // Mark onboarding done via arcana-server
    await useAuthStore.getState().updateUser({ onboarding_done: true })

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
                <StepDot key={n} n={n} active={step===n} done={step>n} onClick={() => step > n && setStep(n)}/>
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
                用自己的话说说你现在的水平和生活状态。AI 会根据描述给你分配合理的初始属性值。
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
                placeholder={`例如：去年刚毕业，在一家互联网公司做技术人员，每天朝九晚六，下班后会健身或者看看小说，周末会和朋友聚会，喜欢尝试新餐厅...`}
                style={{
                  width:'100%', minHeight:140, background:'transparent', border:'none',
                  color:'var(--white)', fontSize:13, padding:'8px 14px 16px',
                  outline:'none', resize:'none', boxSizing:'border-box',
                  fontFamily:'Noto Sans SC,sans-serif', lineHeight:1.7,
                  caretColor:'var(--red)',
                }}
              />
            </div>

            {/* 已填写标签（和添加按钮分开显示） */}
            {filledTags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {filledTags.map((tag, idx) => (
                  <span key={idx} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 10px', background: 'var(--card2)',
                    border: '1px solid var(--gold)', borderRadius: 6,
                    fontSize: 10, color: 'var(--gold)'
                  }}>
                    <span>#{tag.label}：{tag.value}</span>
                    <span 
                      onClick={() => setFilledTags(prev => prev.filter((_, i) => i !== idx))}
                      style={{ cursor: 'pointer', opacity: 0.7 }}
                    >✕</span>
                  </span>
                ))}
              </div>
            )}

            {/* 分类标签按钮 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {[
                { label: '专业/技能', key: 'pro' },
                { label: '运动/健康', key: 'fitness' },
                { label: '社交/朋友', key: 'social' },
                { label: '兴趣爱好', key: 'create' },
                { label: '生活习惯', key: 'self' },
                { label: '过往成就', key: 'achievement' },
                { label: '学习经历', key: 'education' },
                { label: '工作经历', key: 'work' },
                { label: '个人特质', key: 'personality' },
              ].map((tip, i) => (
                <span key={i} style={{
                  padding: '6px 14px', background: 'rgba(195,0,47,0.1)', 
                  border: '1px solid rgba(195,0,47,0.3)', borderRadius: 4, 
                  color: 'var(--red)', cursor: 'pointer', fontSize: 11,
                  transition: 'all 0.2s'
                }} onClick={() => { setTipModal(tip); setTipValue('') }}>
                  + {tip.label}
                </span>
              ))}
            </div>

            {/* 弹窗 */}
            {tipModal && (
              <div style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 1000
              }} onClick={() => setTipModal(null)}>
                <div style={{
                  background: 'var(--card)', padding: 24, width: '80%', maxWidth: 320,
                  clipPath: 'polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,16px 100%,0 calc(100% - 16px))',
                }} onClick={e => e.stopPropagation()}>
                  <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 18, color: 'var(--red)', marginBottom: 16, letterSpacing: 2 }}>
                    #{tipModal.label}
                  </div>
                  <textarea
                    autoFocus
                    value={tipValue}
                    onChange={e => setTipValue(e.target.value)}
                    placeholder={`描述你的${tipModal.label}...`}
                    style={{
                      width: '100%', height: 100, background: 'var(--card2)', border: '1px solid var(--dim)',
                      color: 'var(--white)', fontSize: 13, padding: 12, resize: 'none',
                      outline: 'none', caretColor: 'var(--red)', marginBottom: 16,
                      fontFamily: 'Noto Sans SC,sans-serif', lineHeight: 1.6
                    }}
                  />
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={() => setTipModal(null)}
                      style={{
                        flex: 1, padding: '12px', background: 'var(--card2)', border: '1px solid var(--dim)',
                        color: 'var(--muted)', fontFamily: 'Bebas Neue,sans-serif', fontSize: 14, letterSpacing: 2, cursor: 'pointer'
                      }}
                    >
                      取消
                    </button>
                    <button
                      onClick={() => {
                        if (tipValue.trim()) {
                          // 确认时不拼接到文本框，只添加到标签列表
                          setFilledTags(prev => [...prev, { label: tipModal.label, value: tipValue.trim() }])
                        }
                        setTipModal(null)
                      }}
                      style={{
                        flex: 1, padding: '12px', background: 'var(--red)', border: 'none',
                        color: 'var(--white)', fontFamily: 'Bebas Neue,sans-serif', fontSize: 14, letterSpacing: 2, cursor: 'pointer'
                      }}
                    >
                      确认
                    </button>
                  </div>
                </div>
              </div>
            )}

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
              background:'var(--card)', marginBottom: 16, padding:'16px 10px 12px',
              clipPath:'polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,14px 100%,0 calc(100% - 14px))',
              position:'relative', overflow:'hidden',
            }}>
              <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,var(--red),transparent 70%)'}}/>
              {(() => {
                const orderedDims = ALL_DIMS.filter(d => selectedDims.includes(d.id))
                const maxExp = Math.max(...Object.values(initExp), 1000)
                const ratios = orderedDims.map(d => {
                  const exp = initExp[d.id] || 0
                  return Math.min(1, exp / maxExp)
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

            {/* AI分析理由 */}
            {aiAnalysisResult && (
              <div style={{
                background: 'rgba(195,0,47,0.08)',
                border: '1px solid rgba(195,0,47,0.25)',
                padding: '14px 16px',
                marginBottom: 16,
                clipPath: 'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)',
              }}>
                <div style={{
                  fontFamily: 'Share Tech Mono,monospace', fontSize: 9, color: 'var(--red)',
                  letterSpacing: 2, marginBottom: 8
                }}>
                  ⚡ AI 分析理由
                </div>
                <div style={{
                  fontFamily: 'Share Tech Mono,monospace', fontSize: 10, color: 'var(--gold)',
                  lineHeight: 1.8, whiteSpace: 'pre-line'
                }}>
                  {aiAnalysisResult}
                </div>
              </div>
            )}

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
