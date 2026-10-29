import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { Shield, Lock, UserPlus, Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import { adminLogin, adminRegister, verifyAdminSession } from '../services/api'

export default function OrganizerAuth({ mode = 'login' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const isRegister = mode === 'signup' || location.pathname.includes('signup')

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Redirect if already authenticated
  useEffect(() => {
    async function check() {
      const valid = await verifyAdminSession()
      if (valid) {
        navigate('/organizer/dashboard')
      }
    }
    check()
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password.')
      return
    }

    if (isRegister) {
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
      if (!isRegister) {
        await adminLogin(username, password)
      } else {
        await adminRegister(username, password)
      }
      navigate('/organizer/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md w-full mx-auto px-4 py-16 space-y-6 text-left">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 transition-colors font-medium"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to SpotMe</span>
      </Link>

      <div className="p-7 rounded-2xl bg-white border border-zinc-200 shadow-sm space-y-6">
        <div className="space-y-1.5 text-center">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 mx-auto flex items-center justify-center text-zinc-800">
            <Shield className="w-4 h-4" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-950">
            {isRegister ? 'Create Organizer Account' : 'Organizer Sign In'}
          </h1>
          <p className="text-xs text-zinc-500">
            {isRegister
              ? 'Register an account to manage campus events and photo albums'
              : 'Sign in to access your event ingestion console'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 p-1 bg-zinc-100 rounded-lg border border-zinc-200">
          <Link
            to="/organizer/login"
            className={`py-1.5 text-xs font-medium text-center rounded-md transition-all ${
              !isRegister
                ? 'bg-white text-zinc-950 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Sign In
          </Link>
          <Link
            to="/organizer/signup"
            className={`py-1.5 text-xs font-medium text-center rounded-md transition-all ${
              isRegister
                ? 'bg-white text-zinc-950 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Sign Up
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-zinc-600 uppercase tracking-wider block">
              Username
            </label>
            <input
              type="text"
              placeholder="e.g. anwesha_lead"
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

          {isRegister && (
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

          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg font-medium text-xs text-white bg-black hover:bg-zinc-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99] mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : !isRegister ? (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Sign In to Dashboard</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Organizer Account</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
