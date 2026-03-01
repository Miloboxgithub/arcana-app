import { useState, useEffect, useRef } from 'react'
import useProfileStore from '@/stores/useProfileStore'
import useHabitStore from '@/stores/useHabitStore'
import useAuthStore from '@/stores/useAuthStore'

// ── Preset avatar nodes for Status page ──────────────────
const STATUS_PRESETS: Record<string, JSX.Element> = {
  joker: (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
      <rect width="100" height="100" fill="#0a0a0a"/>
      <polygon points="0,0 22,0 0,22" fill="#C3002F" opacity="0.8"/>
      <path d="M20 100 Q25 72 50 68 Q75 72 80 100 Z" fill="#1a1a2e"/>
      <path d="M36 100 Q41 76 50 73 Q59 76 64 100 Z" fill="#f0f0f0" opacity="0.9"/>
      <path d="M48 74 L52 74 L54 100 L46 100 Z" fill="#C3002F"/>
      <ellipse cx="50" cy="44" rx="18" ry="20" fill="#f5dcc8"/>
      <ellipse cx="50" cy="30" rx="19" ry="14" fill="#111"/>
      <path d="M68 30 Q74 26 70 38 Q66 34 64 40" fill="#111"/>
      <path d="M32 30 Q28 26 31 40 Q34 36 36 42" fill="#111"/>
      <rect x="35" y="44" width="11" height="7" rx="3" fill="none" stroke="#333" strokeWidth="1.2"/>
      <rect x="54" y="44" width="11" height="7" rx="3" fill="none" stroke="#333" strokeWidth="1.2"/>
      <line x1="46" y1="47" x2="54" y2="47" stroke="#333" strokeWidth="1.2"/>
      <ellipse cx="40" cy="48" rx="3" ry="3.5" fill="#1a1a1a"/>
      <ellipse cx="59" cy="48" rx="3" ry="3.5" fill="#1a1a1a"/>
      <circle cx="41" cy="47" r="0.8" fill="white" opacity="0.8"/>
      <circle cx="60" cy="47" r="0.8" fill="white" opacity="0.8"/>
      <path d="M35 42 Q40 40 45 41" stroke="#111" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <path d="M54 41 Q59 40 64 42" stroke="#111" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <path d="M44 59 Q50 62 56 58" stroke="#c08060" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  ryuji: (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
      <rect width="100" height="100" fill="#0a0a0a"/>
      <polygon points="0,0 22,0 0,22" fill="#E8C840" opacity="0.8"/>
      <path d="M22 100 Q26 72 50 68 Q74 72 78 100 Z" fill="#1a1220"/>
      <ellipse cx="50" cy="44" rx="18" ry="20" fill="#f0c880"/>
      <ellipse cx="50" cy="29" rx="19" ry="13" fill="#E8C840"/>
      <path d="M31 26 Q28 14 35 22" fill="#E8C840"/>
      <path d="M35 22 Q33 8 41 19" fill="#E8C840"/>
      <path d="M52 18 Q55 7 58 19" fill="#E8C840"/>
      <path d="M68 26 Q74 16 70 28" fill="#E8C840"/>
      <ellipse cx="40" cy="48" rx="4" ry="4" fill="#1a1a1a"/>
      <ellipse cx="60" cy="48" rx="4" ry="4" fill="#1a1a1a"/>
      <circle cx="42" cy="46" r="1.2" fill="white" opacity="0.9"/>
      <circle cx="62" cy="46" r="1.2" fill="white" opacity="0.9"/>
      <path d="M34 42 Q40 39 46 42" stroke="#6b4400" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M54 42 Q60 39 66 42" stroke="#6b4400" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M38 59 Q50 68 62 59" stroke="#c08060" strokeWidth="1.5" fill="rgba(200,100,80,0.3)" strokeLinecap="round"/>
    </svg>
  ),
  ann: (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
      <rect width="100" height="100" fill="#0a0a0a"/>
      <polygon points="0,0 22,0 0,22" fill="#ff4466" opacity="0.8"/>
      <path d="M22 100 Q26 72 50 68 Q74 72 78 100 Z" fill="#1a0a10"/>
      <ellipse cx="50" cy="44" rx="18" ry="20" fill="#fde8d8"/>
      <path d="M28 34 Q24 60 26 85 Q32 70 34 60" fill="#f0d060"/>
      <path d="M72 34 Q76 60 74 85 Q68 70 66 60" fill="#f0d060"/>
      <ellipse cx="50" cy="28" rx="20" ry="12" fill="#f0d060"/>
      <ellipse cx="40" cy="47" rx="4" ry="4.5" fill="#1a1a1a"/>
      <ellipse cx="60" cy="47" rx="4" ry="4.5" fill="#1a1a1a"/>
      <ellipse cx="40" cy="46" rx="2" ry="2.5" fill="#5588ff"/>
      <ellipse cx="60" cy="46" rx="2" ry="2.5" fill="#5588ff"/>
      <circle cx="41" cy="45" r="0.8" fill="white" opacity="0.9"/>
      <circle cx="61" cy="45" r="0.8" fill="white" opacity="0.9"/>
      <path d="M42 59 Q50 64 58 59" stroke="#ff4466" strokeWidth="1.5" fill="rgba(255,68,102,0.3)" strokeLinecap="round"/>
    </svg>
  ),
  makoto: (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
      <rect width="100" height="100" fill="#0a0a0a"/>
      <polygon points="0,0 22,0 0,22" fill="#888" opacity="0.8"/>
      <path d="M22 100 Q26 72 50 68 Q74 72 78 100 Z" fill="#1a1a20"/>
      <ellipse cx="50" cy="44" rx="18" ry="20" fill="#f0d0c0"/>
      <ellipse cx="50" cy="28" rx="19" ry="12" fill="#4a2800"/>
      <path d="M31 30 Q30 50 32 58" fill="#4a2800"/>
      <path d="M69 30 Q70 50 68 58" fill="#4a2800"/>
      <ellipse cx="40" cy="47" rx="4" ry="4" fill="#1a1a1a"/>
      <ellipse cx="60" cy="47" rx="4" ry="4" fill="#1a1a1a"/>
      <ellipse cx="40" cy="47" rx="2" ry="2" fill="#8b4513"/>
      <ellipse cx="60" cy="47" rx="2" ry="2" fill="#8b4513"/>
      <circle cx="41" cy="46" r="0.8" fill="white" opacity="0.8"/>
      <circle cx="61" cy="46" r="0.8" fill="white" opacity="0.8"/>
      <path d="M34 42 Q40 39 46 41" stroke="#4a2800" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M54 41 Q60 39 66 42" stroke="#4a2800" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M44 59 Q50 61 56 59" stroke="#c08060" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <path d="M36 20 L40 14 L44 20 L50 12 L56 20 L60 14 L64 20" stroke="#888" strokeWidth="1.5" fill="none"/>
    </svg>
  ),
}

function AvatarNode({ avatarId }: { avatarId: string }) {
  if (avatarId && avatarId.startsWith('data:')) {
    return <img src={avatarId} alt="头像" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
  }
  return STATUS_PRESETS[avatarId] || STATUS_PRESETS['joker']
}

// 正六边形，宽屏 viewBox: 280x240，CX=140 CY=120
// 6个顶点从顶部开始顺时针: top, top-right, bottom-right, bottom, bottom-left, top-left
// 外接圆半径 R=100，但因为宽度更宽，水平方向给R*cos30°≈86.6，垂直R=100
const CX = 140, CY = 120, R = 100
const TIPS: [number,number][] = [
  [CX,         CY - R],           // 0: top     (专业力)
  [CX + R*Math.sqrt(3)/2, CY - R/2], // 1: top-right (体能)
  [CX + R*Math.sqrt(3)/2, CY + R/2], // 2: bottom-right (社交)
  [CX,         CY + R],           // 3: bottom  (创造力)
  [CX - R*Math.sqrt(3)/2, CY + R/2], // 4: bottom-left (自律)
  [CX - R*Math.sqrt(3)/2, CY - R/2], // 5: top-left (魅力)
].map(([x,y]) => [+x.toFixed(1), +y.toFixed(1)] as [number,number])

const DIM_ORDER = ['pro','fitness','social','create','self','charm'] as const
type DId = typeof DIM_ORDER[number]

function buildPts(ratios: number[]) {
  return ratios.map((r,i)=>{
    const t=Math.max(0,Math.min(1,r))
    const [tx,ty]=TIPS[i]
    return `${(CX+(tx-CX)*t).toFixed(1)},${(CY+(ty-CY)*t).toFixed(1)}`
  }).join(' ')
}

const DIM_META: Record<DId,{label:string;ranks:string[]}> = {
  pro:     {label:'专业力',ranks:['NOVICE','SCHOLAR','VIRTUOSO','MAESTRO','LEGEND']},
  fitness: {label:'体能',  ranks:['ROOKIE','ATHLETE','CHAMPION','TITAN','BEAST']},
  social:  {label:'社交',  ranks:['SHY','CHARMER','DIPLOMAT','CHARISMATIC','LEGEND']},
  create:  {label:'创造力',ranks:['DABBLER','ARTISAN','VISIONARY','GENIUS','LEGEND']},
  self:    {label:'自律',  ranks:['DRIFTER','RESOLVED','STOIC','IRON WILL','LEGEND']},
  charm:   {label:'魅力',  ranks:['PLAIN','ALLURING','MAGNETIC','ENCHANTING','LEGEND']},
}

const DIM_ICONS: Record<DId,JSX.Element> = {
  pro:    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="14" width="3" height="4" fill="currentColor"/><rect x="6.5" y="10" width="3" height="8" fill="currentColor" opacity="0.8"/><rect x="11" y="6" width="3" height="12" fill="currentColor" opacity="0.6"/><rect x="15.5" y="2" width="3" height="16" fill="var(--red)"/></svg>,
  fitness:<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="3" fill="var(--red)"/><path d="M2 10L5 10M15 10L18 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/><rect x="4" y="8" width="4" height="4" rx="1" fill="currentColor" opacity="0.6"/><rect x="12" y="8" width="4" height="4" rx="1" fill="currentColor" opacity="0.6"/></svg>,
  social: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="7" cy="7" r="3" fill="currentColor" opacity="0.7"/><circle cx="14" cy="5" r="2.5" fill="var(--red)" opacity="0.9"/><path d="M2 17C2 13 4 11 7 11C9 11 11 12 12 13" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>,
  create: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><polygon points="10,2 12.5,7.5 18,8 14,12 15,18 10,15 5,18 6,12 2,8 7.5,7.5" fill="currentColor" opacity="0.5"/><polygon points="10,5 11.5,8.5 15,9 12.5,11.5 13,15 10,13.5 7,15 7.5,11.5 5,9 8.5,8.5" fill="var(--red)"/></svg>,
  self:   <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="6" height="6" fill="var(--red)" transform="rotate(10 6 6)"/><rect x="11" y="3" width="6" height="6" fill="currentColor" opacity="0.5" transform="rotate(-8 14 6)"/><rect x="3" y="11" width="6" height="6" fill="currentColor" opacity="0.4" transform="rotate(-5 6 14)"/><rect x="11" y="11" width="6" height="6" fill="currentColor" opacity="0.7" transform="rotate(12 14 14)"/></svg>,
  charm:  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3C10 3 4 7 4 12C4 15.3 6.7 18 10 18C13.3 18 16 15.3 16 12C16 7 10 3 10 3Z" fill="currentColor" opacity="0.4"/><path d="M10 7C10 7 7 10 7 12.5C7 14.2 8.3 15.5 10 15.5C11.7 15.5 13 14.2 13 12.5C13 10 10 7 10 7Z" fill="var(--red)" opacity="0.9"/></svg>,
}

function SH({label}:{label:string}) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:10,margin:'20px 0 10px'}}>
      <div className="section-tag" style={{fontFamily:'Bebas Neue,sans-serif',fontSize:13,letterSpacing:4,color:'var(--white)',transform:'skewX(-5deg)',whiteSpace:'nowrap',display:'flex',alignItems:'center'}}>{label}</div>
      <div style={{flex:1,height:1,background:'linear-gradient(90deg,var(--dim),transparent)'}}/>
    </div>
  )
}

export default function Status() {
  const {dimensions,getTotalLevel} = useProfileStore()
  const {getStreak} = useHabitStore()
  const {user} = useAuthStore()
  const [bars,setBars] = useState(false)
  const [open,setOpen] = useState<Set<string>>(new Set())

  const username = (user?.user_metadata?.username || user?.email?.split('@')[0] || 'PHANTOM').toUpperCase()
  const avatarId: string = user?.user_metadata?.avatar_id || 'joker'

  // RAF-based radar animation: progress 0→1
  const [radarProgress, setRadarProgress] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(()=>{
    const t1 = setTimeout(()=>setBars(true), 100)
    // Start radar animation after 400ms delay
    const t2 = setTimeout(()=>{
      const start = performance.now()
      const DURATION = 1400 // ms
      const ease = (t:number) => t<0.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2 // easeInOutCubic
      const tick = (now:number) => {
        const t = Math.min(1, (now - start) / DURATION)
        setRadarProgress(ease(t))
        if (t < 1) rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    }, 400)
    return ()=>{
      clearTimeout(t1)
      clearTimeout(t2)
      cancelAnimationFrame(rafRef.current)
    }
  },[])

  const dmap = Object.fromEntries(dimensions.map(d=>[d.id,d]))
  const totalLevel = getTotalLevel()
  const streak = getStreak()
  const totalExp = dimensions.reduce((s,d)=>s+d.exp+d.level*d.maxExp,0)
  const wk = Math.ceil((Date.now()-new Date(new Date().getFullYear(),0,1).getTime())/(7*86400000))

  const ratios = DIM_ORDER.map(id=>{ const d=dmap[id]; return d ? d.exp/d.maxExp : 0 })
  // Interpolate from 0 to actual ratios using radarProgress
  const animatedRatios = ratios.map(r => r * radarProgress)
  const pts = buildPts(animatedRatios)

  const toggle = (id:string) => setOpen(p=>{const n=new Set(p); n.has(id)?n.delete(id):n.add(id); return n})

  return (
    <div className="page-container">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 20px 12px',position:'relative',zIndex:10}}>
        <span style={{fontFamily:'Bebas Neue,sans-serif',fontSize:18,letterSpacing:6,color:'var(--white)',transform:'skewX(-4deg)',display:'inline-block'}}>属性</span>
        <span style={{fontFamily:'Share Tech Mono,monospace',fontSize:9,color:'var(--red)',letterSpacing:2,border:'1px solid rgba(195,0,47,0.4)',padding:'3px 10px',clipPath:'polygon(6px 0,100% 0,calc(100% - 6px) 100%,0 100%)'}}>怪盗团</span>
      </div>
      <div style={{height:2,background:'var(--red)',transform:'skewX(-12deg)',boxShadow:'0 0 16px rgba(195,0,47,0.6)'}}/>

      <div style={{padding:'18px 16px 110px',position:'relative',zIndex:10}}>

        {/* Char card */}
        <div style={{position:'relative',background:'var(--card)',marginBottom:16,overflow:'hidden',clipPath:'polygon(0 0,calc(100% - 18px) 0,100% 18px,100% 100%,18px 100%,0 calc(100% - 18px))'}}>
          <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,var(--red),rgba(195,0,47,0.2),transparent)'}}/>
          <div style={{position:'absolute',right:-12,bottom:-16,fontFamily:'Bebas Neue,sans-serif',fontSize:110,lineHeight:1,color:'rgba(195,0,47,0.04)',letterSpacing:-4,userSelect:'none',pointerEvents:'none'}}>ARCANA</div>
          <div style={{display:'flex',alignItems:'center',gap:16,padding:'18px 18px 14px'}}>
            <div style={{position:'relative',flexShrink:0}}>
              <div style={{width:72,height:72,background:'var(--card2)',clipPath:'polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))',display:'flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden',border:'1px solid var(--dim)'}}>
                <AvatarNode avatarId={avatarId}/>
              </div>
              <div style={{position:'absolute',bottom:-4,right:-4,background:'var(--red)',fontFamily:'Bebas Neue,sans-serif',fontSize:11,letterSpacing:1,color:'var(--white)',padding:'2px 6px',clipPath:'polygon(4px 0,100% 0,calc(100% - 4px) 100%,0 100%)'}}>LV·{totalLevel}</div>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:'Bebas Neue,sans-serif',fontSize:28,lineHeight:1,color:'var(--white)',letterSpacing:3,transform:'skewX(-3deg)',display:'inline-block'}}>{username}</div>
              <div style={{fontFamily:'Share Tech Mono,monospace',fontSize:9,color:'var(--red)',letterSpacing:2,textTransform:'uppercase',margin:'3px 0 8px'}}>// 怪盗团见习成员</div>
              <div style={{display:'flex',justifyContent:'space-between',fontFamily:'Share Tech Mono,monospace',fontSize:9,color:'var(--muted)',letterSpacing:1,marginBottom:4}}>
                <span>累计经验</span><span style={{color:'var(--gold)'}}>{totalExp.toLocaleString()}</span>
              </div>
              <div style={{height:4,background:'var(--dim)',position:'relative'}}>
                <div style={{height:'100%',background:'linear-gradient(90deg,var(--red),#e03060)',width:bars?`${Math.min(100,(totalExp/10000)*100)}%`:'0%',position:'relative',transition:'width 1.5s cubic-bezier(0.22,1,0.36,1)'}}>
                  <div style={{position:'absolute',right:-2,top:-3,width:10,height:10,background:'var(--white)',border:'1.5px solid var(--red)',transform:'rotate(45deg)'}}/>
                </div>
              </div>
              <div style={{display:'flex',gap:6,marginTop:8,flexWrap:'wrap'}}>
                {[{t:`WEEK ${wk}`,bg:'rgba(195,0,47,0.15)',c:'var(--red)',b:'1px solid rgba(195,0,47,0.3)'},{t:`+${Math.floor(totalExp*0.05)} THIS WEEK`,bg:'rgba(232,200,64,0.1)',c:'var(--gold)',b:'1px solid rgba(232,200,64,0.2)'},{t:`${streak} DAY STK`,bg:'var(--card2)',c:'var(--muted)',b:'1px solid var(--dim)'}].map(x=>(
                  <span key={x.t} style={{fontFamily:'Share Tech Mono,monospace',fontSize:9,letterSpacing:1,padding:'2px 8px',clipPath:'polygon(4px 0,100% 0,calc(100% - 4px) 100%,0 100%)',background:x.bg,color:x.c,border:x.b}}>{x.t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Radar */}
        <SH label="奥义雷达"/>
        <div style={{position:'relative',background:'var(--card)',marginBottom:16,padding:'20px 12px 16px',clipPath:'polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,14px 100%,0 calc(100% - 14px))',overflow:'hidden'}}>
          <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,var(--red),transparent 70%)'}}/>
          <svg viewBox="0 0 280 240" fill="none" style={{display:'block',margin:'0 auto',width:'100%',maxWidth:340,height:'auto'}}>
            {/* Grid polygons: 5 layers */}
            <g opacity="0.15" stroke="var(--red)" strokeWidth="0.5">
              {[0.2,0.4,0.6,0.8,1.0].map(t=>(
                <polygon key={t} points={TIPS.map(([tx,ty])=>`${(CX+(tx-CX)*t).toFixed(1)},${(CY+(ty-CY)*t).toFixed(1)}`).join(' ')} fill="none"/>
              ))}
              {TIPS.map(([tx,ty],i)=>(
                <line key={i} x1={CX} y1={CY} x2={tx} y2={ty}/>
              ))}
            </g>
            {/* Data area */}
            <polygon
              points={pts}
              fill="rgba(195,0,47,0.2)"
              stroke="var(--red)"
              strokeWidth="1.5"
              strokeLinejoin="round"
              style={{filter:radarProgress>0.1?'drop-shadow(0 0 6px rgba(195,0,47,0.4))':'none'}}
            />
            {/* Data points (diamonds) — appear near end of animation */}
            {radarProgress > 0.85 && TIPS.map(([tx,ty],i)=>{
              const t=Math.max(0,Math.min(1,animatedRatios[i]))
              const px=CX+(tx-CX)*t,py=CY+(ty-CY)*t
              const fadeIn = Math.min(1,(radarProgress-0.85)/0.15)
              return <rect key={i} x={px-4} y={py-4} width={8} height={8} fill="var(--white)" stroke="var(--red)" strokeWidth="1" transform={`rotate(45,${px},${py})`} opacity={fadeIn}/>
            })}
            {/* Labels */}
            <text x={CX}         y={CY-R-12}   textAnchor="middle" fill="var(--white)" fontFamily="Share Tech Mono,monospace" fontSize="9" letterSpacing="1">专业力</text>
            <text x={CX+R*Math.sqrt(3)/2+8} y={CY-R/2+4} textAnchor="start" fill="var(--white)" fontFamily="Share Tech Mono,monospace" fontSize="9" letterSpacing="1">体能</text>
            <text x={CX+R*Math.sqrt(3)/2+8} y={CY+R/2+4} textAnchor="start" fill="var(--white)" fontFamily="Share Tech Mono,monospace" fontSize="9" letterSpacing="1">社交</text>
            <text x={CX}         y={CY+R+18}   textAnchor="middle" fill="var(--white)" fontFamily="Share Tech Mono,monospace" fontSize="9" letterSpacing="1">创造力</text>
            <text x={CX-R*Math.sqrt(3)/2-8} y={CY+R/2+4} textAnchor="end" fill="var(--white)" fontFamily="Share Tech Mono,monospace" fontSize="9" letterSpacing="1">自律</text>
            <text x={CX-R*Math.sqrt(3)/2-8} y={CY-R/2+4} textAnchor="end" fill="var(--white)" fontFamily="Share Tech Mono,monospace" fontSize="9" letterSpacing="1">魅力</text>
          </svg>
        </div>

        {/* Stat rows */}
        <SH label="维度详情"/>
        <div style={{display:'flex',flexDirection:'column',gap:2}}>
          {DIM_ORDER.map(id=>{
            const d=dmap[id]; const meta=DIM_META[id]
            const exp=d?.exp??0,maxExp=d?.maxExp??100,level=d?.level??0
            const pct=Math.min(100,(exp/maxExp)*100)
            const rank=meta.ranks[Math.min(level,meta.ranks.length-1)]
            const isOpen=open.has(id)
            return (
              <div key={id}>
                <div onClick={()=>toggle(id)} style={{position:'relative',background:isOpen?'var(--card2)':'var(--card)',padding:'12px 16px',display:'flex',alignItems:'center',gap:14,overflow:'hidden',clipPath:'polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%)',cursor:'pointer',transition:'background 0.2s'}}>
                  <div style={{position:'absolute',left:0,top:0,bottom:0,width:2,background:'var(--red)'}}/>
                  <div style={{position:'absolute',top:0,right:0,borderTop:'10px solid var(--card2)',borderLeft:'10px solid transparent'}}/>
                  <div style={{width:36,height:36,flexShrink:0,background:isOpen?'rgba(195,0,47,0.15)':'var(--card2)',display:'flex',alignItems:'center',justifyContent:'center',clipPath:'polygon(6px 0,100% 0,calc(100% - 6px) 100%,0 100%)',transition:'background 0.2s',color:'var(--muted)'}}>
                    {DIM_ICONS[id]}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',alignItems:'baseline',gap:8,marginBottom:6}}>
                      <span style={{fontSize:13,fontWeight:700,color:'var(--white)'}}>{meta.label}</span>
                      <span style={{fontFamily:'Bebas Neue,sans-serif',fontSize:20,color:'var(--red)',lineHeight:1}}>Lv{level}</span>
                      <span style={{fontFamily:'Share Tech Mono,monospace',fontSize:9,color:'var(--muted)',letterSpacing:1,marginLeft:'auto'}}>{rank}</span>
                    </div>
                    <div style={{height:3,background:'var(--dim)',position:'relative',overflow:'visible'}}>
                      <div style={{height:'100%',background:'var(--red)',width:bars?`${pct}%`:'0%',position:'relative',transition:'width 1.5s cubic-bezier(0.22,1,0.36,1)'}}>
                        <div style={{position:'absolute',right:-2,top:-3,width:9,height:9,background:'var(--white)',border:'1.5px solid var(--red)',transform:'rotate(45deg)'}}/>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{maxHeight:isOpen?130:0,overflow:'hidden',transition:'max-height 0.35s ease',background:'var(--card2)',padding:'0 16px'}}>
                  <div style={{padding:'10px 0 14px',borderTop:'1px solid var(--dim)'}}>
                    {[
                      {k:'当前经验',v:`${exp} / ${maxExp}`,gold:true,red:false},
                      {k:'THIS WEEK',v:`+${Math.floor(exp*0.1)} EXP`,gold:false,red:true},
                      {k:'NEXT RANK',v:`${meta.ranks[Math.min(level+1,meta.ranks.length-1)]} → Lv${level+1}`,gold:false,red:false},
                    ].map(r=>(
                      <div key={r.k} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                        <span style={{fontFamily:'Share Tech Mono,monospace',fontSize:9,color:'var(--muted)',letterSpacing:1}}>{r.k}</span>
                        <span style={{fontFamily:'Share Tech Mono,monospace',fontSize:10,color:r.gold?'var(--gold)':r.red?'var(--red)':'var(--white)'}}>{r.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
