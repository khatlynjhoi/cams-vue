<script setup>
import { ref } from 'vue'
import { BarChart3, TrendingUp, Users, Award, Download, FileText } from 'lucide-vue-next'

const examResults = ref([
  { id: 1, name: 'Dela Cruz, Juan', course: 'BSMT', score: '88%', status: 'Passed', date: '2026-09-01' },
  { id: 2, name: 'Santos, Maria', course: 'BSMT', score: '92%', status: 'Passed', date: '2026-09-01' },
  { id: 3, name: 'Reyes, Mark', course: 'BSMarE', score: '64%', status: 'Failed', date: '2026-09-01' },
  { id: 4, name: 'Gonzales, Ana', course: 'BSMarE', score: '78%', status: 'Passed', date: '2026-09-01' }
])
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p class="text-gray-500 mt-1">Review assessment outcomes, passing rates, and student metrics.</p>
      </div>
      <button class="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm">
        <Download :size="16" />
        Export Summary (PDF)
      </button>
    </div>

    <!-- Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
        <div class="p-3 bg-emerald-100 rounded-lg text-emerald-600">
          <Award :size="20" />
        </div>
        <div>
          <p class="text-xs text-gray-500 font-medium">Average Score</p>
          <p class="text-xl font-bold text-gray-900">80.5%</p>
        </div>
      </div>

      <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
        <div class="p-3 bg-blue-100 rounded-lg text-blue-600">
          <TrendingUp :size="20" />
        </div>
        <div>
          <p class="text-xs text-gray-500 font-medium">Pass Rate</p>
          <p class="text-xl font-bold text-gray-900">75%</p>
        </div>
      </div>

      <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
        <div class="p-3 bg-purple-100 rounded-lg text-purple-600">
          <Users :size="20" />
        </div>
        <div>
          <p class="text-xs text-gray-500 font-medium">Exams Taken</p>
          <p class="text-xl font-bold text-gray-900">32 Submissions</p>
        </div>
      </div>

      <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
        <div class="p-3 bg-amber-100 rounded-lg text-amber-600">
          <FileText :size="20" />
        </div>
        <div>
          <p class="text-xs text-gray-500 font-medium">Item Reliability</p>
          <p class="text-xl font-bold text-gray-900">High (0.84)</p>
        </div>
      </div>
    </div>

    <!-- Submissions Table -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 class="font-bold text-gray-800">Recent Student Submissions</h2>
      </div>

      <table class="w-full text-left text-sm">
        <thead class="bg-gray-50 text-gray-600 border-b border-gray-200">
          <tr>
            <th class="px-6 py-3 font-semibold">Student Name</th>
            <th class="px-6 py-3 font-semibold">Course Program</th>
            <th class="px-6 py-3 font-semibold">Score</th>
            <th class="px-6 py-3 font-semibold">Status</th>
            <th class="px-6 py-3 font-semibold text-right">Completion Date</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="res in examResults" :key="res.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 font-bold text-gray-900">{{ res.name }}</td>
            <td class="px-6 py-4 text-gray-600 font-medium">{{ res.course }}</td>
            <td class="px-6 py-4 font-mono font-bold text-gray-800">{{ res.score }}</td>
            <td class="px-6 py-4">
              <span 
                :class="[
                  'px-2.5 py-1 rounded-full text-xs font-semibold',
                  res.status === 'Passed' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                ]"
              >
                {{ res.status }}
              </span>
            </td>
            <td class="px-6 py-4 text-right text-gray-500 font-mono text-xs">{{ res.date }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>