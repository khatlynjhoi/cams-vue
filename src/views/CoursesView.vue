<template>
  <div class="p-4 md:p-6 max-w-8xl mx-auto space-y-6 font-sans text-slate-800 antialiased min-h-screen bg-slate-50">
    
    <!-- BRANDED SKELETON LOADER -->
    <div v-if="isLoading" class="space-y-6 animate-pulse">
      
      <!-- Top Banner Skeleton -->
      <div class="bg-linear-to-r from-[#123524] to-[#1b4d35] p-6 rounded-2xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shadow-xs">
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 bg-emerald-500/30 rounded-md"></div>
            <div class="h-6 w-64 bg-white/20 rounded-md"></div>
          </div>
          <div class="h-3.5 w-96 max-w-full bg-white/10 rounded-md"></div>
        </div>
      </div>

      <!-- Course Builder Form Card Skeleton -->
      <div class="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
        <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-3 border-b border-slate-100 pb-4">
          <div class="h-4 w-48 bg-slate-200 rounded-md"></div>
          <div class="flex items-center gap-2">
            <div class="h-9 w-36 bg-slate-100 border border-slate-200/60 rounded-xl"></div>
            <div class="h-9 w-36 bg-slate-200 rounded-xl"></div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="h-10 bg-slate-100/80 rounded-xl border border-slate-200/50"></div>
          <div class="h-10 bg-slate-100/80 rounded-xl border border-slate-200/50"></div>
          <div class="md:col-span-2 h-10 bg-slate-100/80 rounded-xl border border-slate-200/50"></div>
        </div>

        <div class="space-y-4">
          <div class="h-10 bg-slate-100/60 rounded-xl"></div>
          <div class="h-28 bg-slate-50 border border-slate-200/60 rounded-2xl"></div>
        </div>
      </div>

      <!-- Toolbar Skeleton -->
      <div class="bg-white p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between border border-slate-200/80 shadow-xs">
        <div class="flex items-center gap-3 flex-1 min-w-72">
          <div class="h-9 w-64 bg-slate-100 rounded-xl"></div>
          <div class="h-9 w-32 bg-slate-100 rounded-xl"></div>
        </div>
        <div class="h-9 w-40 bg-slate-100 rounded-xl"></div>
      </div>

      <!-- Collapsible Registry Skeleton -->
      <div class="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div class="p-4 bg-slate-50 border-b border-slate-200/80">
          <div class="h-3.5 w-40 bg-slate-200 rounded-md"></div>
        </div>
        <div class="divide-y divide-slate-100">
          <div v-for="i in 3" :key="i" class="p-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-4 h-4 bg-slate-200 rounded"></div>
              <div class="h-5 w-12 bg-slate-200 rounded"></div>
              <div class="h-5 w-16 bg-slate-300 rounded"></div>
              <div class="h-4 w-48 bg-slate-200 rounded"></div>
            </div>
            <div class="flex items-center gap-3">
              <div class="h-3 w-16 bg-slate-200 rounded"></div>
              <div class="w-6 h-6 bg-slate-100 rounded-lg"></div>
              <div class="w-6 h-6 bg-slate-100 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- MAIN COURSES VIEW CONTENT -->
    <div v-else class="space-y-6">

      <!-- Module Header Hero Banner -->
      <div class="bg-[#123524] text-white p-6 rounded-2xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shadow-xs">
        <div class="space-y-1">
          <h1 class="text-xl font-bold flex items-center gap-2 text-white tracking-tight">
            <BookOpen :size="22" class="text-emerald-400" />
            Course Builder & Syllabus Manager
          </h1>
          <p class="text-sm text-slate-200 font-normal">
            Define Programs, Course Codes, Titles, Course Outcomes (COs), and Learning Objectives (LOs) mapped directly to MySQL.
          </p>
        </div>
      </div>

      <!-- Manual Entry / Edit Form Card -->
      <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        
        <!-- Card Header -->
        <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-3 border-b border-slate-100 pb-4">

          <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Pencil 
              v-if="editingCourseId" 
              :size="16" 
              class="text-amber-600" 
            />
            <Plus 
              v-else 
              :size="16" 
              class="text-emerald-700" 
            /> 
            {{ editingCourseId ? 'Edit Course Syllabus' : 'Create New Course Syllabus' }}
          </h2>

          <!-- CSV Actions -->
          <div class="flex items-center gap-2 shrink-0">

            <button 
              @click="downloadCSVTemplate" 
              type="button"
              class="px-3.5 py-2 bg-white hover:bg-emerald-50 text-emerald-800 text-sm font-bold rounded-xl border border-emerald-300 flex items-center gap-2 transition shadow-xs cursor-pointer"
            >
              <Download :size="14" class="text-emerald-700" />
              Download .CSV Template
            </button>

            <label 
              class="px-3.5 py-2 bg-[#123524] hover:bg-[#0e2a1d] text-white text-sm font-bold rounded-xl cursor-pointer flex items-center gap-2 transition shadow-xs"
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

            <button 
              v-if="editingCourseId" 
              @click="cancelEdit" 
              class="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1 font-bold bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 cursor-pointer"
            >
              <RotateCcw :size="14" /> Cancel Edit
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Target Program</label>
            <select v-model="courseProgram" class="w-full text-sm p-2.5 border border-slate-200 rounded-xl font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer text-slate-900">
              <option value="BSMT">BSMT</option>
              <option value="BSMarE">BSMarE</option>
              <option value="Both">Both (BSMT & BSMarE)</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Course Code</label>
            <input v-model="courseCode" placeholder="e.g. NAV1" class="w-full text-sm p-2.5 border border-slate-200 rounded-xl font-mono font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900" />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-bold text-slate-700 mb-1">Course Descriptive Title</label>
            <input v-model="courseTitle" placeholder="e.g. Navigational Instruments with Compasses" class="w-full text-sm p-2.5 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 font-medium" />
          </div>
        </div>

        <div class="space-y-6">
          <div class="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span class="text-sm font-bold text-slate-800">Course Outcomes (CO) & Objectives (LO) Breakdown</span>
            <span class="text-sm font-bold text-emerald-800 flex items-center gap-1 font-mono">
              <Clock :size="14" /> Total Hours: {{ totalCourseHours }} hrs
            </span>
          </div>

          <div v-for="(co, coIndex) in courseOutcomes" :key="coIndex" class="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-4">
            <div class="flex items-center gap-3">
              <span class="px-2.5 py-1 bg-[#123524] text-white font-mono text-sm font-bold rounded-lg">{{ co.id }}</span>
              <input 
                v-model="co.title" 
                :placeholder="`Course Outcome ${coIndex + 1} Description`" 
                class="w-full text-sm p-2.5 border border-slate-200 rounded-xl font-semibold bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900"
              />
              <button @click="removeCourseOutcome(coIndex)" class="text-rose-500 hover:text-rose-700 p-1 cursor-pointer">
                <Trash2 :size="16" />
              </button>
            </div>

            <div class="pl-6 border-l-2 border-emerald-600 space-y-3">
              <div class="flex justify-between items-center">
                <label class="text-[11px] font-bold text-slate-600 uppercase">Learning Objectives (LO) & Hours</label>
                <button @click="addLearningOutcome(coIndex)" class="text-sm text-emerald-800 font-bold hover:underline cursor-pointer">+ Add LO</button>
              </div>

              <div v-for="(lo, loIndex) in co.learningOutcomes" :key="loIndex" class="flex items-center gap-3">
                <span class="text-sm font-mono font-bold text-slate-500 w-12">{{ lo.id }}</span>
                <input 
                  v-model="lo.description" 
                  placeholder="Learning Objective 1 Description" 
                  class="w-full text-sm p-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 font-medium"
                />
                <div class="flex items-center gap-1 min-w-28">
                  <input 
                    type="number" 
                    v-model="lo.hours" 
                    min="0"
                    class="w-16 text-sm p-2 border border-slate-200 rounded-xl text-center font-bold bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900" 
                  />
                  <span class="text-sm text-slate-500 font-medium">hrs</span>
                </div>
                <button @click="removeLearningOutcome(coIndex, loIndex)" class="text-slate-400 hover:text-rose-600 p-1 cursor-pointer">
                  <Trash2 :size="14" />
                </button>
              </div>
            </div>
          </div>

          <button @click="addCourseOutcome" class="w-full py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-sm font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer">
            <Plus :size="14" /> Add Another Course Outcome (CO)
          </button>
        </div>

        <!-- CSV Upload Preview -->
        <div 
          v-if="bulkPreview.length > 0 || csvParseError || csvFileName" 
          class="border-t border-slate-200 pt-5 space-y-4"
        >
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h3 class="text-sm font-bold text-slate-800">
              CSV Course Import
            </h3>

            <span 
              v-if="csvFileName" 
              class="text-[11px] text-emerald-800 font-semibold"
            >
              Loaded File: {{ csvFileName }}
            </span>
          </div>

          <p 
            v-if="csvParseError" 
            class="text-sm text-rose-600 font-semibold"
          >
            {{ csvParseError }}
          </p>

          <div v-if="bulkPreview.length > 0" class="space-y-4">
            <h3 class="text-sm font-bold text-slate-800">
              Parsed Course Preview ({{ bulkPreview.length }} Courses)
            </h3>

            <div class="space-y-3 max-h-80 overflow-y-auto pr-1">
              <div 
                v-for="(c, idx) in bulkPreview" 
                :key="idx" 
                class="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-2"
              >
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 bg-[#123524] text-white font-mono text-sm font-bold rounded">
                    {{ c.program || 'BSMT' }}
                  </span>
                  <span class="px-2 py-0.5 bg-slate-200 text-slate-800 font-mono text-sm font-bold rounded">
                    {{ c.code }}
                  </span>
                  <span class="text-sm font-bold text-slate-900">
                    {{ c.title }}
                  </span>
                </div>

                <div class="pl-4 space-y-1">
                  <div 
                    v-for="co in c.courseOutcomes" 
                    :key="co.id" 
                    class="text-sm"
                  >
                    <span class="font-bold text-slate-700">
                      {{ co.id }}: {{ co.title }}
                    </span>

                    <div 
                      v-for="lo in co.learningOutcomes" 
                      :key="lo.id" 
                      class="pl-4 text-slate-600 text-[11px] flex justify-between"
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
              class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-xs cursor-pointer"
            >
              Import All {{ bulkPreview.length }} Courses
            </button>
          </div>
        </div>

        <div class="flex items-center gap-3 pt-2">
          <button 
            @click="handleSaveCourse" 
            class="px-6 py-2.5 text-sm font-bold text-white rounded-xl shadow-xs transition-colors cursor-pointer"
            :class="editingCourseId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'"
          >
            {{ editingCourseId ? 'Update Syllabus & Structure' : 'Save Syllabus & Structure' }}
          </button>
          <button 
            v-if="editingCourseId" 
            @click="cancelEdit" 
            class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl border border-slate-300 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>

      <!-- Search, Filter & Sort Toolbar -->
      <div class="bg-white p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between border border-slate-200 shadow-xs">
        <div class="flex items-center gap-3 flex-1 min-w-72">
          <div class="relative w-full max-w-xs">
            <Search class="absolute left-3 top-2.5 text-slate-400" :size="14" />
            <input v-model="searchQuery" placeholder="Search course code or title..." class="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800" />
          </div>

          <div class="flex items-center gap-1.5 text-slate-700 font-bold text-sm">
            <Filter :size="14" />
            <select v-model="filterProgram" class="p-2 border border-slate-200 rounded-xl text-sm bg-slate-50 outline-none cursor-pointer font-bold text-slate-800">
              <option value="All">All Programs</option>
              <option value="BSMT">BSMT Only</option>
              <option value="BSMarE">BSMarE Only</option>
              <option value="Both">Both Programs</option>
            </select>
          </div>
        </div>

        <div class="flex items-center gap-2 font-bold text-slate-700 text-sm">
          <ArrowUpDown :size="14" />
          <span>Sort By:</span>
          <select v-model="sortBy" class="p-2 border border-slate-200 rounded-xl text-sm bg-slate-50 outline-none cursor-pointer font-bold text-slate-800">
            <option value="code">Course Code</option>
            <option value="title">Course Title</option>
          </select>
        </div>
      </div>

      <!-- Collapsible Course Registry -->
      <div class="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div class="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Registered Courses ({{ filteredAndSortedCourses.length }})</h3>
        </div>

        <div v-if="filteredAndSortedCourses.length === 0" class="p-8 text-center text-slate-500 text-sm">
          No registered courses found in database. Create a new course above or upload a CSV file.
        </div>

        <div class="divide-y divide-slate-100">
          <div 
            v-for="c in filteredAndSortedCourses" 
            :key="c.id" 
            class="bg-white transition-colors"
            :class="{ 'bg-amber-50/40': editingCourseId === c.id }"
          >
            <!-- Course Level Accordion Header -->
            <div class="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <button @click="toggleCourse(c.id)" class="flex items-center gap-3 text-left flex-1 cursor-pointer">
                <component :is="expandedCourses.has(c.id) ? ChevronDown : ChevronRight" :size="18" class="text-slate-400" />
                <span class="px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider"
                      :class="{
                        'bg-emerald-100 text-emerald-800': c.program === 'BSMT',
                        'bg-slate-100 text-slate-800': c.program === 'BSMarE',
                        'bg-[#123524] text-white': c.program === 'Both' || !c.program
                      }">
                  {{ c.program || 'BSMT' }}
                </span>
                <span class="px-2 py-0.5 bg-[#123524] text-white font-mono text-sm font-bold rounded-md">{{ c.code }}</span>
                <span class="text-sm font-bold text-slate-900">{{ c.title }}</span>
              </button>

              <div class="flex items-center gap-3">
                <span class="text-[11px] font-semibold text-slate-400">
                  {{ c.courseOutcomes?.length || 0 }} Outcomes
                </span>
                <button 
                  @click="startEditCourse(c)" 
                  class="text-slate-400 hover:text-amber-600 p-1 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                  title="Edit Course"
                >
                  <Pencil :size="16" />
                </button>
                <button 
                  @click="deleteCourse(c.id)" 
                  class="text-slate-400 hover:text-rose-600 p-1 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete Course"
                >
                  <Trash2 :size="16" />
                </button>
              </div>
            </div>

            <!-- Course Level Collapsible Content -->
            <div v-if="expandedCourses.has(c.id)" class="px-6 pb-4 pt-1 bg-slate-50/50 space-y-3 border-t border-slate-100">
              <div v-if="!c.courseOutcomes || c.courseOutcomes.length === 0" class="text-sm text-slate-400 italic py-2">
                No course outcomes defined.
              </div>

              <!-- Course Outcome Level Accordion -->
              <div v-for="co in c.courseOutcomes" :key="co.id" class="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-xs">
                <button @click="toggleOutcome(`${c.id}-${co.id}`)" class="w-full p-2.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer">
                  <div class="flex items-center gap-2 text-sm">
                    <component :is="expandedOutcomes.has(`${c.id}-${co.id}`) ? ChevronDown : ChevronRight" :size="16" class="text-slate-400" />
                    <span class="font-bold text-slate-800">{{ co.id }}:</span>
                    <span class="text-slate-700 font-medium">{{ co.title }}</span>
                  </div>
                  <span class="text-[10px] text-slate-400 font-semibold">{{ co.learningOutcomes?.length || 0 }} LOs</span>
                </button>

                <!-- Learning Outcomes Collapsible Content -->
                <div v-if="expandedOutcomes.has(`${c.id}-${co.id}`)" class="p-3 bg-slate-50/60 border-t border-slate-100 space-y-2 pl-8">
                  <div v-for="lo in co.learningOutcomes" :key="lo.id" class="flex justify-between items-center text-sm">
                    <div class="flex items-start gap-2 text-slate-700">
                      <span class="font-mono font-bold text-emerald-700 min-w-12">{{ lo.id }}:</span>
                      <span>{{ lo.description }}</span>
                    </div>
                    <span class="font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-[11px] min-w-14 text-center">
                      {{ lo.hours }} hrs
                    </span>
                  </div>
                  <div v-if="!co.learningOutcomes || co.learningOutcomes.length === 0" class="text-sm text-slate-400 italic">
                    No learning outcomes attached.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import {
  Plus, Trash2, Clock, Download,
  Upload, ChevronDown, ChevronRight, Search, Filter, ArrowUpDown,
  Pencil, RotateCcw, BookOpen
} from 'lucide-vue-next'

const STORAGE_KEY = 'cams_courses_data'

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

// Proxy-aware API fetcher querying available backend endpoints
async function fetchFromEndpoints(path, options = {}) {
  const token = localStorage.getItem('cams_token') || localStorage.getItem('token') || ''
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  }

  const endpoints = ['/api', 'http://127.0.0.1:8000/api', 'http://localhost:8000/api']

  for (const baseUrl of endpoints) {
    try {
      const res = await fetch(`${baseUrl}${path}`, { ...options, headers })
      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const json = await res.json()
        return { ok: res.ok, status: res.status, data: json }
      }
    } catch (e) {
      // try next endpoint
    }
  }
  throw new Error('Backend API unreachable')
}

// Load Courses strictly from MySQL
async function loadCoursesFromStorage() {
  isLoading.value = true

  try {
    const res = await fetchFromEndpoints('/courses?all=1')
    if (res && res.ok) {
      const json = res.data
      const rawList = Array.isArray(json) ? json : (json?.data || [])

      courses.value = rawList.map(course => ({
        ...course,
        courseOutcomes: course.course_outcomes || course.courseOutcomes || []
      }))
      saveCoursesToStorage()
      return
    }
  } catch (err) {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY)
      courses.value = savedData ? JSON.parse(savedData) : []
    } catch (storageError) {
      courses.value = []
    }
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

// Accordion Controls
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

// Filter and Sort Computations
const filteredAndSortedCourses = computed(() => {
  return courses.value
    .filter(c => {
      const matchesProgram =
        filterProgram.value === 'All' ||
        c.program === filterProgram.value ||
        c.program === 'Both' ||
        !c.program

      const query = searchQuery.value.toLowerCase().trim()

      const matchesSearch =
        !query ||
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

// CO & LO Builder Functions
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
  if (courseOutcomes.value[coIndex].learningOutcomes.length > 1) {
    courseOutcomes.value[coIndex].learningOutcomes.splice(loIndex, 1)
  }
}

const totalCourseHours = computed(() => {
  let total = 0
  courseOutcomes.value.forEach(co => {
    if (Array.isArray(co.learningOutcomes)) {
      co.learningOutcomes.forEach(lo => {
        total += Number(lo.hours) || 0
      })
    }
  })
  return total
})

// Edit Management
function startEditCourse(course) {
  editingCourseId.value = course.id
  courseCode.value = course.code || ''
  courseTitle.value = course.title || ''
  courseProgram.value = course.program || 'BSMT'

  courseOutcomes.value = JSON.parse(JSON.stringify(course.courseOutcomes || []))

  if (courseOutcomes.value.length === 0) {
    addCourseOutcome()
  }

  window.scrollTo({ top: 0, behavior: 'smooth' })
}

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
        { id: 'LO1.1', description: '', hours: 0 }
      ]
    }
  ]
}

// Save Course Data directly to MySQL
async function handleSaveCourse() {
  if (!courseCode.value.trim() || !courseTitle.value.trim()) {
    alert('Please enter both Course Code and Course Title.')
    return
  }

  const payload = {
    code: courseCode.value.trim(),
    title: courseTitle.value.trim(),
    program: courseProgram.value,
    course_outcomes: JSON.parse(JSON.stringify(courseOutcomes.value))
  }

  isLoading.value = true

  try {
    const isEdit = !!editingCourseId.value
    const path = isEdit ? `/courses/${editingCourseId.value}` : '/courses'
    const method = isEdit ? 'PUT' : 'POST'

    const res = await fetchFromEndpoints(path, {
      method,
      body: JSON.stringify(payload)
    })

    if (res && res.ok) {
      alert('Course syllabus successfully saved to MySQL database!')
      cancelEdit()
      await loadCoursesFromStorage()
    } else {
      alert(res?.data?.message || 'Failed to save course in database.')
    }
  } catch (err) {
    alert('Server unreachable. Could not save course to MySQL.')
  } finally {
    isLoading.value = false
  }
}

// CSV Handlers
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
    ['BSMT', 'NAV-101', 'Terrestrial and Coastal Navigation', 'CO1', 'Demonstrate competence in maintaining watch', 'LO1.1', 'Apply COLREG Rules', '12'],
    ['BSMarE', 'ENG-201', 'Marine Engineering Systems', 'CO1', 'Operate propulsion machinery', 'LO1.1', 'Perform pre-start checks', '15']
  ]

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [
      headers.join(','),
      ...sampleRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', 'course_import_template.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function parseCSVLine(line) {
  const row = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
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

function parseCourseCSVText(csvText) {
  const lines = csvText.split(/\r\n|\n/).filter(line => line.trim() !== '')

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
        co.learningOutcomes.push({ id: loId, description: loDesc || '', hours })
      }
    }
  }

  return Array.from(courseMap.values())
}

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
    } font
      event.target.value = ''
  }

  reader.readAsText(file)
}

async function submitBulkCourses() {
  if (bulkPreview.value.length === 0) return
  if (!confirm(`Are you sure you want to import ${bulkPreview.value.length} course(s) into MySQL?`)) return

  isUploadingBulk.value = true
  isLoading.value = true

  for (const course of bulkPreview.value) {
    const payload = {
      code: course.code,
      title: course.title,
      program: course.program,
      course_outcomes: course.courseOutcomes || []
    }

    try {
      await fetchFromEndpoints('/courses', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
    } catch (e) {
      console.error('Failed to import course:', course.code)
    }
  }

  await loadCoursesFromStorage()
  bulkPreview.value = []
  csvFileName.value = ''
  isUploadingBulk.value = false
  isLoading.value = false
}

// Delete Course from MySQL
async function deleteCourse(id) {
  if (!confirm('Are you sure you want to delete this course structure?')) return

  isLoading.value = true

  try {
    const res = await fetchFromEndpoints(`/courses/${id}`, { method: 'DELETE' })
    if (res && res.ok) {
      if (editingCourseId.value === id) cancelEdit()
      await loadCoursesFromStorage()
    } else {
      alert(res?.data?.message || 'Failed to delete course.')
    }
  } catch (err) {
    alert('Failed to delete course from MySQL server.')
  } finally {
    isLoading.value = false
  }
}
</script>