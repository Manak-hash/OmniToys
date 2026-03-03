import { useState, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { Network, CheckCircle, XCircle, Search } from 'lucide-react'
import { toast } from 'sonner'

interface PortInfo {
  port: number
  service: string
  description: string
  status: 'open' | 'closed' | 'filtered'
  common: boolean
}

const commonPorts: PortInfo[] = [
  { port: 21, service: 'FTP', description: 'File Transfer Protocol', status: 'closed', common: true },
  { port: 22, service: 'SSH', description: 'Secure Shell', status: 'closed', common: true },
  { port: 23, service: 'Telnet', description: 'Telnet Protocol', status: 'closed', common: false },
  { port: 25, service: 'SMTP', description: 'Mail Transfer', status: 'closed', common: true },
  { port: 53, service: 'DNS', description: 'Domain Name System', status: 'closed', common: true },
  { port: 80, service: 'HTTP', description: 'Web Server', status: 'closed', common: true },
  { port: 110, service: 'POP3', description: 'Post Office Protocol', status: 'closed', common: true },
  { port: 143, service: 'IMAP', description: 'Internet Message Access', status: 'closed', common: true },
  { port: 443, service: 'HTTPS', description: 'Secure Web Server', status: 'closed', common: true },
  { port: 445, service: 'SMB', description: 'Server Message Block', status: 'closed', common: true },
  { port: 993, service: 'IMAPS', description: 'IMAP over SSL', status: 'closed', common: true },
  { port: 995, service: 'POP3S', description: 'POP3 over SSL', status: 'closed', common: true },
  { port: 3306, service: 'MySQL', description: 'MySQL Database', status: 'closed', common: true },
  { port: 3389, service: 'RDP', description: 'Remote Desktop Protocol', status: 'closed', common: true },
  { port: 5432, service: 'PostgreSQL', description: 'PostgreSQL Database', status: 'closed', common: true },
  { port: 5900, service: 'VNC', description: 'Virtual Network Computing', status: 'closed', common: true },
  { port: 6379, service: 'Redis', description: 'Redis Cache', status: 'closed', common: true },
  { port: 8080, service: 'HTTP-Alt', description: 'Alternative HTTP', status: 'closed', common: true },
  { port: 8443, service: 'HTTPS-Alt', description: 'Alternative HTTPS', status: 'closed', common: true },
  { port: 27017, service: 'MongoDB', description: 'MongoDB Database', status: 'closed', common: true },
]

export default function PortOraclePage() {
  const [hostname, setHostname] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [results, setResults] = useState<PortInfo[]>([])
  const [selectedPorts, setSelectedPorts] = useState<Set<number>>(new Set(commonPorts.filter(p => p.common).map(p => p.port)))

  const togglePort = useCallback((port: number) => {
    const newSelected = new Set(selectedPorts)
    if (newSelected.has(port)) {
      newSelected.delete(port)
    } else {
      newSelected.add(port)
    }
    setSelectedPorts(newSelected)
  }, [selectedPorts])

  const scanPorts = useCallback(async () => {
    if (!hostname) {
      toast.error('Please enter a hostname or IP')
      return
    }

    setIsScanning(true)

    // Simulate port scanning (browser can't actually scan ports)
    toast.info('Note: Real port scanning requires server-side. This is a simulation.')

    await new Promise(resolve => setTimeout(resolve, 2000))

    const scanResults: PortInfo[] = Array.from(selectedPorts).map(port => {
      const portInfo = commonPorts.find(p => p.port === port)!
      // Randomly simulate port status
      const random = Math.random()
      let status: 'open' | 'closed' | 'filtered' = 'closed'
      if (random > 0.7) status = 'open'
      else if (random > 0.5) status = 'filtered'

      return { ...portInfo, status }
    })

    setResults(scanResults)
    setIsScanning(false)

    const openCount = scanResults.filter(p => p.status === 'open').length
    toast.success(`Scan complete! ${openCount} ports open`)
  }, [hostname, selectedPorts])

  const handleReset = useCallback(() => {
    setHostname('')
    setResults([])
    setSelectedPorts(new Set(commonPorts.filter(p => p.common).map(p => p.port)))
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'closed':
        return <XCircle className="w-5 h-5 text-gray-500" />
      case 'filtered':
        return <XCircle className="w-5 h-5 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-500/10 border-green-500/20'
      case 'closed':
        return 'bg-gray-500/10 border-gray-500/20'
      case 'filtered':
        return 'bg-yellow-500/10 border-yellow-500/20'
    }
  }

  const toggleCommonPorts = useCallback(() => {
    if (selectedPorts.size === commonPorts.filter(p => p.common).length) {
      setSelectedPorts(new Set())
    } else {
      setSelectedPorts(new Set(commonPorts.filter(p => p.common).map(p => p.port)))
    }
  }, [selectedPorts])

  return (
    <ToolLayout
      title="Port Oracle"
      description="Visual network port simulator"
      icon={<Network className="w-8 h-8" />}
      actions={<ActionToolbar onReset={handleReset} />}
    >
      <div className="flex flex-col h-full gap-6">
        {/* Info Box */}
        <div className="p-4 bg-omni-text/5 rounded-xl">
          <p className="text-xs text-omni-text/60">
            <strong className="text-omni-text/50">Note:</strong> Browsers cannot perform actual port scans due to security restrictions.
            This tool simulates port scanning for educational purposes. For real port scanning, use tools like nmap.
          </p>
        </div>

        {/* Input */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-omni-text/50 uppercase">Target Hostname or IP</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={hostname}
              onChange={(e) => setHostname(e.target.value)}
              placeholder="example.com or 192.168.1.1"
              className="flex-1 px-4 py-3 bg-omni-text/5 border border-omni-text/10 rounded-xl text-sm text-omni-text focus:outline-none focus:border-omni-primary/30"
              onKeyPress={(e) => e.key === 'Enter' && scanPorts()}
            />
            <button
              onClick={scanPorts}
              disabled={!hostname || isScanning || selectedPorts.size === 0}
              className="px-6 py-3 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-omni-primary/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isScanning ? (
                <>Scanning...</>
              ) : (
                <>
                  <Search className="w-4 h-4" /> Scan Ports
                </>
              )}
            </button>
          </div>
        </div>

        {/* Port Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-omni-text/50 uppercase">Select Ports to Scan</label>
            <button
              onClick={toggleCommonPorts}
              className="text-xs text-omni-primary hover:underline"
            >
              {selectedPorts.size === commonPorts.filter(p => p.common).length ? 'Deselect All' : 'Select Common'}
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-40 overflow-auto p-2 bg-omni-text/5 rounded-xl border border-omni-text/10">
            {commonPorts.map((port) => (
              <button
                key={port.port}
                onClick={() => togglePort(port.port)}
                className={`px-3 py-2 rounded text-xs transition-all ${
                  selectedPorts.has(port.port)
                    ? 'bg-omni-primary text-white'
                    : 'bg-omni-text/5 hover:bg-omni-text/10 text-omni-text'
                }`}
                title={port.description}
              >
                {port.port}
              </button>
            ))}
          </div>
          <div className="text-xs text-omni-text/40">
            {selectedPorts.size} port{selectedPorts.size !== 1 ? 's' : ''} selected
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="flex-1 overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-omni-text">{result.service}</h4>
                        <span className="text-lg font-bold text-omni-primary">{result.port}</span>
                      </div>
                      <p className="text-xs text-omni-text/60 mt-1">{result.description}</p>
                      <div className="mt-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          result.status === 'open'
                            ? 'bg-green-500/20 text-green-500'
                            : result.status === 'filtered'
                            ? 'bg-yellow-500/20 text-yellow-500'
                            : 'bg-gray-500/20 text-gray-500'
                        }`}>
                          {result.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Port Reference */}
        <div className="p-4 bg-omni-text/5 rounded-xl">
          <h3 className="text-xs font-bold text-omni-text/50 uppercase mb-3">Common Port Reference</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div><strong className="text-omni-text/70">20-21:</strong> FTP (File Transfer)</div>
            <div><strong className="text-omni-text/70">22:</strong> SSH (Secure Shell)</div>
            <div><strong className="text-omni-text/70">25:</strong> SMTP (Email)</div>
            <div><strong className="text-omni-text/70">53:</strong> DNS (Domain Names)</div>
            <div><strong className="text-omni-text/70">80:</strong> HTTP (Web)</div>
            <div><strong className="text-omni-text/70">443:</strong> HTTPS (Secure Web)</div>
            <div><strong className="text-omni-text/70">3306:</strong> MySQL (Database)</div>
            <div><strong className="text-omni-text/70">5432:</strong> PostgreSQL (Database)</div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
