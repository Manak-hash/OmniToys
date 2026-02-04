import { useState, useEffect } from 'react'
import { Minimize2, Download, Copy, Check, Code2 } from 'lucide-react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { CodeEditor } from '@/components/ui/CodeEditor'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { minify, type MinifierType, formatBytes } from '@/utils/minifiers'
import { toast } from 'sonner'
import jsFileDownload from 'js-file-download'

export default function CodeMinifierPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [type, setType] = useState<MinifierType>('javascript')
  const [options, setOptions] = useState({
    mangle: true,
    compress: true,
    removeComments: true,
  })
  const [stats, setStats] = useState<{
    originalSize?: number
    minifiedSize?: number
    compressionRatio?: number
  }>({})

  // Reset output/stats synchronously when input is empty
  const [prevInput, setPrevInput] = useState(input)
  if (input !== prevInput) {
    setPrevInput(input)
    if (!input.trim()) {
      setOutput('')
      setError(null)
      setStats({})
    }
  }

  useEffect(() => {
    if (!input.trim()) return

    const processMinify = async () => {
      const result = await minify(input, type, { javascript: options })

      if (result.success && result.result) {
        setOutput(result.result)
        setError(null)
        setStats({
          originalSize: result.originalSize,
          minifiedSize: result.minifiedSize,
          compressionRatio: result.compressionRatio,
        })
      } else {
        setOutput('')
        setError(result.error || 'Minification failed')
        setStats({
          originalSize: result.originalSize,
        })
      }
    }

    processMinify()
  }, [input, type, options])

  const handleCopy = () => {
    if (!output) return
    navigator.clipboard.writeText(output)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!output) return
    const extensions = {
      javascript: 'js',
      css: 'css',
      html: 'html',
    }
    jsFileDownload(output, `minified.${extensions[type]}`)
    toast.success(`Downloaded as ${extensions[type].toUpperCase()}`)
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setError(null)
    setStats({})
  }

  const loadExample = () => {
    if (type === 'javascript') {
      setInput(`// This is a sample JavaScript code with comments\nfunction greet(name) {\n  // Print greeting\n  console.log("Hello, " + name + "!");\n  return "Greeted " + name;\n}\n\nconst message = greet("World");\nconsole.log(message);`)
    } else if (type === 'css') {
      setInput(`/* Sample CSS with comments */\n.container {\n  width: 100%;\n  margin: 0 auto;\n  padding: 20px;\n}\n\n.header {\n  background-color: #ffffff;\n  color: #000000;\n  font-size: 24px;\n  font-weight: bold;\n}`)
    } else {
      setInput(`<!-- Sample HTML -->\n<!DOCTYPE html>\n<html>\n<head>\n  <title>Sample Page</title>\n  <style>\n    body { margin: 0; padding: 0; }\n  </style>\n</head>\n<body>\n  <h1>Hello World</h1>\n  <p>This is a sample page.</p>\n</body>\n</html>`)
    }
  }

  return (
    <ToolLayout
      title="Code Minifier"
      description="Minify JavaScript, CSS, and HTML code"
      icon={<Minimize2 className="w-5 h-5" />}
    >
      <div className="space-y-4">
        {/* Type Selector */}
        <div className="flex flex-wrap gap-2 p-4 bg-omni-text/5 rounded-lg">
          <button
            onClick={() => setType('javascript')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              type === 'javascript'
                ? 'bg-omni-primary text-white'
                : 'bg-omni-text/10 text-omni-text hover:bg-omni-text/20'
            }`}
          >
            <Code2 className="w-4 h-4" />
            JavaScript
          </button>
          <button
            onClick={() => setType('css')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              type === 'css'
                ? 'bg-omni-primary text-white'
                : 'bg-omni-text/10 text-omni-text hover:bg-omni-text/20'
            }`}
          >
            CSS
          </button>
          <button
            onClick={() => setType('html')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              type === 'html'
                ? 'bg-omni-primary text-white'
                : 'bg-omni-text/10 text-omni-text hover:bg-omni-text/20'
            }`}
          >
            HTML
          </button>

          <div className="flex items-center gap-4 ml-auto">
            {type === 'javascript' && (
              <>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={options.mangle}
                    onChange={(e) => setOptions({ ...options, mangle: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  Mangle
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={options.compress}
                    onChange={(e) => setOptions({ ...options, compress: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  Compress
                </label>
              </>
            )}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={options.removeComments}
                onChange={(e) => setOptions({ ...options, removeComments: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              Remove Comments
            </label>
            <button
              onClick={loadExample}
              className="px-4 py-2 rounded-lg bg-omni-text/10 text-omni-text hover:bg-omni-text/20 transition-colors"
            >
              Load Example
            </button>
          </div>
        </div>

        {/* Input/Output Panels */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-omni-text/80">
                Input {type.toUpperCase()}
              </label>
              <span className="text-xs text-omni-text/40">
                {input.length} characters
              </span>
            </div>
            <CodeEditor
              value={input}
              onChange={setInput}
              language={type === 'javascript' ? 'javascript' : type}
              placeholder={`Paste your ${type.toUpperCase()} code here...`}
              className="min-h-[400px]"
            />
          </div>

          {/* Output */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-omni-text/80">
                Minified {type.toUpperCase()}
              </label>
              <span className="text-xs text-omni-text/40">
                {output.length} characters
              </span>
            </div>
            <div className="relative">
              <CodeEditor
                value={output}
                onChange={() => {}}
                language={type === 'javascript' ? 'javascript' : type}
                readOnly
                placeholder="Minified output will appear here..."
                className="min-h-[400px]"
              />
              {error && (
                <div className="absolute bottom-4 left-4 right-4 bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <ActionToolbar>
          <button
            onClick={handleCopy}
            disabled={!output}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-omni-primary text-white hover:bg-omni-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            disabled={!output}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-omni-text/10 text-omni-text hover:bg-omni-text/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-omni-text/10 text-omni-text hover:bg-omni-text/20 transition-colors ml-auto"
          >
            Clear
          </button>
        </ActionToolbar>

        {/* Stats */}
        {stats.originalSize !== undefined && (
          <div className="grid grid-cols-4 gap-4 p-4 bg-omni-text/5 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-omni-primary">{formatBytes(stats.originalSize)}</p>
              <p className="text-xs text-omni-text/60">Original Size</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-omni-primary">
                {stats.minifiedSize !== undefined ? formatBytes(stats.minifiedSize) : '-'}
              </p>
              <p className="text-xs text-omni-text/60">Minified Size</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-omni-primary">
                {stats.compressionRatio !== undefined ? `-${stats.compressionRatio.toFixed(1)}%` : '-'}
              </p>
              <p className="text-xs text-omni-text/60">Compression</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-omni-primary">
                {stats.minifiedSize !== undefined && stats.originalSize !== 0
                  ? `${(stats.minifiedSize / stats.originalSize * 100).toFixed(1)}%`
                  : '-'}
              </p>
              <p className="text-xs text-omni-text/60">of Original</p>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
