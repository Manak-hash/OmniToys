import * as ort from 'onnxruntime-web'

// Configure ONNX Runtime for web before any operations
ort.env.wasm.numThreads = navigator.hardwareConcurrency || 4

// Configure WASM backend to load files from public directory
;(ort.env.wasm as any).proxy = true
;(ort.env.wasm as any).wasmPaths = {
  'ort-wasm-simd-threaded.wasm': '/wasm/ort-wasm-simd-threaded.wasm',
  'ort-wasm-simd.wasm': '/wasm/ort-wasm-simd-threaded.wasm',
  'ort-wasm.wasm': '/wasm/ort-wasm-simd-threaded.wasm',
  'ort-wasm-threaded.wasm': '/wasm/ort-wasm-simd-threaded.wasm',
}

export interface ModelConfig {
  modelUrl: string
  inputSize: number
  version: string
}

export interface BackgroundRemovalModel {
  id: string
  name: string
  description: string
  config: ModelConfig
  size: number // Size in bytes
  quality: 'fast' | 'quality'
}

// Available models registry
// Models are loaded from HuggingFace CDN (free, fast, no file size limits)
// PWA will cache models after first download for offline use
export const AVAILABLE_MODELS: Record<string, BackgroundRemovalModel> = {
  rmbg: {
    id: 'rmbg',
    name: 'RMBG-1.4',
    description: 'Fast model, good for product photos (43MB)',
    config: {
      // Load from HuggingFace CDN - free, fast, cached by PWA after first load
      modelUrl: 'https://huggingface.co/briaai/RMBG-1.4/resolve/main/onnx/model_quantized.onnx',
      inputSize: 1024,
      version: '1.4.0',
    },
    size: 43 * 1024 * 1024, // 43MB
    quality: 'fast',
  },
  birefnet: {
    id: 'birefnet',
    name: 'BiRefNet',
    description: 'Quality model, best for hair and complex edges (172MB)',
    config: {
      // Load from HuggingFace CDN - free, fast, cached by PWA after first load
      modelUrl: 'https://huggingface.co/schirrmacher/birefnet-general/resolve/main/onnx/model.onnx',
      inputSize: 1024,
      version: '1.0.0',
    },
    size: 172 * 1024 * 1024, // 172MB
    quality: 'quality',
  },
}

// Active sessions storage (supports multiple models loaded)
const sessions = new Map<string, ort.InferenceSession>()
let activeModelId: string | null = null

/**
 * Get available models
 */
export function getAvailableModels(): BackgroundRemovalModel[] {
  return Object.values(AVAILABLE_MODELS)
}

/**
 * Get model by ID
 */
export function getModelById(id: string): BackgroundRemovalModel | undefined {
  return AVAILABLE_MODELS[id]
}

/**
 * Get currently active model
 */
export function getActiveModel(): BackgroundRemovalModel | undefined {
  if (!activeModelId) return undefined
  return AVAILABLE_MODELS[activeModelId]
}

/**
 * Load a background removal model
 * @param modelId Model ID to load
 * @returns ONNX Runtime inference session
 */
export async function loadBackgroundRemovalModel(
  modelId: string = 'rmbg'
): Promise<ort.InferenceSession> {
  const model = AVAILABLE_MODELS[modelId]
  if (!model) {
    throw new Error(`Unknown model: ${modelId}`)
  }

  // Check if already loaded
  if (sessions.has(modelId)) {
    console.log(`[ONNX] Model ${model.name} already loaded`)
    activeModelId = modelId
    return sessions.get(modelId)!
  }

  try {
    console.log(`[ONNX] Loading ${model.name} from:`, model.config.modelUrl)

    const session = await ort.InferenceSession.create(model.config.modelUrl, {
      executionProviders: ['webgl', 'wasm'],
      graphOptimizationLevel: 'all',
    })

    sessions.set(modelId, session)
    activeModelId = modelId

    console.log(`[ONNX] ${model.name} loaded successfully`)
    console.log('[ONNX] Input names:', session.inputNames)
    console.log('[ONNX] Output names:', session.outputNames)

    return session
  } catch (error) {
    console.error(`[ONNX] Failed to load ${model.name}:`, error)
    throw new Error(`Failed to load ${model.name}: ${error}`)
  }
}

/**
 * Run inference on preprocessed tensor
 * @param inputTensor Preprocessed image tensor
 * @param modelId Optional model ID (uses active model if not specified)
 * @returns Alpha mask tensor
 */
export async function runInference(
  inputTensor: ort.Tensor,
  modelId?: string
): Promise<ort.Tensor> {
  const targetModelId = modelId || activeModelId

  if (!targetModelId) {
    throw new Error('No model selected. Call loadBackgroundRemovalModel first.')
  }

  const session = sessions.get(targetModelId)
  if (!session) {
    throw new Error(
      `Model ${targetModelId} not loaded. Call loadBackgroundRemovalModel('${targetModelId}') first.`
    )
  }

  try {
    const feeds: Record<string, ort.Tensor> = {}
    feeds[session.inputNames[0]] = inputTensor

    const results = await session.run(feeds)

    // Get the output (alpha mask)
    const outputName = session.outputNames[0]
    const output = results[outputName]

    return output
  } catch (error) {
    console.error('[ONNX] Inference failed:', error)
    throw error
  }
}

/**
 * Release a specific model session
 */
export function releaseModel(modelId: string): void {
  const session = sessions.get(modelId)
  if (session) {
    session.release()
    sessions.delete(modelId)
    console.log(`[ONNX] Released model ${modelId}`)

    if (activeModelId === modelId) {
      activeModelId = null
    }
  }
}

/**
 * Release all model sessions
 */
export function releaseAllModels(): void {
  sessions.forEach((session, modelId) => {
    session.release()
    console.log(`[ONNX] Released model ${modelId}`)
  })
  sessions.clear()
  activeModelId = null
}

/**
 * Check if a model is loaded
 */
export function isModelLoaded(modelId?: string): boolean {
  if (modelId) {
    return sessions.has(modelId)
  }
  return activeModelId !== null
}

/**
 * Switch active model
 */
export async function switchModel(modelId: string): Promise<ort.InferenceSession> {
  if (activeModelId === modelId && sessions.has(modelId)) {
    console.log(`[ONNX] Model ${modelId} is already active`)
    return sessions.get(modelId)!
  }

  return await loadBackgroundRemovalModel(modelId)
}

/**
 * Get loaded models info
 */
export function getLoadedModels(): string[] {
  return Array.from(sessions.keys())
}
