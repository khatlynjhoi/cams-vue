<script setup>
import { ref, reactive, computed } from 'vue'
import { Plus, Search, Shield, Mail, Trash2, X, Save } from 'lucide-vue-next'

const searchQuery = ref('')
const roleFilter = ref('All')

// Mock initial data based on "UserManagementView.txt"[cite: 28]
const users = ref([
  { id: 1, name: 'Capt. Eduardo Ramirez', email: 'e.ramirez@bma.edu.ph', role: 'Instructor', status: 'Active', department: 'Navigation' },
  { id: 2, name: 'Chief Engr. Marco Santos', email: 'm.santos@bma.edu.ph', role: 'Assessment Officer', status: 'Active', department: 'Marine Engineering' },
  { id: 3, name: 'Cadet Juan Dela Cruz', email: 'j.delacruz@student.bma.edu.ph', role: 'Cadet', status: 'Active', department: 'Deck Class A' },
  { id: 4, name: 'Cadet Maria Clara', email: 'm.clara@student.bma.edu.ph', role: 'Cadet', status: 'Inactive', department: 'Engine Class B' }
])

const availableRoles = ['Admin', 'Assessment Officer', 'Instructor', 'Cadet']

// Modal State
const isAddModalOpen = ref(false)
const newUser = reactive({
  name: '',
  email: '',
  role: 'Instructor',
  department: '',
  password: ''
})

// Computed Filters[cite: 28]
const filteredUsers = computed(() => {
  return users.value.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesRole = roleFilter.value === 'All' || u.role === roleFilter.value
    return matchesSearch && matchesRole
  })
})

// Actions
function openAddModal() {
  newUser.name = ''
  newUser.email = ''
  newUser.role = 'Instructor'
  newUser.department = ''
  newUser.password = ''
  isAddModalOpen.value = true
}

function closeAddModal() {
  isAddModalOpen.value = false
}

function createUser() {
  if (!newUser.name || !newUser.email || !newUser.role) return
  
  users.value.push({
    id: Date.now(),
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    department: newUser.department || 'N/A',
    status: 'Active'
  })
  closeAddModal()
}

function deleteUser(id) {
  if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
    users.value = users.value.filter(u => u.id !== id)
  }
}
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <!-- Header[cite: 28] -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">User Management</h1>
        <p class="text-gray-500 mt-1">Manage instructor accounts, assessment officer privileges, and cadet rosters.</p>
      </div>

      <button 
        @click="openAddModal"
        class="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer"
      >
        <Plus :size="16" />
        Add New User
      </button>
    </div>

    <!-- Filters[cite: 28] -->
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
          class="border border-gray-300 rounded-lg text-sm px-3 py-2 bg-white focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
        >
          <option value="All">All Roles</option>
          <option v-for="role in availableRoles" :key="role" :value="role">{{ role }}</option>
        </select>
      </div>
    </div>

    <!-- Users Table[cite: 28] -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <table class="w-full text-left text-sm">
        <thead class="bg-gray-50 text-gray-600 border-b border-gray-200">
          <tr>
            <th class="px-6 py-3 font-semibold">User</th>
            <th class="px-6 py-3 font-semibold">Role</th>
            <th class="px-6 py-3 font-semibold">Department / Class</th>
            <th class="px-6 py-3 font-semibold">Status</th>
            <th class="px-6 py-3 font-semibold text-right">Actions</th>
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

            <td class="px-6 py-4 text-right">
              <button 
                @click="deleteUser(u.id)"
                class="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                title="Delete User"
              >
                <Trash2 :size="16" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create User Modal -->
    <div v-if="isAddModalOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        <div class="flex justify-between items-center p-4 border-b border-gray-100 bg-slate-50">
          <h2 class="text-lg font-bold text-gray-900">Add New User</h2>
          <button @click="closeAddModal" class="text-gray-400 hover:text-gray-600 cursor-pointer">
            <X :size="20" />
          </button>
        </div>

        <form @submit.prevent="createUser" class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
            <input v-model="newUser.name" type="text" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. John Doe">
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
            <input v-model="newUser.email" type="email" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="john@example.com">
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Role</label>
            <select v-model="newUser.role" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
              <option v-for="role in availableRoles" :key="role" :value="role">{{ role }}</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Department / Class</label>
            <input v-model="newUser.department" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. Deck Class A">
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Temporary Password</label>
            <input v-model="newUser.password" type="password" required class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="••••••••">
          </div>

          <div class="pt-4 flex gap-3">
            <button type="button" @click="closeAddModal" class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition cursor-pointer">
              Cancel
            </button>
            <button type="submit" class="flex-1 px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2 cursor-pointer">
              <Save :size="16" /> Save User
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>