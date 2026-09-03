<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { 
  HelpCircle, Save, Plus, Trash2, Image, X, Upload, Download, 
  CheckCircle, XCircle, Sparkles, Filter, AlertTriangle, RefreshCw,
  Database, PlusCircle, ChevronDown, ChevronRight, Check, RotateCcw,
  FileText, BarChart2
} from 'lucide-vue-next'

const questions = ref([])
const courses = ref([])
const isSubmitting = ref(false)
const isUploadingBulk = ref(false)
const bulkFileInput = ref(null)

// Tab Navigation State: 'repository' | 'create' | 'report'
const activeTab = ref('repository')

// Collapsible course groups state
const collapsedCourses = ref({})

// Repository Filters & Search
const filterStatus = ref('All')
const filterProgram = ref('All')
const filterType = ref('All')
const searchQuery = ref('')

const STORAGE_COURSES_KEY = 'cams_courses_data'
const STORAGE_QUESTIONS_KEY = 'cams_questions_data'

const form = reactive({
  program: 'Both', // BSMarE | BSMT | Both
  term: 'Midterm', // Midterm | Final
  courseId: '',
  courseOutcomeId: '',
  learningOutcomeId: '',
  bloomLevel: 'Understanding',
  type: 'multiple_choice', // multiple_choice | true_false | short_answer | matching
  text: '',
  imageUrl: '',
  
  options: [
    { text: '', imageUrl: '', isCorrect: false },
    { text: '', imageUrl: '', isCorrect: false },
    { text: '', imageUrl: '', isCorrect: false },
    { text: '', imageUrl: '', isCorrect: false }
  ],
  tfCorrect: 'true',
  shortAnswerKeywords: '',
  matchingPairs: [
    { prompt: '', promptImage: '', match: '', matchImage: '' },
    { prompt: '', promptImage: '', match: '', matchImage: '' }
  ]
})

function resetForm() {
  form.text = ''
  form.imageUrl = ''
  form.options = [
    { text: '', imageUrl: '', isCorrect: false },
    { text: '', imageUrl: '', isCorrect: false },
    { text: '', imageUrl: '', isCorrect: false },
    { text: '', imageUrl: '', isCorrect: false }
  ]
  form.tfCorrect = 'true'
  form.shortAnswerKeywords = ''
  form.matchingPairs = [
    { prompt: '', promptImage: '', match: '', matchImage: '' },
    { prompt: '', promptImage: '', match: '', matchImage: '' }
  ]
}

// Cascading Courses (Subjects) filtered by Program
const filteredCourses = computed(() => {
  if (!courses.value || courses.value.length === 0) return []
  if (form.program === 'Both') {
    return courses.value
  }
  return courses.value.filter(c => c.program === form.program || c.program === 'Both' || !c.program)
})

// Cascading Course Outcomes (CO)
const availableCourseOutcomes = computed(() => {
  const selectedCourse = courses.value.find(c => c.id === form.courseId)
  if (!selectedCourse || !selectedCourse.courseOutcomes) return []
  return selectedCourse.courseOutcomes
})

// Cascading Learning Outcomes (LO)
const availableLearningOutcomes = computed(() => {
  const selectedCO = availableCourseOutcomes.value.find(co => (co.id || co.code) === form.courseOutcomeId)
  if (!selectedCO || !selectedCO.learningOutcomes) return []
  return selectedCO.learningOutcomes
})

// Filtered Question Repository
const filteredQuestions = computed(() => {
  return questions.value.filter(q => {
    const matchesStatus = filterStatus.value === 'All' || (q.status || 'Pending') === filterStatus.value
    const matchesProgram = filterProgram.value === 'All' || q.program === filterProgram.value || q.program === 'Both'
    const matchesType = filterType.value === 'All' || q.type === filterType.value
    const matchesSearch = !searchQuery.value || 
      (q.text && q.text.toLowerCase().includes(searchQuery.value.toLowerCase())) || 
      (q.courseId && q.courseId.toLowerCase().includes(searchQuery.value.toLowerCase()))
    return matchesStatus && matchesProgram && matchesType && matchesSearch
  })
})

// Grouped Questions per Course Code / Course Title
const groupedQuestions = computed(() => {
  const groups = {}
  filteredQuestions.value.forEach(q => {
    const courseKey = q.courseId || 'Unassigned'
    if (!groups[courseKey]) {
      const courseObj = courses.value.find(c => c.id === q.courseId || c.code === q.courseId)
      groups[courseKey] = {
        courseKey,
        code: courseObj ? courseObj.code : (q.courseId || 'UNASSIGNED'),
        title: courseObj ? courseObj.title : 'General / Unassigned Course Items',
        questions: []
      }
    }
    groups[courseKey].questions.push(q)
  })
  return Object.values(groups)
})

// Computed Course Reports for Assessor Audit
const courseReports = computed(() => {
  const map = {}
  
  courses.value.forEach(course => {
    map[course.id || course.code] = {
      code: course.code || course.id,
      title: course.title || `Course ${course.code}`,
      program: course.program || 'Both',
      total: 0,
      approved: 0,
      disapproved: 0,
      pending: 0,
      retainedAi: 0
    }
  })

  questions.value.forEach(q => {
    const key = q.courseId || 'Unassigned'
    if (!map[key]) {
      map[key] = {
        code: key,
        title: 'Unassigned Course Items',
        program: 'N/A',
        total: 0,
        approved: 0,
        disapproved: 0,
        pending: 0,
        retainedAi: 0
      }
    }
    
    map[key].total++
    const status = q.status || 'Pending'
    if (status === 'Approved') map[key].approved++
    else if (status === 'Disapproved') map[key].disapproved++
    else map[key].pending++

    if (q.retainedAi) map[key].retainedAi++
  })

  return Object.values(map)
})

const overallReportSummary = computed(() => {
  const total = questions.value.length
  const approved = questions.value.filter(q => q.status === 'Approved').length
  const disapproved = questions.value.filter(q => q.status === 'Disapproved').length
  const pending = questions.value.filter(q => (q.status || 'Pending') === 'Pending').length
  const retainedAi = questions.value.filter(q => q.retainedAi).length
  return { total, approved, disapproved, pending, retainedAi }
})

function toggleCourseCollapse(courseKey) {
  collapsedCourses.value[courseKey] = !collapsedCourses.value[courseKey]
}

function exportCourseReportCSV() {
  const headers = ['Course Code', 'Course Title', 'Program', 'Total Questions', 'Approved', 'Disapproved', 'Pending Approval', 'AI Overrides Retained']
  const rows = courseReports.value.map(r => [
    r.code,
    r.title,
    r.program,
    r.total,
    r.approved,
    r.disapproved,
    r.pending,
    r.retainedAi
  ])

  const csvContent = [headers.join(','), ...rows.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.setAttribute('download', `course_question_report_${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function onProgramChange() {
  form.courseId = ''
  form.courseOutcomeId = ''
  form.learningOutcomeId = ''
}

function onCourseChange() {
  form.courseOutcomeId = ''
  form.learningOutcomeId = ''
}

function onCOChange() {
  form.learningOutcomeId = ''
}

function addOption() {
  form.options.push({ text: '', imageUrl: '', isCorrect: false })
}

function removeOption(index) {
  if (form.options.length > 2) {
    form.options.splice(index, 1)
  }
}

function addMatchingPair() {
  form.matchingPairs.push({ prompt: '', promptImage: '', match: '', matchImage: '' })
}

function removeMatchingPair(index) {
  if (form.matchingPairs.length > 2) {
    form.matchingPairs.splice(index, 1)
  }
}

function handleFileUpload(event, targetObj, propertyName) {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => { targetObj[propertyName] = e.target.result }
  reader.readAsDataURL(file)
}

function removeImage(targetObj, propertyName) {
  targetObj[propertyName] = ''
}

// AI Analysis Engine for Cognitive Alignment & Stem Quality
function generateAiSuggestion(q) {
  if (q.retainedAi) {
    return {
      type: 'info',
      text: 'Original parameters retained by reviewer.'
    }
  }

  const suggestions = []
  const textLower = (q.text || '').toLowerCase().trim()
  const bloom = (q.bloomLevel || '').toLowerCase()

  // Cognitive Level checks based on Bloom's action verbs
  if ((textLower.startsWith('what is') || textLower.startsWith('define') || textLower.startsWith('list') || textLower.startsWith('name') || textLower.startsWith('identify')) && bloom !== 'remembering') {
    suggestions.push(`Cognitive Level Mismatch: Stem uses recall verbs ("What is/Define/List"). Suggested Bloom's level is "Remembering" instead of "${q.bloomLevel}".`)
  } else if ((textLower.includes('calculate') || textLower.includes('solve') || textLower.includes('determine') || textLower.includes('apply')) && (bloom !== 'applying' && bloom !== 'application')) {
    suggestions.push(`Cognitive Level Mismatch: Question involves calculation or practical execution. Suggested Bloom's level is "Application" instead of "${q.bloomLevel}".`)
  } else if ((textLower.includes('compare') || textLower.includes('differentiate') || textLower.includes('analyze') || textLower.includes('distinguish')) && bloom !== 'analysis') {
    suggestions.push(`Cognitive Level Mismatch: Question involves analytical comparison. Suggested Bloom's level is "Analysis" instead of "${q.bloomLevel}".`)
  }

  // Stem quality & option checks
  if (q.text && q.text.length < 15) {
    suggestions.push('Stem Clarity: Item statement is short. Consider expanding the context.')
  }
  if (q.type === 'multiple_choice' && Array.isArray(q.options) && q.options.length < 4) {
    suggestions.push('Distractor Count: Multiple choice items should standardly provide 4 options.')
  }

  if (suggestions.length === 0) {
    return {
      type: 'success',
      text: "AI Audit: Item stem and Bloom's classification are well-aligned."
    }
  }

  return {
    type: 'warning',
    text: suggestions.join(' | ')
  }
}

function syncQuestionsStorage() {
  localStorage.setItem(STORAGE_QUESTIONS_KEY, JSON.stringify(questions.value))
}

function updateQuestionStatus(id, status) {
  const q = questions.value.find(item => item.id === id)
  if (q) {
    q.status = status
    syncQuestionsStorage()
  }
}

function applyAiCorrection(q) {
  const suggestion = generateAiSuggestion(q)
  if (suggestion.type === 'warning' && suggestion.text.includes('Suggested Bloom\'s level is')) {
    if (suggestion.text.includes('"Remembering"')) q.bloomLevel = 'Remembering'
    else if (suggestion.text.includes('"Application"')) q.bloomLevel = 'Application'
    else if (suggestion.text.includes('"Analysis"')) q.bloomLevel = 'Analysis'
  }
  q.retainedAi = false
  syncQuestionsStorage()
}

function retainOriginalSettings(q) {
  q.retainedAi = true
  syncQuestionsStorage()
}

function deleteQuestion(id) {
  if (confirm('Are you sure you want to remove this question item?')) {
    questions.value = questions.value.filter(q => q.id !== id)
    syncQuestionsStorage()
  }
}

async function fetchQuestions() {
  try {
    const saved = localStorage.getItem(STORAGE_QUESTIONS_KEY)
    if (saved) {
      questions.value = JSON.parse(saved)
      return
    }
    const res = await fetch('http://localhost:3001/api/questions')
    const data = await res.json()
    if (data.success) {
      questions.value = data.data
      localStorage.setItem(STORAGE_QUESTIONS_KEY, JSON.stringify(data.data))
    }
  } catch (err) {
    console.warn('Backend unavailable, reading questions from localStorage:', err)
  }
}

async function fetchCourses() {
  try {
    const savedCourses = localStorage.getItem(STORAGE_COURSES_KEY)
    if (savedCourses) {
      courses.value = JSON.parse(savedCourses)
      return
    }

    const res = await fetch('http://localhost:3001/api/courses')
    const data = await res.json()
    if (data.success) {
      courses.value = data.data
    }
  } catch (err) {
    console.warn('Backend unavailable, using local courses storage:', err)
  }
}

async function saveQuestion() {
  if (!form.courseId || !form.text) {
    alert('Please select a Course / Subject and enter Question Stem.')
    return
  }

  let formattedOptions = []
  let formattedCorrectAnswer = null
  let formattedMatchingPairs = []

  if (form.type === 'multiple_choice') {
    formattedOptions = form.options.map(opt => ({ text: opt.text, imageUrl: opt.imageUrl }))
    formattedCorrectAnswer = form.options
      .map((opt, idx) => opt.isCorrect ? idx : null)
      .filter(val => val !== null)
    
    if (formattedCorrectAnswer.length === 0) {
      alert('Please check at least one correct option.')
      return
    }
  } else if (form.type === 'true_false') {
    formattedOptions = ['True', 'False']
    formattedCorrectAnswer = form.tfCorrect === 'true' ? 0 : 1
  } else if (form.type === 'short_answer') {
    formattedCorrectAnswer = form.shortAnswerKeywords.split(',').map(s => s.trim()).filter(Boolean)
  } else if (form.type === 'matching') {
    formattedMatchingPairs = form.matchingPairs
  }

  const payload = {
    id: Date.now().toString(),
    ...form,
    options: formattedOptions,
    correctAnswer: formattedCorrectAnswer,
    matchingPairs: formattedMatchingPairs,
    status: 'Pending'
  }

  isSubmitting.value = true
  try {
    const res = await fetch('http://localhost:3001/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    if (data.success) {
      alert('Question saved successfully!')
      fetchQuestions()
      resetForm()
      activeTab.value = 'repository'
    } else {
      throw new Error(data.error)
    }
  } catch (err) {
    questions.value.unshift(payload)
    syncQuestionsStorage()
    alert('Question item saved locally!')
    resetForm()
    activeTab.value = 'repository'
  } finally {
    isSubmitting.value = false
  }
}

// --- CSV HELPER & TEMPLATE DOWNLOAD & BULK UPLOAD ---
function parseCSVLine(line) {
  const result = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      inQuotes = !inQuotes
    } else if (c === ',' && !inQuotes) {
      result.push(cur.trim().replace(/^"|"$/g, '').replace(/""/g, '"'))
      cur = ''
    } else {
      cur += c
    }
  }
  result.push(cur.trim().replace(/^"|"$/g, '').replace(/""/g, '"'))
  return result
}

function downloadCSVTemplate() {
  const headers = ['Program', 'Term', 'CourseId', 'CourseOutcomeId', 'LearningOutcomeId', 'BloomLevel', 'QuestionType', 'QuestionText', 'OptionA', 'OptionB', 'OptionC', 'OptionD', 'CorrectAnswer']
  const sampleRows = [
    ['BSMT', 'Midterm', 'CRS-101', 'CO1', 'LO1.1', 'Understanding', 'multiple_choice', 'What is the primary function of an ECDIS?', 'Electronic Chart Display', 'Radar Display', 'Sonar System', 'GMDSS Radio', 'A'],
    ['BSMarE', 'Final', 'CRS-102', 'CO2', 'LO2.1', 'Remembering', 'true_false', 'Is a diesel engine an internal combustion engine?', 'True', 'False', '', '', 'A'],
    ['Both', 'Midterm', 'CRS-103', 'CO1', 'LO1.2', 'Analysis', 'short_answer', 'Name the standard international maritime buoyage system.', '', '', '', '', 'IALA'],
    ['BSMT', 'Midterm', 'CRS-101', 'CO1', 'LO1.3', 'Application', 'matching', 'Match each vessel term with its correct location.', 'Starboard', 'Port', 'Stern', 'Bow', 'A: Right side | B: Left side | C: Rear | D: Front']
  ]

  const csvContent = [headers.join(','), ...sampleRows.map(r => r.map(field => `"${field.replace(/"/g, '""')}"`).join(','))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.setAttribute('download', 'question_bank_template.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function handleBulkCSVUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      isUploadingBulk.value = true
      const text = e.target.result
      const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0)
      
      if (lines.length < 2) {
        alert('CSV file appears empty or missing rows.')
        return
      }

      const parsedQuestions = []
      for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i])

        if (cols.length >= 8) {
          const program = cols[0] || 'Both'
          const term = cols[1] || 'Midterm'
          const courseId = cols[2] || ''
          const courseOutcomeId = cols[3] || ''
          const learningOutcomeId = cols[4] || ''
          const bloomLevel = cols[5] || 'Understanding'
          const type = cols[6] || 'multiple_choice'
          const qText = cols[7] || ''

          const optionA = cols[8] || ''
          const optionB = cols[9] || ''
          const optionC = cols[10] || ''
          const optionD = cols[11] || ''
          const rawCorrect = cols[12] || ''

          let options = []
          let correctAnswer = null
          let matchingPairs = []

          if (type === 'multiple_choice') {
            const rawOptions = [optionA, optionB, optionC, optionD].filter(Boolean)
            options = rawOptions.map(o => ({ text: o, imageUrl: '' }))
            
            let correctIdx = 0
            const rawUpper = rawCorrect.trim().toUpperCase()
            if (['A', 'B', 'C', 'D'].includes(rawUpper)) {
              correctIdx = ['A', 'B', 'C', 'D'].indexOf(rawUpper)
            } else if (!isNaN(parseInt(rawCorrect)) && parseInt(rawCorrect) >= 0) {
              correctIdx = parseInt(rawCorrect)
            } else {
              const idxFound = rawOptions.findIndex(o => o.toLowerCase() === rawCorrect.trim().toLowerCase())
              if (idxFound !== -1) correctIdx = idxFound
            }
            correctAnswer = [correctIdx]
          } else if (type === 'true_false') {
            options = ['True', 'False']
            const rawLower = rawCorrect.trim().toLowerCase()
            correctAnswer = (rawLower === 'b' || rawLower === 'false' || rawLower === '1') ? 1 : 0
          } else if (type === 'short_answer') {
            correctAnswer = rawCorrect.split(',').map(s => s.trim()).filter(Boolean)
          } else if (type === 'matching') {
            const promptMap = { 'A': optionA, 'B': optionB, 'C': optionC, 'D': optionD }
            if (rawCorrect.includes(':')) {
              const pairsMap = {}
              const parts = rawCorrect.split('|')
              parts.forEach(part => {
                if (part.includes(':')) {
                  const [k, ...vParts] = part.split(':')
                  if (k && vParts.length > 0) {
                    pairsMap[k.trim().toUpperCase()] = vParts.join(':').trim()
                  }
                }
              })
              matchingPairs = ['A', 'B', 'C', 'D']
                .filter(k => promptMap[k])
                .map(k => ({
                  prompt: promptMap[k],
                  promptImage: '',
                  match: pairsMap[k] || '',
                  matchImage: ''
                }))
            } else {
              const matches = rawCorrect.split('|').map(s => s.trim())
              const prompts = [optionA, optionB, optionC, optionD].filter(Boolean)
              matchingPairs = prompts.map((p, idx) => ({
                prompt: p,
                promptImage: '',
                match: matches[idx] || '',
                matchImage: ''
              }))
            }
          }

          parsedQuestions.push({
            id: Date.now().toString() + i,
            program,
            term,
            courseId,
            courseOutcomeId,
            learningOutcomeId,
            bloomLevel,
            type,
            text: qText,
            options,
            correctAnswer,
            matchingPairs,
            status: 'Pending'
          })
        }
      }

      if (parsedQuestions.length === 0) {
        alert('No valid question rows found in CSV.')
        return
      }

      try {
        const res = await fetch('http://localhost:3001/api/questions/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questions: parsedQuestions })
        })
        const data = await res.json()
        if (data.success) {
          alert(`Successfully imported ${data.count} questions!`)
          fetchQuestions()
          activeTab.value = 'repository'
        } else {
          throw new Error(data.error)
        }
      } catch {
        questions.value.unshift(...parsedQuestions)
        syncQuestionsStorage()
        alert(`Successfully imported ${parsedQuestions.length} questions locally!`)
        activeTab.value = 'repository'
      }
    } catch (err) {
      alert('Error parsing CSV file.')
    } finally {
      isUploadingBulk.value = false
      if (bulkFileInput.value) bulkFileInput.value.value = ''
    }
  }
  reader.readAsText(file)
}

onMounted(() => {
  fetchQuestions()
  fetchCourses()
})
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <!-- Header Banner & CSV Upload Actions -->
    <div class="bg-slate-900 text-white p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md">
      <div>
        <h1 class="text-xl font-bold flex items-center gap-2">
          <HelpCircle class="text-emerald-400" :size="22" /> Assessment Question Authoring & Validation
        </h1>
        <p class="text-xs text-slate-300">Map items by Program, Term, Course Code, Outcomes, and Bloom's Taxonomy with AI Cognitive Validation.</p>
      </div>

      <!-- CSV Actions -->
      <div class="flex items-center gap-3">
        <button @click="downloadCSVTemplate" type="button" class="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-2 transition">
          <Download :size="14" /> Download CSV Template
        </button>

        <label class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-2 transition shadow-sm">
          <Upload :size="14" /> {{ isUploadingBulk ? 'Importing...' : 'Bulk Upload CSV' }}
          <input ref="bulkFileInput" type="file" accept=".csv" @change="handleBulkCSVUpload" :disabled="isUploadingBulk" class="hidden" />
        </label>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex items-center gap-2 border-b border-slate-200 pb-2">
      <button 
        @click="activeTab = 'repository'"
        :class="[
          'px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all',
          activeTab === 'repository' 
            ? 'bg-slate-900 text-white shadow-sm' 
            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
        ]"
      >
        <Database :size="15" /> Question Bank Repository
        <span 
          :class="activeTab === 'repository' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700'"
          class="text-[10px] px-2 py-0.5 rounded-full font-bold"
        >
          {{ questions.length }}
        </span>
      </button>

      <button 
        @click="activeTab = 'create'"
        :class="[
          'px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all',
          activeTab === 'create' 
            ? 'bg-slate-900 text-white shadow-sm' 
            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
        ]"
      >
        <PlusCircle :size="15" /> Author New Question
      </button>

      <button 
        @click="activeTab = 'report'"
        :class="[
          'px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all',
          activeTab === 'report' 
            ? 'bg-slate-900 text-white shadow-sm' 
            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
        ]"
      >
        <FileText :size="15" /> Course Reports & Audits
      </button>
    </div>

    <!-- TAB 1: AUTHORING FORM -->
    <div v-show="activeTab === 'create'" class="bg-white border rounded-2xl p-6 shadow-sm space-y-6">
      
      <!-- 1. Program & Curriculum Mapping -->
      <h2 class="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-2">1. Program & Curriculum Mapping</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs">
        <!-- Program -->
        <div>
          <label class="font-bold text-slate-700 block mb-1">Program</label>
          <select v-model="form.program" @change="onProgramChange" class="w-full p-2.5 border rounded-lg bg-slate-50 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none">
            <option value="Both">Both (BSMT & BSMarE)</option>
            <option value="BSMT">BSMT (Marine Transportation)</option>
            <option value="BSMarE">BSMarE (Marine Engineering)</option>
          </select>
        </div>

        <!-- Academic Term -->
        <div>
          <label class="font-bold text-slate-700 block mb-1">Academic Term</label>
          <select v-model="form.term" class="w-full p-2.5 border rounded-lg bg-slate-50 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none">
            <option value="Midterm">Midterm</option>
            <option value="Final">Finals</option>
          </select>
        </div>

        <!-- Course Code -->
        <div>
          <label class="font-bold text-slate-700 block mb-1">Course / Subject</label>
          <select v-model="form.courseId" @change="onCourseChange" class="w-full p-2.5 border rounded-lg bg-slate-50 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none">
            <option value="">Select Subject</option>
            <option v-for="c in filteredCourses" :key="c.id" :value="c.id">
              {{ c.code }} - {{ c.title }}
            </option>
          </select>
        </div>

        <!-- Course Outcome (CO) -->
        <div>
          <label class="font-bold text-slate-700 block mb-1">Course Outcome (CO)</label>
          <select v-model="form.courseOutcomeId" @change="onCOChange" :disabled="!form.courseId" class="w-full p-2.5 border rounded-lg disabled:bg-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none">
            <option value="">Select Course Outcome</option>
            <option v-for="co in availableCourseOutcomes" :key="co.id || co.code" :value="co.id || co.code">
              {{ co.code || co.id }}: {{ co.description || co.title }}
            </option>
          </select>
        </div>

        <!-- Learning Outcome (LO) -->
        <div>
          <label class="font-bold text-slate-700 block mb-1">Learning Outcome (LO)</label>
          <select v-model="form.learningOutcomeId" :disabled="!form.courseOutcomeId" class="w-full p-2.5 border rounded-lg disabled:bg-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none">
            <option value="">Select Learning Outcome</option>
            <option v-for="lo in availableLearningOutcomes" :key="lo.id || lo.code" :value="lo.id || lo.code">
              {{ lo.code || lo.id }}: {{ lo.description || lo.title }}
            </option>
          </select>
        </div>
      </div>

      <!-- 2. Item Details & Classification -->
      <h2 class="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-2 pt-2">2. Item Classification</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div>
          <label class="font-bold text-slate-700 block mb-1">Bloom's Taxonomy</label>
          <select v-model="form.bloomLevel" class="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
            <option value="Remembering">Remembering</option>
            <option value="Understanding">Understanding</option>
            <option value="Application">Application</option>
            <option value="Analysis">Analysis</option>
            <option value="Evaluation">Evaluation</option>
          </select>
        </div>

        <div>
          <label class="font-bold text-slate-700 block mb-1">Question Type</label>
          <select v-model="form.type" class="w-full p-2.5 border rounded-lg font-bold bg-slate-50 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none">
            <option value="multiple_choice">Multiple Choice</option>
            <option value="true_false">True / False</option>
            <option value="short_answer">Short Answer</option>
            <option value="matching">Matching Type</option>
          </select>
        </div>
      </div>

      <!-- Question Stem & Image Upload -->
      <div class="space-y-3">
        <label class="font-bold text-xs text-slate-700 block">Question Stem</label>
        <textarea v-model="form.text" rows="3" placeholder="Enter question statement..." class="w-full p-3 border rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"></textarea>

        <div class="bg-slate-50 p-3 rounded-xl border border-dashed flex items-center justify-between">
          <div>
            <span class="text-[11px] font-bold text-slate-700 block">Question Image (Optional)</span>
            <input type="file" accept="image/*" @change="e => handleFileUpload(e, form, 'imageUrl')" class="text-xs mt-1" />
          </div>
          <div v-if="form.imageUrl" class="relative">
            <img :src="form.imageUrl" class="h-16 w-16 object-cover rounded-lg border shadow-sm" />
            <button @click="removeImage(form, 'imageUrl')" class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
              <X :size="10" />
            </button>
          </div>
        </div>
      </div>

      <!-- 3. Dynamic Answers Section -->
      <h2 class="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-2 pt-2">3. Options & Correct Answers</h2>

      <!-- MULTIPLE CHOICE -->
      <div v-if="form.type === 'multiple_choice'" class="space-y-3 bg-slate-50 p-4 rounded-xl border">
        <div class="flex justify-between items-center">
          <span class="text-xs font-bold text-slate-700">Options & Correct Answer(s) (Check all that apply)</span>
          <button @click="addOption" type="button" class="text-xs text-emerald-600 font-bold flex items-center gap-1 hover:underline">
            <Plus :size="14" /> Add Option
          </button>
        </div>

        <div v-for="(opt, idx) in form.options" :key="idx" class="flex items-center gap-3 bg-white p-3 rounded-xl border shadow-sm">
          <input type="checkbox" v-model="opt.isCorrect" title="Mark as correct answer" class="h-4 w-4 text-emerald-600 rounded border-slate-300" />
          <input v-model="opt.text" :placeholder="`Option ${idx + 1} text...`" class="flex-1 p-2 border rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500" />

          <div class="flex items-center gap-2">
            <label class="cursor-pointer p-2 border rounded-lg hover:bg-slate-50 text-slate-600 flex items-center gap-1 text-[11px] font-semibold">
              <Image :size="14" /> {{ opt.imageUrl ? 'Change Image' : 'Image' }}
              <input type="file" accept="image/*" class="hidden" @change="e => handleFileUpload(e, opt, 'imageUrl')" />
            </label>
            <div v-if="opt.imageUrl" class="relative">
              <img :src="opt.imageUrl" class="h-8 w-8 object-cover rounded border" />
              <button @click="removeImage(opt, 'imageUrl')" class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5">
                <X :size="10" />
              </button>
            </div>
          </div>

          <button v-if="form.options.length > 2" @click="removeOption(idx)" class="text-red-500 hover:text-red-700 p-1">
            <Trash2 :size="16" />
          </button>
        </div>
      </div>

      <!-- TRUE / FALSE -->
      <div v-if="form.type === 'true_false'" class="space-y-3 bg-slate-50 p-4 rounded-xl border">
        <label class="font-bold text-xs text-slate-700 block">Select Correct Answer</label>
        <div class="flex gap-6 text-xs font-bold text-slate-800">
          <label class="flex items-center gap-2 cursor-pointer bg-white px-4 py-2.5 rounded-xl border hover:border-emerald-500">
            <input type="radio" value="true" v-model="form.tfCorrect" name="tf_answer" class="text-emerald-600" /> True
          </label>
          <label class="flex items-center gap-2 cursor-pointer bg-white px-4 py-2.5 rounded-xl border hover:border-emerald-500">
            <input type="radio" value="false" v-model="form.tfCorrect" name="tf_answer" class="text-emerald-600" /> False
          </label>
        </div>
      </div>

      <!-- SHORT ANSWER -->
      <div v-if="form.type === 'short_answer'" class="space-y-3 bg-slate-50 p-4 rounded-xl border">
        <label class="font-bold text-xs text-slate-700 block">Accepted Keywords / Answer Phrases (Comma-Separated)</label>
        <input v-model="form.shortAnswerKeywords" placeholder="e.g. Navigation, GPS, ECDIS" class="w-full p-2.5 border rounded-lg text-xs bg-white focus:ring-2 focus:ring-emerald-500 outline-none" />
        <p class="text-[11px] text-slate-500">Cadet responses matching any of these keywords will be marked as correct.</p>
      </div>

      <!-- MATCHING TYPE -->
      <div v-if="form.type === 'matching'" class="space-y-3 bg-slate-50 p-4 rounded-xl border">
        <div class="flex justify-between items-center">
          <span class="text-xs font-bold text-slate-700">Matching Pairs (Prompts & Answers)</span>
          <button @click="addMatchingPair" type="button" class="text-xs text-emerald-600 font-bold flex items-center gap-1 hover:underline">
            <Plus :size="14" /> Add Pair
          </button>
        </div>

        <div v-for="(pair, idx) in form.matchingPairs" :key="idx" class="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-3 rounded-xl border relative">
          <div class="space-y-2">
            <span class="text-[11px] font-bold text-slate-500">Item {{ idx + 1 }} (Prompt)</span>
            <input v-model="pair.prompt" placeholder="Prompt text..." class="w-full p-2 border rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500" />
            <div class="flex items-center gap-2">
              <label class="cursor-pointer text-[11px] font-bold text-slate-600 flex items-center gap-1 border px-2 py-1 rounded bg-slate-50">
                <Image :size="12" /> {{ pair.promptImage ? 'Change Image' : 'Add Image' }}
                <input type="file" accept="image/*" class="hidden" @change="e => handleFileUpload(e, pair, 'promptImage')" />
              </label>
              <div v-if="pair.promptImage" class="relative">
                <img :src="pair.promptImage" class="h-8 w-8 object-cover rounded border" />
                <button @click="removeImage(pair, 'promptImage')" class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5">
                  <X :size="10" />
                </button>
              </div>
            </div>
          </div>

          <div class="space-y-2 pr-6">
            <span class="text-[11px] font-bold text-slate-500">Matching Answer</span>
            <input v-model="pair.match" placeholder="Matching answer text..." class="w-full p-2 border rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500" />
            <div class="flex items-center gap-2">
              <label class="cursor-pointer text-[11px] font-bold text-slate-600 flex items-center gap-1 border px-2 py-1 rounded bg-slate-50">
                <Image :size="12" /> {{ pair.matchImage ? 'Change Image' : 'Add Image' }}
                <input type="file" accept="image/*" class="hidden" @change="e => handleFileUpload(e, pair, 'matchImage')" />
              </label>
              <div v-if="pair.matchImage" class="relative">
                <img :src="pair.matchImage" class="h-8 w-8 object-cover rounded border" />
                <button @click="removeImage(pair, 'matchImage')" class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5">
                  <X :size="10" />
                </button>
              </div>
            </div>
          </div>

          <button v-if="form.matchingPairs.length > 2" @click="removeMatchingPair(idx)" class="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1">
            <Trash2 :size="14" />
          </button>
        </div>
      </div>

      <!-- Submit Action -->
      <button @click="saveQuestion" :disabled="isSubmitting" class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition">
        <Save :size="16" /> Save Question Item
      </button>

    </div>

    <!-- TAB 2: QUESTION BANK REPOSITORY (Collapsible per Course Code/Title) -->
    <div v-show="activeTab === 'repository'" class="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
      <div class="flex flex-col md:flex-row justify-between md:items-center border-b pb-4 gap-4">
        <div>
          <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
            Question Bank Repository <span class="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">{{ questions.length }} items</span>
          </h2>
          <p class="text-xs text-slate-500">Review, approve/disapprove, or apply AI cognitive suggestions organized by Course Code and Title.</p>
        </div>

        <!-- Repository Filters -->
        <div class="flex flex-wrap items-center gap-2 text-xs">
          <input v-model="searchQuery" placeholder="Search questions..." class="p-2 border rounded-lg bg-slate-50 text-slate-800 focus:ring-1 focus:ring-emerald-500 outline-none w-44" />
          
          <select v-model="filterStatus" class="p-2 border rounded-lg bg-slate-50 font-bold text-slate-700 outline-none">
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Disapproved">Disapproved</option>
          </select>

          <select v-model="filterProgram" class="p-2 border rounded-lg bg-slate-50 font-bold text-slate-700 outline-none">
            <option value="All">All Programs</option>
            <option value="BSMT">BSMT</option>
            <option value="BSMarE">BSMarE</option>
            <option value="Both">Both</option>
          </select>
        </div>
      </div>

      <!-- Questions List Empty State -->
      <div v-if="groupedQuestions.length === 0" class="text-center py-12 text-slate-400 text-xs font-semibold">
        No questions found matching selected criteria.
      </div>

      <!-- Collapsible Course Groups Loop -->
      <div v-else class="space-y-4">
        <div 
          v-for="group in groupedQuestions" 
          :key="group.courseKey" 
          class="border rounded-2xl bg-slate-50/50 overflow-hidden shadow-sm border-slate-200"
        >
          <!-- Collapsible Header -->
          <div 
            @click="toggleCourseCollapse(group.courseKey)"
            class="flex items-center justify-between p-4 bg-slate-100 hover:bg-slate-200/80 cursor-pointer select-none transition border-b border-slate-200"
          >
            <div class="flex items-center gap-3">
              <component :is="collapsedCourses[group.courseKey] ? ChevronRight : ChevronDown" :size="18" class="text-slate-600" />
              <div>
                <h3 class="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span class="bg-slate-900 text-white px-2.5 py-0.5 rounded text-[11px] font-mono tracking-wide">{{ group.code }}</span>
                  <span>{{ group.title }}</span>
                </h3>
              </div>
            </div>
            <span class="bg-slate-200 text-slate-700 text-[11px] font-bold px-3 py-0.5 rounded-full border border-slate-300">
              {{ group.questions.length }} {{ group.questions.length === 1 ? 'item' : 'items' }}
            </span>
          </div>

          <!-- Collapsible Group Content -->
          <div v-show="!collapsedCourses[group.courseKey]" class="p-4 space-y-4 bg-white">
            <div 
              v-for="(q, idx) in group.questions" 
              :key="q.id || idx" 
              class="border rounded-xl p-4 bg-slate-50/50 hover:bg-white hover:shadow-md transition space-y-3 border-slate-200"
            >
              
              <!-- Top Row: Tags & Approval Controls -->
              <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b pb-2">
                <div class="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                  <span class="bg-slate-800 text-white px-2 py-0.5 rounded">{{ q.program || 'Both' }}</span>
                  <span class="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{{ q.term }}</span>
                  <span class="bg-purple-100 text-purple-800 px-2 py-0.5 rounded">{{ q.courseId || 'Unassigned' }}</span>
                  <span class="bg-amber-100 text-amber-900 px-2 py-0.5 rounded">Bloom's: {{ q.bloomLevel }}</span>
                  <span class="bg-slate-200 text-slate-700 px-2 py-0.5 rounded uppercase">{{ q.type }}</span>
                </div>

                <!-- Approval Status Badge & Action Buttons -->
                <div class="flex items-center gap-2">
                  <span :class="{
                    'bg-amber-100 text-amber-800 border-amber-300': (q.status || 'Pending') === 'Pending',
                    'bg-emerald-100 text-emerald-800 border-emerald-300': q.status === 'Approved',
                    'bg-red-100 text-red-800 border-red-300': q.status === 'Disapproved'
                  }" class="text-[11px] font-bold px-2.5 py-0.5 rounded-full border">
                    {{ q.status || 'Pending' }}
                  </span>

                  <button @click="updateQuestionStatus(q.id, 'Approved')" title="Approve Question" class="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg border border-emerald-200 transition">
                    <CheckCircle :size="15" />
                  </button>

                  <button @click="updateQuestionStatus(q.id, 'Disapproved')" title="Disapprove Question" class="p-1.5 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white rounded-lg border border-red-200 transition">
                    <XCircle :size="15" />
                  </button>

                  <button @click="deleteQuestion(q.id)" title="Delete Item" class="p-1.5 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-lg transition">
                    <Trash2 :size="15" />
                  </button>
                </div>
              </div>

              <!-- Middle: Question Stem -->
              <div>
                <p class="text-xs font-semibold text-slate-800">{{ q.text }}</p>
              </div>

              <!-- Options Preview -->
              <div v-if="q.options && q.options.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div v-for="(opt, oIdx) in q.options" :key="oIdx" class="p-2 rounded-lg border text-[11px]" :class="Array.isArray(q.correctAnswer) && q.correctAnswer.includes(oIdx) ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900' : 'bg-white text-slate-700'">
                  <span class="font-bold mr-1">{{ String.fromCharCode(65 + oIdx) }}.</span> {{ typeof opt === 'string' ? opt : opt.text }}
                </div>
              </div>

              <!-- Matching Pairs Preview -->
              <div v-else-if="q.matchingPairs && q.matchingPairs.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div v-for="(pair, pIdx) in q.matchingPairs" :key="pIdx" class="p-2 rounded-lg border bg-white text-[11px] flex justify-between">
                  <span class="font-semibold text-slate-800">{{ pair.prompt }}</span>
                  <span class="text-emerald-700 font-bold">➔ {{ pair.match }}</span>
                </div>
              </div>

              <!-- Bottom: AI Analysis with Retain or Apply Options -->
              <div 
                class="p-2.5 rounded-xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border" 
                :class="{
                  'bg-amber-50/80 border-amber-200 text-amber-900': generateAiSuggestion(q).type === 'warning',
                  'bg-blue-50/80 border-blue-200 text-blue-900': generateAiSuggestion(q).type === 'info',
                  'bg-emerald-50/50 border-emerald-200 text-emerald-900': generateAiSuggestion(q).type === 'success'
                }"
              >
                <div class="flex items-start gap-2">
                  <Sparkles 
                    :size="16" 
                    class="mt-0.5 shrink-0" 
                    :class="{
                      'text-amber-600': generateAiSuggestion(q).type === 'warning',
                      'text-blue-600': generateAiSuggestion(q).type === 'info',
                      'text-emerald-600': generateAiSuggestion(q).type === 'success'
                    }" 
                  />
                  <div>
                    <span class="font-bold block text-[11px]">AI Validation & Suggestion:</span>
                    <span class="text-[11px] leading-tight block">{{ generateAiSuggestion(q).text }}</span>
                  </div>
                </div>

                <!-- Retain / Apply Action Buttons -->
                <div v-if="generateAiSuggestion(q).type === 'warning'" class="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <button 
                    @click="applyAiCorrection(q)" 
                    class="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition shadow-sm flex items-center gap-1"
                  >
                    <Check :size="12" /> Apply Suggestion
                  </button>
                  <button 
                    @click="retainOriginalSettings(q)" 
                    class="px-3 py-1 bg-slate-600 hover:bg-slate-700 text-white font-bold text-[10px] rounded-lg transition shadow-sm flex items-center gap-1"
                  >
                    <RotateCcw :size="12" /> Retain Original
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 3: COURSE REPORTS & AUDITS -->
    <div v-show="activeTab === 'report'" class="bg-white border rounded-2xl p-6 shadow-sm space-y-6">
      <div class="flex flex-col md:flex-row justify-between md:items-center border-b pb-4 gap-4">
        <div>
          <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <BarChart2 class="text-emerald-600" :size="20" /> Course Question Changes & Audit Report
          </h2>
          <p class="text-xs text-slate-500">View question counts, approval status, and AI overrides grouped per course.</p>
        </div>

        <button @click="exportCourseReportCSV" type="button" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition shadow-sm self-start md:self-auto">
          <Download :size="14" /> Export Report CSV
        </button>
      </div>

      <!-- Summary Stat Cards -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div class="bg-slate-50 border p-4 rounded-xl">
          <span class="text-[11px] font-bold text-slate-500 block uppercase">Total Questions</span>
          <span class="text-xl font-extrabold text-slate-900">{{ overallReportSummary.total }}</span>
        </div>
        <div class="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
          <span class="text-[11px] font-bold text-emerald-700 block uppercase">Approved</span>
          <span class="text-xl font-extrabold text-emerald-800">{{ overallReportSummary.approved }}</span>
        </div>
        <div class="bg-amber-50 border border-amber-100 p-4 rounded-xl">
          <span class="text-[11px] font-bold text-amber-700 block uppercase">Pending Review</span>
          <span class="text-xl font-extrabold text-amber-800">{{ overallReportSummary.pending }}</span>
        </div>
        <div class="bg-red-50 border border-red-100 p-4 rounded-xl">
          <span class="text-[11px] font-bold text-red-700 block uppercase">Disapproved</span>
          <span class="text-xl font-extrabold text-red-800">{{ overallReportSummary.disapproved }}</span>
        </div>
        <div class="bg-blue-50 border border-blue-100 p-4 rounded-xl">
          <span class="text-[11px] font-bold text-blue-700 block uppercase">AI Retained</span>
          <span class="text-xl font-extrabold text-blue-800">{{ overallReportSummary.retainedAi }}</span>
        </div>
      </div>

      <!-- Course Breakdown Table -->
      <div class="overflow-x-auto border rounded-xl">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-100 text-slate-700 uppercase font-bold border-b">
            <tr>
              <th class="p-3">Course Code</th>
              <th class="p-3">Course Title</th>
              <th class="p-3">Program</th>
              <th class="p-3 text-center">Total Items</th>
              <th class="p-3 text-center">Approved</th>
              <th class="p-3 text-center">Pending</th>
              <th class="p-3 text-center">Disapproved</th>
              <th class="p-3 text-center">AI Overrides</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium text-slate-800">
            <tr v-for="report in courseReports" :key="report.code" class="hover:bg-slate-50/80">
              <td class="p-3 font-mono font-bold text-slate-900">{{ report.code }}</td>
              <td class="p-3 font-bold">{{ report.title }}</td>
              <td class="p-3"><span class="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold">{{ report.program }}</span></td>
              <td class="p-3 text-center font-bold">{{ report.total }}</td>
              <td class="p-3 text-center">
                <span class="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold text-[11px]">{{ report.approved }}</span>
              </td>
              <td class="p-3 text-center">
                <span class="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold text-[11px]">{{ report.pending }}</span>
              </td>
              <td class="p-3 text-center">
                <span class="bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold text-[11px]">{{ report.disapproved }}</span>
              </td>
              <td class="p-3 text-center">
                <span class="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold text-[11px]">{{ report.retainedAi }}</span>
              </td>
            </tr>
            <tr v-if="courseReports.length === 0">
              <td colspan="8" class="p-6 text-center text-slate-400">No course data available.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>