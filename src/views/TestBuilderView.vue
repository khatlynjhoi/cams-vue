<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Sparkles, 
  Sliders, 
  Trash2, 
  Send,
  Plus,
  Search,
  X,
  CheckSquare,
  Square,
  BookOpen,
  Layers,
  Target
} from 'lucide-vue-next'

const router = useRouter()

// Master Registries
const masterCourseOutcomes = ref([])
const masterLearningOutcomes = ref([])

// Courses & Question Bank State
const courses = ref([])
const availableQuestionBank = ref([])
const isLoadingCourses = ref(false)
const isLoadingQuestions = ref(false)

// Academic Years Generator
const currentYear = new Date().getFullYear()
const academicYears = computed(() => {
  const years = []
  for (let i = 0; i < 10; i++) {
    const start = currentYear + i
    const end = start + 1
    years.push(`${start}-${end}`)
  }
  return years
})

// Exam Configuration Form State (Initial values blank)
const examConfig = ref({
  program: '',
  academicYear: '',
  semester: '',
  course: '',
  term: '',
  title: '',
  durationMinutes: 60,
  passingScorePercent: 75
})

// Modals State
const isAiModalOpen = ref(false)
const isAutoBuilding = ref(false)
const isQuestionModalOpen = ref(false)

// Question Picker Filter & Selection State
const searchQuery = ref('')
const filterCO = ref('')
const filterLO = ref('')
const filterType = ref('')
const sortBy = ref('code_asc')
const pickerSelectedIds = ref([])

const aiBlueprint = ref({
  targetTotalItems: 10,
  easyPercent: 30,
  mediumPercent: 50,
  hardPercent: 20
})

// Selected Questions in current Exam Blueprint
const selectedItems = ref([])

const totalPoints = computed(() => selectedItems.value.reduce((sum, item) => sum + Number(item.points || 0), 0))
const totalItemsCount = computed(() => selectedItems.value.length)

// Load Master Outcomes Registries
async function loadOutcomeMasters() {
  try {
    const token = localStorage.getItem('token')
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {}

    const coRes = await fetch('http://127.0.0.1:8000/api/course-outcomes', { headers }).catch(() => null)
    if (coRes && coRes.ok) {
      const data = await coRes.json()
      masterCourseOutcomes.value = Array.isArray(data) ? data : (data.data || [])
    } else {
      const saved = localStorage.getItem('cams_course_outcomes') || localStorage.getItem('cams_cos_data')
      if (saved) masterCourseOutcomes.value = JSON.parse(saved)
    }

    const loRes = await fetch('http://127.0.0.1:8000/api/learning-outcomes', { headers }).catch(() => null)
    if (loRes && loRes.ok) {
      const data = await loRes.json()
      masterLearningOutcomes.value = Array.isArray(data) ? data : (data.data || [])
    } else {
      const saved = localStorage.getItem('cams_learning_outcomes') || localStorage.getItem('cams_los_data')
      if (saved) masterLearningOutcomes.value = JSON.parse(saved)
    }
  } catch (e) {
    console.warn('Error loading outcome master registries:', e)
  }
}

// Helper to check if a question is approved
function isQuestionApproved(q) {
  if (!q) return false
  const status = (q.status || q.approval_status || q.state || '').toString().toLowerCase().trim()
  return status === 'approved'
}

// Deep CO Resolution Engine
function resolveCO(q) {
  if (!q) return 'Unassigned'

  if (q.course_outcome && typeof q.course_outcome === 'object') {
    const code = q.course_outcome.code || q.course_outcome.co_code || q.course_outcome.name || q.course_outcome.title
    if (code) return String(code)
  }
  if (q.courseOutcome && typeof q.courseOutcome === 'object') {
    const code = q.courseOutcome.code || q.courseOutcome.co_code || q.courseOutcome.name || q.courseOutcome.title
    if (code) return String(code)
  }

  const directKeys = [
    'co', 'co_code', 'coCode', 'co_name', 'coName',
    'course_outcome_id', 'courseOutcomeId',
    'course_outcome_code', 'courseOutcomeCode', 'course_outcome', 'courseOutcome'
  ]

  for (const key of directKeys) {
    const val = q[key]
    if (val !== undefined && val !== null && val !== '' && val !== 'N/A') {
      if (typeof val === 'object') {
        const inner = val.code || val.co_code || val.name || val.title || val.co
        if (inner) return String(inner)
      } else {
        return String(val)
      }
    }
  }

  if (Array.isArray(q.course_outcomes) && q.course_outcomes.length > 0) {
    const first = q.course_outcomes[0]
    if (typeof first === 'object') {
      const inner = first.code || first.co_code || first.name || first.title
      if (inner) return String(inner)
    } else if (first) {
      return String(first)
    }
  }

  const coId = q.co_id || q.coId
  if (coId && masterCourseOutcomes.value.length > 0) {
    const found = masterCourseOutcomes.value.find(c => String(c.id) === String(coId) || String(c.co_id) === String(coId))
    if (found) return found.code || found.co_code || found.name || found.title || `CO-${found.id}`
  }

  return 'Unassigned'
}

// Deep LO Resolution Engine
function resolveLO(q) {
  if (!q) return 'Unassigned'

  if (q.learning_outcome && typeof q.learning_outcome === 'object') {
    const code = q.learning_outcome.code || q.learning_outcome.lo_code || q.learning_outcome.name || q.learning_outcome.title
    if (code) return String(code)
  }
  if (q.learningOutcome && typeof q.learningOutcome === 'object') {
    const code = q.learningOutcome.code || q.learningOutcome.lo_code || q.learningOutcome.name || q.learningOutcome.title
    if (code) return String(code)
  }

  const directKeys = [
    'lo', 'lo_code', 'loCode', 'lo_name', 'loName',
    'learning_outcome_id', 'learningOutcomeId',
    'learning_outcome_code', 'learningOutcomeCode', 'learning_outcome', 'learningOutcome'
  ]

  for (const key of directKeys) {
    const val = q[key]
    if (val !== undefined && val !== null && val !== '' && val !== 'N/A') {
      if (typeof val === 'object') {
        const inner = val.code || val.lo_code || val.name || val.title || val.lo
        if (inner) return String(inner)
      } else {
        return String(val)
      }
    }
  }

  if (Array.isArray(q.learning_outcomes) && q.learning_outcomes.length > 0) {
    const first = q.learning_outcomes[0]
    if (typeof first === 'object') {
      const inner = first.code || first.lo_code || first.name || first.title
      if (inner) return String(inner)
    } else if (first) {
      return String(first)
    }
  }

  const loId = q.lo_id || q.loId
  if (loId && masterLearningOutcomes.value.length > 0) {
    const found = masterLearningOutcomes.value.find(l => String(l.id) === String(loId) || String(l.lo_id) === String(loId))
    if (found) return found.code || found.lo_code || found.name || found.title || `LO-${found.id}`
  }

  return 'Unassigned'
}

// Normalize Question Data
function normalizeQuestion(q) {
  const co = resolveCO(q)
  const lo = resolveLO(q)

  const bloomLevel = 
    q.bloom_level || 
    q.bloomLevel || 
    q.blooms_level || 
    q.bloomsLevel || 
    q.bloom_taxonomy || 
    q.bloomTaxonomy || 
    q.bloom || 
    'Understanding'

  const rawType = q.question_type || q.questionType || q.type || 'multiple_choice'
  const type = rawType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

  const text = q.question_text || q.questionText || q.text || q.question || ''
  const points = q.points || q.default_points || q.score || 1
  const code = q.code || q.question_code || q.item_code || `Q-${q.id}`
  const status = q.status || q.approval_status || 'Pending'

  return {
    ...q,
    id: q.id,
    code,
    text,
    co,
    lo,
    bloomLevel,
    type,
    points,
    status
  }
}

// Filter courses based on selected Program
const filteredCourses = computed(() => {
  if (!examConfig.value.program) {
    return courses.value
  }
  if (examConfig.value.program === 'Both') {
    return courses.value
  }
  return courses.value.filter(c => {
    const prog = (c.program || '').toUpperCase()
    return prog === examConfig.value.program.toUpperCase() || prog === 'BOTH'
  })
})

// Extract Actual COs & LOs present in Approved Question Bank
const availableCOs = computed(() => {
  const cos = new Set()
  availableQuestionBank.value.forEach(q => {
    if (q.co) cos.add(q.co)
  })
  return Array.from(cos).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
})

const availableLOs = computed(() => {
  const los = new Set()
  availableQuestionBank.value.forEach(q => {
    if (q.lo) los.add(q.lo)
  })
  return Array.from(los).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
})

const availableTypes = computed(() => {
  const types = new Set()
  availableQuestionBank.value.forEach(q => {
    if (q.type) types.add(q.type)
  })
  return Array.from(types).sort()
})

// Filtered & Sorted Approved Question Bank Items
const filteredQuestionBank = computed(() => {
  let result = [...availableQuestionBank.value]

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(q => 
      q.code.toLowerCase().includes(query) ||
      q.text.toLowerCase().includes(query) ||
      q.co.toLowerCase().includes(query) ||
      q.lo.toLowerCase().includes(query)
    )
  }

  if (filterCO.value) {
    result = result.filter(q => q.co === filterCO.value)
  }

  if (filterLO.value) {
    result = result.filter(q => q.lo === filterLO.value)
  }

  if (filterType.value) {
    result = result.filter(q => q.type === filterType.value)
  }

  if (sortBy.value === 'code_asc') {
    result.sort((a, b) => a.code.localeCompare(b.code))
  } else if (sortBy.value === 'code_desc') {
    result.sort((a, b) => b.code.localeCompare(a.code))
  } else if (sortBy.value === 'co') {
    result.sort((a, b) => a.co.localeCompare(b.co))
  } else if (sortBy.value === 'lo') {
    result.sort((a, b) => a.lo.localeCompare(b.lo))
  } else if (sortBy.value === 'type') {
    result.sort((a, b) => a.type.localeCompare(b.type))
  }

  return result
})

// Bulk Checkbox selection
const isAllFilteredSelected = computed(() => {
  if (filteredQuestionBank.value.length === 0) return false
  return filteredQuestionBank.value.every(q => pickerSelectedIds.value.includes(q.id))
})

function toggleSelectAllFiltered() {
  if (isAllFilteredSelected.value) {
    const filteredIds = filteredQuestionBank.value.map(q => q.id)
    pickerSelectedIds.value = pickerSelectedIds.value.filter(id => !filteredIds.includes(id))
  } else {
    const combined = new Set([...pickerSelectedIds.value, ...filteredQuestionBank.value.map(q => q.id)])
    pickerSelectedIds.value = Array.from(combined)
  }
}

function togglePickerItem(id) {
  if (pickerSelectedIds.value.includes(id)) {
    pickerSelectedIds.value = pickerSelectedIds.value.filter(item => item !== id)
  } else {
    pickerSelectedIds.value.push(id)
  }
}

function importSelectedQuestions() {
  const toAdd = availableQuestionBank.value.filter(q => pickerSelectedIds.value.includes(q.id))

  toAdd.forEach(q => {
    const exists = selectedItems.value.some(item => (item.id && item.id === q.id) || item.code === q.code)
    if (!exists) {
      selectedItems.value.push({ ...q })
    }
  })

  pickerSelectedIds.value = []
  isQuestionModalOpen.value = false
}

function resetFilters() {
  filterCO.value = ''
  filterLO.value = ''
  filterType.value = ''
  searchQuery.value = ''
  pickerSelectedIds.value = []
}

function updateExamTitle() {
  if (!examConfig.value.course || !examConfig.value.term) {
    return
  }
  const selectedCourseObj = courses.value.find(c => c.code === examConfig.value.course)
  const courseCodeStr = selectedCourseObj ? selectedCourseObj.code : examConfig.value.course
  const ayStr = examConfig.value.academicYear ? ` (${examConfig.value.academicYear}` : ''
  const semStr = examConfig.value.semester ? `, ${examConfig.value.semester})` : (ayStr ? ')' : '')

  examConfig.value.title = `${courseCodeStr} ${examConfig.value.term}${ayStr}${semStr}`
}

async function loadQuestionsForCourse(courseCode) {
  if (!courseCode) {
    availableQuestionBank.value = []
    return
  }

  resetFilters()
  isLoadingQuestions.value = true
  let rawQuestions = []

  try {
    const token = localStorage.getItem('token')
    const headers = token ? {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    } : { 'Content-Type': 'application/json' }

    const programParam = examConfig.value.program ? `&program=${encodeURIComponent(examConfig.value.program)}` : ''
    // Add status=Approved parameter to API call
    const url = `http://127.0.0.1:8000/api/questions?course=${encodeURIComponent(courseCode)}&status=Approved${programParam}`
    const response = await fetch(url, { headers })

    if (response.ok) {
      const data = await response.json()
      rawQuestions = Array.isArray(data) ? data : (data.data || [])
    } else {
      throw new Error(`HTTP ${response.status}`)
    }
  } catch (err) {
    console.warn('API fetch failed, reading local storage fallback:', err)
    try {
      const savedBank = localStorage.getItem('cams_question_bank_data') || localStorage.getItem('cams_questions_data')
      if (savedBank) {
        const parsed = JSON.parse(savedBank)
        rawQuestions = parsed.filter(q => {
          const c = (q.courseCode || q.course || q.course_code || '').toUpperCase()
          return c === courseCode.toUpperCase() || courseCode.toUpperCase().includes(c)
        })
      }
    } catch (e) {
      console.error('Failed reading question bank fallback:', e)
    }
  } finally {
    // Strictly filter for APPROVED questions only
    const approvedQuestions = rawQuestions.filter(q => isQuestionApproved(q))

    availableQuestionBank.value = approvedQuestions.map(q => normalizeQuestion(q))
    isLoadingQuestions.value = false
  }
}

function onProgramChange() {
  examConfig.value.course = ''
  updateExamTitle()
}

function onCourseChange() {
  updateExamTitle()
  loadQuestionsForCourse(examConfig.value.course)
}

async function loadCourses() {
  isLoadingCourses.value = true
  try {
    const token = localStorage.getItem('token')
    const headers = token ? {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    } : { 'Content-Type': 'application/json' }

    const response = await fetch('http://127.0.0.1:8000/api/courses', { headers })

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

    const data = await response.json()
    courses.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.warn('API fetch failed for courses, reading local storage fallback:', err)
    try {
      const saved = localStorage.getItem('cams_courses_data')
      if (saved) courses.value = JSON.parse(saved)
    } catch (e) {
      courses.value = []
    }
  } finally {
    isLoadingCourses.value = false
  }
}

onMounted(async () => {
  await loadOutcomeMasters()
  await loadCourses()
})

function autoAssembleTest() {
  isAutoBuilding.value = true
  setTimeout(() => {
    const available = availableQuestionBank.value.filter(
      q => !selectedItems.value.some(s => (s.id && s.id === q.id) || s.code === q.code)
    )

    const totalNeeded = aiBlueprint.value.targetTotalItems || 10
    const easyTarget = Math.round(totalNeeded * (aiBlueprint.value.easyPercent / 100))
    const hardTarget = Math.round(totalNeeded * (aiBlueprint.value.hardPercent / 100))
    const mediumTarget = totalNeeded - easyTarget - hardTarget

    const categorizeBloom = (level) => {
      const l = (level || '').toLowerCase()
      if (['remembering', 'remember', 'understanding', 'understand', 'easy'].some(k => l.includes(k))) return 'easy'
      if (['evaluating', 'evaluate', 'creating', 'create', 'hard'].some(k => l.includes(k))) return 'hard'
      return 'medium'
    }

    const easyPool = available.filter(q => categorizeBloom(q.bloomLevel) === 'easy')
    const mediumPool = available.filter(q => categorizeBloom(q.bloomLevel) === 'medium')
    const hardPool = available.filter(q => categorizeBloom(q.bloomLevel) === 'hard')

    const selected = [
      ...easyPool.slice(0, easyTarget),
      ...mediumPool.slice(0, mediumTarget),
      ...hardPool.slice(0, hardTarget)
    ]

    if (selected.length < totalNeeded) {
      const remaining = available.filter(q => !selected.some(s => (s.id && s.id === q.id) || s.code === q.code))
      selected.push(...remaining.slice(0, totalNeeded - selected.length))
    }

    selectedItems.value.push(...selected)
    isAutoBuilding.value = false
    isAiModalOpen.value = false
  }, 800)
}

function removeItem(index) {
  selectedItems.value.splice(index, 1)
}

function publishToPilot() {
  if (!examConfig.value.title) {
    alert('Please complete the exam parameters before publishing.')
    return
  }
  alert(`Exam blueprint for "${examConfig.value.title}" saved and published successfully!`)
  router.push('/pilot-admin')
}
</script>

<template>
  <div class="p-6 md:p-8 space-y-6 min-h-screen bg-[#f4f6f9] text-slate-800">
    <!-- Header Banner -->
    <div class="bg-[#123524] text-white p-6 rounded-2xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shadow-sm">
      <div class="space-y-1">
        <h1 class="text-xl font-bold flex items-center gap-2 text-white tracking-tight">
          Exam Builder
        </h1>
        <p class="text-xs text-white/80 font-normal">
          Assemble examinations and auto-populate blueprints directly from accurate Question Bank data.
        </p>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <button 
          @click="isAiModalOpen = true"
          class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition shadow-sm cursor-pointer"
        >
          <Sparkles :size="14" />
          <span>AI Auto-Assemble</span>
        </button>

        <button 
          @click="publishToPilot"
          class="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition shadow-sm border border-emerald-500/30 cursor-pointer"
        >
          <Send :size="14" />
          <span>Publish to Pilot</span>
        </button>
      </div>
    </div>

    <!-- Configuration & Blueprint Panel -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left: Exam Parameters -->
      <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
        <div class="border-b pb-3">
          <h2 class="text-base font-bold text-gray-900 flex items-center gap-2">
            <Sliders :size="18" class="text-emerald-700" /> Exam Parameters
          </h2>
        </div>

        <div class="space-y-4">
          <!-- Target Program -->
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">Target Program</label>
            <select 
              v-model="examConfig.program" 
              @change="onProgramChange"
              class="w-full text-xs p-2.5 border border-slate-300 rounded-lg font-bold bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
            >
              <option value="" disabled selected>Select Program</option>
              <option value="BSMT">BSMT (Bachelor of Science in Marine Transportation)</option>
              <option value="BSMarE">BSMarE (Bachelor of Science in Marine Engineering)</option>
              <option value="Both">Both Programs</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <!-- Academic Year -->
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">Academic Year</label>
              <select 
                v-model="examConfig.academicYear" 
                @change="updateExamTitle"
                class="w-full text-xs p-2.5 border border-slate-300 rounded-lg font-bold bg-white focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
              >
                <option value="" disabled selected>Select Academic Year</option>
                <option v-for="ay in academicYears" :key="ay" :value="ay">AY {{ ay }}</option>
              </select>
            </div>

            <!-- Semester -->
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">Semester</label>
              <select 
                v-model="examConfig.semester" 
                @change="updateExamTitle"
                class="w-full text-xs p-2.5 border border-slate-300 rounded-lg font-bold bg-white focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
              >
                <option value="" disabled selected>Select Semester</option>
                <option value="First Semester">First Semester</option>
                <option value="Second Semester">Second Semester</option>
                <option value="Summer Semester">Summer Semester</option>
              </select>
            </div>
          </div>

          <!-- Course / Subject -->
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">Course / Subject</label>
            <select 
              v-model="examConfig.course" 
              @change="onCourseChange"
              :disabled="isLoadingCourses"
              class="w-full text-xs p-2.5 border border-slate-300 rounded-lg font-bold bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer disabled:opacity-50"
            >
              <option value="" disabled selected>Select Course</option>
              <option v-if="isLoadingCourses" value="" disabled>Loading registered courses...</option>
              <option v-else-if="filteredCourses.length === 0" value="" disabled>No courses available</option>
              <option v-for="c in filteredCourses" :key="c.id || c.code" :value="c.code">
                {{ c.code }} - {{ c.title }}
              </option>
            </select>
          </div>

          <!-- Assessment Term -->
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">Assessment Term</label>
            <select 
              v-model="examConfig.term" 
              @change="updateExamTitle"
              class="w-full text-xs p-2.5 border border-slate-300 rounded-lg font-bold bg-white focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
            >
              <option value="" disabled selected>Select Term</option>
              <option value="Midterm Exam">Midterm Exam</option>
              <option value="Final Exam">Final Exam</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">Assessment Title</label>
            <input 
              v-model="examConfig.title" 
              type="text" 
              placeholder="Select Course and Term to auto-generate title"
              class="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-semibold text-slate-900"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">Time Limit (Mins)</label>
              <input 
                v-model.number="examConfig.durationMinutes" 
                type="number" 
                class="w-full text-xs p-2.5 border border-slate-300 rounded-lg font-bold text-center focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1">Passing Mark (%)</label>
              <input 
                v-model.number="examConfig.passingScorePercent" 
                type="number" 
                class="w-full text-xs p-2.5 border border-slate-300 rounded-lg font-bold text-center focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div class="border-t border-slate-200 pt-4 space-y-2.5 text-xs text-slate-600">
          <div class="flex justify-between items-center">
            <span class="font-medium">Total Exam Items:</span>
            <span class="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded font-mono">{{ totalItemsCount }} Questions</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="font-medium">Total Points:</span>
            <span class="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">{{ totalPoints }} Marks</span>
          </div>
        </div>
      </div>

      <!-- Right: Blueprint List -->
      <div class="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between space-y-6">
        <div class="space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
            <div>
              <h2 class="text-base font-bold text-gray-900">Assembled Test Blueprint</h2>
              <p class="text-xs text-slate-500">
                Course: <span class="font-bold text-emerald-800">{{ examConfig.course || 'None Selected' }}</span> | 
                Term: <span class="font-bold text-slate-700">{{ examConfig.term || 'None Selected' }}</span>
              </p>
            </div>

            <div class="flex items-center gap-2">
              <button 
                @click="isQuestionModalOpen = true"
                :disabled="!examConfig.course"
                class="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed text-emerald-800 border border-emerald-200 font-bold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus :size="14" />
                <span>Add from Question Bank</span>
              </button>

              <span class="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200">
                {{ totalItemsCount }} Selected
              </span>
            </div>
          </div>

          <div v-if="isLoadingQuestions" class="p-8 text-center text-slate-500 text-xs font-semibold animate-pulse">
            Loading question bank items for {{ examConfig.course }}...
          </div>

          <div v-else-if="selectedItems.length === 0" class="p-8 text-center text-slate-400 text-xs italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
            No questions selected for this exam. Click "Add from Question Bank" or use AI Auto-Assemble.
          </div>

          <div v-else class="space-y-3">
            <div 
              v-for="(item, idx) in selectedItems" 
              :key="item.id || idx"
              class="p-4 border border-slate-200 rounded-xl hover:border-emerald-300 transition-all flex items-start justify-between gap-4 bg-slate-50/50"
            >
              <div class="space-y-2 flex-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-xs font-mono font-bold text-slate-500">#{{ idx + 1 }}</span>
                  <span class="px-2 py-0.5 bg-slate-800 text-white font-mono text-xs font-bold rounded">
                    {{ item.code }}
                  </span>

                  <!-- CO Badge -->
                  <span 
                    :class="[
                      'text-[11px] font-bold border px-2 py-0.5 rounded flex items-center gap-1 font-mono',
                      item.co === 'Unassigned' 
                        ? 'bg-amber-50 text-amber-700 border-amber-200' 
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    ]"
                  >
                    <Target :size="11" :class="item.co === 'Unassigned' ? 'text-amber-500' : 'text-blue-500'" />
                    <span>CO: {{ item.co }}</span>
                  </span>

                  <!-- LO Badge -->
                  <span 
                    :class="[
                      'text-[11px] font-bold border px-2 py-0.5 rounded flex items-center gap-1 font-mono',
                      item.lo === 'Unassigned' 
                        ? 'bg-amber-50 text-amber-700 border-amber-200' 
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    ]"
                  >
                    <Layers :size="11" :class="item.lo === 'Unassigned' ? 'text-amber-500' : 'text-indigo-500'" />
                    <span>LO: {{ item.lo }}</span>
                  </span>

                  <!-- Bloom Level -->
                  <span class="text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                    {{ item.bloomLevel }}
                  </span>

                  <!-- Question Type -->
                  <span class="text-[10px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded">
                    {{ item.type }}
                  </span>
                </div>
                <p class="text-xs font-semibold text-slate-800 pt-0.5 leading-relaxed">{{ item.text }}</p>
              </div>

              <div class="flex items-center gap-3 shrink-0">
                <div class="text-right">
                  <span class="text-[10px] block text-slate-400 font-bold uppercase">Points</span>
                  <input 
                    v-model.number="item.points" 
                    type="number" 
                    min="1" 
                    class="w-14 border border-slate-300 rounded-lg text-center text-xs font-bold py-1 outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>

                <button 
                  @click="removeItem(idx)" 
                  class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Remove Item"
                >
                  <Trash2 :size="16" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="pt-4 border-t border-slate-100 flex justify-end">
          <button 
            @click="publishToPilot" 
            class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <Send :size="14" />
            <span>Save & Schedule Exam</span>
          </button>
        </div>
      </div>
    </div>

    <!-- BULK QUESTION SELECTION MODAL -->
    <div v-if="isQuestionModalOpen" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        
        <!-- Modal Header -->
        <div class="p-5 bg-slate-900 text-white flex justify-between items-center">
          <div class="flex items-center gap-2.5">
            <BookOpen :size="20" class="text-emerald-400" />
            <div>
              <h3 class="text-base font-bold text-white">Select Questions from Question Bank</h3>
              <p class="text-xs text-slate-300">
                Course: <span class="font-bold text-emerald-400">{{ examConfig.course }}</span> (Approved Only)
              </p>
            </div>
          </div>
          <button @click="isQuestionModalOpen = false" class="text-slate-400 hover:text-white transition cursor-pointer">
            <X :size="20" />
          </button>
        </div>

        <!-- Filters Toolbar -->
        <div class="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div class="relative lg:col-span-2">
            <Search :size="14" class="absolute left-3 top-3 text-slate-400" />
            <input 
              v-model="searchQuery"
              type="text"
              placeholder="Search code, text, CO, or LO..."
              class="w-full text-xs pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Course Outcome</label>
            <select 
              v-model="filterCO"
              class="w-full text-xs py-1.5 px-2 bg-white border border-slate-300 rounded-lg outline-none font-semibold focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="">All Course Outcomes</option>
              <option v-for="co in availableCOs" :key="co" :value="co">{{ co }}</option>
            </select>
          </div>

          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Learning Outcome</label>
            <select 
              v-model="filterLO"
              class="w-full text-xs py-1.5 px-2 bg-white border border-slate-300 rounded-lg outline-none font-semibold focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="">All Learning Outcomes</option>
              <option v-for="lo in availableLOs" :key="lo" :value="lo">{{ lo }}</option>
            </select>
          </div>

          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Question Type</label>
            <select 
              v-model="filterType"
              class="w-full text-xs py-1.5 px-2 bg-white border border-slate-300 rounded-lg outline-none font-semibold focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="">All Question Types</option>
              <option v-for="t in availableTypes" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
        </div>

        <!-- Sort Bar -->
        <div class="px-5 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between text-xs">
          <button 
            @click="toggleSelectAllFiltered"
            class="flex items-center gap-2 font-bold text-slate-700 hover:text-emerald-700 cursor-pointer"
          >
            <CheckSquare v-if="isAllFilteredSelected" :size="16" class="text-emerald-600" />
            <Square v-else :size="16" class="text-slate-400" />
            <span>Select All Filtered Items ({{ filteredQuestionBank.length }})</span>
          </button>

          <div class="flex items-center gap-2">
            <span class="text-slate-400 font-medium">Sort by:</span>
            <select v-model="sortBy" class="bg-slate-50 border rounded px-2 py-1 text-xs font-semibold outline-none cursor-pointer">
              <option value="code_asc">Code (Ascending)</option>
              <option value="code_desc">Code (Descending)</option>
              <option value="co">Course Outcome (CO)</option>
              <option value="lo">Learning Outcome (LO)</option>
              <option value="type">Question Type</option>
            </select>
          </div>
        </div>

        <!-- Question Items List -->
        <div class="p-5 overflow-y-auto flex-1 space-y-3 bg-slate-50/50">
          <div v-if="filteredQuestionBank.length === 0" class="p-10 text-center text-slate-400 text-xs italic">
            No approved questions found in the Question Bank matching your criteria.
          </div>

          <div 
            v-for="q in filteredQuestionBank" 
            :key="q.id"
            @click="togglePickerItem(q.id)"
            :class="[
              'p-4 border rounded-xl transition-all cursor-pointer flex items-start gap-3',
              pickerSelectedIds.includes(q.id) 
                ? 'bg-emerald-50/80 border-emerald-400 shadow-xs' 
                : 'bg-white border-slate-200 hover:border-slate-300'
            ]"
          >
            <div class="pt-0.5">
              <CheckSquare v-if="pickerSelectedIds.includes(q.id)" :size="18" class="text-emerald-600" />
              <Square v-else :size="18" class="text-slate-300" />
            </div>

            <div class="space-y-2 flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="px-2 py-0.5 bg-slate-800 text-white font-mono text-xs font-bold rounded">
                  {{ q.code }}
                </span>

                <!-- CO Badge -->
                <span 
                  :class="[
                    'text-[11px] font-bold border px-2 py-0.5 rounded flex items-center gap-1 font-mono',
                    q.co === 'Unassigned' 
                      ? 'bg-amber-50 text-amber-700 border-amber-200' 
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  ]"
                >
                  <Target :size="11" :class="q.co === 'Unassigned' ? 'text-amber-500' : 'text-blue-500'" />
                  <span>CO: {{ q.co }}</span>
                </span>

                <!-- LO Badge -->
                <span 
                  :class="[
                    'text-[11px] font-bold border px-2 py-0.5 rounded flex items-center gap-1 font-mono',
                    q.lo === 'Unassigned' 
                      ? 'bg-amber-50 text-amber-700 border-amber-200' 
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  ]"
                >
                  <Layers :size="11" :class="q.lo === 'Unassigned' ? 'text-amber-500' : 'text-indigo-500'" />
                  <span>LO: {{ q.lo }}</span>
                </span>

                <!-- Bloom Taxonomy -->
                <span class="text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                  {{ q.bloomLevel }}
                </span>

                <!-- Question Type -->
                <span class="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                  {{ q.type }}
                </span>
              </div>

              <p class="text-xs font-semibold text-slate-800 leading-relaxed">
                {{ q.text }}
              </p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 bg-white border-t border-slate-200 flex justify-between items-center">
          <span class="text-xs font-bold text-slate-700">
            {{ pickerSelectedIds.length }} question(s) checked
          </span>

          <div class="flex gap-2">
            <button 
              @click="isQuestionModalOpen = false"
              class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition cursor-pointer"
            >
              Cancel
            </button>
            <button 
              @click="importSelectedQuestions"
              :disabled="pickerSelectedIds.length === 0"
              class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer flex items-center gap-1.5"
            >
              <Plus :size="14" />
              <span>Add Selected to Blueprint</span>
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- AI Blueprint Auto-Assemble Modal -->
    <div v-if="isAiModalOpen" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-slate-100">
        <div class="flex items-center gap-3 text-emerald-800">
          <div class="p-2.5 bg-emerald-100 rounded-xl text-emerald-800">
            <Sparkles :size="24" />
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900">AI Blueprint Builder</h3>
            <p class="text-xs text-slate-500">Automatically select balanced items from approved questions.</p>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Target Item Count</label>
            <input 
              v-model.number="aiBlueprint.targetTotalItems" 
              type="number" 
              class="w-full text-xs p-2.5 border rounded-lg font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div class="space-y-1.5">
            <span class="block text-xs font-bold text-slate-700">Cognitive Balance (Bloom's Taxonomy)</span>
            <div class="grid grid-cols-3 gap-2 text-center text-xs">
              <div class="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                <span class="block text-slate-500 text-[11px] font-medium">Easy</span>
                <span class="font-bold text-emerald-900 text-xs">{{ aiBlueprint.easyPercent }}%</span>
              </div>
              <div class="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                <span class="block text-slate-500 text-[11px] font-medium">Medium</span>
                <span class="font-bold text-emerald-900 text-xs">{{ aiBlueprint.mediumPercent }}%</span>
              </div>
              <div class="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                <span class="block text-slate-500 text-[11px] font-medium">Hard</span>
                <span class="font-bold text-emerald-900 text-xs">{{ aiBlueprint.hardPercent }}%</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <button 
            @click="isAiModalOpen = false" 
            class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition cursor-pointer"
          >
            Cancel
          </button>
          <button 
            @click="autoAssembleTest" 
            :disabled="isAutoBuilding"
            class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Sparkles :size="14" :class="{ 'animate-spin': isAutoBuilding }" />
            <span>{{ isAutoBuilding ? 'Assembling...' : 'Assemble Items' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>