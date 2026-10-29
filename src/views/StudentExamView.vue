<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { 
  Timer, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle, 
  AlertTriangle,
  Send,
  Edit3,
  Key,
  User,
  ArrowLeft,
  LogOut,
  GraduationCap,
  Award,
  ShieldAlert,
  Save,
  RotateCcw
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const baseUrl = import.meta.env.BASE_URL || '/'
const logoUrl = `${baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'}cams-logo.png`

const isStaffLoggedIn = computed(() => {
  const token = authStore.token || localStorage.getItem('cams_token') || localStorage.getItem('token')
  const user = authStore.user || JSON.parse(localStorage.getItem('cams_user') || 'null')
  const role = user?.role || localStorage.getItem('cams_user_role')

  if (!token || !user) return false
  return role === 'Admin' || role === 'Assessment Officer' || role === 'Instructor'
})

const examActive = ref(false)
const examSubmitted = ref(false)
const isSubmitting = ref(false)
const showConfirmModal = ref(false)
const duplicateWarning = ref(null)
const resumedNotice = ref(false)

// Candidate Form Inputs
const courseCodeInput = ref('')
const studentName = ref('')
const cadetId = ref('')
const selectedProgram = ref('')
const selectedClassLevel = ref('')
const coursesList = ref([])
const totalItemsInput = ref(50)

const examItems = ref([])
const currentQuestionIndex = ref(0)
const studentAnswers = ref({})
const flaggedQuestions = ref({})

// Clear error warning immediately whenever any input field changes
watch(
  [cadetId, studentName, courseCodeInput, selectedProgram, selectedClassLevel],
  () => {
    if (duplicateWarning.value) {
      duplicateWarning.value = null
    }
    resumedNotice.value = false
  }
)

const initialTime = 3600
const timeRemaining = ref(initialTime)
let timerInterval = null

const scoreResults = ref({ score: 0, total: 0, percentage: 0, breakdown: {} })

function getSessionStorageKey(customId, customCode) {
  const cId = String(customId || cadetId.value).trim().toLowerCase()
  const cCode = String(customCode || courseCodeInput.value).trim().toLowerCase()
  if (!cId || !cCode) return null
  return `cams_exam_progress_${cId}_${cCode}`
}

function saveExamProgress() {
  const key = getSessionStorageKey()
  if (!key || !examActive.value) return

  const progressData = {
    cadetId: cadetId.value,
    studentName: studentName.value,
    selectedProgram: selectedProgram.value,
    selectedClassLevel: selectedClassLevel.value,
    courseCodeInput: courseCodeInput.value,
    currentQuestionIndex: currentQuestionIndex.value,
    studentAnswers: studentAnswers.value,
    flaggedQuestions: flaggedQuestions.value,
    timeRemaining: timeRemaining.value,
    examItems: examItems.value,
    savedAt: new Date().toISOString()
  }

  try {
    localStorage.setItem(key, JSON.stringify(progressData))
    localStorage.setItem('cams_ongoing_session_key', key)
  } catch (e) {
    console.warn('Failed to auto-save exam state to local storage', e)
  }
}

function clearExamProgress() {
  const key = getSessionStorageKey()
  if (key) localStorage.removeItem(key)
  localStorage.removeItem('cams_ongoing_session_key')
}

function loadSavedExamProgress(customId, customCode) {
  const key = getSessionStorageKey(customId, customCode)
  if (!key) return null

  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw)
  } catch (e) {}
  return null
}

async function fetchFromEndpoints(path, options = {}) {
  const token = authStore.token || localStorage.getItem('cams_token') || localStorage.getItem('token') || ''

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  }

  try {
    const res = await fetch(`/api${path}`, { ...options, headers })
    if (res.ok) return await res.json()
  } catch (e) {}
  throw new Error('Backend endpoint unreachable')
}

onMounted(async () => {
  try {
    const qData = await fetchFromEndpoints('/questions')
    const qList = Array.isArray(qData) ? qData : (qData?.data || [])
    if (qList.length > 0) {
      localStorage.setItem('cams_question_bank_data', JSON.stringify(qList))
    }
  } catch (e) {}

  try {
    const data = await fetchFromEndpoints('/courses')
    const list = Array.isArray(data) ? data : (data?.data || [])
    if (list.length > 0) {
      coursesList.value = list
    } else {
      loadFallbackCourses()
    }
  } catch (e) {
    loadFallbackCourses()
  }
})

function loadFallbackCourses() {
  const local = JSON.parse(
    localStorage.getItem('cams_courses_data') || 
    localStorage.getItem('cams_courses') || 
    '[]'
  )
  coursesList.value = local
}

function fetchQuestionBankData() {
  const bankKeys = [
    'cams_question_bank_data',
    'cams_questions_data',
    'cams_questions',
    'question_bank_data',
    'questions_data',
    'cams_saved_questions'
  ]
  
  let allBankQuestions = []
  for (const key of bankKeys) {
    try {
      const data = localStorage.getItem(key)
      if (data) {
        const parsed = JSON.parse(data)
        if (Array.isArray(parsed) && parsed.length > 0) {
          allBankQuestions.push(...parsed)
        }
      }
    } catch (_) {}
  }
  return allBankQuestions
}

function normalizeExamItem(q, idx, fallbackCode = '', overrideCorrectAnswer = null) {
  let rawOptions = q.options || q.choices || q.answers || q.question_options || q.mc_options || []
  if (typeof rawOptions === 'string') {
    try { rawOptions = JSON.parse(rawOptions) } catch (e) { rawOptions = [] }
  }

  let parsedOptions = []
  if (Array.isArray(rawOptions)) {
    parsedOptions = rawOptions
  } else if (typeof rawOptions === 'object' && rawOptions !== null) {
    if (rawOptions.A !== undefined || rawOptions.B !== undefined) {
      parsedOptions = [rawOptions.A, rawOptions.B, rawOptions.C, rawOptions.D].filter(Boolean)
    } else {
      parsedOptions = Object.values(rawOptions)
    }
  }

  const options = parsedOptions.map(opt => {
    if (typeof opt === 'string') return opt
    if (typeof opt === 'object' && opt !== null) {
      return opt.text || opt.option_text || opt.label || opt.choice || opt.value || ''
    }
    return String(opt || '')
  }).filter(opt => opt !== '')

  let rawType = String(q.type || q.question_type || q.questionType || '').toLowerCase().trim()
  let normType = 'multiple_choice'

  if (rawType.includes('choice') || rawType.includes('mc') || rawType.includes('multiple')) {
    normType = 'multiple_choice'
  } else if (rawType.includes('true') || rawType.includes('false') || rawType === 'tf') {
    normType = 'true_false'
  } else if (rawType.includes('short') || rawType.includes('essay') || rawType.includes('written') || rawType.includes('open')) {
    normType = 'short_answer'
  } else {
    normType = options.length > 0 ? 'multiple_choice' : 'short_answer'
  }

  if (normType === 'true_false' && options.length === 0) {
    options.push('True', 'False')
  }

  const coRaw = q.co || q.course_outcome || q.courseOutcome || q.co_code || q.coCode || 'CO1'
  const loRaw = q.lo || q.learning_outcome || q.learningOutcome || q.lo_code || q.loCode || 'LO1.1'

  const coStr = String(coRaw).trim()
  const loStr = String(loRaw).trim()

  const finalCorrectAnswer = overrideCorrectAnswer ?? q.correctAnswer ?? q.correct_answer ?? q.correct_choice ?? q.answer ?? q.correct_option ?? q.correct

  return {
    id: idx + 1,
    originalId: q.id,
    code: q.code || `${fallbackCode || 'ITEM'}-Q${idx + 1}`,
    text: q.text || q.question_text || q.question || '',
    type: normType,
    image_url: q.image_url || q.imageUrl || q.image || '',
    options: options,
    correctAnswer: finalCorrectAnswer,
    bloomLevel: q.bloomLevel || q.bloom_level || q.bloomsLevel || 'Understanding',
    co: coStr.toUpperCase().startsWith('CO') ? coStr : `CO: ${coStr}`,
    lo: loStr.toUpperCase().startsWith('LO') ? loStr : `LO: ${loStr}`
  }
}

function loadActiveScheduleQuestions(passcode) {
  const code = passcode.trim().toUpperCase()
  const bankQuestions = fetchQuestionBankData()

  let rawQuestions = []

  // 1. Check Saved Test Blueprints FIRST (preserves exact Test Builder sequence)
  const testKeys = ['cams_saved_tests', 'cams_test_blueprints', 'cams_blueprints']
  for (const tKey of testKeys) {
    try {
      const savedTests = JSON.parse(localStorage.getItem(tKey) || '[]')
      if (Array.isArray(savedTests) && savedTests.length > 0) {
        const matchedTest = savedTests.find(t => {
          const c = String(t.course || t.course_code || t.code || t.title || '').toUpperCase()
          return c === code || code.includes(c) || c.includes(code)
        })
        if (matchedTest && Array.isArray(matchedTest.items) && matchedTest.items.length > 0) {
          rawQuestions = matchedTest.items
          break
        }
      }
    } catch (_) {}
  }

  // 2. Check Pilot Sessions / Schedules if no direct saved test match
  if (rawQuestions.length === 0) {
    const storageKeys = ['cams_pilot_sessions', 'cams_pilot_schedules', 'cams_schedules']
    let pilotSchedules = []

    for (const key of storageKeys) {
      try {
        const data = localStorage.getItem(key)
        if (data) {
          const parsed = JSON.parse(data)
          if (Array.isArray(parsed) && parsed.length > 0) {
            pilotSchedules = parsed
            break
          }
        }
      } catch (_) {}
    }

    let activeSchedule = pilotSchedules.find(s => {
      const sPass = String(s.access_code || s.passcode || s.code || s.courseCode || s.courseId || '').trim().toUpperCase()
      const isActive = s.status ? String(s.status).toLowerCase() === 'active' : true
      return (sPass === code || code.includes(sPass) || sPass.includes(code)) && isActive
    })

    if (!activeSchedule) {
      try {
        const passcodesMap = JSON.parse(localStorage.getItem('cams_active_passcodes') || '{}')
        activeSchedule = passcodesMap[code]
      } catch (_) {}
    }

    if (activeSchedule && Array.isArray(activeSchedule.questions) && activeSchedule.questions.length > 0) {
      rawQuestions = activeSchedule.questions
    }
  }

  // 3. Fallback to Question Bank
  if (rawQuestions.length === 0) {
    rawQuestions = bankQuestions.filter(q => {
      const courseCode = String(q.courseId || q.course_id || q.courseCode || q.course || q.code || '').toUpperCase()
      const matchesCourse = courseCode.includes(code) || code.includes(courseCode)
      const isApproved = !q.status || q.status === 'Approved' || q.status === 'Pending'
      return matchesCourse && isApproved
    })
  }

  // Preserve exact array sequence without re-sorting
  return rawQuestions.map((q, idx) => {
    const cleanQText = String(q.text || q.question_text || q.question || '').trim().toLowerCase()
    const qCode = String(q.code || q.id || '').trim().toUpperCase()

    const bankQ = bankQuestions.find(b => {
      const bId = String(b.id || b.code || '').trim().toUpperCase()
      const bText = String(b.text || b.question_text || b.question || '').trim().toLowerCase()
      return (qCode && bId === qCode) || (cleanQText && bText && (cleanQText === bText || cleanQText.includes(bText) || bText.includes(cleanQText)))
    })

    const officialCorrectAnswer = bankQ 
      ? (bankQ.correct_answer ?? bankQ.correctAnswer ?? bankQ.correct_choice ?? bankQ.answer ?? bankQ.correct_option ?? bankQ.correct)
      : (q.correct_answer ?? q.correctAnswer ?? q.correct_choice ?? q.answer ?? q.correct_option ?? q.correct)

    return normalizeExamItem(q, idx, passcode, officialCorrectAnswer)
  })
}

async function checkDuplicateSubmission(id, passcode) {
  const cleanId = String(id).trim().toLowerCase()
  const cleanPasscode = String(passcode).trim().toLowerCase()

  if (!cleanId || !cleanPasscode) return null

  let allSubmissions = []

  try {
    const local = JSON.parse(
      localStorage.getItem('cams_exam_submissions') || 
      localStorage.getItem('exam_submissions') || 
      '[]'
    )
    if (Array.isArray(local)) allSubmissions.push(...local)
  } catch (_) {}

  try {
    const apiData = await fetchFromEndpoints('/exam-submissions')
    const list = Array.isArray(apiData) ? apiData : (apiData?.data || [])
    if (list.length > 0) allSubmissions.push(...list)
  } catch (_) {}

  return allSubmissions.find(sub => {
    const subId = String(sub.cadet_id || sub.cadetId || sub.student_id || '').trim().toLowerCase()
    const subPasscode = String(sub.passcode || sub.access_code || sub.test_id || sub.course_code || '').trim().toLowerCase()

    return subId === cleanId && subPasscode === cleanPasscode
  }) || null
}

async function startExam() {
  duplicateWarning.value = null
  resumedNotice.value = false

  if (!cadetId.value.trim() || !studentName.value.trim() || !courseCodeInput.value.trim() || !selectedProgram.value || !selectedClassLevel.value) {
    alert('Please complete all student details, including Course, Class Level, and Access Passcode.')
    return
  }

  const passcode = courseCodeInput.value.trim()

  const existingSub = await checkDuplicateSubmission(cadetId.value, passcode)
  if (existingSub) {
    duplicateWarning.value = existingSub
    return
  }

  const savedProgress = loadSavedExamProgress(cadetId.value, passcode)

  if (savedProgress && Array.isArray(savedProgress.examItems) && savedProgress.examItems.length > 0) {
    examItems.value = savedProgress.examItems
    studentAnswers.value = savedProgress.studentAnswers || {}
    flaggedQuestions.value = savedProgress.flaggedQuestions || {}
    currentQuestionIndex.value = savedProgress.currentQuestionIndex || 0

    const savedTime = savedProgress.savedAt ? new Date(savedProgress.savedAt).getTime() : Date.now()
    const elapsedSecs = Math.floor((Date.now() - savedTime) / 1000)
    const calculatedRemaining = (savedProgress.timeRemaining || initialTime) - elapsedSecs

    timeRemaining.value = Math.max(0, calculatedRemaining)
    resumedNotice.value = true

    examActive.value = true
    startTimer()
    saveExamProgress()
    return
  }

  // Load from blueprint / active schedule first to preserve exact order
  const localQuestions = loadActiveScheduleQuestions(passcode)

  if (localQuestions.length > 0) {
    examItems.value = localQuestions
  } else {
    try {
      const data = await fetchFromEndpoints('/exams/generate', {
        method: 'POST',
        body: JSON.stringify({ 
          courseId: passcode,
          passcode: passcode,
          totalItems: totalItemsInput.value,
          program: selectedProgram.value,
          classLevel: selectedClassLevel.value
        })
      })

      if (data && data.success && Array.isArray(data.exam) && data.exam.length > 0) {
        examItems.value = data.exam.map((q, idx) => normalizeExamItem(q, idx, passcode))
      }
    } catch (err) {}
  }

  if (examItems.value.length > 0) {
    examActive.value = true
    saveExamProgress()
    startTimer()
  } else {
    alert(`No active pilot test schedule or assessment questions found for passcode "${passcode}". Please verify your passcode with your test proctor.`)
  }
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval)

  timerInterval = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--
      if (timeRemaining.value % 10 === 0) {
        saveExamProgress()
      }
    } else {
      executeSubmission()
    }
  }, 1000)
}

const formattedTime = computed(() => {
  const m = Math.floor(timeRemaining.value / 60).toString().padStart(2, '0')
  const s = (timeRemaining.value % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

const currentQuestion = computed(() => examItems.value[currentQuestionIndex.value] || {})

const answeredCount = computed(() => {
  return Object.values(studentAnswers.value).filter(val => val !== undefined && val !== null && String(val).trim() !== '').length
})

const unansweredCount = computed(() => examItems.value.length - answeredCount.value)
const flaggedCount = computed(() => Object.keys(flaggedQuestions.value).filter(k => flaggedQuestions.value[k]).length)

function nextQuestion() {
  if (currentQuestionIndex.value < examItems.value.length - 1) {
    currentQuestionIndex.value++
    saveExamProgress()
  }
}

function prevQuestion() {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
    saveExamProgress()
  }
}

function goToQuestion(idx) {
  currentQuestionIndex.value = idx
  saveExamProgress()
}

function setStudentAnswer(qId, val) {
  studentAnswers.value[qId] = val
  saveExamProgress()
}

function toggleFlag(index) {
  flaggedQuestions.value[index] = !flaggedQuestions.value[index]

  const passcode = courseCodeInput.value.trim().toUpperCase()
  if (passcode) {
    const currentFlagCount = Object.keys(flaggedQuestions.value).filter(k => flaggedQuestions.value[k]).length
    const storageKeys = ['cams_pilot_sessions', 'cams_pilot_schedules', 'cams_schedules']

    storageKeys.forEach(key => {
      try {
        const list = JSON.parse(localStorage.getItem(key) || '[]')
        if (Array.isArray(list)) {
          let updated = false
          list.forEach(s => {
            const pass = String(s.access_code || s.passcode || s.code || '').trim().toUpperCase()
            if (pass === passcode || passcode.includes(pass) || pass.includes(passcode)) {
              s.alerts_count = currentFlagCount
              updated = true
            }
          })
          if (updated) localStorage.setItem(key, JSON.stringify(list))
        }
      } catch (_) {}
    })
  }

  saveExamProgress()
}

function promptSubmission() {
  showConfirmModal.value = true
}

function evaluateQuestionAnswer(item, studentAns) {
  if (studentAns === undefined || studentAns === null || String(studentAns).trim() === '') {
    return false
  }

  let rawCorrect = item.correctAnswer ?? item.correct_answer
  if (rawCorrect === undefined || rawCorrect === null || String(rawCorrect).trim() === '') {
    return false
  }

  if (typeof rawCorrect === 'string' && (rawCorrect.trim().startsWith('[') || rawCorrect.trim().startsWith('{'))) {
    try {
      rawCorrect = JSON.parse(rawCorrect)
    } catch (_) {}
  }

  if (Array.isArray(rawCorrect)) {
    if (rawCorrect.length === 0) return false
    rawCorrect = rawCorrect[0]
  }

  const normalizeStr = (val) => {
    if (val === undefined || val === null) return ''
    let s = typeof val === 'object' ? (val.text || val.choice || val.value || val.label || '') : String(val)
    return s.trim().toLowerCase()
  }

  const stripPrefix = (str) => {
    return str.replace(/^(?:option|choice)?\s*[a-d0-9][\.\)\:\-]\s*/i, '').trim()
  }

  const rawOptions = item.options || []
  const optionsNorm = rawOptions.map(o => normalizeStr(o))
  const cleanOptions = optionsNorm.map(o => stripPrefix(o))

  // WRITTEN / SHORT ANSWER
  if (['short_answer', 'essay', 'open_ended', 'written'].includes(item.type) || rawOptions.length === 0) {
    const studentText = stripPrefix(normalizeStr(studentAns))
    const targetText = stripPrefix(normalizeStr(rawCorrect))

    if (!targetText || targetText === '0' || targetText === 'undefined') return studentText.length > 2
    if (studentText === targetText || studentText.includes(targetText) || targetText.includes(studentText)) return true

    const studentTokens = studentText.split(/[\s,\.\:\-\;\/]+/).filter(t => t.length > 2)
    const targetTokens = targetText.split(/[\s,\.\:\-\;\/]+/).filter(t => t.length > 2)

    if (targetTokens.length > 0 && studentTokens.length > 0) {
      const matched = targetTokens.filter(t => studentTokens.some(st => st.includes(t) || t.includes(st)))
      if (matched.length / targetTokens.length >= 0.5) return true
    }
    return studentText.length > 2
  }

  // MULTIPLE CHOICE / TRUE-FALSE EVALUATION
  const studentIdx = Number(studentAns)
  if (isNaN(studentIdx) || studentIdx < 0 || studentIdx >= rawOptions.length) {
    const studentTextClean = stripPrefix(normalizeStr(studentAns))
    const targetTextClean = stripPrefix(normalizeStr(rawCorrect))
    if (studentTextClean && targetTextClean && studentTextClean === targetTextClean) return true
    return false
  }

  const studentOptRaw = optionsNorm[studentIdx] || ''
  const studentOptClean = cleanOptions[studentIdx] || ''

  const rawCorrectStr = typeof rawCorrect === 'object' 
    ? (rawCorrect.text || rawCorrect.choice || rawCorrect.value || rawCorrect.label || '')
    : String(rawCorrect).trim()

  const normCorrectStr = normalizeStr(rawCorrectStr)
  const cleanCorrect = stripPrefix(normCorrectStr)

  // 1. Direct 0-indexed integer match (0 = A, 1 = B, 2 = C, 3 = D)
  if (/^\d+$/.test(rawCorrectStr)) {
    const targetNum = parseInt(rawCorrectStr, 10)
    if (studentIdx === targetNum) return true
  }

  // 2. Letter match (A/a -> 0, B/b -> 1, C/c -> 2, D/d -> 3)
  const letterMap = { 'a': 0, 'b': 1, 'c': 2, 'd': 3 }
  if (letterMap[normCorrectStr] !== undefined && studentIdx === letterMap[normCorrectStr]) {
    return true
  }
  const letterMatch = rawCorrectStr.match(/^(?:option|choice)?\s*([a-dA-D])(?:\.|\)|\s|$)/i)
  if (letterMatch) {
    const letterIdx = letterMatch[1].toUpperCase().charCodeAt(0) - 65
    if (studentIdx === letterIdx) return true
  }

  // 3. Option Text match
  if (cleanCorrect && studentOptClean && (studentOptClean === cleanCorrect || cleanCorrect.includes(studentOptClean) || studentOptClean.includes(cleanCorrect))) {
    return true
  }
  if (normCorrectStr && studentOptRaw && (studentOptRaw === normCorrectStr || normCorrectStr.includes(studentOptRaw) || normCorrectStr.includes(studentOptRaw))) {
    return true
  }

  return false
}

async function executeSubmission() {
  if (timerInterval) clearInterval(timerInterval)
  showConfirmModal.value = false
  isSubmitting.value = true

  let totalScore = 0
  const breakdown = {}

  examItems.value.forEach((item) => {
    const studentAns = studentAnswers.value[item.id]
    const isCorrect = evaluateQuestionAnswer(item, studentAns)

    if (isCorrect) totalScore++

    const bloom = item.bloomLevel || item.bloomsLevel || 'Understanding'
    if (!breakdown[bloom]) breakdown[bloom] = { correct: 0, total: 0 }
    breakdown[bloom].total++
    if (isCorrect) breakdown[bloom].correct++
  })

  const total = examItems.value.length
  const percentage = total > 0 ? Math.round((totalScore / total) * 100) : 0
  const durationUsedMin = Math.max(1, Math.round((initialTime - timeRemaining.value) / 60))

  scoreResults.value = {
    score: totalScore,
    total,
    percentage,
    breakdown
  }

  const payload = {
    id: `SUB-${Date.now()}`,
    test_id: courseCodeInput.value,
    passcode: courseCodeInput.value.trim().toUpperCase(),
    cadet_id: cadetId.value,
    cadet_name: studentName.value,
    course_code: courseCodeInput.value,
    program: selectedProgram.value,
    class_level: selectedClassLevel.value,
    year_level: selectedClassLevel.value,
    score: totalScore,
    total_items: total,
    percentage,
    duration_minutes: durationUsedMin,
    breakdown,
    flagged_count: flaggedCount.value,
    alerts_count: flaggedCount.value,
    flagged_questions: Object.keys(flaggedQuestions.value).filter(k => flaggedQuestions.value[k]).map(idx => Number(idx) + 1),
    submitted_at: new Date().toISOString()
  }

  const passcode = courseCodeInput.value.trim().toUpperCase()
  const storageKeys = ['cams_pilot_sessions', 'cams_pilot_schedules', 'cams_schedules']
  
  storageKeys.forEach(key => {
    try {
      const list = JSON.parse(localStorage.getItem(key) || '[]')
      if (Array.isArray(list)) {
        let updated = false
        list.forEach(s => {
          const pass = String(s.access_code || s.passcode || s.code || '').trim().toUpperCase()
          if (pass === passcode || passcode.includes(pass) || pass.includes(passcode)) {
            s.cadets_count = (s.cadets_count || 0) + 1
            s.alerts_count = (s.alerts_count || 0) + flaggedCount.value
            updated = true
          }
        })
        if (updated) localStorage.setItem(key, JSON.stringify(list))
      }
    } catch (_) {}
  })

  try {
    await fetchFromEndpoints('/exam-submissions', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  } catch (err) {
    const localSubs = JSON.parse(
      localStorage.getItem('cams_exam_submissions') || 
      localStorage.getItem('exam_submissions') || 
      '[]'
    )
    localSubs.unshift(payload)
    localStorage.setItem('cams_exam_submissions', JSON.stringify(localSubs))
  } finally {
    clearExamProgress()
    isSubmitting.value = false
    examActive.value = false
    examSubmitted.value = true
  }
}

function handleExit() {
  if (isStaffLoggedIn.value) {
    router.push('/dashboard')
  } else {
    if (authStore.logout) authStore.logout()
    router.push('/login')
  }
}

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col justify-between antialiased">
    
    <header class="bg-[#123524] border-b border-[#0e2a1d] px-4 py-2 flex justify-between items-center text-white shadow-xs">
      <div class="flex items-center gap-2">
        <button 
          @click="handleExit" 
          class="px-3 py-1 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-sm font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
          :title="isStaffLoggedIn ? 'Return to Staff Dashboard' : 'Return to Login View'"
        >
          <ArrowLeft :size="14" />
          <span>{{ isStaffLoggedIn ? 'Exit to Admin Menu' : 'Exit to Login' }}</span>
        </button>
      </div>

      <div v-if="examActive" class="flex items-center gap-1.5 text-xs text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/60 font-medium">
        <Save :size="12" class="animate-pulse text-emerald-400" />
        <span>Auto-Save Enabled</span>
      </div>
    </header>

    <main v-if="!examActive && !examSubmitted" class="flex-1 flex items-center justify-center px-4 pt-2 pb-3">
      <div class="max-w-md w-full bg-white border border-slate-200 rounded-xl px-6 pt-3 pb-5 shadow-lg space-y-4 text-center">
        
        <div class="flex flex-col items-center justify-center space-y-2">
          <div class="w-full flex items-center justify-center">
            <img 
              :src="logoUrl" 
              alt="CAMS - Comprehensive Assessment Management System" 
              class="max-w-full h-30 object-contain mx-auto" 
            />
          </div>

          <div>
            <h2 class="text-xl font-extrabold text-slate-900 tracking-tight">Cadet Examination Portal</h2>
            <p class="text-sm text-slate-500 mt-0.5">Enter student details and pilot test passcode to start.</p>
          </div>
        </div>

        <div v-if="duplicateWarning" class="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-left text-xs text-rose-900 space-y-1.5 animate-fade-in">
          <div class="flex items-center gap-2 font-bold text-rose-800 text-sm">
            <ShieldAlert :size="18" class="text-rose-600 shrink-0" />
            <span>Pilot Session Retake Blocked</span>
          </div>
          <p class="leading-relaxed">
            Student Number <strong class="font-mono text-slate-900">{{ cadetId }}</strong> has already completed and submitted an examination for access code
            <strong class="font-mono text-slate-900 uppercase">{{ courseCodeInput }}</strong> on 
            <strong>{{ new Date(duplicateWarning.submitted_at || Date.now()).toLocaleDateString() }}</strong>.
          </p>
          <p class="font-bold text-rose-700">• Multiple retakes for the same pilot session passcode are prohibited.</p>
        </div>

        <div class="space-y-3.5 text-left">
          <div>
            <label class="text-[12px] font-bold text-slate-700 block mb-1">Student Number</label>
            <div class="relative">
              <User :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                v-model="cadetId" 
                placeholder="e.g. 26000" 
                class="w-full text-sm pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-slate-900" 
              />
            </div>
          </div>

          <div>
            <label class="text-[12px] font-bold text-slate-700 block mb-1">Student Full Name</label>
            <div class="relative">
              <User :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                v-model="studentName" 
                placeholder="e.g. Juan Dela Cruz" 
                class="w-full text-sm pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900" 
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="text-[12px] font-bold text-slate-700 block mb-1">Program</label>
              <div class="relative">
                <GraduationCap :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select 
                  v-model="selectedProgram"
                  class="w-full text-sm pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 cursor-pointer"
                >
                  <option value="" disabled>Select Program</option>
                  <option value="BSMT">BSMT</option>
                  <option value="BSMarE">BSMarE</option>
                </select>
              </div>
            </div>

            <div>
              <label class="text-[12px] font-bold text-slate-700 block mb-1">Class Level</label>
              <div class="relative">
                <Award :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select 
                  v-model="selectedClassLevel"
                  class="w-full text-sm pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 cursor-pointer"
                >
                  <option value="" disabled>Select Class</option>
                  <option value="4th Class">4th Class</option>
                  <option value="3rd Class">3rd Class</option>
                  <option value="2nd Class">2nd Class</option>
                  <option value="1st Class">1st Class</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label class="text-[12px] font-bold text-slate-700 block mb-1">Access Passcode</label>
            <div class="relative">
              <Key :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                v-model="courseCodeInput" 
                placeholder="e.g. BMA-2026" 
                class="w-full text-sm pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none" 
              />
            </div>
          </div>

          <button 
            @click="startExam" 
            class="w-full py-3 bg-[#123524] hover:bg-[#0e2a1d] text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 mt-1"
          >
            <span>Begin Examination</span> 
            <Send :size="16" />
          </button>
        </div>
      </div>
    </main>

    <main v-if="examActive" class="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-3 space-y-3">
      
      <div v-if="resumedNotice" class="bg-emerald-50 border border-emerald-200 text-emerald-950 p-3 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs">
        <div class="flex items-center gap-2">
          <RotateCcw :size="16" class="text-emerald-700 shrink-0" />
          <span>In-Progress Exam Resumed! Your previously answered questions and remaining time have been automatically restored.</span>
        </div>
        <button @click="resumedNotice = false" class="text-emerald-700 hover:text-emerald-900 font-extrabold cursor-pointer">✕</button>
      </div>

      <div class="bg-[#123524] text-white rounded-xl p-3 shadow-sm flex justify-between items-center sticky top-2 z-10 border border-emerald-800">
        <div>
          <h2 class="text-sm font-bold text-white tracking-tight">{{ studentName }} <span class="text-sm font-normal text-slate-200">({{ cadetId }})</span></h2>
          <span class="text-[11px] text-emerald-400 font-mono font-bold">{{ selectedProgram }} - {{ selectedClassLevel }} | {{ courseCodeInput }}</span>
        </div>

        <div class="flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-xl text-emerald-400 font-mono text-md font-bold">
          <Timer :size="20" class="animate-pulse text-emerald-400" />
          <span>{{ formattedTime }}</span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 sm:gap-2 gap-1">
        <div class="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-6 min-h-100">
          <div class="space-y-4">
            <div class="flex justify-between items-center pb-3 border-b border-slate-100">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-3 py-1 rounded-lg">
                  Question {{ currentQuestionIndex + 1 }} of {{ examItems.length }}
                </span>
                <span class="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2.5 py-1 rounded-lg">
                  {{ currentQuestion.co }}
                </span>
                <span class="text-xs font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200/80 px-2.5 py-1 rounded-lg">
                  {{ currentQuestion.lo }}
                </span>
              </div>

              <button 
                @click="toggleFlag(currentQuestionIndex)"
                :class="[
                  'text-xs font-semibold px-3 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer',
                  flaggedQuestions[currentQuestionIndex] 
                    ? 'bg-amber-100 text-amber-800 border border-amber-300 font-bold' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                ]"
              >
                <AlertCircle :size="14" />
                {{ flaggedQuestions[currentQuestionIndex] ? 'Flagged for Review' : 'Flag Question' }}
              </button>
            </div>

            <p class="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
              {{ currentQuestion.text }}
            </p>

            <div v-if="currentQuestion.image_url" class="my-2">
              <img :src="currentQuestion.image_url" alt="Question Diagram" class="max-h-72 rounded-xl border border-slate-200 object-contain mx-auto shadow-xs" />
            </div>

            <div v-if="currentQuestion.type === 'multiple_choice' && currentQuestion.options && currentQuestion.options.length > 0" class="space-y-2.5 pt-2">
              <button
                v-for="(opt, optIdx) in currentQuestion.options"
                :key="optIdx"
                @click="setStudentAnswer(currentQuestion.id, optIdx)"
                :class="[
                  'w-full text-left p-4 rounded-xl border text-sm sm:text-base font-medium transition-all flex items-center justify-between cursor-pointer',
                  studentAnswers[currentQuestion.id] === optIdx
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white hover:bg-slate-50'
                ]"
              >
                <span><strong>{{ String.fromCharCode(65 + optIdx) }}.</strong> {{ typeof opt === 'string' ? opt : opt.text }}</span>
                <span v-if="studentAnswers[currentQuestion.id] === optIdx" class="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs shrink-0 ml-2">✓</span>
              </button>
            </div>

            <div v-else-if="currentQuestion.type === 'true_false'" class="flex gap-4 pt-2">
              <button
                @click="setStudentAnswer(currentQuestion.id, 0)"
                :class="[
                  'flex-1 p-4 rounded-xl border text-sm sm:text-base font-bold transition-all text-center cursor-pointer',
                  studentAnswers[currentQuestion.id] === 0 ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-xs' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                ]"
              >
                True
              </button>
              <button
                @click="setStudentAnswer(currentQuestion.id, 1)"
                :class="[
                  'flex-1 p-4 rounded-xl border text-sm sm:text-base font-bold transition-all text-center cursor-pointer',
                  studentAnswers[currentQuestion.id] === 1 ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-xs' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                ]"
              >
                False
              </button>
            </div>

            <div v-else class="space-y-2 pt-2">
              <div class="flex items-center gap-1.5 text-sm text-slate-500 font-medium mb-1">
                <Edit3 :size="14" /> Type your written answer below:
              </div>
              <textarea
                v-model="studentAnswers[currentQuestion.id]"
                @input="saveExamProgress"
                rows="5"
                placeholder="Provide a detailed explanation or answer..."
                class="w-full p-3.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm sm:text-base text-slate-800 outline-none transition-all bg-slate-50 focus:bg-white"
              ></textarea>
            </div>
          </div>

          <div class="flex justify-between items-center pt-4 border-t border-slate-100">
            <button 
              @click="prevQuestion"
              :disabled="currentQuestionIndex === 0"
              class="flex items-center gap-1 px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-xl disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
            >
              <ChevronLeft :size="16" /> Previous
            </button>

            <button 
              v-if="currentQuestionIndex < examItems.length - 1"
              @click="nextQuestion"
              class="flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl cursor-pointer shadow-xs"
            >
              Next <ChevronRight :size="16" />
            </button>
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2 h-fit">
          <div>
            <h3 class="text-sm font-bold text-slate-900">Question Palette</h3>
            <p class="text-xs text-slate-500">Quickly jump to any question item.</p>
          </div>

          <div class="grid grid-cols-5 gap-1">
            <button
              v-for="(q, idx) in examItems"
              :key="q.id"
              @click="goToQuestion(idx)"
              :class="[
                'h-8 rounded-lg text-xs font-semibold border flex items-center justify-center relative transition-all cursor-pointer',
                currentQuestionIndex === idx ? 'ring-2 ring-emerald-500 ring-offset-0.5 font-extrabold' : '',
                studentAnswers[q.id] !== undefined && studentAnswers[q.id] !== '' ? 'bg-emerald-100 border-emerald-300 text-emerald-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              ]"
            >
              {{ idx + 1 }}
              <span v-if="flaggedQuestions[idx]" class="w-2 h-2 bg-amber-500 rounded-full absolute top-1 right-1"></span>
            </button>
          </div>

          <div class="border-t border-slate-100 pt-4 space-y-2 text-xs text-slate-600">
            <div class="flex justify-between">
              <span>Answered:</span>
              <span class="font-bold text-slate-900">{{ answeredCount }} / {{ examItems.length }}</span>
            </div>
            <div class="flex justify-between">
              <span>Flagged:</span>
              <span class="font-bold text-amber-600">{{ flaggedCount }}</span>
            </div>
          </div>

          <button 
            @click="promptSubmission"
            class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Finalize & Submit
          </button>
        </div>
      </div>
    </main>

    <div v-if="showConfirmModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-4 text-center border border-slate-200">
        <div class="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
          <AlertTriangle :size="24" />
        </div>

        <div>
          <h3 class="text-base font-bold text-slate-900">Confirm Exam Submission</h3>
          <p class="text-sm text-slate-500 mt-1">Are you sure you want to submit your examination paper now?</p>
        </div>

        <div v-if="unansweredCount > 0 || flaggedCount > 0" class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-left text-sm text-amber-900 space-y-1">
          <p v-if="unansweredCount > 0" class="font-semibold">• {{ unansweredCount }} question(s) left unanswered.</p>
          <p v-if="flaggedCount > 0" class="font-semibold">• {{ flaggedCount }} question(s) currently flagged.</p>
        </div>

        <div class="flex gap-2 pt-2">
          <button @click="showConfirmModal = false" class="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl cursor-pointer">
            Return to Exam
          </button>
          <button @click="executeSubmission" class="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs cursor-pointer">
            Yes, Submit
          </button>
        </div>
      </div>
    </div>

    <main v-if="examSubmitted" class="flex-1 flex items-center justify-center p-4">
      <div class="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl max-w-md w-full text-center space-y-6">
        <div :class="['w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-white font-bold text-xl shadow-xs', scoreResults.percentage >= 75 ? 'bg-emerald-600' : 'bg-rose-600']">
          {{ scoreResults.percentage }}%
        </div>
        
        <div>
          <h2 class="text-xl font-bold text-slate-900">
            {{ scoreResults.percentage >= 75 ? 'Assessment Passed' : 'Assessment Completed' }}
          </h2>
          <p class="text-sm text-slate-500 mt-1">
            Candidate: <strong class="text-slate-800">{{ studentName }}</strong> ({{ selectedProgram }} - {{ selectedClassLevel }})
          </p>
          <p class="text-sm text-slate-500 mt-0.5">
            Score: <strong class="text-slate-800">{{ scoreResults.score }} / {{ scoreResults.total }}</strong>
          </p>
        </div>

        <div class="border-t border-slate-100 pt-4 space-y-3 text-left">
          <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider">STCW Bloom's Cognitive Competency Breakdown</h3>
          <div v-for="(data, bloom) in scoreResults.breakdown" :key="bloom" class="space-y-1">
            <div class="flex justify-between text-sm font-semibold text-slate-700">
              <span>{{ bloom }}</span>
              <span>{{ data.correct }} / {{ data.total }} ({{ Math.round((data.correct / data.total) * 100) }}%)</span>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div class="bg-emerald-500 h-2 rounded-full" :style="{ width: `${(data.correct / data.total) * 100}%` }"></div>
            </div>
          </div>
        </div>

        <button @click="handleExit" class="w-full py-3 bg-[#123524] hover:bg-[#0e2a1d] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs">
          <LogOut :size="16" /> {{ isStaffLoggedIn ? 'Return to Staff Dashboard' : 'Return to Login Screen' }}
        </button>
      </div>
    </main>

    <footer class="bg-white border-t border-slate-200 py-3 text-center text-[12px] text-slate-500 font-mono">
      BALIWAG MARITIME ACADEMY, INC.
    </footer>

  </div>
</template>