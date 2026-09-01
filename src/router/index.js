import { createRouter, createWebHistory } from 'vue-router'

import DashboardView from '../views/DashboardView.vue'
import QuestionBankView from '../views/QuestionBankView.vue'
import CoursesView from '../views/CoursesView.vue'
import TestBuilderView from '../views/TestBuilderView.vue'
import PilotAdminView from '../views/PilotAdminView.vue'
import ReportsView from '../views/ReportsView.vue'
import UserManagementView from '../views/UserManagementView.vue'
import StudentExamView from '../views/StudentExamView.vue'

const routes = [
  { path: '/', name: 'Dashboard', component: DashboardView },
  { path: '/questions', name: 'QuestionBank', component: QuestionBankView },
  { path: '/courses', name: 'Courses', component: CoursesView },
  { path: '/test-builder', name: 'TestBuilder', component: TestBuilderView },
  { path: '/pilot-admin', name: 'PilotAdmin', component: PilotAdminView },
  { path: '/reports', name: 'Reports', component: ReportsView },
  { path: '/users', name: 'UserManagement', component: UserManagementView },
  { path: '/student-exam', name: 'StudentExam', component: StudentExamView }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router