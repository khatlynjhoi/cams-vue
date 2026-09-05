<script setup>
import { ref, computed, onMounted } from 'vue'
import { Printer, Sparkles, BookOpen, Layers } from 'lucide-vue-next'

const courses = ref([])
const program = ref('BSMT')
const term = ref('Midterm')
const selectedCourseId = ref('')
const totalItems = ref(10)
const generatedExam = ref([])
const isGenerating = ref(false)

const bloomRatios = ref({
  Remembering: 30,
  Understanding: 40,
  Application: 20,
  Analysis: 10
})

// Cascading filter for courses based on selected Program
const filteredCourses = computed(() => {
  return courses.value.filter(c => c.program === program.value || c.program === 'Both' || !c.program)
})

function onProgramChange() {
  selectedCourseId.value = ''
}

async function fetchCourses() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/courses')
    const data = await res.json()
    if (data.success) courses.value = data.data
  } catch (err) {
    console.error(err)
  }
}

onMounted(fetchCourses)

async function generateExamPaper() {
  if (!selectedCourseId.value) {
    alert('Please select a course.')
    return
  }

  isGenerating.value = true
  try {
    const res = await fetch('http://127.0.0.1:8000/api/exams/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        program: program.value,
        term: term.value,
        courseId: selectedCourseId.value,
        totalItems: Number(totalItems.value),
        bloomRatios: bloomRatios.value
      })
    })
    const data = await res.json()
    if (data.success) {
      generatedExam.value = data.exam
    } else {
      alert(data.message || 'Failed to generate exam paper.')
    }
  } catch (err) {
    alert('Failed to generate exam paper.')
  } finally {
    isGenerating.value = false
  }
}

function triggerPrint() {
  window.print()
}
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <!-- Config Card (Hidden during browser print) -->
    <div class="print:hidden bg-slate-900 text-white p-6 rounded-2xl shadow-sm space-y-4">
      <h1 class="text-xl font-bold flex items-center gap-2">
        <Sparkles class="text-emerald-400" :size="20" /> STCW Exam & Assessment Paper Generator
      </h1>

      <div class="grid grid-cols-1 md:grid-cols-5 gap-3 border-t border-slate-800 pt-4">
        <!-- Program Selection -->
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1">Program</label>
          <select v-model="program" @change="onProgramChange" class="w-full text-xs p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-semibold">
            <option value="BSMT">BSMT</option>
            <option value="BSMarE">BSMarE</option>
          </select>
        </div>

        <!-- Term Selection -->
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1">Academic Term</label>
          <select v-model="term" class="w-full text-xs p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-semibold">
            <option value="Midterm">Midterm</option>
            <option value="Final">Final</option>
          </select>
        </div>

        <!-- Target Course (Cascaded) -->
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1">Select Target Course</label>
          <select v-model="selectedCourseId" class="w-full text-xs p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-semibold">
            <option value="" disabled>-- Select Course --</option>
            <option v-for="c in filteredCourses" :key="c.id" :value="c.id">{{ c.code }} - {{ c.title }}</option>
          </select>
        </div>

        <!-- Total Items -->
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1">Total Question Count</label>
          <input type="number" v-model="totalItems" min="1" max="50" class="w-full text-xs p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-bold" />
        </div>

        <!-- Generate Button -->
        <div class="flex items-end">
          <button @click="generateExamPaper" :disabled="isGenerating" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors">
            {{ isGenerating ? 'Generating...' : 'Auto-Generate Test Paper' }}
          </button>
        </div>
      </div>

      <!-- Bloom Taxonomy Ratio Controls -->
      <div class="bg-slate-800 p-4 rounded-xl space-y-2 border border-slate-700">
        <label class="text-xs font-bold text-emerald-400 block">Cognitive Distribution Ratios (% Target)</label>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div v-for="(val, level) in bloomRatios" :key="level" class="flex items-center gap-2">
            <span class="text-slate-300 text-[11px] font-medium w-24">{{ level }}</span>
            <input type="number" v-model="bloomRatios[level]" min="0" max="100" class="w-16 p-1 bg-slate-900 border border-slate-700 rounded text-center text-xs font-bold text-white" />
            <span class="text-slate-400">%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Printable Exam Document View -->
    <div v-if="generatedExam.length > 0" class="bg-white border rounded-2xl p-8 shadow-sm space-y-6 print:p-0 print:border-none">
      <div class="flex justify-between items-center border-b pb-4 print:hidden">
        <span class="text-xs font-bold text-slate-700">Exam Preview Generated ({{ generatedExam.length }} items)</span>
        <button @click="triggerPrint" class="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg flex items-center gap-1.5">
          <Printer :size="16" /> Print / Save PDF
        </button>
      </div>

      <!-- Formal Assessment Header -->
      <div class="text-center space-y-1 border-b-2 border-slate-900 pb-4">
        <h2 class="text-lg font-bold tracking-wide uppercase">MARITIME ACADEMY ASSESSMENT CENTER</h2>
        <h3 class="text-sm font-semibold text-slate-800">{{ program }} {{ term.toUpperCase() }} EXAMINATION PAPER</h3>
        <p class="text-xs text-slate-600">Course Code: {{ selectedCourseId }} | Standard: STCW Table A-II/1</p>
      </div>

      <!-- Student Credentials Header -->
      <div class="grid grid-cols-2 gap-4 text-xs font-bold border p-3 rounded-lg bg-slate-50 print:bg-transparent">
        <div>Cadet Name: __________________________________</div>
        <div>Date: ________________________</div>
        <div>Student ID: ___________________________________</div>
        <div>Score: ________ / {{ generatedExam.length }}</div>
      </div>

      <!-- Exam Items -->
      <div class="space-y-6 pt-2">
        <div v-for="(q, idx) in generatedExam" :key="q.id" class="space-y-2 text-xs">
          <div class="font-bold flex gap-2 text-slate-900">
            <span>{{ idx + 1 }}.</span>
            <div>
              <p>{{ q.text }} <span class="print:hidden text-[10px] text-slate-400 font-normal">({{ q.bloomLevel }})</span></p>
              <img v-if="q.imageUrl" :src="q.imageUrl" class="mt-2 max-h-40 rounded border" />
            </div>
          </div>

          <!-- Multiple Choice Options -->
          <div v-if="q.type === 'multiple_choice'" class="grid grid-cols-2 gap-2 pl-5 text-slate-700">
            <div v-for="(opt, optIdx) in q.options" :key="optIdx">
              <strong>{{ String.fromCharCode(65 + optIdx) }}.</strong> {{ opt.text || opt }}
            </div>
          </div>

          <!-- True/False Options -->
          <div v-else-if="q.type === 'true_false'" class="flex gap-6 pl-5 font-bold text-slate-700">
            <span>[ &nbsp; ] True</span>
            <span>[ &nbsp; ] False</span>
          </div>

          <!-- Short Answer Line -->
          <div v-else-if="q.type === 'short_answer'" class="pl-5 border-b border-dashed border-slate-400 h-6 w-3/4"></div>

          <!-- Matching Type -->
          <div v-else-if="q.type === 'matching' && q.matchingPairs" class="pl-5 space-y-1">
            <div v-for="(pair, pIdx) in q.matchingPairs" :key="pIdx" class="grid grid-cols-2 gap-4 text-slate-700">
              <div>______ {{ pIdx + 1 }}. {{ pair.prompt }}</div>
              <div>{{ String.fromCharCode(65 + pIdx) }}. {{ pair.match }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>