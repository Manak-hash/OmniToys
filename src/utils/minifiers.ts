import { minify as terserMinify } from 'terser'
import CleanCSS from 'clean-css'
import { minify as htmlMinify } from 'html-minifier-terser'

export type MinifierType = 'javascript' | 'css' | 'html'

export interface MinifyOptions {
  javascript?: {
    mangle?: boolean
    compress?: boolean
    removeComments?: boolean
    ecma?: number
  }
  css?: {
    level?: 0 | 1 | 2
    compatibility?: '*'
  }
  html?: {
    collapseWhitespace?: boolean
    removeComments?: boolean
    removeAttributeQuotes?: boolean
    removeEmptyAttributes?: boolean
  }
}

export interface MinifyResult {
  success: boolean
  result?: string
  error?: string
  originalSize?: number
  minifiedSize?: number
  compressionRatio?: number
}

/**
 * Minify JavaScript using Terser
 */
export async function minifyJs(
  code: string,
  options: MinifyOptions['javascript'] = {}
): Promise<MinifyResult> {
  const originalSize = new Blob([code]).size

  if (!code.trim()) {
    return {
      success: false,
      error: 'Input is empty',
      originalSize: 0,
    }
  }

  try {
    const opts = {
      mangle: options.mangle ?? true,
      compress: options.compress ?? true,
      format: {
        comments: options.removeComments ? false : 'some' as const,
      },
      ecma: options.ecma ?? 2020 as any,
    }

    const result = await terserMinify(code, opts)

    if (!result.code) {
      throw new Error('Terser produced no output')
    }

    const minifiedSize = new Blob([result.code]).size
    const compressionRatio = ((originalSize - minifiedSize) / originalSize) * 100

    return {
      success: true,
      result: result.code,
      originalSize,
      minifiedSize,
      compressionRatio,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Minification failed',
      originalSize,
    }
  }
}

/**
 * Minify CSS using clean-css
 */
export function minifyCss(
  code: string,
  options: MinifyOptions['css'] = {}
): MinifyResult {
  const originalSize = new Blob([code]).size

  if (!code.trim()) {
    return {
      success: false,
      error: 'Input is empty',
      originalSize: 0,
    }
  }

  try {
    const cleanCss = new CleanCSS({
      level: options.level ?? 2,
      compatibility: options.compatibility ?? '*',
    })

    const result = cleanCss.minify(code)
    const minifiedSize = new Blob([result.styles]).size
    const compressionRatio = ((originalSize - minifiedSize) / originalSize) * 100

    return {
      success: true,
      result: result.styles,
      originalSize,
      minifiedSize,
      compressionRatio,
      error: result.errors.length > 0 ? result.errors.join(', ') : undefined,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Minification failed',
      originalSize,
    }
  }
}

/**
 * Minify HTML using html-minifier-terser
 */
export async function minifyHtml(
  code: string,
  options: MinifyOptions['html'] = {}
): Promise<MinifyResult> {
  const originalSize = new Blob([code]).size

  if (!code.trim()) {
    return {
      success: false,
      error: 'Input is empty',
      originalSize: 0,
    }
  }

  try {
    const opts = {
      collapseWhitespace: options.collapseWhitespace ?? true,
      removeComments: options.removeComments ?? true,
      removeAttributeQuotes: options.removeAttributeQuotes ?? true,
      removeEmptyAttributes: options.removeEmptyAttributes ?? true,
      minifyCSS: true,
      minifyJS: true,
    }

    const result = await htmlMinify(code, opts)
    const minifiedSize = new Blob([result]).size
    const compressionRatio = ((originalSize - minifiedSize) / originalSize) * 100

    return {
      success: true,
      result: result,
      originalSize,
      minifiedSize,
      compressionRatio,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Minification failed',
      originalSize,
    }
  }
}

/**
 * Minify based on type
 */
export async function minify(
  code: string,
  type: MinifierType,
  options?: MinifyOptions
): Promise<MinifyResult> {
  switch (type) {
    case 'javascript':
      return minifyJs(code, options?.javascript)
    case 'css':
      return minifyCss(code, options?.css)
    case 'html':
      return minifyHtml(code, options?.html)
    default:
      return {
        success: false,
        error: 'Unknown minifier type',
      }
  }
}

/**
 * Format bytes to human readable
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}
