/**
 * QR Generator Fallback Implementation
 * Used when WASM module is not available or during development
 *
 * This provides the same interface as qrGeneratorWasm.ts but uses
 * JavaScript libraries (qrcode npm package) as a fallback.
 */

import QRCode from 'qrcode'
import bwipjs from 'bwip-js'

// Re-export types from the WASM module
export * from './qrGeneratorWasm'

import {
  QRVariant,
  ErrorCorrection,
  OutputFormat,
  type GenerateOptions,
  QR_VARIANT_INFO,
} from './qrGeneratorWasm'

// Module state
let isInitialized = false

/**
 * Initialize (no-op for fallback)
 */
export async function initQRGenerator(): Promise<void> {
  if (isInitialized) return
  isInitialized = true
}

/**
 * Get version info
 */
export function getVersion(): string {
  return 'QR Generator JavaScript Fallback v1.0.0 (using qrcode npm)'
}

/**
 * Generate a QR/barcode using JavaScript fallback
 *
 * Supports 25+ barcode formats via bwip-js library
 */
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

  // Convert error correction enum to string
  const eccLevel = ['L', 'M', 'Q', 'H'][ecc] as any

  try {
    switch (variant) {
      // === Standard QR & Micro (use qrcode library) ===
      case QRVariant.STANDARD:
        if (format === OutputFormat.SVG) {
          return await QRCode.toString(text, {
            type: 'svg',
            width: size,
            margin,
            errorCorrectionLevel: eccLevel,
          })
        } else {
          const canvas = document.createElement('canvas')
          await QRCode.toCanvas(canvas, text, {
            width: size,
            margin,
            errorCorrectionLevel: eccLevel,
          })
          return canvas.toDataURL('image/png')
        }

      case QRVariant.MICRO: {
        if (text.length > 35) {
          throw new Error('Micro QR max capacity is 35 characters')
        }
        const microSize = Math.min(size, 128)
        if (format === OutputFormat.SVG) {
          return await QRCode.toString(text, {
            type: 'svg',
            width: microSize,
            margin: margin > 0 ? margin : 1,
            errorCorrectionLevel: 'L',
          })
        } else {
          const canvas = document.createElement('canvas')
          canvas.width = microSize
          canvas.height = microSize
          await QRCode.toCanvas(canvas, text, {
            width: microSize,
            margin: margin > 0 ? margin : 1,
            errorCorrectionLevel: 'L',
          })
          return canvas.toDataURL('image/png')
        }
      }

      // === All other variants use bwip-js ===
      default:
        return await generateBwipBarcode(text, variant, size, margin, format)
    }
  } catch (error) {
    console.error('[QR Fallback] Generation failed:', error)
    throw error
  }
}

/**
 * Generate barcode using bwip-js library
 * Handles 2D matrix codes: Aztec, DataMatrix, PDF417, MaxiCode
 */
async function generateBwipBarcode(
  text: string,
  variant: QRVariant,
  size: number,
  margin: number,
  format: OutputFormat
): Promise<string> {
  // Map QRVariant to bwip-js bcid (barcode identifier)
  const bcidMap: Partial<Record<QRVariant, string>> = {
    [QRVariant.AZTEC]: 'azteccode',
    [QRVariant.DATA_MATRIX]: 'datamatrix',
    [QRVariant.PDF417]: 'pdf417',
    [QRVariant.MAXICODE]: 'maxicode',
  }

  const bcid = bcidMap[variant]
  if (!bcid) {
    throw new Error(`${QR_VARIANT_INFO[variant].name} is not implemented`)
  }


  let barcodeSvg: string
  try {
    barcodeSvg = bwipjs.toSVG({
      bcid: bcid,
      text: text,
      scale: 3,
      includetext: false,
      rotate: 'N',
    })
  } catch (e) {
    console.error(`[QR Fallback] bwip-js ${QR_VARIANT_INFO[variant].name} generation failed:`, e)
    throw new Error(`${QR_VARIANT_INFO[variant].name} generation failed: ${e}`)
  }

  // Make SVG responsive (viewBox extracted but not needed for responsive design)
  const wrappedSvg = barcodeSvg.replace(
    /<svg/,
    `<svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet"`
  )

  if (format === OutputFormat.SVG) {
    return wrappedSvg
  } else {
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!

    const img = new Image()
    const svgBlob = new Blob([wrappedSvg], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)
    img.src = url

    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        try {
          ctx.drawImage(img, 0, 0, size, size)
          URL.revokeObjectURL(url)
          resolve()
        } catch (e) {
          reject(e)
        }
      }
      img.onerror = () => reject(new Error(`Failed to load ${QR_VARIANT_INFO[variant].name} SVG`))
    })

    return canvas.toDataURL('image/png')
  }
}

/**
 * Generate QR code as SVG
 */
export async function generateQRSvg(
  text: string,
  variant: QRVariant = QRVariant.STANDARD,
  options: Omit<GenerateOptions, 'format'> = {}
): Promise<string> {
  return generateQR(text, variant, { ...options, format: OutputFormat.SVG })
}

/**
 * Generate QR code as image data URL
 */
export async function generateQRImage(
  text: string,
  variant: QRVariant = QRVariant.STANDARD,
  options: Omit<GenerateOptions, 'format'> = {}
): Promise<string> {
  return generateQR(text, variant, { ...options, format: OutputFormat.PNG })
}

/**
 * Check if WASM is available
 */
export function isWASMSupported(): boolean {
  // In fallback mode, always return false
  return false
}

/**
 * Get recommended QR variant based on content length
 */
export function getRecommendedVariant(text: string): QRVariant {
  const len = text.length

  if (len <= 25) {
    return QRVariant.MICRO
  }

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
export function getSupportedVariants() {
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
