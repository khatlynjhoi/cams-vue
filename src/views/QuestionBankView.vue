<script setup>
import { ref } from 'vue'
import { Plus, Upload, Search, Filter } from 'lucide-vue-next'

const searchQuery = ref('')
const selectedCourse = ref('All')

const questions = ref([
  {
    id: 1,
    code: 'Q-101',
    course: 'BSMT - Navigational Watch',
    text: 'What is the primary objective of keeping a safe navigational watch?',
    level: 'Remembering',
    status: 'Approved'
  },
  {
    id: 2,
    code: 'Q-102',
    course: 'BSMarE - Marine Diesel Engines',
    text: 'Explain the principle of four-stroke diesel engine operation.',
    level: 'Understanding',
    status: 'Validated'
  }
])
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <!-- Header Actions -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Question Bank</h1>
        <p class="text-gray-500 mt-1">Manage, validate, and organize assessment items.</p>
      </div>
      <div class="flex items-center gap-3">
        <button class="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          <Upload :size="18" />
          Bulk Upload
        </button>
        <button class="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
          <Plus :size="18" />
          Add Question
        </button>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
      <div class="relative flex-1">
        <Search :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search questions or codes..."
          class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div class="flex items-center gap-2">
        <Filter :size="18" class="text-gray-500" />
        <select
          v-model="selectedCourse"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
        >
          <option value="All">All Courses</option>
          <option value="BSMT">BSMT</option>
          <option value="BSMarE">BSMarE</option>
        </select>
      </div>
    </div>

    <!-- Questions Table -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <table class="w-full text-left text-sm">
        <thead class="bg-gray-50 text-gray-600 border-b border-gray-200">
          <tr>
            <th class="px-6 py-3 font-semibold">Code</th>
            <th class="px-6 py-3 font-semibold">Course</th>
            <th class="px-6 py-3 font-semibold">Question Text</th>
            <th class="px-6 py-3 font-semibold">Bloom's Level</th>
            <th class="px-6 py-3 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="q in questions" :key="q.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 font-medium text-gray-900">{{ q.code }}</td>
            <td class="px-6 py-4 text-gray-600">{{ q.course }}</td>
            <td class="px-6 py-4 text-gray-800 font-medium max-w-md truncate">{{ q.text }}</td>
            <td class="px-6 py-4">
              <span class="px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                {{ q.level }}
              </span>
            </td>
            <td class="px-6 py-4">
              <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                {{ q.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>