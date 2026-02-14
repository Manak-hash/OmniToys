import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Share2, Star } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { usePreferences } from '@/store/preferences'
import { toast } from 'sonner'
import { useEffect } from 'react'

interface ToolLayoutProps {
  title: string
  description: string
  icon?: ReactNode
  children: ReactNode
  actions?: ReactNode
}

export function ToolLayout({ title, description, icon, children, actions }: ToolLayoutProps) {
  const location = useLocation()
  const toolId = location.pathname.split('/').pop() || ''
  const { favorites, addFavorite, removeFavorite, addRecentTool } = usePreferences()
  const isFavorite = favorites.includes(toolId)

  // Track recent tools
  useEffect(() => {
    if (toolId) {
      addRecentTool(toolId)
    }
  }, [toolId, addRecentTool])

  const handleShare = async () => {
    const shareData = {
      title: `OmniToys - ${title}`,
      text: description,
      url: window.location.href,
    }

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData)
        toast.success('Shared successfully!')
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Link copied to clipboard!')
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        toast.error('Failed to share')
      }
    }
  }

  const handleFavorite = () => {
    if (isFavorite) {
      removeFavorite(toolId)
      toast.success('Removed from favorites')
    } else {
      addFavorite(toolId)
      toast.success('Added to favorites!')
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="space-y-8"
    >
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-omni-text/5 pb-8 relative group">
        <div className="space-y-4">
          <Link 
            to="/tools" 
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-omni-text/30 hover:text-omni-primary transition-all hover:-translate-x-1"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Catalog
          </Link>
          <div className="flex items-center gap-4">
             <div className="p-3 bg-omni-primary/10 rounded-2xl text-omni-primary neon-glow group-hover:scale-110 transition-transform duration-500">
               {icon}
             </div>
             <div>
               <h1 className="text-3xl sm:text-4xl font-black text-omni-text font-mono tracking-tighter leading-none">{title}</h1>
               <p className="text-omni-text/40 max-w-2xl text-sm sm:text-base mt-2 font-medium leading-relaxed">{description}</p>
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
           {actions}
           <div className="h-8 w-px bg-omni-text/5 mx-2 hidden sm:block" />
           <button 
             onClick={handleFavorite}
             className={`p-3 rounded-2xl border transition-all duration-300 ${
               isFavorite 
                 ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20 shadow-[0_0_15px_rgba(250,204,21,0.2)]' 
                 : 'text-omni-text/30 border-omni-text/5 hover:text-yellow-400 hover:bg-omni-text/5'
             }`}
             title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
           >
             <Star className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
           </button>
           <button 
             onClick={handleShare}
             className="p-3 rounded-2xl border border-omni-text/5 text-omni-text/30 hover:text-omni-primary hover:bg-omni-primary/5 hover:border-omni-primary/20 transition-all duration-300"
             title="Share this tool"
           >
             <Share2 className="w-5 h-5" />
           </button>
        </div>
      </header>

      <div className="min-h-[600px] glass-card rounded-[32px] p-4 sm:p-10 relative overflow-hidden group/content">
        <div className="absolute inset-0 bg-gradient-to-br from-omni-primary/5 via-transparent to-transparent pointer-events-none opacity-0 group-hover/content:opacity-100 transition-opacity duration-1000" />
        <div className="relative z-10 w-full h-full">
          {children}
        </div>
      </div>
    </motion.div>
  )
}
