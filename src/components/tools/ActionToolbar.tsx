import { Copy, Download, Share2, RefreshCw } from 'lucide-react'
import type { ReactNode } from 'react'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'

interface ActionToolbarProps {
  onCopy?: () => void
  onDownload?: () => void
  onShare?: () => void
  onReset?: () => void
  copyText?: string
  className?: string
  children?: ReactNode
}

export function ActionToolbar({ 
  onCopy, 
  onDownload, 
  onShare, 
  onReset,
  copyText = "Copy",
  className,
  children 
}: ActionToolbarProps) {
  
  const handleCopy = () => {
    if (onCopy) {
      onCopy()
    }
  }

  const handleShare = async () => {
    if (onShare) {
      onShare()
      return
    }
    
    // Default share behavior if no custom handler
    const shareData = {
      title: document.title,
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
    } catch {
      toast.error('Failed to share')
    }
  }

  return (
    <div className={cn("flex items-center gap-1.5 p-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 shadow-lg", className)}>
      {onCopy && (
        <button
          onClick={handleCopy}
          className="p-2 text-omni-text/60 hover:text-white hover:bg-white/10 rounded-md transition-colors"
          title={copyText}
        >
          <Copy className="w-4 h-4" />
        </button>
      )}
      
      {onDownload && (
        <button
          onClick={onDownload}
          className="p-2 text-omni-text/60 hover:text-white hover:bg-white/10 rounded-md transition-colors"
          title="Download"
        >
          <Download className="w-4 h-4" />
        </button>
      )}

      {onShare && (
        <button
          onClick={handleShare}
          className="p-2 text-omni-text/60 hover:text-white hover:bg-white/10 rounded-md transition-colors"
          title="Share"
        >
          <Share2 className="w-4 h-4" />
        </button>
      )}

      {onReset && (
        <>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <button
            onClick={onReset}
            className="p-2 text-omni-text/60 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
            title="Reset"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </>
      )}
      
      {children}
    </div>
  )
}
