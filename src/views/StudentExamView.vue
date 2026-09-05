<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { 
  Timer, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle, 
  Award, 
  RotateCcw
} from 'lucide-vue-next'

const examActive = ref(false)
const examSubmitted = ref(false)
const courseCodeInput = ref('NAV-101')
const studentName = ref('Student Alex Vance')
const examItems = ref([])
const currentQuestionIndex = ref(0)

const studentAnswers = ref({})
const flaggedQuestions = ref({})

const timeRemaining = ref(3600) // 60 minutes
let timerInterval = null

const scoreResults = ref({ score: 0, total: 0, percentage: 0, breakdown: {} })

function startExam() {
  fetch('http://localhost:3001/api/exams/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ courseId: courseCodeInput.value, totalItems: 10 })
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
      alert('Unable to load exam session. Please verify backend connection.')
    })
}

function startTimer() {
  timerInterval = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--
    } else {
      submitExam()
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

function toggleFlag(index) {
  flaggedQuestions.value[index] = !flaggedQuestions.value[index]
}

function submitExam() {
  if (timerInterval) clearInterval(timerInterval)
  examActive.value = false
  examSubmitted.value = true

  let totalScore = 0
  const breakdown = {}

  examItems.value.forEach((item) => {
    const studentAns = studentAnswers.value[item.id]
    let isCorrect = false

    if (item.type === 'multiple_choice') {
      isCorrect = Array.isArray(item.correctAnswer) 
        ? item.correctAnswer.includes(studentAns) 
        : Number(studentAns) === Number(item.correctAnswer)
    } else if (item.type === 'true_false') {
      isCorrect = Number(studentAns) === Number(item.correctAnswer)
    }

    if (isCorrect) totalScore++

    const bloom = item.bloomLevel || item.bloomsLevel || 'Understanding'
    if (!breakdown[bloom]) breakdown[bloom] = { correct: 0, total: 0 }
    breakdown[bloom].total++
    if (isCorrect) breakdown[bloom].correct++
  })

  scoreResults.value = {
    score: totalScore,
    total: examItems.value.length,
    percentage: examItems.value.length ? Math.round((totalScore / examItems.value.length) * 100) : 0,
    breakdown
  }
}

function resetPortal() {
  examActive.value = false
  examSubmitted.value = false
  currentQuestionIndex.value = 0
  studentAnswers.value = {}
  flaggedQuestions.value = {}
  timeRemaining.value = 3600
}

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto space-y-6">
    <!-- Entrance Portal -->
    <div v-if="!examActive && !examSubmitted" class="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs space-y-4 max-w-md mx-auto text-center">
      <div class="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
        <Award :size="24" />
      </div>
      <h2 class="text-xl font-bold text-slate-900">Student Examination Portal</h2>
      <p class="text-xs text-slate-500">Enter student identification and assessment code to start.</p>
      
      <div class="space-y-3 text-left">
        <div>
          <label class="text-[11px] font-bold text-slate-700 block mb-1">Student Full Name</label>
          <input v-model="studentName" class="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>
        <div>
          <label class="text-[11px] font-bold text-slate-700 block mb-1">Assessment Code / Course</label>
          <input v-model="courseCodeInput" class="w-full text-xs p-2.5 border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>
        <button @click="startExam" class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all">
          Begin Examination
        </button>
      </div>
    </div>

    <!-- Active Test View -->
    <div v-if="examActive" class="space-y-6">
      <div class="bg-slate-900 text-white rounded-2xl p-4 shadow-md flex justify-between items-center sticky top-4 z-20">
        <div>
          <h2 class="text-sm font-bold">{{ studentName }}</h2>
          <span class="text-[11px] text-emerald-400 font-mono">{{ courseCodeInput }} Assessment</span>
        </div>
        <div class="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 text-emerald-400 font-mono text-sm font-bold">
          <Timer :size="18" class="animate-pulse" />
          <span>{{ formattedTime }}</span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Item Container -->
        <div class="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div class="space-y-4">
            <div class="flex justify-between items-center pb-3 border-b border-slate-100">
              <span class="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded">
                Question {{ currentQuestionIndex + 1 }} of {{ examItems.length }}
              </span>
              <button 
                @click="toggleFlag(currentQuestionIndex)"
                :class="[
                  'text-xs font-semibold px-3 py-1 rounded-lg transition-colors flex items-center gap-1',
                  flaggedQuestions[currentQuestionIndex] 
                    ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                ]"
              >
                <AlertCircle :size="14" />
                {{ flaggedQuestions[currentQuestionIndex] ? 'Flagged' : 'Flag Question' }}
              </button>
            </div>

            <p class="text-base font-bold text-slate-900 leading-relaxed">{{ currentQuestion.text }}</p>

            <!-- Options -->
            <div v-if="currentQuestion.type === 'multiple_choice'" class="space-y-2.5 pt-2">
              <button
                v-for="(opt, optIdx) in currentQuestion.options"
                :key="optIdx"
                @click="studentAnswers[currentQuestion.id] = optIdx"
                :class="[
                  'w-full text-left p-4 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between',
                  studentAnswers[currentQuestion.id] === optIdx
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                ]"
              >
                <span>{{ String.fromCharCode(65 + optIdx) }}. {{ typeof opt === 'string' ? opt : opt.text }}</span>
                <span v-if="studentAnswers[currentQuestion.id] === optIdx" class="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center shrink-0 ml-2">✓</span>
              </button>
            </div>

            <div v-else-if="currentQuestion.type === 'true_false'" class="flex gap-4 pt-2">
              <button
                @click="studentAnswers[currentQuestion.id] = 0"
                :class="[
                  'flex-1 p-4 rounded-xl border text-xs font-bold transition-all text-center',
                  studentAnswers[currentQuestion.id] === 0 ? 'border-emerald-600 bg-emerald-50 text-emerald-950' : 'border-slate-200 bg-white text-slate-700'
                ]"
              >
                True
              </button>
              <button
                @click="studentAnswers[currentQuestion.id] = 1"
                :class="[
                  'flex-1 p-4 rounded-xl border text-xs font-bold transition-all text-center',
                  studentAnswers[currentQuestion.id] === 1 ? 'border-emerald-600 bg-emerald-50 text-emerald-950' : 'border-slate-200 bg-white text-slate-700'
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
              class="flex items-center gap-1 px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronLeft :size="16" /> Previous
            </button>

            <button 
              v-if="currentQuestionIndex < examItems.length - 1"
              @click="currentQuestionIndex++"
              class="flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg"
            >
              Next <ChevronRight :size="16" />
            </button>

            <button 
              v-else
              @click="submitExam"
              class="flex items-center gap-1 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xs"
            >
              Submit Exam
            </button>
          </div>
        </div>

        <!-- Sidebar Palette -->
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
          <div>
            <h3 class="text-sm font-bold text-slate-900">Question Palette</h3>
            <p class="text-xs text-slate-500">Jump to any question item.</p>
          </div>

          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="(q, idx) in examItems"
              :key="q.id"
              @click="currentQuestionIndex = idx"
              :class="[
                'h-10 rounded-lg text-xs font-bold border flex items-center justify-center relative transition-all',
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
              <span class="font-bold text-amber-600">{{ Object.keys(flaggedQuestions).filter(k => flaggedQuestions[k]).length }}</span>
            </div>
          </div>

          <button 
            @click="submitExam"
            class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            Finalize & Submit
          </button>
        </div>
      </div>
    </div>

    <!-- Scoreboard View -->
    <div v-if="examSubmitted" class="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs max-w-xl mx-auto space-y-6">
      <div class="text-center space-y-2">
        <div :class="['w-16 h-16 rounded-full flex items-center justify-center mx-auto text-white font-bold text-xl', scoreResults.percentage >= 75 ? 'bg-emerald-600' : 'bg-red-600']">
          {{ scoreResults.percentage }}%
        </div>
        <h2 class="text-xl font-bold text-slate-900">
          {{ scoreResults.percentage >= 75 ? 'Assessment Passed' : 'Assessment Failed' }}
        </h2>
        <p class="text-xs text-slate-500">Student: {{ studentName }} | Score: {{ scoreResults.score }} / {{ scoreResults.total }}</p>
      </div>

      <div class="border-t pt-4 space-y-3">
        <h3 class="text-xs font-bold text-slate-800">STCW Bloom's Cognitive Competency Score Breakdown</h3>
        <div v-for="(data, bloom) in scoreResults.breakdown" :key="bloom" class="space-y-1">
          <div class="flex justify-between text-xs font-medium text-slate-700">
            <span>{{ bloom }}</span>
            <span>{{ data.correct }} / {{ data.total }} ({{ Math.round((data.correct / data.total) * 100) }}%)</span>
          </div>
          <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div class="bg-emerald-500 h-2 rounded-full" :style="{ width: `${(data.correct / data.total) * 100}%` }"></div>
          </div>
        </div>
      </div>

      <button @click="resetPortal" class="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2">
        <RotateCcw :size="16" /> Return to Assessment Portal
      </button>
    </div>
  </div>
</template>