import { useState } from 'react'
import { Sparkles, Camera, Search, Loader2 } from 'lucide-react'
import EventSelector from './components/EventSelector'
import SelfieDropzone from './components/SelfieDropzone'
import { searchMatchingPhotos } from './services/api'

function App() {
  const [selectedEventId, setSelectedEventId] = useState('')
  const [selfieFile, setSelfieFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [results, setResults] = useState(null)

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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-start py-12 px-4 selection:bg-indigo-500/30">
      <div className="max-w-lg w-full space-y-8">
        
        {/* Header / Brand */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI-Powered Event Retrieval</span>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-3xl font-semibold tracking-tight text-white flex items-center justify-center gap-2.5">
              <Camera className="w-7 h-7 text-indigo-400 stroke-[1.75]" />
              SpotMe.Ai
            </h1>
            <p className="text-sm text-zinc-400">
              Select your event, upload a selfie, and find all your photos instantly.
            </p>
          </div>
        </header>

        {/* Search Card Form */}
        <form
          onSubmit={handleSearch}
          className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm space-y-6 shadow-xl shadow-black/40"
        >
          {/* 1. Event Selector */}
          <EventSelector
            selectedEventId={selectedEventId}
            onSelectEvent={setSelectedEventId}
          />

          {/* 2. Selfie Dropzone */}
          <SelfieDropzone
            selectedFile={selfieFile}
            onFileSelect={setSelfieFile}
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

        {/* Quick Debug Result Preview (Temporary, Chapter 5 replaces this with Gallery!) */}
        {results && (
          <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-400 text-left">
            Found {results.match_summary.total_matches} matching photos! Gallery coming next.
          </div>
        )}

      </div>
    </div>
  )
}

export default App
