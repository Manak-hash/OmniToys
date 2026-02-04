import { useEffect, useMemo, useRef } from 'react'
import { EditorState, Compartment } from '@codemirror/state'
import {
  EditorView,
  keymap,
  highlightSpecialChars,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  lineNumbers,
  highlightActiveLineGutter,
  placeholder,
} from '@codemirror/view'
import { indentOnInput, bracketMatching, foldGutter, syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language'
import { highlightSelectionMatches } from '@codemirror/search'
import { autocompletion, completionKeymap, acceptCompletion } from '@codemirror/autocomplete'
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
import { highlightActiveLine } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { javascript } from '@codemirror/lang-javascript'
import { json } from '@codemirror/lang-json'
import { sql, MySQL, PostgreSQL, SQLite } from '@codemirror/lang-sql'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { cn } from '@/utils/cn'

type SupportedLanguage = 'json' | 'typescript' | 'javascript' | 'css' | 'sql' | 'html' | 'yaml' | 'xml' | 'c' | 'cpp'

interface CodeEditorProps {
  value: string
  onChange?: (value: string) => void
  language?: SupportedLanguage
  readOnly?: boolean
  className?: string
  placeholder?: string
}

// Custom one-dark theme that matches our design system
const omniDarkTheme = EditorView.theme({
  '&': {
    backgroundColor: 'transparent',
    color: 'var(--omni-text)',
    fontSize: '14px',
    fontFamily: '"Roboto Mono", monospace',
  },
  '.cm-scroller': {
    fontFamily: '"Roboto Mono", monospace',
    overflow: 'auto',
  },
  '.cm-content': {
    padding: '16px',
    minHeight: '268px',
  },
  '.cm-line': {
    padding: '0 0 0 4px',
  },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    color: 'var(--omni-text)',
    border: 'none',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'transparent',
    color: 'var(--omni-primary)',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  '.cm-focused': {
    outline: 'none',
  },
  '.cm-selectionBackground': {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
  },
  '.cm-selectionMatch': {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  '.cm-cursor': {
    borderLeftColor: 'var(--omni-primary)',
  },
  '.cm-placeholder': {
    color: 'var(--omni-text/40)',
    fontStyle: 'italic',
  },
  '.cm-tooltip': {
    border: '1px solid var(--omni-text/20)',
    backgroundColor: 'var(--omni-bg)',
    borderRadius: '4px',
  },
  '.cm-tooltip-autocomplete': {
    '& ul': {
      fontFamily: 'inherit',
      maxHeight: '200px',
    },
    '& li': {
      padding: '4px 8px',
      '&[aria-selected]': {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
      },
    },
  },
})

// SQL dialect configuration
const sqlDialects = {
  mysql: MySQL,
  postgresql: PostgreSQL,
  sqlite: SQLite,
}

export function CodeEditor({
  value,
  onChange,
  language = 'json',
  readOnly = false,
  className,
  placeholder: placeholderText,
}: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const languageCompartment = useRef(new Compartment())
  const readOnlyCompartment = useRef(new Compartment())
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  // Get language extension
  const languageExtension = useMemo(() => {
    switch (language) {
      case 'json':
        return json()
      case 'typescript':
      case 'javascript':
        return javascript({ jsx: true, typescript: language === 'typescript' })
      case 'sql':
        return sql({ dialect: sqlDialects.mysql })
      case 'html':
        return html()
      case 'css':
        return css()
      case 'yaml':
        // No YAML support in CodeMirror yet, use plain text
        return []
      case 'xml':
        return html()
      case 'c':
      case 'cpp':
        return javascript({ jsx: false, typescript: false })
      default:
        return []
    }
  }, [language])

  // Setup extensions
  const extensions = useMemo(() => {
    const baseExtensions = [
      lineNumbers(),
      foldGutter({
        openText: '▼',
        closedText: '▶',
      }),
      drawSelection(),
      dropCursor(),
      crosshairCursor(),
      highlightActiveLineGutter(),
      highlightSpecialChars(),
      history(),
      indentOnInput(),
      bracketMatching(),
      closeBrackets(),
      autocompletion(),
      rectangularSelection(),
      highlightActiveLine(),
      highlightSelectionMatches(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...historyKeymap,
        ...completionKeymap,
        { key: 'Tab', run: acceptCompletion },
      ]),
      EditorView.lineWrapping,
      languageCompartment.current.of(languageExtension),
      readOnlyCompartment.current.of(EditorState.readOnly.of(readOnly)),
      EditorView.updateListener.of((update) => {
        if (update.docChanged && onChangeRef.current) {
          const doc = update.state.doc.toString()
          onChangeRef.current(doc)
        }
      }),
      omniDarkTheme,
    ]

    if (placeholderText) {
      baseExtensions.push(placeholder(placeholderText))
    }

    return baseExtensions
  }, [languageExtension, readOnly, placeholderText])

  // Initialize editor
  useEffect(() => {
    if (!containerRef.current) return

    const state = EditorState.create({
      doc: value,
      extensions,
    })

    const view = new EditorView({
      state,
      parent: containerRef.current,
    })

    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, [extensions, value])

  // Update value from outside
  useEffect(() => {
    if (!viewRef.current) return

    const currentValue = viewRef.current.state.doc.toString()
    if (currentValue !== value) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: currentValue.length,
          insert: value,
        },
      })
    }
  }, [value])

  // Update language
  useEffect(() => {
    if (!viewRef.current) return

    viewRef.current.dispatch({
      effects: languageCompartment.current.reconfigure(languageExtension),
    })
  }, [languageExtension])

  // Update read-only state
  useEffect(() => {
    if (!viewRef.current) return

    viewRef.current.dispatch({
      effects: readOnlyCompartment.current.reconfigure(EditorState.readOnly.of(readOnly)),
    })
  }, [readOnly])

  return (
    <div
      className={cn(
        'relative rounded-lg overflow-hidden border border-omni-text/10 bg-omni-bg/50 font-mono text-sm',
        'focus-within:ring-2 focus-within:ring-omni-primary/50 transition-shadow',
        className
      )}
    >
      <div ref={containerRef} className="min-h-[300px]" />
      {readOnly && (
        <div className="pointer-events-none absolute top-2 right-2 rounded bg-omni-text/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-omni-text/40">
          Read Only
        </div>
      )}
    </div>
  )
}
