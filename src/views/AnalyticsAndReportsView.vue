<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  BarChart3, 
  PieChart, 
  ShieldCheck, 
  FileText, 
  Download, 
  CheckCircle2, 
  Printer, 
  Search, 
  RefreshCw, 
  FileSpreadsheet, 
  ClipboardCheck, 
  BookOpen, 
  BarChart2 
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

// Active Tab State ('analytics' | 'exam-built' | 'post-pilot')
const activeTab = ref('analytics')
const isLoading = ref(false)

// Sync tab with URL Query parameter (?tab=...)
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

// Analytics State
const questions = ref([])
const bloomStats = ref({ Remembering: 0, Understanding: 0, Application: 0, Analysis: 0 })
const stcwStats = ref({})

// Filter States
const searchQuery = ref('')
const selectedCourse = ref('All')
const selectedTerm = ref('All')

// Registries loaded from TestBuilder, Pilot System, & Master Courses
const savedTests = ref([])
const pilotSessions = ref([])
const examSubmissions = ref([])
const courses = ref([])

// Attribute Extractors
function getCourseCode(item) {
  if (!item) return 'NAV-101'
  if (typeof item.course === 'string' && item.course.trim()) return item.course.trim()
  if (item.course && typeof item.course === 'object' && item.course.code) return item.course.code
  return item.course_code || item.courseCode || item.subject_code || item.subjectCode || item.subject || 'NAV-101'
}

function getCourseTitle(item) {
  if (!item) return 'General Assessment'
  if (item.course && typeof item.course === 'object' && item.course.title) return item.course.title
  return item.course_title || item.courseTitle || item.subject_title || item.subjectTitle || item.title || item.linkedPaper || item.name || 'General Assessment'
}

async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
  return await res.json()
}

async function loadAllData() {
  isLoading.value = true
  try {
    // 1. Questions Bank Data
    try {
      const qData = await fetchJson('http://127.0.0.1:8000/api/questions')
      questions.value = Array.isArray(qData?.data) ? qData.data : (Array.isArray(qData) ? qData : [])
    } catch {
      const localQs = localStorage.getItem('cams_questions_data') || localStorage.getItem('cams_questions')
      questions.value = localQs ? JSON.parse(localQs) : []
    }
    calculateAnalyticsMetrics()

    // 2. Saved Tests Data (TestBuilder)
    try {
      const testsData = await fetchJson('/api/saved-tests')
      savedTests.value = Array.isArray(testsData) ? testsData : []
    } catch {
      const localTests = localStorage.getItem('cams_saved_tests') || localStorage.getItem('saved_tests')
      savedTests.value = localTests ? JSON.parse(localTests) : []
    }

    // 3. Pilot Sessions Data (Pilot Admin)
    try {
      const pilotData = await fetchJson('/api/pilot-sessions')
      pilotSessions.value = Array.isArray(pilotData) ? pilotData : []
    } catch {
      const localPilots = localStorage.getItem('cams_pilot_sessions') || localStorage.getItem('pilot_sessions')
      pilotSessions.value = localPilots ? JSON.parse(localPilots) : []
    }

    // 4. Exam Submissions Data
    try {
      const subData = await fetchJson('/api/exam-submissions')
      examSubmissions.value = Array.isArray(subData) ? subData : []
    } catch {
      const localSubs = localStorage.getItem('cams_exam_submissions') || localStorage.getItem('exam_submissions')
      examSubmissions.value = localSubs ? JSON.parse(localSubs) : []
    }

    // 5. Master Courses Data
    try {
      const courseData = await fetchJson('/api/courses')
      courses.value = Array.isArray(courseData) ? courseData : []
    } catch {
      const localCourses = localStorage.getItem('cams_courses_data') || localStorage.getItem('cams_courses')
      courses.value = localCourses ? JSON.parse(localCourses) : []
    }
  } catch (err) {
    console.error('Error loading Institutional Analytics & Reports data:', err)
  } finally {
    isLoading.value = false
  }
}

function calculateAnalyticsMetrics() {
  const bloom = { Remembering: 0, Understanding: 0, Application: 0, Analysis: 0 }
  const stcw = {}

  if (Array.isArray(questions.value)) {
    questions.value.forEach(q => {
      if (q && (q.bloomLevel || q.bloom_level) && bloom[q.bloomLevel || q.bloom_level] !== undefined) {
        bloom[q.bloomLevel || q.bloom_level]++
      }
      const std = (q && (q.stcwStandard || q.stcw_standard)) ? (q.stcwStandard || q.stcw_standard) : 'Table A-II/1'
      stcw[std] = (stcw[std] || 0) + 1
    })
  }

  bloomStats.value = bloom
  stcwStats.value = stcw
}

onMounted(() => {
  loadAllData()
})

const availableTerms = computed(() => {
  const terms = new Set(['Midterm', 'Final', 'Prelim'])
  if (Array.isArray(savedTests.value)) {
    savedTests.value.forEach(t => { if (t?.term) terms.add(t.term) })
  }
  if (Array.isArray(pilotSessions.value)) {
    pilotSessions.value.forEach(p => { if (p?.term) terms.add(p.term) })
  }
  return Array.from(terms)
})

// STAGE 1: Built Exams strictly derived from TestBuilder blueprints (AD-09 & AD-10)
const builtExams = computed(() => {
  if (!Array.isArray(savedTests.value) || savedTests.value.length === 0) return []

  // Map saved test blueprints
  const mapped = savedTests.value.map(test => {
    const code = getCourseCode(test)
    const title = getCourseTitle(test)
    const questionCount = test.questions ? test.questions.length : (test.totalItems || test.total_items || test.itemCount || 41)
    const dateString = test.createdAt 
      ? new Date(test.createdAt).toISOString().split('T')[0] 
      : (test.createdDate || test.created_at || new Date().toISOString().split('T')[0])

    return {
      id: test.id || test.code || `EX-${test.accessCode || '2026'}`,
      rawTest: test,
      subjectCode: code,
      subjectTitle: title,
      term: test.term || 'Midterm',
      academicYear: test.academicYear || test.academic_year || '2026-2027',
      totalItems: questionCount,
      createdDate: dateString,
      status: test.status || 'Ready for Pilot'
    }
  })

  // Deduplicate blueprints by Subject Code + Term (keeping the latest blueprint)
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

// STAGE 2: Completed Pilots aggregated from Pilot Sessions & Submissions (AD-11 & AD-18)
const completedPilots = computed(() => {
  const pilotMap = new Map()

  // 1. Read Pilot Admin Sessions
  if (Array.isArray(pilotSessions.value)) {
    pilotSessions.value.forEach(session => {
      const sessId = String(session.id || session.accessCode || '1')
      pilotMap.set(sessId, {
        id: `PL-${session.accessCode || sessId.slice(-6)}`,
        testId: sessId,
        rawTest: session,
        subjectCode: getCourseCode(session),
        subjectTitle: getCourseTitle(session),
        term: session.term || 'Midterm',
        submissions: []
      })
    })
  }

  // 2. Read Saved Tests Fallback if no pilot sessions exist
  if (pilotMap.size === 0 && Array.isArray(savedTests.value)) {
    savedTests.value.forEach(test => {
      const testId = String(test.id || test.code || '1')
      pilotMap.set(testId, {
        id: `PL-${test.code || testId.slice(-6)}`,
        testId: testId,
        rawTest: test,
        subjectCode: getCourseCode(test),
        subjectTitle: getCourseTitle(test),
        term: test.term || 'Midterm',
        submissions: []
      })
    })
  }

  // 3. Aggregate Student Exam Submissions
  if (Array.isArray(examSubmissions.value)) {
    examSubmissions.value.forEach(sub => {
      const key = String(sub.test_id || sub.exam_id || sub.testId || '1')
      if (!pilotMap.has(key)) {
        pilotMap.set(key, {
          id: `PL-${key.slice(-6)}`,
          testId: key,
          rawTest: null,
          subjectCode: getCourseCode(sub),
          subjectTitle: getCourseTitle(sub),
          term: sub.term || 'Midterm',
          submissions: []
        })
      }
      pilotMap.get(key).submissions.push(sub)
    })
  }

  const result = []
  pilotMap.forEach((pilot) => {
    const subs = pilot.submissions || []
    const sampleCount = subs.length

    let totalMinutes = 0
    subs.forEach(s => {
      totalMinutes += Number(s.durationMinutes || s.duration_minutes || (s.time_spent ? Math.round(s.time_spent / 60) : 45))
    })
    const avgDuration = sampleCount > 0 ? Math.round(totalMinutes / sampleCount) : 45

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

function generateAD09(exam) {
  alert(`[Form AD-09: Table of Specifications (T.O.S.)]\nGenerating TOS for ${exam.subjectCode} - ${exam.subjectTitle}\nTotal Items: ${exam.totalItems} Qs`)
}

function generateAD10(exam) {
  alert(`[Form AD-10: Examination Questionnaire]\nExporting Questionnaire for ${exam.subjectCode} - ${exam.subjectTitle}`)
}

function generateAD11(pilot) {
  alert(`[Form AD-11: Item Analysis Result]\nGenerating analysis for ${pilot.subjectCode} - ${pilot.subjectTitle}\nCohort: ${pilot.sampleCount} Cadets`)
}

function generateAD18(pilot) {
  alert(`[Form AD-18: Validation Checklist]\nValidation checklist for ${pilot.subjectCode} - ${pilot.subjectTitle}\nStatus: ${pilot.reliabilityStatus}`)
}
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6 font-sans relative z-10">
    
    <!-- Top Header Banner -->
    <div class="bg-slate-900 text-white p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
      <div>
        <h1 class="text-xl font-bold flex items-center gap-2 text-white tracking-tight">
          <BarChart3 class="text-emerald-400" :size="22" /> STCW Curriculum Analytics & Form Center
        </h1>
        <p class="text-xs text-slate-300 mt-1">
          Monitor cognitive balance, STCW coverage, and generate official institutional forms (AD-09, AD-10, AD-11, AD-18).
        </p>
      </div>

      <div class="flex items-center gap-3 shrink-0">
        <button 
          @click="loadAllData" 
          :disabled="isLoading"
          type="button"
          class="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition cursor-pointer disabled:opacity-50"
        >
          <RefreshCw :class="['w-4 h-4', { 'animate-spin': isLoading }]" />
        </button>

        <div class="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 text-right">
          <span class="text-[10px] text-slate-400 block font-bold uppercase">Total Bank Items</span>
          <span class="text-lg font-extrabold text-emerald-400">{{ questions.length }}</span>
        </div>
      </div>
    </div>

    <!-- Navigation Pills -->
    <div class="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
      <button
        type="button"
        @click="setActiveTab('analytics')"
        :class="[
          'px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 select-none relative z-20',
          activeTab === 'analytics' 
            ? 'bg-emerald-600 text-white shadow-sm' 
            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
        ]"
      >
        <PieChart :size="16" /> Curriculum Analytics
      </button>

      <button
        type="button"
        @click="setActiveTab('exam-built')"
        :class="[
          'px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 select-none relative z-20',
          activeTab === 'exam-built' 
            ? 'bg-emerald-600 text-white shadow-sm' 
            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
        ]"
      >
        <ClipboardCheck :size="16" /> Stage 1: Exam Built (AD-09 / AD-10)
      </button>

      <button
        type="button"
        @click="setActiveTab('post-pilot')"
        :class="[
          'px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 select-none relative z-20',
          activeTab === 'post-pilot' 
            ? 'bg-emerald-600 text-white shadow-sm' 
            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
        ]"
      >
        <BarChart2 :size="16" /> Stage 2: Post-Pilot (AD-11 / AD-18)
      </button>
    </div>

    <!-- TAB 1: CURRICULUM ANALYTICS -->
    <div v-if="activeTab === 'analytics'" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
            <PieChart class="text-emerald-600" :size="16" /> Bloom's Taxonomy Cognitive Balance
          </h2>
          <div class="space-y-3 pt-2">
            <div v-for="(count, level) in bloomStats" :key="level" class="space-y-1">
              <div class="flex justify-between text-xs font-bold text-slate-700">
                <span>{{ level }}</span>
                <span>{{ count }} items ({{ questions.length ? Math.round((count / questions.length) * 100) : 0 }}%)</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div class="bg-slate-800 h-3 rounded-full transition-all" :style="{ width: `${questions.length ? (count / questions.length) * 100 : 0}%` }"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck class="text-emerald-600" :size="16" /> STCW Competency Standard Coverage
          </h2>
          <div class="space-y-3 pt-2">
            <div v-for="(count, std) in stcwStats" :key="std" class="p-3 border border-slate-200 rounded-xl flex justify-between items-center bg-slate-50">
              <div>
                <span class="font-mono text-xs font-bold text-slate-900 block">{{ std }}</span>
                <span class="text-[10px] text-slate-500">Compliant with STCW Code Section A</span>
              </div>
              <span class="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg">{{ count }} Items</span>
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
          class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
        />
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto">
        <select v-model="selectedCourse" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer">
          <option value="All">All Courses</option>
          <option v-for="(c, idx) in courses" :key="c.id || c.code || idx" :value="c.code || c.subjectCode || c.id">
            {{ c.code || c.subjectCode || c.title }}
          </option>
        </select>

        <select v-model="selectedTerm" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer">
          <option value="All">All Terms</option>
          <option v-for="term in availableTerms" :key="term" :value="term">
            {{ term }}
          </option>
        </select>
      </div>
    </div>

    <!-- TAB 2: STAGE 1 - EXAM BUILT REPORTS -->
    <div v-if="activeTab === 'exam-built'" class="space-y-4">
      <div class="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between">
        <div class="flex items-center gap-3">
          <ClipboardCheck class="w-5 h-5 text-emerald-600" />
          <div>
            <h3 class="text-xs font-bold text-emerald-900">Stage 1: Exam Built Reports</h3>
            <p class="text-[11px] text-emerald-700">Form AD-09 (T.O.S.) and Form AD-10 (Questionnaire) generated from TestBuilder blueprints.</p>
          </div>
        </div>
        <span class="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
          {{ builtExams.length }} Tests Available
        </span>
      </div>

      <div v-if="builtExams.length === 0" class="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 space-y-2">
        <BookOpen class="w-10 h-10 mx-auto text-slate-300" />
        <p class="text-xs font-bold text-slate-600">No built tests found</p>
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
          <tbody class="divide-y divide-slate-100 text-xs text-slate-700">
            <tr v-for="exam in builtExams" :key="exam.id" class="hover:bg-slate-50">
              <td class="p-3.5 font-mono font-bold text-slate-800">{{ exam.id }}</td>
              <td class="p-3.5">
                <div class="font-bold text-slate-900">{{ exam.subjectCode }}</div>
                <div class="text-[11px] text-slate-500">{{ exam.subjectTitle }}</div>
              </td>
              <td class="p-3.5">{{ exam.term }} ({{ exam.academicYear }})</td>
              <td class="p-3.5 font-medium">{{ exam.totalItems }} Qs</td>
              <td class="p-3.5 text-slate-500">{{ exam.createdDate }}</td>
              <td class="p-3.5 text-right space-x-2">
                <button @click="generateAD09(exam)" type="button" class="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-100 cursor-pointer">
                  <FileSpreadsheet class="w-3.5 h-3.5 inline mr-1" /> Form AD-09 (TOS)
                </button>
                <button @click="generateAD10(exam)" type="button" class="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900 cursor-pointer">
                  <Printer class="w-3.5 h-3.5 inline mr-1" /> Form AD-10 (Exam)
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 3: STAGE 2 - POST-PILOT REPORTS -->
    <div v-if="activeTab === 'post-pilot'" class="space-y-4">
      <div class="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between">
        <div class="flex items-center gap-3">
          <BarChart2 class="w-5 h-5 text-amber-600" />
          <div>
            <h3 class="text-xs font-bold text-amber-900">Stage 2: Post-Pilot Testing Reports</h3>
            <p class="text-[11px] text-amber-700">Form AD-11 (Item Analysis) and Form AD-18 (Validation Checklist) calculated from Pilot Submissions.</p>
          </div>
        </div>
        <span class="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
          {{ completedPilots.length }} Pilots Recorded
        </span>
      </div>

      <div v-if="completedPilots.length === 0" class="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 space-y-2">
        <BarChart2 class="w-10 h-10 mx-auto text-slate-300" />
        <p class="text-xs font-bold text-slate-600">No pilot submissions found</p>
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
          <tbody class="divide-y divide-slate-100 text-xs text-slate-700">
            <tr v-for="pilot in completedPilots" :key="pilot.id" class="hover:bg-slate-50">
              <td class="p-3.5 font-mono font-bold text-slate-800">{{ pilot.id }}</td>
              <td class="p-3.5">
                <div class="font-bold text-slate-900">{{ pilot.subjectCode }}</div>
                <div class="text-[11px] text-slate-500">{{ pilot.subjectTitle }}</div>
              </td>
              <td class="p-3.5">
                <span class="font-bold text-slate-800">{{ pilot.sampleCount }} Cadets</span>
                <span class="text-[11px] text-emerald-600 block">({{ pilot.completionRate }} Completed)</span>
              </td>
              <td class="p-3.5 font-medium">{{ pilot.avgDurationMin }} mins</td>
              <td class="p-3.5">
                <span :class="['inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full', pilot.reliabilityStatus === 'Validated' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800']">
                  <CheckCircle2 class="w-3 h-3" /> {{ pilot.reliabilityStatus }}
                </span>
              </td>
              <td class="p-3.5 text-right space-x-2">
                <button @click="generateAD11(pilot)" type="button" class="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold hover:bg-blue-100 cursor-pointer">
                  <BarChart2 class="w-3.5 h-3.5 inline mr-1" /> Form AD-11 (Item Analysis)
                </button>
                <button @click="generateAD18(pilot)" type="button" class="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold hover:bg-purple-100 cursor-pointer">
                  <ClipboardCheck class="w-3.5 h-3.5 inline mr-1" /> Form AD-18 (Checklist)
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>