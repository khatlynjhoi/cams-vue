const API_BASE_URL = 'http://localhost:3001/api'

export async function getQuestions() {
  const response = await fetch(`http://127.0.0.1:8000/questions`)
  if (!response.ok) throw new Error('Failed to retrieve question bank')
  return response.json()
}

export async function createQuestion(questionData) {
  const response = await fetch(`http://127.0.0.1:8000/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(questionData)
  })
  if (!response.ok) throw new Error('Failed to save question to bank')
  return response.json()
}

export async function submitExam(cadetId, answers) {
  const response = await fetch(`http://127.0.0.1:8000/exam/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cadetId, answers })
  })
  if (!response.ok) throw new Error('Failed to submit exam assessment')
  return response.json()
}

export async function getActiveSessions() {
  const response = await fetch(`http://127.0.0.1:8000/sessions`)
  if (!response.ok) throw new Error('Failed to retrieve pilot sessions')
  return response.json()
}