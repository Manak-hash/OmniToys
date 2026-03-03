import { Loader2, Download, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'
import { formatBytes } from '@/utils/assetCache'
import type { CacheStatus } from '@/utils/assetCache'

interface AssetCacheStatusProps {
  status: CacheStatus
  size: number // Size in bytes
  progress?: number
  error?: string | null
  onDownload?: () => void
  onRetry?: () => void
  className?: string
}

export function AssetCacheStatus({
  status,
  size,
  progress = 0,
  error,
  onDownload,
  onRetry,
  className = '',
}: AssetCacheStatusProps) {
  const sizeFormatted = formatBytes(size)

  if (status === 'cached') {
    return (
      <div className={`flex items-center gap-2 text-xs text-green-500 ${className}`}>
        <CheckCircle2 className="w-4 h-4" />
        <span>Ready ({sizeFormatted} cached)</span>
      </div>
    )
  }

  if (status === 'downloading') {
    return (
      <div className={`flex items-center gap-2 text-xs text-omni-text/60 ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Downloading {progress}%</span>
        <div className="w-16 h-1.5 bg-omni-text/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-omni-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className={`flex items-center gap-2 text-xs text-red-500 ${className}`}>
        <AlertCircle className="w-4 h-4" />
        <span>{error || 'Download failed'}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-2 flex items-center gap-1 px-2 py-1 bg-red-500/10 hover:bg-red-500/20 rounded transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        )}
      </div>
    )
  }

  // status === 'uncached'
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {onDownload ? (
        <button
          onClick={onDownload}
          className="flex items-center gap-2 px-3 py-1.5 text-xs bg-omni-primary/10 hover:bg-omni-primary/20 text-omni-primary rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Download {sizeFormatted}</span>
        </button>
      ) : (
        <div className="flex items-center gap-2 text-xs text-omni-text/60">
          <Download className="w-4 h-4" />
          <span>{sizeFormatted} required</span>
        </div>
      )}
    </div>
  )
}
