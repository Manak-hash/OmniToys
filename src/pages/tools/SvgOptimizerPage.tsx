import { useState, useMemo } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { CodeEditor } from '@/components/ui/CodeEditor'
import { PenTool, Copy, Check, Scissors, Layers, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { optimizeSvg, formatBytes } from '@/utils/svgOptimizer'

export default function SvgOptimizerPage() {
  const [input, setInput] = useState('<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">\n  <!-- Example Circle -->\n  <circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow" />\n</svg>')
  const [options, setOptions] = useState({
    removeComments: true,
    removeMetadata: true,
    minifyPaths: true,
    removeDimensions: false,
    prettyPrint: false,
    precision: 3,
  })
  const [copied, setCopied] = useState(false)

  const result = useMemo(() => {
    return optimizeSvg(input, options)
  }, [input, options])

  const handleCopy = () => {
    navigator.clipboard.writeText(result.optimized)
    setCopied(true)
    toast.success('Optimized SVG copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const loadExample = () => {
    setInput(`<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <!-- This is a comment -->
  <metadata>
    <dc:title>Example SVG</dc:title>
  </metadata>
  <desc>A descriptive text</desc>
  <title>My SVG</title>
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:rgb(255,255,0);stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgb(255,0,0);stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" fill="url(#grad1)" />
  <circle cx="150" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow" />
  <path d="M 10 10 L 50 50 L 10 90 Z" fill="blue" />
  <text x="50" y="150" font-size="20" fill="black">Hello SVG</text>
</svg>`)
  }

  return (
    <ToolLayout
      title="SVG Path Optimizer"
      description="Minify and clean up SVG code using SVGO v3 for smaller bundle sizes"
      icon={<PenTool className="w-8 h-8" />}
      actions={
        <div className="flex gap-2">
          <button
            onClick={loadExample}
            className="flex items-center gap-2 px-3 py-1.5 bg-omni-text/10 text-omni-text hover:bg-omni-text/20 rounded-lg transition-colors font-medium text-sm"
          >
            <Zap className="w-4 h-4" /> Load Example
          </button>
          {result.savings > 0 && (
            <span className="flex items-center text-xs font-mono text-green-400 bg-green-400/10 px-2 py-1 rounded">
              -{result.savingsPercent}%
            </span>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 bg-omni-primary/10 text-omni-primary hover:bg-omni-primary/20 rounded-lg transition-colors font-medium text-sm"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? 'Copied!' : 'Copy'}
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
              <Scissors className="w-4 h-4" /> SVGO v3 Optimization Options
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(options).filter(([key]) => key !== 'precision').map(([key, value]) => (
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

            {/* Precision Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium">Path Precision: {options.precision}</label>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={options.precision}
                onChange={(e) => setOptions({ ...options, precision: parseInt(e.target.value) })}
                className="w-full h-2 bg-omni-text/10 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-xs text-omni-text/40">
                Lower precision = smaller size, higher precision = better quality
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 p-4 bg-omni-text/5 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-omni-primary">{formatBytes(result.originalSize)}</p>
              <p className="text-xs text-omni-text/60">Original</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-omni-primary">{formatBytes(result.optimizedSize)}</p>
              <p className="text-xs text-omni-text/60">Optimized</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">-{result.savingsPercent}%</p>
              <p className="text-xs text-omni-text/60">Saved</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-omni-primary">{formatBytes(result.savings)}</p>
              <p className="text-xs text-omni-text/60">Bytes Saved</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 h-1/2">
            <label className="text-sm font-medium text-omni-text/70">Visualization</label>
            <div className="flex-1 bg-white rounded-xl flex items-center justify-center p-8 overflow-hidden relative group">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />
              <div
                className="max-w-full max-h-full transition-transform group-hover:scale-110 duration-500"
                dangerouslySetInnerHTML={{ __html: result.optimized }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 h-1/2">
            <label className="text-sm font-medium text-omni-text/70">Optimized Output</label>
            <CodeEditor
              value={result.optimized}
              language="xml"
              readOnly
              className="flex-1 bg-omni-bg/80"
            />
          </div>
        </div>
      </div>

      {result.error && (
        <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-sm text-red-300">{result.error}</p>
        </div>
      )}
    </ToolLayout>
  )
}
