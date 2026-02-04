import { motion } from 'framer-motion'
import { Terminal } from 'lucide-react'

interface ScanningLoaderProps {
  message?: string
  subMessage?: string
}

export function ScanningLoader({ 
  message = "INITIALIZING MODULE...", 
  subMessage = "Accessing secure sector..." 
}: ScanningLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-8 glass-card rounded-[40px] border-dashed relative overflow-hidden">
      {/* Background Scanning Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ 
             backgroundImage: 'radial-gradient(var(--color-omni-primary) 1px, transparent 1px)', 
             backgroundSize: '20px 20px' 
           }} 
      />
      
      {/* Scanning Bar Animation */}
      <motion.div 
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 right-0 h-px bg-omni-primary shadow-[0_0_15px_rgba(223,28,38,0.8)] z-20"
      />

      <div className="relative">
        <motion.div
           animate={{ rotate: 360 }}
           transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
           className="w-24 h-24 border-t-2 border-r-2 border-omni-primary/30 rounded-full"
        />
        <motion.div
           animate={{ rotate: -360 }}
           transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
           className="absolute inset-2 border-b-2 border-l-2 border-omni-primary/60 rounded-full"
        />
        <div className="absolute inset-0 flex items-center justify-center text-omni-primary">
           <Terminal className="w-8 h-8 animate-pulse" />
        </div>
      </div>

      <div className="text-center space-y-2 relative z-10">
        <motion.h3 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl font-black text-omni-text font-mono tracking-tighter uppercase"
        >
          {message}
        </motion.h3>
        <motion.div 
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-[10px] text-omni-primary font-black uppercase tracking-[0.3em] font-mono"
        >
          {subMessage}
        </motion.div>
      </div>

      {/* Synthetic Data Stream */}
      <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden relative">
        <motion.div 
          animate={{ left: ['-100%', '100%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 bottom-0 w-1/2 bg-omni-primary neon-glow-primary"
        />
      </div>
    </div>
  )
}
