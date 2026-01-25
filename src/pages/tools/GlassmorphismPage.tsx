import { useState } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Copy, Sparkles, RefreshCw, Palette } from 'lucide-react'
import { toast } from 'sonner'
import { CodeEditor } from '@/components/ui/CodeEditor'

const BG_PRESETS = [
  'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500',
  'bg-gradient-to-br from-blue-400 to-emerald-400',
  'bg-gradient-to-tr from-orange-400 to-rose-400',
  'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900',
  'bg-[url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop")] bg-cover bg-center',
]

export default function GlassmorphismPage() {
  const [blur, setBlur] = useState(12)
  const [opacity, setOpacity] = useState(0.2)
  const [color, setColor] = useState('#ffffff')
  const [borderWidth, setBorderWidth] = useState(1)
  const [borderRadius, setBorderRadius] = useState(24)
  const [bgPreset, setBgPreset] = useState(0)

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255'
  }

  const glassStyle = {
    background: `rgba(${hexToRgb(color)}, ${opacity})`,
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    border: `${borderWidth}px solid rgba(${hexToRgb(color)}, 0.2)`,
    borderRadius: `${borderRadius}px`,
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
  }

  const cssCode = `/* Glassmorphism CSS */
background: rgba(${hexToRgb(color)}, ${opacity});
backdrop-filter: blur(${blur}px);
-webkit-backdrop-filter: blur(${blur}px);
border: ${borderWidth}px solid rgba(${hexToRgb(color)}, 0.2);
border-radius: ${borderRadius}px;
box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);`

  const copyCss = () => {
    navigator.clipboard.writeText(cssCode)
    toast.success('CSS copied to clipboard!')
  }

  const reset = () => {
    setBlur(12)
    setOpacity(0.2)
    setColor('#ffffff')
    setBorderWidth(1)
    setBorderRadius(24)
  }

  return (
    <ToolLayout
      title="Glassmorphism Editor"
      description="Create stunning frosted-glass effects with real-time CSS generation. Perfect for modern UI design."
      icon={<Sparkles className="w-8 h-8" />}
      actions={
        <button 
          onClick={reset}
          className="flex items-center gap-2 px-3 py-1.5 bg-omni-text/10 text-omni-text hover:bg-omni-text/20 rounded-lg transition-colors font-medium text-sm"
        >
          <RefreshCw className="w-4 h-4" /> Reset
        </button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[600px]">
        {/* Controls Column */}
        <div className="space-y-6">
          {/* Sliders */}
          <div className="space-y-6 p-6 bg-omni-bg/30 border border-omni-text/5 rounded-2xl">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <label className="text-omni-text/70">Blur ({blur}px)</label>
              </div>
              <input type="range" min="0" max="40" value={blur} onChange={(e) => setBlur(Number(e.target.value))} className="w-full accent-omni-primary" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <label className="text-omni-text/70">Transparency ({Math.round(opacity * 100)}%)</label>
              </div>
              <input type="range" min="0" max="1" step="0.01" value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-full accent-omni-primary" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <label className="text-omni-text/70">Border Radius ({borderRadius}px)</label>
              </div>
              <input type="range" min="0" max="50" value={borderRadius} onChange={(e) => setBorderRadius(Number(e.target.value))} className="w-full accent-omni-primary" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <label className="text-omni-text/70">Border Width ({borderWidth}px)</label>
              </div>
              <input type="range" min="0" max="10" value={borderWidth} onChange={(e) => setBorderWidth(Number(e.target.value))} className="w-full accent-omni-primary" />
            </div>

            <div className="pt-2">
              <label className="text-sm text-omni-text/70 flex items-center gap-2 mb-3">
                <Palette className="w-4 h-4" /> Glass Color
              </label>
              <div className="flex gap-3">
                {['#ffffff', '#000000', '#df1c26', '#4f46e5'].map(c => (
                  <button 
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-omni-primary' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <input 
                  type="color" 
                  value={color} 
                  onChange={(e) => setColor(e.target.value)}
                  className="w-10 h-10 rounded-full bg-transparent border-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* CSS Output */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-omni-text/70">CSS Snippet</label>
              <button 
                onClick={copyCss}
                className="text-xs text-omni-primary hover:underline flex items-center gap-1"
              >
                <Copy className="w-3 h-3" /> Copy CSS
              </button>
            </div>
            <CodeEditor 
              value={cssCode} 
              language="css" 
              readOnly 
              className="h-48 bg-omni-bg/80"
            />
          </div>
        </div>

        {/* Preview Column */}
        <div className="space-y-6">
          <div className={`flex-1 min-h-[400px] rounded-3xl relative overflow-hidden flex items-center justify-center transition-all duration-500 shadow-inner ${BG_PRESETS[bgPreset]}`}>
            {/* Background elements for depth */}
            <div className="absolute top-10 left-10 w-24 h-24 bg-white/20 rounded-full blur-xl animate-pulse" />
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-omni-primary/20 rounded-full blur-2xl" />
            
            <div 
              style={glassStyle}
              className="w-64 h-64 sm:w-80 sm:h-80 flex flex-col items-center justify-center p-8 text-center text-white relative z-10 transition-all duration-300"
            >
              <Sparkles className="w-12 h-12 mb-4 drop-shadow-lg" />
              <h3 className="text-2xl font-bold mb-2 font-['Space_Mono']">Glass Preview</h3>
              <p className="text-sm opacity-80">Experiment with the sliders to find the perfect frosted effect for your next project.</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-omni-text/70">Preview Background</label>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {BG_PRESETS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setBgPreset(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-xl border-2 transition-all ${bgPreset === i ? 'border-omni-primary scale-105' : 'border-transparent opacity-60 hover:opacity-100'} ${p}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
