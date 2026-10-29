import { useState, useEffect } from 'react'
import { X, Lock, FolderPlus, Loader2, CheckCircle2, AlertCircle, LogOut, Shield, UserPlus } from 'lucide-react'
import { adminLogin, adminRegister, createAdminEvent, verifyAdminSession, clearAdminToken } from '../services/api'

export default function AdminModal({ isOpen, onClose, onEventCreated }) {
  const [authMode, setAuthMode] = useState('login') // 'login' or 'register'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [eventName, setEventName] = useState('')
  const [folderUrl, setFolderUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  useEffect(() => {
    async function checkSession() {
      if (isOpen) {
        setError(null)
        setSuccessMessage(null)
        const valid = await verifyAdminSession()
        setIsAuthenticated(valid)
      }
    }
    checkSession()
  }, [isOpen])

  if (!isOpen) return null

  const handleAuth = async (e) => {
    e.preventDefault()
    setError(null)

    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password.')
      return
    }

    if (authMode === 'register') {
      if (username.trim().length < 3) {
        setError('Username must be at least 3 characters.')
        return
      }
      if (password.trim().length < 5) {
        setError('Password must be at least 5 characters.')
        return
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        return
      }
    }

    try {
      setLoading(true)
      if (authMode === 'login') {
        await adminLogin(username, password)
      } else {
        await adminRegister(username, password)
      }
      setIsAuthenticated(true)
      setPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = async (e) => {
    e.preventDefault()
    if (!eventName.trim() || !folderUrl.trim()) {
      setError('Please fill in both event name and Google Drive link.')
      return
    }

    try {
      setLoading(true)
      setError(null)
      await createAdminEvent(eventName.trim(), folderUrl.trim())
      
      setSuccessMessage(
        `Event "${eventName}" created. The background AI pipeline has started streaming and indexing faces. It will appear in the event dropdown once ready.`
      )
      setEventName('')
      setFolderUrl('')
      
      if (onEventCreated) {
        onEventCreated()
      }
    } catch (err) {
      if (err.message.includes('expired') || err.message.includes('unauthorized')) {
        setIsAuthenticated(false)
      }
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    clearAdminToken()
    setIsAuthenticated(false)
    setError(null)
    setSuccessMessage(null)
    setUsername('')
    setPassword('')
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 transition-all duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-md w-full bg-white border border-zinc-200 rounded-2xl p-6 shadow-xl space-y-5 text-left"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Organizer Portal</h3>
              <p className="text-[11px] text-zinc-500">
                {isAuthenticated
                  ? 'Authenticated session active'
                  : authMode === 'login'
                  ? 'Sign in to manage events'
                  : 'Register organizer account'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                title="Sign Out"
                className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 transition-colors cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
                <span>Exit</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View 1: Auth Form */}
        {!isAuthenticated ? (
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="grid grid-cols-2 p-1 bg-zinc-100 rounded-lg border border-zinc-200">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login')
                  setError(null)
                }}
                className={`py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register')
                  setError(null)
                }}
                className={`py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                Create Account
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-600 uppercase tracking-wider block">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="e.g. fest_lead"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-zinc-200 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-600 uppercase tracking-wider block">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-zinc-200 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-colors"
                />
              </div>

              {authMode === 'register' && (
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-zinc-600 uppercase tracking-wider block">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-zinc-200 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-colors"
                  />
                </div>
              )}
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 rounded-lg font-medium text-xs text-white bg-black hover:bg-zinc-800 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {authMode === 'login' ? 'Authenticating...' : 'Registering...'}
                </>
              ) : authMode === 'login' ? (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  Sign In
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  Create Account
                </>
              )}
            </button>
          </form>
        ) : (
          /* View 2: Event Form */
          <form onSubmit={handleCreateEvent} className="space-y-3.5">
            {successMessage ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-semibold text-zinc-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Background Task Dispatched</span>
                  </div>
                  <p className="text-zinc-600 leading-relaxed">
                    {successMessage}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSuccessMessage(null)}
                  className="w-full py-2 rounded-lg text-xs font-medium bg-zinc-100 text-zinc-900 hover:bg-zinc-200 transition-colors cursor-pointer"
                >
                  Index Another Event
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-zinc-600 uppercase tracking-wider block">
                    Event Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Campus Fest 2026"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-zinc-200 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-zinc-600 uppercase tracking-wider block">
                    Google Drive Folder URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/drive/folders/..."
                    value={folderUrl}
                    onChange={(e) => setFolderUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-zinc-200 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-colors"
                  />
                  <p className="text-[10px] text-zinc-500">
                    Folder must be set to "Anyone with the link can view".
                  </p>
                </div>

                {error && (
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 rounded-lg font-medium text-xs text-white bg-black hover:bg-zinc-800 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.99]"
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
