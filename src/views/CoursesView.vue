<script setup>
import { ref } from 'vue'
import { BookOpen, Layers, Users, ChevronRight } from 'lucide-vue-next'

const courses = ref([
  { id: 1, code: 'NAV-101', title: 'Terrestrial & Coastal Navigation', students: 120, items: 45, status: 'Active' },
  { id: 2, code: 'ENG-202', title: 'Marine Diesel Power Plants', students: 85, items: 60, status: 'Active' },
  { id: 3, code: 'SAF-301', title: 'Maritime Safety & Environmental Protection', students: 140, items: 30, status: 'Active' },
  { id: 4, code: 'COL-102', title: 'International Regulations for Preventing Collisions at Sea', students: 95, items: 50, status: 'Active' }
])
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Courses & Programs</h1>
      <p class="text-gray-500 mt-1">Manage maritime curriculum modules and subject allocations.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div 
        v-for="course in courses" 
        :key="course.id"
        class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
      >
        <div class="flex justify-between items-start">
          <div>
            <span class="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
              {{ course.code }}
            </span>
            <h2 class="text-lg font-bold text-gray-900 mt-2">{{ course.title }}</h2>
          </div>
          <span class="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">
            {{ course.status }}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 text-xs text-gray-600">
          <div class="flex items-center gap-2">
            <Users :size="16" class="text-gray-400" />
            <span>{{ course.students }} Enrolled Students</span>
          </div>
          <div class="flex items-center gap-2">
            <Layers :size="16" class="text-gray-400" />
            <span>{{ course.items }} Exam Items Banked</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>