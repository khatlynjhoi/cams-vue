<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  LayoutDashboard, 
  HelpCircle, 
  BookOpen, 
  Wrench, 
  SlidersHorizontal, 
  BarChart3, 
  Users, 
  GraduationCap,
  LogOut,
  MoreVertical,
  Check,
  Menu,
  ChevronLeft
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

// UI State
const isSidebarOpen = ref(true)
const showUserMenu = ref(false)

// Determine if current page is login to hide navigation wrapper entirely
const isLoginPage = computed(() => route.path === '/login')

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

const currentUser = ref({ 
  name: 'Assessment Officer', 
  email: 'admin@bma.edu.ph', 
  role: 'admin',
  initials: 'BMA' 
})

// Mock accounts for switching
const availableAccounts = [
  { name: 'Admin User', email: 'admin@bma.edu.ph', role: 'admin' },
  { name: 'Capt. Ramirez', email: 'e.ramirez@bma.edu.ph', role: 'instructor' },
  { name: 'Cadet Dela Cruz', email: 'j.delacruz@student.bma.edu.ph', role: 'cadet' }
]

onMounted(() => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user.name) {
      currentUser.value = user
      currentUser.value.initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    }
  } catch (e) {}
})

function switchAccount(account) {
  localStorage.setItem('user', JSON.stringify(account))
  localStorage.setItem('token', 'mock-token-' + account.role)
  showUserMenu.value = false
  window.location.href = '/' // Hard reload to apply new role routes
}

function handleLogout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex text-slate-800 antialiased font-sans overflow-x-hidden">
    
    <!-- Floating Menu Toggle (Visible only when sidebar is closed and not on login page) -->
    <button 
      v-if="!isLoginPage && !isSidebarOpen"
      @click="isSidebarOpen = true"
      class="fixed top-5 left-5 z-40 p-2.5 bg-white border border-slate-200 shadow-sm rounded-xl hover:bg-slate-50 text-slate-600 transition-all cursor-pointer group"
      title="Open Menu"
    >
      <Menu :size="20" class="group-hover:scale-110 transition-transform" />
    </button>

    <!-- Navigation Sidebar -->
    <aside 
      v-if="!isLoginPage"
      :class="[
        'bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 fixed inset-y-0 z-50 transition-all duration-300 ease-in-out shadow-[4px_0_24px_rgba(0,0,0,0.02)]',
        isSidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full w-64'
      ]"
    >
      <div class="p-5 space-y-8 overflow-y-auto custom-scrollbar">
        <!-- System Logo & Title + Close Button -->
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center font-black text-white text-lg tracking-wider shadow-md">
              B
            </div>
            <div>
              <h1 class="font-bold text-slate-900 leading-tight">BMA Pilot System</h1>
              <p class="text-[10px] text-slate-400 font-medium tracking-wide">STCW Exam Engine v2.4</p>
            </div>
          </div>
          <button 
            @click="isSidebarOpen = false" 
            class="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Collapse Sidebar"
          >
            <ChevronLeft :size="18" />
          </button>
        </div>

        <!-- Navigation Links -->
        <nav class="space-y-1.5">
          <router-link
            v-for="item in navigationItems"
            :key="item.path"
            :to="item.path"
            :class="[
              'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group',
              route.path === item.path 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/50 shadow-sm' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            ]"
          >
            <component 
              :is="item.icon" 
              :size="18" 
              :class="[
                'transition-colors',
                route.path === item.path ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'
              ]" 
            />
            <span>{{ item.name }}</span>
          </router-link>
        </nav>
      </div>

      <!-- User Profile Card & Account Switcher -->
      <div class="relative mt-auto border-t border-slate-100 bg-slate-50 p-4">
        
        <!-- Popup Menu -->
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
            class="absolute bottom-full left-4 mb-3 w-56 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50"
          >
            <div class="p-2 space-y-1">
              <div class="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Switch Account
              </div>
              
              <button 
                v-for="acc in availableAccounts" 
                :key="acc.email"
                @click="switchAccount(acc)"
                class="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors cursor-pointer group"
              >
                <div class="flex flex-col text-left">
                  <span class="font-bold text-xs group-hover:text-emerald-800">{{ acc.name }}</span>
                  <span class="text-[10px] text-slate-500 capitalize">{{ acc.role }}</span>
                </div>
                <Check v-if="currentUser.email === acc.email" :size="14" class="text-emerald-600" />
              </button>

              <div class="h-px bg-slate-100 my-2"></div>

              <button 
                @click="handleLogout" 
                class="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 font-bold rounded-lg transition-colors cursor-pointer"
              >
                <LogOut :size="14" />
                Log out
              </button>
            </div>
          </div>
        </transition>

        <!-- User Profile Button -->
        <button 
          @click="showUserMenu = !showUserMenu"
          class="w-full flex items-center justify-between p-2.5 -m-1 hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm rounded-xl transition-all cursor-pointer group"
        >
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs shadow-sm shrink-0 group-hover:scale-105 transition-transform">
              {{ currentUser.initials }}
            </div>
            <div class="text-left overflow-hidden">
              <p class="text-xs font-bold text-slate-800 truncate">{{ currentUser.name }}</p>
              <p class="text-[10px] text-slate-400 truncate">{{ currentUser.email }}</p>
            </div>
          </div>
          <MoreVertical :size="16" class="text-slate-400 group-hover:text-slate-700 transition-colors" />
        </button>

        <!-- Invisible overlay to close menu when clicking outside -->
        <div 
          v-if="showUserMenu" 
          @click="showUserMenu = false" 
          class="fixed inset-0 z-40"
        ></div>
      </div>
    </aside>

    <!-- Overlay for mobile when sidebar is open -->
    <div 
      v-if="!isLoginPage && isSidebarOpen" 
      @click="isSidebarOpen = false"
      class="fixed inset-0 bg-slate-900/20 z-40 lg:hidden"
    ></div>

    <!-- Main View Content Area -->
    <main 
      :class="[
        'flex-1 min-h-screen transition-all duration-300 ease-in-out',
        isLoginPage ? 'pl-0' : (isSidebarOpen ? 'lg:pl-64 pl-0' : 'pl-0')
      ]"
    >
      <router-view />
    </main>
  </div>
</template>

<style scoped>
/* Optional: Custom scrollbar for the sidebar */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background: #94a3b8;
}
</style>