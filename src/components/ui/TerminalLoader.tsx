import { useState, useEffect } from 'react'
import { cn } from '@/utils/cn'

const MESSAGES = [
  '> Initializing system...',
  '> Loading modules...',
  '> Accessing secure sector...',
  '> Decrypting data stream...',
  '> Establishing connection...',
]

export interface TerminalLoaderProps {
  className?: string
}

export function TerminalLoader({ className }: TerminalLoaderProps) {
  const [currentMessage, setCurrentMessage] = useState(0)
  const [typedText, setTypedText] = useState('')
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % MESSAGES.length)
      setTypedText('')
    }, 3000)

    return () => clearInterval(messageInterval)
  }, [])

  useEffect(() => {
    const message = MESSAGES[currentMessage]
    let index = 0

    const typingInterval = setInterval(() => {
      if (index <= message.length) {
        setTypedText(message.slice(0, index))
        index++
      }
    }, 30)

    return () => clearInterval(typingInterval)
  }, [currentMessage])

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)

    return () => clearInterval(cursorInterval)
  }, [])

  return (
    <div className={cn('font-mono text-sm', className)}>
      <div className="space-y-1">
        {MESSAGES.slice(0, currentMessage).map((msg, i) => (
          <div key={i} className="text-white/40">
            {msg}
          </div>
        ))}
        <div className="text-omni-primary">
          {typedText}
          <span
            className={cn(
              'inline-block w-2 h-4 bg-omni-primary ml-1 align-middle',
              !showCursor && 'opacity-0'
            )}
          />
        </div>
      </div>
    </div>
  )
}
