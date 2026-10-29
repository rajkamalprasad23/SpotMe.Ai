import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Camera,
  Search,
  Loader2,
  ArrowLeft,
  Share2,
  Check,
  FolderHeart,
  Lock,
  Sparkles,
  HelpCircle
} from 'lucide-react'
import SelfieDropzone from '../components/SelfieDropzone'
import { fetchEventById, searchMatchingPhotos } from '../services/api'

export default function EventDetail() {
  const { eventId } = useParams()
  const navigate = useNavigate()

  const [event, setEvent] = useState(null)
  const [loadingEvent, setLoadingEvent] = useState(true)
  const [selfieFile, setSelfieFile] = useState(null)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        setLoadingEvent(true)
        const data = await fetchEventById(eventId)
        setEvent(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoadingEvent(false)
      }
    }
    load()
  }, [eventId])

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!selfieFile) {
      setError('Please provide a selfie to search.')
      return
    }

    try {
      setSearching(true)
      setError(null)
      const data = await searchMatchingPhotos(eventId, selfieFile)
      // Navigate to dedicated results page!
      navigate(`/events/${eventId}/results`, {
        state: { results: data, eventName: event?.name },
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setSearching(false)
    }
  }

  if (loadingEvent) {
    return (
      <div className="py-24 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
        <span>Loading event details...</span>
      </div>
    )
  }

  if (!event && error) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-3">
        <p className="text-sm font-semibold text-zinc-900">Event Not Found</p>
        <p className="text-xs text-zinc-500">{error}</p>
        <Link
          to="/events"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-black hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to all events</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8 text-left">
      
      {/* Back link */}
      <div>
        <Link
          to="/events"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Events Directory</span>
        </Link>
      </div>

      {/* Large Event Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-zinc-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Live Album
            </span>
            <span className="text-zinc-300">•</span>
            <span className="text-zinc-500">{event.photo_count ? `${event.photo_count} Photos Indexed` : 'Album Ready'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
            {event.name}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-lg leading-relaxed">
            Upload or snap your front-facing selfie below to retrieve every photo you appeared in during this event.
          </p>
        </div>

        {/* Share Button (Perfect for WhatsApp/Insta) */}
        <button
          type="button"
          onClick={handleShare}
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors cursor-pointer shadow-xs"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Link Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-zinc-600" />
              <span>Share Event Link</span>
            </>
          )}
        </button>
      </div>

      {/* Upload & Search Console */}
      <form onSubmit={handleSearch} className="p-6 sm:p-8 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-6">
        <div className="border-b border-zinc-100 pb-3">
          <h2 className="text-sm font-semibold text-zinc-900">Locate Your Moments</h2>
          <p className="text-xs text-zinc-500">Provide a reference selfie to match against this album</p>
        </div>

        <SelfieDropzone
          selectedFile={selfieFile}
          onFileSelect={setSelfieFile}
        />

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
          <span className="text-xs text-zinc-500">
            In-memory vector matching • Selfies are never saved
          </span>

          <button
            type="submit"
            disabled={searching || !selfieFile}
            className="py-2.5 px-6 rounded-lg font-medium text-xs text-white bg-black hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
          >
            {searching ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Searching Album...</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Find My Photos</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Privacy Note */}
      <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-500 flex items-start gap-2.5">
        <Lock className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-zinc-800 font-medium">Privacy Assurance:</strong> Your uploaded photo is processed transiently to extract facial landmark embeddings and is purged immediately from memory. We do not store or track personal photos.
        </p>
      </div>

    </div>
  )
}
