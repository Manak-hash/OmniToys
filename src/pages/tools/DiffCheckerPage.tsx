import { useState, useEffect } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { InputPane } from '@/components/tools/InputPane'
import { OutputPane } from '@/components/tools/OutputPane'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { FileDiff, Split, Code, Info } from 'lucide-react'
import { ScanningLoader } from '@/components/ui/ScanningLoader'
import { computeDiff } from '@/utils/diffChecker'

export default function DiffCheckerPage() {
    const [leftText, setLeftText] = useState('')
    const [rightText, setRightText] = useState('')
    const [diffs, setDiffs] = useState<ReturnType<typeof computeDiff> | null>(null)
    const [splitView, setSplitView] = useState(true)
    const [isCalculating, setIsCalculating] = useState(false)

    const [isWasmLoaded, setIsWasmLoaded] = useState(false)

    useEffect(() => {
        // Load WASM Module
        const scriptId = 'wasm-diff-checker'
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script')
            script.id = scriptId
            script.src = '/wasm/diff_checker.js'
            script.async = true
            script.onload = async () => {
                console.log('[WASM] Diff Checker script loaded, initializing module...')
                try {
                    const DiffChecker = (window as any).DiffChecker
                    if (typeof DiffChecker === 'function') {
                        const module = await DiffChecker()
                        ;(window as any).DiffCheckerModule = module
                        console.log('[WASM] Diff Checker module ready')
                        setIsWasmLoaded(true)
                    } else {
                        throw new Error('DiffChecker not found on window')
                    }
                } catch (err) {
                    console.error('[WASM] Failed to initialize DiffChecker:', err)
                    // Still set true to use fallback
                    setIsWasmLoaded(true)
                }
            }
            script.onerror = () => {
                console.error('[WASM] Failed to load Diff Checker script')
                setIsWasmLoaded(true) // Use fallback
            }
            document.body.appendChild(script)
        } else {
            // Script already exists, check if module is loaded
            if ((window as any).DiffCheckerModule) {
                setIsWasmLoaded(true)
            }
        }
    }, [])

    useEffect(() => {
        if (!leftText && !rightText) {
            setDiffs(null)
            return
        }
        setIsCalculating(true)
        // Debounce calculation
        const t = setTimeout(() => {
            try {
                let calculatedDiffs = null;
                // Try WASM first
                const module = (window as any).DiffCheckerModule
                if (isWasmLoaded && module && module._compute_diff) {
                    try {
                        // Get result pointer and convert to string
                        const resultPtr = module._compute_diff(leftText, rightText)
                        const wasmResult = module.UTF8ToString ? module.UTF8ToString(resultPtr) : resultPtr

                        // Parse WASM output format: "  line", "+ line", "- line"
                        if (wasmResult && typeof wasmResult === 'string') {
                            calculatedDiffs = wasmResult.split('\n')
                                .filter(line => line.length > 0)
                                .map(line => {
                                    const prefix = line.substring(0, 2)
                                    const value = line.substring(2)
                                    if (prefix === '+ ') return { type: 'ins' as const, value }
                                    if (prefix === '- ') return { type: 'del' as const, value }
                                    return { type: 'eq' as const, value: line.substring(2) || line }
                                })
                            console.log('[WASM] Diff computed successfully')
                        } else {
                            throw new Error('WASM returned invalid result')
                        }
                    } catch (e) {
                        console.error('WASM Diff Error:', e);
                        calculatedDiffs = computeDiff(leftText, rightText);
                    }
                } else {
                    calculatedDiffs = computeDiff(leftText, rightText);
                }
                setDiffs(calculatedDiffs);
            } finally {
                setIsCalculating(false)
            }
        }, 800)
        return () => clearTimeout(t)
    }, [leftText, rightText, isWasmLoaded])

    const handleReset = () => {
        setLeftText('')
        setRightText('')
        setDiffs(null)
    }

    return (
        <ToolLayout
            title="Pro Diff Checker"
            description="High-performance text difference analyzer optimized with custom algorithms."
            icon={<FileDiff className="w-8 h-8" />}
            actions={
                <ActionToolbar onReset={handleReset}>
                    <button 
                        onClick={() => setSplitView(!splitView)}
                        className={`p-2 rounded-md transition-colors ${splitView ? 'bg-omni-primary/20 text-omni-primary' : 'hover:bg-white/10 text-omni-text/60'}`}
                        title={splitView ? "Switch to Unified View" : "Switch to Split View"}
                    >
                        <Split className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-white/10 mx-1" />
                </ActionToolbar>
            }
        >
            <div className={`grid gap-6 h-full min-h-[600px] ${splitView ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {/* Input Area - Hidden when viewing diff in unified mode? No, always show inputs or diffs? 
                    Let's show Side-by-Side inputs that highlight diffs. 
                */}
                
                <InputPane title="Original Text" className="min-h-[300px]">
                    <textarea 
                        className="w-full h-full bg-transparent border-none resize-none p-4 font-mono text-sm focus:outline-none text-omni-text/80"
                        placeholder="Paste original text here..."
                        value={leftText}
                        onChange={e => setLeftText(e.target.value)}
                    />
                </InputPane>

                <InputPane title="Modified Text" className="min-h-[300px]">
                    <textarea 
                         className="w-full h-full bg-transparent border-none resize-none p-4 font-mono text-sm focus:outline-none text-omni-text/80"
                         placeholder="Paste modified text here..."
                         value={rightText}
                         onChange={e => setRightText(e.target.value)}
                    />
                </InputPane>
            </div>
            
            {(isCalculating || diffs || (leftText && rightText)) && (
                <OutputPane title="Difference Analysis" className="mt-8 min-h-[400px]">
                    <div className="flex flex-col h-full bg-[#1e1e1e] rounded-2xl overflow-hidden glass-card min-h-[300px]">
                        {!isWasmLoaded && !isCalculating && !diffs ? (
                            <div className="flex items-center justify-center h-full p-12">
                                <ScanningLoader message="INITIALIZING" subMessage="Synchronizing neural diff modules..." />
                            </div>
                        ) : isCalculating ? (
                            <div className="flex items-center justify-center h-full p-12">
                                <ScanningLoader message="ANALYZING TEXT" subMessage="Detecting structural changes..." />
                            </div>
                        ) : diffs && diffs.length > 0 ? (
                            // Check if there are actual differences
                            diffs.every(p => p.type === 'eq') ? (
                                <div className="flex flex-col items-center justify-center h-full p-12 text-center opacity-50 space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                                        <Code className="w-8 h-8 text-green-400" />
                                    </div>
                                    <p className="font-mono text-sm uppercase tracking-widest text-green-400">Binary Match: No Changes Detected</p>
                                </div>
                            ) : (
                                <div className="p-0 font-mono text-sm h-full overflow-auto custom-scrollbar">
                                    <div className="bg-black/40 p-2 flex items-center gap-2 border-b border-white/5">
                                        <Info className="w-3 h-3 text-omni-primary" />
                                        <span className="text-[10px] text-omni-text/40 font-black uppercase tracking-widest">Diff_Output_Stream</span>
                                    </div>
                                    {diffs.map((part, i) => (
                                        <div key={i} className={`flex transition-colors hover:bg-white/5 ${
                                            part.type === 'ins' ? 'bg-green-500/10 text-green-400' :
                                            part.type === 'del' ? 'bg-red-500/10 text-red-400 decoration-line-through decoration-red-500/30' :
                                            'text-omni-text/50'
                                        }`}>
                                            <span className={`w-10 text-right select-none pr-3 opacity-30 border-r border-white/5 mr-3 bg-black/20 text-[10px] py-1 font-black`}>
                                                {part.type === 'del' ? '-' : part.type === 'ins' ? '+' : ' '}
                                            </span>
                                            <span className="whitespace-pre-wrap py-1 break-all">{part.value}</span>
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : null}
                    </div>
                </OutputPane>
            )}
        </ToolLayout>
    )
}
