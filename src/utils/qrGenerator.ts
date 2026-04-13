/**
 * QR Generator - Unified Loader
 * Automatically detects and uses WASM when available, falls back to JavaScript
 *
 * This file:
 * 1. Tries to load the WASM module from /wasm/qr_generator.js
 * 2. If WASM loads successfully, uses it for all operations
 * 3. Falls back to JavaScript (qrcode npm package) if WASM fails
 */

// Re-export all types from the WASM module
export * from './qrGeneratorWasm'

import {
  QRVariant,
  ErrorCorrection,
  OutputFormat,
  type GenerateOptions,
  QR_VARIANT_INFO,
} from './qrGeneratorWasm'

// Import WASM interface
import * as QRWasm from './qrGeneratorWasm'
import { logger } from '@/utils/console'

// Import JavaScript fallback
import * as QRFallback from './qrGeneratorWasmFallback'

// Module state
let moduleType: 'wasm' | 'fallback' | 'none' = 'none'
let initPromise: Promise<void> | null = null

// Force fallback for non-standard variants (WASM implementation generates fake patterns)
const USE_WASM_FOR_VARIANTS = false

/**
 * Initialize QR Generator (auto-detects WASM availability)
 */
export async function initQRGenerator(): Promise<void> {
  if (moduleType !== 'none') {
    // Already initialized
    return
  }

  if (initPromise) {
    // Initialization in progress
    return initPromise
  }

  initPromise = (async () => {
    try {
      logger.wasm('[QR] Detecting WASM availability...')

      // Try to initialize WASM module
      await QRWasm.initQRGenerator()

      // WASM loaded successfully
      moduleType = 'wasm'
      logger.wasm('[QR] ✓ Using WASM module')
      logger.wasm('[QR] Version:', QRWasm.getVersion())
    } catch (error) {
      // WASM failed, use fallback
      console.warn('[QR] WASM not available, using fallback:', error)
      moduleType = 'fallback'
      await QRFallback.initQRGenerator()
      logger.wasm('[QR] ✓ Using JavaScript fallback')
      logger.wasm('[QR] Version:', QRFallback.getVersion())
    }
  })()

  return initPromise
}

/**
 * Get version info
 */
export function getVersion(): string {
  if (moduleType === 'wasm') {
    return QRWasm.getVersion()
  }
  return QRFallback.getVersion()
}

/**
 * Check if WASM is available
 */
export function isWASMSupported(): boolean {
  return moduleType === 'wasm'
}

/**
 * Get module type
 */
export function getModuleType(): 'wasm' | 'fallback' {
  return moduleType === 'none' ? 'fallback' : moduleType
}

/**
 * Generate a QR code (auto-selects WASM or fallback)
 */
export async function generateQR(
  text: string,
  variant: QRVariant = QRVariant.STANDARD,
  options: GenerateOptions = {}
): Promise<string> {
  await initQRGenerator()

  // Force fallback for non-standard variants (WASM implementation generates fake patterns)
  // Standard QR uses the qrcode npm library which works perfectly
  if (variant !== QRVariant.STANDARD && USE_WASM_FOR_VARIANTS === false) {
    logger.wasm('[QR] Using JavaScript fallback for', variant)
    return await QRFallback.generateQR(text, variant, options)
  }

  if (moduleType === 'wasm') {
    // Use WASM only for standard QR
    try {
      return await QRWasm.generateQR(text, variant, options)
    } catch (error) {
      console.warn('[QR] WASM generation failed, trying fallback:', error)
      // Fall back to JavaScript for this operation
      return await QRFallback.generateQR(text, variant, options)
    }
  } else {
    // Use JavaScript fallback
    return await QRFallback.generateQR(text, variant, options)
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
  return generateQR(text, variant, { ...options, format: OutputFormat.PPM })
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
  const normalized = name.toLowerCase().replace(/[_\-\s]/g, '')

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
