import { useState, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

export interface TooltipProps {
  content: string
  children: ReactNode
  position?: TooltipPosition
  className?: string
}

const positionClasses: Record<TooltipPosition, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
}

export function Tooltip({ content, children, position = 'top', className }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  const handleMouseEnter = () => {
    setIsVisible(true)
  }

  const handleMouseLeave = () => {
    setIsVisible(false)
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {/* Tooltip */}
      {isVisible && (
        <div
          className={cn(
            'absolute z-50 px-2 py-1 text-xs text-white bg-gray-900 rounded whitespace-nowrap',
            'pointer-events-none',
            'shadow-lg',
            positionClasses[position],
            className
          )}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  )
}
