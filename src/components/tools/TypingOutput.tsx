import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface TypingOutputProps {
  text: string
  speed?: number
  className?: string
}

export function TypingOutput({ text, speed = 10, className = "" }: TypingOutputProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [index, setIndex] = useState(0)

  // Sync state when text changes (replaces useEffect reset)
  const [prevText, setPrevText] = useState(text)
  if (text !== prevText) {
    setPrevText(text)
    setDisplayedText('')
    setIndex(0)
  }

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[index])
        setIndex(prev => prev + 1)
      }, speed)
      return () => clearTimeout(timeout)
    }
  }, [index, text, speed])

  return (
    <div className={`font-mono text-sm leading-relaxed ${className}`}>
      {displayedText}
      {index < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-1.5 h-4 bg-omni-primary ml-1 align-middle"
        />
      )}
    </div>
  )
}
