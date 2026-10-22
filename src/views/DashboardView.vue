<template>
  <div class="p-6 md:p-8 max-w-7xl mx-auto space-y-6 font-sans text-slate-800 antialiased relative min-h-screen bg-slate-50">
    
    <!-- BRANDED SYSTEM LOADING OVERLAY -->
    <transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div 
        v-if="isLoading" 
        class="min-h-125 w-full bg-white/90 backdrop-blur-xs border border-slate-100 rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-5 shadow-xs"
      >
        <!-- CAMS Emblem with Radar Pulse Effect -->
        <div class="relative flex items-center justify-center">
          <div class="absolute w-20 h-20 bg-emerald-500/10 rounded-full animate-ping"></div>
          <div class="absolute w-16 h-16 bg-[#123524]/10 rounded-full animate-pulse"></div>
          
          <div class="w-14 h-14 bg-[#123524] rounded-2xl flex items-center justify-center font-black text-white text-2xl tracking-wider shadow-xl relative z-10">
            C
          </div>
        </div>

        <!-- Branding Text & Progress Bar -->
        <div class="space-y-1.5 max-w-xs">
          <h3 class="text-base font-bold text-slate-900 tracking-tight">CAMS STCW Portal</h3>
          <p class="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Synchronizing Operations & Telemetry...</p>
        </div>

        <div class="w-48 bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div class="bg-[#123524] h-full rounded-full animate-pulse w-3/4"></div>
        </div>

        <p class="text-[10px] text-slate-400 font-mono">Baliwag Maritime Academy System</p>
      </div>
    </transition>

    <!-- DASHBOARD MAIN CONTENT VIEW -->
    <div v-show="!isLoading" class="space-y-6">
      
      <!-- Top Header Hero Banner -->
      <div class="bg-[#123524] text-white p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
        <div class="space-y-1">
          <h1 class="text-xl font-bold flex items-center gap-2 text-white tracking-tight">
            <LayoutDashboard class="text-emerald-400" :size="22" />
            Welcome back, {{ currentUser.name }}
          </h1>
          <p class="text-xs text-slate-200 font-normal flex items-center gap-2 flex-wrap">
            <span class="px-2 py-0.5 text-[10px] font-bold bg-emerald-600 text-white rounded-md capitalize font-mono">
              {{ currentUser.role }}
            </span>
            <span>Overview of STCW assessment operations, item metrics, and candidate examinations.</span>
          </p>
        </div>
      </div>

      <!-- Metric Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          v-for="(stat, idx) in stats" 
          :key="idx" 
          class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex justify-between items-start hover:border-emerald-200 transition-all"
        >
          <div>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{{ stat.title }}</p>
            <p class="text-2xl font-extrabold text-slate-900 mt-1">{{ stat.value }}</p>
            <p class="text-xs font-semibold text-emerald-700 mt-1.5 flex items-center gap-1">
              <ArrowUpRight :size="12" /> {{ stat.change }}
            </p>
          </div>
          <div :class="['p-3 rounded-xl border', stat.bg, stat.color]">
            <component :is="stat.icon" :size="20" />
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Recent Activity Stream -->
        <div class="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div class="flex justify-between items-center pb-3 border-b border-slate-100">
            <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2 tracking-tight">
              <Activity class="text-emerald-700" :size="16" />
              Recent Operational Activity
            </h2>
            <span class="px-2.5 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200 font-mono">
              System Operational
            </span>
          </div>

          <div v-if="recentActivities.length === 0" class="p-12 text-center text-slate-400 text-xs font-medium space-y-1">
            <Clock class="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p class="font-bold text-slate-700 text-sm">No Recent Operational Activity</p>
            <p class="text-xs text-slate-400 mt-0.5">Candidate examination submissions will stream here automatically in real time.</p>
          </div>

          <div v-else class="divide-y divide-slate-100">
            <div v-for="act in recentActivities" :key="act.id" class="py-3 flex justify-between items-center text-xs">
              <div>
                <p class="font-bold text-slate-900">{{ act.title }}</p>
                <p class="text-[11px] text-slate-400">Candidate: <span class="text-slate-700 font-bold">{{ act.user }}</span></p>
              </div>
              <div class="text-right flex items-center gap-3">
                <span class="font-mono text-xs font-bold text-slate-800">{{ act.score }}</span>
                <span :class="[
                  'px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider border',
                  act.isPass ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                ]">
                  {{ act.action }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions & Status -->
        <div class="space-y-6">
          <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Quick Actions</h3>
            <div class="grid grid-cols-2 gap-3">
              <button @click="router.push('/questions')" class="p-3.5 border border-slate-200 rounded-2xl hover:bg-emerald-50/50 hover:border-emerald-300 transition text-left space-y-2 cursor-pointer group shadow-xs">
                <HelpCircle class="text-slate-500 group-hover:text-emerald-700 transition" :size="18" />
                <p class="text-xs font-bold text-slate-800">Question Bank</p>
              </button>
              <button @click="router.push('/test-builder')" class="p-3.5 border border-slate-200 rounded-2xl hover:bg-emerald-50/50 hover:border-emerald-300 transition text-left space-y-2 cursor-pointer group shadow-xs">
                <FileText class="text-slate-500 group-hover:text-emerald-700 transition" :size="18" />
                <p class="text-xs font-bold text-slate-800">Test Builder</p>
              </button>
              <button @click="router.push('/reports')" class="p-3.5 border border-slate-200 rounded-2xl hover:bg-emerald-50/50 hover:border-emerald-300 transition text-left space-y-2 cursor-pointer group shadow-xs">
                <BarChart3 class="text-slate-500 group-hover:text-emerald-700 transition" :size="18" />
                <p class="text-xs font-bold text-slate-800">Analytics</p>
              </button>
              <button @click="router.push('/users')" class="p-3.5 border border-slate-200 rounded-2xl hover:bg-emerald-50/50 hover:border-emerald-300 transition text-left space-y-2 cursor-pointer group shadow-xs">
                <Settings class="text-slate-500 group-hover:text-emerald-700 transition" :size="18" />
                <p class="text-xs font-bold text-slate-800">Manage Users</p>
              </button>
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider">AI & Security Status</h3>
            <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-2.5">
              <ShieldCheck class="text-emerald-700 shrink-0 mt-0.5" :size="16" />
              <div>
                <p class="text-xs font-bold text-slate-800">Bloom's Taxonomy Balancer</p>
                <p class="text-[10px] text-slate-500 mt-0.5">Active - Cognitive weights validated for all test blueprints.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { 
  HelpCircle, SlidersHorizontal, BookOpen, CheckCircle2, Clock, 
  ArrowUpRight, ShieldCheck, FileText, Settings, BarChart3, Activity,
  LayoutDashboard
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(true)
const questionsCount = ref(0)
const pilotSessionsCount = ref(0)
const coursesCount = ref(0)
const submissionsCount = ref(0)
const recentActivities = ref([])

// Purge legacy storage key to prevent stale mock course counts
localStorage.removeItem('cams_courses')

async function fetchFromApi(endpoint) {
  const token = localStorage.getItem('cams_token') || localStorage.getItem('token') || ''
  
  try {
    const res = await fetch(`/api${endpoint}`, {
      headers: { 
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    })
    if (res.ok) {
      const json = await res.json()
      return json?.data ?? json
    }
  } catch (e) {
    // Fallback to local storage
  }
  return null
}

async function fetchDashboardMetrics() {
  isLoading.value = true

  // 1. Banked Questions Count
  try {
    const qData = await fetchFromApi('/questions')
    let questionList = []
    if (Array.isArray(qData)) {
      questionList = qData
    } else {
      const local = localStorage.getItem('cams_questions_data')
      questionList = local ? JSON.parse(local) : []
    }
    questionsCount.value = Array.isArray(questionList) ? questionList.length : 0
  } catch (e) {
    questionsCount.value = 0
  }

  // 2. STCW Courses Count (Reads strictly from cams_courses_data)
  try {
    const cData = await fetchFromApi('/courses')
    let rawCourses = null

    if (cData && Array.isArray(cData)) {
      rawCourses = cData
    } else {
      const localData = localStorage.getItem('cams_courses_data')
      rawCourses = localData ? JSON.parse(localData) : []
    }

    const validCourses = Array.isArray(rawCourses) ? rawCourses.filter(c => {
      if (!c || typeof c !== 'object') return false
      const code = c.code || c.course_code || c.courseCode
      const title = c.title || c.course_title || c.name
      return !!(code && String(code).trim() && title && String(title).trim())
    }) : []

    coursesCount.value = validCourses.length

    if (!cData) {
      localStorage.setItem('cams_courses_data', JSON.stringify(validCourses))
    }
  } catch (e) {
    coursesCount.value = 0
  }

  // 3. Active Pilot Sessions Count
  try {
    const pData = await fetchFromApi('/pilot-sessions')
    let sessionList = []
    if (Array.isArray(pData)) {
      sessionList = pData
    } else {
      const local = localStorage.getItem('cams_pilot_sessions')
      sessionList = local ? JSON.parse(local) : []
    }
    sessionList = Array.isArray(sessionList) ? sessionList.filter(s => s && (s.title || s.access_code || s.course_code)) : []
    pilotSessionsCount.value = sessionList.length
  } catch (e) {
    pilotSessionsCount.value = 0
  }

  // 4. Exam Submissions & Telemetry Logs
  try {
    const sData = await fetchFromApi('/exam-submissions')
    let rawList = []
    
    if (Array.isArray(sData)) {
      rawList = sData
    } else {
      const local = localStorage.getItem('cams_exam_submissions')
      rawList = local ? JSON.parse(local) : []
    }

    const validSubmissions = Array.isArray(rawList) ? rawList.filter(s => {
      if (!s) return false
      const hasCourse = !!(s.course_code || s.course || s.courseCode)
      const hasValidPercentage = s.percentage !== undefined && s.percentage !== null && !isNaN(s.percentage)
      const isNotDummy = s.course_code !== 'N/A' && s.course_code !== 'undefined'
      return hasCourse && hasValidPercentage && isNotDummy
    }) : []

    if (Array.isArray(rawList) && rawList.length !== validSubmissions.length) {
      localStorage.setItem('cams_exam_submissions', JSON.stringify(validSubmissions))
    }

    submissionsCount.value = validSubmissions.length

    recentActivities.value = validSubmissions.slice(0, 5).map(sub => {
      const formattedDate = sub.submitted_at 
        ? new Date(sub.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        : 'Just now'
      
      const courseCode = sub.course_code || sub.courseCode || sub.course || 'STCW Exam'
      const pct = Number(sub.percentage) || 0

      return {
        id: sub.id || Math.random(),
        title: `${courseCode} Submission`,
        user: sub.cadet_name || sub.student_name || 'Cadet Candidate',
        score: `${sub.score || 0}/${sub.total_items || 0} (${pct}%)`,
        action: pct >= 75 ? 'Passed' : 'Completed',
        isPass: pct >= 75,
        time: formattedDate
      }
    })
  } catch (e) {
    submissionsCount.value = 0
    recentActivities.value = []
  } finally {
    setTimeout(() => {
      isLoading.value = false
    }, 400)
  }
}

onMounted(() => {
  isLoading.value = true
  fetchDashboardMetrics()
})

const currentUser = computed(() => {
  return authStore.user || { name: 'IT Administrator', role: 'Admin' }
})

const stats = computed(() => [
  { 
    title: 'Total Banked Questions', 
    value: questionsCount.value.toLocaleString(), 
    change: questionsCount.value > 0 ? `${questionsCount.value} items active` : 'No items banked', 
    icon: HelpCircle, 
    color: 'text-emerald-800', 
    bg: 'bg-emerald-50 border-emerald-200' 
  },
  { 
    title: 'STCW Course Modules', 
    value: coursesCount.value.toString(), 
    change: coursesCount.value > 0 ? 'Active curriculum' : 'No courses configured', 
    icon: BookOpen, 
    color: 'text-emerald-800', 
    bg: 'bg-emerald-50 border-emerald-200' 
  },
  { 
    title: 'Active Pilot Sessions', 
    value: pilotSessionsCount.value.toString(), 
    change: pilotSessionsCount.value > 0 ? 'Configured & active' : 'No active sessions', 
    icon: SlidersHorizontal, 
    color: 'text-emerald-800', 
    bg: 'bg-emerald-50 border-emerald-200' 
  },
  { 
    title: 'Total Exam Submissions', 
    value: submissionsCount.value.toString(), 
    change: submissionsCount.value > 0 ? 'Evaluated submissions' : 'No submissions yet', 
    icon: CheckCircle2, 
    color: 'text-emerald-800', 
    bg: 'bg-emerald-50 border-emerald-200' 
  }
])
</script>