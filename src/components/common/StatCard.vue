<script setup>
defineProps({
  label: String,
  value: [String, Number],
  icon: Object,
  colorClass: String,
  bgColorClass: String
})
</script>

<template>
  <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
    <div>
      <p class="text-sm font-medium text-gray-500">{{ label }}</p>
      <h3 class="text-2xl font-bold text-gray-900 mt-1">{{ value }}</h3>
    </div>
    <div :class="['p-3 rounded-lg', bgColorClass]">
      <component :is="icon" :class="['w-6 h-6', colorClass]" />
    </div>
  </div>
</template>