<script setup>
import { ref } from 'vue'
import { Play, Pause, Square, Users, Clock, AlertCircle, Search } from 'lucide-vue-next'

const searchQuery = ref('')

const activeSessions = ref([
  {
    id: 1,
    title: 'E-WATCH - FINAL EXAMINATION',
    course: 'BSMT',
    batch: 'Class 2026-A',
    enrolledStudents: 32,
    activeStudents: 30,
    timeRemaining: '42 mins',
    status: 'Running'
  },
  {
    id: 2,
    title: 'MARINE DIESEL ENGINES - MIDTERM',
    course: 'BSMarE',
    batch: 'Class 2026-B',
    enrolledStudents: 28,
    activeStudents: 0,
    timeRemaining: '60 mins',
    status: 'Scheduled'
  }
])

function updateStatus(id, newStatus) {
  const session = activeSessions.value.find(s => s.id === id)
  if (session) {
    session.status = newStatus
  }
}
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Pilot Administration</h1>
        <p class="text-gray-500 mt-1">Control and monitor live examination sessions in real time.</p>
      </div>
    </div>

    <!-- Overview Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
        <div class="p-3 bg-emerald-100 rounded-lg text-emerald-600">
          <Play :size="20" />
        </div>
        <div>
          <p class="text-xs text-gray-500 font-medium">Active Sessions</p>
          <p class="text-xl font-bold text-gray-900">1 Live</p>
        </div>
      </div>

      <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
        <div class="p-3 bg-blue-100 rounded-lg text-blue-600">
          <Users :size="20" />
        </div>
        <div>
          <p class="text-xs text-gray-500 font-medium">Students Testing</p>
          <p class="text-xl font-bold text-gray-900">30 Connected</p>
        </div>
      </div>

      <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
        <div class="p-3 bg-amber-100 rounded-lg text-amber-600">
          <Clock :size="20" />
        </div>
        <div>
          <p class="text-xs text-gray-500 font-medium">Pending Release</p>
          <p class="text-xl font-bold text-gray-900">1 Scheduled</p>
        </div>
      </div>
    </div>

    <!-- Active Pilot Sessions Table -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div class="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 class="font-bold text-gray-800">Examination Runs</h2>
        <div class="relative w-64">
          <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search sessions..." 
            class="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <table class="w-full text-left text-sm">
        <thead class="bg-gray-50 text-gray-600 border-b border-gray-200">
          <tr>
            <th class="px-6 py-3 font-semibold">Test Name</th>
            <th class="px-6 py-3 font-semibold">Batch / Course</th>
            <th class="px-6 py-3 font-semibold">Active Students</th>
            <th class="px-6 py-3 font-semibold">Timer</th>
            <th class="px-6 py-3 font-semibold">Status</th>
            <th class="px-6 py-3 font-semibold text-right">Controls</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="s in activeSessions" :key="s.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 font-bold text-gray-900">{{ s.title }}</td>
            <td class="px-6 py-4 text-gray-600">
              <span class="font-medium text-gray-800">{{ s.batch }}</span> ({{ s.course }})
            </td>
            <td class="px-6 py-4 text-gray-700 font-medium">
              {{ s.activeStudents }} / {{ s.enrolledStudents }}
            </td>
            <td class="px-6 py-4 text-gray-600 font-medium">
              <div class="flex items-center gap-1.5">
                <Clock :size="14" class="text-gray-400" />
                {{ s.timeRemaining }}
              </div>
            </td>
            <td class="px-6 py-4">
              <span 
                :class="[
                  'px-2.5 py-1 rounded-full text-xs font-semibold',
                  s.status === 'Running' ? 'bg-emerald-100 text-emerald-800' : 
                  s.status === 'Paused' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'
                ]"
              >
                {{ s.status }}
              </span>
            </td>
            <td class="px-6 py-4 text-right space-x-2">
              <button 
                v-if="s.status !== 'Running'"
                @click="updateStatus(s.id, 'Running')"
                class="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700"
              >
                Start
              </button>
              <button 
                v-if="s.status === 'Running'"
                @click="updateStatus(s.id, 'Paused')"
                class="px-2.5 py-1 bg-amber-500 text-white rounded-lg text-xs font-medium hover:bg-amber-600"
              >
                Pause
              </button>
              <button 
                @click="updateStatus(s.id, 'Finished')"
                class="px-2.5 py-1 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700"
              >
                End Session
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>