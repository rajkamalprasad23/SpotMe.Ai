import { useEffect, useState } from 'react'
import { Calendar, ChevronDown, Loader2 } from 'lucide-react'
import { fetchAvailableEvents } from '../services/api'

export default function EventSelector({ selectedEventId, onSelectEvent, refreshKey }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 1. Fetch available events from FastAPI whenever component mounts or refreshKey changes
  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchAvailableEvents()
        setEvents(data)

        // Automatically pre-select the first event if available
        if (data.length > 0 && !selectedEventId) {
          onSelectEvent(data[0].id)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [refreshKey])

  return (
    <div className="w-full space-y-2 text-left">
      <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider block">
        1. Select Event
      </label>

      <div className="relative">
        {loading ? (
          /* Subtle Loading State */
          <div className="w-full px-4 py-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-500 text-sm flex items-center justify-between">
            <span className="flex items-center gap-2.5">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              Loading available events...
            </span>
          </div>
        ) : error ? (
          /* Error State */
          <div className="w-full px-4 py-3 rounded-xl bg-red-950/30 border border-red-900/50 text-red-400 text-xs flex items-center justify-between">
            <span>{error}</span>
          </div>
        ) : events.length === 0 ? (
          /* No Events Found */
          <div className="w-full px-4 py-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-500 text-sm">
            No events found. Ask admin to upload one.
          </div>
        ) : (
          /* Clean Minimalist Select Dropdown */
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
              <Calendar className="w-4 h-4 text-indigo-400" />
            </div>

            <select
              value={selectedEventId || ''}
              onChange={(e) => onSelectEvent(e.target.value)}
              className="w-full appearance-none pl-10 pr-10 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/50 transition-all cursor-pointer hover:border-zinc-700"
            >
              {events.map((evt) => (
                <option key={evt.id} value={evt.id} className="bg-zinc-900 text-zinc-200">
                  {evt.name}
                </option>
              ))}
            </select>

            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
