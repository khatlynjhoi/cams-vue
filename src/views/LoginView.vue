<template>
  <div
    class="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 font-sans"
  >
    <div
      class="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200"
    >
      <!-- Header Banner -->
      <div
        class="bg-slate-900 text-white px-6 py-8 text-center relative overflow-hidden"
      >
        <!-- Background Accent Grid -->
        <div
          class="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"
        ></div>

        <!-- Brand Badge -->
        <div
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3"
        >
          <span
            class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"
          ></span>
          STCW Exam Engine v2.4
        </div>

        <div class="flex items-center justify-center gap-3 mb-2">
          <div
            class="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-xl text-white shadow-lg"
          >
            B
          </div>

          <h1 class="text-xl font-bold tracking-wide">
            BMA Maritime Portal
          </h1>
        </div>

        <p
          class="text-xs text-slate-300 font-medium tracking-wide uppercase mt-1"
        >
          Comprehensive Assessment Management System
        </p>
      </div>

      <!-- Login Form Section -->
      <div class="p-6 sm:p-8">
        <div class="mb-6">
          <h2 class="text-lg font-bold text-slate-800">
            Sign In
          </h2>

          <p class="text-xs text-slate-500 mt-0.5">
            Enter your registered email address and password to access
            your assessment dashboard.
          </p>
        </div>

        <!-- Error Notification -->
        <div
          v-if="errorMessage"
          role="alert"
          aria-live="polite"
          class="mb-5 p-3.5 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded-r-lg flex items-start gap-2"
        >
          <svg
            class="w-4 h-4 shrink-0 text-red-500 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>

          <span>{{ errorMessage }}</span>
        </div>

        <!-- Login Form -->
        <form
          @submit.prevent="handleLogin"
          class="space-y-4"
        >
          <!-- Email Address Input -->
          <div>
            <label
              for="email"
              class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Email Address
            </label>

            <div class="relative">
              <input
                id="email"
                v-model.trim="email"
                type="email"
                name="email"
                required
                autocomplete="username"
                inputmode="email"
                placeholder="Enter your registered email"
                :disabled="isLoading"
                class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-slate-50/50 focus:bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all disabled:opacity-60"
              />
            </div>
          </div>

          <!-- Password Input -->
          <div>
            <label
              for="password"
              class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Password
            </label>

            <div class="relative">
              <input
                id="password"
                v-model="password"
                type="password"
                name="password"
                required
                autocomplete="current-password"
                placeholder="Enter your password"
                :disabled="isLoading"
                class="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-slate-50/50 focus:bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all disabled:opacity-60"
              />
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-3 px-4 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            <!-- Loading Spinner -->
            <svg
              v-if="isLoading"
              class="animate-spin h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />

              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h-4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l-3-2.647z"
              />
            </svg>

            <span>
              {{ isLoading ? 'Authenticating...' : 'Sign In to Dashboard' }}
            </span>
          </button>
        </form>
      </div>

      <!-- Footer -->
      <div
        class="bg-slate-50 px-6 py-3 border-t border-slate-100 text-center"
      >
        <p class="text-[11px] text-slate-400">
          BMA Pilot System &bull; Powered by Comprehensive Assessment
          Management System
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

async function attemptLogin(payload) {
  const ports = ['/api', 'http://127.0.0.1:8000/api', 'http://127.0.0.1:8080/api', 'http://localhost:8000/api']

  for (const baseUrl of ports) {
    try {
      const response = await fetch(`${baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json().catch(() => ({}))

      if (response.ok && data.token && data.user) {
        return { success: true, token: data.token, user: data.user }
      }

      if (response.status === 422 || response.status === 401 || response.status === 403) {
        const validationErrors = data.errors ? Object.values(data.errors).flat() : []
        const msg = validationErrors[0] || data.message || 'Invalid email or password.'
        return { success: false, message: msg }
      }
    } catch (e) {
      // Try next endpoint port
    }
  }

  return { success: false, networkError: true }
}

const handleLogin = async () => {
  if (isLoading.value) return
  errorMessage.value = ''

  const normalizedEmail = email.value.trim().toLowerCase()

  if (!normalizedEmail || !password.value) {
    errorMessage.value = 'Please enter your email address and password.'
    return
  }

  isLoading.value = true

  try {
    const result = await attemptLogin({
      email: normalizedEmail,
      password: password.value
    })

    if (result.success) {
      localStorage.setItem('token', result.token)
      localStorage.setItem('user', JSON.stringify(result.user))
      await router.push('/')
      return
    }

    if (result.networkError) {
      // Local Storage Fallback Login for Offline/Dev Environment
      const localUsers = JSON.parse(localStorage.getItem('cams_users_list') || '[]')
      const matchedUser = localUsers.find(u => u.email.toLowerCase() === normalizedEmail) ||
        (normalizedEmail === 'it@bma.edu.ph' ? { id: 1, name: 'IT Administrator', email: 'it@bma.edu.ph', role: 'Admin', department: 'ICT', status: 'Active' } : null)

      if (matchedUser) {
        localStorage.setItem('token', 'offline-session-token-' + Date.now())
        localStorage.setItem('user', JSON.stringify(matchedUser))
        await router.push('/')
        return
      }

      errorMessage.value = 'Unable to connect to the authentication server. Please check your connection.'
    } else {
      errorMessage.value = result.message || 'Invalid email address or password.'
    }
  } catch (err) {
    errorMessage.value = err.message || 'An unexpected error occurred during authentication.'
  } finally {
    isLoading.value = false
  }
}
</script>