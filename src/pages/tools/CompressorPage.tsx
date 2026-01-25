import { useState, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { FileUploader } from '@/components/ui/FileUploader'
import { FileText, Download, Archive, RefreshCw, Settings2 } from 'lucide-react'
import { toast } from 'sonner'
import * as fflate from 'fflate'
import fileDownload from 'js-file-download'

type CompressionFormat = 'gzip' | 'deflate' | 'zip'
type CompressionLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export default function CompressorPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isCompressing, setIsCompressing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{ size: number, name: string, data: Uint8Array } | null>(null)
  const [format, setFormat] = useState<CompressionFormat>('gzip')
  const [level, setLevel] = useState<CompressionLevel>(6)
  const [showOptions, setShowOptions] = useState(false)

  const handleFileSelect = (uploadedFile: File) => {
    setFile(uploadedFile)
    setResult(null)
    setProgress(0)
  }

  const compressFile = useCallback(async () => {
    if (!file) return

    setIsCompressing(true)
    setProgress(0)
    const toastId = toast.loading('Reading file...')

    try {
      const fileBuffer = new Uint8Array(await file.arrayBuffer())
      setProgress(20)
      toast.loading('Compressing...', { id: toastId })

      let outputName: string
      let compressedData: Uint8Array

      // Use streaming for large files (>10MB)
      const isLarge = file.size > 10 * 1024 * 1024

      if (format === 'zip') {
        outputName = `${file.name}.zip`
        // Create zip with the file inside
        const zipData = await new Promise<Uint8Array>((resolve, reject) => {
          fflate.zip(
            { [file.name]: fileBuffer },
            { level, consume: true },
            (err, data) => {
              if (err) reject(err)
              else resolve(data)
            }
          )
        })
        compressedData = zipData
      } else if (format === 'gzip') {
        outputName = `${file.name}.gz`
        compressedData = await new Promise<Uint8Array>((resolve, reject) => {
          if (isLarge) {
            // Streaming compression for large files
            const chunks: Uint8Array[] = []
            const gzip = new fflate.Gzip({ level }, (chunk, isLast) => {
              chunks.push(chunk)
              if (isLast) {
                let total = 0
                chunks.forEach(c => total += c.length)
                const out = new Uint8Array(total)
                let offset = 0
                chunks.forEach(c => { out.set(c, offset); offset += c.length })
                resolve(out)
              }
            })
            
            const chunkSize = 1024 * 1024 // 1MB chunks
            for (let i = 0; i < fileBuffer.length; i += chunkSize) {
              const end = Math.min(i + chunkSize, fileBuffer.length)
              gzip.push(fileBuffer.subarray(i, end), end >= fileBuffer.length)
              setProgress(20 + Math.round((i / fileBuffer.length) * 70))
            }
          } else {
            fflate.gzip(fileBuffer, { level }, (err, data) => {
              if (err) reject(err)
              else resolve(data)
            })
          }
        })
      } else {
        outputName = `${file.name}.deflate`
        compressedData = await new Promise<Uint8Array>((resolve, reject) => {
          fflate.deflate(fileBuffer, { level }, (err, data) => {
            if (err) reject(err)
            else resolve(data)
          })
        })
      }

      setProgress(100)
      setResult({
        size: compressedData.length,
        name: outputName,
        data: compressedData
      })
      
      setIsCompressing(false)
      toast.dismiss(toastId)
      
      const savedPercent = (100 - (compressedData.length / file.size * 100)).toFixed(1)
      const savedBytes = file.size - compressedData.length
      toast.success(`Compressed! Saved ${savedPercent}% (${formatSize(savedBytes)})`)
      
    } catch (e) {
      console.error(e)
      toast.error('Compression failed', { id: toastId })
      setIsCompressing(false)
    }
  }, [file, format, level])

  const handleDownload = () => {
    if (!result) return
    fileDownload(result.data, result.name)
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const compressionRatio = result && file ? (100 - (result.size / file.size * 100)).toFixed(1) : 0

  return (
    <ToolLayout
      title="Ultra Compressor"
      description="Compress files securely in your browser. Supports Gzip, Deflate, and Zip formats. No file limit."
      icon={<FileText className="w-8 h-8" />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-[500px]">
        
        {/* Upload Column */}
        <div className="flex flex-col gap-6">
          {!file ? (
            <FileUploader 
              onFileSelect={handleFileSelect} 
              maxSizeMB={500}
              className="h-full min-h-[300px]"
              label="Drag & drop a file to compress (up to 500MB)"
            />
          ) : (
            <div className="bg-omni-bg/50 border border-omni-text/10 rounded-xl p-6 flex flex-col justify-center items-center text-center space-y-4 h-full relative overflow-hidden">
              <div className="w-16 h-16 bg-omni-primary/10 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-omni-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-omni-text text-lg truncate max-w-xs mx-auto">{file.name}</h3>
                <p className="text-omni-text/60">{formatSize(file.size)} - {file.type || 'Unknown Type'}</p>
              </div>

              {/* Options Toggle */}
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="flex items-center gap-2 text-sm text-omni-text/60 hover:text-omni-primary transition-colors"
              >
                <Settings2 className="w-4 h-4" />
                {showOptions ? 'Hide' : 'Show'} Options
              </button>

              {/* Options */}
              {showOptions && (
                <div className="w-full space-y-4 p-4 bg-omni-bg/50 rounded-lg border border-omni-text/5">
                  <div className="space-y-2">
                    <label className="text-sm text-omni-text/70">Format</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['gzip', 'deflate', 'zip'] as CompressionFormat[]).map(f => (
                        <button
                          key={f}
                          onClick={() => setFormat(f)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            format === f 
                              ? 'bg-omni-primary text-white' 
                              : 'bg-omni-text/5 text-omni-text/60 hover:bg-omni-text/10'
                          }`}
                        >
                          {f.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <label className="text-omni-text/70">Compression Level</label>
                      <span className="text-omni-primary font-mono">{level}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="9"
                      value={level}
                      onChange={(e) => setLevel(Number(e.target.value) as CompressionLevel)}
                      className="w-full accent-omni-primary"
                    />
                    <div className="flex justify-between text-xs text-omni-text/40">
                      <span>Fast (0)</span>
                      <span>Best (9)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              {isCompressing && (
                <div className="w-full space-y-2">
                  <div className="h-2 bg-omni-text/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-omni-primary transition-all" 
                      style={{ width: `${progress}%` }} 
                    />
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 text-omni-primary animate-spin" />
                    <span className="text-sm text-omni-text/60">{progress}% Complete</span>
                  </div>
                </div>
              )}
              
              {!result && !isCompressing && (
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={compressFile}
                    className="px-6 py-2 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-lg font-medium transition-colors shadow-lg shadow-omni-primary/20 flex items-center gap-2"
                  >
                    <Archive className="w-4 h-4" />
                    Compress ({format.toUpperCase()})
                  </button>
                  <button 
                    onClick={() => setFile(null)}
                    className="px-4 py-2 bg-omni-bg hover:bg-omni-text/10 text-omni-text/60 hover:text-omni-text rounded-lg transition-colors border border-omni-text/10"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results Column */}
        <div className="flex flex-col gap-6 justify-center">
          {result ? (
            <div className="bg-omni-bg/80 border border-omni-primary/30 rounded-xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-omni-primary/5 to-transparent pointer-events-none" />
              
              <div className="space-y-2 relative z-10">
                <h3 className="text-2xl font-bold text-omni-text">Compression Complete!</h3>
                <div className="flex justify-center items-center gap-4 text-sm">
                  <span className="text-omni-text/60 line-through">{formatSize(file?.size || 0)}</span>
                  <span className="text-omni-primary font-bold bg-omni-primary/10 px-2 py-1 rounded">
                    {formatSize(result.size)}
                  </span>
                </div>
                <p className="text-green-400 text-lg font-bold">
                  {compressionRatio}% smaller
                </p>
                <p className="text-green-400/60 text-sm">
                  Saved {formatSize((file?.size || 0) - result.size)}
                </p>
              </div>

              <button 
                onClick={handleDownload}
                className="w-full py-3 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 shadow-xl shadow-omni-primary/20 relative z-10"
              >
                <Download className="w-5 h-5" />
                Download {result.name}
              </button>
              
              <button 
                onClick={() => { setFile(null); setResult(null); setProgress(0); }}
                className="text-omni-text/40 hover:text-omni-text/80 text-sm underline decoration-dotted underline-offset-4 transition-colors relative z-10"
              >
                Compress another file
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center space-y-4 opacity-40 p-8 border-2 border-dashed border-omni-text/10 rounded-xl">
              <Archive className="w-12 h-12" />
              <div>
                <p className="font-medium">Compression results will appear here</p>
                <p className="text-sm text-omni-text/60">Supports files up to 500MB</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </ToolLayout>
  )
}
