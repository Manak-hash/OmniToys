import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: Array<{ value: string; label: string }>
  className?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-omni-text mb-1"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            // Base styles
            'w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg',
            'text-omni-text',
            // Focus states
            'focus:outline-none focus:ring-2 focus:ring-omni-primary focus:border-transparent',
            // Error states
            error && 'border-red-500 focus:ring-red-500',
            // Transitions
            'transition-all duration-200',
            // Custom className
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
