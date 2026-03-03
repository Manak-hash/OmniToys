import { useState, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { PenTool, Copy, Download, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

type PatternType = 'grid' | 'dots' | 'lines' | 'zigzag' | 'circles' | 'triangles' | 'hexagons' | 'waves'

export default function SvgPatternPage() {
  const [svg, setSvg] = useState('')
  const [css, setCss] = useState('')
  const [patternType, setPatternType] = useState<PatternType>('grid')
  const [primaryColor, setPrimaryColor] = useState('#df1c26')
  const [secondaryColor, setSecondaryColor] = useState('#252826')
  const [size, setSize] = useState(20)
  const [strokeWidth, setStrokeWidth] = useState(2)

  const generatePattern = useCallback(() => {
    const sizeNum = parseInt(String(size))
    const stroke = parseInt(String(strokeWidth))
    const patternId = `pattern-${patternType}`

    let patternSvg = ''
    let previewSvg = ''

    switch (patternType) {
      case 'grid':
        patternSvg = `
          <svg width="${sizeNum}" height="${sizeNum}" xmlns="http://www.w3.org/2000/svg">
            <rect width="${sizeNum}" height="${sizeNum}" fill="none" stroke="${primaryColor}" stroke-width="${stroke}"/>
          </svg>
        `
        previewSvg = `
          <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="${patternId}" width="${sizeNum}" height="${sizeNum}" patternUnits="userSpaceOnUse">
                <rect width="${sizeNum}" height="${sizeNum}" fill="none" stroke="${primaryColor}" stroke-width="${stroke}"/>
              </pattern>
            </defs>
            <rect width="200" height="200" fill="url(#${patternId})" fill-opacity="0.3"/>
          </svg>
        `
        break

      case 'dots':
        patternSvg = `
          <svg width="${sizeNum}" height="${sizeNum}" xmlns="http://www.w3.org/2000/svg">
            <circle cx="${sizeNum/2}" cy="${sizeNum/2}" r="${stroke * 2}" fill="${primaryColor}"/>
          </svg>
        `
        previewSvg = `
          <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="${patternId}" width="${sizeNum}" height="${sizeNum}" patternUnits="userSpaceOnUse">
                <circle cx="${sizeNum/2}" cy="${sizeNum/2}" r="${stroke * 2}" fill="${primaryColor}"/>
              </pattern>
            </defs>
            <rect width="200" height="200" fill="url(#${patternId})" fill-opacity="0.5"/>
          </svg>
        `
        break

      case 'lines':
        patternSvg = `
          <svg width="${sizeNum}" height="${sizeNum}" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="${sizeNum/2}" x2="${sizeNum}" y2="${sizeNum/2}" stroke="${primaryColor}" stroke-width="${stroke}"/>
          </svg>
        `
        previewSvg = `
          <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="${patternId}" width="${sizeNum}" height="${sizeNum}" patternUnits="userSpaceOnUse">
                <line x1="0" y1="${sizeNum/2}" x2="${sizeNum}" y2="${sizeNum/2}" stroke="${primaryColor}" stroke-width="${stroke}"/>
              </pattern>
            </defs>
            <rect width="200" height="200" fill="url(#${patternId})" fill-opacity="0.3"/>
          </svg>
        `
        break

      case 'zigzag':
        const zigzag = `M0,${sizeNum/2} L${sizeNum/4},0 L${sizeNum*0.75},${sizeNum} L${sizeNum},${sizeNum/2}`
        patternSvg = `
          <svg width="${sizeNum}" height="${sizeNum}" xmlns="http://www.w3.org/2000/svg">
            <path d="${zigzag}" fill="none" stroke="${primaryColor}" stroke-width="${stroke}"/>
          </svg>
        `
        previewSvg = `
          <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="${patternId}" width="${sizeNum}" height="${sizeNum}" patternUnits="userSpaceOnUse">
                <path d="${zigzag}" fill="none" stroke="${primaryColor}" stroke-width="${stroke}"/>
              </pattern>
            </defs>
            <rect width="200" height="200" fill="url(#${patternId})" fill-opacity="0.3"/>
          </svg>
        `
        break

      case 'circles':
        patternSvg = `
          <svg width="${sizeNum * 2}" height="${sizeNum * 2}" xmlns="http://www.w3.org/2000/svg">
            <circle cx="${sizeNum}" cy="${sizeNum}" r="${sizeNum/2 - stroke}" fill="none" stroke="${primaryColor}" stroke-width="${stroke}"/>
            <circle cx="${sizeNum * 1.5}" cy="${sizeNum * 1.5}" r="${sizeNum/2 - stroke}" fill="${secondaryColor}" fill-opacity="0.3"/>
          </svg>
        `
        previewSvg = `
          <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="${patternId}" width="${sizeNum * 2}" height="${sizeNum * 2}" patternUnits="userSpaceOnUse">
                <circle cx="${sizeNum}" cy="${sizeNum}" r="${sizeNum/2 - stroke}" fill="none" stroke="${primaryColor}" stroke-width="${stroke}"/>
                <circle cx="${sizeNum * 1.5}" cy="${sizeNum * 1.5}" r="${sizeNum/2 - stroke}" fill="${secondaryColor}" fill-opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="200" height="200" fill="url(#${patternId})" fill-opacity="0.4"/>
          </svg>
        `
        break

      case 'triangles':
        const triangle = `M${sizeNum/2},0 L${sizeNum},${sizeNum} L0,${sizeNum} Z`
        patternSvg = `
          <svg width="${sizeNum}" height="${sizeNum}" xmlns="http://www.w3.org/2000/svg">
            <path d="${triangle}" fill="none" stroke="${primaryColor}" stroke-width="${stroke}"/>
          </svg>
        `
        previewSvg = `
          <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="${patternId}" width="${sizeNum}" height="${sizeNum}" patternUnits="userSpaceOnUse">
                <path d="${triangle}" fill="none" stroke="${primaryColor}" stroke-width="${stroke}"/>
              </pattern>
            </defs>
            <rect width="200" height="200" fill="url(#${patternId})" fill-opacity="0.3"/>
          </svg>
        `
        break

      case 'hexagons':
        const hexPoints = []
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i
          const x = sizeNum/2 + (sizeNum/2 - stroke) * Math.cos(angle)
          const y = sizeNum/2 + (sizeNum/2 - stroke) * Math.sin(angle)
          hexPoints.push(`${x},${y}`)
        }
        patternSvg = `
          <svg width="${sizeNum * 1.5}" height="${sizeNum}" xmlns="http://www.w3.org/2000/svg">
            <polygon points="${hexPoints.join(' ')}" fill="none" stroke="${primaryColor}" stroke-width="${stroke}"/>
          </svg>
        `
        previewSvg = `
          <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="${patternId}" width="${sizeNum * 1.5}" height="${sizeNum}" patternUnits="userSpaceOnUse">
                <polygon points="${hexPoints.join(' ')}" fill="none" stroke="${primaryColor}" stroke-width="${stroke}"/>
              </pattern>
            </defs>
            <rect width="200" height="200" fill="url(#${patternId})" fill-opacity="0.3"/>
          </svg>
        `
        break

      case 'waves':
        const wavePath = `M0,${sizeNum/2} Q${sizeNum/4},0 ${sizeNum/2},${sizeNum/2} T${sizeNum},${sizeNum/2}`
        patternSvg = `
          <svg width="${sizeNum}" height="${sizeNum}" xmlns="http://www.w3.org/2000/svg">
            <path d="${wavePath}" fill="none" stroke="${primaryColor}" stroke-width="${stroke}"/>
          </svg>
        `
        previewSvg = `
          <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="${patternId}" width="${sizeNum}" height="${sizeNum}" patternUnits="userSpaceOnUse">
                <path d="${wavePath}" fill="none" stroke="${primaryColor}" stroke-width="${stroke}"/>
              </pattern>
            </defs>
            <rect width="200" height="200" fill="url(#${patternId})" fill-opacity="0.3"/>
          </svg>
        `
        break
    }

    const cssCode = `.pattern-${patternType} {
  background-color: ${secondaryColor};
  background-image: url("data:image/svg+xml,%3Csvg width='${sizeNum}' height='${sizeNum}' xmlns='http://www.w3.org/2000/svg'%3E${encodeURIComponent(patternSvg.trim())}%3C/svg%3E");
}`

    setSvg(previewSvg.trim())
    setCss(cssCode)
  }, [patternType, primaryColor, secondaryColor, size, strokeWidth])

  const handleCopy = useCallback((type: 'svg' | 'css') => {
    const text = type === 'svg' ? svg : css
    navigator.clipboard.writeText(text)
    toast.success(`${type.toUpperCase()} copied to clipboard!`)
  }, [svg, css])

  const handleDownload = useCallback((type: 'svg' | 'css') => {
    const text = type === 'svg' ? svg : css
    const blob = new Blob([text], { type: type === 'svg' ? 'image/svg+xml' : 'text/css' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pattern-${patternType}.${type}`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Downloaded ${type.toUpperCase()}!`)
  }, [svg, css, patternType])

  const handleReset = useCallback(() => {
    setPrimaryColor('#df1c26')
    setSecondaryColor('#252826')
    setSize(20)
    setStrokeWidth(2)
    generatePattern()
  }, [generatePattern])

  const patternTypes: { type: PatternType; label: string; icon: string }[] = [
    { type: 'grid', label: 'Grid', icon: '▦' },
    { type: 'dots', label: 'Dots', icon: '•' },
    { type: 'lines', label: 'Lines', icon: '━' },
    { type: 'zigzag', label: 'Zigzag', icon: '⋀' },
    { type: 'circles', label: 'Circles', icon: '○' },
    { type: 'triangles', label: 'Triangles', icon: '△' },
    { type: 'hexagons', label: 'Hexagons', icon: '⬡' },
    { type: 'waves', label: 'Waves', icon: '〜' },
  ]

  return (
    <ToolLayout
      title="SVG Pattern Lab"
      description="Generate geometric CSS patterns"
      icon={<PenTool className="w-8 h-8" />}
      actions={<ActionToolbar onReset={handleReset} />}
    >
      <div className="flex flex-col h-full gap-6">
        {/* Pattern Type Selection */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
          {patternTypes.map(({ type, label, icon }) => (
            <button
              key={type}
              onClick={() => setPatternType(type)}
              className={`p-3 rounded-lg text-2xl transition-all ${
                patternType === type
                  ? 'bg-omni-primary text-white'
                  : 'bg-omni-text/5 hover:bg-omni-text/10 text-omni-text'
              }`}
              title={label}
            >
              {icon}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-omni-text/50 uppercase">Primary Color</label>
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-full h-10 rounded cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-omni-text/50 uppercase">Secondary Color</label>
            <input
              type="color"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              className="w-full h-10 rounded cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-omni-text/50 uppercase">Pattern Size: {size}px</label>
            <input
              type="range"
              min="10"
              max="100"
              value={size}
              onChange={(e) => setSize(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-omni-text/50 uppercase">Stroke: {strokeWidth}px</label>
            <input
              type="range"
              min="1"
              max="10"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={generatePattern}
          className="w-full py-3 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-omni-primary/20 flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Generate Pattern
        </button>

        {/* Preview */}
        {svg && (
          <div className="space-y-3">
            <label className="text-xs font-bold text-omni-text/50 uppercase">Preview</label>
            <div
              className="w-full h-40 rounded-xl border border-omni-text/10"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </div>
        )}

        {/* Output */}
        <div className="flex-1 flex gap-6 min-h-0">
          {/* SVG Output */}
          <div className="flex-1 flex flex-col bg-omni-bg/30 rounded-xl overflow-hidden border border-omni-text/10">
            <div className="px-4 py-2 bg-omni-text/5 border-b border-omni-text/10 flex items-center justify-between">
              <span className="text-xs font-bold text-omni-text/50 uppercase">SVG Code</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopy('svg')}
                  disabled={!svg}
                  className="text-xs text-omni-text/40 hover:text-omni-text disabled:opacity-50 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> Copy
                </button>
                <button
                  onClick={() => handleDownload('svg')}
                  disabled={!svg}
                  className="text-xs text-omni-text/40 hover:text-omni-text disabled:opacity-50 flex items-center gap-1"
                >
                  <Download className="w-3 h-3" /> Save
                </button>
              </div>
            </div>
            <textarea
              readOnly
              value={svg}
              placeholder="SVG code will appear here..."
              className="flex-1 w-full bg-transparent border-none text-xs text-omni-text/70 p-4 focus:outline-none resize-none min-h-0 font-mono"
            />
          </div>

          {/* CSS Output */}
          <div className="flex-1 flex flex-col bg-omni-bg/30 rounded-xl overflow-hidden border border-omni-text/10">
            <div className="px-4 py-2 bg-omni-text/5 border-b border-omni-text/10 flex items-center justify-between">
              <span className="text-xs font-bold text-omni-text/50 uppercase">CSS Code</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopy('css')}
                  disabled={!css}
                  className="text-xs text-omni-text/40 hover:text-omni-text disabled:opacity-50 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> Copy
                </button>
                <button
                  onClick={() => handleDownload('css')}
                  disabled={!css}
                  className="text-xs text-omni-text/40 hover:text-omni-text disabled:opacity-50 flex items-center gap-1"
                >
                  <Download className="w-3 h-3" /> Save
                </button>
              </div>
            </div>
            <textarea
              readOnly
              value={css}
              placeholder="CSS code will appear here..."
              className="flex-1 w-full bg-transparent border-none text-xs text-omni-text/70 p-4 focus:outline-none resize-none min-h-0 font-mono"
            />
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
