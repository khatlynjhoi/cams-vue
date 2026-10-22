import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // Safe LocalStorage Reader
  function getStorageItem(key) {
    const val = localStorage.getItem(key)
    if (!val || val === 'null' || val === 'undefined') return null
    return val
  }

  function parseInitialUser() {
    const raw = getStorageItem('cams_user') || getStorageItem('user')
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch (e) {
      return null
    }
  }

  // Reactive State
  const user = ref(parseInitialUser())
  const token = ref(getStorageItem('cams_token') || getStorageItem('token'))

  // Computed Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userRole = computed(() => (user.value?.role || '').toLowerCase())

  const isAdmin = computed(() => userRole.value === 'admin' || userRole.value === 'it administrator')
  const isAssessmentOfficer = computed(() => ['assessment officer', 'assessor'].includes(userRole.value))
  const isInstructor = computed(() => userRole.value === 'instructor')
  const isCadet = computed(() => userRole.value === 'cadet')

  const userInitials = computed(() => {
    if (!user.value?.name) return 'ST'
    const parts = user.value.name.trim().split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return user.value.name.slice(0, 2).toUpperCase()
  })

  function setUserSession(userData, authToken) {
    user.value = userData
    token.value = authToken

    localStorage.setItem('cams_user', JSON.stringify(userData))
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('cams_token', authToken)
    localStorage.setItem('token', authToken)
  }

  /**
   * Authenticates user and persists standardized keys to LocalStorage
   */
  async function login(email, password) {
    if (!email || !password) return false

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
    setUserSession(userData, authToken)

    return true
  }

  /**
   * Creates an instant guest cadet session without credentials
   */
  async function loginAsStudent() {
    const studentData = {
      name: 'Cadet Candidate',
      email: 'student.portal@bma.edu.ph',
      role: 'Cadet',
      department: 'BSMT'
    }
    const studentToken = `guest-student-token-${Date.now()}`
    setUserSession(studentData, studentToken)
    return true
  }

  /**
   * Purges all session storage keys and resets Pinia state
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
    loginAsStudent,
    logout
  }
})