import { useState, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { Replace, Copy, Download } from 'lucide-react'
import { toast } from 'sonner'

export default function FindReplacePage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [findStr, setFindStr] = useState('')
  const [replaceStr, setReplaceStr] = useState('')
  const [replaceCount, setReplaceCount] = useState(0)
  const [useRegex, setUseRegex] = useState(false)
  const [caseSensitive, setCaseSensitive] = useState(false)

  const handleReplace = useCallback(() => {
    if (!input) {
      toast.error('Please enter some text')
      return
    }

    if (!findStr) {
      toast.error('Please enter text to find')
      return
    }

    let result = input
    let count = 0

    if (useRegex) {
      try {
        const flags = caseSensitive ? 'g' : 'gi'
        const regex = new RegExp(findStr, flags)
        const matches = result.match(regex)
        count = matches ? matches.length : 0
        result = result.replace(regex, replaceStr)
      } catch (error) {
        toast.error('Invalid regular expression')
        return
      }
    } else {
      const searchStr = caseSensitive ? findStr : findStr.toLowerCase()
      const targetStr = caseSensitive ? replaceStr : replaceStr.toLowerCase()

      if (caseSensitive) {
        const matches = result.split(findStr)
        count = matches.length - 1
        result = result.replaceAll(findStr, replaceStr)
      } else {
        // Case-insensitive string replacement
        const regex = new RegExp(findStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
        const matches = result.match(regex)
        count = matches ? matches.length : 0
        result = result.replace(regex, replaceStr)
      }
    }

    setOutput(result)
    setReplaceCount(count)
    toast.success(`Replaced ${count} occurrence${count !== 1 ? 's' : ''}!`)
  }, [input, findStr, replaceStr, useRegex, caseSensitive])

  const handleReplaceAll = useCallback(() => {
    setOutput(input)
    setReplaceCount(0)
    toast.info('Reset to original text')
  }, [input])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(output)
    toast.success('Copied to clipboard!')
  }, [output])

  const handleDownload = useCallback(() => {
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'replaced-text.txt'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded!')
  }, [output])

  const handleReset = useCallback(() => {
    setInput('')
    setOutput('')
    setFindStr('')
    setReplaceStr('')
    setReplaceCount(0)
  }, [])

  // Count occurrences
  const occurrences = input && findStr ? (
    useRegex
      ? (input.match(new RegExp(findStr, caseSensitive ? 'g' : 'gi')) || []).length
      : input.split(findStr).length - 1
  ) : 0

  return (
    <ToolLayout
      title="Find and Replace"
      description="Find and replace text in your content"
      icon={<Replace className="w-8 h-8" />}
      actions={<ActionToolbar onReset={handleReset} />}
    >
      <div className="flex flex-col h-full gap-6">
        {/* Find & Replace Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Find</label>
            <input
              type="text"
              value={findStr}
              onChange={(e) => setFindStr(e.target.value)}
              placeholder="Text to find..."
              className="w-full px-4 py-3 bg-omni-text/5 border border-omni-text/10 rounded-lg text-sm text-omni-text focus:outline-none focus:border-omni-primary/30"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Replace With</label>
            <input
              type="text"
              value={replaceStr}
              onChange={(e) => setReplaceStr(e.target.value)}
              placeholder="Replacement text..."
              className="w-full px-4 py-3 bg-omni-text/5 border border-omni-text/10 rounded-lg text-sm text-omni-text focus:outline-none focus:border-omni-primary/30"
            />
          </div>
        </div>

        {/* Options */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useRegex}
              onChange={(e) => setUseRegex(e.target.checked)}
              className="w-4 h-4 rounded accent-omni-primary"
            />
            <span className="text-xs text-omni-text">Use Regex</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
              className="w-4 h-4 rounded accent-omni-primary"
            />
            <span className="text-xs text-omni-text">Case Sensitive</span>
          </label>

          <div className="flex-1" />

          <div className="text-xs text-omni-text/40">
            {findStr && `${occurrences} found`}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex gap-6 min-h-0">
          {/* Input */}
          <div className="flex-1 flex flex-col bg-omni-bg/30 rounded-xl overflow-hidden border border-omni-text/10">
            <div className="px-4 py-2 bg-omni-text/5 border-b border-omni-text/10 flex items-center justify-between">
              <span className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Input Text</span>
              <span className="text-xs text-omni-text/40">{input.length} chars</span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter your text here..."
              className="flex-1 w-full bg-transparent border-none text-sm text-omni-text p-4 focus:outline-none resize-none min-h-0"
            />
          </div>

          {/* Replace Button */}
          <div className="flex items-center">
            <button
              onClick={handleReplace}
              disabled={!input || !findStr}
              className="p-3 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl transition-all shadow-lg shadow-omni-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Replace First"
            >
              <Replace className="w-5 h-5" />
            </button>
          </div>

          {/* Output */}
          <div className="flex-1 flex flex-col bg-omni-bg/30 rounded-xl overflow-hidden border border-omni-text/10">
            <div className="px-4 py-2 bg-omni-text/5 border-b border-omni-text/10 flex items-center justify-between">
              <span className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Result</span>
              <span className="text-xs text-omni-text/40">{output.length} chars</span>
            </div>
            <textarea
              readOnly
              value={output}
              placeholder="Result will appear here..."
              className="flex-1 w-full bg-transparent border-none text-sm text-omni-text/70 p-4 focus:outline-none resize-none min-h-0"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleReplace}
            disabled={!input || !findStr}
            className="flex-1 py-3 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-omni-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Replace className="w-4 h-4" /> Replace ({replaceCount})
          </button>
          <button
            onClick={handleReplaceAll}
            disabled={!input}
            className="px-4 py-3 bg-omni-text/5 hover:bg-omni-text/10 text-omni-text rounded-xl font-bold uppercase tracking-widest text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
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
