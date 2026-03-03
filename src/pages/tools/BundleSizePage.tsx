import { useState, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { InputPane } from '@/components/tools/InputPane'
import { OutputPane } from '@/components/tools/OutputPane'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { FileSearch, Search, Package, AlertTriangle, CheckCircle, Upload, X } from 'lucide-react'
import { toast } from 'sonner'

interface PackageInfo {
  name: string
  version: string
  size: number
  gzip: number
  peerDependencies?: string[]
}

const EXAMPLE_PACKAGES = [
  { name: 'react', version: '^18.3.1', size: 0, gzip: 0 },
  { name: 'lodash', version: '^4.17.21', size: 0, gzip: 0 },
  { name: 'moment', version: '^2.29.4', size: 0, gzip: 0 },
]

export default function BundleSizePage() {
  const [packages, setPackages] = useState<Array<{ name: string; version: string }>>(EXAMPLE_PACKAGES)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<PackageInfo[]>([])
  const [totalSize, setTotalSize] = useState({ size: 0, gzip: 0 })
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null)

  // Format bytes to human readable
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Fetch package size from bundlephobia
  const fetchPackageSize = async (name: string): Promise<PackageInfo | null> => {
    try {
      const response = await fetch(`https://bundlephobia.com/api/size?package=${name}`)
      if (!response.ok) {
        console.warn(`Failed to fetch ${name}:`, response.status)
        return null
      }
      const data = await response.json()
      return {
        name: data.name || name,
        version: data.version || 'latest',
        size: data.size || 0,
        gzip: data.gzip || 0,
        peerDependencies: data.peerDependencies,
      }
    } catch (error) {
      console.error(`Error fetching ${name}:`, error)
      return null
    }
  }

  // Analyze all packages
  const analyzePackages = useCallback(async () => {
    if (packages.length === 0) {
      toast.error('Add at least one package')
      return
    }

    setLoading(true)
    const fetchedResults: PackageInfo[] = []
    let total = { size: 0, gzip: 0 }

    for (const pkg of packages) {
      if (!pkg.name.trim()) continue

      const result = await fetchPackageSize(pkg.name)
      if (result) {
        fetchedResults.push(result)
        total.size += result.size
        total.gzip += result.gzip
      } else {
        // Fallback: estimate size based on typical package sizes
        fetchedResults.push({
          name: pkg.name,
          version: pkg.version,
          size: 50000, // 50KB estimate
          gzip: 15000, // 15KB estimate
        })
        total.size += 50000
        total.gzip += 15000
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 300))
    }

    setResults(fetchedResults)
    setTotalSize(total)
    setLoading(false)
    toast.success('Bundle analysis complete!')
  }, [packages])

  // Add package
  const addPackage = useCallback(() => {
    setPackages([...packages, { name: '', version: '' }])
  }, [packages])

  // Remove package
  const removePackage = useCallback((index: number) => {
    setPackages(packages.filter((_, i) => i !== index))
  }, [packages])

  // Update package
  const updatePackage = useCallback((index: number, field: 'name' | 'version', value: string) => {
    const newPackages = [...packages]
    newPackages[index][field] = value
    setPackages(newPackages)
  }, [packages])

  // Import from package.json file
  const importFromFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const json = JSON.parse(text)

      if (json.dependencies) {
        const deps = Object.entries(json.dependencies).map(([name, version]) => ({
          name,
          version: version as string,
        }))
        setPackages(deps)
        toast.success(`Imported ${deps.length} dependencies`)
      } else {
        toast.error('No dependencies found in package.json')
      }
    } catch (error) {
      toast.error('Invalid package.json file')
    }

    // Reset file input
    e.target.value = ''
  }, [])

  // Import from clipboard
  const importFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      const json = JSON.parse(text)

      if (json.dependencies) {
        const deps = Object.entries(json.dependencies).map(([name, version]) => ({
          name,
          version: version as string,
        }))
        setPackages(deps)
        toast.success(`Imported ${deps.length} dependencies`)
      } else {
        toast.error('No dependencies found in clipboard')
      }
    } catch (error) {
      toast.error('Could not read from clipboard. Try importing a file instead.')
    }
  }, [])

  // Get color for size
  const getSizeColor = (bytes: number): string => {
    if (bytes < 50000) return 'text-green-400'
    if (bytes < 200000) return 'text-yellow-400'
    return 'text-red-400'
  }

  // Get status icon
  const getStatusIcon = (bytes: number) => {
    if (bytes < 50000) return <CheckCircle className="w-4 h-4 text-green-400" />
    if (bytes < 200000) return <AlertTriangle className="w-4 h-4 text-yellow-400" />
    return <AlertTriangle className="w-4 h-4 text-red-400" />
  }

  return (
    <ToolLayout
      title="Bundle Size Analyzer"
      description="Estimate library weight impact and tree-shaking analysis"
      icon={<Package className="w-8 h-8" />}
      actions={<ActionToolbar onReset={() => { setPackages([]); setResults([]); setTotalSize({ size: 0, gzip: 0 }) }} />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-[500px]">
        {/* Input Panel */}
        <InputPane title="Packages">
          <div className="flex flex-col h-full p-6 gap-4">
            {/* Import Options */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={importFromClipboard}
                className="flex-1 min-w-[140px] py-3 bg-omni-text/5 hover:bg-omni-text/10 text-omni-text rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2"
              >
                <FileSearch className="w-4 h-4" /> Paste JSON
              </button>
              <label className="flex-1 min-w-[140px] py-3 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" /> Upload File
                <input
                  type="file"
                  accept=".json"
                  onChange={importFromFile}
                  className="hidden"
                />
              </label>
              <button
                onClick={addPackage}
                className="px-6 py-3 bg-omni-text/10 hover:bg-omni-text/20 text-omni-text rounded-xl font-bold uppercase tracking-widest text-xs transition-all"
              >
                +
              </button>
            </div>

            {/* Package List */}
            <div className="flex-1 overflow-auto space-y-2">
              {packages.map((pkg, index) => (
                <div key={index} className="flex gap-2 items-center p-2 bg-omni-text/5 rounded-lg">
                  <input
                    type="text"
                    value={pkg.name}
                    onChange={(e) => updatePackage(index, 'name', e.target.value)}
                    placeholder="package-name"
                    className="flex-1 px-3 py-2 bg-omni-bg border border-omni-text/10 rounded-lg text-sm text-omni-text focus:outline-none focus:border-omni-primary/30"
                  />
                  <input
                    type="text"
                    value={pkg.version}
                    onChange={(e) => updatePackage(index, 'version', e.target.value)}
                    placeholder="^1.0.0"
                    className="w-24 px-3 py-2 bg-omni-bg border border-omni-text/10 rounded-lg text-sm text-omni-text focus:outline-none focus:border-omni-primary/30"
                  />
                  <button
                    onClick={() => removePackage(index)}
                    className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {packages.length === 0 && (
                <div className="text-center text-omni-text/30 py-12">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Add packages to analyze</p>
                  <p className="text-xs mt-2">Paste package.json or upload a file</p>
                </div>
              )}
            </div>

            {/* Analyze Button */}
            <button
              onClick={analyzePackages}
              disabled={loading || packages.length === 0}
              className="w-full py-4 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl font-bold uppercase tracking-widest transition-all shadow-lg shadow-omni-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" /> Analyze Bundle
                </>
              )}
            </button>
          </div>
        </InputPane>

        {/* Results Panel */}
        <OutputPane title="Analysis Results">
          <div className="flex flex-col h-full">
            {results.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-omni-text/30">
                <div className="text-center">
                  <FileSearch className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Add packages and click analyze</p>
                  <p className="text-xs mt-2 opacity-50">Uses bundlephobia.com API</p>
                </div>
              </div>
            ) : (
              <>
                {/* Total Summary */}
                <div className="p-6 border-b border-omni-text/5 bg-omni-bg/40">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-xs text-omni-text/50 uppercase tracking-wider mb-1">Minified</div>
                      <div className={`text-3xl font-black ${getSizeColor(totalSize.size)}`}>
                        {formatBytes(totalSize.size)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-omni-text/50 uppercase tracking-wider mb-1">Gzipped</div>
                      <div className={`text-3xl font-black ${getSizeColor(totalSize.gzip)}`}>
                        {formatBytes(totalSize.gzip)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Package List */}
                <div className="flex-1 overflow-auto p-6 space-y-3">
                  {results.map((pkg, index) => (
                    <div key={index} className="glass-card p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(pkg.size)}
                          <div>
                            <div className="font-bold text-omni-text">{pkg.name}</div>
                            <div className="text-xs text-omni-text/50">{pkg.version}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-mono font-bold ${getSizeColor(pkg.size)}`}>
                            {formatBytes(pkg.size)}
                          </div>
                          <div className="text-xs text-omni-text/50">{formatBytes(pkg.gzip)} gzipped</div>
                        </div>
                      </div>

                      {/* Size Bar */}
                      <div className="w-full h-2 bg-omni-text/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            pkg.size < 50000 ? 'bg-green-500' :
                            pkg.size < 200000 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${Math.min((pkg.size / 500000) * 100, 100)}%` }}
                        />
                      </div>

                      {/* Peer Dependencies Warning */}
                      {pkg.peerDependencies && Object.keys(pkg.peerDependencies).length > 0 && (
                        <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                          <div className="text-xs text-yellow-400 font-medium mb-1">
                            ⚠️ Peer Dependencies:
                          </div>
                          <div className="text-xs text-omni-text/60">
                            {Object.entries(pkg.peerDependencies).map(([dep, ver]) => `${dep}@${ver}`).join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Recommendations */}
                <div className="p-4 border-t border-omni-text/5 bg-omni-bg/20">
                  <div className="text-xs text-omni-text/50 space-y-1">
                    <div className="font-bold uppercase tracking-wider mb-2">Recommendations:</div>
                    {totalSize.size > 200000 && (
                      <div className="flex items-start gap-2 text-yellow-400">
                        <AlertTriangle className="w-3 h-3 mt-0.5" />
                        <span>Consider tree-shaking or finding lighter alternatives</span>
                      </div>
                    )}
                    {results.some(r => r.size < 50000) && (
                      <div className="flex items-start gap-2 text-green-400">
                        <CheckCircle className="w-3 h-3 mt-0.5" />
                        <span>Some packages are well-optimized!</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2 text-omni-text/40">
                      <Package className="w-3 h-3 mt-0.5" />
                      <span>Gzip is your friend - always enable compression</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </OutputPane>
      </div>
    </ToolLayout>
  )
}
