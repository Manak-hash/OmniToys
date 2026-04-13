import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  children?: ReactNode
  className?: string
}

const variantStyles = {
  primary: 'bg-omni-primary text-white hover:shadow-[0_0_15px_rgba(223,28,38,0.5)] hover:bg-omni-primary-hover',
  secondary: 'bg-omni-accent text-white hover:shadow-[0_0_15px_rgba(77,159,255,0.5)] hover:brightness-110',
  ghost: 'bg-transparent text-omni-text hover:bg-white/10 border border-omni-text/20',
  danger: 'bg-red-600 text-white hover:shadow-[0_0_15px_rgba(220,38,38,0.5)] hover:bg-red-700',
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-omni-primary focus:ring-offset-2 focus:ring-offset-omni-bg',
          'active:scale-95',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // Variant styles
          variantStyles[variant],
          // Size styles
          sizeStyles[size],
          // Custom className
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            role="status"
            aria-label="Loading"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {isLoading ? 'Loading...' : children}
      </button>
    )
  }
)

Button.displayName = 'Button'
