import { useState, useRef, useEffect } from 'react'
import { X, Camera, RefreshCw, AlertCircle } from 'lucide-react'

export default function CameraModal({ isOpen, onClose, onCapture }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [facingMode, setFacingMode] = useState('user') // 'user' (selfie) or 'environment' (back)
  const [error, setError] = useState(null)
  const [isStarting, setIsStarting] = useState(true)

  // Start the camera stream
  const startCamera = async (mode) => {
    setIsStarting(true)
    setError(null)

    // Stop existing stream if switching cameras
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.')
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
        audio: false,
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error('Camera error:', err)
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera permission denied. Please allow camera access in your browser settings.')
      } else if (err.name === 'NotFoundError') {
        setError('No camera device found on this computer/phone.')
      } else {
        setError(err.message || 'Unable to access camera.')
      }
    } finally {
      setIsStarting(false)
    }
  }

  // Trigger camera on open
  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode)
    } else {
      // Clean up when modal closes
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [isOpen, facingMode])

  // Flip front / back camera (primarily for mobile phones)
  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))
  }

  // Snap the photo from the video frame
  const handleSnap = () => {
    if (!videoRef.current) return

    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')

    // If using front camera, mirror the canvas image horizontally so it matches preview
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert canvas to image Blob -> File
    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const file = new File([blob], `selfie_${Date.now()}.jpg`, { type: 'image/jpeg' })
        
        // Stop stream and close modal
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
        }
        onCapture(file)
        onClose()
      },
      'image/jpeg',
      0.95
    )
  }

  if (!isOpen) return null

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col space-y-4 p-5 text-left"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-medium text-sm">
            <Camera className="w-4 h-4 text-zinc-300" />
            <span>Take Selfie</span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Flip camera button */}
            <button
              type="button"
              onClick={toggleCamera}
              title="Flip Camera"
              className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Camera Viewfinder Box */}
        <div className="relative aspect-[4/3] w-full bg-black rounded-2xl overflow-hidden border border-zinc-800 flex items-center justify-center">
          {error ? (
            <div className="p-6 text-center space-y-2 text-red-400">
              <AlertCircle className="w-8 h-8 mx-auto text-red-400" />
              <p className="text-xs">{error}</p>
            </div>
          ) : (
            <>
              {/* Live Video Element */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${
                  facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
              />

              {/* Face Outline Guide */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-44 h-56 rounded-[50%] border-2 border-dashed border-white/40 shadow-inner flex items-center justify-center">
                  <span className="text-[10px] text-white/70 bg-black/40 backdrop-blur-sm px-2.5 py-0.5 rounded-full">
                    Center face here
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Shutter Button Action */}
        {!error && (
          <div className="flex items-center justify-center pt-2">
            <button
              type="button"
              onClick={handleSnap}
              disabled={isStarting}
              title="Capture Photo"
              className="relative w-16 h-16 rounded-full border-4 border-zinc-600 bg-zinc-950 flex items-center justify-center cursor-pointer shadow-md active:scale-95 transition-all group"
            >
              <div className="w-11 h-11 rounded-full bg-white group-hover:bg-zinc-200 transition-colors" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
