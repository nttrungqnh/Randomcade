import { useEffect, useRef, useState } from 'react'
import { Sparkles } from 'lucide-react'

const demoNames = ['Alex', 'Mia', 'Noah', 'Emma', 'Leo'] as const

export function HeroRandomDemo() {
  const [displayName, setDisplayName] = useState<string>('Mia')
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<number | null>(null)
  const timeoutRef = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    },
    [],
  )

  const runDemo = () => {
    if (isRunning) return

    setIsRunning(true)
    let index = 0
    intervalRef.current = window.setInterval(() => {
      index = (index + 1) % demoNames.length
      setDisplayName(demoNames[index])
    }, 75)

    timeoutRef.current = window.setTimeout(() => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
      const winner = demoNames[Math.floor(Math.random() * demoNames.length)]
      setDisplayName(winner)
      setIsRunning(false)
    }, 950)
  }

  return (
    <div className="random-demo" aria-live="polite">
      <div className="random-demo__topline">
        <span>Random something</span>
        <span className="random-demo__status">Live demo</span>
      </div>
      <div className="random-demo__result" data-running={isRunning}>
        <span>{displayName}</span>
      </div>
      <div className="random-demo__names" aria-label="Demo participants">
        {demoNames.map((name) => (
          <span key={name} data-active={displayName === name}>
            {name}
          </span>
        ))}
      </div>
      <button className="random-demo__button" type="button" onClick={runDemo} disabled={isRunning}>
        <Sparkles size={15} aria-hidden="true" />
        {isRunning ? 'Shuffling…' : 'Try random'}
      </button>
    </div>
  )
}
