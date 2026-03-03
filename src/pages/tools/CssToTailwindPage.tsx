import { useState, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { InputPane } from '@/components/tools/InputPane'
import { OutputPane } from '@/components/tools/OutputPane'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { Code2, Copy, Download } from 'lucide-react'
import { toast } from 'sonner'

// CSS property to Tailwind mapping (comprehensive)
const CSS_TO_TAILWIND: Record<string, Record<string, string>> = {
  // Layout
  display: {
    'block': 'block',
    'inline-block': 'inline-block',
    'flex': 'flex',
    'inline-flex': 'inline-flex',
    'grid': 'grid',
    'hidden': 'hidden',
  },
  flexDirection: {
    'row': 'flex-row',
    'row-reverse': 'flex-row-reverse',
    'column': 'flex-col',
    'column-reverse': 'flex-col-reverse',
  },
  flexWrap: {
    'nowrap': 'flex-nowrap',
    'wrap': 'flex-wrap',
    'wrap-reverse': 'flex-wrap-reverse',
  },
  justifyContent: {
    'flex-start': 'justify-start',
    'flex-end': 'justify-end',
    'center': 'justify-center',
    'space-between': 'justify-between',
    'space-around': 'justify-around',
    'space-evenly': 'justify-evenly',
  },
  alignItems: {
    'flex-start': 'items-start',
    'flex-end': 'items-end',
    'center': 'items-center',
    'baseline': 'items-baseline',
    'stretch': 'items-stretch',
  },
  gap: {
    '0.25rem': 'gap-1',
    '0.5rem': 'gap-2',
    '1rem': 'gap-4',
    '1.5rem': 'gap-6',
    '2rem': 'gap-8',
  },
  gapX: {
    '0.25rem': 'gap-x-1',
    '0.5rem': 'gap-x-2',
    '1rem': 'gap-x-4',
    '1.5rem': 'gap-x-6',
    '2rem': 'gap-x-8',
  },

  // Spacing
  padding: {
    '0': 'p-0',
    '0.25rem': 'p-1',
    '0.5rem': 'p-2',
    '1rem': 'p-4',
    '1.5rem': 'p-6',
    '2rem': 'p-8',
    '3rem': 'p-12',
  },
  margin: {
    '0': 'm-0',
    'auto': 'mx-auto',
    '0.25rem': 'm-1',
    '0.5rem': 'm-2',
    '1rem': 'm-4',
    '1.5rem': 'm-6',
    '2rem': 'm-8',
  },

  // Sizing
  width: {
    '100%': 'w-full',
    '50%': 'w-1/2',
    'auto': 'w-auto',
    'fit-content': 'w-fit',
  },
  height: {
    '100%': 'h-full',
    '50%': 'h-1/2',
    'auto': 'h-auto',
  },
  maxWidth: {
    '100%': 'max-w-full',
    '768px': 'max-w-md',
    '1024px': 'max-w-lg',
    '1280px': 'max-w-xl',
  },

  // Typography
  fontSize: {
    '0.75rem': 'text-xs',
    '0.875rem': 'text-sm',
    '1rem': 'text-base',
    '1.125rem': 'text-lg',
    '1.25rem': 'text-xl',
    '1.5rem': 'text-2xl',
    '2rem': 'text-3xl',
  },
  fontWeight: {
    '400': 'font-normal',
    '500': 'font-medium',
    '600': 'font-semibold',
    '700': 'font-bold',
  },
  textAlign: {
    'left': 'text-left',
    'center': 'text-center',
    'right': 'text-right',
  },
  lineHeight: {
    '1': 'leading-none',
    '1.25': 'leading-tight',
    '1.5': 'leading-normal',
    '1.75': 'leading-relaxed',
    '2': 'leading-loose',
  },

  // Colors (background & text)
  backgroundColor: {
    '#000000': 'bg-black',
    '#ffffff': 'bg-white',
    '#ef4444': 'bg-red-500',
    '#f97316': 'bg-orange-500',
    '#eab308': 'bg-yellow-500',
    '#22c55e': 'bg-green-500',
    '#06b6d4': 'bg-cyan-500',
    '#3b82f6': 'bg-blue-500',
    '#8b5cf6': 'bg-violet-500',
    '#ec4899': 'bg-pink-500',
    'transparent': 'bg-transparent',
  },
  color: {
    '#000000': 'text-black',
    '#ffffff': 'text-white',
    '#ef4444': 'text-red-500',
    '#f97316': 'text-orange-500',
    '#eab308': 'text-yellow-500',
    '#22c55e': 'text-green-500',
    '#06b6d4': 'text-cyan-500',
    '#3b82f6': 'text-blue-500',
    '#8b5cf6': 'text-violet-500',
    '#ec4899': 'text-pink-500',
  },

  // Borders
  borderWidth: {
    '1px': 'border',
    '2px': 'border-2',
    '4px': 'border-4',
    '8px': 'border-8',
  },
  borderRadius: {
    '0': 'rounded-none',
    '0.125rem': 'rounded-sm',
    '0.25rem': 'rounded',
    '0.375rem': 'rounded-md',
    '0.5rem': 'rounded-lg',
    '0.75rem': 'rounded-xl',
    '1rem': 'rounded-2xl',
    '9999px': 'rounded-full',
  },
  borderColor: {
    '#000000': 'border-black',
    '#ffffff': 'border-white',
    '#ef4444': 'border-red-500',
    '#3b82f6': 'border-blue-500',
  },

  // Effects
  opacity: {
    '0': 'opacity-0',
    '0.25': 'opacity-25',
    '0.5': 'opacity-50',
    '0.75': 'opacity-75',
    '1': 'opacity-100',
  },
  boxShadow: {
    'none': 'shadow-none',
    '0 1px 3px 0 rgb(0 0 0 / 0.1)': 'shadow-sm',
    '0 4px 6px -1px rgb(0 0 0 / 0.1)': 'shadow',
    '0 10px 15px -3px rgb(0 0 0 / 0.1)': 'shadow-lg',
    '0 20px 25px -5px rgb(0 0 0 / 0.1)': 'shadow-xl',
  },

  // Position
  position: {
    'static': 'static',
    'fixed': 'fixed',
    'absolute': 'absolute',
    'relative': 'relative',
    'sticky': 'sticky',
  },
  overflow: {
    'hidden': 'overflow-hidden',
    'auto': 'overflow-auto',
    'scroll': 'overflow-scroll',
    'visible': 'overflow-visible',
  },
}

// Parse CSS and convert to Tailwind
function convertCssToTailwind(css: string): { tailwind: string; warnings: string[] } {
  const warnings: string[] = []

  // Remove comments
  css = css.replace(/\/\*[\s\S]*?\*\//g, '')

  // Parse CSS rules
  const ruleRegex = /([^{]+)\{([^}]+)\}/g
  let match

  const lines: string[] = []

  while ((match = ruleRegex.exec(css)) !== null) {
    const selector = match[1].trim()
    const properties = match[2].trim()

    const propertyLines = properties.split(';').filter(Boolean)

    const tailwindClasses: string[] = []

    propertyLines.forEach((prop) => {
      const [property, ...valueParts] = prop.split(':')
      if (!property || valueParts.length === 0) return

      const propName = property.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase()) // kebab to camel
      const propValue = valueParts.join(':').trim()

      // Try direct mapping
      const mapping = CSS_TO_TAILWIND[propName]
      if (mapping) {
        const tailwindClass = mapping[propValue]
        if (tailwindClass) {
          tailwindClasses.push(tailwindClass)
        } else {
          // Try numeric values for spacing
          const numValue = parseFloat(propValue.replace(/[^\d.]/g, ''))
          if (!isNaN(numValue)) {
            // Check if it's a spacing value
            const spacingMapping: Record<number, string> = {
              0: '0',
              1: '0.25rem',
              2: '0.5rem',
              3: '0.75rem',
              4: '1rem',
              5: '1.25rem',
              6: '1.5rem',
              8: '2rem',
              10: '2.5rem',
              12: '3rem',
              16: '4rem',
              20: '5rem',
              24: '6rem',
            }
            const remValue = spacingMapping[numValue]
            if (remValue) {
              const found = Object.entries(mapping).find(([, v]) => v.includes(tailwindClasses[tailwindClasses.length - 1]))
              if (found) {
                const possibleClass = Object.entries(mapping).find(([, v]) => v.includes(remValue) || v.includes(`${numValue}px`) || v.includes(`${numValue}rem`))
                if (possibleClass) {
                  tailwindClasses.push(possibleClass[1])
                }
              }
            }
          }
          warnings.push(`${propName}: ${propValue}`)
        }
      } else {
        warnings.push(`${propName}: ${propValue}`)
      }
    })

    if (tailwindClasses.length > 0) {
      lines.push(`<!-- ${selector} -->`)
      lines.push(`<div class="${tailwindClasses.join(' ')}">`)
      lines.push(`  <!-- Content -->`)
      lines.push(`</div>`)
      lines.push('')
    }
  }

  return {
    tailwind: lines.join('\n'),
    warnings,
  }
}

export default function CssToTailwindPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [warnings, setWarnings] = useState<string[]>([])

  const handleConvert = useCallback(() => {
    if (!input.trim()) {
      toast.error('Please enter some CSS')
      return
    }

    const result = convertCssToTailwind(input)
    setOutput(result.tailwind)
    setWarnings(result.warnings)

    if (result.warnings.length > 0) {
      toast.warning(`Converted with ${result.warnings.length} unmapped properties`)
    } else {
      toast.success('CSS converted to Tailwind!')
    }
  }, [input])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(output)
    toast.success('Tailwind classes copied!')
  }, [output])

  const handleDownload = useCallback(() => {
    const blob = new Blob([output], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'tailwind-output.html'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded!')
  }, [output])

  const handleReset = useCallback(() => {
    setInput('')
    setOutput('')
    setWarnings([])
  }, [])

  const exampleCss = `.button {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  background-color: #3b82f6;
  color: #ffffff;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
}`

  return (
    <ToolLayout
      title="CSS to Tailwind"
      description="Convert raw CSS to Tailwind utility classes"
      icon={<Code2 className="w-8 h-8" />}
      actions={<ActionToolbar onReset={handleReset} />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-[500px]">
        {/* Input Panel */}
        <InputPane title="CSS Input">
          <div className="flex flex-col h-full p-6 gap-4">
            <div className="flex-1 flex flex-col min-h-0">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Paste your CSS here...

Example:
${exampleCss}`}
                className="flex-1 w-full min-h-[300px] bg-omni-text/5 border border-omni-text/10 rounded-xl text-sm text-omni-text p-4 focus:outline-none focus:border-omni-primary/30 resize-none font-mono"
                spellCheck={false}
              />
            </div>

            <button
              onClick={handleConvert}
              disabled={!input}
              className="w-full py-4 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl font-bold uppercase tracking-widest transition-all shadow-lg shadow-omni-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Code2 className="w-4 h-4" /> Convert to Tailwind
            </button>
          </div>
        </InputPane>

        {/* Output Panel */}
        <OutputPane title="Tailwind Output">
          <div className="flex flex-col h-full">
            {/* Warnings */}
            {warnings.length > 0 && (
              <div className="p-4 border-b border-omni-text/5 bg-omni-text/5">
                <p className="text-xs font-bold text-omni-text/50 uppercase tracking-wider mb-2">Unmapped Properties</p>
                <div className="flex flex-wrap gap-2">
                  {warnings.map((warning, i) => (
                    <span key={i} className="px-2 py-1 bg-omni-text/10 rounded text-xs text-omni-text/60 font-mono">
                      {warning}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Output */}
            <div className="flex-1 p-6 min-h-0">
              {output ? (
                <textarea
                  readOnly
                  value={output}
                  className="w-full h-full min-h-[300px] bg-omni-text/5 border border-omni-text/10 rounded-xl text-sm text-omni-text/70 p-4 focus:outline-none resize-none font-mono"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-omni-text/30">
                  <div className="text-center">
                    <Code2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Enter CSS and click "Convert to Tailwind"</p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            {output && (
              <div className="p-4 border-t border-omni-text/5 flex gap-3">
                <button
                  onClick={handleCopy}
                  className="flex-1 py-3 bg-omni-text/5 hover:bg-omni-text/10 text-omni-text rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" /> Copy
                </button>
                <button
                  onClick={handleDownload}
                  className="flex-1 py-3 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-omni-primary/20 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Save
                </button>
              </div>
            )}
          </div>
        </OutputPane>
      </div>
    </ToolLayout>
  )
}
