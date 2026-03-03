import { useState, useCallback, useMemo } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { Hash, Copy } from 'lucide-react'
import { toast } from 'sonner'

type Base = 2 | 8 | 10 | 16

export default function NumberBasePage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeBase, setActiveBase] = useState<Base>(10)
  const [values, setValues] = useState<Record<Base, string>>({
    2: '',
    8: '',
    10: '',
    16: '',
  })
  const [errors, setErrors] = useState<Record<Base, string>>({
    2: '',
    8: '',
    10: '',
    16: '',
  })

  const baseInfo: Record<Base, { label: string; prefix: string; description: string; color: string }> = useMemo(() => ({
    2: { label: 'Binary', prefix: '0b', description: 'Base-2: 0-1', color: 'text-blue-500' },
    8: { label: 'Octal', prefix: '0o', description: 'Base-8: 0-7', color: 'text-green-500' },
    10: { label: 'Decimal', prefix: '', description: 'Base-10: 0-9', color: 'text-purple-500' },
    16: { label: 'Hexadecimal', prefix: '0x', description: 'Base-16: 0-9, A-F', color: 'text-orange-500' },
  }), [])

  const isValidForBase = useCallback((value: string, base: Base): boolean => {
    if (!value) return true

    const cleanValue = value.toLowerCase().replace(/^0[box]/, '')

    switch (base) {
      case 2:
        return /^[01]+$/.test(cleanValue)
      case 8:
        return /^[0-7]+$/.test(cleanValue)
      case 10:
        return /^\d+$/.test(cleanValue)
      case 16:
        return /^[\da-f]+$/.test(cleanValue)
      default:
        return false
    }
  }, [])

  const convertFromBase = useCallback((value: string, fromBase: Base): Record<Base, string> => {
    if (!value) {
      return { 2: '', 8: '', 10: '', 16: '' }
    }

    const cleanValue = value.toLowerCase().replace(/^0[box]/, '')

    try {
      const decimal = parseInt(cleanValue, fromBase)

      if (isNaN(decimal)) {
        throw new Error('Invalid number')
      }

      return {
        2: decimal.toString(2),
        8: decimal.toString(8),
        10: decimal.toString(10),
        16: decimal.toString(16).toUpperCase(),
      }
    } catch {
      return { 2: '', 8: '', 10: '', 16: '' }
    }
  }, [])

  const handleValueChange = useCallback((base: Base, value: string) => {
    setValues(prev => ({ ...prev, [base]: value }))

    // Validate
    if (!isValidForBase(value, base)) {
      setErrors(prev => ({ ...prev, [base]: `Invalid ${baseInfo[base].label} number` }))
    } else {
      setErrors(prev => ({ ...prev, [base]: '' }))
    }

    // Convert to other bases
    if (value && isValidForBase(value, base)) {
      const converted = convertFromBase(value, base)
      setValues(prev => ({ ...prev, ...converted }))
      setActiveBase(base)
    } else if (!value) {
      setValues({ 2: '', 8: '', 10: '', 16: '' })
      setErrors({ 2: '', 8: '', 10: '', 16: '' })
    }
  }, [isValidForBase, convertFromBase, baseInfo])

  const handleCopy = useCallback((base: Base) => {
    const prefix = baseInfo[base].prefix
    const value = values[base]
    navigator.clipboard.writeText(prefix + value)
    toast.success(`${baseInfo[base].label} copied!`)
  }, [values, baseInfo])

  const handleReset = useCallback(() => {
    setValues({ 2: '', 8: '', 10: '', 16: '' })
    setErrors({ 2: '', 8: '', 10: '', 16: '' })
    setActiveBase(10)
  }, [])

  // Calculate additional info for the current number
  const numberInfo = values[10] ? (() => {
    const decimal = parseInt(values[10], 10)
    return {
      bytes: Math.ceil(Math.log2(decimal + 1) / 8),
      bits: Math.floor(Math.log2(decimal)) + 1,
      binaryBytes: decimal.toString(2).padStart(8, '0'),
      isNegative: decimal < 0,
    }
  })() : null

  return (
    <ToolLayout
      title="Number Base Converter"
      description="Convert between binary, octal, decimal, and hexadecimal"
      icon={<Hash className="w-8 h-8" />}
      actions={<ActionToolbar onReset={handleReset} />}
    >
      <div className="flex flex-col h-full gap-6">
        {/* Input Fields */}
        <div className="space-y-4">
          {([2, 8, 10, 16] as const).map((base) => {
            const info = baseInfo[base]
            const error = errors[base]
            const value = values[base]

            return (
              <div key={base} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className={`text-xs font-bold uppercase tracking-wider ${info.color}`}>
                    {info.label} ({info.description})
                  </label>
                  <span className="text-xs text-omni-text/40">{value.length} digits</span>
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 px-3 bg-omni-text/5 border border-omni-text/10 rounded-lg">
                    <span className="text-xs text-omni-text/50 font-mono">{info.prefix || '  '}</span>
                  </div>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleValueChange(base, e.target.value)}
                      placeholder={`Enter ${info.label} number...`}
                      className={`w-full px-4 py-3 bg-omni-text/5 border rounded-lg text-sm font-mono text-omni-text focus:outline-none transition-colors ${
                        error ? 'border-red-500/50 focus:border-red-500/50' : 'border-omni-text/10 focus:border-omni-primary/30'
                      }`}
                    />
                    {error && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-red-500">
                        {error}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleCopy(base)}
                    disabled={!value}
                    className="px-4 py-3 bg-omni-text/5 hover:bg-omni-text/10 border border-omni-text/10 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title={`Copy ${info.label}`}
                  >
                    <Copy className="w-4 h-4 text-omni-text/50" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Additional Info */}
        {numberInfo && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 bg-omni-text/5 rounded-lg text-center">
              <div className="text-lg font-bold text-omni-primary">{numberInfo.bits}</div>
              <div className="text-xs text-omni-text/50">Bits Required</div>
            </div>
            <div className="p-4 bg-omni-text/5 rounded-lg text-center">
              <div className="text-lg font-bold text-omni-primary">{numberInfo.bytes}</div>
              <div className="text-xs text-omni-text/50">Bytes</div>
            </div>
            <div className="p-4 bg-omni-text/5 rounded-lg text-center col-span-2">
              <div className="text-sm font-bold text-omni-primary font-mono truncate">
                {numberInfo.binaryBytes}
              </div>
              <div className="text-xs text-omni-text/50">Byte Representation</div>
            </div>
          </div>
        )}

        {/* Quick Reference */}
        <div className="p-4 bg-omni-text/5 rounded-xl">
          <h3 className="text-xs font-bold text-omni-text/50 uppercase tracking-wider mb-3">Quick Reference</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <div className="font-bold text-omni-text/70 mb-1">Binary</div>
              <div className="font-mono text-omni-text/50">0b1010 = 10</div>
            </div>
            <div>
              <div className="font-bold text-omni-text/70 mb-1">Octal</div>
              <div className="font-mono text-omni-text/50">0o12 = 10</div>
            </div>
            <div>
              <div className="font-bold text-omni-text/70 mb-1">Decimal</div>
              <div className="font-mono text-omni-text/50">10 = 10</div>
            </div>
            <div>
              <div className="font-bold text-omni-text/70 mb-1">Hex</div>
              <div className="font-mono text-omni-text/50">0xA = 10</div>
            </div>
          </div>
        </div>

        {/* Common Values */}
        <div className="p-4 bg-omni-text/5 rounded-xl">
          <h3 className="text-xs font-bold text-omni-text/50 uppercase tracking-wider mb-3">Common Values</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {[
              { decimal: 0, name: 'Zero' },
              { decimal: 1, name: 'One' },
              { decimal: 255, name: 'Byte Max (uint8)' },
              { decimal: 256, name: 'One Byte' },
              { decimal: 1024, name: '1 KB' },
              { decimal: 65535, name: 'uint16 Max' },
            ].map(({ decimal, name }) => (
              <button
                key={decimal}
                onClick={() => handleValueChange(10, decimal.toString())}
                className="flex items-center justify-between px-3 py-2 bg-omni-bg/30 hover:bg-omni-bg/50 rounded transition-colors text-left"
              >
                <span className="text-omni-text/70">{name}</span>
                <span className="font-mono text-omni-text/50">{decimal}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
