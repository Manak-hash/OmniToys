import { useState, useRef } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { FileUploader } from '@/components/ui/FileUploader'
import { Palette, Share2, Copy } from 'lucide-react'
import ColorThief from 'colorthief'
import { toast } from 'sonner'

type RgbColor = [number, number, number]

export default function PaletteExtractorPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [palette, setPalette] = useState<RgbColor[] | null>(null)
  const [dominant, setDominant] = useState<RgbColor | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)

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
    } catch (e) {
        console.error('Error extracting colors', e)
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

  return (
    <ToolLayout
      title="Color Palette Extractor"
      description="Upload an image to identify the dominant color and extract a harmonious color palette."
      icon={<Palette className="w-8 h-8" />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-[500px]">
        
        {/* Upload & Preview Column */}
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

        {/* Results Column */}
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
    </ToolLayout>
  )
}
