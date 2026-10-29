import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Loader2, ArrowRight, FolderHeart, Lock, Sparkles, HelpCircle, ShieldCheck } from 'lucide-react'
import EventSelector from '../components/EventSelector'
import SelfieDropzone from '../components/SelfieDropzone'
import { fetchAvailableEvents, searchMatchingPhotos } from '../services/api'

export default function Home() {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [selfieFile, setSelfieFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await fetchAvailableEvents()
        setEvents(data)
        if (data.length > 0) {
          setSelectedEventId(data[0].id)
        }
      } catch (err) {
        console.error('Failed to load events:', err)
      }
    }
    loadEvents()
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!selectedEventId) {
      setError('Please select an event.')
      return
    }
    if (!selfieFile) {
      setError('Please provide a selfie.')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await searchMatchingPhotos(selectedEventId, selfieFile)
      // Navigate to dedicated results page with the data!
      navigate(`/events/${selectedEventId}/results`, {
        state: { results: data, eventName: events.find((e) => e.id === selectedEventId)?.name },
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-10 text-left">
      
      {/* 1. Hero Section */}
      <section className="space-y-3 pt-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-medium text-zinc-600">
          <Sparkles className="w-3.5 h-3.5 text-zinc-700" />
          <span>IIT Patna Photo Retrieval</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-950">
          Your campus moments, <br className="hidden sm:inline" />all in one place.
        </h1>
        <p className="text-sm sm:text-base text-zinc-500 max-w-xl leading-relaxed">
          Search thousands of festival, sports, and cultural photographs with a single selfie. Instant, private, and high-resolution.
        </p>
      </section>

      {/* 2. Quick Search Console (Vercel Style Card) */}
      <section className="p-5 sm:p-7 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-4">
        <div className="border-b border-zinc-100 pb-3">
          <h2 className="text-sm font-semibold text-zinc-900">Instant Photo Finder</h2>
          <p className="text-xs text-zinc-500">Pick an event and take or upload a selfie to locate your pictures</p>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EventSelector
              selectedEventId={selectedEventId}
              onSelectEvent={setSelectedEventId}
            />
            <SelfieDropzone
              selectedFile={selfieFile}
              onFileSelect={setSelfieFile}
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
            <span className="text-xs text-zinc-500">
              Zero storage • Selfies analyzed in-memory only
            </span>

            <button
              type="submit"
              disabled={loading || !selectedEventId || !selfieFile}
              className="py-2.5 px-6 rounded-lg font-medium text-xs text-white bg-black hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Matching Faces...</span>
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
      </section>

      {/* 3. Featured Campus Events Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-zinc-900">Recent Campus Events</h2>
            <p className="text-xs text-zinc-500">Select an event album to search or share its dedicated link</p>
          </div>
          <Link
            to="/events"
            className="text-xs font-medium text-zinc-900 hover:text-black flex items-center gap-1 hover:underline"
          >
            <span>View all events</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="p-8 rounded-xl bg-white border border-zinc-200 text-center text-xs text-zinc-500">
            No events indexed yet. Create one via the Organizer Console.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.slice(0, 6).map((evt) => (
              <Link
                key={evt.id}
                to={`/events/${evt.id}`}
                className="group p-4 rounded-xl bg-white border border-zinc-200 hover:border-zinc-300 transition-all shadow-xs hover:shadow-md flex flex-col justify-between space-y-3 cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Live Album
                    </span>
                    <span>{evt.photo_count ? `${evt.photo_count} photos` : 'Indexed'}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-900 group-hover:text-black line-clamp-1">
                    {evt.name}
                  </h3>
                </div>

                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs font-medium text-zinc-700 group-hover:text-black">
                  <span>Open Event Portal</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 text-zinc-400 group-hover:text-zinc-800" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 4. How It Works & Privacy Info */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="p-5 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 font-semibold text-xs sm:text-sm text-zinc-900">
            <HelpCircle className="w-4 h-4 text-zinc-500" />
            <span>How It Works</span>
          </div>
          <ol className="space-y-1.5 text-xs text-zinc-600 list-decimal list-inside leading-relaxed">
            <li><strong className="text-zinc-800">Pick an event:</strong> Choose Anwesha, Celesta, or any sports fest.</li>
            <li><strong className="text-zinc-800">Provide a selfie:</strong> Take a photo with your camera or upload one.</li>
            <li><strong className="text-zinc-800">Download high-res:</strong> Inspect matches in our carousel and download originals.</li>
          </ol>
        </div>

        <div className="p-5 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 font-semibold text-xs sm:text-sm text-zinc-900">
            <Lock className="w-4 h-4 text-zinc-500" />
            <span>Privacy Guarantee</span>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Your privacy is our highest priority. Uploaded selfies are converted into temporary mathematical vectors in RAM and are immediately discarded. We never store student selfies on any disk.
          </p>
        </div>
      </section>

    </div>
  )
}
