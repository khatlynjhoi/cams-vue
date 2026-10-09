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
  FileText,
  Filter,
  Layers,
  BookOpen,
  HelpCircle,
  Check
} from 'lucide-vue-next'

// State
const isLoading = ref(false)
const selectedSubjectFilter = ref('all')

// Master data collections fetched from API / localStorage
const examSubmissions = ref([])
const questions = ref([])
const courses = ref([])
const savedTests = ref([])
const pilotTests = ref([])
const tosData = ref([])

// Safely parse JSON from localStorage
function safeParse(key, fallback = []) {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : fallback
  } catch (err) {
    console.warn(`Error parsing localStorage key '${key}':`, err)
    return fallback
  }
}

// Fetch dynamic data from API and fall back to localStorage
async function fetchData() {
  isLoading.value = true
  try {
    // 1. Exam Submissions
    try {
      const subRes = await axios.get('/api/exam-submissions')
      examSubmissions.value = Array.isArray(subRes.data) ? subRes.data : []
    } catch {
      examSubmissions.value = safeParse('cams_exam_submissions', safeParse('cams_student_submissions', []))
    }

    // 2. Questions
    try {
      const qRes = await axios.get('/api/questions')
      questions.value = Array.isArray(qRes.data) ? qRes.data : []
    } catch {
      questions.value = safeParse('cams_questions', [])
    }

    // 3. Courses
    try {
      const cRes = await axios.get('/api/courses')
      courses.value = Array.isArray(cRes.data) ? cRes.data : []
    } catch {
      courses.value = safeParse('cams_courses', [])
    }

    // 4. Saved Tests (from Test-Exam Builder)
    savedTests.value = safeParse('cams_saved_tests', safeParse('cams_tests', []))

    // 5. Pilot Tests / Administrations (from Pilot Admin view)
    pilotTests.value = safeParse('cams_pilot_tests', safeParse('cams_pilot_administrations', []))

    // 6. TOS Data
    tosData.value = safeParse('cams_tos_data', safeParse('cams_uploaded_questionnaires', []))

  } catch (err) {
    console.error('Error fetching report data:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchData()
})

// Unified collection of all dynamic subjects/courses identified in user data
const dynamicSubjectsList = computed(() => {
  const subjectsMap = new Map()

  // Helper to register or update subject record
  const registerSubject = (code, title, stcw = '', source = '') => {
    if (!code && !title) return
    const key = (code || title).trim().toUpperCase()
    if (!key) return

    if (!subjectsMap.has(key)) {
      subjectsMap.set(key, {
        key,
        code: code || key,
        title: title || code || key,
        stcwStandard: stcw || (key.includes('STCW') ? key : ''),
        sources: new Set([source])
      })
    } else {
      const existing = subjectsMap.get(key)
      if (title && (!existing.title || existing.title === existing.code)) existing.title = title
      if (stcw && !existing.stcwStandard) existing.stcwStandard = stcw
      existing.sources.add(source)
    }
  }

  // 1. From Courses Registry
  courses.value.forEach(c => {
    registerSubject(c.code, c.title, c.stcw_standard || c.stcw, 'Courses')
  })

  // 2. From Saved Tests (Test Builder)
  savedTests.value.forEach(t => {
    const code = t.subjectCode || t.courseCode || t.subject || t.code || ''
    const title = t.subjectTitle || t.courseTitle || t.title || t.name || ''
    const stcw = t.stcwStandard || t.competency || ''
    registerSubject(code, title, stcw, 'Test Builder')
  })

  // 3. From Pilot Tests
  pilotTests.value.forEach(pt => {
    const code = pt.subjectCode || pt.courseCode || pt.subject || pt.code || ''
    const title = pt.subjectTitle || pt.courseTitle || pt.title || pt.name || ''
    registerSubject(code, title, pt.stcwStandard || '', 'Pilot Admin')
  })

  // 4. From Exam Submissions
  examSubmissions.value.forEach(sub => {
    const code = sub.subject_code || sub.course_code || (sub.course ? sub.course.code : '') || sub.subject || ''
    const title = sub.subject_title || sub.course_title || (sub.course ? sub.course.title : '') || sub.test_title || ''
    registerSubject(code, title, '', 'Submissions')
  })

  // 5. From Question Bank
  questions.value.forEach(q => {
    const code = q.course_code || (q.course ? q.course.code : '') || q.subject || ''
    const title = q.course_title || (q.course ? q.course.title : '') || ''
    const stcw = q.stcw_standard || q.stcw || ''
    registerSubject(code, title, stcw, 'Question Bank')
  })

  // 6. From TOS / Uploads
  tosData.value.forEach(tos => {
    const code = tos.subjectCode || tos.subject || tos.code || ''
    const title = tos.subjectTitle || tos.title || ''
    registerSubject(code, title, '', 'TOS Uploads')
  })

  return Array.from(subjectsMap.values())
})

// Filtered Exam Submissions based on selected subject
const filteredSubmissions = computed(() => {
  if (selectedSubjectFilter.value === 'all') return examSubmissions.value
  const targetKey = selectedSubjectFilter.value.toUpperCase()

  return examSubmissions.value.filter(s => {
    if (!s) return false
    const sCode = (s.subject_code || s.course_code || (s.course && s.course.code) || s.subject || '').trim().toUpperCase()
    const sTitle = (s.subject_title || s.course_title || (s.course && s.course.title) || s.test_title || '').trim().toUpperCase()
    return sCode === targetKey || sTitle === targetKey
  })
})

// Filtered Pilot Tests based on selected subject
const filteredPilotTests = computed(() => {
  if (selectedSubjectFilter.value === 'all') return pilotTests.value
  const targetKey = selectedSubjectFilter.value.toUpperCase()

  return pilotTests.value.filter(pt => {
    if (!pt) return false
    const ptCode = (pt.subjectCode || pt.courseCode || pt.subject || pt.code || '').trim().toUpperCase()
    const ptTitle = (pt.subjectTitle || pt.courseTitle || pt.title || pt.name || '').trim().toUpperCase()
    return ptCode === targetKey || ptTitle === targetKey
  })
})

// Dynamic Metrics Calculation
const summaryMetrics = computed(() => {
  const subs = filteredSubmissions.value
  const pilots = filteredPilotTests.value

  let totalExamsCompleted = subs.length
  let totalScoresSum = 0
  let passingExamsCount = 0

  // Calculate scores from Exam Submissions
  subs.forEach(sub => {
    const totalItems = Number(sub.total_items || sub.totalItems) || 1
    const score = Number(sub.score) || 0
    const pct = (score / totalItems) * 100
    totalScoresSum += pct
    if (pct >= 75) passingExamsCount++
  })

  // Also factor in Pilot Administrations if student submissions exist inside pilot records
  pilots.forEach(pt => {
    if (Array.isArray(pt.submissions) && pt.submissions.length > 0) {
      pt.submissions.forEach(ps => {
        totalExamsCompleted++
        const total = Number(ps.totalItems || pt.totalItems) || 1
        const score = Number(ps.score) || 0
        const pct = (score / total) * 100
        totalScoresSum += pct
        if (pct >= 75) passingExamsCount++
      })
    } else if (pt.completedCount || pt.averageScore) {
      // Aggregate summary statistics provided in pilot objects
      const count = Number(pt.completedCount || pt.examineesCount) || 1
      const avgPct = Number(pt.averageScore) || 0
      totalExamsCompleted += count
      totalScoresSum += avgPct * count
      if (avgPct >= 75) passingExamsCount += count
    }
  })

  // Calculate Flagged Items across question bank and pilot item analysis
  let flaggedCount = 0
  questions.value.forEach(q => {
    const status = (q.status || '').toLowerCase()
    const diff = (q.difficulty_level || q.difficulty || '').toLowerCase()
    if (status === 'flagged' || status === 'needs review' || q.retained_ai === false || diff === 'poor' || q.discriminationIndex < 0.2) {
      flaggedCount++
    }
  })

  if (totalExamsCompleted === 0) {
    return {
      overallPassRate: '0.0%',
      averageScore: '0.0%',
      completedExams: 0,
      flaggedItems: flaggedCount
    }
  }

  const avgPct = totalScoresSum / totalExamsCompleted
  const passRatePct = (passingExamsCount / totalExamsCompleted) * 100

  return {
    overallPassRate: `${passRatePct.toFixed(1)}%`,
    averageScore: `${avgPct.toFixed(1)}%`,
    completedExams: totalExamsCompleted,
    flaggedItems: flaggedCount
  }
})

// Dynamic Breakdown by Subject / Competency
const subjectBreakdown = computed(() => {
  const breakdownMap = new Map()

  // Initialize breakdown map from dynamic subjects list
  dynamicSubjectsList.value.forEach(subj => {
    const key = subj.key
    breakdownMap.set(key, {
      code: subj.code,
      title: subj.title,
      stcwStandard: subj.stcwStandard,
      submissionsCount: 0,
      totalScorePctSum: 0,
      passingSubmissions: 0,
      testCount: 0,
      flaggedItems: 0
    })
  })

  // Aggregate Exam Submissions into subjects
  examSubmissions.value.forEach(sub => {
    const code = (sub.subject_code || sub.course_code || (sub.course && sub.course.code) || sub.subject || '').trim()
    const title = (sub.subject_title || sub.course_title || (sub.course && sub.course.title) || sub.test_title || '').trim()
    const key = (code || title || 'GENERAL ASSESSMENT').toUpperCase()

    if (!breakdownMap.has(key)) {
      breakdownMap.set(key, {
        code: code || key,
        title: title || code || key,
        stcwStandard: '',
        submissionsCount: 0,
        totalScorePctSum: 0,
        passingSubmissions: 0,
        testCount: 0,
        flaggedItems: 0
      })
    }

    const item = breakdownMap.get(key)
    const total = Number(sub.total_items || sub.totalItems) || 1
    const score = Number(sub.score) || 0
    const pct = (score / total) * 100

    item.submissionsCount++
    item.totalScorePctSum += pct
    if (pct >= 75) item.passingSubmissions++
  })

  // Aggregate Pilot Tests into subjects
  pilotTests.value.forEach(pt => {
    const code = (pt.subjectCode || pt.courseCode || pt.subject || pt.code || '').trim()
    const title = (pt.subjectTitle || pt.courseTitle || pt.title || pt.name || '').trim()
    const key = (code || title || 'GENERAL ASSESSMENT').toUpperCase()

    if (!breakdownMap.has(key)) {
      breakdownMap.set(key, {
        code: code || key,
        title: title || code || key,
        stcwStandard: pt.stcwStandard || '',
        submissionsCount: 0,
        totalScorePctSum: 0,
        passingSubmissions: 0,
        testCount: 0,
        flaggedItems: 0
      })
    }

    const item = breakdownMap.get(key)
    item.testCount++

    if (Array.isArray(pt.submissions) && pt.submissions.length > 0) {
      pt.submissions.forEach(ps => {
        const total = Number(ps.totalItems || pt.totalItems) || 1
        const score = Number(ps.score) || 0
        const pct = (score / total) * 100
        item.submissionsCount++
        item.totalScorePctSum += pct
        if (pct >= 75) item.passingSubmissions++
      })
    } else if (pt.completedCount || pt.averageScore) {
      const count = Number(pt.completedCount || pt.examineesCount) || 1
      const avgPct = Number(pt.averageScore) || 0
      item.submissionsCount += count
      item.totalScorePctSum += avgPct * count
      if (avgPct >= 75) item.passingSubmissions += count
    }
  })

  // Aggregate Saved Tests into subjects
  savedTests.value.forEach(st => {
    const code = (st.subjectCode || st.courseCode || st.subject || st.code || '').trim()
    const title = (st.subjectTitle || st.courseTitle || st.title || st.name || '').trim()
    const key = (code || title || 'GENERAL ASSESSMENT').toUpperCase()

    if (breakdownMap.has(key)) {
      breakdownMap.get(key).testCount++
    }
  })

  // Filter breakdown list if specific subject selected
  let results = []
  breakdownMap.forEach((data, key) => {
    if (selectedSubjectFilter.value !== 'all' && key !== selectedSubjectFilter.value.toUpperCase()) {
      return
    }

    const passRate = data.submissionsCount > 0 
      ? Math.round((data.passingSubmissions / data.submissionsCount) * 100) 
      : 0

    const avgScore = data.submissionsCount > 0
      ? (data.totalScorePctSum / data.submissionsCount).toFixed(1)
      : '0.0'

    let status = 'Pending Submissions'
    if (data.submissionsCount > 0) {
      status = passRate >= 75 ? 'Compliant' : 'Needs Review'
    }

    results.push({
      key,
      code: data.code,
      title: data.title,
      stcwStandard: data.stcwStandard,
      passRate: passRate,
      avgScore: avgScore,
      submissionsCount: data.submissionsCount,
      testCount: data.testCount,
      status: status
    })
  })

  return results
})

// Filter dropdown options
const subjectOptions = computed(() => {
  const options = [{ value: 'all', label: 'All Subjects & Competencies' }]
  dynamicSubjectsList.value.forEach(subj => {
    options.push({
      value: subj.key,
      label: `${subj.code} ${subj.title ? '- ' + subj.title : ''}`
    })
  })
  return options
})

// Export CSV Functionality with dynamic actual data
function exportReportCSV() {
  if (subjectBreakdown.value.length === 0) {
    alert('No subject/competency data available to export.')
    return
  }

  let csvContent = 'data:text/csv;charset=utf-8,'
  csvContent += 'Subject Code,Subject Title,STCW Standard,Recorded Submissions,Pass Rate (%),Average Score (%),Status
'

  subjectBreakdown.value.forEach(row => {
    const escape = (str) => `"${String(str || '').replace(/"/g, '""')}"`
    csvContent += `${escape(row.code)},${escape(row.title)},${escape(row.stcwStandard)},${row.submissionsCount},${row.passRate}%,${row.avgScore}%,${escape(row.status)}
`
  })

  csvContent += '
SUMMARY METRICS
'
  csvContent += `Completed Assessment Submissions,${summaryMetrics.value.completedExams}
`
  csvContent += `Overall Pass Rate,${summaryMetrics.value.overallPassRate}
`
  csvContent += `Average Score,${summaryMetrics.value.averageScore}
`
  csvContent += `Flagged Items,${summaryMetrics.value.flaggedItems}
`

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `CAMS_Assessment_Report_${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <!-- Header Banner -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div>
        <h1 class="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart2 class="w-6 h-6 text-emerald-600" />
          Assessment & Competency Compliance Reports
        </h1>
        <p class="text-xs text-slate-500 mt-1 font-medium">
          Real-time compliance analytics dynamic to user-uploaded questionnaires, TOS, saved tests, and pilot administrations.
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

    <!-- Metric Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <div class="flex items-center justify-between text-slate-500">
          <span class="text-xs font-bold uppercase tracking-wider">Overall Pass Rate</span>
          <Award class="w-5 h-5 text-emerald-600" />
        </div>
        <div class="text-2xl font-black text-slate-900">{{ summaryMetrics.overallPassRate }}</div>
        <div class="text-[11px] text-slate-500 font-medium">Benchmark threshold: 75%</div>
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
          <span class="text-xs font-bold uppercase tracking-wider">Completed Assessments</span>
          <Users class="w-5 h-5 text-purple-600" />
        </div>
        <div class="text-2xl font-black text-slate-900">{{ summaryMetrics.completedExams }}</div>
        <div class="text-[11px] text-slate-500 font-medium">Total exam & pilot submissions</div>
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

    <!-- Subject Competency Breakdown Section -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet class="w-5 h-5 text-emerald-600" />
            Subject & STCW Competency Compliance
          </h2>
          <p class="text-xs text-slate-500 mt-0.5">Proficiency and pass-rate evaluation for created and uploaded subjects.</p>
        </div>

        <div class="flex items-center gap-2">
          <Filter class="w-4 h-4 text-slate-400" />
          <select 
            v-model="selectedSubjectFilter"
            class="border border-slate-300 rounded-xl text-xs font-semibold px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
          >
            <option v-for="opt in subjectOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
      </div>

      <div v-if="subjectBreakdown.length === 0" class="py-12 text-center text-slate-400 space-y-2">
        <FileText class="w-10 h-10 mx-auto text-slate-300" />
        <p class="text-xs font-bold text-slate-600">No subject data found</p>
        <p class="text-[11px] text-slate-400">Create a test in Test Builder or upload a TOS/Questionnaire to view live subject analytics.</p>
      </div>

      <div v-else class="space-y-4 pt-2">
        <div 
          v-for="subj in subjectBreakdown" 
          :key="subj.key" 
          class="p-4 bg-slate-50/80 border border-slate-200/90 rounded-xl space-y-3 transition hover:border-slate-300"
        >
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div class="flex items-center gap-2.5">
              <span class="font-mono font-bold text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded-lg shadow-2xs">
                {{ subj.code }}
              </span>
              <span class="font-bold text-slate-900 text-sm">{{ subj.title }}</span>
              <span v-if="subj.stcwStandard" class="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold px-2 py-0.5 rounded-md">
                {{ subj.stcwStandard }}
              </span>
            </div>

            <div class="flex items-center gap-3">
              <span class="font-bold text-slate-800 text-xs">{{ subj.passRate }}% Pass Rate</span>
              <span 
                :class="[
                  'px-2.5 py-1 text-[10px] font-bold rounded-lg border',
                  subj.status === 'Compliant' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : subj.status === 'Pending Submissions'
                    ? 'bg-slate-100 text-slate-600 border-slate-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                ]"
              >
                {{ subj.status }}
              </span>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div 
              class="h-full transition-all duration-500 rounded-full"
              :class="subj.passRate >= 75 ? 'bg-emerald-600' : subj.submissionsCount === 0 ? 'bg-slate-300' : 'bg-amber-500'"
              :style="{ width: `${subj.submissionsCount === 0 ? 0 : subj.passRate}%` }"
            ></div>
          </div>

          <div class="text-[11px] text-slate-500 flex flex-wrap justify-between items-center gap-2 pt-1 border-t border-slate-100">
            <div class="flex items-center gap-4">
              <span>Submissions: <strong class="text-slate-800">{{ subj.submissionsCount }}</strong></span>
              <span>Average Score: <strong class="text-slate-800">{{ subj.avgScore }}%</strong></span>
            </div>
            <span>Target Benchmark: <strong>75% Pass Rate</strong></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>