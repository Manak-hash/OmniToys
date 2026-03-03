import { useState, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { InputPane } from '@/components/tools/InputPane'
import { OutputPane } from '@/components/tools/OutputPane'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { Shield, Eye, EyeOff, Copy, Download } from 'lucide-react'
import { toast } from 'sonner'

type PiiType = 'email' | 'phone' | 'ssn' | 'creditcard' | 'ip' | 'name'

const PII_PATTERNS: Record<PiiType, { pattern: RegExp; label: string; example: string }> = {
  email: { pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, label: 'Email', example: 'john@example.com' },
  phone: { pattern: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b|\b\+?1?\s*\(?\d{3}\)?[-.]?\s*\d{3}[-.]?\s*\d{4}\b/g, label: 'Phone', example: '(555) 123-4567' },
  ssn: { pattern: /\b\d{3}-\d{2}-\d{4}\b|\b\d{3}\s\d{2}\s\d{4}\b/g, label: 'SSN', example: '123-45-6789' },
  creditcard: { pattern: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, label: 'Credit Card', example: '4532-1234-5678-9010' },
  ip: { pattern: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, label: 'IP Address', example: '192.168.1.1' },
  name: { pattern: /\b[A-Z][a-z]+\s[A-Z][a-z]+\b/g, label: 'Full Name', example: 'John Doe' },
}

export default function PiiScrubberPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<Set<PiiType>>(new Set(['email', 'phone', 'ssn', 'creditcard']))
  const [maskChar, setMaskChar] = useState('***')
  const [showPii, setShowPii] = useState(false)
  const [foundPii, setFoundPii] = useState<{ type: PiiType; count: number; examples: string[] }[]>([])

  const scrubPii = useCallback(() => {
    let result = input
    const found: { type: PiiType; count: number; examples: string[] }[] = []

    selectedTypes.forEach((type) => {
      const { pattern } = PII_PATTERNS[type]
      const matches = input.match(pattern)

      if (matches) {
        const uniqueMatches = [...new Set(matches)]
        found.push({
          type,
          count: uniqueMatches.length,
          examples: uniqueMatches.slice(0, 3)
        })

        result = result.replace(pattern, maskChar)
      }
    })

    setOutput(result)
    setFoundPii(found)
    setShowPii(false)

    if (found.length === 0) {
      toast.info('No PII found in text')
    } else {
      const total = found.reduce((sum, f) => sum + f.count, 0)
      toast.success(`Scrubbed ${total} PII instances!`)
    }
  }, [input, selectedTypes, maskChar])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(output)
    toast.success('Scrubbed text copied!')
  }, [output])

  const handleDownload = useCallback(() => {
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'scrubbed-text.txt'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded!')
  }, [output])

  const toggleType = useCallback((type: PiiType) => {
    const newTypes = new Set(selectedTypes)
    if (newTypes.has(type)) {
      newTypes.delete(type)
    } else {
      newTypes.add(type)
    }
    setSelectedTypes(newTypes)
  }, [selectedTypes])

  const handleReset = useCallback(() => {
    setInput('')
    setOutput('')
    setFoundPii([])
  }, [])

  return (
    <ToolLayout
      title="PII Scrubber"
      description="Anonymize sensitive data from text content"
      icon={<Shield className="w-8 h-8" />}
      actions={<ActionToolbar onReset={handleReset} />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-[500px]">
        {/* Input Panel */}
        <InputPane title="Input Text">
          <div className="flex flex-col h-full p-6 gap-6">
            {/* PII Type Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">PII Types to Scrub</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(PII_PATTERNS) as PiiType[]).map((type) => {
                  const info = PII_PATTERNS[type]
                  return (
                    <button
                      key={type}
                      onClick={() => toggleType(type)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all text-left ${
                        selectedTypes.has(type)
                          ? 'bg-omni-primary text-white'
                          : 'bg-omni-text/5 hover:bg-omni-text/10 text-omni-text/50'
                      }`}
                    >
                      {info.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Mask Character */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Replacement Mask</label>
              <input
                type="text"
                value={maskChar}
                onChange={(e) => setMaskChar(e.target.value)}
                className="w-full px-4 py-3 bg-omni-text/5 border border-omni-text/10 rounded-lg text-sm text-omni-text font-mono focus:outline-none focus:border-omni-primary/30"
                placeholder="***"
              />
            </div>

            {/* Text Input */}
            <div className="flex-1 flex flex-col min-h-0">
              <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider mb-2">Paste Text</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste text containing sensitive information..."
                className="flex-1 w-full min-h-[200px] bg-omni-text/5 border border-omni-text/10 rounded-xl text-sm text-omni-text p-4 focus:outline-none focus:border-omni-primary/30 resize-none font-mono"
              />
            </div>

            {/* Scrub Button */}
            <button
              onClick={scrubPii}
              disabled={!input || selectedTypes.size === 0}
              className="w-full py-4 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl font-bold uppercase tracking-widest transition-all shadow-lg shadow-omni-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Shield className="w-4 h-4" /> Scrub PII
            </button>
          </div>
        </InputPane>

        {/* Output Panel */}
        <OutputPane title="Result">
          <div className="flex flex-col h-full">
            {/* Found PII Summary */}
            {foundPii.length > 0 && (
              <div className="p-4 border-b border-omni-text/5 bg-omni-text/5 space-y-2">
                <p className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Found & Scrubbed</p>
                <div className="grid grid-cols-2 gap-2">
                  {foundPii.map((item) => (
                    <div key={item.type} className="p-2 bg-omni-text/10 rounded-lg">
                      <div className="text-xs text-omni-text/70">{PII_PATTERNS[item.type].label}</div>
                      <div className="text-lg font-bold text-omni-primary">{item.count}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Output Text */}
            <div className="flex-1 p-6 min-h-0">
              {output ? (
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Scrubbed Text</span>
                    <button
                      onClick={() => setShowPii(!showPii)}
                      className="text-xs text-omni-text/40 hover:text-omni-text flex items-center gap-1"
                    >
                      {showPii ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {showPii ? 'Hide Original' : 'Show Original'}
                    </button>
                  </div>
                  <div className="flex-1 overflow-auto">
                    <textarea
                      readOnly
                      value={showPii ? input : output}
                      className={`w-full h-full min-h-[200px] bg-omni-text/5 border border-omni-text/10 rounded-lg text-sm p-4 focus:outline-none resize-none ${
                        showPii ? 'text-omni-text/30 line-through' : 'text-omni-text/70'
                      } font-mono`}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-omni-text/30">
                  <div className="text-center">
                    <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Enter text and click "Scrub PII"</p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            {output && (
              <div className="p-4 border-t border-omni-text/5 flex gap-3">
                <button
                  onClick={handleCopy}
                  className="flex-1 py-3 bg-omni-text/5 hover:bg-omni-text/10 text-omni-text rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" /> Copy
                </button>
                <button
                  onClick={handleDownload}
                  className="flex-1 py-3 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-omni-primary/20 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Save
                </button>
              </div>
            )}
          </div>
        </OutputPane>
      </div>
    </ToolLayout>
  )
}
