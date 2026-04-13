import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  className?: string
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, checked, onChange, disabled, className, id, ...props }, ref) => {
    const radioId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            ref={ref}
            id={radioId}
            type="radio"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="sr-only"
            {...props}
          />
          <div
            onClick={() => !disabled && onChange?.({ target: { checked: true } } as any)}
            className={cn(
              // Custom visual base styles
              'w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer',
              'transition-all duration-200',
              // Colors
              checked ? 'border-omni-primary' : 'border-white/20 bg-white/5 hover:border-white/30',
              // Focus states (when input is focused)
              'focus-within:ring-2 focus-within:ring-omni-primary focus-within:ring-offset-2 focus-within:ring-offset-transparent',
              // Disabled states
              disabled && 'opacity-50 cursor-not-allowed',
              className
            )}
          >
            {checked && (
              <div className="w-2.5 h-2.5 rounded-full bg-omni-primary" />
            )}
          </div>
        </div>
        {label && (
          <label
            htmlFor={radioId}
            className={cn(
              'text-sm font-medium text-omni-text cursor-pointer',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {label}
          </label>
        )}
      </div>
    )
  }
)

Radio.displayName = 'Radio'
