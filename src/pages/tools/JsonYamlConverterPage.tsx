import { useState } from 'react'
import { ArrowRightLeft, FileJson, Download, Copy, Check } from 'lucide-react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { CodeEditor } from '@/components/ui/CodeEditor'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { convert, type ConversionDirection } from '@/utils/jsonYamlConverter'
import { toast } from 'sonner'
import jsFileDownload from 'js-file-download'

export default function JsonYamlConverterPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [direction, setDirection] = useState<ConversionDirection>('json-to-yaml')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Sync output/error synchronously when input or direction changes
  const [prevInput, setPrevInput] = useState(input)
  const [prevDirection, setPrevDirection] = useState(direction)
  if (input !== prevInput || direction !== prevDirection) {
    setPrevInput(input)
    setPrevDirection(direction)
    
    if (!input.trim()) {
      setOutput('')
      setError(null)
    } else {
      const result = convert(input, direction)
      if (result.success && result.result) {
        setOutput(result.result)
        setError(null)
      } else {
        setOutput('')
        setError(result.error || 'Conversion failed')
      }
    }
  }

  const handleSwap = () => {
    setDirection(prev => prev === 'json-to-yaml' ? 'yaml-to-json' : 'json-to-yaml')
    // Swap input and output if valid
    if (output && !error) {
      setInput(output)
    }
  }

  const handleCopy = () => {
    if (!output) return
    navigator.clipboard.writeText(output)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!output) return
    const extension = direction === 'json-to-yaml' ? 'yaml' : 'json'
    jsFileDownload(output, `converted.${extension}`)
    toast.success(`Downloaded as ${extension.toUpperCase()}`)
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setError(null)
  }

  return (
    <ToolLayout
      title="JSON ↔ YAML Converter"
      description="Bidirectional JSON to YAML converter with validation"
      icon={<FileJson className="w-5 h-5" />}
    >
      <div className="space-y-4">
        {/* Direction Toggle */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setDirection('json-to-yaml')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              direction === 'json-to-yaml'
                ? 'bg-omni-primary text-white'
                : 'bg-omni-text/10 text-omni-text hover:bg-omni-text/20'
            }`}
          >
            JSON → YAML
          </button>
          <button
            onClick={handleSwap}
            className="p-2 rounded-lg bg-omni-text/10 hover:bg-omni-text/20 transition-colors"
            title="Swap direction"
          >
            <ArrowRightLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setDirection('yaml-to-json')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              direction === 'yaml-to-json'
                ? 'bg-omni-primary text-white'
                : 'bg-omni-text/10 text-omni-text hover:bg-omni-text/20'
            }`}
          >
            YAML → JSON
          </button>
        </div>

        {/* Input/Output Panels */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-omni-text/80">
                {direction === 'json-to-yaml' ? 'JSON Input' : 'YAML Input'}
              </label>
              <span className="text-xs text-omni-text/40">
                {input.length} characters
              </span>
            </div>
            <CodeEditor
              value={input}
              onChange={setInput}
              language={direction === 'json-to-yaml' ? 'json' : 'yaml'}
              placeholder={direction === 'json-to-yaml'
                ? 'Paste your JSON here...'
                : 'Paste your YAML here...'
              }
              className="min-h-[400px]"
            />
          </div>

          {/* Output */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-omni-text/80">
                {direction === 'json-to-yaml' ? 'YAML Output' : 'JSON Output'}
              </label>
              <span className="text-xs text-omni-text/40">
                {output.length} characters
              </span>
            </div>
            <div className="relative">
              <CodeEditor
                value={output}
                onChange={() => {}}
                language={direction === 'json-to-yaml' ? 'yaml' : 'json'}
                readOnly
                placeholder="Output will appear here..."
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
        {input && output && !error && (
          <div className="grid grid-cols-3 gap-4 p-4 bg-omni-text/5 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-omni-primary">{input.length}</p>
              <p className="text-xs text-omni-text/60">Input Characters</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-omni-primary">{output.length}</p>
              <p className="text-xs text-omni-text/60">Output Characters</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-omni-primary">
                {((output.length - input.length) / input.length * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-omni-text/60">Size Change</p>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
