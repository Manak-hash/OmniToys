import { useState } from 'react'
import { Database, Download, Copy, Check, Minimize2, Sparkles } from 'lucide-react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { CodeEditor } from '@/components/ui/CodeEditor'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { formatSql, minifySql, type SupportedDialect, type KeywordCase } from '@/utils/sqlFormatter'
import { toast } from 'sonner'
import jsFileDownload from 'js-file-download'

export default function SqlBeautifierPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [dialect, setDialect] = useState<SupportedDialect>('mysql')
  const [keywordCase, setKeywordCase] = useState<KeywordCase>('upper')
  const [mode, setMode] = useState<'format' | 'minify'>('format')

  // Sync output/error synchronously when input, dialect, keywordCase, or mode changes
  const [prevInput, setPrevInput] = useState(input)
  const [prevDialect, setPrevDialect] = useState(dialect)
  const [prevKeywordCase, setPrevKeywordCase] = useState(keywordCase)
  const [prevMode, setPrevMode] = useState(mode)

  if (input !== prevInput || dialect !== prevDialect || keywordCase !== prevKeywordCase || mode !== prevMode) {
    setPrevInput(input)
    setPrevDialect(dialect)
    setPrevKeywordCase(keywordCase)
    setPrevMode(mode)

    if (!input.trim()) {
      setOutput('')
      setError(null)
    } else if (mode === 'format') {
      const result = formatSql(input, { dialect, keywordCase })
      if (result.success && result.result) {
        setOutput(result.result)
        setError(null)
      } else {
        setOutput('')
        setError(result.error || 'Formatting failed')
      }
    } else {
      const result = minifySql(input)
      if (result.success && result.result) {
        setOutput(result.result)
        setError(null)
      } else {
        setOutput('')
        setError(result.error || 'Minification failed')
      }
    }
  }

  const handleCopy = () => {
    if (!output) return
    navigator.clipboard.writeText(output)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!output) return
    jsFileDownload(output, 'formatted.sql')
    toast.success('Downloaded SQL file')
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setError(null)
  }

  const loadExample = () => {
    setInput(`SELECT u.id, u.name, u.email, COUNT(o.id) as order_count, SUM(o.total) as total_spent FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.created_at > '2024-01-01' AND o.status = 'completed' GROUP BY u.id, u.name, u.email HAVING COUNT(o.id) > 5 ORDER BY total_spent DESC LIMIT 10`)
  }

  return (
    <ToolLayout
      title="SQL Beautifier Pro"
      description="Format and beautify SQL queries with multiple dialect support"
      icon={<Database className="w-5 h-5" />}
    >
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap gap-4 p-4 bg-omni-text/5 rounded-lg">
          {/* Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setMode('format')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                mode === 'format'
                  ? 'bg-omni-primary text-white'
                  : 'bg-omni-text/10 text-omni-text hover:bg-omni-text/20'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Format
            </button>
            <button
              onClick={() => setMode('minify')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                mode === 'minify'
                  ? 'bg-omni-primary text-white'
                  : 'bg-omni-text/10 text-omni-text hover:bg-omni-text/20'
              }`}
            >
              <Minimize2 className="w-4 h-4" />
              Minify
            </button>
          </div>

          {/* Dialect Selector */}
          {mode === 'format' && (
            <>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-omni-text/80">Dialect:</label>
                <select
                  value={dialect}
                  onChange={(e) => setDialect(e.target.value as SupportedDialect)}
                  className="px-3 py-2 rounded-lg bg-omni-bg border border-omni-text/20 text-omni-text focus:outline-none focus:ring-2 focus:ring-omni-primary/50"
                >
                  <option value="mysql">MySQL</option>
                  <option value="postgresql">PostgreSQL</option>
                  <option value="sqlite">SQLite</option>
                  <option value="mariadb">MariaDB</option>
                  <option value="tsql">T-SQL</option>
                  <option value="plsql">PL/SQL</option>
                </select>
              </div>

              {/* Keyword Case Selector */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-omni-text/80">Keywords:</label>
                <select
                  value={keywordCase}
                  onChange={(e) => setKeywordCase(e.target.value as KeywordCase)}
                  className="px-3 py-2 rounded-lg bg-omni-bg border border-omni-text/20 text-omni-text focus:outline-none focus:ring-2 focus:ring-omni-primary/50"
                >
                  <option value="upper">UPPERCASE</option>
                  <option value="lower">lowercase</option>
                  <option value="preserve">Preserve</option>
                </select>
              </div>
            </>
          )}

          <button
            onClick={loadExample}
            className="px-4 py-2 rounded-lg bg-omni-text/10 text-omni-text hover:bg-omni-text/20 transition-colors ml-auto"
          >
            Load Example
          </button>
        </div>

        {/* Input/Output Panels */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-omni-text/80">
                Input SQL
              </label>
              <span className="text-xs text-omni-text/40">
                {input.length} characters
              </span>
            </div>
            <CodeEditor
              value={input}
              onChange={setInput}
              language="sql"
              placeholder="Paste your SQL query here..."
              className="min-h-[400px]"
            />
          </div>

          {/* Output */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-omni-text/80">
                {mode === 'format' ? 'Formatted SQL' : 'Minified SQL'}
              </label>
              <span className="text-xs text-omni-text/40">
                {output.length} characters
              </span>
            </div>
            <div className="relative">
              <CodeEditor
                value={output}
                onChange={() => {}}
                language="sql"
                readOnly
                placeholder="Output will appear here..."
                className="min-h-[400px]"
              />
              {error && (
                <div className="absolute bottom-4 left-4 right-4 bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <ActionToolbar>
          <button
            onClick={handleCopy}
            disabled={!output}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-omni-primary text-white hover:bg-omni-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            disabled={!output}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-omni-text/10 text-omni-text hover:bg-omni-text/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-omni-text/10 text-omni-text hover:bg-omni-text/20 transition-colors ml-auto"
          >
            Clear
          </button>
        </ActionToolbar>

        {/* Stats */}
        {input && output && !error && (
          <div className="grid grid-cols-3 gap-4 p-4 bg-omni-text/5 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-omni-primary">{input.length}</p>
              <p className="text-xs text-omni-text/60">Input Characters</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-omni-primary">{output.length}</p>
              <p className="text-xs text-omni-text/60">Output Characters</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-omni-primary">
                {mode === 'minify'
                  ? `-${((input.length - output.length) / input.length * 100).toFixed(1)}%`
                  : `+${((output.length - input.length) / input.length * 100).toFixed(1)}%`
                }
              </p>
              <p className="text-xs text-omni-text/60">Size Change</p>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
