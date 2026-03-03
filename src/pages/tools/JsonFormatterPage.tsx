import { useState, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { Braces, Copy, Download, FileCheck } from 'lucide-react'
import { toast } from 'sonner'
import YAML from 'js-yaml'

type FormatType = 'json' | 'xml' | 'yaml'
type Action = 'format' | 'minify' | 'validate'

export default function JsonFormatterPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [formatType, setFormatType] = useState<FormatType>('json')
  const [action, setAction] = useState<Action>('format')
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [error, setError] = useState('')

  const formatJson = useCallback((text: string, minify = false): { result: string; valid: boolean; error: string } => {
    try {
      const parsed = JSON.parse(text)
      const result = minify ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 2)
      return { result, valid: true, error: '' }
    } catch (err) {
      return { result: '', valid: false, error: err instanceof Error ? err.message : 'Invalid JSON' }
    }
  }, [])

  const formatYaml = useCallback((text: string): { result: string; valid: boolean; error: string } => {
    try {
      const parsed = YAML.load(text)
      const result = YAML.dump(parsed, { indent: 2, lineWidth: -1 })
      return { result, valid: true, error: '' }
    } catch (err) {
      return { result: '', valid: false, error: err instanceof Error ? err.message : 'Invalid YAML' }
    }
  }, [])

  const formatXml = useCallback((text: string, minify = false): { result: string; valid: boolean; error: string } => {
    try {
      // Basic XML formatting
      let formatted = ''
      let indent = 0
      const tab = minify ? '' : '  '

      // Remove existing whitespace
      text = text.replace(/^\s+|\s+$/g, '')

      // Split by tags
      const tokens = text.match(/<[^>]+>|[^<]+/g) || []

      for (const token of tokens) {
        if (token.trim() === '') continue

        if (token.match(/^<\//)) {
          // Closing tag
          indent--
          if (!minify) formatted += tab.repeat(indent)
        } else if (token.match(/^<.*\/>$/)) {
          // Self-closing tag
          if (!minify) formatted += tab.repeat(indent)
        } else if (token.match(/^<[^/!?][^>]*>$/)) {
          // Opening tag
          if (!minify) formatted += tab.repeat(indent)
        }

        formatted += token

        if (!minify && !token.match(/^<.*\/>$/)) {
          if (token.match(/^<[^/!?][^>]*>$/)) {
            // Opening tag - increase indent
            indent++
          }
          formatted += '\n'
        }
      }

      // Validate by checking if we can parse tags
      const openTags = text.match(/<([^/!][^>]*)>/g) || []
      const closeTags = text.match(/<\/([^>]+)>/g) || []
      const selfClosing = text.match(/<[^>]+\/>/g) || []

      const openCount = openTags.length - selfClosing.length
      const closeCount = closeTags.length

      if (openCount !== closeCount) {
        return { result: formatted, valid: false, error: 'Mismatched XML tags' }
      }

      return { result: formatted.trim(), valid: true, error: '' }
    } catch (err) {
      return { result: '', valid: false, error: err instanceof Error ? err.message : 'Invalid XML' }
    }
  }, [])

  const handleFormat = useCallback(() => {
    if (!input) {
      toast.error('Please enter some text')
      return
    }

    let result = ''

    if (action === 'validate') {
      if (formatType === 'json') {
        const { valid, error } = formatJson(input)
        setIsValid(valid)
        setError(error)
        setOutput(valid ? '✓ Valid JSON' : '')
        toast.success(valid ? 'Valid JSON!' : 'Invalid JSON')
        return
      } else if (formatType === 'yaml') {
        const { valid, error } = formatYaml(input)
        setIsValid(valid)
        setError(error)
        setOutput(valid ? '✓ Valid YAML' : '')
        toast.success(valid ? 'Valid YAML!' : 'Invalid YAML')
        return
      } else if (formatType === 'xml') {
        const { valid, error } = formatXml(input)
        setIsValid(valid)
        setError(error)
        setOutput(valid ? '✓ Valid XML' : '')
        toast.success(valid ? 'Valid XML!' : 'Invalid XML')
        return
      }
    }

    // Format or Minify
    if (formatType === 'json') {
      const { result: res, valid, error: err } = formatJson(input, action === 'minify')
      if (!valid) {
        setError(err)
        setIsValid(false)
        toast.error(err)
        return
      }
      result = res
    } else if (formatType === 'yaml') {
      const { result: res, valid, error: err } = formatYaml(input)
      if (!valid) {
        setError(err)
        setIsValid(false)
        toast.error(err)
        return
      }
      result = res
    } else if (formatType === 'xml') {
      const { result: res, valid, error: err } = formatXml(input, action === 'minify')
      if (!valid) {
        setError(err)
        setIsValid(false)
        toast.error(err)
        return
      }
      result = res
    }

    setOutput(result)
    setIsValid(true)
    setError('')
    toast.success(`${action === 'minify' ? 'Minified' : 'Formatted'} successfully!`)
  }, [input, formatType, action, formatJson, formatYaml, formatXml])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(output)
    toast.success('Copied to clipboard!')
  }, [output])

  const handleDownload = useCallback(() => {
    const ext = formatType === 'json' ? 'json' : formatType === 'yaml' ? 'yaml' : 'xml'
    const blob = new Blob([output], { type: `text/${ext}` })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `formatted.${ext}`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded!')
  }, [output, formatType])

  const handleReset = useCallback(() => {
    setInput('')
    setOutput('')
    setIsValid(null)
    setError('')
  }, [])

  const stats = input ? {
    chars: input.length,
    lines: input.split('\n').length,
  } : null

  return (
    <ToolLayout
      title="JSON/XML/YAML Formatter"
      description="Format, minify, and validate data formats"
      icon={<Braces className="w-8 h-8" />}
      actions={<ActionToolbar onReset={handleReset} />}
    >
      <div className="flex flex-col h-full gap-6">
        {/* Controls */}
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFormatType('json')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                formatType === 'json'
                  ? 'bg-omni-primary text-white'
                  : 'bg-omni-text/5 hover:bg-omni-text/10 text-omni-text'
              }`}
            >
              JSON
            </button>
            <button
              onClick={() => setFormatType('xml')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                formatType === 'xml'
                  ? 'bg-omni-primary text-white'
                  : 'bg-omni-text/5 hover:bg-omni-text/10 text-omni-text'
              }`}
            >
              XML
            </button>
            <button
              onClick={() => setFormatType('yaml')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                formatType === 'yaml'
                  ? 'bg-omni-primary text-white'
                  : 'bg-omni-text/5 hover:bg-omni-text/10 text-omni-text'
              }`}
            >
              YAML
            </button>
          </div>

          <div className="h-6 w-px bg-omni-text/10" />

          <div className="flex gap-2">
            <button
              onClick={() => setAction('format')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                action === 'format'
                  ? 'bg-omni-primary text-white'
                  : 'bg-omni-text/5 hover:bg-omni-text/10 text-omni-text'
              }`}
            >
              Format
            </button>
            <button
              onClick={() => setAction('minify')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                action === 'minify'
                  ? 'bg-omni-primary text-white'
                  : 'bg-omni-text/5 hover:bg-omni-text/10 text-omni-text'
              }`}
            >
              Minify
            </button>
            <button
              onClick={() => setAction('validate')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                action === 'validate'
                  ? 'bg-omni-primary text-white'
                  : 'bg-omni-text/5 hover:bg-omni-text/10 text-omni-text'
              }`}
            >
              Validate
            </button>
          </div>

          <div className="flex-1" />

          {stats && (
            <div className="text-xs text-omni-text/40">
              {stats.chars} chars, {stats.lines} lines
            </div>
          )}
        </div>

        {/* Validation Status */}
        {isValid !== null && (
          <div className={`p-4 rounded-xl ${isValid ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
            <div className="flex items-center gap-2">
              <FileCheck className={`w-4 h-4 ${isValid ? 'text-green-500' : 'text-red-500'}`} />
              <span className={`text-sm font-bold ${isValid ? 'text-green-500' : 'text-red-500'}`}>
                {isValid ? `Valid ${formatType.toUpperCase()}` : `Invalid ${formatType.toUpperCase()}`}
              </span>
              {error && (
                <span className="text-xs text-omni-text/60 ml-2">
                  {error}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex gap-6 min-h-0">
          {/* Input */}
          <div className="flex-1 flex flex-col bg-omni-bg/30 rounded-xl overflow-hidden border border-omni-text/10">
            <div className="px-4 py-2 bg-omni-text/5 border-b border-omni-text/10 flex items-center justify-between">
              <span className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Input</span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Paste your ${formatType.toUpperCase()} here...`}
              className="flex-1 w-full bg-transparent border-none text-sm text-omni-text p-4 focus:outline-none resize-none min-h-0 font-mono"
            />
          </div>

          {/* Format Button */}
          <div className="flex items-center">
            <button
              onClick={handleFormat}
              disabled={!input}
              className="p-3 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl transition-all shadow-lg shadow-omni-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              title={action === 'validate' ? 'Validate' : action === 'minify' ? 'Minify' : 'Format'}
            >
              <Braces className="w-5 h-5" />
            </button>
          </div>

          {/* Output */}
          <div className="flex-1 flex flex-col bg-omni-bg/30 rounded-xl overflow-hidden border border-omni-text/10">
            <div className="px-4 py-2 bg-omni-text/5 border-b border-omni-text/10 flex items-center justify-between">
              <span className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">
                {action === 'validate' ? 'Validation Result' : 'Output'}
              </span>
              <span className="text-xs text-omni-text/40">{output.length} chars</span>
            </div>
            <textarea
              readOnly
              value={output}
              placeholder={action === 'validate' ? 'Click validate to check...' : 'Formatted result will appear here...'}
              className="flex-1 w-full bg-transparent border-none text-sm text-omni-text/70 p-4 focus:outline-none resize-none min-h-0 font-mono"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleFormat}
            disabled={!input}
            className="flex-[2] py-3 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-omni-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Braces className="w-4 h-4" /> {action === 'validate' ? 'Validate' : action === 'minify' ? 'Minify' : 'Format'}
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
