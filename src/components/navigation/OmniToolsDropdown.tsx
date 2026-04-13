/**
 * OmniToys Tools Dropdown in OmniFlow
 *
 * When in OmniFlow mode, show quick access to OmniToys tools
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, Sparkles, ChevronDown } from 'lucide-react'
import { ALL_TOOLS } from '@/constants/tools'
import { useNavigate } from 'react-router-dom'
import { getCurrentTheme } from '@/utils/navigation/ThemeSync'
import { cn } from '@/utils/cn'

interface OmniToolsDropdownProps {
  className?: string
}

export function OmniToolsDropdown({ className }: OmniToolsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const theme = getCurrentTheme()

  // Filter tools based on search
  const filteredTools = ALL_TOOLS.filter(tool =>
    !tool.isComingSoon && (
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  ).slice(0, 8) // Show max 8 results

  // Close dropdown on tool click
  const handleToolClick = (toolPath: string) => {
    navigate(toolPath)
    setIsOpen(false)
    setSearchQuery('')
  }

  return (
    <div className={cn('relative', className)}>
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all"
        style={{
          borderColor: isOpen ? theme.colors.primary : theme.colors.border,
          backgroundColor: isOpen ? theme.colors.bgSecondary : 'transparent'
        }}
      >
        <Sparkles className="w-4 h-4" style={{ color: theme.colors.primary }} />
        <span className="text-sm font-medium" style={{ color: theme.colors.text }}>
          Tools
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-80 rounded-xl border-2 shadow-2xl z-50 overflow-hidden"
              style={{
                backgroundColor: theme.colors.bg,
                borderColor: theme.colors.border
              }}
            >
              {/* Header */}
              <div className="p-4 border-b" style={{ borderColor: theme.colors.border }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold" style={{ color: theme.colors.text }}>
                    Quick Tools
                  </h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded hover:bg-white/5"
                  >
                    <X className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                  </button>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: theme.colors.textTertiary }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tools..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg text-sm"
                    style={{
                      backgroundColor: theme.colors.bgSecondary,
                      border: `1px solid ${theme.colors.border}`,
                      color: theme.colors.text
                    }}
                    autoFocus
                  />
                </div>
              </div>

              {/* Tools List */}
              <div className="max-h-96 overflow-y-auto p-2">
                {filteredTools.length === 0 ? (
                  <div className="text-center py-8" style={{ color: theme.colors.textTertiary }}>
                    No tools found
                  </div>
                ) : (
                  filteredTools.map((tool) => (
                    <motion.button
                      key={tool.id}
                      onClick={() => handleToolClick(tool.to)}
                      whileHover={{ x: 4 }}
                      className="w-full text-left p-3 rounded-lg mb-1 flex items-center gap-3 transition-colors"
                      style={{
                        backgroundColor: 'transparent'
                      }}
                      onHoverStart={() => {
                        // Hover styles handled by CSS
                      }}
                      onHoverEnd={() => {
                        // Hover styles handled by CSS
                      }}
                    >
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${theme.colors.primary}20` }}
                      >
                        {tool.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate" style={{ color: theme.colors.text }}>
                          {tool.title}
                        </div>
                        <div className="text-xs truncate" style={{ color: theme.colors.textTertiary }}>
                          {tool.description}
                        </div>
                      </div>
                      <div className="text-xs px-2 py-1 rounded-full" style={{
                        backgroundColor: theme.colors.bgSecondary,
                        color: theme.colors.textTertiary
                      }}>
                        {tool.category}
                      </div>
                    </motion.button>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t text-center" style={{ borderColor: theme.colors.border }}>
                <button
                  onClick={() => {
                    navigate('/tools')
                    setIsOpen(false)
                  }}
                  className="text-sm font-medium hover:underline"
                  style={{ color: theme.colors.primary }}
                >
                  View all {ALL_TOOLS.length} tools →
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

