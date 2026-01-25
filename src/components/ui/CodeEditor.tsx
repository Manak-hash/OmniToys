import Editor from 'react-simple-code-editor'
import { highlight, languages } from 'prismjs'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-markup' // for xml/svg
import 'prismjs/components/prism-bash'
import 'prismjs/themes/prism-tomorrow.css' // Dark theme
import { cn } from '@/utils/cn'

type SupportedLanguage = 'json' | 'typescript' | 'css' | 'xml' | 'bash' | 'markup'

interface CodeEditorProps {
  value: string
  onChange?: (value: string) => void
  language?: SupportedLanguage
  readOnly?: boolean
  className?: string
  placeholder?: string
}

export function CodeEditor({ 
  value, 
  onChange, 
  language = 'json', 
  readOnly = false,
  className,
  placeholder
}: CodeEditorProps) {
  
  const getGrammar = (lang: SupportedLanguage) => {
    switch (lang) {
      case 'json': return languages.json
      case 'typescript': return languages.typescript
      case 'css': return languages.css
      case 'xml': 
      case 'markup': return languages.markup
      case 'bash': return languages.bash
      default: return languages.plain
    }
  }

  return (
    <div className={cn(
      "relative rounded-lg overflow-hidden border border-omni-text/10 bg-omni-bg/50 font-mono text-sm",
      "focus-within:ring-2 focus-within:ring-omni-primary/50 transition-shadow",
      className
    )}>
      <Editor
        value={value}
        onValueChange={!readOnly && onChange ? onChange : () => {}}
        highlight={(code) => highlight(code, getGrammar(language), language)}
        padding={16}
        placeholder={placeholder}
        textareaClassName="focus:outline-none w-full"
        style={{
          fontFamily: '"Roboto Mono", monospace',
          fontSize: 14,
          backgroundColor: 'transparent',
          minHeight: '100%',
          width: '100%'
        }}
        className="min-h-[300px]"
        readOnly={readOnly}
      />
      {readOnly && !placeholder && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-omni-text/10 rounded text-[10px] uppercase font-bold text-omni-text/40 pointer-events-none tracking-widest">
          Read Only
        </div>
      )}
    </div>
  )
}
