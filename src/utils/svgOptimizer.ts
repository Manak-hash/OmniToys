import { optimize } from 'svgo'

export interface SvgoOptions {
  removeComments: boolean
  removeMetadata: boolean
  minifyPaths: boolean
  removeDimensions: boolean
  prettyPrint: boolean
  precision: number
}

export interface OptimizationResult {
  optimized: string
  originalSize: number
  optimizedSize: number
  savings: number
  savingsPercent: string
  error?: string
}

const defaultOptions: SvgoOptions = {
  removeComments: true,
  removeMetadata: true,
  minifyPaths: true,
  removeDimensions: false,
  prettyPrint: false,
  precision: 3,
}

/**
 * Optimize SVG using SVGO v3
 */
export function optimizeSvg(svgString: string, options: Partial<SvgoOptions> = {}): OptimizationResult {
  const opts = { ...defaultOptions, ...options }

  if (!svgString.trim()) {
    return {
      optimized: '',
      originalSize: 0,
      optimizedSize: 0,
      savings: 0,
      savingsPercent: '0.0',
      error: 'Input is empty',
    }
  }

  try {
    // Use default SVGO plugins with multipass for better optimization
    const result = optimize(svgString, {
      multipass: true,
      js2svg: {
        pretty: opts.prettyPrint,
        indent: 2,
      },
    })

    const optimized = result.data
    const originalSize = new Blob([svgString]).size
    const optimizedSize = new Blob([optimized]).size
    const savings = originalSize - optimizedSize
    const savingsPercent = originalSize > 0 ? ((savings / originalSize) * 100).toFixed(2) : '0.00'

    return {
      optimized,
      originalSize,
      optimizedSize,
      savings,
      savingsPercent,
    }
  } catch (error) {
    return {
      optimized: svgString,
      originalSize: svgString.length,
      optimizedSize: svgString.length,
      savings: 0,
      savingsPercent: '0.00',
      error: error instanceof Error ? error.message : 'Optimization failed',
    }
  }
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
