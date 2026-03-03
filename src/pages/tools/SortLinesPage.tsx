import { useState, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { ArrowUpDown, Copy, Download, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export default function SortLinesPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'random'>('asc')
  const [removeDuplicates, setRemoveDuplicates] = useState(false)

  const sortLines = useCallback(() => {
    if (!input) {
      toast.error('Please enter some text')
      return
    }

    let lines = input.split('\n')

    // Remove empty lines if requested
    if (!removeDuplicates) {
      lines = lines.filter(line => line.trim() !== '')
    }

    // Remove duplicates if requested
    if (removeDuplicates) {
      lines = [...new Set(lines)]
    }

    // Sort lines
    const sorted = [...lines].sort((a, b) => {
      if (sortOrder === 'asc') return a.localeCompare(b)
      if (sortOrder === 'desc') return b.localeCompare(a)
      return 0
    })

    // Shuffle for random
    if (sortOrder === 'random') {
      for (let i = sorted.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[sorted[i], sorted[j]] = [sorted[j], sorted[i]]
      }
    }

    setOutput(sorted.join('\n'))
    toast.success(`Sorted ${sorted.length} lines!`)
  }, [input, sortOrder, removeDuplicates])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(output)
    toast.success('Copied to clipboard!')
  }, [output])

  const handleDownload = useCallback(() => {
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sorted-lines.txt'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded!')
  }, [output])

  const handleReset = useCallback(() => {
    setInput('')
    setOutput('')
    setSortOrder('asc')
    setRemoveDuplicates(false)
  }, [])

  const lineCount = input ? input.split('\n').length : 0
  const uniqueCount = input ? new Set(input.split('\n')).size : 0

  return (
    <ToolLayout
      title="Sort Lines"
      description="Sort text lines alphabetically or randomly"
      icon={<ArrowUpDown className="w-8 h-8" />}
      actions={<ActionToolbar onReset={handleReset} />}
    >
      <div className="flex flex-col h-full gap-6">
        {/* Options */}
        <div className="flex items-center gap-4 p-4 bg-omni-text/5 rounded-xl border border-omni-text/10">
          <div className="flex gap-2">
            <button
              onClick={() => setSortOrder('asc')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                sortOrder === 'asc'
                  ? 'bg-omni-primary text-white'
                  : 'bg-omni-text/5 hover:bg-omni-text/10 text-omni-text'
              }`}
            >
              A-Z
            </button>
            <button
              onClick={() => setSortOrder('desc')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                sortOrder === 'desc'
                  ? 'bg-omni-primary text-white'
                  : 'bg-omni-text/5 hover:bg-omni-text/10 text-omni-text'
              }`}
            >
              Z-A
            </button>
            <button
              onClick={() => setSortOrder('random')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                sortOrder === 'random'
                  ? 'bg-omni-primary text-white'
                  : 'bg-omni-text/5 hover:bg-omni-text/10 text-omni-text'
              }`}
            >
              Random
            </button>
          </div>

          <div className="h-6 w-px bg-omni-text/10" />

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={removeDuplicates}
              onChange={(e) => setRemoveDuplicates(e.target.checked)}
              className="w-4 h-4 rounded accent-omni-primary"
            />
            <span className="text-xs text-omni-text">Remove Duplicates</span>
          </label>

          <div className="flex-1" />

          <div className="text-xs text-omni-text/40">
            {lineCount} lines{lineCount !== uniqueCount && ` (${uniqueCount} unique)`}
          </div>
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
              placeholder="Enter lines to sort... (one per line)&#10;Apple&#10;Banana&#10;Cherry"
              className="flex-1 w-full bg-transparent border-none text-sm text-omni-text p-4 focus:outline-none resize-none min-h-0"
            />
          </div>

          {/* Arrow */}
          <div className="flex items-center">
            <button
              onClick={sortLines}
              disabled={!input}
              className="p-3 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl transition-all shadow-lg shadow-omni-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowUpDown className="w-5 h-5" />
            </button>
          </div>

          {/* Output */}
          <div className="flex-1 flex flex-col bg-omni-bg/30 rounded-xl overflow-hidden border border-omni-text/10">
            <div className="px-4 py-2 bg-omni-text/5 border-b border-omni-text/10">
              <span className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Output</span>
            </div>
            <textarea
              readOnly
              value={output}
              placeholder="Sorted lines will appear here..."
              className="flex-1 w-full bg-transparent border-none text-sm text-omni-text/70 p-4 focus:outline-none resize-none min-h-0"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={sortLines}
            disabled={!input}
            className="flex-[2] py-3 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-omni-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowUpDown className="w-4 h-4" /> Sort Lines
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
