import { useState, useRef, useEffect } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Terminal, Play, Trash2, Cpu, Code2, Loader2, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { CodeEditor } from '@/components/ui/CodeEditor'
import { cn } from '@/utils/cn'
import { omniInterpreter } from '@/utils/interpreter/OmniInterpreter'

const LANGUAGES = [
  { id: 'c', name: 'C', icon: Code2, enabled: true, color: '#03599C' },
  { id: 'cpp', name: 'C++', icon: Code2, enabled: true, color: '#00599C' },
  { id: 'python', name: 'Python', icon: Code2, enabled: false },
  { id: 'javascript', name: 'JavaScript', icon: Code2, enabled: false },
  { id: 'typescript', name: 'TypeScript', icon: Code2, enabled: false },
  { id: 'java', name: 'Java', icon: Code2, enabled: false },
  { id: 'html', name: 'HTML', icon: Code2, enabled: false },
  { id: 'php', name: 'PHP', icon: Code2, enabled: false },
]

// OmniNative Learning Tool - Simplified C Interpreter
// Supported: printf("string"), variable assignments, basic arithmetic
const DEFAULT_CODE = {
  c: `// Simple printf example
printf("Hello from C!");
printf("\\nWelcome to OmniNative Learning Tool\\n");

// Variable assignment
x = 42;
y = 10;

// More output
printf("x = ");
printf("done");
printf("\\n");`,
  cpp: `// C++ style comments work too
printf("Hello from C++!");
printf("\\nOmniNative Learning Tool\\n");

// Variable assignments
value = 100;
result = 25;

printf("Variables initialized\\n");
printf("Execution complete\\n");`
}

export default function OnlineCompilerPage() {
  const [activeLang, setActiveLang] = useState('cpp')
  const [code, setCode] = useState(DEFAULT_CODE.cpp)
  const [output, setOutput] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [isWasmReady, setIsWasmReady] = useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (activeLang === 'c' || activeLang === 'cpp') {
      setCode(DEFAULT_CODE[activeLang as keyof typeof DEFAULT_CODE])
    }
  }, [activeLang])

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [output])

  useEffect(() => {
      // Initial Welcome Message
      setOutput([
          '> System Online.',
          '> OmniNative Virtual Machine: INITIALIZING...',
          '> Loading WASM core...'
      ])

      // Load WASM script
      const scriptId = 'wasm-omni-native'
      if (document.getElementById(scriptId)) return

      // Pre-define Module with initialization hook
      (window as any).Module = {
          onRuntimeInitialized: () => {
              console.log('[WASM] OmniNative Core Ready')
              setIsWasmReady(true)
              setOutput(prev => [...prev, '> OmniNative Virtual Machine: READY.'])
          }
      }

      const script = document.createElement('script')
      script.id = scriptId
      script.src = '/wasm/omni_native.js'
      script.async = true
      document.body.appendChild(script)

      return () => {
          // Keep module in memory for potential re-use
          // Don't remove the script as the module needs to persist
      }
  }, [])

  const runCode = async () => {
    setIsRunning(true)
    setOutput(prev => [...prev, '', `> Compiling & Executing (OmniNative VM)...`])

    try {
        if ((activeLang === 'c' || activeLang === 'cpp') && isWasmReady && (window as any).Module && (window as any).Module.ccall) {
             // Real WASM Compiler
             setOutput(prev => [...prev, '> [WASM] Executing C++ core...'])
             const result = (window as any).Module.ccall(
                'compile_and_run',
                'string',
                ['string'],
                [code]
             )
             setOutput(prev => [...prev, result, '', '> Process finished (Exit Code 0).'])
        } else {
             // Fallback - TypeScript interpreter
             setOutput(prev => [...prev, '> [FALLBACK] Using embedded TypeScript interpreter...'])
             await new Promise(r => setTimeout(r, 400));
             const result = omniInterpreter.execute(code);
             setOutput(prev => [...prev, ...result, '', '> Process finished.']);
        }
    } catch (error) {
       setOutput(prev => [...prev, `> Execution Error: ${error}`])
    } finally {
      setIsRunning(false)
    }
  }

  const clearOutput = () => {
    setOutput([])
  }

  return (
    <ToolLayout
      title="Online Compiler (Laboratory)"
      description="Compile and run C/C++ code directly in your browser. Powered by OmniInterpreter."
      icon={<Cpu className="w-8 h-8" />}
      actions={
        <div className="flex gap-2">
           <button 
                onClick={runCode}
                disabled={isRunning}
                className="flex items-center gap-2 px-5 py-2.5 bg-omni-primary text-white hover:bg-omni-primary-hover rounded-2xl transition-all font-black uppercase tracking-widest text-xs shadow-xl shadow-omni-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
             >
                {isRunning ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> EXECUTING...</>
                ) : (
                    <><Play className="w-4 h-4 fill-current" /> RUN_CORE</>
                )}
           </button>
        </div>
      }
    >
      <div className="flex flex-col h-[calc(100vh-250px)] min-h-[600px] gap-4">
        {/* Language Bar - Horizontal Scroll on Mobile */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-omni-text/5 px-1 flex-shrink-0">
           {LANGUAGES.map(lang => (
             <button
               key={lang.id}
               disabled={!lang.enabled}
               onClick={() => lang.enabled && setActiveLang(lang.id)}
               className={cn(
                 "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap text-sm font-mono font-bold",
                 activeLang === lang.id 
                   ? 'bg-omni-primary/10 border-omni-primary text-omni-primary shadow-[0_0_10px_rgba(223,28,38,0.2)]'
                   : lang.enabled 
                     ? 'bg-omni-bg/40 border-omni-text/10 hover:border-omni-text/30 opacity-70 hover:opacity-100'
                     : 'bg-transparent border-transparent opacity-30 cursor-not-allowed grayscale'
               )}
             >
               <lang.icon className="w-4 h-4" />
               {lang.name}
               {!lang.enabled && <span className="text-[9px] bg-omni-text/10 px-1.5 py-0.5 rounded ml-2">SOON</span>}
             </button>
           ))}
        </div>

        {/* Main Layout: Flex Col on Mobile, Grid on Desktop */}
        <div className="flex-1 flex flex-col lg:grid lg:grid-cols-2 gap-4 min-h-0 relative">
          
          {/* Editor Pane */}
          <div className="flex flex-col gap-2 relative group flex-1 min-h-[300px] lg:h-auto">
             <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="px-2 py-1 bg-omni-bg/80 backdrop-blur rounded text-xs font-mono border border-omni-text/10">main.{activeLang === 'cpp' ? 'cpp' : 'c'}</span>
             </div>
             <CodeEditor 
               value={code} 
               onChange={setCode}
               language={activeLang === 'c' ? 'c' : 'cpp'} 
               className="h-full bg-omni-bg/60 border border-omni-text/10 rounded-2xl shadow-inner overflow-hidden"
             />
          </div>

          {/* Output / Terminal Pane */}
          <div className="flex flex-col gap-2 flex-1 min-h-[200px] lg:h-auto">
             <div className="flex-1 bg-[#0f1115] rounded-2xl border border-omni-text/10 shadow-2xl overflow-hidden flex flex-col relative">
                {/* Terminal Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/5 flex-shrink-0">
                   <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-green-500" />
                      <span className="text-xs font-mono font-bold text-omni-text/60">
                        Console Output (Embedded)
                      </span>
                   </div>
                   <div className="flex gap-2">
                      <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border ${
                          isWasmReady
                              ? 'text-green-500 bg-green-500/10 border-green-500/20'
                              : 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
                      }`}>
                          <Zap className="w-3 h-3" /> {isWasmReady ? 'WASM Ready' : 'Loading...'}
                      </span>
                      <button 
                        onClick={clearOutput}
                        className="p-1 hover:bg-white/10 rounded-md text-omni-text/40 hover:text-omni-text transition-colors"
                        title="Clear Console"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                   </div>
                </div>

                {/* Terminal Body */}
                <div 
                  ref={terminalRef}
                  className="flex-1 p-4 font-mono text-sm overflow-y-auto custom-scrollbar space-y-1 block"
                >
                   {/* Ready / Running Output */}
                   <AnimatePresence>
                      {output.map((line, i) => (
                        <motion.div 
                          key={i} 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={cn(
                            "break-all whitespace-pre-wrap",
                            line.startsWith('>') ? 'text-green-400 font-bold' : 'text-omni-text/80',
                            line.startsWith('> !') ? 'text-red-400' : '',
                            line.startsWith('Runtime Error') ? 'text-red-400' : ''
                          )}
                        >
                          {line}
                        </motion.div>
                      ))}
                      {isRunning && (
                         <motion.div 
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           className="text-omni-primary animate-pulse"
                         >
                           _
                         </motion.div>
                      )}
                   </AnimatePresence>
                </div>
             </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
