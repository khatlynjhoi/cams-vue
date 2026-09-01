<script setup>
import { ref, computed } from 'vue'
import { BookOpen, Layers, FileText, Plus, Search, ChevronRight } from 'lucide-vue-next'

const searchQuery = ref('')

const courses = ref([
  {
    id: 1,
    code: 'NAV-101',
    title: 'Navigation Watchkeeping & COLREGs',
    stcwStandard: 'Table A-II/1',
    description: 'Principles keeping a safe navigational watch, collision avoidance rules, and bridge procedures.',
    questionCount: 342,
    activeBlueprints: 4,
    status: 'Active'
  },
  {
    id: 2,
    code: 'ENG-202',
    title: 'Marine Diesel Engineering Systems',
    stcwStandard: 'Table A-III/1',
    description: 'Operation, main propulsion monitoring, auxiliary machinery, and engine room safety protocols.',
    questionCount: 280,
    activeBlueprints: 3,
    status: 'Active'
  },
  {
    id: 3,
    code: 'SAF-301',
    title: 'Basic Safety Training & MARPOL',
    stcwStandard: 'Table A-VI/1',
    description: 'Personal survival techniques, fire prevention, elementary first aid, and marine environmental protection.',
    questionCount: 415,
    activeBlueprints: 5,
    status: 'Active'
  },
  {
    id: 4,
    code: 'NAV-202',
    title: 'Advanced Ship Handling & Radar',
    stcwStandard: 'Table A-II/2',
    description: 'Radar navigation, ARPA plotting, ship maneuverability in restricted waters, and emergency response.',
    questionCount: 211,
    activeBlueprints: 2,
    status: 'In Review'
  }
])

const filteredCourses = computed(() => {
  return courses.value.filter(c => 
    c.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    c.stcwStandard.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">STCW Course Management</h1>
        <p class="text-gray-500 mt-1">Manage competency domains, link question banks, and review syllabus coverage.</p>
      </div>

      <button class="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
        <Plus :size="16" />
        Add New Course
      </button>
    </div>

    <!-- Search & Filters -->
    <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <div class="relative w-full md:w-96">
        <Search :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search course code, title, or STCW standard..." 
          class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
        />
      </div>
    </div>

    <!-- Course Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div 
        v-for="course in filteredCourses" 
        :key="course.id"
        class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-500/50 transition-all"
      >
        <div class="space-y-3">
          <div class="flex justify-between items-start">
            <div class="flex items-center gap-2">
              <span class="font-mono text-xs font-bold bg-slate-900 text-white px-2.5 py-1 rounded">
                {{ course.code }}
              </span>
              <span class="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                STCW {{ course.stcwStandard }}
              </span>
            </div>
            <span 
              :class="[
                'text-xs font-semibold px-2.5 py-0.5 rounded-full',
                course.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              ]"
            >
              {{ course.status }}
            </span>
          </div>

          <h2 class="text-lg font-bold text-gray-900 leading-snug">{{ course.title }}</h2>
          <p class="text-xs text-gray-600 leading-relaxed">{{ course.description }}</p>
        </div>

        <div class="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div class="flex items-center gap-4">
            <span class="flex items-center gap-1.5 font-medium text-gray-700">
              <FileText :size="14" class="text-slate-400" /> {{ course.questionCount }} Questions
            </span>
            <span class="flex items-center gap-1.5 font-medium text-gray-700">
              <Layers :size="14" class="text-slate-400" /> {{ course.activeBlueprints }} Blueprints
            </span>
          </div>

          <button class="text-emerald-700 font-bold hover:text-emerald-800 flex items-center gap-0.5">
            Manage <ChevronRight :size="14" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>