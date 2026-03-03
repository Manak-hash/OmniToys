import { useState, useCallback, useEffect, useRef } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import {
  BookOpen, Copy, Download, Bold, Italic, Code, Link,
  List, ListOrdered, Quote, Heading1, Heading2, Heading3, Image as ImageIcon, Strikethrough,
  CheckSquare, X
} from 'lucide-react'
import { toast } from 'sonner'

type ViewMode = 'split' | 'editor' | 'preview'

const EXAMPLE_MD = `# Welcome to Markdown Live Editor

## Features

- **Live Preview**: See your changes instantly
- **Toolbar Buttons**: Click to format text
- **Mobile Friendly**: Works great on all devices

## Formatting Examples

### Text Styling

You can write **bold text**, *italic text*, or ***both***.

You can also use ~~strikethrough~~ for deleted content.

### Links and Images

[Visit GitHub](https://github.com)

### Code Blocks

Inline \`code\` looks like this.

\`\`\`javascript
// Code blocks with syntax
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}
\`\`\`

### Lists

1. First ordered item
2. Second ordered item
3. Third ordered item

- Unordered item
- Another item
  - Nested item

### Blockquotes

> This is a blockquote.
> It can span multiple lines.

### Checkboxes

- [x] Completed task
- [ ] Pending task

---

**Happy writing! ✨**
`

// Enhanced Markdown Parser
const parseMarkdown = (md: string): string => {
  let html = md

  // Escape HTML first
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // Checkboxes - must be before lists
  html = html.replace(/- \[x\] (.*)(\n|$)/g, '<li class="ml-4 list-disc flex items-center gap-2"><input type="checkbox" checked disabled class="rounded"> $1</li>')
  html = html.replace(/- \[ \] (.*)(\n|$)/g, '<li class="ml-4 list-disc flex items-center gap-2"><input type="checkbox" disabled class="rounded"> $1</li>')

  // Code blocks with language support
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    const langLabel = lang ? `<span class="text-xs text-omni-text/30 uppercase mb-1 block">${lang}</span>` : ''
    return `<pre class="bg-black/40 rounded-lg p-4 my-4 overflow-x-auto border border-omni-text/10">${langLabel}<code class="text-sm font-mono text-omni-text whitespace-pre-wrap">${code.trim()}</code></pre>`
  })

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-omni-text/10 px-2 py-0.5 rounded text-sm font-mono text-omni-primary">$1</code>')

  // Headers
  html = html.replace(/^#### (.*$)/gm, '<h4 class="text-base font-bold mt-5 mb-2 text-omni-text">$1</h4>')
  html = html.replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mt-6 mb-3 text-omni-text">$1</h3>')
  html = html.replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-8 mb-4 text-omni-text">$1</h2>')
  html = html.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-black mt-6 mb-4 text-omni-primary">$1</h1>')

  // Bold, Italic, Bold+Italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>')
  html = html.replace(/_(.+?)_/g, '<em>$1</em>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, '<del class="text-omni-text/50 line-through">$1</del>')

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-omni-primary hover:underline" target="_blank" rel="noopener">$1</a>')

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4" />')

  // Unordered lists (skip checkboxes which are already handled)
  html = html.replace(/^\-(?!\s*\[)(.*$)/gm, '<li class="ml-4 list-disc">$1</li>')
  html = html.replace(/(<li class="ml-4 list-disc">.*<\/li>\n?)+/g, '<ul class="my-4 space-y-1">$&</ul>')

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
  html = html.replace(/(<li class="ml-4 list-decimal">.*<\/li>\n?)+/g, '<ol class="my-4 space-y-1">$&</ol>')

  // Blockquotes
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote class="border-l-4 border-omni-primary/30 pl-4 py-2 my-4 italic text-omni-text/70 bg-omni-text/5 rounded-r">$1</blockquote>')

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr class="border-omni-text/10 my-8" />')
  html = html.replace(/^\*\*\*$/gm, '<hr class="border-omni-text/10 my-8" />')

  // Line breaks and paragraphs
  html = html.replace(/\n\n+/g, '</p><p class="my-4">')
  html = `<p class="my-4 leading-relaxed">${html}</p>`

  // Clean up empty paragraphs
  html = html.replace(/<p class="my-4 leading-relaxed"><\/p>/g, '')
  html = html.replace(/<p class="my-4 leading-relaxed">([^<]+)<\/p><\/p>/g, '<p class="my-4 leading-relaxed">$1</p>')

  return html
}

export default function MarkdownEditorPage() {
  const [markdown, setMarkdown] = useState(EXAMPLE_MD)
  const [html, setHtml] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)

  // Update HTML preview and stats
  useEffect(() => {
    setHtml(parseMarkdown(markdown))
    setWordCount(markdown.trim().split(/\s+/).filter(w => w.length > 0).length)
    setCharCount(markdown.length)
  }, [markdown])

  // Insert markdown syntax at cursor position
  const insertMarkdown = useCallback((before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = markdown.substring(start, end) || placeholder
    const newText = markdown.substring(0, start) + before + selected + after + markdown.substring(end)

    setMarkdown(newText)

    // Set cursor position after insertion
    setTimeout(() => {
      const newPos = start + before.length + selected.length
      textarea.setSelectionRange(newPos, newPos)
      textarea.focus()
    }, 0)
  }, [markdown])

  // Toolbar actions - mobile optimized layout
  const toolbarActions = [
    { icon: Bold, label: 'Bold', action: () => insertMarkdown('**', '**', 'bold text') },
    { icon: Italic, label: 'Italic', action: () => insertMarkdown('*', '*', 'italic text') },
    { icon: Strikethrough, label: 'Strike', action: () => insertMarkdown('~~', '~~', 'strikethrough') },
    { icon: Heading1, label: 'H1', action: () => insertMarkdown('# ', '', 'Heading 1') },
    { icon: Heading2, label: 'H2', action: () => insertMarkdown('## ', '', 'Heading 2') },
    { icon: Heading3, label: 'H3', action: () => insertMarkdown('### ', '', 'Heading 3') },
    { icon: Code, label: 'Code', action: () => insertMarkdown('`', '`', 'code') },
    { icon: Link, label: 'Link', action: () => insertMarkdown('[', '](url)', 'link text') },
    { icon: ImageIcon, label: 'Image', action: () => insertMarkdown('![alt](', ')', 'image url') },
    { icon: List, label: 'Bullet', action: () => insertMarkdown('- ', '', 'List item') },
    { icon: ListOrdered, label: 'Number', action: () => insertMarkdown('1. ', '', 'List item') },
    { icon: Quote, label: 'Quote', action: () => insertMarkdown('> ', '', 'Quote') },
    { icon: CheckSquare, label: 'Task', action: () => insertMarkdown('- [ ] ', '', 'Task') },
  ]

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(markdown)
    toast.success('Markdown copied!')
  }, [markdown])

  const handleCopyHtml = useCallback(() => {
    navigator.clipboard.writeText(html)
    toast.success('HTML copied!')
  }, [html])

  const handleDownload = useCallback(() => {
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'document.md'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded!')
  }, [markdown])

  const handleClear = useCallback(() => {
    setMarkdown('')
    setHtml('')
  }, [])

  return (
    <ToolLayout
      title="Markdown Live Editor"
      description="Write markdown with live preview - mobile friendly"
      icon={<BookOpen className="w-8 h-8" />}
      actions={<ActionToolbar onReset={handleClear} />}
    >
      <div className="flex flex-col h-full gap-3">
        {/* Toolbar - scrollable on mobile */}
        <div className="flex items-center gap-1 p-2 bg-omni-bg/40 rounded-xl border border-omni-text/5 overflow-x-auto">
          {toolbarActions.map((action) => (
            <button
              key={action.label}
              onClick={action.action}
              className="p-2 hover:bg-omni-text/10 rounded-lg transition-colors flex-shrink-0"
              title={action.label}
            >
              <action.icon className="w-4 h-4 text-omni-text/50" />
            </button>
          ))}
        </div>

        {/* View Mode Toggle & Stats - mobile friendly */}
        <div className="flex items-center justify-between gap-3 px-3 py-2 bg-omni-bg/40 rounded-lg border border-omni-text/5 flex-wrap">
          <div className="flex gap-1 bg-omni-text/5 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('editor')}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase transition-all ${
                viewMode === 'editor'
                  ? 'bg-omni-primary text-white'
                  : 'text-omni-text/50 hover:text-omni-text'
              }`}
            >
              Write
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase transition-all ${
                viewMode === 'split'
                  ? 'bg-omni-primary text-white'
                  : 'text-omni-text/50 hover:text-omni-text'
              }`}
            >
              Split
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase transition-all ${
                viewMode === 'preview'
                  ? 'bg-omni-primary text-white'
                  : 'text-omni-text/50 hover:text-omni-text'
              }`}
            >
              Preview
            </button>
          </div>
          <div className="flex items-center gap-3 text-xs text-omni-text/50">
            <span>{wordCount} words</span>
            <span>{charCount} chars</span>
          </div>
        </div>

        {/* Main Editor Area - full height, no unnecessary scrolling */}
        <div className="flex-1 min-h-0 flex gap-3">
          {/* Editor Panel */}
          {(viewMode === 'editor' || viewMode === 'split') && (
            <div className="flex-1 flex flex-col bg-omni-bg/30 rounded-xl overflow-hidden border border-omni-text/10">
              <div className="px-4 py-2 bg-omni-text/5 border-b border-omni-text/10 flex items-center justify-between">
                <span className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Write</span>
                <button
                  onClick={() => setMarkdown('')}
                  className="p-1 hover:bg-omni-text/10 rounded transition-colors"
                  title="Clear"
                >
                  <X className="w-3 h-3 text-omni-text/40" />
                </button>
              </div>
              <textarea
                ref={textareaRef}
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder="Start writing..."
                className="flex-1 w-full bg-transparent border-none text-sm font-mono text-omni-text p-4 focus:outline-none resize-none min-h-0"
                spellCheck={false}
              />
            </div>
          )}

          {/* Preview Panel */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className="flex-1 flex flex-col bg-omni-bg/30 rounded-xl overflow-hidden border border-omni-text/10">
              <div className="px-4 py-2 bg-omni-text/5 border-b border-omni-text/10">
                <span className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Preview</span>
              </div>
              <div className="flex-1 p-4 prose prose-invert prose-sm max-w-none overflow-auto">
                <div dangerouslySetInnerHTML={{ __html: html || '<p class="text-omni-text/30 italic">Preview will appear here...</p>' }} />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 py-3 bg-omni-text/5 hover:bg-omni-text/10 text-omni-text rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2"
          >
            <Copy className="w-4 h-4" /> Copy
          </button>
          <button
            onClick={handleCopyHtml}
            className="flex-1 py-3 bg-omni-text/5 hover:bg-omni-text/10 text-omni-text rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2"
          >
            <Copy className="w-4 h-4" /> HTML
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 py-3 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-omni-primary/20 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Save
          </button>
        </div>
      </div>
    </ToolLayout>
  )
}
