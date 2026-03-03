import { useState, useCallback, useEffect } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { InputPane } from '@/components/tools/InputPane'
import { OutputPane } from '@/components/tools/OutputPane'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { Palette, Copy, Shuffle, Sun, Droplets, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

type HarmonyType = 'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'split'

// Convert hex to HSL
const hexToHsl = (hex: string): { h: number; s: number; l: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return { h: 0, s: 0, l: 0 }

  let r = parseInt(result[1], 16) / 255
  let g = parseInt(result[2], 16) / 255
  let b = parseInt(result[3], 16) / 255

  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 }
}

// Convert HSL to hex
const hslToHex = (h: number, s: number, l: number): string => {
  s /= 100
  l /= 100

  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0, g = 0, b = 0

  if (0 <= h && h < 60) { r = c; g = x; b = 0 }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0 }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c }
  else if (300 <= h && h < 360) { r = c; g = 0; b = x }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

// Generate color harmony
const generateHarmony = (baseColor: string, type: HarmonyType): string[] => {
  const hsl = hexToHsl(baseColor)
  const colors: string[] = [baseColor]

  switch (type) {
    case 'monochromatic':
      // Already handled by scale generation
      return [baseColor]
    case 'analogous':
      colors.push(hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l))
      colors.push(hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l))
      break
    case 'complementary':
      colors.push(hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l))
      break
    case 'triadic':
      colors.push(hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l))
      colors.push(hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l))
      break
    case 'split':
      colors.push(hslToHex((hsl.h + 150) % 360, hsl.s, hsl.l))
      colors.push(hslToHex((hsl.h + 210) % 360, hsl.s, hsl.l))
      break
  }

  return colors
}

// Generate Tailwind color scale with saturation and brightness adjustments
const generateTailwindScale = (
  baseColor: string,
  saturationBoost: number = 0,
  brightnessOffset: number = 0
): Record<number, string> => {
  const hsl = hexToHsl(baseColor)

  // Adjust saturation and brightness
  const adjustedS = Math.min(100, Math.max(0, hsl.s + saturationBoost))
  const adjustedL = Math.min(100, Math.max(0, hsl.l + brightnessOffset))

  // Tailwind scale with lightness adjustments
  const scales: Record<number, number> = {
    50: 98,
    100: 94,
    200: 86,
    300: 77,
    400: 66,
    500: adjustedL, // Base color
    600: adjustedL * 0.85,
    700: adjustedL * 0.70,
    800: adjustedL * 0.55,
    900: adjustedL * 0.40,
    950: adjustedL * 0.25,
  }

  const palette: Record<number, string> = {}
  for (const [step, lightness] of Object.entries(scales)) {
    // Boost saturation for lighter shades, reduce for darker
    const satMultiplier = Number(step) < 500
      ? 1 - ((500 - Number(step)) / 500) * 0.3
      : 1 - ((Number(step) - 500) / 500) * 0.2

    palette[Number(step)] = hslToHex(
      hsl.h,
      Math.max(0, adjustedS * satMultiplier),
      lightness
    )
  }

  return palette
}

const HARMONY_PRESETS: { type: HarmonyType; name: string; description: string }[] = [
  { type: 'monochromatic', name: 'Mono', description: 'Single hue variations' },
  { type: 'analogous', name: 'Analogous', description: 'Adjacent colors' },
  { type: 'complementary', name: 'Complementary', description: 'Opposite colors' },
  { type: 'triadic', name: 'Triadic', description: '3 evenly spaced' },
  { type: 'split', name: 'Split', description: 'Split complementary' },
]

const DEFAULT_COLOR = '#ef4444'

export default function TailwindPalettePage() {
  const [baseColor, setBaseColor] = useState(DEFAULT_COLOR)
  const [palette, setPalette] = useState<Record<number, string>>(generateTailwindScale(DEFAULT_COLOR))
  const [harmonyColors, setHarmonyColors] = useState<string[]>([DEFAULT_COLOR])
  const [colorName, setColorName] = useState('primary')
  const [exportFormat, setExportFormat] = useState<'css' | 'js' | 'tailwind'>('css')
  const [harmonyType, setHarmonyType] = useState<HarmonyType>('monochromatic')
  const [saturationBoost, setSaturationBoost] = useState(0)
  const [brightnessOffset, setBrightnessOffset] = useState(0)

  // Update palette when base color or adjustments change
  useEffect(() => {
    setPalette(generateTailwindScale(baseColor, saturationBoost, brightnessOffset))
    setHarmonyColors(generateHarmony(baseColor, harmonyType))
  }, [baseColor, saturationBoost, brightnessOffset, harmonyType])

  // Copy to clipboard
  const copyPalette = useCallback(() => {
    const code = generateExportCode()
    navigator.clipboard.writeText(code)
    toast.success('Palette copied to clipboard!')
  }, [exportFormat, palette, colorName])

  // Copy single color
  const copyColor = useCallback((color: string, step: number) => {
    navigator.clipboard.writeText(color)
    toast.success(`${color} (${step}) copied!`)
  }, [])

  // Random color
  const randomColor = useCallback(() => {
    const randomHex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
    setBaseColor(randomHex)
  }, [])

  // Apply harmony color
  const applyHarmonyColor = useCallback((color: string) => {
    setBaseColor(color)
  }, [])

  // Generate export code
  const generateExportCode = (): string => {
    if (exportFormat === 'css') {
      return `/* Tailwind Palette: ${colorName} */
:root {
  --color-${colorName}-50: ${palette[50]};
  --color-${colorName}-100: ${palette[100]};
  --color-${colorName}-200: ${palette[200]};
  --color-${colorName}-300: ${palette[300]};
  --color-${colorName}-400: ${palette[400]};
  --color-${colorName}-500: ${palette[500]};
  --color-${colorName}-600: ${palette[600]};
  --color-${colorName}-700: ${palette[700]};
  --color-${colorName}-800: ${palette[800]};
  --color-${colorName}-900: ${palette[900]};
  --color-${colorName}-950: ${palette[950]};
}`
    }

    if (exportFormat === 'js') {
      return `// Tailwind Palette: ${colorName}
export const ${colorName} = {
  50: '${palette[50]}',
  100: '${palette[100]}',
  200: '${palette[200]}',
  300: '${palette[300]}',
  400: '${palette[400]}',
  500: '${palette[500]}',
  600: '${palette[600]}',
  700: '${palette[700]}',
  800: '${palette[800]}',
  900: '${palette[900]}',
  950: '${palette[950]}',
}`
    }

    // tailwind.config.js format
    return `// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        ${colorName}: {
          50: '${palette[50]}',
          100: '${palette[100]}',
          200: '${palette[200]}',
          300: '${palette[300]}',
          400: '${palette[400]}',
          500: '${palette[500]}',
          600: '${palette[600]}',
          700: '${palette[700]}',
          800: '${palette[800]}',
          900: '${palette[900]}',
          950: '${palette[950]}',
        },
      },
    },
  },
}`
  }

  // Get text color based on background
  const getTextColor = (hex: string) => {
    const hsl = hexToHsl(hex)
    return hsl.l > 50 ? 'text-gray-900' : 'text-white'
  }

  return (
    <ToolLayout
      title="Tailwind Palette Master"
      description="Generate 50-950 color scales with harmony & adjustments"
      icon={<Palette className="w-8 h-8" />}
      actions={
        <ActionToolbar
          onReset={() => {
            setBaseColor(DEFAULT_COLOR)
            setColorName('primary')
            setSaturationBoost(0)
            setBrightnessOffset(0)
            setHarmonyType('monochromatic')
          }}
        />
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-[500px]">
        {/* Input Panel */}
        <InputPane title="Color Configuration">
          <div className="flex flex-col h-full p-6 gap-5 overflow-auto">
            {/* Color Picker */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Base Color</label>
              <div className="flex gap-3">
                <div className="relative">
                  <input
                    type="color"
                    value={baseColor}
                    onChange={(e) => setBaseColor(e.target.value)}
                    className="w-24 h-24 rounded-xl cursor-pointer border-2 border-omni-text/10 hover:border-omni-primary/30 transition-colors"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-center gap-3">
                  <input
                    type="text"
                    value={baseColor}
                    onChange={(e) => setBaseColor(e.target.value)}
                    className="w-full px-4 py-3 bg-omni-text/5 border border-omni-text/10 rounded-lg font-mono text-sm text-omni-text focus:outline-none focus:border-omni-primary/30 uppercase"
                    placeholder="#RRGGBB"
                  />
                  <button
                    onClick={randomColor}
                    className="w-full py-3 bg-omni-text/5 hover:bg-omni-text/10 text-omni-text rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2"
                  >
                    <Shuffle className="w-4 h-4" /> Random Color
                  </button>
                </div>
              </div>

              {/* HSL Values */}
              <div className="flex items-center gap-4 text-xs font-mono text-omni-text/50">
                <span>H: {Math.round(hexToHsl(baseColor).h)}°</span>
                <span>S: {Math.round(hexToHsl(baseColor).s)}%</span>
                <span>L: {Math.round(hexToHsl(baseColor).l)}%</span>
              </div>
            </div>

            {/* Color Harmony */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Color Harmony</label>
              <div className="grid grid-cols-5 gap-2">
                {HARMONY_PRESETS.map((preset) => (
                  <button
                    key={preset.type}
                    onClick={() => setHarmonyType(preset.type)}
                    className={`py-2 px-1 rounded-lg text-[10px] font-bold uppercase transition-all flex flex-col items-center gap-1 ${
                      harmonyType === preset.type
                        ? 'bg-omni-primary text-white'
                        : 'bg-omni-text/5 text-omni-text/50 hover:bg-omni-text/10'
                    }`}
                    title={preset.description}
                  >
                    <Sparkles className="w-3 h-3" /> {preset.name}
                  </button>
                ))}
              </div>

              {/* Harmony Colors */}
              {harmonyColors.length > 1 && (
                <div className="flex gap-2 mt-2">
                  {harmonyColors.map((color, i) => (
                    <button
                      key={i}
                      onClick={() => applyHarmonyColor(color)}
                      className={`flex-1 h-8 rounded-lg transition-transform hover:scale-105 ${
                        color === baseColor ? 'ring-2 ring-white ring-offset-2 ring-offset-omni-bg' : ''
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Adjustments */}
            <div className="space-y-4 p-4 bg-omni-text/5 rounded-xl">
              <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider flex items-center gap-2">
                <Sun className="w-3 h-3" /> Saturation Boost
              </label>
              <input
                type="range"
                min="-30"
                max="30"
                value={saturationBoost}
                onChange={(e) => setSaturationBoost(Number(e.target.value))}
                className="w-full h-2 bg-omni-text/10 rounded-lg appearance-none cursor-pointer accent-omni-primary"
              />
              <div className="flex justify-between text-xs text-omni-text/50">
                <span>-30%</span>
                <span className="font-mono">{saturationBoost > 0 ? '+' : ''}{saturationBoost}%</span>
                <span>+30%</span>
              </div>

              <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider flex items-center gap-2">
                <Droplets className="w-3 h-3" /> Brightness Offset
              </label>
              <input
                type="range"
                min="-20"
                max="20"
                value={brightnessOffset}
                onChange={(e) => setBrightnessOffset(Number(e.target.value))}
                className="w-full h-2 bg-omni-text/10 rounded-lg appearance-none cursor-pointer accent-omni-primary"
              />
              <div className="flex justify-between text-xs text-omni-text/50">
                <span>-20%</span>
                <span className="font-mono">{brightnessOffset > 0 ? '+' : ''}{brightnessOffset}%</span>
                <span>+20%</span>
              </div>
            </div>

            {/* Color Name */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Color Name</label>
              <input
                type="text"
                value={colorName}
                onChange={(e) => setColorName(e.target.value.replace(/[^a-z0-9-]/gi, '-'))}
                className="w-full px-4 py-3 bg-omni-text/5 border border-omni-text/10 rounded-lg text-sm text-omni-text focus:outline-none focus:border-omni-primary/30 font-mono"
                placeholder="primary"
              />
              <div className="text-xs text-omni-text/30">Use lowercase with hyphens for multi-word names</div>
            </div>

            {/* Export Format */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Export Format</label>
              <div className="grid grid-cols-3 gap-2">
                {(['css', 'js', 'tailwind'] as const).map((format) => (
                  <button
                    key={format}
                    onClick={() => setExportFormat(format)}
                    className={`py-3 rounded-lg text-xs font-bold uppercase transition-all ${
                      exportFormat === format
                        ? 'bg-omni-primary text-white'
                        : 'bg-omni-text/5 text-omni-text/50 hover:bg-omni-text/10'
                    }`}
                  >
                    {format === 'tailwind' ? 'ES Module' : format}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </InputPane>

        {/* Output Panel */}
        <OutputPane title="Generated Palette">
          <div className="flex flex-col h-full">
            {/* Palette Preview */}
            <div className="flex-1 overflow-auto p-6">
              <div className="grid grid-cols-11 gap-2 mb-6">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((step) => (
                  <div
                    key={step}
                    onClick={() => copyColor(palette[step], step)}
                    className="group cursor-pointer"
                  >
                    <div
                      className="aspect-square rounded-xl shadow-lg transition-transform group-hover:scale-105 flex items-center justify-center"
                      style={{ backgroundColor: palette[step] }}
                    >
                      <span className={`text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity ${getTextColor(palette[step])}`}>
                        {step}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Color Details Table */}
              <div className="space-y-2">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((step) => (
                  <div
                    key={step}
                    onClick={() => copyColor(palette[step], step)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-omni-text/5 cursor-pointer transition-colors group"
                  >
                    <div
                      className="w-16 h-10 rounded-lg shadow"
                      style={{ backgroundColor: palette[step] }}
                    />
                    <span className="w-12 text-xs font-mono text-omni-text/50">{step}</span>
                    <span className="flex-1 font-mono text-xs text-omni-text/70">{palette[step]}</span>
                    <span className="text-[10px] text-omni-text/30 opacity-0 group-hover:opacity-100 transition-opacity">Click to copy</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Code Preview */}
            <div className="border-t border-omni-text/5 max-h-48 overflow-auto">
              <div className="p-4 bg-black/40">
                <pre className="text-xs font-mono text-omni-text/70 whitespace-pre-wrap">{generateExportCode()}</pre>
              </div>
            </div>

            {/* Copy Button */}
            <div className="p-4 border-t border-omni-text/5">
              <button
                onClick={copyPalette}
                className="w-full py-3 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-omni-primary/20 flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" /> Copy Palette Code
              </button>
            </div>
          </div>
        </OutputPane>
      </div>
    </ToolLayout>
  )
}
