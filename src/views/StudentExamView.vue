<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Clock, CheckCircle, ChevronLeft, ChevronRight, Send, AlertTriangle } from 'lucide-vue-next'

const router = useRouter()
const examTitle = ref('E-WATCH - FINAL EXAMINATION')
const currentQuestionIndex = ref(0)
const selectedAnswers = ref({})
const isSubmitModalOpen = ref(false)

const questions = ref([
  {
    id: 1,
    code: 'Q-101',
    text: 'What is the primary objective of keeping a safe navigational watch at sea under the STCW Convention?',
    options: [
      'A. To reach the destination port ahead of schedule.',
      'B. To avoid collision, stranding, and ensure environmental protection.',
      'C. To log vessel speed and engine performance hourly.',
      'D. To maintain communication with shore authorities continuously.'
    ]
  },
  {
    id: 2,
    code: 'Q-103',
    text: 'According to COLREG Rule 15, when two power-driven vessels are crossing, which vessel is required to keep out of the way?',
    options: [
      'A. The vessel which has the other on her own starboard side.',
      'B. The vessel which has the other on her own port side.',
      'C. The faster moving vessel.',
      'D. The larger vessel regardless of bearing.'
    ]
  },
  {
    id: 3,
    code: 'Q-104',
    text: 'What action should be taken immediately upon observing a Man Overboard (MOB) incident?',
    options: [
      'A. Call the Port State Control.',
      'B. Sound the general alarm, throw a lifebuoy, and mark the position.',
      'C. Reverse the engines immediately at full power.',
      'D. Notify the vessel owner via email.'
    ]
  }
])

const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])
const totalQuestions = computed(() => questions.value.length)
const answeredCount = computed(() => Object.keys(selectedAnswers.value).length)

const timeRemaining = ref(3600)
let timerInterval = null

const formattedTime = computed(() => {
  const minutes = Math.floor(timeRemaining.value / 60)
  const seconds = timeRemaining.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

onMounted(() => {
  timerInterval = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--
    }
  }, 1000)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

function selectOption(optionIndex) {
  selectedAnswers.value[currentQuestion.value.id] = optionIndex
}

function nextQuestion() {
  if (currentQuestionIndex.value < totalQuestions.value - 1) {
    currentQuestionIndex.value++
  }
}

function prevQuestion() {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

function submitExam() {
  isSubmitModalOpen.value = false
  router.push('/reports')
}
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <!-- Header -->
    <div class="bg-gray-900 text-white p-6 rounded-xl shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-xl font-bold">{{ examTitle }}</h1>
        <p class="text-xs text-gray-400 mt-1">Student Portal • Marine Engineering & Navigation</p>
      </div>

      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
          <Clock :size="18" class="text-emerald-400" />
          <span class="font-mono text-lg font-bold tracking-wider text-emerald-400">{{ formattedTime }}</span>
        </div>

        <button 
          @click="isSubmitModalOpen = true"
          class="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm transition-colors"
        >
          <Send :size="16" />
          Submit Exam
        </button>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Question Card -->
      <div class="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between space-y-6">
        <div class="space-y-6">
          <div class="flex justify-between items-center border-b border-gray-100 pb-4">
            <span class="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              Question {{ currentQuestionIndex + 1 }} of {{ totalQuestions }}
            </span>
            <span class="text-xs font-mono text-gray-400">Item ID: {{ currentQuestion.code }}</span>
          </div>

          <h2 class="text-lg font-semibold text-gray-900 leading-relaxed">
            {{ currentQuestion.text }}
          </h2>

          <div class="space-y-3 pt-2">
            <button
              v-for="(option, idx) in currentQuestion.options"
              :key="idx"
              @click="selectOption(idx)"
              :class="[
                'w-full text-left p-4 rounded-xl border text-sm transition-all flex items-center justify-between',
                selectedAnswers[currentQuestion.id] === idx 
                  ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20 font-medium text-emerald-950' 
                  : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
              ]"
            >
              <span>{{ option }}</span>
              <CheckCircle 
                v-if="selectedAnswers[currentQuestion.id] === idx" 
                :size="18" 
                class="text-emerald-600 shrink-0" 
              />
            </button>
          </div>
        </div>

        <div class="flex justify-between items-center pt-6 border-t border-gray-100">
          <button 
            @click="prevQuestion" 
            :disabled="currentQuestionIndex === 0"
            class="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            <ChevronLeft :size="18" />
            Previous
          </button>

          <button 
            @click="nextQuestion" 
            :disabled="currentQuestionIndex === totalQuestions - 1"
            class="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-40"
          >
            Next
            <ChevronRight :size="18" />
          </button>
        </div>
      </div>

      <!-- Question Palette -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-5 h-fit">
        <div>
          <h3 class="font-bold text-gray-800 text-sm">Question Navigator</h3>
          <p class="text-xs text-gray-500 mt-0.5">Progress: {{ answeredCount }} of {{ totalQuestions }} answered</p>
        </div>

        <div class="grid grid-cols-5 gap-2">
          <button
            v-for="(q, idx) in questions"
            :key="q.id"
            @click="currentQuestionIndex = idx"
            :class="[
              'h-10 rounded-lg text-xs font-bold transition-all flex items-center justify-center border',
              currentQuestionIndex === idx ? 'ring-2 ring-emerald-600 ring-offset-1' : '',
              selectedAnswers[q.id] !== undefined 
                ? 'bg-emerald-600 text-white border-emerald-600' 
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
            ]"
          >
            {{ idx + 1 }}
          </button>
        </div>
      </div>
    </div>

    <!-- Confirm Modal -->
    <div v-if="isSubmitModalOpen" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
        <div class="flex items-center gap-3 text-amber-600">
          <AlertTriangle :size="28" />
          <h3 class="text-lg font-bold text-gray-900">Submit Examination?</h3>
        </div>
        
        <p class="text-sm text-gray-600">
          You have answered <span class="font-bold text-gray-900">{{ answeredCount }}</span> out of 
          <span class="font-bold text-gray-900">{{ totalQuestions }}</span> questions.
        </p>

        <div class="flex justify-end gap-3 pt-3">
          <button 
            @click="isSubmitModalOpen = false" 
            class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Continue Exam
          </button>
          <button 
            @click="submitExam" 
            class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
          >
            Confirm & Finish
          </button>
        </div>
      </div>
    </div>
  </div>
</template>