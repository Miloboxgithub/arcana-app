import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'gold'
  children: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  className = '',
  ...props
}) => {
  const base = 'font-display tracking-widest transition-all active:scale-95 card-skew-tr px-6 py-3 text-sm'
  const variants = {
    primary: 'bg-arcana-red text-arcana-white hover:bg-arcana-red2',
    ghost:   'border border-arcana-dim text-arcana-white hover:border-arcana-red',
    gold:    'border border-arcana-gold text-arcana-gold hover:bg-arcana-gold hover:text-arcana-black',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
