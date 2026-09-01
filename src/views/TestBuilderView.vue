<script setup>
import { ref, computed } from 'vue'
import { Plus, Trash2, Save, BookOpen, Clock, FileCheck } from 'lucide-vue-next'

const testTitle = ref('Navigational Watch Assessment')
const selectedCourse = ref('BSMT')
const durationMinutes = ref(60)
const passingScore = ref(75)

const availableQuestions = ref([
  { id: 101, code: 'Q-101', text: 'What is the primary objective of keeping a safe navigational watch?', level: 'Remembering' },
  { id: 102, code: 'Q-102', text: 'Explain the principle of four-stroke diesel engine operation.', level: 'Understanding' },
  { id: 103, code: 'Q-103', text: 'What are the rules of the road under COLREG Rule 15 (Crossing Situation)?', level: 'Applying' },
  { id: 104, code: 'Q-104', text: 'How do you calculate compass error using azimuth of the sun?', level: 'Analyzing' }
])

const selectedQuestionIds = ref([101, 103])

const selectedQuestions = computed(() => {
  return availableQuestions.value.filter(q => selectedQuestionIds.value.includes(q.id))
})

function addQuestionToTest(id) {
  if (!selectedQuestionIds.value.includes(id)) {
    selectedQuestionIds.value.push(id)
  }
}

function removeQuestionFromTest(id) {
  selectedQuestionIds.value = selectedQuestionIds.value.filter(qId => qId !== id)
}

function saveTest() {
  alert(`Test "${testTitle.value}" created successfully with ${selectedQuestions.value.length} questions!`)
}
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Test Builder</h1>
        <p class="text-gray-500 mt-1">Assemble assessment packages from validated bank items.</p>
      </div>
      <button 
        @click="saveTest" 
        class="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm"
      >
        <Save :size="18" />
        Save Examination
      </button>
    </div>

    <!-- Test Configuration Form -->
    <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="md:col-span-2 space-y-1">
        <label class="text-xs font-semibold text-gray-600 uppercase">Test Title</label>
        <input 
          v-model="testTitle" 
          type="text" 
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div class="space-y-1">
        <label class="text-xs font-semibold text-gray-600 uppercase">Target Program</label>
        <select 
          v-model="selectedCourse" 
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
        >
          <option value="BSMT">BSMT</option>
          <option value="BSMarE">BSMarE</option>
        </select>
      </div>

      <div class="space-y-1">
        <label class="text-xs font-semibold text-gray-600 uppercase">Time Limit (Mins)</label>
        <div class="relative">
          <Clock :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            v-model.number="durationMinutes" 
            type="number" 
            class="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>
    </div>

    <!-- Two Column Selection Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Left: Available Items -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
        <div class="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 class="font-bold text-gray-800 flex items-center gap-2">
            <BookOpen :size="18" class="text-emerald-600" />
            Available Questions
          </h2>
          <span class="text-xs text-gray-500">{{ availableQuestions.length }} available</span>
        </div>

        <div class="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          <div 
            v-for="q in availableQuestions" 
            :key="q.id" 
            class="p-4 rounded-lg border border-gray-200 hover:border-emerald-300 transition-all flex items-start justify-between gap-3 bg-gray-50/50"
          >
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-gray-900">{{ q.code }}</span>
                <span class="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                  {{ q.level }}
                </span>
              </div>
              <p class="text-xs text-gray-700 font-medium">{{ q.text }}</p>
            </div>
            <button 
              @click="addQuestionToTest(q.id)"
              :disabled="selectedQuestionIds.includes(q.id)"
              class="px-2.5 py-1.5 bg-emerald-600 text-white rounded-md text-xs font-medium hover:bg-emerald-700 disabled:opacity-40 shrink-0 flex items-center gap-1"
            >
              <Plus :size="14" />
              Add
            </button>
          </div>
        </div>
      </div>

      <!-- Right: Selected Test Structure -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
        <div class="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 class="font-bold text-gray-800 flex items-center gap-2">
            <FileCheck :size="18" class="text-emerald-600" />
            Selected Test Paper
          </h2>
          <span class="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
            {{ selectedQuestions.length }} Items Added
          </span>
        </div>

        <div v-if="selectedQuestions.length === 0" class="py-12 text-center text-gray-400 text-xs">
          No questions selected yet. Click "Add" on any item from the left panel.
        </div>

        <div v-else class="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          <div 
            v-for="(q, index) in selectedQuestions" 
            :key="q.id" 
            class="p-4 rounded-lg border border-emerald-200 bg-emerald-50/30 flex items-start justify-between gap-3"
          >
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-emerald-800">#{{ index + 1 }} ({{ q.code }})</span>
                <span class="text-[10px] px-2 py-0.5 rounded bg-white text-gray-600 border border-gray-200 font-medium">
                  {{ q.level }}
                </span>
              </div>
              <p class="text-xs text-gray-800 font-medium">{{ q.text }}</p>
            </div>
            <button 
              @click="removeQuestionFromTest(q.id)" 
              class="p-1.5 text-red-500 hover:bg-red-50 rounded-md shrink-0 transition-colors"
            >
              <Trash2 :size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>