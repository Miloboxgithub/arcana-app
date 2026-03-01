import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

export type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: string
  message: string
  type: ToastType
  icon?: string
}

// Global event emitter
const listeners: ((toast: Omit<ToastItem, 'id'>) => void)[] = []

export const toast = {
  success: (message: string, icon = '✦') => emit({ message, type: 'success', icon }),
  error: (message: string, icon = '✕') => emit({ message, type: 'error', icon }),
  info: (message: string, icon = '◆') => emit({ message, type: 'info', icon }),
}

function emit(t: Omit<ToastItem, 'id'>) {
  listeners.forEach(fn => fn(t))
}

export function ToastProvider() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = useCallback((t: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { ...t, id }])
    setTimeout(() => {
      setToasts(prev => prev.filter(x => x.id !== id))
    }, 3000)
  }, [])

  useEffect(() => {
    listeners.push(addToast)
    return () => { const i = listeners.indexOf(addToast); if (i > -1) listeners.splice(i, 1) }
  }, [addToast])

  const colorMap: Record<ToastType, string> = {
    success: 'var(--gold)',
    error: 'var(--red)',
    info: 'rgba(255,255,255,0.5)',
  }
  const bgMap: Record<ToastType, string> = {
    success: 'rgba(232,200,64,0.1)',
    error: 'rgba(195,0,47,0.12)',
    info: 'rgba(255,255,255,0.04)',
  }

  return createPortal(
    <div style={{ position: 'fixed', bottom: 90, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 9999, pointerEvents: 'none' }}>
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              border: `1px solid ${colorMap[t.type]}33`,
              borderLeft: `3px solid ${colorMap[t.type]}`,
              padding: '10px 18px',
              clipPath: 'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px))',
              minWidth: 200, maxWidth: 320,
              backdropFilter: 'blur(12px)',
              background: bgMap[t.type],
              boxShadow: `0 4px 20px rgba(0,0,0,0.4)`,
              pointerEvents: 'auto',
            }}
          >
            <span style={{ color: colorMap[t.type], fontSize: 14, flexShrink: 0 }}>{t.icon}</span>
            <span style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 12, color: 'var(--white)', letterSpacing: 0.5 }}>{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body
  )
}
