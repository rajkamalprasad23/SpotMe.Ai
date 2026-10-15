import { useState } from 'react'
import { X, Lock, FolderPlus, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { createAdminEvent } from '../services/api'

export default function AdminModal({ isOpen, onClose, onEventCreated }) {
  const [passcode, setPasscode] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [eventName, setEventName] = useState('')
  const [folderUrl, setFolderUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  if (!isOpen) return null

  // Passcode verification (simple client-side gate for organizers)
  const handlePasscodeSubmit = (e) => {
    e.preventDefault()
    if (passcode.trim() === 'spotme2026') {
      setIsAuthenticated(true)
      setError(null)
    } else {
      setError('Invalid organizer passkey. (Default: spotme2026)')
    }
  }

  // Handle Event Creation
  const handleCreateEvent = async (e) => {
    e.preventDefault()
    if (!eventName.trim() || !folderUrl.trim()) {
      setError('Please fill in both the event name and Google Drive folder link.')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const result = await createAdminEvent(eventName.trim(), folderUrl.trim())
      
      setSuccessMessage(
        `Event "${eventName}" created successfully! The AI background pipeline is now downloading and indexing faces. It will appear in the events dropdown once ready.`
      )
      setEventName('')
      setFolderUrl('')
      
      if (onEventCreated) {
        onEventCreated()
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setPasscode('')
    setIsAuthenticated(false)
    setError(null)
    setSuccessMessage(null)
    onClose()
  }

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-6 text-left"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Organizer Portal</h3>
              <p className="text-xs text-zinc-500">Create and index new events</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Gate 1: Passcode Verification */}
        {!isAuthenticated ? (
          <form onSubmit={handlePasscodeSubmit} className="space-y-4">
            <p className="text-xs text-zinc-400 leading-relaxed">
              Enter the organizer passkey to access event upload controls.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider block">
                Passkey
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter passkey (default: spotme2026)"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/30 border border-red-900/50 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl font-medium text-xs text-white bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              Unlock Portal
            </button>
          </form>
        ) : (
          /* Gate 2: Event Ingestion Form */
          <form onSubmit={handleCreateEvent} className="space-y-4">
            {successMessage ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-900/50 text-emerald-400 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Processing In Background</span>
                  </div>
                  <p className="text-zinc-300 leading-relaxed">
                    {successMessage}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSuccessMessage(null)}
                  className="w-full py-2.5 rounded-xl text-xs font-medium bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  Add Another Event
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider block">
                    Event Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Annual Sports Meet 2026"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider block">
                    Google Drive Folder Link
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/drive/folders/..."
                    value={folderUrl}
                    onChange={(e) => setFolderUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <p className="text-[11px] text-zinc-500">
                    Folder must be set to "Anyone with the link can view".
                  </p>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-950/30 border border-red-900/50 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl font-medium text-xs text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Creating event...
                    </>
                  ) : (
                    <>
                      <FolderPlus className="w-3.5 h-3.5" />
                      Start Ingestion Pipeline
                    </>
                  )}
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
