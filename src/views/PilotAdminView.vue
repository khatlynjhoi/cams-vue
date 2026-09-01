<script setup>
import { ref, computed } from 'vue'
import { 
  Play, 
  PauseCircle, 
  Clock, 
  Users, 
  ShieldAlert, 
  CheckCircle2, 
  Plus, 
  Search, 
  FileSpreadsheet,
  AlertCircle
} from 'lucide-vue-next'

const searchQuery = ref('')
const statusFilter = ref('All')
const isNewPilotModalOpen = ref(false)

const pilotSessions = ref([
  {
    id: 'PILOT-2026-01',
    title: 'NAV-101 Midterm Examination 2026',
    course: 'NAV-101',
    accessCode: 'NAV-8842',
    candidatesCount: 45,
    completedCount: 38,
    status: 'Active',
    scheduledTime: '2026-09-02 09:00 AM',
    securityAlerts: 1
  },
  {
    id: 'PILOT-2026-02',
    title: 'ENG-202 Diesel Engine Simulator Evaluation',
    course: 'ENG-202',
    accessCode: 'ENG-1093',
    candidatesCount: 30,
    completedCount: 30,
    status: 'Completed',
    scheduledTime: '2026-08-28 14:00 PM',
    securityAlerts: 0
  },
  {
    id: 'PILOT-2026-03',
    title: 'SAF-301 Safety & MARPOL Compliance Quiz',
    course: 'SAF-301',
    accessCode: 'SAF-5521',
    candidatesCount: 60,
    completedCount: 12,
    status: 'Active',
    scheduledTime: '2026-09-01 10:00 AM',
    securityAlerts: 2
  }
])

const newPilot = ref({
  title: 'NAV-101 Navigation Quiz #2',
  course: 'NAV-101',
  accessCode: Math.floor(1000 + Math.random() * 9000).toString(),
  candidatesCount: 40
})

const activePilotsCount = computed(() => pilotSessions.value.filter(s => s.status === 'Active').length)
const totalCandidates = computed(() => pilotSessions.value.reduce((acc, s) => acc + s.candidatesCount, 0))
const totalAlerts = computed(() => pilotSessions.value.reduce((acc, s) => acc + s.securityAlerts, 0))

const filteredSessions = computed(() => {
  return pilotSessions.value.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          s.accessCode.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = statusFilter.value === 'All' || s.status === statusFilter.value
    return matchesSearch && matchesStatus
  })
})

function createPilotSession() {
  pilotSessions.value.unshift({
    id: `PILOT-2026-0${pilotSessions.value.length + 1}`,
    ...newPilot.value,
    completedCount: 0,
    status: 'Active',
    scheduledTime: 'Just Now',
    securityAlerts: 0
  })
  isNewPilotModalOpen.value = false
}

function toggleSessionStatus(session) {
  if (session.status === 'Active') {
    session.status = 'Paused'
  } else if (session.status === 'Paused') {
    session.status = 'Active'
  }
}
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Pilot Administration</h1>
        <p class="text-gray-500 mt-1">Deploy live examination sessions, control student access, and monitor real-time proctoring logs.</p>
      </div>

      <button 
        @click="isNewPilotModalOpen = true"
        class="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
      >
        <Plus :size="16" />
        Schedule New Pilot Session
      </button>
    </div>

    <!-- Metrics Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex justify-between items-start">
        <div>
          <p class="text-xs font-semibold text-gray-500">Active Live Pilots</p>
          <p class="text-2xl font-bold text-emerald-600 mt-1">{{ activePilotsCount }} Sessions</p>
          <p class="text-xs text-gray-400 mt-1">Accepting candidate connections</p>
        </div>
        <div class="p-3 bg-emerald-50 text-emerald-700 rounded-lg">
          <Play :size="20" />
        </div>
      </div>

      <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex justify-between items-start">
        <div>
          <p class="text-xs font-semibold text-gray-500">Total Enrolled Candidates</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ totalCandidates }} Cadets</p>
          <p class="text-xs text-gray-400 mt-1">Across all pilot cohorts</p>
        </div>
        <div class="p-3 bg-blue-50 text-blue-700 rounded-lg">
          <Users :size="20" />
        </div>
      </div>

      <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex justify-between items-start">
        <div>
          <p class="text-xs font-semibold text-gray-500">Proctoring Flag Logs</p>
          <p class="text-2xl font-bold text-amber-600 mt-1">{{ totalAlerts }} Alerts</p>
          <p class="text-xs text-gray-400 mt-1">Tab switches or timeout events</p>
        </div>
        <div class="p-3 bg-amber-50 text-amber-700 rounded-lg">
          <ShieldAlert :size="20" />
        </div>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
      <div class="relative w-full md:w-96">
        <Search :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search by title or access code..." 
          class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
        />
      </div>

      <div class="flex items-center gap-2 w-full md:w-auto">
        <span class="text-xs font-semibold text-gray-500">Status:</span>
        <select 
          v-model="statusFilter"
          class="border border-gray-300 rounded-lg text-sm px-3 py-2 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Paused">Paused</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
    </div>

    <!-- Pilot Sessions Table -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <table class="w-full text-left text-sm">
        <thead class="bg-gray-50 text-gray-600 border-b border-gray-200">
          <tr>
            <th class="px-6 py-3 font-semibold">Session Title</th>
            <th class="px-6 py-3 font-semibold">Access Code</th>
            <th class="px-6 py-3 font-semibold">Progress</th>
            <th class="px-6 py-3 font-semibold">Security Alerts</th>
            <th class="px-6 py-3 font-semibold">Status</th>
            <th class="px-6 py-3 font-semibold text-right">Controls</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="session in filteredSessions" :key="session.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4">
              <div class="font-bold text-gray-900">{{ session.title }}</div>
              <div class="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <Clock :size="12" /> {{ session.scheduledTime }}
              </div>
            </td>

            <td class="px-6 py-4">
              <span class="font-mono bg-slate-100 text-slate-800 font-bold px-2.5 py-1 rounded text-xs tracking-wider border border-slate-200">
                {{ session.accessCode }}
              </span>
            </td>

            <td class="px-6 py-4">
              <div class="text-xs font-semibold text-gray-700">
                {{ session.completedCount }} / {{ session.candidatesCount }} Submitted
              </div>
              <div class="w-32 bg-gray-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div 
                  class="bg-emerald-500 h-full rounded-full" 
                  :style="{ width: `${(session.completedCount / session.candidatesCount) * 100}%` }"
                ></div>
              </div>
            </td>

            <td class="px-6 py-4">
              <span 
                v-if="session.securityAlerts > 0" 
                class="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full"
              >
                <AlertCircle :size="12" /> {{ session.securityAlerts }} Flagged
              </span>
              <span v-else class="text-xs text-gray-400 font-medium">Clear</span>
            </td>

            <td class="px-6 py-4">
              <span 
                :class="[
                  'px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1',
                  session.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : '',
                  session.status === 'Paused' ? 'bg-amber-100 text-amber-800' : '',
                  session.status === 'Completed' ? 'bg-gray-100 text-gray-700' : ''
                ]"
              >
                <CheckCircle2 v-if="session.status === 'Completed'" :size="12" />
                {{ session.status }}
              </span>
            </td>

            <td class="px-6 py-4 text-right space-x-2">
              <button 
                v-if="session.status !== 'Completed'"
                @click="toggleSessionStatus(session)"
                class="p-2 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                :title="session.status === 'Active' ? 'Pause Session' : 'Resume Session'"
              >
                <PauseCircle v-if="session.status === 'Active'" :size="18" />
                <Play v-else :size="18" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal: New Pilot Session -->
    <div v-if="isNewPilotModalOpen" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
        <h3 class="text-lg font-bold text-gray-900">Deploy New Pilot Session</h3>

        <form @submit.prevent="createPilotSession" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Session Title</label>
            <input 
              v-model="newPilot.title" 
              type="text" 
              required 
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Course Module</label>
            <select 
              v-model="newPilot.course"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
            >
              <option value="NAV-101">NAV-101 Terrestrial Navigation</option>
              <option value="ENG-202">ENG-202 Marine Diesel Engines</option>
              <option value="SAF-301">SAF-301 Maritime Safety</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Access Passcode</label>
              <input 
                v-model="newPilot.accessCode" 
                type="text" 
                required 
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Expected Cadets</label>
              <input 
                v-model.number="newPilot.candidatesCount" 
                type="number" 
                required 
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button 
              type="button"
              @click="isNewPilotModalOpen = false" 
              class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
            >
              Launch Live Pilot
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>