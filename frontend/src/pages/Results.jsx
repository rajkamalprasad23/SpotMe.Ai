import { useLocation, useParams, Link } from 'react-router-dom'
import { ArrowLeft, RefreshCw, Sparkles } from 'lucide-react'
import PhotoGallery from '../components/PhotoGallery'

export default function Results() {
  const { eventId } = useParams()
  const location = useLocation()
  
  const results = location.state?.results
  const eventName = location.state?.eventName || 'Event'

  if (!results) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
        <p className="text-base font-semibold text-zinc-900">No Active Search Session</p>
        <p className="text-xs text-zinc-500 leading-relaxed">
          Results are cleared on page reload to protect your privacy. Please select your event and provide your selfie again.
        </p>
        <Link
          to={`/events/${eventId}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-black text-white text-xs font-medium hover:bg-zinc-800 transition-colors shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Upload Selfie Again</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6 text-left">
      
      {/* Top Navigation Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-200 pb-4">
        <div className="space-y-1">
          <Link
            to={`/events/${eventId}`}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to {eventName}</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 flex items-center gap-2">
            <span>Verified Photographs</span>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200">
              {results.match_summary?.total_matches || 0} Matches
            </span>
          </h1>
        </div>

        <Link
          to={`/events/${eventId}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 shadow-xs transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-zinc-500" />
          <span>Try Another Selfie</span>
        </Link>
      </div>

      {/* Main Results Gallery with Lightbox & Download Actions */}
      <PhotoGallery
        matches={results.matches || []}
        totalMatches={results.match_summary?.total_matches || 0}
      />

    </div>
  )
}
