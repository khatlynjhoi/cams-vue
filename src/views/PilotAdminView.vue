<template>
  <div class="pilot-admin-container">
    <!-- Header -->
    <header class="page-header">
      <div>
        <h1>Pilot Administration Dashboard</h1>
        <p>Monitor live proctored examination sessions and real-time candidate security telemetry.</p>
      </div>
      <div class="header-actions">
        <button 
          class="btn btn-secondary" 
          @click="simulateCadetViolation"
          :disabled="activeSessionsCount === 0"
          :title="activeSessionsCount === 0 ? 'Schedule an active session to test alerts' : 'Simulate student tab switch'"
        >
          ⚡ Test Live Alert
        </button>
        <button class="btn btn-primary" @click="isNewPilotModalOpen = true">
          + Schedule Pilot Session
        </button>
      </div>
    </header>

    <!-- KPI Summary Metrics -->
    <div class="metrics-grid">
      <div class="metric-card">
        <span class="metric-label">Active Pilot Sessions</span>
        <div class="metric-value text-blue">{{ activeSessionsCount }}</div>
      </div>
      <div class="metric-card">
        <span class="metric-label">Total Cadets Enrolled</span>
        <div class="metric-value">{{ totalCadetsCount }}</div>
      </div>
      <div class="metric-card">
        <span class="metric-label">Flagged Security Alerts</span>
        <div class="metric-value text-red">{{ totalAlertsCount }}</div>
      </div>
    </div>

    <!-- Controls Bar: Search & Status Filter -->
    <div class="filter-bar">
      <div class="search-box">
        <input v-model="searchQuery" type="text" placeholder="Search by title, course, or access code..." />
      </div>
      <div class="filter-options">
        <select v-model="statusFilter">
          <option value="ALL">All Statuses</option>
          <option value="Active">Active Only</option>
          <option value="Paused">Paused Only</option>
          <option value="Completed">Completed Only</option>
        </select>
      </div>
    </div>

    <!-- Data Table & Empty States -->
    <div class="table-card">
      <table v-if="filteredSessions.length > 0" class="sessions-table">
        <thead>
          <tr>
            <th>Session Title</th>
            <th>Course</th>
            <th>Access Code</th>
            <th>Progress</th>
            <th>Status</th>
            <th>Security Alerts</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="session in filteredSessions" :key="session.id">
            <td>
              <span class="session-title">{{ session.title }}</span>
              <span class="session-time">Scheduled: {{ session.scheduled_time }}</span>
            </td>
            <td><code>{{ session.course_code || 'N/A' }}</code></td>
            <td><code class="code-badge">{{ session.access_code }}</code></td>
            <td>{{ session.completed_count }} / {{ session.candidates_count }} Cadets</td>
            <td>
              <span :class="['status-badge', session.status.toLowerCase()]">
                {{ session.status }}
              </span>
            </td>
            <td>
              <span :class="['alert-count', session.telemetryLogs.length > 0 ? 'has-alerts' : 'clean']">
                {{ session.telemetryLogs.length }} Alert(s)
              </span>
            </td>
            <td class="action-cells">
              <button 
                v-if="session.status !== 'Completed'" 
                class="btn-sm btn-outline" 
                @click="toggleStatus(session)"
              >
                {{ session.status === 'Active' ? 'Pause' : 'Resume' }}
              </button>
              <button class="btn-sm btn-info" @click="inspectSession(session)">
                Inspect Logs
              </button>
              <button class="btn-sm btn-danger" @click="deleteSession(session.id)" title="Delete Session">
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State when no data -->
      <div v-else class="empty-state-card">
        <div class="empty-icon">📡</div>
        <h3>No Pilot Sessions Found</h3>
        <p v-if="pilotSessions.length === 0">
          There are no pilot sessions scheduled yet. Click <strong>"+ Schedule Pilot Session"</strong> to create your first session on localhost.
        </p>
        <p v-else>
          No pilot sessions match your current filter criteria.
        </p>
        <button v-if="pilotSessions.length === 0" class="btn btn-primary" @click="isNewPilotModalOpen = true">
          Schedule First Session
        </button>
      </div>
    </div>

    <!-- Modal: Schedule New Pilot Session -->
    <div v-if="isNewPilotModalOpen" class="modal-overlay" @click.self="isNewPilotModalOpen = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Schedule New Pilot Session</h2>
          <button class="close-btn" @click="isNewPilotModalOpen = false">&times;</button>
        </div>
        <form @submit.prevent="handleCreatePilot">
          <div class="form-group">
            <label>Session Title *</label>
            <input v-model="newPilot.title" type="text" placeholder="e.g. NAV-101 Midterm Examination" required />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Course Code *</label>
              <input v-model="newPilot.course_code" type="text" placeholder="e.g. NAV-101" required />
            </div>

            <div class="form-group">
              <label>Access Code *</label>
              <input v-model="newPilot.access_code" type="text" placeholder="e.g. NAV-8842" required />
            </div>
          </div>

          <div class="form-group">
            <label>Link Course / Exam Paper (Optional)</label>
            <select v-model="newPilot.exam_paper_id">
              <option value="">-- Direct Creation (No Linked Paper) --</option>
              <option v-for="paper in availablePapers" :key="paper.id" :value="paper.id">
                {{ paper.course_code || paper.paper_code }} — {{ paper.title || paper.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Expected Candidates Count</label>
            <input v-model.number="newPilot.candidates_count" type="number" min="1" required />
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="isNewPilotModalOpen = false">Cancel</button>
            <button type="submit" class="btn btn-primary">Launch Session</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Telemetry Logs Drawer / Inspector Modal -->
    <div v-if="selectedSessionForDrawer" class="modal-overlay" @click.self="selectedSessionForDrawer = null">
      <div class="drawer-content">
        <div class="drawer-header">
          <div>
            <h3>Security & Telemetry Logs</h3>
            <p class="drawer-subtitle">{{ selectedSessionForDrawer.title }} ({{ selectedSessionForDrawer.course_code }})</p>
          </div>
          <button class="close-btn" @click="selectedSessionForDrawer = null">&times;</button>
        </div>

        <div v-if="selectedSessionForDrawer.telemetryLogs.length === 0" class="empty-state-card">
          <div class="empty-icon">🛡️</div>
          <h4>No Security Violations Logged</h4>
          <p>No proctoring infractions or window-blur events have been flagged for this session.</p>
        </div>

        <div v-else class="logs-list">
          <div 
            v-for="log in selectedSessionForDrawer.telemetryLogs" 
            :key="log.id" 
            :class="['log-card', log.severity.toLowerCase(), { 'is-locked': log.is_locked }]"
          >
            <div class="log-info">
              <span class="severity-tag">{{ log.severity }}</span>
              <h4>{{ log.cadet_name }} <small>({{ log.student_id }})</small></h4>
              <p class="event-desc">{{ log.event }}</p>
              <small class="timestamp">Logged at: {{ log.logged_at }}</small>
            </div>
            <div class="log-actions">
              <button 
                :class="['btn-sm', log.is_locked ? 'btn-unlock' : 'btn-lock']"
                @click="toggleCadetLock(log)"
              >
                {{ log.is_locked ? 'Unlock Terminal' : 'Lock Terminal' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const STORAGE_KEY = 'cams_pilot_sessions'

// 1. Reactive State
const pilotSessions = ref([])
const availablePapers = ref([])

const searchQuery = ref('')
const statusFilter = ref('ALL')

const isNewPilotModalOpen = ref(false)
const selectedSessionForDrawer = ref(null)

const newPilot = ref({
  title: '',
  course_code: '',
  exam_paper_id: '',
  access_code: '',
  candidates_count: 30
})

// 2. Lifecycle: Load Actual Local Data
onMounted(() => {
  // Load saved sessions from localStorage
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      pilotSessions.value = JSON.parse(saved)
    } catch (e) {
      pilotSessions.value = []
    }
  }

  // Load existing courses/papers saved locally in other views
  const savedCourses = localStorage.getItem('cams_courses') || localStorage.getItem('cams_exam_papers')
  if (savedCourses) {
    try {
      availablePapers.value = JSON.parse(savedCourses)
    } catch (e) {
      availablePapers.value = []
    }
  }
})

// Helper to persist updates to localStorage
function persistData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pilotSessions.value))
}

// 3. Computed Metrics & Filters
const activeSessionsCount = computed(() => {
  return pilotSessions.value.filter(s => s.status === 'Active').length
})

const totalCadetsCount = computed(() => {
  return pilotSessions.value.reduce((acc, s) => acc + (s.candidates_count || 0), 0)
})

const totalAlertsCount = computed(() => {
  return pilotSessions.value.reduce((acc, s) => acc + (s.telemetryLogs ? s.telemetryLogs.length : 0), 0)
})

const filteredSessions = computed(() => {
  return pilotSessions.value.filter(session => {
    const matchesSearch = 
      session.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      session.course_code.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      session.access_code.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesStatus = statusFilter.value === 'ALL' || session.status === statusFilter.value

    return matchesSearch && matchesStatus
  })
})

// 4. Action Handlers
function handleCreatePilot() {
  if (!newPilot.value.title || !newPilot.value.access_code) return

  const createdSession = {
    id: Date.now(),
    title: newPilot.value.title,
    course_code: newPilot.value.course_code || 'GEN-101',
    access_code: newPilot.value.access_code.toUpperCase(),
    candidates_count: Number(newPilot.value.candidates_count) || 20,
    completed_count: 0,
    status: 'Active',
    scheduled_time: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    telemetryLogs: []
  }

  pilotSessions.value.unshift(createdSession)
  persistData()

  // Reset form & close modal
  newPilot.value = { title: '', course_code: '', exam_paper_id: '', access_code: '', candidates_count: 30 }
  isNewPilotModalOpen.value = false
}

function toggleStatus(session) {
  if (session.status === 'Active') {
    session.status = 'Paused'
  } else if (session.status === 'Paused') {
    session.status = 'Active'
  }
  persistData()
}

function deleteSession(sessionId) {
  if (confirm('Are you sure you want to delete this pilot session?')) {
    pilotSessions.value = pilotSessions.value.filter(s => s.id !== sessionId)
    persistData()
  }
}

function inspectSession(session) {
  selectedSessionForDrawer.value = session
}

function toggleCadetLock(log) {
  log.is_locked = !log.is_locked
  persistData()
}

// Real-time alert simulation on user-created active session
function simulateCadetViolation() {
  const activeSession = pilotSessions.value.find(s => s.status === 'Active')
  if (activeSession) {
    if (!activeSession.telemetryLogs) activeSession.telemetryLogs = []
    activeSession.telemetryLogs.unshift({
      id: Date.now(),
      cadet_name: 'Cadet Student ' + Math.floor(100 + Math.random() * 900),
      student_id: '2026-' + Math.floor(1000 + Math.random() * 9000),
      event: 'Browser Tab Switch / Window Blur Detected',
      severity: 'High',
      is_locked: false,
      logged_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    persistData()
  }
}
</script>

<style scoped>
.pilot-admin-container {
  padding: 24px;
  max-width: 1240px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #1e293b;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
}

.page-header p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* KPI Summary Metric Cards */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.metric-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.metric-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.metric-value {
  font-size: 26px;
  font-weight: 700;
  margin-top: 4px;
  color: #0f172a;
}

.text-blue { color: #2563eb; }
.text-red { color: #dc2626; }

/* Search & Filters */
.filter-bar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.search-box {
  flex: 1;
}

.search-box input, .filter-options select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
  background-color: #ffffff;
}

.filter-options select {
  width: 180px;
}

/* Data Table Styling */
.table-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.sessions-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.sessions-table th, .sessions-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
}

.sessions-table th {
  background: #f8fafc;
  color: #475569;
  font-weight: 600;
  font-size: 13px;
}

.session-title {
  display: block;
  font-weight: 600;
  color: #0f172a;
}

.session-time {
  font-size: 12px;
  color: #94a3b8;
}

.code-badge {
  background: #f1f5f9;
  padding: 3px 8px;
  border-radius: 4px;
  font-family: monospace;
  color: #334155;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.status-badge.active { background: #dcfce7; color: #15803d; }
.status-badge.paused { background: #fef9c3; color: #a16207; }
.status-badge.completed { background: #f1f5f9; color: #475569; }

.alert-count.has-alerts { color: #dc2626; font-weight: 600; }
.alert-count.clean { color: #16a34a; }

.action-cells { display: flex; gap: 6px; align-items: center; }

/* Buttons */
.btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-primary { background: #2563eb; color: #ffffff; }
.btn-primary:hover:not(:disabled) { background: #1d4ed8; }

.btn-secondary { background: #f1f5f9; color: #334155; }
.btn-secondary:hover:not(:disabled) { background: #e2e8f0; }

.btn-sm {
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  border: 1px solid transparent;
  font-weight: 500;
}

.btn-outline { border-color: #cbd5e1; background: transparent; color: #334155; }
.btn-outline:hover { background: #f8fafc; }
.btn-info { background: #e0f2fe; color: #0369a1; }
.btn-info:hover { background: #bae6fd; }
.btn-danger { background: transparent; color: #ef4444; border: 1px solid #fee2e2; }
.btn-danger:hover { background: #fee2e2; }

/* Modals & Overlay */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content, .drawer-content {
  background: #ffffff;
  border-radius: 10px;
  padding: 24px;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
}

.drawer-content {
  max-width: 620px;
  max-height: 85vh;
  overflow-y: auto;
}

.modal-header, .drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.modal-header h2, .drawer-header h3 {
  margin: 0;
  font-size: 18px;
  color: #0f172a;
}

.drawer-subtitle {
  margin: 4px 0 0 0;
  font-size: 13px;
  color: #64748b;
}

.close-btn {
  background: none;
  border: none;
  font-size: 22px;
  color: #94a3b8;
  cursor: pointer;
}

.close-btn:hover { color: #0f172a; }

.form-group { margin-bottom: 16px; }
.form-row { display: flex; gap: 12px; }
.form-row .form-group { flex: 1; }

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}

.form-group input, .form-group select {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  box-sizing: border-box;
  font-size: 14px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

/* Telemetry Logs Cards */
.logs-list { display: flex; flex-direction: column; gap: 12px; }

.log-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: 6px;
  border-left: 4px solid #cbd5e1;
  background: #f8fafc;
}

.log-card.high { border-left-color: #ef4444; background: #fef2f2; }
.log-card.medium { border-left-color: #f59e0b; background: #fffbeb; }
.log-card.is-locked { opacity: 0.5; }

.log-info h4 { margin: 4px 0; font-size: 14px; }
.event-desc { margin: 2px 0; font-size: 13px; color: #475569; }
.timestamp { font-size: 11px; color: #94a3b8; }

.severity-tag {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
}

.high .severity-tag { background: #fee2e2; color: #991b1b; }
.medium .severity-tag { background: #fef3c7; color: #92400e; }

.btn-lock { background: #fee2e2; color: #991b1b; }
.btn-unlock { background: #dcfce7; color: #166534; }

/* Empty States */
.empty-state-card {
  text-align: center;
  padding: 48px 24px;
  color: #64748b;
}

.empty-icon { font-size: 36px; margin-bottom: 12px; }
.empty-state-card h3, .empty-state-card h4 { color: #1e293b; margin: 0 0 8px 0; }
.empty-state-card p { font-size: 14px; margin-bottom: 20px; max-width: 420px; margin-left: auto; margin-right: auto; }
</style>