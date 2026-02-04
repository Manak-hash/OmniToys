import { useState, useMemo } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Type, RefreshCw, ArrowRight, Check, Sparkles, Code, Smartphone, Monitor, X, Copy } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { CodeEditor } from '@/components/ui/CodeEditor'
import { toast } from 'sonner'

// Curated list of high-quality variable fonts from Google Fonts
const FONTS = [
  { name: 'Inter', category: 'Sans Serif' },
  { name: 'Roboto', category: 'Sans Serif' },
  { name: 'Open Sans', category: 'Sans Serif' },
  { name: 'Lato', category: 'Sans Serif' },
  { name: 'Montserrat', category: 'Sans Serif' },
  { name: 'Oswald', category: 'Sans Serif' },
  { name: 'Raleway', category: 'Sans Serif' },
  { name: 'Poppins', category: 'Sans Serif' },
  { name: 'Playfair Display', category: 'Serif' },
  { name: 'Merriweather', category: 'Serif' },
  { name: 'Lora', category: 'Serif' },
  { name: 'Crimson Text', category: 'Serif' },
  { name: 'Josefin Sans', category: 'Sans Serif' },
  { name: 'Nunito', category: 'Sans Serif' },
  { name: 'Work Sans', category: 'Sans Serif' },
  { name: 'Fira Sans', category: 'Sans Serif' },
  { name: 'Quicksand', category: 'Sans Serif' },
  { name: 'Space Mono', category: 'Monospace' },
  { name: 'Roboto Mono', category: 'Monospace' },
  { name: 'Inconsolata', category: 'Monospace' },
  { name: 'Outfit', category: 'Sans Serif' },
]

const PAIRINGS = [
  { head: 'Playfair Display', body: 'Lato', name: 'Modern Elegant' },
  { head: 'Oswald', body: 'Open Sans', name: 'Bold & Clean' },
  { head: 'Montserrat', body: 'Merriweather', name: 'Classic Trust' },
  { head: 'Raleway', body: 'Roboto', name: 'Minimalist' },
  { head: 'Space Mono', body: 'Inter', name: 'Tech Blog' },
  { head: 'Outfit', body: 'Nunito', name: 'Friendly UI' },
]

const THEMES = [
  { name: 'Omni Dark', bg: '#252826', text: '#f5f5f8', accent: '#df1c26' },
  { name: 'Clean Light', bg: '#ffffff', text: '#1e293b', accent: '#3b82f6' },
  { name: 'Midnight', bg: '#0f172a', text: '#f8fafc', accent: '#38bdf8' },
  { name: 'Paper', bg: '#fefce8', text: '#422006', accent: '#d97706' },
  { name: 'Forest', bg: '#022c22', text: '#ecfdf5', accent: '#34d399' },
]

export default function WebFontPairerPage() {
  const [headingFont, setHeadingFont] = useState('Outfit')
  const [bodyFont, setBodyFont] = useState('Inter')
  const [headingWeight, setHeadingWeight] = useState(700)
  const [bodyWeight, setBodyWeight] = useState(400)
  const [activeTheme, setActiveTheme] = useState(THEMES[0])
  const [isMobileView, setIsMobileView] = useState(false)
  const [showCode, setShowCode] = useState(false)

  // Construct Google Fonts URL
  const googleFontsUrl = useMemo(() => {
    const fonts = Array.from(new Set([headingFont, bodyFont]))
    const query = fonts.map(f => `family=${f.replace(/ /g, '+')}:wght@300;400;500;600;700`).join('&')
    return `https://fonts.googleapis.com/css2?${query}&display=swap`
  }, [headingFont, bodyFont])

  const applyPairing = (head: string, body: string) => {
    setHeadingFont(head)
    setBodyFont(body)
  }

  const cssCode = useMemo(() => {
    return `/* Add to <head> */
<link href="${googleFontsUrl}" rel="stylesheet">

/* CSS Variables */
:root {
  --font-heading: '${headingFont}', sans-serif;
  --font-body: '${bodyFont}', sans-serif;
}

/* Usage */
h1, h2, h3 {
  font-family: var(--font-heading);
  font-weight: ${headingWeight};
}

body {
  font-family: var(--font-body);
  font-weight: ${bodyWeight};
  color: ${activeTheme.text};
  background: ${activeTheme.bg};
}`
  }, [googleFontsUrl, headingFont, bodyFont, headingWeight, bodyWeight, activeTheme])

  const copyCode = () => {
    navigator.clipboard.writeText(cssCode)
    toast.success('CSS copied to clipboard!')
  }

  return (
    <ToolLayout
      title="Web Font Pairer"
      description="Visualise and test premium font combinations with a live, interactive preview."
      icon={<Type className="w-8 h-8" />}
      actions={
        <div className="flex gap-2">
            <button 
              onClick={() => {
                const randomHead = FONTS[Math.floor(Math.random() * FONTS.length)].name;
                const randomBody = FONTS[Math.floor(Math.random() * FONTS.length)].name;
                applyPairing(randomHead, randomBody);
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-omni-primary/10 text-omni-primary hover:bg-omni-primary/20 rounded-lg transition-colors font-medium text-sm"
            >
              <RefreshCw className="w-4 h-4" /> Randomize
            </button>
            <button 
              onClick={() => setShowCode(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-omni-text/10 text-omni-text hover:bg-omni-text/20 rounded-lg transition-colors font-medium text-sm"
            >
              <Code className="w-4 h-4" /> Export CSS
            </button>
        </div>
      }
    >
      {/* Inject Styles for Fonts */}
      <link href={googleFontsUrl} rel="stylesheet" />

      {/* Code Export Modal */}
      <AnimatePresence>
        {showCode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-omni-bg border border-omni-text/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
             >
               <div className="flex items-center justify-between p-4 border-b border-omni-text/5">
                 <h3 className="text-lg font-bold font-mono">Export Typography</h3>
                 <button onClick={() => setShowCode(false)} className="p-1 hover:bg-omni-text/10 rounded-full transition-colors">
                   <X className="w-5 h-5" />
                 </button>
               </div>
               <div className="p-0">
                 <CodeEditor value={cssCode} language="css" readOnly className="min-h-[300px]" />
               </div>
               <div className="p-4 border-t border-omni-text/5 flex justify-end">
                 <button 
                   onClick={copyCode}
                   className="flex items-center gap-2 px-6 py-2 bg-omni-primary text-white rounded-lg hover:bg-omni-primary-hover transition-colors font-bold"
                 >
                   <Copy className="w-4 h-4" /> Copy Snippet
                 </button>
               </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 xl:grid-cols-[350px_1fr] gap-8 h-full min-h-[600px]">
        {/* Controls Panel */}
        <div className="space-y-6">
          <div className="p-6 bg-omni-bg/40 border border-omni-text/5 rounded-2xl space-y-6">
            <h3 className="text-lg font-bold text-omni-text/90 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-omni-primary" /> Curated Pairings
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {PAIRINGS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => applyPairing(p.head, p.body)}
                  className={`group flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                    headingFont === p.head && bodyFont === p.body
                      ? 'bg-omni-primary/10 border-omni-primary/40 shadow-[0_0_15px_rgba(223,28,38,0.1)]'
                      : 'bg-omni-bg/50 border-omni-text/5 hover:bg-omni-text/5'
                  }`}
                >
                  <div>
                    <div className="font-bold text-omni-text text-sm">{p.name}</div>
                    <div className="text-xs text-omni-text/40">{p.head} + {p.body}</div>
                  </div>
                  {headingFont === p.head && bodyFont === p.body && <Check className="w-4 h-4 text-omni-primary" />}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 bg-omni-bg/40 border border-omni-text/5 rounded-2xl space-y-6">
             <div className="space-y-3">
               <label className="text-sm font-bold text-omni-text/70">Heading Font</label>
               <select 
                 value={headingFont} 
                 onChange={(e) => setHeadingFont(e.target.value)}
                 className="w-full bg-omni-bg border border-omni-text/10 rounded-lg px-3 py-2 text-sm text-omni-text focus:outline-none focus:border-omni-primary/50"
               >
                 {FONTS.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
               </select>
               <input 
                 type="range" min="100" max="900" step="100" 
                 value={headingWeight} onChange={(e) => setHeadingWeight(Number(e.target.value))} 
                 className="w-full accent-omni-primary"
               />
             </div>

             <div className="space-y-3">
               <label className="text-sm font-bold text-omni-text/70">Body Font</label>
               <select 
                 value={bodyFont} 
                 onChange={(e) => setBodyFont(e.target.value)}
                 className="w-full bg-omni-bg border border-omni-text/10 rounded-lg px-3 py-2 text-sm text-omni-text focus:outline-none focus:border-omni-primary/50"
               >
                 {FONTS.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
               </select>
               <input 
                 type="range" min="100" max="900" step="100" 
                 value={bodyWeight} onChange={(e) => setBodyWeight(Number(e.target.value))} 
                 className="w-full accent-omni-primary"
               />
             </div>
          </div>
        </div>

        {/* Live Preview Area */}
        <div className="flex flex-col gap-4">
           {/* Preview Toolbar */}
           <div className="flex flex-wrap gap-4 justify-between items-center">
              <div className="flex gap-1 bg-omni-bg/40 p-1 rounded-lg border border-omni-text/5">
                <button
                  onClick={() => setIsMobileView(false)}
                  className={`p-2 rounded-md transition-colors ${!isMobileView ? 'bg-omni-primary/20 text-omni-primary' : 'text-omni-text/40 hover:text-omni-text'}`}
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsMobileView(true)}
                  className={`p-2 rounded-md transition-colors ${isMobileView ? 'bg-omni-primary/20 text-omni-primary' : 'text-omni-text/40 hover:text-omni-text'}`}
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                 {THEMES.map(theme => (
                   <button 
                    key={theme.name}
                    onClick={() => setActiveTheme(theme)}
                    className={`px-3 py-1.5 rounded-lg border shadow-sm transition-all flex items-center gap-2 whitespace-nowrap ${
                      activeTheme.name === theme.name 
                        ? 'border-omni-primary ring-1 ring-omni-primary/30' 
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: theme.bg, color: theme.text }}
                   >
                     <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.accent }} />
                     <span className="text-xs font-bold">{theme.name}</span>
                   </button>
                 ))}
              </div>
           </div>

           {/* The Preview Card Container */}
           <div className="flex-1 flex items-center justify-center p-4 min-h-[500px] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed opacity-100 transition-all rounded-3xl border border-omni-text/5 relative overflow-hidden">
             
             {/* The Preview Card Itself */}
             <motion.div 
               layout
               initial={false}
               animate={{ 
                 width: isMobileView ? 375 : '100%',
                 borderRadius: isMobileView ? 40 : 24,
               }}
               transition={{ type: "spring", stiffness: 200, damping: 25 }}
               className="h-full shadow-2xl overflow-hidden relative transition-colors duration-500 border border-white/5 mx-auto"
               style={{ backgroundColor: activeTheme.bg, color: activeTheme.text }}
             >
                {/* Decorative elements */}
                <div 
                  className="absolute top-0 right-0 w-64 h-64 opacity-10 rounded-bl-[100px] pointer-events-none transition-colors duration-500" 
                  style={{ background: `linear-gradient(to bottom left, ${activeTheme.accent}, transparent)` }}
                />
                
                <div className="relative z-10 w-full h-full overflow-y-auto custom-scrollbar p-8 md:p-12">
                   <div className="space-y-8">
                      <div className="flex items-center justify-between">
                         <span 
                            className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full font-mono transition-colors duration-500"
                            style={{ backgroundColor: `${activeTheme.accent}20`, color: activeTheme.accent, fontFamily: bodyFont }}
                          >
                            Article Preview
                          </span>
                          <span className="text-xs opacity-40 font-mono">12 MIN READ</span>
                      </div>

                      <h1 
                        style={{ fontFamily: headingFont, fontWeight: headingWeight }}
                        className="text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight"
                      >
                        The Quick Brown Fox Jumps Over The Lazy Dog.
                      </h1>

                      <div className="flex items-center gap-4 py-4 border-y" style={{ borderColor: `${activeTheme.text}10` }}>
                        <div className="w-10 h-10 rounded-full opacity-20" style={{ backgroundColor: activeTheme.text }} />
                        <div className="flex-1">
                          <p className="text-sm font-bold opacity-80" style={{ fontFamily: headingFont }}>Jane Designer</p>
                          <p className="text-xs opacity-50" style={{ fontFamily: bodyFont }}>Senior Typographer</p>
                        </div>
                      </div>

                      <p 
                        style={{ fontFamily: bodyFont, fontWeight: bodyWeight }}
                        className="text-lg md:text-xl leading-relaxed opacity-80"
                      >
                        Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed. The arrangement of type involves selecting typefaces, point sizes, line lengths, line-spacing (leading), and letter-spacing (tracking).
                      </p>

                      <div className="grid grid-cols-1 gap-6 pt-6">
                         <div 
                           className="bg-black/5 rounded-2xl p-6 space-y-2 backdrop-blur-sm border"
                           style={{ borderColor: `${activeTheme.text}10`, backgroundColor: `${activeTheme.text}05` }}
                         >
                            <h3 style={{ fontFamily: headingFont, fontWeight: headingWeight }} className="text-xl">Do you know?</h3>
                            <p style={{ fontFamily: bodyFont, fontWeight: bodyWeight }} className="text-sm opacity-70 leading-relaxed">
                              Good font pairings create balance and harmony. The contrast between <span style={{ color: activeTheme.accent }} className='font-bold'>{headingFont}</span> and <span style={{ color: activeTheme.accent }} className='font-bold'>{bodyFont}</span> establishes a clear visual hierarchy.
                            </p>
                         </div>
                      </div>

                      <button 
                        className="mt-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-all group"
                        style={{ fontFamily: bodyFont, color: activeTheme.accent }}
                      >
                        Read Full Story <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                   </div>
                </div>
             </motion.div>
           </div>
        </div>
      </div>
    </ToolLayout>
  )
}
