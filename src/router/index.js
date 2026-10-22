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

function getValidToken() {
  const token = localStorage.getItem('cams_token') || localStorage.getItem('token')
  if (!token || token === 'null' || token === 'undefined') return null
  return token
}

router.beforeEach((to, from, next) => {
  const token = getValidToken()
  let user = null

  try {
    const raw = localStorage.getItem('cams_user') || localStorage.getItem('user')
    if (raw && raw !== 'null' && raw !== 'undefined') {
      user = JSON.parse(raw)
    }
  } catch (e) {
    user = null
  }

  if (to.meta.title) {
    document.title = to.meta.title
  }

  // 1. Force strict redirect to /login if unauthenticated
  if (to.meta.requiresAuth && !token) {
    return next('/login')
  }

  // 2. Prevent authenticated users from opening guest-only routes (/login)
  if (to.meta.guestOnly && token) {
    const userRole = (user?.role || '').toLowerCase()
    if (userRole === 'cadet') {
      return next('/student-exam')
    }
    return next('/')
  }

  // 3. Cadet Protection: Redirect Cadets attempting to navigate to staff routes back to Student Exam
  if (user) {
    const userRole = (user.role || '').toLowerCase()
    if (userRole === 'cadet' && to.path !== '/student-exam') {
      return next('/student-exam')
    }
  }

  next()
})

export default router