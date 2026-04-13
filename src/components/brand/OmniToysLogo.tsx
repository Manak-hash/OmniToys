import { motion } from 'framer-motion'
import logo from '@/assets/icons/OmniToys(WebIcon).png'

interface OmniToysLogoProps {
  variant?: 'full' | 'compact'
  className?: string
}

export function OmniToysLogo({ variant = 'full', className = '' }: OmniToysLogoProps) {
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
          <img src={logo} alt="OmniToys" className="w-full h-full object-contain" />
        </div>
        <div className="flex flex-col">
          <span className="font-black text-lg tracking-tighter text-omni-text">
            OmniToys
          </span>
          <span className="text-[9px] text-omni-text-tertiary font-mono uppercase tracking-widest">
            Developer Tools
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Logo Icon */}
      <motion.div
        whileHover={{ rotate: 5, scale: 1.05 }}
        transition={{ duration: 0.2 }}
        className="w-12 h-12 flex items-center justify-center flex-shrink-0"
      >
        <img src={logo} alt="OmniToys" className="w-full h-full object-contain" />
      </motion.div>

      {/* Logo Text */}
      <div className="flex flex-col">
        <h1 className="font-black text-2xl tracking-tighter text-omni-text leading-none">
          OmniToys
        </h1>
        <span className="text-[10px] text-omni-text-tertiary font-mono uppercase tracking-widest mt-1">
          Privacy-First Developer Tools
        </span>
      </div>
    </div>
  )
}
