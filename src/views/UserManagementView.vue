<template>
  <div class="p-4 md:p-6 max-w-8xl mx-auto space-y-6 font-sans text-slate-800 antialiased relative min-h-screen bg-slate-50">
    
    <!-- BRANDED SKELETON LOADER -->
    <div v-if="isLoading" class="space-y-6 animate-pulse">
      <div class="bg-linear-to-r from-[#123524] to-[#1b4d35] p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 bg-emerald-500/30 rounded-md"></div>
            <div class="h-6 w-72 max-w-full bg-white/20 rounded-md"></div>
          </div>
          <div class="h-3.5 w-96 max-w-full bg-white/10 rounded-md"></div>
        </div>
        <div class="h-10 w-40 bg-white/10 rounded-xl"></div>
      </div>

      <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div class="h-9 bg-slate-100 rounded-xl flex-1 w-full"></div>
        <div class="h-9 w-36 bg-slate-100 rounded-xl"></div>
      </div>

      <div class="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div class="p-3.5 bg-slate-50 border-b border-slate-200/80 flex gap-4">
          <div v-for="w in ['w-48', 'w-28', 'w-24', 'w-32', 'w-28']" :key="w" :class="[w, 'h-4 bg-slate-200 rounded']"></div>
        </div>
        <div class="divide-y divide-slate-100">
          <div v-for="r in 5" :key="r" class="p-3.5 flex gap-4 items-center">
            <div class="w-48 space-y-1.5">
              <div class="h-4 w-32 bg-slate-200 rounded"></div>
              <div class="h-3 w-40 bg-slate-100 rounded"></div>
            </div>
            <div class="w-28 h-6 bg-purple-100/60 rounded-full"></div>
            <div class="w-24 h-4 bg-slate-200 rounded"></div>
            <div class="w-32 h-6 bg-emerald-100/60 rounded-full"></div>
            <div class="w-28 h-7 bg-slate-100 rounded-xl ml-auto"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- MAIN VIEW CONTENT -->
    <div v-else class="space-y-6">

      <!-- Header Hero Banner -->
      <div class="bg-[#123524] text-white p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
        <div class="space-y-1">
          <h1 class="text-xl font-bold flex items-center gap-2 text-white tracking-tight">
            <Users class="text-emerald-400" :size="22" />
            User Access & Authorization
          </h1>
          <p class="text-sm text-slate-200 font-normal">
            Manage system privileges, edit accounts, and grant or revoke access rights across BMA departments.
          </p>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button 
            @click="openAddModal"
            class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
          >
            <UserPlus :size="16" /> Add New Account
          </button>
        </div>
      </div>

      <!-- Filter Toolbar -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div class="relative flex-1 w-full">
          <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            v-model="searchQuery"
            type="text"
            placeholder="Search by name, email, or department..."
            class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
          />
        </div>

        <select 
          v-model="selectedRoleFilter" 
          class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none cursor-pointer focus:bg-white focus:ring-2 focus:ring-emerald-500"
        >
          <option value="All">All Roles</option>
          <option v-for="r in rolesList" :key="r" :value="r">{{ r }}</option>
        </select>
      </div>

      <!-- User Data Table -->
      <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
              <th class="p-3.5">User Details</th>
              <th class="p-3.5">Assigned Role</th>
              <th class="p-3.5">Department</th>
              <th class="p-3.5">System Access</th>
              <th class="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm text-slate-700">
            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-slate-50/80 transition-colors">
              
              <td class="p-3.5">
                <div class="font-bold text-slate-900">{{ user.name }}</div>
                <div class="text-[11px] text-slate-400 font-mono font-semibold">{{ user.email }}</div>
              </td>

              <td class="p-3.5">
                <span :class="[
                  'px-2.5 py-1 rounded-full text-[11px] font-bold border',
                  user.role === 'Admin' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                  user.role === 'Assessment Officer' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                  user.role === 'Instructor' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                  'bg-slate-100 text-slate-700 border-slate-200'
                ]">
                  {{ user.role }}
                </span>
              </td>

              <td class="p-3.5 font-bold text-slate-800">{{ user.department || 'ICT' }}</td>

              <td class="p-3.5">
                <button 
                  @click="toggleUserAccess(user)"
                  :class="[
                    'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition cursor-pointer border shadow-xs',
                    (user.status || 'Active') === 'Active' 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100' 
                      : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                  ]"
                  title="Click to toggle system access permission"
                >
                  <CheckCircle2 v-if="(user.status || 'Active') === 'Active'" :size="12" />
                  <XCircle v-else :size="12" />
                  {{ (user.status || 'Active') === 'Active' ? 'Access Granted' : 'Access Revoked' }}
                </button>
              </td>

              <td class="p-3.5 text-right space-x-2">
                <button 
                  @click="openEditModal(user)"
                  class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-sm font-bold transition cursor-pointer"
                >
                  <Edit3 :size="14" class="inline mr-1" /> Edit
                </button>

                <button 
                  @click="openDeleteModal(user)"
                  class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-sm font-bold transition cursor-pointer"
                >
                  <Trash2 :size="14" class="inline mr-1" /> Remove
                </button>
              </td>
            </tr>

            <tr v-if="filteredUsers.length === 0">
              <td colspan="5" class="p-12 text-center text-slate-400 font-medium text-sm">
                <Users class="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p class="font-bold text-slate-700 text-sm">No User Accounts Found</p>
                <p class="text-sm text-slate-400 mt-1">No registered users match your search query or role filter.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ADD USER MODAL -->
      <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4 border border-slate-200 overflow-hidden">
          <div class="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserPlus class="text-emerald-700" :size="18" /> Create New System Account
            </h3>
            <button @click="showAddModal = false" class="text-slate-400 hover:text-slate-600 cursor-pointer">
              <X :size="18" />
            </button>
          </div>

          <div class="space-y-3.5 text-sm">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Full Name</label>
              <input 
                v-model="form.name" 
                placeholder="e.g. Percival Banting" 
                class="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white text-slate-900 font-semibold" 
              />
              <p v-if="formErrors.name" class="text-[11px] text-rose-600 mt-1 font-semibold">{{ formErrors.name }}</p>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Email Address</label>
              <input 
                v-model="form.email" 
                type="email" 
                placeholder="e.g. p.banting@bma.edu.ph" 
                class="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white text-slate-900 font-semibold" 
              />
              <p v-if="formErrors.email" class="text-[11px] text-rose-600 mt-1 font-semibold">{{ formErrors.email }}</p>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Initial Password</label>
              <input 
                v-model="form.password" 
                type="password" 
                placeholder="••••••••" 
                class="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white text-slate-900 font-semibold" 
              />

              <div v-if="form.password" class="mt-2 space-y-1">
                <div class="flex justify-between items-center text-xs font-bold">
                  <span class="text-slate-500">Strength:</span>
                  <span :class="passwordStrength.color">{{ passwordStrength.label }}</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div 
                    class="h-full transition-all duration-300" 
                    :class="passwordStrength.barColor" 
                    :style="{ width: `${passwordStrength.score}%` }"
                  ></div>
                </div>
              </div>

              <p v-if="formErrors.password" class="text-[11px] text-rose-600 mt-1 font-semibold">{{ formErrors.password }}</p>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">System Role</label>
                <select v-model="form.role" class="w-full p-2.5 border border-slate-200 rounded-xl outline-none bg-slate-50 focus:bg-white font-bold text-slate-800 cursor-pointer">
                  <option v-for="r in rolesList" :key="r" :value="r">{{ r }}</option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1">Department</label>
                <select v-model="form.department" class="w-full p-2.5 border border-slate-200 rounded-xl outline-none bg-slate-50 focus:bg-white font-bold text-slate-800 cursor-pointer">
                  <option v-for="d in departmentList" :key="d" :value="d">{{ d }}</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Access Authorization Status</label>
              <select v-model="form.status" class="w-full p-2.5 border border-slate-200 rounded-xl outline-none bg-slate-50 focus:bg-white font-bold text-slate-800 cursor-pointer">
                <option value="Active">Active (System Access Granted)</option>
                <option value="Inactive">Inactive (System Access Revoked)</option>
              </select>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button @click="showAddModal = false" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl cursor-pointer">
              Cancel
            </button>
            <button @click="handleCreateUser" :disabled="isSubmitting" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs cursor-pointer disabled:opacity-50">
              {{ isSubmitting ? 'Saving...' : 'Create & Grant Access' }}
            </button>
          </div>
        </div>
      </div>

      <!-- EDIT USER MODAL -->
      <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4 border border-slate-200 overflow-hidden">
          <div class="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <Edit3 class="text-emerald-700" :size="18" /> Edit User Account
            </h3>
            <button @click="showEditModal = false" class="text-slate-400 hover:text-slate-600 cursor-pointer">
              <X :size="18" />
            </button>
          </div>

          <div class="space-y-3.5 text-sm">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Full Name</label>
              <input v-model="form.name" class="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white text-slate-900 font-semibold" />
              <p v-if="formErrors.name" class="text-[11px] text-rose-600 mt-1 font-semibold">{{ formErrors.name }}</p>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Email Address</label>
              <input v-model="form.email" type="email" class="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white text-slate-900 font-semibold" />
              <p v-if="formErrors.email" class="text-[11px] text-rose-600 mt-1 font-semibold">{{ formErrors.email }}</p>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Reset Password (Optional)</label>
              <input v-model="form.password" type="password" placeholder="Leave blank to keep current password" class="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white text-slate-900 font-semibold" />

              <div v-if="form.password" class="mt-2 space-y-1">
                <div class="flex justify-between items-center text-xs font-bold">
                  <span class="text-slate-500">Strength:</span>
                  <span :class="passwordStrength.color">{{ passwordStrength.label }}</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div 
                    class="h-full transition-all duration-300" 
                    :class="passwordStrength.barColor" 
                    :style="{ width: `${passwordStrength.score}%` }"
                  ></div>
                </div>
              </div>

              <p v-if="formErrors.password" class="text-[11px] text-rose-600 mt-1 font-semibold">{{ formErrors.password }}</p>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">System Role</label>
                <select v-model="form.role" class="w-full p-2.5 border border-slate-200 rounded-xl outline-none bg-slate-50 focus:bg-white font-bold text-slate-800 cursor-pointer">
                  <option v-for="r in rolesList" :key="r" :value="r">{{ r }}</option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1">Department</label>
                <select v-model="form.department" class="w-full p-2.5 border border-slate-200 rounded-xl outline-none bg-slate-50 focus:bg-white font-bold text-slate-800 cursor-pointer">
                  <option v-for="d in departmentList" :key="d" :value="d">{{ d }}</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Access Authorization Status</label>
              <select v-model="form.status" class="w-full p-2.5 border border-slate-200 rounded-xl outline-none bg-slate-50 focus:bg-white font-bold text-slate-800 cursor-pointer">
                <option value="Active">Active (System Access Granted)</option>
                <option value="Inactive">Inactive (System Access Revoked)</option>
              </select>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button @click="showEditModal = false" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl cursor-pointer">
              Cancel
            </button>
            <button @click="handleUpdateUser" :disabled="isSubmitting" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs cursor-pointer disabled:opacity-50">
              {{ isSubmitting ? 'Updating...' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </div>

      <!-- DELETE USER MODAL -->
      <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-4 text-center border border-slate-200 overflow-hidden">
          <div class="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle :size="24" />
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900">Remove User Account</h3>
            <p class="text-sm text-slate-500 mt-1">
              Are you sure you want to delete <strong class="text-slate-800">{{ selectedUser?.name }}</strong>?
            </p>
          </div>

          <div class="flex gap-2 pt-2">
            <button @click="showDeleteModal = false" class="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl cursor-pointer">
              Cancel
            </button>
            <button @click="handleDeleteUser" class="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl shadow-xs cursor-pointer">
              Confirm Removal
            </button>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  X,
  AlertTriangle
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

// State
const users = ref([])
const isLoading = ref(true)
const isSubmitting = ref(false)
const searchQuery = ref('')
const selectedRoleFilter = ref('All')

const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selectedUser = ref(null)

const initialFormState = {
  id: null,
  name: '',
  email: '',
  password: '',
  role: 'Instructor',
  department: 'BSMT',
  status: 'Active'
}

const form = ref({ ...initialFormState })
const formErrors = ref({})

const rolesList = ['Admin', 'Assessment Officer', 'Instructor', 'Cadet']
const departmentList = ['BSMT', 'BSMARE', 'General Education', 'Assessment & Quality', 'ICT']

// Password Strength Evaluator
const passwordStrength = computed(() => {
  const pwd = form.value.password || ''
  if (!pwd) return { score: 0, label: '', color: '', barColor: 'bg-slate-200' }

  let score = 0
  if (pwd.length >= 8) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++

  switch (score) {
    case 1:
      return { score: 25, label: 'Weak', color: 'text-rose-600', barColor: 'bg-rose-500' }
    case 2:
      return { score: 50, label: 'Fair', color: 'text-amber-600', barColor: 'bg-amber-500' }
    case 3:
      return { score: 75, label: 'Good', color: 'text-blue-600', barColor: 'bg-blue-500' }
    case 4:
      return { score: 100, label: 'Strong', color: 'text-emerald-600', barColor: 'bg-emerald-500' }
    default:
      return { score: 0, label: '', color: '', barColor: 'bg-slate-200' }
  }
})

/**
 * Standard API Fetch helper prioritizing fresh localStorage token and Vue Router navigation
 */
async function sendApiRequest(path, options = {}) {
  const endpoints = ['/api', 'http://127.0.0.1:8000/api', 'http://localhost:8000/api']
  // Prioritize fresh cams_token from localStorage over stale Pinia state
  const token = localStorage.getItem('cams_token') || auth.token || localStorage.getItem('token') || ''

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-User-Role': auth.user?.role || localStorage.getItem('cams_user_role') || 'Admin',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  }

  for (const baseUrl of endpoints) {
    try {
      const res = await fetch(`${baseUrl}${path}`, { ...options, headers })
      const contentType = res.headers.get('content-type') || ''
      
      if (contentType.includes('application/json')) {
        const data = await res.json()

        // Handle expired Sanctum token using Vue Router to preserve base URL /cams-vue/
        if (res.status === 401) {
          localStorage.removeItem('cams_token')
          localStorage.removeItem('cams_user')

          if (router) {
            router.push({ path: '/login', query: { expired: 'true' } })
          } else {
            const viteBase = import.meta.env.BASE_URL || '/'
            const cleanBase = viteBase.endsWith('/') ? viteBase.slice(0, -1) : viteBase
            window.location.href = `${cleanBase}/login?expired=true`
          }
          return { ok: false, status: 401, data: { message: 'Session expired. Please log in again.' } }
        }

        return { ok: res.ok, status: res.status, data }
      }
    } catch (e) {
      // Try next available endpoint
    }
  }
  throw new Error(`API Endpoint ${path} unreachable`)
}

onMounted(() => {
  loadUsers()
})

async function loadUsers() {
  isLoading.value = true
  try {
    const res = await sendApiRequest('/users')
    if (res && res.ok) {
      const rawList = Array.isArray(res.data) ? res.data : (res.data.data || res.data.users || [])
      users.value = rawList.map(u => ({
        ...u,
        department: u.department || 'ICT',
        status: u.status || 'Active'
      }))
      return
    }
  } catch (e) {
    console.warn('API unavailable, loading local cached user list.')
  } finally {
    isLoading.value = false
  }

  // Local fallback if backend server is unreachable
  const localSaved = JSON.parse(localStorage.getItem('cams_users_list') || '[]')
  users.value = localSaved.length ? localSaved : [
    { id: 1, name: 'IT Administrator', email: 'it@bma.edu.ph', role: 'Admin', department: 'ICT', status: 'Active' },
    { id: 2, name: 'Percival Banting', email: 'p.banting@bma.edu.ph', role: 'Admin', department: 'ICT', status: 'Active' }
  ]
}

const filteredUsers = computed(() => {
  return users.value.filter(u => {
    const q = searchQuery.value.toLowerCase().trim()
    const matchesQuery = !q || 
      u.name.toLowerCase().includes(q) || 
      u.email.toLowerCase().includes(q) || 
      (u.department && u.department.toLowerCase().includes(q))
    
    const matchesRole = selectedRoleFilter.value === 'All' || u.role === selectedRoleFilter.value
    return matchesQuery && matchesRole
  })
})

function resetForm() {
  form.value = { ...initialFormState }
  formErrors.value = {}
}

function openAddModal() {
  resetForm()
  showAddModal.value = true
}

function openEditModal(user) {
  selectedUser.value = user
  form.value = { ...user, password: '' }
  formErrors.value = {}
  showEditModal.value = true
}

function openDeleteModal(user) {
  selectedUser.value = user
  showDeleteModal.value = true
}

function validateForm(isEdit = false) {
  const errors = {}
  if (!form.value.name.trim()) errors.name = 'Full name is required.'
  if (!form.value.email.trim()) {
    errors.email = 'Email address is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.email = 'Invalid email format.'
  }

  if (!isEdit && !form.value.password) {
    errors.password = 'Initial password is required.'
  } else if (form.value.password && form.value.password.length < 8) {
    errors.password = 'Password must be at least 8 characters long.'
  } else if (form.value.password && passwordStrength.value.score < 50) {
    errors.password = 'Password is too weak. Combine letters, numbers, and symbols.'
  }

  formErrors.value = errors
  return Object.keys(errors).length === 0
}

async function handleCreateUser() {
  if (!validateForm(false)) return
  isSubmitting.value = true

  const payload = { 
    name: form.value.name.trim(),
    email: form.value.email.trim().toLowerCase(),
    role: form.value.role,
    department: form.value.department,
    status: form.value.status,
    password: form.value.password.trim()
  }

  try {
    const res = await sendApiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(payload)
    })

    if (res && res.ok) {
      await loadUsers()
      showAddModal.value = false
      resetForm()
    } else {
      const msg = res?.data?.message || 'Failed to create user in database.'
      formErrors.value = { password: msg }
    }
  } catch (e) {
    alert('Server unreachable. Could not save user to MySQL.')
  } finally {
    isSubmitting.value = false
  }
}

async function handleUpdateUser() {
  if (!validateForm(true)) return
  isSubmitting.value = true

  const payload = {
    name: form.value.name.trim(),
    email: form.value.email.trim().toLowerCase(),
    role: form.value.role,
    department: form.value.department,
    status: form.value.status
  }

  // Only include password if explicitly modified
  if (form.value.password && form.value.password.trim()) {
    payload.password = form.value.password.trim()
  }

  try {
    const res = await sendApiRequest(`/users/${form.value.id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })

    if (res && res.ok) {
      await loadUsers()
      showEditModal.value = false
      resetForm()
      alert('User account updated successfully in MySQL!')
    } else {
      const msg = res?.data?.message || 'Failed to update user in MySQL.'
      formErrors.value = { password: msg }
    }
  } catch (e) {
    alert('Server unreachable. Could not update user in MySQL.')
  } finally {
    isSubmitting.value = false
  }
}

async function toggleUserAccess(user) {
  const newStatus = user.status === 'Active' ? 'Inactive' : 'Active'
  try {
    const res = await sendApiRequest(`/users/${user.id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus })
    })
    if (res && res.ok) {
      user.status = newStatus
    }
  } catch (e) {
    alert('Could not update status on MySQL server.')
  }
}

async function handleDeleteUser() {
  if (!selectedUser.value) return

  try {
    const res = await sendApiRequest(`/users/${selectedUser.value.id}`, {
      method: 'DELETE'
    })
    if (res && res.ok) {
      await loadUsers()
    }
  } catch (e) {
    alert('Failed to remove user from MySQL server.')
  } finally {
    showDeleteModal.value = false
    selectedUser.value = null
  }
}
</script>