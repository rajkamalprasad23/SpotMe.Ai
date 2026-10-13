/**
 * SpotMe.Ai Frontend API Service
 * Centralizes all HTTP communication with the FastAPI backend.
 */

const API_BASE_URL = 'http://127.0.0.1:8000'

/**
 * 1. Fetch all events that are ready for photo retrieval.
 * Used to populate the event dropdown.
 */
export async function fetchAvailableEvents() {
  const response = await fetch(`${API_BASE_URL}/events`)
  
  if (!response.ok) {
    throw new Error('Failed to load events. Make sure the backend server is running.')
  }
  
  return await response.json() // Returns: [{ id: "...", name: "..." }, ...]
}

/**
 * 2. Upload a selfie and find matching photos for a given event.
 * Uses FormData because we are sending a physical binary image file.
 */
export async function searchMatchingPhotos(eventId, imageFile) {
  const formData = new FormData()
  formData.append('event_id', eventId)
  formData.append('selfie', imageFile)

  const response = await fetch(`${API_BASE_URL}/find-matches`, {
    method: 'POST',
    body: formData,
    // Note: Do NOT set 'Content-Type' header here.
    // The browser automatically sets multipart/form-data with the correct boundary!
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Failed to find matches. Please try another selfie.')
  }

  return await response.json() // Returns: { match_summary: {...}, matches: [...] }
}

/**
 * 3. Admin: Create a new event and start Google Drive ingestion.
 */
export async function createAdminEvent(eventName, folderUrl) {
  const response = await fetch(`${API_BASE_URL}/admin/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      event_name: eventName,
      folder_url: folderUrl,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Failed to create event. Please check the folder link.')
  }

  return await response.json() // Returns: { status: "success", event_id: "...", message: "..." }
}
