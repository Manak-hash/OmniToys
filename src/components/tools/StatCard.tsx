import { motion } from 'framer-motion'
import { TrendingUp, Clock, Star, Zap } from 'lucide-react'
import { cn } from '@/utils/cn'
import { usePreferences } from '@/store/preferences'

interface StatCardProps {
  icon: 'flask' | 'clock' | 'star' | 'bolt'
  value: string | number
  label: string
  subtext: string
  delay: number
  iconColor?: string
}

export function StatCard({ icon, value, label, subtext, delay, iconColor = 'text-omni-text' }: StatCardProps) {
  const { lowDataMode } = usePreferences()

  const renderIcon = () => {
    const iconClass = cn('text-2xl', iconColor)

    switch (icon) {
      case 'flask':
        return <span className={iconClass}>🧪</span>
      case 'clock':
        return <Clock className={cn(iconClass, 'w-5 h-5')} />
      case 'star':
        return <Star className={cn(iconClass, 'w-5 h-5')} />
      case 'bolt':
        return <Zap className={cn(iconClass, 'w-5 h-5')} />
      default:
        return null
    }
  }

  return (
    <motion.div
      initial={lowDataMode ? { opacity: 1 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        lowDataMode
          ? { duration: 0 }
          : {
              duration: 0.4,
              delay: Math.min(delay, 0.3),
              ease: [0.25, 0.1, 0.25, 1]
            }
      }
      className="relative group"
    >
      <div className="bg-gradient-to-br from-white/[0.06] to-white/[0.01] border border-white/[0.08] rounded-lg p-4 transition-all duration-300 hover:border-omni-primary/20">
        {/* Icon */}
        <div className="mb-2 flex items-center justify-between">
          {renderIcon()}
        </div>

        {/* Value */}
        <div className="font-mono text-xl font-bold text-omni-text mb-1 tracking-tight">
          {value}
        </div>

        {/* Label */}
        <div className="text-[10px] text-omni-text/40 uppercase tracking-wider font-mono mb-2">
          {label}
        </div>

        {/* Subtext */}
        <div className="text-[10px] text-omni-text/30 flex items-center gap-1 font-mono">
          {subtext.startsWith('+') && (
            <TrendingUp className="w-3 h-3 text-green-400" />
          )}
          {subtext}
        </div>
      </div>
    </motion.div>
  )
}
