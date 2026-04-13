/**
 * Color accessibility utilities for theme system
 * Calculates contrast ratios and tests for colorblind safety
 */

/**
 * Calculate relative luminance of a color (WCAG 2.0 formula)
 */
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0

  const [r, g, b] = rgb.map(v => {
    v = v / 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })

  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Calculate contrast ratio between two colors (WCAG 2.0)
 */
export function calculateContrastRatio(foreground: string, background: string): number {
  const lum1 = getLuminance(foreground)
  const lum2 = getLuminance(background)
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Get WCAG compliance level from contrast ratio
 */
export function getWCALevel(ratio: number): 'AAA' | 'AA' | 'fail' {
  if (ratio >= 7.0) return 'AAA'
  if (ratio >= 4.5) return 'AA'
  return 'fail'
}

/**
 * Check if theme is safe for colorblind users
 */
export function isColorblindSafe(
  colors: { primary: string; bg: string; accent: string; success: string },
  type: 'deuteranopia' | 'protanopia' | 'tritanopia'
): boolean {
  // Simulate color vision deficiency
  const primarySim = simulateColorblind(colors.primary, type)
  const bgSim = simulateColorblind(colors.bg, type)
  const accentSim = simulateColorblind(colors.accent, type)

  // Check if colors remain distinguishable (delta-E > 10)
  const deltaPrimaryBg = deltaE(primarySim, bgSim)
  const deltaAccentBg = deltaE(accentSim, bgSim)

  return deltaPrimaryBg > 10 && deltaAccentBg > 10
}

/**
 * Convert hex to RGB array
 */
function hexToRgb(hex: string): [number, number, number] | null {
  // Handle shorthand hex
  if (hex.length === 4) {
    return [
      parseInt(hex[1] + hex[1], 16),
      parseInt(hex[2] + hex[2], 16),
      parseInt(hex[3] + hex[3], 16)
    ]
  }

  // Handle rgba format
  if (hex.startsWith('rgba')) {
    const match = hex.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    return match
      ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])]
      : null
  }

  // Handle standard hex
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : null
}

/**
 * Simulate color vision deficiency (simplified simulation)
 */
function simulateColorblind(hex: string, type: string): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex

  let [r, g, b] = rgb

  // Simplified simulation matrices for color vision deficiencies
  if (type === 'deuteranopia' || type === 'protanopia') {
    // Red-green color blindness: reduce red-green distinction
    // Use LMS color space simulation (simplified)
    const L = 0.31399022 * r + 0.63951294 * g + 0.04649755 * b
    // M = 0.15537241 * r + 0.75789446 * g + 0.08670142 * b // Unused in calculation
    const S = 0.01775239 * r + 0.10944209 * g + 0.87256922 * b

    // Simulate deuteranopia (M cone missing)
    if (type === 'deuteranopia') {
      const simL = L * 1.05118294
      const simM = L * 0.78471731
      const simS = S * 0.90426037

      // Convert back to RGB (simplified inverse)
      r = simL * 5.47221206 + simM * -4.22317425 + simS * 0.61797549
      g = simL * 1.93656687 + simM * 0.47678715 + simS * -0.07728546
      b = simL * -0.35674063 + simM * -0.39657557 + simS * 1.75026846
    } else {
      // Protanopia (L cone missing)
      const simL = L * 0.56728257
      const simM = L * 0.43343512
      const simS = S * 0.32465657

      r = simL * 5.47221206 + simM * -4.22317425 + simS * 0.61797549
      g = simL * 1.93656687 + simM * 0.47678715 + simS * -0.07728546
      b = simL * -0.35674063 + simM * -0.39657557 + simS * 1.75026846
    }
  } else if (type === 'tritanopia') {
    // Blue-yellow color blindness: reduce blue-yellow distinction
    const avg = (g + b) / 2
    b = avg
  }

  // Clamp values to valid RGB range
  r = Math.max(0, Math.min(255, r))
  g = Math.max(0, Math.min(255, g))
  b = Math.max(0, Math.min(255, b))

  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`
}

/**
 * Calculate Delta-E (color difference) - simplified Euclidean distance
 * For production, use CIELAB Delta-E 2000 for better accuracy
 */
function deltaE(color1: string, color2: string): number {
  const rgb1 = parseRgb(color1)
  const rgb2 = parseRgb(color2)

  if (!rgb1 || !rgb2) return 0

  const [r1, g1, b1] = rgb1
  const [r2, g2, b2] = rgb2

  return Math.sqrt(
    Math.pow(r2 - r1, 2) +
    Math.pow(g2 - g1, 2) +
    Math.pow(b2 - b1, 2)
  )
}

/**
 * Parse rgb() string to RGB array
 */
function parseRgb(rgb: string): [number, number, number] | null {
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  return match
    ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])]
    : null
}
