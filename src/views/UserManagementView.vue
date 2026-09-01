<script setup>
import { ref, computed } from 'vue'
import { Plus, Search, Shield, Mail } from 'lucide-vue-next'

const searchQuery = ref('')
const roleFilter = ref('All')

const users = ref([
  { id: 1, name: 'Capt. Eduardo Ramirez', email: 'e.ramirez@bma.edu.ph', role: 'Instructor', status: 'Active', department: 'Navigation' },
  { id: 2, name: 'Chief Engr. Marco Santos', email: 'm.santos@bma.edu.ph', role: 'Assessment Officer', status: 'Active', department: 'Marine Engineering' },
  { id: 3, name: 'Cadet Juan Dela Cruz', email: 'j.delacruz@student.bma.edu.ph', role: 'Cadet', status: 'Active', department: 'Deck Class A' },
  { id: 4, name: 'Cadet Maria Clara', email: 'm.clara@student.bma.edu.ph', role: 'Cadet', status: 'Inactive', department: 'Engine Class B' }
])

const filteredUsers = computed(() => {
  return users.value.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesRole = roleFilter.value === 'All' || u.role === roleFilter.value
    return matchesSearch && matchesRole
  })
})
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">User Management</h1>
        <p class="text-gray-500 mt-1">Manage instructor accounts, assessment officer privileges, and cadet rosters.</p>
      </div>

      <button class="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
        <Plus :size="16" />
        Add New User
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
      <div class="relative w-full md:w-96">
        <Search :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search by name or email..." 
          class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
        />
      </div>

      <div class="flex items-center gap-2 w-full md:w-auto">
        <span class="text-xs font-semibold text-gray-500">Role:</span>
        <select 
          v-model="roleFilter" 
          class="border border-gray-300 rounded-lg text-sm px-3 py-2 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
        >
          <option value="All">All Roles</option>
          <option value="Assessment Officer">Assessment Officer</option>
          <option value="Instructor">Instructor</option>
          <option value="Cadet">Cadet</option>
        </select>
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <table class="w-full text-left text-sm">
        <thead class="bg-gray-50 text-gray-600 border-b border-gray-200">
          <tr>
            <th class="px-6 py-3 font-semibold">User</th>
            <th class="px-6 py-3 font-semibold">Role</th>
            <th class="px-6 py-3 font-semibold">Department / Class</th>
            <th class="px-6 py-3 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="u in filteredUsers" :key="u.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4">
              <div class="font-bold text-gray-900">{{ u.name }}</div>
              <div class="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <Mail :size="12" /> {{ u.email }}
              </div>
            </td>

            <td class="px-6 py-4">
              <span class="inline-flex items-center gap-1 text-xs font-semibold bg-slate-100 text-slate-800 px-2.5 py-1 rounded border border-slate-200">
                <Shield :size="12" /> {{ u.role }}
              </span>
            </td>

            <td class="px-6 py-4 text-xs font-medium text-gray-700">
              {{ u.department }}
            </td>

            <td class="px-6 py-4">
              <span 
                :class="[
                  'px-2.5 py-1 rounded-full text-xs font-semibold',
                  u.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                ]"
              >
                {{ u.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>