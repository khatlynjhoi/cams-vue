<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { LogIn, Mail, Lock, AlertCircle, RefreshCw, GraduationCap } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

// Dynamically resolve logo URL
const baseUrl = import.meta.env.BASE_URL || '/'
const logoUrl = `${baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'}cams-logo.png`

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const isStudentLoading = ref(false)
const errorMessage = ref('')

/**
 * Fetch registered accounts from User Management (localStorage & API)
 */
async function fetchUsersList() {
  let localUsers = []
  try {
    const raw = localStorage.getItem('cams_users_list')
    if (raw) localUsers = JSON.parse(raw)
  } catch (e) {
    localUsers = []
  }

  // Fallback defaults if list is completely empty
  if (!Array.isArray(localUsers) || localUsers.length === 0) {
    localUsers = [
      { id: 1, name: 'IT Administrator', email: 'it@bma.edu.ph', password: 'password', role: 'Admin', department: 'ICT', status: 'Active' },
      { id: 2, name: 'Percival Banting', email: 'p.banting@bma.edu.ph', password: 'password', role: 'Admin', department: 'ICT', status: 'Active' }
    ]
    localStorage.setItem('cams_users_list', JSON.stringify(localUsers))
  }

  try {
    const token = authStore.token || localStorage.getItem('cams_token') || ''
    const res = await fetch('/api/users', {
      headers: {
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    })
    if (res.ok) {
      const data = await res.json()
      const apiUsers = Array.isArray(data) ? data : (data.data || data.users || [])
      if (apiUsers.length > 0) {
        apiUsers.forEach(u => {
          const existingLocal = localUsers.find(l => l.email && l.email.toLowerCase() === u.email.toLowerCase())
          if (!existingLocal) {
            localUsers.push({
              ...u,
              status: u.status || 'Active'
            })
          } else if (!u.password && existingLocal.password) {
            // Retain local custom password if API user record lacks password field
            u.password = existingLocal.password
          }
        })
      }
    }
  } catch (e) {
    // API offline, use local storage list
  }

  return localUsers
}

async function handleLogin() {
  const inputEmail = email.value.trim().toLowerCase()
  const inputPassword = password.value.trim()

  if (!inputEmail || !inputPassword) {
    errorMessage.value = 'Please enter both institutional email and password.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const registeredUsers = await fetchUsersList()
    
    // 1. Check account existence in User Management
    const matchedUser = registeredUsers.find(
      u => u && u.email && u.email.trim().toLowerCase() === inputEmail
    )

    if (!matchedUser) {
      errorMessage.value = 'Account not found. Only registered accounts created in User Management can log in.'
      isLoading.value = false
      return
    }

    // 2. Access Authorization Status Check
    if ((matchedUser.status || 'Active').toLowerCase() !== 'active') {
      errorMessage.value = 'Access Revoked: Your account is marked as Inactive in User Management.'
      isLoading.value = false
      return
    }

    // 3. STRICT Password Match against stored account record
    const storedPassword = matchedUser.password || 'password'
    if (inputPassword !== storedPassword) {
      errorMessage.value = 'Incorrect password. Please verify your credentials.'
      isLoading.value = false
      return
    }

    // 4. Complete session login in Auth Store
    if (authStore.login) {
      await authStore.login(inputEmail, inputPassword, matchedUser)
    }

    // Save authorized user session
    localStorage.setItem('cams_user', JSON.stringify(matchedUser))
    localStorage.setItem('cams_user_role', matchedUser.role || 'Admin')
    if (!localStorage.getItem('cams_token')) {
      localStorage.setItem('cams_token', `cams-token-${Date.now()}`)
    }

    router.push('/')
  } catch (err) {
    errorMessage.value = 'An error occurred during authentication. Please try again.'
  } finally {
    isLoading.value = false
  }
}

async function handleStudentContinue() {
  isStudentLoading.value = true
  try {
    await authStore.loginAsStudent()
    router.push('/student-exam')
  } catch (err) {
    errorMessage.value = 'Failed to open Student Portal. Please try again.'
  } finally {
    isStudentLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-linear-to-br from-slate-950 via-[#0e2a1d] to-slate-900 flex items-center justify-center p-4 font-sans text-slate-800 antialiased">
    <div class="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 p-8 space-y-6 relative">
      
      <!-- CAMS Logo Header -->
      <div class="text-center space-y-3">
        <div class="w-full flex items-center justify-center">
          <img 
            :src="logoUrl" 
            alt="CAMS - Comprehensive Assessment Management System" 
            class="max-w-full h-auto max-h-32 object-contain mx-auto" 
          />
        </div>
      </div>

      <!-- Error Alert Message -->
      <div v-if="errorMessage" class="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-semibold flex items-center gap-2">
        <AlertCircle :size="16" class="shrink-0 text-rose-600" />
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Faculty / Staff Authentication Form -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Institutional Email</label>
          <div class="relative">
            <Mail :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              v-model="email" 
              type="email" 
              placeholder="e.g. email@bma.edu.ph"
              autocomplete="off"
              required
              class="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Password</label>
          <div class="relative">
            <Lock :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              v-model="password" 
              type="password" 
              placeholder="••••••••"
              autocomplete="new-password"
              required
              class="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <button 
          type="submit" 
          :disabled="isLoading || isStudentLoading"
          class="w-full py-3 bg-[#123524] hover:bg-[#0e2a1d] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw v-if="isLoading" :size="16" class="animate-spin text-emerald-400" />
          <LogIn v-else :size="16" class="text-emerald-400" />
          <span>{{ isLoading ? 'Authenticating Credentials...' : 'Sign In as Faculty / Staff' }}</span>
        </button>
      </form>

      <!-- Section Divider -->
      <div class="relative flex items-center justify-center my-2">
        <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-slate-200"></div></div>
        <span class="relative bg-white px-3 text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Candidate / Cadet Access</span>
      </div>

      <!-- Student Examination Portal Button -->
      <button 
        type="button"
        @click="handleStudentContinue"
        :disabled="isLoading || isStudentLoading"
        class="w-full py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RefreshCw v-if="isStudentLoading" :size="16" class="animate-spin text-emerald-700" />
        <GraduationCap v-else :size="18" class="text-emerald-700" />
        <span>Continue to Cadet Exam Portal</span>
      </button>

      <!-- Institutional Footer Branding -->
      <div class="text-center pt-2 border-t border-slate-100">
        <p class="text-[12px] text-slate-400 font-mono">BALIWAG MARITIME ACADEMY, INC.</p>
      </div>

    </div>
  </div>
</template>