import { useState, useEffect } from 'react'
import { Download, X, ChevronDown, ChevronLeft, ChevronRight, ImageOff } from 'lucide-react'

function GalleryCard({ photo, onSelect }) {
  const [errorCount, setErrorCount] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  const getImageUrl = () => {
    const fileId = photo.photo_id
    if (!fileId) return photo.drive_url

    if (errorCount === 0) {
      return `https://lh3.googleusercontent.com/d/${fileId}=w800`
    } else if (errorCount === 1) {
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`
    } else if (errorCount === 2) {
      return `https://drive.google.com/uc?export=view&id=${fileId}`
    }
    return null
  }

  const currentSrc = getImageUrl()

  return (
    <div
      onClick={onSelect}
      className="group relative aspect-square rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 cursor-pointer transition-all duration-200 hover:border-zinc-300 hover:shadow-md"
    >
      {!isLoaded && currentSrc && (
        <div className="absolute inset-0 bg-zinc-100 animate-pulse" />
      )}

      {currentSrc ? (
        <img
          src={currentSrc}
          alt="Event Match"
          referrerPolicy="no-referrer"
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => setErrorCount((prev) => prev + 1)}
          className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-[1.03] ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-zinc-50 text-zinc-500 space-y-1.5">
          <ImageOff className="w-4 h-4 text-zinc-400" />
          <p className="text-[11px] text-zinc-500">Preview protected</p>
          <a
            href={photo.download_url}
            download
            onClick={(e) => e.stopPropagation()}
            className="text-[11px] text-zinc-900 underline font-medium"
          >
            Download
          </a>
        </div>
      )}

      {/* Subtle overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex flex-col justify-between p-3 pointer-events-none">
        <div className="self-end pointer-events-auto">
          <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-white border border-white/20">
            {photo.match_confidence ? `${photo.match_confidence}%` : 'Match'}
          </span>
        </div>

        <div className="flex items-center justify-between text-white pointer-events-auto">
          <span className="text-[11px] font-medium text-zinc-200">
            Inspect
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
  const [selectedIndex, setSelectedIndex] = useState(null)

  const visiblePhotos = matches.slice(0, visibleCount)
  const hasMore = visibleCount < matches.length

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + PAGE_SIZE)
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedIndex === null) return

      if (e.key === 'ArrowRight') {
        setSelectedIndex((prev) => (prev < matches.length - 1 ? prev + 1 : 0))
      } else if (e.key === 'ArrowLeft') {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : matches.length - 1))
      } else if (e.key === 'Escape') {
        setSelectedIndex(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedIndex, matches.length])

  const handleDownloadAll = () => {
    matches.forEach((photo) => {
      window.open(photo.download_url, '_blank')
    })
  }

  if (matches.length === 0) {
    return (
      <div className="p-8 rounded-xl bg-white border border-zinc-200 text-center space-y-1.5 shadow-xs">
        <p className="text-xs sm:text-sm font-semibold text-zinc-900">No matching photographs</p>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
          The face in the selfie was not detected in this event. Ensure front lighting and high clarity.
        </p>
      </div>
    )
  }

  const activePhoto = selectedIndex !== null ? matches[selectedIndex] : null

  return (
    <section className="space-y-4 text-left">
      {/* Results Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
        <div>
          <h2 className="text-xs sm:text-sm font-semibold text-zinc-900 tracking-tight flex items-center gap-2">
            <span>Verified Results</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
              {totalMatches} photos
            </span>
          </h2>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Displaying {visiblePhotos.length} of {totalMatches}
          </p>
        </div>

        {matches.length > 1 && (
          <button
            type="button"
            onClick={handleDownloadAll}
            className="text-xs font-medium text-zinc-900 hover:text-black px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-50 border border-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-zinc-500" />
            <span>Open All ({matches.length})</span>
          </button>
        )}
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {visiblePhotos.map((photo, index) => (
          <GalleryCard
            key={photo.photo_id || index}
            photo={photo}
            onSelect={() => setSelectedIndex(index)}
          />
        ))}
      </div>

      {/* "Load More" Button */}
      {hasMore && (
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={handleLoadMore}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-white border border-zinc-200 text-zinc-800 hover:bg-zinc-50 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
            <span>Load More ({matches.length - visibleCount} remaining)</span>
          </button>
        </div>
      )}

      {/* Lightbox Modal Carousel */}
      {activePhoto && (
        <div
          onClick={() => setSelectedIndex(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 transition-all duration-150"
        >
          {matches.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : matches.length - 1))
              }}
              title="Previous photo (←)"
              className="absolute left-3 sm:left-6 z-10 w-9 h-9 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-200 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {matches.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedIndex((prev) => (prev < matches.length - 1 ? prev + 1 : 0))
              }}
              title="Next photo (→)"
              className="absolute right-3 sm:right-6 z-10 w-9 h-9 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-200 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full max-h-[88vh] bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="p-3.5 border-b border-zinc-800 flex items-center justify-between text-zinc-200">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium text-zinc-400">
                  {selectedIndex + 1} of {matches.length}
                </span>
                <span className="text-zinc-700">•</span>
                <span className="font-semibold text-white px-2 py-0.5 rounded-md bg-zinc-950 border border-zinc-800">
                  {activePhoto.match_confidence ? `${activePhoto.match_confidence}% Match` : 'Verified Face'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={activePhoto.download_url}
                  download
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-zinc-950 text-xs font-semibold hover:bg-zinc-100 transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download High-Res</span>
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedIndex(null)}
                  className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-black flex items-center justify-center p-3 min-h-[50vh]">
              <img
                src={`https://lh3.googleusercontent.com/d/${activePhoto.photo_id}=w1200`}
                alt="Enlarged Match"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = activePhoto.download_url
                }}
                className="max-h-[72vh] w-auto object-contain rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
