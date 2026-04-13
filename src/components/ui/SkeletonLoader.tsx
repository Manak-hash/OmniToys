import { type HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse bg-white/10 rounded', className)}
      {...props}
    />
  )
}

export interface SkeletonLoaderProps {
  count?: number
  className?: string
}

export function SkeletonLoader({ count = 1, className }: SkeletonLoaderProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  )
}

export interface CardSkeletonProps {
  showIcon?: boolean
  className?: string
}

export function CardSkeleton({ showIcon = true, className }: CardSkeletonProps) {
  return (
    <div className={cn('glass-card rounded-xl p-6 space-y-4', className)}>
      {showIcon && (
        <div className="flex items-center space-x-3">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      )}
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  )
}
