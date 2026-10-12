<script setup>
import { ref, onMounted } from 'vue'
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
  Check
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

// Account Switcher State
const showUserMenu = ref(false)

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

      <!-- User Profile Card & Account Switcher -->
      <div class="relative mt-auto border-t border-slate-100 bg-slate-50/50 p-4">
        
        <!-- Popup Menu -->
        <div 
          v-if="showUserMenu" 
          class="absolute bottom-full left-4 mb-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50"
        >
          <div class="p-2 space-y-1">
            <div class="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Switch Account
            </div>
            
            <button 
              v-for="acc in availableAccounts" 
              :key="acc.email"
              @click="switchAccount(acc)"
              class="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors cursor-pointer"
            >
              <div class="flex flex-col text-left">
                <span class="font-bold text-xs">{{ acc.name }}</span>
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

        <!-- User Profile Button -->
        <button 
          @click="showUserMenu = !showUserMenu"
          class="w-full flex items-center justify-between p-2 -m-2 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
        >
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs shadow-sm shrink-0">
              {{ currentUser.initials }}
            </div>
            <div class="text-left overflow-hidden">
              <p class="text-xs font-bold text-slate-800 truncate">{{ currentUser.name }}</p>
              <p class="text-[10px] text-slate-400 truncate">{{ currentUser.email }}</p>
            </div>
          </div>
          <MoreVertical :size="14" class="text-slate-400" />
        </button>

        <!-- Invisible overlay to close menu when clicking outside -->
        <div 
          v-if="showUserMenu" 
          @click="showUserMenu = false" 
          class="fixed inset-0 z-40"
        ></div>
      </div>
    </aside>

    <!-- Main View Content Area -->
    <main class="flex-1 pl-64 min-h-screen">
      <router-view />
    </main>
  </div>
</template>