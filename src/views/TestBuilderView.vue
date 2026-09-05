<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Sparkles, 
  Sliders, 
  Trash2, 
  Send
} from 'lucide-vue-next'

const router = useRouter()

const examConfig = ref({
  title: 'NAV-101 Midterm Examination 2026',
  course: 'NAV-101',
  durationMinutes: 60,
  passingScorePercent: 75,
  stcwTable: 'Table A-II/1 (Officers in Charge of Navigational Watch)'
})

const isAiModalOpen = ref(false)
const isAutoBuilding = ref(false)

const aiBlueprint = ref({
  targetTotalItems: 10,
  easyPercent: 30,
  mediumPercent: 50,
  hardPercent: 20
})

const selectedItems = ref([
  {
    id: 'Q-101',
    code: 'NAV-101-01',
    text: 'What is the primary objective of keeping a safe navigational watch under STCW?',
    bloomLevel: 'Understanding',
    points: 1,
    aiScore: '98%'
  },
  {
    id: 'Q-103',
    code: 'NAV-101-03',
    text: 'According to COLREG Rule 15, which vessel is give-way in a crossing situation?',
    bloomLevel: 'Remembering',
    points: 1,
    aiScore: '95%'
  },
  {
    id: 'Q-105',
    code: 'NAV-101-05',
    text: 'What action should be taken immediately upon observing a Man Overboard (MOB) incident?',
    bloomLevel: 'Application',
    points: 2,
    aiScore: '99%'
  }
])

const totalPoints = computed(() => selectedItems.value.reduce((sum, item) => sum + Number(item.points), 0))
const totalItemsCount = computed(() => selectedItems.value.length)

function autoAssembleTest() {
  isAutoBuilding.value = true
  setTimeout(() => {
    const generated = [
      {
        id: `Q-AI-${Date.now()}-1`,
        code: 'NAV-101-08',
        text: 'Determine the true vector course to steer when compensating for a 3-knot leeway current.',
        bloomLevel: 'Analysis',
        points: 2,
        aiScore: '97%'
      },
      {
        id: `Q-AI-${Date.now()}-2`,
        code: 'NAV-101-12',
        text: 'Identify the required fog signals for a power-driven vessel underway but stopped and making no way.',
        bloomLevel: 'Understanding',
        points: 1,
        aiScore: '96%'
      }
    ]
    selectedItems.value.push(...generated)
    isAutoBuilding.value = false
    isAiModalOpen.value = false
  }, 1200)
}

function removeItem(id) {
  selectedItems.value = selectedItems.value.filter(item => item.id !== id)
}

function publishToPilot() {
  alert('Exam blueprint saved and published to the Pilot Administration schedule!')
  router.push('/pilot-admin')
}
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Test Builder</h1>
        <p class="text-gray-500 mt-1">Assemble STCW-aligned examinations using AI blueprints and question item selection.</p>
      </div>

      <div class="flex items-center gap-3">
        <button 
          @click="isAiModalOpen = true"
          class="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Sparkles :size="16" />
          AI Auto-Assemble
        </button>

        <button 
          @click="publishToPilot"
          class="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Send :size="16" />
          Publish to Pilot
        </button>
      </div>
    </div>

    <!-- Configuration & Blueprint Panel -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left: Configuration Form -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <h2 class="font-bold text-gray-900 text-base flex items-center gap-2">
          <Sliders :size="18" class="text-emerald-600" /> Exam Parameters
        </h2>

        <div class="space-y-3">
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Assessment Title</label>
            <input 
              v-model="examConfig.title" 
              type="text" 
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Target Course / Module</label>
            <select 
              v-model="examConfig.course" 
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
            >
              <option value="NAV-101">NAV-101 Terrestrial Navigation</option>
              <option value="ENG-202">ENG-202 Marine Diesel Engines</option>
              <option value="SAF-301">SAF-301 Maritime Safety</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Time Limit (Mins)</label>
              <input 
                v-model="examConfig.durationMinutes" 
                type="number" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Passing Mark (%)</label>
              <input 
                v-model="examConfig.passingScorePercent" 
                type="number" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">STCW Standard Mapping</label>
            <input 
              v-model="examConfig.stcwTable" 
              type="text" 
              readonly 
              class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono text-gray-600 outline-none"
            />
          </div>
        </div>

        <!-- Blueprint Stats -->
        <div class="border-t border-gray-100 pt-4 space-y-2 text-xs text-gray-600">
          <div class="flex justify-between">
            <span>Total Exam Items:</span>
            <span class="font-bold text-gray-900">{{ totalItemsCount }} Questions</span>
          </div>
          <div class="flex justify-between">
            <span>Total Points:</span>
            <span class="font-bold text-emerald-700">{{ totalPoints }} Marks</span>
          </div>
          <div class="flex justify-between">
            <span>STCW Coverage Score:</span>
            <span class="font-bold text-purple-700">100% Compliant</span>
          </div>
        </div>
      </div>

      <!-- Right: Selected Questions List -->
      <div class="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
        <div>
          <div class="flex justify-between items-center pb-4 border-b border-gray-100">
            <div>
              <h2 class="font-bold text-gray-900 text-base">Assembled Test Blueprint</h2>
              <p class="text-xs text-gray-500">Items included in this assessment bundle.</p>
            </div>
            <span class="text-xs font-semibold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
              {{ totalItemsCount }} Items Selected
            </span>
          </div>

          <div class="space-y-3 pt-4">
            <div 
              v-for="(item, idx) in selectedItems" 
              :key="item.id"
              class="p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-all flex items-start justify-between gap-4 bg-gray-50/50"
            >
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-mono font-bold text-gray-500">#{{ idx + 1 }}</span>
                  <span class="text-xs font-mono bg-gray-200 px-2 py-0.5 rounded text-gray-700 font-bold">
                    {{ item.code }}
                  </span>
                  <span class="text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full">
                    {{ item.bloomLevel }}
                  </span>
                </div>
                <p class="text-sm font-semibold text-gray-900 pt-1">{{ item.text }}</p>
              </div>

              <div class="flex items-center gap-3 shrink-0">
                <div class="text-right">
                  <span class="text-xs block text-gray-400 font-medium">Points</span>
                  <input 
                    v-model.number="item.points" 
                    type="number" 
                    min="1" 
                    class="w-12 border border-gray-300 rounded text-center text-xs font-bold py-1 outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <button 
                  @click="removeItem(item.id)" 
                  class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove Item"
                >
                  <Trash2 :size="16" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="pt-4 border-t border-gray-100 flex justify-end">
          <button 
            @click="publishToPilot" 
            class="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl transition-all shadow-md"
          >
            <Send :size="16" />
            <span>Save & Schedule Exam</span>
          </button>
        </div>
      </div>
    </div>

    <!-- AI Blueprint Auto-Assemble Modal -->
    <div v-if="isAiModalOpen" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div class="flex items-center gap-3 text-purple-700">
          <Sparkles :size="28" />
          <div>
            <h3 class="text-lg font-bold text-gray-900">AI Blueprint Builder</h3>
            <p class="text-xs text-gray-500">Automatically select balanced items based on Bloom's taxonomy.</p>
          </div>
        </div>

        <div class="space-y-3">
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Target Item Count</label>
            <input 
              v-model.number="aiBlueprint.targetTotalItems" 
              type="number" 
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div class="space-y-1">
            <span class="block text-xs font-semibold text-gray-700">Cognitive Balance (Bloom's Taxonomy)</span>
            <div class="grid grid-cols-3 gap-2 text-center text-xs">
              <div class="bg-purple-50 border border-purple-200 p-2 rounded-lg">
                <span class="block text-gray-500 font-medium">Easy</span>
                <span class="font-bold text-purple-900">30%</span>
              </div>
              <div class="bg-purple-50 border border-purple-200 p-2 rounded-lg">
                <span class="block text-gray-500 font-medium">Medium</span>
                <span class="font-bold text-purple-900">50%</span>
              </div>
              <div class="bg-purple-50 border border-purple-200 p-2 rounded-lg">
                <span class="block text-gray-500 font-medium">Hard</span>
                <span class="font-bold text-purple-900">20%</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button 
            @click="isAiModalOpen = false" 
            class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            @click="autoAssembleTest" 
            :disabled="isAutoBuilding"
            class="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
          >
            <Sparkles :size="16" :class="{ 'animate-spin': isAutoBuilding }" />
            <span>{{ isAutoBuilding ? 'Assembling...' : 'Assemble Items' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>