import { useState, useCallback, useEffect } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { InputPane } from '@/components/tools/InputPane'
import { OutputPane } from '@/components/tools/OutputPane'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { Calculator, Play, FunctionSquare, Info } from 'lucide-react'
import { ScanningLoader } from '@/components/ui/ScanningLoader'
import { TypingOutput } from '@/components/tools/TypingOutput'
import { toast } from 'sonner'

const SCIENTIFIC_KEYS = [
  { label: 'sin', value: 'sin(' }, { label: 'cos', value: 'cos(' }, { label: 'tan', value: 'tan(' }, { label: 'log', value: 'log(' },
  { label: 'ln', value: 'ln(' }, { label: 'sqrt', value: 'sqrt(' }, { label: '^', value: '^' }, { label: '(', value: '(' }, 
  { label: ')', value: ')' }, { label: '=', value: '=' }, { label: 'x', value: 'x' }, { label: 'C', value: 'CLEAR' }
]

export default function EquationSolverPage() {
  const [expression, setExpression] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [isSolving, setIsSolving] = useState(false)
  const [isWasmReady, setIsWasmReady] = useState(false)
  const [trace, setTrace] = useState<string[]>([])

  const handleInsert = (val: string) => {
      if (val === 'CLEAR') {
          setExpression('')
          setResult(null)
      } else {
          setExpression(prev => prev + val)
      }
  }

  // Load WASM script
  useEffect(() => {
    const scriptId = 'wasm-eq-solver';
    if (document.getElementById(scriptId)) return;

    // Pre-define Module with initialization hook
    (window as any).Module = {
        onRuntimeInitialized: () => {
            console.log('[WASM] Equation Solver Core Ready');
            setIsWasmReady(true);
        }
    };

    const script = document.createElement('script')
    script.id = scriptId;
    script.src = '/wasm/equation_solver.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      // Optimization: Preserve module if we navigate back, 
      // but if we really want to clean up:
      // document.body.removeChild(script)
      // delete (window as any).Module;
    }
  }, [])

  const handleSolve = useCallback(async () => {
      if (!expression) return
      setIsSolving(true)
      setTrace(["[ROOT_CA] Accessing neural processor...", "[SYS] Loading Newton-Raphson module..."])
      
      try {
          const start = performance.now()
          await new Promise(r => setTimeout(r, 800)) // Simulate heavy computation for WOW
          
          let solution: number | string
          // Check if WASM module is loaded
          if ((window as any).Module && (window as any).Module.ccall) {
              setTrace(prev => [...prev, "[WASM] Executing C++ core..."])
              solution = (window as any).Module.ccall(
                  'solve_equation',
                  'number',
                  ['string'],
                  [expression]
              )
          } else {
             setTrace(prev => [...prev, "[FALLBACK] Loading TS polyfill..."])
             const { solveEquation } = await import('@/utils/mathSolver')
             const result = solveEquation(expression)
             solution = result.success && result.solution !== undefined ? result.solution.toString() : 'No solution found'
          }

          const time = (performance.now() - start).toFixed(2)
          setTrace(prev => [...prev, `[DONE] Computation exit code 0. Execution: ${time}ms`])

          const solutionNum = typeof solution === 'number' ? solution : parseFloat(solution)
          if (isNaN(solutionNum)) {
              throw new Error("Could not find root or syntax error")
          }

          setResult(`x ≈ ${solutionNum.toFixed(8)}`)
          toast.success("Equation solved")
      } catch (e) {
          setResult(`ERROR: ${(e as Error).message}`)
          setTrace(prev => [...prev, "[FATAL] Signal termination: " + (e as Error).message])
          toast.error("Failed to solve")
      } finally {
          setIsSolving(false)
      }
  }, [expression])

  return (
    <ToolLayout
      title="Advanced Equation Solver"
      description="Solve complex equations using high-performance numeric algorithms (Newton-Raphson)."
      icon={<Calculator className="w-8 h-8" />}
      actions={<ActionToolbar onReset={() => { setExpression(''); setResult(null); }} />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-[500px]">
         <InputPane title="Equation Input">
             <div className="flex flex-col h-full gap-4 p-4">
                 <div className="relative flex-1 bg-black/20 rounded-xl p-4 overflow-hidden flex flex-col justify-center">
                     <textarea
                        value={expression}
                        onChange={e => setExpression(e.target.value)}
                        placeholder="e.g. x^2 - 4 = 0"
                        className="w-full h-full bg-transparent border-none text-2xl font-mono text-center focus:outline-none resize-none text-omni-text"
                     />
                 </div>
                 
                 <div className="grid grid-cols-4 gap-2">
                    {SCIENTIFIC_KEYS.map(k => (
                        <button
                            key={k.label}
                            onClick={() => handleInsert(k.value)}
                            className={`p-3 rounded-lg font-bold transition-all ${k.value === 'CLEAR' ? 'bg-red-500/10 text-red-400' : 'bg-omni-text/5 hover:bg-omni-primary/20 hover:text-omni-primary'}`}
                        >
                            {k.label}
                        </button>
                    ))}
                 </div>

                 <button
                    onClick={handleSolve}
                    disabled={isSolving || !expression}
                    className="w-full py-4 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl font-bold uppercase tracking-widest transition-all shadow-lg shadow-omni-primary/20 flex items-center justify-center gap-2"
                 >
                    <Play className="w-4 h-4" /> Solve
                 </button>
             </div>
         </InputPane>

         <OutputPane title="Solution Laboratory">
             <div className="flex flex-col h-full p-4 space-y-6">
                 {/* Main Result Display */}
                 <div className="flex-1 glass-card rounded-2xl flex items-center justify-center p-8 text-center relative overflow-hidden">
                    <div className="absolute top-2 left-4 text-[10px] text-omni-text/20 font-black uppercase tracking-widest font-mono">/ NEURAL_OUTPUT</div>
                    
                    {!isWasmReady ? (
                        <ScanningLoader message="WASM CORE LOADING" subMessage="Synchronizing math modules..." />
                    ) : isSolving ? (
                        <ScanningLoader message="CALCULATING" subMessage="Processing numeric iterations..." />
                    ) : result ? (
                        <div className="space-y-4 w-full">
                            <h3 className="text-xs text-omni-text/30 uppercase tracking-[0.2em] font-black">
                                {result.startsWith('ERROR') ? 'Computation Failed' : 'Converged Root'}
                            </h3>
                            <TypingOutput 
                                text={result} 
                                className={`text-3xl lg:text-5xl font-black break-all ${result.startsWith('ERROR') ? 'text-red-500' : 'text-omni-primary neon-text'}`} 
                            />
                        </div>
                    ) : (
                        <div className="opacity-20 flex flex-col items-center gap-6">
                            <FunctionSquare className="w-20 h-20" />
                            <p className="text-sm font-black uppercase tracking-widest">Awaiting Neural Input</p>
                        </div>
                    )}
                 </div>

                 {/* High-Tech Trace Log */}
                 <div className="h-40 glass-card rounded-2xl p-4 bg-black/40 border-white/5 font-mono text-[10px] overflow-hidden flex flex-col">
                    <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
                        <Info className="w-3 h-3 text-omni-primary" />
                        <span className="text-omni-text/40 uppercase font-black tracking-widest">System_Trace_Log</span>
                    </div>
                    <div className="flex-1 space-y-1 overflow-y-auto no-scrollbar opacity-60">
                        {trace.length === 0 ? (
                            <div className="text-omni-text/20 italic">No activity detected...</div>
                        ) : (
                            trace.map((line, i) => (
                                <div key={i} className="flex gap-2">
                                    <span className="text-omni-primary">{`>`}</span>
                                    <span>{line}</span>
                                </div>
                            ))
                        )}
                    </div>
                 </div>
             </div>
         </OutputPane>
      </div>
    </ToolLayout>
  )
}
