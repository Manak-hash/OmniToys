import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, X, PlusCircle, Star, Keyboard
} from 'lucide-react'
import { usePreferences } from '@/store/preferences'
import { motion, AnimatePresence } from 'framer-motion'
import { matchSorter } from 'match-sorter'
import { ALL_TOOLS } from '@/constants/tools'
import type { Tool } from '@/constants/tools'

const CATEGORIES = [
  { title: 'All Lab', emoji: '🧪', key: 'All' },
  { title: 'Web Design', emoji: '🎨', key: 'Design' },
  { title: 'Web Dev', emoji: '💻', key: 'Dev' },
  { title: 'File Tools', emoji: '⚡', key: 'File' },
  { title: 'Logic/Math', emoji: '🧮', key: 'Math' },
  { title: 'Security', emoji: '🛡️', key: 'Security' },
  { title: 'Mobile Dev', emoji: '📱', key: 'Mobile' },
]

function ToolCard({ to, title, description, icon, isNew, isWasm, isFavorite, isComingSoon }: Tool) {
  return (
    <motion.div
      layout
      whileHover={isComingSoon ? {} : { scale: 1.02, y: -5 }}
      whileTap={isComingSoon ? {} : { scale: 0.98 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={isComingSoon ? 'opacity-50 grayscale pointer-events-none' : ''}
    >
      <Link 
        to={isComingSoon ? '#' : to} 
        className={`p-5 rounded-2xl glass-card transition-all group relative overflow-hidden flex flex-col h-full ${!isComingSoon ? 'hover:border-omni-primary/50 hover:neon-glow' : 'cursor-not-allowed border-dashed'}`}
      >
        {!isComingSoon && <div className="absolute inset-0 bg-gradient-to-br from-omni-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />}
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl bg-omni-text/5 flex items-center justify-center transition-all duration-500 ${!isComingSoon ? 'group-hover:bg-omni-primary/20 group-hover:neon-glow' : ''}`}>
              <div className={`text-omni-text transition-all duration-500 ${!isComingSoon ? 'group-hover:text-omni-primary group-hover:scale-110' : ''}`}>
                {icon}
              </div>
            </div>
            <div className="flex gap-1.5 items-center">
              {isFavorite && <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />}
              {isWasm && <span className="text-[9px] px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full font-bold">WASM</span>}
              {isNew && <span className="text-[9px] px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full font-bold">UPGRADED</span>}
              {isComingSoon && <span className="text-[9px] px-2 py-0.5 bg-omni-text/10 text-omni-text/40 rounded-full font-black uppercase tracking-tighter">SOON</span>}
            </div>
          </div>
          <h3 className="text-lg font-bold text-omni-text mb-2 group-hover:text-omni-primary transition-colors font-mono tracking-tight">{title}</h3>
          <p className="text-sm text-omni-text/40 line-clamp-2 leading-relaxed">{description}</p>
        </div>
      </Link>
    </motion.div>
  )
}

export default function ToolsCatalog() {
  const { favorites } = usePreferences()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  
  const filteredTools = useMemo(() => {
    let result = ALL_TOOLS
    if (activeCategory !== 'All') {
      result = result.filter(tool => tool.category === activeCategory)
    }
    if (search.trim()) {
      result = matchSorter(result, search, { keys: ['title', 'description', 'category'] })
    }
    return result
  }, [search, activeCategory])

  const favoriteTools = useMemo(() => 
    ALL_TOOLS.filter(tool => favorites.includes(tool.id) && !tool.isComingSoon),
  [favorites])

  return (
    <div className="space-y-12 pb-40 relative">
      {/* Search & Filter Header (Sticky on Mobile) */}
      <div className="sticky top-16 lg:top-4 z-30 space-y-4 py-4 px-1 -mx-1 backdrop-blur-md bg-omni-bg/60 border-b border-omni-text/5">
        <div className="max-w-4xl mx-auto flex flex-col gap-4">
          <div className="relative w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-omni-text/20 group-focus-within:text-omni-primary transition-colors" />
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search experiments in the laboratory..."
              className="w-full bg-omni-text/5 border border-omni-text/10 rounded-2xl py-4 pl-12 pr-4 text-omni-text placeholder:text-omni-text/20 focus:outline-none focus:ring-2 focus:ring-omni-primary/50 transition-all font-medium"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-omni-text/10 rounded-full text-omni-text/40">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {/* Main Filter Bar - Wrapped for visibility */}
          <div className="flex flex-wrap gap-2 py-1 justify-center md:justify-start">
            {CATEGORIES.map(cat => (
              <button 
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all border ${
                  activeCategory === cat.key 
                    ? 'bg-omni-primary text-white border-omni-primary shadow-[0_0_15px_rgba(223,28,38,0.3)] scale-[1.05]' 
                    : 'bg-omni-text/5 text-omni-text/30 border-white/5 hover:text-omni-text hover:bg-omni-text/10'
                }`}
              >
                {cat.emoji} {cat.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {favoriteTools.length > 0 && activeCategory === 'All' && !search && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-omni-text/5 pb-4">
              <span className="text-2xl drop-shadow-lg">⭐</span>
              <h2 className="text-xl font-bold text-omni-text/90 font-mono tracking-tighter">Most Used</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-omni-text/5 to-transparent ml-4 opacity-50" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 py-2">
              {favoriteTools.map(tool => (
                <ToolCard key={tool.id} {...tool} />
              ))}
            </div>
          </div>
        )}
      </AnimatePresence>

      <div className="space-y-16">
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 py-2">
             <AnimatePresence mode="popLayout">
               {filteredTools.map((tool) => (
                 <ToolCard 
                   key={tool.id} 
                   {...tool} 
                   isFavorite={favorites.includes(tool.id)}
                 />
               ))}
             </AnimatePresence>
          </div>
        ) : (
          <div className="py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-omni-text/5 rounded-full flex items-center justify-center mx-auto text-omni-text/20">
              <Search className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-omni-text/60">No experiments match this criteria</h3>
            <button onClick={() => { setSearch(''); setActiveCategory('All'); }} className="text-omni-primary hover:underline font-bold">Reset laboratory filters</button>
          </div>
        )}
      </div>

      {/* Laboratory Stats Booster */}
      {!search && activeCategory === 'All' && (
        <div className="mt-20 p-10 glass-card rounded-[40px] border-dashed text-center space-y-4">
           <PlusCircle className="w-12 h-12 text-omni-text/10 mx-auto" />
           <p className="text-omni-text/40 font-mono text-sm">More modules are being synthesized in the lab...</p>
           <div className="flex justify-center gap-2">
              <div className="w-2 h-2 bg-omni-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-2 h-2 bg-omni-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 bg-omni-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
           </div>
        </div>
      )}

      {/* Keyboard Shortcuts Hint */}
      <div className="mt-8 px-6 py-4 glass-card rounded-[32px] border-dashed">
        <div className="flex items-start gap-3">
          <Keyboard className="w-5 h-5 text-omni-text/40 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-omni-text mb-2">Keyboard Shortcuts</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 text-xs text-omni-text/60">
              <div><kbd className="px-1.5 py-0.5 bg-omni-text/10 rounded">Cmd+K</kbd> <span className="ml-1">Search</span></div>
              <div><kbd className="px-1.5 py-0.5 bg-omni-text/10 rounded">Esc</kbd> <span className="ml-1">Close modal</span></div>
              <div><kbd className="px-1.5 py-0.5 bg-omni-text/10 rounded">↑↓</kbd> <span className="ml-1">Navigate</span></div>
              <div><kbd className="px-1.5 py-0.5 bg-omni-text/10 rounded">Enter</kbd> <span className="ml-1">Open tool</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
