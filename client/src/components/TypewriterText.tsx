import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface Props {
  text: string
  className?: string
  speed?: number // ms per character
  delay?: number // ms before starting
}

export default function TypewriterText({ text, className, speed = 20, delay = 300 }: Props) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed('')
    setDone(false)

    const startTimer = setTimeout(() => {
      let i = 0
      const interval = setInterval(() => {
        i++
        setDisplayed(text.slice(0, i))
        if (i >= text.length) {
          clearInterval(interval)
          setDone(true)
        }
      }, speed)
      return () => clearInterval(interval)
    }, delay)

    return () => clearTimeout(startTimer)
  }, [text, speed, delay])

  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={className}
    >
      {displayed}
      {!done && (
        <span className="cursor-blink ml-0.5 inline-block w-0.5 h-3.5 bg-[var(--color-amber)] align-middle" />
      )}
    </motion.p>
  )
}
