import { useState } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { GitBranch, Sparkles, Zap, ExternalLink, Maximize2 } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

// OmniFlow branding - enhanced icon with glow effect
const OmniFlowIcon = () => (
  <div className="relative">
    <div className="absolute inset-0 bg-omni-primary/20 blur-xl animate-pulse" />
    <GitBranch className="relative w-6 h-6 text-omni-primary" strokeWidth={2.5} />
  </div>
)

export default function OmniFlowPage() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [iframeLoaded, setIframeLoaded] = useState(false)

  // OmniFlow deployment URL - uses same origin for development, deployed URL for production
  const isDev = import.meta.env.DEV
  const omniFlowUrl = isDev
    ? 'http://localhost:5176' // Local development
    : 'https://omniflow.vercel.app' // Production deployment

  const handleOpenInNewTab = () => {
    window.open(omniFlowUrl, '_blank', 'noopener,noreferrer')
    toast.success('Opening OmniFlow in new tab')
  }

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    toast.success(isFullscreen ? 'Exited fullscreen' : 'Entered fullscreen')
  }

  // Enhanced action buttons for header
  const actions = (
    <div className="flex items-center gap-3">
      {/* Feature highlights */}
      <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-omni-text/5 rounded-xl border border-omni-text/10">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-omni-primary" />
          <span className="text-xs font-mono font-bold text-omni-text/60">Multi-view</span>
        </div>
        <div className="w-px h-3 bg-omni-text/10" />
        <div className="flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-omni-accent" />
          <span className="text-xs font-mono font-bold text-omni-text/60">Real-time</span>
        </div>
        <div className="w-px h-3 bg-omni-text/10" />
        <div className="flex items-center gap-1.5">
          <GitBranch className="w-3 h-3 text-green-500" />
          <span className="text-xs font-mono font-bold text-omni-text/60">5 Layouts</span>
        </div>
      </div>

      {/* Action buttons */}
      <button
        onClick={handleOpenInNewTab}
        className="p-3 rounded-2xl border border-omni-text/5 text-omni-text/30 hover:text-omni-primary hover:bg-omni-primary/5 hover:border-omni-primary/20 transition-all duration-300 group"
        title="Open in new tab"
      >
        <ExternalLink className="w-5 h-5 group-hover:scale-110 transition-transform" />
      </button>
      <button
        onClick={handleToggleFullscreen}
        className="p-3 rounded-2xl border border-omni-text/5 text-omni-text/30 hover:text-omni-accent hover:bg-omni-accent/5 hover:border-omni-accent/20 transition-all duration-300 group"
        title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      >
        <Maximize2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
      </button>
    </div>
  )

  if (!iframeLoaded) {
    return (
      <ToolLayout
        title="OmniFlow"
        description="Visual mind mapping & task management system"
        icon={<OmniFlowIcon />}
        actions={actions}
        toolId="omniflow"
      >
        <div className="flex items-center justify-center h-[600px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-omni-primary/20 blur-3xl animate-pulse" />
              <OmniFlowIcon />
            </div>
            <p className="text-omni-text/40 font-mono text-sm">Loading OmniFlow workspace...</p>
          </motion.div>
        </div>
      </ToolLayout>
    )
  }

  return (
    <ToolLayout
      title="OmniFlow"
      description="Visual mind mapping & task management with real-time collaboration, multi-view layouts, and advanced task tracking"
      icon={<OmniFlowIcon />}
      actions={actions}
      toolId="omniflow"
    >
      <div className={isFullscreen ? 'fixed inset-0 z-50 bg-omni-bg' : 'h-[700px]'}>
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute top-0 right-0 w-96 h-96 bg-omni-primary/5 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-96 h-96 bg-omni-accent/5 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
        </div>

        {/* OmniFlow iframe */}
        <div className="relative w-full h-full">
          <iframe
            src={omniFlowUrl}
            className="w-full h-full border-0 rounded-lg"
            onLoad={() => setIframeLoaded(true)}
            title="OmniFlow Mindmap"
            allow="clipboard-write; clipboard-read"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
          />
        </div>
      </div>
    </ToolLayout>
  )
}
