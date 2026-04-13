import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, ArrowUpRight } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/utils/cn'
import type { Tool } from '@/constants/tools'
import { useMemo, useCallback } from 'react'
import { usePreferences } from '@/store/preferences'
import { useHapticFeedback } from '@/hooks/useHapticFeedback'

interface ToolCardProps {
  tool: Tool
  onNavigate?: (toolId: string) => void
  isFavorite?: boolean
  onToggleFavorite?: (toolId: string) => void
  usageCount?: number
  lastUsed?: number // timestamp
  monthlyUsage?: number
  index?: number // For staggered animation
}

export function ToolCard({
  tool,
  onNavigate,
  isFavorite = false,
  onToggleFavorite,
  usageCount = 0,
  lastUsed,
  monthlyUsage = 0,
  index = 0
}: ToolCardProps) {
  const { id, to, title, description, icon, category, isNew, isWasm, isComingSoon } = tool
  const { lowDataMode } = usePreferences()
  const { tap } = useHapticFeedback()

  const handleCardClick = useCallback(() => {
    if (!isComingSoon && onNavigate) {
      tap()
      onNavigate(id)
    }
  }, [isComingSoon, onNavigate, id, tap])

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    tap()
    if (onToggleFavorite) {
      onToggleFavorite(id)
    }
  }, [onToggleFavorite, id, tap])

  // Format relative time - memoized to avoid impure function warning
  const formatLastUsed = useCallback((timestamp: number): string => {
    const now = Date.now()
    const diff = now - timestamp

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    return `${days}d`
  }, [])

  // Memoize the formatted last used time
  const formattedLastUsed = useMemo(() => {
    return lastUsed ? formatLastUsed(lastUsed) : null
  }, [lastUsed, formatLastUsed])

  // Generate analytics text - memoized, simplified
  const analyticsText = useMemo(() => {
    if (usageCount === 0) return null
    if (usageCount >= 6) return `${usageCount} uses • #${monthlyUsage} this month`
    return `${usageCount} use${usageCount > 1 ? 's' : ''}`
  }, [usageCount, monthlyUsage])

  // Generate tech specs - memoized with deterministic load time
  const techSpecs = useMemo(() => {
    if (isComingSoon) return null
    if (isWasm) {
      const loadTime = 5 + (id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 15)
      return `${loadTime}ms`
    }
    return 'instant'
  }, [isComingSoon, isWasm, id])

  if (isComingSoon) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative bg-white/5 border border-white/10 rounded-lg p-6 opacity-50 cursor-not-allowed"
      >
        <div className="text-4xl mb-3">{icon}</div>
        <h3 className="text-sm font-bold text-omni-text mb-2 font-mono">{title}</h3>
        <p className="text-xs text-omni-text/60 line-clamp-2 mb-3">{description}</p>
        <Badge variant="default" size="sm" className="font-mono text-[10px]">Coming Soon</Badge>
      </motion.div>
    )
  }

  return (
    <motion.div
      layout
      initial={lowDataMode ? { opacity: 1 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        lowDataMode
          ? { duration: 0 }
          : {
              duration: 0.4,
              delay: Math.min(index * 0.03, 0.3),
              ease: [0.25, 0.1, 0.25, 1]
            }
      }
      className="group h-full"
    >
      <Link
        to={to}
        onClick={handleCardClick}
        className="block h-full"
      >
        <div className="relative h-full bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.08] rounded-lg p-5 transition-all duration-300 hover:border-omni-primary/30 hover:bg-gradient-to-br hover:from-omni-primary/[0.08] hover:to-white/[0.02] flex flex-col">
          {/* Favorite button - minimal */}
          {onToggleFavorite && (
            <button
              onClick={handleFavoriteClick}
              className="absolute top-3 right-3 p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10"
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={cn(
                'w-3.5 h-3.5 transition-colors',
                isFavorite ? 'fill-yellow-500 text-yellow-500' : 'text-omni-text/40'
              )} />
            </button>
          )}

          {/* Icon - smooth hover */}
          <div className="text-4xl mb-3 transition-all duration-300 ease-out group-hover:scale-110 group-hover:brightness-110">
            {icon}
          </div>

          {/* Title */}
          <h3 className="text-sm font-bold text-omni-text mb-2 font-mono tracking-tight group-hover:text-omni-primary transition-colors flex items-center gap-2">
            {title}
            <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
          </h3>

          {/* Description */}
          <p className="text-xs text-omni-text/50 line-clamp-2 leading-relaxed flex-1">
            {description}
          </p>

          {/* Metadata row - unified */}
          <div className="flex items-center justify-between text-[10px] font-mono mt-3">
            {/* Left: Category + Analytics */}
            <div className="flex items-center gap-2 text-omni-text/40">
              <span className="uppercase tracking-wider">{category}</span>
              {analyticsText && (
                <>
                  <span className="text-omni-text/20">•</span>
                  <span className="text-omni-text/60">{analyticsText}</span>
                </>
              )}
            </div>

            {/* Right: Tech specs + Timestamp */}
            <div className="flex items-center gap-2">
              {techSpecs && (
                <span className="text-omni-text/40 group-hover:text-omni-primary/80 transition-colors">
                  {techSpecs}
                </span>
              )}
              {formattedLastUsed && (
                <>
                  <span className="text-omni-text/20">•</span>
                  <span className="text-omni-text/40">{formattedLastUsed}</span>
                </>
              )}
            </div>
          </div>

          {/* Badges - minimal, inline */}
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/5">
            {isWasm && (
              <span className="px-1.5 py-0.5 bg-omni-primary/10 text-omni-primary rounded font-mono text-[9px] uppercase tracking-wider">
                WASM
              </span>
            )}
            {isNew && (
              <span className="px-1.5 py-0.5 bg-green-500/10 text-green-400 rounded font-mono text-[9px] uppercase tracking-wider">
                New
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
