<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { HelpCircle, Save, Plus, Trash2, Image, X } from 'lucide-vue-next'

const questions = ref([])
const courses = ref([])
const isSubmitting = ref(false)

const form = reactive({
  program: 'Both', // BSMarE | BSMT | Both
  courseId: '',
  courseOutcomeId: '',
  learningOutcomeId: '',
  code: '',
  stcwStandard: 'Table A-II/1',
  bloomLevel: 'Understanding',
  type: 'multiple_choice',
  text: '',
  imageUrl: '',
  options: [
    { text: '', imageUrl: '', isCorrect: false },
    { text: '', imageUrl: '', isCorrect: false }
  ],
  tfCorrect: 'true',
  shortAnswerKeywords: '',
  matchingPairs: [
    { prompt: '', promptImage: '', match: '', matchImage: '' },
    { prompt: '', promptImage: '', match: '', matchImage: '' }
  ]
})

// Filter courses based on program selection
const filteredCourses = computed(() => {
  if (form.program === 'Both') return courses.value
  return courses.value.filter(c => !c.program || c.program === form.program || c.program === 'Both')
})

// Cascading Course Outcomes
const availableCourseOutcomes = computed(() => {
  const selectedCourse = courses.value.find(c => c.id === form.courseId)
  if (!selectedCourse || !selectedCourse.courseOutcomes) return []
  return selectedCourse.courseOutcomes
})

// Cascading Learning Outcomes
const availableLearningOutcomes = computed(() => {
  const selectedCO = availableCourseOutcomes.value.find(co => (co.id || co.code) === form.courseOutcomeId)
  if (!selectedCO || !selectedCO.learningOutcomes) return []
  return selectedCO.learningOutcomes
})

function onProgramChange() {
  form.courseId = ''
  form.courseOutcomeId = ''
  form.learningOutcomeId = ''
}

function onCourseChange() {
  form.courseOutcomeId = ''
  form.learningOutcomeId = ''
}

function onCOChange() {
  form.learningOutcomeId = ''
}

function handleFileUpload(event, targetObj, propertyName) {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => { targetObj[propertyName] = e.target.result }
  reader.readAsDataURL(file)
}

function removeImage(targetObj, propertyName) {
  targetObj[propertyName] = ''
}

async function fetchQuestions() {
  try {
    const res = await fetch('http://localhost:3001/api/questions')
    const data = await res.json()
    if (data.success) questions.value = data.data
  } catch (err) {
    console.error('Failed to load questions:', err)
  }
}

async function fetchCourses() {
  try {
    const res = await fetch('http://localhost:3001/api/courses')
    const data = await res.json()
    if (data.success) courses.value = data.data
  } catch (err) {
    console.error('Failed to load courses:', err)
  }
}

async function saveQuestion() {
  if (!form.courseId || !form.code || !form.text) {
    alert('Please complete the Program, Course, Item Code, and Question Text fields.')
    return
  }

  let formattedOptions = []
  let formattedCorrectAnswer = null
  let formattedMatchingPairs = []

  if (form.type === 'multiple_choice') {
    formattedOptions = form.options.map(opt => ({ text: opt.text, imageUrl: opt.imageUrl }))
    formattedCorrectAnswer = form.options
      .map((opt, idx) => opt.isCorrect ? idx : null)
      .filter(val => val !== null)
    
    if (formattedCorrectAnswer.length === 0) {
      alert('Please select at least one correct option.')
      return
    }
  } else if (form.type === 'true_false') {
    formattedOptions = ['True', 'False']
    formattedCorrectAnswer = form.tfCorrect === 'true' ? 0 : 1
  } else if (form.type === 'short_answer') {
    formattedCorrectAnswer = form.shortAnswerKeywords.split(',').map(s => s.trim())
  } else if (form.type === 'matching') {
    formattedMatchingPairs = form.matchingPairs
  }

  const payload = { ...form, options: formattedOptions, correctAnswer: formattedCorrectAnswer, matchingPairs: formattedMatchingPairs }

  isSubmitting.value = true
  try {
    const res = await fetch('http://localhost:3001/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    if (data.success) {
      alert('Question created successfully.')
      fetchQuestions()
    } else {
      alert(`Error: ${data.error}`)
    }
  } catch (err) {
    alert('Failed to connect to backend server.')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  fetchQuestions()
  fetchCourses()
})
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <div class="bg-slate-900 text-white p-6 rounded-2xl flex justify-between items-center shadow-md">
      <div>
        <h1 class="text-xl font-bold flex items-center gap-2">
          <HelpCircle class="text-emerald-400" :size="22" /> Assessment Question Authoring
        </h1>
        <p class="text-xs text-slate-300">Map items by Program, Course Code, Outcomes, and Bloom's Taxonomy.</p>
      </div>
    </div>

    <!-- Curriculum Mapping & Metadata Panel -->
    <div class="bg-white border rounded-2xl p-6 shadow-sm space-y-6">
      <h2 class="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-2">1. Program & Curriculum Mapping</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <!-- Program Selector -->
        <div>
          <label class="font-bold text-slate-700 block mb-1">Program</label>
          <select v-model="form.program" @change="onProgramChange" class="w-full p-2.5 border rounded-lg bg-slate-50 font-bold text-slate-900">
            <option value="Both">Both (BSMT & BSMarE)</option>
            <option value="BSMT">BSMT (Marine Transportation)</option>
            <option value="BSMarE">BSMarE (Marine Engineering)</option>
          </select>
        </div>

        <!-- Course Code Selector -->
        <div>
          <label class="font-bold text-slate-700 block mb-1">Course Code</label>
          <select v-model="form.courseId" @change="onCourseChange" class="w-full p-2.5 border rounded-lg font-medium">
            <option value="">Select Course Code</option>
            <option v-for="c in filteredCourses" :key="c.id" :value="c.id">
              {{ c.code }} - {{ c.title }}
            </option>
          </select>
        </div>

        <!-- Course Outcome (CO) Selector -->
        <div>
          <label class="font-bold text-slate-700 block mb-1">Course Outcome (CO)</label>
          <select v-model="form.courseOutcomeId" @change="onCOChange" :disabled="!form.courseId" class="w-full p-2.5 border rounded-lg disabled:bg-slate-100">
            <option value="">Select Course Outcome</option>
            <option v-for="co in availableCourseOutcomes" :key="co.id || co.code" :value="co.id || co.code">
              {{ co.code || co.id }}: {{ co.description || co.title }}
            </option>
          </select>
        </div>

        <!-- Learning Outcome (LO) Selector -->
        <div>
          <label class="font-bold text-slate-700 block mb-1">Learning Outcome (LO)</label>
          <select v-model="form.learningOutcomeId" :disabled="!form.courseOutcomeId" class="w-full p-2.5 border rounded-lg disabled:bg-slate-100">
            <option value="">Select Learning Outcome</option>
            <option v-for="lo in availableLearningOutcomes" :key="lo.id || lo.code" :value="lo.id || lo.code">
              {{ lo.code || lo.id }}: {{ lo.description || lo.title }}
            </option>
          </select>
        </div>
      </div>

      <h2 class="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-2 pt-2">2. Item Details & Classification</h2>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <div>
          <label class="font-bold text-slate-700 block mb-1">Item Code</label>
          <input v-model="form.code" placeholder="e.g. NAV-2026-Q1" class="w-full p-2.5 border rounded-lg font-mono" />
        </div>

        <div>
          <label class="font-bold text-slate-700 block mb-1">STCW Standard</label>
          <select v-model="form.stcwStandard" class="w-full p-2.5 border rounded-lg">
            <option value="Table A-II/1">Table A-II/1 (Deck Officer)</option>
            <option value="Table A-III/1">Table A-III/1 (Engine Officer)</option>
            <option value="Table A-VI/1">Table A-VI/1 (Basic Safety)</option>
          </select>
        </div>

        <div>
          <label class="font-bold text-slate-700 block mb-1">Bloom's Taxonomy</label>
          <select v-model="form.bloomLevel" class="w-full p-2.5 border rounded-lg">
            <option value="Remembering">Remembering</option>
            <option value="Understanding">Understanding</option>
            <option value="Application">Application</option>
            <option value="Analysis">Analysis</option>
            <option value="Evaluation">Evaluation</option>
          </select>
        </div>

        <div>
          <label class="font-bold text-slate-700 block mb-1">Question Type</label>
          <select v-model="form.type" class="w-full p-2.5 border rounded-lg font-bold bg-emerald-50 text-emerald-900">
            <option value="multiple_choice">Multiple Choice</option>
            <option value="true_false">True / False</option>
            <option value="short_answer">Short Answer</option>
            <option value="matching">Matching Pairs</option>
          </select>
        </div>
      </div>

      <!-- Stem Input -->
      <div class="space-y-3">
        <label class="font-bold text-xs text-slate-700 block">Question Stem</label>
        <textarea v-model="form.text" rows="3" placeholder="Enter question statement..." class="w-full p-3 border rounded-xl text-xs"></textarea>

        <div class="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-dashed">
          <div class="flex-1">
            <span class="text-[11px] font-bold text-slate-700 block mb-1">Question Image (Optional)</span>
            <input type="file" accept="image/*" @change="e => handleFileUpload(e, form, 'imageUrl')" class="text-xs" />
          </div>
          <img v-if="form.imageUrl" :src="form.imageUrl" class="h-14 w-14 object-cover rounded border" />
        </div>
      </div>

      <!-- Action -->
      <button @click="saveQuestion" :disabled="isSubmitting" class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2">
        <Save :size="16" /> Save Question Item
      </button>
    </div>
  </div>
</template>