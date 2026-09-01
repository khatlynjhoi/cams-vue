import { createRouter, createWebHistory } from 'vue-router'
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
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router