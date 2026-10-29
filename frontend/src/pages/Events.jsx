import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, ArrowRight, Loader2, Calendar, Sparkles } from 'lucide-react'
import { fetchAvailableEvents } from '../services/api'

export default function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const categories = ['All', 'Cultural', 'Technical', 'Sports', 'Departmental']

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const data = await fetchAvailableEvents()
        setEvents(data)
      } catch (err) {
        console.error('Failed to load events:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Filter events by search term and category
  const filteredEvents = events.filter((evt) => {
    const matchesSearch = evt.name.toLowerCase().includes(searchTerm.toLowerCase())
    if (selectedCategory === 'All') return matchesSearch

    // Smart categorization check based on name
    const lowerName = evt.name.toLowerCase()
    if (selectedCategory === 'Cultural' && (lowerName.includes('anwesha') || lowerName.includes('fest') || lowerName.includes('cultural'))) return matchesSearch
    if (selectedCategory === 'Technical' && (lowerName.includes('celesta') || lowerName.includes('hackathon') || lowerName.includes('tech'))) return matchesSearch
    if (selectedCategory === 'Sports' && (lowerName.includes('infinito') || lowerName.includes('sports') || lowerName.includes('cricket'))) return matchesSearch
    if (selectedCategory === 'Departmental' && (lowerName.includes('cse') || lowerName.includes('farewell') || lowerName.includes('convocation') || lowerName.includes('meet'))) return matchesSearch
    
    return matchesSearch
  })

  return (
    <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8 text-left">
      
      {/* Header */}
      <div className="space-y-1.5 border-b border-zinc-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
          Campus Events Directory
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500">
          Browse and retrieve photographs from IIT Patna festivals, tournaments, and celebrations
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search events by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-white border border-zinc-200 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-colors shadow-xs"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex-shrink-0 ${
                selectedCategory === cat
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
          <span>Loading event directory...</span>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="p-12 rounded-xl bg-white border border-zinc-200 text-center space-y-2 shadow-xs">
          <p className="text-sm font-semibold text-zinc-800">No events matched your search</p>
          <p className="text-xs text-zinc-500">
            Try searching for another keyword or view all categories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map((evt) => (
            <Link
              key={evt.id}
              to={`/events/${evt.id}`}
              className="group p-5 rounded-xl bg-white border border-zinc-200 hover:border-zinc-300 transition-all shadow-xs hover:shadow-md flex flex-col justify-between space-y-4 cursor-pointer"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Available
                  </span>
                  <span>{evt.photo_count ? `${evt.photo_count} photos` : 'Photos ready'}</span>
                </div>

                <h3 className="text-base font-semibold text-zinc-900 group-hover:text-black line-clamp-1">
                  {evt.name}
                </h3>
                <p className="text-xs text-zinc-500 line-clamp-2">
                  Official high-resolution photography indexed with facial recognition.
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-medium text-zinc-800 group-hover:text-black">
                <span>Search This Event</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 text-zinc-400 group-hover:text-black" />
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  )
}
