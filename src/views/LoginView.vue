<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { LogIn, Mail, Lock, AlertCircle, RefreshCw, GraduationCap } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('it@bma.edu.ph')
const password = ref('password')
const isLoading = ref(false)
const isStudentLoading = ref(false)
const errorMessage = ref('')

async function handleLogin() {
  if (!email.value || !password.value) {
    errorMessage.value = 'Please enter both institutional email and password.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const success = await authStore.login(email.value, password.value)
    if (success) {
      router.push('/')
    } else {
      errorMessage.value = 'Invalid credentials. Please try again.'
    }
  } catch (err) {
    errorMessage.value = 'Authentication service unreachable.'
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
  <div class="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-slate-800">
    <div class="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 p-8 space-y-6">
      
      <div class="text-center space-y-2">
        <div class="w-12 h-12 bg-[#123524] rounded-2xl flex items-center justify-center mx-auto text-white font-black text-xl shadow-lg">
          C
        </div>
        <h2 class="text-2xl font-bold text-slate-900">CAMS Portal</h2>
        <p class="text-xs font-semibold text-emerald-700 uppercase tracking-wider">STCW Examination System v2.4</p>
      </div>

      <div v-if="errorMessage" class="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
        <AlertCircle :size="16" class="shrink-0 text-rose-600" />
        <span>{{ errorMessage }}</span>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Institutional Email</label>
          <div class="relative">
            <Mail :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              v-model="email" 
              type="email" 
              placeholder="e.g. it@bma.edu.ph"
              required
              class="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Password</label>
          <div class="relative">
            <Lock :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              v-model="password" 
              type="password" 
              placeholder="••••••••"
              required
              class="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>

        <button 
          type="submit" 
          :disabled="isLoading || isStudentLoading"
          class="w-full py-3 bg-[#123524] hover:bg-[#0e2a1d] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw v-if="isLoading" :size="16" class="animate-spin" />
          <LogIn v-else :size="16" />
          <span>{{ isLoading ? 'Authenticating...' : 'Sign In as Faculty / Staff' }}</span>
        </button>
      </form>

      <div class="relative flex items-center justify-center my-2">
        <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-slate-200"></div></div>
        <span class="relative bg-white px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Candidate Portal</span>
      </div>

      <button 
        type="button"
        @click="handleStudentContinue"
        :disabled="isLoading || isStudentLoading"
        class="w-full py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <RefreshCw v-if="isStudentLoading" :size="16" class="animate-spin text-emerald-700" />
        <GraduationCap v-else :size="18" class="text-emerald-700" />
        <span>Continue as Student / Cadet</span>
      </button>

      <div class="text-center pt-2 border-t border-slate-100">
        <p class="text-[11px] text-slate-400">Baliwag Maritime Academy System</p>
      </div>

    </div>
  </div>
</template>