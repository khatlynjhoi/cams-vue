<script setup>
import { ref, onMounted, computed } from 'vue'
import {
  Plus, Trash2, Clock, Download,
  Upload, ChevronDown, ChevronRight, Search, Filter, ArrowUpDown,
  Pencil, RotateCcw
} from 'lucide-vue-next'

const courses = ref([])
const isLoading = ref(true)

// Accordion State
const expandedCourses = ref(new Set())
const expandedOutcomes = ref(new Set())

// Search, Filter, & Sort State
const searchQuery = ref('')
const filterProgram = ref('All')
const sortBy = ref('code')

// Form State (Manual / Editing)
const editingCourseId = ref(null)
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
const isUploadingBulk = ref(false)
const bulkFileInput = ref(null)

// Local Storage Cache
const STORAGE_KEY = 'cams_courses_data'

// --------------------------------------------------
// AUTHENTICATION HELPER
// --------------------------------------------------

function getAuthHeaders() {
  const token = localStorage.getItem('token')

  if (!token) {
    throw new Error('No authentication token found. Please log in again.')
  }

  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}

// --------------------------------------------------
// LOAD COURSES FROM LARAVEL
// --------------------------------------------------

async function loadCoursesFromStorage() {
  isLoading.value = true

  try {
    const response = await fetch(`http://127.0.0.1:8000/api/courses`, {
      method: 'GET',
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))

      throw new Error(
        errorData.message ||
        `Failed to load courses. HTTP ${response.status}`
      )
    }

    const data = await response.json()

    courses.value = Array.isArray(data)
      ? data.map(course => ({
          ...course,
          courseOutcomes: course.course_outcomes || []
        }))
      : []

    saveCoursesToStorage()

  } catch (err) {
    console.error('Failed to load courses from Laravel:', err)

    try {
      const savedData = localStorage.getItem(STORAGE_KEY)

      if (savedData) {
        courses.value = JSON.parse(savedData)
      } else {
        courses.value = []
      }
    } catch (storageError) {
      console.error(
        'Failed to load courses from localStorage:',
        storageError
      )

      courses.value = []
    }
  } finally {
    isLoading.value = false
  }
}

// --------------------------------------------------
// LOCAL STORAGE CACHE
// --------------------------------------------------

function saveCoursesToStorage() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(courses.value)
  )
}

// --------------------------------------------------
// INITIAL LOAD
// --------------------------------------------------

onMounted(() => {
  loadCoursesFromStorage()
})

// --------------------------------------------------
// ACCORDION FUNCTIONS
// --------------------------------------------------

function toggleCourse(courseId) {
  const next = new Set(expandedCourses.value)

  if (next.has(courseId)) {
    next.delete(courseId)
  } else {
    next.add(courseId)
  }

  expandedCourses.value = next
}

function toggleOutcome(coKey) {
  const next = new Set(expandedOutcomes.value)

  if (next.has(coKey)) {
    next.delete(coKey)
  } else {
    next.add(coKey)
  }

  expandedOutcomes.value = next
}

// --------------------------------------------------
// FILTER AND SORT
// --------------------------------------------------

const filteredAndSortedCourses = computed(() => {
  return courses.value
    .filter(c => {
      const matchesProgram =
        filterProgram.value === 'All' ||
        c.program === filterProgram.value ||
        c.program === 'Both' ||
        !c.program

      const query = searchQuery.value.toLowerCase()

      const matchesSearch =
        (c.code || '').toLowerCase().includes(query) ||
        (c.title || '').toLowerCase().includes(query)

      return matchesProgram && matchesSearch
    })
    .sort((a, b) => {
      if (sortBy.value === 'code') {
        return (a.code || '').localeCompare(b.code || '')
      }

      if (sortBy.value === 'title') {
        return (a.title || '').localeCompare(b.title || '')
      }

      return 0
    })
})

// --------------------------------------------------
// CO & LO HELPERS
// --------------------------------------------------

function addCourseOutcome() {
  const nextCoNum = courseOutcomes.value.length + 1

  courseOutcomes.value.push({
    id: `CO${nextCoNum}`,
    title: '',
    learningOutcomes: [
      {
        id: `LO${nextCoNum}.1`,
        description: '',
        hours: 0
      }
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
  if (
    courseOutcomes.value[coIndex].learningOutcomes.length > 1
  ) {
    courseOutcomes.value[coIndex].learningOutcomes.splice(
      loIndex,
      1
    )
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

// --------------------------------------------------
// EDIT COURSE
// --------------------------------------------------

function startEditCourse(course) {
  editingCourseId.value = course.id
  courseCode.value = course.code || ''
  courseTitle.value = course.title || ''
  courseProgram.value = course.program || 'BSMT'

  courseOutcomes.value = JSON.parse(
    JSON.stringify(course.courseOutcomes || [])
  )

  if (courseOutcomes.value.length === 0) {
    addCourseOutcome()
  }

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// --------------------------------------------------
// RESET / CANCEL EDIT
// --------------------------------------------------

function cancelEdit() {
  editingCourseId.value = null
  courseCode.value = ''
  courseTitle.value = ''
  courseProgram.value = 'BSMT'

  courseOutcomes.value = [
    {
      id: 'CO1',
      title: '',
      learningOutcomes: [
        {
          id: 'LO1.1',
          description: '',
          hours: 0
        }
      ]
    }
  ]
}

// --------------------------------------------------
// SAVE / UPDATE COURSE
// --------------------------------------------------

async function handleSaveCourse() {
  if (!courseCode.value || !courseTitle.value) {
    alert('Please enter both Course Code and Course Title.')
    return
  }

  try {
    const token = localStorage.getItem('token')

    if (!token) {
      alert('Your session has expired. Please log in again.')
      return
    }
  } catch (err) {
    alert('Unable to access your login session.')
    return
  }

  const payload = {
    code: courseCode.value.trim(),
    title: courseTitle.value.trim(),
    program: courseProgram.value,
    course_outcomes: JSON.parse(
      JSON.stringify(courseOutcomes.value)
    )
  }

  isLoading.value = true

  try {
    let response

    if (editingCourseId.value) {
      response = await fetch(
        `http://127.0.0.1:8000/api/courses/${editingCourseId.value}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        }
      )
    } else {
      response = await fetch(
        `http://127.0.0.1:8000/api/courses`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        }
      )
    }

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(
        data.message ||
        `Failed to save course. HTTP ${response.status}`
      )
    }

    const savedCourse = {
      ...data,
      courseOutcomes: data.course_outcomes || []
    }

    if (editingCourseId.value) {
      const index = courses.value.findIndex(
        c => c.id === editingCourseId.value
      )

      if (index !== -1) {
        courses.value[index] = savedCourse
      }

      alert('Course syllabus updated successfully!')
    } else {
      courses.value.unshift(savedCourse)
      alert('Course syllabus saved successfully!')
    }

    saveCoursesToStorage()
    cancelEdit()

  } catch (err) {
    console.error('Course save error:', err)
    alert(
      err.message ||
      'Unable to save course to Laravel.'
    )
  } finally {
    isLoading.value = false
  }
}

// --------------------------------------------------
// CSV TEMPLATE
// --------------------------------------------------

function downloadCSVTemplate() {
  const headers = [
    'program',
    'courseCode',
    'courseTitle',
    'courseOutcomeId',
    'courseOutcomeTitle',
    'learningOutcomeId',
    'learningOutcomeDescription',
    'hours'
  ]

  const sampleRows = [
    [
      'BSMT',
      'NAV-101',
      'Terrestrial and Coastal Navigation',
      'CO1',
      'Demonstrate competence in maintaining watch',
      'LO1.1',
      'Apply COLREG Rules 1 to 19',
      '12'
    ],
    [
      'BSMT',
      'NAV-101',
      'Terrestrial and Coastal Navigation',
      'CO1',
      'Demonstrate competence in maintaining watch',
      'LO1.2',
      'Calculate variation and deviation',
      '8'
    ],
    [
      'BSMT',
      'NAV-101',
      'Terrestrial and Coastal Navigation',
      'CO2',
      'Plan coastal passage',
      'LO2.1',
      'Plot DR positions and EP',
      '10'
    ],
    [
      'BSMarE',
      'ENG-201',
      'Marine Engineering Systems',
      'CO1',
      'Operate main propulsion machinery',
      'LO1.1',
      'Perform pre-start checks on main engine',
      '15'
    ]
  ]

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [
      headers.join(','),
      ...sampleRows.map(
        row =>
          row
            .map(cell => `"${cell}"`)
            .join(',')
      )
    ].join('\n')

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')

  link.setAttribute('href', encodedUri)
  link.setAttribute(
    'download',
    'course_import_template.csv'
  )

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// --------------------------------------------------
// CSV ROW PARSER HELPER
// --------------------------------------------------

function parseCSVLine(line) {
  const row = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++ // handle double-quote escape ("")
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      row.push(current.trim().replace(/^"|"$/g, ''))
      current = ''
    } else {
      current += char
    }
  }

  row.push(current.trim().replace(/^"|"$/g, ''))
  return row
}

// --------------------------------------------------
// PARSE COURSE CSV
// --------------------------------------------------

function parseCourseCSVText(csvText) {
  const lines = csvText
    .split(/\r\n|\n/)
    .filter(line => line.trim() !== '')

  if (lines.length < 2) {
    throw new Error('CSV file must contain a header row.')
  }

  const headers = parseCSVLine(lines[0])
  const courseMap = new Map()

  for (let i = 1; i < lines.length; i++) {
    const cleanRow = parseCSVLine(lines[i])

    if (cleanRow.length < 2) continue

    const rowObj = {}

    headers.forEach((header, idx) => {
      rowObj[header] = cleanRow[idx] || ''
    })

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
        co = {
          id: coId,
          title: coTitle || coId,
          learningOutcomes: []
        }

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

// --------------------------------------------------
// CSV UPLOAD HANDLER
// --------------------------------------------------

function handleBulkCSVUpload(event) {
  const file = event.target.files[0]
  csvParseError.value = ''

  if (!file) return

  csvFileName.value = file.name

  const reader = new FileReader()

  reader.onload = e => {
    try {
      bulkPreview.value = parseCourseCSVText(e.target.result)
    } catch (err) {
      csvParseError.value = err.message
      bulkPreview.value = []
    } finally {
      event.target.value = ''
    }
  }

  reader.readAsText(file)
}

// --------------------------------------------------
// BULK COURSE IMPORT
// --------------------------------------------------

async function submitBulkCourses() {
  if (bulkPreview.value.length === 0) return

  const token = localStorage.getItem('token')

  if (!token) {
    alert('Your session has expired. Please log in again.')
    return
  }

  if (
    !confirm(
      `Are you sure you want to import ${bulkPreview.value.length} course(s) into CAMS?`
    )
  ) {
    return
  }

  isUploadingBulk.value = true
  isLoading.value = true

  try {
    const importedCourses = []

    for (const course of bulkPreview.value) {
      const payload = {
        code: course.code,
        title: course.title,
        program: course.program,
        course_outcomes: course.courseOutcomes || []
      }

      const response = await fetch(
        `http://127.0.0.1:8000/api/courses`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        }
      )

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          data.message ||
          `Failed to import course ${course.code}.`
        )
      }

      importedCourses.push({
        ...data,
        courseOutcomes: data.course_outcomes || []
      })
    }

    courses.value = [
      ...importedCourses,
      ...courses.value
    ]

    saveCoursesToStorage()

    bulkPreview.value = []
    csvFileName.value = ''
    alert(`${importedCourses.length} course(s) imported successfully!`)

  } catch (err) {
    console.error('Bulk course import error:', err)
    alert(err.message || 'Unable to import courses to Laravel.')
  } finally {
    isUploadingBulk.value = false
    isLoading.value = false
  }
}

// --------------------------------------------------
// DELETE COURSE
// --------------------------------------------------

async function deleteCourse(id) {
  if (
    !confirm(
      'Are you sure you want to delete this course structure?'
    )
  ) {
    return
  }

  const token = localStorage.getItem('token')

  if (!token) {
    alert('Your session has expired. Please log in again.')
    return
  }

  isLoading.value = true

  try {
    const response = await fetch(
      `http://127.0.0.1:8000/api/courses/${id}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders()
      }
    )

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(
        data.message ||
        `Failed to delete course. HTTP ${response.status}`
      )
    }

    courses.value = courses.value.filter(c => c.id !== id)

    if (editingCourseId.value === id) {
      cancelEdit()
    }

    saveCoursesToStorage()
    alert('Course deleted successfully!')

  } catch (err) {
    console.error('Course deletion error:', err)
    alert(err.message || 'Unable to delete course from Laravel.')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="p-6 md:p-8 space-y-6 min-h-screen bg-[#f4f6f9] text-slate-800">
    <!-- Header -->
    <div class="bg-[#123524] text-white p-6 rounded-2xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shadow-sm">
      <div class="space-y-1">
        <h1 class="text-xl font-bold flex items-center gap-2 text-white tracking-tight">
          Course Builder
        </h1>
        <p class="text-xs text-white/80 font-normal">
          Define Programs, Course Codes, Titles, Outcomes (COs), and Learning Objectives (LOs) with hours allocation.
        </p>
      </div>
    </div>

    <!-- Manual Entry / Edit View -->
    <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
      
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-3 border-b pb-3">

        <!-- Title -->
        <h2 class="text-base font-bold text-gray-900 flex items-center gap-2">
          <Pencil 
            v-if="editingCourseId" 
            :size="18" 
            class="text-amber-600" 
          />
          <Plus 
            v-else 
            :size="18" 
            class="text-emerald-600" 
          /> 
          {{ editingCourseId ? 'Edit Course Syllabus' : 'Create New Course Syllabus' }}
        </h2>

        <!-- CSV Actions -->
        <div class="flex items-center gap-2 shrink-0">

          <!-- Download CSV Template -->
          <button 
            @click="downloadCSVTemplate" 
            type="button"
            class="px-4 py-2.5 bg-white hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-500 flex items-center gap-2 transition shadow-sm"
          >
            <Download :size="14" class="text-emerald-600" />
            Download .CSV Template
          </button>

          <!-- Bulk Upload CSV -->
          <label 
            class="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-2 transition shadow-sm"
          >
            <Upload :size="14" /> 
            <span>{{ isUploadingBulk ? 'Uploading...' : 'Bulk Upload CSV' }}</span>
            
            <input 
              ref="bulkFileInput" 
              type="file" 
              accept=".csv" 
              @change="handleBulkCSVUpload" 
              :disabled="isUploadingBulk" 
              class="hidden" 
            />
          </label>

          <!-- Cancel Edit -->
          <button 
            v-if="editingCourseId" 
            @click="cancelEdit" 
            class="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold bg-slate-100 px-2.5 py-2.5 rounded-xl border border-slate-200"
          >
            <RotateCcw :size="14" /> Cancel Edit
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1">Target Program</label>
          <select v-model="courseProgram" class="w-full text-xs p-2.5 border rounded-lg font-bold bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none">
            <option value="BSMT">BSMT</option>
            <option value="BSMarE">BSMarE</option>
            <option value="Both">Both (BSMT & BSMarE)</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1">Course Code</label>
          <input v-model="courseCode" placeholder="e.g. NAV1" class="w-full text-xs p-2.5 border rounded-lg font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>
        <div class="md:col-span-2">
          <label class="block text-xs font-bold text-gray-700 mb-1">Course Descriptive Title</label>
          <input v-model="courseTitle" placeholder="e.g. Navigational Instruments with Compasses" class="w-full text-xs p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
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
              class="w-full text-xs p-2 border rounded-lg font-semibold bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
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
                class="w-full text-xs p-2 border rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <div class="flex items-center gap-1 min-w-[120px]">
                <input 
                  type="number" 
                  v-model="lo.hours" 
                  min="0"
                  class="w-16 text-xs p-2 border rounded-lg text-center font-bold bg-white focus:ring-2 focus:ring-emerald-500 outline-none" 
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

      <!-- CSV Upload Preview -->
      <div 
        v-if="bulkPreview.length > 0 || csvParseError || csvFileName" 
        class="border-t border-gray-200 pt-5 space-y-4"
      >
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h3 class="text-xs font-bold text-slate-800">
            CSV Course Import
          </h3>

          <span 
            v-if="csvFileName" 
            class="text-[11px] text-emerald-700 font-semibold"
          >
            Loaded File: {{ csvFileName }}
          </span>
        </div>

        <p 
          v-if="csvParseError" 
          class="text-xs text-red-600 font-semibold"
        >
          {{ csvParseError }}
        </p>

        <!-- Preview parsed CSV structures -->
        <div v-if="bulkPreview.length > 0" class="space-y-4">
          <h3 class="text-xs font-bold text-slate-800">
            Parsed Course Preview ({{ bulkPreview.length }} Courses)
          </h3>

          <div class="space-y-3 max-h-80 overflow-y-auto pr-1">
            <div 
              v-for="(c, idx) in bulkPreview" 
              :key="idx" 
              class="border rounded-xl p-4 bg-slate-50 space-y-2"
            >
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 bg-slate-800 text-white font-mono text-xs font-bold rounded">
                  {{ c.program || 'BSMT' }}
                </span>
                <span class="px-2 py-0.5 bg-slate-200 text-slate-800 font-mono text-xs font-bold rounded">
                  {{ c.code }}
                </span>
                <span class="text-xs font-bold text-slate-900">
                  {{ c.title }}
                </span>
              </div>

              <div class="pl-4 space-y-1">
                <div 
                  v-for="co in c.courseOutcomes" 
                  :key="co.id" 
                  class="text-xs"
                >
                  <span class="font-bold text-slate-700">
                    {{ co.id }}: {{ co.title }}
                  </span>

                  <div 
                    v-for="lo in co.learningOutcomes" 
                    :key="lo.id" 
                    class="pl-4 text-gray-600 text-[11px] flex justify-between"
                  >
                    <span>
                      <strong>{{ lo.id }}:</strong> {{ lo.description }}
                    </span>
                    <span class="font-mono font-bold">
                      {{ lo.hours }} hrs
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button 
            @click="submitBulkCourses" 
            class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm"
          >
            Import All {{ bulkPreview.length }} Courses
          </button>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button 
          @click="handleSaveCourse" 
          class="px-6 py-2.5 text-xs font-bold text-white rounded-xl shadow-sm transition-colors"
          :class="editingCourseId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'"
        >
          {{ editingCourseId ? 'Update Syllabus & Structure' : 'Save Syllabus & Structure' }}
        </button>
        <button 
          v-if="editingCourseId" 
          @click="cancelEdit" 
          class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300"
        >
          Cancel
        </button>
      </div>
    </div>

    <!-- Search, Filter & Sort Toolbar -->
    <div class="bg-slate-100 p-4 rounded-xl flex flex-wrap gap-4 items-center justify-between border border-slate-200">
      <div class="flex items-center gap-3 flex-1 min-w-[280px]">
        <div class="relative w-full max-w-xs">
          <Search class="absolute left-3 top-2.5 text-slate-400" :size="14" />
          <input v-model="searchQuery" placeholder="Search course code or title..." class="w-full pl-8 pr-3 py-2 border rounded-lg text-xs bg-white outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>

        <div class="flex items-center gap-1.5 text-slate-700 font-bold text-xs">
          <Filter :size="14" />
          <select v-model="filterProgram" class="p-2 border rounded-lg text-xs bg-white outline-none cursor-pointer">
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
        <select v-model="sortBy" class="p-2 border rounded-lg text-xs bg-white outline-none cursor-pointer">
          <option value="code">Course Code</option>
          <option value="title">Course Title</option>
        </select>
      </div>
    </div>

    <!-- Collapsible Course Registry -->
    <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 bg-gray-50 border-b flex justify-between items-center">
        <h3 class="text-sm font-bold text-gray-900">Registered Courses ({{ filteredAndSortedCourses.length }})</h3>
      </div>

      <div v-if="filteredAndSortedCourses.length === 0" class="p-8 text-center text-slate-500 text-xs">
        No courses found matching your filter criteria.
      </div>

      <div class="divide-y">
        <div 
          v-for="c in filteredAndSortedCourses" 
          :key="c.id" 
          class="bg-white transition-colors"
          :class="{ 'bg-amber-50/40': editingCourseId === c.id }"
        >
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

            <div class="flex items-center gap-3">
              <span class="text-[11px] font-semibold text-slate-400">
                {{ c.courseOutcomes?.length || 0 }} Outcomes
              </span>
              <button 
                @click="startEditCourse(c)" 
                class="text-gray-400 hover:text-amber-600 p-1 hover:bg-amber-50 rounded transition-colors"
                title="Edit Course"
              >
                <Pencil :size="16" />
              </button>
              <button 
                @click="deleteCourse(c.id)" 
                class="text-gray-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors"
                title="Delete Course"
              >
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
            <div v-for="co in c.courseOutcomes" :key="co.id" class="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-xs">
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