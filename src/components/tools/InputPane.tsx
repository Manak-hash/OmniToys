import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface InputPaneProps {
  title?: string
  rightElement?: ReactNode
  children: ReactNode
  className?: string
}

export function InputPane({ title = "Input", rightElement, children, className }: InputPaneProps) {
  return (
    <div className={cn("flex flex-col gap-3 h-full", className)}>
      <div className="flex justify-between items-center min-h-[24px]">
        <label className="text-sm font-bold text-omni-text/70 uppercase tracking-wider text-xs">
          {title}
        </label>
        {rightElement}
      </div>
      <div className="flex-1 relative bg-omni-bg/40 rounded-xl overflow-hidden border border-omni-text/5 focus-within:border-omni-primary/30 transition-colors">
        {children}
      </div>
    </div>
  )
}
