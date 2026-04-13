import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: ReactNode
  className?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-omni-text mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/50">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              // Base styles
              'w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg',
              'text-omni-text placeholder-white/30',
              // Focus states
              'focus:outline-none focus:ring-2 focus:ring-omni-primary focus:border-transparent',
              // Error states
              error && 'border-red-500 focus:ring-red-500',
              // Icon padding
              icon && 'pl-10',
              // Transitions
              'transition-all duration-200',
              // Custom className
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
