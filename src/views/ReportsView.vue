<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { 
  BarChart2, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  Award,
  FileSpreadsheet,
  RefreshCw,
  TrendingUp,
  FileText
} from 'lucide-vue-next'

// State
const isLoading = ref(false)
const selectedCohort = ref('all')

const examSubmissions = ref([])
const questions = ref([])
const courses = ref([])
const savedTests = ref([])

// Fetch dynamic data from backend API with localStorage fallbacks
async function fetchData() {
  isLoading.value = true
  try {
    // 1. Fetch Exam Submissions
    try {
      const subRes = await axios.get('/api/exam-submissions')
      examSubmissions.value = Array.isArray(subRes.data) ? subRes.data : []
    } catch {
      const localSubs = localStorage.getItem('cams_exam_submissions')
      examSubmissions.value = localSubs ? JSON.parse(localSubs) : []
    }

    // 2. Fetch Questions
    try {
      const qRes = await axios.get('/api/questions')
      questions.value = Array.isArray(qRes.data) ? qRes.data : []
    } catch {
      const localQ = localStorage.getItem('cams_questions')
      questions.value = localQ ? JSON.parse(localQ) : []
    }

    // 3. Fetch Courses
    try {
      const cRes = await axios.get('/api/courses')
      courses.value = Array.isArray(cRes.data) ? cRes.data : []
    } catch {
      const localC = localStorage.getItem('cams_courses')
      courses.value = localC ? JSON.parse(localC) : []
    }

    // 4. Fetch Saved Tests
    const localTests = localStorage.getItem('cams_saved_tests')
    savedTests.value = localTests ? JSON.parse(localTests) : []

  } catch (err) {
    console.error('Error loading report data:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchData()
})

// Filter submissions by selected course / cohort
const filteredSubmissions = computed(() => {
  if (selectedCohort.value === 'all') return examSubmissions.value
  return examSubmissions.value.filter(s => {
    if (!s) return false
    if (s.course_id) return String(s.course_id) === String(selectedCohort.value)
    if (s.course && s.course.id) return String(s.course.id) === String(selectedCohort.value)
    if (s.course_code) return s.course_code === selectedCohort.value
    return false
  })
})

// Dynamic Metrics Calculation
const summaryMetrics = computed(() => {
  const subs = filteredSubmissions.value
  const totalCompleted = subs.length

  const flaggedCount = questions.value.filter(q => {
    const status = (q.status || '').toLowerCase()
    return status === 'flagged' || status === 'needs review' || q.retained_ai === false
  }).length

  if (totalCompleted === 0) {
    return {
      overallPassRate: '0.0%',
      averageScore: '0.0%',
      completedExams: 0,
      flaggedItems: flaggedCount
    }
  }

  let totalPercent = 0
  let passingCount = 0

  subs.forEach(sub => {
    const totalItems = Number(sub.total_items) || 1
    const score = Number(sub.score) || 0
    const pct = (score / totalItems) * 100
    totalPercent += pct
    if (pct >= 75) passingCount++
  })

  const avgPct = totalPercent / totalCompleted
  const passRatePct = (passingCount / totalCompleted) * 100

  return {
    overallPassRate: `${passRatePct.toFixed(1)}%`,
    averageScore: `${avgPct.toFixed(1)}%`,
    completedExams: totalCompleted,
    flaggedItems: flaggedCount
  }
})

// Dynamic Competency Breakdown
const competencyBreakdown = computed(() => {
  const map = new Map()

  // Seed standard competencies from questions
  questions.value.forEach(q => {
    const code = q.stcw_standard || (q.course ? q.course.code : null) || 'STCW Assessment'
    if (!map.has(code)) {
      map.set(code, {
        code: code,
        title: q.course ? q.course.title : (code.includes('A-') ? `STCW Competency (${code})` : code),
        submissionsCount: 0,
        passingSubmissions: 0
      })
    }
  })

  // Seed competencies from registered courses
  courses.value.forEach(c => {
    const code = c.code || `COURSE-${c.id}`
    if (!map.has(code)) {
      map.set(code, {
        code: code,
        title: c.title || 'Maritime Competency',
        submissionsCount: 0,
        passingSubmissions: 0
      })
    }
  })

  // Aggregate student exam submissions
  filteredSubmissions.value.forEach(sub => {
    let key = null
    if (sub.course && sub.course.code) key = sub.course.code
    else if (sub.course_id) {
      const match = courses.value.find(c => String(c.id) === String(sub.course_id))
      if (match) key = match.code
    }
    if (!key) key = 'General Assessment'

    if (!map.has(key)) {
      map.set(key, {
        code: key,
        title: 'Maritime Assessment Module',
        submissionsCount: 0,
        passingSubmissions: 0
      })
    }

    const item = map.get(key)
    const total = Number(sub.total_items) || 1
    const score = Number(sub.score) || 0
    const pct = (score / total) * 100

    item.submissionsCount++
    if (pct >= 75) item.passingSubmissions++
  })

  const results = []
  map.forEach((data, key) => {
    const passRate = data.submissionsCount > 0 
      ? Math.round((data.passingSubmissions / data.submissionsCount) * 100) 
      : 0

    results.push({
      code: key,
      title: data.title,
      passRate: passRate,
      submissionsCount: data.submissionsCount,
      status: passRate >= 75 ? 'Compliant' : (data.submissionsCount === 0 ? 'Pending Submissions' : 'Needs Review')
    })
  })

  return results
})

// Dynamic Cohort/Course Options
const cohortOptions = computed(() => {
  const list = [{ value: 'all', label: 'All Courses & Batches' }]
  courses.value.forEach(c => {
    list.push({
      value: String(c.id),
      label: `${c.code} - ${c.title}`
    })
  })
  return list
})

// Export CSV Functionality with Dynamic Data
function exportReportCSV() {
  if (competencyBreakdown.value.length === 0) {
    alert('No competency data available to export.')
    return
  }

  let csvContent = 'data:text/csv;charset=utf-8,'
  csvContent += 'STCW Code / Course,Title,Submissions Count,Pass Rate (%),Status\n'

  competencyBreakdown.value.forEach(row => {
    const escape = (str) => `"${String(str || '').replace(/"/g, '""')}"`
    csvContent += `${escape(row.code)},${escape(row.title)},${row.submissionsCount},${row.passRate}%,${escape(row.status)}\n`
  })

  csvContent += '\nSUMMARY METRICS\n'
  csvContent += `Completed Exams,${summaryMetrics.value.completedExams}\n`
  csvContent += `Overall Pass Rate,${summaryMetrics.value.overallPassRate}\n`
  csvContent += `Average Score,${summaryMetrics.value.averageScore}\n`
  csvContent += `Flagged Questions,${summaryMetrics.value.flaggedItems}\n`

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `STCW_Assessment_Report_${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div>
        <h1 class="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart2 class="w-6 h-6 text-emerald-600" />
          Assessment & Competency Compliance Reports
        </h1>
        <p class="text-xs text-slate-500 mt-1 font-medium">
          Real-time analytics synchronized across Test Builder, Pilot Administration, and Exam Submissions.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button 
          @click="fetchData" 
          :disabled="isLoading"
          class="p-2.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 border border-slate-200 rounded-xl transition cursor-pointer disabled:opacity-50"
          title="Refresh Data"
        >
          <RefreshCw :class="['w-4 h-4', { 'animate-spin': isLoading }]" />
        </button>

        <button 
          @click="exportReportCSV"
          class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
        >
          <Download class="w-4 h-4" />
          Export CSV Report
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <div class="flex items-center justify-between text-slate-500">
          <span class="text-xs font-bold uppercase tracking-wider">Overall Pass Rate</span>
          <Award class="w-5 h-5 text-emerald-600" />
        </div>
        <div class="text-2xl font-black text-slate-900">{{ summaryMetrics.overallPassRate }}</div>
        <div class="text-[11px] text-slate-500 font-medium">Threshold benchmark: 75%</div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <div class="flex items-center justify-between text-slate-500">
          <span class="text-xs font-bold uppercase tracking-wider">Average Score</span>
          <TrendingUp class="w-5 h-5 text-blue-600" />
        </div>
        <div class="text-2xl font-black text-slate-900">{{ summaryMetrics.averageScore }}</div>
        <div class="text-[11px] text-slate-500 font-medium">Mean cadet percentage score</div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <div class="flex items-center justify-between text-slate-500">
          <span class="text-xs font-bold uppercase tracking-wider">Completed Exams</span>
          <Users class="w-5 h-5 text-purple-600" />
        </div>
        <div class="text-2xl font-black text-slate-900">{{ summaryMetrics.completedExams }}</div>
        <div class="text-[11px] text-slate-500 font-medium">Total exam submissions recorded</div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <div class="flex items-center justify-between text-slate-500">
          <span class="text-xs font-bold uppercase tracking-wider">Flagged Items</span>
          <AlertTriangle class="w-5 h-5 text-amber-500" />
        </div>
        <div class="text-2xl font-black text-slate-900">{{ summaryMetrics.flaggedItems }}</div>
        <div class="text-[11px] text-slate-500 font-medium">Questions requiring review</div>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet class="w-5 h-5 text-emerald-600" />
            STCW Standard & Competency Breakdown
          </h2>
          <p class="text-xs text-slate-500 mt-0.5">Proficiency evaluation across courses and assessment standards.</p>
        </div>

        <select 
          v-model="selectedCohort"
          class="border border-slate-300 rounded-xl text-xs font-semibold px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
        >
          <option v-for="opt in cohortOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <div v-if="competencyBreakdown.length === 0" class="py-12 text-center text-slate-400 space-y-2">
        <FileText class="w-10 h-10 mx-auto text-slate-300" />
        <p class="text-xs font-bold text-slate-600">No competency data available</p>
        <p class="text-[11px] text-slate-400">Add questions or conduct exams in Test Builder / Student Exam views to populate metrics.</p>
      </div>

      <div v-else class="space-y-4 pt-2">
        <div v-for="comp in competencyBreakdown" :key="comp.code" class="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-2">
          <div class="flex justify-between items-center text-xs">
            <div class="flex items-center gap-2">
              <span class="font-mono font-bold text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded-lg shadow-2xs">
                {{ comp.code }}
              </span>
              <span class="font-bold text-slate-900">{{ comp.title }}</span>
            </div>

            <div class="flex items-center gap-3">
              <span class="font-bold text-slate-800">{{ comp.passRate }}% Proficiency</span>
              <span 
                :class="[
                  'px-2 py-0.5 text-[10px] font-bold rounded-md border',
                  comp.status === 'Compliant' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : comp.status === 'Pending Submissions'
                    ? 'bg-slate-100 text-slate-600 border-slate-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                ]"
              >
                {{ comp.status }}
              </span>
            </div>
          </div>

          <div class="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div 
              class="h-full transition-all duration-500 rounded-full"
              :class="comp.passRate >= 75 ? 'bg-emerald-600' : 'bg-amber-500'"
              :style="{ width: `${comp.passRate}%` }"
            ></div>
          </div>

          <div class="text-[11px] text-slate-500 flex justify-between pt-1">
            <span>Recorded Submissions: {{ comp.submissionsCount }}</span>
            <span>Target Benchmark: 75% Pass Rate</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>