import { useState } from 'react'
import { Lock, Copy, Check, AlertCircle, Code2 } from 'lucide-react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { CodeEditor } from '@/components/ui/CodeEditor'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'

interface JwtPart {
  label: string
  content: string
  isValid: boolean
  error?: string
}

// Base64 decode function (from Base64Page)
function base64Decode(str: string): string {
  try {
    return decodeURIComponent(escape(atob(str)))
  } catch {
    throw new Error('Invalid Base64')
  }
}

function decodeJwt(token: string): { header: JwtPart; payload: JwtPart; signature: JwtPart } {
  const parts = token.split('.')

  const header: JwtPart = {
    label: 'Header',
    content: '',
    isValid: false,
  }

  const payload: JwtPart = {
    label: 'Payload',
    content: '',
    isValid: false,
  }

  const signature: JwtPart = {
    label: 'Signature',
    content: '',
    isValid: true, // Signature is just encoded, can't validate without secret
  }

  if (parts.length !== 3) {
    const error = parts.length < 3 ? 'Invalid JWT format (too few parts)' : 'Invalid JWT format (too many parts)'
    header.error = error
    payload.error = error
    return { header, payload, signature }
  }

  // Decode header
  try {
    const decoded = base64Decode(parts[0])
    const parsed = JSON.parse(decoded)
    header.content = JSON.stringify(parsed, null, 2)
    header.isValid = true
  } catch (e) {
    header.error = e instanceof Error ? e.message : 'Failed to decode header'
    header.content = parts[0]
  }

  // Decode payload
  try {
    const decoded = base64Decode(parts[1])
    const parsed = JSON.parse(decoded)
    payload.content = JSON.stringify(parsed, null, 2)
    payload.isValid = true
  } catch (e) {
    payload.error = e instanceof Error ? e.message : 'Failed to decode payload'
    payload.content = parts[1]
  }

  // Signature (just show the base64, can't validate without secret)
  signature.content = parts[2]

  return { header, payload, signature }
}

export default function JwtInspectorPage() {
  const [token, setToken] = useState('')
  const [decoded, setDecoded] = useState<{ header: JwtPart; payload: JwtPart; signature: JwtPart } | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const handleDecode = () => {
    if (!token.trim()) {
      setDecoded(null)
      return
    }
    setDecoded(decodeJwt(token))
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    toast.success(`Copied ${label}`)
    setTimeout(() => setCopied(null), 2000)
  }

  const copyAll = () => {
    if (!decoded) return
    const all = [
      `--- ${decoded.header.label} ---`,
      decoded.header.content,
      '',
      `--- ${decoded.payload.label} ---`,
      decoded.payload.content,
      '',
      `--- ${decoded.signature.label} ---`,
      decoded.signature.content,
    ].join('\n')
    navigator.clipboard.writeText(all)
    toast.success('Copied all parts')
  }

  const isValid = decoded?.header.isValid && decoded?.payload.isValid

  return (
    <ToolLayout
      title="JWT Inspector"
      description="Decode and inspect JSON Web Tokens locally in your browser"
      icon={<Lock className="w-5 h-5" />}
    >
      <div className="space-y-6">
        {/* Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-omni-text/80">
            JWT Token
          </label>
          <textarea
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste your JWT token here..."
            className={cn(
              "w-full px-4 py-3 rounded-lg bg-omni-bg border-2 font-mono text-sm resize-none",
              "focus:outline-none focus:ring-2 focus:ring-omni-primary/50",
              isValid !== false && token ? "border-omni-text/20" : "border-omni-text/20"
            )}
            rows={4}
          />
          <button
            onClick={handleDecode}
            disabled={!token.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-omni-primary text-white hover:bg-omni-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Code2 className="w-4 h-4" />
            Decode Token
          </button>
        </div>

        {/* Decoded Parts */}
        {decoded && (
          <div className="space-y-4">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  {decoded.header.label}
                  {decoded.header.isValid ? (
                    <span className="text-xs text-green-500">✓ Valid</span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-red-400">
                      <AlertCircle className="w-3 h-3" />
                      Invalid
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => handleCopy(decoded.header.content, decoded.header.label)}
                  className="p-1.5 rounded hover:bg-omni-text/10 transition-colors"
                  title={`Copy ${decoded.header.label}`}
                >
                  {copied === decoded.header.label ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-omni-text/60" />
                  )}
                </button>
              </div>
              <CodeEditor
                value={decoded.header.content || decoded.header.error || ''}
                language="json"
                readOnly
                placeholder="Decoded header will appear here..."
                className={cn(
                  "min-h-[150px]",
                  !decoded.header.isValid && "border-red-500/30"
                )}
              />
              {decoded.header.error && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {decoded.header.error}
                </p>
              )}
            </div>

            {/* Payload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  {decoded.payload.label}
                  {decoded.payload.isValid ? (
                    <span className="text-xs text-green-500">✓ Valid</span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-red-400">
                      <AlertCircle className="w-3 h-3" />
                      Invalid
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => handleCopy(decoded.payload.content, decoded.payload.label)}
                  className="p-1.5 rounded hover:bg-omni-text/10 transition-colors"
                  title={`Copy ${decoded.payload.label}`}
                >
                  {copied === decoded.payload.label ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-omni-text/60" />
                  )}
                </button>
              </div>
              <CodeEditor
                value={decoded.payload.content || decoded.payload.error || ''}
                language="json"
                readOnly
                placeholder="Decoded payload will appear here..."
                className={cn(
                  "min-h-[150px]",
                  !decoded.payload.isValid && "border-red-500/30"
                )}
              />
              {decoded.payload.error && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {decoded.payload.error}
                </p>
              )}
            </div>

            {/* Signature */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  {decoded.signature.label}
                  <span className="text-xs text-omni-text/60">(Encoded)</span>
                </h3>
                <button
                  onClick={() => handleCopy(decoded.signature.content, decoded.signature.label)}
                  className="p-1.5 rounded hover:bg-omni-text/10 transition-colors"
                  title={`Copy ${decoded.signature.label}`}
                >
                  {copied === decoded.signature.label ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-omni-text/60" />
                  )}
                </button>
              </div>
              <div className="p-4 bg-omni-text/5 rounded-lg font-mono text-sm break-all">
                {decoded.signature.content}
              </div>
              <p className="text-xs text-omni-text/50">
                Note: Signature cannot be validated without the secret key
              </p>
            </div>

            {/* Actions */}
            <ActionToolbar>
              <button
                onClick={copyAll}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-omni-primary text-white hover:bg-omni-primary/90 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy All
              </button>
            </ActionToolbar>
          </div>
        )}

        {/* Info */}
        <div className="p-4 bg-omni-text/5 rounded-lg">
          <h3 className="text-sm font-semibold mb-2">About JWT</h3>
          <p className="text-xs text-omni-text/70 leading-relaxed">
            JSON Web Tokens consist of three parts separated by dots: Header, Payload, and Signature.
            This tool decodes the Header and Payload for inspection. The Signature is used to verify
            the token wasn't tampered with, but validation requires the secret key used to sign it.
          </p>
        </div>
      </div>
    </ToolLayout>
  )
}
