<template>
  <div class="pilot-admin-container">
    <!-- Header Controls -->
    <header class="header">
      <div>
        <h1>Pilot Administration Dashboard</h1>
        <p>Monitor live proctored examination sessions and candidate security alerts.</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="simulateCadetViolation">
          ⚡ Test Live Alert
        </button>
        <button class="btn btn-primary" @click="isNewPilotModalOpen = true">
          + Schedule Pilot Session
        </button>
      </div>
    </header>

    <!-- Sessions Data Table -->
    <div class="table-card">
      <table class="sessions-table">
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
          <tr v-for="session in pilotSessions" :key="session.id">
            <td>
              <span class="session-title">{{ session.title }}</span>
              <span class="session-time">{{ session.scheduled_time }}</span>
            </td>
            <td><code>{{ session.course_code }}</code></td>
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
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal: Schedule New Pilot Session -->
    <div v-if="isNewPilotModalOpen" class="modal-overlay" @click.self="isNewPilotModalOpen = false">
      <div class="modal-content">
        <h2>Schedule New Pilot Session</h2>
        <form @submit.prevent="handleCreatePilot">
          <div class="form-group">
            <label>Session Title *</label>
            <input v-model="newPilot.title" type="text" placeholder="e.g. NAV-101 Midterm Exam" required />
          </div>

          <div class="form-group">
            <label>Course Code</label>
            <input v-model="newPilot.course_code" type="text" placeholder="e.g. NAV-101" />
          </div>

          <div class="form-group">
            <label>Access Code *</label>
            <input v-model="newPilot.access_code" type="text" placeholder="e.g. NAV-8842" required />
          </div>

          <div class="form-group">
            <label>Exam Paper</label>
            <select v-model="newPilot.exam_paper_id">
              <option value="">Select Exam Paper...</option>
              <option v-for="paper in availablePapers" :key="paper.id" :value="paper.id">
                {{ paper.paper_code }} — {{ paper.title }} ({{ paper.item_count }} items)
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Expected Candidates Count</label>
            <input v-model="newPilot.candidates_count" type="number" min="1" />
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="isNewPilotModalOpen = false">Cancel</button>
            <button type="submit" class="btn btn-primary">Launch Session</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal / Drawer: Telemetry Logs Inspector -->
    <div v-if="selectedSessionForDrawer" class="modal-overlay" @click.self="selectedSessionForDrawer = null">
      <div class="drawer-content">
        <div class="drawer-header">
          <h3>Security & Telemetry Logs: {{ selectedSessionForDrawer.title }}</h3>
          <button class="close-btn" @click="selectedSessionForDrawer = null">&times;</button>
        </div>

        <div v-if="selectedSessionForDrawer.telemetryLogs.length === 0" class="empty-state">
          <p>No security violations or flags logged for this session.</p>
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
import { ref, computed } from 'vue'

// 1. Available Exam Papers for the Selection Dropdown
const availablePapers = ref([
  { id: 1, paper_code: 'PAPER-NAV101-A', title: 'NAV-101 Terrestrial Navigation Midterm', item_count: 60 },
  { id: 2, paper_code: 'PAPER-ENG202-B', title: 'ENG-202 Auxiliary Machinery Assessment', item_count: 50 },
  { id: 3, paper_code: 'PAPER-MAR301-A', title: 'MAR-301 Maritime Law & STCW Rules', item_count: 40 }
])

// 2. Local Reactive Pilot Sessions Data
const pilotSessions = ref([
  {
    id: 1,
    title: 'NAV-101 Midterm Examination 2026',
    course_code: 'NAV-101',
    access_code: 'NAV-8842',
    candidates_count: 45,
    completed_count: 12,
    status: 'Active',
    scheduled_time: '2026-10-08 09:00:00',
    telemetryLogs: [
      { id: 101, cadet_name: 'Cadet Juan Dela Cruz', student_id: '2023-0142', event: 'Browser Tab Switched (3x)', severity: 'High', is_locked: false, logged_at: '10:14 AM' },
      { id: 102, cadet_name: 'Cadet Maria Santos', student_id: '2023-0189', event: 'Second Display Detected', severity: 'Medium', is_locked: false, logged_at: '10:22 AM' }
    ]
  },
  {
    id: 2,
    title: 'ENG-202 Engine Room Operations',
    course_code: 'ENG-202',
    access_code: 'ENG-3310',
    candidates_count: 30,
    completed_count: 30,
    status: 'Completed',
    scheduled_time: '2026-10-07 14:00:00',
    telemetryLogs: []
  }
])

// 3. UI State Modals & Drawers
const isNewPilotModalOpen = ref(false)
const selectedSessionForDrawer = ref(null)

// 4. Form Model for New Pilot Creation
const newPilot = ref({
  title: '',
  course_code: '',
  exam_paper_id: '',
  access_code: '',
  candidates_count: 20
})

// 5. Actions & Handlers
function handleCreatePilot() {
  if (!newPilot.value.title || !newPilot.value.access_code) return

  pilotSessions.value.unshift({
    id: Date.now(),
    title: newPilot.value.title,
    course_code: newPilot.value.course_code || 'GEN-101',
    access_code: newPilot.value.access_code,
    candidates_count: Number(newPilot.value.candidates_count),
    completed_count: 0,
    status: 'Active',
    scheduled_time: new Date().toLocaleString(),
    telemetryLogs: []
  })

  // Reset form & close modal
  newPilot.value = { title: '', course_code: '', exam_paper_id: '', access_code: '', candidates_count: 20 }
  isNewPilotModalOpen.value = false
}

function toggleStatus(session) {
  if (session.status === 'Active') {
    session.status = 'Paused'
  } else if (session.status === 'Paused') {
    session.status = 'Active'
  }
}

function inspectSession(session) {
  selectedSessionForDrawer.value = session
}

function toggleCadetLock(log) {
  log.is_locked = !log.is_locked
}

// Simulated real-time alert trigger for testing
function simulateCadetViolation() {
  if (pilotSessions.value.length === 0) return
  const activeSession = pilotSessions.value.find(s => s.status === 'Active')
  if (activeSession) {
    activeSession.telemetryLogs.unshift({
      id: Date.now(),
      cadet_name: 'Cadet Alex Reyes',
      student_id: '2023-0999',
      event: 'Forbidden Clipboard Copy Triggered',
      severity: 'High',
      is_locked: false,
      logged_at: new Date().toLocaleTimeString()
    })
  }
}
</script>

<style scoped>
.pilot-admin-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: system-ui, -apple-system, sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header h1 {
  margin: 0 0 4px 0;
  font-size: 24px;
  color: #1e293b;
}

.header p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.table-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.sessions-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.sessions-table th, .sessions-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #e2e8f0;
  font-size: 14px;
}

.sessions-table th {
  background: #f8fafc;
  color: #475569;
  font-weight: 600;
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
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.active { background: #dcfce7; color: #15803d; }
.status-badge.paused { background: #fef9c3; color: #a16207; }
.status-badge.completed { background: #f1f5f9; color: #475569; }

.alert-count.has-alerts { color: #dc2626; font-weight: 600; }
.alert-count.clean { color: #16a34a; }

.action-cells { display: flex; gap: 8px; }

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary { background: #2563eb; color: #ffffff; }
.btn-primary:hover