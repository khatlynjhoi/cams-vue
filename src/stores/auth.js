import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref({
    name: 'Admin Admin',
    email: 'admin@bma.edu.ph',
    role: 'Admin',
  })
  const isAuthenticated = ref(true)

  const isAdminOrAssessor = computed(() => ['Admin', 'Assessor'].includes(user.value.role))

  function login(email, password) {
    if (email === 'admin@bma.edu.ph' && password === 'bma@2026') {
      user.value = { name: 'Admin Admin', email, role: 'Admin' }
      isAuthenticated.value = true
      return true
    }
    return false
  }

  function logout() {
    user.value = null
    isAuthenticated.value = false
  }

  return { user, isAuthenticated, isAdminOrAssessor, login, logout }
})