import { useState } from 'react'
import { FileImage, Download, Image as ImageIcon, X } from 'lucide-react'
import { ToolLayout } from '@/components/tools/ToolLayout'
import { FileUploader } from '@/components/ui/FileUploader'
import { ActionToolbar } from '@/components/tools/ActionToolbar'
import { convertImage, type ImageFormat, type ConversionOptions, getExtension, formatBytes } from '@/utils/imageConverter'
import { toast } from 'sonner'
import jsFileDownload from 'js-file-download'

interface ConvertedImage {
  originalFile: File
  convertedBlob: Blob
  originalSize: number
  convertedSize: number
  savings: string
  preview?: string
}

export default function ImageConverterPage() {
  const [file, setFile] = useState<File | null>(null)
  const [convertedData, setConvertedData] = useState<ConvertedImage | null>(null)
  const [format, setFormat] = useState<ImageFormat>('image/webp')
  const [quality, setQuality] = useState(80)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileSelected = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }
    setFile(selectedFile)
    setConvertedData(null)
  }

  const handleConvert = async () => {
    if (!file) {
      toast.error('Please select an image first')
      return
    }

    setIsProcessing(true)

    const options: ConversionOptions = {
      format,
      quality,
    }

    try {
      const result = await convertImage(file, options)

      if (result.success && result.result) {
        const preview = URL.createObjectURL(result.result)
        setConvertedData({
          originalFile: file,
          convertedBlob: result.result,
          originalSize: result.originalSize || 0,
          convertedSize: result.convertedSize || 0,
          savings: result.savings || '0',
          preview,
        })
        toast.success('Image converted successfully!')
      } else {
        toast.error(result.error || 'Conversion failed')
      }
    } catch {
      toast.error('Conversion failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!convertedData) return

    const ext = getExtension(format)
    const originalName = convertedData.originalFile.name.replace(/\.[^.]+$/, '')
    jsFileDownload(convertedData.convertedBlob, `${originalName}.${ext}`)
    toast.success(`Downloaded ${originalName}.${ext}`)
  }

  const handleClear = () => {
    setFile(null)
    setConvertedData(null)
  }

  const currentPreview = convertedData?.preview || (file ? URL.createObjectURL(file) : null)

  return (
    <ToolLayout
      title="Image Converter"
      description="Convert images between PNG, JPEG, WebP, and AVIF formats"
      icon={<FileImage className="w-5 h-5" />}
    >
      <div className="space-y-6">
        {/* Upload Section */}
        {!file && (
          <FileUploader
            onFileSelect={handleFileSelected}
            accept="image/*"
          />
        )}

        {/* Controls */}
        {file && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Controls */}
            <div className="lg:col-span-1 space-y-4">
              {/* Format & Quality Controls */}
              <div className="p-4 bg-omni-text/5 rounded-lg space-y-4">
                <h3 className="text-sm font-bold text-omni-text/80">Conversion Settings</h3>

                {/* Format Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-omni-text/60">Output Format</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['image/png', 'image/jpeg', 'image/webp', 'image/avif'] as ImageFormat[]).map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setFormat(fmt)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          format === fmt
                            ? 'bg-omni-primary text-white'
                            : 'bg-omni-text/10 text-omni-text hover:bg-omni-text/20'
                        }`}
                      >
                        {fmt.split('/')[1].toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quality Slider */}
                {format !== 'image/png' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-omni-text/60">Quality</label>
                      <span className="text-xs text-omni-primary font-bold">{quality}%</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={quality}
                      onChange={(e) => setQuality(parseInt(e.target.value))}
                      className="w-full h-2 bg-omni-text/10 rounded-lg appearance-none cursor-pointer accent-omni-primary"
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={handleConvert}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-omni-primary text-white hover:bg-omni-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    <ImageIcon className="w-4 h-4" />
                    {isProcessing ? 'Converting...' : `Convert to ${format.split('/')[1].toUpperCase()}`}
                  </button>
                  <button
                    onClick={handleClear}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-omni-text/10 text-omni-text hover:bg-omni-text/20 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Clear
                  </button>
                </div>
              </div>

              {/* File Info */}
              <div className="p-4 bg-omni-text/5 rounded-lg">
                <h3 className="text-sm font-bold text-omni-text/80 mb-2">
                  Original File
                </h3>
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-omni-text/40">{formatBytes(file.size)}</p>
              </div>
            </div>

            {/* Right Panel - Preview */}
            <div className="lg:col-span-2 space-y-4">
              {/* Preview */}
              <div className="p-4 bg-omni-text/5 rounded-lg">
                <h3 className="text-sm font-bold text-omni-text/80 mb-3">Preview</h3>
                <div className="bg-white rounded-lg p-4 flex items-center justify-center min-h-[300px]">
                  {currentPreview && (
                    <img
                      src={currentPreview}
                      alt={file.name}
                      className="max-w-full max-h-[400px] object-contain"
                    />
                  )}
                </div>
              </div>

              {/* Stats */}
              {convertedData && (
                <div className="grid grid-cols-3 gap-4 p-4 bg-omni-text/5 rounded-lg">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-omni-primary">
                      {formatBytes(convertedData.originalSize)}
                    </p>
                    <p className="text-xs text-omni-text/60">Original</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-omni-primary">
                      {formatBytes(convertedData.convertedSize)}
                    </p>
                    <p className="text-xs text-omni-text/60">Converted</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">
                      -{convertedData.savings}%
                    </p>
                    <p className="text-xs text-omni-text/60">Saved</p>
                  </div>
                </div>
              )}

              {/* Download Actions */}
              {convertedData && (
                <ActionToolbar>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-omni-primary text-white hover:bg-omni-primary/90 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Converted Image
                  </button>
                </ActionToolbar>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
