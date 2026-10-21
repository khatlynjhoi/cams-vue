<script setup>
import { computed } from 'vue'
import { 
  LayoutDashboard, Database, BookOpen, PenTool, 
  Settings, PieChart, Users, X 
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])
const auth = useAuthStore()

/**
 * Normalizes system roles to match standardized backend permissions
 */
const userRole = computed(() => {
  const rawRole = auth.user?.role || ''
  const normalized = rawRole.toLowerCase().trim()

  if (['admin', 'bma administrator'].includes(normalized)) return 'Admin'
  if (['assessment officer', 'assessor'].includes(normalized)) return 'Assessment Officer'
  if (['instructor', 'faculty'].includes(normalized)) return 'Instructor'
  if (['cadet', 'student'].includes(normalized)) return 'Cadet'
  
  return rawRole || 'Guest'
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
    id: 'question-bank', 
    label: 'Question Bank', 
    route: '/questions', 
    icon: Database, 
    roles: ['Admin', 'Assessment Officer', 'Instructor'] 
  },
  { 
    id: 'courses', 
    label: 'Courses', 
    route: '/courses', 
    icon: BookOpen, 
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
  }
]

/**
 * Computes menu items accessible by the current authenticated role
 */
const filteredMenuItems = computed(() => {
  return menuItems.filter(item => item.roles.includes(userRole.value))
})
</script>

<template>
  <div>
    <!-- Mobile Overlay -->
    <div 
      v-if="isOpen" 
      class="fixed inset-0 bg-black/50 z-20 lg:hidden"
      @click="emit('close')"
    ></div>

    <!-- Sidebar Container -->
    <aside 
      :class="[
        'fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-30 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <!-- Header / Logo -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200 lg:justify-center lg:py-6">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-emerald-600 rounded-md flex items-center justify-center shadow-sm">
            <span class="text-white font-bold text-lg">C</span>
          </div>
          <span class="text-xl font-bold text-gray-800">CAMS System</span>
        </div>
        <button 
          class="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-md" 
          aria-label="Close navigation sidebar"
          @click="emit('close')"
        >
          <X :size="20" />
        </button>
      </div>

      <!-- Navigation Menu -->
      <nav class="p-4 space-y-1">
        <router-link
          v-for="item in filteredMenuItems" 
          :key="item.id"
          :to="item.route"
          v-slot="{ isActive }"
          @click="emit('close')"
        >
          <div
            :class="[
              'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-1',
              isActive 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            ]"
          >
            <component :is="item.icon" :size="20" />
            <span>{{ item.label }}</span>
          </div>
        </router-link>
      </nav>
    </aside>
  </div>
</template>