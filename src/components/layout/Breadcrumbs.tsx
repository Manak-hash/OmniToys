import { useLocation, Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { ALL_TOOLS } from '@/constants/tools'
import { cn } from '@/utils/cn'

export function Breadcrumbs() {
  const location = useLocation()
  const pathname = location.pathname

  // Split pathname into segments and filter out empty ones
  const segments = pathname.split('/').filter(Boolean)

  // Don't render breadcrumbs on home page
  if (segments.length === 0) {
    return null
  }

  // Function to get display name for a breadcrumb segment
  const getBreadcrumbName = (segment: string, index: number, isLast: boolean): string => {
    // "tools" should be displayed as "Tools"
    if (segment === 'tools') {
      return 'Tools'
    }

    // If it's the last segment, try to find a matching tool
    if (isLast) {
      const tool = ALL_TOOLS.find((t) => t.to === pathname)
      if (tool) {
        return tool.title
      }
    }

    // Otherwise, capitalize the segment
    return segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Build the breadcrumb path incrementally
  const buildPath = (index: number): string => {
    return '/' + segments.slice(0, index + 1).join('/')
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-white/50 mb-4" aria-label="Breadcrumb">
      {/* Home link */}
      <Link
        to="/"
        className={cn(
          'flex items-center hover:text-omni-primary transition-all duration-200',
          'hover:shadow-[0_0_10px_rgba(223,28,38,0.3)] rounded'
        )}
      >
        <Home className="w-4 h-4" />
      </Link>

      {/* Render each segment */}
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1
        const displayName = getBreadcrumbName(segment, index, isLast)
        const path = buildPath(index)

        return (
          <div key={segment} className="flex items-center space-x-2">
            <ChevronRight className="w-4 h-4 flex-shrink-0" />

            {isLast ? (
              // Last segment - not clickable
              <span className="text-omni-text font-medium">{displayName}</span>
            ) : (
              // Non-last segment - clickable link
              <Link
                to={path}
                className={cn(
                  'hover:text-omni-primary transition-all duration-200',
                  'hover:shadow-[0_0_10px_rgba(223,28,38,0.3)] rounded px-1 py-0.5'
                )}
              >
                {displayName}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
