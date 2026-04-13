import { Star, Clock, X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useHapticFeedback } from '@/hooks/useHapticFeedback'

export interface FilterState {
  category: string | null
  status: 'all' | 'favorites' | 'recent'
  features: string[]
}

interface ToolFiltersProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
  favorites: string[]
  recentTools: string[]
}

const CATEGORIES = [
  { id: 'design', label: 'Design' },
  { id: 'dev', label: 'Dev' },
  { id: 'file', label: 'File' },
  { id: 'math', label: 'Math' },
  { id: 'security', label: 'Security' },
  { id: 'mobile', label: 'Mobile' },
  { id: 'network', label: 'Network' },
]

const FEATURES = [
  { id: 'wasm', label: 'WASM' },
  { id: 'new', label: 'New' },
]

export function ToolFilters({ filters, onChange, favorites, recentTools }: ToolFiltersProps) {
  const { tap } = useHapticFeedback()

  const handleStatusChange = (status: FilterState['status']) => {
    tap()
    onChange({ ...filters, status })
  }

  const handleCategoryChange = (categoryId: string | null) => {
    tap()
    onChange({ ...filters, category: categoryId })
  }

  const handleFeatureToggle = (featureId: string) => {
    tap()
    const newFeatures = filters.features.includes(featureId)
      ? filters.features.filter(f => f !== featureId)
      : [...filters.features, featureId]
    onChange({ ...filters, features: newFeatures })
  }

  const handleClearFilters = () => {
    tap()
    onChange({ category: null, status: filters.status, features: [] })
  }

  const hasActiveFilters = filters.category !== null || filters.features.length > 0

  return (
    <div className="space-y-8">
      {/* Status Tabs - Pill Design */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-mono uppercase tracking-widest text-omni-text/30">
          View
        </label>
        <div className="flex flex-col gap-1.5">
          {[
            { id: 'all', label: 'All Tools', icon: null, count: null },
            { id: 'favorites', label: 'Favorites', icon: Star, count: favorites.length },
            { id: 'recent', label: 'Recent', icon: Clock, count: recentTools.length },
          ].map((option) => {
            const isActive = filters.status === option.id
            const Icon = option.icon

            return (
              <button
                key={option.id}
                onClick={() => handleStatusChange(option.id as FilterState['status'])}
                className={cn(
                  "relative px-3 py-2 rounded-lg font-mono text-[11px] font-medium transition-all duration-200 text-left",
                  "flex items-center gap-2",
                  isActive
                    ? "bg-omni-primary text-white"
                    : "bg-white/5 text-omni-text/50 hover:bg-white/10 hover:text-omni-text"
                )}
              >
                {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
                <span className="flex-1">{option.label}</span>
                {option.count !== null && option.count > 0 && (
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[10px] font-bold flex-shrink-0",
                    isActive ? "bg-white/20" : "bg-white/10"
                  )}>
                    {option.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-mono uppercase tracking-widest text-omni-text/30">
          Category
        </label>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => handleCategoryChange(null)}
            className={cn(
              "px-3 py-1.5 rounded-md font-mono text-[10px] uppercase tracking-wider transition-all duration-200",
              filters.category === null
                ? "bg-omni-text text-omni-bg"
                : "bg-white/5 text-omni-text/40 hover:bg-white/10 hover:text-omni-text/70"
            )}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={cn(
                "px-3 py-1.5 rounded-md font-mono text-[10px] uppercase tracking-wider transition-all duration-200",
                filters.category === cat.id
                  ? "bg-omni-primary text-white"
                  : "bg-white/5 text-omni-text/40 hover:bg-white/10 hover:text-omni-text/70"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-mono uppercase tracking-widest text-omni-text/30">
          Type
        </label>
        <div className="flex gap-1.5">
          {FEATURES.map((feature) => {
            const isActive = filters.features.includes(feature.id)
            return (
              <button
                key={feature.id}
                onClick={() => handleFeatureToggle(feature.id)}
                className={cn(
                  "px-3 py-1.5 rounded-md font-mono text-[10px] uppercase tracking-wider transition-all duration-200",
                  isActive
                    ? "bg-omni-accent text-white"
                    : "bg-white/5 text-omni-text/40 hover:bg-white/10 hover:text-omni-text/70"
                )}
              >
                {feature.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Clear Filters - Minimal */}
      {hasActiveFilters && (
        <button
          onClick={handleClearFilters}
          className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-omni-text/30 hover:text-omni-primary transition-colors group"
        >
          <X className="w-3 h-3 transition-transform group-hover:rotate-90" />
          Clear filters
        </button>
      )}
    </div>
  )
}
