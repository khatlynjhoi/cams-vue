<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  HelpCircle, 
  Plus, 
  ShieldCheck, 
  ArrowUpRight
} from 'lucide-vue-next'

const router = useRouter()

// Dashboard Statistics with AI metrics
const totalQuestions = ref(128)
const aiValidatedCount = ref(104)
const pendingAiCount = ref(18)
const flaggedAiCount = ref(6)

// Questions List with AI Validation Statuses
const recentQuestions = ref([
  {
    id: 'Q-101',
    text: 'What is the primary objective of keeping a safe navigational watch under STCW?',
    course: 'NAV-101',
    difficulty: 'Medium',
    aiStatus: 'Validated',
    aiConfidence: '98%',
    bloomsLevel: 'Understanding'
  },
  {
    id: 'Q-102',
    text: 'Explain the operational procedure for emergency steering changeover on a tanker.',
    course: 'ENG-202',
    difficulty: 'Hard',
    aiStatus: 'Pending',
    aiConfidence: '--',
    bloomsLevel: 'Application'
  },
  {
    id: 'Q-103',
    text: 'According to COLREG Rule 15, which vessel is give-way in a crossing situation?',
    course: 'COL-102',
    difficulty: 'Easy',
    aiStatus: 'Validated',
    aiConfidence: '95%',
    bloomsLevel: 'Remembering'
  },
  {
    id: 'Q-104',
    text: 'Identify the key causes of thermal stress in medium-speed marine diesel engines.',
    course: 'ENG-202',
    difficulty: 'Hard',
    aiStatus: 'Flagged',
    aiConfidence: '62%',
    aiNote: 'Potential ambiguity in Option C',
    bloomsLevel: 'Analysis'
  },
  {
    id: 'Q-105',
    text: 'What are the immediate actions required during a MARPOL Annex I oil spill alert?',
    course: 'SAF-301',
    difficulty: 'Medium',
    aiStatus: 'Validated',
    aiConfidence: '99%',
    bloomsLevel: 'Application'
  }
])

const isBatchValidating = ref(false)

function runBatchAiValidation() {
  isBatchValidating.value = true
  setTimeout(() => {
    recentQuestions.value.forEach(q => {
      if (q.aiStatus === 'Pending') {
        q.aiStatus = 'Validated'
        q.aiConfidence = '96%'
      }
    })
    aiValidatedCount.value += pendingAiCount.value
    pendingAiCount.value = 0
    isBatchValidating.value = false
  }, 1200)
}
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <!-- Header Banner -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 rounded-2xl text-white shadow-lg">
      <div class="space-y-1">
        <div class="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-full mb-1">
          <Sparkles :size="14" /> AI-Powered Maritime Assessment System
        </div>
        <h1 class="text-2xl sm:text-3xl font-bold tracking-tight">System Dashboard</h1>
        <p class="text-xs sm:text-sm text-slate-300">Overview of question bank quality, AI validation checks, and assessment metrics.</p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <button 
          @click="runBatchAiValidation" 
          :disabled="isBatchValidating || pendingAiCount === 0"
          class="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm rounded-xl transition-all shadow-md disabled:opacity-50"
        >
          <Sparkles :size="16" :class="{ 'animate-spin': isBatchValidating }" />
          <span>{{ isBatchValidating ? 'Validating...' : 'Run Batch AI Validation' }}</span>
        </button>

        <button 
          @click="router.push('/questions')" 
          class="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-medium text-xs sm:text-sm rounded-xl transition-all border border-slate-600"
        >
          <Plus :size="16" />
          <span>Add Question</span>
        </button>
      </div>
    </div>

    <!-- AI Validation Metrics Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex justify-between items-start">
        <div>
          <p class="text-xs font-semibold text-gray-500">Total Question Bank</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ totalQuestions }}</p>
          <p class="text-xs text-gray-400 mt-1">Across 4 maritime courses</p>
        </div>
        <div class="p-3 bg-gray-100 rounded-lg text-gray-700">
          <HelpCircle :size="20" />
        </div>
      </div>

      <div class="bg-white p-5 rounded-xl border border-emerald-200 shadow-sm flex justify-between items-start">
        <div>
          <p class="text-xs font-semibold text-emerald-700">AI Validated Items</p>
          <p class="text-2xl font-bold text-emerald-900 mt-1">{{ aiValidatedCount }}</p>
          <p class="text-xs text-emerald-600 font-medium mt-1">✨ {{ Math.round((aiValidatedCount / totalQuestions) * 100) }}% Compliance Rate</p>
        </div>
        <div class="p-3 bg-emerald-100 rounded-lg text-emerald-700">
          <ShieldCheck :size="20" />
        </div>
      </div>

      <div class="bg-white p-5 rounded-xl border border-amber-200 shadow-sm flex justify-between items-start">
        <div>
          <p class="text-xs font-semibold text-amber-700">Pending AI Review</p>
          <p class="text-2xl font-bold text-amber-900 mt-1">{{ pendingAiCount }}</p>
          <p class="text-xs text-amber-600 font-medium mt-1">Requires automated check</p>
        </div>
        <div class="p-3 bg-amber-100 rounded-lg text-amber-700">
          <Clock :size="20" />
        </div>
      </div>

      <div class="bg-white p-5 rounded-xl border border-red-200 shadow-sm flex justify-between items-start">
        <div>
          <p class="text-xs font-semibold text-red-700">AI Flagged Items</p>
          <p class="text-2xl font-bold text-red-900 mt-1">{{ flaggedAiCount }}</p>
          <p class="text-xs text-red-600 font-medium mt-1">Ambiguity / STCW warning</p>
        </div>
        <div class="p-3 bg-red-100 rounded-lg text-red-700">
          <AlertTriangle :size="20" />
        </div>
      </div>
    </div>

    <!-- Main Content: Questions with AI Validation Badges -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div class="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span>Recent Question Bank Items</span>
            <span class="text-xs bg-emerald-100 text-emerald-800 font-medium px-2.5 py-0.5 rounded-full">AI Monitored</span>
          </h2>
          <p class="text-xs text-gray-500 mt-0.5">Real-time status of questions and AI validation confidence ratings.</p>
        </div>

        <button 
          @click="router.push('/questions')" 
          class="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
        >
          View Full Bank <ArrowUpRight :size="14" />
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-gray-50 text-gray-600 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 font-semibold">ID</th>
              <th class="px-6 py-3 font-semibold">Question Stem</th>
              <th class="px-6 py-3 font-semibold">Course</th>
              <th class="px-6 py-3 font-semibold">Bloom's Level</th>
              <th class="px-6 py-3 font-semibold">AI Validation Status</th>
              <th class="px-6 py-3 font-semibold text-right">Confidence</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="q in recentQuestions" :key="q.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 font-mono font-bold text-gray-800 text-xs">{{ q.id }}</td>
              <td class="px-6 py-4 max-w-md">
                <p class="font-medium text-gray-900 truncate" :title="q.text">{{ q.text }}</p>
                <p v-if="q.aiNote" class="text-xs text-red-600 flex items-center gap-1 mt-1 font-medium">
                  <AlertTriangle :size="12" /> {{ q.aiNote }}
                </p>
              </td>
              <td class="px-6 py-4">
                <span class="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md">
                  {{ q.course }}
                </span>
              </td>
              <td class="px-6 py-4 text-xs font-medium text-gray-600">{{ q.bloomsLevel }}</td>
              <td class="px-6 py-4">
                <span 
                  v-if="q.aiStatus === 'Validated'" 
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800"
                >
                  <CheckCircle :size="13" /> AI Validated
                </span>
                <span 
                  v-else-if="q.aiStatus === 'Pending'" 
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800"
                >
                  <Clock :size="13" /> Pending AI Review
                </span>
                <span 
                  v-else-if="q.aiStatus === 'Flagged'" 
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800"
                >
                  <AlertTriangle :size="13" /> AI Flagged
                </span>
              </td>
              <td class="px-6 py-4 text-right font-mono text-xs font-bold text-gray-700">
                {{ q.aiConfidence }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>