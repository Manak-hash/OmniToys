import { useState, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { Hash, Copy, Download } from 'lucide-react'
import { toast } from 'sonner'

export default function UnicodePage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [showDetails, setShowDetails] = useState(false)
  const [unicodeInfo, setUnicodeInfo] = useState<Array<{ char: string; code: string; hex: string; binary: string; name: string; category: string }>>([])

  const getCharName = useCallback((char: string): string => {
    const code = char.charCodeAt(0)
    const common: Record<number, string> = {
      32: 'Space',
      9: 'Tab',
      10: 'Line Feed (Newline)',
      13: 'Carriage Return',
      160: 'Non-breaking Space',
      8230: 'Ellipsis',
      8220: 'Left Double Quote',
      8221: 'Right Double Quote',
      8216: 'Left Single Quote',
      8217: 'Right Single Quote',
      169: 'Copyright Sign',
      174: 'Registered Sign',
      8364: 'Euro Sign',
      163: 'Pound Sign',
      165: 'Yen Sign',
    }
    return common[code] || `Unicode Character U+${code.toString(16).toUpperCase()}`
  }, [])

  const getCategory = useCallback((code: number): string => {
    if (code >= 48 && code <= 57) return 'Number'
    if (code >= 65 && code <= 90) return 'Uppercase'
    if (code >= 97 && code <= 122) return 'Lowercase'
    if (code <= 31) return 'Control Character'
    if (code === 127) return 'Control Character'
    if (code >= 32 && code <= 126) return 'ASCII Printable'
    if (code >= 128 && code <= 255) return 'Latin Extended'
    if (code >= 0x4E00 && code <= 0x9FFF) return 'CJK Ideograph'
    if (code >= 0x0400 && code <= 0x04FF) return 'Cyrillic'
    if (code >= 0x0370 && code <= 0x03FF) return 'Greek'
    if (code >= 0x0600 && code <= 0x06FF) return 'Arabic'
    if (code >= 0x0590 && code <= 0x05FF) return 'Hebrew'
    return 'Other Unicode'
  }, [])

  const analyzeText = useCallback(() => {
    if (!input) {
      toast.error('Please enter some text')
      return
    }

    const chars = Array.from(input)
    const info = chars.map(char => {
      const code = char.charCodeAt(0)
      const hex = code.toString(16).toUpperCase().padStart(code <= 0xFFFF ? 4 : 6, '0')
      const binary = code.toString(2)
      const name = getCharName(char)
      return {
        char,
        code: `U+${hex}`,
        hex: `\\u${hex}`,
        binary,
        name,
        category: getCategory(code)
      }
    })

    setUnicodeInfo(info)
    setShowDetails(true)

    // Output as formatted text
    const outputText = chars.map(char => {
      const code = char.charCodeAt(0)
      const hex = code.toString(16).toUpperCase().padStart(code <= 0xFFFF ? 4 : 6, '0')
      return `${char} (U+${hex})`
    }).join('\n')

    setOutput(outputText)
    toast.success(`Analyzed ${chars.length} characters!`)
  }, [input, getCharName, getCategory])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(output)
    toast.success('Copied to clipboard!')
  }, [output])

  const handleDownload = useCallback(() => {
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'unicode-analysis.txt'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded!')
  }, [output])

  const handleReset = useCallback(() => {
    setInput('')
    setOutput('')
    setShowDetails(false)
    setUnicodeInfo([])
  }, [])

  const stats = unicodeInfo.length > 0 ? {
    total: unicodeInfo.length,
    unique: new Set(unicodeInfo.map(i => i.char)).size,
    ascii: unicodeInfo.filter(i => i.category === 'ASCII Printable').length,
    numbers: unicodeInfo.filter(i => i.category === 'Number').length,
    letters: unicodeInfo.filter(i => i.category === 'Uppercase' || i.category === 'Lowercase').length,
  } : null

  return (
    <ToolLayout
      title="Unicode Character Inspector"
      description="Analyze Unicode characters, code points, and categories"
      icon={<Hash className="w-8 h-8" />}
      actions={<ActionToolbar onReset={handleReset} />}
    >
      <div className="flex flex-col h-full gap-6">
        {/* Input */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Text to Analyze</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter any text to analyze Unicode characters... 你好 🌍 Здравствуйте"
            className="w-full h-32 bg-omni-text/5 border border-omni-text/10 rounded-xl text-sm text-omni-text p-4 focus:outline-none focus:border-omni-primary/30 resize-none"
          />
          <button
            onClick={analyzeText}
            disabled={!input}
            className="w-full py-3 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-omni-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Hash className="w-4 h-4" /> Analyze Characters
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 bg-omni-text/5 rounded-lg text-center">
              <div className="text-lg font-bold text-omni-primary">{stats.total}</div>
              <div className="text-xs text-omni-text/50">Total</div>
            </div>
            <div className="p-3 bg-omni-text/5 rounded-lg text-center">
              <div className="text-lg font-bold text-omni-primary">{stats.unique}</div>
              <div className="text-xs text-omni-text/50">Unique</div>
            </div>
            <div className="p-3 bg-omni-text/5 rounded-lg text-center">
              <div className="text-lg font-bold text-omni-primary">{stats.ascii}</div>
              <div className="text-xs text-omni-text/50">ASCII</div>
            </div>
            <div className="p-3 bg-omni-text/5 rounded-lg text-center">
              <div className="text-lg font-bold text-omni-primary">{stats.numbers}</div>
              <div className="text-xs text-omni-text/50">Numbers</div>
            </div>
            <div className="p-3 bg-omni-text/5 rounded-lg text-center">
              <div className="text-lg font-bold text-omni-primary">{stats.letters}</div>
              <div className="text-xs text-omni-text/50">Letters</div>
            </div>
          </div>
        )}

        {/* Character Details Table */}
        {showDetails && (
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-omni-bg/40">
                <tr className="border-b border-omni-text/10">
                  <th className="px-3 py-2 text-left text-xs font-bold text-omni-text/50 uppercase">Char</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-omni-text/50 uppercase">Code Point</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-omni-text/50 uppercase">Hex Escape</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-omni-text/50 uppercase">Binary</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-omni-text/50 uppercase">Name</th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-omni-text/50 uppercase">Category</th>
                </tr>
              </thead>
              <tbody>
                {unicodeInfo.map((info, index) => (
                  <tr key={index} className="border-b border-omni-text/5 hover:bg-omni-text/5">
                    <td className="px-3 py-2">
                      <span className="text-lg font-mono">{info.char === ' ' ? '␣' : info.char}</span>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-omni-primary">{info.code}</td>
                    <td className="px-3 py-2 font-mono text-xs text-omni-text/70">{info.hex}</td>
                    <td className="px-3 py-2 font-mono text-xs text-omni-text/50">{info.binary}</td>
                    <td className="px-3 py-2 text-xs text-omni-text">{info.name}</td>
                    <td className="px-3 py-2 text-xs text-omni-text/60">{info.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Output Area */}
        <div className="flex-1 min-h-0 flex flex-col bg-omni-bg/30 rounded-xl overflow-hidden border border-omni-text/10">
          <div className="px-4 py-2 bg-omni-text/5 border-b border-omni-text/10 flex items-center justify-between">
            <span className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Output</span>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                disabled={!output}
                className="text-xs text-omni-text/40 hover:text-omni-text disabled:opacity-50 flex items-center gap-1"
              >
                <Copy className="w-3 h-3" /> Copy
              </button>
              <button
                onClick={handleDownload}
                disabled={!output}
                className="text-xs text-omni-text/40 hover:text-omni-text disabled:opacity-50 flex items-center gap-1"
              >
                <Download className="w-3 h-3" /> Save
              </button>
            </div>
          </div>
          <textarea
            readOnly
            value={output}
            placeholder="Character information will appear here..."
            className="flex-1 w-full bg-transparent border-none text-sm text-omni-text/70 p-4 focus:outline-none resize-none min-h-0 font-mono"
          />
        </div>
      </div>
    </ToolLayout>
  )
}
