<script setup>
import { ref, computed } from 'vue'
import { 
  LayoutDashboard, Database, BookOpen, PenTool, 
  Settings, PieChart, Users, GraduationCap, X, MoreVertical, LogOut, Shield
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])
const auth = useAuthStore()
const router = useRouter()

const showUserMenu = ref(false)

/**
 * Normalized user role for menu authorization
 */
const userRole = computed(() => {
  const rawRole = auth.user?.role || ''
  const normalized = rawRole.toLowerCase().trim()

  if (['admin', 'bma administrator', 'it administrator'].includes(normalized)) return 'Admin'
  if (['assessment officer', 'assessor'].includes(normalized)) return 'Assessment Officer'
  if (['instructor', 'faculty'].includes(normalized)) return 'Instructor'
  if (['cadet', 'student'].includes(normalized)) return 'Cadet'
  
  return rawRole || 'Admin'
})

/**
 * Generate 2-letter avatar initials dynamically from user name
 */
const userInitials = computed(() => {
  const name = auth.user?.name || 'Admin User'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
})

const menuItems = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    route: '/', 
    icon: LayoutDashboard, 
    roles: ['Admin', 'Assessment Officer', 'Instructor', 'Cadet'] 
  },
  { 
    id: 'courses', 
    label: 'Courses', 
    route: '/courses', 
    icon: BookOpen, 
    roles: ['Admin', 'Assessment Officer', 'Instructor'] 
  },
  { 
    id: 'question-bank', 
    label: 'Question Bank', 
    route: '/questions', 
    icon: Database, 
    roles: ['Admin', 'Assessment Officer', 'Instructor'] 
  },
  { 
    id: 'test-builder', 
    label: 'Test Builder', 
    route: '/test-builder', 
    icon: PenTool, 
    roles: ['Admin', 'Assessment Officer', 'Instructor'] 
  },
  { 
    id: 'pilot-admin', 
    label: 'Pilot Administration', 
    route: '/pilot-admin', 
    icon: Settings, 
    roles: ['Admin', 'Assessment Officer'] 
  },
  { 
    id: 'reports', 
    label: 'Reports & Analysis', 
    route: '/reports', 
    icon: PieChart, 
    roles: ['Admin', 'Assessment Officer', 'Instructor'] 
  },
  { 
    id: 'users', 
    label: 'User Management', 
    route: '/users', 
    icon: Users, 
    roles: ['Admin'] 
  },
  { 
    id: 'student-portal', 
    label: 'Student Exam Portal', 
    route: '/student-portal', 
    icon: GraduationCap, 
    roles: ['Cadet', 'Admin'] 
  }
]

const filteredMenuItems = computed(() => {
  return menuItems.filter(item => item.roles.includes(userRole.value))
})

async function handleLogout() {
  showUserMenu.value = false
  if (auth.logout) {
    await auth.logout()
  }
  router.push('/login')
}
</script>

<template>
  <div>
    <!-- Mobile Backdrop Overlay -->
    <div 
      v-if="isOpen" 
      class="fixed inset-0 bg-black/50 z-20 lg:hidden"
      @click="emit('close')"
    ></div>

    <!-- Sidebar Container -->
    <aside 
      :class="[
        'fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-30 flex flex-col justify-between transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block h-screen',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <div class="flex flex-col flex-1 overflow-y-auto custom-scrollbar">
        <!-- Header Section -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 bg-emerald-900 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">
              C
            </div>
            <div>
              <h1 class="text-base font-bold text-gray-900 leading-tight">CAMS Portal</h1>
              <p class="text-xs text-gray-500 font-medium">STCW Exam Engine v2.4</p>
            </div>
          </div>
          <button 
            class="lg:hidden p-1.5 text-gray-500 hover:bg-gray-100 rounded-md" 
            aria-label="Close navigation sidebar"
            @click="emit('close')"
          >
            <X :size="18" />
          </button>
        </div>

        <!-- Navigation Links -->
        <nav class="p-3 space-y-1 flex-1">
          <router-link
            v-for="item in filteredMenuItems" 
            :key="item.id"
            :to="item.route"
            v-slot="{ isActive }"
            @click="emit('close')"
          >
            <div
              :class="[
                'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1',
                isActive 
                  ? 'bg-emerald-50 text-emerald-800 font-semibold' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              ]"
            >
              <component :is="item.icon" :size="18" :class="isActive ? 'text-emerald-700' : 'text-gray-500'" />
              <span>{{ item.label }}</span>
            </div>
          </router-link>
        </nav>
      </div>

      <!-- Authenticated User Profile Footer -->
      <div class="p-3 border-t border-gray-200 relative bg-gray-50/50">
        <!-- User Profile Popup (Purged Mock Accounts) -->
        <div 
          v-if="showUserMenu" 
          class="absolute bottom-16 left-3 right-3 bg-white rounded-xl shadow-xl border border-gray-200 p-3 z-40 space-y-3"
        >
          <div class="space-y-1">
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Account</p>
            <p class="text-sm font-bold text-gray-900 truncate">{{ auth.user?.name || 'IT Administrator' }}</p>
            <p class="text-xs text-gray-500 truncate">{{ auth.user?.email || 'it@bma.edu.ph' }}</p>
            <div class="mt-1 flex items-center gap-1.5">
              <Shield :size="12" class="text-emerald-600" />
              <span class="text-xs text-emerald-800 font-semibold">
                {{ auth.user?.role || 'Admin' }}
              </span>
            </div>
          </div>

          <div class="border-t border-gray-100 pt-2">
            <button 
              @click="handleLogout"
              class="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut :size="14" />
              Log out
            </button>
          </div>
        </div>

        <!-- Profile Bar Button -->
        <div 
          class="flex items-center justify-between p-2 rounded-lg hover:bg-gray-200/60 transition-colors cursor-pointer" 
          @click="showUserMenu = !showUserMenu"
        >
          <div class="flex items-center gap-2.5 overflow-hidden">
            <div class="w-8 h-8 rounded-full bg-emerald-900 text-white font-semibold text-xs flex items-center justify-center shrink-0 shadow-sm">
              {{ userInitials }}
            </div>
            <div class="overflow-hidden text-left">
              <p class="text-xs font-bold text-gray-800 truncate leading-tight">
                {{ auth.user?.name || 'IT Administrator' }}
              </p>
              <p class="text-[11px] text-gray-500 truncate leading-tight mt-0.5">
                {{ auth.user?.email || 'it@bma.edu.ph' }}
              </p>
            </div>
          </div>
          <button class="text-gray-400 hover:text-gray-600 p-1" aria-label="User menu options">
            <MoreVertical :size="16" />
          </button>
        </div>
      </div>
    </aside>
  </div>
</template>