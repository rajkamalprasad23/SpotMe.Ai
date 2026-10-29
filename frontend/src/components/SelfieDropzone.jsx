import { useState, useRef } from 'react'
import { UploadCloud, Camera, X } from 'lucide-react'
import CameraModal from './CameraModal'

export default function SelfieDropzone({ selectedFile, onFileSelect }) {
  const [isDragging, setIsDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const fileInputRef = useRef(null)

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, or WebP).')
      return
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    onFileSelect(file)
  }

  const handleRemove = (e) => {
    e.stopPropagation()
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    onFileSelect(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  return (
    <div className="w-full space-y-1.5 text-left">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block">
          Selfie Reference
        </label>
        {selectedFile && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-xs text-zinc-500 hover:text-zinc-800 transition-colors flex items-center gap-1 cursor-pointer font-medium"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0])
          }
        }}
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative w-full rounded-xl border transition-all duration-150 overflow-hidden ${
          selectedFile
            ? 'border-zinc-200 bg-zinc-50/50'
            : isDragging
            ? 'border-zinc-400 bg-zinc-100'
            : 'border-dashed border-zinc-200 bg-white hover:bg-zinc-50/60 hover:border-zinc-300'
        }`}
      >
        {previewUrl ? (
          <div className="p-3.5 flex items-center gap-3.5">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200 flex-shrink-0 shadow-xs">
              <img
                src={previewUrl}
                alt="Selfie Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs sm:text-sm font-semibold text-zinc-900 truncate">
                {selectedFile?.name}
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                {(selectedFile?.size / 1024).toFixed(1)} KB • Reference loaded
              </p>
              <div className="mt-2 flex items-center gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="text-zinc-900 hover:text-black font-medium transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-zinc-600" />
                  Retake
                </button>
                <span className="text-zinc-300">•</span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer"
                >
                  Replace file
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 px-4 flex flex-col items-center justify-center text-center space-y-3">
            <div className="space-y-0.5">
              <p className="text-xs sm:text-sm font-medium text-zinc-800">
                Provide a face photo
              </p>
              <p className="text-[11px] text-zinc-500">
                Front angle with clear lighting
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-200 hover:border-zinc-300 transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <Camera className="w-3.5 h-3.5 text-zinc-600" />
                <span>Open Camera</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-zinc-50 text-zinc-600 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-300 transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <UploadCloud className="w-3.5 h-3.5 text-zinc-500" />
                <span>Browse File</span>
              </button>
            </div>

            <p className="text-[10px] text-zinc-400">
              or drop image file here
            </p>
          </div>
        )}
      </div>

      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleFile}
      />
    </div>
  )
}
