import { useEffect, useState } from 'react'

interface ConfettiProps {
  active: boolean
  duration?: number
}

interface Particle {
  id: number
  x: number
  color: string
  delay: number
  size: number
  shape: 'circle' | 'square' | 'heart'
}

const COLORS = ['#FF6B8A', '#FFD700', '#FFB6C1', '#7BC67E', '#FF4466', '#FFA07A', '#87CEEB']

export function Confetti({ active, duration = 3000 }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!active) return
    const newParticles = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.8,
      size: 6 + Math.random() * 10,
      shape: (['circle', 'square', 'heart'] as const)[Math.floor(Math.random() * 3)],
    }))
    setParticles(newParticles)
    setShow(true)
    const timer = setTimeout(() => setShow(false), duration)
    return () => clearTimeout(timer)
  }, [active, duration])

  if (!show) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[200] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute top-0"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.shape !== 'heart' ? p.color : 'transparent',
            borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'square' ? '2px' : undefined,
            animation: `confetti-fall ${2.5 + Math.random() * 2}s linear ${p.delay}s forwards`,
          }}
        >
          {p.shape === 'heart' && <span style={{ fontSize: p.size, lineHeight: 1 }}>❤️</span>}
        </div>
      ))}
    </div>
  )
}
