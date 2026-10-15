import { useState } from 'react'
import { Sparkles, Camera, Search, Loader2, ShieldCheck } from 'lucide-react'
import EventSelector from './components/EventSelector'
import SelfieDropzone from './components/SelfieDropzone'
import PhotoGallery from './components/PhotoGallery'
import AdminModal from './components/AdminModal'
import { searchMatchingPhotos } from './services/api'

function App() {
  const [selectedEventId, setSelectedEventId] = useState('')
  const [selfieFile, setSelfieFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [results, setResults] = useState(null)
  const [isAdminOpen, setIsAdminOpen] = useState(false)
  const [eventsRefreshKey, setEventsRefreshKey] = useState(0)

  // Trigger search on submit
  const handleSearch = async (e) => {
    e.preventDefault()
    if (!selectedEventId) {
      setError('Please select an event first.')
      return
    }
    if (!selfieFile) {
      setError('Please upload a selfie to search.')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await searchMatchingPhotos(selectedEventId, selfieFile)
      setResults(data)
    } catch (err) {
      setError(err.message)
      setResults(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-start py-8 px-4 selection:bg-indigo-500/30">
      
      {/* Top Navbar / Header Bar */}
      <div className="max-w-2xl w-full flex items-center justify-between pb-6">
        <div className="flex items-center gap-2 text-zinc-300 font-semibold tracking-tight text-sm">
          <Camera className="w-4 h-4 text-indigo-400 stroke-[2]" />
          <span>SpotMe.Ai</span>
        </div>

        {/* Organizer Portal Trigger Button */}
        <button
          type="button"
          onClick={() => setIsAdminOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer shadow-sm"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>Organizer Portal</span>
        </button>
      </div>

      <div className="max-w-2xl w-full space-y-8">
        
        {/* Hero Section */}
        <header className="text-center space-y-3 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 font-medium">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>AI Facial Recognition Retrieval</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
              Find your moments in seconds.
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
              Select your college event, upload a clear selfie, and let vector AI locate your pictures automatically.
            </p>
          </div>
        </header>

        {/* Search Card Form */}
        <form
          onSubmit={handleSearch}
          className="p-6 sm:p-7 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm space-y-6 shadow-xl shadow-black/40"
        >
          {/* 1. Event Selector */}
          <EventSelector
            selectedEventId={selectedEventId}
            onSelectEvent={(id) => {
              setSelectedEventId(id)
              setResults(null)
            }}
            refreshKey={eventsRefreshKey}
          />

          {/* 2. Selfie Dropzone */}
          <SelfieDropzone
            selectedFile={selfieFile}
            onFileSelect={(file) => {
              setSelfieFile(file)
              setResults(null)
            }}
          />

          {/* Error Message if any */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-900/50 text-red-400 text-xs text-left leading-relaxed">
              {error}
            </div>
          )}

          {/* 3. Submit Action Button */}
          <button
            type="submit"
            disabled={loading || !selectedEventId || !selfieFile}
            className="w-full py-3.5 px-4 rounded-xl font-medium text-sm text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20 active:scale-[0.99]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Scanning vector database...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Find My Photos
              </>
            )}
          </button>
        </form>

        {/* 4. Results Gallery Component */}
        {results && (
          <PhotoGallery
            matches={results.matches}
            totalMatches={results.match_summary?.total_matches || 0}
          />
        )}

      </div>

      {/* Admin / Organizer Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onEventCreated={() => setEventsRefreshKey((prev) => prev + 1)}
      />

      {/* Minimal Footer */}
      <footer className="mt-16 text-center text-xs text-zinc-600">
        <p>SpotMe.Ai • Built with FastAPI, pgvector & React</p>
      </footer>
    </div>
  )
}

export default App
