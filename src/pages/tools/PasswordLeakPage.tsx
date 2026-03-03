import { useState, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { Shield, AlertCircle, CheckCircle, Search } from 'lucide-react'
import { toast } from 'sonner'

export default function PasswordLeakPage() {
  const [password, setPassword] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [result, setResult] = useState<{ leaked: boolean; count: number } | null>(null)

  const checkPassword = useCallback(async () => {
    if (!password) {
      toast.error('Please enter a password')
      return
    }

    setIsChecking(true)
    setResult(null)

    try {
      // SHA-1 hash the password
      const encoder = new TextEncoder()
      const data = encoder.encode(password)
      const hashBuffer = await crypto.subtle.digest('SHA-1', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

      // Send first 5 chars of hash to HIBP API (k-anonymity)
      const prefix = hashHex.substring(0, 5)
      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`)

      if (!response.ok) {
        throw new Error('API request failed')
      }

      const responseData = await response.text()
      const lines = responseData.split('\n')
      const suffix = hashHex.substring(5).toUpperCase()

      let count = 0
      for (const line of lines) {
        const [lineSuffix, lineCount] = line.split(':')
        if (lineSuffix === suffix) {
          count = parseInt(lineCount, 10)
          break
        }
      }

      setResult({
        leaked: count > 0,
        count
      })

      if (count > 0) {
        toast.error(`Password found in ${count} data breaches!`)
      } else {
        toast.success('Password not found in any known data breaches!')
      }
    } catch (error) {
      toast.error('Failed to check password. Please try again.')
      console.error(error)
    } finally {
      setIsChecking(false)
    }
  }, [password])

  const handleReset = useCallback(() => {
    setPassword('')
    setResult(null)
  }, [])

  const getStrength = useCallback((pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: '' }

    let score = 0
    if (pwd.length >= 8) score++
    if (pwd.length >= 12) score++
    if (pwd.length >= 16) score++
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++
    if (/\d/.test(pwd)) score++
    if (/[^a-zA-Z0-9]/.test(pwd)) score++

    const levels = [
      { score: 0, label: 'Very Weak', color: 'text-red-500' },
      { score: 1, label: 'Weak', color: 'text-red-500' },
      { score: 2, label: 'Fair', color: 'text-orange-500' },
      { score: 3, label: 'Good', color: 'text-yellow-500' },
      { score: 4, label: 'Strong', color: 'text-green-500' },
      { score: 5, label: 'Very Strong', color: 'text-green-500' },
      { score: 6, label: 'Excellent', color: 'text-emerald-500' },
    ]

    return levels.find(l => l.score === score) || levels[0]
  }, [])

  const strength = getStrength(password)

  return (
    <ToolLayout
      title="Password Leak Checker"
      description="Check if your password has been compromised in data breaches"
      icon={<Shield className="w-8 h-8" />}
      actions={<ActionToolbar onReset={handleReset} />}
    >
      <div className="flex flex-col h-full gap-6">
        {/* Info Box */}
        <div className="p-4 bg-omni-text/5 rounded-xl">
          <p className="text-xs text-omni-text/60">
            <strong className="text-omni-text/50">Privacy Note:</strong> This tool uses{' '}
            <a href="https://haveibeenpwned.com" target="_blank" rel="noopener noreferrer" className="text-omni-primary hover:underline">
              Have I Been Pwned
            </a>
            {' '}API with k-anonymity. Your full password is never sent - only the first 5 characters of its SHA-1 hash.
          </p>
        </div>

        {/* Input */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-omni-text/50 uppercase">Password to Check</label>
          <div className="flex gap-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              className="flex-1 px-4 py-3 bg-omni-text/5 border border-omni-text/10 rounded-xl text-sm text-omni-text focus:outline-none focus:border-omni-primary/30"
              onKeyPress={(e) => e.key === 'Enter' && checkPassword()}
            />
            <button
              onClick={checkPassword}
              disabled={!password || isChecking}
              className="px-6 py-3 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-omni-primary/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isChecking ? (
                <>Checking...</>
              ) : (
                <>
                  <Search className="w-4 h-4" /> Check
                </>
              )}
            </button>
          </div>

          {/* Password Strength */}
          {password && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-omni-text/50">Strength:</span>
              <span className={`text-xs font-bold ${strength.color}`}>{strength.label}</span>
              <div className="flex-1 h-2 bg-omni-text/10 rounded-full overflow-hidden">
                <div
                  className={`h-full ${strength.color.replace('text-', 'bg-')}`}
                  style={{ width: `${(strength.score / 6) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Result */}
        {result && (
          <div className={`p-6 rounded-xl border ${
            result.leaked
              ? 'bg-red-500/10 border-red-500/20'
              : 'bg-green-500/10 border-green-500/20'
          }`}>
            <div className="flex items-start gap-4">
              {result.leaked ? (
                <AlertCircle className="w-12 h-12 text-red-500 flex-shrink-0" />
              ) : (
                <CheckCircle className="w-12 h-12 text-green-500 flex-shrink-0" />
              )}
              <div>
                <h3 className={`text-lg font-bold mb-2 ${result.leaked ? 'text-red-500' : 'text-green-500'}`}>
                  {result.leaked
                    ? `Password Found in ${result.count.toLocaleString()} Breaches!`
                    : 'Password Not Found - Safe to Use'
                  }
                </h3>
                <p className="text-sm text-omni-text/60">
                  {result.leaked
                    ? 'This password has been exposed in data breaches. You should change it immediately and never use it again.'
                    : 'Good news! This password has not been found in any known data breaches. However, remember to use unique passwords for each account.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="p-4 bg-omni-text/5 rounded-xl">
          <h3 className="text-xs font-bold text-omni-text/50 uppercase mb-3">Password Security Tips</h3>
          <ul className="text-xs text-omni-text/60 space-y-2">
            <li>• Use at least 12-16 characters</li>
            <li>• Mix uppercase, lowercase, numbers, and symbols</li>
            <li>• Use unique passwords for each account</li>
            <li>• Consider using a password manager</li>
            <li>• Enable two-factor authentication when available</li>
          </ul>
        </div>

        {/* Disclaimer */}
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <p className="text-xs text-yellow-500/80">
            <strong>Disclaimer:</strong> This tool checks against publicly known data breaches. A "not found" result doesn't guarantee your password hasn't been compromised elsewhere. Always practice good password hygiene.
          </p>
        </div>
      </div>
    </ToolLayout>
  )
}
