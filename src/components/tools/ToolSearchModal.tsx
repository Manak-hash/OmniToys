import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { X, Search, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ALL_TOOLS, type Tool } from '@/constants/tools'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/utils/cn'

interface ToolSearchModalProps {
  isOpen: boolean
  onClose: () => void
  recentTools?: string[]
}

export function ToolSearchModal({ isOpen, onClose, recentTools = [] }: ToolSearchModalProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
        setSelectedIndex(0)
      }, 100)
    }
  }, [isOpen])

  // Filter tools based on query
  const results = useMemo(() => {
    if (!query.trim()) {
      // Show recent tools first, then all tools
      const recent = ALL_TOOLS.filter(t => recentTools.includes(t.id))
      const others = ALL_TOOLS.filter(t => !recentTools.includes(t.id) && !t.isComingSoon)
      return [...recent, ...others].slice(0, 8)
    }

    const lowerQuery = query.toLowerCase()
    return ALL_TOOLS.filter(tool => {
      if (tool.isComingSoon) return false

      const searchableText = [
        tool.title,
        tool.description,
        tool.category,
        tool.id
      ].join(' ').toLowerCase()

      return searchableText.includes(lowerQuery)
    }).slice(0, 8)
  }, [query, recentTools])

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (results[selectedIndex]) {
          navigate(results[selectedIndex].to)
          onClose()
          setQuery('')
        }
        break
      case 'Escape':
        e.preventDefault()
        onClose()
        setQuery('')
        break
    }
  }, [isOpen, results, selectedIndex, navigate, onClose])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleToolClick = (tool: Tool) => {
    navigate(tool.to)
    onClose()
    setQuery('')
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Design': 'bg-pink-500/10 text-pink-400',
      'Dev': 'bg-blue-500/10 text-blue-400',
      'File': 'bg-green-500/10 text-green-400',
      'Math': 'bg-purple-500/10 text-purple-400',
      'Security': 'bg-red-500/10 text-red-400',
      'Mobile': 'bg-orange-500/10 text-orange-400',
    }
    return colors[category] || 'bg-omni-text/10 text-omni-text/60'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="w-full max-w-2xl bg-omni-bg border-2 border-omni-primary/30 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Search Header */}
              <div className="flex items-center gap-3 p-4 border-b border-omni-text/10">
                <Search className="w-5 h-5 text-omni-text/40" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search tools... (Cmd+K)"
                  className="flex-1 bg-transparent text-omni-text text-lg placeholder:text-omni-text/40 focus:outline-none"
                />
                <div className="flex items-center gap-1 text-xs text-omni-text/40">
                  <kbd className="px-1.5 py-0.5 bg-omni-text/10 rounded">↑↓</kbd>
                  <span>to navigate</span>
                  <kbd className="px-1.5 py-0.5 bg-omni-text/10 rounded ml-2">Enter</kbd>
                  <span>to open</span>
                  <kbd className="px-1.5 py-0.5 bg-omni-text/10 rounded ml-2">Esc</kbd>
                  <span>to close</span>
                </div>
                <button
                  onClick={() => {
                    onClose()
                    setQuery('')
                  }}
                  className="p-1.5 rounded-lg hover:bg-omni-text/10 transition-colors"
                >
                  <X className="w-5 h-5 text-omni-text/60" />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto p-2">
                {results.length === 0 ? (
                  <div className="py-12 text-center text-omni-text/40">
                    <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No tools found</p>
                    <p className="text-xs mt-1">Try a different search term</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {results.map((tool, index) => {
                      const isSelected = index === selectedIndex
                      const isRecent = recentTools.includes(tool.id)

                      return (
                        <button
                          key={tool.id}
                          onClick={() => handleToolClick(tool)}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={cn(
                            "w-full flex items-center gap-4 p-3 rounded-xl transition-all text-left",
                            isSelected
                              ? "bg-omni-primary/10 border-2 border-omni-primary/30"
                              : "hover:bg-omni-text/5 border-2 border-transparent"
                          )}
                        >
                          {/* Icon */}
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                            isSelected ? "bg-omni-primary/20" : "bg-omni-text/5"
                          )}>
                            <div className="text-omni-text">
                              {tool.icon}
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className={cn(
                                "font-semibold text-omni-text",
                                isSelected && "text-omni-primary"
                              )}>
                                {tool.title}
                              </h3>
                              {isRecent && (
                                <span className="flex items-center gap-1 px-1.5 py-0.5 bg-omni-primary/10 text-omni-primary text-[10px] rounded-full font-medium">
                                  <Clock className="w-2.5 h-2.5" />
                                  Recent
                                </span>
                              )}
                              {tool.isNew && (
                                <span className="px-1.5 py-0.5 bg-green-500/10 text-green-400 text-[10px] rounded-full font-medium">
                                  NEW
                                </span>
                              )}
                            </div>
                            <p className={cn(
                              "text-xs text-omni-text/60 truncate",
                              isSelected && "text-omni-primary/70"
                            )}>
                              {tool.description}
                            </p>
                          </div>

                          {/* Category Badge */}
                          <span className={cn(
                            "px-2 py-1 rounded-lg text-[10px] font-medium flex-shrink-0",
                            getCategoryColor(tool.category)
                          )}>
                            {tool.category}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-omni-text/10 flex items-center justify-between text-xs text-omni-text/40">
                <span>{results.length} tools found</span>
                <span>Press <kbd className="px-1 py-0.5 bg-omni-text/10 rounded">Cmd+K</kbd> anytime to search</span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
