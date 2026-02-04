import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface OutputPaneProps {
  title?: string
  rightElement?: ReactNode
  children: ReactNode
  className?: string
  actionToolbar?: ReactNode
}

export function OutputPane({ 
  title = "Output", 
  rightElement, 
  children, 
  className,
  actionToolbar
}: OutputPaneProps) {
  return (
    <div className={cn("flex flex-col gap-3 h-full", className)}>
      <div className="flex justify-between items-center min-h-[24px]">
        <label className="text-sm font-bold text-omni-text/70 uppercase tracking-wider text-xs">
          {title}
        </label>
        <div className="flex items-center gap-2">
          {rightElement}
        </div>
      </div>
      <div className="flex-1 relative bg-omni-bg/60 rounded-xl overflow-hidden border border-omni-text/5">
        {children}
        {actionToolbar && (
          <div className="absolute top-4 right-4 z-20">
            {actionToolbar}
          </div>
        )}
      </div>
    </div>
  )
}
