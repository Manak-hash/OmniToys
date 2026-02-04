export type ImageFormat = 'image/png' | 'image/jpeg' | 'image/webp' | 'image/avif'

export interface ConversionOptions {
  format: ImageFormat
  quality: number // 0-100
}

export interface ConversionResult {
  success: boolean
  result?: Blob
  error?: string
  originalSize?: number
  convertedSize?: number
  savings?: string
}

/**
 * Convert image to different format using Canvas API
 * Note: Squoosh lib has compatibility issues, so we're using native Canvas API
 * which provides similar functionality with better browser support.
 */
export async function convertImage(
  file: File,
  options: ConversionOptions
): Promise<ConversionResult> {
  if (!file) {
    return {
      success: false,
      error: 'No file provided',
    }
  }

  try {
    const originalSize = file.size

    // Load image
    const bitmap = await createImageBitmap(file)

    // Create canvas
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height

    // Draw image to canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Could not get canvas context')
    }

    ctx.drawImage(bitmap, 0, 0)

    // Convert to blob with specified format and quality
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        options.format,
        options.quality / 100
      )
    })

    if (!blob) {
      throw new Error('Conversion failed')
    }

    const convertedSize = blob.size
    const savings = originalSize > 0
      ? ((originalSize - convertedSize) / originalSize * 100).toFixed(1)
      : '0.0'

    return {
      success: true,
      result: blob,
      originalSize,
      convertedSize,
      savings,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Conversion failed',
    }
  }
}

/**
 * Batch convert multiple images
 */
export async function batchConvertImages(
  files: File[],
  options: ConversionOptions
): Promise<ConversionResult[]> {
  const results = await Promise.all(
    files.map(file => convertImage(file, options))
  )
  return results
}

/**
 * Get file extension from mime type
 */
export function getExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
    'image/avif': 'avif',
  }
  return extensions[mimeType] || 'png'
}

/**
 * Format bytes to human readable
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}
