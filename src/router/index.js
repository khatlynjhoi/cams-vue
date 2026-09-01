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
  },
  {
    path: '/courses',
    name: 'Courses',
    component: () => import('@/views/CoursesView.vue'),
  },
  {
    path: '/test-builder',
    name: 'TestBuilder',
    component: () => import('@/views/TestBuilderView.vue'),
  },
  {
    path: '/pilot-admin',
    name: 'PilotAdmin',
    component: () => import('@/views/PilotAdminView.vue'),
  },
  {
    path: '/student-exam',
    name: 'StudentExam',
    component: () => import('@/views/StudentExamView.vue'),
  },
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('@/views/ReportsView.vue'),
  },
  {
    path: '/users',
    name: 'UserManagement',
    component: () => import('@/views/UserManagementView.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router