<script setup>
import { ref, onMounted, computed } from 'vue'
import { Plus, Trash2, Clock, BookOpen, FileSpreadsheet, Download, Upload, ChevronDown, ChevronRight, Search, Filter, ArrowUpDown } from 'lucide-vue-next'

const courses = ref([])
const isLoading = ref(true)
const entryMode = ref('manual') // 'manual' | 'bulk'

// Accordion State
const expandedCourses = ref(new Set())
const expandedOutcomes = ref(new Set())

// Search, Filter, & Sort State
const searchQuery = ref('')
const filterProgram = ref('All')
const sortBy = ref('code')

// Form State (Manual)
const courseCode = ref('')
const courseTitle = ref('')
const courseProgram = ref('BSMT')
const courseOutcomes = ref([
  {
    id: 'CO1',
    title: '',
    learningOutcomes: [
      { id: 'LO1.1', description: '', hours: 0 }
    ]
  }
])

// CSV Upload & Preview State
const csvFileName = ref('')
const csvParseError = ref('')
const bulkPreview = ref([])

// --- LOCAL STORAGE PERSISTENCE ---
const STORAGE_KEY = 'cams_courses_data'

function loadCoursesFromStorage() {
  isLoading.value = true
  try {
    const savedData = localStorage.getItem(STORAGE_KEY)
    if (savedData) {
      courses.value = JSON.parse(savedData)
    } else {
      courses.value = []
    }
  } catch (err) {
    console.error('Failed to load courses from localStorage:', err)
  } finally {
    isLoading.value = false
  }
}

function saveCoursesToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(courses.value))
}

onMounted(() => {
  loadCoursesFromStorage()
})

// Accordion Toggle Functions
function toggleCourse(courseId) {
  if (expandedCourses.value.has(courseId)) {
    expandedCourses.value.delete(courseId)
  } else {
    expandedCourses.value.add(courseId)
  }
}

function toggleOutcome(coKey) {
  if (expandedOutcomes.value.has(coKey)) {
    expandedOutcomes.value.delete(coKey)
  } else {
    expandedOutcomes.value.add(coKey)
  }
}

// Filter and Sort Computed Property
const filteredAndSortedCourses = computed(() => {
  return courses.value
    .filter(c => {
      const matchesProgram = filterProgram.value === 'All' || c.program === filterProgram.value || c.program === 'Both' || !c.program
      const query = searchQuery.value.toLowerCase()
      const matchesSearch = (c.code || '').toLowerCase().includes(query) ||
                            (c.title || '').toLowerCase().includes(query)
      return matchesProgram && matchesSearch
    })
    .sort((a, b) => {
      if (sortBy.value === 'code') return (a.code || '').localeCompare(b.code || '')
      if (sortBy.value === 'title') return (a.title || '').localeCompare(b.title || '')
      return 0
    })
})

// CO & LO Helpers for Manual Form
function addCourseOutcome() {
  const nextCoNum = courseOutcomes.value.length + 1
  courseOutcomes.value.push({
    id: `CO${nextCoNum}`,
    title: '',
    learningOutcomes: [
      { id: `LO${nextCoNum}.1`, description: '', hours: 0 }
    ]
  })
}

function removeCourseOutcome(coIndex) {
  if (courseOutcomes.value.length > 1) {
    courseOutcomes.value.splice(coIndex, 1)
  }
}

function addLearningOutcome(coIndex) {
  const co = courseOutcomes.value[coIndex]
  const loNum = co.learningOutcomes.length + 1
  co.learningOutcomes.push({
    id: `LO${coIndex + 1}.${loNum}`,
    description: '',
    hours: 0
  })
}

function removeLearningOutcome(coIndex, loIndex) {
  if (courseOutcomes.value[coIndex].learningOutcomes.length > 1) {
    courseOutcomes.value[coIndex].learningOutcomes.splice(loIndex, 1)
  }
}

const totalCourseHours = computed(() => {
  let total = 0
  courseOutcomes.value.forEach(co => {
    co.learningOutcomes.forEach(lo => {
      total += Number(lo.hours) || 0
    })
  })
  return total
})

function handleSaveCourse() {
  if (!courseCode.value || !courseTitle.value) {
    alert('Please enter both Course Code and Course Title.')
    return
  }

  const newCourse = {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
    code: courseCode.value,
    title: courseTitle.value,
    program: courseProgram.value,
    courseOutcomes: JSON.parse(JSON.stringify(courseOutcomes.value))
  }

  courses.value.unshift(newCourse)
  saveCoursesToStorage()

  // Reset form
  courseCode.value = ''
  courseTitle.value = ''
  courseProgram.value = 'BSMT'
  courseOutcomes.value = [
    {
      id: 'CO1',
      title: '',
      learningOutcomes: [{ id: 'LO1.1', description: '', hours: 0 }]
    }
  ]
}

// Download Sample CSV Template
function downloadCSVTemplate() {
  const headers = ['program', 'courseCode', 'courseTitle', 'courseOutcomeId', 'courseOutcomeTitle', 'learningOutcomeId', 'learningOutcomeDescription', 'hours']
  const sampleRows = [
    ['BSMT', 'NAV-101', 'Terrestrial and Coastal Navigation', 'CO1', 'Demonstrate competence in maintaining watch', 'LO1.1', 'Apply COLREG Rules 1 to 19', '12'],
    ['BSMT', 'NAV-101', 'Terrestrial and Coastal Navigation', 'CO1', 'Demonstrate competence in maintaining watch', 'LO1.2', 'Calculate variation and deviation', '8'],
    ['BSMT', 'NAV-101', 'Terrestrial and Coastal Navigation', 'CO2', 'Plan coastal passage', 'LO2.1', 'Plot DR positions and EP', '10'],
    ['BSMarE', 'ENG-201', 'Marine Engineering Systems', 'CO1', 'Operate main propulsion machinery', 'LO1.1', 'Perform pre-start checks on main engine', '15']
  ]

  const csvContent = 'data:text/csv;charset=utf-8,' 
    + [headers.join(','), ...sampleRows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n')

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', 'course_import_template.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Parse Flattened Course CSV into Nested Course Tree
function parseCourseCSVText(csvText) {
  const lines = csvText.split(/\r\n|\n/).filter(line => line.trim() !== '')
  if (lines.length < 2) throw new Error('CSV file must contain a header row.')

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  const courseMap = new Map()

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',')
    const cleanRow = row.map(cell => cell.trim().replace(/^"|"$/g, '').replace(/""/g, '"'))

    if (cleanRow.length < 2) continue

    const rowObj = {}
    headers.forEach((header, idx) => { rowObj[header] = cleanRow[idx] || '' })

    const program = rowObj.program || 'BSMT'
    const code = rowObj.courseCode
    const title = rowObj.courseTitle
    const coId = rowObj.courseOutcomeId
    const coTitle = rowObj.courseOutcomeTitle
    const loId = rowObj.learningOutcomeId
    const loDesc = rowObj.learningOutcomeDescription
    const hours = Number(rowObj.hours) || 0

    if (!code || !title) continue

    if (!courseMap.has(code)) {
      courseMap.set(code, {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
        program,
        code,
        title,
        courseOutcomes: []
      })
    }

    const course = courseMap.get(code)

    if (coId) {
      let co = course.courseOutcomes.find(c => c.id === coId)
      if (!co) {
        co = { id: coId, title: coTitle || coId, learningOutcomes: [] }
        course.courseOutcomes.push(co)
      }

      if (loId) {
        co.learningOutcomes.push({
          id: loId,
          description: loDesc || '',
          hours
        })
      }
    }
  }

  return Array.from(courseMap.values())
}

function handleCSVUpload(event) {
  const file = event.target.files[0]
  csvParseError.value = ''
  if (!file) return

  csvFileName.value = file.name
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      bulkPreview.value = parseCourseCSVText(e.target.result)
    } catch (err) {
      csvParseError.value = err.message
      bulkPreview.value = []
    }
  }
  reader.readAsText(file)
}

function submitBulkCourses() {
  if (bulkPreview.value.length === 0) return

  courses.value = [...bulkPreview.value, ...courses.value]
  saveCoursesToStorage()

  bulkPreview.value = []
  csvFileName.value = ''
  entryMode.value = 'manual'
}

function deleteCourse(id) {
  if (!confirm('Are you sure you want to delete this course structure?')) return
  courses.value = courses.value.filter(c => c.id !== id)
  saveCoursesToStorage()
}
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 text-white p-6 rounded-2xl shadow-sm">
      <div>
        <h1 class="text-2xl font-bold flex items-center gap-2">
          <BookOpen :size="24" class="text-emerald-400" /> Maritime Course Syllabus Builder
        </h1>
        <p class="text-xs text-slate-300">Define Programs, Course Codes, Titles, Outcomes (COs), and Learning Objectives (LOs) with hours allocation.</p>
      </div>

      <div class="flex items-center gap-2 bg-slate-800 p-1.5 rounded-xl border border-slate-700">
        <button 
          @click="entryMode = 'manual'"
          :class="['px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5', entryMode === 'manual' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white']"
        >
          <Plus :size="16" /> Manual Creation
        </button>
        <button 
          @click="entryMode = 'bulk'"
          :class="['px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5', entryMode === 'bulk' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white']"
        >
          <FileSpreadsheet :size="16" /> CSV Bulk Upload
        </button>
      </div>
    </div>

    <!-- Manual Entry View -->
    <div v-if="entryMode === 'manual'" class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
      <h2 class="text-base font-bold text-gray-900 border-b pb-3 flex items-center gap-2">
        <Plus :size="18" class="text-emerald-600" /> Create New Course Syllabus
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1">Target Program</label>
          <select v-model="courseProgram" class="w-full text-xs p-2.5 border rounded-lg font-bold bg-slate-50">
            <option value="BSMT">BSMT</option>
            <option value="BSMarE">BSMarE</option>
            <option value="Both">Both (BSMT & BSMarE)</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1">Course Code</label>
          <input v-model="courseCode" placeholder="e.g. NAV-101" class="w-full text-xs p-2.5 border rounded-lg font-mono font-bold" />
        </div>
        <div class="md:col-span-2">
          <label class="block text-xs font-bold text-gray-700 mb-1">Course Descriptive Title</label>
          <input v-model="courseTitle" placeholder="e.g. Terrestrial and Coastal Navigation" class="w-full text-xs p-2.5 border rounded-lg" />
        </div>
      </div>

      <div class="space-y-6">
        <div class="flex justify-between items-center bg-gray-50 p-3 rounded-lg border">
          <span class="text-xs font-bold text-slate-800">Course Outcomes (CO) & Objectives (LO) Breakdown</span>
          <span class="text-xs font-bold text-emerald-700 flex items-center gap-1">
            <Clock :size="14" /> Total Hours: {{ totalCourseHours }} hrs
          </span>
        </div>

        <div v-for="(co, coIndex) in courseOutcomes" :key="coIndex" class="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-4">
          <div class="flex items-center gap-3">
            <span class="px-2.5 py-1 bg-slate-800 text-white font-mono text-xs font-bold rounded-lg">{{ co.id }}</span>
            <input 
              v-model="co.title" 
              :placeholder="`Course Outcome ${coIndex + 1} Description`" 
              class="w-full text-xs p-2 border rounded-lg font-semibold"
            />
            <button @click="removeCourseOutcome(coIndex)" class="text-red-500 hover:text-red-700 p-1">
              <Trash2 :size="16" />
            </button>
          </div>

          <div class="pl-6 border-l-2 border-emerald-500 space-y-3">
            <div class="flex justify-between items-center">
              <label class="text-[11px] font-bold text-slate-600 uppercase">Learning Objectives (LO) & Total Hours</label>
              <button @click="addLearningOutcome(coIndex)" class="text-xs text-emerald-700 font-bold hover:underline">+ Add LO</button>
            </div>

            <div v-for="(lo, loIndex) in co.learningOutcomes" :key="loIndex" class="flex items-center gap-3">
              <span class="text-xs font-mono font-bold text-slate-500 w-12">{{ lo.id }}</span>
              <input 
                v-model="lo.description" 
                placeholder="Learning Objective Description" 
                class="w-full text-xs p-2 border rounded-lg bg-white"
              />
              <div class="flex items-center gap-1 min-w-[120px]">
                <input 
                  type="number" 
                  v-model="lo.hours" 
                  min="0"
                  class="w-16 text-xs p-2 border rounded-lg text-center font-bold bg-white" 
                />
                <span class="text-xs text-gray-500 font-medium">hrs</span>
              </div>
              <button @click="removeLearningOutcome(coIndex, loIndex)" class="text-gray-400 hover:text-red-500 p-1">
                <Trash2 :size="14" />
              </button>
            </div>
          </div>
        </div>

        <button @click="addCourseOutcome" class="w-full py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1">
          <Plus :size="14" /> Add Another Course Outcome (CO)
        </button>
      </div>

      <button @click="handleSaveCourse" class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm">
        Save Syllabus & Structure
      </button>
    </div>

    <!-- Bulk CSV View -->
    <div v-else class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
      <div class="flex justify-between items-center border-b pb-3">
        <h2 class="text-base font-bold text-gray-900 flex items-center gap-2">
          <FileSpreadsheet :size="18" class="text-emerald-600" /> Bulk Course Import
        </h2>
        <button 
          @click="downloadCSVTemplate" 
          class="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
        >
          <Download :size="14" /> Download .CSV Template
        </button>
      </div>

      <div class="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-emerald-500 transition-colors">
        <Upload :size="32" class="mx-auto text-gray-400 mb-2" />
        <p class="text-xs font-bold text-gray-700">Select a course structure CSV file</p>
        <p class="text-[11px] text-gray-500 mt-1">Columns: program, courseCode, courseTitle, courseOutcomeId, courseOutcomeTitle, learningOutcomeId, learningOutcomeDescription, hours</p>
        <input type="file" accept=".csv" @change="handleCSVUpload" class="mt-3 text-xs" />
        <p v-if="csvFileName" class="text-xs text-emerald-700 font-bold mt-2">Loaded File: {{ csvFileName }}</p>
        <p v-if="csvParseError" class="text-xs text-red-600 font-semibold mt-2">{{ csvParseError }}</p>
      </div>

      <!-- Preview parsed CSV structures -->
      <div v-if="bulkPreview.length > 0" class="space-y-4">
        <h3 class="text-xs font-bold text-slate-800">Parsed Course Preview ({{ bulkPreview.length }} Courses)</h3>
        
        <div class="space-y-3 max-h-80 overflow-y-auto pr-1">
          <div v-for="(c, idx) in bulkPreview" :key="idx" class="border rounded-xl p-4 bg-slate-50 space-y-2">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 bg-slate-800 text-white font-mono text-xs font-bold rounded">{{ c.program || 'BSMT' }}</span>
              <span class="px-2 py-0.5 bg-slate-200 text-slate-800 font-mono text-xs font-bold rounded">{{ c.code }}</span>
              <span class="text-xs font-bold text-slate-900">{{ c.title }}</span>
            </div>

            <div class="pl-4 space-y-1">
              <div v-for="co in c.courseOutcomes" :key="co.id" class="text-xs">
                <span class="font-bold text-slate-700">{{ co.id }}: {{ co.title }}</span>
                <div v-for="lo in co.learningOutcomes" :key="lo.id" class="pl-4 text-gray-600 text-[11px] flex justify-between">
                  <span><strong>{{ lo.id }}:</strong> {{ lo.description }}</span>
                  <span class="font-mono font-bold">{{ lo.hours }} hrs</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button @click="submitBulkCourses" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm">
          Import All {{ bulkPreview.length }} Courses
        </button>
      </div>
    </div>

    <!-- Search, Filter & Sort Toolbar -->
    <div class="bg-slate-100 p-4 rounded-xl flex flex-wrap gap-4 items-center justify-between border">
      <div class="flex items-center gap-3 flex-1 min-w-[280px]">
        <div class="relative w-full max-w-xs">
          <Search class="absolute left-3 top-2.5 text-slate-400" :size="14" />
          <input v-model="searchQuery" placeholder="Search course code or title..." class="w-full pl-8 pr-3 py-2 border rounded-lg text-xs bg-white" />
        </div>

        <div class="flex items-center gap-1.5 text-slate-700 font-bold text-xs">
          <Filter :size="14" />
          <select v-model="filterProgram" class="p-2 border rounded-lg text-xs bg-white">
            <option value="All">All Programs</option>
            <option value="BSMT">BSMT Only</option>
            <option value="BSMarE">BSMarE Only</option>
            <option value="Both">Both Programs</option>
          </select>
        </div>
      </div>

      <div class="flex items-center gap-2 font-bold text-slate-700 text-xs">
        <ArrowUpDown :size="14" />
        <span>Sort By:</span>
        <select v-model="sortBy" class="p-2 border rounded-lg text-xs bg-white">
          <option value="code">Course Code</option>
          <option value="title">Course Title</option>
        </select>
      </div>
    </div>

    <!-- Collapsible Course Registry -->
    <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 bg-gray-50 border-b flex justify-between items-center">
        <h3 class="text-sm font-bold text-gray-900">Registered Maritime Courses ({{ filteredAndSortedCourses.length }})</h3>
      </div>

      <div v-if="filteredAndSortedCourses.length === 0" class="p-8 text-center text-slate-500 text-xs">
        No courses found matching your filter criteria.
      </div>

      <div class="divide-y">
        <div v-for="c in filteredAndSortedCourses" :key="c.id" class="bg-white">
          <!-- Course Level Accordion Header -->
          <div class="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
            <button @click="toggleCourse(c.id)" class="flex items-center gap-3 text-left flex-1">
              <component :is="expandedCourses.has(c.id) ? ChevronDown : ChevronRight" :size="18" class="text-slate-400" />
              <span class="px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider"
                    :class="{
                      'bg-blue-100 text-blue-800': c.program === 'BSMT',
                      'bg-amber-100 text-amber-800': c.program === 'BSMarE',
                      'bg-emerald-100 text-emerald-800': c.program === 'Both' || !c.program
                    }">
                {{ c.program || 'BSMT' }}
              </span>
              <span class="px-2 py-0.5 bg-slate-800 text-white font-mono text-xs font-bold rounded">{{ c.code }}</span>
              <span class="text-xs font-bold text-slate-900">{{ c.title }}</span>
            </button>

            <div class="flex items-center gap-4">
              <span class="text-[11px] font-semibold text-slate-400">
                {{ c.courseOutcomes?.length || 0 }} Outcomes
              </span>
              <button @click="deleteCourse(c.id)" class="text-gray-400 hover:text-red-600 p-1">
                <Trash2 :size="16" />
              </button>
            </div>
          </div>

          <!-- Course Level Collapsible Content -->
          <div v-if="expandedCourses.has(c.id)" class="px-6 pb-4 pt-1 bg-slate-50/50 space-y-3 border-t">
            <div v-if="!c.courseOutcomes || c.courseOutcomes.length === 0" class="text-xs text-slate-400 italic py-2">
              No course outcomes defined.
            </div>

            <!-- Course Outcome Level Accordion -->
            <div v-for="co in c.courseOutcomes" :key="co.id" class="border rounded-xl bg-white overflow-hidden shadow-xs">
              <button @click="toggleOutcome(`${c.id}-${co.id}`)" class="w-full p-3 flex items-center justify-between text-left hover:bg-slate-50 transition-colors">
                <div class="flex items-center gap-2 text-xs">
                  <component :is="expandedOutcomes.has(`${c.id}-${co.id}`) ? ChevronDown : ChevronRight" :size="16" class="text-slate-400" />
                  <span class="font-bold text-slate-800">{{ co.id }}:</span>
                  <span class="text-slate-700 font-medium">{{ co.title }}</span>
                </div>
                <span class="text-[10px] text-slate-400 font-semibold">{{ co.learningOutcomes?.length || 0 }} LOs</span>
              </button>

              <!-- Learning Outcomes Collapsible Content -->
              <div v-if="expandedOutcomes.has(`${c.id}-${co.id}`)" class="p-3 bg-slate-50/60 border-t space-y-2 pl-8">
                <div v-for="lo in co.learningOutcomes" :key="lo.id" class="flex justify-between items-center text-xs">
                  <div class="flex items-start gap-2 text-slate-700">
                    <span class="font-mono font-bold text-emerald-700 min-w-[45px]">{{ lo.id }}:</span>
                    <span>{{ lo.description }}</span>
                  </div>
                  <span class="font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-gray-200 text-[11px] min-w-[55px] text-center">
                    {{ lo.hours }} hrs
                  </span>
                </div>
                <div v-if="!co.learningOutcomes || co.learningOutcomes.length === 0" class="text-xs text-slate-400 italic">
                  No learning outcomes attached.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>