import { useState, useCallback, useEffect } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { FileText, FileCode, Printer } from 'lucide-react'
import { toast } from 'sonner'

const EXAMPLE_MD = `# My Document

## Introduction

This is a **sample document** to demonstrate the Markdown to PDF/HTML export feature.

## Features

- **Bold** and *italic* text
- Lists (ordered and unordered)
- [Links](https://example.com)
- Code blocks

### Code Example

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}
\`\`\`

## Conclusion

This tool helps you create professional documents from Markdown!
`

// Enhanced Markdown to HTML converter
const parseMarkdown = (md: string): string => {
  let html = md

  // Escape HTML first
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // Code blocks
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    const langLabel = lang ? `<span class="text-xs text-gray-400 uppercase mb-2 block">${lang}</span>` : ''
    return `<pre class="bg-gray-900 rounded-lg p-4 my-4 overflow-x-auto border border-gray-700">${langLabel}<code class="text-sm font-mono text-gray-100 whitespace-pre-wrap">${code.trim()}</code></pre>`
  })

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-200 px-2 py-0.5 rounded text-sm font-mono text-gray-800">$1</code>')

  // Headers
  html = html.replace(/^#### (.*$)/gm, '<h4 class="text-lg font-semibold mt-4 mb-2 text-gray-800">$1</h4>')
  html = html.replace(/^### (.*$)/gm, '<h3 class="text-xl font-semibold mt-6 mb-3 text-gray-800">$1</h3>')
  html = html.replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900">$1</h2>')
  html = html.replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-6 mb-6 text-gray-900">$1</h1>')

  // Bold, Italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener">$1</a>')

  // Unordered lists
  html = html.replace(/^-(?!.*\[)(.*$)/gm, '<li class="ml-4 list-disc">$1</li>')
  html = html.replace(/(<li class="ml-4 list-disc">.*<\/li>\n?)+/g, '<ul class="my-4 space-y-1">$&</ul>')

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
  html = html.replace(/(<li class="ml-4 list-decimal">.*<\/li>\n?)+/g, '<ol class="my-4 space-y-1">$&</ol>')

  // Blockquotes
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 py-2 my-4 italic text-gray-600 bg-gray-50 rounded-r">$1</blockquote>')

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr class="border-gray-200 my-8" />')
  html = html.replace(/^\*\*\*$/gm, '<hr class="border-gray-200 my-8" />')

  // Line breaks and paragraphs
  html = html.replace(/\n\n+/g, '</p><p class="my-4">')
  html = `<p class="my-4 leading-relaxed text-gray-700">${html}</p>`

  // Clean up empty paragraphs
  html = html.replace(/<p class="my-4 leading-relaxed text-gray-700"><\/p>/g, '')

  return html
}

export default function MdToPdfPage() {
  const [markdown, setMarkdown] = useState(EXAMPLE_MD)
  const [html, setHtml] = useState('')
  const [fileName, setFileName] = useState('document')

  useEffect(() => {
    setHtml(parseMarkdown(markdown))
  }, [markdown])

  const handleDownloadPdf = useCallback(() => {
    // Create print-friendly HTML
    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${fileName}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 40px 20px;
            }
            h1, h2, h3, h4 {
              margin-top: 1.5em;
              margin-bottom: 0.5em;
              font-weight: 600;
            }
            h1 { font-size: 2em; border-bottom: 2px solid #eee; padding-bottom: 0.3em; }
            h2 { font-size: 1.5em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
            p { margin-bottom: 1em; }
            code {
              background: #f4f4f4;
              padding: 0.2em 0.4em;
              border-radius: 3px;
              font-family: 'Courier New', monospace;
              font-size: 0.9em;
            }
            pre {
              background: #f4f4f4;
              padding: 1em;
              border-radius: 5px;
              overflow-x: auto;
            }
            pre code {
              background: none;
              padding: 0;
            }
            blockquote {
              border-left: 4px solid #ddd;
              padding-left: 1em;
              margin-left: 0;
              color: #666;
              font-style: italic;
            }
            ul, ol {
              padding-left: 2em;
            }
            a {
              color: #0066cc;
              text-decoration: none;
            }
            a[href]:after {
              content: " (" attr(href) ")";
              font-size: 0.8em;
              color: #666;
            }
            @media print {
              body { padding: 0; }
              a[href]:after { content: none; }
            }
          </style>
        </head>
        <body>
          ${parseMarkdown(markdown)}
        </body>
      </html>
    `

    // Create iframe for printing
    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    document.body.appendChild(iframe)

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
    if (iframeDoc) {
      iframeDoc.open()
      iframeDoc.write(printHtml)
      iframeDoc.close()

      // Wait for content to load, then print
      setTimeout(() => {
        iframe.contentWindow?.print()
        setTimeout(() => {
          document.body.removeChild(iframe)
        }, 1000)
      }, 250)
    }

    toast.info('Opening print dialog - choose "Save as PDF"')
  }, [markdown, fileName])

  const handleDownloadHtml = useCallback(() => {
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${fileName}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
          </style>
        </head>
        <body>
          ${parseMarkdown(markdown)}
        </body>
      </html>
    `

    const blob = new Blob([fullHtml], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${fileName}.html`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('HTML downloaded!')
  }, [markdown, fileName])

  const handleDownloadMd = useCallback(() => {
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${fileName}.md`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Markdown downloaded!')
  }, [markdown, fileName])

  const handleReset = useCallback(() => {
    setMarkdown('')
    setHtml('')
    setFileName('document')
  }, [])

  return (
    <ToolLayout
      title="Markdown to PDF/HTML"
      description="Convert Markdown to professional PDF or HTML documents"
      icon={<FileText className="w-8 h-8" />}
      actions={<ActionToolbar onReset={handleReset} />}
    >
      <div className="flex flex-col h-full gap-4">
        {/* File Name Input */}
        <div className="flex items-center gap-3 px-3 py-2 bg-omni-bg/40 rounded-lg border border-omni-text/5">
          <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Filename:</label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="flex-1 bg-transparent border-none text-sm text-omni-text focus:outline-none"
            placeholder="document"
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-0 flex gap-4">
          {/* Editor */}
          <div className="flex-1 flex flex-col bg-omni-bg/30 rounded-xl overflow-hidden border border-omni-text/10">
              <div className="px-4 py-2 bg-omni-text/5 border-b border-omni-text/10">
                <span className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Markdown</span>
              </div>
              <textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder="Write your Markdown here..."
                className="flex-1 w-full bg-transparent border-none text-sm font-mono text-omni-text p-4 focus:outline-none resize-none min-h-0"
                spellCheck={false}
              />
            </div>

          {/* Preview */}
          <div className="flex-1 flex flex-col bg-omni-bg/30 rounded-xl overflow-hidden border border-omni-text/10">
            <div className="px-4 py-2 bg-omni-text/5 border-b border-omni-text/10">
              <span className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Preview</span>
            </div>
            <div className="flex-1 p-6 overflow-auto prose max-w-none bg-white">
              <div dangerouslySetInnerHTML={{ __html: html || '<p class="text-gray-400 italic">Preview will appear here...</p>' }} />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleDownloadMd}
            className="flex-1 py-3 bg-omni-text/5 hover:bg-omni-text/10 text-omni-text rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2"
          >
            <FileCode className="w-4 h-4" /> Save MD
          </button>
          <button
            onClick={handleDownloadHtml}
            className="flex-1 py-3 bg-omni-text/5 hover:bg-omni-text/10 text-omni-text rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2"
          >
            <FileCode className="w-4 h-4" /> Save HTML
          </button>
          <button
            onClick={handleDownloadPdf}
            className="flex-[2] py-3 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-omni-primary/20 flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>
    </ToolLayout>
  )
}
