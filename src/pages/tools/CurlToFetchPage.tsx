import { useState } from 'react'
import { Terminal, Code2, Copy, Check, ArrowRight } from 'lucide-react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { CodeEditor } from '@/components/ui/CodeEditor'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'

interface TabButtonProps {
  id: 'fetch' | 'axios'
  label: string
  activeTab: 'fetch' | 'axios'
  onClick: (id: 'fetch' | 'axios') => void
}

function TabButton({ id, label, activeTab, onClick }: TabButtonProps) {
  return (
    <button
      onClick={() => onClick(id)}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
        activeTab === id
          ? "bg-omni-primary text-white"
          : "bg-omni-text/10 text-omni-text hover:bg-omni-text/20"
      )}
    >
      {label}
    </button>
  )
}

interface ParsedCurl {
  url: string
  method: string
  headers: Record<string, string>
  data: string | null
  auth: { username: string; password: string } | null
  compressed: boolean
  verbose: boolean
}

function parseCurlCommand(curl: string): ParsedCurl | null {
  const trimmed = curl.trim()
  if (!trimmed.startsWith('curl')) {
    return null
  }

  const result: ParsedCurl = {
    url: '',
    method: 'GET',
    headers: {},
    data: null,
    auth: null,
    compressed: false,
    verbose: false,
  }

  // Remove 'curl' and split by spaces, respecting quotes
  const remaining = trimmed.slice(4).trim()

  // Extract URL (might be at different positions depending on flags)
  const urlMatch = remaining.match(/(?:^|\s)(['"]?)(https?:\/\/[^'"\s]+)\1/)
  if (urlMatch) {
    result.url = urlMatch[2]
  }

  // Parse flags
  const methodMatch = remaining.match(/-X\s+(['"]?)([A-Z]+)\1/)
  if (methodMatch) {
    result.method = methodMatch[2]
  }

  // Headers (-H or --header)
  const headerRegex = /-H\s+|--header\s+(['"]?)([^'"\s]+):\s*([^'"\s]+)\1/g
  let headerMatch
  while ((headerMatch = headerRegex.exec(remaining)) !== null) {
    result.headers[headerMatch[2]] = headerMatch[3]
  }

  // Data (-d or --data or --data-raw or --data-urlencode)
  const dataMatch = remaining.match(/--data-raw\s+(['"])([^'"]+)\1/)
  if (dataMatch) {
    result.data = dataMatch[2]
  } else {
    const dataRegex = /-d\s+|--data\s+|--data-urlencode\s+(['"]?)([^'"\s]+)\1/g
    let match
    const allData = []
    while ((match = dataRegex.exec(remaining)) !== null) {
      allData.push(match[2])
    }
    if (allData.length > 0) {
      result.data = allData.join('&')
      if (result.method === 'GET') {
        result.method = 'POST'
      }
    }
  }

  // Auth (-u or --user)
  const authMatch = remaining.match(/-u\s+|--user\s+(['"]?)([^:'"\s]+):([^'"\s]*)\1/)
  if (authMatch) {
    result.auth = {
      username: authMatch[2],
      password: authMatch[3] || '',
    }
  }

  // Compression (--compressed)
  if (remaining.includes('--compressed')) {
    result.compressed = true
  }

  // Verbose (-v or --verbose)
  if (remaining.includes('-v') || remaining.includes('--verbose')) {
    result.verbose = true
  }

  return result
}

function generateFetchCode(parsed: ParsedCurl): string {
  const lines: string[] = []

  lines.push('const response = await fetch("' + parsed.url + '", {')

  const options: string[] = []
  options.push(`  method: '${parsed.method}'`)

  if (Object.keys(parsed.headers).length > 0) {
    options.push('  headers: {')
    for (const [key, value] of Object.entries(parsed.headers)) {
      options.push(`    '${key}': '${value}',`)
    }
    options.push('  },')
  }

  if (parsed.data) {
    // Try to detect if data is JSON
    try {
      JSON.parse(parsed.data)
      options.push(`  body: JSON.stringify(${parsed.data}),`)
    } catch {
      options.push(`  body: \`${parsed.data}\`,`)
    }
  }

  lines.push(options.join('\n'))
  lines.push('})')

  return lines.join('\n')
}

function generateAxiosCode(parsed: ParsedCurl): string {
  const lines: string[] = []

  lines.push('const response = await axios.' + parsed.method.toLowerCase() + '("' + parsed.url + '"')

  const options: string[] = []

  if (Object.keys(parsed.headers).length > 0) {
    options.push('  headers: {')
    for (const [key, value] of Object.entries(parsed.headers)) {
      options.push(`    '${key}': '${value}',`)
    }
    options.push('  },')
  }

  if (parsed.data) {
    try {
      JSON.parse(parsed.data)
      options.push(`  data: ${parsed.data},`)
    } catch {
      options.push(`  data: \`${parsed.data}\`,`)
    }
  }

  if (parsed.auth) {
    options.push(`  auth: {`)
    options.push(`    username: '${parsed.auth.username}',`)
    options.push(`    password: '${parsed.auth.password}',`)
    options.push(`  },`)
  }

  if (options.length > 0) {
    lines.push('{')
    lines.push(options.join('\n'))
    lines.push('}')
  }

  lines[lines.length - 1] += ';'

  return lines.join('\n')
}

export default function CurlToFetchPage() {
  const [input, setInput] = useState('')
  const [parsed, setParsed] = useState<ParsedCurl | null>(null)
  const [fetchCode, setFetchCode] = useState('')
  const [axiosCode, setAxiosCode] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'fetch' | 'axios'>('fetch')

  const handleConvert = () => {
    if (!input.trim()) {
      setParsed(null)
      setFetchCode('')
      setAxiosCode('')
      return
    }

    const result = parseCurlCommand(input)
    if (!result) {
      toast.error('Invalid curl command')
      return
    }

    setParsed(result)
    const fetch = generateFetchCode(result)
    const axios = generateAxiosCode(result)
    setFetchCode(fetch)
    setAxiosCode(axios)
  }

  const handleCopy = (code: string, label: string) => {
    navigator.clipboard.writeText(code)
    setCopied(label)
    toast.success(`Copied ${label}`)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleExample = () => {
    const example = `curl -X POST https://api.example.com/users \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer token123" \\
  -d '{"name":"John","email":"john@example.com"}'`
    setInput(example)
    setParsed(null)
    setFetchCode('')
    setAxiosCode('')
  }

  return (
    <ToolLayout
      title="Curl to Fetch/Axios"
      description="Convert curl commands to TypeScript fetch() or axios() code"
      icon={<Terminal className="w-5 h-5" />}
    >
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExample}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-omni-text/10 text-omni-text hover:bg-omni-text/20 transition-colors"
          >
            Load Example
          </button>
          <button
            onClick={handleConvert}
            disabled={!input.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-omni-primary text-white hover:bg-omni-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
          >
            <Code2 className="w-4 h-4" />
            Convert
          </button>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-omni-text/80">
            Curl Command
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your curl command here..."
            className="w-full px-4 py-3 rounded-lg bg-omni-bg border-2 border-omni-text/20 text-omni-text font-mono text-sm focus:outline-none focus:ring-2 focus:ring-omni-primary/50 focus:border-omni-primary/50 resize-none min-h-[150px]"
          />
        </div>

        {/* Results */}
        {parsed && (
          <>
            {/* Parsed Info */}
            <div className="grid md:grid-cols-4 gap-4 p-4 bg-omni-text/5 rounded-lg">
              <div className="text-center">
                <p className="text-lg font-bold text-omni-primary">{parsed.method}</p>
                <p className="text-xs text-omni-text/60">Method</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-omni-primary">{Object.keys(parsed.headers).length}</p>
                <p className="text-xs text-omni-text/60">Headers</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-omni-primary">{parsed.data ? 'Yes' : 'No'}</p>
                <p className="text-xs text-omni-text/60">Body</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-omni-primary">{parsed.auth ? 'Yes' : 'No'}</p>
                <p className="text-xs text-omni-text/60">Auth</p>
              </div>
            </div>

            {/* Code Output */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <TabButton id="fetch" label="Fetch API" activeTab={activeTab} onClick={setActiveTab} />
                  <TabButton id="axios" label="Axios" activeTab={activeTab} onClick={setActiveTab} />
                </div>
                <button
                  onClick={() => handleCopy(activeTab === 'fetch' ? fetchCode : axiosCode, activeTab)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-omni-text/10 text-omni-text hover:bg-omni-text/20 transition-colors text-sm"
                >
                  {copied === activeTab ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied === activeTab ? 'Copied!' : 'Copy'}
                </button>
              </div>

              {activeTab === 'fetch' ? (
                <CodeEditor
                  value={fetchCode}
                  language="typescript"
                  readOnly
                  placeholder="Fetch code will appear here..."
                  className="min-h-[400px]"
                />
              ) : (
                <CodeEditor
                  value={axiosCode}
                  language="typescript"
                  readOnly
                  placeholder="Axios code will appear here..."
                  className="min-h-[400px]"
                />
              )}
            </div>

            {/* Visual Flow */}
            <div className="flex items-center gap-4 p-4 bg-omni-text/5 rounded-lg">
              <div className="flex-1 text-center">
                <p className="text-sm font-medium text-omni-text/80">Curl Command</p>
                <code className="text-xs text-omni-text/60 break-all">{parsed.url}</code>
              </div>
              <ArrowRight className="w-6 h-6 text-omni-primary flex-shrink-0" />
              <div className="flex-1 text-center">
                <p className="text-sm font-medium text-omni-text/80">{activeTab === 'fetch' ? 'Fetch API' : 'Axios'}</p>
                <code className="text-xs text-omni-text/60 break-all">{parsed.method}()</code>
              </div>
            </div>

            {/* Actions */}
            <ActionToolbar>
              <button
                onClick={() => handleCopy(fetchCode, 'fetch')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-omni-primary text-white hover:bg-omni-primary/90 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy Fetch
              </button>
              <button
                onClick={() => handleCopy(axiosCode, 'axios')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-omni-text/10 text-omni-text hover:bg-omni-text/20 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy Axios
              </button>
            </ActionToolbar>
          </>
        )}

        {/* Info */}
        <div className="p-4 bg-omni-text/5 rounded-lg">
          <h3 className="text-sm font-semibold mb-2">Supported Features</h3>
          <ul className="grid md:grid-cols-2 gap-2 text-xs text-omni-text/70">
            <li>✓ HTTP methods: GET, POST, PUT, DELETE, PATCH, etc.</li>
            <li>✓ Custom headers (-H / --header)</li>
            <li>✓ Request body data (-d / --data)</li>
            <li>✓ Authentication (-u / --user)</li>
            <li>✓ JSON data detection and formatting</li>
            <li>✓ Both fetch() and axios() output</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  )
}
