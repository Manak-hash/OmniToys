import { useState, useMemo } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Copy, RefreshCw, Layers, Sun, Moon, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { CodeEditor } from '@/components/ui/CodeEditor'

interface ShadowLayer {
  id: string
  x: number
  y: number
  blur: number
  spread: number
  color: string
  opacity: number
  inset: boolean
}

export default function ShadowBuilderPage() {
  const [layers, setLayers] = useState<ShadowLayer[]>([
    { id: '1', x: 0, y: 10, blur: 20, spread: -5, color: '#000000', opacity: 0.3, inset: false }
  ])
  const [activeLayerId, setActiveLayerId] = useState('1')
  const [isNeumorphic, setIsNeumorphic] = useState(false)
  const [cardProgress, setCardProgress] = useState(0) // For neumorphism intensity

  const shadowString = useMemo(() => {
    return layers.map(l => {
      const r = parseInt(l.color.slice(1, 3), 16)
      const g = parseInt(l.color.slice(3, 5), 16)
      const b = parseInt(l.color.slice(5, 7), 16)
      return `${l.inset ? 'inset ' : ''}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px rgba(${r}, ${g}, ${b}, ${l.opacity})`
    }).join(', ')
  }, [layers])

  const cssCode = `box-shadow: ${shadowString};\n/* background-color: ... */`

  const activeLayer = layers.find(l => l.id === activeLayerId) || layers[0]

  const updateLayer = (id: string, updates: Partial<ShadowLayer>) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l))
  }

  const addLayer = () => {
    const newId = Math.random().toString(36).substr(2, 9)
    setLayers(prev => [...prev, { id: newId, x: 0, y: 5, blur: 10, spread: 0, color: '#000000', opacity: 0.2, inset: false }])
    setActiveLayerId(newId)
  }

  const removeLayer = (id: string) => {
    if (layers.length === 1) return
    setLayers(prev => prev.filter(l => l.id !== id))
    if (activeLayerId === id) setActiveLayerId(layers[0].id)
  }

  const copyCss = () => {
    navigator.clipboard.writeText(cssCode)
    toast.success('Box-shadow CSS copied!')
  }

  return (
    <ToolLayout
      title="Shadow & Neumorphism Builder"
      description="Design complex multi-layered shadows or soft neumorphic UI elements with real-time preview."
      icon={<Layers className="w-8 h-8" />}
      actions={
        <button onClick={() => setLayers([{ id: '1', x: 0, y: 10, blur: 20, spread: -5, color: '#000000', opacity: 0.3, inset: false }])} className="flex items-center gap-2 px-3 py-1.5 bg-omni-text/10 text-omni-text rounded-lg text-sm">
          <RefreshCw className="w-4 h-4" /> Reset
        </button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[600px]">
        {/* Controls */}
        <div className="space-y-6">
          {/* Layer Tabs */}
          <div className="flex flex-wrap gap-2">
            {layers.map((l, i) => (
              <div key={l.id} className="relative group">
                <button
                  onClick={() => setActiveLayerId(l.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeLayerId === l.id ? 'bg-omni-primary text-white' : 'bg-omni-bg/50 text-omni-text/60 hover:bg-omni-text/5'}`}
                >
                  Layer {i + 1}
                </button>
                {layers.length > 1 && (
                  <button onClick={() => removeLayer(l.id)} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full items-center justify-center hidden group-hover:flex">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
            <button onClick={addLayer} className="p-2 bg-omni-text/5 text-omni-text/40 hover:text-omni-primary hover:bg-omni-primary/10 rounded-lg transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Active Layer Controls */}
          <div className="p-6 bg-omni-bg/30 border border-omni-text/5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-omni-text/80 uppercase tracking-widest">Adjust Layer</h3>
            <div className="grid grid-cols-2 gap-6">
              <Slider label="X Offset" value={activeLayer.x} min={-100} max={100} onChange={v => updateLayer(activeLayerId, { x: v })} />
              <Slider label="Y Offset" value={activeLayer.y} min={-100} max={100} onChange={v => updateLayer(activeLayerId, { y: v })} />
              <Slider label="Blur Radius" value={activeLayer.blur} min={0} max={100} onChange={v => updateLayer(activeLayerId, { blur: v })} />
              <Slider label="Spread Radius" value={activeLayer.spread} min={-50} max={50} onChange={v => updateLayer(activeLayerId, { spread: v })} />
              <Slider label="Opacity" value={activeLayer.opacity} min={0} max={1} step={0.01} onChange={v => updateLayer(activeLayerId, { opacity: v })} />
              <div className="space-y-2">
                <label className="text-xs text-omni-text/50">Inset</label>
                <button onClick={() => updateLayer(activeLayerId, { inset: !activeLayer.inset })} className={`w-full py-2 rounded-lg text-sm font-medium ${activeLayer.inset ? 'bg-omni-primary text-white' : 'bg-omni-text/5 text-omni-text/60'}`}>
                  {activeLayer.inset ? 'Inset Shadow' : 'Drop Shadow'}
                </button>
              </div>
            </div>
            <div className="pt-2">
               <label className="text-xs text-omni-text/50 block mb-2">Shadow Color</label>
               <input type="color" value={activeLayer.color} onChange={e => updateLayer(activeLayerId, { color: e.target.value })} className="w-full h-10 rounded-lg cursor-pointer bg-transparent border-none" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center"><label className="text-sm font-medium text-omni-text/70">CSS Output</label><button onClick={copyCss} className="text-xs text-omni-primary hover:underline flex items-center gap-1"><Copy className="w-3 h-3" /> Copy CSS</button></div>
            <CodeEditor value={cssCode} language="css" readOnly className="h-32 bg-omni-bg/80" />
          </div>
        </div>

        {/* Preview */}
        <div className="flex flex-col gap-6 items-center justify-center p-8 bg-omni-text/5 rounded-3xl relative overflow-hidden backdrop-blur-3xl">
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,#ffffff05_0%,transparent_70%)] opacity-50 pointer-events-none" />
           
           <div 
             style={{ 
               boxShadow: shadowString,
               backgroundColor: '#f5f5f8', // Neutral light bg for preview
               width: '240px',
               height: '240px',
               borderRadius: '40px'
             }}
             className="flex items-center justify-center text-slate-400 font-bold text-xl relative z-10"
           >
             PREVIEW
           </div>

           <div className="w-full max-w-xs mt-8 p-4 bg-omni-bg/40 rounded-xl border border-omni-text/5">
              <p className="text-xs text-omni-text/40 text-center mb-2 italic">Try adding more layers for realistic effects like ambient occlusion.</p>
           </div>
        </div>
      </div>
    </ToolLayout>
  )
}

function Slider({ label, value, min, max, step = 1, onChange }: { label: string, value: number, min: number, max: number, step?: number, onChange: (v: number) => void }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px] font-bold text-omni-text/40 uppercase">
        <span>{label}</span>
        <span className="text-omni-primary">{value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} className="w-full accent-omni-primary" />
    </div>
  )
}
