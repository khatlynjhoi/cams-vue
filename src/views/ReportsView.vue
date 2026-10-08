<script setup>
import { ref, computed } from 'vue'
import { 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Printer, 
  Filter,
  BarChart2,
  ClipboardCheck,
  FileSpreadsheet
} from 'lucide-vue-next'

// Active Tab Stage ('exam-built' | 'post-pilot')
const activeStage = ref('exam-built')

// Filters
const selectedCourse = ref('All')
const selectedTerm = ref('All')

// Mock Built Exams (Stage 1: AD-09 & AD-10)
const builtExams = ref([
  {
    id: 'EX-2026-001',
    subjectCode: 'NAV-101',
    subjectTitle: 'Navigation Watchkeeping',
    term: 'Midterm',
    academicYear: '2025-2026',
    totalItems: 50,
    createdDate: '2026-03-15',
    status: 'Ready for Pilot'
  },
  {
    id: 'EX-2026-002',
    subjectCode: 'ENG-202',
    subjectTitle: 'Marine Diesel Machinery',
    term: 'Prelim',
    academicYear: '2025-2026',
    totalItems: 40,
    createdDate: '2026-03-18',
    status: 'Ready for Pilot'
  }
])

// Mock Completed Pilot Tests (Stage 2: AD-11 & AD-18)
const completedPilots = ref([
  {
    id: 'PL-2026-001',
    examCode: 'EX-2026-001',
    subjectCode: 'NAV-101',
    subjectTitle: 'Navigation Watchkeeping',
    term: 'Midterm',
    sampleCount: 12,
    avgDurationMin: 42,
    completionRate: '100%',
    reliabilityStatus: 'Validated',
    poorItemsCount: 2
  }
])

// Export Handlers
function generateAD09(exam) {
  alert(`Generating Form AD-09 (Table of Specifications) for ${exam.subjectCode} (${exam.term}).`)
}

function generateAD10(exam) {
  alert(`Generating Form AD-10 (Exam Questionnaire) for ${exam.subjectCode} (${exam.term}).`)
}

function generateAD11(pilot) {
  alert(`Generating Form AD-11 (Item Analysis Result) for ${pilot.subjectCode}. N=${pilot.sampleCount} cadets.`)
}

function generateAD18(pilot) {
  alert(`Generating Form AD-18 (Review & Validation Checklist) for ${pilot.subjectCode}.`)
}
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div>
        <h1 class="text-xl font-bold text-slate-800 flex items-center gap-2">
          <FileText class="w-6 h-6 text-emerald-600" />
          Institutional Reports & Form Center
        </h1>
        <p class="text-xs text-slate-500 mt-1">
          Generate official institutional forms (AD-09, AD-10, AD-11, AD-18) according to assessment lifecycle stage.
        </p>
      </div>

      <div class="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto">
        <button
          @click="activeStage = 'exam-built'"
          :class="[
            'px-4 py-2 text-xs font-bold rounded-lg transition-all',
            activeStage === 'exam-built' 
              ? 'bg-white text-emerald-800 shadow-sm' 
              : 'text-slate-600 hover:text-slate-900'
          ]"
        >
          Phase 1: Exam Built (AD-09 / AD-10)
        </button>
        <button
          @click="activeStage = 'post-pilot'"
          :class="[
            'px-4 py-2 text-xs font-bold rounded-lg transition-all',
            activeStage === 'post-pilot' 
              ? 'bg-white text-emerald-800 shadow-sm' 
              : 'text-slate-600 hover:text-slate-900'
          ]"
        >
          Phase 2: Post-Pilot (AD-11 / AD-18)
        </button>
      </div>
    </div>

    <div v-if="activeStage === 'exam-built'" class="space-y-4">
      <div class="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between">
        <div class="flex items-center gap-3">
          <ClipboardCheck class="w-5 h-5 text-emerald-600" />
          <div>
            <h3 class="text-xs font-bold text-emerald-900">Exam Generation Documents</h3>
            <p class="text-[11px] text-emerald-700">Form AD-09 (T.O.S.) and Form AD-10 (Questionnaire) are produced directly after test assembly.</p>
          </div>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
              <th class="p-3.5">Exam Code</th>
              <th class="p-3.5">Subject</th>
              <th class="p-3.5">Term / S.Y.</th>
              <th class="p-3.5">Items</th>
              <th class="p-3.5">Date Built</th>
              <th class="p-3.5 text-right">Actions / Form Exports</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-xs text-slate-700">
            <tr v-for="exam in builtExams" :key="exam.id" class="hover:bg-slate-50 transition">
              <td class="p-3.5 font-mono font-bold text-slate-800">{{ exam.id }}</td>
              <td class="p-3.5">
                <div class="font-bold text-slate-900">{{ exam.subjectCode }}</div>
                <div class="text-[11px] text-slate-500">{{ exam.subjectTitle }}</div>
              </td>
              <td class="p-3.5">{{ exam.term }} ({{ exam.academicYear }})</td>
              <td class="p-3.5 font-medium">{{ exam.totalItems }} Qs</td>
              <td class="p-3.5 text-slate-500">{{ exam.createdDate }}</td>
              <td class="p-3.5 text-right space-x-2">
                <button 
                  @click="generateAD09(exam)"
                  class="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition"
                >
                  <FileSpreadsheet class="w-3.5 h-3.5 inline mr-1" /> Form AD-09 (TOS)
                </button>
                <button 
                  @click="generateAD10(exam)"
                  class="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition"
                >
                  <Printer class="w-3.5 h-3.5 inline mr-1" /> Form AD-10 (Exam)
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="activeStage === 'post-pilot'" class="space-y-4">
      <div class="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between">
        <div class="flex items-center gap-3">
          <BarChart2 class="w-5 h-5 text-amber-600" />
          <div>
            <h3 class="text-xs font-bold text-amber-900">Post-Pilot Validation Documents</h3>
            <p class="text-[11px] text-amber-700">Form AD-11 (Item Analysis) and Form AD-18 (Checklist) require completion of the pilot student cohort.</p>
          </div>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
              <th class="p-3.5">Pilot ID</th>
              <th class="p-3.5">Subject</th>
              <th class="p-3.5">Cohort Sample</th>
              <th class="p-3.5">Avg Duration</th>
              <th class="p-3.5">Validation Status</th>
              <th class="p-3.5 text-right">Actions / Form Exports</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-xs text-slate-700">
            <tr v-for="pilot in completedPilots" :key="pilot.id" class="hover:bg-slate-50 transition">
              <td class="p-3.5 font-mono font-bold text-slate-800">{{ pilot.id }}</td>
              <td class="p-3.5">
                <div class="font-bold text-slate-900">{{ pilot.subjectCode }}</div>
                <div class="text-[11px] text-slate-500">{{ pilot.subjectTitle }}</div>
              </td>
              <td class="p-3.5">
                <span class="font-bold text-slate-800">{{ pilot.sampleCount }} Cadets</span>
                <span class="text-[11px] text-emerald-600 block">({{ pilot.completionRate }} Completed)</span>
              </td>
              <td class="p-3.5 font-medium">{{ pilot.avgDurationMin }} mins</td>
              <td class="p-3.5">
                <span class="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  <CheckCircle2 class="w-3 h-3" /> {{ pilot.reliabilityStatus }}
                </span>
              </td>
              <td class="p-3.5 text-right space-x-2">
                <button 
                  @click="generateAD11(pilot)"
                  class="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition"
                >
                  <BarChart2 class="w-3.5 h-3.5 inline mr-1" /> Form AD-11 (Item Analysis)
                </button>
                <button 
                  @click="generateAD18(pilot)"
                  class="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold transition"
                >
                  <ClipboardCheck class="w-3.5 h-3.5 inline mr-1" /> Form AD-18 (Checklist)
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>