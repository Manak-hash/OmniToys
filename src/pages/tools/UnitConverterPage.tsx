import { useState } from 'react'
import { Calculator, ArrowRightLeft, Copy, Check } from 'lucide-react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'

interface ConversionUnit {
  id: string
  name: string
  symbol: string
  toBase: (value: number) => number
  fromBase: (value: number) => number
}

interface ConversionCategory {
  id: string
  name: string
  icon: string
  units: ConversionUnit[]
}

// Length conversions (base: meters)
const lengthUnits: ConversionUnit[] = [
  { id: 'm', name: 'Meter', symbol: 'm', toBase: (v) => v, fromBase: (v) => v },
  { id: 'km', name: 'Kilometer', symbol: 'km', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
  { id: 'cm', name: 'Centimeter', symbol: 'cm', toBase: (v) => v / 100, fromBase: (v) => v * 100 },
  { id: 'mm', name: 'Millimeter', symbol: 'mm', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
  { id: 'mi', name: 'Mile', symbol: 'mi', toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
  { id: 'yd', name: 'Yard', symbol: 'yd', toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
  { id: 'ft', name: 'Foot', symbol: 'ft', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
  { id: 'in', name: 'Inch', symbol: 'in', toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
]

// Weight conversions (base: kilograms)
const weightUnits: ConversionUnit[] = [
  { id: 'kg', name: 'Kilogram', symbol: 'kg', toBase: (v) => v, fromBase: (v) => v },
  { id: 'g', name: 'Gram', symbol: 'g', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
  { id: 'mg', name: 'Milligram', symbol: 'mg', toBase: (v) => v / 1000000, fromBase: (v) => v * 1000000 },
  { id: 'lb', name: 'Pound', symbol: 'lb', toBase: (v) => v * 0.45359237, fromBase: (v) => v / 0.45359237 },
  { id: 'oz', name: 'Ounce', symbol: 'oz', toBase: (v) => v * 0.028349523125, fromBase: (v) => v / 0.028349523125 },
  { id: 'st', name: 'Stone', symbol: 'st', toBase: (v) => v * 6.35029318, fromBase: (v) => v / 6.35029318 },
  { id: 't', name: 'Metric Ton', symbol: 't', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
]

// Temperature conversions (special handling)
const tempUnits: ConversionUnit[] = [
  { id: 'c', name: 'Celsius', symbol: '°C', toBase: (v) => v, fromBase: (v) => v },
  { id: 'f', name: 'Fahrenheit', symbol: '°F', toBase: (v) => (v - 32) * 5/9, fromBase: (v) => v * 9/5 + 32 },
  { id: 'k', name: 'Kelvin', symbol: 'K', toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
]

// Data conversions (base: bytes)
const dataUnits: ConversionUnit[] = [
  { id: 'b', name: 'Byte', symbol: 'B', toBase: (v) => v, fromBase: (v) => v },
  { id: 'kb', name: 'Kilobyte', symbol: 'KB', toBase: (v) => v * 1024, fromBase: (v) => v / 1024 },
  { id: 'mb', name: 'Megabyte', symbol: 'MB', toBase: (v) => v * 1024 * 1024, fromBase: (v) => v / (1024 * 1024) },
  { id: 'gb', name: 'Gigabyte', symbol: 'GB', toBase: (v) => v * 1024 * 1024 * 1024, fromBase: (v) => v / (1024 * 1024 * 1024) },
  { id: 'tb', name: 'Terabyte', symbol: 'TB', toBase: (v) => v * 1024 * 1024 * 1024 * 1024, fromBase: (v) => v / (1024 * 1024 * 1024 * 1024) },
  { id: 'pb', name: 'Petabyte', symbol: 'PB', toBase: (v) => v * 1024 * 1024 * 1024 * 1024 * 1024, fromBase: (v) => v / (1024 * 1024 * 1024 * 1024 * 1024) },
]

// Time conversions (base: seconds)
const timeUnits: ConversionUnit[] = [
  { id: 'ms', name: 'Millisecond', symbol: 'ms', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
  { id: 's', name: 'Second', symbol: 's', toBase: (v) => v, fromBase: (v) => v },
  { id: 'min', name: 'Minute', symbol: 'min', toBase: (v) => v * 60, fromBase: (v) => v / 60 },
  { id: 'h', name: 'Hour', symbol: 'h', toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
  { id: 'd', name: 'Day', symbol: 'd', toBase: (v) => v * 86400, fromBase: (v) => v / 86400 },
  { id: 'w', name: 'Week', symbol: 'wk', toBase: (v) => v * 604800, fromBase: (v) => v / 604800 },
  { id: 'mo', name: 'Month', symbol: 'mo', toBase: (v) => v * 2629746, fromBase: (v) => v / 2629746 },
  { id: 'y', name: 'Year', symbol: 'yr', toBase: (v) => v * 31556952, fromBase: (v) => v / 31556952 },
]

const categories: ConversionCategory[] = [
  { id: 'length', name: 'Length', icon: '📏', units: lengthUnits },
  { id: 'weight', name: 'Weight', icon: '⚖️', units: weightUnits },
  { id: 'temperature', name: 'Temperature', icon: '🌡️', units: tempUnits },
  { id: 'data', name: 'Data', icon: '💾', units: dataUnits },
  { id: 'time', name: 'Time', icon: '⏱️', units: timeUnits },
]

function formatResult(value: number): string {
  if (Number.isInteger(value)) {
    return value.toString()
  }
  // Remove trailing zeros
  return parseFloat(value.toFixed(10)).toString()
}

export default function UnitConverterPage() {
  const [category, setCategory] = useState<ConversionCategory>(categories[0])
  const [fromUnit, setFromUnit] = useState<ConversionUnit>(categories[0].units[0])
  const [toUnit, setToUnit] = useState<ConversionUnit>(categories[0].units[1])
  const [fromValue, setFromValue] = useState('1')
  const [toValue, setToValue] = useState('')
  const [copied, setCopied] = useState(false)

  const handleCategoryChange = (catId: string) => {
    const newCategory = categories.find(c => c.id === catId)!
    setCategory(newCategory)
    setFromUnit(newCategory.units[0])
    setToUnit(newCategory.units[Math.min(1, newCategory.units.length - 1)])
    setFromValue('1')
    setToValue('')
  }

  const handleSwap = () => {
    const tempUnit = fromUnit
    const tempValue = toValue
    setFromUnit(toUnit)
    setToUnit(tempUnit)
    setFromValue(tempValue || '0')
    setToValue(fromValue)
  }

  const handleCopy = () => {
    if (!toValue) return
    navigator.clipboard.writeText(`${toValue} ${toUnit.symbol}`)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  // Auto-convert when inputs change
  const handleFromValueChange = (value: string) => {
    setFromValue(value)
    const input = parseFloat(value)
    if (isNaN(input)) {
      setToValue('')
      return
    }
    const baseValue = fromUnit.toBase(input)
    const result = toUnit.fromBase(baseValue)
    setToValue(formatResult(result))
  }

  const handleFromUnitChange = (unitId: string) => {
    const newUnit = category.units.find(u => u.id === unitId)!
    setFromUnit(newUnit)
    // Recalculate
    const input = parseFloat(fromValue)
    if (!isNaN(input)) {
      const baseValue = newUnit.toBase(input)
      const result = toUnit.fromBase(baseValue)
      setToValue(formatResult(result))
    }
  }

  const handleToUnitChange = (unitId: string) => {
    const newUnit = category.units.find(u => u.id === unitId)!
    setToUnit(newUnit)
    // Recalculate
    const input = parseFloat(fromValue)
    if (!isNaN(input)) {
      const baseValue = fromUnit.toBase(input)
      const result = newUnit.fromBase(baseValue)
      setToValue(formatResult(result))
    }
  }

  return (
    <ToolLayout
      title="Unit & Currency Converter"
      description="Convert between length, weight, temperature, data, and time"
      icon={<Calculator className="w-5 h-5" />}
    >
      <div className="space-y-6">
        {/* Category Selection */}
        <div>
          <h3 className="text-sm font-medium text-omni-text/80 mb-3">Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={cn(
                  "p-3 rounded-lg text-center transition-all",
                  category.id === cat.id
                    ? "bg-omni-primary text-white"
                    : "bg-omni-text/5 text-omni-text hover:bg-omni-text/10"
                )}
              >
                <div className="text-2xl mb-1">{cat.icon}</div>
                <div className="text-sm font-medium">{cat.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Converter */}
        <div className="grid md:grid-cols-3 gap-4 items-center">
          {/* From */}
          <div className="space-y-3 p-4 bg-omni-text/5 rounded-xl">
            <label className="block text-sm font-medium text-omni-text/80">
              From
            </label>
            <input
              type="number"
              value={fromValue}
              onChange={(e) => handleFromValueChange(e.target.value)}
              placeholder="Enter value..."
              className="w-full px-4 py-3 rounded-lg bg-omni-bg border border-omni-text/20 text-omni-text text-lg focus:outline-none focus:ring-2 focus:ring-omni-primary/50"
            />
            <select
              value={fromUnit.id}
              onChange={(e) => handleFromUnitChange(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-omni-bg border border-omni-text/20 text-omni-text focus:outline-none focus:ring-2 focus:ring-omni-primary/50"
            >
              {category.units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.symbol} - {unit.name}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSwap}
              className="p-3 rounded-full bg-omni-primary text-white hover:bg-omni-primary/90 transition-colors"
              title="Swap units"
            >
              <ArrowRightLeft className="w-6 h-6" />
            </button>
          </div>

          {/* To */}
          <div className="space-y-3 p-4 bg-omni-text/5 rounded-xl">
            <label className="block text-sm font-medium text-omni-text/80">
              To
            </label>
            <div className="relative">
              <input
                type="text"
                value={toValue}
                readOnly
                placeholder="Result..."
                className="w-full px-4 py-3 pr-12 rounded-lg bg-omni-bg/80 border-2 border-omni-primary/30 text-omni-text text-lg font-semibold"
              />
              <button
                onClick={handleCopy}
                disabled={!toValue}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded hover:bg-omni-text/10 transition-colors disabled:opacity-50"
                title="Copy result"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-omni-text/60" />}
              </button>
            </div>
            <select
              value={toUnit.id}
              onChange={(e) => handleToUnitChange(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-omni-bg border border-omni-text/20 text-omni-text focus:outline-none focus:ring-2 focus:ring-omni-primary/50"
            >
              {category.units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.symbol} - {unit.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* All Conversions Reference */}
        <div>
          <h3 className="text-sm font-medium text-omni-text/80 mb-3">
            Quick Reference: 1 {fromUnit.symbol} =
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {category.units
              .filter(u => u.id !== fromUnit.id)
              .map((unit) => {
                const baseValue = fromUnit.toBase(1)
                const converted = unit.fromBase(baseValue)
                return (
                  <div
                    key={unit.id}
                    className="p-3 bg-omni-text/5 rounded-lg text-center"
                  >
                    <p className="text-lg font-bold text-omni-primary">
                      {formatResult(converted)}
                    </p>
                    <p className="text-xs text-omni-text/60">{unit.symbol}</p>
                  </div>
                )
              })}
          </div>
        </div>

        {/* Info */}
        <div className="p-4 bg-omni-text/5 rounded-lg">
          <h3 className="text-sm font-semibold mb-2">Conversion Features</h3>
          <ul className="grid md:grid-cols-2 gap-2 text-xs text-omni-text/70">
            <li>✓ Real-time conversion as you type</li>
            <li>✓ Swap units with one click</li>
            <li>✓ Copy result to clipboard</li>
            <li>✓ Quick reference for all units</li>
            <li>✓ High precision calculations</li>
            <li>✓ 5 categories with 40+ units</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  )
}
