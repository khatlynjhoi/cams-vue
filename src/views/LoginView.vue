<template>
  <div class="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
      
      <!-- Header Banner -->
      <div class="bg-slate-900 text-white px-6 py-8 text-center relative overflow-hidden">
        <!-- Background Accent Grid -->
        <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <!-- Brand Badge -->
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          STCW Exam Engine v2.4
        </div>

        <div class="flex items-center justify-center gap-3 mb-2">
          <div class="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-xl text-white shadow-lg">
            B
          </div>
          <h1 class="text-xl font-bold tracking-wide">BMA Maritime Portal</h1>
        </div>
        
        <p class="text-xs text-slate-300 font-medium tracking-wide uppercase mt-1">
          Comprehensive Assessment Management System
        </p>
      </div>

      <!-- Login Form Section -->
      <div class="p-6 sm:p-8">
        <div class="mb-6">
          <h2 class="text-lg font-bold text-slate-800">Sign In</h2>
          <p class="text-xs text-slate-500 mt-0.5">Enter your credentials to access your assessment dashboard.</p>
        </div>

        <!-- Error Notification -->
        <div v-if="errorMessage" class="mb-5 p-3.5 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded-r-lg flex items-start gap-2">
          <svg class="w-4 h-4 shrink-0 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ errorMessage }}</span>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- Username Input -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Username
            </label>
            <div class="relative">
              <input 
                v-model="username" 
                type="text" 
                required 
                placeholder="e.g. admin or cadet"
                class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-slate-50/50 focus:bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          <!-- Password Input -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div class="relative">
              <input 
                v-model="password" 
                type="password" 
                required 
                placeholder="••••••••"
                class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-slate-50/50 focus:bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit" 
            :disabled="isLoading"
            class="w-full py-3 px-4 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg v-if="isLoading" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ isLoading ? 'Authenticating...' : 'Sign In to Dashboard' }}</span>
          </button>
        </form>
      </div>

      <!-- Footer -->
      <div class="bg-slate-50 px-6 py-3 border-t border-slate-100 text-center">
        <p class="text-[11px] text-slate-400">
          BMA Pilot System &bull; Powered by Comprehensive Assessment Management System
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const password = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  errorMessage.value = ''
  isLoading.value = true

  try {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.value,
        password: password.value
      })
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Invalid username or password')
    }

    // Persist Auth State
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))

    // Redirect to Main Dashboard
    router.push('/')
  } catch (err) {
    errorMessage.value = err.message || 'Unable to connect to the authentication server.'
  } finally {
    isLoading.value = false
  }
}
</script>