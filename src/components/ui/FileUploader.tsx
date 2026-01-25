import { useCallback, useState } from 'react'
import { Upload, X, File as FileIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils/cn'

interface FileUploaderProps {
  onFileSelect: (file: File) => void
  accept?: string
  maxSizeMB?: number
  className?: string
  label?: string
}

export function FileUploader({ 
  onFileSelect, 
  accept, 
  maxSizeMB = 5, 
  className,
  label = "Drag & drop an image here, or click to select"
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true)
    } else if (e.type === 'dragleave') {
      setIsDragging(false)
    }
  }, [])

  const validateAndUpload = (file: File) => {
    setError(null)
    
    // Check type if accept is provided (simple check)
    if (accept && !file.type.match(accept.replace('*', '.*'))) {
        setError(`File type not accepted. Expected ${accept}`)
        return
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File is too large. Max size is ${maxSizeMB}MB`)
        return
    }

    onFileSelect(file)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndUpload(e.dataTransfer.files[0])
    }
  }, [maxSizeMB, accept])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      validateAndUpload(e.target.files[0])
    }
  }

  return (
    <div className={cn("w-full", className)}>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer group",
          isDragging 
            ? "border-omni-primary bg-omni-primary/5" 
            : "border-omni-text/10 bg-omni-bg/30 hover:border-omni-primary/30 hover:bg-omni-bg/50",
          error ? "border-red-500/50 bg-red-500/5" : ""
        )}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleChange}
          accept={accept}
        />
        
        <div className="flex flex-col items-center space-y-3 text-center p-4">
          <div className={cn(
              "p-4 rounded-full transition-colors duration-200",
              isDragging ? "bg-omni-primary/20 text-omni-primary" : "bg-omni-text/5 text-omni-text/40 group-hover:bg-omni-primary/10 group-hover:text-omni-primary"
          )}>
            <Upload className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-omni-text/80">
              {label}
            </p>
            <p className="text-xs text-omni-text/40">
              {accept ? `Supports ${accept.split(',').join(', ')}` : 'All files accepted'} up to {maxSizeMB}MB
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 flex items-center gap-2 text-sm text-red-400 bg-red-500/10 p-2 rounded-lg"
          >
            <X className="w-4 h-4" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
