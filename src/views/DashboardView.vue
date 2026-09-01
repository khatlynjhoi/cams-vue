<script setup>
import { ref } from 'vue'
import { 
  HelpCircle, 
  SlidersHorizontal, 
  Users, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  ShieldCheck
} from 'lucide-vue-next'

const stats = ref([
  { title: 'Total Banked Questions', value: '1,248', change: '+12 this week', icon: HelpCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
  { title: 'Active Pilot Sessions', value: '3', change: '2 live right now', icon: SlidersHorizontal, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { title: 'Enrolled Cadets', value: '135', change: 'Across 3 cohorts', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  { title: 'STCW Compliance Index', value: '98.2%', change: 'Fully Audited', icon: CheckCircle2, color: 'text-amber-600', bg: 'bg-amber-50' }
])

const recentActivities = ref([
  { id: 1, title: 'NAV-101 Midterm Examination 2026', time: '10 mins ago', user: 'Capt. Ramirez', action: 'Session Started' },
  { id: 2, title: 'ENG-202 Diesel Simulator Quiz', time: '1 hour ago', user: 'Chief Engr. Santos', action: 'Exam Finalized' },
  { id: 3, title: 'SAF-301 Safety & MARPOL Compliance', time: '3 hours ago', user: 'Assessment Admin', action: 'Item Bank Updated' }
])
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-bold text-gray-900">System Dashboard</h1>
      <p class="text-gray-500 mt-1">Overview of STCW assessment operations, item metrics, and active examinations.</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="(stat, idx) in stats" :key="idx" class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex justify-between items-start">
        <div>
          <p class="text-xs font-semibold text-gray-500">{{ stat.title }}</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ stat.value }}</p>
          <p class="text-xs font-medium text-emerald-600 mt-1 flex items-center gap-1">
            <ArrowUpRight :size="12" /> {{ stat.change }}
          </p>
        </div>
        <div :class="['p-3 rounded-lg', stat.bg, stat.color]">
          <component :is="stat.icon" :size="20" />
        </div>
      </div>
    </div>

    <!-- Dashboard Content Sections -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Recent Operations -->
      <div class="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-gray-100">
          <h2 class="text-lg font-bold text-gray-900">Recent Operational Activity</h2>
          <span class="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            System Operational
          </span>
        </div>

        <div class="divide-y divide-gray-100">
          <div v-for="act in recentActivities" :key="act.id" class="py-3 flex items-center justify-between text-sm">
            <div>
              <p class="font-bold text-gray-900">{{ act.title }}</p>
              <p class="text-xs text-gray-500">Initiated by {{ act.user }}</p>
            </div>
            <div class="text-right">
              <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                {{ act.action }}
              </span>
              <p class="text-xs text-gray-400 mt-0.5 flex items-center justify-end gap-1">
                <Clock :size="10" /> {{ act.time }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Health Status -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h2 class="text-lg font-bold text-gray-900">AI & Security Status</h2>

        <div class="space-y-3">
          <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3">
            <ShieldCheck :size="20" class="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p class="text-xs font-bold text-gray-900">Bloom's Taxonomy Balancer</p>
              <p class="text-[11px] text-gray-500">Active - Cognitive weights validated for all active test blueprints.</p>
            </div>
          </div>

          <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3">
            <CheckCircle2 :size="20" class="text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p class="text-xs font-bold text-gray-900">Proctoring Telemetry</p>
              <p class="text-[11px] text-gray-500">Connected to active candidate pilot sessions.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>