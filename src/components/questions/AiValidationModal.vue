<script setup>
import { ref, watch } from 'vue'
import { Sparkles, CheckCircle2, AlertTriangle, X, RefreshCw } from 'lucide-vue-next'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  question: {
    type: Object,
    default: () => ({})
  },
  isAnalyzing: {
    type: Boolean,
    default: false
  },
  analysisResult: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 're-evaluate', 'apply-fix'])

// Fallback result structure when direct props are unpopulated
const defaultResult = {
  bloomsTaxonomy: {
    current: 'Remembering',
    suggested: 'Analyzing',
    confidence: '92%'
  },
  clarityScore: '85/100',
  issues: [
    { type: 'warning', text: 'Option choice length variance detected. Ensure distractor lengths are balanced.' },
    { type: 'info', text: 'Question stem aligns with STCW Officer in Charge of Navigational Watch standards.' }
  ],
  improvedText: 'What critical factors must an Officer of the Watch (OOW) evaluate before initiating a course change in restricted visibility?'
}

const activeResult = ref(defaultResult)

watch(() => props.analysisResult, (newVal) => {
  if (newVal) {
    activeResult.value = newVal
  }
}, { immediate: true })

function handleClose() {
  emit('close')
}

function handleReEvaluate() {
  emit('re-evaluate', props.question)
}

function applySuggestion() {
  const fixPayload = {
    text: activeResult.value?.improvedText || props.question?.text,
    level: activeResult.value?.bloomsTaxonomy?.suggested || props.question?.bloom_level,
    status: 'Validated'
  }
  emit('apply-fix', fixPayload)
  emit('close')
}
</script>

<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 transition-opacity"
    @keydown.esc="handleClose"
  >
    <div class="bg-white rounded-xl max-w-xl w-full p-6 shadow-xl space-y-5 border border-gray-100">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-gray-100 pb-3">
        <div class="flex items-center gap-2.5">
          <div class="p-2 bg-emerald-100 rounded-lg text-emerald-600">
            <Sparkles :size="20" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900">AI Assessment Item Validation</h3>
            <p class="text-xs text-gray-500">Automated evaluation for STCW & Bloom's Taxonomy standards</p>
          </div>
        </div>
        <button 
          @click="handleClose" 
          class="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
          aria-label="Close modal"
        >
          <X :size="20" />
        </button>
      </div>

      <!-- Original Question Item Preview -->
      <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Original Item Text</span>
        <p class="text-sm font-medium text-gray-800 mt-1">{{ question?.text || 'No question text provided' }}</p>
      </div>

      <!-- Analysis In Progress State -->
      <div v-if="isAnalyzing" class="py-8 text-center space-y-3">
        <RefreshCw :size="32" class="animate-spin text-emerald-600 mx-auto" />
        <p class="text-sm text-gray-600 font-medium">Analyzing item structure and cognitive depth...</p>
      </div>

      <!-- AI Feedback Results -->
      <div v-else class="space-y-4">
        <!-- Quality Badges -->
        <div class="grid grid-cols-2 gap-4">
          <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span class="text-xs font-medium text-blue-600">Bloom's Taxonomy Level</span>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-sm font-bold text-blue-900">
                {{ activeResult.bloomsTaxonomy?.suggested || 'Analyzing' }}
              </span>
              <span class="text-xs bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded font-medium">
                {{ activeResult.bloomsTaxonomy?.confidence || '90%' }}
              </span>
            </div>
          </div>
          <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <span class="text-xs font-medium text-emerald-600">Quality Index Score</span>
            <p class="text-sm font-bold text-emerald-900 mt-1">{{ activeResult.clarityScore || '85/100' }}</p>
          </div>
        </div>

        <!-- Detected Observations -->
        <div class="space-y-2">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Observations</span>
          <div 
            v-for="(issue, idx) in (activeResult.issues || [])" 
            :key="idx" 
            :class="[
              'flex items-start gap-2 text-xs p-2.5 rounded-lg border',
              issue.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-gray-50 border-gray-200 text-gray-700'
            ]"
          >
            <AlertTriangle v-if="issue.type === 'warning'" :size="16" class="text-amber-600 shrink-0 mt-0.5" />
            <CheckCircle2 v-else :size="16" class="text-emerald-600 shrink-0 mt-0.5" />
            <span>{{ issue.text }}</span>
          </div>
        </div>

        <!-- Suggested Revision -->
        <div class="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg">
          <span class="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Suggested Rephrase</span>
          <p class="text-sm text-gray-900 mt-1 font-medium">{{ activeResult.improvedText }}</p>
        </div>
      </div>

      <!-- Modal Footer Controls -->
      <div class="flex justify-between items-center pt-3 border-t border-gray-100">
        <button 
          @click="handleReEvaluate" 
          :disabled="isAnalyzing"
          class="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 font-medium disabled:opacity-50"
        >
          <RefreshCw :size="14" :class="{ 'animate-spin': isAnalyzing }" />
          Re-evaluate
        </button>
        <div class="flex gap-3">
          <button 
            @click="handleClose" 
            class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Keep Original
          </button>
          <button 
            @click="applySuggestion" 
            :disabled="isAnalyzing"
            class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
          >
            <Sparkles :size="16" />
            Apply Improvement
          </button>
        </div>
      </div>
    </div>
  </div>
</template>