import { useState, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { Code2, Copy, Download, ArrowLeftRight } from 'lucide-react'
import { toast } from 'sonner'

export default function HtmlEntityPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')

  const encodeHtmlEntities = useCallback((text: string): string => {
    // First encode ampersand to avoid double encoding
    let result = text.replace(/&/g, '&amp;')

    // Then encode other characters
    result = result.replace(/</g, '&lt;')
    result = result.replace(/>/g, '&gt;')
    result = result.replace(/"/g, '&quot;')
    result = result.replace(/'/g, '&#39;')

    // Encode other common special characters
    result = result.replace(/©/g, '&copy;')
    result = result.replace(/®/g, '&reg;')
    result = result.replace(/€/g, '&euro;')
    result = result.replace(/£/g, '&pound;')
    result = result.replace(/¥/g, '&yen;')
    result = result.replace(/¢/g, '&cent;')
    result = result.replace(/§/g, '&sect;')
    result = result.replace(/¶/g, '&para;')
    result = result.replace(/•/g, '&bull;')
    result = result.replace(/°/g, '&deg;')
    result = result.replace(/±/g, '&plusmn;')
    result = result.replace(/×/g, '&times;')
    result = result.replace(/÷/g, '&divide;')

    return result
  }, [])

  const decodeHtmlEntities = useCallback((text: string): string => {
    let result = text

    // Handle numeric entities first (&#123; and &#x1F;)
    result = result.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))

    // Handle named entities
    const entityMap: Record<string, string> = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&apos;': "'",
      '&copy;': '©',
      '&reg;': '®',
      '&euro;': '€',
      '&pound;': '£',
      '&yen;': '¥',
      '&cent;': '¢',
      '&sect;': '§',
      '&para;': '¶',
      '&bull;': '•',
      '&deg;': '°',
      '&plusmn;': '±',
      '&times;': '×',
      '&divide;': '÷',
      '&nbsp;': ' ',
      '&nbsp': ' ', // without semicolon
    }

    // Replace each entity
    for (const [entity, char] of Object.entries(entityMap)) {
      result = result.split(entity).join(char)
    }

    return result
  }, [])

  const handleConvert = useCallback(() => {
    if (!input) {
      toast.error('Please enter some text')
      return
    }

    const result = mode === 'encode' ? encodeHtmlEntities(input) : decodeHtmlEntities(input)
    setOutput(result)
    toast.success(`${mode === 'encode' ? 'Encoded' : 'Decoded'} HTML entities!`)
  }, [input, mode, encodeHtmlEntities, decodeHtmlEntities])

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
    a.download = `html-entities-${mode}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded!')
  }, [output, mode])

  const handleReset = useCallback(() => {
    setInput('')
    setOutput('')
    setMode('encode')
  }, [])

  const commonEntities = [
    { char: '<', entity: '&lt;', desc: 'Less than' },
    { char: '>', entity: '&gt;', desc: 'Greater than' },
    { char: '&', entity: '&amp;', desc: 'Ampersand' },
    { char: '"', entity: '&quot;', desc: 'Quote' },
    { char: "'", entity: '&#39;', desc: 'Apostrophe' },
    { char: '©', entity: '&copy;', desc: 'Copyright' },
    { char: '®', entity: '&reg;', desc: 'Registered' },
    { char: '€', entity: '&euro;', desc: 'Euro' },
  ]

  return (
    <ToolLayout
      title="HTML Entity Encoder/Decoder"
      description="Convert HTML entities to text and vice versa"
      icon={<Code2 className="w-8 h-8" />}
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
                {mode === 'encode' ? 'Plain Text' : 'HTML Entities'}
              </span>
              <span className="text-xs text-omni-text/40">{input.length} chars</span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'encode' ? 'Enter text to encode (e.g., <div>Hello & welcome>®)' : 'Enter HTML entities to decode (e.g., &lt;div&gt;Hello &amp; welcome&gt;&reg;)'}
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
                {mode === 'encode' ? 'HTML Entities' : 'Plain Text'}
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

        {/* Common Entities Reference */}
        <div className="p-4 bg-omni-text/5 rounded-xl">
          <p className="text-xs font-bold text-omni-text/50 uppercase tracking-wider mb-3">Common Entities (click to insert)</p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
            {commonEntities.map((entity) => (
              <button
                key={entity.entity}
                onClick={() => setInput((prev) => prev + entity.char)}
                className="px-2 py-2 bg-omni-bg rounded text-center hover:bg-omni-primary/20 transition-colors"
              >
                <div className="text-xs text-omni-text/60 mb-1">{entity.desc}</div>
                <div className="text-sm font-mono text-omni-primary">{entity.char}</div>
              </button>
            ))}
          </div>
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
