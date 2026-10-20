import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // Safe LocalStorage Parser
  function safeParseStorage(key) {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (e) {
      return null
    }
  }

  // Initialize State from LocalStorage for persistence across reloads
  const storedUser = safeParseStorage('user') || {
    name: 'IT Administrator',
    email: 'admin@bma.edu.ph',
    role: 'Admin',
    department: 'ICT'
  }
  const storedToken = localStorage.getItem('token') || 'mock-token-admin'

  const user = ref(storedUser)
  const token = ref(storedToken)
  const isAuthenticated = ref(!!storedToken)

  // Role Checks (Case-insensitive)
  const userRole = computed(() => (user.value?.role || '').toLowerCase())

  const isAdmin = computed(() => userRole.value === 'admin')
  const isAssessmentOfficer = computed(() =>
    ['assessment officer', 'assessor'].includes(userRole.value)
  )
  const isInstructor = computed(() => userRole.value === 'instructor')
  const isCadet = computed(() => userRole.value === 'cadet')

  const isAdminOrAssessor = computed(() =>
    ['admin', 'assessor', 'assessment officer'].includes(userRole.value)
  )

  // User Name Initials Helper (e.g. "Percival Banting" -> "PB")
  const userInitials = computed(() => {
    if (!user.value?.name) return 'CAMS'
    return user.value.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  })

  /**
   * Authenticate User with fallback mock login and local persistence
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

      const userData = {
        name: email.split('@')[0].replace('.', ' ').toUpperCase(),
        email,
        role: assignedRole,
        department: isCadetUser ? 'BSMT' : 'ICT'
      }

      const authToken = `token-${Date.now()}`

      user.value = userData
      token.value = authToken
      isAuthenticated.value = true

      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('token', authToken)

      return true
    }
    return false
  }

  /**
   * Switch Active User Account (Integration with Sidebar User Switcher)
   */
  function switchUserAccount(account) {
    const mockAuthToken = `mock-token-${account.role.toLowerCase()}`
    
    user.value = {
      name: account.name,
      email: account.email,
      role: account.role,
      department: account.department || 'ICT'
    }
    token.value = mockAuthToken
    isAuthenticated.value = true

    localStorage.setItem('user', JSON.stringify(user.value))
    localStorage.setItem('token', mockAuthToken)
  }

  /**
   * Update Profile Details in State & Storage
   */
  function updateUserProfile(updatedFields) {
    if (user.value) {
      user.value = { ...user.value, ...updatedFields }
      localStorage.setItem('user', JSON.stringify(user.value))
    }
  }

  /**
   * Clear Session State & Local Storage
   */
  function logout() {
    user.value = null
    token.value = null
    isAuthenticated.value = false

    localStorage.removeItem('user')
    localStorage.removeItem('token')
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
    isAdminOrAssessor,
    userInitials,
    login,
    switchUserAccount,
    updateUserProfile,
    logout
  }
})