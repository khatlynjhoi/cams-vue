<script setup>
import { 
  LayoutDashboard, Database, BookOpen, PenTool, 
  Settings, PieChart, Users, X 
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close'])
const auth = useAuthStore()

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', route: '/', icon: LayoutDashboard, roles: ['Admin', 'Assessor', 'Faculty', 'Student'] },
  { id: 'question-bank', label: 'Question Bank', route: '/questions', icon: Database, roles: ['Admin', 'Assessor'] },
  { id: 'courses', label: 'Courses', route: '/courses', icon: BookOpen, roles: ['Admin', 'Assessor'] },
  { id: 'test-builder', label: 'Test Builder', route: '/test-builder', icon: PenTool, roles: ['Admin', 'Assessor'] },
  { id: 'pilot-admin', label: 'Pilot Administration', route: '/pilot-admin', icon: Settings, roles: ['Admin', 'Assessor'] },
  { id: 'reports', label: 'Reports & Analysis', route: '/reports', icon: PieChart, roles: ['Admin', 'Assessor'] },
  { id: 'users', label: 'User Management', route: '/users', icon: Users, roles: ['Admin'] }
]
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
      <div class="flex items-center justify-between p-4 border-b border-gray-200 lg:justify-center lg:py-6">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-gray-900 rounded-md flex items-center justify-center">
            <span class="text-white font-bold text-lg">B</span>
          </div>
          <span class="text-xl font-bold text-gray-800">BMA Pilot System</span>
        </div>
        <button class="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-md" @click="emit('close')">
          <X :size="20" />
        </button>
      </div>

      <nav class="p-4 space-y-1">
        <template v-for="item in menuItems" :key="item.id">
          <router-link
            v-if="item.roles.includes(auth.user?.role)"
            :to="item.route"
            @click="emit('close')"
            v-slot="{ isActive }"
          >
            <div
              :class="[
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-1',
                isActive ? 'bg-emerald-500 text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              ]"
            >
              <component :is="item.icon" :size="20" />
              {{ item.label }}
            </div>
          </router-link>
        </template>
      </nav>
    </aside>
  </div>
</template>