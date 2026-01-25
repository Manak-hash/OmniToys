import { useState, useRef, useEffect, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { FileUploader } from '@/components/ui/FileUploader'
import { Scan, Copy, RefreshCw, FileText, Loader2, Zap, Scissors, X, Check } from 'lucide-react'
import { toast } from 'sonner'
import { createWorker } from 'tesseract.js'
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

type ScanMode = 'fast' | 'precise' | 'surgical'

export default function OcrPage() {
  const [image, setImage] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [mode, setMode] = useState<ScanMode>('precise')
  
  // Cropping State
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    x: 25,
    y: 25,
    width: 50,
    height: 50
  })
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null)
  const [showCropper, setShowCropper] = useState(false)

  const workerRef = useRef<Tesseract.Worker | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)

  const cleanupWorker = async () => {
    if (workerRef.current) {
      await workerRef.current.terminate()
      workerRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      cleanupWorker()
    }
  }, [])

  const handleFileUpload = (files: File[]) => {
    if (files.length === 0) return
    const file = files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      setImage(e.target?.result as string)
      setText('')
      setProgress(0)
      setShowCropper(false)
    }
    reader.readAsDataURL(file)
  }

  const getCroppedImage = async (imageSrc: string, pixelCrop: PixelCrop, scale = 2): Promise<string> => {
    const image = new Image()
    image.src = imageSrc
    await new Promise((resolve) => (image.onload = resolve))

    const renderedImg = imgRef.current
    if (!renderedImg) {
      console.warn('Laboratory Warning: Rendered image ref not found.')
      return imageSrc
    }
    
    // Use the actual rendered size of the img element to calculate scaling
    const scaleX = image.naturalWidth / renderedImg.clientWidth
    const scaleY = image.naturalHeight / renderedImg.clientHeight

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return imageSrc

    // Define source coordinates in the original image
    const sourceX = pixelCrop.x * scaleX
    const sourceY = pixelCrop.y * scaleY
    const sourceWidth = pixelCrop.width * scaleX
    const sourceHeight = pixelCrop.height * scaleY

    // Set canvas to mapped size * upscale multiplier
    canvas.width = sourceWidth * scale
    canvas.height = sourceHeight * scale

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      canvas.width,
      canvas.height
    )

    return canvas.toDataURL('image/png')
  }

  const preprocessImage = (imageSrc: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = canvasRef.current
        if (!canvas) return resolve(imageSrc)
        
        const ctx = canvas.getContext('2d')
        if (!ctx) return resolve(imageSrc)

        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i+1], b = data[i+2]
          const gray = 0.299 * r + 0.587 * g + 0.114 * b
          const threshold = 120 
          const value = gray > threshold ? 255 : 0
          data[i] = data[i+1] = data[i+2] = value
        }

        ctx.putImageData(imageData, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      }
      img.src = imageSrc
    })
  }

  const runOcr = async () => {
    if (!image) return
    
    setIsProcessing(true)
    setProgress(0)
    setStatus('Initializing Laboratory Module...')

    try {
      let processingImage = image
      
      // Mode handling
      if (mode === 'surgical' && completedCrop) {
        setStatus('Isolating Surgical Region...')
        processingImage = await getCroppedImage(image, completedCrop, 2)
      }
      
      if (mode === 'precise' || mode === 'surgical') {
        setStatus('Calibrating Optics (Preprocessing)...')
        processingImage = await preprocessImage(processingImage)
      }

      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100))
            setStatus('Synthesizing Text Content...')
          } else {
            setStatus(`${m.status.charAt(0).toUpperCase() + m.status.slice(1)}...`)
          }
        },
      })
      workerRef.current = worker
      
      const { data: { text: resultText } } = await worker.recognize(processingImage)
      setText(resultText)
      setShowCropper(false)
      toast.success('Extraction complete!')
    } catch (error) {
      console.error(error)
      toast.error('Laboratory error during extraction')
    } finally {
      setIsProcessing(false)
      setStatus('')
    }
  }

  const copyToClipboard = () => {
    if (!text) return
    navigator.clipboard.writeText(text)
    toast.success('Text copied to clipboard!')
  }

  return (
    <ToolLayout
      title="OCR Scanner Pro"
      description="Advanced text synthesis module. Use Surgical mode to isolate text and eliminate graphic noise."
      icon={<Scan className="w-8 h-8" />}
      actions={
        <div className="flex gap-2">
          {text && (
            <button 
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-3 py-1.5 bg-omni-text/10 text-omni-text hover:bg-omni-text/20 rounded-lg transition-colors font-medium text-sm"
            >
              <Copy className="w-4 h-4" /> Copy
            </button>
          )}
          {image && !isProcessing && (
            <button 
              onClick={runOcr}
              className="flex items-center gap-2 px-3 py-1.5 bg-omni-primary/10 text-omni-primary hover:bg-omni-primary/20 rounded-lg transition-colors font-medium text-sm"
            >
              <RefreshCw className="w-4 h-4" /> Rescan
            </button>
          )}
        </div>
      }
    >
      <canvas ref={canvasRef} className="hidden" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-[500px]">
        {/* Left: Input */}
        <div className="space-y-6">
          <div className="space-y-4">
             <div className="flex flex-wrap items-center justify-between gap-4">
                <label className="text-sm font-black uppercase tracking-widest text-omni-text/30">Target Image</label>
                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5 overflow-x-auto no-scrollbar">
                   {[
                     { id: 'fast', label: 'FAST', icon: null },
                     { id: 'precise', label: 'PRECISE', icon: <Zap className="w-3 h-3" /> },
                     { id: 'surgical', label: 'SURGICAL', icon: <Scissors className="w-3 h-3" /> }
                   ].map(m => (
                     <button 
                       key={m.id}
                       onClick={() => {
                         setMode(m.id as ScanMode)
                         if (m.id === 'surgical' && image) setShowCropper(true)
                       }}
                       className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-tight transition-all flex items-center gap-1.5 whitespace-nowrap ${mode === m.id ? 'bg-omni-primary text-white shadow-lg' : 'text-omni-text/40 hover:text-omni-text'}`}
                     >
                       {m.icon} {m.label}
                     </button>
                   ))}
                </div>
             </div>
             
             <div className="aspect-video relative rounded-3xl overflow-hidden glass-card group flex items-center justify-center bg-black/20 border-white/5">
                {image ? (
                  <>
                    <img 
                      src={image} 
                      alt="Preview" 
                      className="w-full h-full object-contain p-4 transition-all duration-500" 
                    />
                    {mode === 'surgical' && !isProcessing && (
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-4 group-hover:bg-black/60 transition-colors z-10">
                         <button 
                           onClick={() => setShowCropper(true)}
                           className="flex items-center gap-2 px-8 py-4 bg-omni-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-110 transition-transform shadow-2xl animate-in zoom-in duration-300"
                         >
                           <Scissors className="w-5 h-5" /> Adjust Region
                         </button>
                         <p className="text-[10px] text-white/40 font-mono italic tracking-tight">Freeform selection active.</p>
                      </div>
                    )}
                  </>
                ) : (
                  <FileUploader 
                    onFileSelect={(file) => handleFileUpload([file])} 
                    accept="image/*"
                    className="h-full border-none"
                  />
                )}
                {image && !isProcessing && !showCropper && (
                  <button 
                    onClick={() => { setImage(null); setText(''); setShowCropper(false); }}
                    className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-omni-primary/80 text-white rounded-xl transition-colors backdrop-blur-md z-20"
                  >
                    Change Image
                  </button>
                )}
             </div>
          </div>

          {!image && (
            <div className="p-6 rounded-3xl border border-dashed border-omni-text/10 text-center space-y-2">
               <Scan className="w-10 h-10 text-omni-text/10 mx-auto" />
               <p className="text-xs text-omni-text/40 font-mono italic">Upload a doc to initialize the WASM engine.</p>
            </div>
          )}

          {image && !isProcessing && !text && !showCropper && (
            <button 
              onClick={runOcr}
              className="w-full py-5 bg-omni-primary text-white rounded-[24px] font-black uppercase tracking-widest text-lg transition-all hover:scale-[1.02] hover:neon-glow flex items-center justify-center gap-3"
            >
              <Scan className="w-6 h-6" /> Start Local Extraction
            </button>
          )}

          {isProcessing && (
            <div className="p-8 rounded-[32px] glass-card space-y-6 relative overflow-hidden">
               <div className="absolute top-0 left-0 h-1 bg-omni-primary/20 w-full overflow-hidden">
                  <div 
                    className="h-full bg-omni-primary transition-all duration-500 shadow-[0_0_10px_rgba(223,28,38,0.8)]" 
                    style={{ width: `${progress}%` }} 
                  />
               </div>
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-omni-primary/10 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-omni-primary animate-spin" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-omni-text font-mono tracking-tighter leading-none">{status}</h4>
                    <p className="text-sm text-omni-text/40 mt-1 font-bold">{progress}% Complete</p>
                  </div>
               </div>
               <p className="text-[10px] text-omni-text/20 uppercase tracking-[0.2em] font-black italic">Precision scanning active. Ignoring external noise.</p>
            </div>
          )}
          
          <div className="p-4 rounded-2xl bg-omni-text/5 border border-white/5 space-y-2">
             <p className="text-[10px] font-black text-omni-text/40 uppercase tracking-widest">Lab Tip</p>
             <p className="text-[10px] text-omni-text/30 font-medium leading-relaxed">
               {mode === 'surgical' 
                 ? "Surgical mode allows you to manually isolate text strings. Best for logos and complex graphic layouts."
                 : mode === 'precise'
                 ? "Precise mode uses optical filters to boost text contrast and suppress light background noise."
                 : "Fast mode performs a raw scan. Best for clean screenshots or plain text documents."}
             </p>
          </div>
        </div>

        {/* Right: Output */}
        <div className="flex flex-col gap-4">
          <label className="text-sm font-black uppercase tracking-widest text-omni-text/30 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Extracted Text Results
          </label>
          <div className="flex-1 min-h-[300px] glass-card rounded-[32px] p-6 relative group">
             {text ? (
               <textarea 
                 value={text}
                 onChange={(e) => setText(e.target.value)}
                 className="w-full h-full bg-transparent border-none focus:outline-none text-omni-text/80 font-mono text-sm leading-relaxed resize-none no-scrollbar"
               />
             ) : (
               <div className="w-full h-full flex flex-col items-center justify-center text-center opacity-20">
                  <FileText className="w-16 h-16 mb-4" />
                  <p className="font-mono text-sm uppercase tracking-widest font-black">Scanner Idle</p>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* SURGICAL WORKBENCH - Moved to root to escape containing blocks */}
      {showCropper && image && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-omni-bg/95 backdrop-blur-2xl z-[100] p-4 lg:p-10 animate-in fade-in duration-500">
          <div className="w-full max-w-5xl h-full flex flex-col space-y-6">
             <div className="flex items-center justify-between">
                <div>
                   <h2 className="text-2xl font-black text-white font-mono tracking-tighter">SURGICAL_SELECTION</h2>
                   <p className="text-[10px] text-omni-primary font-black uppercase tracking-[0.2em] mt-1">Status: Calibrating Focal Point</p>
                </div>
                <button 
                  onClick={() => setShowCropper(false)}
                  className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/10 transition-all hover:scale-110"
                >
                  <X className="w-6 h-6" />
                </button>
             </div>

             <div className="flex-1 bg-black/40 rounded-[40px] border border-white/5 p-4 md:p-8 flex items-center justify-center overflow-auto relative group">
               <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #DF1C26 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
               <div className="max-h-full max-w-full">
                 <ReactCrop
                   crop={crop}
                   onChange={c => setCrop(c)}
                   onComplete={c => setCompletedCrop(c)}
                   className="shadow-2xl"
                 >
                   <img 
                     ref={imgRef}
                     src={image} 
                     alt="Crop source" 
                     className="block max-h-[70vh] w-auto h-auto"
                     onLoad={() => {
                        // Reset crop to center on load if needed
                     }}
                   />
                 </ReactCrop>
               </div>
             </div>
            
             <div className="flex items-center justify-center gap-6 py-6 pb-2">
               <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/10" />
               <div className="flex flex-col items-center gap-4">
                  <button 
                    onClick={runOcr} 
                    disabled={!completedCrop || (completedCrop.width === 0 && completedCrop.height === 0)}
                    className="flex items-center gap-4 py-5 px-20 bg-omni-primary text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-sm hover:scale-105 transition-all shadow-[0_0_40px_rgba(223,28,38,0.5)] active:scale-95 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed group"
                  >
                    <Check className="w-6 h-6 group-hover:animate-pulse" /> Finalize Synthesis
                  </button>
                  <p className="text-[9px] text-omni-text/20 font-bold uppercase tracking-widest animate-pulse">Select exactly the text mission region</p>
               </div>
               <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/10" />
             </div>
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
