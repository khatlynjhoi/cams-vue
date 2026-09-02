<script setup>
import { ref, onMounted } from 'vue'
import { BarChart3, PieChart, ShieldCheck, AlertCircle } from 'lucide-vue-next'

const questions = ref([])
const bloomStats = ref({ Remembering: 0, Understanding: 0, Application: 0, Analysis: 0 })
const stcwStats = ref({})

async function fetchAnalytics() {
  try {
    const res = await fetch('http://localhost:3001/api/questions')
    const data = await res.json()
    if (data.success) {
      questions.value = data.data
      calculateMetrics()
    }
  } catch (err) {
    console.error(err)
  }
}

function calculateMetrics() {
  const bloom = { Remembering: 0, Understanding: 0, Application: 0, Analysis: 0 }
  const stcw = {}

  questions.value.forEach(q => {
    if (bloom[q.bloomLevel] !== undefined) bloom[q.bloomLevel]++
    const std = q.stcwStandard || 'Table A-II/1'
    stcw[std] = (stcw[std] || 0) + 1
  })

  bloomStats.value = bloom
  stcwStats.value = stcw
}

onMounted(fetchAnalytics)
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <div class="bg-slate-900 text-white p-6 rounded-2xl flex justify-between items-center">
      <div>
        <h1 class="text-xl font-bold flex items-center gap-2">
          <BarChart3 class="text-emerald-400" :size="20" /> STCW Curriculum Audit & Analytics
        </h1>
        <p class="text-xs text-slate-300">Live evaluation of cognitive levels and STCW competency standard distribution.</p>
      </div>
      <div class="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 text-right">
        <span class="text-[10px] text-slate-400 block font-bold uppercase">Total Questions</span>
        <span class="text-lg font-extrabold text-emerald-400">{{ questions.length }}</span>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Bloom's Distribution -->
      <div class="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
        <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
          <PieChart class="text-emerald-600" :size="16" /> Bloom's Taxonomy Cognitive Balance
        </h2>
        
        <div class="space-y-3 pt-2">
          <div v-for="(count, level) in bloomStats" :key="level" class="space-y-1">
            <div class="flex justify-between text-xs font-bold text-slate-700">
              <span>{{ level }}</span>
              <span>{{ count }} items ({{ questions.length ? Math.round((count / questions.length) * 100) : 0 }}%)</span>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div class="bg-slate-800 h-3 rounded-full transition-all" :style="{ width: `${questions.length ? (count / questions.length) * 100 : 0}%` }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- STCW Standard Coverage -->
      <div class="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
        <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck class="text-emerald-600" :size="16" /> STCW Competency Standard Coverage
        </h2>

        <div class="space-y-3 pt-2">
          <div v-for="(count, std) in stcwStats" :key="std" class="p-3 border rounded-xl flex justify-between items-center bg-slate-50">
            <div>
              <span class="font-mono text-xs font-bold text-slate-900 block">{{ std }}</span>
              <span class="text-[10px] text-slate-500">Compliant with STCW Code Section A</span>
            </div>
            <span class="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg">{{ count }} Items</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>