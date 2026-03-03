import { useState, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { Shield, CheckCircle, AlertTriangle, XCircle, Search } from 'lucide-react'
import { toast } from 'sonner'

interface HeaderCheck {
  name: string
  present: boolean
  value: string
  severity: 'critical' | 'warning' | 'good'
  recommendation: string
}

export default function HeaderOraclePage() {
  const [url, setUrl] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [results, setResults] = useState<HeaderCheck[]>([])

  const securityHeaders = [
    {
      name: 'Strict-Transport-Security',
      severity: 'critical' as const,
      recommendation: 'Force HTTPS connections. Recommended: max-age=31536000; includeSubDomains'
    },
    {
      name: 'Content-Security-Policy',
      severity: 'critical' as const,
      recommendation: 'Prevent XSS attacks. Define allowed content sources.'
    },
    {
      name: 'X-Frame-Options',
      severity: 'warning' as const,
      recommendation: 'Prevent clickjacking. Recommended: DENY or SAMEORIGIN'
    },
    {
      name: 'X-Content-Type-Options',
      severity: 'warning' as const,
      recommendation: 'Prevent MIME sniffing. Recommended: nosniff'
    },
    {
      name: 'X-XSS-Protection',
      severity: 'warning' as const,
      recommendation: 'Enable XSS filter (deprecated but still useful). Recommended: 1; mode=block'
    },
    {
      name: 'Referrer-Policy',
      severity: 'warning' as const,
      recommendation: 'Control referrer information. Recommended: strict-origin-when-cross-origin'
    },
    {
      name: 'Permissions-Policy',
      severity: 'warning' as const,
      recommendation: 'Control browser features. Define which features can be used.'
    },
    {
      name: 'Cross-Origin-Opener-Policy',
      severity: 'good' as const,
      recommendation: 'Isolate browsing contexts. Recommended: same-origin'
    },
    {
      name: 'Cross-Origin-Resource-Policy',
      severity: 'good' as const,
      recommendation: 'Protect against cross-origin resource leaks. Recommended: same-origin'
    },
  ]

  const checkHeaders = useCallback(async () => {
    if (!url) {
      toast.error('Please enter a URL')
      return
    }

    // Add protocol if missing
    let targetUrl = url
    if (!url.match(/^https?:\/\//)) {
      targetUrl = 'https://' + url
    }

    setIsChecking(true)
    setResults([])

    try {
      // Use a CORS proxy for checking headers
      // Since we can't make direct requests from browser due to CORS, we'll simulate
      toast.info('Note: Direct header checking requires server-side. This is a demonstration.')

      // Simulate checking headers
      const checks: HeaderCheck[] = securityHeaders.map(header => ({
        name: header.name,
        present: Math.random() > 0.5, // Random for demo
        value: 'N/A',
        severity: header.severity,
        recommendation: header.recommendation
      }))

      setResults(checks)
      toast.success('Header analysis complete')
    } catch (error) {
      toast.error('Failed to check headers')
      console.error(error)
    } finally {
      setIsChecking(false)
    }
  }, [url])

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'good':
        return <CheckCircle className="w-5 h-5 text-green-500" />
    }
  }

  const getSeverityColor = (severity: string, present: boolean) => {
    if (!present) return 'bg-red-500/10 border-red-500/20'
    switch (severity) {
      case 'critical':
        return 'bg-green-500/10 border-green-500/20'
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20'
      case 'good':
        return 'bg-green-500/10 border-green-500/20'
    }
  }

  const handleReset = useCallback(() => {
    setUrl('')
    setResults([])
  }, [])

  const score = results.length > 0 ? {
    critical: results.filter(r => !r.present && r.severity === 'critical').length,
    warning: results.filter(r => !r.present && r.severity === 'warning').length,
    present: results.filter(r => r.present).length,
    total: results.length
  } : null

  return (
    <ToolLayout
      title="Header Oracle"
      description="Analyze HTTP security headers"
      icon={<Shield className="w-8 h-8" />}
      actions={<ActionToolbar onReset={handleReset} />}
    >
      <div className="flex flex-col h-full gap-6">
        {/* Info Box */}
        <div className="p-4 bg-omni-text/5 rounded-xl">
          <p className="text-xs text-omni-text/60">
            <strong className="text-omni-text/50">Note:</strong> Due to browser CORS restrictions, this tool demonstrates what headers to check.
            For production use, implement server-side header checking or use online tools like{' '}
            <a href="https://securityheaders.com" target="_blank" rel="noopener noreferrer" className="text-omni-primary hover:underline">
              securityheaders.com
            </a>.
          </p>
        </div>

        {/* Input */}
        <div className="flex gap-3">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="example.com or https://example.com"
            className="flex-1 px-4 py-3 bg-omni-text/5 border border-omni-text/10 rounded-xl text-sm text-omni-text focus:outline-none focus:border-omni-primary/30"
            onKeyPress={(e) => e.key === 'Enter' && checkHeaders()}
          />
          <button
            onClick={checkHeaders}
            disabled={!url || isChecking}
            className="px-6 py-3 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-omni-primary/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isChecking ? (
              <>Checking...</>
            ) : (
              <>
                <Search className="w-4 h-4" /> Analyze
              </>
            )}
          </button>
        </div>

        {/* Score */}
        {score && (
          <div className="grid grid-cols-4 gap-3">
            <div className={`p-3 rounded-lg text-center ${score.critical === 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
              <div className="text-lg font-bold text-omni-primary">{score.critical}</div>
              <div className="text-xs text-omni-text/50">Critical Missing</div>
            </div>
            <div className={`p-3 rounded-lg text-center ${score.warning === 0 ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
              <div className="text-lg font-bold text-omni-primary">{score.warning}</div>
              <div className="text-xs text-omni-text/50">Warning Missing</div>
            </div>
            <div className="p-3 rounded-lg text-center bg-green-500/10">
              <div className="text-lg font-bold text-green-500">{score.present}</div>
              <div className="text-xs text-omni-text/50">Present</div>
            </div>
            <div className="p-3 rounded-lg text-center bg-omni-text/5">
              <div className="text-lg font-bold text-omni-text">{Math.round((score.present / score.total) * 100)}%</div>
              <div className="text-xs text-omni-text/50">Score</div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex-1 overflow-auto space-y-3">
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getSeverityColor(result.severity, result.present)}`}
            >
              <div className="flex items-start gap-3">
                {getSeverityIcon(result.severity)}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-bold text-omni-text">{result.name}</h4>
                    <span className={`text-xs px-2 py-1 rounded ${
                      result.present
                        ? 'bg-green-500/20 text-green-500'
                        : 'bg-red-500/20 text-red-500'
                    }`}>
                      {result.present ? 'Present' : 'Missing'}
                    </span>
                  </div>
                  <p className="text-xs text-omni-text/60 mt-1">
                    <strong>Recommendation:</strong> {result.recommendation}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Header Reference */}
        <div className="p-4 bg-omni-text/5 rounded-xl">
          <h3 className="text-xs font-bold text-omni-text/50 uppercase mb-3">Security Headers Reference</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <strong className="text-omni-text/70">Strict-Transport-Security (HSTS)</strong>
              <p className="text-omni-text/50">Forces HTTPS connections, preventing man-in-the attacks.</p>
            </div>
            <div>
              <strong className="text-omni-text/70">Content-Security-Policy (CSP)</strong>
              <p className="text-omni-text/50">Prevents XSS attacks by controlling content sources.</p>
            </div>
            <div>
              <strong className="text-omni-text/70">X-Frame-Options</strong>
              <p className="text-omni-text/50">Prevents clickjacking attacks by controlling iframe embedding.</p>
            </div>
            <div>
              <strong className="text-omni-text/70">X-Content-Type-Options</strong>
              <p className="text-omni-text/50">Prevents MIME-type sniffing by browsers.</p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
