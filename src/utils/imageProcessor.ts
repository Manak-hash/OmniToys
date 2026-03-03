import * as ort from 'onnxruntime-web'

/**
 * Resize image to target size while maintaining aspect ratio
 * @param image Source image
 * @param targetSize Target width/height
 * @returns Resized image with letterboxing
 */
function resizeImage(image: HTMLImageElement, targetSize: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = targetSize
  canvas.height = targetSize
  const ctx = canvas.getContext('2d')!

  // Calculate scaling to fit within target size
  const scale = Math.min(targetSize / image.width, targetSize / image.height)
  const scaledWidth = Math.floor(image.width * scale)
  const scaledHeight = Math.floor(image.height * scale)

  // Center the image
  const x = Math.floor((targetSize - scaledWidth) / 2)
  const y = Math.floor((targetSize - scaledHeight) / 2)

  // Fill with black (letterboxing)
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, targetSize, targetSize)

  // Draw resized image
  ctx.drawImage(image, x, y, scaledWidth, scaledHeight)

  return canvas
}

/**
 * Convert canvas to RGB tensor (normalized to [0, 1])
 * @param canvas Source canvas
 * @returns Float32Array tensor data [1, 3, 1024, 1024]
 */
export function imageToTensor(canvas: HTMLCanvasElement): ort.Tensor {
  const ctx = canvas.getContext('2d')!
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const { data, width, height } = imageData

  // Create Float32Array for normalized RGB values
  // Shape: [1, 3, height, width] - NCHW format
  const tensorData = new Float32Array(1 * 3 * height * width)

  for (let c = 0; c < 3; c++) {
    for (let h = 0; h < height; h++) {
      for (let w = 0; w < width; w++) {
        const pixelIndex = (h * width + w) * 4
        const value = data[pixelIndex + c] // R, G, or B

        // Normalize to [0, 1]
        const normalized = value / 255.0

        // Calculate tensor index for NCHW format
        const tensorIndex = c * (height * width) + h * width + w
        tensorData[tensorIndex] = normalized
      }
    }
  }

  return new ort.Tensor('float32', tensorData, [1, 3, height, width])
}

/**
 * Load image from file or URL
 * @param source File object or data URL
 * @returns HTMLImageElement
 */
export async function loadImage(source: File | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image'))

    if (typeof source === 'string') {
      img.src = source
    } else {
      const url = URL.createObjectURL(source)
      img.src = url
      // Cleanup object URL after image loads
      img.onload = () => {
        URL.revokeObjectURL(url)
        resolve(img)
      }
    }
  })
}

/**
 * Preprocess image for model input
 * @param image Source image
 * @param targetSize Model input size (default 1024)
 * @returns Object with canvas and tensor
 */
export async function preprocessImage(
  image: HTMLImageElement,
  targetSize = 1024
): Promise<{ canvas: HTMLCanvasElement; tensor: ort.Tensor }> {
  // Resize image
  const canvas = resizeImage(image, targetSize)

  // Convert to tensor
  const tensor = imageToTensor(canvas)

  return { canvas, tensor }
}

/**
 * Apply alpha mask to original image with optional controls
 * @param originalImage Original HTML image element
 * @param mask Alpha mask tensor (output from model)
 * @param controls Optional mask processing controls
 * @returns Data URL of processed image
 */
export async function applyMask(
  originalImage: HTMLImageElement,
  mask: ort.Tensor,
  controls?: {
    threshold?: number // 0-100, default 50
    featherEdges?: boolean // default true
    featherRadius?: number // 1-10px, default 2
  }
): Promise<string> {
  const threshold = controls?.threshold ?? 50
  const featherEdges = controls?.featherEdges ?? true
  const featherRadius = controls?.featherRadius ?? 2

  let maskData = new Float32Array(mask.data as Float32Array)
  const maskSize = mask.dims[2] // Should be 1024

  // Apply threshold
  const thresholdValue = threshold / 100
  for (let i = 0; i < maskData.length; i++) {
    if (maskData[i] < thresholdValue) {
      maskData[i] = 0
    }
  }

  // Apply edge feathering if enabled
  if (featherEdges && featherRadius > 0) {
    const feathered = applyFeathering(maskData, maskSize, featherRadius)
    maskData = new Float32Array(feathered)
  }

  // Create canvas for output
  const outputCanvas = document.createElement('canvas')
  outputCanvas.width = maskSize
  outputCanvas.height = maskSize
  const ctx = outputCanvas.getContext('2d')!

  // Draw resized original image
  const resizedOriginal = resizeImage(originalImage, maskSize)
  const originalCtx = resizedOriginal.getContext('2d')!
  const originalImageData = originalCtx.getImageData(0, 0, maskSize, maskSize)

  // Create new image data with alpha channel
  const outputImageData = ctx.createImageData(maskSize, maskSize)

  for (let i = 0; i < maskData.length; i++) {
    const pixelIndex = i * 4

    // Copy RGB from original
    outputImageData.data[pixelIndex] = originalImageData.data[pixelIndex] // R
    outputImageData.data[pixelIndex + 1] = originalImageData.data[pixelIndex + 1] // G
    outputImageData.data[pixelIndex + 2] = originalImageData.data[pixelIndex + 2] // B

    // Set alpha from mask (mask values are 0-1, convert to 0-255)
    const alphaValue = maskData[i] * 255
    outputImageData.data[pixelIndex + 3] = alphaValue // A
  }

  // Draw output image data
  ctx.putImageData(outputImageData, 0, 0)

  return outputCanvas.toDataURL('image/png')
}

/**
 * Apply Gaussian blur feathering to mask edges
 * @param maskData Mask data array
 * @param size Mask size (width/height)
 * @param radius Blur radius in pixels
 * @returns Feathered mask data
 */
function applyFeathering(maskData: Float32Array, size: number, radius: number): Float32Array {
  const result = new Float32Array(maskData)
  const kernel = generateGaussianKernel(radius)
  const kernelSize = kernel.length
  const half = Math.floor(kernelSize / 2)

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let sum = 0
      let weightSum = 0

      for (let ky = 0; ky < kernelSize; ky++) {
        for (let kx = 0; kx < kernelSize; kx++) {
          const px = x + kx - half
          const py = y + ky - half

          if (px >= 0 && px < size && py >= 0 && py < size) {
            const idx = py * size + px
            const weight = kernel[ky] * kernel[kx]
            sum += maskData[idx] * weight
            weightSum += weight
          }
        }
      }

      if (weightSum > 0) {
        result[y * size + x] = sum / weightSum
      }
    }
  }

  return result
}

/**
 * Generate 1D Gaussian kernel for blur
 * @param radius Blur radius
 * @returns Kernel array
 */
function generateGaussianKernel(radius: number): number[] {
  const size = radius * 2 + 1
  const kernel: number[] = []
  const sigma = radius / 3
  const twoSigmaSquare = 2 * sigma * sigma

  let sum = 0
  for (let i = 0; i < size; i++) {
    const x = i - radius
    const value = Math.exp(-(x * x) / twoSigmaSquare)
    kernel.push(value)
    sum += value
  }

  // Normalize
  return kernel.map((v) => v / sum)
}

/**
 * Create preview of the mask (for debugging/visualization)
 * @param mask Alpha mask tensor
 * @returns Data URL of mask visualization
 */
export function visualizeMask(mask: ort.Tensor): string {
  const maskData = mask.data as Float32Array
  const size = mask.dims[2]

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const imageData = ctx.createImageData(size, size)

  for (let i = 0; i < maskData.length; i++) {
    const pixelIndex = i * 4
    const value = Math.floor(maskData[i] * 255)

    // Grayscale visualization
    imageData.data[pixelIndex] = value // R
    imageData.data[pixelIndex + 1] = value // G
    imageData.data[pixelIndex + 2] = value // B
    imageData.data[pixelIndex + 3] = 255 // A
  }

  ctx.putImageData(imageData, 0, 0)
  return canvas.toDataURL('image/png')
}
