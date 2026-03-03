import { useState, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { FileText, Copy, Download } from 'lucide-react'
import { toast } from 'sonner'

const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum',
]

const LOREM_PARAGRAPHS = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.',
  'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione.',
]

const generateSentence = () => {
  const sentenceLength = Math.floor(Math.random() * 10) + 8
  const words = []
  for (let i = 0; i < sentenceLength; i++) {
    words.push(LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)])
  }
  const sentence = words.join(' ')
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.'
}

const generateParagraph = () => {
  const paragraphLength = Math.floor(Math.random() * 4) + 4
  const sentences = []
  for (let i = 0; i < paragraphLength; i++) {
    sentences.push(generateSentence())
  }
  return sentences.join(' ')
}

export default function LoremPage() {
  const [output, setOutput] = useState('')
  const [type, setType] = useState<'paragraphs' | 'sentences' | 'words' | 'list'>('paragraphs')
  const [count, setCount] = useState(3)
  const [startWithLorem, setStartWithLorem] = useState(true)

  const generateLorem = useCallback(() => {
    let result = ''

    if (type === 'paragraphs') {
      if (startWithLorem) {
        result = LOREM_PARAGRAPHS.slice(0, Math.min(count, LOREM_PARAGRAPHS.length)).join('\n\n')
        if (count > LOREM_PARAGRAPHS.length) {
          for (let i = LOREM_PARAGRAPHS.length; i < count; i++) {
            result += '\n\n' + generateParagraph()
          }
        }
      } else {
        for (let i = 0; i < count; i++) {
          result += (i > 0 ? '\n\n' : '') + generateParagraph()
        }
      }
    } else if (type === 'sentences') {
      for (let i = 0; i < count; i++) {
        result += (i > 0 ? ' ' : '') + generateSentence()
      }
    } else if (type === 'words') {
      for (let i = 0; i < count; i++) {
        result += (i > 0 ? ' ' : '') + LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]
      }
    } else if (type === 'list') {
      for (let i = 0; i < count; i++) {
        result += (i > 0 ? '\n' : '') + `• ${generateSentence()}`
      }
    }

    setOutput(result)
    toast.success(`Generated ${count} ${type}!`)
  }, [type, count, startWithLorem])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(output)
    toast.success('Copied to clipboard!')
  }, [output])

  const handleDownload = useCallback(() => {
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'lorem-ipsum.txt'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded!')
  }, [output])

  const handleReset = useCallback(() => {
    setOutput('')
    setCount(3)
    setType('paragraphs')
    setStartWithLorem(true)
  }, [])

  const stats = output ? {
    paragraphs: output.split(/\n\n+/).length,
    sentences: output.split(/[.!?]+/).filter(s => s.trim()).length,
    words: output.split(/\s+/).filter(w => w.trim()).length,
    characters: output.length,
  } : null

  return (
    <ToolLayout
      title="Lorem Ipsum Generator"
      description="Generate placeholder text for designs and mockups"
      icon={<FileText className="w-8 h-8" />}
      actions={<ActionToolbar onReset={handleReset} />}
    >
      <div className="flex flex-col h-full gap-6">
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'paragraphs' | 'sentences' | 'words' | 'list')}
              className="w-full px-3 py-2 bg-omni-text/5 border border-omni-text/10 rounded-lg text-sm text-omni-text focus:outline-none focus:border-omni-primary/30"
            >
              <option value="paragraphs">Paragraphs</option>
              <option value="sentences">Sentences</option>
              <option value="words">Words</option>
              <option value="list">List Items</option>
            </select>
          </div>

          {/* Count */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Amount</label>
            <input
              type="number"
              min="1"
              max="100"
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value))))}
              className="w-full px-3 py-2 bg-omni-text/5 border border-omni-text/10 rounded-lg text-sm text-omni-text focus:outline-none focus:border-omni-primary/30"
            />
          </div>

          {/* Options */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Options</label>
            <div className="flex items-center gap-2 px-3 py-2 bg-omni-text/5 border border-omni-text/10 rounded-lg">
              <input
                type="checkbox"
                id="lorem-ipsum"
                checked={startWithLorem}
                onChange={(e) => setStartWithLorem(e.target.checked)}
                disabled={type !== 'paragraphs'}
                className="w-4 h-4 rounded accent-omni-primary disabled:opacity-50"
              />
              <label htmlFor="lorem-ipsum" className={`text-sm text-omni-text ${type !== 'paragraphs' ? 'opacity-50' : ''}`}>
                Start with "Lorem ipsum"
              </label>
            </div>
          </div>

          {/* Generate */}
          <div className="flex items-end">
            <button
              onClick={generateLorem}
              className="w-full py-2 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-lg font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-omni-primary/20 flex items-center justify-center gap-2"
            >
              Generate
            </button>
          </div>
        </div>

        {/* Output */}
        <div className="flex-1 flex flex-col bg-omni-bg/30 rounded-xl overflow-hidden border border-omni-text/10 min-h-0">
          <div className="px-4 py-2 bg-omni-text/5 border-b border-omni-text/10 flex items-center justify-between">
            <span className="text-xs font-bold text-omni-text/50 uppercase tracking-wider">Generated Text</span>
            {stats && (
              <div className="flex items-center gap-3 text-xs text-omni-text/40">
                <span>{stats.paragraphs} paras</span>
                <span>{stats.sentences} sent</span>
                <span>{stats.words} words</span>
                <span>{stats.characters} chars</span>
              </div>
            )}
          </div>
          <textarea
            readOnly
            value={output}
            placeholder="Click 'Generate' to create Lorem Ipsum text..."
            className="flex-1 w-full bg-transparent border-none text-sm text-omni-text p-4 focus:outline-none resize-none min-h-0"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={generateLorem}
            className="flex-1 py-3 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-omni-primary/20 flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" /> Regenerate
          </button>
          <button
            onClick={handleCopy}
            disabled={!output}
            className="flex-1 py-3 bg-omni-text/5 hover:bg-omni-text/10 text-omni-text rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Copy className="w-4 h-4" /> Copy
          </button>
          <button
            onClick={handleDownload}
            disabled={!output}
            className="flex-1 py-3 bg-omni-text/5 hover:bg-omni-text/10 text-omni-text rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" /> Save
          </button>
        </div>
      </div>
    </ToolLayout>
  )
}
