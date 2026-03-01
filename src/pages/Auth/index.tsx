import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '@/stores/useAuthStore'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const { signIn, signUp } = useAuthStore()

  const handle = async () => {
    setError(null)
    setLoading(true)
    if (mode === 'login') {
      const { error } = await signIn(email, password)
      if (error) setError(error)
    } else {
      if (!username.trim()) { setError('请输入用户名'); setLoading(false); return }
      const { error } = await signUp(email, password, username)
      if (error) setError(error)
      else setSuccess(true)
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--black)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 24px',
    }}>
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: 40 }}
      >
        <div style={{
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: 52,
          letterSpacing: 12,
          color: 'var(--red)',
          lineHeight: 1,
        }}>ARCANA</div>
        <div style={{
          fontSize: 11,
          letterSpacing: 4,
          color: 'var(--muted)',
          marginTop: 6,
        }}>AWAKEN YOUR POTENTIAL</div>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          width: '100%',
          maxWidth: 360,
          background: 'var(--card)',
          clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
          padding: '32px 28px',
        }}
      >
        {success ? (
          <div style={{ textAlign: 'center', color: 'var(--gold)', fontFamily: 'Bebas Neue, sans-serif', fontSize: 18, letterSpacing: 3 }}>
            注册成功！请检查邮箱完成验证 ✦
          </div>
        ) : (
          <>
            {/* Tab */}
            <div style={{ display: 'flex', marginBottom: 28, gap: 0 }}>
              {(['login', 'signup'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(null) }}
                  style={{
                    flex: 1,
                    background: 'none',
                    border: 'none',
                    borderBottom: mode === m ? '2px solid var(--red)' : '2px solid var(--dim)',
                    color: mode === m ? 'var(--white)' : 'var(--muted)',
                    fontFamily: 'Bebas Neue, sans-serif',
                    fontSize: 16,
                    letterSpacing: 3,
                    padding: '8px 0',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {m === 'login' ? '登录' : '注册'}
                </button>
              ))}
            </div>

            {/* Fields */}
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  key="username"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden', marginBottom: 14 }}
                >
                  <Field label="用户名" value={username} onChange={setUsername} placeholder="你的代号" />
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{ marginBottom: 14 }}>
              <Field label="邮箱" value={email} onChange={setEmail} placeholder="you@example.com" type="email" />
            </div>
            <div style={{ marginBottom: 24 }}>
              <Field label="密码" value={password} onChange={setPassword} placeholder="••••••••" type="password" />
            </div>

            {error && (
              <div style={{
                color: 'var(--red)',
                fontSize: 12,
                marginBottom: 16,
                padding: '8px 12px',
                background: 'rgba(195,0,47,0.1)',
                borderLeft: '2px solid var(--red)',
              }}>
                {error}
              </div>
            )}

            <button
              onClick={handle}
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? 'var(--dim)' : 'var(--red)',
                border: 'none',
                color: 'var(--white)',
                fontFamily: 'Bebas Neue, sans-serif',
                fontSize: 18,
                letterSpacing: 4,
                padding: '14px 0',
                cursor: loading ? 'not-allowed' : 'pointer',
                clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                transition: 'background 0.2s',
              }}
            >
              {loading ? '...' : mode === 'login' ? '进入 ARCANA' : '创建角色'}
            </button>
          </>
        )}
      </motion.div>
    </div>
  )
}

function Field({
  label, value, onChange, placeholder, type = 'text'
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  type?: string
}) {
  return (
    <div>
      <div style={{ fontSize: 11, letterSpacing: 3, color: 'var(--muted)', marginBottom: 6, fontFamily: 'Bebas Neue, sans-serif' }}>
        {label}
      </div>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          background: 'var(--card2)',
          border: '1px solid var(--dim)',
          color: 'var(--white)',
          fontSize: 14,
          padding: '10px 12px',
          outline: 'none',
          boxSizing: 'border-box',
          fontFamily: 'inherit',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--red)'}
        onBlur={e => e.target.style.borderColor = 'var(--dim)'}
      />
    </div>
  )
}
