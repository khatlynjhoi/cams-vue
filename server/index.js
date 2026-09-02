const express = require('express')
const cors = require('cors')
const Database = require('better-sqlite3')
const path = require('path')
const { hashPassword, verifyPassword, generateToken, authenticateToken, requireRole } = require('./auth')

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// SQLite Persistence Database Setup
const db = new Database(path.join(__dirname, 'maritime_qbank.db'))

// Initialize All Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    courseOutcomes TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program TEXT DEFAULT 'Both',
    term TEXT DEFAULT 'Midterm',
    courseId TEXT NOT NULL,
    courseOutcomeId TEXT NOT NULL,
    learningOutcomeId TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    text TEXT NOT NULL,
    imageUrl TEXT,
    options TEXT,
    correctAnswer TEXT,
    matchingPairs TEXT,
    stcwStandard TEXT,
    bloomLevel TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'cadet'
  );

  CREATE TABLE IF NOT EXISTS exam_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cadetId INTEGER NOT NULL,
    cadetName TEXT NOT NULL,
    courseId TEXT NOT NULL,
    score INTEGER NOT NULL,
    totalItems INTEGER NOT NULL,
    breakdown TEXT NOT NULL,
    submittedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    action TEXT NOT NULL,
    target TEXT NOT NULL,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`)

// Schema migration safety checks for existing SQLite databases
try {
  db.exec("ALTER TABLE questions ADD COLUMN program TEXT DEFAULT 'Both';")
} catch (e) {}

try {
  db.exec("ALTER TABLE questions ADD COLUMN term TEXT DEFAULT 'Midterm';")
} catch (e) {}

// Audit Helper Function
function logAuditEvent(userId, action, target, details = '') {
  try {
    const stmt = db.prepare('INSERT INTO audit_logs (userId, action, target, details) VALUES (?, ?, ?, ?)')
    stmt.run(String(userId), action, target, details)
  } catch (err) {
    console.error('Audit Log Error:', err)
  }
}

// --- AUTHENTICATION & USER MANAGEMENT ENDPOINTS ---
app.post('/api/auth/register', (req, res) => {
  const { username, password, name, role } = req.body
  try {
    const hashed = hashPassword(password)
    const stmt = db.prepare('INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)')
    const info = stmt.run(username, hashed, name, role || 'cadet')
    logAuditEvent(info.lastInsertRowid, 'REGISTER_USER', username, `Role: ${role || 'cadet'}`)
    res.status(201).json({ success: true, userId: info.lastInsertRowid })
  } catch (err) {
    res.status(400).json({ success: false, error: 'Username already exists' })
  }
})

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username)

  if (!user || !verifyPassword(password, user.password)) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' })
  }

  const token = generateToken(user)
  logAuditEvent(user.id, 'LOGIN', user.username, 'User authenticated successfully')
  res.json({
    success: true,
    token,
    user: { id: user.id, username: user.username, role: user.role, name: user.name }
  })
})

// --- COURSES ENDPOINTS ---
app.get('/api/courses', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM courses').all()
    const courses = rows.map(r => ({ ...r, courseOutcomes: JSON.parse(r.courseOutcomes) }))
    res.json({ success: true, data: courses })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

app.post('/api/courses', (req, res) => {
  const { code, title, courseOutcomes } = req.body
  const id = `CRS-${Date.now()}`
  try {
    const stmt = db.prepare('INSERT INTO courses (id, code, title, courseOutcomes) VALUES (?, ?, ?, ?)')
    stmt.run(id, code, title, JSON.stringify(courseOutcomes || []))
    logAuditEvent('SYSTEM', 'CREATE_COURSE', code, title)
    res.status(201).json({ success: true, data: { id, code, title, courseOutcomes } })
  } catch (err) {
    res.status(400).json({ success: false, error: err.message })
  }
})

app.post('/api/courses/bulk', (req, res) => {
  const { courses } = req.body
  if (!Array.isArray(courses)) return res.status(400).json({ success: false, message: 'Invalid payload' })

  const insert = db.prepare('INSERT OR REPLACE INTO courses (id, code, title, courseOutcomes) VALUES (?, ?, ?, ?)')
  const insertMany = db.transaction((items) => {
    for (const c of items) {
      const id = c.id || `CRS-${Math.random().toString(36).substr(2, 9)}`
      insert.run(id, c.code, c.title, JSON.stringify(c.courseOutcomes || []))
    }
  })

  try {
    insertMany(courses)
    res.json({ success: true, count: courses.length })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

app.delete('/api/courses/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM courses WHERE id = ?').run(req.params.id)
    logAuditEvent('SYSTEM', 'DELETE_COURSE', req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// --- QUESTION BANK ENDPOINTS WITH FILTERING & CRUD ---
app.get('/api/questions', (req, res) => {
  const { program, term, courseId, courseOutcomeId, learningOutcomeId, bloomLevel, type, search } = req.query
  let query = 'SELECT * FROM questions WHERE 1=1'
  const params = []

  if (program && program !== 'Both') {
    query += ' AND (program = ? OR program = "Both")'
    params.push(program)
  }
  if (term) {
    query += ' AND term = ?'
    params.push(term)
  }
  if (courseId) {
    query += ' AND courseId = ?'
    params.push(courseId)
  }
  if (courseOutcomeId) {
    query += ' AND courseOutcomeId = ?'
    params.push(courseOutcomeId)
  }
  if (learningOutcomeId) {
    query += ' AND learningOutcomeId = ?'
    params.push(learningOutcomeId)
  }
  if (bloomLevel) {
    query += ' AND bloomLevel = ?'
    params.push(bloomLevel)
  }
  if (type) {
    query += ' AND type = ?'
    params.push(type)
  }
  if (search) {
    query += ' AND (text LIKE ? OR code LIKE ?)'
    params.push(`%${search}%`, `%${search}%`)
  }

  query += ' ORDER BY id DESC'

  try {
    const rows = db.prepare(query).all(...params)
    const questions = rows.map(q => ({
      ...q,
      options: JSON.parse(q.options || '[]'),
      correctAnswer: JSON.parse(q.correctAnswer || 'null'),
      matchingPairs: JSON.parse(q.matchingPairs || '[]')
    }))
    res.json({ success: true, data: questions })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

app.post('/api/questions', (req, res) => {
  const q = req.body
  const generatedCode = q.code || `Q-${Date.now()}-${Math.floor(Math.random() * 1000)}`

  try {
    const stmt = db.prepare(`
      INSERT INTO questions 
      (program, term, courseId, courseOutcomeId, learningOutcomeId, code, type, text, imageUrl, options, correctAnswer, matchingPairs, stcwStandard, bloomLevel)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    const info = stmt.run(
      q.program || 'Both',
      q.term || 'Midterm',
      q.courseId || '',
      q.courseOutcomeId || '',
      q.learningOutcomeId || '',
      generatedCode,
      q.type,
      q.text,
      q.imageUrl || '',
      JSON.stringify(q.options || []),
      JSON.stringify(q.correctAnswer ?? null),
      JSON.stringify(q.matchingPairs || []),
      q.stcwStandard || 'Table A-II/1',
      q.bloomLevel || 'Understanding'
    )
    logAuditEvent('SYSTEM', 'CREATE_QUESTION', generatedCode, q.type)
    res.status(201).json({ success: true, id: info.lastInsertRowid })
  } catch (err) {
    res.status(400).json({ success: false, error: err.message })
  }
})

app.put('/api/questions/:id', (req, res) => {
  const q = req.body
  const itemCode = q.code || `Q-${Date.now()}-${Math.floor(Math.random() * 1000)}`

  try {
    const stmt = db.prepare(`
      UPDATE questions 
      SET program = ?, term = ?, courseId = ?, courseOutcomeId = ?, learningOutcomeId = ?, code = ?, type = ?, text = ?, imageUrl = ?, options = ?, correctAnswer = ?, matchingPairs = ?, stcwStandard = ?, bloomLevel = ?
      WHERE id = ?
    `)
    stmt.run(
      q.program || 'Both',
      q.term || 'Midterm',
      q.courseId,
      q.courseOutcomeId,
      q.learningOutcomeId,
      itemCode,
      q.type,
      q.text,
      q.imageUrl || '',
      JSON.stringify(q.options || []),
      JSON.stringify(q.correctAnswer ?? null),
      JSON.stringify(q.matchingPairs || []),
      q.stcwStandard || 'Table A-II/1',
      q.bloomLevel,
      req.params.id
    )
    logAuditEvent('SYSTEM', 'UPDATE_QUESTION', itemCode)
    res.json({ success: true })
  } catch (err) {
    res.status(400).json({ success: false, error: err.message })
  }
})

app.delete('/api/questions/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM questions WHERE id = ?').run(req.params.id)
    logAuditEvent('SYSTEM', 'DELETE_QUESTION', req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

app.post('/api/questions/bulk', (req, res) => {
  const { questions } = req.body
  if (!Array.isArray(questions)) return res.status(400).json({ success: false, message: 'Invalid payload' })

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO questions 
    (program, term, courseId, courseOutcomeId, learningOutcomeId, code, type, text, imageUrl, options, correctAnswer, matchingPairs, stcwStandard, bloomLevel)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertMany = db.transaction((items) => {
    for (const q of items) {
      const generatedCode = q.code || `Q-${Date.now()}-${Math.floor(Math.random() * 10000)}`
      stmt.run(
        q.program || 'Both',
        q.term || 'Midterm',
        q.courseId || '',
        q.courseOutcomeId || '',
        q.learningOutcomeId || '',
        generatedCode,
        q.type,
        q.text,
        q.imageUrl || '',
        JSON.stringify(q.options || []),
        JSON.stringify(q.correctAnswer ?? null),
        JSON.stringify(q.matchingPairs || []),
        q.stcwStandard || 'Table A-II/1',
        q.bloomLevel || 'Understanding'
      )
    }
  })

  try {
    insertMany(questions)
    res.json({ success: true, count: questions.length })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// --- EXAM GENERATOR & CADET SUBMISSIONS ---
app.post('/api/exams/generate', (req, res) => {
  const { program, term, courseId, courseOutcomeId, learningOutcomeId, totalItems, bloomRatios } = req.body

  try {
    let query = 'SELECT * FROM questions WHERE 1=1'
    const params = []

    if (program && program !== 'Both') {
      query += ' AND (program = ? OR program = "Both")'
      params.push(program)
    }
    if (term) {
      query += ' AND term = ?'
      params.push(term)
    }
    if (courseId) {
      query += ' AND courseId = ?'
      params.push(courseId)
    }
    if (courseOutcomeId) {
      query += ' AND courseOutcomeId = ?'
      params.push(courseOutcomeId)
    }
    if (learningOutcomeId) {
      query += ' AND learningOutcomeId = ?'
      params.push(learningOutcomeId)
    }

    const rows = db.prepare(query).all(...params)
    const allQuestions = rows.map(q => ({
      ...q,
      options: JSON.parse(q.options || '[]'),
      correctAnswer: JSON.parse(q.correctAnswer || 'null'),
      matchingPairs: JSON.parse(q.matchingPairs || '[]')
    }))

    if (allQuestions.length === 0) {
      return res.status(400).json({ success: false, message: 'No questions available matching these filters.' })
    }

    const selected = []
    const levels = ['Remembering', 'Understanding', 'Application', 'Analysis']

    levels.forEach(level => {
      const ratio = (bloomRatios && bloomRatios[level]) ? bloomRatios[level] / 100 : 0.25
      const quota = Math.round((totalItems || 5) * ratio)
      const pool = allQuestions.filter(q => q.bloomLevel === level)
      const shuffled = pool.sort(() => 0.5 - Math.random())
      selected.push(...shuffled.slice(0, quota))
    })

    const targetTotal = totalItems || 5
    if (selected.length < targetTotal) {
      const selectedIds = new Set(selected.map(s => s.id))
      const remainingPool = allQuestions.filter(q => !selectedIds.has(q.id)).sort(() => 0.5 - Math.random())
      selected.push(...remainingPool.slice(0, targetTotal - selected.length))
    }

    res.json({ success: true, exam: selected.slice(0, targetTotal) })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

app.post('/api/exams/submit', (req, res) => {
  const { cadetId, cadetName, courseId, score, totalItems, breakdown } = req.body
  try {
    const stmt = db.prepare(`
      INSERT INTO exam_submissions (cadetId, cadetName, courseId, score, totalItems, breakdown)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    const info = stmt.run(cadetId || 0, cadetName || 'Anonymous Cadet', courseId, score, totalItems, JSON.stringify(breakdown || {}))
    logAuditEvent(cadetId || 'CADET', 'SUBMIT_EXAM', courseId, `Score: ${score}/${totalItems}`)
    res.status(201).json({ success: true, submissionId: info.lastInsertRowid })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// --- PSYCHOMETRICS & AUDIT LOGS ENDPOINTS ---
app.get('/api/psychometrics/item-analysis', (req, res) => {
  try {
    const questions = db.prepare('SELECT id, code, text, type, bloomLevel, program FROM questions').all()

    const analysis = questions.map(q => {
      const totalAttempts = Math.floor(20 + Math.random() * 80)
      const correctAttempts = Math.floor(totalAttempts * (0.4 + Math.random() * 0.5))
      const difficultyIndex = Number((correctAttempts / totalAttempts).toFixed(2))
      const discriminationIndex = Number((0.2 + Math.random() * 0.6).toFixed(2))

      let qualityStatus = 'Optimal'
      if (difficultyIndex > 0.85) qualityStatus = 'Too Easy'
      else if (difficultyIndex < 0.30) qualityStatus = 'Too Difficult'
      else if (discriminationIndex < 0.20) qualityStatus = 'Poor Discrimination'

      return {
        id: q.id,
        code: q.code,
        text: q.text,
        bloomLevel: q.bloomLevel,
        program: q.program,
        totalAttempts,
        difficultyIndex,
        discriminationIndex,
        qualityStatus
      }
    })

    res.json({ success: true, data: analysis })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

app.get('/api/audit-logs', (req, res) => {
  try {
    const logs = db.prepare('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 100').all()
    res.json({ success: true, data: logs })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// Mock AI Validation Endpoint
app.post('/api/questions/validate', (req, res) => {
  const { text } = req.body
  const bloomLevels = ['Remembering', 'Understanding', 'Application', 'Analysis']
  const randomLevel = bloomLevels[Math.floor(Math.random() * bloomLevels.length)]
  res.json({
    success: true,
    validation: {
      suggestedBloomLevel: randomLevel,
      confidence: 0.92,
      feedback: 'Stem effectively targets cognitive evaluation.'
    }
  })
})

const PORT = 3001
app.listen(PORT, () => console.log(`Maritime Server with SQLite active on http://localhost:${PORT}`))