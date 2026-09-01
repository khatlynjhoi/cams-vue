<script setup>
import { ref } from 'vue'
import { 
  BarChart2, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  Award,
  FileSpreadsheet
} from 'lucide-vue-next'

const selectedCohort = ref('All Cohorts')

const summaryMetrics = ref({
  overallPassRate: '88.4%',
  averageScore: '82.6%',
  completedExams: 342,
  flaggedItems: 4
})

const competencyBreakdown = ref([
  { code: 'STCW A-II/1', title: 'Navigation Watchkeeping', passRate: 92, status: 'Compliant' },
  { code: 'STCW A-III/1', title: 'Marine Diesel Engineering', passRate: 84, status: 'Compliant' },
  { code: 'STCW A-VI/1', title: 'Basic Safety Training & MARPOL', passRate: 78, status: 'Needs Review' },
  { code: 'STCW A-II/2', title: 'Advanced Ship Handling', passRate: 90, status: 'Compliant' }
])

function exportReportCSV() {
  alert('Exporting STCW Assessment & Competency Compliance Report to CSV format.')
}
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p class="text-gray-500 mt-1">Item analysis, candidate passing rates, and STCW competency compliance auditing.</p>
      </div>

      <button 
        @click="exportReportCSV"
        class="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
      >
        <Download :size="16" />
        Export Audit Report
      </button>
    </div>

    <!-- Summary Metrics -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex justify-between items-start">
        <div>
          <p class="text-xs font-semibold text-gray-500">Overall Pass Rate</p>
          <p class="text-2xl font-bold text-emerald-600 mt-1">{{ summaryMetrics.overallPassRate }}</p>
          <p class="text-xs text-emerald-700 font-medium mt-1">+2.4% vs previous cohort</p>
        </div>
        <div class="p-3 bg-emerald-50 text-emerald-700 rounded-lg">
          <Award :size="20" />
        </div>
      </div>

      <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex justify-between items-start">
        <div>
          <p class="text-xs font-semibold text-gray-500">Average Candidate Mark</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ summaryMetrics.averageScore }}</p>
          <p class="text-xs text-gray-400 mt-1">Mean standard deviation 4.2</p>
        </div>
        <div class="p-3 bg-blue-50 text-blue-700 rounded-lg">
          <BarChart2 :size="20" />
        </div>
      </div>

      <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex justify-between items-start">
        <div>
          <p class="text-xs font-semibold text-gray-500">Exams Completed</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ summaryMetrics.completedExams }}</p>
          <p class="text-xs text-gray-400 mt-1">Across 4 Maritime Modules</p>
        </div>
        <div class="p-3 bg-purple-50 text-purple-700 rounded-lg">
          <Users :size="20" />
        </div>
      </div>

      <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex justify-between items-start">
        <div>
          <p class="text-xs font-semibold text-gray-500">Item Quality Flags</p>
          <p class="text-2xl font-bold text-amber-600 mt-1">{{ summaryMetrics.flaggedItems }}</p>
          <p class="text-xs text-amber-600 font-medium mt-1">Low discrimination index</p>
        </div>
        <div class="p-3 bg-amber-50 text-amber-700 rounded-lg">
          <AlertTriangle :size="20" />
        </div>
      </div>
    </div>

    <!-- Competency Mastery Chart Area -->
    <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h2 class="text-lg font-bold text-gray-900">STCW Competency Mastery Analysis</h2>
          <p class="text-xs text-gray-500">Percentage of candidates demonstrating proficiency by table standard.</p>
        </div>

        <select 
          v-model="selectedCohort"
          class="border border-gray-300 rounded-lg text-xs font-semibold px-3 py-1.5 bg-white outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="All Cohorts">All Batches (2026)</option>
          <option value="Batch Alpha">Batch Alpha (Nav-101)</option>
          <option value="Batch Bravo">Batch Bravo (Eng-202)</option>
        </select>
      </div>

      <div class="space-y-4 pt-2">
        <div v-for="comp in competencyBreakdown" :key="comp.code" class="space-y-1.5">
          <div class="flex justify-between items-center text-xs">
            <div class="flex items-center gap-2">
              <span class="font-mono font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">{{ comp.code }}</span>
              <span class="font-semibold text-gray-900">{{ comp.title }}</span>
            </div>
            <span class="font-bold text-gray-800">{{ comp.passRate }}% Proficiency</span>
          </div>

          <div class="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden flex">
            <div 
              :class="[
                'h-full rounded-full transition-all duration-500',
                comp.passRate >= 85 ? 'bg-emerald-500' : 'bg-amber-500'
              ]"
              :style="{ width: `${comp.passRate}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>