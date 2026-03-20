import { useState, useEffect } from 'react'
import { useNotificationStore, type Notification } from '@/stores/useNotificationStore'

interface NotificationPanelProps {
  onClose: () => void
}

const TYPE_ICONS: Record<string, string> = {
  slack_warning: '⚠️',
  streak_milestone: '🔥',
  weekly_report: '📊',
  achievement_unlock: '🏆',
  ai_insight: '💡',
}

const TYPE_COLORS: Record<string, string> = {
  slack_warning: '#FF6B6B',
  streak_milestone: '#E8C840',
  weekly_report: '#4FC3F7',
  achievement_unlock: '#E8C840',
  ai_insight: '#A5D6A7',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins}分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}小时前`
  return `${Math.floor(hours / 24)}天前`
}

export default function NotificationPanel({ onClose }: NotificationPanelProps) {
  const { notifications, unreadCount, fetchNotifications, fetchUnreadCount, markRead, markAllRead } = useNotificationStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications().then(() => fetchUnreadCount()).finally(() => setLoading(false))
  }, [fetchNotifications, fetchUnreadCount])

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)',
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
        justifyContent: 'flex-start',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%', maxWidth: 390, height: '85vh',
          background: 'var(--black)',
          borderLeft: '1px solid var(--dim)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '16px 16px 12px',
          borderBottom: '1px solid var(--dim)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'Bebas Neue,sans-serif', fontSize: 18, letterSpacing: 4, color: 'var(--white)', transform: 'skewX(-4deg)', display: 'inline-block' }}>
              NOTIFICATION<span style={{ color: 'var(--red)' }}>S</span>
            </span>
            {unreadCount > 0 && (
              <span style={{
                fontFamily: 'Share Tech Mono,monospace', fontSize: 9,
                padding: '2px 8px', background: 'var(--red)',
                clipPath: 'polygon(4px 0,100% 0,calc(100% - 4px) 100%,0 100%)',
                color: 'var(--white)', letterSpacing: 1,
              }}>
                {unreadCount} 未读
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  background: 'none', border: '1px solid var(--dim)',
                  color: 'var(--muted)', fontFamily: 'Share Tech Mono,monospace',
                  fontSize: 9, letterSpacing: 1, padding: '4px 10px',
                  cursor: 'pointer', clipPath: 'polygon(4px 0,100% 0,calc(100% - 4px) 100%,0 100%)',
                }}
              >
                全部已读
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: 'none', border: 'none', color: 'var(--muted)',
                fontSize: 20, cursor: 'pointer', lineHeight: 1, padding: 4,
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Red divider */}
        <div style={{ height: 2, background: 'var(--red)', transform: 'skewX(-12deg)', flexShrink: 0 }} />

        {/* Notification list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                <circle cx="12" cy="12" r="10" stroke="var(--muted)" strokeWidth="2" strokeDasharray="30 15" />
              </svg>
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.3 }}>📭</div>
              <div style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 11, color: 'var(--muted)', letterSpacing: 2 }}>
                暂无通知
              </div>
              <div style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: 1, marginTop: 8 }}>
                保持打卡，莫尔加纳会在这里等你
              </div>
            </div>
          ) : (
            notifications.map(notif => (
              <NotifItem key={notif.id} notif={notif} onRead={() => markRead(notif.id)} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function NotifItem({ notif, onRead }: { notif: Notification; onRead: () => void }) {
  const color = TYPE_COLORS[notif.type] || 'var(--white)'
  const icon = TYPE_ICONS[notif.type] || '📌'

  return (
    <div
      onClick={onRead}
      style={{
        padding: '14px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        background: notif.read ? 'transparent' : 'rgba(195,0,47,0.04)',
        cursor: 'pointer',
        transition: 'background 0.2s',
        position: 'relative',
      }}
      onMouseEnter={e => { if (!notif.read) (e.currentTarget as HTMLDivElement).style.background = 'rgba(195,0,47,0.08)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = notif.read ? 'transparent' : 'rgba(195,0,47,0.04)' }}
    >
      {!notif.read && (
        <div style={{
          position: 'absolute', top: 16, right: 16,
          width: 7, height: 7, background: 'var(--red)',
          borderRadius: '50%', flexShrink: 0,
        }} />
      )}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{
          width: 36, height: 36, background: `${color}15`,
          border: `1px solid ${color}33`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, flexShrink: 0,
          clipPath: 'polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,0 100%)',
        }}>
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 3 }}>{notif.title}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 4 }}>{notif.body}</div>
          <div style={{ fontFamily: 'Share Tech Mono,monospace', fontSize: 8, color: 'var(--muted)', letterSpacing: 1 }}>
            {timeAgo(notif.created_at)}
          </div>
        </div>
      </div>
    </div>
  )
}
