/**
 * SpotMe.Ai Frontend API Service
 * Centralizes all HTTP communication with the FastAPI backend.
 */

const API_BASE_URL = 'http://127.0.0.1:8000'

// --- Organizer JWT Session Helpers ---
const TOKEN_STORAGE_KEY = 'spotme_admin_jwt'

export function getAdminToken() {
  return sessionStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setAdminToken(token) {
  if (token) {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, token)
  } else {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY)
  }
}

export function clearAdminToken() {
  sessionStorage.removeItem(TOKEN_STORAGE_KEY)
}

/**
 * 1. Organizer: Authenticate with username and password to get a signed JWT.
 */
export async function adminLogin(username, password) {
  const response = await fetch(`${API_BASE_URL}/admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: username.trim(),
      password: password.trim(),
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Authentication failed. Please check credentials.')
  }

  const data = await response.json()
  setAdminToken(data.access_token)
  return data
}

/**
 * 2. Organizer: Register a new account into the database and obtain a JWT.
 */
export async function adminRegister(username, password) {
  const response = await fetch(`${API_BASE_URL}/admin/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: username.trim(),
      password: password.trim(),
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Registration failed. Username may already be in use.')
  }

  const data = await response.json()
  setAdminToken(data.access_token)
  return data
}

/**
 * 2. Organizer: Verify if existing saved JWT session is still valid.
 */
export async function verifyAdminSession() {
  const token = getAdminToken()
  if (!token) return false

  try {
    const response = await fetch(`${API_BASE_URL}/admin/verify`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.ok
  } catch {
    return false
  }
}

/**
 * 3. Organizer: Create a new event (protected by Bearer token).
 */
export async function createAdminEvent(eventName, folderUrl) {
  const token = getAdminToken()
  if (!token) {
    throw new Error('Organizer is not authenticated. Please sign in.')
  }

  const response = await fetch(`${API_BASE_URL}/admin/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      event_name: eventName,
      folder_url: folderUrl,
    }),
  })

  if (!response.ok) {
    if (response.status === 401) {
      clearAdminToken()
      throw new Error('Session expired or unauthorized. Please log in again.')
    }
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Failed to create event. Please check the folder link.')
  }

  return await response.json() // Returns: { status: "success", event_id: "...", message: "..." }
}

/**
 * 4. Fetch all events that are ready for photo retrieval.
 */
export async function fetchAvailableEvents() {
  const response = await fetch(`${API_BASE_URL}/events`)
  
  if (!response.ok) {
    throw new Error('Failed to load events. Make sure the backend server is running.')
  }
  
  return await response.json()
}

export async function fetchEventById(eventId) {
  const response = await fetch(`${API_BASE_URL}/events/${eventId}`)
  if (!response.ok) {
    throw new Error('Event not found or currently unavailable.')
  }
  return await response.json()
}

/**
 * Fetch all events (ready & processing) for the organizer dashboard.
 */
export async function fetchAdminAllEvents() {
  const token = getAdminToken()
  if (!token) throw new Error('Organizer not authenticated')

  const response = await fetch(`${API_BASE_URL}/admin/all-events`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    if (response.status === 401) {
      clearAdminToken()
      throw new Error('Session expired. Please log in again.')
    }
    throw new Error('Failed to load organizer events.')
  }

  return await response.json()
}

/**
 * 5. Upload a selfie and find matching photos for a given event.
 */
export async function searchMatchingPhotos(eventId, imageFile) {
  const formData = new FormData()
  formData.append('event_id', eventId)
  formData.append('selfie', imageFile)

  const response = await fetch(`${API_BASE_URL}/find-matches`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Failed to find matches. Please try another selfie.')
  }

  return await response.json()
}
