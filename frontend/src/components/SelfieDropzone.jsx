import { useState, useRef } from 'react'
import { UploadCloud, Image as ImageIcon, X, Sparkles } from 'lucide-react'

export default function SelfieDropzone({ selectedFile, onFileSelect }) {
  const [isDragging, setIsDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const fileInputRef = useRef(null)

  // 1. Handle file change (from file picker or drop)
  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, or WebP).')
      return
    }

    // Create an instant local URL for previewing in the browser
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    onFileSelect(file)
  }

  // 2. Clear current photo
  const handleRemove = (e) => {
    e.stopPropagation()
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl) // Clean up memory
    }
    setPreviewUrl(null)
    onFileSelect(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 3. Drag and Drop events
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
    <div className="w-full space-y-2 text-left">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider block">
          2. Upload Your Selfie
        </label>
        {selectedFile && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            Remove
          </button>
        )}
      </div>

      {/* Hidden native input */}
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

      {/* Interactive Dropzone / Preview Area */}
      <div
        onClick={() => !selectedFile && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative w-full rounded-2xl border transition-all duration-200 overflow-hidden cursor-pointer ${
          selectedFile
            ? 'border-zinc-800 bg-zinc-950/60 cursor-default'
            : isDragging
            ? 'border-indigo-500 bg-indigo-500/10'
            : 'border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 hover:bg-zinc-900/60'
        }`}
      >
        {previewUrl ? (
          /* Preview State */
          <div className="p-4 flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 flex-shrink-0 shadow-md">
              <img
                src={previewUrl}
                alt="Selfie Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-zinc-200 truncate">
                {selectedFile?.name}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {(selectedFile?.size / 1024).toFixed(1)} KB • Ready for matching
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium flex items-center gap-1 cursor-pointer"
              >
                Change photo
              </button>
            </div>
          </div>
        ) : (
          /* Empty / Upload Prompt State */
          <div className="py-8 px-4 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shadow-inner group-hover:scale-105 transition-transform">
              <UploadCloud className="w-5 h-5 text-indigo-400" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-zinc-200">
                Click to upload <span className="text-zinc-500 font-normal">or drag & drop</span>
              </p>
              <p className="text-xs text-zinc-500">
                Clear, front-facing selfie (JPG, PNG up to 10MB)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
