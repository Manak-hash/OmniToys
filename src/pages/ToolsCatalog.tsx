import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { usePreferences } from '@/store/preferences'
import { motion, AnimatePresence } from 'framer-motion'
import { matchSorter } from 'match-sorter'
import { ALL_TOOLS } from '@/constants/tools'
import { ToolFilters, type FilterState } from '@/components/tools/ToolFilters'
import { ToolCard } from '@/components/tools/ToolCard'

export default function ToolsCatalog() {
  const navigate = useNavigate()
  const { favorites, recentTools, addFavorite, removeFavorite } = usePreferences()
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<FilterState>({
    category: null,
    status: 'all',
    features: [],
  })

  // Handle navigation to tool
  const handleNavigate = (toolId: string) => {
    navigate(`/tools/${toolId}`)
    usePreferences.getState().addRecentTool(toolId)
  }

  // Handle favorite toggle
  const handleToggleFavorite = (toolId: string) => {
    if (favorites.includes(toolId)) {
      removeFavorite(toolId)
    } else {
      addFavorite(toolId)
    }
  }

  // Filter tools based on all criteria
  const filteredTools = useMemo(() => {
    let result = ALL_TOOLS.filter(tool => !tool.isComingSoon)

    // Apply status filter
    if (filters.status === 'favorites') {
      result = result.filter(tool => favorites.includes(tool.id))
    } else if (filters.status === 'recent') {
      result = result.filter(tool => recentTools.includes(tool.id))
    }

    // Apply category filter
    if (filters.category) {
      result = result.filter(tool =>
        tool.category.toLowerCase() === filters.category?.toLowerCase()
      )
    }

    // Apply feature filters
    if (filters.features.includes('wasm')) {
      result = result.filter(tool => tool.isWasm)
    }
    if (filters.features.includes('new')) {
      result = result.filter(tool => tool.isNew)
    }

    // Apply search filter
    if (search.trim()) {
      result = matchSorter(result, search, {
        keys: ['title', 'description', 'category'],
      })
    }

    return result
  }, [search, filters, favorites, recentTools])

  const hasActiveFilters = filters.category !== null || filters.features.length > 0 || search

  return (
    <div className="space-y-8 pb-20 relative">
      {/* Subtle animated background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-omni-primary/5 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </div>

      {/* Search Header */}
      <div className="sticky top-16 lg:top-4 z-30 py-6 backdrop-blur-sm bg-omni-bg/80 border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-omni-text/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tools..."
              className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-10 text-sm text-omni-text placeholder:text-omni-text/30 focus:outline-none focus:border-omni-primary/30 focus:bg-white/[0.07] transition-all font-mono"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded text-omni-text/30 hover:text-omni-text transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-32">
            <div className="p-5 bg-white/[0.02] border border-white/[0.05] rounded-lg">
              <ToolFilters
                filters={filters}
                onChange={setFilters}
                favorites={favorites}
                recentTools={recentTools}
              />
            </div>
          </div>
        </aside>

        {/* Mobile Filters */}
        <div className="lg:hidden px-4">
          <details className="group">
            <summary className="list-none cursor-pointer">
              <button className="w-full p-4 bg-white/[0.02] border border-white/[0.05] rounded-lg flex items-center justify-between">
                <span className="text-sm font-semibold text-omni-text font-mono">Filters</span>
                <X className="w-4 h-4 text-omni-text/40 group-open:rotate-45 transition-transform" />
              </button>
            </summary>
            <div className="mt-2 p-4 bg-white/[0.02] border border-white/[0.05] rounded-lg">
              <ToolFilters
                filters={filters}
                onChange={setFilters}
                favorites={favorites}
                recentTools={recentTools}
              />
            </div>
          </details>
        </div>

        {/* Main Content */}
        <main className="flex-1 min-w-0 px-4">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-omni-text font-mono tracking-tight">
                {filteredTools.length} <span className="text-omni-text/40 font-normal">tools</span>
              </h2>
              <p className="text-xs text-omni-text/30 font-mono mt-1">
                {hasActiveFilters ? 'Filtered results' : 'All tools'}
              </p>
            </div>
            {hasActiveFilters && (
              <button
                onClick={() => {
                  setSearch('')
                  setFilters({ category: null, status: 'all', features: [] })
                }}
                className="text-xs font-mono text-omni-primary hover:text-omni-primary/80 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Tools Grid */}
          <AnimatePresence mode="popLayout">
            {filteredTools.length > 0 ? (
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
              >
                {filteredTools.map((tool, index) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    onNavigate={handleNavigate}
                    isFavorite={favorites.includes(tool.id)}
                    onToggleFavorite={handleToggleFavorite}
                    index={index}
                  />
                ))}
              </motion.div>
            ) : (
              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-omni-text/20" />
                </div>
                <h3 className="text-sm font-bold text-omni-text/40 font-mono mb-4">
                  No tools found
                </h3>
                <button
                  onClick={() => {
                    setSearch('')
                    setFilters({ category: null, status: 'all', features: [] })
                  }}
                  className="text-xs font-mono text-omni-primary hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
