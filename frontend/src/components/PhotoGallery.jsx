import { useState } from 'react'
import { Download, X, ChevronDown, Sparkles, ImageOff } from 'lucide-react'

// Sub-component for individual photo cards to handle local image loading & fallbacks
function GalleryCard({ photo, onSelect }) {
  const [errorCount, setErrorCount] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  // Triple-layer Google Drive CDN fallback chain
  const getImageUrl = () => {
    const fileId = photo.photo_id
    if (!fileId) return photo.drive_url

    if (errorCount === 0) {
      // Primary: High-speed Google UserContent CDN (bypasses drive.google.com cookies/sessions)
      return `https://lh3.googleusercontent.com/d/${fileId}=w800`
    } else if (errorCount === 1) {
      // Secondary fallback: Drive Thumbnail endpoint
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`
    } else if (errorCount === 2) {
      // Tertiary fallback: Direct export view
      return `https://drive.google.com/uc?export=view&id=${fileId}`
    }
    return null
  }

  const currentSrc = getImageUrl()

  return (
    <div
      onClick={() => onSelect(photo)}
      className="group relative aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800/80 cursor-pointer transition-all duration-300 hover:border-zinc-700 hover:shadow-lg hover:shadow-black/50"
    >
      {/* Loading Shimmer Placeholder */}
      {!isLoaded && !currentSrc && (
        <div className="absolute inset-0 bg-zinc-900 animate-pulse flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-zinc-700" />
        </div>
      )}

      {currentSrc ? (
        <img
          src={currentSrc}
          alt="Event Match"
          referrerPolicy="no-referrer"
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            // Attempt next fallback in chain
            setErrorCount((prev) => prev + 1)
          }}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ) : (
        /* Final fallback if Google blocks all previews: show download card */
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-zinc-900/90 text-zinc-400 space-y-2">
          <ImageOff className="w-5 h-5 text-zinc-600" />
          <p className="text-[11px] text-zinc-400">Preview protected by Drive</p>
          <a
            href={photo.download_url}
            download
            onClick={(e) => e.stopPropagation()}
            className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1 font-medium"
          >
            <Download className="w-3 h-3" /> Download photo
          </a>
        </div>
      )}

      {/* Subtle Gradient Overlay on Hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3 pointer-events-none">
        {/* Match Badge */}
        <div className="self-end pointer-events-auto">
          <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
            {photo.match_confidence ? `${photo.match_confidence}%` : 'Match'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between text-white pointer-events-auto">
          <span className="text-xs font-medium text-zinc-200 truncate">
            View Full
          </span>
          <a
            href={photo.download_url}
            download
            onClick={(e) => e.stopPropagation()}
            title="Download Original"
            className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition-colors text-white"
          >
            <Download className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  )
}

export default function PhotoGallery({ matches = [], totalMatches = 0 }) {
  const INITIAL_COUNT = 12
  const PAGE_SIZE = 12
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT)
  const [selectedPhoto, setSelectedPhoto] = useState(null)

  // Empty state
  if (matches.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-zinc-800/80 mx-auto flex items-center justify-center text-zinc-400">
          <Sparkles className="w-5 h-5 text-zinc-500" />
        </div>
        <p className="text-sm font-medium text-zinc-300">No matching photos found</p>
        <p className="text-xs text-zinc-500 max-w-xs mx-auto">
          We couldn't detect your face in this event. Try uploading another selfie with direct lighting and a clear front angle.
        </p>
      </div>
    )
  }

  const visiblePhotos = matches.slice(0, visibleCount)
  const hasMore = visibleCount < matches.length

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + PAGE_SIZE)
  }

  return (
    <section className="space-y-6 pt-4 text-left">
      {/* Results Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div>
          <h2 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
            <span>Your Matches</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {totalMatches} found
            </span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Showing {visiblePhotos.length} of {totalMatches} photos
          </p>
        </div>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
        {visiblePhotos.map((photo, index) => (
          <GalleryCard
            key={photo.photo_id || index}
            photo={photo}
            onSelect={setSelectedPhoto}
          />
        ))}
      </div>

      {/* "Load More" Button */}
      {hasMore && (
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={handleLoadMore}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 hover:bg-zinc-800/60 transition-all cursor-pointer active:scale-95 shadow-sm"
          >
            <ChevronDown className="w-4 h-4 text-indigo-400" />
            <span>Load More ({matches.length - visibleCount} remaining)</span>
          </button>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full max-h-[85vh] bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Modal Top Bar */}
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between text-zinc-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-zinc-400">Match Confidence:</span>
                <span className="text-xs font-semibold text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                  {selectedPhoto.match_confidence ? `${selectedPhoto.match_confidence}% Match` : 'Verified Face'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={selectedPhoto.download_url}
                  download
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Full Resolution</span>
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedPhoto(null)}
                  className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Image Display */}
            <div className="flex-1 overflow-auto bg-black flex items-center justify-center p-2">
              <img
                src={`https://lh3.googleusercontent.com/d/${selectedPhoto.photo_id}=w1200`}
                alt="Enlarged Match"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback to direct export view
                  e.currentTarget.src = selectedPhoto.download_url
                }}
                className="max-h-[70vh] w-auto object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
