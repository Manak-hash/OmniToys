import { useState, useRef, useMemo } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { FileUploader } from '@/components/ui/FileUploader'
import { Palette, Copy, Sparkles } from 'lucide-react'
import ColorThief from 'colorthief'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'

type RgbColor = [number, number, number]

type Tab = 'palette' | 'gradient'

interface ColorStop {
  id: string
  color: string
  position: number
}

export default function PaletteExtractorPage() {
  const [activeTab, setActiveTab] = useState<Tab>('palette')

  // Palette state
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [palette, setPalette] = useState<RgbColor[] | null>(null)
  const [dominant, setDominant] = useState<RgbColor | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  // Gradient state
  const [gradientType, setGradientType] = useState<'linear' | 'radial'>('linear')
  const [gradientDirection, setGradientDirection] = useState(90)
  const [colorStops, setColorStops] = useState<ColorStop[]>([
    { id: '1', color: '#667eea', position: 0 },
    { id: '2', color: '#764ba2', position: 100 },
  ])
  
  const gradientCSS = useMemo(() => {
    const sortedStops = [...colorStops].sort((a, b) => a.position - b.position)
    const stopsString = sortedStops
      .map(stop => `${stop.color} ${stop.position}%`)
      .join(', ')

    return gradientType === 'linear'
      ? `linear-gradient(${gradientDirection}deg, ${stopsString})`
      : `radial-gradient(circle, ${stopsString})`
  }, [colorStops, gradientType, gradientDirection])

  const handleFileSelect = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        setImageSrc(e.target.result as string)
        setPalette(null)
        setDominant(null)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleImageLoad = () => {
    if (!imgRef.current) return
    const colorThief = new ColorThief()
    try {
        const dom = colorThief.getColor(imgRef.current)
        const pal = colorThief.getPalette(imgRef.current, 10)
        setDominant(dom)
        setPalette(pal)
    } catch {
        console.error('Error extracting colors')
        toast.error("Could not extract colors. Image might be too complex or corrupted.")
    }
  }

  const rgbToHex = (r: number, g: number, b: number) => '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex)
    toast.success(`Copied ${hex}`)
  }


  const addColorStop = () => {
    const newStop: ColorStop = {
      id: Date.now().toString(),
      color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
      position: 50,
    }
    setColorStops([...colorStops, newStop])
  }

  const removeColorStop = (id: string) => {
    if (colorStops.length <= 2) {
      toast.error('Minimum 2 color stops required')
      return
    }
    setColorStops(colorStops.filter(stop => stop.id !== id))
  }

  const updateColorStop = (id: string, updates: Partial<ColorStop>) => {
    setColorStops(colorStops.map(stop =>
      stop.id === id ? { ...stop, ...updates } : stop
    ))
  }

  const copyGradientCSS = () => {
    const css = `background: ${gradientCSS};`
    navigator.clipboard.writeText(css)
    toast.success('Copied gradient CSS!')
  }


  return (
    <ToolLayout
      title="Color Palette Extractor"
      description="Extract color palettes from images and generate beautiful CSS gradients"
      icon={<Palette className="w-8 h-8" />}
    >
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('palette')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
            activeTab === 'palette'
              ? "bg-omni-primary text-white"
              : "bg-omni-text/10 text-omni-text hover:bg-omni-text/20"
          )}
        >
          <Palette className="w-4 h-4" />
          Palette Extractor
        </button>
        <button
          onClick={() => setActiveTab('gradient')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
            activeTab === 'gradient'
              ? "bg-omni-primary text-white"
              : "bg-omni-text/10 text-omni-text hover:bg-omni-text/20"
          )}
        >
          <Sparkles className="w-4 h-4" />
          Gradient Generator
        </button>
      </div>

      {activeTab === 'palette' ? (
        // Palette Extractor Tab
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-[500px]">
          <div className="flex flex-col gap-6">
            {!imageSrc ? (
              <FileUploader
                onFileSelect={handleFileSelect}
                accept="image/*"
                className="h-full min-h-[300px]"
              />
            ) : (
              <div className="relative rounded-xl overflow-hidden shadow-2xl border border-omni-text/10 bg-omni-bg/50 group">
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Uploaded preview"
                  onLoad={handleImageLoad}
                  className="w-full h-auto max-h-[500px] object-contain"
                  crossOrigin="anonymous"
                />
                <button
                  onClick={() => { setImageSrc(null); setPalette(null); }}
                  className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white px-3 py-1 rounded-lg text-sm backdrop-blur-md transition-colors"
                >
                  Change Image
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-8">
            {dominant && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-omni-text/80">Dominant Color</h3>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-omni-bg/50 border border-omni-text/10">
                  <div
                    className="w-20 h-20 rounded-lg shadow-lg"
                    style={{ backgroundColor: `rgb(${dominant[0]}, ${dominant[1]}, ${dominant[2]})` }}
                  />
                  <div className="space-y-1">
                    <p className="text-2xl font-mono text-omni-text">{rgbToHex(...dominant).toUpperCase()}</p>
                    <p className="text-sm text-omni-text/60 font-mono">rgb({dominant.join(', ')})</p>
                    <button
                      onClick={() => copyToClipboard(rgbToHex(...dominant))}
                      className="text-omni-primary hover:text-omni-primary-hover text-sm font-medium flex items-center gap-1 mt-2"
                    >
                      <Copy className="w-3 h-3" /> Copy HEX
                    </button>
                  </div>
                </div>
              </div>
            )}

            {palette && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-omni-text/80">Palette</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {palette.map((color, i) => {
                    const hex = rgbToHex(...color)
                    return (
                      <button
                        key={i}
                        onClick={() => copyToClipboard(hex)}
                        className="group flex flex-col gap-2 p-2 rounded-lg bg-omni-bg/30 hover:bg-omni-bg/60 border border-omni-text/5 hover:border-omni-primary/30 transition-all text-left"
                      >
                        <div
                          className="w-full aspect-square rounded-md shadow-sm group-hover:scale-105 transition-transform"
                          style={{ backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})` }}
                        />
                        <span className="text-xs font-mono text-omni-text/80">{hex.toUpperCase()}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {!dominant && imageSrc && (
              <div className="flex items-center justify-center p-12 text-omni-text/40 animate-pulse">
                Processing image...
              </div>
            )}
          </div>
        </div>
      ) : (
        // Gradient Generator Tab
        <div className="space-y-6">
          {/* Gradient Type & Direction */}
          <div className="flex flex-wrap gap-4 p-4 bg-omni-text/5 rounded-lg">
            <div className="flex gap-2">
              <button
                onClick={() => setGradientType('linear')}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium transition-all",
                  gradientType === 'linear'
                    ? "bg-omni-primary text-white"
                    : "bg-omni-text/10 text-omni-text hover:bg-omni-text/20"
                )}
              >
                Linear
              </button>
              <button
                onClick={() => setGradientType('radial')}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium transition-all",
                  gradientType === 'radial'
                    ? "bg-omni-primary text-white"
                    : "bg-omni-text/10 text-omni-text hover:bg-omni-text/20"
                )}
              >
                Radial
              </button>
            </div>

            {gradientType === 'linear' && (
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-omni-text/80">Angle:</label>
                <input
                  type="number"
                  min="0"
                  max="360"
                  value={gradientDirection}
                  onChange={(e) => setGradientDirection(parseInt(e.target.value) || 0)}
                  className="w-20 px-3 py-2 rounded-lg bg-omni-bg border border-omni-text/20 text-omni-text focus:outline-none focus:ring-2 focus:ring-omni-primary/50"
                />
                <span className="text-sm text-omni-text/60">degrees</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Color Stops */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-omni-text/80">Color Stops</h3>
                <button
                  onClick={addColorStop}
                  className="px-3 py-1.5 bg-omni-primary/10 text-omni-primary hover:bg-omni-primary/20 rounded-lg text-sm font-medium transition-colors"
                >
                  + Add Color
                </button>
              </div>

              <div className="space-y-3">
                {colorStops.map((stop) => (
                  <div key={stop.id} className="flex items-center gap-3 p-3 bg-omni-text/5 rounded-lg">
                    <input
                      type="color"
                      value={stop.color}
                      onChange={(e) => updateColorStop(stop.id, { color: e.target.value })}
                      className="w-12 h-12 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={stop.color}
                      onChange={(e) => updateColorStop(stop.id, { color: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-lg bg-omni-bg border border-omni-text/20 text-omni-text font-mono text-sm focus:outline-none focus:ring-2 focus:ring-omni-primary/50 uppercase"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-omni-text/60">{stop.position}%</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={stop.position}
                        onChange={(e) => updateColorStop(stop.id, { position: parseInt(e.target.value) })}
                        className="w-24 accent-omni-primary"
                      />
                    </div>
                    {colorStops.length > 2 && (
                      <button
                        onClick={() => removeColorStop(stop.id)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Preview & CSS */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-omni-text/80">Preview</h3>

              <div
                className="w-full h-48 rounded-xl shadow-lg border border-omni-text/10"
                style={{ background: gradientCSS }}
              />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-omni-text/80">CSS Output:</label>
                  <button
                    onClick={copyGradientCSS}
                    className="flex items-center gap-2 px-3 py-1.5 bg-omni-primary text-white hover:bg-omni-primary/90 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    Copy CSS
                  </button>
                </div>
                <div className="p-4 bg-omni-bg/50 rounded-lg border border-omni-text/20">
                  <code className="text-sm text-omni-text break-all">
                    background: {gradientCSS};
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
