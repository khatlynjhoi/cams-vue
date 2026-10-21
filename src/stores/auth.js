import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  function safeParseStorage(key) {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (e) {
      return null
    }
  }

  // Initialize state from localStorage without forcing mock defaults
  const rawUser = safeParseStorage('cams_user') || safeParseStorage('user')
  const rawToken = localStorage.getItem('cams_token') || localStorage.getItem('token')

  const user = ref(rawUser)
  const token = ref(rawToken)
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // Role Checks (Case-insensitive)
  const userRole = computed(() => (user.value?.role || '').toLowerCase())

  const isAdmin = computed(() => userRole.value === 'admin' || userRole.value === 'it administrator')
  const isAssessmentOfficer = computed(() => ['assessment officer', 'assessor'].includes(userRole.value))
  const isInstructor = computed(() => userRole.value === 'instructor')
  const isCadet = computed(() => userRole.value === 'cadet')

  // User Name Initials Helper (e.g., "Percival Banting" -> "PB")
  const userInitials = computed(() => {
    if (!user.value?.name) return 'US'
    const parts = user.value.name.trim().split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return user.value.name.slice(0, 2).toUpperCase()
  })

  /**
   * Authenticate User and save to storage
   */
  async function login(email, password) {
    if (email && password) {
      const isCadetUser = email.includes('student') || email.includes('cadet')
      const isInstructorUser = email.includes('instructor') || email.includes('capt')

      const assignedRole = isCadetUser 
        ? 'Cadet' 
        : isInstructorUser 
        ? 'Instructor' 
        : 'Admin'

      const formattedName = email.split('@')[0].replace('.', ' ').toUpperCase()

      const userData = {
        name: formattedName || 'IT Administrator',
        email: email.toLowerCase(),
        role: assignedRole,
        department: isCadetUser ? 'BSMT' : 'ICT'
      }

      const authToken = `token-${Date.now()}`

      user.value = userData
      token.value = authToken

      // Unified storage keys
      localStorage.setItem('cams_user', JSON.stringify(userData))
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('cams_token', authToken)
      localStorage.setItem('token', authToken)

      return true
    }
    return false
  }

  /**
   * Clear Session State & Local Storage
   */
  function logout() {
    user.value = null
    token.value = null

    localStorage.removeItem('cams_user')
    localStorage.removeItem('cams_token')
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('cams_users_list')
  }

  return {
    user,
    token,
    isAuthenticated,
    userRole,
    isAdmin,
    isAssessmentOfficer,
    isInstructor,
    isCadet,
    userInitials,
    login,
    logout
  }
})