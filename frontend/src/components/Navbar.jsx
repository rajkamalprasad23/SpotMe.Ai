import { Link, useLocation } from 'react-router-dom'
import { Shield, Sparkles } from 'lucide-react'

export default function Navbar() {
  const location = useLocation()
  const path = location.pathname

  const isCurrent = (route) => {
    if (route === '/' && path === '/') return true
    if (route !== '/' && path.startsWith(route)) return true
    return false
  }

  return (
    <header className="w-full bg-white border-b border-zinc-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Top row */}
        <div className="h-14 flex items-center justify-between">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
            <Link to="/" className="flex items-center gap-2 text-zinc-900 hover:opacity-80 transition-opacity">
              <div className="w-6 h-6 flex items-center justify-center bg-black text-white rounded-md text-[10px] font-bold">
                ▲
              </div>
              <span className="font-semibold tracking-tight">SpotMe</span>
            </Link>
            <span className="text-zinc-300">/</span>
            <span className="text-zinc-500">IIT Patna</span>
            <span className="text-zinc-300">/</span>
            <span className="text-zinc-900 font-mono text-[11px] bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
              {path === '/' ? 'Home' : path.startsWith('/events') ? 'Events' : 'Organizer'}
            </span>
          </div>

          {/* Right Action */}
          <div className="flex items-center gap-3">
            <Link
              to="/organizer/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-zinc-800 bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-300 transition-colors shadow-xs"
            >
              <Shield className="w-3.5 h-3.5 text-zinc-500" />
              <span>Organizer Console</span>
            </Link>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-6 text-xs font-medium -mb-px">
          <Link
            to="/"
            className={`pb-2.5 border-b-2 transition-colors ${
              isCurrent('/')
                ? 'border-black text-black font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Overview
          </Link>
          <Link
            to="/events"
            className={`pb-2.5 border-b-2 transition-colors ${
              isCurrent('/events')
                ? 'border-black text-black font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Explore Events
          </Link>
          <Link
            to="/organizer/dashboard"
            className={`pb-2.5 border-b-2 transition-colors ${
              isCurrent('/organizer')
                ? 'border-black text-black font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Organizer Dashboard
          </Link>
        </div>
      </div>
    </header>
  )
}
