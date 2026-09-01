import { createRouter, createWebHashHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardView,
  },
  {
    path: '/questions',
    name: 'QuestionBank',
    component: () => import('@/views/QuestionBankView.vue'),
    meta: { requiresAdminOrAssessor: true },
  },
  {
    path: '/test-builder',
    name: 'TestBuilder',
    component: () => import('@/views/TestBuilderView.vue'),
    meta: { requiresAdminOrAssessor: true },
  },
  {
    path: '/pilot-admin',
    name: 'PilotAdmin',
    component: () => import('@/views/PilotAdminView.vue'),
    meta: { requiresAdminOrAssessor: true },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router