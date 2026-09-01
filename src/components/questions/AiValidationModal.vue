<script setup>
import { ref } from 'vue'
import { Sparkles, CheckCircle2, AlertTriangle, X, RefreshCw } from 'lucide-vue-next'

const props = defineProps({
  question: Object,
  isOpen: Boolean
})

const emit = defineEmits(['close', 'apply-fix'])

const isAnalyzing = ref(false)
const aiResult = ref({
  bloomsTaxonomy: {
    current: 'Remembering',
    suggested: 'Analyzing',
    confidence: '92%'
  },
  clarityScore: '85/100',
  issues: [
    { type: 'warning', text: 'Option C is significantly longer than other options, which may bias test takers.' },
    { type: 'info', text: 'Question stem matches STCW Assessment criteria for Officers in Charge of Navigational Watch.' }
  ],
  improvedText: 'What critical factors must an Officer of the Watch (OOW) evaluate before initiating a course change in restricted visibility?'
})

function runAnalysis() {
  isAnalyzing.value = true
  setTimeout(() => {
    isAnalyzing.value = false
  }, 1200)
}

function applySuggestion() {
  emit('apply-fix', {
    text: aiResult.value.improvedText,
    level: aiResult.value.bloomsTaxonomy.suggested,
    status: 'Validated'
  })
  emit('close')
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-xl max-w-xl w-full p-6 shadow-xl space-y-5">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-gray-100 pb-3">
        <div class="flex items-center gap-2">
          <div class="p-2 bg-emerald-100 rounded-lg text-emerald-600">
            <Sparkles :size="20" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900">AI Assessment Item Validation</h3>
            <p class="text-xs text-gray-500">Automated evaluation for STCW & Bloom's Taxonomy standards</p>
          </div>
        </div>
        <button @click="emit('close')" class="text-gray-400 hover:text-gray-600">
          <X :size="20" />
        </button>
      </div>

      <!-- Original Question Preview -->
      <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Original Item</span>
        <p class="text-sm font-medium text-gray-800 mt-1">{{ question?.text }}</p>
      </div>

      <!-- Analysis State -->
      <div v-if="isAnalyzing" class="py-8 text-center space-y-3">
        <RefreshCw :size="32" class="animate-spin text-emerald-600 mx-auto" />
        <p class="text-sm text-gray-600 font-medium">Analyzing item structure and cognitive depth...</p>
      </div>

      <!-- AI Feedback Results -->
      <div v-else class="space-y-4">
        <!-- Bloom's Taxonomy & Score Badges -->
        <div class="grid grid-cols-2 gap-4">
          <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span class="text-xs font-medium text-blue-600">Bloom's Taxonomy Level</span>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-sm font-bold text-blue-900">{{ aiResult.bloomsTaxonomy.suggested }}</span>
              <span class="text-xs bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded font-medium">
                {{ aiResult.bloomsTaxonomy.confidence }}
              </span>
            </div>
          </div>
          <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <span class="text-xs font-medium text-emerald-600">Quality Index</span>
            <p class="text-sm font-bold text-emerald-900 mt-1">{{ aiResult.clarityScore }}</p>
          </div>
        </div>

        <!-- Detected Observations -->
        <div class="space-y-2">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Observations</span>
          <div v-for="(issue, idx) in aiResult.issues" :key="idx" class="flex items-start gap-2 text-xs p-2.5 rounded-lg border" :class="issue.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-gray-50 border-gray-200 text-gray-700'">
            <AlertTriangle v-if="issue.type === 'warning'" :size="16" class="text-amber-600 shrink-0 mt-0.5" />
            <CheckCircle2 v-else :size="16" class="text-emerald-600 shrink-0 mt-0.5" />
            <span>{{ issue.text }}</span>
          </div>
        </div>

        <!-- Suggested Revision -->
        <div class="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg">
          <span class="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Suggested Rephrase</span>
          <p class="text-sm text-gray-900 mt-1 font-medium">{{ aiResult.improvedText }}</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-between items-center pt-2 border-t border-gray-100">
        <button @click="runAnalysis" class="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 font-medium">
          <RefreshCw :size="14" />
          Re-evaluate
        </button>
        <div class="flex gap-3">
          <button @click="emit('close')" class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            Keep Original
          </button>
          <button @click="applySuggestion" class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 flex items-center gap-1.5">
            <Sparkles :size="16" />
            Apply AI Improvement
          </button>
        </div>
      </div>
    </div>
  </div>
</template>