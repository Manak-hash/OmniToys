import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Rocket, Shield, Zap, Layout, ArrowRight, Github, Terminal } from 'lucide-react'
import type { ReactNode } from 'react'

interface FloatingIconProps {
  icon: ReactNode
  top?: string
  left?: string
  right?: string
  bottom?: string
  delay: number
}

export default function HomePage() {
  return (
    <div className="space-y-32 py-10">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-4 overflow-visible">
        {/* Animated Background Elements */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-omni-primary/10 rounded-full blur-[120px] pointer-events-none" 
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, type: "spring", stiffness: 100 }}
          className="relative z-10 space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-omni-primary/10 border border-omni-primary/20 rounded-full text-omni-primary text-xs font-black uppercase tracking-[0.4em] animate-pulse">
            <Rocket className="w-4 h-4" /> System Online
          </div>
          
          <h1 className="text-6xl md:text-9xl font-black text-omni-text font-mono tracking-tighter leading-[0.85] mb-4">
            OMNI<span className="text-omni-primary neon-text">TOYS</span>
          </h1>
          
          <p className="text-omni-text/40 max-w-2xl mx-auto text-xl md:text-2xl font-medium leading-relaxed">
            My personal playground of high-performance dev tools. <br className="hidden md:block" />
            Zero tracking. 100% Client-side. Built for speed.
          </p>
38: 
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
            <Link 
              to="/tools" 
              className="group relative px-10 py-5 bg-omni-primary text-white rounded-2xl font-black uppercase tracking-widest text-lg transition-all hover:scale-105 hover:neon-glow overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <div className="relative flex items-center gap-3">
                Enter Laboratory <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </div>
            </Link>
            
            <a 
              href="https://github.com/Manak-hash/OmniToys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-10 py-5 bg-omni-text/5 hover:bg-omni-text/10 border border-omni-text/5 rounded-2xl font-black uppercase tracking-widest text-lg transition-all"
            >
              <Github className="w-6 h-6" /> Repository
            </a>
          </div>
        </motion.div>

        {/* Floating Icons Decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden hidden lg:block">
           <FloatingIcon icon={<Shield className="w-10 h-10" />} top="20%" left="15%" delay={0} />
           <FloatingIcon icon={<Zap className="w-12 h-12" />} top="60%" right="10%" delay={2} />
           <FloatingIcon icon={<Layout className="w-8 h-8" />} bottom="15%" left="25%" delay={4} />
        </div>
      </section>

      {/* Feature Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        <FeatureCard 
          icon={<Zap className="text-yellow-400" />}
          title="Ultra Fast"
          description="Powered by WASM and local compute. No network latency, ever."
        />
        <FeatureCard 
          icon={<Shield className="text-green-400" />}
          title="Privacy First"
          description="Your code stays in your browser. We don't even have a database."
        />
        <FeatureCard 
          icon={<Layout className="text-omni-primary" />}
          title="Pro Design"
          description="Tools that don't just work, but look and feel like premium software."
        />
      </section>

      {/* Lab Manifesto Section */}
      <section className="max-w-4xl mx-auto px-4 py-20 border-t border-omni-text/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6 text-left">
            <h2 className="text-4xl font-black text-omni-text font-mono tracking-tighter">THE LAB <br/><span className="text-omni-primary">MANIFESTO</span></h2>
            <p className="text-omni-text/60 leading-relaxed">
              OmniToys isn't just another utility site. It's a statement against the over-complication of dev tools. Most online converters send your data to servers you don't control. 
            </p>
            <div className="space-y-4">
              <ManifestoItem text="100% Client-Side Execution" />
              <ManifestoItem text="Zero Analytics or Tracking" />
              <ManifestoItem text="Deep High-Performance WASM Modules" />
              <ManifestoItem text="Open for Personal contribution" />
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-[40px] glass-card flex items-center justify-center relative overflow-hidden group">
               <div className="absolute inset-0 bg-omni-primary/5 group-hover:bg-omni-primary/10 transition-colors duration-700" />
               <Terminal className="w-32 h-32 text-omni-text/10 group-hover:text-omni-primary/20 transition-all duration-700 group-hover:scale-110" />
               <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/5">
                 <p className="text-[10px] font-mono text-omni-primary font-bold uppercase tracking-widest mb-1">Status Report</p>
                 <p className="text-[10px] text-omni-text/40 font-medium leading-tight">Environment secure. No external packets detected. Latency minimized to CPU clock limit.</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Lab section */}
      <section className="px-4 pb-20">
        <div className="p-12 rounded-[48px] glass-card text-center space-y-12">
           <div className="space-y-2">
             <h2 className="text-3xl font-black text-omni-text font-mono tracking-tighter uppercase">Powering the <span className="text-omni-primary">Research</span></h2>
             <p className="text-omni-text/30 text-sm font-bold tracking-widest uppercase">The tools of the trade</p>
           </div>
           
           <div className="flex flex-wrap justify-center gap-12 opacity-40 hover:opacity-100 transition-opacity duration-700">
              <TechBrand name="React 19" />
              <TechBrand name="Vite 7" />
              <TechBrand name="WebAssembly" />
              <TechBrand name="Framer Motion" />
              <TechBrand name="Tailwind v4" />
           </div>
        </div>
      </section>
    </div>
  )
}

function ManifestoItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-1.5 h-1.5 bg-omni-primary rounded-full shadow-[0_0_8px_rgba(223,28,38,0.8)]" />
      <span className="text-sm font-bold text-omni-text/80 font-mono tracking-tight">{text}</span>
    </div>
  )
}

function TechBrand({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center gap-2 group cursor-default">
      <span className="text-lg font-black text-omni-text/60 group-hover:text-omni-primary transition-colors font-mono">{name}</span>
      <div className="w-8 h-px bg-omni-text/20 group-hover:w-12 group-hover:bg-omni-primary transition-all duration-500" />
    </div>
  )
}

function FloatingIcon({ icon, top, left, right, bottom, delay }: FloatingIconProps) {
  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: [0, -40, 0], rotate: [0, 10, -10, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay }}
      className="absolute text-omni-text/10"
      style={{ top, left, right, bottom }}
    >
      {icon}
    </motion.div>
  )
}

function FeatureCard({ icon, title, description }: { icon: ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="p-8 glass-card rounded-[32px] space-y-4 hover:border-omni-primary/30 transition-all group"
    >
      <div className="w-14 h-14 bg-omni-text/5 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
      <h3 className="text-2xl font-black text-omni-text font-mono tracking-tighter">{title}</h3>
      <p className="text-omni-text/40 font-medium leading-relaxed">{description}</p>
    </motion.div>
  )
}
