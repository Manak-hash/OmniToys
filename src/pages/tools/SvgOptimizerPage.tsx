import { useState, useMemo } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { CodeEditor } from '@/components/ui/CodeEditor'
import { PenTool, Copy, Check, Scissors, Layers } from 'lucide-react'
import { toast } from 'sonner'

export default function SvgOptimizerPage() {
  const [input, setInput] = useState('<svg width="100" height="100" viewBox="0 0 100 100">\n  <circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow" />\n</svg>')
  const [options, setOptions] = useState({
    removeComments: true,
    removeMetadata: true,
    minifyPaths: true,
    removeDimensions: false,
    prettyPrint: false,
  })

  const output = useMemo(() => {
    let result = input

    if (options.removeComments) {
      result = result.replace(/<!--[\s\S]*?-->/g, '')
    }

    if (options.removeMetadata) {
      result = result.replace(/<metadata[\s\S]*?<\/metadata>/gi, '')
      result = result.replace(/<desc[\s\S]*?<\/desc>/gi, '')
      result = result.replace(/<title[\s\S]*?<\/title>/gi, '')
      result = result.replace(/xmlns:[\w-]+="[^"]*"/g, '')
    }

    if (options.minifyPaths) {
      result = result.replace(/d="([^"]+)"/g, (_, path) => {
        const minified = path.replace(/\s+/g, ' ').trim()
        return `d="${minified}"`
      })
    }

    if (options.removeDimensions) {
      result = result.replace(/\s(width|height)="[^"]*"/g, '')
    }

    if (!options.prettyPrint) {
      result = result.replace(/>\s+</g, '><').trim()
    } else {
      result = result.replace(/>/g, '>\n').replace(/\n\n/g, '\n')
    }

    return result
  }, [input, options])

  const copyOutput = () => {
    navigator.clipboard.writeText(output)
    toast.success('Optimized SVG copied!')
  }

  const savedPercent = input.length > 0 ? (100 - (output.length / input.length * 100)).toFixed(1) : 0

  return (
    <ToolLayout
      title="SVG Path Optimizer"
      description="Minify and clean up SVG code for smaller bundle sizes and cleaner assets. Visual preview included."
      icon={<PenTool className="w-8 h-8" />}
      actions={
        <div className="flex gap-2">
           {input.length > 0 && (
             <span className="flex items-center text-xs font-mono text-green-400 bg-green-400/10 px-2 py-1 rounded">
               Saved {savedPercent}%
             </span>
           )}
           <button 
            onClick={copyOutput}
            className="flex items-center gap-2 px-3 py-1.5 bg-omni-primary/10 text-omni-primary hover:bg-omni-primary/20 rounded-lg transition-colors font-medium text-sm"
          >
            <Copy className="w-4 h-4" /> Copy
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-[600px]">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-sm font-medium text-omni-text/70">Raw SVG Input</label>
            <CodeEditor 
              value={input} 
              onChange={setInput} 
              language="xml" 
              placeholder="Paste SVG code here..."
              className="flex-1 min-h-[300px]"
            />
          </div>

          <div className="p-4 bg-omni-bg/30 border border-omni-text/5 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-omni-text/80 flex items-center gap-2">
              <Scissors className="w-4 h-4" /> Optimization Options
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(options).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setOptions({ ...options, [key as keyof typeof options]: !value })}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all text-left ${
                    value 
                      ? 'bg-omni-primary/10 border-omni-primary/30 text-omni-text' 
                      : 'bg-omni-bg/50 border-omni-text/10 text-omni-text/40'
                  }`}
                >
                  <span className="text-xs font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  {value ? <Check className="w-3 h-3 text-omni-primary" /> : <Layers className="w-3 h-3 opacity-20" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 h-1/2">
            <label className="text-sm font-medium text-omni-text/70">Visualization</label>
            <div className="flex-1 bg-white rounded-xl flex items-center justify-center p-8 overflow-hidden relative group">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />
              <div 
                className="max-w-full max-h-full transition-transform group-hover:scale-110 duration-500"
                dangerouslySetInnerHTML={{ __html: output }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 h-1/2">
            <label className="text-sm font-medium text-omni-text/70">Optimized Output</label>
            <CodeEditor 
              value={output} 
              language="xml" 
              readOnly 
              className="flex-1 bg-omni-bg/80"
            />
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
