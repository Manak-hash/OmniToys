import { useState, useCallback, useRef, useEffect } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { InputPane } from '@/components/tools/InputPane'
import { OutputPane } from '@/components/tools/OutputPane'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { FileAudio, Upload, Download, Waves, Palette } from 'lucide-react'
import { toast } from 'sonner'

type WaveformStyle = 'bars' | 'line' | 'filled'
type ColorPreset = { name: string; colors: string[]; bg: string }

const COLOR_PRESETS: ColorPreset[] = [
  { name: 'Neon', colors: ['#ef4444', '#f97316', '#eab308'], bg: '#0f0f23' },
  { name: 'Ocean', colors: ['#06b6d4', '#3b82f6', '#8b5cf6'], bg: '#0c1929' },
  { name: 'Forest', colors: ['#22c55e', '#84cc16', '#14b8a6'], bg: '#0a1f0a' },
  { name: 'Sunset', colors: ['#f97316', '#ef4444', '#ec4899'], bg: '#1a0a1a' },
  { name: 'Cyber', colors: ['#f472b6', '#a855f7', '#6366f1'], bg: '#1a0a2e' },
  { name: 'Monochrome', colors: ['#ffffff', '#999999', '#666666'], bg: '#000000' },
]

export default function AudioWaveformPage() {
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [waveformSvg, setWaveformSvg] = useState('')
  const [audioUrl, setAudioUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [amplitude, setAmplitude] = useState(1)
  const [barWidth, setBarWidth] = useState(3)
  const [barGap, setBarGap] = useState(1)
  const [color, setColor] = useState('#ef4444')
  const [backgroundColor, setBackgroundColor] = useState('#1a1a2e')
  const [waveformStyle, setWaveformStyle] = useState<WaveformStyle>('bars')
  const [useGradient, setUseGradient] = useState(false)
  const [gradientColors, setGradientColors] = useState(['#ef4444', '#f97316', '#eab308'])
  const [lineWidth, setLineWidth] = useState(2)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Cleanup audio URL on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  // Generate waveform from audio file
  const generateWaveform = useCallback(async (file: File) => {
    setIsProcessing(true)
    setAudioFile(file)

    try {
      const arrayBuffer = await file.arrayBuffer()
      const audioContext = new AudioContext()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

      // Get channel data (use first channel)
      const channelData = audioBuffer.getChannelData(0)

      // Downsample for SVG performance
      const samples = 1000
      const blockSize = Math.floor(channelData.length / samples)
      const sampled: number[] = []

      for (let i = 0; i < samples; i++) {
        const start = i * blockSize
        let sum = 0
        for (let j = 0; j < blockSize && start + j < channelData.length; j++) {
          sum += Math.abs(channelData[start + j])
        }
        sampled.push((sum / blockSize) * amplitude)
      }

      // Find max for normalization
      const max = Math.max(...sampled, 1)

      // Generate SVG based on style
      const svgWidth = 800
      const svgHeight = 200
      let svgContent = ''

      if (waveformStyle === 'bars') {
        const barFullWidth = barWidth + barGap
        const numBars = Math.floor(svgWidth / barFullWidth)

        for (let i = 0; i < numBars && i < sampled.length; i++) {
          const normalizedHeight = (sampled[i] / max) * svgHeight * 0.9
          const x = i * barFullWidth
          const y = (svgHeight - normalizedHeight) / 2

          const barColor = useGradient
            ? `url(#grad-${i % gradientColors.length})`
            : color

          svgContent += `<rect x="${x}" y="${y}" width="${barWidth}" height="${normalizedHeight}" fill="${barColor}" rx="${barWidth / 2}" />`
        }

        // Add gradient definitions if needed
        if (useGradient) {
          const defs = gradientColors.map((c, i) =>
            `<linearGradient id="grad-${i}" x1="0%" y1="0%" x2="100%" y2="0%">` +
            gradientColors.map((gc, j) =>
              `<stop offset="${(j / (gradientColors.length - 1)) * 100}%" stop-color="${gc}" />`
            ).join('') +
            `</linearGradient>`
          ).join('')
          svgContent = defs + svgContent
        }
      } else if (waveformStyle === 'line') {
        const points: string[] = []
        for (let i = 0; i < sampled.length; i++) {
          const x = (i / sampled.length) * svgWidth
          const normalizedHeight = (sampled[i] / max) * svgHeight * 0.4
          const y = svgHeight / 2 - normalizedHeight
          points.push(`${x},${y}`)
        }
        svgContent = `<polyline points="${points.join(' ')}" fill="none" stroke="${color}" stroke-width="${lineWidth}" stroke-linecap="round" stroke-linejoin="round" />`
      } else if (waveformStyle === 'filled') {
        const points: string[] = []
        points.push(`0,${svgHeight}`)
        for (let i = 0; i < sampled.length; i++) {
          const x = (i / sampled.length) * svgWidth
          const normalizedHeight = (sampled[i] / max) * svgHeight * 0.45
          const y = svgHeight / 2 - normalizedHeight
          points.push(`${x},${y}`)
        }
        points.push(`${svgWidth},${svgHeight}`)

        const fillColor = useGradient
          ? `url(#fillGradient)`
          : color.replace(')', ', 0.3)').replace('rgb', 'rgba').replace('#', '')

        if (useGradient) {
          const gradientDef = gradientColors.map((gc, i) =>
            `<stop offset="${(i / (gradientColors.length - 1)) * 100}%" stop-color="${gc}" stop-opacity="0.6" />`
          ).join('')
          svgContent = `<defs><linearGradient id="fillGradient" x1="0%" y1="0%" x2="100%" y2="0%">${gradientDef}</linearGradient></defs>`
        }
        svgContent += `<polygon points="${points.join(' ')}" fill="${fillColor}" stroke="${color}" stroke-width="${lineWidth}" stroke-linejoin="round" />`
      }

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="100%" height="100%" style="background-color: ${backgroundColor}">${svgContent}</svg>`

      setWaveformSvg(svg)
      setAudioUrl(URL.createObjectURL(file))
      toast.success('Waveform generated!')
    } catch (error) {
      console.error('Error generating waveform:', error)
      toast.error('Failed to process audio file. Make sure it\'s a valid audio format.')
    } finally {
      setIsProcessing(false)
    }
  }, [amplitude, barWidth, barGap, color, backgroundColor, waveformStyle, useGradient, gradientColors, lineWidth])

  // Regenerate with new settings
  useEffect(() => {
    if (audioFile && waveformSvg) {
      const timeout = setTimeout(() => {
        generateWaveform(audioFile)
      }, 100)
      return () => clearTimeout(timeout)
    }
  }, [amplitude, barWidth, barGap, color, backgroundColor, waveformStyle, useGradient, gradientColors, lineWidth, audioFile, waveformSvg, generateWaveform])

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('audio/')) {
      generateWaveform(file)
    } else {
      toast.error('Please drop an audio file')
    }
  }, [generateWaveform])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  // Handle file input
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      generateWaveform(file)
    }
  }, [generateWaveform])

  // Download SVG
  const handleDownload = useCallback(() => {
    if (!waveformSvg) return

    const blob = new Blob([waveformSvg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `waveform-${audioFile?.name || 'audio'}.svg`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('SVG downloaded!')
  }, [waveformSvg, audioFile])

  // Reset
  const handleReset = useCallback(() => {
    setAudioFile(null)
    setWaveformSvg('')
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl('')
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [audioUrl])

  // Apply color preset
  const applyPreset = useCallback((preset: ColorPreset) => {
    setGradientColors(preset.colors)
    setBackgroundColor(preset.bg)
    setColor(preset.colors[0])
    setUseGradient(true)
    toast.success(`Applied ${preset.name} preset`)
  }, [])

  return (
    <ToolLayout
      title="Audio Waveform Generator"
      description="Generate SVG waveforms from audio files using Web Audio API"
      icon={<Waves className="w-8 h-8" />}
      actions={<ActionToolbar onReset={handleReset} />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-[500px]">
        {/* Input Panel */}
        <InputPane title="Audio Input">
          <div className="flex flex-col h-full p-6 gap-5 overflow-auto">
            {/* File Upload Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className={`flex-1 min-h-[150px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-4 transition-colors cursor-pointer ${
                isProcessing
                  ? 'border-omni-text/20 bg-omni-text/5 cursor-wait'
                  : 'border-omni-text/20 hover:border-omni-primary/50 hover:bg-omni-primary/5'
              }`}
              onClick={() => !isProcessing && fileInputRef.current?.click()}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-omni-primary"></div>
                  <p className="text-sm text-omni-text/50">Processing audio...</p>
                </>
              ) : audioFile ? (
                <>
                  <FileAudio className="w-16 h-16 text-omni-primary" />
                  <div className="text-center">
                    <p className="font-bold text-omni-text">{audioFile.name}</p>
                    <p className="text-xs text-omni-text/50 mt-1">
                      {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Upload className="w-16 h-16 text-omni-text/30" />
                  <div className="text-center">
                    <p className="font-bold text-omni-text">Drop audio file here</p>
                    <p className="text-xs text-omni-text/50 mt-1">or click to browse</p>
                    <p className="text-xs text-omni-text/30 mt-2">Supports MP3, WAV, OGG, etc.</p>
                  </div>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Controls */}
            {audioFile && (
              <div className="space-y-4">
                {/* Waveform Style */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Waveform Style</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['bars', 'line', 'filled'] as WaveformStyle[]).map((style) => (
                      <button
                        key={style}
                        onClick={() => setWaveformStyle(style)}
                        className={`px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                          waveformStyle === style
                            ? 'bg-omni-primary text-white'
                            : 'bg-omni-text/5 hover:bg-omni-text/10 text-omni-text/70'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amplitude */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <label className="font-bold text-omni-text/50 uppercase tracking-wider">Amplitude</label>
                    <span className="text-omni-text/70">{amplitude.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={amplitude}
                    onChange={(e) => setAmplitude(Number(e.target.value))}
                    className="w-full h-2 bg-omni-text/10 rounded-lg appearance-none cursor-pointer accent-omni-primary"
                  />
                </div>

                {/* Bar Width (for bars style) */}
                {waveformStyle === 'bars' && (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <label className="font-bold text-omni-text/50 uppercase tracking-wider">Bar Width</label>
                        <span className="text-omni-text/70">{barWidth}px</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={barWidth}
                        onChange={(e) => setBarWidth(Number(e.target.value))}
                        className="w-full h-2 bg-omni-text/10 rounded-lg appearance-none cursor-pointer accent-omni-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <label className="font-bold text-omni-text/50 uppercase tracking-wider">Bar Gap</label>
                        <span className="text-omni-text/70">{barGap}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.5"
                        value={barGap}
                        onChange={(e) => setBarGap(Number(e.target.value))}
                        className="w-full h-2 bg-omni-text/10 rounded-lg appearance-none cursor-pointer accent-omni-primary"
                      />
                    </div>
                  </>
                )}

                {/* Line Width (for line/filled style) */}
                {(waveformStyle === 'line' || waveformStyle === 'filled') && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <label className="font-bold text-omni-text/50 uppercase tracking-wider">Line Width</label>
                      <span className="text-omni-text/70">{lineWidth}px</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="0.5"
                      value={lineWidth}
                      onChange={(e) => setLineWidth(Number(e.target.value))}
                      className="w-full h-2 bg-omni-text/10 rounded-lg appearance-none cursor-pointer accent-omni-primary"
                    />
                  </div>
                )}

                {/* Color Presets */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider flex items-center gap-2">
                      <Palette className="w-3 h-3" /> Color Presets
                    </label>
                    <button
                      onClick={() => setUseGradient(!useGradient)}
                      className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                        useGradient
                          ? 'bg-omni-primary text-white'
                          : 'bg-omni-text/5 text-omni-text/50'
                      }`}
                    >
                      {useGradient ? 'Gradient ON' : 'Gradient OFF'}
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => applyPreset(preset)}
                        className="relative h-12 rounded-lg overflow-hidden border-2 border-omni-text/10 hover:border-omni-primary/50 transition-colors group"
                        title={preset.name}
                      >
                        <div className="absolute inset-0" style={{ backgroundColor: preset.bg }}>
                          <div className="absolute bottom-0 left-0 right-0 h-2 flex">
                            {preset.colors.map((c, i) => (
                              <div key={i} className="flex-1" style={{ backgroundColor: c }} />
                            ))}
                          </div>
                        </div>
                        <span className="relative inset-0 flex items-center justify-center text-[10px] font-bold text-white bg-black/30 group-hover:bg-black/10 transition-colors">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Colors */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">
                      {useGradient ? 'Primary Color' : 'Bar Color'}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border-0"
                      />
                      <span className="text-xs font-mono text-omni-text/70">{color}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Background</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border-0"
                      />
                      <span className="text-xs font-mono text-omni-text/70">{backgroundColor}</span>
                    </div>
                  </div>
                </div>

                {/* Gradient Colors (when gradient is enabled) */}
                {useGradient && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Gradient Colors</label>
                    <div className="flex gap-2">
                      {gradientColors.map((gc, i) => (
                        <div key={i} className="flex-1">
                          <input
                            type="color"
                            value={gc}
                            onChange={(e) => {
                              const newColors = [...gradientColors]
                              newColors[i] = e.target.value
                              setGradientColors(newColors)
                            }}
                            className="w-full h-10 rounded cursor-pointer border-0"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </InputPane>

        {/* Output Panel */}
        <OutputPane title="Waveform Preview">
          <div className="flex flex-col h-full">
            {/* SVG Preview */}
            <div className="flex-1 flex items-center justify-center p-6 bg-omni-bg/40 overflow-auto">
              {waveformSvg ? (
                <div
                  className="w-full h-full flex items-center justify-center rounded-lg"
                  dangerouslySetInnerHTML={{ __html: waveformSvg }}
                />
              ) : (
                <div className="text-center text-omni-text/30">
                  <Waves className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Upload an audio file to generate waveform</p>
                </div>
              )}
            </div>

            {/* Audio Player */}
            {audioUrl && (
              <div className="border-t border-omni-text/5 p-4 bg-omni-bg/40">
                <audio
                  controls
                  src={audioUrl}
                  className="w-full"
                />
              </div>
            )}

            {/* Download Button */}
            {waveformSvg && (
              <div className="border-t border-omni-text/5 p-4">
                <button
                  onClick={handleDownload}
                  className="w-full py-3 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-omni-primary/20 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download SVG
                </button>
              </div>
            )}
          </div>
        </OutputPane>
      </div>
    </ToolLayout>
  )
}
