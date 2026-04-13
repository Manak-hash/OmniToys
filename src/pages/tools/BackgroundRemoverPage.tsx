import { useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { AssetCacheStatus } from '@/components/tools/AssetCacheStatus'
import { Eraser, Upload, Download, Loader2, AlertCircle, Settings } from 'lucide-react'
import { useBackgroundRemover } from '@/hooks/useBackgroundRemover'
import { toast } from 'sonner'

export default function BackgroundRemoverPage() {
  const {
    isProcessing,
    progress,
    originalImage,
    resultImage,
    maskVisualization,
    error,
    selectedModel,
    availableModels,
    maskControls,
    selectModel,
    removeBackground,
    updateMaskControls,
    reset,
    downloadResult,
    modelCacheStatus,
    modelCacheProgress,
    modelCacheError,
    downloadModel,
  } = useBackgroundRemover()

  const handleFileUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return

      const file = files[0]

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }

      // Validate file size (max 20MB for performance)
      if (file.size > 20 * 1024 * 1024) {
        toast.error('Image size must be under 20MB')
        return
      }

      try {
        await removeBackground(file)
        toast.success('Background removed successfully!')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to remove background')
      }
    },
    [removeBackground]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      handleFileUpload(e.dataTransfer.files)
    },
    [handleFileUpload]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDownload = useCallback(() => {
    downloadResult()
    toast.success('Image downloaded!')
  }, [downloadResult])

  const handleReset = useCallback(() => {
    reset()
    toast.success('Reset!')
  }, [reset])

  const handleModelChange = useCallback(
    async (modelId: string) => {
      try {
        await selectModel(modelId)
        toast.success(`Model switched!`)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to switch model')
      }
    },
    [selectModel]
  )

  return (
    <ToolLayout
      title="Background Remover"
      description="AI-powered background removal with dual-model support"
      icon={<Eraser className="w-8 h-8" />}
      actions={
        resultImage ? (
          <ActionToolbar onReset={handleReset} />
        ) : undefined
      }
    >
      <div className="flex flex-col h-full gap-6">
        {/* Model Selection & Cache Status */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-omni-text/5 rounded-xl">
            <div className="space-y-2">
              <p className="text-xs font-bold text-omni-text/50 uppercase">Model</p>
              <div className="flex items-center gap-3">
                {availableModels.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => handleModelChange(model.id)}
                    disabled={isProcessing}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                      selectedModel?.id === model.id
                        ? 'bg-omni-primary text-white shadow-lg shadow-omni-primary/20'
                        : 'bg-omni-text/10 text-omni-text/60 hover:bg-omni-text/20'
                    } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {model.quality === 'fast' ? '⚡ ' : '✨ '}
                    {model.name}
                  </button>
                ))}
              </div>
              {selectedModel && (
                <div className="space-y-1">
                  <p className="text-xs text-omni-text/40">{selectedModel.description}</p>
                  {selectedModel.size > 100 * 1024 * 1024 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      ⚠️ Large model - requires 4GB+ RAM. May fail on mobile/low-memory devices.
                    </p>
                  )}
                </div>
              )}
            </div>

            {selectedModel && (
              <AssetCacheStatus
                status={modelCacheStatus}
                size={selectedModel.size}
                progress={modelCacheProgress}
                error={modelCacheError}
                onDownload={downloadModel}
              />
            )}
          </div>

          {/* Quality Controls */}
          <details className="group p-4 bg-omni-text/5 rounded-xl">
            <summary className="flex items-center justify-between cursor-pointer list-none">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-omni-text/50" />
                <span className="text-xs font-bold text-omni-text/50 uppercase">Quality Controls</span>
              </div>
              <span className="text-xs text-omni-text/40 group-open:hidden">Click to expand</span>
            </summary>

            <div className="mt-4 space-y-4">
              {/* Threshold */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-omni-text/60">Threshold</label>
                  <span className="text-xs text-omni-text/40">{maskControls.threshold}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={maskControls.threshold}
                  onChange={(e) => updateMaskControls({ threshold: parseInt(e.target.value) })}
                  disabled={isProcessing}
                  className="w-full h-2 bg-omni-text/10 rounded-lg appearance-none cursor-pointer accent-omni-primary disabled:opacity-50"
                />
                <p className="text-xs text-omni-text/40">
                  Adjust sensitivity. Lower values keep more detail, higher values remove more.
                </p>
              </div>

              {/* Edge Feathering */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <label className="text-xs text-omni-text/60">Feather Edges</label>
                  <p className="text-xs text-omni-text/40">Smooth mask edges for natural look</p>
                </div>
                <button
                  onClick={() => updateMaskControls({ featherEdges: !maskControls.featherEdges })}
                  disabled={isProcessing}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    maskControls.featherEdges
                      ? 'bg-omni-primary text-white'
                      : 'bg-omni-text/10 text-omni-text/60'
                  } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {maskControls.featherEdges ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Feather Radius */}
              {maskControls.featherEdges && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-omni-text/60">Feather Radius</label>
                    <span className="text-xs text-omni-text/40">{maskControls.featherRadius}px</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={maskControls.featherRadius}
                    onChange={(e) => updateMaskControls({ featherRadius: parseInt(e.target.value) })}
                    disabled={isProcessing}
                    className="w-full h-2 bg-omni-text/10 rounded-lg appearance-none cursor-pointer accent-omni-primary disabled:opacity-50"
                  />
                </div>
              )}
            </div>
          </details>
        </div>

        {/* Upload Area */}
        {!resultImage && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
              isProcessing
                ? 'border-omni-primary/30 bg-omni-primary/5'
                : 'border-omni-text/20 hover:border-omni-primary/30 hover:bg-omni-text/5'
            }`}
          >
            {isProcessing ? (
              <div className="space-y-4">
                <Loader2 className="w-12 h-12 mx-auto text-omni-primary animate-spin" />
                <div>
                  <p className="text-sm font-bold text-omni-text mb-2">
                    Removing background...
                  </p>
                  <div className="w-full h-2 bg-omni-text/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-omni-primary transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-omni-text/50 mt-2">{progress}% complete</p>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                  disabled={isProcessing}
                />
                <div className="space-y-3">
                  <Upload className="w-12 h-12 mx-auto text-omni-text/40" />
                  <div>
                    <p className="text-sm font-bold text-omni-text">
                      Drop image here or click to upload
                    </p>
                    <p className="text-xs text-omni-text/50 mt-1">
                      PNG, JPG, WEBP up to 20MB
                    </p>
                  </div>
                </div>
              </label>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-500">Error</p>
              <p className="text-xs text-red-500/80 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {resultImage && (
          <div className="flex-1 space-y-6">
            {/* Compare View */}
            <div className="grid grid-cols-2 gap-4">
              {/* Original */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-omni-text/50 uppercase">Original</p>
                {originalImage && (
                  <div className="relative aspect-square bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEwIDBoMTB2MTBIMTBWMHgxMHptMTAgMTB2MTBIMTB2MTBIMTB6IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')] rounded-lg overflow-hidden border border-omni-text/10">
                    <img
                      src={originalImage}
                      alt="Original"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Result */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-omni-text/50 uppercase">Background Removed</p>
                <div className="relative aspect-square bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEwIDBoMTB2MTBIMTBWMHgxMHptMTAgMTB2MTBIMTB2MTBIMTB6IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')] rounded-lg overflow-hidden border border-omni-primary/30">
                  {/* Checkerboard pattern for transparency */}
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: 'conic-gradient(#ccc 90deg, transparent 90deg), conic-gradient(transparent 90deg, #ccc 90deg)',
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 10px 10px'
                  }} />
                  <img
                    src={resultImage}
                    alt="Background removed"
                    className="relative w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="w-full px-6 py-3 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-omni-primary/20 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> Download PNG
            </button>

            {/* Mask Visualization (Debug) */}
            {maskVisualization && (
              <details className="p-4 bg-omni-text/5 rounded-xl">
                <summary className="text-xs font-bold text-omni-text/50 uppercase cursor-pointer">
                  Debug: View Alpha Mask
                </summary>
                <div className="mt-3">
                  <img
                    src={maskVisualization}
                    alt="Alpha mask"
                    className="w-full h-auto rounded-lg border border-omni-text/10"
                  />
                </div>
              </details>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
