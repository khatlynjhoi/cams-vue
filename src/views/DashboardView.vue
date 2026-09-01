<script setup>
import { ref } from 'vue'
import { Database, Check, Settings, BookOpen } from 'lucide-vue-next'
import StatCard from '@/components/common/StatCard.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const stats = ref([
  { icon: Database, value: '308', label: 'Total Questions', colorClass: 'text-emerald-600', bgColorClass: 'bg-emerald-100' },
  { icon: Check, value: '0', label: 'Questions Pending Validation', colorClass: 'text-blue-600', bgColorClass: 'bg-blue-100' },
  { icon: Settings, value: '0', label: 'Questions Pending Approval', colorClass: 'text-amber-600', bgColorClass: 'bg-amber-100' },
  { icon: BookOpen, value: '1', label: 'Pending Test', colorClass: 'text-amber-500', bgColorClass: 'bg-amber-50' },
  { icon: Check, value: '7', label: 'Active Pilot Tests', colorClass: 'text-emerald-500', bgColorClass: 'bg-emerald-50' },
])
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-8">
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
      <p class="text-gray-500 mt-1">Overview of your assessment system.</p>
    </div>

    <template v-if="auth.isAdminOrAssessor">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatCard v-for="(stat, index) in stats" :key="index" v-bind="stat" />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Recent Activity -->
        <div class="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 class="font-semibold text-gray-800">Recent Activity</h2>
          </div>
          <div class="divide-y divide-gray-100">
            <div v-for="item in 5" :key="item" class="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
              <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                {{ item }}
              </div>
              <p class="text-sm text-gray-600">
                <span class="font-medium text-gray-900">Student {{ item }}</span> is taking E-WATCH - FINAL EXAMINATION
              </p>
            </div>
          </div>
        </div>

        <!-- Assigned Pilot Tests -->
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div class="px-6 py-4 border-b border-gray-200 bg-blue-600 text-white">
            <h2 class="font-semibold">My Assigned Pilot Tests</h2>
          </div>
          <table class="w-full text-left text-sm">
            <thead class="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th class="px-6 py-3 font-medium">Test Name</th>
                <th class="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr class="hover:bg-gray-50 border-b border-gray-100">
                <td class="px-6 py-4 font-medium text-gray-800">E-WATCH - FINAL EXAMINATION</td>
                <td class="px-6 py-4">
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    In Progress
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>