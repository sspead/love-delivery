import { useEffect, useState } from 'react'

interface HeartAnimationProps {
  active?: boolean
  count?: number
}

interface Heart {
  id: number
  x: number
  delay: number
  size: number
  duration: number
}

export function HeartAnimation({ active = true, count = 12 }: HeartAnimationProps) {
  const [hearts, setHearts] = useState<Heart[]>([])

  useEffect(() => {
    if (!active) return
    const newHearts = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      size: 12 + Math.random() * 24,
      duration: 2 + Math.random() * 3,
    }))
    setHearts(newHearts)
  }, [active, count])

  return (
    <div className="pointer-events-none fixed inset-0 z-[200] overflow-hidden">
      {hearts.map((h) => (
        <div
          key={h.id}
          className="absolute bottom-0 text-primary animate-heartbeat"
          style={{
            left: `${h.x}%`,
            fontSize: `${h.size}px`,
            animation: `float ${h.duration}s ease-in-out ${h.delay}s infinite`,
            opacity: 0.6,
          }}
        >
          ❤️
        </div>
      ))}
    </div>
  )
}
