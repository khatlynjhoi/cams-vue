<script setup>
import { useRoute, useRouter } from 'vue-router'
import { 
  LayoutDashboard, 
  HelpCircle, 
  BookOpen, 
  Wrench, 
  SlidersHorizontal, 
  BarChart3, 
  Users, 
  GraduationCap 
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const navigationItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Question Bank', path: '/questions', icon: HelpCircle },
  { name: 'Courses', path: '/courses', icon: BookOpen },
  { name: 'Test Builder', path: '/test-builder', icon: Wrench },
  { name: 'Pilot Administration', path: '/pilot-admin', icon: SlidersHorizontal },
  { name: 'Reports & Analysis', path: '/reports', icon: BarChart3 },
  { name: 'User Management', path: '/users', icon: Users },
  { name: 'Student Exam Portal', path: '/student-exam', icon: GraduationCap }
]
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex text-slate-800 antialiased font-sans">
    <!-- Navigation Sidebar -->
    <aside class="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 fixed inset-y-0 z-30">
      <div class="p-5 space-y-6">
        <!-- System Logo & Title -->
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center font-black text-white text-lg tracking-wider shadow">
            B
          </div>
          <div>
            <h1 class="font-bold text-slate-900 leading-tight">BMA Pilot System</h1>
            <p class="text-[10px] text-slate-400 font-medium">STCW Exam Engine v2.4</p>
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="space-y-1">
          <router-link
            v-for="item in navigationItems"
            :key="item.path"
            :to="item.path"
            :class="[
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all',
              route.path === item.path 
                ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60 shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            ]"
          >
            <component 
              :is="item.icon" 
              :size="18" 
              :class="route.path === item.path ? 'text-emerald-600' : 'text-slate-400'" 
            />
            <span>{{ item.name }}</span>
          </router-link>
        </nav>
      </div>

      <!-- User Profile Card -->
      <div class="p-4 border-t border-slate-100 bg-slate-50/50">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs shadow-sm">
            BMA
          </div>
          <div class="truncate">
            <p class="text-xs font-bold text-slate-800 truncate">Assessment Officer</p>
            <p class="text-[10px] text-slate-400 truncate">admin@bma.edu.ph</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main View Content Area -->
    <main class="flex-1 pl-64 min-h-screen">
      <router-view />
    </main>
  </div>
</template>