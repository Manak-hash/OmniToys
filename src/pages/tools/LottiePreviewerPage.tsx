import { useState, useCallback, useRef, useEffect } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { Radio, Upload, Play, Pause, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'
import { toast } from 'sonner'

export default function LottiePreviewerPage() {
  const [lottieData, setLottieData] = useState<any>(null)
  const [fileName, setFileName] = useState('')
  const [isPlaying, setIsPlaying] = useState(true)
  const [speed, setSpeed] = useState(1)
  const [zoom, setZoom] = useState(1)
  const [backgroundColor, setBackgroundColor] = useState('#1a1a2e')
  const containerRef = useRef<HTMLDivElement>(null)
  const animationInstanceRef = useRef<any>(null)

  // Load lottie-web dynamically
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js'
    script.async = true
    script.onload = () => {
    }
    document.body.appendChild(script)

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  const loadAnimation = useCallback((data: any) => {
    if (!containerRef.current) return

    const lottie = (window as any).lottie
    if (!lottie) {
      toast.error('Lottie library not loaded. Please wait a moment and try again.')
      return
    }

    // Clean up previous animation
    if (animationInstanceRef.current) {
      animationInstanceRef.current.destroy()
    }

    try {
      const animation = lottie.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: isPlaying,
        animationData: data,
      })

      animationInstanceRef.current = animation
      animation.setSpeed(speed)
    } catch (error) {
      console.error('Error loading animation:', error)
      toast.error('Failed to load Lottie animation')
    }
  }, [isPlaying, speed])

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.json')) {
      toast.error('Please select a JSON file')
      return
    }

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      // Basic validation for Lottie JSON
      if (!data.v || !data.fr || !data.ip || !data.op || !data.layers) {
        toast.error('Invalid Lottie JSON file')
        return
      }

      setLottieData(data)
      setFileName(file.name)
      loadAnimation(data)
      toast.success('Lottie animation loaded!')
    } catch (error) {
      console.error('Error parsing JSON:', error)
      toast.error('Failed to parse JSON file')
    }
  }, [loadAnimation])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()

    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.json')) {
      const text = await file.text()
      try {
        const data = JSON.parse(text)

        if (!data.v || !data.fr || !data.ip || !data.op || !data.layers) {
          toast.error('Invalid Lottie JSON file')
          return
        }

        setLottieData(data)
        setFileName(file.name)
        loadAnimation(data)
        toast.success('Lottie animation loaded!')
      } catch (error) {
        console.error('Error parsing JSON:', error)
        toast.error('Failed to parse JSON file')
      }
    } else {
      toast.error('Please drop a JSON file')
    }
  }, [loadAnimation])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const togglePlayPause = useCallback(() => {
    if (!animationInstanceRef.current) return

    if (isPlaying) {
      animationInstanceRef.current.pause()
    } else {
      animationInstanceRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  const handleStop = useCallback(() => {
    if (!animationInstanceRef.current) return
    animationInstanceRef.current.stop()
    setIsPlaying(false)
  }, [])

  const handleSpeedChange = useCallback((newSpeed: number) => {
    setSpeed(newSpeed)
    if (animationInstanceRef.current) {
      animationInstanceRef.current.setSpeed(newSpeed)
    }
  }, [])

  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(z + 0.25, 3))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(z - 0.25, 0.25))
  }, [])

  const handleReset = useCallback(() => {
    setLottieData(null)
    setFileName('')
    setIsPlaying(true)
    setSpeed(1)
    setZoom(1)
    setBackgroundColor('#1a1a2e')

    if (animationInstanceRef.current) {
      animationInstanceRef.current.destroy()
      animationInstanceRef.current = null
    }
  }, [])

  // Get animation info
  const animationInfo = lottieData ? {
    version: lottieData.v,
    frameRate: lottieData.fr,
    startFrame: lottieData.ip,
    endFrame: lottieData.op,
    width: lottieData.w,
    height: lottieData.h,
    layers: lottieData.layers?.length || 0,
  } : null

  return (
    <ToolLayout
      title="Lottie Previewer"
      description="Test and preview Lottie JSON animations"
      icon={<Radio className="w-8 h-8" />}
      actions={<ActionToolbar onReset={handleReset} />}
    >
      <div className="flex flex-col h-full gap-6">
        {/* Upload Section */}
        {!lottieData ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="flex-1 min-h-[400px] border-2 border-dashed border-omni-text/20 rounded-xl flex flex-col items-center justify-center gap-4 transition-colors cursor-pointer hover:border-omni-primary/50 hover:bg-omni-primary/5"
            onClick={() => document.getElementById('lottie-input')?.click()}
          >
            <input
              id="lottie-input"
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Upload className="w-16 h-16 text-omni-text/30" />
            <div className="text-center">
              <p className="font-bold text-omni-text">Drop Lottie JSON here</p>
              <p className="text-xs text-omni-text/50 mt-1">or click to browse</p>
            </div>
          </div>
        ) : (
          <>
            {/* Preview Section */}
            <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
              {/* Animation Preview */}
              <div className="flex-1 flex flex-col bg-omni-bg/30 rounded-xl overflow-hidden border border-omni-text/10">
                <div className="px-4 py-2 bg-omni-text/5 border-b border-omni-text/10 flex items-center justify-between">
                  <span className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Preview</span>
                  <span className="text-xs text-omni-text/40">{fileName}</span>
                </div>

                <div
                  className="flex-1 flex items-center justify-center p-8 overflow-auto"
                  style={{ backgroundColor }}
                >
                  <div
                    ref={containerRef}
                    className="transition-transform"
                    style={{
                      transform: `scale(${zoom})`,
                      transformOrigin: 'center center',
                      maxWidth: '100%',
                      maxHeight: '100%',
                    }}
                  />
                </div>
              </div>

              {/* Controls & Info */}
              <div className="lg:w-80 flex flex-col gap-4">
                {/* Playback Controls */}
                <div className="bg-omni-bg/30 rounded-xl p-4 border border-omni-text/10 space-y-4">
                  <p className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Playback</p>

                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={handleStop}
                      className="p-3 bg-omni-text/5 hover:bg-omni-text/10 rounded-lg transition-colors"
                      title="Stop"
                    >
                      <RotateCcw className="w-4 h-4 text-omni-text/50" />
                    </button>
                    <button
                      onClick={togglePlayPause}
                      className="p-3 bg-omni-primary hover:bg-omni-primary-hover rounded-lg transition-colors"
                      title={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 text-white" />
                      ) : (
                        <Play className="w-4 h-4 text-white" />
                      )}
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-omni-text/50">Speed</span>
                      <span className="text-omni-text/70">{speed}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.25"
                      max="2"
                      step="0.25"
                      value={speed}
                      onChange={(e) => handleSpeedChange(Number(e.target.value))}
                      className="w-full h-2 bg-omni-text/10 rounded-lg appearance-none cursor-pointer accent-omni-primary"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleZoomOut}
                      className="flex-1 p-2 bg-omni-text/5 hover:bg-omni-text/10 rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <ZoomOut className="w-4 h-4 text-omni-text/50" />
                    </button>
                    <span className="text-xs text-omni-text/50">{Math.round(zoom * 100)}%</span>
                    <button
                      onClick={handleZoomIn}
                      className="flex-1 p-2 bg-omni-text/5 hover:bg-omni-text/10 rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <ZoomIn className="w-4 h-4 text-omni-text/50" />
                    </button>
                  </div>
                </div>

                {/* Background Color */}
                <div className="bg-omni-bg/30 rounded-xl p-4 border border-omni-text/10 space-y-3">
                  <p className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Background</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="flex-1 px-3 py-2 bg-omni-text/5 border border-omni-text/10 rounded-lg text-sm text-omni-text font-mono focus:outline-none focus:border-omni-primary/30"
                    />
                  </div>
                </div>

                {/* Animation Info */}
                {animationInfo && (
                  <div className="bg-omni-bg/30 rounded-xl p-4 border border-omni-text/10 space-y-2">
                    <p className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Info</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-omni-text/50">Version:</span>
                        <span className="text-omni-text/70">{animationInfo.version}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-omni-text/50">FPS:</span>
                        <span className="text-omni-text/70">{animationInfo.frameRate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-omni-text/50">Frames:</span>
                        <span className="text-omni-text/70">{animationInfo.startFrame}-{animationInfo.endFrame}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-omni-text/50">Size:</span>
                        <span className="text-omni-text/70">{animationInfo.width}x{animationInfo.height}</span>
                      </div>
                      <div className="flex justify-between col-span-2">
                        <span className="text-omni-text/50">Layers:</span>
                        <span className="text-omni-text/70">{animationInfo.layers}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  )
}
