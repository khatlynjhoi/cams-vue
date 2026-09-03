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

  if ((textLower.startsWith('what is') || textLower.startsWith('define') || textLower.startsWith('list') || textLower.startsWith('name') || textLower.startsWith('identify')) && bloom !== 'remembering') {
    suggestions.push(`Cognitive Level Mismatch: Stem uses recall verbs ("What is/Define/List"). Suggested Bloom's level is "Remembering" instead of "${q.bloomLevel}".`)
  } else if ((textLower.includes('calculate') || textLower.includes('solve') || textLower.includes('determine') || textLower.includes('apply')) && (bloom !== 'applying' && bloom !== 'application')) {
    suggestions.push(`Cognitive Level Mismatch: Question involves calculation or practical execution. Suggested Bloom's level is "Application" instead of "${q.bloomLevel}".`)
  } else if ((textLower.includes('compare') || textLower.includes('differentiate') || textLower.includes('analyze') || textLower.includes('distinguish')) && bloom !== 'analysis') {
    suggestions.push(`Cognitive Level Mismatch: Question involves analytical comparison. Suggested Bloom's level is "Analysis" instead of "${q.bloomLevel}".`)
  }

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

async function deleteQuestion(id) {
  if (confirm('Are you sure you want to remove this question item?')) {
    questions.value = questions.value.filter(q => q.id !== id)
    syncQuestionsStorage()
    try {
      await fetch(`http://localhost:3001/api/questions/${id}`, { method: 'DELETE' })
    } catch (err) {
      console.warn('Backend delete request failed:', err)
    }
  }
}

async function fetchQuestions() {
  try {
    const res = await fetch('http://localhost:3001/api/questions')
    const data = await res.json()
    if (data && data.success && Array.isArray(data.data)) {
      questions.value = data.data
      syncQuestionsStorage()
      return
    }
  } catch (err) {
    console.warn('Backend unavailable, reading questions from localStorage:', err)
  }

  const saved = localStorage.getItem(STORAGE_QUESTIONS_KEY)
  if (saved) {
    try {
      questions.value = JSON.parse(saved)
    } catch (e) {
      questions.value = []
    }
  }
}

async function fetchCourses() {
  try {
    const res = await fetch('http://localhost:3001/api/courses')
    const data = await res.json()
    if (data && data.success && Array.isArray(data.data)) {
      courses.value = data.data
      localStorage.setItem(STORAGE_COURSES_KEY, JSON.stringify(data.data))
      return
    }
  } catch (err) {
    console.warn('Backend unavailable, using local courses storage:', err)
  }

  const savedCourses = localStorage.getItem(STORAGE_COURSES_KEY)
  if (savedCourses) {
    try {
      courses.value = JSON.parse(savedCourses)
    } catch (e) {
      courses.value = []
    }
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
      await fetchQuestions()
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
          alert(`Successfully imported ${data.count || parsedQuestions.length} questions!`)
          if (data.data && Array.isArray(data.data)) {
            questions.value = data.data
            syncQuestionsStorage()
          } else {
            await fetchQuestions()
          }
          activeTab.value = 'repository'
        } else {
          throw new Error(data.error)
        }
      } catch {
        questions.value = [...parsedQuestions, ...questions.value]
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