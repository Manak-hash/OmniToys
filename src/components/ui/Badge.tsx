import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md'
  className?: string
}

const variantStyles = {
  default: 'bg-white/10 text-omni-text',
  primary: 'bg-omni-primary/20 text-omni-primary border border-omni-primary/30',
  success: 'bg-green-500/20 text-green-400 border border-green-500/30',
  warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  danger: 'bg-red-500/20 text-red-400 border border-red-500/30',
}

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ variant = 'default', size = 'md', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center rounded-full font-medium',
          // Variant styles
          variantStyles[variant],
          // Size styles
          sizeStyles[size],
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

Badge.displayName = 'Badge'
