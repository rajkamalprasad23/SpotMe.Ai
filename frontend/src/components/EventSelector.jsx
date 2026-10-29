import { useEffect, useState } from 'react'
import { Calendar, ChevronDown, Loader2 } from 'lucide-react'
import { fetchAvailableEvents } from '../services/api'

export default function EventSelector({ selectedEventId, onSelectEvent, refreshKey }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchAvailableEvents()
        setEvents(data)

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
    <div className="w-full space-y-1.5 text-left">
      <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block">
        Select Event
      </label>

      <div className="relative">
        {loading ? (
          <div className="w-full px-3.5 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-500 text-xs flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
              Loading events...
            </span>
          </div>
        ) : error ? (
          <div className="w-full px-3.5 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs">
            {error}
          </div>
        ) : events.length === 0 ? (
          <div className="w-full px-3.5 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-500 text-xs">
            No events indexed yet. Use the Organizer Portal to upload one.
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
            </div>

            <select
              value={selectedEventId || ''}
              onChange={(e) => onSelectEvent(e.target.value)}
              className="w-full appearance-none pl-9 pr-9 py-2 rounded-lg bg-white border border-zinc-200 text-xs sm:text-sm font-medium text-zinc-900 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-all cursor-pointer hover:border-zinc-300 shadow-xs"
            >
              {events.map((evt) => (
                <option key={evt.id} value={evt.id} className="bg-white text-zinc-900">
                  {evt.name}
                </option>
              ))}
            </select>

            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
