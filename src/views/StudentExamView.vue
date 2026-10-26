<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
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
  Award
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

// Dynamically resolve the logo path from the public directory
const baseUrl = import.meta.env.BASE_URL || '/'
const logoUrl = `${baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'}cams-logo.png`

// Determine if logged in with an official Staff/Faculty Account (Admin, Officer, Instructor)
const isStaffLoggedIn = computed(() => {
  const token = authStore.token || localStorage.getItem('cams_token') || localStorage.getItem('token')
  const user = authStore.user || JSON.parse(localStorage.getItem('cams_user') || 'null')
  const role = user?.role || localStorage.getItem('cams_user_role')

  if (!token || !user) return false
  
  // Return true only if user is an authenticated Staff/Faculty account
  return role === 'Admin' || role === 'Assessment Officer' || role === 'Instructor'
})

const examActive = ref(false)
const examSubmitted = ref(false)
const isSubmitting = ref(false)
const showConfirmModal = ref(false)

// Candidate Form Inputs
const courseCodeInput = ref('')
const studentName = ref('')
const cadetId = ref('')
const selectedProgram = ref('')
const selectedClassLevel = ref('')
const coursesList = ref([])
const totalItemsInput = ref(10)

const examItems = ref([])
const currentQuestionIndex = ref(0)
const studentAnswers = ref({})
const flaggedQuestions = ref({})

// Timer Configuration (60 mins = 3600 seconds)
const initialTime = 3600
const timeRemaining = ref(initialTime)
let timerInterval = null

const scoreResults = ref({ score: 0, total: 0, percentage: 0, breakdown: {} })

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
  } catch (e) {
    // Silently fall through to local fallback
  }
  throw new Error('Backend endpoint unreachable')
}

onMounted(async () => {
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

function normalizeExamItem(q, idx, fallbackCode = '') {
  let options = q.options || []
  if (typeof options === 'string') {
    try { options = JSON.parse(options) } catch (e) { options = [] }
  }

  return {
    id: q.id || idx + 1,
    code: q.code || `${fallbackCode || 'ITEM'}-Q${idx + 1}`,
    text: q.text || q.question_text || '',
    type: q.type || (options.length > 0 ? 'multiple_choice' : 'short_answer'),
    image_url: q.image_url || q.imageUrl || '',
    options: options.map(opt => typeof opt === 'string' ? opt : (opt.text || '')),
    correctAnswer: q.correct_answer ?? q.correctAnswer ?? 0,
    bloomLevel: q.bloom_level || q.bloomLevel || 'Understanding'
  }
}

function loadActiveScheduleQuestions(passcode) {
  const code = passcode.trim().toLowerCase()
  
  const pilotSchedules = JSON.parse(
    localStorage.getItem('cams_pilot_schedules') || 
    localStorage.getItem('cams_schedules') || 
    '[]'
  )
  
  const activeSchedule = pilotSchedules.find(s => {
    const sPass = String(s.passcode || s.code || s.courseCode || s.courseId || '').toLowerCase()
    const isActive = s.status ? String(s.status).toLowerCase() === 'active' : true
    return (sPass === code || code.includes(sPass)) && isActive
  })

  const localBank = JSON.parse(
    localStorage.getItem('cams_questions_data') || 
    localStorage.getItem('cams_questions') || 
    '[]'
  )
  
  let matched = localBank.filter(q => {
    const courseCode = String(q.courseId || q.course_id || q.courseCode || q.code || '').toLowerCase()
    const matchesPasscode = courseCode.includes(code) || code.includes(courseCode)
    const isApproved = !q.status || q.status === 'Approved' || q.status === 'Pending'
    return matchesPasscode && isApproved
  })

  if (matched.length === 0 && activeSchedule && Array.isArray(activeSchedule.questions)) {
    matched = activeSchedule.questions
  }

  return matched.map((q, idx) => normalizeExamItem(q, idx, passcode))
}

async function startExam() {
  if (!cadetId.value.trim() || !studentName.value.trim() || !courseCodeInput.value.trim() || !selectedProgram.value || !selectedClassLevel.value) {
    alert('Please complete all student details, including Course, Class Level, and Access Passcode.')
    return
  }

  const passcode = courseCodeInput.value.trim()

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
    } else {
      examItems.value = loadActiveScheduleQuestions(passcode)
    }
  } catch (err) {
    examItems.value = loadActiveScheduleQuestions(passcode)
  }

  if (examItems.value.length > 0) {
    examActive.value = true
    startTimer()
  } else {
    alert(`No active pilot test schedule or assessment questions found for passcode "${passcode}". Please verify your passcode with your test proctor.`)
  }
}

function startTimer() {
  timerInterval = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--
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

function toggleFlag(index) {
  flaggedQuestions.value[index] = !flaggedQuestions.value[index]
}

function promptSubmission() {
  showConfirmModal.value = true
}

function evaluateQuestionAnswer(item, studentAns) {
  if (studentAns === undefined || studentAns === null || String(studentAns).trim() === '') {
    return false
  }

  const rawCorrect = item.correctAnswer
  if (rawCorrect === undefined || rawCorrect === null) return false

  if (['short_answer', 'essay', 'open_ended'].includes(item.type) || !item.options || item.options.length === 0) {
    const text = String(studentAns).trim().toLowerCase()
    return text.length > 3
  }

  const options = item.options || []
  const studentIdx = Number(studentAns)
  const studentOptText = options[studentIdx] 
    ? (typeof options[studentIdx] === 'object' ? options[studentIdx].text : options[studentIdx]) 
    : String(studentAns)

  const letterMap = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'a': 0, 'b': 1, 'c': 2, 'd': 3 }

  if (typeof rawCorrect === 'string' && letterMap[rawCorrect.trim()] !== undefined) {
    if (studentIdx === letterMap[rawCorrect.trim()]) return true
  }

  if (!isNaN(Number(rawCorrect))) {
    const num = Number(rawCorrect)
    if (studentIdx === num || studentIdx === (num - 1)) return true
  }

  const correctStr = String(rawCorrect).trim().toLowerCase()
  const studentStr = String(studentOptText).trim().toLowerCase()
  if (correctStr === studentStr) return true

  const studentLetter = String.fromCharCode(65 + studentIdx).toLowerCase()
  if (studentLetter === correctStr) return true

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
    submitted_at: new Date().toISOString()
  }

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
    
    <!-- Top Bar Navigation Header -->
    <header class="bg-[#123524] border-b border-[#0e2a1d] px-6 py-3 flex justify-between items-center text-white shadow-xs">
      <div class="flex items-center gap-4">
        <!-- Direct Exit Button -->
        <button 
          @click="handleExit" 
          class="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-sm font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
          :title="isStaffLoggedIn ? 'Return to Staff Dashboard' : 'Return to Login View'"
        >
          <ArrowLeft :size="16" />
          <span>{{ isStaffLoggedIn ? 'Exit to Admin Menu' : 'Exit to Login' }}</span>
        </button>
      </div>
    </header>

    <!-- ENTRANCE PORTAL CARD -->
    <main v-if="!examActive && !examSubmitted" class="flex-1 flex items-center justify-center px-4 pt-2 pb-3">
      <div class="max-w-md w-full bg-white border border-slate-200 rounded-3xl px-6 pt-3 pb-5 shadow-xl space-y-4 text-center">
        
        <!-- Logo & Title Section -->
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

          <!-- PROGRAM & CLASS LEVEL SELECTION GRID -->
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

    <!-- ACTIVE TEST VIEW -->
    <main v-if="examActive" class="flex-1 max-w-5xl w-full mx-auto p-6 space-y-6">
      <div class="bg-[#123524] text-white rounded-2xl p-4 shadow-md flex justify-between items-center sticky top-4 z-20 border border-emerald-800">
        <div>
          <h2 class="text-sm font-bold text-white tracking-tight">{{ studentName }} <span class="text-sm font-normal text-slate-200">({{ cadetId }})</span></h2>
          <span class="text-[11px] text-emerald-400 font-mono font-bold">{{ selectedProgram }} - {{ selectedClassLevel }} | {{ courseCodeInput }}</span>
        </div>

        <div class="flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-xl text-emerald-400 font-mono text-sm font-bold">
          <Timer :size="18" class="animate-pulse text-emerald-400" />
          <span>{{ formattedTime }}</span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-6 min-h-95">
          <div class="space-y-4">
            <div class="flex justify-between items-center pb-3 border-b border-slate-100">
              <span class="text-sm font-mono font-bold bg-slate-100 text-slate-800 px-3 py-1 rounded-lg">
                Question {{ currentQuestionIndex + 1 }} of {{ examItems.length }}
              </span>

              <button 
                @click="toggleFlag(currentQuestionIndex)"
                :class="[
                  'text-sm font-semibold px-3 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer',
                  flaggedQuestions[currentQuestionIndex] 
                    ? 'bg-amber-100 text-amber-800 border border-amber-300 font-bold' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                ]"
              >
                <AlertCircle :size="14" />
                {{ flaggedQuestions[currentQuestionIndex] ? 'Flagged for Review' : 'Flag Question' }}
              </button>
            </div>

            <p class="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
              {{ currentQuestion.text }}
            </p>

            <div v-if="currentQuestion.image_url" class="my-3">
              <img :src="currentQuestion.image_url" alt="Question Diagram" class="max-h-60 rounded-xl border border-slate-200 object-contain mx-auto shadow-xs" />
            </div>

            <div v-if="currentQuestion.type === 'multiple_choice' && currentQuestion.options && currentQuestion.options.length > 0" class="space-y-2.5 pt-2">
              <button
                v-for="(opt, optIdx) in currentQuestion.options"
                :key="optIdx"
                @click="studentAnswers[currentQuestion.id] = optIdx"
                :class="[
                  'w-full text-left p-3.5 rounded-xl border text-sm sm:text-sm font-medium transition-all flex items-center justify-between cursor-pointer',
                  studentAnswers[currentQuestion.id] === optIdx
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white hover:bg-slate-50'
                ]"
              >
                <span>{{ String.fromCharCode(65 + optIdx) }}. {{ typeof opt === 'string' ? opt : opt.text }}</span>
                <span v-if="studentAnswers[currentQuestion.id] === optIdx" class="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm shrink-0 ml-2">✓</span>
              </button>
            </div>

            <div v-else-if="currentQuestion.type === 'true_false'" class="flex gap-4 pt-2">
              <button
                @click="studentAnswers[currentQuestion.id] = 0"
                :class="[
                  'flex-1 p-4 rounded-xl border text-sm font-bold transition-all text-center cursor-pointer',
                  studentAnswers[currentQuestion.id] === 0 ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-xs' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                ]"
              >
                True
              </button>
              <button
                @click="studentAnswers[currentQuestion.id] = 1"
                :class="[
                  'flex-1 p-4 rounded-xl border text-sm font-bold transition-all text-center cursor-pointer',
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
                rows="4"
                placeholder="Provide a detailed explanation or answer..."
                class="w-full p-3.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm sm:text-sm text-slate-800 outline-none transition-all bg-slate-50 focus:bg-white"
              ></textarea>
            </div>
          </div>

          <div class="flex justify-between items-center pt-4 border-t border-slate-100">
            <button 
              @click="currentQuestionIndex--"
              :disabled="currentQuestionIndex === 0"
              class="flex items-center gap-1 px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-xl disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
            >
              <ChevronLeft :size="16" /> Previous
            </button>

            <button 
              v-if="currentQuestionIndex < examItems.length - 1"
              @click="currentQuestionIndex++"
              class="flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl cursor-pointer shadow-xs"
            >
              Next <ChevronRight :size="16" />
            </button>

            <button 
              v-else
              @click="promptSubmission"
              class="flex items-center gap-1 px-5 py-2 bg-[#123524] hover:bg-[#0e2a1d] text-white text-sm font-bold rounded-xl shadow-xs cursor-pointer"
            >
              Submit Exam
            </button>
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
          <div>
            <h3 class="text-sm font-bold text-slate-900">Question Palette</h3>
            <p class="text-sm text-slate-500">Quickly jump to any question item.</p>
          </div>

          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="(q, idx) in examItems"
              :key="q.id"
              @click="currentQuestionIndex = idx"
              :class="[
                'h-10 rounded-xl text-sm font-bold border flex items-center justify-center relative transition-all cursor-pointer',
                currentQuestionIndex === idx ? 'ring-2 ring-emerald-500 ring-offset-1' : '',
                studentAnswers[q.id] !== undefined && studentAnswers[q.id] !== '' ? 'bg-emerald-100 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-600'
              ]"
            >
              {{ idx + 1 }}
              <span v-if="flaggedQuestions[idx]" class="w-2 h-2 bg-amber-500 rounded-full absolute top-1 right-1"></span>
            </button>
          </div>

          <div class="border-t border-slate-100 pt-4 space-y-2 text-sm text-slate-600">
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
            class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Finalize & Submit
          </button>
        </div>
      </div>
    </main>

    <!-- CONFIRMATION MODAL -->
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

    <!-- SCOREBOARD VIEW -->
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

    <!-- Footer -->
    <footer class="bg-white border-t border-slate-200 py-3 text-center text-[12px] text-slate-500 font-mono">
      BALIWAG MARITIME ACADEMY, INC.
    </footer>

  </div>
</template>