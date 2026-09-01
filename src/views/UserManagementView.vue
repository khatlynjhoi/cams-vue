<script setup>
import { ref, computed } from 'vue'
import { Users, UserPlus, Search, ShieldCheck, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-vue-next'

const searchQuery = ref('')
const roleFilter = ref('All')
const isAddModalOpen = ref(false)

const users = ref([
  { id: 1, name: 'Capt. Alexander Wright', email: 'a.wright@bma.edu.ph', role: 'Instructor', department: 'Marine Transportation', status: 'Active' },
  { id: 2, name: 'Engr. Elena Rostova', email: 'e.rostova@bma.edu.ph', role: 'Instructor', department: 'Marine Engineering', status: 'Active' },
  { id: 3, name: 'Dela Cruz, Juan', email: 'j.delacruz@student.bma.edu.ph', role: 'Student', department: 'Marine Transportation', status: 'Active' },
  { id: 4, name: 'Santos, Maria', email: 'm.santos@student.bma.edu.ph', role: 'Student', department: 'Marine Engineering', status: 'Inactive' },
  { id: 5, name: 'System Administrator', email: 'admin@bma.edu.ph', role: 'Administrator', department: 'IT & Assessment', status: 'Active' }
])

const newUser = ref({
  name: '',
  email: '',
  role: 'Student',
  department: 'Marine Transportation'
})

const filteredUsers = computed(() => {
  return users.value.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesRole = roleFilter.value === 'All' || u.role === roleFilter.value
    return matchesSearch && matchesRole
  })
})

function addUser() {
  if (!newUser.value.name || !newUser.value.email) return
  users.value.unshift({
    id: Date.now(),
    ...newUser.value,
    status: 'Active'
  })
  newUser.value = { name: '', email: '', role: 'Student', department: 'Marine Transportation' }
  isAddModalOpen.value = false
}

function deleteUser(id) {
  if (confirm('Are you sure you want to remove this user account?')) {
    users.value = users.value.filter(u => u.id !== id)
  }
}
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">User Management</h1>
        <p class="text-gray-500 mt-1">Manage platform access, roles, and user accounts.</p>
      </div>
      <button 
        @click="isAddModalOpen = true"
        class="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
      >
        <UserPlus :size="16" />
        Add New User
      </button>
    </div>

    <!-- Filters & Search -->
    <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
      <div class="relative w-full md:w-96">
        <Search :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search by name or email..." 
          class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
        />
      </div>

      <div class="flex items-center gap-2 w-full md:w-auto">
        <span class="text-xs font-semibold text-gray-500">Role:</span>
        <select 
          v-model="roleFilter"
          class="border border-gray-300 rounded-lg text-sm px-3 py-2 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
        >
          <option value="All">All Roles</option>
          <option value="Student">Students</option>
          <option value="Instructor">Instructors</option>
          <option value="Administrator">Administrators</option>
        </select>
      </div>
    </div>

    <!-- User Table -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <table class="w-full text-left text-sm">
        <thead class="bg-gray-50 text-gray-600 border-b border-gray-200">
          <tr>
            <th class="px-6 py-3 font-semibold">User Details</th>
            <th class="px-6 py-3 font-semibold">Role</th>
            <th class="px-6 py-3 font-semibold">Department</th>
            <th class="px-6 py-3 font-semibold">Status</th>
            <th class="px-6 py-3 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div class="font-bold text-gray-900">{{ user.name }}</div>
              <div class="text-xs text-gray-500">{{ user.email }}</div>
            </td>
            <td class="px-6 py-4">
              <span 
                :class="[
                  'px-2.5 py-1 rounded-full text-xs font-semibold',
                  user.role === 'Administrator' ? 'bg-purple-100 text-purple-800' : '',
                  user.role === 'Instructor' ? 'bg-blue-100 text-blue-800' : '',
                  user.role === 'Student' ? 'bg-emerald-100 text-emerald-800' : ''
                ]"
              >
                {{ user.role }}
              </span>
            </td>
            <td class="px-6 py-4 text-gray-600 font-medium">{{ user.department }}</td>
            <td class="px-6 py-4">
              <span 
                :class="[
                  'inline-flex items-center gap-1 text-xs font-bold',
                  user.status === 'Active' ? 'text-emerald-600' : 'text-gray-400'
                ]"
              >
                <CheckCircle2 v-if="user.status === 'Active'" :size="14" />
                <XCircle v-else :size="14" />
                {{ user.status }}
              </span>
            </td>
            <td class="px-6 py-4 text-right space-x-2">
              <button 
                @click="deleteUser(user.id)" 
                class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove User"
              >
                <Trash2 :size="16" />
              </button>
            </td>
          </tr>
          <tr v-if="filteredUsers.length === 0">
            <td colspan="5" class="px-6 py-8 text-center text-gray-500">
              No user accounts found matching the criteria.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal: Add New User -->
    <div v-if="isAddModalOpen" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
        <h3 class="text-lg font-bold text-gray-900">Create New Account</h3>

        <form @submit.prevent="addUser" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
            <input 
              v-model="newUser.name" 
              type="text" 
              required 
              placeholder="e.g. Cruz, Juan"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
            <input 
              v-model="newUser.email" 
              type="email" 
              required 
              placeholder="user@bma.edu.ph"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Role</label>
              <select 
                v-model="newUser.role"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              >
                <option value="Student">Student</option>
                <option value="Instructor">Instructor</option>
                <option value="Administrator">Administrator</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Department</label>
              <select 
                v-model="newUser.department"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              >
                <option value="Marine Transportation">Marine Transportation</option>
                <option value="Marine Engineering">Marine Engineering</option>
                <option value="IT & Assessment">IT & Assessment</option>
              </select>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button 
              type="button"
              @click="isAddModalOpen = false" 
              class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
            >
              Save Account
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>