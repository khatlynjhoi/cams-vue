import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  // 1. Dashboard
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true, title: 'Dashboard - CAMS Portal' }
  },

  // 2. Courses
  {
    path: '/courses',
    name: 'Courses',
    component: () => import('../views/CoursesView.vue'),
    meta: { requiresAuth: true, title: 'Courses - CAMS Portal' }
  },

  // 3. Question Bank
  {
    path: '/questions',
    name: 'QuestionBank',
    component: () => import('../views/QuestionBankView.vue'),
    meta: { requiresAuth: true, title: 'Question Bank - CAMS Portal' }
  },

  // 4. Test Builder
  {
    path: '/test-builder',
    name: 'TestBuilder',
    component: () => import('../views/TestBuilderView.vue'),
    meta: { requiresAuth: true, title: 'Test Builder - CAMS Portal' }
  },

  // 5. Pilot Administration
  {
    path: '/pilot-admin',
    name: 'PilotAdmin',
    component: () => import('../views/PilotAdminView.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'assessment officer'], title: 'Pilot Administration - CAMS Portal' }
  },

  // 6. Reports & Analysis
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('../views/AnalyticsAndReportsView.vue'),
    meta: { requiresAuth: true, title: 'Reports & Analysis - CAMS Portal' }
  },
  {
    path: '/analytics-reports',
    name: 'AnalyticsAndReports',
    component: () => import('../views/AnalyticsAndReportsView.vue'),
    meta: { requiresAuth: true, title: 'Analytics & Reports - CAMS Portal' }
  },
  {
    path: '/analytics',
    redirect: () => ({ path: '/reports', query: { tab: 'analytics' } })
  },

  // 7. User Management
  {
    path: '/users',
    name: 'UserManagement',
    component: () => import('../views/UserManagementView.vue'),
    meta: { requiresAuth: true, role: 'admin', title: 'User Management - CAMS Portal' }
  },

  // 8. Student Exam Portal
  {
    path: '/student-exam',
    name: 'StudentExam',
    component: () => import('../views/StudentExamView.vue'),
    meta: { requiresAuth: true, title: 'Student Exam Portal - CAMS Portal' }
  },

  // Authentication & Guest Routes
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { guestOnly: true, title: 'Sign In - CAMS Portal' }
  },

  // Fallback Catch-All Route
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// Navigation Guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('cams_token') || localStorage.getItem('token')
  let user = null

  try {
    const raw = localStorage.getItem('cams_user') || localStorage.getItem('user')
    if (raw && raw !== 'null' && raw !== 'undefined') {
      user = JSON.parse(raw)
    }
  } catch (e) {
    user = null
  }

  // Update Page Title
  if (to.meta.title) {
    document.title = to.meta.title
  }

  const isValidToken = token && token !== 'null' && token !== 'undefined'

  // 1. Force strict redirect to /login if token is missing
  if (to.meta.requiresAuth && !isValidToken) {
    return next({ name: 'Login' })
  }

  // 2. Prevent authenticated users from visiting /login
  if (to.meta.guestOnly && isValidToken) {
    return next({ name: 'Dashboard' })
  }

  // 3. Role Validation
  if (user) {
    const userRole = (user.role || '').toLowerCase()
    if (to.meta.role && userRole !== to.meta.role.toLowerCase() && userRole !== 'admin') {
      return next({ name: 'Dashboard' })
    }
    if (to.meta.roles && Array.isArray(to.meta.roles)) {
      const allowed = to.meta.roles.map(r => r.toLowerCase())
      if (!allowed.includes(userRole) && userRole !== 'admin') {
        return next({ name: 'Dashboard' })
      }
    }
  }

  next()
})

export default router