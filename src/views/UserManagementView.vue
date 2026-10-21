<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  X,
  AlertTriangle,
  Mail,
  User,
  Shield
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

// State
const users = ref([])
const isLoading = ref(false)
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

/**
 * Standard API Fetch helper supporting token authorization & role headers
 */
async function fetchFromEndpoints(path, options = {}) {
  const ports = ['/api', 'http://127.0.0.1:8000/api', 'http://localhost:8000/api']
  const token = auth.token || localStorage.getItem('cams_token') || localStorage.getItem('token') || ''

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-User-Role': auth.user?.role || 'Admin',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  }

  for (const baseUrl of ports) {
    try {
      const res = await fetch(`${baseUrl}${path}`, { ...options, headers })
      if (res.ok) {
        return await res.json()
      }
    } catch (e) {
      // Try next available endpoint
    }
  }
  throw new Error(`Endpoint ${path} unreachable`)
}

onMounted(() => {
  loadUsers()
})

async function loadUsers() {
  isLoading.value = true
  const localSaved = JSON.parse(localStorage.getItem('cams_users_list') || '[]')

  try {
    const data = await fetchFromEndpoints('/users')
    const rawList = Array.isArray(data) ? data : (data.data || data.users || [])

    if (Array.isArray(rawList) && rawList.length > 0) {
      const apiUsers = rawList.map(u => ({
        ...u,
        department: u.department || 'ICT',
        status: u.status || 'Active'
      }))

      // Merge local created items not present in remote backend
      localSaved.forEach(localItem => {
        if (!apiUsers.some(a => String(a.id) === String(localItem.id) || a.email === localItem.email)) {
          apiUsers.push(localItem)
        }
      })

      users.value = apiUsers
      saveLocalUsers()
    } else {
      loadFallbackUsers(localSaved)
    }
  } catch (e) {
    loadFallbackUsers(localSaved)
  } finally {
    isLoading.value = false
  }
}

function loadFallbackUsers(localSaved = []) {
  if (localSaved.length > 0) {
    users.value = localSaved
  } else {
    const defaults = [
      { id: 1, name: 'IT Administrator', email: 'it@bma.edu.ph', role: 'Admin', department: 'ICT', status: 'Active' },
      { id: 2, name: 'Percival Banting', email: 'p.banting@bma.edu.ph', role: 'Admin', department: 'ICT', status: 'Active' }
    ]
    users.value = defaults
    saveLocalUsers()
  }
}

function saveLocalUsers() {
  localStorage.setItem('cams_users_list', JSON.stringify(users.value))
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
  }

  formErrors.value = errors
  return Object.keys(errors).length === 0
}

async function handleCreateUser() {
  if (!validateForm(false)) return

  const payload = { 
    name: form.value.name.trim(),
    email: form.value.email.trim().toLowerCase(),
    role: form.value.role,
    department: form.value.department,
    status: form.value.status,
    password: form.value.password
  }

  try {
    const data = await fetchFromEndpoints('/users', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
    const resData = data.data || data
    if (data.success || resData.id) {
      const created = {
        ...resData,
        name: resData.name || payload.name,
        email: resData.email || payload.email,
        department: resData.department || payload.department,
        status: resData.status || payload.status
      }
      users.value.unshift(created)
    } else {
      addLocalUser(payload)
    }
  } catch (e) {
    addLocalUser(payload)
  } finally {
    saveLocalUsers()
    showAddModal.value = false
    resetForm()
  }
}

function addLocalUser(payload) {
  const newUser = { 
    ...payload, 
    id: Date.now(),
    department: payload.department || 'ICT',
    status: payload.status || 'Active'
  }
  delete newUser.password
  users.value.unshift(newUser)
}

async function handleUpdateUser() {
  if (!validateForm(true)) return

  try {
    const data = await fetchFromEndpoints(`/users/${form.value.id}`, {
      method: 'PUT',
      body: JSON.stringify(form.value)
    })
    const resData = data.data || data
    if (data.success || resData.id) {
      const idx = users.value.findIndex(u => u.id === form.value.id)
      if (idx !== -1) {
        users.value[idx] = {
          ...users.value[idx],
          ...resData,
          name: form.value.name,
          email: form.value.email,
          role: form.value.role,
          department: form.value.department,
          status: form.value.status
        }
      }
    } else {
      updateLocalUser()
    }
  } catch (e) {
    updateLocalUser()
  } finally {
    saveLocalUsers()
    showEditModal.value = false
    resetForm()
  }
}

function updateLocalUser() {
  const idx = users.value.findIndex(u => u.id === form.value.id)
  if (idx !== -1) {
    users.value[idx] = { 
      ...users.value[idx], 
      name: form.value.name,
      email: form.value.email,
      role: form.value.role,
      department: form.value.department,
      status: form.value.status
    }
  }
}

async function toggleUserAccess(user) {
  const newStatus = user.status === 'Active' ? 'Inactive' : 'Active'
  user.status = newStatus

  try {
    await fetchFromEndpoints(`/users/${user.id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus })
    })
  } catch (e) {}

  saveLocalUsers()
}

async function handleDeleteUser() {
  if (!selectedUser.value) return

  try {
    await fetchFromEndpoints(`/users/${selectedUser.value.id}`, {
      method: 'DELETE'
    })
  } catch (e) {}

  users.value = users.value.filter(u => u.id !== selectedUser.value.id)
  saveLocalUsers()
  showDeleteModal.value = false
  selectedUser.value = null
}
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6 font-sans text-slate-800">
    
    <!-- Top Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Users class="text-emerald-600" :size="24" /> User Access & Authorization
        </h1>
        <p class="text-xs text-slate-500 mt-1">
          Manage system privileges, edit accounts, and grant or revoke access rights across BMA departments.
        </p>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <button 
          @click="loadUsers"
          class="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition cursor-pointer"
          title="Refresh User List"
        >
          <RefreshCw :class="['w-4 h-4', { 'animate-spin': isLoading }]" />
        </button>

        <button 
          @click="openAddModal"
          class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
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
          class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
        />
      </div>

      <select v-model="selectedRoleFilter" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer">
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
        <tbody class="divide-y divide-slate-100 text-xs text-slate-700">
          <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-slate-50/80 transition-colors">
            
            <td class="p-3.5">
              <div class="font-bold text-slate-900">{{ user.name }}</div>
              <div class="text-[11px] text-slate-400 font-mono">{{ user.email }}</div>
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

            <td class="p-3.5 font-medium text-slate-800">{{ user.department || 'ICT' }}</td>

            <td class="p-3.5">
              <button 
                @click="toggleUserAccess(user)"
                :class="[
                  'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition cursor-pointer border',
                  (user.status || 'Active') === 'Active' 
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200' 
                    : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
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
                class="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                <Edit3 :size="14" class="inline mr-1" /> Edit
              </button>

              <button 
                @click="openDeleteModal(user)"
                class="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                <Trash2 :size="14" class="inline mr-1" /> Remove
              </button>
            </td>
          </tr>

          <tr v-if="filteredUsers.length === 0">
            <td colspan="5" class="p-8 text-center text-slate-400 font-medium text-xs">
              No matching user accounts found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ADD USER MODAL -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 border border-slate-200">
        <div class="flex justify-between items-center pb-2 border-b border-slate-100">
          <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <UserPlus class="text-emerald-600" :size="18" /> Create New System Account
          </h3>
          <button @click="showAddModal = false" class="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X :size="18" />
          </button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Full Name</label>
            <input 
              v-model="form.name" 
              placeholder="e.g. Percival Banting" 
              class="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" 
            />
            <p v-if="formErrors.name" class="text-[11px] text-rose-600 mt-1 font-medium">{{ formErrors.name }}</p>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Email Address</label>
            <input 
              v-model="form.email" 
              type="email" 
              placeholder="e.g. p.banting@bma.edu.ph" 
              class="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" 
            />
            <p v-if="formErrors.email" class="text-[11px] text-rose-600 mt-1 font-medium">{{ formErrors.email }}</p>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Initial Password</label>
            <input 
              v-model="form.password" 
              type="password" 
              placeholder="••••••••" 
              class="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" 
            />
            <p v-if="formErrors.password" class="text-[11px] text-rose-600 mt-1 font-medium">{{ formErrors.password }}</p>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">System Role</label>
              <select v-model="form.role" class="w-full p-2.5 border border-slate-200 rounded-xl outline-none bg-white font-semibold text-slate-800 cursor-pointer">
                <option v-for="r in rolesList" :key="r" :value="r">{{ r }}</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Department</label>
              <select v-model="form.department" class="w-full p-2.5 border border-slate-200 rounded-xl outline-none bg-white font-semibold text-slate-800 cursor-pointer">
                <option v-for="d in departmentList" :key="d" :value="d">{{ d }}</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Access Authorization Status</label>
            <select v-model="form.status" class="w-full p-2.5 border border-slate-200 rounded-xl outline-none bg-white font-semibold text-slate-800 cursor-pointer">
              <option value="Active">Active (System Access Granted)</option>
              <option value="Inactive">Inactive (System Access Revoked)</option>
            </select>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button @click="showAddModal = false" class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer">
            Cancel
          </button>
          <button @click="handleCreateUser" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer">
            Create & Grant Access
          </button>
        </div>
      </div>
    </div>

    <!-- EDIT USER MODAL -->
    <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 border border-slate-200">
        <div class="flex justify-between items-center pb-2 border-b border-slate-100">
          <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <Edit3 class="text-emerald-600" :size="18" /> Edit User Account
          </h3>
          <button @click="showEditModal = false" class="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X :size="18" />
          </button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Full Name</label>
            <input v-model="form.name" class="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
            <p v-if="formErrors.name" class="text-[11px] text-rose-600 mt-1 font-medium">{{ formErrors.name }}</p>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Email Address</label>
            <input v-model="form.email" type="email" class="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
            <p v-if="formErrors.email" class="text-[11px] text-rose-600 mt-1 font-medium">{{ formErrors.email }}</p>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Reset Password (Optional)</label>
            <input v-model="form.password" type="password" placeholder="Leave blank to keep current password" class="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">System Role</label>
              <select v-model="form.role" class="w-full p-2.5 border border-slate-200 rounded-xl outline-none bg-white font-semibold text-slate-800 cursor-pointer">
                <option v-for="r in rolesList" :key="r" :value="r">{{ r }}</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Department</label>
              <select v-model="form.department" class="w-full p-2.5 border border-slate-200 rounded-xl outline-none bg-white font-semibold text-slate-800 cursor-pointer">
                <option v-for="d in departmentList" :key="d" :value="d">{{ d }}</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Access Authorization Status</label>
            <select v-model="form.status" class="w-full p-2.5 border border-slate-200 rounded-xl outline-none bg-white font-semibold text-slate-800 cursor-pointer">
              <option value="Active">Active (System Access Granted)</option>
              <option value="Inactive">Inactive (System Access Revoked)</option>
            </select>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button @click="showEditModal = false" class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer">
            Cancel
          </button>
          <button @click="handleUpdateUser" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer">
            Save Changes
          </button>
        </div>
      </div>
    </div>

    <!-- DELETE USER MODAL -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4 text-center border border-slate-200">
        <div class="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle :size="24" />
        </div>
        <div>
          <h3 class="text-base font-bold text-slate-900">Remove User Account</h3>
          <p class="text-xs text-slate-500 mt-1">
            Are you sure you want to delete <strong class="text-slate-800">{{ selectedUser?.name }}</strong>?
          </p>
        </div>

        <div class="flex gap-2 pt-2">
          <button @click="showDeleteModal = false" class="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer">
            Cancel
          </button>
          <button @click="handleDeleteUser" class="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer">
            Confirm Removal
          </button>
        </div>
      </div>
    </div>

  </div>
</template>