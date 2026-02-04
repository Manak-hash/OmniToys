import { useState } from 'react'
import { Copy, Check, Download, RefreshCw, Hash } from 'lucide-react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { generateUuids, type UuidVersion, getVersionInfo } from '@/utils/uuidGenerator'
import { toast } from 'sonner'
import jsFileDownload from 'js-file-download'
import { cn } from '@/utils/cn'

export default function UuidGeneratorPage() {
  const [version, setVersion] = useState<UuidVersion>('v4')
  const [count, setCount] = useState(10)
  const [uuids, setUuids] = useState<string[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleGenerate = () => {
    const results = generateUuids(count, version)
    setUuids(results.map(r => r.uuid))
  }

  const handleCopyAll = () => {
    const text = uuids.join('\n')
    navigator.clipboard.writeText(text)
    toast.success('Copied all UUIDs to clipboard')
  }

  const handleCopyOne = (uuid: string, index: number) => {
    navigator.clipboard.writeText(uuid)
    setCopiedIndex(index)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleDownload = () => {
    const text = uuids.join('\n')
    jsFileDownload(text, 'uuids.txt')
    toast.success('Downloaded UUIDs file')
  }

  const versionInfo = getVersionInfo(version)

  return (
    <ToolLayout
      title="UUID Generator"
      description="Generate UUIDs v1, v4, and v7"
      icon={<Hash className="w-5 h-5" />}
    >
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap gap-4 p-4 bg-omni-text/5 rounded-lg">
          {/* Version Selector */}
          <div className="flex gap-2">
            {(['v1', 'v4', 'v7'] as UuidVersion[]).map((v) => (
              <button
                key={v}
                onClick={() => setVersion(v)}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium transition-all",
                  version === v
                    ? "bg-omni-primary text-white"
                    : "bg-omni-text/10 text-omni-text hover:bg-omni-text/20"
                )}
              >
                {v.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Count Input */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-omni-text/80">Count:</label>
            <input
              type="number"
              min={1}
              max={1000}
              value={count}
              onChange={(e) => setCount(Math.min(1000, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-24 px-3 py-2 rounded-lg bg-omni-bg border border-omni-text/20 text-omni-text focus:outline-none focus:ring-2 focus:ring-omni-primary/50"
            />
          </div>

          <button
            onClick={handleGenerate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-omni-primary text-white hover:bg-omni-primary/90 transition-colors ml-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Generate
          </button>
        </div>

        {/* Version Info */}
        <div className="p-4 bg-omni-text/5 rounded-lg">
          <h3 className="text-sm font-semibold mb-2">{versionInfo.name}</h3>
          <p className="text-xs text-omni-text/60 mb-2">{versionInfo.description}</p>
          <ul className="grid md:grid-cols-2 gap-2">
            {versionInfo.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-xs text-omni-text/80">
                <span className="text-omni-primary mt-0.5">•</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Results */}
        {uuids.length > 0 && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-omni-text/5 rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-omni-primary">{uuids.length}</p>
                <p className="text-xs text-omni-text/60">UUIDs Generated</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-omni-primary">{uuids[0].length * uuids.length}</p>
                <p className="text-xs text-omni-text/60">Total Characters</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-omni-primary">{version.toUpperCase()}</p>
                <p className="text-xs text-omni-text/60">Version</p>
              </div>
            </div>

            {/* UUID List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-omni-text/80">Generated UUIDs</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyAll}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-omni-text/10 text-omni-text hover:bg-omni-text/20 transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    Copy All
                  </button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {uuids.map((uuid, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 bg-omni-text/5 rounded-lg hover:bg-omni-text/10 transition-colors"
                  >
                    <span className="text-xs font-mono text-omni-text/40 w-8">
                      {index + 1}
                    </span>
                    <code className="flex-1 font-mono text-sm text-omni-text truncate">
                      {uuid}
                    </code>
                    <button
                      onClick={() => handleCopyOne(uuid, index)}
                      className="p-2 rounded hover:bg-omni-text/20 transition-colors"
                      title="Copy"
                    >
                      {copiedIndex === index ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-omni-text/60" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <ActionToolbar>
              <button
                onClick={handleCopyAll}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-omni-primary text-white hover:bg-omni-primary/90 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy All
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-omni-text/10 text-omni-text hover:bg-omni-text/20 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </ActionToolbar>
          </>
        )}

        {/* Empty State */}
        {uuids.length === 0 && (
          <div className="text-center py-12">
            <Hash className="w-16 h-16 mx-auto text-omni-text/20 mb-4" />
            <p className="text-omni-text/60">Click "Generate" to create UUIDs</p>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
