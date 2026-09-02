<script setup>
import { ref, onMounted, computed } from 'vue'
import { Plus, Trash2, Clock, BookOpen, Layers, CheckCircle2 } from 'lucide-vue-next'

const courses = ref([])
const isLoading = ref(true)

// Form State
const courseCode = ref('')
const courseTitle = ref('')
const courseOutcomes = ref([
  {
    id: 'CO1',
    title: '',
    learningOutcomes: [
      { id: 'LO1.1', description: '', hours: 0 }
    ]
  }
])

async function fetchCourses() {
  isLoading.value = true
  try {
    const res = await fetch('http://localhost:3001/api/courses')
    const data = await res.json()
    if (data.success) courses.value = data.data
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
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <!-- Header -->
    <div class="bg-slate-900 text-white p-6 rounded-2xl shadow-sm flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold flex items-center gap-2">
          <BookOpen :size="24" class="text-emerald-400" /> Maritime Course Curriculum Builder
        </h1>
        <p class="text-xs text-slate-300">Define Course Codes, Titles, Outcomes (COs), and Learning Objectives (LOs) with hours allocation.</p>
      </div>
      <div class="bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-right">
        <span class="text-[10px] text-slate-400 font-bold block uppercase">Active Courses</span>
        <span class="text-lg font-bold text-emerald-400">{{ courses.length }}</span>
      </div>
    </div>

    <!-- Course Creation Panel -->
    <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
      <h2 class="text-base font-bold text-gray-900 border-b pb-3 flex items-center gap-2">
        <Plus :size="18" class="text-emerald-600" /> Create New Course Syllabus Structure
      </h2>

      <!-- Basic Course Details -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1">Course Code</label>
          <input v-model="courseCode" placeholder="e.g. NAV-101" class="w-full text-xs p-2.5 border rounded-lg font-mono font-bold" />
        </div>
        <div class="md:col-span-2">
          <label class="block text-xs font-bold text-gray-700 mb-1">Course Descriptive Title</label>
          <input v-model="courseTitle" placeholder="e.g. Terrestrial and Coastal Navigation" class="w-full text-xs p-2.5 border rounded-lg" />
        </div>
      </div>

      <!-- Course Outcomes (COs) & Learning Outcomes (LOs) Builder -->
      <div class="space-y-6">
        <div class="flex justify-between items-center bg-gray-50 p-3 rounded-lg border">
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
              class="w-full text-xs p-2 border rounded-lg font-semibold"
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

    <!-- Active Courses Registry -->
    <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 bg-gray-50 border-b flex justify-between items-center">
        <h3 class="text-sm font-bold text-gray-900">Registered Maritime Courses</h3>
      </div>

      <div class="divide-y">
        <div v-for="c in courses" :key="c.id" class="p-5 hover:bg-gray-50/50 space-y-3">
          <div class="flex justify-between items-start">
            <div>
              <span class="px-2 py-0.5 bg-slate-800 text-white font-mono text-xs font-bold rounded mr-2">{{ c.code }}</span>
              <span class="text-sm font-bold text-slate-900">{{ c.title }}</span>
            </div>
            <button @click="deleteCourse(c.id)" class="text-gray-400 hover:text-red-600">
              <Trash2 :size="16" />
            </button>
          </div>

          <!-- Outcomes Tree -->
          <div class="space-y-2 pt-2">
            <div v-for="co in c.courseOutcomes" :key="co.id" class="bg-slate-50 p-3 rounded-lg border text-xs space-y-1.5">
              <p class="font-bold text-slate-800">{{ co.id }}: {{ co.title }}</p>
              <div class="pl-4 space-y-1 divide-y divide-gray-100">
                <div v-for="lo in co.learningOutcomes" :key="lo.id" class="pt-1 flex justify-between items-center text-gray-600">
                  <span><strong class="font-mono text-emerald-800">{{ lo.id }}:</strong> {{ lo.description }}</span>
                  <span class="font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-gray-200">{{ lo.hours }} hrs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>