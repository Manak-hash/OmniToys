import { forwardRef, type InputHTMLAttributes } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  className?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, checked, onChange, disabled, className, id, ...props }, ref) => {
    const checkboxId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="sr-only"
            {...props}
          />
          <div
            onClick={() => !disabled && onChange?.({ target: { checked: !checked } } as any)}
            className={cn(
              // Custom visual base styles
              'w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer',
              'transition-all duration-200',
              // Colors
              checked
                ? 'bg-omni-primary border-omni-primary'
                : 'border-white/20 bg-white/5 hover:border-white/30',
              // Focus states (when input is focused)
              'focus-within:ring-2 focus-within:ring-omni-primary focus-within:ring-offset-2 focus-within:ring-offset-transparent',
              // Disabled states
              disabled && 'opacity-50 cursor-not-allowed',
              className
            )}
          >
            {checked && (
              <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
            )}
          </div>
        </div>
        {label && (
          <label
            htmlFor={checkboxId}
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

Checkbox.displayName = 'Checkbox'
