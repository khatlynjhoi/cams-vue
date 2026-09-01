<script setup>
import { ref } from 'vue'
import { Menu } from 'lucide-vue-next'
import Sidebar from '@/components/layout/Sidebar.vue'

const isSidebarOpen = ref(false)
</script>

<template>
  <div class="flex h-screen bg-gray-100 font-sans">
    <Sidebar :isOpen="isSidebarOpen" @close="isSidebarOpen = false" />
    
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Mobile Top Navigation Bar -->
      <header class="bg-white border-b border-gray-200 p-4 lg:hidden flex items-center justify-between">
        <button @click="isSidebarOpen = true" class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          <Menu :size="24" />
        </button>
        <span class="font-bold text-gray-800">BMA Pilot System</span>
        <div class="w-6"></div>
      </header>

      <!-- Main Page View Container -->
      <main class="flex-1 overflow-y-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>