import { useState, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { Code2, Copy, Download } from 'lucide-react'
import { toast } from 'sonner'

type CaseType = 'camelCase' | 'pascalCase' | 'snakeCase' | 'kebabCase' | 'constant' | 'upper' | 'lower' | 'title'

export default function CaseConverterPage() {
  const [input, setInput] = useState('')
  const [outputs, setOutputs] = useState<Record<CaseType, string>>({} as Record<CaseType, string>)

  const convertCase = useCallback((text: string, caseType: CaseType): string => {
    if (!text) return ''

    const converters: Record<CaseType, (text: string) => string> = {
      camelCase: (text) => {
        return text
          .replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
          .replace(/^[A-Z]/, (c) => c.toLowerCase())
      },
      pascalCase: (text) => {
        const camel = converters.camelCase(text)
        return camel.charAt(0).toUpperCase() + camel.slice(1)
      },
      snakeCase: (text) => {
        return text
          .replace(/([A-Z])/g, '_$1')
          .replace(/^_/, '')
          .replace(/[-\s]+/g, '_')
          .toLowerCase()
      },
      kebabCase: (text) => {
        return text
          .replace(/([A-Z])/g, '-$1')
          .replace(/^-/, '')
          .replace(/[\s_]+/g, '-')
          .toLowerCase()
      },
      constant: (text) => {
        return converters.snakeCase(text).toUpperCase()
      },
      upper: (text) => text.toUpperCase(),
      lower: (text) => text.toLowerCase(),
      title: (text) => {
        return text
          .replace(/[-_\s]+(.)?/g, (_, c) => c ? ` ${c.toUpperCase()}` : ' ')
          .replace(/^./, (c) => c.toUpperCase())
          .trim()
      },
    }

    return converters[caseType](text)
  }, [])

  const handleConvert = useCallback(() => {
    if (!input) {
      toast.error('Please enter some text')
      return
    }

    const results: Record<CaseType, string> = {} as Record<CaseType, string>
    const caseTypes: CaseType[] = ['camelCase', 'pascalCase', 'snakeCase', 'kebabCase', 'constant', 'upper', 'lower', 'title']

    caseTypes.forEach((caseType) => {
      results[caseType] = convertCase(input, caseType)
    })

    setOutputs(results)
    toast.success('Converted to all cases!')
  }, [input, convertCase])

  const handleCopy = useCallback((caseType: CaseType) => {
    navigator.clipboard.writeText(outputs[caseType])
    toast.success(`${caseType} copied!`)
  }, [outputs])

  const handleReset = useCallback(() => {
    setInput('')
    setOutputs({} as Record<CaseType, string>)
  }, [])

  const caseLabels: Record<CaseType, { label: string; example: string; description: string }> = {
    camelCase: { label: 'camelCase', example: 'myVariableName', description: 'JavaScript variables' },
    pascalCase: { label: 'PascalCase', example: 'MyVariableName', description: 'Class names' },
    snakeCase: { label: 'snake_case', example: 'my_variable_name', description: 'Python variables' },
    kebabCase: { label: 'kebab-case', example: 'my-variable-name', description: 'CSS classes' },
    constant: { label: 'CONSTANT_CASE', example: 'MY_VARIABLE_NAME', description: 'Constants' },
    upper: { label: 'UPPERCASE', example: 'MYVARIABLENAME', description: 'All uppercase' },
    lower: { label: 'lowercase', example: 'myvariablename', description: 'All lowercase' },
    title: { label: 'Title Case', example: 'Myvariablename', description: 'Titles' },
  }

  return (
    <ToolLayout
      title="Case Converter"
      description="Convert text between different naming conventions"
      icon={<Code2 className="w-8 h-8" />}
      actions={<ActionToolbar onReset={handleReset} />}
    >
      <div className="flex flex-col h-full gap-6">
        {/* Input */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Input Text</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text to convert... (e.g., myVariableName or My Variable Name)"
            className="w-full h-24 bg-omni-text/5 border border-omni-text/10 rounded-xl text-sm text-omni-text p-4 focus:outline-none focus:border-omni-primary/30 resize-none"
          />
          <button
            onClick={handleConvert}
            disabled={!input}
            className="w-full py-3 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-omni-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Code2 className="w-4 h-4" /> Convert All Cases
          </button>
        </div>

        {/* Outputs Grid */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Object.keys(caseLabels) as CaseType[]).map((caseType) => {
              const info = caseLabels[caseType]
              const output = outputs[caseType]
              return (
                <div key={caseType} className="bg-omni-bg/30 rounded-xl overflow-hidden border border-omni-text/10">
                  <div className="px-4 py-3 bg-omni-text/5 border-b border-omni-text/10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">{info.label}</span>
                      <span className="text-xs text-omni-text/40">{info.description}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2">
                      <input
                        readOnly
                        value={output || ''}
                        className="flex-1 bg-transparent border-none text-sm text-omni-text/70 font-mono focus:outline-none"
                        placeholder={info.example}
                      />
                      <button
                        onClick={() => handleCopy(caseType)}
                        disabled={!output}
                        className="p-2 hover:bg-omni-text/10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Copy"
                      >
                        <Copy className="w-4 h-4 text-omni-text/50" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
