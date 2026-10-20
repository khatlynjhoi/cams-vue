/**
 * Centralized CAMS Multi-Port API Client
 * Attempts connections across multiple backend ports with token authorization & local storage fallbacks.
 */

const API_PORTS = [
  '/api',
  'http://127.0.0.1:8000/api',
  'http://127.0.0.1:8080/api',
  'http://localhost:8000/api'
]

async function fetchFromEndpoints(path, options = {}) {
  const token = localStorage.getItem('token') || ''
  let user = {}
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}')
  } catch (e) {}

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-User-Role': user.role || 'Admin',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  }

  for (const baseUrl of API_PORTS) {
    try {
      const res = await fetch(`${baseUrl}${path}`, { ...options, headers })
      if (res.ok) {
        const json = await res.json()
        return json?.data ?? json
      }
    } catch (e) {
      // Attempt next port endpoint
    }
  }
  throw new Error(`Endpoint [${path}] unreachable across all backend ports`)
}

/**
 * Retrieve Question Bank items with optional query filters & local storage fallback
 */
export async function getQuestions(params = {}) {
  const queryString = new URLSearchParams(params).toString()
  const path = `/questions${queryString ? `?${queryString}` : ''}`

  try {
    const data = await fetchFromEndpoints(path)
    return Array.isArray(data) ? data : (data.data || [])
  } catch (err) {
    console.warn('Backend offline, loading fallback question bank from localStorage')
    const saved = localStorage.getItem('cams_questions_data') || localStorage.getItem('cams_questions')
    if (saved) {
      const parsed = JSON.parse(saved)
      return Array.isArray(parsed) ? parsed : (parsed.data || [])
    }
    return []
  }
}

/**
 * Create a new question item in the Question Bank
 */
export async function createQuestion(questionData) {
  try {
    const data = await fetchFromEndpoints('/questions', {
      method: 'POST',
      body: JSON.stringify(questionData)
    })
    return data
  } catch (err) {
    console.warn('Backend offline, caching question to local storage fallback')
    const localBank = JSON.parse(localStorage.getItem('cams_questions_data') || '[]')
    const newQuestion = { ...questionData, id: Date.now(), status: 'Pending' }
    localBank.push(newQuestion)
    localStorage.setItem('cams_questions_data', JSON.stringify(localBank))
    return newQuestion
  }
}

/**
 * Submit cadet examination paper
 */
export async function submitExam(cadetId, answers, payloadExtra = {}) {
  const payload = { cadet_id: cadetId, answers, ...payloadExtra }

  try {
    const data = await fetchFromEndpoints('/exam/submit', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
    return data
  } catch (err) {
    console.warn('Backend offline, storing exam submission in localStorage queue')
    const localSubs = JSON.parse(localStorage.getItem('cams_exam_submissions') || '[]')
    localSubs.push({ ...payload, submitted_at: new Date().toISOString() })
    localStorage.setItem('cams_exam_submissions', JSON.stringify(localSubs))
    return { success: true, offlineSaved: true }
  }
}

/**
 * Retrieve active pilot examination sessions
 */
export async function getActiveSessions() {
  try {
    const data = await fetchFromEndpoints('/sessions')
    return Array.isArray(data) ? data : (data.data || [])
  } catch (err) {
    console.warn('Backend offline, reading active sessions from localStorage')
    const saved = localStorage.getItem('cams_pilot_sessions')
    if (saved) {
      const parsed = JSON.parse(saved)
      return Array.isArray(parsed) ? parsed : (parsed.data || [])
    }
    return []
  }
}