import { motion } from 'framer-motion'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: string | number
  style?: React.CSSProperties
}

export function Skeleton({ width = '100%', height = 20, borderRadius = 4, style = {} }: SkeletonProps) {
  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, var(--card) 25%, var(--card2) 50%, var(--card) 75%)',
        backgroundSize: '200% 100%',
        ...style,
      }}
    />
  )
}

export function CardSkeleton() {
  return (
    <div style={{
      background: 'var(--card)',
      padding: '16px',
      marginBottom: '12px',
      clipPath: 'polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Skeleton width={40} height={40} borderRadius={4} />
        <div style={{ flex: 1 }}>
          <Skeleton width="60%" height={14} style={{ marginBottom: 8 }} />
          <Skeleton width="40%" height={10} />
        </div>
      </div>
    </div>
  )
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

export function StatSkeleton() {
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(3, 1fr)', 
      gap: '1px', 
      background: 'var(--dim)',
      marginBottom: 14,
    }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ background: 'var(--black)', padding: '12px 8px', textAlign: 'center' }}>
          <Skeleton width={50} height={26} style={{ margin: '0 auto 4px' }} />
          <Skeleton width={40} height={8} style={{ margin: '0 auto' }} />
        </div>
      ))}
    </div>
  )
}
