<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Sparkles, 
  Sliders, 
  Trash2, 
  Plus, 
  Search, 
  X, 
  BookOpen, 
  Layers, 
  List, 
  FileText, 
  Eye, 
  Calendar, 
  RotateCcw, 
  CheckCircle2, 
  Users, 
  Clock, 
  ShieldAlert, 
  Play, 
  Pause, 
  Key,
  ChevronRight
} from 'lucide-vue-next'

const router = useRouter()

// Registry of Saved Tests (built in TestBuilderView)
const savedTests = ref([])

// Pilot Sessions Registry
const pilotSessions = ref([])

// UI & Modal States
const isScheduleModalOpen = ref(false)
const isTelemetryModalOpen = ref(false)
const selectedSessionTelemetry = ref(null)

// Search & Filter States
const searchQuery = ref('')
const statusFilter = ref('')
const courseFilter = ref('')
const sortBy = ref('newest')

// Schedule Session Form State
const selectedTestId = ref('')
const sessionForm = ref({
  title: '',
  courseCode: '',
  program: '',
  accessCode: '',
  linkedTestId: null,
  expectedCandidates: 20,
  durationMinutes: 60,
  passingScorePercent: 75,
  scheduledDate: new Date().toISOString().slice(0, 10)
})

// Safe LocalStorage Parser
function safeParseStorage(key) {
  try {
    const val = localStorage.getItem(key)
    return val && val.trim() ? JSON.parse(val) : null
  } catch (e) {
    console.error(`Failed to parse localStorage key "${key}":`, e)
    return null
  }
}

// Load Saved Tests built from TestBuilderView
function loadSavedTests() {
  const loaded = safeParseStorage('cams_saved_tests')
  if (loaded && Array.isArray(loaded)) {
    savedTests.value = loaded
  } else {
    savedTests.value = []
  }
}

// Load Pilot Sessions from LocalStorage (or default initial dataset)
function loadPilotSessions() {
  const loaded = safeParseStorage('cams_pilot_sessions')
  if (loaded && Array.isArray(loaded)) {
    pilotSessions.value = loaded
  } else {
    // Initial sample session
    pilotSessions.value = [
      {
        id: Date.now(),
        title: 'NAV-101 Midterm Examination',
        courseCode: 'NAV-101',
        program: 'BSMT',
        accessCode: 'NAV-8842',
        linkedTestId: null,
        linkedTestTitle: 'NAV-101 Midterm Examination Blueprint',
        expectedCandidates: 24,
        activeCandidates: 22,
        durationMinutes: 60,
        passingScorePercent: 75,
        totalItems: 30,
        totalPoints: 30,
        status: 'Active',
        flaggedAlerts: 1,
        createdAt: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      }
    ]
    saveSessionsToStorage()
  }
}

function saveSessionsToStorage() {
  localStorage.setItem('cams_pilot_sessions', JSON.stringify(pilotSessions.value))
}

// Auto Generate Random Access Code
function generateAccessCode(course = 'PLT') {
  const prefix = course ? course.split(' ')[0].toUpperCase() : 'PLT'
  const randomNum = Math.floor(1000 + Math.random() * 9000)
  return `${prefix}-${randomNum}`
}

// Handle Test Selection from TestBuilder Saved Tests Dropdown
function onTestSelectionChange() {
  if (!selectedTestId.value) {
    sessionForm.value.linkedTestId = null
    return
  }

  const foundTest = savedTests.value.find(t => String(t.id) === String(selectedTestId.value))
  if (foundTest) {
    sessionForm.value.linkedTestId = foundTest.id
    sessionForm.value.title = foundTest.title || `${foundTest.course} Pilot Session`
    sessionForm.value.courseCode = foundTest.course || ''
    sessionForm.value.program = foundTest.program || ''
    sessionForm.value.durationMinutes = foundTest.durationMinutes || 60
    sessionForm.value.passingScorePercent = foundTest.passingScorePercent || 75
    sessionForm.value.accessCode = generateAccessCode(foundTest.course)
  }
}

// Reset Modal Form
function resetScheduleForm() {
  selectedTestId.value = ''
  sessionForm.value = {
    title: '',
    courseCode: '',
    program: '',
    accessCode: generateAccessCode('NAV'),
    linkedTestId: null,
    expectedCandidates: 20,
    durationMinutes: 60,
    passingScorePercent: 75,
    scheduledDate: new Date().toISOString().slice(0, 10)
  }
}

function openScheduleModal() {
  loadSavedTests()
  resetScheduleForm()
  isScheduleModalOpen.value = true
}

// Schedule / Launch New Session
function launchSession() {
  if (!sessionForm.value.title.trim() || !sessionForm.value.courseCode.trim()) {
    alert('Please enter a Session Title and Course Code.')
    return
  }

  const linkedTest = savedTests.value.find(t => String(t.id) === String(sessionForm.value.linkedTestId))

  const newSession = {
    id: Date.now(),
    title: sessionForm.value.title,
    courseCode: sessionForm.value.courseCode,
    program: sessionForm.value.program || (linkedTest ? linkedTest.program : 'BSMT'),
    accessCode: sessionForm.value.accessCode || generateAccessCode(sessionForm.value.courseCode),
    linkedTestId: linkedTest ? linkedTest.id : null,
    linkedTestTitle: linkedTest ? linkedTest.title : 'Direct Session (No Linked Paper)',
    expectedCandidates: Number(sessionForm.value.expectedCandidates) || 0,
    activeCandidates: 0,
    durationMinutes: Number(sessionForm.value.durationMinutes) || 60,
    passingScorePercent: Number(sessionForm.value.passingScorePercent) || 75,
    totalItems: linkedTest ? (linkedTest.totalItems || (linkedTest.items ? linkedTest.items.length : 0)) : 0,
    totalPoints: linkedTest ? (linkedTest.totalPoints || 0) : 0,
    status: 'Scheduled',
    flaggedAlerts: 0,
    createdAt: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  pilotSessions.value.unshift(newSession)
  saveSessionsToStorage()
  isScheduleModalOpen.value = false
  alert(`Pilot Examination Session "${newSession.title}" scheduled successfully!`)
}

// Toggle Session Status (Scheduled -> Active -> Suspended / Completed)
function updateSessionStatus(session, newStatus) {
  session.status = newStatus
  if (newStatus === 'Active' && session.activeCandidates === 0) {
    session.activeCandidates = session.expectedCandidates
  }
  saveSessionsToStorage()
}

function deleteSession(id) {
  if (confirm('Are you sure you want to delete this pilot administration session?')) {
    pilotSessions.value = pilotSessions.value.filter(s => s.id !== id)
    saveSessionsToStorage()
  }
}

function openTelemetryModal(session) {
  selectedSessionTelemetry.value = session
  isTelemetryModalOpen.value = true
}

// Computed Statistics
const activeSessionsCount = computed(() => pilotSessions.value.filter(s => s.status === 'Active').length)
const totalCandidatesEnrolled = computed(() => pilotSessions.value.reduce((sum, s) => sum + (Number(s.expectedCandidates) || 0), 0))
const totalFlaggedAlerts = computed(() => pilotSessions.value.reduce((sum, s) => sum + (Number(s.flaggedAlerts) || 0), 0))

const uniqueCourses = computed(() => [...new Set(pilotSessions.value.map(s => s.courseCode).filter(Boolean))].sort())

// Filtered Pilot Sessions List
const filteredSessions = computed(() => {
  let result = [...pilotSessions.value]

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(s => 
      s.title.toLowerCase().includes(q) ||
      s.courseCode.toLowerCase().includes(q) ||
      s.accessCode.toLowerCase().includes(q) ||
      (s.linkedTestTitle && s.linkedTestTitle.toLowerCase().includes(q))
    )
  }

  if (statusFilter.value) {
    result = result.filter(s => s.status === statusFilter.value)
  }

  if (courseFilter.value) {
    result = result.filter(s => s.courseCode === courseFilter.value)
  }

  if (sortBy.value === 'newest') {
    result.sort((a, b) => b.id - a.id)
  } else if (sortBy.value === 'oldest') {
    result.sort((a, b) => a.id - b.id)
  } else if (sortBy.value === 'title_asc') {
    result.sort((a, b) => a.title.localeCompare(b.title))
  }

  return result
})

function resetFilters() {
  searchQuery.value = ''
  statusFilter.value = ''
  courseFilter.value = ''
  sortBy.value = 'newest'
}

onMounted(() => {
  loadSavedTests()
  loadPilotSessions()
})
</script>

<template>
  <div class="p-6 md:p-8 space-y-6 min-h-screen bg-[#f4f6f9] text-slate-800">
    <!-- Header Banner - Standardized Theme matching TestBuilderView -->
    <div class="bg-[#123524] text-white p-6 rounded-2xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shadow-sm">
      <div class="space-y-1">
        <h1 class="text-xl font-bold flex items-center gap-2 text-white tracking-tight">
          Pilot Administration Dashboard
        </h1>
        <p class="text-xs text-white/80 font-normal">
          Monitor live proctored examination sessions, manage access codes, and stream real-time candidate security telemetry.
        </p>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <button 
          @click="openScheduleModal"
          class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition shadow-sm cursor-pointer"
        >
          <Plus :size="15" />
          <span>Schedule Pilot Session</span>
        </button>
      </div>
    </div>

    <!-- Analytics / Telemetry Overview Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
        <div class="flex justify-between items-center text-slate-500">
          <span class="text-xs font-bold uppercase tracking-wider">Active Pilot Sessions</span>
          <div class="p-2 bg-emerald-50 rounded-xl text-emerald-700">
            <Play :size="16" />
          </div>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-black text-slate-900 font-mono">{{ activeSessionsCount }}</span>
          <span class="text-[11px] text-emerald-700 font-semibold">Sessions Live</span>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
        <div class="flex justify-between items-center text-slate-500">
          <span class="text-xs font-bold uppercase tracking-wider">Total Cadets Enrolled</span>
          <div class="p-2 bg-blue-50 rounded-xl text-blue-700">
            <Users :size="16" />
          </div>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-black text-slate-900 font-mono">{{ totalCandidatesEnrolled }}</span>
          <span class="text-[11px] text-slate-500 font-semibold">Candidates</span>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
        <div class="flex justify-between items-center text-slate-500">
          <span class="text-xs font-bold uppercase tracking-wider">Flagged Security Alerts</span>
          <div class="p-2 bg-amber-50 rounded-xl text-amber-700">
            <ShieldAlert :size="16" />
          </div>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-black text-slate-900 font-mono" :class="totalFlaggedAlerts > 0 ? 'text-amber-600' : 'text-slate-900'">
            {{ totalFlaggedAlerts }}
          </span>
          <span class="text-[11px] text-slate-500 font-semibold">Alerts Recorded</span>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
        <div class="flex justify-between items-center text-slate-500">
          <span class="text-xs font-bold uppercase tracking-wider">Available Test Papers</span>
          <div class="p-2 bg-indigo-50 rounded-xl text-indigo-700">
            <BookOpen :size="16" />
          </div>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-black text-slate-900 font-mono">{{ savedTests.length }}</span>
          <span class="text-[11px] text-indigo-700 font-semibold">In Test Builder</span>
        </div>
      </div>
    </div>

    <!-- Search, Filter & Controls Bar -->
    <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        <div class="relative lg:col-span-2">
          <Search :size="14" class="absolute left-3 top-3 text-slate-400" />
          <input 
            v-model="searchQuery"
            type="text"
            placeholder="Search by title, course, or access code..."
            class="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          />
        </div>

        <div>
          <select 
            v-model="statusFilter"
            class="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>

        <div>
          <select 
            v-model="courseFilter"
            class="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="">All Courses</option>
            <option v-for="c in uniqueCourses" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>

        <div>
          <select 
            v-model="sortBy"
            class="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl outline-none font-semibold focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="title_asc">Sort: Title A-Z</option>
          </select>
        </div>
      </div>

      <div class="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
        <span class="text-slate-500 font-medium">
          Showing <strong class="text-slate-800 font-bold">{{ filteredSessions.length }}</strong> of {{ pilotSessions.length }} session(s)
        </span>

        <button 
          v-if="searchQuery || statusFilter || courseFilter || sortBy !== 'newest'"
          @click="resetFilters"
          class="text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw :size="12" />
          <span>Clear Filters</span>
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredSessions.length === 0" class="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-sm">
      <div class="p-3 bg-slate-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto text-slate-400">
        <List :size="24" />
      </div>
      <h3 class="text-sm font-bold text-slate-800">No Pilot Sessions Found</h3>
      <p class="text-xs text-slate-500 max-w-sm mx-auto">
        No active or scheduled sessions match your current criteria. Schedule a new session using an examination paper from the Test Builder.
      </p>
      <button 
        @click="openScheduleModal"
        class="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition cursor-pointer"
      >
        Schedule New Session
      </button>
    </div>

    <!-- Pilot Sessions List View -->
    <div v-else class="space-y-3">
      <div 
        v-for="session in filteredSessions" 
        :key="session.id"
        class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div class="space-y-1.5 flex-1">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="px-2.5 py-0.5 bg-slate-900 text-white font-mono text-[10px] font-bold rounded">
              {{ session.program || 'BSMT' }}
            </span>

            <span 
              :class="[
                'text-[10px] font-bold px-2.5 py-0.5 rounded border',
                session.status === 'Active' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                session.status === 'Scheduled' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                session.status === 'Completed' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                'bg-red-50 text-red-700 border-red-200'
              ]"
            >
              {{ session.status }}
            </span>

            <span class="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded flex items-center gap-1">
              <Key :size="11" class="text-slate-400" />
              <span>Access Code: <strong class="text-slate-900">{{ session.accessCode }}</strong></span>
            </span>

            <span class="text-[11px] font-bold text-slate-400 flex items-center gap-1 font-mono">
              <Calendar :size="12" />
              <span>Created: {{ session.createdAt }}</span>
            </span>
          </div>

          <h3 class="text-base font-bold text-slate-900 leading-snug">{{ session.title }}</h3>

          <div class="text-xs text-slate-500 font-medium space-y-0.5">
            <p>Course: <strong class="text-emerald-800 font-bold">{{ session.courseCode }}</strong></p>
            <p v-if="session.linkedTestTitle" class="text-[11px] text-slate-400 flex items-center gap-1">
              <FileText :size="12" class="text-emerald-700" />
              <span>Linked Paper: <strong class="text-slate-700">{{ session.linkedTestTitle }}</strong></span>
            </p>
          </div>
        </div>

        <!-- Metadata Stats Pills -->
        <div class="flex items-center gap-3 shrink-0 text-xs">
          <div class="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-center">
            <span class="block text-[10px] text-slate-400 font-bold uppercase">Candidates</span>
            <span class="font-bold text-slate-800 font-mono text-xs">{{ session.activeCandidates }} / {{ session.expectedCandidates }}</span>
          </div>

          <div class="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-center">
            <span class="block text-[10px] text-slate-400 font-bold uppercase">Paper Specs</span>
            <span class="font-bold text-emerald-700 font-mono text-xs">{{ session.totalItems }} Qs ({{ session.totalPoints }} pts)</span>
          </div>

          <div class="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-center">
            <span class="block text-[10px] text-slate-400 font-bold uppercase">Duration</span>
            <span class="font-bold text-slate-800 text-xs">{{ session.durationMinutes }} Mins</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4 shrink-0">
          <button 
            v-if="session.status === 'Scheduled'"
            @click="updateSessionStatus(session, 'Active')"
            class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Launch Pilot Session"
          >
            <Play :size="14" />
            <span>Launch</span>
          </button>

          <button 
            v-else-if="session.status === 'Active'"
            @click="updateSessionStatus(session, 'Suspended')"
            class="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Pause/Suspend Session"
          >
            <Pause :size="14" />
            <span>Suspend</span>
          </button>

          <button 
            v-else-if="session.status === 'Suspended'"
            @click="updateSessionStatus(session, 'Active')"
            class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Play :size="14" />
            <span>Resume</span>
          </button>

          <button 
            @click="openTelemetryModal(session)"
            class="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            title="View Real-time Security Telemetry"
          >
            <Eye :size="14" />
            <span>Telemetry</span>
          </button>

          <button 
            @click="deleteSession(session.id)"
            class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
            title="Delete Pilot Session"
          >
            <Trash2 :size="16" />
          </button>
        </div>
      </div>
    </div>

    <!-- SCHEDULE NEW PILOT SESSION MODAL -->
    <div v-if="isScheduleModalOpen" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-lg w-full flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        
        <!-- Modal Header -->
        <div class="p-5 bg-slate-900 text-white flex justify-between items-center">
          <div class="flex items-center gap-2.5">
            <Sliders :size="18" class="text-emerald-400" />
            <div>
              <h3 class="text-base font-bold text-white">Schedule New Pilot Session</h3>
              <p class="text-xs text-slate-300">Link an examination paper created in the Test Builder.</p>
            </div>
          </div>
          <button @click="isScheduleModalOpen = false" class="text-slate-400 hover:text-white transition cursor-pointer">
            <X :size="20" />
          </button>
        </div>

        <!-- Form Body -->
        <div class="p-6 space-y-4 text-xs">
          
          <!-- LINK TEST PAPER DROPDOWN (Primary Selector) -->
          <div>
            <label class="block font-bold text-slate-800 mb-1">
              Select Examination Paper (Built in Test Builder)
            </label>
            <select 
              v-model="selectedTestId"
              @change="onTestSelectionChange"
              class="w-full text-xs p-2.5 border border-slate-300 rounded-xl font-semibold bg-emerald-50/50 text-emerald-900 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
            >
              <option value="">-- Direct Creation (No Linked Paper) --</option>
              <option v-for="test in savedTests" :key="test.id" :value="test.id">
                {{ test.title }} ({{ test.course }} - {{ test.totalItems || 0 }} Items)
              </option>
            </select>
            <p class="text-[11px] text-slate-500 mt-1">
              Selecting a test paper automatically populates session title, course code, duration, and passing marks.
            </p>
          </div>

          <!-- Session Title -->
          <div>
            <label class="block font-bold text-slate-700 mb-1">Session Title *</label>
            <input 
              v-model="sessionForm.title"
              type="text"
              placeholder="e.g. NAV-101 Midterm Examination"
              class="w-full text-xs p-2.5 border border-slate-300 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <!-- Course Code & Access Code -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Course Code *</label>
              <input 
                v-model="sessionForm.courseCode"
                type="text"
                placeholder="e.g. NAV-101"
                class="w-full text-xs p-2.5 border border-slate-300 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Access Code *</label>
              <div class="relative">
                <input 
                  v-model="sessionForm.accessCode"
                  type="text"
                  placeholder="e.g. NAV-8842"
                  class="w-full text-xs p-2.5 border border-slate-300 rounded-xl font-mono font-bold bg-slate-50 outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button 
                  type="button"
                  @click="sessionForm.accessCode = generateAccessCode(sessionForm.courseCode)"
                  class="absolute right-2 top-2 text-[10px] font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-2 py-1 rounded transition cursor-pointer"
                >
                  Regen
                </button>
              </div>
            </div>
          </div>

          <!-- Candidates & Duration -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Expected Candidates Count</label>
              <input 
                v-model.number="sessionForm.expectedCandidates"
                type="number"
                min="1"
                class="w-full text-xs p-2.5 border border-slate-300 rounded-xl font-semibold text-center outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Duration (Minutes)</label>
              <input 
                v-model.number="sessionForm.durationMinutes"
                type="number"
                min="1"
                class="w-full text-xs p-2.5 border border-slate-300 rounded-xl font-semibold text-center outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

        </div>

        <!-- Modal Footer -->
        <div class="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button 
            @click="isScheduleModalOpen = false"
            class="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition cursor-pointer"
          >
            Cancel
          </button>
          <button 
            @click="launchSession"
            class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer flex items-center gap-1.5"
          >
            <Play :size="14" />
            <span>Launch Session</span>
          </button>
        </div>

      </div>
    </div>

    <!-- SECURITY TELEMETRY MODAL -->
    <div v-if="isTelemetryModalOpen && selectedSessionTelemetry" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-2xl w-full flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        
        <div class="p-5 bg-slate-900 text-white flex justify-between items-center">
          <div class="flex items-center gap-2">
            <ShieldAlert :size="20" class="text-amber-400" />
            <div>
              <h3 class="text-base font-bold text-white">{{ selectedSessionTelemetry.title }}</h3>
              <p class="text-xs text-slate-300">Proctoring Telemetry Stream & Candidate Security Logs</p>
            </div>
          </div>
          <button @click="isTelemetryModalOpen = false" class="text-slate-400 hover:text-white transition cursor-pointer">
            <X :size="20" />
          </button>
        </div>

        <div class="p-6 space-y-4 text-xs bg-slate-50">
          <div class="grid grid-cols-3 gap-3">
            <div class="bg-white p-3 rounded-xl border border-slate-200 text-center">
              <span class="block text-[10px] text-slate-400 font-bold uppercase">Active Candidates</span>
              <span class="font-bold text-slate-800 text-sm font-mono">{{ selectedSessionTelemetry.activeCandidates }} / {{ selectedSessionTelemetry.expectedCandidates }}</span>
            </div>
            <div class="bg-white p-3 rounded-xl border border-slate-200 text-center">
              <span class="block text-[10px] text-slate-400 font-bold uppercase">Security Status</span>
              <span class="font-bold text-emerald-700 text-sm">Secure (Proctored)</span>
            </div>
            <div class="bg-white p-3 rounded-xl border border-slate-200 text-center">
              <span class="block text-[10px] text-slate-400 font-bold uppercase">Flagged Events</span>
              <span class="font-bold text-amber-600 text-sm font-mono">{{ selectedSessionTelemetry.flaggedAlerts }}</span>
            </div>
          </div>

          <div class="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
            <h4 class="font-bold text-slate-800 flex items-center gap-1.5">
              <Clock :size="14" class="text-emerald-700" />
              Recent Candidate Audit Events
            </h4>

            <div v-if="selectedSessionTelemetry.flaggedAlerts === 0" class="p-4 text-center text-slate-400 italic">
              No suspicious tab switches or proctoring alerts detected for this session.
            </div>

            <div v-else class="space-y-2">
              <div class="p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex justify-between items-center">
                <div class="space-y-0.5">
                  <span class="font-bold text-amber-900 block">Focus Loss / Tab Switch Detected</span>
                  <span class="text-[11px] text-amber-700">Cadet #2024-0019 (BSMT) switched focus for 4 seconds</span>
                </div>
                <span class="text-[10px] font-mono text-amber-600 font-bold">10:14:02 AM</span>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 bg-white border-t border-slate-200 flex justify-end">
          <button 
            @click="isTelemetryModalOpen = false"
            class="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Close Telemetry
          </button>
        </div>

      </div>
    </div>
  </div>
</template>