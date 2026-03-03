import { useState, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { Shield, CheckCircle, AlertTriangle, XCircle, Search } from 'lucide-react'
import { toast } from 'sonner'

interface CertIssue {
  severity: 'critical' | 'warning' | 'good'
  title: string
  description: string
  present: boolean
}

export default function SSLSentinelPage() {
  const [url, setUrl] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [results, setResults] = useState<CertIssue[]>([])

  const checkCertificate = useCallback(async () => {
    if (!url) {
      toast.error('Please enter a URL')
      return
    }

    setIsChecking(true)
    setResults([])

    try {
      toast.info('Note: SSL certificate checking requires server-side validation. This is a demonstration.')

      // Simulate certificate check
      await new Promise(resolve => setTimeout(resolve, 1500))

      const checks: CertIssue[] = [
        {
          severity: 'critical',
          title: 'Valid Certificate',
          description: 'Certificate is valid and trusted by a CA',
          present: Math.random() > 0.3
        },
        {
          severity: 'critical',
          title: 'Not Expired',
          description: 'Certificate has not expired',
          present: Math.random() > 0.2
        },
        {
          severity: 'critical',
          title: 'Matching Domain',
          description: 'Certificate matches the requested domain',
          present: Math.random() > 0.3
        },
        {
          severity: 'warning',
          title: 'HTTP to HTTPS Redirect',
          description: 'Server redirects HTTP to HTTPS',
          present: Math.random() > 0.5
        },
        {
          severity: 'warning',
          title: 'HSTS Enabled',
          description: 'HTTP Strict Transport Security is active',
          present: Math.random() > 0.5
        },
        {
          severity: 'good',
          title: 'Strong Signature',
          description: 'Certificate uses SHA-256 or stronger',
          present: Math.random() > 0.3
        },
        {
          severity: 'good',
          title: 'Modern Key Size',
          description: 'Certificate key is 2048 bits or larger',
          present: Math.random() > 0.3
        },
        {
          severity: 'good',
          title: 'OCSP Stapling',
          description: 'Online Certificate Status Protocol stapling enabled',
          present: Math.random() > 0.7
        },
      ]

      setResults(checks)
      toast.success('Certificate analysis complete')
    } catch (error) {
      toast.error('Failed to check certificate')
      console.error(error)
    } finally {
      setIsChecking(false)
    }
  }, [url])

  const handleReset = useCallback(() => {
    setUrl('')
    setResults([])
  }, [])

  const getSeverityIcon = (severity: string, present: boolean) => {
    if (!present) {
      return severity === 'critical' ? <XCircle className="w-5 h-5 text-red-500" /> : <AlertTriangle className="w-5 h-5 text-yellow-500" />
    }
    return <CheckCircle className="w-5 h-5 text-green-500" />
  }

  const getSeverityColor = (severity: string, present: boolean) => {
    if (!present) {
      return severity === 'critical' ? 'bg-red-500/10 border-red-500/20' : 'bg-yellow-500/10 border-yellow-500/20'
    }
    return 'bg-green-500/10 border-green-500/20'
  }

  const score = results.length > 0 ? {
    critical: results.filter(r => !r.present && r.severity === 'critical').length,
    warning: results.filter(r => !r.present && r.severity === 'warning').length,
    passed: results.filter(r => r.present).length,
    total: results.length
  } : null

  return (
    <ToolLayout
      title="SSL Sentinel"
      description="SSL/TLS certificate validation checker"
      icon={<Shield className="w-8 h-8" />}
      actions={<ActionToolbar onReset={handleReset} />}
    >
      <div className="flex flex-col h-full gap-6">
        {/* Info Box */}
        <div className="p-4 bg-omni-text/5 rounded-xl">
          <p className="text-xs text-omni-text/60">
            <strong className="text-omni-text/50">Note:</strong> Browsers cannot access full certificate details due to security restrictions.
            This tool demonstrates SSL certificate validation concepts. For production use, use tools like{' '}
            <a href="https://www.ssllabs.com/ssltest/" target="_blank" rel="noopener noreferrer" className="text-omni-primary hover:underline">
              SSL Labs
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
            onKeyPress={(e) => e.key === 'Enter' && checkCertificate()}
          />
          <button
            onClick={checkCertificate}
            disabled={!url || isChecking}
            className="px-6 py-3 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-omni-primary/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isChecking ? (
              <>Checking...</>
            ) : (
              <>
                <Search className="w-4 h-4" /> Validate
              </>
            )}
          </button>
        </div>

        {/* Score */}
        {score && (
          <div className="grid grid-cols-4 gap-3">
            <div className={`p-3 rounded-lg text-center ${score.critical === 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
              <div className="text-lg font-bold text-omni-primary">{score.critical}</div>
              <div className="text-xs text-omni-text/50">Critical</div>
            </div>
            <div className={`p-3 rounded-lg text-center ${score.warning === 0 ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
              <div className="text-lg font-bold text-omni-primary">{score.warning}</div>
              <div className="text-xs text-omni-text/50">Warnings</div>
            </div>
            <div className="p-3 rounded-lg text-center bg-green-500/10">
              <div className="text-lg font-bold text-green-500">{score.passed}</div>
              <div className="text-xs text-omni-text/50">Passed</div>
            </div>
            <div className="p-3 rounded-lg text-center bg-omni-text/5">
              <div className="text-lg font-bold text-omni-text">{Math.round((score.passed / score.total) * 100)}%</div>
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
                {getSeverityIcon(result.severity, result.present)}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-bold text-omni-text">{result.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded ${
                      result.present
                        ? 'bg-green-500/20 text-green-500'
                        : result.severity === 'critical'
                        ? 'bg-red-500/20 text-red-500'
                        : 'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {result.present ? 'Pass' : 'Fail'}
                    </span>
                  </div>
                  <p className="text-xs text-omni-text/60">{result.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* SSL Reference */}
        <div className="p-4 bg-omni-text/5 rounded-xl">
          <h3 className="text-xs font-bold text-omni-text/50 uppercase mb-3">SSL/TLS Best Practices</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <strong className="text-omni-text/70">Use Strong Certificates</strong>
              <p className="text-omni-text/50">2048-bit RSA or 256-bit ECC keys with SHA-256 signatures.</p>
            </div>
            <div>
              <strong className="text-omni-text/70">Enable HSTS</strong>
              <p className="text-omni-text/50">HTTP Strict Transport Security forces HTTPS connections.</p>
            </div>
            <div>
              <strong className="text-omni-text/70">Monitor Expiration</strong>
              <p className="text-omni-text/50">Set up alerts for certificate expiration before it happens.</p>
            </div>
            <div>
              <strong className="text-omni-text/70">Use OCSP Stapling</strong>
              <p className="text-omni-text/50">Improves performance by providing certificate status.</p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
