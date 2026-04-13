import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass'
  hover?: boolean
  className?: string
}

const variantStyles = {
  default: 'bg-white/5 border border-white/10',
  glass: 'bg-white/5 backdrop-blur-lg border border-white/10',
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'glass', hover = false, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'rounded-xl p-6 transition-all duration-200',
          // Variant styles
          variantStyles[variant],
          // Hover state
          hover && 'hover:shadow-[0_0_20px_rgba(223,28,38,0.3)] hover:scale-[1.02] hover:border-omni-primary/50 cursor-pointer',
          // Custom className
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'
