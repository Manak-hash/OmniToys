/**
 * QR Generator WASM Wrapper
 * Provides TypeScript-friendly interface to C++ WASM module
 *
 * Supported 2D Matrix Codes (via bwip-js):
 * - Standard QR Code (Model 2)
 * - Micro QR Code (compact, for small data)
 * - Aztec Code (concentric rings)
 * - DataMatrix (L-shaped finder pattern)
 * - PDF417 (stacked 2D barcode)
 * - MaxiCode (honeycomb pattern, UPS standard)
 */

// QR/barcode variants - 2D Matrix codes only
export enum QRVariant {
  STANDARD = 'standard',
  MICRO = 'micro',
  AZTEC = 'aztec',
  DATA_MATRIX = 'data-matrix',
  PDF417 = 'pdf417',
  MAXICODE = 'maxicode',
}

// Error correction levels
export enum ErrorCorrection {
  L = 0, // ~7% error correction
  M = 1, // ~15% error correction
  Q = 2, // ~25% error correction
  H = 3, // ~30% error correction
}

// Output formats
export enum OutputFormat {
  SVG = 0,
  PNG = 1, // Image data URL
  PPM = 2, // Portable Pixel Map (binary image)
  TERMINAL = 3, // ANSI terminal output
}

// QR variant capabilities
export interface QRVariantInfo {
  id: QRVariant
  name: string
  description: string
  maxSize: number // Maximum data capacity (bytes, approximate)
  modules: number // Number of modules (size)
  supportsECC: boolean
  icon: string
}

export const QR_VARIANT_INFO: Record<QRVariant, QRVariantInfo> = {
  [QRVariant.STANDARD]: {
    id: QRVariant.STANDARD,
    name: 'Standard QR',
    description: 'Classic QR Code Model 2 - Most widely supported',
    maxSize: 2953,
    modules: 177,
    supportsECC: true,
    icon: '■',
  },
  [QRVariant.MICRO]: {
    id: QRVariant.MICRO,
    name: 'Micro QR',
    description: 'Compact QR for small data (up to 35 characters)',
    maxSize: 35,
    modules: 17,
    supportsECC: true,
    icon: '▣',
  },
  [QRVariant.AZTEC]: {
    id: QRVariant.AZTEC,
    name: 'Aztec Code',
    description: 'Concentric ring pattern for high-density data',
    maxSize: 3000,
    modules: 151,
    supportsECC: true,
    icon: '◎',
  },
  [QRVariant.DATA_MATRIX]: {
    id: QRVariant.DATA_MATRIX,
    name: 'DataMatrix',
    description: 'L-shaped finder pattern for small items',
    maxSize: 1556,
    modules: 144,
    supportsECC: true,
    icon: '▥',
  },
  [QRVariant.PDF417]: {
    id: QRVariant.PDF417,
    name: 'PDF417',
    description: 'Stacked 2D barcode for IDs, boarding passes',
    maxSize: 2750,
    modules: 100,
    supportsECC: true,
    icon: '▦',
  },
  [QRVariant.MAXICODE]: {
    id: QRVariant.MAXICODE,
    name: 'MaxiCode',
    description: 'Honeycomb pattern - UPS shipping standard',
    maxSize: 150,
    modules: 90,
    supportsECC: true,
    icon: '◉',
  },
}

// Module state
let QRModule: any = null
let isInitialized = false
let initPromise: Promise<void> | null = null

/**
 * Initialize WASM module
 */
export async function initQRGenerator(): Promise<void> {
  if (isInitialized) {
    return
  }

  if (initPromise) {
    return initPromise
  }

  initPromise = (async () => {
    try {
      // Check if module script is already loaded
      if (!(window as any).QRGenerator) {
        // Load WASM module script
        console.log('[QR WASM] Loading module script...')

        // Create script element
        const script = document.createElement('script')
        script.id = 'qr-wasm-module'
        script.src = '/wasm/qr_generator.js'
        script.async = true

        // Wait for script to load
        await new Promise<void>((resolve, reject) => {
          script.onload = () => {
            console.log('[QR WASM] Script onload fired')
            resolve()
          }
          script.onerror = (e) => {
            console.error('[QR WASM] Script onerror:', e)
            reject(new Error('Failed to load QR WASM script'))
          }
          document.body.appendChild(script)
        })

        console.log('[QR WASM] Script loaded, QRGenerator exists:', typeof (window as any).QRGenerator)
      } else {
        console.log('[QR WASM] Script already loaded')
      }

      // Call the modularized function and wait for it to resolve
      console.log('[QR WASM] Initializing module...')
      const QRGeneratorFunc = (window as any).QRGenerator

      console.log('[QR WASM] QRGenerator type:', typeof QRGeneratorFunc)
      if (typeof QRGeneratorFunc !== 'function') {
        throw new Error('QRGenerator is not a function')
      }

      // The modularized module returns a Promise that resolves to the Module
      console.log('[QR WASM] Calling QRGenerator()...')

      // Add error handling for WASM loading
      QRModule = await QRGeneratorFunc().catch((err) => {
        console.error('[QR WASM] QRGenerator Promise rejected:', err)
        throw err
      })

      console.log('[QR WASM] Module received, type:', typeof QRModule)
      console.log('[QR WASM] Module keys (sample):', Object.keys(QRModule || {}).slice(0, 15))

      // Verify the module has the expected functions
      const expectedFuncs = ['_generate_qr', '_generate_micro_qr', '_generate_aztec', '_generate_data_matrix', '_get_version', '_free_memory', 'UTF8ToString']
      for (const func of expectedFuncs) {
        console.log(`[QR WASM] Function ${func} exists:`, typeof QRModule?.[func])
      }

      isInitialized = true
      console.log('[QR WASM] Module initialized successfully')
      console.log('[QR WASM] Version:', getVersion())
    } catch (error) {
      console.error('[QR WASM] Failed to initialize:', error)
      throw error
    }
  })()

  return initPromise
}

/**
 * Get WASM module version
 */
export function getVersion(): string {
  if (!isInitialized || !QRModule) {
    console.log('[QR WASM] getVersion: Not initialized', { isInitialized, hasModule: !!QRModule })
    return 'Not initialized'
  }
  try {
    console.log('[QR WASM] getVersion: Module keys:', Object.keys(QRModule).filter(k => !k.startsWith('_')).slice(0, 20))
    console.log('[QR WASM] getVersion: Calling get_version via ccall...')

    // Use ccall for proper string marshaling
    const version = QRModule.ccall(
      'get_version',
      'string',
      [],
      []
    )
    console.log('[QR WASM] getVersion: Version string =', version)

    return version
  } catch (e) {
    console.error('[QR WASM] getVersion error:', e)
    return `Error: ${e}`
  }
}

/**
 * Generate a QR code
 *
 * @param text - Content to encode
 * @param variant - QR code variant
 * @param options - Generation options
 * @returns SVG string or PPM binary data
 */
export interface GenerateOptions {
  size?: number // Output size in pixels (default: 256)
  margin?: number // Quiet zone margin (default: 2)
  ecc?: ErrorCorrection // Error correction level (default: M)
  format?: OutputFormat // Output format (default: SVG)
}

export async function generateQR(
  text: string,
  variant: QRVariant = QRVariant.STANDARD,
  options: GenerateOptions = {}
): Promise<string> {
  await initQRGenerator()

  if (!text || text.trim().length === 0) {
    throw new Error('Cannot generate QR code from empty text')
  }

  const {
    size = 256,
    margin = 2,
    ecc = ErrorCorrection.M,
    format = OutputFormat.SVG,
  } = options

  console.log('[QR WASM] generateQR called with:', { text, variant, size, margin, ecc, format })

  try {
    let result: string

    // Verify module has required functions
    if (!QRModule || typeof QRModule.ccall !== 'function') {
      throw new Error('WASM module not properly loaded - ccall missing')
    }

    // Use ccall for proper string marshaling
    switch (variant) {
      case QRVariant.MICRO:
        console.log('[QR WASM] Calling generate_micro_qr via ccall')
        result = QRModule.ccall(
          'generate_micro_qr',
          'string',
          ['string', 'number', 'number', 'number'],
          [text, size, margin, format]
        )
        break

      case QRVariant.AZTEC:
        console.log('[QR WASM] Calling generate_aztec via ccall')
        result = QRModule.ccall(
          'generate_aztec',
          'string',
          ['string', 'number', 'number', 'number', 'number'],
          [text, ecc, size, margin, format]
        )
        break

      case QRVariant.DATA_MATRIX:
        console.log('[QR WASM] Calling generate_data_matrix via ccall')
        result = QRModule.ccall(
          'generate_data_matrix',
          'string',
          ['string', 'number', 'number', 'number'],
          [text, size, margin, format]
        )
        break

      case QRVariant.STANDARD:
      default:
        console.log('[QR WASM] Calling generate_qr via ccall')
        result = QRModule.ccall(
          'generate_qr',
          'string',
          ['string', 'number', 'number', 'number', 'number'],
          [text, ecc, size, margin, format]
        )
        break
    }

    console.log('[QR WASM] Result string length:', result.length, 'first 100 chars:', result.substring(0, 100))

    // Check for errors
    if (result.startsWith('Error:')) {
      throw new Error(result)
    }

    return result
  } catch (error) {
    console.error('[QR WASM] Generation failed:', error)
    throw error
  }
}

/**
 * Generate QR code as SVG (default)
 */
export async function generateQRSvg(
  text: string,
  variant: QRVariant = QRVariant.STANDARD,
  options: Omit<GenerateOptions, 'format'> = {}
): Promise<string> {
  return generateQR(text, variant, { ...options, format: OutputFormat.SVG })
}

/**
 * Generate QR code as image data URL (PNG)
 * Gets SVG from WASM then converts to PNG using canvas
 */
export async function generateQRImage(
  text: string,
  variant: QRVariant = QRVariant.STANDARD,
  options: Omit<GenerateOptions, 'format'> = {}
): Promise<string> {
  const svgData = await generateQR(text, variant, { ...options, format: OutputFormat.SVG })

  // Convert SVG to PNG using canvas
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const img = new Image()

  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)

  await new Promise<void>((resolve, reject) => {
    img.onload = () => {
      canvas.width = img.width || 256
      canvas.height = img.height || 256
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
      resolve()
    }
    img.onerror = reject
    img.src = url
  })

  return canvas.toDataURL('image/png')
}

/**
 * Check if WASM is available
 */
export function isWASMSupported(): boolean {
  try {
    return typeof WebAssembly === 'object' && WebAssembly.validate instanceof Function
  } catch {
    return false
  }
}

/**
 * Get recommended QR variant based on content length
 */
export function getRecommendedVariant(text: string): QRVariant {
  const len = text.length

  // Use Micro QR for very short content
  if (len <= 25) {
    return QRVariant.MICRO
  }

  // Use DataMatrix for medium content
  if (len <= 200) {
    return QRVariant.DATA_MATRIX
  }

  // Use Standard QR for everything else
  return QRVariant.STANDARD
}

/**
 * Get QR variant by name
 */
export function getVariantByName(name: string): QRVariant | null {
  const normalized = name.toLowerCase().replace(/[_-\s]/g, '')

  for (const [key, info] of Object.entries(QR_VARIANT_INFO)) {
    const infoName = info.name.toLowerCase().replace(/\s/g, '')
    if (infoName.includes(normalized) || normalized.includes(infoName)) {
      return key as QRVariant
    }
  }

  return null
}

/**
 * Get all supported variants
 */
export function getSupportedVariants(): QRVariantInfo[] {
  return Object.values(QR_VARIANT_INFO)
}

/**
 * Convert ECC level string to enum
 */
export function parseECCLevel(level: string): ErrorCorrection {
  switch (level.toUpperCase()) {
    case 'L':
      return ErrorCorrection.L
    case 'M':
      return ErrorCorrection.M
    case 'Q':
      return ErrorCorrection.Q
    case 'H':
      return ErrorCorrection.H
    default:
      return ErrorCorrection.M
  }
}
