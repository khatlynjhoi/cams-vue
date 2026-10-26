import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true, title: 'Dashboard - CAMS Portal' }
  },
  {
    path: '/courses',
    name: 'Courses',
    component: () => import('../views/CoursesView.vue'),
    meta: { requiresAuth: true, title: 'Courses - CAMS Portal' }
  },
  {
    path: '/questions',
    name: 'QuestionBank',
    component: () => import('../views/QuestionBankView.vue'),
    meta: { requiresAuth: true, title: 'Question Bank - CAMS Portal' }
  },
  {
    path: '/test-builder',
    name: 'TestBuilder',
    component: () => import('../views/TestBuilderView.vue'),
    meta: { requiresAuth: true, title: 'Test Builder - CAMS Portal' }
  },
  {
    path: '/pilot-admin',
    name: 'PilotAdmin',
    component: () => import('../views/PilotAdminView.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'assessment officer'], title: 'Pilot Administration - CAMS Portal' }
  },
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('../views/AnalyticsAndReportsView.vue'),
    meta: { requiresAuth: true, title: 'Reports & Analysis - CAMS Portal' }
  },
  {
    path: '/users',
    name: 'UserManagement',
    component: () => import('../views/UserManagementView.vue'),
    meta: { requiresAuth: true, role: 'admin', title: 'User Management - CAMS Portal' }
  },
  {
    path: '/student-exam',
    name: 'StudentExam',
    component: () => import('../views/StudentExamView.vue'),
    meta: { requiresAuth: true, roles: ['cadet', 'admin'], title: 'Student Exam Portal - CAMS Portal' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { guestOnly: true, title: 'Sign In - CAMS Portal' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

// Session Token Max Age: 8 Hours (8 * 60 * 60 * 1000 ms)
const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000

function getValidToken() {
  const token = localStorage.getItem('cams_token') || localStorage.getItem('token')
  if (!token || token === 'null' || token === 'undefined') return null
  return token
}

function isSessionExpired() {
  const tokenTime = localStorage.getItem('cams_token_time')
  if (!tokenTime) return false

  const elapsed = Date.now() - parseInt(tokenTime, 10)
  return elapsed > SESSION_MAX_AGE_MS
}

function purgeSession() {
  localStorage.removeItem('cams_token')
  localStorage.removeItem('token')
  localStorage.removeItem('cams_token_time')
  localStorage.removeItem('cams_user')
  localStorage.removeItem('cams_user_role')
  localStorage.removeItem('user')
}

router.beforeEach((to, from, next) => {
  const token = getValidToken()

  if (to.meta.title) {
    document.title = to.meta.title
  }

  // 1. Session Expiration Verification Guard
  if (token && isSessionExpired()) {
    purgeSession()
    return next({ path: '/login', query: { expired: 'true' } })
  }

  let user = null
  try {
    const raw = localStorage.getItem('cams_user') || localStorage.getItem('user')
    if (raw && raw !== 'null' && raw !== 'undefined') {
      user = JSON.parse(raw)
    }
  } catch (e) {
    user = null
  }

  // 2. Force strict redirect to /login if unauthenticated
  if (to.meta.requiresAuth && !token) {
    return next('/login')
  }

  // 3. Prevent authenticated users from opening guest-only routes (/login)
  if (to.meta.guestOnly && token) {
    const userRole = (user?.role || '').toLowerCase()
    if (userRole === 'cadet') {
      return next('/student-exam')
    }
    return next('/')
  }

  // 4. Cadet Protection: Redirect Cadets attempting to navigate to staff routes back to Student Exam
  if (user) {
    const userRole = (user.role || '').toLowerCase()
    if (userRole === 'cadet' && to.path !== '/student-exam') {
      return next('/student-exam')
    }
  }

  next()
})

export default router