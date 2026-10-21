<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  icon: {
    type: [Object, Function],
    default: null
  },
  colorClass: {
    type: String,
    default: 'text-emerald-600'
  },
  bgColorClass: {
    type: String,
    default: 'bg-emerald-50'
  },
  trend: {
    type: String,
    default: null
  },
  trendUp: {
    type: Boolean,
    default: true
  }
})
</script>

<template>
  <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:border-gray-300 transition-colors">
    <div class="space-y-1">
      <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">{{ label }}</p>
      <div class="flex items-baseline gap-2">
        <h3 class="text-2xl font-bold text-gray-900 tracking-tight">{{ value }}</h3>
        <span 
          v-if="trend" 
          :class="[
            'text-xs font-semibold px-1.5 py-0.5 rounded',
            trendUp ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
          ]"
        >
          {{ trend }}
        </span>
      </div>
    </div>
    
    <div 
      v-if="icon" 
      :class="['p-3 rounded-lg flex items-center justify-center shrink-0', bgColorClass]"
    >
      <component :is="icon" :class="['w-6 h-6', colorClass]" />
    </div>
  </div>
</template>