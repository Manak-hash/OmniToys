import { useState, useCallback, useMemo } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { InputPane } from '@/components/tools/InputPane'
import { OutputPane } from '@/components/tools/OutputPane'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { Eye, Palette, Copy, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

// Color utility functions
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')
}

const getLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    val = val / 255
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

const getContrastRatio = (color1: string, color2: string): number => {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)
  if (!rgb1 || !rgb2) return 0

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b)
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b)

  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)

  return (lighter + 0.05) / (darker + 0.05)
}

type Level = 'AAA' | 'AA' | 'Fail'

const checkPass = (ratio: number, size: 'normal' | 'large'): Level => {
  if (size === 'large') {
    if (ratio >= 4.5) return 'AAA'
    if (ratio >= 3) return 'AA'
  } else {
    if (ratio >= 7) return 'AAA'
    if (ratio >= 4.5) return 'AA'
  }
  return 'Fail'
}

export default function ColorPickerPage() {
  const [foregroundColor, setForegroundColor] = useState('#ffffff')
  const [backgroundColor, setBackgroundColor] = useState('#1a1a2e')

  // Derive RGB from hex colors
  const fgRgb = useMemo(() => {
    const rgb = hexToRgb(foregroundColor)
    return rgb || { r: 255, g: 255, b: 255 }
  }, [foregroundColor])

  const bgRgb = useMemo(() => {
    const rgb = hexToRgb(backgroundColor)
    return rgb || { r: 26, g: 26, b: 46 }
  }, [backgroundColor])

  const contrastRatio = getContrastRatio(foregroundColor, backgroundColor)
  const normalTextResult = checkPass(contrastRatio, 'normal')
  const largeTextResult = checkPass(contrastRatio, 'large')
  const uiComponentResult = checkPass(contrastRatio, 'normal')

  // Copy color to clipboard
  const copyColor = useCallback((color: string, name: string) => {
    navigator.clipboard.writeText(color)
    toast.success(`${name} copied: ${color}`)
  }, [])

  return (
    <ToolLayout
      title="Color Picker & Contrast Checker"
      description="Check WCAG accessibility compliance with live contrast ratio calculations"
      icon={<Eye className="w-8 h-8" />}
      actions={<ActionToolbar onReset={() => { setForegroundColor('#ffffff'); setBackgroundColor('#1a1a2e') }} />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-[500px]">
        {/* Color Pickers Panel */}
        <InputPane title="Colors">
          <div className="flex flex-col h-full p-6 gap-6">
            {/* Foreground Color */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-omni-text/50 uppercase tracking-widest">Foreground (Text)</label>
              <div className="flex gap-3">
                <div className="relative">
                  <input
                    type="color"
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className="w-20 h-20 rounded-xl cursor-pointer border-2 border-omni-text/10 hover:border-omni-primary/30 transition-colors"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={foregroundColor}
                      onChange={(e) => setForegroundColor(e.target.value)}
                      className="flex-1 px-3 py-2 bg-omni-text/5 border border-omni-text/10 rounded-lg font-mono text-sm text-omni-text focus:outline-none focus:border-omni-primary/30 uppercase"
                      placeholder="#FFFFFF"
                    />
                    <button
                      onClick={() => copyColor(foregroundColor, 'Foreground')}
                      className="px-3 py-2 bg-omni-text/5 hover:bg-omni-text/10 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4 text-omni-text/50" />
                    </button>
                  </div>
                  <div className="text-xs text-omni-text/50 font-mono">
                    rgb({fgRgb.r}, {fgRgb.g}, {fgRgb.b})
                  </div>
                </div>
              </div>

              {/* RGB Sliders */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-red-400 w-4">R</span>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={fgRgb.r}
                    onChange={(e) => setForegroundColor(rgbToHex(Number(e.target.value), fgRgb.g, fgRgb.b))}
                    className="flex-1 h-2 bg-red-500/20 rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                  <span className="text-xs font-mono text-omni-text/50 w-8">{fgRgb.r}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-green-400 w-4">G</span>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={fgRgb.g}
                    onChange={(e) => setForegroundColor(rgbToHex(fgRgb.r, Number(e.target.value), fgRgb.b))}
                    className="flex-1 h-2 bg-green-500/20 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                  <span className="text-xs font-mono text-omni-text/50 w-8">{fgRgb.g}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-400 w-4">B</span>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={fgRgb.b}
                    onChange={(e) => setForegroundColor(rgbToHex(fgRgb.r, fgRgb.g, Number(e.target.value)))}
                    className="flex-1 h-2 bg-blue-500/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <span className="text-xs font-mono text-omni-text/50 w-8">{fgRgb.b}</span>
                </div>
              </div>
            </div>

            {/* Background Color */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-omni-text/50 uppercase tracking-widest">Background</label>
              <div className="flex gap-3">
                <div className="relative">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-20 h-20 rounded-xl cursor-pointer border-2 border-omni-text/10 hover:border-omni-primary/30 transition-colors"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="flex-1 px-3 py-2 bg-omni-text/5 border border-omni-text/10 rounded-lg font-mono text-sm text-omni-text focus:outline-none focus:border-omni-primary/30 uppercase"
                      placeholder="#1A1A2E"
                    />
                    <button
                      onClick={() => copyColor(backgroundColor, 'Background')}
                      className="px-3 py-2 bg-omni-text/5 hover:bg-omni-text/10 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4 text-omni-text/50" />
                    </button>
                  </div>
                  <div className="text-xs text-omni-text/50 font-mono">
                    rgb({bgRgb.r}, {bgRgb.g}, {bgRgb.b})
                  </div>
                </div>
              </div>

              {/* RGB Sliders */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-red-400 w-4">R</span>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={bgRgb.r}
                    onChange={(e) => setBackgroundColor(rgbToHex(Number(e.target.value), bgRgb.g, bgRgb.b))}
                    className="flex-1 h-2 bg-red-500/20 rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                  <span className="text-xs font-mono text-omni-text/50 w-8">{bgRgb.r}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-green-400 w-4">G</span>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={bgRgb.g}
                    onChange={(e) => setBackgroundColor(rgbToHex(bgRgb.r, Number(e.target.value), bgRgb.b))}
                    className="flex-1 h-2 bg-green-500/20 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                  <span className="text-xs font-mono text-omni-text/50 w-8">{bgRgb.g}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-400 w-4">B</span>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={bgRgb.b}
                    onChange={(e) => setBackgroundColor(rgbToHex(bgRgb.r, bgRgb.g, Number(e.target.value)))}
                    className="flex-1 h-2 bg-blue-500/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <span className="text-xs font-mono text-omni-text/50 w-8">{bgRgb.b}</span>
                </div>
              </div>
            </div>

            {/* Swap Colors Button */}
            <button
              onClick={() => {
                setForegroundColor(backgroundColor)
                setBackgroundColor(foregroundColor)
              }}
              className="w-full py-3 bg-omni-text/5 hover:bg-omni-text/10 text-omni-text rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2"
            >
              <Palette className="w-4 h-4" /> Swap Colors
            </button>
          </div>
        </InputPane>

        {/* Accessibility Results Panel */}
        <OutputPane title="Accessibility Results">
          <div className="flex flex-col h-full">
            {/* Contrast Ratio Display */}
            <div className="p-6 border-b border-omni-text/5">
              <div className="text-center">
                <div className="text-xs text-omni-text/50 uppercase tracking-widest mb-2">Contrast Ratio</div>
                <div className="text-5xl font-black text-omni-primary mb-2">
                  {contrastRatio.toFixed(2)}:1
                </div>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
                  contrastRatio >= 7 ? 'bg-green-500/20 text-green-400' :
                  contrastRatio >= 4.5 ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {contrastRatio >= 7 ? <CheckCircle className="w-4 h-4" /> :
                   contrastRatio >= 4.5 ? <AlertCircle className="w-4 h-4" /> :
                   <XCircle className="w-4 h-4" />}
                  {contrastRatio >= 7 ? 'Excellent' : contrastRatio >= 4.5 ? 'Good' : 'Poor'}
                </div>
              </div>
            </div>

            {/* WCAG Compliance */}
            <div className="flex-1 p-6 space-y-4 overflow-auto">
              <h3 className="text-xs font-bold text-omni-text/50 uppercase tracking-widest">WCAG 2.1 Compliance</h3>

              {/* Normal Text */}
              <div className="glass-card p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-omni-text">Normal Text</span>
                  <span className="text-xs text-omni-text/50">&lt; 18pt (24px)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">AA (4.5:1)</span>
                  {renderResultBadge(normalTextResult)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">AAA (7:1)</span>
                  {renderResultBadge(normalTextResult === 'AAA' ? 'AAA' : 'Fail')}
                </div>
              </div>

              {/* Large Text */}
              <div className="glass-card p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-omni-text">Large Text</span>
                  <span className="text-xs text-omni-text/50">≥ 18pt (24px)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">AA (3:1)</span>
                  {renderResultBadge(largeTextResult)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">AAA (4.5:1)</span>
                  {renderResultBadge(largeTextResult === 'AAA' ? 'AAA' : largeTextResult === 'AA' ? 'Fail' : 'Fail')}
                </div>
              </div>

              {/* UI Components */}
              <div className="glass-card p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-omni-text">UI Components</span>
                  <span className="text-xs text-omni-text/50">Graphics, icons</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">AA (3:1)</span>
                  {renderResultBadge(uiComponentResult)}
                </div>
              </div>
            </div>

            {/* Live Preview */}
            <div className="p-6 border-t border-omni-text/5">
              <h3 className="text-xs font-bold text-omni-text/50 uppercase tracking-widest mb-3">Live Preview</h3>
              <div
                className="p-4 rounded-xl text-center"
                style={{
                  backgroundColor,
                  color: foregroundColor,
                }}
              >
                <p className="text-lg font-bold mb-2">Normal Text Example</p>
                <p className="text-sm">This is how normal body text appears with your selected colors.</p>
                <p className="text-2xl font-black mt-4">Large Text Example</p>
                <p className="text-xs mt-2 opacity-70">Small text example</p>
              </div>
            </div>
          </div>
        </OutputPane>
      </div>
    </ToolLayout>
  )
}

function renderResultBadge(result: Level) {
  if (result === 'AAA') {
    return (
      <span className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">
        <CheckCircle className="w-3 h-3" /> Pass
      </span>
    )
  }
  if (result === 'AA') {
    return (
      <span className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-bold">
        <CheckCircle className="w-3 h-3" /> Pass
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-bold">
      <XCircle className="w-3 h-3" /> Fail
    </span>
  )
}
