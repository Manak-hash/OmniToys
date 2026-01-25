import { useState, useEffect, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Clock, Copy, RefreshCw, Calendar, Globe } from 'lucide-react'
import { toast } from 'sonner'

const TIMEZONES = [
  { label: 'Local', value: 'local' },
  { label: 'UTC', value: 'UTC' },
  { label: 'New York', value: 'America/New_York' },
  { label: 'London', value: 'Europe/London' },
  { label: 'Paris', value: 'Europe/Paris' },
  { label: 'Tokyo', value: 'Asia/Tokyo' },
  { label: 'Sydney', value: 'Australia/Sydney' },
]

const FORMATS = [
  { label: 'Seconds', multiplier: 1 },
  { label: 'Milliseconds', multiplier: 1000 },
]

export default function UnixTimestampPage() {
  const [timestamp, setTimestamp] = useState(() => Math.floor(Date.now() / 1000))
  const [isLive, setIsLive] = useState(true)
  const [timezone, setTimezone] = useState('local')
  const [format, setFormat] = useState<'seconds' | 'milliseconds'>('seconds')
  const [customDate, setCustomDate] = useState('')
  const [customTime, setCustomTime] = useState('')
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000))

  const getDate = useCallback(() => new Date(timestamp * 1000), [timestamp])

  useEffect(() => {
    const interval = setInterval(() => {
      const currentNow = Math.floor(Date.now() / 1000)
      setNow(currentNow)
      if (isLive) {
        setTimestamp(currentNow)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [isLive])

  const handleTimestampChange = (val: string) => {
    setIsLive(false)
    const parsed = parseInt(val, 10)
    if (!isNaN(parsed)) {
      if (format === 'milliseconds') {
        setTimestamp(Math.floor(parsed / 1000))
      } else {
        setTimestamp(parsed)
      }
    }
  }

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied!`)
  }

  const resetToNow = () => {
    setIsLive(true)
    setTimestamp(Math.floor(Date.now() / 1000))
    setCustomDate('')
    setCustomTime('')
  }

  const formatWithTimezone = (tz: string) => {
    const date = getDate()
    if (tz === 'local') {
      return date.toLocaleString()
    }
    return date.toLocaleString('en-US', { timeZone: tz })
  }

  const getRelative = useCallback(() => {
    const diff = now - timestamp
    const abs = Math.abs(diff)
    const future = diff < 0

    if (abs < 60) return `${abs}s ${future ? 'from now' : 'ago'}`
    if (abs < 3600) return `${Math.floor(abs / 60)}m ${future ? 'from now' : 'ago'}`
    if (abs < 86400) return `${Math.floor(abs / 3600)}h ${future ? 'from now' : 'ago'}`
    if (abs < 2592000) return `${Math.floor(abs / 86400)}d ${future ? 'from now' : 'ago'}`
    if (abs < 31536000) return `${Math.floor(abs / 2592000)}mo ${future ? 'from now' : 'ago'}`
    return `${Math.floor(abs / 31536000)}y ${future ? 'from now' : 'ago'}`
  }, [now, timestamp])

  const displayTimestamp = format === 'milliseconds' ? timestamp * 1000 : timestamp

  return (
    <ToolLayout
      title="Unix Timestamp Master"
      description="Convert between Unix timestamps and human-readable dates. Multiple formats and timezones."
      icon={<Clock className="w-8 h-8" />}
      actions={
        <button 
          onClick={resetToNow}
          className="flex items-center gap-2 px-3 py-1.5 bg-omni-primary/10 text-omni-primary hover:bg-omni-primary/20 rounded-lg transition-colors font-medium text-sm"
        >
          <RefreshCw className="w-4 h-4" /> Reset to Now
        </button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[500px]">
        <div className="space-y-6">
          {isLive && (
            <div className="flex items-center justify-center gap-2 text-green-400 text-sm p-2 bg-green-400/10 rounded-lg">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Live - Updating every second
            </div>
          )}

          <div className="flex gap-2">
            {FORMATS.map(f => (
              <button
                key={f.label}
                onClick={() => setFormat(f.label.toLowerCase() as 'seconds' | 'milliseconds')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  format === f.label.toLowerCase() 
                    ? 'bg-omni-primary text-white' 
                    : 'bg-omni-text/5 text-omni-text/60 hover:bg-omni-text/10'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-omni-text/70 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Unix Timestamp ({format})
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={displayTimestamp}
                onChange={(e) => handleTimestampChange(e.target.value)}
                className="flex-1 p-4 bg-omni-bg/50 border border-omni-text/10 rounded-xl text-omni-text font-mono text-2xl focus:outline-none focus:ring-2 focus:ring-omni-primary/50"
              />
              <button 
                onClick={() => copy(String(displayTimestamp), 'Timestamp')} 
                className="p-4 bg-omni-text/5 hover:bg-omni-text/10 rounded-xl transition-colors"
              >
                <Copy className="w-5 h-5 text-omni-text/60" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-omni-text/70 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date & Time
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={customDate || getDate().toISOString().split('T')[0]}
                onChange={(e) => { 
                   const val = e.target.value;
                   setCustomDate(val); 
                   setIsLive(false);
                   const dateStr = `${val}T${customTime || '00:00'}`;
                   const date = new Date(dateStr);
                   if (!isNaN(date.getTime())) {
                      setTimestamp(Math.floor(date.getTime() / 1000));
                   }
                }}
                className="p-3 bg-omni-bg/50 border border-omni-text/10 rounded-xl text-omni-text font-mono focus:outline-none focus:ring-2 focus:ring-omni-primary/50"
              />
              <input
                type="time"
                step="1"
                value={customTime || getDate().toTimeString().slice(0, 8)}
                onChange={(e) => { 
                   const val = e.target.value;
                   setCustomTime(val); 
                   setIsLive(false);
                   const dateStr = `${customDate || getDate().toISOString().split('T')[0]}T${val}`;
                   const date = new Date(dateStr);
                   if (!isNaN(date.getTime())) {
                      setTimestamp(Math.floor(date.getTime() / 1000));
                   }
                }}
                className="p-3 bg-omni-bg/50 border border-omni-text/10 rounded-xl text-omni-text font-mono focus:outline-none focus:ring-2 focus:ring-omni-primary/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-omni-text/70 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Timezone
            </label>
            <div className="flex flex-wrap gap-2">
              {TIMEZONES.map(tz => (
                <button
                  key={tz.value}
                  onClick={() => setTimezone(tz.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    timezone === tz.value 
                      ? 'bg-omni-primary text-white' 
                      : 'bg-omni-text/5 text-omni-text/60 hover:bg-omni-text/10'
                  }`}
                >
                  {tz.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <FormatCard 
            label="Relative" 
            value={getRelative()} 
            onCopy={() => copy(getRelative(), 'Relative time')}
            highlight
          />
          <FormatCard 
            label={`Local (${timezone === 'local' ? 'System' : timezone})`}
            value={formatWithTimezone(timezone)} 
            onCopy={() => copy(formatWithTimezone(timezone), 'Local time')}
          />
          <FormatCard 
            label="ISO 8601" 
            value={getDate().toISOString()} 
            onCopy={() => copy(getDate().toISOString(), 'ISO 8601')}
          />
          <FormatCard 
            label="UTC" 
            value={getDate().toUTCString()} 
            onCopy={() => copy(getDate().toUTCString(), 'UTC')}
          />
          <FormatCard 
            label="RFC 2822" 
            value={getDate().toString()} 
            onCopy={() => copy(getDate().toString(), 'RFC 2822')}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormatCard 
              label="Day of Year" 
              value={String(Math.floor((getDate().getTime() - new Date(getDate().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)))}
              onCopy={() => copy(String(Math.floor((getDate().getTime() - new Date(getDate().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))), 'Day of year')}
            />
            <FormatCard 
              label="Week Number" 
              value={String(getWeekNumber(getDate()))}
              onCopy={() => copy(String(getWeekNumber(getDate())), 'Week number')}
            />
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}

function FormatCard({ label, value, onCopy, highlight }: { label: string, value: string, onCopy: () => void, highlight?: boolean }) {
  return (
    <button
      onClick={onCopy}
      className={`w-full p-4 rounded-xl border text-left transition-all hover:border-omni-primary/30 group ${
        highlight 
          ? 'bg-omni-primary/10 border-omni-primary/20' 
          : 'bg-omni-bg/30 border-omni-text/5'
      }`}
    >
      <p className="text-xs text-omni-text/50 mb-1">{label}</p>
      <p className={`font-mono text-sm truncate ${highlight ? 'text-omni-primary font-bold' : 'text-omni-text'}`}>{value}</p>
      <p className="text-[10px] text-omni-text/30 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Click to copy</p>
    </button>
  )
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}
