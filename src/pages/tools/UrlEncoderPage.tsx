import { useState, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { Link2, Copy, Download, ArrowLeftRight } from 'lucide-react'
import { toast } from 'sonner'

export default function UrlEncoderPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')

  const encodeUrl = useCallback((text: string): string => {
    return encodeURIComponent(text)
  }, [])

  const decodeUrl = useCallback((text: string): string => {
    try {
      return decodeURIComponent(text)
    } catch {
      return text
    }
  }, [])

  const handleConvert = useCallback(() => {
    if (!input) {
      toast.error('Please enter a URL or text')
      return
    }

    const result = mode === 'encode' ? encodeUrl(input) : decodeUrl(input)
    setOutput(result)
    toast.success(`URL ${mode === 'encode' ? 'encoded' : 'decoded'}!`)
  }, [input, mode, encodeUrl, decodeUrl])

  const handleSwap = useCallback(() => {
    if (output) {
      setInput(output)
      setOutput('')
    }
    setMode(mode === 'encode' ? 'decode' : 'encode')
  }, [output, mode])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(output)
    toast.success('Copied to clipboard!')
  }, [output])

  const handleDownload = useCallback(() => {
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `url-${mode}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded!')
  }, [output, mode])

  const handleReset = useCallback(() => {
    setInput('')
    setOutput('')
    setMode('encode')
  }, [])

  const examples = [
    { label: 'URL with spaces', value: 'https://example.com/search?q=hello world&page=1' },
    { label: 'Special characters', value: 'user@email.com?name=José María&city=São Paulo' },
    { label: 'Query parameters', value: 'https://api.example.com/v1/users?filter=name eq "John Doe"' },
    { label: 'Chinese characters', value: 'https://example.com/搜索?q=测试' },
  ]

  return (
    <ToolLayout
      title="URL Encoder/Decoder"
      description="Encode and decode URL components safely"
      icon={<Link2 className="w-8 h-8" />}
      actions={<ActionToolbar onReset={handleReset} />}
    >
      <div className="flex flex-col h-full gap-6">
        {/* Mode Toggle */}
        <div className="flex items-center gap-3 p-3 bg-omni-bg/40 rounded-lg border border-omni-text/5">
          <div className="flex gap-1 bg-omni-text/5 p-1 rounded-lg flex-1 max-w-xs">
            <button
              onClick={() => setMode('encode')}
              className={`flex-1 px-4 py-2 rounded text-xs font-bold uppercase transition-all ${
                mode === 'encode'
                  ? 'bg-omni-primary text-white'
                  : 'text-omni-text/50 hover:text-omni-text'
              }`}
            >
              Encode
            </button>
            <button
              onClick={() => setMode('decode')}
              className={`flex-1 px-4 py-2 rounded text-xs font-bold uppercase transition-all ${
                mode === 'decode'
                  ? 'bg-omni-primary text-white'
                  : 'text-omni-text/50 hover:text-omni-text'
              }`}
            >
              Decode
            </button>
          </div>

          <button
            onClick={handleSwap}
            disabled={!output}
            className="p-2 bg-omni-text/5 hover:bg-omni-text/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Swap input/output"
          >
            <ArrowLeftRight className="w-4 h-4 text-omni-text/50" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex gap-6 min-h-0">
          {/* Input */}
          <div className="flex-1 flex flex-col bg-omni-bg/30 rounded-xl overflow-hidden border border-omni-text/10">
            <div className="px-4 py-2 bg-omni-text/5 border-b border-omni-text/10 flex items-center justify-between">
              <span className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">
                {mode === 'encode' ? 'Plain URL/Text' : 'Encoded URL'}
              </span>
              <span className="text-xs text-omni-text/40">{input.length} chars</span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'encode'
                ? 'Enter URL or text to encode (e.g., https://example.com/search?q=hello world)'
                : 'Enter encoded URL to decode (e.g., https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world)'}
              className="flex-1 w-full bg-transparent border-none text-sm text-omni-text p-4 focus:outline-none resize-none min-h-0 font-mono"
              spellCheck={false}
            />
          </div>

          {/* Arrow */}
          <div className="flex items-center">
            <button
              onClick={handleConvert}
              disabled={!input}
              className="p-3 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl transition-all shadow-lg shadow-omni-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeftRight className="w-5 h-5" />
            </button>
          </div>

          {/* Output */}
          <div className="flex-1 flex flex-col bg-omni-bg/30 rounded-xl overflow-hidden border border-omni-text/10">
            <div className="px-4 py-2 bg-omni-text/5 border-b border-omni-text/10 flex items-center justify-between">
              <span className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">
                {mode === 'encode' ? 'Encoded URL' : 'Decoded URL'}
              </span>
              <span className="text-xs text-omni-text/40">{output.length} chars</span>
            </div>
            <textarea
              readOnly
              value={output}
              className="flex-1 w-full bg-transparent border-none text-sm text-omni-text/70 p-4 focus:outline-none resize-none min-h-0 font-mono"
            />
          </div>
        </div>

        {/* Examples */}
        <div className="p-4 bg-omni-text/5 rounded-xl">
          <p className="text-xs font-bold text-omni-text/50 uppercase tracking-wider mb-3">Examples (click to try)</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {examples.map((example) => (
              <button
                key={example.label}
                onClick={() => setInput(example.value)}
                className="px-3 py-2 bg-omni-bg rounded text-xs text-left hover:bg-omni-primary/20 transition-colors truncate"
                title={example.value}
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-omni-text/5 rounded-xl">
          <p className="text-xs text-omni-text/60">
            <strong className="text-omni-text/50">💡 Tip:</strong> <strong>Encode</strong> converts special characters (spaces, accents, symbols) to %XX format for URLs. <strong>Decode</strong> converts %XX back to readable characters.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleConvert}
            disabled={!input}
            className="flex-[2] py-3 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-omni-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeftRight className="w-4 h-4" /> {mode === 'encode' ? 'Encode' : 'Decode'}
          </button>
          <button
            onClick={handleCopy}
            disabled={!output}
            className="flex-1 py-3 bg-omni-text/5 hover:bg-omni-text/10 text-omni-text rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Copy className="w-4 h-4" /> Copy
          </button>
          <button
            onClick={handleDownload}
            disabled={!output}
            className="flex-1 py-3 bg-omni-text/5 hover:bg-omni-text/10 text-omni-text rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" /> Save
          </button>
        </div>
      </div>
    </ToolLayout>
  )
}
