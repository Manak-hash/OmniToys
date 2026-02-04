import { useState, useEffect } from 'react'
import { Clock, Copy, Check, Calendar } from 'lucide-react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { parseCron, buildCron, cronPresets, type CronField } from '@/utils/cronBuilder'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'

export default function CrontabPage() {
  const [expression, setExpression] = useState('* * * * *')
  const [fields, setFields] = useState<CronField>({
    minute: '*',
    hour: '*',
    dayOfMonth: '*',
    month: '*',
    dayOfWeek: '*',
  })
  const [result, setResult] = useState(parseCron(expression))
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setResult(parseCron(expression))
  }, [expression])

  const handleFieldChange = (field: keyof CronField, value: string) => {
    const newFields = { ...fields, [field]: value }
    setFields(newFields)
    setExpression(buildCron(newFields))
  }

  const handlePresetClick = (preset: string) => {
    setExpression(preset)
    // Parse and update fields
    const parts = preset.split(' ')
    if (parts.length === 5) {
      setFields({
        minute: parts[0],
        hour: parts[1],
        dayOfMonth: parts[2],
        month: parts[3],
        dayOfWeek: parts[4],
      })
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(expression)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const fieldLabels: { key: keyof CronField; label: string; placeholder: string }[] = [
    { key: 'minute', label: 'Minute', placeholder: '0-59, *, */5' },
    { key: 'hour', label: 'Hour', placeholder: '0-23, *, */2' },
    { key: 'dayOfMonth', label: 'Day of Month', placeholder: '1-31, *' },
    { key: 'month', label: 'Month', placeholder: '1-12, *' },
    { key: 'dayOfWeek', label: 'Day of Week', placeholder: '0-6 (0=Sunday), *' },
  ]

  return (
    <ToolLayout
      title="Crontab UI"
      description="Visual cron expression builder and parser"
      icon={<Clock className="w-5 h-5" />}
    >
      <div className="space-y-6">
        {/* Expression Display */}
        <div className="p-6 bg-omni-text/5 rounded-lg">
          <label className="block text-sm font-medium text-omni-text/80 mb-2">
            Cron Expression
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              className={cn(
                "flex-1 px-4 py-3 rounded-lg bg-omni-bg border-2 text-omni-text font-mono text-lg",
                "focus:outline-none focus:ring-2 focus:ring-omni-primary/50",
                result.valid ? "border-omni-text/20" : "border-red-500/50"
              )}
              placeholder="* * * * *"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-3 rounded-lg bg-omni-primary text-white hover:bg-omni-primary/90 transition-colors"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
          {result.humanReadable && (
            <p className="mt-3 text-lg text-omni-primary">
              {result.humanReadable}
            </p>
          )}
          {result.error && (
            <p className="mt-2 text-sm text-red-400">{result.error}</p>
          )}
        </div>

        {/* Field Builder */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Build Expression
          </h3>
          <div className="grid grid-cols-5 gap-3">
            {fieldLabels.map(({ key, label, placeholder }) => (
              <div key={key} className="space-y-1">
                <label className="block text-xs font-medium text-omni-text/60">
                  {label}
                </label>
                <input
                  type="text"
                  value={fields[key]}
                  onChange={(e) => handleFieldChange(key, e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 rounded-lg bg-omni-bg border border-omni-text/20 text-omni-text font-mono text-sm focus:outline-none focus:ring-2 focus:ring-omni-primary/50"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Presets */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Common Presets</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {Object.entries(cronPresets).map(([name, expr]) => (
              <button
                key={name}
                onClick={() => handlePresetClick(expr)}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm text-left transition-all",
                  expression === expr
                    ? "bg-omni-primary text-white"
                    : "bg-omni-text/10 text-omni-text hover:bg-omni-text/20"
                )}
              >
                {name}
                <span className="block text-xs opacity-60 font-mono mt-1">{expr}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Next Runs */}
        {result.valid && result.nextRuns && result.nextRuns.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Next Executions</h3>
            <div className="space-y-2">
              {result.nextRuns.map((run, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-omni-text/5 rounded-lg"
                >
                  <span className="text-sm font-bold text-omni-primary w-8">
                    #{index + 1}
                  </span>
                  <span className="font-mono text-sm text-omni-text">
                    {new Date(run).toLocaleString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="p-4 bg-omni-text/5 rounded-lg">
          <h3 className="text-sm font-semibold mb-2">Syntax Reference</h3>
          <div className="grid md:grid-cols-2 gap-4 text-xs text-omni-text/80">
            <div>
              <p className="font-medium mb-1">Special Characters:</p>
              <ul className="space-y-1 ml-2">
                <li><code className="bg-omni-text/10 px-1 rounded">*</code> - Any value</li>
                <li><code className="bg-omni-text/10 px-1 rounded">,</code> - Value list separator</li>
                <li><code className="bg-omni-text/10 px-1 rounded">-</code> - Range of values</li>
                <li><code className="bg-omni-text/10 px-1 rounded">/</code> - Step values</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-1">Examples:</p>
              <ul className="space-y-1 ml-2">
                <li><code className="bg-omni-text/10 px-1 rounded">5 * * * *</code> - At minute 5</li>
                <li><code className="bg-omni-text/10 px-1 rounded">*/5 * * * *</code> - Every 5 minutes</li>
                <li><code className="bg-omni-text/10 px-1 rounded">0 9-17 * * 1-5</code> - Business hours</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
