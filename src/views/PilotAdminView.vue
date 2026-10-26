<template>
  <div class="p-4 md:p-6 max-w-8xl mx-auto space-y-6 font-sans text-slate-800 antialiased relative min-h-screen bg-slate-50">
    
    <!-- BRANDED SKELETON LOADER -->
    <div v-if="isLoading" class="space-y-6 animate-pulse">
      
      <!-- Top Banner Skeleton -->
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

      <!-- Stat Metrics Grid Skeleton -->
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

      <!-- Filters & Data Table Skeleton -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        <div class="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div class="h-9 bg-slate-100 rounded-xl flex-1 w-full"></div>
          <div class="h-9 w-36 bg-slate-100 rounded-xl"></div>
        </div>

        <div class="overflow-x-auto border border-slate-200/80 rounded-xl">
          <div class="p-3.5 bg-slate-50 border-b border-slate-200/80 flex gap-4">
            <div v-for="w in ['w-16', 'w-40', 'w-24', 'w-32', 'w-20', 'w-24']" :key="w" :class="[w, 'h-4 bg-slate-200 rounded']"></div>
          </div>
          <div class="divide-y divide-slate-100">
            <div v-for="r in 4" :key="r" class="p-3.5 flex gap-4 items-center">
              <div class="w-16 h-4 bg-slate-200 rounded"></div>
              <div class="w-40 h-4 bg-slate-200 rounded"></div>
              <div class="w-24 h-6 bg-slate-100 rounded-md"></div>
              <div class="w-32 h-4 bg-slate-200 rounded"></div>
              <div class="w-20 h-6 bg-emerald-50 rounded-full"></div>
              <div class="w-24 h-7 bg-slate-100 rounded-xl ml-auto"></div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- MAIN VIEW CONTENT -->
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
            <p class="text-2xl font-extrabold text-slate-900 mt-1">{{ sessions.length }}</p>
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

        <div class="overflow-x-auto border border-slate-200 rounded-xl">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                <th class="p-3.5">Pilot ID</th>
                <th class="p-3.5">Session Details</th>
                <th class="p-3.5">Access Code</th>
                <th class="p-3.5">Examinee Progress</th>
                <th class="p-3.5">Status</th>
                <th class="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-sm font-medium text-slate-700">
              <tr v-for="s in filteredSessions" :key="s.id" class="hover:bg-slate-50/80 transition-colors">
                <td class="p-3.5 font-bold font-mono text-slate-900">{{ s.id }}</td>
                <td class="p-3.5">
                  <p class="font-bold text-slate-900">{{ s.title }}</p>
                  <p class="text-[11px] text-slate-400 mt-0.5 font-mono font-semibold">{{ s.course_code }}</p>
                </td>
                <td class="p-3.5">
                  <span class="px-2.5 py-1 bg-slate-100 border border-slate-200 font-mono text-[11px] font-bold rounded-md text-slate-800">
                    {{ s.access_code }}
                  </span>
                </td>
                <td class="p-3.5 font-bold text-slate-800">
                  <span class="text-emerald-800 font-extrabold">{{ s.cadets_count || 0 }}</span> / {{ s.target_examinees || s.max_cadets || 30 }} Cadets
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
                <td class="p-3.5 text-right">
                  <button 
                    @click="router.push('/reports?tab=post-pilot')"
                    class="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-sm font-bold transition inline-flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Eye :size="14" /> View Analysis
                  </button>
                </td>
              </tr>

              <tr v-if="filteredSessions.length === 0">
                <td colspan="6" class="p-12 text-center text-slate-400">
                  <SlidersHorizontal class="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p class="font-bold text-slate-700 text-sm">No Pilot Sessions Found</p>
                  <p class="text-sm text-slate-400 mt-1">No active or scheduled sessions match your criteria. Create a course and test blueprint to begin scheduling.</p>
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
              <label class="block font-bold text-slate-700 mb-1">Session Title</label>
              <input 
                v-model="newSession.title" 
                placeholder="e.g. STCW Assessment Pilot PL-1" 
                class="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white text-slate-900 font-semibold" 
              />
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Subject / Course Code</label>
              <input 
                v-model="newSession.course_code" 
                placeholder="e.g. NAV-101" 
                class="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white text-slate-900 font-semibold" 
              />
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Target Examinees Needed</label>
              <input 
                v-model.number="newSession.target_examinees" 
                type="number"
                min="1"
                placeholder="e.g. 30" 
                class="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white text-slate-900 font-semibold" 
              />
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Access Passcode</label>
              <div class="flex gap-2">
                <input 
                  v-model="newSession.access_code" 
                  class="w-full p-2.5 border border-slate-200 rounded-xl outline-none font-mono font-bold bg-slate-100 text-slate-900" 
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
              class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs cursor-pointer"
            >
              Schedule Session
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
  Play, Users, AlertTriangle, BookOpen, Eye, X, RotateCcw
} from 'lucide-vue-next'

const router = useRouter()
const isLoading = ref(true)
const searchQuery = ref('')
const selectedStatusFilter = ref('All Statuses')

const sessions = ref([])
const showCreateModal = ref(false)

const newSession = ref({
  title: '',
  course_code: '',
  access_code: '',
  target_examinees: 30
})

async function fetchFromEndpoints(path, options = {}) {
  const token = localStorage.getItem('cams_token') || localStorage.getItem('token') || ''
  
  const headers = {
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }

  try {
    const res = await fetch(`/api${path}`, { ...options, headers })
    if (res.ok) {
      return res
    }
  } catch (e) {
    // Fall back to local storage
  }
  throw new Error(`Endpoint ${path} unreachable`)
}

async function loadSessions() {
  try {
    const res = await fetchFromEndpoints('/pilot-sessions')
    const data = await res.json()
    sessions.value = Array.isArray(data) ? data : (data?.data || [])
    saveLocalSessions()
  } catch (e) {
    const local = localStorage.getItem('cams_pilot_sessions')
    if (local) {
      try {
        sessions.value = JSON.parse(local)
      } catch (_) {
        sessions.value = []
      }
    } else {
      sessions.value = [
        {
          id: 'PL-1',
          title: 'STCW Assessment Pilot PL-1',
          course_code: 'NAV-101',
          access_code: 'BMA-8492',
          target_examinees: 40,
          status: 'Active',
          cadets_count: 32,
          alerts_count: 0,
          created_at: new Date().toLocaleDateString()
        },
        {
          id: 'PL-2',
          title: 'Marine Engineering Pilot Session',
          course_code: 'ENG-201',
          access_code: 'BMA-3104',
          target_examinees: 30,
          status: 'In Progress',
          cadets_count: 28,
          alerts_count: 1,
          created_at: new Date().toLocaleDateString()
        }
      ]
      saveLocalSessions()
    }
  } finally {
    isLoading.value = false
  }
}

function saveLocalSessions() {
  localStorage.setItem('cams_pilot_sessions', JSON.stringify(sessions.value))
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
const totalCadets = computed(() => sessions.value.reduce((acc, s) => acc + (s.cadets_count || 0), 0))
const totalTargetExaminees = computed(() => sessions.value.reduce((acc, s) => acc + (s.target_examinees || s.max_cadets || 30), 0))
const examineeCompletionRate = computed(() => totalTargetExaminees.value ? Math.round((totalCadets.value / totalTargetExaminees.value) * 100) : 0)
const totalAlerts = computed(() => sessions.value.reduce((acc, s) => acc + (s.alerts_count || 0), 0))

function regenerateCode() {
  newSession.value.access_code = `BMA-${Math.floor(1000 + Math.random() * 9000)}`
}

function openCreateModal() {
  newSession.value = {
    title: '',
    course_code: '',
    access_code: `BMA-${Math.floor(1000 + Math.random() * 9000)}`,
    target_examinees: 30
  }
  showCreateModal.value = true
}

function handleCreateSession() {
  if (!newSession.value.title || !newSession.value.course_code) {
    alert('Please enter both session title and subject course code.')
    return
  }

  const created = {
    id: `PL-${sessions.value.length + 1}`,
    title: newSession.value.title,
    course_code: newSession.value.course_code,
    access_code: newSession.value.access_code,
    target_examinees: Number(newSession.value.target_examinees) || 30,
    status: 'Active',
    cadets_count: 0,
    alerts_count: 0,
    created_at: new Date().toLocaleDateString()
  }

  sessions.value.unshift(created)
  saveLocalSessions()
  showCreateModal.value = false
}

onMounted(() => {
  isLoading.value = true
  loadSessions()
})
</script>