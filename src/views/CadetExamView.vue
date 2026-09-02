<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { Clock, CheckCircle2, AlertCircle, Award, Check, X } from 'lucide-vue-next'

const examActive = ref(false)
const examCompleted = ref(false)
const courseCodeInput = ref('NAV-101')
const cadetName = ref('Cadet Alex Vance')
const examItems = ref([])
const cadetAnswers = ref({})

const timeRemaining = ref(1800) // 30 Minutes
let timerInterval = null

const scoreResults = ref({ score: 0, total: 0, percentage: 0, breakdown: {} })

function startExam() {
  fetch(`http://localhost:3001/api/exams/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ courseId: 'CRS-01', totalItems: 5 })
  })
    .then(r => r.json())
    .then(data => {
      if (data.success && data.exam.length > 0) {
        examItems.value = data.exam
        examActive.value = true
        startTimer()
      } else {
        alert('No questions available for examination.')
      }
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

function submitExam() {
  clearInterval(timerInterval)
  examActive.value = false
  examCompleted.value = true

  let totalScore = 0
  const breakdown = {}

  examItems.value.forEach((item) => {
    const cadetAns = cadetAnswers.value[item.id]
    let isCorrect = false

    if (item.type === 'multiple_choice') {
      isCorrect = Array.isArray(item.correctAnswer) && item.correctAnswer.includes(cadetAns)
    } else if (item.type === 'true_false') {
      isCorrect = Number(cadetAns) === Number(item.correctAnswer)
    }

    if (isCorrect) totalScore++

    const bloom = item.bloomLevel || 'Understanding'
    if (!breakdown[bloom]) breakdown[bloom] = { correct: 0, total: 0 }
    breakdown[bloom].total++
    if (isCorrect) breakdown[bloom].correct++
  })

  scoreResults.value = {
    score: totalScore,
    total: examItems.value.length,
    percentage: Math.round((totalScore / examItems.value.length) * 100),
    breakdown
  }
}

onUnmounted(() => clearInterval(timerInterval))
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto space-y-6">
    <!-- Entrance Form -->
    <div v-if="!examActive && !examCompleted" class="bg-white border rounded-2xl p-8 shadow-sm space-y-4 max-w-md mx-auto text-center">
      <div class="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
        <Award :size="24" />
      </div>
      <h2 class="text-xl font-bold text-slate-900">Cadet Examination Portal</h2>
      <p class="text-xs text-slate-500">Enter cadet identification to begin timed assessment.</p>
      
      <div class="space-y-3 text-left">
        <div>
          <label class="text-[11px] font-bold text-slate-700">Cadet Full Name</label>
          <input v-model="cadetName" class="w-full text-xs p-2.5 border rounded-lg" />
        </div>
        <div>
          <label class="text-[11px] font-bold text-slate-700">Assessment Code</label>
          <input v-model="courseCodeInput" class="w-full text-xs p-2.5 border rounded-lg font-mono" />
        </div>
        <button @click="startExam" class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all">
          Begin Examination
        </button>
      </div>
    </div>

    <!-- Active Test Screen -->
    <div v-if="examActive" class="space-y-6">
      <div class="bg-slate-900 text-white p-4 rounded-xl flex justify-between items-center sticky top-4 shadow-md z-20">
        <div>
          <h2 class="text-sm font-bold">{{ cadetName }}</h2>
          <span class="text-[11px] text-emerald-400 font-mono">{{ courseCodeInput }} Assessment</span>
        </div>
        <div class="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 text-amber-400 font-mono text-sm font-bold">
          <Clock :size="16" /> {{ formattedTime }}
        </div>
      </div>

      <div class="space-y-4">
        <div v-for="(item, idx) in examItems" :key="item.id" class="bg-white border rounded-xl p-5 shadow-sm space-y-3">
          <div class="flex justify-between font-bold text-xs text-slate-800 border-b pb-2">
            <span>Question {{ idx + 1 }} of {{ examItems.length }}</span>
            <span class="text-slate-400 font-normal">{{ item.stcwStandard }}</span>
          </div>
          <p class="text-xs font-semibold text-slate-900">{{ item.text }}</p>

          <!-- Multiple Choice Options -->
          <div v-if="item.type === 'multiple_choice'" class="space-y-2">
            <label v-for="(opt, optIdx) in item.options" :key="optIdx" class="flex items-center gap-3 p-2.5 border rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-medium">
              <input type="radio" :name="'q_' + item.id" :value="optIdx" v-model="cadetAnswers[item.id]" class="text-emerald-600" />
              <span>{{ String.fromCharCode(65 + optIdx) }}. {{ opt }}</span>
            </label>
          </div>

          <!-- True/False Options -->
          <div v-else-if="item.type === 'true_false'" class="flex gap-4">
            <label class="flex-1 p-3 border rounded-lg text-center font-bold text-xs cursor-pointer hover:bg-slate-50">
              <input type="radio" :name="'q_' + item.id" :value="0" v-model="cadetAnswers[item.id]" class="mr-2" /> True
            </label>
            <label class="flex-1 p-3 border rounded-lg text-center font-bold text-xs cursor-pointer hover:bg-slate-50">
              <input type="radio" :name="'q_' + item.id" :value="1" v-model="cadetAnswers[item.id]" class="mr-2" /> False
            </label>
          </div>
        </div>
      </div>

      <button @click="submitExam" class="w-full py-3 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl">
        Submit Final Answers
      </button>
    </div>

    <!-- Results Scoreboard -->
    <div v-if="examCompleted" class="bg-white border rounded-2xl p-8 shadow-sm space-y-6 max-w-2xl mx-auto">
      <div class="text-center space-y-2">
        <div :class="['w-16 h-16 rounded-full flex items-center justify-center mx-auto text-white font-bold text-xl', scoreResults.percentage >= 70 ? 'bg-emerald-600' : 'bg-red-600']">
          {{ scoreResults.percentage }}%
        </div>
        <h2 class="text-lg font-bold text-slate-900">Examination Submitted</h2>
        <p class="text-xs text-slate-500">Cadet: {{ cadetName }} | Score: {{ scoreResults.score }} / {{ scoreResults.total }}</p>
      </div>

      <div class="border-t pt-4 space-y-3">
        <h3 class="text-xs font-bold text-slate-800">Bloom's Cognitive Competency Score Breakdown</h3>
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
    </div>
  </div>
</template>