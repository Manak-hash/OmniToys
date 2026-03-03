import { useState, useCallback } from 'react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { InputPane } from '@/components/tools/InputPane'
import { OutputPane } from '@/components/tools/OutputPane'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { FileImage, Shield, Download, Upload } from 'lucide-react'
import { toast } from 'sonner'

export default function MetadataStripperPage() {
  const [file, setFile] = useState<File | null>(null)
  const [originalUrl, setOriginalUrl] = useState('')
  const [cleanedUrl, setCleanedUrl] = useState('')
  const [fileName, setFileName] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const processFile = useCallback(async (selectedFile: File) => {
    setIsProcessing(true)
    setFile(selectedFile)
    setFileName(selectedFile.name)

    try {
      // Create canvas to strip metadata
      const img = new Image()
      const objectUrl = URL.createObjectURL(selectedFile)

      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight

        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Could not get canvas context')

        // Draw image without any metadata
        ctx.drawImage(img, 0, 0)

        // Convert to blob
        canvas.toBlob((blob) => {
          if (!blob) throw new Error('Could not create blob')

          const url = URL.createObjectURL(blob)
          setOriginalUrl(objectUrl)
          setCleanedUrl(url)
          setIsProcessing(false)

          // Revoke old URLs
          URL.revokeObjectURL(objectUrl)
        }, selectedFile.type || 'image/png')
      }

      img.onerror = () => {
        toast.error('Failed to load image')
        setIsProcessing(false)
      }

      img.src = objectUrl
    } catch (error) {
      console.error('Error processing image:', error)
      toast.error('Failed to process image')
      setIsProcessing(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      processFile(droppedFile)
    } else {
      toast.error('Please drop an image file')
    }
  }, [processFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      processFile(selectedFile)
    }
  }, [processFile])

  const handleDownload = useCallback(() => {
    if (!cleanedUrl) return

    const a = document.createElement('a')
    a.href = cleanedUrl
    a.download = `cleaned_${fileName}`
    a.click()
    toast.success('Cleaned image downloaded!')
  }, [cleanedUrl, fileName])

  const handleReset = useCallback(() => {
    setFile(null)
    setOriginalUrl('')
    setCleanedUrl('')
    setFileName('')
    if (originalUrl) URL.revokeObjectURL(originalUrl)
    if (cleanedUrl) URL.revokeObjectURL(cleanedUrl)
  }, [originalUrl, cleanedUrl])

  return (
    <ToolLayout
      title="Metadata Stripper"
      description="Remove EXIF metadata from images for privacy"
      icon={<Shield className="w-8 h-8" />}
      actions={<ActionToolbar onReset={handleReset} />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-[500px]">
        {/* Input Panel */}
        <InputPane title="Upload Image">
          <div className="flex flex-col h-full p-6">
            {/* Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className={`flex-1 min-h-[200px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-4 transition-colors cursor-pointer ${
                isProcessing
                  ? 'border-omni-text/20 bg-omni-text/5 cursor-wait'
                  : 'border-omni-text/20 hover:border-omni-primary/50 hover:bg-omni-primary/5'
              }`}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-omni-primary"></div>
                  <p className="text-sm text-omni-text/50">Processing...</p>
                </>
              ) : file ? (
                <>
                  <FileImage className="w-16 h-16 text-omni-primary" />
                  <div className="text-center">
                    <p className="font-bold text-omni-text">{fileName}</p>
                    <p className="text-xs text-omni-text/50 mt-1">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Upload className="w-16 h-16 text-omni-text/30" />
                  <div className="text-center">
                    <p className="font-bold text-omni-text">Drop image here</p>
                    <p className="text-xs text-omni-text/50 mt-1">or click to browse</p>
                  </div>
                </>
              )}
              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Info */}
            <div className="mt-6 p-4 bg-omni-text/5 rounded-xl space-y-2 text-xs text-omni-text/60">
              <p className="font-bold text-omni-text/50">Removes:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>GPS location data</li>
                <li>Camera model & settings</li>
                <li>Date/time stamps</li>
                <li>Software information</li>
                <li>Thumbnail previews</li>
                <li>Comments & author info</li>
              </ul>
            </div>
          </div>
        </InputPane>

        {/* Output Panel */}
        <OutputPane title="Result">
          <div className="flex flex-col h-full p-6">
            {cleanedUrl ? (
              <div className="flex-1 flex flex-col gap-6">
                {/* Original vs Cleaned */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-omni-text/50 uppercase tracking-wider mb-2">Original</p>
                    <img
                      src={originalUrl}
                      alt="Original"
                      className="w-full rounded-lg border border-omni-text/10"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-omni-primary uppercase tracking-wider mb-2">Cleaned</p>
                    <img
                      src={cleanedUrl}
                      alt="Cleaned"
                      className="w-full rounded-lg border border-omni-primary/30"
                    />
                  </div>
                </div>

                {/* Download Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleDownload}
                    className="py-3 px-8 bg-omni-primary hover:bg-omni-primary-hover text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-omni-primary/20 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Download Cleaned Image
                  </button>
                </div>

                {/* Success Message */}
                <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-sm text-green-400">
                    ✓ All metadata removed successfully!
                  </p>
                  <p className="text-xs text-omni-text/50 mt-1">
                    Your privacy is protected - no location, camera, or timestamp data remains
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-omni-text/30">
                <div className="text-center">
                  <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Upload an image to strip metadata</p>
                </div>
              </div>
            )}
          </div>
        </OutputPane>
      </div>
    </ToolLayout>
  )
}
