import { type HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  showLabel?: boolean
  className?: string
}

export function ProgressBar({
  value = 0,
  max = 100,
  showLabel = false,
  className,
  ...props
}: ProgressBarProps) {
  // Clamp value between 0 and max
  const clampedValue = Math.max(0, Math.min(value, max))
  const percentage = Math.round((clampedValue / max) * 100)

  return (
    <div className={cn('w-full space-y-2', className)} {...props}>
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-omni-primary to-omni-accent transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between text-xs font-mono text-white/60">
          <span>{percentage}%</span>
          <span className="text-omni-primary">
            {percentage < 33 && 'INITIALIZING'}
            {percentage >= 33 && percentage < 66 && 'PROCESSING'}
            {percentage >= 66 && percentage < 100 && 'FINALIZING'}
            {percentage === 100 && 'COMPLETE'}
          </span>
        </div>
      )}
    </div>
  )
}
