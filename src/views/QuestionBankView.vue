<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus, Trash2, Image, Save, HelpCircle, Check, X, Eye } from 'lucide-vue-next'

const questions = ref([])
const courses = ref([])
const isSubmitting = ref(false)

const form = reactive({
  code: '',
  courseId: '',
  courseOutcomeId: 'CO1',
  learningOutcomeId: 'LO1.1',
  stcwStandard: 'Table A-II/1',
  bloomLevel: 'Understanding',
  type: 'multiple_choice', // multiple_choice | true_false | short_answer | matching
  text: '',
  imageUrl: '',
  
  // Type: Multiple Choice Options
  options: [
    { text: '', imageUrl: '', isCorrect: false },
    { text: '', imageUrl: '', isCorrect: false }
  ],
  
  // Type: True/False
  tfCorrect: 'true',
  
  // Type: Short Answer
  shortAnswerKeywords: '',
  
  // Type: Matching
  matchingPairs: [
    { prompt: '', promptImage: '', match: '', matchImage: '' },
    { prompt: '', promptImage: '', match: '', matchImage: '' }
  ]
})

// Image Upload Handler (Converts File to Base64 String)
function handleFileUpload(event, targetObj, propertyName) {
  const file = event.target.files[0]
  if (!file) return
  
  if (file.size > 2 * 1024 * 1024) {
    alert('File size exceeds 2MB limit.')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    targetObj[propertyName] = e.target.result
  }
  reader.readAsDataURL(file)
}

function removeImage(targetObj, propertyName) {
  targetObj[propertyName] = ''
}

// Option Management for Multiple Choice
function addOption() {
  form.options.push({ text: '', imageUrl: '', isCorrect: false })
}

function removeOption(index) {
  if (form.options.length > 2) {
    form.options.splice(index, 1)
  }
}

// Pair Management for Matching
function addPair() {
  form.matchingPairs.push({ prompt: '', promptImage: '', match: '', matchImage: '' })
}

function removePair(index) {
  if (form.matchingPairs.length > 2) {
    form.matchingPairs.splice(index, 1)
  }
}

async function fetchQuestions() {
  try {
    const res = await fetch('http://localhost:3001/api/questions')
    const data = await res.json()
    if (data.success) questions.value = data.data
  } catch (err) {
    console.error('Failed to load question bank:', err)
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
  if (!form.code || !form.text) {
    alert('Please complete the question code and stem text.')
    return
  }

  // Format payload based on question type
  let formattedOptions = []
  let formattedCorrectAnswer = null
  let formattedMatchingPairs = []

  if (form.type === 'multiple_choice') {
    formattedOptions = form.options.map(opt => ({ text: opt.text, imageUrl: opt.imageUrl }))
    // Array of indices marked as correct (supports single or multiple)
    formattedCorrectAnswer = form.options
      .map((opt, idx) => opt.isCorrect ? idx : null)
      .filter(val => val !== null)
    
    if (formattedCorrectAnswer.length === 0) {
      alert('Please mark at least one option as the correct answer.')
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

  const payload = {
    code: form.code,
    courseId: form.courseId || (courses.value[0]?.id || 'CRS-NAV101'),
    courseOutcomeId: form.courseOutcomeId,
    learningOutcomeId: form.learningOutcomeId,
    stcwStandard: form.stcwStandard,
    bloomLevel: form.bloomLevel,
    type: form.type,
    text: form.text,
    imageUrl: form.imageUrl,
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
      alert('Question saved to database.')
      resetForm()
      fetchQuestions()
    } else {
      alert(`Save error: ${data.error}`)
    }
  } catch (err) {
    alert('Failed to connect to backend server on port 3001.')
  } finally {
    isSubmitting.value = false
  }
}

function resetForm() {
  form.code = ''
  form.text = ''
  form.imageUrl = ''
  form.shortAnswerKeywords = ''
  form.options = [
    { text: '', imageUrl: '', isCorrect: false },
    { text: '', imageUrl: '', isCorrect: false }
  ]
  form.matchingPairs = [
    { prompt: '', promptImage: '', match: '', matchImage: '' },
    { prompt: '', promptImage: '', match: '', matchImage: '' }
  ]
}

onMounted(() => {
  fetchQuestions()
  fetchCourses()
})
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-8">
    <!-- Header -->
    <div class="bg-slate-900 text-white p-6 rounded-2xl flex justify-between items-center shadow-md">
      <div>
        <h1 class="text-xl font-bold flex items-center gap-2">
          <HelpCircle class="text-emerald-400" :size="22" /> STCW Question Authoring Suite
        </h1>
        <p class="text-xs text-slate-300">Create and manage multi-type assessment items with image media support.</p>
      </div>
      <span class="px-3 py-1 bg-slate-800 border border-slate-700 text-emerald-400 text-xs font-mono font-bold rounded-lg">
        Bank Size: {{ questions.length }} Items
      </span>
    </div>

    <!-- Question Authoring Form -->
    <div class="bg-white border rounded-2xl p-6 shadow-sm space-y-6">
      <h2 class="text-sm font-bold text-slate-900 border-b pb-3 uppercase tracking-wide">Question Metadata & Type Selection</h2>
      
      <!-- Metadata Row -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <div>
          <label class="font-bold text-slate-700 block mb-1">Item Code / Reference</label>
          <input v-model="form.code" placeholder="e.g. NAV-Q104" class="w-full p-2.5 border rounded-lg font-mono" />
        </div>

        <div>
          <label class="font-bold text-slate-700 block mb-1">STCW Standard</label>
          <select v-model="form.stcwStandard" class="w-full p-2.5 border rounded-lg">
            <option value="Table A-II/1">Table A-II/1 (Deck Officers)</option>
            <option value="Table A-III/1">Table A-III/1 (Engine Officers)</option>
            <option value="Table A-VI/1">Table A-VI/1 (Safety Training)</option>
          </select>
        </div>

        <div>
          <label class="font-bold text-slate-700 block mb-1">Bloom's Taxonomy Level</label>
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
          <select v-model="form.type" class="w-full p-2.5 border rounded-lg bg-emerald-50 text-emerald-900 font-bold">
            <option value="multiple_choice">Multiple Choice (Single/Multi Answer)</option>
            <option value="true_false">True / False</option>
            <option value="short_answer">Short Answer / Keywords</option>
            <option value="matching">Matching Pairs</option>
          </select>
        </div>
      </div>

      <!-- Question Stem Section -->
      <div class="space-y-3">
        <label class="font-bold text-xs text-slate-700 block">Question Stem / Scenario Text</label>
        <textarea v-model="form.text" rows="3" placeholder="Enter full question statement..." class="w-full p-3 border rounded-xl text-xs font-medium"></textarea>

        <!-- Question Stem Image Attachment -->
        <div class="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-dashed">
          <div class="flex-1">
            <span class="text-[11px] font-bold text-slate-700 block mb-1">Question Stem Diagram / Image (Optional)</span>
            <input type="file" accept="image/*" @change="e => handleFileUpload(e, form, 'imageUrl')" class="text-xs text-slate-500" />
          </div>
          <div v-if="form.imageUrl" class="relative group">
            <img :src="form.imageUrl" class="h-16 w-16 object-cover rounded-lg border" />
            <button @click="removeImage(form, 'imageUrl')" class="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-0.5 shadow">
              <X :size="12" />
            </button>
          </div>
        </div>
      </div>

      <hr class="border-slate-200" />

      <!-- TYPE 1: Multiple Choice Config -->
      <div v-if="form.type === 'multiple_choice'" class="space-y-4">
        <div class="flex justify-between items-center">
          <span class="text-xs font-bold text-slate-800">Multiple Choice Items (Check all correct answers)</span>
          <button @click="addOption" class="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1">
            <Plus :size="14" /> Add Option
          </button>
        </div>

        <div v-for="(opt, idx) in form.options" :key="idx" class="p-3 border rounded-xl space-y-2 bg-slate-50/50">
          <div class="flex items-center gap-3">
            <input type="checkbox" v-model="opt.isCorrect" title="Mark as correct answer" class="w-4 h-4 text-emerald-600 rounded" />
            <span class="font-mono text-xs font-bold">{{ String.fromCharCode(65 + idx) }}.</span>
            <input v-model="opt.text" :placeholder="'Option ' + String.fromCharCode(65 + idx) + ' text...'" class="flex-1 p-2 border rounded-lg text-xs bg-white" />
            
            <label class="cursor-pointer text-slate-500 hover:text-slate-800 p-2">
              <Image :size="16" />
              <input type="file" accept="image/*" @change="e => handleFileUpload(e, opt, 'imageUrl')" class="hidden" />
            </label>

            <button v-if="form.options.length > 2" @click="removeOption(idx)" class="text-red-500 hover:text-red-700 p-2">
              <Trash2 :size="16" />
            </button>
          </div>

          <!-- Option Image Preview -->
          <div v-if="opt.imageUrl" class="flex items-center gap-2 pl-10">
            <img :src="opt.imageUrl" class="h-12 w-12 object-cover rounded border" />
            <button @click="removeImage(opt, 'imageUrl')" class="text-xs text-red-600 font-bold">Remove Image</button>
          </div>
        </div>
      </div>

      <!-- TYPE 2: True / False Config -->
      <div v-else-if="form.type === 'true_false'" class="space-y-3">
        <span class="text-xs font-bold text-slate-800 block">Correct Statement Answer</span>
        <div class="flex gap-4">
          <label class="flex-1 p-4 border rounded-xl flex items-center gap-3 cursor-pointer hover:bg-slate-50">
            <input type="radio" value="true" v-model="form.tfCorrect" class="text-emerald-600" />
            <span class="text-xs font-bold">True</span>
          </label>
          <label class="flex-1 p-4 border rounded-xl flex items-center gap-3 cursor-pointer hover:bg-slate-50">
            <input type="radio" value="false" v-model="form.tfCorrect" class="text-emerald-600" />
            <span class="text-xs font-bold">False</span>
          </label>
        </div>
      </div>

      <!-- TYPE 3: Short Answer Config -->
      <div v-else-if="form.type === 'short_answer'" class="space-y-2">
        <span class="text-xs font-bold text-slate-800 block">Accepted Keywords / Exact Phrases (Comma Separated)</span>
        <input v-model="form.shortAnswerKeywords" placeholder="e.g. Deviation, Magnetic Error, Compass Deviation" class="w-full p-3 border rounded-xl text-xs font-mono" />
      </div>

      <!-- TYPE 4: Matching Pairs Config -->
      <div v-else-if="form.type === 'matching'" class="space-y-4">
        <div class="flex justify-between items-center">
          <span class="text-xs font-bold text-slate-800">Matching Pairs Configurator</span>
          <button @click="addPair" class="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1">
            <Plus :size="14" /> Add Matching Pair
          </button>
        </div>

        <div v-for="(pair, idx) in form.matchingPairs" :key="idx" class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-xl bg-slate-50 relative">
          <!-- Left Item -->
          <div class="space-y-2">
            <span class="text-[11px] font-bold text-slate-700 block">Premise Item {{ idx + 1 }}</span>
            <input v-model="pair.prompt" placeholder="Premise text..." class="w-full p-2 border rounded-lg text-xs bg-white" />
            <div class="flex items-center gap-2">
              <input type="file" accept="image/*" @change="e => handleFileUpload(e, pair, 'promptImage')" class="text-[10px]" />
              <img v-if="pair.promptImage" :src="pair.promptImage" class="h-8 w-8 object-cover rounded border" />
            </div>
          </div>

          <!-- Right Item -->
          <div class="space-y-2">
            <span class="text-[11px] font-bold text-slate-700 block">Target Match {{ idx + 1 }}</span>
            <input v-model="pair.match" placeholder="Matching target text..." class="w-full p-2 border rounded-lg text-xs bg-white" />
            <div class="flex items-center gap-2">
              <input type="file" accept="image/*" @change="e => handleFileUpload(e, pair, 'matchImage')" class="text-[10px]" />
              <img v-if="pair.matchImage" :src="pair.matchImage" class="h-8 w-8 object-cover rounded border" />
            </div>
          </div>

          <button v-if="form.matchingPairs.length > 2" @click="removePair(idx)" class="absolute top-2 right-2 text-red-500 hover:text-red-700">
            <X :size="14" />
          </button>
        </div>
      </div>

      <!-- Action Button -->
      <button @click="saveQuestion" :disabled="isSubmitting" class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2">
        <Save :size="16" /> {{ isSubmitting ? 'Saving to Database...' : 'Save Assessment Item' }}
      </button>
    </div>

    <!-- Questions Bank List View -->
    <div class="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
      <h2 class="text-sm font-bold text-slate-900 border-b pb-3 uppercase tracking-wide">Existing STCW Item Repository</h2>

      <div class="divide-y">
        <div v-for="q in questions" :key="q.id" class="py-4 space-y-2">
          <div class="flex justify-between items-start">
            <div class="space-x-2">
              <span class="font-mono text-xs font-bold text-slate-900 px-2 py-0.5 bg-slate-100 rounded">{{ q.code }}</span>
              <span class="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold uppercase">{{ q.type }}</span>
              <span class="text-xs text-slate-500 font-medium">{{ q.stcwStandard }} | {{ q.bloomLevel }}</span>
            </div>
          </div>

          <p class="text-xs font-semibold text-slate-800">{{ q.text }}</p>

          <img v-if="q.imageUrl" :src="q.imageUrl" class="h-20 w-auto object-cover rounded-lg border" />
        </div>
      </div>
    </div>
  </div>
</template>