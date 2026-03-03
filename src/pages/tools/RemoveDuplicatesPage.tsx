import { useState, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { Trash2, Copy, Download } from 'lucide-react'
import { toast } from 'sonner'

export default function RemoveDuplicatesPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'lines' | 'words' | 'case'>('lines')

  const removeDuplicates = useCallback(() => {
    if (!input) {
      toast.error('Please enter some text')
      return
    }

    let result = ''

    if (mode === 'lines') {
      const lines = input.split('\n').filter(line => line.trim() !== '')
      const unique = [...new Set(lines)]
      result = unique.join('\n')
    } else if (mode === 'words') {
      const words = input.split(/\s+/).filter(word => word !== '')
      const unique = [...new Set(words)]
      result = unique.join(' ')
    } else if (mode === 'case') {
      // Case-insensitive duplicate removal
      const seen = new Set<string>()
      const words = input.split(/\s+/)
      result = words.filter(word => {
        const lower = word.toLowerCase()
        if (seen.has(lower)) return false
        seen.add(lower)
        return true
      }).join(' ')
    }

    setOutput(result)

    // Calculate stats
    const originalCount = mode === 'lines'
      ? input.split('\n').filter(l => l.trim()).length
      : input.split(/\s+/).filter(w => w).length
    const finalCount = mode === 'case'
      ? result.split(/\s+/).length
      : result.split(mode === 'lines' ? '\n' : ' ').length

    toast.success(`Removed ${originalCount - finalCount} duplicates!`)
  }, [input, mode])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(output)
    toast.success('Copied to clipboard!')
  }, [output])

  const handleDownload = useCallback(() => {
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'unique-text.txt'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded!')
  }, [output])

  const handleReset = useCallback(() => {
    setInput('')
    setOutput('')
  }, [])

  const stats = input ? {
    original: mode === 'lines' ? input.split('\n').filter(l => l.trim()).length : input.split(/\s+/).filter(w => w).length,
    duplicates: 0, // Will be calculated
    remaining: 0,
  } : null

  return (
    <ToolLayout
      title="Remove Duplicate Lines"
      description="Remove duplicate lines, words, or case variations"
      icon={<Trash2 className="w-8 h-8" />}
      actions={<ActionToolbar onReset={handleReset} />}
    >
      <div className="flex flex-col h-full gap-6">
        {/* Mode Selection */}
        <div className="flex gap-2 p-3 bg-omni-text/5 rounded-lg border border-omni-text/5">
          <button
            onClick={() => setMode('lines')}
            className={`px-4 py-2 rounded text-xs font-bold uppercase transition-all ${
              mode === 'lines'
                ? 'bg-omni-primary text-white'
                : 'text-omni-text/50 hover:text-omni-text'
            }`}
          >
            Lines
          </button>
          <button
            onClick={() => setMode('words')}
            className={`px-4 py-2 rounded text-xs font-bold uppercase transition-all ${
              mode === 'words'
                ? 'bg-omni-primary text-white'
                : 'text-omni-text/50 hover:text-omni-text'
            }`}
          >
            Words
          </button>
          <button
            onClick={() => setMode('case')}
            className={`px-4 py-2 rounded text-xs font-bold uppercase transition-all ${
              mode === 'case'
                ? 'bg-omni-primary text-white'
                : 'text-omni-text/50 hover:text-omni-text'
            }`}
          >
            Case-Insensitive
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex gap-6 min-h-0">
          {/* Input */}
          <div className="flex-1 flex flex-col bg-omni-bg/30 rounded-xl overflow-hidden border border-omni-text/10">
            <div className="px-4 py-2 bg-omni-text/5 border-b border-omni-text/10">
              <span className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Input</span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'lines'
                ? "Enter lines with duplicates...&#10;Apple&#10;Banana&#10;Apple&#10;Cherry"
                : mode === 'words'
                ? "Enter words with duplicates...&#10;hello hello world test test"
                : "Enter text with case duplicates...&#10;Hello hello HELLO world World"
              }
              className="flex-1 w-full bg-transparent border-none text-sm text-omni-text p-4 focus:outline-none resize-none min-h-0"
            />
          </div>

          {/* Process Button */}
          <div className="flex items-center">
            <button
              onClick={removeDuplicates}
              disabled={!input}
              className="p-3 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl transition-all shadow-lg shadow-omni-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          {/* Output */}
          <div className="flex-1 flex flex-col bg-omni-bg/30 rounded-xl overflow-hidden border border-omni-text/10">
            <div className="px-4 py-2 bg-omni-text/5 border-b border-omni-text/10">
              <span className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Output (Unique)</span>
            </div>
            <textarea
              readOnly
              value={output}
              placeholder="Unique content will appear here..."
              className="flex-1 w-full bg-transparent border-none text-sm text-omni-text/70 p-4 focus:outline-none resize-none min-h-0"
            />
          </div>
        </div>

        {/* Info */}
        <div className="p-4 bg-omni-text/5 rounded-xl">
          <p className="text-xs text-omni-text/60">
            <strong className="text-omni-text/50">Mode:</strong> {mode === 'lines' ? 'Remove duplicate lines' : mode === 'words' ? 'Remove duplicate words' : 'Remove case-insensitive duplicates (Hello, HELLO, hello → hello)'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={removeDuplicates}
            disabled={!input}
            className="flex-[2] py-3 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-omni-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" /> Remove Duplicates
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
