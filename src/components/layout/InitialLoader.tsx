import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import logo from '@/assets/icons/OmniToys.png'

const LOGS = [
  "SECURE_LINK: AUTHORIZED",
  "DECRYPTING_ENVIRONMENT...",
  "LOADING_CORE_MODULES...",
  "WASM_SANDBOX: ONLINE",
  "SYNCHRONIZING_LAB_CLOCK...",
  "INITIALIZING_SECTOR_01...",
  "SYSTEM_READY"
]

export function InitialLoader() {
  const [progress, setProgress] = useState(0)
  const [currentLog, setCurrentLog] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  const [coordinates] = useState(() => ({
    lat: (Math.random() * 90).toFixed(4),
    lng: (Math.random() * 180).toFixed(4)
  }))

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => setIsVisible(false), 500)
          return 100
        }
        return prev + Math.floor(Math.random() * 15) + 5
      })
    }, 150)

    const logInterval = setInterval(() => {
      setCurrentLog(prev => (prev < LOGS.length - 1 ? prev + 1 : prev))
    }, 400)

    return () => {
      clearInterval(interval)
      clearInterval(logInterval)
    }
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "circOut" }}
          className="fixed inset-0 z-[9999] bg-[#030303] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Grain Overlay */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />
          
          {/* Scanner Beam */}
          <motion.div 
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-px bg-omni-primary/30 shadow-[0_0_15px_rgba(223,28,38,0.5)] z-10"
          />

          <div className="relative flex flex-col items-center gap-12 text-center p-6">
            
            {/* Logo with Glitch Loop */}
            <div className="relative group">
               <motion.div 
                 animate={{ 
                   scale: [1, 1.05, 0.98, 1],
                   filter: [
                     "brightness(1)", 
                     "brightness(1.5) drop-shadow(0 0 10px rgba(223,28,38,0.5))", 
                     "brightness(1)"
                   ]
                 }}
                 transition={{ duration: 4, repeat: Infinity }}
                 className="w-32 h-32 relative z-20"
               >
                 <img src={logo} alt="OmniToys" className="w-full h-full object-contain" />
               </motion.div>
               
               {/* Cyber Rings */}
               <motion.div 
                 animate={{ rotate: 360, scale: [1, 1.1, 1] }} 
                 transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                 className="absolute inset-[-40px] border border-omni-primary/10 rounded-full border-dashed"
               />
               <motion.div 
                 animate={{ rotate: -360, scale: [1, 0.9, 1] }} 
                 transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                 className="absolute inset-[-20px] border border-omni-primary/5 rounded-full"
               />
            </div>

            {/* Status Section */}
            <div className="space-y-4 min-w-[300px]">
              <div className="flex justify-between items-end mb-1">
                <span className="text-[10px] font-black tracking-[0.3em] text-omni-primary neon-text">
                  BOOT_SEQUENCE
                </span>
                <span className="text-xl font-mono font-black text-white italic">
                  {Math.min(progress, 100)}%
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="absolute h-full bg-omni-primary neon-glow-primary shadow-[0_0_10px_rgba(223,28,38,0.5)]"
                />
              </div>

              {/* Terminal Logs */}
              <div className="h-6 flex items-center justify-center">
                 <AnimatePresence mode="wait">
                    <motion.p
                      key={currentLog}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-[9px] font-mono font-bold text-white/30 uppercase tracking-[0.2em]"
                    >
                      {">"} {LOGS[currentLog]}
                    </motion.p>
                 </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Background Decorative Text */}
          <div className="absolute bottom-10 left-10 text-[8px] font-mono text-white/5 space-y-1 hidden sm:block">
            <p>OMNITOYS_KERNEL_V0.3.0</p>
            <p>ENCRYPTION_LAYER_ACTIVE</p>
            <p>WASM_RUNTIME_READY</p>
          </div>
          <div className="absolute top-10 right-10 text-[8px] font-mono text-white/5 text-right hidden sm:block">
            <p>COORDINATES: {coordinates.lat}N {coordinates.lng}E</p>
            <p>LATENCY: 12ms</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
