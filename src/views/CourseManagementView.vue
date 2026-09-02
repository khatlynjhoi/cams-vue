<script setup>
import { ref, onMounted, computed } from 'vue'
import { 
  Plus, Trash2, Clock, BookOpen, Layers, CheckCircle2,
  ChevronDown, ChevronRight, Search, Filter, ArrowUpDown 
} from 'lucide-vue-next'

const courses = ref([])
const isLoading = ref(true)

// Form State
const courseCode = ref('')
const courseTitle = ref('')
const program = ref('Both')
const courseOutcomes = ref([
  {
    id: 'CO1',
    title: '',
    learningOutcomes: [
      { id: 'LO1.1', description: '', hours: 0 }
    ]
  }
])

// Filtering & Sorting State
const searchQuery = ref('')
const programFilter = ref('All')
const sortBy = ref('code-asc')

// Collapsible Toggle State
const expandedCourses = ref({})
const expandedCOs = ref({})

async function fetchCourses() {
  isLoading.value = true
  try {
    const res = await fetch('http://localhost:3001/api/courses')
    const data = await res.json()
    if (data.success) {
      courses.value = data.data

      // Expand all top-level courses and COs by default
      data.data.forEach(c => {
        expandedCourses.value[c.id] = true
        if (Array.isArray(c.courseOutcomes)) {
          c.courseOutcomes.forEach((co, idx) => {
            expandedCOs.value[`${c.id}-${co.id || idx}`] = true
          })
        }
      })
    }
  } catch (err) {
    console.error('Failed to load courses:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchCourses()
})

// CO & LO Helpers
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

// Calculate total hours for active course form
const totalCourseHours = computed(() => {
  let total = 0
  courseOutcomes.value.forEach(co => {
    co.learningOutcomes.forEach(lo => {
      total += Number(lo.hours) || 0
    })
  })
  return total
})

async function handleSaveCourse() {
  if (!courseCode.value || !courseTitle.value) {
    alert('Please enter both Course Code and Course Title.')
    return
  }

  const payload = {
    code: courseCode.value,
    title: courseTitle.value,
    program: program.value,
    courseOutcomes: courseOutcomes.value
  }

  try {
    const res = await fetch('http://localhost:3001/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    if (data.success) {
      // Reset form
      courseCode.value = ''
      courseTitle.value = ''
      program.value = 'Both'
      courseOutcomes.value = [
        {
          id: 'CO1',
          title: '',
          learningOutcomes: [{ id: 'LO1.1', description: '', hours: 0 }]
        }
      ]
      await fetchCourses()
    }
  } catch (err) {
    alert('Failed to create course.')
  }
}

async function deleteCourse(id) {
  if (!confirm('Are you sure you want to delete this course structure?')) return
  try {
    await fetch(`http://localhost:3001/api/courses/${id}`, { method: 'DELETE' })
    await fetchCourses()
  } catch (err) {
    console.error(err)
  }
}

// Collapsible Handlers
function toggleCourse(courseId) {
  expandedCourses.value[courseId] = !expandedCourses.value[courseId]
}

function toggleCO(coKey) {
  expandedCOs.value[coKey] = !expandedCOs.value[coKey]
}

// Filter and Sort Computed Logic
const filteredAndSortedCourses = computed(() => {
  return courses.value
    .filter(c => {
      // Filter by Program
      if (programFilter.value !== 'All' && c.program !== 'Both' && c.program !== programFilter.value) {
        return false
      }
      // Search Query
      if (searchQuery.value.trim() !== '') {
        const q = searchQuery.value.toLowerCase()
        const matchCode = c.code?.toLowerCase().includes(q)
        const matchTitle = c.title?.toLowerCase().includes(q)
        const matchCO = c.courseOutcomes?.some(co => 
          (co.title || co.text)?.toLowerCase().includes(q) ||
          co.learningOutcomes?.some(lo => (lo.description || lo.text)?.toLowerCase().includes(q))
        )
        return matchCode || matchTitle || matchCO
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy.value === 'code-asc') return a.code.localeCompare(b.code)
      if (sortBy.value === 'code-desc') return b.code.localeCompare(a.code)
      if (sortBy.value === 'title-asc') return a.title.localeCompare(b.title)
      if (sortBy.value === 'title-desc') return b.title.localeCompare(a.title)
      return 0
    })
})
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6 font-sans text-slate-800">
    <!-- Header -->
    <div class="bg-slate-900 text-white p-6 rounded-2xl shadow-sm flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold flex items-center gap-2">
          <BookOpen :size="24" class="text-emerald-400" /> Maritime Course Curriculum Builder
        </h1>
        <p class="text-xs text-slate-300">Define Course Codes, Titles, Program allocations, Course Outcomes (COs), and Learning Objectives (LOs).</p>
      </div>
      <div class="bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-right">
        <span class="text-[10px] text-slate-400 font-bold block uppercase">Active Courses</span>
        <span class="text-lg font-bold text-emerald-400">{{ courses.length }}</span>
      </div>
    </div>

    <!-- Course Creation Panel -->
    <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
      <h2 class="text-base font-bold text-slate-900 border-b pb-3 flex items-center gap-2">
        <Plus :size="18" class="text-emerald-600" /> Create New Course Syllabus Structure
      </h2>

      <!-- Basic Course Details with Program Dropdown -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
        <!-- Program -->
        <div class="md:col-span-3">
          <label class="block text-xs font-bold text-slate-700 mb-1">Program</label>
          <select 
            v-model="program" 
            class="w-full text-xs p-2.5 border rounded-lg bg-white font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="Both">Both (BSMT & BSmarE)</option>
            <option value="BSMT">BSMT (Marine Transportation)</option>
            <option value="BSmarE">BSmarE (Marine Engineering)</option>
          </select>
        </div>

        <!-- Course Code -->
        <div class="md:col-span-3">
          <label class="block text-xs font-bold text-slate-700 mb-1">Course Code</label>
          <input 
            v-model="courseCode" 
            placeholder="e.g. NAV-101" 
            class="w-full text-xs p-2.5 border rounded-lg font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-none" 
          />
        </div>

        <!-- Course Descriptive Title -->
        <div class="md:col-span-6">
          <label class="block text-xs font-bold text-slate-700 mb-1">Course Descriptive Title</label>
          <input 
            v-model="courseTitle" 
            placeholder="e.g. Terrestrial and Coastal Navigation" 
            class="w-full text-xs p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
          />
        </div>
      </div>

      <!-- Course Outcomes (COs) & Learning Outcomes (LOs) Builder -->
      <div class="space-y-6">
        <div class="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span class="text-xs font-bold text-slate-800">Course Outcomes (CO) & Objectives (LO) Breakdown</span>
          <span class="text-xs font-bold text-emerald-700 flex items-center gap-1">
            <Clock :size="14" /> Total Program Hours: {{ totalCourseHours }} hrs
          </span>
        </div>

        <div v-for="(co, coIndex) in courseOutcomes" :key="coIndex" class="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-4">
          <!-- CO Title -->
          <div class="flex items-center gap-3">
            <span class="px-2.5 py-1 bg-slate-800 text-white font-mono text-xs font-bold rounded-lg">{{ co.id }}</span>
            <input 
              v-model="co.title" 
              :placeholder="`Enter title for Course Outcome ${coIndex + 1} (e.g. Demonstrate competence in navigational watchkeeping)`" 
              class="w-full text-xs p-2 border rounded-lg font-semibold bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <button @click="removeCourseOutcome(coIndex)" class="text-red-500 hover:text-red-700 p-1">
              <Trash2 :size="16" />
            </button>
          </div>

          <!-- LO List inside CO -->
          <div class="pl-6 border-l-2 border-emerald-500 space-y-3">
            <div class="flex justify-between items-center">
              <label class="text-[11px] font-bold text-slate-600 uppercase">Learning Objectives (LO) & Hours</label>
              <button @click="addLearningOutcome(coIndex)" class="text-xs text-emerald-700 font-bold hover:underline">+ Add LO</button>
            </div>

            <div v-for="(lo, loIndex) in co.learningOutcomes" :key="loIndex" class="flex items-center gap-3">
              <span class="text-xs font-mono font-bold text-slate-500 w-12">{{ lo.id }}</span>
              <input 
                v-model="lo.description" 
                placeholder="Learning Objective Description (e.g. Calculate compass error and true bearings)" 
                class="w-full text-xs p-2 border rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <div class="flex items-center gap-1 min-w-[120px]">
                <input 
                  type="number" 
                  v-model="lo.hours" 
                  min="0"
                  class="w-16 text-xs p-2 border rounded-lg text-center font-bold bg-white focus:ring-2 focus:ring-emerald-500 outline-none" 
                />
                <span class="text-xs text-slate-500 font-medium">hrs</span>
              </div>
              <button @click="removeLearningOutcome(coIndex, loIndex)" class="text-slate-400 hover:text-red-500 p-1">
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

    <!-- Registered Maritime Courses Section -->
    <div class="space-y-4">
      
      <!-- Toolbar: Search, Filter, and Sort Controls -->
      <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Layers :size="18" class="text-emerald-600" /> Registered Maritime Courses
          <span class="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {{ filteredAndSortedCourses.length }} Total
          </span>
        </h3>

        <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <!-- Search Bar -->
          <div class="relative flex-1 md:w-64">
            <Search :size="14" class="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search code, title, or LO..." 
              class="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <!-- Program Filter -->
          <div class="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs">
            <Filter :size="14" class="text-slate-500" />
            <select v-model="programFilter" class="bg-transparent font-medium text-slate-700 outline-none cursor-pointer">
              <option value="All">All Programs</option>
              <option value="BSMT">BSMT</option>
              <option value="BSmarE">BSmarE</option>
              <option value="Both">Both Only</option>
            </select>
          </div>

          <!-- Sort Select -->
          <div class="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs">
            <ArrowUpDown :size="14" class="text-slate-500" />
            <select v-model="sortBy" class="bg-transparent font-medium text-slate-700 outline-none cursor-pointer">
              <option value="code-asc">Code (A-Z)</option>
              <option value="code-desc">Code (Z-A)</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Course Cards Container -->
      <div v-if="isLoading" class="text-center py-12 text-slate-400 text-xs">Loading course syllabus data...</div>
      
      <div v-else-if="filteredAndSortedCourses.length === 0" class="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs">
        No maritime courses found matching your search or filter.
      </div>

      <div v-else class="space-y-3">
        <div 
          v-for="c in filteredAndSortedCourses" 
          :key="c.id" 
          class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden transition-all"
        >
          <!-- Collapsible Course Card Header -->
          <div 
            @click="toggleCourse(c.id)"
            class="p-4 bg-slate-50 hover:bg-slate-100/80 cursor-pointer flex items-center justify-between border-b border-slate-100 transition-colors"
          >
            <div class="flex items-center gap-3">
              <button class="text-slate-500 hover:text-slate-700">
                <ChevronDown v-if="expandedCourses[c.id]" :size="18" />
                <ChevronRight v-else :size="18" />
              </button>
              <span class="px-2 py-0.5 bg-slate-800 text-white font-mono text-xs font-bold rounded">{{ c.code }}</span>
              <span class="text-sm font-bold text-slate-900">{{ c.title }}</span>

              <!-- Program Badge -->
              <span 
                v-if="c.program === 'BSMT'" 
                class="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200"
              >BSMT</span>
              <span 
                v-else-if="c.program === 'BSmarE'" 
                class="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200"
              >BSmarE</span>
              <span 
                v-else 
                class="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200"
              >Both Programs</span>
            </div>

            <div class="flex items-center gap-3">
              <span class="text-xs text-slate-500 font-medium">{{ c.courseOutcomes?.length || 0 }} COs</span>
              <button @click.stop="deleteCourse(c.id)" class="text-slate-400 hover:text-red-600 p-1" title="Delete Course">
                <Trash2 :size="16" />
              </button>
            </div>
          </div>

          <!-- Course Body (Collapsible) -->
          <div v-if="expandedCourses[c.id]" class="p-4 space-y-3 bg-white">
            <div 
              v-for="(co, coIdx) in c.courseOutcomes" 
              :key="co.id || coIdx" 
              class="border border-slate-200 rounded-lg overflow-hidden"
            >
              <!-- Nested Collapsible CO Header -->
              <div 
                @click="toggleCO(`${c.id}-${co.id || coIdx}`)"
                class="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 cursor-pointer flex items-center justify-between text-xs font-semibold text-slate-800 border-b border-slate-100"
              >
                <div class="flex items-center gap-2">
                  <button class="text-slate-400">
                    <ChevronDown v-if="expandedCOs[`${c.id}-${co.id || coIdx}`]" :size="16" />
                    <ChevronRight v-else :size="16" />
                  </button>
                  <span class="text-slate-900 font-mono font-bold">{{ co.id }}:</span>
                  <span>{{ co.title || co.text }}</span>
                </div>
                <span class="text-[11px] text-slate-500 font-normal">{{ co.learningOutcomes?.length || 0 }} LOs</span>
              </div>

              <!-- Nested LO List (Collapsible) -->
              <div v-if="expandedCOs[`${c.id}-${co.id || coIdx}`]" class="p-3 space-y-2 bg-slate-50/30">
                <div 
                  v-for="(lo, loIdx) in co.learningOutcomes" 
                  :key="lo.id || loIdx" 
                  class="flex justify-between items-center text-xs p-2 rounded border border-slate-100 bg-white"
                >
                  <div class="flex items-start gap-2">
                    <strong class="font-mono text-emerald-800 min-w-[45px]">{{ lo.id }}:</strong> 
                    <span class="text-slate-700">{{ lo.description || lo.text }}</span>
                  </div>
                  <span class="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold whitespace-nowrap ml-2">
                    {{ lo.hours }} hrs
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>