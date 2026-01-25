import { useState, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { Lock, Copy, RefreshCw, Check, X, Minus, Plus } from 'lucide-react'
import { toast } from 'sonner'

const CHAR_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  ambiguous: 'il1Lo0O',
  brackets: '[]{}()<>',
}

export default function PasswordGenPage() {
  const [password, setPassword] = useState('')
  const [length, setLength] = useState(16)
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  })
  const [advanced, setAdvanced] = useState({
    excludeAmbiguous: false,
    excludeBrackets: false,
    beginWithLetter: false,
    noConsecutive: false,
  })
  const [excludeChars, setExcludeChars] = useState('')
  const [history, setHistory] = useState<string[]>([])

  const generatePassword = useCallback(() => {
    let chars = ''
    if (options.uppercase) chars += CHAR_SETS.uppercase
    if (options.lowercase) chars += CHAR_SETS.lowercase
    if (options.numbers) chars += CHAR_SETS.numbers
    if (options.symbols) chars += CHAR_SETS.symbols

    if (chars.length === 0) {
      toast.error('Select at least one character type')
      return
    }

    if (advanced.excludeAmbiguous) {
      chars = chars.split('').filter(c => !CHAR_SETS.ambiguous.includes(c)).join('')
    }
    if (advanced.excludeBrackets) {
      chars = chars.split('').filter(c => !CHAR_SETS.brackets.includes(c)).join('')
    }
    if (excludeChars) {
      chars = chars.split('').filter(c => !excludeChars.includes(c)).join('')
    }

    if (chars.length === 0) {
      toast.error('No characters left after exclusions')
      return
    }

    let letterChars = ''
    if (advanced.beginWithLetter) {
      letterChars = chars.split('').filter(c => /[a-zA-Z]/.test(c)).join('')
      if (letterChars.length === 0) {
        toast.error('Cannot begin with letter - no letters available')
        return
      }
    }

    const array = new Uint32Array(length)
    crypto.getRandomValues(array)
    
    let generated = ''
    for (let i = 0; i < length; i++) {
      const pool = (i === 0 && advanced.beginWithLetter) ? letterChars : chars
      let char = pool[array[i] % pool.length]
      
      if (advanced.noConsecutive && generated.length > 0) {
        let attempts = 0
        while (char === generated[generated.length - 1] && attempts < 10) {
          crypto.getRandomValues(array.subarray(i, i + 1))
          char = pool[array[i] % pool.length]
          attempts++
        }
      }
      
      generated += char
    }

    setPassword(generated)
    setHistory(prev => [generated, ...prev.slice(0, 4)])
  }, [length, options, advanced, excludeChars])

  const copyPassword = (pwd: string = password) => {
    if (!pwd) return
    navigator.clipboard.writeText(pwd)
    toast.success('Password copied!')
  }

  const getStrength = () => {
    if (!password) return { label: 'None', color: 'bg-omni-text/20', percent: 0, text: 'text-omni-text/40' }
    let score = 0
    if (password.length >= 8) score += 10
    if (password.length >= 12) score += 15
    if (password.length >= 16) score += 15
    if (password.length >= 24) score += 10
    if (/[A-Z]/.test(password)) score += 10
    if (/[a-z]/.test(password)) score += 10
    if (/[0-9]/.test(password)) score += 10
    if (/[^A-Za-z0-9]/.test(password)) score += 20

    if (score < 30) return { label: 'Very Weak', color: 'bg-red-600', percent: score, text: 'text-red-400' }
    if (score < 50) return { label: 'Weak', color: 'bg-orange-500', percent: score, text: 'text-orange-400' }
    if (score < 70) return { label: 'Medium', color: 'bg-yellow-500', percent: score, text: 'text-yellow-400' }
    if (score < 90) return { label: 'Strong', color: 'bg-green-500', percent: score, text: 'text-green-400' }
    return { label: 'Very Strong', color: 'bg-emerald-500', percent: 100, text: 'text-emerald-400' }
  }

  const strength = getStrength()

  return (
    <ToolLayout
      title="Password Shield"
      description="Generate cryptographically secure passwords with advanced customization options."
      icon={<Lock className="w-8 h-8" />}
      actions={
        <button 
          onClick={generatePassword}
          className="flex items-center gap-2 px-3 py-1.5 bg-omni-primary/10 text-omni-primary hover:bg-omni-primary/20 rounded-lg transition-colors font-medium text-sm"
        >
          <RefreshCw className="w-4 h-4" /> Generate
        </button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-omni-bg/50 border border-omni-text/10 rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={password}
                readOnly
                placeholder="Click Generate to create password"
                className="flex-1 p-4 bg-transparent border-none text-xl font-mono text-omni-text focus:outline-none break-all"
              />
              <button 
                onClick={() => copyPassword()} 
                disabled={!password}
                className="p-3 bg-omni-text/5 hover:bg-omni-text/10 rounded-xl transition-colors disabled:opacity-50"
              >
                <Copy className="w-5 h-5 text-omni-text/60" />
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-omni-text/60">Strength</span>
                <span className={`font-medium ${strength.text}`}>{strength.label}</span>
              </div>
              <div className="h-2 bg-omni-text/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${strength.color} transition-all`}
                  style={{ width: `${strength.percent}%` }}
                />
              </div>
            </div>
          </div>
          <div className="p-4 bg-omni-bg/30 border border-omni-text/5 rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-omni-text/70">Password Length</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setLength(l => Math.max(4, l - 1))} className="p-1 bg-omni-text/10 rounded hover:bg-omni-text/20"><Minus className="w-4 h-4" /></button>
                <span className="font-mono text-lg w-8 text-center">{length}</span>
                <button onClick={() => setLength(l => Math.min(128, l + 1))} className="p-1 bg-omni-text/10 rounded hover:bg-omni-text/20"><Plus className="w-4 h-4" /></button>
              </div>
            </div>
            <input type="range" min="4" max="128" value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-full accent-omni-primary" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(options).map(([key, value]) => (
              <button key={key} onClick={() => setOptions({ ...options, [key]: !value })} className={`p-3 rounded-xl border transition-all flex items-center justify-between ${value ? 'bg-omni-primary/10 border-omni-primary/30 text-omni-text' : 'bg-omni-bg/50 border-omni-text/10 text-omni-text/60'}`}>
                <span className="capitalize">{key}</span>
                {value ? <Check className="w-4 h-4 text-omni-primary" /> : <X className="w-4 h-4" />}
              </button>
            ))}
          </div>
          <button onClick={generatePassword} className="w-full py-4 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl font-bold text-lg transition-all shadow-xl shadow-omni-primary/20">
            Generate Secure Password
          </button>
        </div>
        <div className="space-y-6">
          <div className="p-4 bg-omni-bg/30 border border-omni-text/5 rounded-xl space-y-4">
            <h3 className="font-medium text-omni-text/80">Advanced Options</h3>
            {Object.entries(advanced).map(([key, value]) => (
              <label key={key} className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-omni-text/60 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <input type="checkbox" checked={value} onChange={() => setAdvanced({ ...advanced, [key]: !value })} className="w-4 h-4 accent-omni-primary" />
              </label>
            ))}
            <div className="pt-2 border-t border-omni-text/5">
              <label className="text-sm text-omni-text/60 block mb-2">Exclude Characters</label>
              <input type="text" value={excludeChars} onChange={(e) => setExcludeChars(e.target.value)} placeholder="e.g. 0Ol1I" className="w-full p-2 bg-omni-bg/50 border border-omni-text/10 rounded-lg text-sm font-mono focus:outline-none" />
            </div>
          </div>
          {history.length > 0 && (
            <div className="p-4 bg-omni-bg/30 border border-omni-text/5 rounded-xl space-y-3">
              <h3 className="font-medium text-omni-text/80">Recent Passwords</h3>
              {history.map((pwd, i) => (
                <button key={i} onClick={() => copyPassword(pwd)} className="w-full p-2 bg-omni-bg/50 hover:bg-omni-text/5 border border-omni-text/5 rounded-lg text-xs font-mono text-omni-text/60 text-left truncate transition-colors">
                  {pwd}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}
