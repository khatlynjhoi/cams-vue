<script setup>
import { ref } from 'vue'
import { Plus, Upload, Search, Filter, X, FileText, Download, Sparkles } from 'lucide-vue-next'
import AiValidationModal from '@/components/questions/AiValidationModal.vue'

const searchQuery = ref('')
const selectedCourse = ref('All')
const isUploadModalOpen = ref(false)
const csvFile = ref(null)
const uploadError = ref('')

const activeQuestionForAi = ref(null)
const isAiModalOpen = ref(false)

const questions = ref([
  {
    id: 1,
    code: 'Q-101',
    course: 'BSMT - Navigational Watch',
    text: 'What is the primary objective of keeping a safe navigational watch?',
    level: 'Remembering',
    status: 'Approved'
  },
  {
    id: 2,
    code: 'Q-102',
    course: 'BSMarE - Marine Diesel Engines',
    text: 'Explain the principle of four-stroke diesel engine operation.',
    level: 'Understanding',
    status: 'Validated'
  }
])

function openAiValidation(question) {
  activeQuestionForAi.value = question
  isAiModalOpen.value = true
}

function handleAiFix(updatedData) {
  if (activeQuestionForAi.value) {
    activeQuestionForAi.value.text = updatedData.text
    activeQuestionForAi.value.level = updatedData.level
    activeQuestionForAi.value.status = updatedData.status
  }
}

function handleFileChange(event) {
  const file = event.target.files[0]
  if (file && file.type === 'text/csv') {
    csvFile.value = file
    uploadError.value = ''
  } else {
    uploadError.value = 'Please select a valid .csv file.'
    csvFile.value = null
  }
}

function downloadSampleCSV() {
  const headers = 'code,course,text,level,status\n'
  const rows = 'Q-103,BSMT,What is the buoyage system for Region A?,Remembering,Pending\nQ-104,BSMarE,Define thermal efficiency in engines.,Understanding,Pending'
  const blob = new Blob([headers + rows], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'sample_questions_template.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function processCSV() {
  if (!csvFile.value) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const text = e.target.result
    const lines = text.split('\n').filter(line => line.trim() !== '')
    
    if (lines.length < 2) {
      uploadError.value = 'CSV file must contain a header and at least one row.'
      return
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const newQuestions = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      if (values.length === headers.length) {
        newQuestions.push({
          id: Date.now() + i,
          code: values[0] || `Q-${Date.now()}`,
          course: values[1] || 'General',
          text: values[2] || '',
          level: values[3] || 'Remembering',
          status: values[4] || 'Pending'
        })
      }
    }

    questions.value.push(...newQuestions)
    isUploadModalOpen.value = false
    csvFile.value = null
  }
  
  reader.readAsText(csvFile.value)
}
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <!-- Header Actions -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Question Bank</h1>
        <p class="text-gray-500 mt-1">Manage, validate, and organize assessment items.</p>
      </div>
      <div class="flex items-center gap-3">
        <button 
          @click="isUploadModalOpen = true"
          class="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          <Upload :size="18" />
          Bulk Upload
        </button>
        <button class="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
          <Plus :size="18" />
          Add Question
        </button>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
      <div class="relative flex-1">
        <Search :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search questions or codes..."
          class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div class="flex items-center gap-2">
        <Filter :size="18" class="text-gray-500" />
        <select
          v-model="selectedCourse"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
        >
          <option value="All">All Courses</option>
          <option value="BSMT">BSMT</option>
          <option value="BSMarE">BSMarE</option>
        </select>
      </div>
    </div>

    <!-- Questions Table -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <table class="w-full text-left text-sm">
        <thead class="bg-gray-50 text-gray-600 border-b border-gray-200">
          <tr>
            <th class="px-6 py-3 font-semibold">Code</th>
            <th class="px-6 py-3 font-semibold">Course</th>
            <th class="px-6 py-3 font-semibold">Question Text</th>
            <th class="px-6 py-3 font-semibold">Bloom's Level</th>
            <th class="px-6 py-3 font-semibold">Status</th>
            <th class="px-6 py-3 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="q in questions" :key="q.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 font-medium text-gray-900">{{ q.code }}</td>
            <td class="px-6 py-4 text-gray-600">{{ q.course }}</td>
            <td class="px-6 py-4 text-gray-800 font-medium max-w-md truncate">{{ q.text }}</td>
            <td class="px-6 py-4">
              <span class="px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                {{ q.level }}
              </span>
            </td>
            <td class="px-6 py-4">
              <span 
                :class="[
                  'px-2.5 py-1 rounded-full text-xs font-medium',
                  q.status === 'Approved' || q.status === 'Validated' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                ]"
              >
                {{ q.status }}
              </span>
            </td>
            <td class="px-6 py-4 text-right">
              <button 
                @click="openAiValidation(q)" 
                class="px-2.5 py-1 text-xs font-medium border border-emerald-300 text-emerald-700 rounded-lg hover:bg-emerald-50 flex items-center gap-1 ml-auto"
              >
                <Sparkles :size="14" />
                Validate AI
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- CSV Bulk Upload Modal -->
    <div v-if="isUploadModalOpen" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
        <div class="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Upload :size="20" class="text-emerald-600" />
            Bulk Upload Questions
          </h3>
          <button @click="isUploadModalOpen = false" class="text-gray-400 hover:text-gray-600">
            <X :size="20" />
          </button>
        </div>

        <p class="text-sm text-gray-600">
          Upload a standard CSV file containing questions formatted with headers: 
          <code class="bg-gray-100 text-xs p-1 rounded">code, course, text, level, status</code>.
        </p>

        <button 
          @click="downloadSampleCSV"
          class="flex items-center gap-2 text-xs font-medium text-emerald-600 hover:text-emerald-700"
        >
          <Download :size="14" />
          Download Sample Template
        </button>

        <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
          <FileText class="mx-auto text-gray-400 mb-2" :size="32" />
          <input 
            type="file" 
            accept=".csv" 
            @change="handleFileChange" 
            class="hidden" 
            id="csv-file-input"
          />
          <label for="csv-file-input" class="cursor-pointer text-sm font-medium text-emerald-600 hover:underline">
            Choose CSV file
          </label>
          <p v-if="csvFile" class="text-xs text-gray-700 mt-2 font-semibold">{{ csvFile.name }}</p>
        </div>

        <p v-if="uploadError" class="text-xs text-red-600">{{ uploadError }}</p>

        <div class="flex justify-end gap-3 pt-2">
          <button 
            @click="isUploadModalOpen = false"
            class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            @click="processCSV"
            :disabled="!csvFile"
            class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
          >
            Import Questions
          </button>
        </div>
      </div>
    </div>

    <!-- AI Validation Modal -->
    <AiValidationModal 
      :isOpen="isAiModalOpen" 
      :question="activeQuestionForAi" 
      @close="isAiModalOpen = false" 
      @apply-fix="handleAiFix" 
    />
  </div>
</template>