import { useState } from 'react'
import { Type, FileText, Hash, Clock, BookOpen, Check } from 'lucide-react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number
  unit?: string
  color?: string
}

function StatCard({ icon, label, value, unit, color }: StatCardProps) {
  return (
    <div className="text-center p-4 bg-omni-text/5 rounded-xl">
      <div className={cn("w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center", color || "bg-omni-primary/10 text-omni-primary")}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-omni-text">
        {value.toLocaleString()}
        {unit && <span className="text-sm text-omni-text/60 ml-1">{unit}</span>}
      </p>
      <p className="text-xs text-omni-text/60 mt-1">{label}</p>
    </div>
  )
}

interface TextStats {
  words: number
  characters: number
  charactersNoSpaces: number
  sentences: number
  paragraphs: number
  avgWordLength: number
  readingTime: number
  speakingTime: number
  fleschScore: number
  fleschLevel: string
}

function calculateStats(text: string): TextStats {
  const trimmed = text.trim()

  // Words: split by whitespace, filter empty
  const words = trimmed.split(/\s+/).filter(w => w.length > 0)

  // Sentences: split by sentence-ending punctuation
  const sentences = trimmed.split(/[.!?]+/).filter(s => s.trim().length > 0)

  // Paragraphs: split by double line breaks or more
  const paragraphs = trimmed.split(/\n\s*\n/).filter(p => p.trim().length > 0)

  // Characters
  const characters = text.length
  const charactersNoSpaces = text.replace(/\s/g, '').length

  // Average word length (in characters)
  const avgWordLength = words.length > 0
    ? words.join('').length / words.length
    : 0

  // Reading time (200 words per minute)
  const readingTime = Math.ceil(words.length / 200)

  // Speaking time (150 words per minute)
  const speakingTime = Math.ceil(words.length / 150)

  // Flesch Reading Ease Score
  // Score = 206.835 - 1.015 × (total words / total sentences) - 84.6 × (total syllables / total words)
  // Simplified syllable estimation (count vowel groups)
  const countSyllables = (word: string): number => {
    const vowels = 'aeiouyAEIOUY'
    let count = 0
    let prevVowel = false
    for (const char of word) {
      const isVowel = vowels.includes(char)
      if (isVowel && !prevVowel) count++
      prevVowel = isVowel
    }
    return Math.max(1, count)
  }

  const totalSyllables = words.reduce((sum, word) => sum + countSyllables(word), 0)
  const avgSentenceLength = sentences.length > 0 ? words.length / sentences.length : 0
  const avgSyllablesPerWord = words.length > 0 ? totalSyllables / words.length : 0
  const fleschScore = sentences.length > 0 && words.length > 0
    ? Math.max(0, Math.min(100, 206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord))
    : 0

  // Flesch reading level
  let fleschLevel = ''
  if (fleschScore >= 90) fleschLevel = 'Very Easy (5th grade)'
  else if (fleschScore >= 80) fleschLevel = 'Easy (6th grade)'
  else if (fleschScore >= 70) fleschLevel = 'Fairly Easy (7th grade)'
  else if (fleschScore >= 60) fleschLevel = 'Standard (8th-9th grade)'
  else if (fleschScore >= 50) fleschLevel = 'Fairly Difficult (10th-12th grade)'
  else if (fleschScore >= 30) fleschLevel = 'Difficult (College)'
  else if (fleschScore > 0) fleschLevel = 'Very Difficult (Graduate)'
  else fleschLevel = 'Not enough text'

  return {
    words: words.length,
    characters,
    charactersNoSpaces,
    sentences: sentences.length,
    paragraphs: paragraphs.length,
    avgWordLength: Math.round(avgWordLength * 10) / 10,
    readingTime,
    speakingTime,
    fleschScore: Math.round(fleschScore * 10) / 10,
    fleschLevel,
  }
}

export default function TextAnalysisPage() {
  const [text, setText] = useState('')
  const [stats, setStats] = useState<TextStats | null>(null)
  const [copied, setCopied] = useState(false)

  const handleAnalyze = () => {
    if (!text.trim()) {
      setStats(null)
      return
    }
    setStats(calculateStats(text))
  }

  const handleCopyStats = () => {
    if (!stats) return
    const statsText = [
      `Text Analysis Results`,
      `─────────────────────`,
      `Words: ${stats.words}`,
      `Characters: ${stats.characters}`,
      `Characters (no spaces): ${stats.charactersNoSpaces}`,
      `Sentences: ${stats.sentences}`,
      `Paragraphs: ${stats.paragraphs}`,
      `Avg Word Length: ${stats.avgWordLength}`,
      `Reading Time: ${stats.readingTime} min`,
      `Speaking Time: ${stats.speakingTime} min`,
      `Flesch Score: ${stats.fleschScore}`,
      `Level: ${stats.fleschLevel}`,
    ].join('\n')
    navigator.clipboard.writeText(statsText)
    setCopied(true)
    toast.success('Copied statistics')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClear = () => {
    setText('')
    setStats(null)
  }

  const handlePaste = async () => {
    try {
      const pastedText = await navigator.clipboard.readText()
      setText(pastedText)
      toast.success('Pasted from clipboard')
    } catch {
      toast.error('Failed to read clipboard')
    }
  }

  return (
    <ToolLayout
      title="Text Analysis Pro"
      description="Count words, analyze reading time, check readability scores"
      icon={<Type className="w-5 h-5" />}
    >
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handlePaste}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-omni-text/10 text-omni-text hover:bg-omni-text/20 transition-colors"
          >
            Paste Text
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-omni-text/10 text-omni-text hover:bg-omni-text/20 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={handleAnalyze}
            disabled={!text.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-omni-primary text-white hover:bg-omni-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
          >
            Analyze Text
          </button>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-omni-text/80">
            Enter Your Text
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your text here to analyze..."
            className="w-full px-4 py-3 rounded-lg bg-omni-bg border-2 border-omni-text/20 text-omni-text focus:outline-none focus:ring-2 focus:ring-omni-primary/50 focus:border-omni-primary/50 resize-none min-h-[200px]"
          />
          <p className="text-xs text-omni-text/50">
            {text.length.toLocaleString()} characters
          </p>
        </div>

        {/* Results */}
        {stats && (
          <>
            {/* Basic Stats */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  icon={<Hash className="w-5 h-5" />}
                  label="Words"
                  value={stats.words}
                />
                <StatCard
                  icon={<FileText className="w-5 h-5" />}
                  label="Characters"
                  value={stats.characters}
                />
                <StatCard
                  icon={<FileText className="w-5 h-5" />}
                  label="Characters (No Spaces)"
                  value={stats.charactersNoSpaces}
                />
                <StatCard
                  icon={<Hash className="w-5 h-5" />}
                  label="Sentences"
                  value={stats.sentences}
                />
                <StatCard
                  icon={<FileText className="w-5 h-5" />}
                  label="Paragraphs"
                  value={stats.paragraphs}
                />
                <StatCard
                  icon={<Hash className="w-5 h-5" />}
                  label="Avg Word Length"
                  value={stats.avgWordLength}
                  unit="chars"
                />
              </div>
            </div>

            {/* Time Estimates */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Time Estimates</h3>
              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  icon={<Clock className="w-5 h-5" />}
                  label="Reading Time"
                  value={stats.readingTime}
                  unit="min"
                  color="bg-omni-primary/10 text-omni-primary"
                />
                <StatCard
                  icon={<Clock className="w-5 h-5" />}
                  label="Speaking Time"
                  value={stats.speakingTime}
                  unit="min"
                  color="bg-green-500/10 text-green-500"
                />
              </div>
              <p className="text-xs text-omni-text/50 mt-2">
                Reading: 200 words/min | Speaking: 150 words/min
              </p>
            </div>

            {/* Readability */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Readability Score</h3>
              <div className="p-6 bg-omni-text/5 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-4xl font-bold text-omni-primary">{stats.fleschScore}</p>
                    <p className="text-sm text-omni-text/60">Flesch Reading Ease</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-omni-text">{stats.fleschLevel}</p>
                  </div>
                </div>
                {/* Score Bar */}
                <div className="relative h-3 bg-omni-text/10 rounded-full overflow-hidden">
                  <div
                    className="absolute h-full transition-all duration-500"
                    style={{
                      width: `${stats.fleschScore}%`,
                      backgroundColor: stats.fleschScore >= 60 ? '#10b981' : stats.fleschScore >= 30 ? '#f59e0b' : '#ef4444'
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-omni-text/50 mt-1">
                  <span>0 (Hard)</span>
                  <span>50 (Medium)</span>
                  <span>100 (Easy)</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <ActionToolbar>
              <button
                onClick={handleCopyStats}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-omni-primary text-white hover:bg-omni-primary/90 transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Statistics'}
              </button>
            </ActionToolbar>
          </>
        )}

        {/* Info */}
        <div className="p-4 bg-omni-text/5 rounded-xl">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            About Flesch Reading Ease
          </h3>
          <p className="text-xs text-omni-text/70 leading-relaxed">
            The Flesch Reading Ease score measures text complexity on a 0-100 scale. Higher scores indicate
            easier-to-read text. Scores consider sentence length and word complexity (syllables).
            Aim for 60-70 for general audience content.
          </p>
        </div>
      </div>
    </ToolLayout>
  )
}
