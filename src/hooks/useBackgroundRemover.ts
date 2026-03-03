import { useState, useCallback, useRef } from 'react'
import {
  runInference,
  switchModel,
  getAvailableModels,
  type BackgroundRemovalModel,
} from '@/utils/onnxModelLoader'
import { useAssetCache } from '@/hooks/useAssetCache'
import { loadImage, preprocessImage, applyMask, visualizeMask } from '@/utils/imageProcessor'

export interface MaskControls {
  threshold: number // 0-100
  featherEdges: boolean
  featherRadius: number // 1-10px
}

export interface BackgroundRemovalState {
  isModelLoading: boolean
  isProcessing: boolean
  progress: number
  originalImage: string | null
  resultImage: string | null
  maskVisualization: string | null
  error: string | null
  selectedModel: BackgroundRemovalModel | null
  availableModels: BackgroundRemovalModel[]
  maskControls: MaskControls
}

export interface BackgroundRemovalActions {
  selectModel: (modelId: string) => Promise<void>
  removeBackground: (file: File) => Promise<void>
  updateMaskControls: (controls: Partial<MaskControls>) => void
  reset: () => void
  downloadResult: () => void
  modelCacheStatus: 'uncached' | 'downloading' | 'cached' | 'error'
  modelCacheProgress: number
  modelCacheError: string | null
  downloadModel: () => Promise<void>
}

const DEFAULT_MASK_CONTROLS: MaskControls = {
  threshold: 50,
  featherEdges: true,
  featherRadius: 2,
}

export function useBackgroundRemover(): BackgroundRemovalState & BackgroundRemovalActions {
  const availableModels = getAvailableModels()
  const [selectedModel, setSelectedModel] = useState<BackgroundRemovalModel | null>(
    availableModels[0] || null
  )

  const [state, setState] = useState<Omit<BackgroundRemovalState, 'availableModels' | 'selectedModel' | 'maskControls'>>({
    isModelLoading: false,
    isProcessing: false,
    progress: 0,
    originalImage: null,
    resultImage: null,
    maskVisualization: null,
    error: null,
  })

  const [maskControls, setMaskControls] = useState<MaskControls>(DEFAULT_MASK_CONTROLS)

  const originalImageRef = useRef<HTMLImageElement | null>(null)
  const currentFileRef = useRef<File | null>(null)

  // Asset cache for the selected model
  const assetCache = useAssetCache(
    selectedModel
      ? {
          assetName: selectedModel.id,
          assetUrl: selectedModel.config.modelUrl,
          version: selectedModel.config.version,
          autoLoad: false,
        }
      : {
          assetName: '',
          assetUrl: '',
          version: '',
          autoLoad: false,
        }
  )

  const removeBackground = useCallback(
    async (file: File) => {
      if (!selectedModel) {
        setState((prev) => ({ ...prev, error: 'No model selected' }))
        return
      }

      currentFileRef.current = file

      setState((prev) => ({
        ...prev,
        isProcessing: true,
        progress: 0,
        error: null,
      }))

      try {
        // Download/cache model if needed
        if (assetCache.status === 'uncached') {
          setState((prev) => ({ ...prev, progress: 5, isModelLoading: true }))
          await assetCache.download()
          setState((prev) => ({ ...prev, progress: 10, isModelLoading: false }))
        }

        // Load model
        setState((prev) => ({ ...prev, progress: 20 }))
        await switchModel(selectedModel.id)

        // Load image
        setState((prev) => ({ ...prev, progress: 30 }))
        const image = await loadImage(file)
        originalImageRef.current = image

        // Create preview
        const previewCanvas = document.createElement('canvas')
        previewCanvas.width = image.width
        previewCanvas.height = image.height
        const previewCtx = previewCanvas.getContext('2d')!
        previewCtx.drawImage(image, 0, 0)
        const originalDataUrl = previewCanvas.toDataURL('image/png')

        setState((prev) => ({
          ...prev,
          originalImage: originalDataUrl,
          progress: 40,
        }))

        // Preprocess image
        setState((prev) => ({ ...prev, progress: 50 }))
        const { tensor } = await preprocessImage(image, selectedModel.config.inputSize)

        // Run inference
        setState((prev) => ({ ...prev, progress: 60 }))
        const mask = await runInference(tensor, selectedModel.id)

        setState((prev) => ({ ...prev, progress: 80 }))

        // Apply mask with controls
        const resultDataUrl = await applyMask(image, mask, maskControls)

        // Visualize mask (for debugging/preview)
        const maskViz = visualizeMask(mask)

        setState((prev) => ({
          ...prev,
          resultImage: resultDataUrl,
          maskVisualization: maskViz,
          progress: 100,
          isProcessing: false,
        }))
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to remove background'
        setState((prev) => ({
          ...prev,
          isProcessing: false,
          error: errorMessage,
        }))
        throw error
      }
    },
    [selectedModel, assetCache, maskControls]
  )

  const selectModel = useCallback(async (modelId: string) => {
    const model = getAvailableModels().find((m) => m.id === modelId)
    if (!model) {
      throw new Error(`Unknown model: ${modelId}`)
    }

    setSelectedModel(model)
    setState((prev) => ({
      ...prev,
      resultImage: null,
      maskVisualization: null,
      error: null,
    }))

    // If we have a cached file, reprocess with new model
    if (currentFileRef.current) {
      await removeBackground(currentFileRef.current)
    }
  }, [removeBackground])

  const updateMaskControls = useCallback((controls: Partial<MaskControls>) => {
    setMaskControls((prev) => ({ ...prev, ...controls }))

    // Reapply mask if we have results
    if (originalImageRef.current && state.resultImage) {
      // Trigger reprocessing with new controls
      if (currentFileRef.current) {
        removeBackground(currentFileRef.current)
      }
    }
  }, [state.resultImage, removeBackground])

  const reset = useCallback(() => {
    originalImageRef.current = null
    currentFileRef.current = null
    setMaskControls(DEFAULT_MASK_CONTROLS)
    setState({
      isModelLoading: false,
      isProcessing: false,
      progress: 0,
      originalImage: null,
      resultImage: null,
      maskVisualization: null,
      error: null,
    })
  }, [])

  const downloadResult = useCallback(() => {
    if (!state.resultImage) return

    const link = document.createElement('a')
    link.href = state.resultImage
    link.download = `removed-background-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [state.resultImage])

  return {
    ...state,
    selectedModel,
    availableModels,
    maskControls,
    selectModel,
    removeBackground,
    updateMaskControls,
    reset,
    downloadResult,
    modelCacheStatus: assetCache.status,
    modelCacheProgress: assetCache.progress,
    modelCacheError: assetCache.error,
    downloadModel: assetCache.download,
  }
}
