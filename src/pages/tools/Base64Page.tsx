import { useState } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { CodeEditor } from '@/components/ui/CodeEditor'
import { Shield, ArrowRightLeft, Copy, Download } from 'lucide-react'
import { toast } from 'sonner'

type Mode = 'encode' | 'decode'

export default function Base64Page() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<Mode>('encode')
  const [error, setError] = useState<string | null>(null)

  const process = (value: string, currentMode: Mode) => {
    setInput(value)
    setError(null)
    
    if (!value.trim()) {
      setOutput('')
      return
    }

    try {
      if (currentMode === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(value))))
      } else {
        setOutput(decodeURIComponent(escape(atob(value))))
      }
    } catch {
      setError('Invalid input for ' + (currentMode === 'encode' ? 'encoding' : 'decoding'))
      setOutput('')
    }
  }

  const handleModeSwitch = () => {
    const newMode = mode === 'encode' ? 'decode' : 'encode'
    setMode(newMode)
    // Re-process with new mode
    process(input, newMode)
  }

  const copyToClipboard = () => {
    if (!output) return
    navigator.clipboard.writeText(output)
    toast.success('Copied to clipboard!')
  }

  const downloadAsFile = () => {
    if (!output) return
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = mode === 'encode' ? 'encoded.txt' : 'decoded.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <ToolLayout
      title="Base64 Encoder/Decoder"
      description="Encode or decode Base64 strings securely in your browser. Supports UTF-8."
      icon={<Shield className="w-8 h-8" />}
      actions={
        <div className="flex gap-2">
          <button 
            onClick={copyToClipboard}
            disabled={!output}
            className="flex items-center gap-2 px-3 py-1.5 bg-omni-primary/10 text-omni-primary hover:bg-omni-primary/20 rounded-lg transition-colors font-medium text-sm disabled:opacity-50"
          >
            <Copy className="w-4 h-4" /> Copy
          </button>
          <button 
            onClick={downloadAsFile}
            disabled={!output}
            className="flex items-center gap-2 px-3 py-1.5 bg-omni-text/10 text-omni-text hover:bg-omni-text/20 rounded-lg transition-colors font-medium text-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Download
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Mode Toggle */}
        <div className="flex justify-center">
          <button
            onClick={handleModeSwitch}
            className="flex items-center gap-3 px-6 py-3 bg-omni-bg/50 border border-omni-text/10 rounded-xl hover:border-omni-primary/30 transition-colors group"
          >
            <span className={mode === 'encode' ? 'text-omni-primary font-bold' : 'text-omni-text/60'}>
              Encode
            </span>
            <ArrowRightLeft className="w-5 h-5 text-omni-text/40 group-hover:text-omni-primary transition-colors" />
            <span className={mode === 'decode' ? 'text-omni-primary font-bold' : 'text-omni-text/60'}>
              Decode
            </span>
          </button>
        </div>

        {/* Input/Output */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px]">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-omni-text/70">
                {mode === 'encode' ? 'Plain Text' : 'Base64 String'}
              </label>
              {error && <span className="text-xs text-red-400">{error}</span>}
            </div>
            <CodeEditor 
              value={input} 
              onChange={(v) => process(v, mode)} 
              language="json"
              placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Paste Base64 string...'}
              className="flex-1"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-omni-text/70">
              {mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}
            </label>
            <CodeEditor 
              value={output} 
              language="json"
              readOnly
              placeholder="Result will appear here..."
              className="flex-1 bg-omni-bg/80"
            />
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
