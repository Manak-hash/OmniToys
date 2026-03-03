import { useState, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { FileJson, FileSpreadsheet, Copy, Download, ArrowLeftRight } from 'lucide-react'
import { toast } from 'sonner'

type ConversionMode = 'json-to-csv' | 'csv-to-json'
type JsonFormat = 'array' | 'object'

export default function JsonCsvPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<ConversionMode>('json-to-csv')
  const [jsonFormat, setJsonFormat] = useState<JsonFormat>('array')
  const [delimiter, setDelimiter] = useState(',')
  const [error, setError] = useState('')

  const convertJsonToCsv = useCallback((json: string): { success: boolean; result: string; error: string } => {
    try {
      const data = JSON.parse(json)

      let items: any[] = []

      if (jsonFormat === 'array') {
        if (!Array.isArray(data)) {
          return { success: false, result: '', error: 'JSON must be an array of objects' }
        }
        items = data
      } else {
        // Object mode - convert to array
        if (typeof data !== 'object' || data === null) {
          return { success: false, result: '', error: 'JSON must be an object or array' }
        }
        items = Array.isArray(data) ? data : [data]
      }

      if (items.length === 0) {
        return { success: false, result: '', error: 'Array is empty' }
      }

      // Get all unique keys from all objects
      const keys = Array.from(new Set(
        items.flatMap(obj => obj && typeof obj === 'object' ? Object.keys(obj) : [])
      ))

      if (keys.length === 0) {
        return { success: false, result: '', error: 'No keys found in objects' }
      }

      // Build CSV
      const escape = (str: string): string => {
        if (str.includes(delimiter) || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      }

      // Header row
      let csv = keys.map(escape).join(delimiter) + '\n'

      // Data rows
      for (const item of items) {
        if (!item || typeof item !== 'object') {
          continue
        }
        const row = keys.map(key => {
          const val = item[key]
          return escape(val === null || val === undefined ? '' : String(val))
        })
        csv += row.join(delimiter) + '\n'
      }

      return { success: true, result: csv.trim(), error: '' }
    } catch (err) {
      return { success: false, result: '', error: err instanceof Error ? err.message : 'Invalid JSON' }
    }
  }, [jsonFormat, delimiter])

  const convertCsvToJson = useCallback((csv: string): { success: boolean; result: string; error: string } => {
    try {
      const lines = csv.trim().split('\n')
      if (lines.length < 2) {
        return { success: false, result: '', error: 'CSV must have at least a header and one data row' }
      }

      // Parse header
      const header = lines[0].split(delimiter).map(h => {
        h = h.trim()
        if (h.startsWith('"') && h.endsWith('"')) {
          return h.slice(1, -1).replace(/""/g, '"')
        }
        return h
      })

      const items: any[] = []

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        // Simple CSV parser (handles quoted values with delimiter)
        const values: string[] = []
        let current = ''
        let inQuotes = false

        for (let j = 0; j < line.length; j++) {
          const char = line[j]
          const next = line[j + 1]

          if (char === '"') {
            if (inQuotes && next === '"') {
              current += '"'
              j++
            } else {
              inQuotes = !inQuotes
            }
          } else if (char === delimiter && !inQuotes) {
            values.push(current)
            current = ''
          } else {
            current += char
          }
        }
        values.push(current)

        // Create object
        const obj: any = {}
        header.forEach((key, index) => {
          let val = values[index] || ''
          if (val.startsWith('"') && val.endsWith('"')) {
            val = val.slice(1, -1).replace(/""/g, '"')
          }
          obj[key] = val
        })
        items.push(obj)
      }

      const result = jsonFormat === 'array'
        ? JSON.stringify(items, null, 2)
        : JSON.stringify(items[0] || {}, null, 2)

      return { success: true, result, error: '' }
    } catch (err) {
      return { success: false, result: '', error: err instanceof Error ? err.message : 'Invalid CSV' }
    }
  }, [delimiter, jsonFormat])

  const handleConvert = useCallback(() => {
    if (!input) {
      toast.error('Please enter some data')
      return
    }

    setError('')
    let result

    if (mode === 'json-to-csv') {
      result = convertJsonToCsv(input)
    } else {
      result = convertCsvToJson(input)
    }

    if (!result.success) {
      setError(result.error)
      toast.error(result.error)
      return
    }

    setOutput(result.result)
    toast.success(`Converted successfully!`)
  }, [input, mode, convertJsonToCsv, convertCsvToJson])

  const handleSwap = useCallback(() => {
    if (output) {
      setInput(output)
      setOutput('')
    }
    setMode(mode === 'json-to-csv' ? 'csv-to-json' : 'json-to-csv')
    setError('')
  }, [output, mode])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(output)
    toast.success('Copied to clipboard!')
  }, [output])

  const handleDownload = useCallback(() => {
    const ext = mode === 'json-to-csv' ? 'csv' : 'json'
    const blob = new Blob([output], { type: `text/${ext}` })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `converted.${ext}`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded!')
  }, [output, mode])

  const handleReset = useCallback(() => {
    setInput('')
    setOutput('')
    setError('')
  }, [])

  const exampleInput = mode === 'json-to-csv'
    ? JSON.stringify([
        { name: 'John Doe', email: 'john@example.com', age: 30 },
        { name: 'Jane Smith', email: 'jane@example.com', age: 25 },
      ], null, 2)
    : 'name,email,age\nJohn Doe,john@example.com,30\nJane Smith,jane@example.com,25'

  const stats = input ? {
    lines: input.split('\n').length,
    chars: input.length,
  } : null

  return (
    <ToolLayout
      title="JSON ↔ CSV Converter"
      description="Convert between JSON and CSV formats"
      icon={<FileSpreadsheet className="w-8 h-8" />}
      actions={<ActionToolbar onReset={handleReset} />}
    >
      <div className="flex flex-col h-full gap-6">
        {/* Controls */}
        <div className="flex items-center gap-4 p-4 bg-omni-text/5 rounded-xl border border-omni-text/10">
          <div className="flex gap-2">
            <button
              onClick={() => setMode('json-to-csv')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2 ${
                mode === 'json-to-csv'
                  ? 'bg-omni-primary text-white'
                  : 'bg-omni-text/5 hover:bg-omni-text/10 text-omni-text'
              }`}
            >
              <FileJson className="w-4 h-4" /> JSON → CSV
            </button>
            <button
              onClick={() => setMode('csv-to-json')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2 ${
                mode === 'csv-to-json'
                  ? 'bg-omni-primary text-white'
                  : 'bg-omni-text/5 hover:bg-omni-text/10 text-omni-text'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" /> CSV → JSON
            </button>
          </div>

          <button
            onClick={handleSwap}
            disabled={!output}
            className="p-2 hover:bg-omni-text/10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Swap input/output"
          >
            <ArrowLeftRight className="w-4 h-4 text-omni-text" />
          </button>

          <div className="h-6 w-px bg-omni-text/10" />

          <div className="flex items-center gap-2">
            <label className="text-xs text-omni-text/50">Format:</label>
            <select
              value={jsonFormat}
              onChange={(e) => setJsonFormat(e.target.value as JsonFormat)}
              className="px-3 py-1 bg-omni-text/5 border border-omni-text/10 rounded text-xs text-omni-text focus:outline-none focus:border-omni-primary/30"
            >
              <option value="array">Array</option>
              <option value="object">Object</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-omni-text/50">Delimiter:</label>
            <select
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value)}
              className="px-3 py-1 bg-omni-text/5 border border-omni-text/10 rounded text-xs text-omni-text focus:outline-none focus:border-omni-primary/30"
            >
              <option value=",">Comma (,)</option>
              <option value=";">Semicolon (;)</option>
              <option value="\t">Tab</option>
              <option value="|">Pipe (|)</option>
            </select>
          </div>

          <div className="flex-1" />

          {stats && (
            <div className="text-xs text-omni-text/40">
              {stats.lines} lines, {stats.chars} chars
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex gap-6 min-h-0">
          {/* Input */}
          <div className="flex-1 flex flex-col bg-omni-bg/30 rounded-xl overflow-hidden border border-omni-text/10">
            <div className="px-4 py-2 bg-omni-text/5 border-b border-omni-text/10 flex items-center justify-between">
              <span className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">
                Input {mode === 'json-to-csv' ? 'JSON' : 'CSV'}
              </span>
              <button
                onClick={() => setInput(exampleInput)}
                className="text-xs text-omni-text/40 hover:text-omni-text"
              >
                Load Example
              </button>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Enter your ${mode === 'json-to-csv' ? 'JSON' : 'CSV'} here...`}
              className="flex-1 w-full bg-transparent border-none text-sm text-omni-text p-4 focus:outline-none resize-none min-h-0 font-mono"
            />
          </div>

          {/* Convert Button */}
          <div className="flex items-center">
            <button
              onClick={handleConvert}
              disabled={!input}
              className="p-3 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl transition-all shadow-lg shadow-omni-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Convert"
            >
              <ArrowLeftRight className="w-5 h-5" />
            </button>
          </div>

          {/* Output */}
          <div className="flex-1 flex flex-col bg-omni-bg/30 rounded-xl overflow-hidden border border-omni-text/10">
            <div className="px-4 py-2 bg-omni-text/5 border-b border-omni-text/10 flex items-center justify-between">
              <span className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">
                Output {mode === 'json-to-csv' ? 'CSV' : 'JSON'}
              </span>
              <span className="text-xs text-omni-text/40">{output.length} chars</span>
            </div>
            <textarea
              readOnly
              value={output}
              placeholder={`Converted ${mode === 'json-to-csv' ? 'CSV' : 'JSON'} will appear here...`}
              className="flex-1 w-full bg-transparent border-none text-sm text-omni-text/70 p-4 focus:outline-none resize-none min-h-0 font-mono"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleConvert}
            disabled={!input}
            className="flex-[2] py-3 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-omni-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeftRight className="w-4 h-4" /> Convert
          </button>
          <button
            onClick={handleSwap}
            disabled={!output}
            className="px-4 py-3 bg-omni-text/5 hover:bg-omni-text/10 text-omni-text rounded-xl font-bold uppercase tracking-widest text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeftRight className="w-4 h-4" /> Swap
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
