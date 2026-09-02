<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { HelpCircle, Save, Plus, Trash2, Image, X, Upload, Download, FileText } from 'lucide-vue-next'

const questions = ref([])
const courses = ref([])
const isSubmitting = ref(false)
const isUploadingBulk = ref(false)
const bulkFileInput = ref(null)

const form = reactive({
  program: 'Both', // BSMarE | BSMT | Both
  term: 'Midterm', // Midterm | Final
  courseId: '',
  courseOutcomeId: '',
  learningOutcomeId: '',
  bloomLevel: 'Understanding',
  type: 'multiple_choice', // multiple_choice | true_false | short_answer | matching
  text: '',
  imageUrl: '',
  
  options: [
    { text: '', imageUrl: '', isCorrect: false },
    { text: '', imageUrl: '', isCorrect: false },
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

// Cascading Courses based on Program Filter
const filteredCourses = computed(() => {
  if (form.program === 'Both') return courses.value
  return courses.value.filter(c => !c.program || c.program === form.program || c.program === 'Both')
})

// Cascading Course Outcomes (CO)
const availableCourseOutcomes = computed(() => {
  const selectedCourse = courses.value.find(c => c.id === form.courseId)
  if (!selectedCourse || !selectedCourse.courseOutcomes) return []
  return selectedCourse.courseOutcomes
})

// Cascading Learning Outcomes (LO)
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

function addOption() {
  form.options.push({ text: '', imageUrl: '', isCorrect: false })
}

function removeOption(index) {
  if (form.options.length > 2) {
    form.options.splice(index, 1)
  }
}

function addMatchingPair() {
  form.matchingPairs.push({ prompt: '', promptImage: '', match: '', matchImage: '' })
}

function removeMatchingPair(index) {
  if (form.matchingPairs.length > 2) {
    form.matchingPairs.splice(index, 1)
  }
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
  if (!form.courseId || !form.text) {
    alert('Please select a Course Code and enter Question Stem.')
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
      alert('Please check at least one correct option.')
      return
    }
  } else if (form.type === 'true_false') {
    formattedOptions = ['True', 'False']
    formattedCorrectAnswer = form.tfCorrect === 'true' ? 0 : 1
  } else if (form.type === 'short_answer') {
    formattedCorrectAnswer = form.shortAnswerKeywords.split(',').map(s => s.trim()).filter(Boolean)
  } else if (form.type === 'matching') {
    formattedMatchingPairs = form.matchingPairs
  }

  const payload = {
    ...form,
    options: formattedOptions,
    correctAnswer: formattedCorrectAnswer,
    matchingPairs: formattedMatchingPairs
  }

  isSubmitting.value = true
  try {
    const res = await fetch('http://localhost:3001/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    if (data.success) {
      alert('Question saved successfully!')
      fetchQuestions()
    } else {
      alert(`Error: ${data.error}`)
    }
  } catch (err) {
    alert('Failed to save question item.')
  } finally {
    isSubmitting.value = false
  }
}

// --- CSV TEMPLATE DOWNLOAD & BULK UPLOAD ---
function downloadCSVTemplate() {
  const headers = ['Program', 'Term', 'CourseId', 'CourseOutcomeId', 'LearningOutcomeId', 'BloomLevel', 'QuestionType', 'QuestionText', 'OptionsPipeSeparated', 'CorrectAnswerIndexOrText']
  const sampleRows = [
    ['BSMT', 'Midterm', 'CRS-101', 'CO1', 'LO1.1', 'Understanding', 'multiple_choice', 'What is the primary function of an ECDIS?', 'Electronic Chart Display|Radar Display|Sonar System|GMDSS Radio', '0'],
    ['BSMarE', 'Final', 'CRS-102', 'CO2', 'LO2.1', 'Remembering', 'true_false', 'Is a diesel engine an internal combustion engine?', 'True|False', '0'],
    ['Both', 'Midterm', 'CRS-103', 'CO1', 'LO1.2', 'Analysis', 'short_answer', 'Name the standard international maritime buoyage system.', '', 'IALA, IALA System']
  ]

  const csvContent = [headers.join(','), ...sampleRows.map(r => r.map(field => `"${field.replace(/"/g, '""')}"`).join(','))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.setAttribute('download', 'question_bank_template.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function handleBulkCSVUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      isUploadingBulk.value = true
      const text = e.target.result
      const lines = text.split('\n').filter(l => l.trim().length > 0)
      
      if (lines.length < 2) {
        alert('CSV file appears empty or missing rows.')
        return
      }

      const parsedQuestions = []
      for (let i = 1; i < lines.length; i++) {
        // Basic CSV Row Regex Parser
        const matches = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)
        const cols = lines[i].split(',').map(c => c.replace(/^"|"$/g, '').trim())

        if (cols.length >= 8) {
          const program = cols[0] || 'Both'
          const term = cols[1] || 'Midterm'
          const courseId = cols[2] || ''
          const courseOutcomeId = cols[3] || ''
          const learningOutcomeId = cols[4] || ''
          const bloomLevel = cols[5] || 'Understanding'
          const type = cols[6] || 'multiple_choice'
          const qText = cols[7] || ''
          const rawOptions = cols[8] ? cols[8].split('|') : []
          const rawCorrect = cols[9] || '0'

          let options = []
          let correctAnswer = null

          if (type === 'multiple_choice') {
            options = rawOptions.map(o => ({ text: o, imageUrl: '' }))
            correctAnswer = [parseInt(rawCorrect) || 0]
          } else if (type === 'true_false') {
            options = ['True', 'False']
            correctAnswer = parseInt(rawCorrect) || 0
          } else if (type === 'short_answer') {
            correctAnswer = rawCorrect.split(',').map(s => s.trim())
          }

          parsedQuestions.push({
            program,
            term,
            courseId,
            courseOutcomeId,
            learningOutcomeId,
            bloomLevel,
            type,
            text: qText,
            options,
            correctAnswer,
            matchingPairs: []
          })
        }
      }

      if (parsedQuestions.length === 0) {
        alert('No valid question rows found in CSV.')
        return
      }

      const res = await fetch('http://localhost:3001/api/questions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: parsedQuestions })
      })
      const data = await res.json()
      if (data.success) {
        alert(`Successfully imported ${data.count} questions!`)
        fetchQuestions()
      } else {
        alert(`Upload failed: ${data.error}`)
      }
    } catch (err) {
      alert('Error parsing CSV file.')
    } finally {
      isUploadingBulk.value = false
      if (bulkFileInput.value) bulkFileInput.value.value = ''
    }
  }
  reader.readAsText(file)
}

onMounted(() => {
  fetchQuestions()
  fetchCourses()
})
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <!-- Header Banner & CSV Upload Actions -->
    <div class="bg-slate-900 text-white p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md">
      <div>
        <h1 class="text-xl font-bold flex items-center gap-2">
          <HelpCircle class="text-emerald-400" :size="22" /> Assessment Question Authoring
        </h1>
        <p class="text-xs text-slate-300">Map items by Program, Term, Course Code, Outcomes, and Bloom's Taxonomy.</p>
      </div>

      <!-- CSV Actions -->
      <div class="flex items-center gap-3">
        <button @click="downloadCSVTemplate" type="button" class="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-2 transition">
          <Download :size="14" /> Download CSV Template
        </button>

        <label class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-2 transition shadow-sm">
          <Upload :size="14" /> {{ isUploadingBulk ? 'Importing...' : 'Bulk Upload CSV' }}
          <input ref="bulkFileInput" type="file" accept=".csv" @change="handleBulkCSVUpload" :disabled="isUploadingBulk" class="hidden" />
        </label>
      </div>
    </div>

    <!-- Main Container -->
    <div class="bg-white border rounded-2xl p-6 shadow-sm space-y-6">
      
      <!-- 1. Program & Curriculum Mapping -->
      <h2 class="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-2">1. Program & Curriculum Mapping</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs">
        <!-- Program -->
        <div>
          <label class="font-bold text-slate-700 block mb-1">Program</label>
          <select v-model="form.program" @change="onProgramChange" class="w-full p-2.5 border rounded-lg bg-slate-50 font-bold text-slate-900">
            <option value="Both">Both (BSMT & BSMarE)</option>
            <option value="BSMT">BSMT (Marine Transportation)</option>
            <option value="BSMarE">BSMarE (Marine Engineering)</option>
          </select>
        </div>

        <!-- Term -->
        <div>
          <label class="font-bold text-slate-700 block mb-1">Academic Term</label>
          <select v-model="form.term" class="w-full p-2.5 border rounded-lg bg-emerald-50 text-emerald-900 font-bold border-emerald-300">
            <option value="Midterm">Midterm</option>
            <option value="Final">Finals</option>
          </select>
        </div>

        <!-- Course Code -->
        <div>
          <label class="font-bold text-slate-700 block mb-1">Course Code</label>
          <select v-model="form.courseId" @change="onCourseChange" class="w-full p-2.5 border rounded-lg font-medium">
            <option value="">Select Course Code</option>
            <option v-for="c in filteredCourses" :key="c.id" :value="c.id">
              {{ c.code }} - {{ c.title }}
            </option>
          </select>
        </div>

        <!-- Course Outcome (CO) -->
        <div>
          <label class="font-bold text-slate-700 block mb-1">Course Outcome (CO)</label>
          <select v-model="form.courseOutcomeId" @change="onCOChange" :disabled="!form.courseId" class="w-full p-2.5 border rounded-lg disabled:bg-slate-100">
            <option value="">Select Course Outcome</option>
            <option v-for="co in availableCourseOutcomes" :key="co.id || co.code" :value="co.id || co.code">
              {{ co.code || co.id }}: {{ co.description || co.title }}
            </option>
          </select>
        </div>

        <!-- Learning Outcome (LO) -->
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

      <!-- 2. Item Details & Classification -->
      <h2 class="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-2 pt-2">2. Item Classification</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
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
          <select v-model="form.type" class="w-full p-2.5 border rounded-lg font-bold bg-slate-50 text-slate-900">
            <option value="multiple_choice">Multiple Choice</option>
            <option value="true_false">True / False</option>
            <option value="short_answer">Short Answer</option>
            <option value="matching">Matching Type</option>
          </select>
        </div>
      </div>

      <!-- Question Stem & Image Upload -->
      <div class="space-y-3">
        <label class="font-bold text-xs text-slate-700 block">Question Stem</label>
        <textarea v-model="form.text" rows="3" placeholder="Enter question statement..." class="w-full p-3 border rounded-xl text-xs"></textarea>

        <div class="bg-slate-50 p-3 rounded-xl border border-dashed flex items-center justify-between">
          <div>
            <span class="text-[11px] font-bold text-slate-700 block">Question Image (Optional)</span>
            <input type="file" accept="image/*" @change="e => handleFileUpload(e, form, 'imageUrl')" class="text-xs mt-1" />
          </div>
          <div v-if="form.imageUrl" class="relative">
            <img :src="form.imageUrl" class="h-16 w-16 object-cover rounded-lg border shadow-sm" />
            <button @click="removeImage(form, 'imageUrl')" class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
              <X :size="10" />
            </button>
          </div>
        </div>
      </div>

      <!-- 3. Dynamic Answers Section -->
      <h2 class="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-2 pt-2">3. Options & Correct Answers</h2>

      <!-- MULTIPLE CHOICE -->
      <div v-if="form.type === 'multiple_choice'" class="space-y-3 bg-slate-50 p-4 rounded-xl border">
        <div class="flex justify-between items-center">
          <span class="text-xs font-bold text-slate-700">Options & Correct Answer(s) (Check all that apply)</span>
          <button @click="addOption" type="button" class="text-xs text-emerald-600 font-bold flex items-center gap-1 hover:underline">
            <Plus :size="14" /> Add Option
          </button>
        </div>

        <div v-for="(opt, idx) in form.options" :key="idx" class="flex items-center gap-3 bg-white p-3 rounded-xl border shadow-sm">
          <input type="checkbox" v-model="opt.isCorrect" title="Mark as correct answer" class="h-4 w-4 text-emerald-600 rounded border-slate-300" />
          <input v-model="opt.text" :placeholder="`Option ${idx + 1} text...`" class="flex-1 p-2 border rounded-lg text-xs" />

          <div class="flex items-center gap-2">
            <label class="cursor-pointer p-2 border rounded-lg hover:bg-slate-50 text-slate-600 flex items-center gap-1 text-[11px] font-semibold">
              <Image :size="14" /> {{ opt.imageUrl ? 'Change Image' : 'Image' }}
              <input type="file" accept="image/*" class="hidden" @change="e => handleFileUpload(e, opt, 'imageUrl')" />
            </label>
            <div v-if="opt.imageUrl" class="relative">
              <img :src="opt.imageUrl" class="h-8 w-8 object-cover rounded border" />
              <button @click="removeImage(opt, 'imageUrl')" class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5">
                <X :size="10" />
              </button>
            </div>
          </div>

          <button v-if="form.options.length > 2" @click="removeOption(idx)" class="text-red-500 hover:text-red-700 p-1">
            <Trash2 :size="16" />
          </button>
        </div>
      </div>

      <!-- TRUE / FALSE -->
      <div v-if="form.type === 'true_false'" class="space-y-3 bg-slate-50 p-4 rounded-xl border">
        <label class="font-bold text-xs text-slate-700 block">Select Correct Answer</label>
        <div class="flex gap-6 text-xs font-bold text-slate-800">
          <label class="flex items-center gap-2 cursor-pointer bg-white px-4 py-2.5 rounded-xl border hover:border-emerald-500">
            <input type="radio" value="true" v-model="form.tfCorrect" name="tf_answer" class="text-emerald-600" /> True
          </label>
          <label class="flex items-center gap-2 cursor-pointer bg-white px-4 py-2.5 rounded-xl border hover:border-emerald-500">
            <input type="radio" value="false" v-model="form.tfCorrect" name="tf_answer" class="text-emerald-600" /> False
          </label>
        </div>
      </div>

      <!-- SHORT ANSWER -->
      <div v-if="form.type === 'short_answer'" class="space-y-3 bg-slate-50 p-4 rounded-xl border">
        <label class="font-bold text-xs text-slate-700 block">Accepted Keywords / Answer Phrases (Comma-Separated)</label>
        <input v-model="form.shortAnswerKeywords" placeholder="e.g. Navigation, GPS, ECDIS" class="w-full p-2.5 border rounded-lg text-xs bg-white" />
        <p class="text-[11px] text-slate-500">Cadet responses matching any of these keywords will be marked as correct.</p>
      </div>

      <!-- MATCHING TYPE -->
      <div v-if="form.type === 'matching'" class="space-y-3 bg-slate-50 p-4 rounded-xl border">
        <div class="flex justify-between items-center">
          <span class="text-xs font-bold text-slate-700">Matching Pairs (Prompts & Answers)</span>
          <button @click="addMatchingPair" type="button" class="text-xs text-emerald-600 font-bold flex items-center gap-1 hover:underline">
            <Plus :size="14" /> Add Pair
          </button>
        </div>

        <div v-for="(pair, idx) in form.matchingPairs" :key="idx" class="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-3 rounded-xl border relative">
          <div class="space-y-2">
            <span class="text-[11px] font-bold text-slate-500">Item {{ idx + 1 }} (Prompt)</span>
            <input v-model="pair.prompt" placeholder="Prompt text..." class="w-full p-2 border rounded-lg text-xs" />
            <div class="flex items-center gap-2">
              <label class="cursor-pointer text-[11px] font-bold text-slate-600 flex items-center gap-1 border px-2 py-1 rounded bg-slate-50">
                <Image :size="12" /> {{ pair.promptImage ? 'Change Image' : 'Add Image' }}
                <input type="file" accept="image/*" class="hidden" @change="e => handleFileUpload(e, pair, 'promptImage')" />
              </label>
              <div v-if="pair.promptImage" class="relative">
                <img :src="pair.promptImage" class="h-8 w-8 object-cover rounded border" />
                <button @click="removeImage(pair, 'promptImage')" class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5">
                  <X :size="10" />
                </button>
              </div>
            </div>
          </div>

          <div class="space-y-2 pr-6">
            <span class="text-[11px] font-bold text-slate-500">Matching Answer</span>
            <input v-model="pair.match" placeholder="Matching answer text..." class="w-full p-2 border rounded-lg text-xs" />
            <div class="flex items-center gap-2">
              <label class="cursor-pointer text-[11px] font-bold text-slate-600 flex items-center gap-1 border px-2 py-1 rounded bg-slate-50">
                <Image :size="12" /> {{ pair.matchImage ? 'Change Image' : 'Add Image' }}
                <input type="file" accept="image/*" class="hidden" @change="e => handleFileUpload(e, pair, 'matchImage')" />
              </label>
              <div v-if="pair.matchImage" class="relative">
                <img :src="pair.matchImage" class="h-8 w-8 object-cover rounded border" />
                <button @click="removeImage(pair, 'matchImage')" class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5">
                  <X :size="10" />
                </button>
              </div>
            </div>
          </div>

          <button v-if="form.matchingPairs.length > 2" @click="removeMatchingPair(idx)" class="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1">
            <Trash2 :size="14" />
          </button>
        </div>
      </div>

      <!-- Submit Action -->
      <button @click="saveQuestion" :disabled="isSubmitting" class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition">
        <Save :size="16" /> Save Question Item
      </button>

    </div>
  </div>
</template>