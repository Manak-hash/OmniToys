import { useState, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { FlipHorizontal, Copy, Download } from 'lucide-react'
import { toast } from 'sonner'

export default function ReverseTextPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  const reverseText = useCallback((text: string): string => {
    return text.split('').reverse().join('')
  }, [])

  const reverseWords = useCallback((text: string): string => {
    return text.split(' ').reverse().join(' ')
  }, [])

  const reverseLines = useCallback((text: string): string => {
    return text.split('\n').reverse().join('\n')
  }, [])

  const handleReverse = useCallback((type: 'text' | 'words' | 'lines') => {
    if (!input) {
      toast.error('Please enter some text')
      return
    }

    let result = ''
    switch (type) {
      case 'text':
        result = reverseText(input)
        break
      case 'words':
        result = reverseWords(input)
        break
      case 'lines':
        result = reverseLines(input)
        break
    }

    setOutput(result)
    toast.success(`Reversed ${type}!`)
  }, [input, reverseText, reverseWords, reverseLines])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(output)
    toast.success('Copied to clipboard!')
  }, [output])

  const handleDownload = useCallback(() => {
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'reversed-text.txt'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded!')
  }, [output])

  const handleReset = useCallback(() => {
    setInput('')
    setOutput('')
  }, [])

  return (
    <ToolLayout
      title="Reverse Text"
      description="Reverse text, words, or lines"
      icon={<FlipHorizontal className="w-8 h-8" />}
      actions={<ActionToolbar onReset={handleReset} />}
    >
      <div className="flex flex-col h-full gap-6">
        {/* Input */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex-1 flex flex-col bg-omni-bg/30 rounded-xl overflow-hidden border border-omni-text/10">
            <div className="px-4 py-2 bg-omni-text/5 border-b border-omni-text/10">
              <span className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Input</span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text to reverse..."
              className="flex-1 w-full bg-transparent border-none text-sm text-omni-text p-4 focus:outline-none resize-none min-h-0"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => handleReverse('text')}
              disabled={!input}
              className="flex-1 py-3 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-omni-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FlipHorizontal className="w-4 h-4" /> Reverse Text
            </button>
            <button
              onClick={() => handleReverse('words')}
              disabled={!input}
              className="flex-1 py-3 bg-omni-text/5 hover:bg-omni-text/10 text-omni-text rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FlipHorizontal className="w-4 h-4" /> Reverse Words
            </button>
            <button
              onClick={() => handleReverse('lines')}
              disabled={!input}
              className="flex-1 py-3 bg-omni-text/5 hover:bg-omni-text/10 text-omni-text rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FlipHorizontal className="w-4 h-4" /> Reverse Lines
            </button>
          </div>
        </div>

        {/* Output */}
        <div className="flex-1 flex flex-col bg-omni-bg/30 rounded-xl overflow-hidden border border-omni-text/10">
          <div className="px-4 py-2 bg-omni-text/5 border-b border-omni-text/10 flex items-center justify-between">
            <span className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Output</span>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                disabled={!output}
                className="text-xs text-omni-text/40 hover:text-omni-text disabled:opacity-50 flex items-center gap-1"
              >
                <Copy className="w-3 h-3" /> Copy
              </button>
              <button
                onClick={handleDownload}
                disabled={!output}
                className="text-xs text-omni-text/40 hover:text-omni-text disabled:opacity-50 flex items-center gap-1"
              >
                <Download className="w-3 h-3" /> Save
              </button>
            </div>
          </div>
          <textarea
            readOnly
            value={output}
            placeholder="Reversed text will appear here..."
            className="flex-1 w-full bg-transparent border-none text-sm text-omni-text/70 p-4 focus:outline-none resize-none min-h-0"
          />
        </div>
      </div>
    </ToolLayout>
  )
}
