import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { ReloadPrompt } from '../ui/ReloadPrompt'
import { Toaster } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-omni-bg text-omni-text font-sans selection:bg-omni-primary/30 relative">
      <ReloadPrompt />
      <Toaster 
        theme="dark" 
        position="bottom-right" 
        toastOptions={{
          style: {
            background: 'rgba(37, 40, 38, 0.8)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(245, 245, 248, 0.1)',
            color: '#f5f5f8',
            borderRadius: '16px'
          }
        }}
      />
      
      {/* Mesh Background */}
      <div className="mesh-bg pointer-events-none">
        <div className="mesh-circle w-[500px] h-[500px] bg-omni-primary top-[-10%] right-[-5%] opacity-[0.08]" />
        <div className="mesh-circle w-[400px] h-[400px] bg-blue-500 bottom-[10%] left-[-10%] opacity-[0.05] animation-delay-2000" style={{ animationDelay: '2s' }} />
        <div className="mesh-circle w-[300px] h-[300px] bg-purple-600 top-[40%] right-[20%] opacity-[0.03] animation-delay-4000" style={{ animationDelay: '4s' }} />
      </div>

      <Sidebar />
      
      {/* Main content */}
      <main className="pt-20 lg:pt-0 lg:ml-64 min-h-screen relative z-10 transition-all duration-500">
        <div className="max-w-7xl mx-auto p-4 lg:p-10">
          <AnimatePresence mode="wait">
             <motion.div
               initial={{ opacity: 0, y: 15, scale: 0.98 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, y: -15, scale: 0.98 }}
               transition={{ 
                 type: "spring",
                 stiffness: 260,
                 damping: 20 
               }}
             >
               <Outlet />
             </motion.div>
          </AnimatePresence>
        </div>
      </main>
      
      {/* Subtle Noise Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.015] contrast-150 brightness-150 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
    </div>
  )
}
