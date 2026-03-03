import { useState, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { InputPane } from '@/components/tools/InputPane'
import { OutputPane } from '@/components/tools/OutputPane'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { Layers, Plus, Trash2, Eye, EyeOff, Box } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Layer {
  id: string
  name: string
  zIndex: number
  color: string
  visible: boolean
}

const DEFAULT_LAYERS: Layer[] = [
  { id: '1', name: 'Background', zIndex: 0, color: '#ef4444', visible: true },
  { id: '2', name: 'Card', zIndex: 10, color: '#22c55e', visible: true },
  { id: '3', name: 'Button', zIndex: 20, color: '#3b82f6', visible: true },
  { id: '4', name: 'Modal', zIndex: 50, color: '#a855f7', visible: true },
  { id: '5', name: 'Tooltip', zIndex: 100, color: '#f59e0b', visible: true },
]

export default function ZIndexPage() {
  const [layers, setLayers] = useState<Layer[]>(DEFAULT_LAYERS)
  const [view3D, setView3D] = useState(true)
  const [rotation, setRotation] = useState({ x: -15, y: 25 })
  const [spacing, setSpacing] = useState(30)

  const addLayer = useCallback(() => {
    const newLayer: Layer = {
      id: Date.now().toString(),
      name: `Layer ${layers.length + 1}`,
      zIndex: Math.max(...layers.map((l) => l.zIndex), 0) + 10,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      visible: true,
    }
    setLayers([...layers, newLayer])
  }, [layers])

  const removeLayer = useCallback((id: string) => {
    setLayers(layers.filter((l) => l.id !== id))
  }, [layers])

  const updateLayer = useCallback((id: string, updates: Partial<Layer>) => {
    setLayers(layers.map((l) => (l.id === id ? { ...l, ...updates } : l)))
  }, [layers])

  const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex)

  return (
    <ToolLayout
      title="Z-Index 3D Visualizer"
      description="Debug CSS layer stacking with interactive 3D perspective"
      icon={<Layers className="w-8 h-8" />}
      actions={<ActionToolbar onReset={() => setLayers(DEFAULT_LAYERS)} />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-[500px]">
        {/* Layer Controls */}
        <InputPane title="Layers">
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-auto p-4 space-y-2">
              <AnimatePresence mode="popLayout">
                {sortedLayers.map((layer) => (
                  <motion.div
                    key={layer.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`glass-card p-3 rounded-xl flex items-center gap-3 ${!layer.visible ? 'opacity-50' : ''}`}
                  >
                    <button
                      onClick={() => updateLayer(layer.id, { visible: !layer.visible })}
                      className="p-1.5 hover:bg-omni-text/10 rounded-lg transition-colors"
                    >
                      {layer.visible ? <Eye className="w-4 h-4 text-omni-text/50" /> : <EyeOff className="w-4 h-4 text-omni-text/30" />}
                    </button>

                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm"
                      style={{ backgroundColor: layer.color }}
                    >
                      {layer.zIndex}
                    </div>

                    <input
                      type="text"
                      value={layer.name}
                      onChange={(e) => updateLayer(layer.id, { name: e.target.value })}
                      className="flex-1 px-3 py-2 bg-omni-bg border border-omni-text/10 rounded-lg text-sm text-omni-text focus:outline-none focus:border-omni-primary/30"
                    />

                    <input
                      type="number"
                      value={layer.zIndex}
                      onChange={(e) => updateLayer(layer.id, { zIndex: Number(e.target.value) })}
                      className="w-20 px-3 py-2 bg-omni-bg border border-omni-text/10 rounded-lg text-sm text-omni-text font-mono focus:outline-none focus:border-omni-primary/30"
                    />

                    <input
                      type="color"
                      value={layer.color}
                      onChange={(e) => updateLayer(layer.id, { color: e.target.value })}
                      className="w-10 h-10 rounded cursor-pointer border-0"
                    />

                    <button
                      onClick={() => removeLayer(layer.id)}
                      className="p-1.5 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="p-4 border-t border-omni-text/5">
              <button
                onClick={addLayer}
                className="w-full py-3 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-omni-primary/20 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Layer
              </button>
            </div>
          </div>
        </InputPane>

        {/* 3D Visualization */}
        <OutputPane title="3D Preview">
          <div className="flex flex-col h-full">
            {/* View Controls */}
            <div className="p-4 border-b border-omni-text/5 bg-omni-bg/40 flex gap-3 flex-wrap">
              <button
                onClick={() => setView3D(true)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                  view3D ? 'bg-omni-primary text-white' : 'bg-omni-text/5 text-omni-text/50 hover:bg-omni-text/10'
                }`}
              >
                3D View
              </button>
              <button
                onClick={() => setView3D(false)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                  !view3D ? 'bg-omni-primary text-white' : 'bg-omni-text/5 text-omni-text/50 hover:bg-omni-text/10'
                }`}
              >
                2D View
              </button>
            </div>

            {/* Preview Area */}
            <div
              className="flex-1 flex items-center justify-center p-8 overflow-auto"
              style={{
                background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.4) 0%, rgba(15, 15, 30, 0.6) 100%)'
              }}
            >
              {view3D ? (
                // 3D View with proper CSS transforms
                <div
                  style={{
                    width: '260px',
                    height: '180px',
                    position: 'relative',
                    perspective: '1000px',
                    perspectiveOrigin: '50% 50%'
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      position: 'relative',
                      transformStyle: 'preserve-3d',
                      transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                      transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    {sortedLayers
                      .filter((l) => l.visible)
                      .map((layer, idx) => {
                        const zOffset = idx * spacing
                        return (
                          <div
                            key={layer.id}
                            style={{
                              position: 'absolute',
                              inset: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexDirection: 'column',
                              borderRadius: '12px',
                              fontWeight: 'bold',
                              color: 'white',
                              backgroundColor: layer.color,
                              boxShadow: `0 20px 40px -10px ${layer.color}99, inset 0 1px 0 rgba(255,255,255,0.2)`,
                              border: '2px solid rgba(255,255,255,0.15)',
                              transform: `translateZ(${zOffset}px)`,
                              backfaceVisibility: 'visible',
                            }}
                          >
                            <Box className="w-6 h-6 mb-1 opacity-80" />
                            <div className="text-lg">{layer.zIndex}</div>
                            <div className="text-xs opacity-90">{layer.name}</div>
                            <div className="text-[10px] opacity-60 mt-1">Z: {zOffset}px</div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              ) : (
                // 2D Stacked View
                <div
                  className="relative"
                  style={{
                    width: '260px',
                    height: '180px'
                  }}
                >
                  {sortedLayers
                    .filter((l) => l.visible)
                    .map((layer) => (
                      <div
                        key={layer.id}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'column',
                          borderRadius: '12px',
                          fontWeight: 'bold',
                          color: 'white',
                          backgroundColor: layer.color,
                          zIndex: layer.zIndex,
                          boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                          border: '2px solid rgba(255,255,255,0.15)',
                          opacity: 0.85,
                        }}
                      >
                        <Box className="w-6 h-6 mb-1 opacity-80" />
                        <div className="text-lg">{layer.zIndex}</div>
                        <div className="text-xs opacity-90">{layer.name}</div>
                        <div className="text-[10px] opacity-60 mt-1">z-index: {layer.zIndex}</div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Rotation Controls for 3D */}
            {view3D && (
              <div className="p-4 border-t border-omni-text/5 space-y-3 bg-omni-bg/40">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <label className="font-bold text-omni-text/50 uppercase tracking-wider">Rotate X (Tilt)</label>
                    <span className="text-omni-text/70 font-mono">{rotation.x}°</span>
                  </div>
                  <input
                    type="range"
                    min="-45"
                    max="45"
                    value={rotation.x}
                    onChange={(e) => setRotation({ ...rotation, x: Number(e.target.value) })}
                    className="w-full h-2 bg-omni-text/10 rounded-lg appearance-none cursor-pointer accent-omni-primary"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <label className="font-bold text-omni-text/50 uppercase tracking-wider">Rotate Y (Spin)</label>
                    <span className="text-omni-text/70 font-mono">{rotation.y}°</span>
                  </div>
                  <input
                    type="range"
                    min="-45"
                    max="45"
                    value={rotation.y}
                    onChange={(e) => setRotation({ ...rotation, y: Number(e.target.value) })}
                    className="w-full h-2 bg-omni-text/10 rounded-lg appearance-none cursor-pointer accent-omni-primary"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <label className="font-bold text-omni-text/50 uppercase tracking-wider">Layer Depth</label>
                    <span className="text-omni-text/70 font-mono">{spacing}px</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="80"
                    value={spacing}
                    onChange={(e) => setSpacing(Number(e.target.value))}
                    className="w-full h-2 bg-omni-text/10 rounded-lg appearance-none cursor-pointer accent-omni-primary"
                  />
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="p-4 border-t border-omni-text/5 bg-omni-bg/20 text-xs text-center">
              <div className="space-y-1">
                {view3D ? (
                  <>
                    <div className="text-omni-text/40">Layers closer to you = higher z-index</div>
                    <div className="text-omni-text/30">Adjust rotation to see depth clearly</div>
                  </>
                ) : (
                  <div className="text-omni-text/40">Higher z-index appears on top (normal CSS)</div>
                )}
              </div>
            </div>
          </div>
        </OutputPane>
      </div>
    </ToolLayout>
  )
}
