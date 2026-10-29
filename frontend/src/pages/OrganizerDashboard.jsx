import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Shield,
  Plus,
  RefreshCw,
  LogOut,
  FolderHeart,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  Image as ImageIcon
} from 'lucide-react'
import {
  verifyAdminSession,
  clearAdminToken,
  fetchAdminAllEvents,
  createAdminEvent
} from '../services/api'

export default function OrganizerDashboard() {
  const navigate = useNavigate()

  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  // Creation form state
  const [isCreating, setIsCreating] = useState(false)
  const [eventName, setEventName] = useState('')
  const [folderUrl, setFolderUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)
  const [formSuccess, setFormSuccess] = useState(null)

  // Copy link feedback
  const [copiedId, setCopiedId] = useState(null)

  // Filter / Search
  const [searchQuery, setSearchQuery] = useState('')

  // 1. Verify Authentication Session
  useEffect(() => {
    async function checkAuth() {
      const isAuthed = await verifyAdminSession()
      if (!isAuthed) {
        clearAdminToken()
        navigate('/organizer/login')
      }
    }
    checkAuth()
  }, [navigate])

  // 2. Load Events Function
  const loadEvents = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setRefreshing(true)
      const data = await fetchAdminAllEvents()
      setEvents(data)
      setError(null)
    } catch (err) {
      if (err.message.includes('Session expired') || err.message.includes('not authenticated')) {
        clearAdminToken()
        navigate('/organizer/login')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [navigate])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  // 3. Auto-poll if any event is in "processing" status
  useEffect(() => {
    const hasProcessing = events.some((e) => e.status === 'processing')
    if (!hasProcessing) return

    const timer = setInterval(() => {
      loadEvents(true)
    }, 5000)

    return () => clearInterval(timer)
  }, [events, loadEvents])

  // Handle Logout
  const handleLogout = () => {
    clearAdminToken()
    navigate('/organizer/login')
  }

  // Handle Create Event
  const handleCreate = async (e) => {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)

    if (!eventName.trim()) {
      setFormError('Please enter an event name.')
      return
    }
    if (!folderUrl.trim() || !folderUrl.includes('drive.google.com')) {
      setFormError('Please provide a valid Google Drive folder URL.')
      return
    }

    try {
      setSubmitting(true)
      const res = await createAdminEvent(eventName.trim(), folderUrl.trim())
      setFormSuccess(res.message || 'Event created! Processing queued.')
      setEventName('')
      setFolderUrl('')
      setIsCreating(false)
      // Reload events immediately
      await loadEvents(true)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopyLink = (eventId) => {
    const url = `${window.location.origin}/events/${eventId}`
    navigator.clipboard.writeText(url)
    setCopiedId(eventId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Computed metrics
  const totalEvents = events.length
  const readyEvents = events.filter((e) => e.status === 'ready').length
  const processingEvents = events.filter((e) => e.status === 'processing').length
  const totalPhotos = events.reduce((sum, e) => sum + (e.photo_count || 0), 0)

  // Filtered list
  const filteredEvents = events.filter((e) =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8 text-left">
      
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950">
              Organizer Workspace
            </h1>
          </div>
          <p className="text-xs text-zinc-500">
            Manage campus albums, monitor ingestion, and distribute public retrieval links
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadEvents(false)}
            disabled={refreshing}
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Refresh event list"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-zinc-500 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-black hover:bg-zinc-800 text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Event</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-red-50 border border-zinc-200 hover:border-red-200 text-zinc-600 hover:text-red-600 shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Sign out of organizer workspace"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* 2. Overview Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-2">
          <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block">
            Total Albums
          </span>
          <p className="text-2xl font-bold tracking-tight text-zinc-950 font-mono">
            {totalEvents}
          </p>
          <p className="text-[11px] text-zinc-400">Created in workspace</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-2">
          <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block">
            Ready for Search
          </span>
          <p className="text-2xl font-bold tracking-tight text-emerald-600 font-mono">
            {readyEvents}
          </p>
          <p className="text-[11px] text-zinc-400">Publicly discoverable</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-2">
          <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block">
            Ingesting
          </span>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold tracking-tight text-amber-600 font-mono">
              {processingEvents}
            </p>
            {processingEvents > 0 && (
              <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200 font-medium">
                Live
              </span>
            )}
          </div>
          <p className="text-[11px] text-zinc-400">Extracting face vectors</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-2">
          <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block">
            Indexed Photos
          </span>
          <p className="text-2xl font-bold tracking-tight text-zinc-950 font-mono">
            {totalPhotos}
          </p>
          <p className="text-[11px] text-zinc-400">High-res campus images</p>
        </div>
      </div>

      {/* 3. Create Event Modal / Panel */}
      {isCreating && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-zinc-300 shadow-md space-y-4 transition-all">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div>
              <h2 className="text-sm font-semibold text-zinc-950">Add New Event Album</h2>
              <p className="text-xs text-zinc-500">
                Provide a shared Google Drive folder link to automatically index all photographs.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false)
                setFormError(null)
              }}
              className="text-xs text-zinc-400 hover:text-zinc-700"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 block">
                  Event Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Anwesha '26 Pronite or Infinito Cricket"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-xs sm:text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 block">
                  Google Drive Folder Link
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/drive/folders/..."
                  value={folderUrl}
                  onChange={(e) => setFolderUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-xs sm:text-sm text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-colors"
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Requirement:</strong> Ensure the Google Drive folder share permission is set to{' '}
                <span className="font-semibold text-zinc-900">&quot;Anyone with the link can view&quot;</span>.
                Photos will be streamed and face vectors indexed in the background.
              </span>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs">
                {formError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false)
                  setFormError(null)
                }}
                className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="py-2 px-5 rounded-lg font-medium text-xs text-white bg-black hover:bg-zinc-800 disabled:opacity-40 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Queuing Ingestion...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Start Indexing</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {formSuccess && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <span>{formSuccess}</span>
          <button
            type="button"
            onClick={() => setFormSuccess(null)}
            className="text-emerald-700 hover:text-emerald-900 font-semibold"
          >
            ✕
          </button>
        </div>
      )}

      {/* 4. Events Directory Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search albums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 shadow-xs"
            />
          </div>

          <span className="text-xs text-zinc-500">
            Showing {filteredEvents.length} of {events.length} albums
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
            <span>Loading workspace events...</span>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-12 rounded-xl bg-white border border-zinc-200 text-center space-y-3 shadow-xs">
            <div className="w-9 h-9 rounded-full bg-zinc-100 mx-auto flex items-center justify-center text-zinc-400">
              <FolderHeart className="w-4 h-4 text-zinc-500" />
            </div>
            <p className="text-sm font-semibold text-zinc-900">No events found</p>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Get started by clicking &quot;New Event&quot; above to connect a Google Drive album.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-medium uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Event Title</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Indexed Photos</th>
                    <th className="py-3 px-4">Drive Source</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredEvents.map((evt) => {
                    const isReady = evt.status === 'ready'
                    return (
                      <tr key={evt.id} className="hover:bg-zinc-50/60 transition-colors">
                        {/* Title & ID */}
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-zinc-900 text-xs sm:text-sm">
                            {evt.name}
                          </p>
                          <p className="font-mono text-[10px] text-zinc-400 truncate max-w-[180px]">
                            ID: {evt.id}
                          </p>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {isReady ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Ready for Search
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                              Indexing faces...
                            </span>
                          )}
                        </td>

                        {/* Photo Count */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-zinc-800 font-mono text-xs">
                            <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{evt.photo_count || 0} photos</span>
                          </div>
                        </td>

                        {/* Source Drive */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <a
                            href={evt.folder_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-900 transition-colors"
                          >
                            <span>Open Folder</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleCopyLink(evt.id)}
                              className="px-2.5 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                              title="Copy student search link"
                            >
                              {copiedId === evt.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span className="text-emerald-600">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 text-zinc-500" />
                                  <span>Copy Link</span>
                                </>
                              )}
                            </button>

                            {isReady && (
                              <Link
                                to={`/events/${evt.id}`}
                                className="px-2.5 py-1 rounded bg-black hover:bg-zinc-800 text-white text-[11px] font-medium transition-colors shadow-xs"
                              >
                                View Page
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
