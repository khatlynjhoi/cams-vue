import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/questions',
    name: 'QuestionBank',
    component: () => import('../views/QuestionBankView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/courses',
    name: 'Courses',
    component: () => import('../views/CoursesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/test-builder',
    name: 'TestBuilder',
    component: () => import('../views/TestBuilderView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/generator',
    name: 'ExamGenerator',
    component: () => import('../views/ExamGeneratorView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/pilot-admin',
    name: 'PilotAdmin',
    component: () => import('../views/PilotAdminView.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('../views/ReportsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    name: 'UserManagement',
    component: () => import('../views/UserManagementView.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/student-exam',
    name: 'StudentExam',
    component: () => import('../views/StudentExamView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation Guard for Authentication and Roles
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  let user = {}
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}')
  } catch (e) {
    user = {}
  }

  if (to.meta.requiresAuth && !token) {
    return next('/login')
  }

  if (to.meta.guestOnly && token) {
    return next('/')
  }

  if (to.meta.role && user.role !== to.meta.role) {
    return next('/')
  }

  next()
})

export default router