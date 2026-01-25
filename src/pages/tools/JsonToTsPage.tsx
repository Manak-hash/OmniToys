import { useState } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { CodeEditor } from '@/components/ui/CodeEditor'
import JsonToTs from 'json-to-ts'
import { Copy, FileJson, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

export default function JsonToTsPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleJsonChange = (val: string) => {
    setInput(val)
    setError(null)
    if (!val.trim()) {
      setOutput('')
      return
    }

    try {
      const json = JSON.parse(val)
      const interfaces = JsonToTs(json)
      setOutput(interfaces.join('\n\n'))
    } catch {
      // Logic for live-error could go here if non-distracting
    }
  }

  const convert = () => {
    try {
      if (!input.trim()) return
      const json = JSON.parse(input)
      const interfaces = JsonToTs(json)
      setOutput(interfaces.join('\n\n'))
      setError(null)
      toast.success('Converted successfully!')
    } catch (e) {
      setError((e as Error).message)
      toast.error('Invalid JSON format')
    }
  }

  const copyToClipboard = () => {
    if (!output) return
    navigator.clipboard.writeText(output)
    toast.success('TypeScript interfaces copied!')
  }

  return (
    <ToolLayout
      title="JSON to TypeScript"
      description="Instantly convert JSON objects into TypeScript interfaces. Deeply nested objects are automatically extracted."
      icon={<FileJson className="w-8 h-8" />}
      actions={
        <div className="flex gap-2">
          <button 
            onClick={convert}
            className="flex items-center gap-2 px-3 py-1.5 bg-omni-primary/10 text-omni-primary hover:bg-omni-primary/20 rounded-lg transition-colors font-medium text-sm"
          >
            <RefreshCw className="w-4 h-4" /> Convert
          </button>
          <button 
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-3 py-1.5 bg-omni-text/10 text-omni-text hover:bg-omni-text/20 rounded-lg transition-colors font-medium text-sm"
          >
            <Copy className="w-4 h-4" /> Copy Output
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-[500px]">
        {/* Input Column */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-omni-text/70">Input JSON</label>
            {error && <span className="text-xs text-red-400 animate-pulse truncate max-w-[200px]">{error}</span>}
          </div>
          <CodeEditor 
            value={input} 
            onChange={handleJsonChange} 
            language="json" 
            placeholder='Paste your JSON here... e.g. {"name": "OmniToys", "version": 1}'
            className="flex-1 border-omni-text/20 focus-within:border-omni-primary/50"
          />
        </div>

        {/* Output Column */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-omni-text/70">TypeScript Interfaces</label>
          <div className="relative flex-1">
            <CodeEditor 
              value={output} 
              language="typescript" 
              readOnly 
              placeholder="Result will appear here..."
              className="h-full bg-omni-bg/80"
            />
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
