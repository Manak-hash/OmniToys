import { useState, useCallback, useMemo } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { BarChart3, Copy, Download } from 'lucide-react'
import { toast } from 'sonner'

export default function CountStatsPage() {
  const [input, setInput] = useState('')

  // Derive stats from input
  const stats = useMemo(() => {
    if (!input) {
      return {
        characters: 0,
        charactersNoSpaces: 0,
        words: 0,
        lines: 0,
        sentences: 0,
        paragraphs: 0,
        syllables: 0,
        speakingTime: 0,
        readingTime: 0,
      }
    }

    // Count characters
    const characters = input.length
    const charactersNoSpaces = input.replace(/\s/g, '').length

    // Count words
    const words = input.trim() ? input.trim().split(/\s+/).length : 0

    // Count lines
    const lines = input.split('\n').length

    // Count sentences (approximate)
    const sentences = input.split(/[.!?]+/).filter(s => s.trim().length > 0).length

    // Count paragraphs
    const paragraphs = input.split(/\n\n+/).filter(p => p.trim().length > 0).length

    // Count syllables (approximate)
    const countSyllables = (word: string): number => {
      word = word.toLowerCase()
      if (word.length <= 3) return 1
      word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
      word = word.replace(/^y/, '')
      const matches = word.match(/[aeiouy]{1,2}/g)
      return matches ? matches.length : 1
    }
    const syllables = input.trim() ? input.trim().split(/\s+/).reduce((acc, word) => acc + countSyllables(word), 0) : 0

    // Calculate times
    const speakingTime = Math.ceil(words / 150) // 150 words per minute
    const readingTime = Math.ceil(words / 200) // 200 words per minute

    return {
      characters,
      charactersNoSpaces,
      words,
      lines,
      sentences,
      paragraphs,
      syllables,
      speakingTime,
      readingTime,
    }
  }, [input])

  const handleCopy = useCallback(() => {
    const statsText = Object.entries(stats)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n')
    navigator.clipboard.writeText(statsText)
    toast.success('Statistics copied!')
  }, [stats])

  const handleDownload = useCallback(() => {
    const statsText = Object.entries(stats)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n')
    const blob = new Blob([statsText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'text-statistics.txt'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded!')
  }, [stats])

  const handleReset = useCallback(() => {
    setInput('')
  }, [])

  return (
    <ToolLayout
      title="Text Counter & Statistics"
      description="Count words, characters, reading time, and more"
      icon={<BarChart3 className="w-8 h-8" />}
      actions={<ActionToolbar onReset={handleReset} />}
    >
      <div className="flex flex-col h-full gap-6">
        {/* Input */}
        <div className="flex-1 flex flex-col">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste your text here to get statistics..."
            className="flex-1 w-full h-full min-h-[200px] bg-omni-text/5 border border-omni-text/10 rounded-xl text-sm text-omni-text p-4 focus:outline-none focus:border-omni-primary/30 resize-none"
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-omni-bg/30 rounded-xl p-4 border border-omni-text/10 text-center">
            <div className="text-3xl font-bold text-omni-primary">{stats.characters}</div>
            <div className="text-xs text-omni-text/50 mt-1">Characters</div>
            <div className="text-xs text-omni-text/30">{stats.charactersNoSpaces} no spaces</div>
          </div>
          <div className="bg-omni-bg/30 rounded-xl p-4 border border-omni-text/10 text-center">
            <div className="text-3xl font-bold text-omni-primary">{stats.words}</div>
            <div className="text-xs text-omni-text/50 mt-1">Words</div>
          </div>
          <div className="bg-omni-bg/30 rounded-xl p-4 border border-omni-text/10 text-center">
            <div className="text-3xl font-bold text-omni-primary">{stats.lines}</div>
            <div className="text-xs text-omni-text/50 mt-1">Lines</div>
          </div>
          <div className="bg-omni-bg/30 rounded-xl p-4 border border-omni-text/10 text-center">
            <div className="text-3xl font-bold text-omni-primary">{stats.sentences}</div>
            <div className="text-xs text-omni-text/50 mt-1">Sentences</div>
          </div>
          <div className="bg-omni-bg/30 rounded-xl p-4 border border-omni-text/10 text-center">
            <div className="text-3xl font-bold text-omni-primary">{stats.paragraphs}</div>
            <div className="text-xs text-omni-text/50 mt-1">Paragraphs</div>
          </div>
          <div className="bg-omni-bg/30 rounded-xl p-4 border border-omni-text/10 text-center">
            <div className="text-3xl font-bold text-omni-primary">{stats.syllables}</div>
            <div className="text-xs text-omni-text/50 mt-1">Syllables</div>
          </div>
        </div>

        {/* Time Estimates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-omni-primary/10 rounded-xl p-4 border border-omni-primary/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-omni-text/50 uppercase tracking-wider">Reading Time</div>
                <div className="text-2xl font-bold text-omni-primary">{stats.readingTime} min</div>
              </div>
              <div className="text-xs text-omni-text/40">@ 200 wpm</div>
            </div>
          </div>
          <div className="bg-omni-primary/10 rounded-xl p-4 border border-omni-primary/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-omni-text/50 uppercase tracking-wider">Speaking Time</div>
                <div className="text-2xl font-bold text-omni-primary">{stats.speakingTime} min</div>
              </div>
              <div className="text-xs text-omni-text/40">@ 150 wpm</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            disabled={!input}
            className="flex-1 py-3 bg-omni-text/5 hover:bg-omni-text/10 text-omni-text rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Copy className="w-4 h-4" /> Copy Stats
          </button>
          <button
            onClick={handleDownload}
            disabled={!input}
            className="flex-1 py-3 bg-omni-text/5 hover:bg-omni-text/10 text-omni-text rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" /> Save
          </button>
        </div>
      </div>
    </ToolLayout>
  )
}
