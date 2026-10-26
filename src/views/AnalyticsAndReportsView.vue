<template>
  <div class="p-4 md:p-6 max-w-8xl mx-auto space-y-6 font-sans text-slate-800 antialiased relative min-h-screen bg-slate-50">
    
    <!-- BRANDED SKELETON LOADER -->
    <div v-if="isLoading" class="space-y-6 animate-pulse">
      
      <!-- Top Header Banner Skeleton -->
      <div class="bg-linear-to-r from-[#123524] to-[#1b4d35] p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 bg-emerald-500/30 rounded-md"></div>
            <div class="h-6 w-80 max-w-full bg-white/20 rounded-md"></div>
          </div>
          <div class="h-3.5 w-96 max-w-full bg-white/10 rounded-md"></div>
        </div>
        <div class="bg-white/10 px-4 py-2 rounded-xl w-32 h-12"></div>
      </div>

      <!-- Navigation Pills Skeleton -->
      <div class="flex flex-wrap items-center gap-3 border-b border-slate-200 pb-3">
        <div class="h-10 w-44 bg-slate-200 rounded-full"></div>
        <div class="h-10 w-60 bg-slate-100 rounded-full"></div>
        <div class="h-10 w-60 bg-slate-100 rounded-full"></div>
      </div>

      <!-- Content Grid Skeleton -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div class="h-5 w-56 bg-slate-200 rounded-md"></div>
          <div class="space-y-4 pt-2">
            <div v-for="i in 4" :key="i" class="space-y-2">
              <div class="flex justify-between">
                <div class="h-4 w-28 bg-slate-200 rounded"></div>
                <div class="h-4 w-20 bg-slate-200 rounded"></div>
              </div>
              <div class="w-full bg-slate-100 h-3 rounded-full"></div>
            </div>
          </div>
        </div>

        <div class="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div class="h-5 w-64 bg-slate-200 rounded-md"></div>
          <div class="space-y-3 pt-2">
            <div v-for="i in 3" :key="i" class="p-3.5 border border-slate-200/80 rounded-2xl flex justify-between items-center bg-slate-50/50">
              <div class="space-y-1.5">
                <div class="h-4 w-32 bg-slate-200 rounded"></div>
                <div class="h-3 w-40 bg-slate-100 rounded"></div>
              </div>
              <div class="h-6 w-20 bg-emerald-100 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- MAIN VIEW CONTENT -->
    <div v-else class="space-y-6">

      <!-- Top Header Hero Banner -->
      <div class="bg-[#123524] text-white p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
        <div>
          <h1 class="text-xl font-bold flex items-center gap-2 text-white tracking-tight">
            <BarChart3 class="text-emerald-400" :size="22" /> STCW Curriculum Analytics & Form Center
          </h1>
          <p class="text-sm text-slate-200 mt-1 font-normal">
            Monitor cognitive balance, STCW coverage, and generate official institutional forms (AD-09, AD-10, AD-11, AD-18).
          </p>
        </div>

        <div class="flex items-center gap-3 shrink-0">
          <div class="bg-white/10 px-4 py-2 rounded-xl border border-white/10 text-right">
            <span class="text-[10px] text-slate-300 block font-bold uppercase">Total Bank Items</span>
            <span class="text-lg font-extrabold text-emerald-400 font-mono">{{ questions.length }}</span>
          </div>
        </div>
      </div>

      <!-- Navigation Pills -->
      <div class="flex flex-wrap items-center gap-3 border-b border-slate-200 pb-3">
        <button
          type="button"
          @click="setActiveTab('analytics')"
          :class="[
            'px-5 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer flex items-center gap-2 select-none',
            activeTab === 'analytics' 
              ? 'bg-[#123524] text-white shadow-xs' 
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          ]"
        >
          <PieChart :size="15" /> Curriculum Analytics
        </button>

        <button
          type="button"
          @click="setActiveTab('exam-built')"
          :class="[
            'px-5 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer flex items-center gap-2 select-none',
            activeTab === 'exam-built' 
              ? 'bg-[#123524] text-white shadow-xs' 
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          ]"
        >
          <ClipboardCheck :size="15" /> Stage 1: Exam Built (AD-09 / AD-10)
          <span 
            :class="[
              'px-2 py-0.5 text-[10px] rounded-full font-mono font-bold ml-1',
              activeTab === 'exam-built' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
            ]"
          >
            {{ builtExams.length }}
          </span>
        </button>

        <button
          type="button"
          @click="setActiveTab('post-pilot')"
          :class="[
            'px-5 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer flex items-center gap-2 select-none',
            activeTab === 'post-pilot' 
              ? 'bg-[#123524] text-white shadow-xs' 
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          ]"
        >
          <BarChart2 :size="15" /> Stage 2: Post-Pilot (AD-11 / AD-18)
          <span 
            :class="[
              'px-2 py-0.5 text-[10px] rounded-full font-mono font-bold ml-1',
              activeTab === 'post-pilot' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
            ]"
          >
            {{ completedPilots.length }}
          </span>
        </button>
      </div>

      <!-- TAB 1: CURRICULUM ANALYTICS -->
      <div v-if="activeTab === 'analytics'" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2 tracking-tight">
              <PieChart class="text-emerald-700" :size="16" /> Bloom's Taxonomy Cognitive Balance
            </h2>
            <div class="space-y-3.5 pt-2">
              <div v-for="(count, level) in bloomStats" :key="level" class="space-y-1">
                <div class="flex justify-between text-sm font-bold text-slate-700">
                  <span>{{ level }}</span>
                  <span class="font-mono text-slate-800">{{ count }} items ({{ questions.length ? Math.round((count / questions.length) * 100) : 0 }}%)</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div class="bg-[#123524] h-3 rounded-full transition-all" :style="{ width: `${questions.length ? (count / questions.length) * 100 : 0}%` }"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2 tracking-tight">
              <ShieldCheck class="text-emerald-700" :size="16" /> STCW Competency Standard Coverage
            </h2>
            <div class="space-y-3 pt-2">
              <div v-if="Object.keys(stcwStats).length === 0" class="text-sm text-slate-400 italic p-8 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                No STCW competency standards mapped yet. Create questions in the Question Bank to visualize coverage.
              </div>
              <div v-else v-for="(count, std) in stcwStats" :key="std" class="p-3.5 border border-slate-200 rounded-2xl flex justify-between items-center bg-slate-50/50">
                <div>
                  <span class="font-mono text-sm font-bold text-slate-900 block">{{ std }}</span>
                  <span class="text-[10px] text-slate-500 font-medium">STCW Standard Reference</span>
                </div>
                <span class="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold font-mono text-sm rounded-xl">{{ count }} Items</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- FILTER TOOLBAR -->
      <div v-if="activeTab !== 'analytics'" class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div class="relative flex-1 w-full">
          <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            v-model="searchQuery"
            type="text"
            placeholder="Search by subject code, title, or test ID..."
            class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
          />
        </div>

        <div class="flex items-center gap-2 w-full sm:w-auto">
          <select 
            v-model="selectedCourse" 
            class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none cursor-pointer focus:bg-white focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">All Courses</option>
            <option v-for="(c, idx) in courses" :key="c.id || c.code || idx" :value="c.code || c.subjectCode || c.id">
              {{ c.code || c.subjectCode || c.title }}
            </option>
          </select>

          <select 
            v-model="selectedTerm" 
            class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none cursor-pointer focus:bg-white focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">All Terms</option>
            <option v-for="term in availableTerms" :key="term" :value="term">
              {{ term }}
            </option>
          </select>
        </div>
      </div>

      <!-- TAB 2: STAGE 1 - EXAM BUILT REPORTS -->
      <div v-if="activeTab === 'exam-built'" class="space-y-4">
        <div class="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between shadow-xs">
          <div class="flex items-center gap-3">
            <ClipboardCheck class="w-5 h-5 text-emerald-700" />
            <div>
              <h3 class="text-sm font-bold text-emerald-950">Stage 1: Exam Built Reports</h3>
              <p class="text-[11px] text-emerald-800 font-medium">Form AD-09 (T.O.S.) and Form AD-10 (Questionnaire) generated from TestBuilder blueprints.</p>
            </div>
          </div>
          <span class="text-sm font-bold text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 font-mono">
            {{ builtExams.length }} Tests Available
          </span>
        </div>

        <div v-if="builtExams.length === 0" class="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 space-y-2 shadow-xs">
          <BookOpen class="w-10 h-10 mx-auto text-slate-300" />
          <p class="text-sm font-bold text-slate-600">No built test blueprints found</p>
          <p class="text-[11px] text-slate-400">Assemble an examination paper in the Test Builder to generate Form AD-09 and Form AD-10.</p>
        </div>

        <div v-else class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                <th class="p-3.5">Exam Code</th>
                <th class="p-3.5">Subject</th>
                <th class="p-3.5">Term / S.Y.</th>
                <th class="p-3.5">Items</th>
                <th class="p-3.5">Date Built</th>
                <th class="p-3.5 text-right">Actions / Form Exports</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-sm text-slate-700">
              <tr v-for="exam in builtExams" :key="exam.id" class="hover:bg-slate-50/80 transition-colors">
                <td class="p-3.5 font-mono font-bold text-slate-900">{{ exam.id }}</td>
                <td class="p-3.5">
                  <div class="font-bold text-slate-900">{{ exam.subjectCode }}</div>
                  <div class="text-[11px] text-slate-500 font-medium">{{ exam.subjectTitle }}</div>
                </td>
                <td class="p-3.5 font-semibold">{{ exam.term }} ({{ exam.academicYear }})</td>
                <td class="p-3.5 font-bold font-mono">{{ exam.totalItems }} Qs</td>
                <td class="p-3.5 text-slate-500 font-mono">{{ exam.createdDate }}</td>
                <td class="p-3.5 text-right space-x-2">
                  <button 
                    @click="generateFormAD09(exam)" 
                    type="button" 
                    class="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-sm font-bold hover:bg-emerald-100 transition cursor-pointer shadow-xs inline-flex items-center gap-1"
                  >
                    <FileSpreadsheet class="w-3.5 h-3.5" /> Form AD-09 (TOS)
                  </button>
                  <button 
                    @click="generateFormAD10(exam)" 
                    type="button" 
                    class="px-3 py-1.5 bg-[#123524] hover:bg-[#0e2a1d] text-white rounded-xl text-sm font-bold transition cursor-pointer shadow-xs inline-flex items-center gap-1"
                  >
                    <Printer class="w-3.5 h-3.5" /> Form AD-10 (Exam)
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB 3: STAGE 2 - POST-PILOT REPORTS -->
      <div v-if="activeTab === 'post-pilot'" class="space-y-4">
        <div class="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between shadow-xs">
          <div class="flex items-center gap-3">
            <BarChart2 class="w-5 h-5 text-amber-700" />
            <div>
              <h3 class="text-sm font-bold text-amber-950">Stage 2: Post-Pilot Testing Reports</h3>
              <p class="text-[11px] text-amber-800 font-medium">Form AD-11 (Item Analysis) and Form AD-18 (Validation Checklist) calculated from Pilot Submissions.</p>
            </div>
          </div>
          <span class="text-sm font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300 font-mono">
            {{ completedPilots.length }} Pilots Recorded
          </span>
        </div>

        <div v-if="completedPilots.length === 0" class="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 space-y-2 shadow-xs">
          <BarChart2 class="w-10 h-10 mx-auto text-slate-300" />
          <p class="text-sm font-bold text-slate-600">No pilot submissions recorded</p>
          <p class="text-[11px] text-slate-400">Form AD-11 (Item Analysis) and Form AD-18 (Validation Checklist) will populate automatically once candidates complete scheduled pilot sessions.</p>
        </div>

        <div v-else class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                <th class="p-3.5">Pilot ID</th>
                <th class="p-3.5">Subject</th>
                <th class="p-3.5">Cohort Sample</th>
                <th class="p-3.5">Avg Duration</th>
                <th class="p-3.5">Validation Status</th>
                <th class="p-3.5 text-right">Actions / Form Exports</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-sm text-slate-700">
              <tr v-for="pilot in completedPilots" :key="pilot.id" class="hover:bg-slate-50/80 transition-colors">
                <td class="p-3.5 font-mono font-bold text-slate-900">{{ pilot.id }}</td>
                <td class="p-3.5">
                  <div class="font-bold text-slate-900">{{ pilot.subjectCode }}</div>
                  <div class="text-[11px] text-slate-500 font-medium">{{ pilot.subjectTitle }}</div>
                </td>
                <td class="p-3.5">
                  <span class="font-bold text-slate-900">{{ pilot.sampleCount }} Cadets</span>
                  <span class="text-[11px] text-emerald-700 font-bold block font-mono">({{ pilot.completionRate }} Completed)</span>
                </td>
                <td class="p-3.5 font-bold font-mono">{{ pilot.avgDurationMin }} mins</td>
                <td class="p-3.5">
                  <span :class="['inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border', pilot.reliabilityStatus === 'Validated' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200']">
                    <CheckCircle2 class="w-3 h-3" /> {{ pilot.reliabilityStatus }}
                  </span>
                </td>
                <td class="p-3.5 text-right space-x-2">
                  <button 
                    @click="generateFormAD11(pilot)" 
                    type="button" 
                    class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-sm font-bold transition cursor-pointer shadow-xs inline-flex items-center gap-1"
                  >
                    <BarChart2 class="w-3.5 h-3.5" /> Form AD-11 (Item Analysis)
                  </button>
                  <button 
                    @click="generateFormAD18(pilot)" 
                    type="button" 
                    class="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-sm font-bold transition cursor-pointer shadow-xs inline-flex items-center gap-1"
                  >
                    <ClipboardCheck class="w-3.5 h-3.5" /> Form AD-18 (Checklist)
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  BarChart3, 
  PieChart, 
  ShieldCheck, 
  CheckCircle2, 
  Printer, 
  Search, 
  FileSpreadsheet, 
  ClipboardCheck, 
  BookOpen, 
  BarChart2 
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

// ACTIVE TAB STATE
const activeTab = ref('analytics')
const isLoading = ref(true)

// URL SYNC
watch(
  () => route?.query?.tab,
  (newTab) => {
    if (newTab && ['analytics', 'exam-built', 'post-pilot'].includes(newTab)) {
      activeTab.value = newTab
    }
  },
  { immediate: true }
)

function setActiveTab(tab) {
  activeTab.value = tab
  if (router && route) {
    router.replace({ query: { ...route.query, tab } }).catch(() => {})
  }
}

// ANALYTICS STATE
const questions = ref([])
const bloomStats = ref({ Remembering: 0, Understanding: 0, Application: 0, Analysis: 0 })
const stcwStats = ref({})

// FILTERS
const searchQuery = ref('')
const selectedCourse = ref('All')
const selectedTerm = ref('All')

// MASTER DATA
const savedTests = ref([])
const pilotSessions = ref([])
const examSubmissions = ref([])
const courses = ref([])

async function fetchApi(endpoint) {
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
    // Fall back to local storage
  }
  return null
}

function getCourseCode(item) {
  if (!item) return 'N/A'
  if (typeof item.course === 'string' && item.course.trim()) return item.course.trim()
  if (item.course && typeof item.course === 'object' && item.course.code) return item.course.code
  return item.course_code || item.courseCode || item.subject_code || item.subjectCode || item.subject || 'N/A'
}

function getCourseTitle(item) {
  if (!item) return 'Unassigned Course'
  if (item.course && typeof item.course === 'object' && item.course.title) return item.course.title
  return item.course_title || item.courseTitle || item.subject_title || item.subjectTitle || item.title || item.linkedPaper || item.name || 'Unassigned Course'
}

async function loadAllData() {
  isLoading.value = true
  try {
    // 1. Question Bank
    const qData = await fetchApi('/questions')
    if (Array.isArray(qData)) {
      questions.value = qData
    } else {
      const local = localStorage.getItem('cams_questions_data') || localStorage.getItem('cams_questions')
      questions.value = local ? JSON.parse(local) : []
    }
    calculateAnalyticsMetrics()

    // 2. Saved Test Blueprints
    const testsData = await fetchApi('/saved-tests')
    if (Array.isArray(testsData)) {
      savedTests.value = testsData
    } else {
      const local = localStorage.getItem('cams_saved_tests') || localStorage.getItem('saved_tests')
      savedTests.value = local ? JSON.parse(local) : []
    }

    // 3. Pilot Administration Sessions
    const pilotData = await fetchApi('/pilot-sessions')
    if (Array.isArray(pilotData)) {
      pilotSessions.value = pilotData
    } else {
      const local = localStorage.getItem('cams_pilot_sessions') || localStorage.getItem('pilot_sessions')
      pilotSessions.value = local ? JSON.parse(local) : []
    }

    // 4. Exam Submissions
    const subData = await fetchApi('/exam-submissions')
    if (Array.isArray(subData)) {
      examSubmissions.value = subData
    } else {
      const local = localStorage.getItem('cams_exam_submissions') || localStorage.getItem('exam_submissions')
      const parsed = local ? JSON.parse(local) : []
      // Filter out invalid/unassigned entries from local storage
      examSubmissions.value = Array.isArray(parsed) ? parsed.filter(s => s && (s.course || s.course_code || s.subject || s.test_id)) : []
    }

    // 5. Courses Catalog
    const courseData = await fetchApi('/courses')
    if (Array.isArray(courseData)) {
      courses.value = courseData
    } else {
      const local = localStorage.getItem('cams_courses_data') || localStorage.getItem('cams_courses')
      courses.value = local ? JSON.parse(local) : []
    }
  } catch (err) {
    console.error('Error loading institutional metrics:', err)
  } finally {
    isLoading.value = false
  }
}

function calculateAnalyticsMetrics() {
  const bloom = { Remembering: 0, Understanding: 0, Application: 0, Analysis: 0 }
  const stcw = {}

  if (Array.isArray(questions.value)) {
    questions.value.forEach(q => {
      const level = q?.bloomLevel || q?.bloom_level
      if (level && bloom[level] !== undefined) {
        bloom[level]++
      }
      const std = q?.stcwStandard || q?.stcw_standard
      if (std) {
        stcw[std] = (stcw[std] || 0) + 1
      }
    })
  }

  bloomStats.value = bloom
  stcwStats.value = stcw
}

onMounted(() => {
  isLoading.value = true
  loadAllData()
})

const availableTerms = computed(() => {
  const terms = new Set()
  if (Array.isArray(savedTests.value)) {
    savedTests.value.forEach(t => { if (t?.term) terms.add(t.term) })
  }
  if (Array.isArray(pilotSessions.value)) {
    pilotSessions.value.forEach(p => { if (p?.term) terms.add(p.term) })
  }
  return Array.from(terms)
})

const builtExams = computed(() => {
  if (!Array.isArray(savedTests.value) || savedTests.value.length === 0) return []

  const mapped = savedTests.value.map(test => {
    const code = getCourseCode(test)
    const title = getCourseTitle(test)
    const questionCount = test.questions ? test.questions.length : (test.totalItems || test.total_items || test.itemCount || 0)
    const dateString = test.createdAt 
      ? new Date(test.createdAt).toISOString().split('T')[0] 
      : (test.createdDate || test.created_at || 'N/A')

    return {
      id: test.id || test.code || `EX-${test.accessCode || '001'}`,
      rawTest: test,
      subjectCode: code,
      subjectTitle: title,
      term: test.term || 'Unassigned Term',
      academicYear: test.academicYear || test.academic_year || 'N/A',
      totalItems: questionCount,
      createdDate: dateString,
      status: test.status || 'Draft'
    }
  })

  const uniqueMap = new Map()
  mapped.forEach(exam => {
    const key = `${exam.subjectCode}-${exam.term}`
    if (!uniqueMap.has(key) || new Date(exam.createdDate) > new Date(uniqueMap.get(key).createdDate)) {
      uniqueMap.set(key, exam)
    }
  })

  return Array.from(uniqueMap.values()).filter(exam => {
    const q = searchQuery.value.toLowerCase().trim()
    const matchesSearch = !q || 
      exam.subjectCode.toLowerCase().includes(q) ||
      exam.subjectTitle.toLowerCase().includes(q) ||
      String(exam.id).toLowerCase().includes(q)

    const matchesCourse = selectedCourse.value === 'All' || exam.subjectCode === selectedCourse.value
    const matchesTerm = selectedTerm.value === 'All' || exam.term === selectedTerm.value

    return matchesSearch && matchesCourse && matchesTerm
  })
})

const completedPilots = computed(() => {
  const pilotMap = new Map()

  if (Array.isArray(examSubmissions.value) && examSubmissions.value.length > 0) {
    examSubmissions.value.forEach(sub => {
      const key = String(sub.test_id || sub.exam_id || sub.testId || '')
      if (!key) return

      const matchingSession = Array.isArray(pilotSessions.value) 
        ? pilotSessions.value.find(s => String(s.id || s.accessCode || s.access_code) === key)
        : null

      const code = matchingSession ? getCourseCode(matchingSession) : getCourseCode(sub)
      const title = matchingSession ? getCourseTitle(matchingSession) : getCourseTitle(sub)

      if (code === 'N/A' || code === '' || title === 'Unassigned Course') {
        return
      }

      if (!pilotMap.has(key)) {
        pilotMap.set(key, {
          id: matchingSession ? `PL-${matchingSession.access_code || matchingSession.accessCode || key}` : `PL-${key.slice(-6)}`,
          testId: key,
          rawTest: matchingSession || null,
          subjectCode: code,
          subjectTitle: title,
          term: matchingSession?.term || sub.term || 'Unassigned Term',
          submissions: []
        })
      }
      pilotMap.get(key).submissions.push(sub)
    })
  }

  if (pilotMap.size === 0) return []

  const result = []
  pilotMap.forEach((pilot) => {
    const subs = pilot.submissions || []
    const sampleCount = subs.length

    if (sampleCount === 0) return

    let totalMinutes = 0
    subs.forEach(s => {
      totalMinutes += Number(s.durationMinutes || s.duration_minutes || (s.time_spent ? Math.round(s.time_spent / 60) : 0))
    })
    const avgDuration = sampleCount > 0 ? Math.round(totalMinutes / sampleCount) : 0

    let poorCount = 0
    if (pilot.rawTest && Array.isArray(pilot.rawTest.questions)) {
      pilot.rawTest.questions.forEach(q => {
        if (q.status === 'Flagged' || q.status === 'Needs Review' || q.retained_ai === false) poorCount++
      })
    }

    result.push({
      id: pilot.id,
      examCode: `EX-${pilot.testId}`,
      subjectCode: pilot.subjectCode,
      subjectTitle: pilot.subjectTitle,
      term: pilot.term,
      sampleCount,
      avgDurationMin: avgDuration,
      completionRate: sampleCount > 0 ? '100%' : '0%',
      reliabilityStatus: sampleCount >= 10 ? 'Validated' : (sampleCount > 0 ? 'In Progress' : 'Pending Cohort'),
      poorItemsCount: poorCount
    })
  })

  return result.filter(pilot => {
    const q = searchQuery.value.toLowerCase().trim()
    const matchesSearch = !q || 
      pilot.subjectCode.toLowerCase().includes(q) ||
      pilot.subjectTitle.toLowerCase().includes(q) ||
      String(pilot.id).toLowerCase().includes(q)

    const matchesCourse = selectedCourse.value === 'All' || pilot.subjectCode === selectedCourse.value
    const matchesTerm = selectedTerm.value === 'All' || pilot.term === selectedTerm.value

    return matchesSearch && matchesCourse && matchesTerm
  })
})

function generateFormAD09(exam) {
  alert(`Exporting Form AD-09 (Table of Specifications) for ${exam.subjectCode}...`)
}

function generateFormAD10(exam) {
  alert(`Exporting Form AD-10 (Examination Questionnaire) for ${exam.subjectCode}...`)
}

function generateFormAD11(pilot) {
  alert(`Exporting Form AD-11 (Item Analysis Report) for ${pilot.subjectCode}...`)
}

function generateFormAD18(pilot) {
  alert(`Exporting Form AD-18 (Validation Checklist) for ${pilot.subjectCode}...`)
}
</script>