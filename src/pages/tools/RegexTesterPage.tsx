import { useState, useMemo } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { CodeEditor } from '@/components/ui/CodeEditor'
import { Hash } from 'lucide-react'

// TODO: Future optimization: Use WASM (onigasm or PCRE) for heavy regex operations
// For MVP, native JS RegExp is sufficient and performant for typical use cases.

export default function RegexTesterPage() {
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState('gm')
  const [text, setText] = useState('')

  const { matches, error } = useMemo(() => {
    if (!pattern) return { matches: [], error: null }
    try {
      const regex = new RegExp(pattern, flags)
      const matches = Array.from(text.matchAll(regex))
      return { matches, error: null }
    } catch {
      // If 'e' is not captured, we can't access its message directly.
      // Returning a generic error message or null for the error.
      return { matches: [], error: 'Invalid regular expression' }
    }
  }, [pattern, flags, text])

  // Simple highlighter logic (MVP) - for rich highlighting we'd need a more complex overlay
  // This is a placeholder for the visual feedback
  const matchCount = matches.length

  return (
    <ToolLayout
      title="RegEx Tester"
      description="Test regular expressions against text. Real-time matching and error detection."
      icon={<Hash className="w-8 h-8" />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-[500px]">
        
        {/* Configuration Column */}
        <div className="flex flex-col gap-4">
             {/* Pattern Input */}
            <div className="space-y-2">
                <div className="flex justify-between">
                    <label className="text-sm font-medium text-omni-text/70">Pattern</label>
                    {error && <span className="text-xs text-red-500 animate-pulse">{error}</span>}
                </div>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-2.5 text-omni-text/40 font-mono">/</span>
                        <input 
                            type="text" 
                            value={pattern}
                            onChange={(e) => setPattern(e.target.value)}
                            placeholder="regex..."
                            className="w-full bg-omni-bg/50 border border-omni-text/10 rounded-lg py-2 px-6 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-omni-primary/50 text-omni-text"
                        />
                         <span className="absolute right-3 top-2.5 text-omni-text/40 font-mono">/</span>
                    </div>
                    <input 
                        type="text" 
                        value={flags}
                        onChange={(e) => setFlags(e.target.value)}
                        placeholder="flags"
                        className="w-20 bg-omni-bg/50 border border-omni-text/10 rounded-lg py-2 px-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-omni-primary/50 text-omni-text"
                    />
                </div>
            </div>

            {/* Test String */}
            <div className="flex-1 flex flex-col gap-2">
                <label className="text-sm font-medium text-omni-text/70">Test String</label>
                <CodeEditor 
                    value={text} 
                    onChange={setText} 
                    language="json" // Using JSON syntax for simple text highlighting for now
                    placeholder="Paste text here to test..."
                    className="flex-1 border-omni-text/20"
                />
            </div>
        </div>

        {/* Results Column */}
        <div className="flex flex-col gap-2">
             <div className="flex justify-between items-center bg-omni-bg/50 p-2 rounded-lg border border-omni-text/10">
                <span className="text-sm font-medium text-omni-text/70">Matches</span>
                <span className="text-xs px-2 py-0.5 bg-omni-primary/20 text-omni-primary rounded-full font-mono">
                    {matchCount} found
                </span>
            </div>
            
            <div className="flex-1 bg-omni-bg/30 rounded-lg border border-omni-text/10 p-4 overflow-y-auto font-mono text-sm space-y-2">
                {matchCount === 0 && !error && (
                    <div className="text-omni-text/40 italic text-center mt-10">No matches found</div>
                )}
                 {matches.map((match, i) => (
                    <div key={i} className="p-2 bg-omni-bg/50 rounded border border-omni-text/5 hover:border-omni-primary/30 transition-colors">
                        <div className="flex justify-between text-xs text-omni-text/50 mb-1">
                            <span>Match {i + 1}</span>
                            <span>Index: {match.index}</span>
                        </div>
                        <div className="text-omni-text break-all bg-omni-primary/10 px-1 rounded inline-block">
                            {String(match[0])}
                        </div>
                        {/* Capture Groups */}
                        {match.length > 1 && (
                             <div className="mt-2 pl-2 border-l-2 border-omni-text/10 space-y-1">
                                {Array.from(match).slice(1).map((group, groupIndex) => (
                                    <div key={groupIndex} className="text-xs flex gap-2">
                                        <span className="text-omni-primary">Group {groupIndex + 1}:</span>
                                        <span className="text-omni-text/70">{String(group)}</span>
                                    </div>
                                ))}
                             </div>
                        )}
                    </div>
                ))}
            </div>
        </div>

      </div>
    </ToolLayout>
  )
}
