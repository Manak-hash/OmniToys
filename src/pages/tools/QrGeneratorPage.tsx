import { useState, useEffect, useRef } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { QrCode, Download, Copy, Settings2 } from 'lucide-react'
import { toast } from 'sonner'
import QRCode from 'qrcode'

type ErrorCorrection = 'L' | 'M' | 'Q' | 'H'
type QRType = 'text' | 'url' | 'wifi' | 'vcard' | 'email' | 'phone'

const SIZE_PRESETS = [
  { label: 'Small', value: 128 },
  { label: 'Medium', value: 256 },
  { label: 'Large', value: 512 },
  { label: 'XL', value: 768 },
  { label: 'Print', value: 1024 },
]

const ERROR_LEVELS = [
  { label: 'Low (7%)', value: 'L' as ErrorCorrection },
  { label: 'Medium (15%)', value: 'M' as ErrorCorrection },
  { label: 'Quartile (25%)', value: 'Q' as ErrorCorrection },
  { label: 'High (30%)', value: 'H' as ErrorCorrection },
]

export default function QrGeneratorPage() {
  const [qrType, setQrType] = useState<QRType>('text')
  const [text, setText] = useState('https://omnitoys.app')
  const [size, setSize] = useState(256)
  const [bgColor, setBgColor] = useState('#ffffff')
  const [fgColor, setFgColor] = useState('#000000')
  const [errorCorrection, setErrorCorrection] = useState<ErrorCorrection>('M')
  const [margin, setMargin] = useState(2)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [wifiSSID, setWifiSSID] = useState('')
  const [wifiPassword, setWifiPassword] = useState('')
  const [wifiType, setWifiType] = useState<'WPA' | 'WEP' | 'nopass'>('WPA')

  const [vcardName, setVcardName] = useState('')
  const [vcardPhone, setVcardPhone] = useState('')
  const [vcardEmail, setVcardEmail] = useState('')

  const getQRContent = () => {
    switch (qrType) {
      case 'wifi': return `WIFI:T:${wifiType};S:${wifiSSID};P:${wifiPassword};;`
      case 'vcard': return `BEGIN:VCARD\nVERSION:3.0\nFN:${vcardName}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nEND:VCARD`
      case 'email': return `mailto:${text}`
      case 'phone': return `tel:${text}`
      case 'url': return text.startsWith('http') ? text : `https://${text}`
      default: return text
    }
  }

  useEffect(() => {
    const content = getQRContent()
    if (!content.trim() || !canvasRef.current) return
    QRCode.toCanvas(canvasRef.current, content, {
      width: size, margin, errorCorrectionLevel: errorCorrection,
      color: { dark: fgColor, light: bgColor },
    })
  }, [text, size, bgColor, fgColor, errorCorrection, margin, qrType, wifiSSID, wifiPassword, wifiType, vcardName, vcardPhone, vcardEmail])

  const downloadPNG = () => {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    link.download = `qrcode-${size}px.png`
    link.href = canvasRef.current.toDataURL('image/png')
    link.click()
    toast.success('QR Code downloaded!')
  }

  const downloadSVG = async () => {
    const content = getQRContent()
    if (!content.trim()) return
    try {
      const svgString = await QRCode.toString(content, { type: 'svg', width: size, margin, errorCorrectionLevel: errorCorrection, color: { dark: fgColor, light: bgColor } })
      const blob = new Blob([svgString], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = `qrcode-${size}px.svg`
      link.href = url
      link.click()
      URL.revokeObjectURL(url)
      toast.success('SVG downloaded!')
    } catch (e) { toast.error('Failed to generate SVG') }
  }

  const copyToClipboard = async () => {
    if (!canvasRef.current) return
    try {
      const blob = await new Promise<Blob>((resolve) => canvasRef.current!.toBlob((b) => resolve(b!), 'image/png'))
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      toast.success('QR Code copied to clipboard!')
    } catch (e) { toast.error('Failed to copy (unsupported browser?)') }
  }

  return (
    <ToolLayout title="QR Code Generator" description="Advanced QR codes with styles and multiple data formats." icon={<QrCode className="w-8 h-8" />}
      actions={<div className="flex gap-2"><button onClick={copyToClipboard} className="flex items-center gap-2 px-3 py-1.5 bg-omni-primary/10 text-omni-primary hover:bg-omni-primary/20 rounded-lg transition-colors font-medium text-sm"><Copy className="w-4 h-4" /> Copy</button>
      <button onClick={downloadPNG} className="flex items-center gap-2 px-3 py-1.5 bg-omni-text/10 text-omni-text hover:bg-omni-text/20 rounded-lg transition-colors font-medium text-sm"><Download className="w-4 h-4" /> PNG</button></div>}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[500px]">
        <div className="space-y-6">
          <div className="space-y-2"><label className="text-sm font-medium text-omni-text/70">Type</label><div className="grid grid-cols-3 sm:grid-cols-6 gap-2">{(['text', 'url', 'wifi', 'vcard', 'email', 'phone'] as QRType[]).map(type => (<button key={type} onClick={() => setQrType(type)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors capitalize ${qrType === type ? 'bg-omni-primary text-white' : 'bg-omni-text/5 text-omni-text/60 hover:bg-omni-text/10'}`}>{type}</button>))}</div></div>
          <div className="space-y-2"><label className="text-sm font-medium text-omni-text/70">Content</label>{qrType === 'wifi' ? (<div className="space-y-3"><input value={wifiSSID} onChange={(e) => setWifiSSID(e.target.value)} placeholder="SSID" className="w-full p-3 bg-omni-bg/50 border border-omni-text/10 rounded-xl text-omni-text" /><input type="password" value={wifiPassword} onChange={(e) => setWifiPassword(e.target.value)} placeholder="Password" className="w-full p-3 bg-omni-bg/50 border border-omni-text/10 rounded-xl text-omni-text" /></div>) : (<textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full h-24 p-4 bg-omni-bg/50 border border-omni-text/10 rounded-xl text-omni-text" />)}</div>
          <div className="space-y-2"><label className="text-sm font-medium text-omni-text/70">Size</label><div className="flex flex-wrap gap-2">{SIZE_PRESETS.map(p => (<button key={p.value} onClick={() => setSize(p.value)} className={`px-4 py-2 rounded-lg text-sm font-medium ${size === p.value ? 'bg-omni-primary text-white' : 'bg-omni-text/5 text-omni-text/60'}`}>{p.label}</button>))}</div></div>
          <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 text-sm text-omni-text/60"><Settings2 className="w-4 h-4" /> Advanced Options</button>
          {showAdvanced && (<div className="space-y-4 p-4 bg-omni-bg/30 rounded-xl border border-omni-text/5"><div className="grid grid-cols-2 gap-4"><div><label className="text-xs text-omni-text/40">BG</label><input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full h-10 rounded-lg" /></div><div><label className="text-xs text-omni-text/40">FG</label><input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-full h-10 rounded-lg" /></div></div></div>)}
          <div className="flex gap-3"><button onClick={downloadPNG} className="flex-1 py-3 bg-omni-primary text-white rounded-xl">Download PNG</button><button onClick={downloadSVG} className="flex-1 py-3 bg-omni-text/10 text-omni-text rounded-xl">Download SVG</button></div>
        </div>
        <div className="flex items-center justify-center"><div className="p-8 bg-white rounded-2xl shadow-2xl"><canvas ref={canvasRef} className="rounded-lg" /></div></div>
      </div>
    </ToolLayout>
  )
}
