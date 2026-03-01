import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'gold' | 'red'
  skew?: 'tr' | 'tl' | 'br' | 'none'
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  skew = 'tr',
}) => {
  const skewClass = skew !== 'none' ? `card-skew-${skew}` : ''

  const variantClass = {
    default: 'bg-arcana-card border border-arcana-dim',
    gold:    'bg-arcana-card border border-arcana-gold',
    red:     'bg-arcana-card border border-arcana-red',
  }[variant]

  return (
    <div className={`${variantClass} ${skewClass} p-4 ${className}`}>
      {children}
    </div>
  )
}

export default Card
