import { useState, useCallback, useRef, useEffect } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { Smartphone, Monitor, Tablet, Download, Upload, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

type DeviceType = 'iphone' | 'android' | 'ipad' | 'macbook' | 'windows' | 'browser'
type BackgroundType = 'solid' | 'gradient' | 'transparent'

const DEVICES: Record<DeviceType, { name: string; width: number; height: number; scale: number }> = {
  iphone: { name: 'iPhone 14', width: 390, height: 844, scale: 0.4 },
  android: { name: 'Pixel 7', width: 412, height: 915, scale: 0.4 },
  ipad: { name: 'iPad Pro', width: 1024, height: 1366, scale: 0.25 },
  macbook: { name: 'MacBook Pro', width: 1512, height: 982, scale: 0.25 },
  windows: { name: 'Windows PC', width: 1920, height: 1080, scale: 0.2 },
  browser: { name: 'Browser', width: 1280, height: 720, scale: 0.3 },
}

const BACKGROUNDS = {
  solid: ['#1a1a2e', '#000000', '#ffffff', '#f0f0f0'],
  gradient: ['#667eea', '#f093fb', '#4facfe', '#43e97b'],
}

// Helper functions outside component
const adjustColor = (color: string, amount: number): string => {
  const hex = color.replace('#', '')
  const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + amount)
  const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + amount)
  const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + amount)
  return `rgb(${r}, ${g}, ${b})`
}

const drawDeviceFrame = (ctx: CanvasRenderingContext2D, type: DeviceType, x: number, y: number, width: number, height: number) => {
  ctx.save()

  if (type === 'iphone') {
    // iPhone frame
    ctx.fillStyle = '#000000'
    ctx.beginPath()
    ctx.roundRect(x, y, width, height, 48)
    ctx.fill()

    // Notch
    ctx.fillStyle = '#1a1a1a'
    ctx.beginPath()
    ctx.roundRect(x + width / 2 - 80, y + 12, 160, 30, 20)
    ctx.fill()

  } else if (type === 'android') {
    // Android frame
    ctx.fillStyle = '#1a1a1a'
    ctx.beginPath()
    ctx.roundRect(x, y, width, height, 24)
    ctx.fill()

    // Camera hole
    ctx.fillStyle = '#0a0a0a'
    ctx.beginPath()
    ctx.arc(x + width / 2, y + 20, 12, 0, Math.PI * 2)
    ctx.fill()

  } else if (type === 'ipad') {
    // iPad frame
    ctx.fillStyle = '#2a2a2a'
    ctx.beginPath()
    ctx.roundRect(x, y, width, height, 32)
    ctx.fill()

  } else if (type === 'macbook') {
    // Screen
    ctx.fillStyle = '#2d2d2d'
    ctx.beginPath()
    ctx.roundRect(x, y, width, height, 12)
    ctx.fill()

    // Base
    ctx.fillStyle = '#3d3d3d'
    ctx.beginPath()
    ctx.moveTo(x - 20, y + height)
    ctx.lineTo(x + width + 20, y + height)
    ctx.lineTo(x + width + 10, y + height + 20)
    ctx.lineTo(x - 10, y + height + 20)
    ctx.closePath()
    ctx.fill()

    // Camera
    ctx.fillStyle = '#1a1a1a'
    ctx.beginPath()
    ctx.arc(x + width / 2, y + 12, 4, 0, Math.PI * 2)
    ctx.fill()

  } else if (type === 'windows') {
    // Screen bezel
    ctx.fillStyle = '#2a2a2a'
    ctx.fillRect(x - 8, y - 8, width + 16, height + 16)

    // Stand
    ctx.fillStyle = '#3a3a3a'
    ctx.fillRect(x + width / 2 - 40, y + height + 8, 80, 12)
    ctx.fillRect(x + width / 2 - 60, y + height + 20, 120, 8)

  } else if (type === 'browser') {
    // Window frame
    ctx.strokeStyle = '#4a4a4a'
    ctx.lineWidth = 4
    ctx.strokeRect(x, y, width, height)

    // Title bar
    ctx.fillStyle = '#3a3a3a'
    ctx.fillRect(x, y, width, 32)

    // Window controls
    ctx.fillStyle = '#ff5f57'
    ctx.beginPath()
    ctx.arc(x + 20, y + 16, 6, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#ffbd2e'
    ctx.beginPath()
    ctx.arc(x + 40, y + 16, 6, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#28c840'
    ctx.beginPath()
    ctx.arc(x + 60, y + 16, 6, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

export default function DeviceMockupPage() {
  const [image, setImage] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [deviceType, setDeviceType] = useState<DeviceType>('iphone')
  const [backgroundType, setBackgroundType] = useState<BackgroundType>('solid')
  const [backgroundColor, setBackgroundColor] = useState('#1a1a2e')
  const [gradientColor, setGradientColor] = useState('#667eea')
  const [exportScale, setExportScale] = useState(1)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (imageUrl && canvasRef.current) {
      renderPreview()
    }
  }, [imageUrl, deviceType, backgroundType, backgroundColor, gradientColor])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    const url = URL.createObjectURL(file)
    setImageUrl(url)
    setImage(file.name)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setImageUrl(url)
      setImage(file.name)
      toast.success('Image uploaded!')
    } else {
      toast.error('Please drop an image file')
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const renderPreview = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !imageUrl) return

    const device = DEVICES[deviceType]
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // High resolution for preview
    const previewScale = 2
    const padding = 60
    canvas.width = device.width * previewScale + padding * 2
    canvas.height = device.height * previewScale + padding * 2

    // Draw background
    if (backgroundType === 'transparent') {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    } else if (backgroundType === 'solid') {
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    } else {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, gradientColor)
      gradient.addColorStop(1, adjustColor(gradientColor, 40))
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    const dWidth = device.width * previewScale
    const dHeight = device.height * previewScale
    const dX = (canvas.width - dWidth) / 2
    const dY = (canvas.height - dHeight) / 2

    // Draw device frame
    drawDeviceFrame(ctx, deviceType, dX, dY, dWidth, dHeight)

    // Load and draw image
    const img = new Image()
    img.onload = () => {
      ctx.save()

      const screenX = dX
      const screenY = dY
      const screenHeight = deviceType === 'browser' ? dHeight - 32 * previewScale : dHeight

      // Create clipping path for screen
      ctx.beginPath()
      if (deviceType === 'iphone') {
        const radius = 48 * previewScale
        ctx.roundRect(screenX, screenY, dWidth, dHeight, radius)
      } else if (deviceType === 'android' || deviceType === 'ipad') {
        const radius = deviceType === 'ipad' ? 32 * previewScale : 24 * previewScale
        ctx.roundRect(screenX, screenY, dWidth, dHeight, radius)
      } else {
        ctx.rect(screenX, screenY, dWidth, screenHeight)
      }
      ctx.clip()

      // Calculate image scaling
      const imgScale = Math.min(
        dWidth / img.width,
        screenHeight / img.height
      )
      const scaledWidth = img.width * imgScale
      const scaledHeight = img.height * imgScale
      const offsetX = (dWidth - scaledWidth) / 2
      const offsetY = (screenHeight - scaledHeight) / 2

      // Draw image
      ctx.drawImage(
        img,
        screenX + offsetX,
        screenY + offsetY + (deviceType === 'browser' ? 32 * previewScale : 0),
        scaledWidth,
        scaledHeight
      )

      ctx.restore()
    }
    img.src = imageUrl
  }, [imageUrl, deviceType, backgroundType, backgroundColor, gradientColor])

  const handleDownload = useCallback(() => {
    if (!imageUrl) return

    const canvas = document.createElement('canvas')
    const device = DEVICES[deviceType]
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // High resolution export
    const exportResolution = exportScale
    const padding = 100 * exportResolution
    canvas.width = device.width * exportResolution + padding * 2
    canvas.height = device.height * exportResolution + padding * 2

    // Draw background
    if (backgroundType === 'transparent') {
      // Transparent - nothing to draw
    } else if (backgroundType === 'solid') {
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    } else {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, gradientColor)
      gradient.addColorStop(1, adjustColor(gradientColor, 40))
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    const dWidth = device.width * exportResolution
    const dHeight = device.height * exportResolution
    const dX = (canvas.width - dWidth) / 2
    const dY = (canvas.height - dHeight) / 2

    // Draw device frame at export resolution
    drawDeviceFrame(ctx, deviceType, dX, dY, dWidth, dHeight)

    // Load and draw image for export
    const img = new Image()
    img.onload = () => {
      ctx.save()

      const screenX = dX
      const screenY = dY
      const screenHeight = deviceType === 'browser' ? dHeight - 32 * exportResolution : dHeight

      // Clip to screen area
      ctx.beginPath()
      if (deviceType === 'iphone') {
        ctx.roundRect(screenX, screenY, dWidth, dHeight, 48 * exportResolution)
      } else if (deviceType === 'android') {
        ctx.roundRect(screenX, screenY, dWidth, dHeight, 24 * exportResolution)
      } else if (deviceType === 'ipad') {
        ctx.roundRect(screenX, screenY, dWidth, dHeight, 32 * exportResolution)
      } else {
        ctx.rect(screenX, screenY, dWidth, screenHeight)
      }
      ctx.clip()

      // Draw image scaled to fit
      const imgScale = Math.min(dWidth / img.width, screenHeight / img.height)
      const scaledWidth = img.width * imgScale
      const scaledHeight = img.height * imgScale
      const offsetX = (dWidth - scaledWidth) / 2
      const offsetY = (screenHeight - scaledHeight) / 2

      ctx.drawImage(
        img,
        screenX + offsetX,
        screenY + offsetY + (deviceType === 'browser' ? 32 * exportResolution : 0),
        scaledWidth,
        scaledHeight
      )

      ctx.restore()

      // Download
      canvas.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${device.name.replace(/\s+/g, '-').toLowerCase()}-mockup-${exportScale}x.png`
        a.click()
        URL.revokeObjectURL(url)
        toast.success(`Mockup downloaded at ${exportScale}x resolution!`)
      }, 'image/png')
    }
    img.src = imageUrl
  }, [deviceType, imageUrl, backgroundType, backgroundColor, gradientColor, exportScale])

  const handleReset = useCallback(() => {
    setImage('')
    setImageUrl('')
    if (imageUrl) URL.revokeObjectURL(imageUrl)
  }, [imageUrl])

  return (
    <ToolLayout
      title="Device Mockup Generator"
      description="Create professional device mockups for presentations"
      icon={<Smartphone className="w-8 h-8" />}
      actions={<ActionToolbar onReset={handleReset} />}
    >
      <div className="flex flex-col h-full gap-6">
        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Device Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Device</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(DEVICES) as DeviceType[]).map((type) => {
                const device = DEVICES[type]
                const Icon = type === 'iphone' || type === 'android' ? Smartphone :
                           type === 'ipad' ? Tablet : Monitor
                return (
                  <button
                    key={type}
                    onClick={() => setDeviceType(type)}
                    className={`px-2 py-2 rounded text-xs font-bold uppercase transition-all flex flex-col items-center gap-1 ${
                      deviceType === type
                        ? 'bg-omni-primary text-white'
                        : 'bg-omni-text/5 hover:bg-omni-text/10 text-omni-text/70'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[10px]">{device.name.split(' ')[0]}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Background */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Background</label>
            <select
              value={backgroundType}
              onChange={(e) => setBackgroundType(e.target.value as BackgroundType)}
              className="w-full px-3 py-2 bg-omni-text/5 border border-omni-text/10 rounded-lg text-sm text-omni-text focus:outline-none focus:border-omni-primary/30"
            >
              <option value="solid">Solid Color</option>
              <option value="gradient">Gradient</option>
              <option value="transparent">Transparent</option>
            </select>

            {backgroundType === 'solid' && (
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-full h-10 rounded cursor-pointer"
              />
            )}

            {backgroundType === 'gradient' && (
              <div className="grid grid-cols-4 gap-1">
                {BACKGROUNDS.gradient.map((color) => (
                  <button
                    key={color}
                    onClick={() => setGradientColor(color)}
                    className={`h-8 rounded transition-transform ${gradientColor === color ? 'ring-2 ring-omni-primary scale-110' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Export Quality */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Export Quality</label>
            <select
              value={exportScale}
              onChange={(e) => setExportScale(Number(e.target.value))}
              className="w-full px-3 py-2 bg-omni-text/5 border border-omni-text/10 rounded-lg text-sm text-omni-text focus:outline-none focus:border-omni-primary/30"
            >
              <option value="1">1x (Standard)</option>
              <option value="2">2x (High)</option>
              <option value="3">3x (Ultra)</option>
            </select>
            <p className="text-[10px] text-omni-text/40">
              {DEVICES[deviceType].width * exportScale}x{DEVICES[deviceType].height * exportScale}px
            </p>
          </div>

          {/* Upload */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="flex flex-col"
          >
            <input
              id="mockup-image-input"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => document.getElementById('mockup-image-input')?.click()}
              className="flex-1 min-h-[70px] border-2 border-dashed border-omni-text/20 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors hover:border-omni-primary/50 hover:bg-omni-primary/5"
            >
              {imageUrl ? (
                <>
                  <ImageIcon className="w-6 h-6 text-omni-primary" />
                  <span className="text-xs text-omni-text truncate max-w-full">{image}</span>
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-omni-text/30" />
                  <span className="text-xs text-omni-text/50">Drop image or click</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preview Canvas */}
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-omni-bg/30 to-omni-text/5 rounded-xl p-6 min-h-[400px]">
          {imageUrl ? (
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-full shadow-2xl rounded-lg"
            />
          ) : (
            <div className="text-center text-omni-text/30">
              <Smartphone className="w-20 h-20 mx-auto mb-4 opacity-50" />
              <p className="text-sm mb-2">Upload a screenshot to create a mockup</p>
              <p className="text-xs">Supports PNG, JPG, WebP</p>
            </div>
          )}
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={!imageUrl}
          className="w-full py-4 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl font-bold uppercase tracking-widest transition-all shadow-lg shadow-omni-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-5 h-5" /> Download {DEVICES[deviceType].name} Mockup ({exportScale}x)
        </button>
      </div>
    </ToolLayout>
  )
}
