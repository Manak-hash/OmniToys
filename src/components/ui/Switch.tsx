import { cn } from '@/utils/cn'

export interface SwitchProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  label?: string
  disabled?: boolean
  className?: string
}

export function Switch({
  checked = false,
  onChange,
  label,
  disabled = false,
  className,
}: SwitchProps) {
  const switchId = label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex items-center gap-3">
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={switchId ? `${switchId}-label` : undefined}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={cn(
          // Base track styles
          'relative inline-flex h-6 w-11 items-center rounded-full',
          'transition-colors duration-200',
          // Background colors
          checked ? 'bg-omni-primary' : 'bg-white/20',
          // Focus states
          'focus:outline-none focus:ring-2 focus:ring-omni-primary focus:ring-offset-2 focus:ring-offset-transparent',
          // Disabled states
          disabled && 'opacity-50 cursor-not-allowed',
          // Hover states
          !disabled && 'hover:opacity-90',
          className
        )}
      >
        <span
          className={cn(
            // Thumb base styles
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200',
            // Position
            checked ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
      {label && (
        <label
          id={`${switchId}-label`}
          htmlFor={switchId}
          className={cn(
            'text-sm font-medium text-omni-text',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {label}
        </label>
      )}
    </div>
  )
}
