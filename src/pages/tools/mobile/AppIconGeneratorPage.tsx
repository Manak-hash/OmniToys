import { useState, useEffect } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { FileUploader } from '@/components/ui/FileUploader'
import { 
  Download, Image as ImageIcon, Sliders, 
  Layout, Boxes, Sparkles, 
  Layers, Monitor, RotateCcw, Smartphone as SmartphoneIcon,
  Loader2
} from 'lucide-react'
import { generateAssetPack, type IconConfig } from '@/utils/image/iconGenerator'
import { toast } from 'sonner'
import fileDownload from 'js-file-download'
import { cn } from '@/utils/cn'
import { motion, AnimatePresence } from 'framer-motion'
import logo from '@/assets/icons/OmniToys(WebIcon).png'

type ViewMode = 'ios' | 'android' | 'splash' | 'store'

export default function AppIconGeneratorPage() {
  // Master State
  const [fgImage, setFgImage] = useState<{url: string, el: HTMLImageElement} | null>(null)
  const [bgImage, setBgImage] = useState<{url: string, el: HTMLImageElement} | null>(null)
  
  const [settings, setSettings] = useState({
    backgroundColor: '#df1c26',
    padding: 0.15,
    scale: 1,
    panning: { x: 0, y: 0 },
    useGloss: true,
    viewMode: 'ios' as ViewMode
  })
  
  const [isGenerating, setIsGenerating] = useState(false)

  // Initialize with Default Logo
  useEffect(() => {
    const img = new Image()
    img.src = logo
    img.onload = () => setFgImage({ url: logo, el: img })
  }, [])

  const handleFgSelect = (file: File) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.src = url
    img.onload = () => setFgImage({ url, el: img })
  }

  const handleBgSelect = (file: File) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.src = url
    img.onload = () => setBgImage({ url, el: img })
  }

  const handleReset = () => {
    setSettings(prev => ({
        ...prev,
        padding: 0.15,
        scale: 1,
        panning: { x: 0, y: 0 }
    }))
  }

  const handleGenerate = async () => {
    if (!fgImage) {
        toast.error("Please provide a foreground logo first.")
        return;
    }
    
    setIsGenerating(true)
    try {
        const config: IconConfig = {
            foreground: {
                image: fgImage.el,
                scale: settings.scale,
                panning: settings.panning
            },
            background: {
                color: settings.backgroundColor,
                image: bgImage?.el
            },
            padding: settings.padding,
            borderRadius: 0,
            useGloss: settings.useGloss
        }
        
        const zipData = await generateAssetPack(config)
        fileDownload(zipData, 'OmniIcon_Production_Bundle.zip')
        toast.success("Professional Bundle Generated!")
    } catch (e) {
        console.error(e)
        toast.error("Generation failed")
    } finally {
        setIsGenerating(false)
    }
  }

  return (
    <ToolLayout
      title="App Icon & Splash Factory"
      description="Professional multi-platform asset generation with realistic mobile logic."
      icon={<SmartphoneIcon className="w-8 h-8" />}
      actions={
        <div className="flex gap-2">
            <button 
                onClick={handleReset}
                className="p-2 hover:bg-white/5 rounded-xl text-omni-text/40 hover:text-omni-text transition-colors"
                title="Reset Sizing"
            >
                <RotateCcw className="w-5 h-5" />
            </button>
            <button 
                disabled={!fgImage || isGenerating}
                onClick={handleGenerate}
                className="flex items-center gap-3 px-6 py-2.5 bg-omni-primary text-white hover:bg-omni-primary-hover rounded-2xl font-black shadow-xl shadow-omni-primary/30 disabled:opacity-50 disabled:grayscale transition-all transform active:scale-95"
            >
                {isGenerating ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> PACKING...</>
                ) : (
                    <><Download className="w-5 h-5" /> EXPORT BUNDLE</>
                )}
            </button>
        </div>
      }
    >
      <div className="flex flex-col lg:flex-row gap-10 h-full">
        
        {/* RESTORED LEFT SIDEBAR */}
        <aside className="w-full lg:w-96 flex-shrink-0 space-y-8 no-scrollbar scroll-smooth">
            
            {/* 1. Layers Panel */}
            <div className="bg-omni-bg/40 border border-omni-text/10 rounded-[32px] p-6 space-y-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                        <Layers className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-omni-text/60">Asset Layers</h3>
                </div>

                {/* Foreground Layer */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-omni-text/40">Foreground (Logo)</label>
                        {fgImage && <button onClick={() => setFgImage(null)} className="text-[10px] text-red-500 font-bold hover:underline">Remove</button>}
                    </div>
                    <div className="h-28">
                       {fgImage ? (
                           <div className="h-full rounded-2xl border border-dashed border-omni-primary/30 bg-omni-primary/5 flex items-center justify-center relative group overflow-hidden">
                               <img src={fgImage.url} className="h-16 w-16 object-contain" />
                               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => document.getElementById('fg-uploader')?.click()}>
                                  <ImageIcon className="w-6 h-6 text-white" />
                               </div>
                           </div>
                       ) : (
                           <FileUploader 
                              onFileSelect={handleFgSelect} 
                              accept="image/*"
                              label="Upload Logo (PNG)"
                              className="h-full border-dashed !rounded-2xl"
                           />
                       )}
                       <input id="fg-uploader" type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleFgSelect(e.target.files[0])} />
                    </div>
                </div>

                {/* Background Layer */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-omni-text/40">Background</label>
                        {bgImage && <button onClick={() => setBgImage(null)} className="text-[10px] text-red-500 font-bold hover:underline">Remove</button>}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className="relative">
                            <input 
                                type="color" 
                                value={settings.backgroundColor}
                                onChange={e => setSettings(s => ({...s, backgroundColor: e.target.value}))}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                            />
                            <div className="w-full h-11 rounded-xl border border-omni-text/10 flex items-center px-3 gap-2 bg-white/5 hover:bg-white/10 transition-colors">
                                <div className="w-5 h-5 rounded-md border border-black/10" style={{ background: settings.backgroundColor }} />
                                <span className="text-[10px] font-mono opacity-50 uppercase">{settings.backgroundColor.substring(1)}</span>
                            </div>
                        </div>
                        <button 
                            className={cn(
                                "h-11 rounded-xl border flex items-center justify-center gap-2 text-[10px] font-bold transition-all",
                                bgImage ? "border-omni-primary/30 bg-omni-primary/10 text-omni-primary" : "border-omni-text/10 bg-white/5 hover:bg-white/10 text-omni-text/40"
                            )}
                            onClick={() => document.getElementById('bg-uploader')?.click()}
                        >
                            <ImageIcon className="w-3.5 h-3.5" /> IMAGE BG
                        </button>
                    </div>
                    
                    {bgImage ? (
                        <div className="h-11 rounded-xl border border-white/5 bg-black/20 flex items-center px-3 gap-3">
                           <img src={bgImage.url} className="w-6 h-6 object-cover rounded" />
                           <span className="text-[10px] font-mono opacity-40 truncate">Custom Texture Active</span>
                        </div>
                    ) : (
                        <p className="text-[9px] text-omni-text/30 italic">Using solid fill by default.</p>
                    )}
                    <input id="bg-uploader" type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleBgSelect(e.target.files[0])} />
                </div>
            </div>

            {/* 2. Transformation Panel */}
            <div className="bg-omni-bg/40 border border-omni-text/10 rounded-[32px] p-6 space-y-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                        <Sliders className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-omni-text/60">Composition</h3>
                </div>

                {/* Scaling */}
                <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase text-omni-text/40">
                        <span>Logo Scale</span>
                        <span className="text-omni-primary font-mono">{Math.round(settings.scale * 100)}%</span>
                    </div>
                    <input 
                        type="range" min="0.1" max="2" step="0.01" value={settings.scale}
                        onChange={e => setSettings(s => ({...s, scale: parseFloat(e.target.value)}))}
                        className="w-full accent-omni-primary h-1 bg-omni-text/5 rounded-full appearance-none cursor-pointer"
                    />
                </div>

                {/* Inset / Padding */}
                <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase text-omni-text/40">
                        <span>Safe Area Inset</span>
                        <span className="text-blue-400 font-mono">{Math.round(settings.padding * 100)}%</span>
                    </div>
                    <input 
                        type="range" min="0" max="0.5" step="0.01" value={settings.padding}
                        onChange={e => setSettings(s => ({...s, padding: parseFloat(e.target.value)}))}
                        className="w-full accent-blue-500 h-1 bg-omni-text/5 rounded-full appearance-none cursor-pointer"
                    />
                </div>

                {/* Effects Toggle */}
                <div className="flex items-center justify-between pt-4 border-t border-omni-text/5">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                        <span className="text-[11px] font-bold text-omni-text/60">iOS Shine Effect</span>
                    </div>
                    <button 
                        onClick={() => setSettings(s => ({...s, useGloss: !s.useGloss}))}
                        className={cn(
                            "w-10 h-5 rounded-full transition-all relative p-1",
                            settings.useGloss ? "bg-omni-primary" : "bg-white/10"
                        )}
                    >
                        <div className={cn("w-3 h-3 bg-white rounded-full transition-all", settings.useGloss ? "translate-x-5" : "translate-x-0")} />
                    </button>
                </div>
            </div>
        </aside>

        {/* Right: Master Preview Dashboard */}
        <main className="flex-1 flex flex-col gap-6">
            
            {/* View Filter Interface */}
            <div className="flex bg-[#0a0c10] p-1.5 rounded-2xl border border-white/5 w-fit self-center lg:self-start">
               {[
                   {id: 'ios', label: 'iOS Home', icon: SmartphoneIcon},
                   {id: 'android', label: 'Android', icon: Layout},
                   {id: 'splash', label: 'Splash Screen', icon: Monitor},
                   {id: 'store', label: 'Store Listing', icon: Boxes},
               ].map((mode) => (
                   <button
                        key={mode.id}
                        onClick={() => setSettings(s => ({...s, viewMode: mode.id as ViewMode}))}
                        className={cn(
                            "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                            settings.viewMode === mode.id 
                                ? "bg-omni-primary text-white shadow-lg shadow-omni-primary/20" 
                                : "text-omni-text/40 hover:text-omni-text hover:bg-white/5"
                        )}
                   >
                       <mode.icon className="w-3.5 h-3.5" />
                       <span className="hidden sm:inline">{mode.label}</span>
                   </button>
               ))}
            </div>

            {/* Stage Area */}
            <div className="flex-1 bg-[#0b0d11] rounded-[40px] border border-white/5 relative overflow-hidden flex items-center justify-center p-6 lg:p-10 shadow-2xl mini-scrollbar transition-all duration-700">
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={settings.viewMode}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        className="w-full h-full flex items-center justify-center"
                    >
                        {settings.viewMode === 'ios' && (
                             <IPhoneMockup 
                                logo={fgImage?.url} 
                                bgColor={settings.backgroundColor} 
                                bgImg={bgImage?.url}
                                {...settings} 
                            />
                        )}
                        {settings.viewMode === 'android' && (
                             <S24UltraMockup 
                                logo={fgImage?.url} 
                                bgColor={settings.backgroundColor} 
                                bgImg={bgImage?.url}
                                {...settings} 
                            />
                        )}
                        {settings.viewMode === 'splash' && (
                             <SplashDashboard 
                                logo={fgImage?.url} 
                                bgColor={settings.backgroundColor} 
                                bgImg={bgImage?.url}
                                {...settings} 
                            />
                        )}
                        {settings.viewMode === 'store' && (
                             <StoreListingMockup 
                                logo={fgImage?.url} 
                                bgColor={settings.backgroundColor} 
                                bgImg={bgImage?.url}
                                {...settings} 
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </main>
      </div>
    </ToolLayout>
  )
}

/**
 * REUSABLE MOCKUP SUB-COMPONENTS
 */

interface MockupProps {
  logo?: string
  bgColor: string
  bgImg?: string
  padding: number
  scale: number
  useGloss?: boolean
}

function IPhoneMockup({ logo, bgColor, bgImg, padding, scale, useGloss }: MockupProps) {
    return (
        <div className="relative w-[280px] h-[580px] bg-black rounded-[50px] border-[8px] border-[#1f1f1f] shadow-2xl overflow-hidden scale-90 sm:scale-100">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-3xl z-30 ring-1 ring-white/5"></div>
            <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600" className="absolute inset-0 w-full h-full object-cover" />
            
            <div className="absolute inset-0 z-10 p-5 pt-20 grid grid-cols-4 gap-6 content-start">
                <div className="flex flex-col items-center gap-1.5">
                    <div 
                        className="w-14 h-14 relative overflow-hidden rounded-[22.5%] shadow-xl"
                        style={{ backgroundColor: bgColor }}
                    >
                        {bgImg && <img src={bgImg} className="absolute inset-0 w-full h-full object-cover" />}
                        <img 
                            src={logo} 
                            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                            style={{ padding: `${(padding * 100)}%`, transform: `scale(${scale})` }}
                        />
                        {useGloss && <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-white/20 mix-blend-overlay"></div>}
                    </div>
                    <span className="text-[8px] text-white font-black drop-shadow-md tracking-widest">HOME</span>
                </div>
                {[...Array(11)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5 opacity-30 grayscale">
                        <div className="w-14 h-14 bg-white/10 rounded-[22.5%] border border-white/5"></div>
                        <div className="w-8 h-1.5 bg-white/10 rounded-full"></div>
                    </div>
                ))}
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[85%] h-20 bg-white/10 backdrop-blur-2xl rounded-[35px] border border-white/5 flex items-center justify-around px-2 z-20">
                     {[...Array(4)].map((_, i) => (
                        <div key={i} className="w-14 h-14 bg-white/20 rounded-[22.5%] opacity-40"></div>
                     ))}
            </div>
            <div className="h-1.5 w-32 bg-white/30 rounded-full mx-auto mb-2 absolute bottom-0 left-1/2 -translate-x-1/2"></div>
        </div>
    )
}

function S24UltraMockup({ logo, bgColor, bgImg, padding, scale }: MockupProps) {
    return (
        <div className="relative w-[300px] h-[600px] bg-black rounded-[18px] border-[6px] border-[#2c2c2c] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden scale-90 sm:scale-100">
            <img src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=600" className="absolute inset-0 w-full h-full object-cover opacity-80" />
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-3 h-3 bg-black rounded-full z-30"></div>
            
            <div className="absolute inset-0 z-10 p-8 pt-20 grid grid-cols-4 gap-x-5 gap-y-10 content-start">
                <div className="flex flex-col items-center gap-2">
                    <div 
                        className="w-14 h-14 relative overflow-hidden rounded-full shadow-lg"
                        style={{ backgroundColor: bgColor }}
                    >
                        {bgImg && <img src={bgImg} className="absolute inset-0 w-full h-full object-cover" />}
                        <img 
                            src={logo} 
                            className="absolute inset-0 w-full h-full object-contain"
                            style={{ padding: `${(padding * 100)}%`, transform: `scale(${scale})` }}
                        />
                    </div>
                    <span className="text-[8px] text-white/90 font-bold tracking-tight">Android</span>
                </div>
                {[...Array(11)].map((_, i) => (
                    <div key={i} className="w-14 h-14 bg-white/5 rounded-full border border-white/5 opacity-40"></div>
                ))}
            </div>
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 h-1 w-24 bg-white/30 rounded-full"></div>
        </div>
    )
}

function SplashDashboard({ logo, bgColor, bgImg, scale }: MockupProps) {
    return (
        <div className="flex flex-col items-center gap-10">
            <div className="relative w-[210px] h-[450px] rounded-[38px] border-[8px] border-[#1a1a1a] bg-black shadow-2xl overflow-hidden flex flex-col items-center justify-center p-12 transition-all duration-700" style={{ backgroundColor: bgColor }}>
                {bgImg && <img src={bgImg} className="absolute inset-0 w-full h-full object-cover opacity-60" />}
                <img 
                    src={logo} 
                    className="relative w-32 h-32 object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-transform duration-500"
                    style={{ transform: `scale(${scale})` }}
                />
                
                <div className="absolute bottom-16 w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                        className="h-full bg-white/40 w-1/2" 
                        animate={{ x: [-50, 150] }} 
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }} 
                    />
                </div>
            </div>
            <div className="text-center space-y-1">
                <p className="text-[10px] font-black tracking-[0.3em] uppercase text-omni-text/20">Boot Sequence Emulator</p>
                <p className="text-[9px] text-omni-text/10 italic">Adaptive Splash Generation Active</p>
            </div>
        </div>
    )
}

function StoreListingMockup({ logo, bgColor, bgImg, padding, scale }: MockupProps) {
    return (
        <div className="w-full max-w-[500px] bg-white text-black rounded-[32px] p-8 sm:p-12 shadow-2xl flex flex-col gap-10 border border-black/5 mx-4">
            <div className="flex gap-8 sm:gap-12">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[22%] shadow-2xl flex-shrink-0 relative overflow-hidden" style={{ backgroundColor: bgColor }}>
                    {bgImg && <img src={bgImg} className="absolute inset-0 w-full h-full object-cover" />}
                    <img src={logo} className="absolute inset-0 w-full h-full object-contain" style={{ padding: `${padding * 100}%`, transform: `scale(${scale})` }} />
                </div>
                <div className="flex flex-col justify-center gap-1">
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">Cyber Engine</h2>
                    <p className="text-blue-600 font-black text-sm uppercase">OmniToys Labs</p>
                    <div className="flex items-center gap-1 mt-3">
                        <div className="flex text-yellow-400">{'★★★★★'}</div>
                        <span className="text-[10px] font-bold text-gray-400 ml-2">4.9 • PERSISTENT INSTANCES</span>
                    </div>
                </div>
            </div>
            <div className="flex gap-4">
                <button className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 rounded-2xl text-white font-black text-[10px] tracking-[0.2em] transition-all">ESTABLISH LINK</button>
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">...</div>
            </div>
        </div>
    )
}
