<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { 
  Timer, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  AlertCircle, 
  Award, 
  ShieldAlert,
  RotateCcw
} from 'lucide-vue-next'

const examSubmitted = ref(false)
const currentQuestionIndex = ref(0)
const selectedAnswers = ref({})
const flaggedQuestions = ref({})

// Countdown timer state
const timeLeftSeconds = ref(3600) // 60 minutes
let timerInterval = null

const examData = ref({
  title: 'NAV-101 Midterm Examination 2026',
  course: 'NAV-101',
  passingScore: 75,
  questions: [
    {
      id: 1,
      code: 'NAV-101-01',
      text: 'What is the primary objective of keeping a safe navigational watch under STCW Table A-II/1?',
      options: [
        'A. To reach the destination ahead of scheduled estimated time of arrival (ETA)',
        'B. To avoid collision, stranding, and protect the marine environment',
        'C. To log vessel speed and engine RPM hourly',
        'D. To maintain continuous communication with shore-based vessel traffic services'
      ],
      correctAnswer: 1
    },
    {
      id: 2,
      code: 'NAV-101-02',
      text: 'Under COLREG Rule 15, when two power-driven vessels are crossing, which vessel is required to keep out of the way?',
      options: [
        'A. The vessel which has the other on her own starboard side',
        'B. The vessel which has the other on her own port side',
        'C. The larger vessel regardless of relative bearing',
        'D. The vessel traveling at the higher rate of speed'
      ],
      correctAnswer: 0
    },
    {
      id: 3,
      code: 'NAV-101-03',
      text: 'What action should be taken immediately upon observing a Man Overboard (MOB) incident?',
      options: [
        'A. Immediately inform the chief engineer via engine room telegraph',
        'B. Throw a lifebuoy with light/smoke, sound MOB alarm, and initiate Williams Turn',
        'C. Transmit a Distress Mayday message via VHF Channel 16 immediately',
        'D. Stop all engines and await instructions from the Chief Mate'
      ],
      correctAnswer: 1
    },
    {
      id: 4,
      code: 'NAV-101-04',
      text: 'What fog signal is required for a power-driven vessel underway but stopped and making no way through the water?',
      options: [
        'A. One prolonged blast at intervals of not more than 2 minutes',
        'B. Two prolonged blasts separated by about 2 seconds at intervals of not more than 2 minutes',
        'C. One prolonged blast followed by two short blasts',
        'D. Three short blasts at intervals of 1 minute'
      ],
      correctAnswer: 1
    }
  ]
})

onMounted(() => {
  timerInterval = setInterval(() => {
    if (timeLeftSeconds.value > 0) {
      timeLeftSeconds.value--
    } else {
      submitExam()
    }
  }, 1000)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

const formattedTime = computed(() => {
  const minutes = Math.floor(timeLeftSeconds.value / 60)
  const seconds = timeLeftSeconds.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const currentQuestion = computed(() => examData.value.questions[currentQuestionIndex.value])
const answeredCount = computed(() => Object.keys(selectedAnswers.value).length)

const calculatedScore = computed(() => {
  let score = 0
  examData.value.questions.forEach((q, idx) => {
    if (selectedAnswers.value[idx] === q.correctAnswer) {
      score += 25 // 4 questions = 100%
    }
  })
  return score
})

function selectAnswer(questionIdx, optionIdx) {
  selectedAnswers.value[questionIdx] = optionIdx
}

function toggleFlag(questionIdx) {
  flaggedQuestions.value[questionIdx] = !flaggedQuestions.value[questionIdx]
}

function submitExam() {
  if (timerInterval) clearInterval(timerInterval)
  examSubmitted.value = true
}

function restartExam() {
  examSubmitted.value = false
  currentQuestionIndex.value = 0
  selectedAnswers.value = {}
  flaggedQuestions.value = {}
  timeLeftSeconds.value = 3600
}
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto space-y-6">
    <!-- Header Banner -->
    <div class="bg-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <span class="text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
          Candidate Portal
        </span>
        <h1 class="text-2xl font-bold mt-1">{{ examData.title }}</h1>
        <p class="text-xs text-slate-300">Module: {{ examData.course }} | STCW Table A-II/1 Assessment</p>
      </div>

      <div v-if="!examSubmitted" class="flex items-center gap-2 bg-slate-800 border border-slate-700 px-4 py-2.5 rounded-xl font-mono text-emerald-400 font-bold text-lg">
        <Timer :size="20" class="animate-pulse text-emerald-400" />
        <span>{{ formattedTime }}</span>
      </div>
    </div>

    <!-- Live Exam View -->
    <div v-if="!examSubmitted" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Question Panel -->
      <div class="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between space-y-6">
        <div class="space-y-4">
          <div class="flex justify-between items-center pb-3 border-b border-gray-100">
            <span class="text-xs font-mono font-bold bg-gray-100 text-gray-700 px-2.5 py-1 rounded">
              Question {{ currentQuestionIndex + 1 }} of {{ examData.questions.length }}
            </span>

            <button 
              @click="toggleFlag(currentQuestionIndex)" 
              :class="[
                'text-xs font-semibold px-3 py-1 rounded-lg transition-colors flex items-center gap-1',
                flaggedQuestions[currentQuestionIndex] 
                  ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
            >
              <AlertCircle :size="14" />
              {{ flaggedQuestions[currentQuestionIndex] ? 'Flagged for Review' : 'Flag Question' }}
            </button>
          </div>

          <h2 class="text-base font-bold text-gray-900 leading-relaxed">
            {{ currentQuestion.text }}
          </h2>

          <!-- Options Grid -->
          <div class="space-y-2.5 pt-2">
            <button
              v-for="(option, optIdx) in currentQuestion.options"
              :key="optIdx"
              @click="selectAnswer(currentQuestionIndex, optIdx)"
              :class="[
                'w-full text-left p-4 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between',
                selectedAnswers[currentQuestionIndex] === optIdx
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
              ]"
            >
              <span>{{ option }}</span>
              <span 
                v-if="selectedAnswers[currentQuestionIndex] === optIdx"
                class="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center shrink-0 ml-2"
              >
                ✓
              </span>
            </button>
          </div>
        </div>

        <!-- Pagination Controls -->
        <div class="flex justify-between items-center pt-4 border-t border-gray-100">
          <button 
            @click="currentQuestionIndex--"
            :disabled="currentQuestionIndex === 0"
            class="flex items-center gap-1 px-4 py-2 border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            <ChevronLeft :size="16" /> Previous
          </button>

          <button 
            v-if="currentQuestionIndex < examData.questions.length - 1"
            @click="currentQuestionIndex++"
            class="flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg"
          >
            Next <ChevronRight :size="16" />
          </button>

          <button 
            v-else
            @click="submitExam"
            class="flex items-center gap-1 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm"
          >
            Submit Exam
          </button>
        </div>
      </div>

      <!-- Navigation & Overview Sidebar -->
      <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-5">
        <div>
          <h3 class="text-sm font-bold text-gray-900">Question Palette</h3>
          <p class="text-xs text-gray-500">Jump directly to any item.</p>
        </div>

        <div class="grid grid-cols-4 gap-2">
          <button
            v-for="(q, idx) in examData.questions"
            :key="q.id"
            @click="currentQuestionIndex = idx"
            :class="[
              'h-10 rounded-lg text-xs font-bold border flex items-center justify-center relative transition-all',
              currentQuestionIndex === idx ? 'ring-2 ring-emerald-500 ring-offset-1' : '',
              selectedAnswers[idx] !== undefined ? 'bg-emerald-100 border-emerald-300 text-emerald-900' : 'bg-gray-50 border-gray-200 text-gray-600',
            ]"
          >
            {{ idx + 1 }}
            <span 
              v-if="flaggedQuestions[idx]" 
              class="w-2 h-2 bg-amber-500 rounded-full absolute top-1 right-1"
            ></span>
          </button>
        </div>

        <div class="border-t border-gray-100 pt-4 space-y-2 text-xs text-gray-600">
          <div class="flex justify-between">
            <span>Answered:</span>
            <span class="font-bold text-gray-900">{{ answeredCount }} / {{ examData.questions.length }}</span>
          </div>
          <div class="flex justify-between">
            <span>Flagged:</span>
            <span class="font-bold text-amber-600">{{ Object.keys(flaggedQuestions).filter(k => flaggedQuestions[k]).length }}</span>
          </div>
        </div>

        <button 
          @click="submitExam"
          class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
        >
          Finalize & Submit
        </button>
      </div>
    </div>

    <!-- Exam Results Summary Screen -->
    <div v-else class="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm max-w-xl mx-auto text-center space-y-6">
      <div 
        :class="[
          'w-16 h-16 rounded-full mx-auto flex items-center justify-center',
          calculatedScore >= examData.passingScore ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
        ]"
      >
        <Award v-if="calculatedScore >= examData.passingScore" :size="36" />
        <AlertCircle v-else :size="36" />
      </div>

      <div>
        <h2 class="text-2xl font-bold text-gray-900">
          {{ calculatedScore >= examData.passingScore ? 'Assessment Passed' : 'Assessment Failed' }}
        </h2>
        <p class="text-xs text-gray-500 mt-1">Your responses have been evaluated and recorded under STCW logs.</p>
      </div>

      <div class="bg-gray-50 border border-gray-200 rounded-xl p-4 grid grid-cols-2 gap-4 text-center">
        <div>
          <span class="text-xs text-gray-500 font-medium block">Final Score</span>
          <span class="text-2xl font-black text-gray-900">{{ calculatedScore }}%</span>
        </div>
        <div>
          <span class="text-xs text-gray-500 font-medium block">Passing Threshold</span>
          <span class="text-2xl font-black text-gray-600">{{ examData.passingScore }}%</span>
        </div>
      </div>

      <div class="flex justify-center gap-3 pt-2">
        <button 
          @click="restartExam"
          class="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
        >
          <RotateCcw :size="16" />
          Retake Assessment
        </button>
      </div>
    </div>
  </div>
</template>