<template>
  <div class="p-4 md:p-6 max-w-8xl mx-auto space-y-6 font-sans text-slate-800 antialiased relative min-h-screen bg-slate-50">
    
    <!-- REACTIVE FLOATING TOAST NOTIFICATION -->
    <Transition name="toast">
      <div 
        v-if="toast.show" 
        class="fixed top-5 right-5 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 border text-sm font-bold max-w-md transition-all duration-300"
        :class="
          toast.type === 'success' ? 'bg-emerald-900 text-white border-emerald-700' :
          toast.type === 'error' ? 'bg-rose-900 text-white border-rose-700' :
          'bg-slate-900 text-white border-slate-700'
        "
      >
        <CheckCircle2 v-if="toast.type === 'success'" class="text-emerald-400 shrink-0" :size="20" />
        <AlertTriangle v-else-if="toast.type === 'error'" class="text-rose-400 shrink-0" :size="20" />
        <Info v-else class="text-blue-400 shrink-0" :size="20" />
        <span class="flex-1">{{ toast.message }}</span>
        <button @click="toast.show = false" class="text-slate-300 hover:text-white cursor-pointer">
          <X :size="16" />
        </button>
      </div>
    </Transition>

    <!-- BRANDED SKELETON LOADER -->
    <div v-if="isLoading" class="space-y-6 animate-pulse">
      <div class="bg-linear-to-r from-[#123524] to-[#1b4d35] p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 bg-emerald-500/30 rounded-md"></div>
            <div class="h-6 w-72 max-w-full bg-white/20 rounded-md"></div>
          </div>
          <div class="h-3.5 w-96 max-w-full bg-white/10 rounded-md"></div>
        </div>
        <div class="h-10 w-44 bg-white/10 rounded-xl"></div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="i in 4" :key="i" class="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs flex justify-between items-start">
          <div class="space-y-2 flex-1">
            <div class="h-3 w-28 bg-slate-200 rounded"></div>
            <div class="h-7 w-16 bg-slate-300 rounded"></div>
            <div class="h-3.5 w-24 bg-emerald-100 rounded"></div>
          </div>
          <div class="w-10 h-10 bg-slate-100 rounded-xl"></div>
        </div>
      </div>
    </div>

    <!-- MAIN DASHBOARD CONTENT -->
    <div v-else class="space-y-6">

      <!-- Header Hero Banner -->
      <div class="bg-[#123524] text-white p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
        <div class="space-y-1">
          <h1 class="text-xl font-bold flex items-center gap-2 text-white tracking-tight">
            <SlidersHorizontal class="text-emerald-400" :size="22" />
            Pilot Administration Dashboard
          </h1>
          <p class="text-sm text-slate-200 font-normal">
            Monitor live proctored examination sessions, manage access codes, and stream real-time candidate security telemetry.
          </p>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button 
            @click="openCreateModal"
            class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
          >
            <Plus :size="16" /> Schedule Pilot Session
          </button>
        </div>
      </div>

      <!-- Stat Metrics Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex justify-between items-start">
          <div>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Pilot Sessions</p>
            <p class="text-2xl font-extrabold text-slate-900 mt-1">{{ totalActive }}</p>
            <p class="text-[11px] text-emerald-700 font-bold mt-1">{{ totalActive }} Sessions Live</p>
          </div>
          <div class="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
            <Play :size="20" />
          </div>
        </div>

        <div class="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex justify-between items-start">
          <div>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Examinee Quota</p>
            <p class="text-2xl font-extrabold text-slate-900 mt-1">{{ totalCadets }} <span class="text-sm font-bold text-slate-400">/ {{ totalTargetExaminees }}</span></p>
            <p class="text-[11px] text-emerald-700 font-bold mt-1">{{ examineeCompletionRate }}% Quota Reached</p>
          </div>
          <div class="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
            <Users :size="20" />
          </div>
        </div>

        <div class="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex justify-between items-start">
          <div>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Flagged Security Alerts</p>
            <p class="text-2xl font-extrabold text-slate-900 mt-1">{{ totalAlerts }}</p>
            <p class="text-[11px] text-amber-700 font-semibold mt-1">{{ totalAlerts }} Alerts Recorded</p>
          </div>
          <div class="p-2.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-100">
            <AlertTriangle :size="20" />
          </div>
        </div>

        <div class="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex justify-between items-start">
          <div>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Available Test Papers</p>
            <p class="text-2xl font-extrabold text-slate-900 mt-1">{{ availableTestPapers.length }}</p>
            <p class="text-[11px] text-emerald-700 font-semibold mt-1">In Test Builder</p>
          </div>
          <div class="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
            <BookOpen :size="20" />
          </div>
        </div>
      </div>

      <!-- Filters & Data Table -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div class="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div class="relative flex-1 w-full">
            <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              v-model="searchQuery"
              type="text"
              placeholder="Search by title, course, or access code..."
              class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <select 
            v-model="selectedStatusFilter" 
            class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none cursor-pointer focus:bg-white focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All Statuses">All Statuses</option>
            <option value="Active">Active</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <!-- PILOT SESSIONS TABLE WITH COLLAPSIBLE EXAMINEES DRAWER -->
        <div class="overflow-x-auto border border-slate-200 rounded-xl">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                <th class="p-3.5">Pilot ID</th>
                <th class="p-3.5">Session Details</th>
                <th class="p-3.5">Access Code</th>
                <th class="p-3.5">Examinees Submitted</th>
                <th class="p-3.5">Status</th>
                <th class="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-sm font-medium text-slate-700">
              <template v-for="s in filteredSessions" :key="s.id">
                
                <!-- MASTER PILOT SESSION ROW -->
                <tr class="hover:bg-slate-50/80 transition-colors">
                  <td class="p-3.5 font-bold font-mono text-slate-900">
                    <button 
                      @click="toggleExpandSession(s.id)" 
                      class="inline-flex items-center gap-1 hover:text-emerald-700 cursor-pointer"
                    >
                      <ChevronDown :size="16" :class="['transition-transform duration-200', expandedSessionIds.has(s.id) ? 'rotate-180 text-emerald-700' : 'text-slate-400']" />
                      <span>{{ s.id }}</span>
                    </button>
                  </td>
                  <td class="p-3.5">
                    <p class="font-bold text-slate-900">{{ s.title }}</p>
                    <p class="text-[11px] text-slate-400 mt-0.5 font-mono font-semibold">{{ s.course_code }}</p>
                  </td>
                  <td class="p-3.5">
                    <span class="px-2.5 py-1 bg-slate-100 border border-slate-200 font-mono text-[11px] font-bold rounded-md text-slate-800">
                      {{ s.access_code }}
                    </span>
                  </td>
                  <td class="p-3.5">
                    <button 
                      @click="toggleExpandSession(s.id)"
                      class="px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition"
                      :class="expandedSessionIds.has(s.id) ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'"
                    >
                      <Users :size="14" class="text-emerald-700" />
                      <span>{{ getSessionSubmissions(s).length }} Examinees</span>
                      <ChevronDown :size="12" :class="['transition-transform', expandedSessionIds.has(s.id) ? 'rotate-180' : '']" />
                    </button>
                  </td>
                  <td class="p-3.5">
                    <span :class="[
                      'px-2.5 py-1 rounded-full text-[11px] font-bold border',
                      s.status === 'In Progress' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                      s.status === 'Active' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                      'bg-slate-100 text-slate-600 border-slate-200'
                    ]">
                      {{ s.status }}
                    </span>
                  </td>
                  <td class="p-3.5 text-right space-x-2">
                    <button 
                      @click="router.push('/reports?tab=post-pilot')"
                      class="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Eye :size="14" /> Analysis
                    </button>
                    <button 
                      @click="deleteSession(s.id)"
                      :disabled="deletingSessionId === s.id"
                      class="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer shadow-xs disabled:opacity-50"
                      title="Remove Session"
                    >
                      <Loader2 v-if="deletingSessionId === s.id" class="animate-spin" :size="14" />
                      <Trash2 v-else :size="14" />
                    </button>
                  </td>
                </tr>

                <!-- COLLAPSIBLE EXAMINEE BREAKDOWN DRAWER -->
                <tr v-if="expandedSessionIds.has(s.id)" class="bg-slate-50/90 border-y border-slate-200">
                  <td colspan="6" class="p-4">
                    <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
                      <div class="flex justify-between items-center pb-2 border-b border-slate-100">
                        <div class="flex items-center gap-2">
                          <Users :size="16" class="text-emerald-700" />
                          <h4 class="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                            Examinees Roster & Exam Telemetry ({{ getSessionSubmissions(s).length }})
                          </h4>
                        </div>
                        <span class="text-xs font-mono font-bold text-slate-500">Access Passcode: {{ s.access_code }}</span>
                      </div>

                      <!-- EXAMINEE SUBMISSIONS TABLE -->
                      <div v-if="getSessionSubmissions(s).length > 0" class="overflow-x-auto border border-slate-200 rounded-xl">
                        <table class="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr class="bg-slate-100 border-b border-slate-200 font-bold text-slate-600 uppercase">
                              <th class="p-2.5">Student Details</th>
                              <th class="p-2.5">Date & Time Submitted</th>
                              <th class="p-2.5">Duration Taken</th>
                              <th class="p-2.5">Total Score</th>
                              <th class="p-2.5">Flagged Questions</th>
                            </tr>
                          </thead>
                          <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
                            <tr v-for="sub in getSessionSubmissions(s)" :key="sub.id" class="hover:bg-slate-50">
                              <td class="p-2.5">
                                <p class="font-bold text-slate-900">{{ sub.cadet_name || sub.cadet_id || 'Student Candidate' }}</p>
                                <p class="text-[11px] text-slate-500 font-mono">ID: {{ sub.cadet_id }} | {{ sub.program || 'BSMT' }} - {{ sub.class_level || '4th Class' }}</p>
                              </td>
                              <td class="p-2.5 font-mono text-slate-600">
                                <div class="flex items-center gap-1">
                                  <Calendar :size="12" class="text-slate-400" />
                                  <span>{{ formatDate(sub.submitted_at) }}</span>
                                </div>
                              </td>
                              <td class="p-2.5 font-mono">
                                <div class="flex items-center gap-1 text-slate-700 font-semibold">
                                  <Clock :size="12" class="text-emerald-600" />
                                  <span>{{ sub.duration_minutes || 1 }} mins</span>
                                </div>
                              </td>
                              <td class="p-2.5">
                                <div class="flex items-center gap-2">
                                  <span class="font-bold text-slate-900">{{ sub.score }} / {{ sub.total_items }}</span>
                                  <span :class="[
                                    'px-2 py-0.5 rounded-md text-[10px] font-extrabold border',
                                    (sub.percentage || 0) >= 75 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                                  ]">
                                    {{ sub.percentage || 0 }}%
                                  </span>
                                </div>
                              </td>
                              <td class="p-2.5">
                                <div v-if="(sub.flagged_count || (sub.flagged_questions && sub.flagged_questions.length) || 0) > 0" class="flex items-center gap-1.5">
                                  <span class="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md font-bold text-[11px] flex items-center gap-1">
                                    <AlertTriangle :size="11" class="text-amber-600" />
                                    {{ sub.flagged_count || sub.flagged_questions.length }} Flagged
                                  </span>
                                  <span v-if="sub.flagged_questions && sub.flagged_questions.length > 0" class="text-[11px] font-mono text-slate-500">
                                    ({{ formatFlaggedItems(sub.flagged_questions) }})
                                  </span>
                                </div>
                                <span v-else class="text-slate-400 font-mono text-[11px]">None</span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div v-else class="p-6 text-center text-slate-400 font-medium">
                        <Users class="w-6 h-6 mx-auto text-slate-300 mb-1" />
                        <p class="text-xs font-bold text-slate-600">No examinee submissions recorded yet</p>
                        <p class="text-[11px] text-slate-400">Examinees taking test passcode <span class="font-mono text-slate-600">{{ s.access_code }}</span> will automatically appear here upon completion.</p>
                      </div>
                    </div>
                  </td>
                </tr>

              </template>

              <tr v-if="filteredSessions.length === 0">
                <td colspan="6" class="p-12 text-center text-slate-400">
                  <SlidersHorizontal class="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p class="font-bold text-slate-700 text-sm">No Pilot Sessions Found</p>
                  <p class="text-sm text-slate-400 mt-1">No active or scheduled sessions match your criteria.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Schedule New Session Modal -->
      <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4 border border-slate-200 overflow-hidden">
          <div class="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <Plus class="text-emerald-700" :size="18" /> Schedule New Pilot Session
            </h3>
            <button @click="showCreateModal = false" class="text-slate-400 hover:text-slate-600 cursor-pointer">
              <X :size="18" />
            </button>
          </div>

          <div class="space-y-3.5 text-sm">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Subject / Course (With Built Test Paper)</label>
              <select 
                v-model="newSession.course_code" 
                class="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white text-slate-900 font-bold cursor-pointer transition"
                :class="availableTestPapers.length === 0 ? 'border-amber-300 bg-amber-50/50 text-amber-900' : 'border-slate-200'"
              >
                <option value="" disabled selected>
                  {{ availableTestPapers.length > 0 ? 'Select Available Course' : '-- No Built Test Papers Found --' }}
                </option>
                <option v-for="c in availableTestPapers" :key="c.code" :value="c.code">
                  {{ c.code }} - {{ c.title }}
                </option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Examination Term</label>
              <select 
                v-model="newSession.term" 
                class="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white text-slate-900 font-bold cursor-pointer"
              >
                <option value="Midterm">Midterm</option>
                <option value="Finals">Finals</option>
                <option value="Prelim">Prelim</option>
                <option value="Semi-Finals">Semi-Finals</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Auto-Generated Session Title</label>
              <input 
                :value="autoSessionTitle" 
                readonly
                placeholder="PLT-COURSE-Term_001" 
                class="w-full p-2.5 border border-slate-200 rounded-xl outline-none bg-slate-100 text-emerald-900 font-mono font-extrabold cursor-not-allowed" 
              />
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Target Examinees Needed</label>
              <input 
                v-model.number="newSession.target_examinees" 
                type="number"
                min="1"
                placeholder="20" 
                class="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white text-slate-900 font-semibold" 
              />
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Access Passcode</label>
              <div class="flex gap-2">
                <input 
                  v-model="newSession.access_code" 
                  class="w-full p-2.5 border border-slate-200 rounded-xl outline-none font-mono font-bold bg-slate-100 text-slate-900 uppercase" 
                  readonly 
                />
                <button 
                  type="button"
                  @click="regenerateCode" 
                  class="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition cursor-pointer flex items-center justify-center shrink-0"
                  title="Regenerate Passcode"
                >
                  <RotateCcw :size="16" />
                </button>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button 
              @click="showCreateModal = false" 
              class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button 
              @click="handleCreateSession" 
              :disabled="isSubmitting || !newSession.course_code || availableTestPapers.length === 0"
              class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Loader2 v-if="isSubmitting" class="animate-spin" :size="16" />
              <span>{{ isSubmitting ? 'Scheduling Session...' : 'Schedule Session' }}</span>
            </button>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  SlidersHorizontal, Plus, Search, 
  Play, Users, AlertTriangle, BookOpen, Eye, X, RotateCcw,
  Loader2, CheckCircle2, Info, Trash2, ChevronDown, Clock, Calendar
} from 'lucide-vue-next'

const router = useRouter()
const isLoading = ref(true)
const isSubmitting = ref(false)
const deletingSessionId = ref(null)

const searchQuery = ref('')
const selectedStatusFilter = ref('All Statuses')

const sessions = ref([])
const allSubmissionsList = ref([])
const availableTestPapers = ref([])
const showCreateModal = ref(false)
const expandedSessionIds = ref(new Set())

const toast = ref({ show: false, message: '', type: 'success' })

function showToast(message, type = 'success', duration = 3500) {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, duration)
}

function toggleExpandSession(sessionId) {
  if (expandedSessionIds.value.has(sessionId)) {
    expandedSessionIds.value.delete(sessionId)
  } else {
    expandedSessionIds.value.add(sessionId)
  }
}

function formatDate(isoStr) {
  if (!isoStr) return 'N/A'
  try {
    return new Date(isoStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  } catch (e) {
    return String(isoStr)
  }
}

function formatFlaggedItems(items) {
  if (!Array.isArray(items) || items.length === 0) return ''
  const formatted = items.map(i => typeof i === 'number' ? `Q${i}` : String(i).startsWith('Q') ? i : `Q${Number(i) + 1}`)
  return formatted.slice(0, 4).join(', ') + (formatted.length > 4 ? ` +${formatted.length - 4} more` : '')
}

const newSession = ref({
  title: '',
  course_code: '',
  term: 'Midterm',
  access_code: '',
  target_examinees: 20
})

const autoSessionTitle = computed(() => {
  if (!newSession.value.course_code) return ''
  const cleanCode = newSession.value.course_code.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  const term = newSession.value.term || 'Midterm'
  const matchingCount = sessions.value.filter(s => 
    s.course_code === newSession.value.course_code && (s.term === term || (s.title && s.title.includes(term)))
  ).length + 1
  const seq = String(matchingCount).padStart(3, '0')
  return `PLT-${cleanCode}-${term}_${seq}`
})

async function sendApiRequest(path, options = {}) {
  const endpoints = ['/api', 'http://127.0.0.1:8000/api', 'http://localhost:8000/api']
  const token = localStorage.getItem('cams_token') || localStorage.getItem('token') || ''

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  }

  for (const baseUrl of endpoints) {
    try {
      const res = await fetch(`${baseUrl}${path}`, { ...options, headers })
      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const data = await res.json()
        return { ok: res.ok, status: res.status, data }
      }
    } catch (e) {}
  }
  throw new Error(`Endpoint ${path} unreachable`)
}

function loadAllSubmissions() {
  let list = []
  try {
    const local = JSON.parse(
      localStorage.getItem('cams_exam_submissions') || 
      localStorage.getItem('exam_submissions') || 
      '[]'
    )
    if (Array.isArray(local)) list.push(...local)
  } catch (_) {}

  allSubmissionsList.value = list
}

function getSessionSubmissions(session) {
  const code = String(session.access_code || session.passcode || '').trim().toUpperCase()
  const courseCode = String(session.course_code || '').trim().toUpperCase()

  return allSubmissionsList.value.filter(sub => {
    const subCode = String(sub.passcode || sub.access_code || sub.test_id || sub.course_code || '').trim().toUpperCase()
    return (code && subCode === code) || (courseCode && subCode === courseCode)
  })
}

async function loadAvailableTestPapers() {
  let loadedList = []

  try {
    const res = await sendApiRequest('/test-blueprints')
    if (res && res.ok) {
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || [])
      if (list.length > 0) {
        loadedList = list.map(t => ({
          code: t.course || t.course_code || t.code || '',
          title: t.title || t.course_title || t.subject_title || 'Built Test Paper',
          items: t.items || t.questions || []
        })).filter(t => t.code)
      }
    }
  } catch (e) {}

  if (loadedList.length === 0) {
    const storageKeys = ['cams_saved_tests', 'cams_test_blueprints', 'cams_blueprints']
    for (const key of storageKeys) {
      const storedData = localStorage.getItem(key)
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData)
          if (Array.isArray(parsed) && parsed.length > 0) {
            const mapped = parsed.map(b => ({
              code: b.course || b.course_code || b.code || '',
              title: b.title || b.course_title || 'Built Test Paper',
              items: b.items || b.questions || []
            })).filter(b => b.code)
            loadedList.push(...mapped)
          }
        } catch (_) {}
      }
    }
  }

  const uniqueCoursesMap = new Map()
  loadedList.forEach(item => {
    if (!uniqueCoursesMap.has(item.code)) {
      uniqueCoursesMap.set(item.code, item)
    }
  })

  availableTestPapers.value = Array.from(uniqueCoursesMap.values())
}

function syncExamineeProgress(sessionsList) {
  sessionsList.forEach(s => {
    const subs = getSessionSubmissions(s)
    s.cadets_count = subs.length
    s.alerts_count = subs.reduce((sum, sub) => sum + (sub.alerts_count || sub.flagged_count || (sub.flagged_questions ? sub.flagged_questions.length : 0)), 0)
  })
}

async function loadSessions() {
  isLoading.value = true
  loadAllSubmissions()

  let localList = []
  try {
    const storageKeys = ['cams_pilot_sessions', 'cams_pilot_schedules', 'cams_schedules']
    for (const key of storageKeys) {
      const local = localStorage.getItem(key)
      if (local) {
        const parsed = JSON.parse(local)
        if (Array.isArray(parsed) && parsed.length > 0) {
          localList = parsed
          break
        }
      }
    }
  } catch (_) {
    localList = []
  }

  try {
    const res = await sendApiRequest('/pilot-sessions')
    if (res && res.ok) {
      const rawList = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.sessions || [])
      
      const combinedMap = new Map()
      localList.forEach(s => {
        const key = s.access_code || s.passcode || s.id
        if (key) combinedMap.set(String(key).toUpperCase(), s)
      })

      rawList.forEach(s => {
        const key = s.access_code || s.passcode || s.id
        if (key) {
          const upperKey = String(key).toUpperCase()
          const existing = combinedMap.get(upperKey) || {}
          combinedMap.set(upperKey, {
            ...existing,
            ...s,
            course_code: s.course_code || existing.course_code || '',
            target_examinees: s.target_examinees || existing.target_examinees || 20,
            status: s.status || existing.status || 'Active'
          })
        }
      })

      const list = Array.from(combinedMap.values())
      syncExamineeProgress(list)
      sessions.value = list
      saveLocalSessions()
      return
    }
  } catch (e) {
  } finally {
    isLoading.value = false
  }

  syncExamineeProgress(localList)
  sessions.value = localList
  saveLocalSessions()
}

function saveLocalSessions() {
  localStorage.setItem('cams_pilot_sessions', JSON.stringify(sessions.value))
  localStorage.setItem('cams_pilot_schedules', JSON.stringify(sessions.value))
  localStorage.setItem('cams_schedules', JSON.stringify(sessions.value))

  const passcodesMap = {}
  sessions.value.forEach(s => {
    const pass = s.access_code || s.passcode
    if (pass) {
      passcodesMap[pass.toUpperCase()] = s
    }
  })
  localStorage.setItem('cams_active_passcodes', JSON.stringify(passcodesMap))
}

const filteredSessions = computed(() => {
  return sessions.value.filter(s => {
    const q = searchQuery.value.toLowerCase().trim()
    const matchesQuery = !q || 
      (s.title && s.title.toLowerCase().includes(q)) ||
      (s.id && String(s.id).toLowerCase().includes(q)) ||
      (s.access_code && s.access_code.toLowerCase().includes(q)) ||
      (s.course_code && s.course_code.toLowerCase().includes(q))
    
    const matchesStatus = 
      selectedStatusFilter.value === 'All Statuses' || 
      s.status === selectedStatusFilter.value

    return matchesQuery && matchesStatus
  })
})

const totalActive = computed(() => sessions.value.filter(s => s.status === 'Active' || s.status === 'In Progress').length)
const totalCadets = computed(() => sessions.value.reduce((acc, s) => acc + getSessionSubmissions(s).length, 0))
const totalTargetExaminees = computed(() => sessions.value.reduce((acc, s) => acc + (s.target_examinees || s.max_cadets || 20), 0))
const examineeCompletionRate = computed(() => totalTargetExaminees.value ? Math.round((totalCadets.value / totalTargetExaminees.value) * 100) : 0)
const totalAlerts = computed(() => sessions.value.reduce((acc, s) => acc + (s.alerts_count || 0), 0))

function regenerateCode() {
  newSession.value.access_code = `BMA-${Math.floor(1000 + Math.random() * 9000)}`
}

function openCreateModal() {
  const defaultCourse = availableTestPapers.value[0]?.code || ''
  newSession.value = {
    title: '',
    course_code: defaultCourse,
    term: 'Midterm',
    access_code: `BMA-${Math.floor(1000 + Math.random() * 9000)}`,
    target_examinees: 20
  }
  showCreateModal.value = true
}

async function handleCreateSession() {
  if (!newSession.value.course_code) {
    showToast('Please select a course for the pilot session.', 'error')
    return
  }

  isSubmitting.value = true
  const sessionTitle = autoSessionTitle.value || `PLT-${newSession.value.course_code}-${newSession.value.term}`

  let questions = []
  const selectedPaper = availableTestPapers.value.find(p => p.code === newSession.value.course_code)
  if (selectedPaper && selectedPaper.items && selectedPaper.items.length > 0) {
    questions = selectedPaper.items
  }

  const createdSession = {
    id: `PL-${sessions.value.length + 1}`,
    title: sessionTitle,
    course_code: newSession.value.course_code,
    courseCode: newSession.value.course_code,
    term: newSession.value.term,
    access_code: newSession.value.access_code.trim().toUpperCase(),
    passcode: newSession.value.access_code.trim().toUpperCase(),
    target_examinees: Number(newSession.value.target_examinees) || 20,
    max_cadets: Number(newSession.value.target_examinees) || 20,
    status: 'Active',
    cadets_count: 0,
    alerts_count: 0,
    questions: questions,
    created_at: new Date().toLocaleDateString()
  }

  sessions.value.unshift(createdSession)
  saveLocalSessions()

  try {
    await sendApiRequest('/pilot-sessions', {
      method: 'POST',
      body: JSON.stringify(createdSession)
    })
    showToast(`Pilot session ${sessionTitle} scheduled successfully!`, 'success')
  } catch (err) {
    showToast(`Pilot session ${sessionTitle} scheduled successfully!`, 'success')
  } finally {
    isSubmitting.value = false
    showCreateModal.value = false
  }
}

async function deleteSession(id) {
  if (!confirm('Are you sure you want to remove this pilot session?')) return

  deletingSessionId.value = id
  try {
    await sendApiRequest(`/pilot-sessions/${id}`, { method: 'DELETE' })
  } catch (err) {
  } finally {
    sessions.value = sessions.value.filter(s => s.id !== id)
    saveLocalSessions()
    showToast('Pilot session removed.', 'info')
    deletingSessionId.value = null
  }
}

onMounted(() => {
  loadAvailableTestPapers()
  loadSessions()
})
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}
</style>