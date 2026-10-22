<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { 
  LayoutDashboard, BookOpen, HelpCircle, Wrench, SlidersHorizontal, 
  BarChart3, Users, GraduationCap, LogOut, MoreVertical, Menu, ChevronLeft, Shield
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Dynamically resolve logo path from public folder
const baseUrl = import.meta.env.BASE_URL || '/'
const logoUrl = `${baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'}cams-logo.png`

const isSidebarOpen = ref(true)
const showUserMenu = ref(false)

// Hide sidebar and navigation layout on Login and Student Exam pages, or for Cadet sessions
const isStandalonePage = computed(() => {
  return ['/login', '/student-exam'].includes(route.path) || authStore.isCadet
})

const navigationItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['Admin', 'Assessment Officer', 'Instructor'] },
  { name: 'Courses', path: '/courses', icon: BookOpen, roles: ['Admin', 'Assessment Officer', 'Instructor'] },
  { name: 'Question Bank', path: '/questions', icon: HelpCircle, roles: ['Admin', 'Assessment Officer', 'Instructor'] },
  { name: 'Test Builder', path: '/test-builder', icon: Wrench, roles: ['Admin', 'Assessment Officer', 'Instructor'] },
  { name: 'Pilot Administration', path: '/pilot-admin', icon: SlidersHorizontal, roles: ['Admin', 'Assessment Officer'] },
  { name: 'Reports & Analysis', path: '/reports', icon: BarChart3, roles: ['Admin', 'Assessment Officer', 'Instructor'] },
  { name: 'User Management', path: '/users', icon: Users, roles: ['Admin'] },
  { name: 'Student Exam Portal', path: '/student-exam', icon: GraduationCap, roles: ['Cadet', 'Admin'] }
]

const currentUser = computed(() => {
  const u = authStore.user
  if (!u) {
    return { name: 'Not Logged In', email: '', role: 'Guest', initials: '--' }
  }

  return {
    name: u.name || 'User',
    email: u.email || '',
    role: u.role || 'User',
    initials: authStore.userInitials || 'US'
  }
})

const filteredNavigationItems = computed(() => {
  const userRole = (currentUser.value.role || '').toLowerCase()
  return navigationItems.filter(item => {
    if (!item.roles) return true
    return item.roles.some(r => r.toLowerCase() === userRole) || userRole === 'admin'
  })
})

function handleLogout() {
  showUserMenu.value = false
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex text-slate-800 antialiased font-sans overflow-x-hidden">
    
    <!-- Floating Menu Toggle (Hidden on Standalone Pages) -->
    <button 
      v-if="!isStandalonePage && !isSidebarOpen"
      @click="isSidebarOpen = true"
      class="fixed top-5 left-5 z-40 p-2.5 bg-white border border-slate-200 shadow-sm rounded-xl hover:bg-slate-50 text-slate-600 transition-all cursor-pointer group"
      title="Open Menu"
    >
      <Menu :size="20" />
    </button>

    <!-- Navigation Sidebar (Hidden on Standalone Pages) -->
    <aside 
      v-if="!isStandalonePage"
      :class="[
        'bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 fixed inset-y-0 z-50 transition-all duration-300 ease-in-out shadow-xs',
        isSidebarOpen ? 'w-60 translate-x-0' : '-translate-x-full w-64'
      ]"
    >
      <div class="p-4 space-y-4 overflow-y-auto custom-scrollbar">
        <!-- Sidebar Header with CAMS Logo -->
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <img 
              :src="logoUrl" 
              alt="CAMS Logo" 
              class="h-20 ms-2 w-auto object-contain" 
            />
          </div>
          <button @click="isSidebarOpen = false" class="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer">
            <ChevronLeft :size="18" />
          </button>
        </div>

        <nav class="space-y-1.5">
          <router-link
            v-for="item in filteredNavigationItems"
            :key="item.path"
            :to="item.path"
            :class="[
              'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group',
              route.path === item.path 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60 shadow-xs' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            ]"
          >
            <component 
              :is="item.icon" 
              :size="20" 
              :class="route.path === item.path ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'" 
            />
            <span>{{ item.name }}</span>
          </router-link>
        </nav>
      </div>

      <div class="relative mt-auto border-t border-slate-100 bg-slate-50 p-4">
        <transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="transform opacity-0 translate-y-2"
          enter-to-class="transform opacity-100 translate-y-0"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="transform opacity-100 translate-y-0"
          leave-to-class="transform opacity-0 translate-y-2"
        >
          <div 
            v-if="showUserMenu" 
            class="absolute bottom-full left-5 mb-3 w-50 bg-white border border-slate-200 rounded-xl overflow-hidden z-50 p-3 space-y-3"
          >
            <div class="space-y-1">
              <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Account</p>
              <p class="text-sm font-bold text-slate-800 truncate">{{ currentUser.name }}</p>
              <p class="text-[12px] text-slate-500 truncate">{{ currentUser.email }}</p>
              <div class="mt-1 flex items-center gap-1">
                <Shield :size="12" class="text-emerald-600" />
                <span class="text-[12px] font-semibold text-emerald-700 capitalize">{{ currentUser.role }}</span>
              </div>
            </div>

            <div class="border-t border-slate-100 pt-2">
              <button 
                @click="handleLogout" 
                class="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 font-bold rounded-lg transition-colors cursor-pointer"
              >
                <LogOut :size="14" />
                Log out
              </button>
            </div>
          </div>
        </transition>

        <button 
          @click="showUserMenu = !showUserMenu"
          class="w-full flex items-center justify-between p-2.5 -m-1 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all cursor-pointer group"
        >
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-[#123524] text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
              {{ currentUser.initials }}
            </div>
            <div class="text-left overflow-hidden">
              <p class="text-sm font-bold text-slate-800 truncate">{{ currentUser.name }}</p>
              <p class="text-[12px] text-slate-400 truncate">{{ currentUser.email }}</p>
            </div>
          </div>
          <MoreVertical :size="16" class="text-slate-400 group-hover:text-slate-700" />
        </button>

        <div v-if="showUserMenu" @click="showUserMenu = false" class="fixed inset-0 z-40"></div>
      </div>
    </aside>

    <main :class="['flex-1 min-h-screen transition-all duration-300', isStandalonePage ? 'pl-0' : (isSidebarOpen ? 'lg:pl-64 pl-0' : 'pl-0')]">
      <router-view />
    </main>
  </div>
</template>