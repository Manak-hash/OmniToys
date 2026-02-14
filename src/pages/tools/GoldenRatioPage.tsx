import { useState } from 'react'
import { Ratio, Copy, Check } from 'lucide-react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'

const GOLDEN_RATIO = 1.618033988749

type Unit = 'px' | 'em' | 'rem' | '%' | 'vh' | 'vw' | 'pt' | 'in' | 'cm' | 'mm'

export default function GoldenRatioPage() {
  const [baseValue, setBaseValue] = useState(375)
  const [unit, setUnit] = useState<Unit>('px')
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  // Calculate golden ratio values
  const values = [
    { label: 'Base', value: baseValue, color: 'omni-primary' },
    { label: '× φ', value: baseValue * GOLDEN_RATIO, formula: `${baseValue} × ${GOLDEN_RATIO.toFixed(6)}` },
    { label: '× φ²', value: baseValue * GOLDEN_RATIO * GOLDEN_RATIO, formula: `${baseValue} × ${GOLDEN_RATIO.toFixed(6)}²` },
    { label: '÷ φ', value: baseValue / GOLDEN_RATIO, formula: `${baseValue} ÷ ${GOLDEN_RATIO.toFixed(6)}` },
    { label: '÷ φ²', value: baseValue / (GOLDEN_RATIO * GOLDEN_RATIO), formula: `${baseValue} ÷ ${GOLDEN_RATIO.toFixed(6)}²` },
  ]

  const handleCopy = (value: number, index: number) => {
    const formattedValue = formatValue(value)
    navigator.clipboard.writeText(formattedValue)
    setCopiedIndex(index)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const formatValue = (val: number): string => {
    // Round to reasonable precision based on unit
    const rounded = unit === 'px' || unit === 'pt' || unit === '%' || unit === 'vh' || unit === 'vw'
      ? Math.round(val)
      : unit === 'em' || unit === 'rem'
      ? Math.round(val * 100) / 100
      : Math.round(val * 1000) / 1000

    return `${rounded}${unit}`
  }

  const handleBaseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    setBaseValue(isNaN(val) ? 0 : Math.max(0, val))
  }

  return (
    <ToolLayout
      title="Golden Ratio Calculator"
      description="Calculate mathematically perfect proportions for design"
      icon={<Ratio className="w-5 h-5" />}
    >
      <div className="space-y-6">
        {/* Input */}
        <div className="flex flex-wrap gap-4 p-6 bg-omni-text/5 rounded-xl">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-omni-text/80 mb-2">
              Base Value
            </label>
            <input
              type="number"
              min={0}
              step="any"
              value={baseValue}
              onChange={handleBaseChange}
              className="w-full px-4 py-3 rounded-lg bg-omni-bg border-2 border-omni-text/20 text-omni-text text-lg font-mono focus:outline-none focus:ring-2 focus:ring-omni-primary/50 focus:border-omni-primary/50"
              placeholder="Enter base value..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-omni-text/80 mb-2">
              Unit
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as Unit)}
              className="px-4 py-3 rounded-lg bg-omni-bg border-2 border-omni-text/20 text-omni-text focus:outline-none focus:ring-2 focus:ring-omni-primary/50 focus:border-omni-primary/50"
            >
              {(['px', 'em', 'rem', '%', 'vh', 'vw', 'pt', 'in', 'cm', 'mm'] as Unit[]).map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Golden Ratio Values</h3>

          {/* Visual Scale */}
          <div className="flex items-end gap-2 h-16 px-4 py-2 bg-omni-text/5 rounded-lg overflow-hidden">
            {values.map((item, index) => {
              const maxWidth = Math.max(...values.map((v) => v.value))
              const percentage = (item.value / maxWidth) * 100
              return (
                <div key={index} className="flex-1 flex flex-col justify-end items-center">
                  <div
                    className={cn(
                      "w-full rounded-t transition-all duration-300",
                      index === 0 ? "bg-omni-primary" : "bg-omni-text/30"
                    )}
                    style={{ height: `${percentage}%` }}
                  />
                  <span className="text-xs text-omni-text/60 mt-1">{item.label}</span>
                </div>
              )
            })}
          </div>

          {/* Value List */}
          <div className="space-y-2">
            {values.map((item, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg transition-colors",
                  index === 0 ? "bg-omni-primary/10 border-2 border-omni-primary/30" : "bg-omni-text/5"
                )}
              >
                {/* Label */}
                <div className="w-20">
                  <span className={cn(
                    "text-sm font-semibold",
                    index === 0 ? "text-omni-primary" : "text-omni-text/80"
                  )}>
                    {item.label}
                  </span>
                </div>

                {/* Formula */}
                {item.formula && (
                  <div className="flex-1 text-xs text-omni-text/50 font-mono">
                    {item.formula}
                  </div>
                )}

                {/* Value */}
                <div className="font-mono text-xl font-semibold text-omni-text min-w-[120px] text-right">
                  {formatValue(item.value)}
                </div>

                {/* Copy Button */}
                <button
                  onClick={() => handleCopy(item.value, index)}
                  className="p-2 rounded-lg hover:bg-omni-text/10 transition-colors"
                  title="Copy value"
                >
                  {copiedIndex === index ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5 text-omni-text/60" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Presets */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Common Design Bases</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { label: 'Mobile Width', value: 375, unit: 'px' as Unit },
              { label: 'Desktop Width', value: 1440, unit: 'px' as Unit },
              { label: 'Base Font', value: 16, unit: 'px' as Unit },
              { label: 'Grid Column', value: 100, unit: 'px' as Unit },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  setBaseValue(preset.value)
                  setUnit(preset.unit)
                }}
                className="p-3 bg-omni-text/5 rounded-lg hover:bg-omni-text/10 transition-colors text-left"
              >
                <div className="text-sm font-medium text-omni-text">{preset.label}</div>
                <div className="text-xs text-omni-text/60 mt-1">{preset.value}{preset.unit}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="p-4 bg-omni-text/5 rounded-xl">
          <h3 className="text-sm font-semibold mb-2">About Golden Ratio</h3>
          <div className="grid md:grid-cols-2 gap-4 text-xs text-omni-text/70">
            <div>
              <p className="font-medium mb-1">What is φ (phi)?</p>
              <p className="leading-relaxed">
                The golden ratio (φ ≈ 1.618) is a mathematical proportion found throughout nature,
                art, and architecture. It creates aesthetically pleasing compositions.
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">Design Applications</p>
              <ul className="space-y-1 leading-relaxed">
                <li>• Typography scale (headings, body, captions)</li>
                <li>• Layout spacing and margins</li>
                <li>• Component sizing (cards, buttons)</li>
                <li>• Grid and column systems</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
