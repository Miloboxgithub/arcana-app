import { useState, useRef, useMemo, useEffect } from 'react'
import useProfileStore from '@/stores/useProfileStore'
import useHabitStore from '@/stores/useHabitStore'
import useAuthStore from '@/stores/useAuthStore'
import useUIStore, { THEMES } from '@/stores/useUIStore'
import { useAchievementStore, Achievement } from '@/stores/useAchievementStore'
import { toast } from '@/components/ui/Toast'
import AchievementsModal from '@/components/ui/AchievementsModal'
// ---- Preset SVG Avatars (P5 characters, zero external deps) ----
const PRESET_AVATARS = [
  {
    id: 'joker', label: 'JOKER',
    node: (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
        <rect width="100" height="100" fill="#0a0a0a"/>
        <polygon points="0,0 22,0 0,22" fill="#C3002F" opacity="0.8"/>
        <polygon points="100,100 78,100 100,78" fill="#C3002F" opacity="0.4"/>
        <path d="M20 100 Q25 72 50 68 Q75 72 80 100 Z" fill="#1a1a2e"/>
        <path d="M36 100 Q41 76 50 73 Q59 76 64 100 Z" fill="#f0f0f0" opacity="0.9"/>
        <path d="M48 74 L52 74 L54 100 L46 100 Z" fill="#C3002F"/>
        <path d="M46 77 L54 77 L52 81 L50 79 L48 81 Z" fill="#C3002F"/>
        <ellipse cx="50" cy="44" rx="18" ry="20" fill="#f5dcc8"/>
        <ellipse cx="50" cy="30" rx="19" ry="14" fill="#111"/>
        <path d="M68 30 Q74 26 70 38 Q66 34 64 40" fill="#111"/>
        <path d="M32 30 Q28 26 31 40 Q34 36 36 42" fill="#111"/>
        <path d="M33 34 Q42 26 50 30 Q58 26 67 34" fill="#111"/>
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
        <rect x="0" y="95" width="100" height="2" fill="#C3002F" opacity="0.6"/>
        <rect x="2" y="2" width="8" height="2" fill="#C3002F" opacity="0.7"/>
        <rect x="2" y="2" width="2" height="8" fill="#C3002F" opacity="0.7"/>
        <rect x="90" y="2" width="8" height="2" fill="#C3002F" opacity="0.7"/>
        <rect x="96" y="2" width="2" height="8" fill="#C3002F" opacity="0.7"/>
      </svg>
    ),
  },
  {
    id: 'ryuji', label: 'SKULL',
    node: (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
        <rect width="100" height="100" fill="#0a0a0a"/>
        <polygon points="0,0 22,0 0,22" fill="#E8C840" opacity="0.8"/>
        <path d="M22 100 Q26 72 50 68 Q74 72 78 100 Z" fill="#1a1220"/>
        <ellipse cx="50" cy="44" rx="18" ry="20" fill="#f0c880"/>
        <ellipse cx="50" cy="29" rx="19" ry="13" fill="#E8C840"/>
        <path d="M31 26 Q28 14 35 22" fill="#E8C840"/>
        <path d="M35 22 Q33 8 41 19" fill="#E8C840"/>
        <path d="M42 19 Q42 7 48 18" fill="#E8C840"/>
        <path d="M52 18 Q55 7 58 19" fill="#E8C840"/>
        <path d="M62 22 Q67 10 68 24" fill="#E8C840"/>
        <path d="M68 26 Q74 16 70 28" fill="#E8C840"/>
        <ellipse cx="40" cy="48" rx="4" ry="4" fill="#1a1a1a"/>
        <ellipse cx="60" cy="48" rx="4" ry="4" fill="#1a1a1a"/>
        <circle cx="42" cy="46" r="1.2" fill="white" opacity="0.9"/>
        <circle cx="62" cy="46" r="1.2" fill="white" opacity="0.9"/>
        <path d="M34 42 Q40 39 46 42" stroke="#6b4400" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M54 42 Q60 39 66 42" stroke="#6b4400" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M38 59 Q50 68 62 59" stroke="#c08060" strokeWidth="1.5" fill="rgba(200,100,80,0.3)" strokeLinecap="round"/>
        <circle cx="82" cy="12" r="7" fill="none" stroke="#E8C840" strokeWidth="1"/>
        <circle cx="79" cy="11" r="1.5" fill="#E8C840"/>
        <circle cx="85" cy="11" r="1.5" fill="#E8C840"/>
        <path d="M79 14 L85 14" stroke="#E8C840" strokeWidth="1"/>
        <rect x="0" y="95" width="100" height="2" fill="#E8C840" opacity="0.6"/>
      </svg>
    ),
  },
  {
    id: 'ann', label: 'PANTHER',
    node: (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
        <rect width="100" height="100" fill="#0a0a0a"/>
        <polygon points="0,0 22,0 0,22" fill="#ff4466" opacity="0.8"/>
        <path d="M22 100 Q26 72 50 68 Q74 72 78 100 Z" fill="#1a0a10"/>
        <ellipse cx="50" cy="44" rx="18" ry="20" fill="#fde8d8"/>
        <path d="M28 34 Q24 60 26 85 Q32 70 34 60" fill="#f0d060"/>
        <path d="M72 34 Q76 60 74 85 Q68 70 66 60" fill="#f0d060"/>
        <ellipse cx="50" cy="28" rx="20" ry="12" fill="#f0d060"/>
        <path d="M30 28 Q28 18 34 26" fill="#f0d060"/>
        <path d="M70 28 Q72 18 66 26" fill="#f0d060"/>
        <ellipse cx="40" cy="47" rx="4" ry="4.5" fill="#1a1a1a"/>
        <ellipse cx="60" cy="47" rx="4" ry="4.5" fill="#1a1a1a"/>
        <ellipse cx="40" cy="46" rx="2" ry="2.5" fill="#5588ff"/>
        <ellipse cx="60" cy="46" rx="2" ry="2.5" fill="#5588ff"/>
        <circle cx="41" cy="45" r="0.8" fill="white" opacity="0.9"/>
        <circle cx="61" cy="45" r="0.8" fill="white" opacity="0.9"/>
        <path d="M35 44 Q38 40 45 43" stroke="#111" strokeWidth="1.8" fill="none"/>
        <path d="M55 43 Q62 40 65 44" stroke="#111" strokeWidth="1.8" fill="none"/>
        <path d="M42 59 Q50 64 58 59" stroke="#ff4466" strokeWidth="1.5" fill="rgba(255,68,102,0.3)" strokeLinecap="round"/>
        <rect x="0" y="95" width="100" height="2" fill="#ff4466" opacity="0.6"/>
        <rect x="2" y="2" width="8" height="2" fill="#ff4466" opacity="0.7"/>
        <rect x="2" y="2" width="2" height="8" fill="#ff4466" opacity="0.7"/>
      </svg>
    ),
  },
  {
    id: 'makoto', label: 'QUEEN',
    node: (
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
        <rect width="100" height="100" fill="#0a0a0a"/>
        <polygon points="0,0 22,0 0,22" fill="#888" opacity="0.8"/>
        <path d="M22 100 Q26 72 50 68 Q74 72 78 100 Z" fill="#1a1a20"/>
        <ellipse cx="50" cy="44" rx="18" ry="20" fill="#f0d0c0"/>
        <ellipse cx="50" cy="28" rx="19" ry="12" fill="#4a2800"/>
        <path d="M31 30 Q30 50 32 58" fill="#4a2800"/>
        <path d="M69 30 Q70 50 68 58" fill="#4a2800"/>
        <path d="M34 24 Q50 16 66 24" fill="#4a2800"/>
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
        <rect x="0" y="95" width="100" height="2" fill="#888" opacity="0.6"/>
      </svg>
    ),
  },
]

const AVATAR_KEY = 'arcana-avatar'

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

// 动态成就组件 - 从 store 获取数据
function AchievementCard({ achievement }: { achievement: Achievement }) {
  const { done, progress, target, progressPct } = achievement
  
  const badgeText = done ? '完成' : (progress > 0 ? `${progress}/${target}` : '锁定')
  
  return (
    <div style={{
      background: 'var(--card)', padding: '12px 14px',
      clipPath: 'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)',
      position: 'relative', overflow: 'hidden',
      opacity: !done && progress === 0 ? 0.4 : 1,
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: done ? 'var(--gold)' : 'var(--dim)' }} />
      <div style={{ 
        fontSize: 22, 
        marginBottom: 6, 
        filter: done ? 'drop-shadow(0 0 6px rgba(232,200,64,0.5))' : 'none',
        opacity: !done && progress === 0 ? 0.5 : 1,
      }}>{achievement.icon}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--white)', marginBottom: 2 }}>{achievement.name}</div>
      <div style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 8, color: 'var(--muted)', letterSpacing: 0.5, lineHeight: 1.4 }}>{achievement.description}</div>
      
      {/* Progress bar for in-progress achievements */}
      {!done && progress > 0 && (
        <div style={{ height: 2, background: 'var(--dim)', marginTop: 6 }}>
          <div style={{
            height: '100%',
            background: 'rgba(195,0,47,0.6)',
            width: `${progressPct}%`,
            transition: 'width 0.3s ease',
          }}/>
        </div>
      )}
      
      <div style={{ 
        position: 'absolute', 
        top: 6, 
        right: 6, 
        fontFamily: 'Bebas Neue,sans-serif', 
        fontSize: 8, 
        letterSpacing: 1, 
        color: done ? 'var(--gold)' : 'var(--muted)', 
        background: done ? 'rgba(232,200,64,0.1)' : 'transparent', 
        padding: done ? '1px 5px' : 0 
      }}>
        {badgeText}
      </div>
    </div>
  )
}

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
    name: '主题皮肤', val: null, // will be replaced dynamically
    action: 'theme',
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
  const { getStreak, checkRecords } = useHabitStore()
  const { user, signOut } = useAuthStore()
  const { openModal, closeModal, theme, setTheme } = useUIStore()
  const { achievements, fetchAchievements } = useAchievementStore()

  const username = user?.username || user?.email?.split('@')[0] || 'PHANTOM'

  // Fetch achievements on mount
  useEffect(() => {
    fetchAchievements()
  }, [fetchAchievements])

  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [showThemePicker, setShowThemePicker] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  // Read avatar from user state first, fallback to localStorage, then default
  const [avatarId, setAvatarId] = useState<string>(
    () => user?.avatar_id || localStorage.getItem(AVATAR_KEY) || 'joker'
  )
  // Username editing inside the picker
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const streak = getStreak()
  const totalLevel = getTotalLevel()
  const totalExp = dimensions.reduce((s, d) => s + (d.totalExp ?? 0), 0)
  const totalExpDisplay = totalExp > 999 ? `${(totalExp / 1000).toFixed(1)}K` : String(totalExp)
  
  // 完成率：过去30天有打卡的次数/30
  const completionRate = useMemo(() => {
    const days30 = new Set<string>()
    for (let i = 0; i < 30; i++) {
      const d = new Date(); d.setDate(d.getDate() - i)
      days30.add(d.toISOString().split('T')[0])
    }
    const activeDays = [...days30].filter(d => checkRecords.some(r => r.date === d)).length
    return Math.round((activeDays / 30) * 100)
  }, [checkRecords])

  const getAvatarNode = (id: string) => {
    if (id.startsWith('data:')) {
      return <img src={id} alt="头像" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    }
    const preset = PRESET_AVATARS.find(p => p.id === id) || PRESET_AVATARS[0]
    return preset.node
  }

  // Save avatar_id to arcana-server + localStorage
  const saveAvatar = async (id: string) => {
    setAvatarId(id)
    localStorage.setItem(AVATAR_KEY, id)
    try {
      await useAuthStore.getState().updateUser({ avatar_id: id })
    } catch {
      toast.error('头像同步失败，仅本地保存')
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 500 * 1024) {
      toast.error('图片不能超过 500KB，请压缩后重试')
      return
    }
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string
      await saveAvatar(dataUrl)
      setShowAvatarPicker(false); closeModal()
      toast.success('头像已更新', '✦')
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const selectPreset = async (id: string) => {
    await saveAvatar(id)
    toast.success('头像已更新', '✦')
  }

  const handleSaveName = async () => {
    if (!newName.trim()) return
    setSavingProfile(true)
    try {
      await useAuthStore.getState().updateUser({ username: newName.trim() })
      toast.success('用户名已更新', '✦')
      setEditingName(false)
    } catch {
      toast.error('修改失败')
    }
    setSavingProfile(false)
  }

  return (
    <div className="page-container">
      <PageHeader title="档案" badge="怪盗团" />

      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />

      <div style={{ padding: '18px 16px 0' }}>

        {/* Profile Hero */}
        <div style={{
          position: 'relative', margin: '0 0 16px', padding: '20px 20px 0',
          background: 'var(--card)',
          clipPath: 'polygon(0 0,calc(100% - 20px) 0,100% 20px,100% 100%,0 100%)',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,var(--red),var(--gold) 60%,transparent)' }} />
          <div style={{ position: 'absolute', right: -10, top: -10, fontFamily: 'Bebas Neue,sans-serif', fontSize: 100, letterSpacing: -2, color: 'transparent', WebkitTextStroke: '1px rgba(195,0,47,0.08)', pointerEvents: 'none', userSelect: 'none', lineHeight: 1, transform: 'skewX(-5deg)' }}>ARCANA</div>

          {/* Avatar + Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
            {/* Clickable avatar */}
            <div
              onClick={() => { setShowAvatarPicker(true); openModal() }}
              style={{
                position: 'relative', width: 72, height: 72,
                border: '2px solid rgba(195,0,47,0.4)',
                clipPath: 'polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px))',
                overflow: 'hidden', background: 'rgba(195,0,47,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, cursor: 'pointer',
              }}
            >
              {getAvatarNode(avatarId)}
              {/* Edit badge */}
              <div style={{
                position: 'absolute', bottom: 2, right: 2, background: 'var(--red)',
                borderRadius: '50%', width: 18, height: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 6px rgba(195,0,47,0.6)',
              }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
            </div>

            <div>
              <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 28, letterSpacing: 4, color: 'var(--white)', transform: 'skewX(-3deg)', display: 'inline-block', lineHeight: 1 }}>{username.toUpperCase()}</div>
              <div style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 9, letterSpacing: 2, color: 'var(--gold)', marginTop: 3 }}>◆ 怪盗团见习成员 · Lv.{totalLevel}</div>
              <div style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 8, color: 'var(--muted)', letterSpacing: 1, marginTop: 2 }}>ID·2026·PHANTOM·007</div>
            </div>
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, background: 'var(--dim)' }}>
            {[
              { num: totalExpDisplay, lbl: '累计经验' },
              { num: String(streak), lbl: '连击天' },
              { num: `${completionRate}%`, lbl: '完成率' },
            ].map(({ num, lbl }) => (
              <div key={lbl} style={{ background: 'var(--black)', padding: '10px 0', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 26, color: 'var(--white)', letterSpacing: 2, lineHeight: 1 }}>{num}</div>
                <div style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 8, color: 'var(--muted)', letterSpacing: 1, marginTop: 2 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== Avatar Picker Bottom Sheet ===== */}
        {showAvatarPicker && (
          <div
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
              zIndex: 1000, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'flex-end',
              backdropFilter: 'blur(4px)',
            }}
            onClick={() => { setShowAvatarPicker(false); setEditingName(false); closeModal() }}
          >
            <div
              style={{
                width: '100%', maxWidth: 480, background: '#111',
                borderTop: '2px solid var(--red)',
                padding: '24px 20px 40px',
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 16, letterSpacing: 4, color: 'var(--white)', transform: 'skewX(-4deg)', display: 'inline-block' }}>编辑档案</span>
                <div onClick={() => { setShowAvatarPicker(false); setEditingName(false); closeModal() }} style={{ cursor: 'pointer', color: 'var(--muted)', fontSize: 22, lineHeight: 1, padding: 4 }}>×</div>
              </div>

              {/* Username edit — always visible inside picker */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, marginBottom: 8 }}>// 用户名</div>
                {!editingName ? (
                  <div
                    onClick={() => { setEditingName(true); setNewName(username) }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: 'var(--card2)', padding: '10px 14px', cursor: 'pointer',
                      border: '1px solid var(--dim)',
                    }}
                  >
                    <span style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 18, letterSpacing: 3, color: 'var(--white)' }}>{username.toUpperCase()}</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      autoFocus
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                      placeholder="输入新用户名"
                      style={{
                        flex: 1, background: 'var(--card2)', border: '1px solid var(--red)',
                        color: 'var(--white)', fontSize: 13, padding: '10px 12px', outline: 'none',
                      }}
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={savingProfile}
                      style={{
                        background: 'var(--red)', border: 'none', color: 'var(--white)',
                        fontFamily: 'Bebas Neue,sans-serif', fontSize: 13, letterSpacing: 2,
                        padding: '0 16px', cursor: 'pointer', opacity: savingProfile ? 0.6 : 1,
                        clipPath: 'polygon(0 0,calc(100% - 4px) 0,100% 4px,100% 100%,4px 100%,0 calc(100% - 4px))',
                      }}
                    >
                      {savingProfile ? '...' : '确认'}
                    </button>
                  </div>
                )}
              </div>

              <div style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, marginBottom: 12 }}>// 选择头像</div>

              {/* Preset grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
                {PRESET_AVATARS.map(p => (
                  <div
                    key={p.id}
                    onClick={() => selectPreset(p.id)}
                    style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
                  >
                    <div style={{
                      width: 64, height: 64,
                      border: avatarId === p.id ? '2px solid var(--red)' : '1px solid var(--dim)',
                      clipPath: 'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px))',
                      overflow: 'hidden', background: '#0a0a0a',
                      boxShadow: avatarId === p.id ? '0 0 12px rgba(195,0,47,0.5)' : 'none',
                      transition: 'all 0.2s',
                    }}>
                      {p.node}
                    </div>
                    <span style={{
                      fontFamily: 'Bebas Neue,sans-serif', fontSize: 10, letterSpacing: 2,
                      color: avatarId === p.id ? 'var(--red)' : 'var(--muted)',
                    }}>{p.label}</span>
                  </div>
                ))}
              </div>

              {/* Upload custom */}
              <div style={{ borderTop: '1px solid var(--dim)', paddingTop: 16 }}>
                <div style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, marginBottom: 10 }}>// 自定义上传 (≤500KB)</div>
                <button
                  onClick={() => fileRef.current?.click()}
                  style={{
                    width: '100%', background: 'var(--card2)', border: '1px dashed var(--dim)',
                    color: 'var(--muted)', fontFamily: 'Share Tech Mono,monospace', fontSize: 11,
                    letterSpacing: 2, padding: '12px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--red)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--dim)')}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  从相册选择图片
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== Theme Picker Bottom Sheet ===== */}
        {showThemePicker && (
          <div
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
              zIndex: 1000, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'flex-end',
              backdropFilter: 'blur(4px)',
            }}
            onClick={() => { setShowThemePicker(false); closeModal() }}
          >
            <div
              style={{
                width: '100%', maxWidth: 480, background: '#111',
                borderTop: '2px solid var(--red)',
                padding: '24px 20px 40px',
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 16, letterSpacing: 4, color: 'var(--white)', transform: 'skewX(-4deg)', display: 'inline-block' }}>主题皮肤</span>
                <div onClick={() => { setShowThemePicker(false); closeModal() }} style={{ cursor: 'pointer', color: 'var(--muted)', fontSize: 22, lineHeight: 1, padding: 4 }}>×</div>
              </div>

              <div style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 9, color: 'var(--muted)', letterSpacing: 2, marginBottom: 12 }}>// 选择你的风格</div>

              {/* Theme options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {THEMES.map(t => (
                  <div
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id)
                      setShowThemePicker(false)
                      closeModal()
                      toast.success(`已切换为 ${t.name}`, '✦')
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: theme === t.id ? 'var(--card2)' : 'var(--card)',
                      padding: '14px 16px',
                      border: theme === t.id ? '1px solid var(--red)' : '1px solid var(--dim)',
                      cursor: 'pointer',
                      clipPath: 'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {/* Color preview */}
                      <div style={{
                        width: 36, height: 36,
                        background: t.id === 'p5' ? 'linear-gradient(135deg, #C3002F 0%, #FF1744 100%)' : 
                                   t.id === 'p3' ? 'linear-gradient(135deg, #1E88E5 0%, #64B5F6 100%)' : 
                                   'linear-gradient(135deg, #FFA000 0%, #FFD54F 100%)',
                        clipPath: 'polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px))',
                        boxShadow: theme === t.id ? `0 0 12px ${t.id === 'p5' ? 'rgba(195,0,47,0.5)' : t.id === 'p3' ? 'rgba(30,136,229,0.5)' : 'rgba(255,160,0,0.5)'}` : 'none',
                      }} />
                      <div>
                        <div style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 14, letterSpacing: 2, color: 'var(--white)' }}>{t.name}</div>
                        <div style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 8, color: 'var(--muted)', letterSpacing: 1, marginTop: 2 }}>{t.description}</div>
                      </div>
                    </div>
                    {theme === t.id && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <polyline points="20,6 9,17 4,12" stroke="var(--red)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Achievements - only show completed ones */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <SectionHead label="成就徽章" />
          {achievements.length > 0 && (
            <button
              onClick={() => { setShowAchievements(true); openModal() }}
              style={{
                background: 'none', border: 'none',
                fontFamily: 'Share Tech Mono,monospace',
                fontSize: 10, color: 'var(--red)',
                letterSpacing: 1, cursor: 'pointer',
                padding: '4px 8px',
              }}
            >
              查看全部 →
            </button>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          {achievements.filter(a => a.done).length > 0 ? (
            achievements.filter(a => a.done).slice(0, 6).map(ach => (
              <AchievementCard key={ach.id} achievement={ach} />
            ))
          ) : (
            // Fallback while loading or no completed achievements
            <>
              <div style={{ background: 'var(--card)', padding: '12px 14px', clipPath: 'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)', opacity: 0.5 }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>🔒</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--white)', marginBottom: 2 }}>暂无完成成就</div>
                <div style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 8, color: 'var(--muted)', letterSpacing: 0.5 }}>继续打卡，解锁你的第一个成就</div>
              </div>
            </>
          )}
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
            <div style={{ width: 40, height: 40, overflow: 'hidden', border: '1px solid rgba(195,0,47,0.3)', flexShrink: 0, clipPath: 'polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px))', background: '#0a0a0a' }}>
              {/* Morgana — SVG cat AI avatar */}
              <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
                <rect width="40" height="40" fill="#0a0a0a"/>
                <ellipse cx="20" cy="22" rx="12" ry="10" fill="#1a1a2e"/>
                <path d="M10 18 Q8 10 14 14" fill="#1a1a2e"/>
                <path d="M30 18 Q32 10 26 14" fill="#1a1a2e"/>
                <ellipse cx="15" cy="21" rx="3" ry="3" fill="#fff" opacity="0.9"/>
                <ellipse cx="25" cy="21" rx="3" ry="3" fill="#fff" opacity="0.9"/>
                <ellipse cx="15" cy="21" rx="1.5" ry="2" fill="#C3002F"/>
                <ellipse cx="25" cy="21" rx="1.5" ry="2" fill="#C3002F"/>
                <path d="M18 25 Q20 27 22 25" stroke="#aaa" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
                <circle cx="34" cy="6" r="4" fill="#C3002F" opacity="0.7"/>
                <text x="34" y="9" textAnchor="middle" fill="white" fontSize="5" fontWeight="bold">AI</text>
              </svg>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingBottom: 110 }}>
          {SETTINGS.map(s => (
            <div 
              key={s.name} 
              onClick={() => {
                if (s.action === 'theme') {
                  setShowThemePicker(true)
                  openModal()
                }
              }}
              style={{
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
              {s.name === '主题皮肤' ? (
                <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 9, color: 'var(--gold)', letterSpacing: 1 }}>{THEMES.find(t => t.id === theme)?.name}</span>
              ) : s.val ? (
                <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 9, color: 'var(--muted)', letterSpacing: 1 }}>{s.val}</span>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><polyline points="9,18 15,12 9,6" stroke="var(--dim)" strokeWidth="2" strokeLinecap="round"/></svg>
              )}
            </div>
          ))}

          {/* Edit username — moved into avatar picker, remove standalone entry */}

          {/* Sign out */}
          <div
            onClick={async () => {
              await signOut()
              toast.success('已安全退出', '◆')
            }}
            style={{ display: 'flex', alignItems: 'center', background: 'var(--card)', padding: '14px 16px', borderTop: '1px solid var(--dim)', marginTop: 2, clipPath: 'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, background: 'rgba(195,0,47,0.1)', clipPath: 'polygon(4px 0,100% 0,calc(100% - 4px) 100%,0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="var(--red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <span style={{ fontSize: 13, color: 'var(--red)' }}>退出登录</span>
            </div>
          </div>
        </div>

        {/* Achievements Modal */}
        {showAchievements && (
          <AchievementsModal
            achievements={achievements}
            onClose={() => { setShowAchievements(false); closeModal() }}
          />
        )}

      </div>
    </div>
  )
}