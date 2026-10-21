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

const isSidebarOpen = ref(true)
const showUserMenu = ref(false)

const isLoginPage = computed(() => route.path === '/login')

const navigationItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['Admin', 'Assessment Officer', 'Instructor', 'Cadet'] },
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
    
    <button 
      v-if="!isLoginPage && !isSidebarOpen"
      @click="isSidebarOpen = true"
      class="fixed top-5 left-5 z-40 p-2.5 bg-white border border-slate-200 shadow-sm rounded-xl hover:bg-slate-50 text-slate-600 transition-all cursor-pointer group"
      title="Open Menu"
    >
      <Menu :size="20" />
    </button>

    <aside 
      v-if="!isLoginPage"
      :class="[
        'bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 fixed inset-y-0 z-50 transition-all duration-300 ease-in-out shadow-xs',
        isSidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full w-64'
      ]"
    >
      <div class="p-5 space-y-8 overflow-y-auto custom-scrollbar">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 bg-[#123524] rounded-xl flex items-center justify-center font-black text-white text-lg tracking-wider shadow-md">
              C
            </div>
            <div>
              <h1 class="font-bold text-slate-900 leading-tight">CAMS Portal</h1>
              <p class="text-[10px] text-emerald-700 font-semibold tracking-wide">STCW Exam Engine v2.4</p>
            </div>
          </div>
          <button @click="isSidebarOpen = false" class="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <ChevronLeft :size="18" />
          </button>
        </div>

        <nav class="space-y-1.5">
          <router-link
            v-for="item in filteredNavigationItems"
            :key="item.path"
            :to="item.path"
            :class="[
              'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group',
              route.path === item.path 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60 shadow-xs' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            ]"
          >
            <component 
              :is="item.icon" 
              :size="18" 
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
            class="absolute bottom-full left-4 mb-3 w-56 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 p-3 space-y-3"
          >
            <div class="space-y-1">
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Account</p>
              <p class="text-xs font-bold text-slate-800 truncate">{{ currentUser.name }}</p>
              <p class="text-[11px] text-slate-500 truncate">{{ currentUser.email }}</p>
              <div class="mt-1 flex items-center gap-1">
                <Shield :size="12" class="text-emerald-600" />
                <span class="text-[11px] font-semibold text-emerald-700 capitalize">{{ currentUser.role }}</span>
              </div>
            </div>

            <div class="border-t border-slate-100 pt-2">
              <button 
                @click="handleLogout" 
                class="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 font-bold rounded-lg transition-colors cursor-pointer"
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
              <p class="text-xs font-bold text-slate-800 truncate">{{ currentUser.name }}</p>
              <p class="text-[10px] text-slate-400 truncate">{{ currentUser.email }}</p>
            </div>
          </div>
          <MoreVertical :size="16" class="text-slate-400 group-hover:text-slate-700" />
        </button>

        <div v-if="showUserMenu" @click="showUserMenu = false" class="fixed inset-0 z-40"></div>
      </div>
    </aside>

    <main :class="['flex-1 min-h-screen transition-all duration-300', isLoginPage ? 'pl-0' : (isSidebarOpen ? 'lg:pl-64 pl-0' : 'pl-0')]">
      <router-view />
    </main>
  </div>
</template>