<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { 
  Timer, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle, 
  Award, 
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  HelpCircle
} from 'lucide-vue-next'

const examActive = ref(false)
const examSubmitted = ref(false)
const isSubmitting = ref(false)
const showConfirmModal = ref(false)

// Student & Exam Metadata
const courseCodeInput = ref('NAV-101')
const studentName = ref('Cadet Alex Vance')
const cadetId = ref('CDT-2026-0814')
const totalItemsInput = ref(10)

const examItems = ref([])
const currentQuestionIndex = ref(0)
const studentAnswers = ref({})
const flaggedQuestions = ref({})

// Timer Configuration (Default 60 mins = 3600 seconds)
const initialTime = 3600
const timeRemaining = ref(initialTime)
let timerInterval = null

const scoreResults = ref({ score: 0, total: 0, percentage: 0, breakdown: {} })

function startExam() {
  if (!studentName.value.trim() || !courseCodeInput.value.trim()) {
    alert('Please provide your full name and assessment code.')
    return
  }

  fetch('http://127.0.0.1:8080/api/exams/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      courseId: courseCodeInput.value, 
      totalItems: totalItemsInput.value 
    })
  })
    .then(r => r.json())
    .then(data => {
      if (data.success && data.exam && data.exam.length > 0) {
        examItems.value = data.exam
        examActive.value = true
        startTimer()
      } else {
        alert('No questions available for the specified course assessment code.')
      }
    })
    .catch(err => {
      console.error('Failed to load exam:', err)
      alert('Unable to connect to exam server (Port 8080).')
    })
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
const answeredCount = computed(() => Object.keys(studentAnswers.value).length)
const unansweredCount = computed(() => examItems.value.length - answeredCount.value)
const flaggedCount = computed(() => Object.keys(flaggedQuestions.value).filter(k => flaggedQuestions.value[k]).length)

function toggleFlag(index) {
  flaggedQuestions.value[index] = !flaggedQuestions.value[index]
}

function promptSubmission() {
  showConfirmModal.value = true
}

async function executeSubmission() {
  if (timerInterval) clearInterval(timerInterval)
  showConfirmModal.value = false
  isSubmitting.value = true

  let totalScore = 0
  const breakdown = {}

  examItems.value.forEach((item) => {
    const studentAns = studentAnswers.value[item.id]
    let isCorrect = false

    if (item.type === 'multiple_choice' || !item.type) {
      isCorrect = Array.isArray(item.correctAnswer) 
        ? item.correctAnswer.includes(studentAns) 
        : Number(studentAns) === Number(item.correctAnswer) || String(studentAns) === String(item.correctAnswer)
    } else if (item.type === 'true_false') {
      isCorrect = Number(studentAns) === Number(item.correctAnswer) || String(studentAns).toLowerCase() === String(item.correctAnswer).toLowerCase()
    }

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

  // Persist submission record to Laravel Backend for Stage 2 Institutional Reports
  const payload = {
    cadet_id: cadetId.value,
    cadet_name: studentName.value,
    course_code: courseCodeInput.value,
    score: totalScore,
    total_items: total,
    duration_minutes: durationUsedMin,
    breakdown,
    submitted_at: new Date().toISOString()
  }

  try {
    await fetch('http://127.0.0.1:8080/api/exam-submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  } catch (err) {
    console.warn('Backend submission sync failed. Local score generated.', err)
  } finally {
    isSubmitting.value = false
    examActive.value = false
    examSubmitted.value = true
  }
}

function resetPortal() {
  examActive.value = false
  examSubmitted.value = false
  currentQuestionIndex.value = 0
  studentAnswers.value = {}
  flaggedQuestions.value = {}
  timeRemaining.value = initialTime
}

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto space-y-6 font-sans">
    
    <!-- ENTRANCE PORTAL -->
    <div v-if="!examActive && !examSubmitted" class="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs space-y-6 max-w-md mx-auto text-center">
      <div class="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
        <Award :size="28" />
      </div>
      
      <div>
        <h2 class="text-xl font-bold text-slate-900">Cadet Assessment Portal</h2>
        <p class="text-xs text-slate-500 mt-1">Enter student identification and assessment code to start.</p>
      </div>

      <div class="space-y-4 text-left">
        <div>
          <label class="text-[11px] font-bold text-slate-700 block mb-1">Cadet ID / Student Number</label>
          <input v-model="cadetId" class="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-mono" />
        </div>

        <div>
          <label class="text-[11px] font-bold text-slate-700 block mb-1">Student Full Name</label>
          <input v-model="studentName" class="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>

        <div>
          <label class="text-[11px] font-bold text-slate-700 block mb-1">Assessment / Course Code</label>
          <input v-model="courseCodeInput" class="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>

        <button 
          @click="startExam" 
          class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          Begin Examination <Send :size="14" />
        </button>
      </div>
    </div>

    <!-- ACTIVE TEST VIEW -->
    <div v-if="examActive" class="space-y-6">
      
      <!-- Top Sticky Timer & Student Bar -->
      <div class="bg-slate-900 text-white rounded-2xl p-4 shadow-md flex justify-between items-center sticky top-4 z-20">
        <div>
          <h2 class="text-sm font-bold text-white">{{ studentName }} <span class="text-xs font-normal text-slate-400">({{ cadetId }})</span></h2>
          <span class="text-[11px] text-emerald-400 font-mono font-bold">{{ courseCodeInput }} Examination Paper</span>
        </div>

        <div class="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 text-emerald-400 font-mono text-sm font-bold">
          <Timer :size="18" class="animate-pulse text-emerald-400" />
          <span>{{ formattedTime }}</span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Main Item Container -->
        <div class="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div class="space-y-4">
            
            <div class="flex justify-between items-center pb-3 border-b border-slate-100">
              <span class="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-lg">
                Question {{ currentQuestionIndex + 1 }} of {{ examItems.length }}
              </span>

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

            <p class="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
              {{ currentQuestion.text }}
            </p>

            <!-- Optional Question Diagram / Image -->
            <div v-if="currentQuestion.image_url" class="my-3">
              <img :src="currentQuestion.image_url" alt="Question Diagram" class="max-h-60 rounded-xl border border-slate-200 object-contain mx-auto" />
            </div>

            <!-- Multiple Choice Options -->
            <div v-if="currentQuestion.type === 'multiple_choice' || !currentQuestion.type" class="space-y-2.5 pt-2">
              <button
                v-for="(opt, optIdx) in currentQuestion.options"
                :key="optIdx"
                @click="studentAnswers[currentQuestion.id] = optIdx"
                :class="[
                  'w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between cursor-pointer',
                  studentAnswers[currentQuestion.id] === optIdx
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                ]"
              >
                <span>{{ String.fromCharCode(65 + optIdx) }}. {{ typeof opt === 'string' ? opt : opt.text }}</span>
                <span v-if="studentAnswers[currentQuestion.id] === optIdx" class="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs shrink-0 ml-2">✓</span>
              </button>
            </div>

            <!-- True / False Options -->
            <div v-else-if="currentQuestion.type === 'true_false'" class="flex gap-4 pt-2">
              <button
                @click="studentAnswers[currentQuestion.id] = 0"
                :class="[
                  'flex-1 p-4 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer',
                  studentAnswers[currentQuestion.id] === 0 ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-xs' : 'border-slate-200 bg-white text-slate-700'
                ]"
              >
                True
              </button>
              <button
                @click="studentAnswers[currentQuestion.id] = 1"
                :class="[
                  'flex-1 p-4 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer',
                  studentAnswers[currentQuestion.id] === 1 ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-xs' : 'border-slate-200 bg-white text-slate-700'
                ]"
              >
                False
              </button>
            </div>
          </div>

          <!-- Pagination Controls -->
          <div class="flex justify-between items-center pt-4 border-t border-slate-100">
            <button 
              @click="currentQuestionIndex--"
              :disabled="currentQuestionIndex === 0"
              class="flex items-center gap-1 px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
            >
              <ChevronLeft :size="16" /> Previous
            </button>

            <button 
              v-if="currentQuestionIndex < examItems.length - 1"
              @click="currentQuestionIndex++"
              class="flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
            >
              Next <ChevronRight :size="16" />
            </button>

            <button 
              v-else
              @click="promptSubmission"
              class="flex items-center gap-1 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
            >
              Submit Exam
            </button>
          </div>
        </div>

        <!-- Palette Navigation Sidebar -->
        <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
          <div>
            <h3 class="text-sm font-bold text-slate-900">Question Palette</h3>
            <p class="text-xs text-slate-500">Quickly jump to any question item.</p>
          </div>

          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="(q, idx) in examItems"
              :key="q.id"
              @click="currentQuestionIndex = idx"
              :class="[
                'h-10 rounded-xl text-xs font-bold border flex items-center justify-center relative transition-all cursor-pointer',
                currentQuestionIndex === idx ? 'ring-2 ring-emerald-500 ring-offset-1' : '',
                studentAnswers[q.id] !== undefined ? 'bg-emerald-100 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-600'
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
            class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Finalize & Submit
          </button>
        </div>
      </div>
    </div>

    <!-- PRE-SUBMISSION CONFIRMATION MODAL -->
    <div v-if="showConfirmModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4 text-center border border-slate-200">
        <div class="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle :size="24" />
        </div>

        <div>
          <h3 class="text-base font-bold text-slate-900">Confirm Exam Submission</h3>
          <p class="text-xs text-slate-500 mt-1">
            Are you sure you want to submit your examination paper now?
          </p>
        </div>

        <div v-if="unansweredCount > 0 || flaggedCount > 0" class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-left text-xs text-amber-900 space-y-1">
          <p v-if="unansweredCount > 0" class="font-semibold">• {{ unansweredCount }} question(s) left unanswered.</p>
          <p v-if="flaggedCount > 0" class="font-semibold">• {{ flaggedCount }} question(s) currently flagged.</p>
        </div>

        <div class="flex gap-2 pt-2">
          <button @click="showConfirmModal = false" class="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer">
            Return to Exam
          </button>
          <button @click="executeSubmission" class="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer">
            Yes, Submit
          </button>
        </div>
      </div>
    </div>

    <!-- SCOREBOARD VIEW -->
    <div v-if="examSubmitted" class="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs max-w-xl mx-auto space-y-6">
      <div class="text-center space-y-2">
        <div :class="['w-16 h-16 rounded-full flex items-center justify-center mx-auto text-white font-bold text-xl shadow-xs', scoreResults.percentage >= 75 ? 'bg-emerald-600' : 'bg-red-600']">
          {{ scoreResults.percentage }}%
        </div>
        
        <h2 class="text-xl font-bold text-slate-900">
          {{ scoreResults.percentage >= 75 ? 'Assessment Passed' : 'Assessment Failed' }}
        </h2>
        
        <p class="text-xs text-slate-500">
          Candidate: <strong class="text-slate-800">{{ studentName }}</strong> | Score: <strong class="text-slate-800">{{ scoreResults.score }} / {{ scoreResults.total }}</strong>
        </p>
      </div>

      <div class="border-t border-slate-100 pt-4 space-y-3">
        <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">STCW Bloom's Cognitive Competency Breakdown</h3>
        <div v-for="(data, bloom) in scoreResults.breakdown" :key="bloom" class="space-y-1">
          <div class="flex justify-between text-xs font-semibold text-slate-700">
            <span>{{ bloom }}</span>
            <span>{{ data.correct }} / {{ data.total }} ({{ Math.round((data.correct / data.total) * 100) }}%)</span>
          </div>
          <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div class="bg-emerald-500 h-2 rounded-full" :style="{ width: `${(data.correct / data.total) * 100}%` }"></div>
          </div>
        </div>
      </div>

      <button @click="resetPortal" class="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs">
        <RotateCcw :size="16" /> Return to Assessment Portal
      </button>
    </div>

  </div>
</template>