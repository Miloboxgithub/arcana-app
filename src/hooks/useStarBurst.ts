import { useEffect, useRef, useCallback } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  size: number
  rot: number
  rotV: number
  color: string
}

const COLORS = ['#E8C840', '#C3002F', '#EFEFEF', '#FF1744', '#FFD700']

function createParticle(x: number, y: number): Particle {
  const angle = Math.random() * Math.PI * 2
  const speed = 2 + Math.random() * 5
  return {
    x, y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - 2,
    life: 1,
    size: 6 + Math.random() * 10,
    rot: Math.random() * Math.PI,
    rotV: (Math.random() - 0.5) * 0.2,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }
}

function drawStar(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.save()
  ctx.globalAlpha = Math.max(0, p.life)
  ctx.translate(p.x, p.y)
  ctx.rotate(p.rot)
  ctx.beginPath()
  const r1 = p.size, r2 = p.size * 0.4
  for (let i = 0; i < 10; i++) {
    const ang = (i * Math.PI / 5) - Math.PI / 2
    const r = i % 2 === 0 ? r1 : r2
    const px = Math.cos(ang) * r
    const py = Math.sin(ang) * r
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fillStyle = p.color
  ctx.shadowBlur = 8
  ctx.shadowColor = p.color
  ctx.fill()
  ctx.restore()
}

export function useStarBurst() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const animRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;'
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    document.body.appendChild(canvas)
    canvasRef.current = canvas

    const onResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      canvas.remove()
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [])

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    particlesRef.current = particlesRef.current.filter(p => p.life > 0)
    for (const p of particlesRef.current) {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.18
      p.vx *= 0.97
      p.life -= 0.022
      p.rot += p.rotV
      drawStar(ctx, p)
    }
    if (particlesRef.current.length > 0) {
      animRef.current = requestAnimationFrame(animate)
    } else {
      animRef.current = null
    }
  }, [])

  const burst = useCallback((x: number, y: number, count = 20) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push(createParticle(x, y))
    }
    if (!animRef.current) {
      animRef.current = requestAnimationFrame(animate)
    }
  }, [animate])

  return { burst }
}
