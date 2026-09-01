<script setup>
import { ref, computed } from 'vue'
import { 
  Sparkles, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertTriangle, 
  Trash2, 
  Wand2, 
  BookOpen, 
  Layers,
  Bot
} from 'lucide-vue-next'

const searchQuery = ref('')
const selectedCourse = ref('All')
const selectedBloom = ref('All')
const isAiModalOpen = ref(false)
const isGenerating = ref(false)

// AI Generator Form Inputs
const aiPrompt = ref({
  course: 'NAV-101',
  topic: 'COLREG Rule 15 Crossing Situations',
  difficulty: 'Medium',
  count: 2
})

const questions = ref([
  {
    id: 'Q-101',
    code: 'NAV-101-01',
    text: 'What is the primary objective of keeping a safe navigational watch under STCW?',
    course: 'NAV-101',
    bloomsLevel: 'Understanding',
    options: [
      'A. To reach destination early.',
      'B. To avoid collision, stranding, and ensure environmental safety.',
      'C. To log vessel speed hourly.',
      'D. To report to shore authorities continuously.'
    ],
    correctAnswer: 1,
    aiStatus: 'Validated',
    aiScore: '98%',
    stcwRef: 'Table A-II/1'
  },
  {
    id: 'Q-102',
    code: 'ENG-202-04',
    text: 'Identify the key cause of thermal stress in medium-speed marine diesel engines.',
    course: 'ENG-202',
    bloomsLevel: 'Analysis',
    options: [
      'A. Low cooling water velocity.',
      'B. Uneven heat distribution across cylinder liner.',
      'C. High lubricating oil pressure.',
      'D. Excessive fuel injection viscosity.'
    ],
    correctAnswer: 1,
    aiStatus: 'Flagged',
    aiScore: '65%',
    stcwRef: 'Table A-III/1',
    aiIssue: 'Option C & D may cause partial overlap depending on engine load.'
  }
])

const filteredQuestions = computed(() => {
  return questions.value.filter(q => {
    const matchesSearch = q.text.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          q.code.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCourse = selectedCourse.value === 'All' || q.course === selectedCourse.value
    const matchesBloom = selectedBloom.value === 'All' || q.bloomsLevel === selectedBloom.value
    return matchesSearch && matchesCourse && matchesBloom
  })
})

function generateAiQuestions() {
  isGenerating.value = true
  setTimeout(() => {
    const newItems = [
      {
        id: `Q-${Date.now()}`,
        code: `${aiPrompt.value.course}-${Math.floor(Math.random() * 90 + 10)}`,
        text: `[AI Generated] Under ${aiPrompt.value.topic}, which action is required by the give-way vessel?`,
        course: aiPrompt.value.course,
        bloomsLevel: 'Application',
        options: [
          'A. Maintain speed and course.',
          'B. Take early and substantial action to keep well clear.',
          'C. Sound 5 short rapid blasts and stop engines.',
          'D. Turn to port regardless of vessel position.'
        ],
        correctAnswer: 1,
        aiStatus: 'Validated',
        aiScore: '96%',
        stcwRef: 'STCW A-II/1'
      }
    ]
    questions.value.unshift(...newItems)
    isGenerating.value = false
    isAiModalOpen.value = false
  }, 1500)
}

function deleteQuestion(id) {
  if (confirm('Delete this item from the question bank?')) {
    questions.value = questions.value.filter(q => q.id !== id)
  }
}
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Question Bank</h1>
        <p class="text-gray-500 mt-1">Repository of maritime items with real-time AI validation.</p>
      </div>

      <div class="flex items-center gap-3">
        <button 
          @click="isAiModalOpen = true"
          class="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Sparkles :size="16" />
          AI Question Draft
        </button>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
      <div class="relative w-full md:w-96">
        <Search :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search question text or code..." 
          class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
        />
      </div>

      <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <select 
          v-model="selectedCourse"
          class="border border-gray-300 rounded-lg text-sm px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="All">All Courses</option>
          <option value="NAV-101">NAV-101</option>
          <option value="ENG-202">ENG-202</option>
          <option value="SAF-301">SAF-301</option>
        </select>

        <select 
          v-model="selectedBloom"
          class="border border-gray-300 rounded-lg text-sm px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="All">All Bloom's Levels</option>
          <option value="Understanding">Understanding</option>
          <option value="Application">Application</option>
          <option value="Analysis">Analysis</option>
        </select>
      </div>
    </div>

    <!-- Questions List -->
    <div class="space-y-4">
      <div 
        v-for="q in filteredQuestions" 
        :key="q.id"
        class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:border-gray-300 transition-all space-y-4"
      >
        <div class="flex justify-between items-start gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                {{ q.code }}
              </span>
              <span class="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                {{ q.course }}
              </span>
              <span class="text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full">
                {{ q.bloomsLevel }}
              </span>
            </div>
            <h3 class="text-base font-bold text-gray-900 pt-1">{{ q.text }}</h3>
          </div>

          <!-- AI Status Tag -->
          <div class="flex items-center gap-2 shrink-0">
            <span 
              v-if="q.aiStatus === 'Validated'" 
              class="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800"
            >
              <CheckCircle :size="14" /> AI Passed ({{ q.aiScore }})
            </span>
            <span 
              v-else 
              class="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-800"
            >
              <AlertTriangle :size="14" /> Review Flag ({{ q.aiScore }})
            </span>

            <button 
              @click="deleteQuestion(q.id)" 
              class="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 :size="16" />
            </button>
          </div>
        </div>

        <!-- Options Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
          <div 
            v-for="(opt, idx) in q.options" 
            :key="idx"
            :class="[
              'p-3 rounded-lg text-xs font-medium border',
              q.correctAnswer === idx 
                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-bold' 
                : 'bg-gray-50/50 border-gray-200 text-gray-700'
            ]"
          >
            {{ opt }}
          </div>
        </div>

        <!-- AI Note (If Flagged) -->
        <div v-if="q.aiIssue" class="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 flex items-start gap-2">
          <AlertTriangle :size="16" class="shrink-0 mt-0.5" />
          <div>
            <span class="font-bold">AI Quality Warning:</span> {{ q.aiIssue }}
          </div>
        </div>
      </div>
    </div>

    <!-- AI Generator Modal -->
    <div v-if="isAiModalOpen" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        <div class="flex items-center gap-3 text-purple-700">
          <Bot :size="28" />
          <div>
            <h3 class="text-lg font-bold text-gray-900">AI Question Generator</h3>
            <p class="text-xs text-gray-500">Draft STCW-aligned multiple choice items automatically.</p>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Target Course</label>
            <select 
              v-model="aiPrompt.course"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            >
              <option value="NAV-101">NAV-101 Terrestrial Navigation</option>
              <option value="ENG-202">ENG-202 Diesel Engineering</option>
              <option value="SAF-301">SAF-301 Maritime Safety</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">STCW Competency / Topic</label>
            <input 
              v-model="aiPrompt.topic"
              type="text"
              placeholder="e.g. Radar Plotting and Target Tracking"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Difficulty</label>
              <select 
                v-model="aiPrompt.difficulty"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Number of Items</label>
              <select 
                v-model="aiPrompt.count"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option :value="1">1 Question</option>
                <option :value="2">2 Questions</option>
                <option :value="5">5 Questions</option>
              </select>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button 
            @click="isAiModalOpen = false" 
            class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            @click="generateAiQuestions" 
            :disabled="isGenerating"
            class="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
          >
            <Sparkles :size="16" :class="{ 'animate-spin': isGenerating }" />
            <span>{{ isGenerating ? 'Generating...' : 'Generate Items' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>