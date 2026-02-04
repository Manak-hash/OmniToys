import { useState } from 'react'
import { Database, Copy, Check, Download, Sparkles, Plus, Trash2 } from 'lucide-react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { CodeEditor } from '@/components/ui/CodeEditor'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { generatePayload, generatePreset, formatJson, type Field, type FieldType } from '@/utils/apiPayloadGenerator'
import { toast } from 'sonner'
import jsFileDownload from 'js-file-download'

export default function ApiPayloadPage() {
  const [count, setCount] = useState(5)
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)
  const [fields, setFields] = useState<Field[]>([
    { name: 'id', type: 'number' },
    { name: 'name', type: 'string' },
    { name: 'email', type: 'email' },
  ])

  const handleGenerate = () => {
    const data = generatePayload({ count, fields })
    setOutput(formatJson(data))
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
    jsFileDownload(output, 'payload.json')
    toast.success('Downloaded payload.json')
  }

  const handlePreset = (preset: 'user' | 'post' | 'product' | 'comment') => {
    const data = generatePreset(preset)
    setOutput(formatJson(data))
    toast.success(`Generated ${preset} template`)
  }

  const addField = () => {
    setFields([...fields, { name: `field${fields.length + 1}`, type: 'string' }])
  }

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index))
  }

  const updateField = (index: number, updates: Partial<Field>) => {
    setFields(fields.map((f, i) => (i === index ? { ...f, ...updates } : f)))
  }

  const fieldTypes: FieldType[] = ['string', 'number', 'boolean', 'email', 'date', 'url', 'uuid', 'lorem']

  return (
    <ToolLayout
      title="API Payload Generator"
      description="Generate dummy JSON data for testing"
      icon={<Database className="w-5 h-5" />}
    >
      <div className="space-y-6">
        {/* Quick Presets */}
        <div className="flex flex-wrap gap-2 p-4 bg-omni-text/5 rounded-lg">
          <span className="text-sm font-medium text-omni-text/80 mr-2">Presets:</span>
          <button
            onClick={() => handlePreset('user')}
            className="px-3 py-1.5 text-sm rounded-lg bg-omni-text/10 text-omni-text hover:bg-omni-text/20 transition-colors"
          >
            User
          </button>
          <button
            onClick={() => handlePreset('post')}
            className="px-3 py-1.5 text-sm rounded-lg bg-omni-text/10 text-omni-text hover:bg-omni-text/20 transition-colors"
          >
            Post
          </button>
          <button
            onClick={() => handlePreset('product')}
            className="px-3 py-1.5 text-sm rounded-lg bg-omni-text/10 text-omni-text hover:bg-omni-text/20 transition-colors"
          >
            Product
          </button>
          <button
            onClick={() => handlePreset('comment')}
            className="px-3 py-1.5 text-sm rounded-lg bg-omni-text/10 text-omni-text hover:bg-omni-text/20 transition-colors"
          >
            Comment
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Field Builder */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Fields</h3>
              <button
                onClick={addField}
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-omni-primary text-white hover:bg-omni-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Field
              </button>
            </div>

            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-omni-text/80">Count:</label>
              <input
                type="number"
                min={1}
                max={100}
                value={count}
                onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-24 px-3 py-2 rounded-lg bg-omni-bg border border-omni-text/20 text-omni-text focus:outline-none focus:ring-2 focus:ring-omni-primary/50"
              />
              <button
                onClick={handleGenerate}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-omni-primary text-white hover:bg-omni-primary/90 transition-colors ml-auto"
              >
                <Sparkles className="w-4 h-4" />
                Generate
              </button>
            </div>

            {/* Field List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {fields.map((field, index) => (
                <div key={index} className="flex gap-2 p-3 bg-omni-text/5 rounded-lg">
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => updateField(index, { name: e.target.value })}
                    placeholder="Field name"
                    className="flex-1 px-3 py-2 rounded-lg bg-omni-bg border border-omni-text/20 text-omni-text text-sm focus:outline-none focus:ring-2 focus:ring-omni-primary/50"
                  />
                  <select
                    value={field.type}
                    onChange={(e) => updateField(index, { type: e.target.value as FieldType })}
                    className="px-3 py-2 rounded-lg bg-omni-bg border border-omni-text/20 text-omni-text text-sm focus:outline-none focus:ring-2 focus:ring-omni-primary/50"
                  >
                    {fieldTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <label className="flex items-center gap-1 text-xs text-omni-text/60 px-2">
                    <input
                      type="checkbox"
                      checked={field.isArray || false}
                      onChange={(e) => updateField(index, { isArray: e.target.checked })}
                      className="w-4 h-4 rounded"
                    />
                    Array
                  </label>
                  <button
                    onClick={() => removeField(index)}
                    className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                    title="Remove field"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Output */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Generated JSON</h3>
            <CodeEditor
              value={output}
              onChange={() => {}}
              language="json"
              readOnly
              placeholder="Generated JSON will appear here..."
              className="min-h-[500px]"
            />
          </div>
        </div>

        {/* Actions */}
        {output && (
          <ActionToolbar>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-omni-primary text-white hover:bg-omni-primary/90 transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-omni-text/10 text-omni-text hover:bg-omni-text/20 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </ActionToolbar>
        )}
      </div>
    </ToolLayout>
  )
}
