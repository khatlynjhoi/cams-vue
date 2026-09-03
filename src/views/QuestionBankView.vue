<template>
  <div class="p-6 max-w-[1600px] mx-auto space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">STCW Question Bank & Assessor Audit</h1>
        <p class="text-sm text-gray-500 mt-1">
          Manage assessment items, verify Bloom's cognitive alignment, and generate course audit summaries.
        </p>
      </div>
      
      <!-- Top Action Controls -->
      <div class="flex items-center gap-3">
        <button 
          @click="downloadCSVTemplate"
          class="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm"
        >
          <Download class="w-4 h-4 text-gray-500" />
          CSV Template
        </button>
        <label class="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition shadow-sm">
          <Upload class="w-4 h-4 text-gray-500" />
          <span>{{ isUploadingBulk ? 'Uploading...' : 'Bulk Upload CSV' }}</span>
          <input 
            type="file" 
            ref="bulkFileInput" 
            accept=".csv" 
            @change="handleBulkCSVUpload" 
            class="hidden" 
            :disabled="isUploadingBulk"
          />
        </label>
        <button 
          @click="activeTab = 'create'" 
          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition shadow"
        >
          <Plus class="w-4 h-4" />
          New Question
        </button>
      </div>
    </div>

    <!-- Main Navigation Tabs -->
    <div class="flex border-b border-gray-200 space-x-8">
      <button 
        @click="activeTab = 'repository'"
        :class="[
          'py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2',
          activeTab === 'repository' 
            ? 'border-emerald-600 text-emerald-600' 
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        ]"
      >
        <Database class="w-4 h-4" />
        Question Repository ({{ questions.length }})
      </button>

      <button 
        @click="activeTab = 'create'"
        :class="[
          'py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2',
          activeTab === 'create' 
            ? 'border-emerald-600 text-emerald-600' 
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        ]"
      >
        <PlusCircle class="w-4 h-4" />
        Question Item Builder
      </button>

      <button 
        @click="activeTab = 'report'"
        :class="[
          'py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2',
          activeTab === 'report' 
            ? 'border-emerald-600 text-emerald-600' 
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        ]"
      >
        <BarChart2 class="w-4 h-4" />
        Assessor Audit Summary
      </button>
    </div>

    <!-- TAB 1: QUESTION REPOSITORY -->
    <div v-if="activeTab === 'repository'" class="space-y-6">
      <!-- Filter Bar -->
      <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3 flex-1 min-w-[280px]">
          <div class="relative w-full">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search items by question text or course code..."
              class="w-full pl-3 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <select v-model="filterProgram" class="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-emerald-500">
            <option value="All">All Programs</option>
            <option value="BSMT">BSMT</option>
            <option value="BSMarE">BSMarE</option>
            <option value="Both">Both Programs</option>
          </select>

          <select v-model="filterType" class="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-emerald-500">
            <option value="All">All Question Types</option>
            <option value="multiple_choice">Multiple Choice</option>
            <option value="true_false">True / False</option>
            <option value="short_answer">Short Answer</option>
            <option value="matching">Matching Type</option>
          </select>

          <select v-model="filterStatus" class="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-emerald-500">
            <option value="All">All Statuses</option>
            <option value="Pending">Pending Review</option>
            <option value="Approved">Approved</option>
            <option value="Disapproved">Disapproved</option>
          </select>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="groupedQuestions.length === 0" class="bg-white p-12 rounded-xl border border-gray-200 text-center space-y-3">
        <HelpCircle class="w-12 h-12 text-gray-300 mx-auto" />
        <h3 class="text-lg font-medium text-gray-900">No questions found</h3>
        <p class="text-sm text-gray-500">Try adjusting your filter criteria or create a new question item.</p>
      </div>

      <!-- Grouped Questions by Subject / Course Code -->
      <div v-for="group in groupedQuestions" :key="group.courseKey" class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div 
          @click="toggleCourseCollapse(group.courseKey)"
          class="bg-slate-50 px-5 py-4 flex items-center justify-between border-b border-gray-200 cursor-pointer hover:bg-slate-100 transition"
        >
          <div class="flex items-center gap-3">
            <component :is="collapsedCourses[group.courseKey] ? ChevronRight : ChevronDown" class="w-5 h-5 text-gray-500" />
            <div>
              <span class="font-bold text-gray-900 text-base">{{ group.code }}</span>
              <span class="text-sm text-gray-500 ml-2">— {{ group.title }}</span>
            </div>
          </div>
          <span class="bg-slate-200 text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-full">
            {{ group.questions.length }} {{ group.questions.length === 1 ? 'Item' : 'Items' }}
          </span>
        </div>

        <!-- Course Question List -->
        <div v-if="!collapsedCourses[group.courseKey]" class="divide-y divide-gray-100">
          <div v-for="q in group.questions" :key="q.id" class="p-5 hover:bg-slate-50/50 transition">
            <div class="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div class="space-y-3 flex-1">
                <!-- Meta badges -->
                <div class="flex flex-wrap items-center gap-2 text-xs">
                  <span class="bg-emerald-50 text-emerald-700 font-medium px-2 py-0.5 rounded border border-emerald-200">
                    {{ q.program || 'Both' }}
                  </span>
                  <span class="bg-indigo-50 text-indigo-700 font-medium px-2 py-0.5 rounded border border-indigo-200">
                    {{ q.term || 'Midterm' }}
                  </span>
                  <span class="bg-gray-100 text-gray-700 font-medium px-2 py-0.5 rounded">
                    Type: {{ q.type ? q.type.replace('_', ' ').toUpperCase() : 'MULTIPLE CHOICE' }}
                  </span>
                  <span class="bg-purple-50 text-purple-700 font-medium px-2 py-0.5 rounded border border-purple-200">
                    Bloom's: {{ q.bloomLevel || 'Understanding' }}
                  </span>
                  <span 
                    :class="[
                      'font-semibold px-2.5 py-0.5 rounded-full text-xs',
                      q.status === 'Approved' ? 'bg-green-100 text-green-800' :
                      q.status === 'Disapproved' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    ]"
                  >
                    {{ q.status || 'Pending Review' }}
                  </span>
                </div>

                <!-- Question Text -->
                <p class="text-gray-900 font-medium text-base">{{ q.text }}</p>

                <!-- Attached Stem Image -->
                <div v-if="q.imageUrl" class="mt-2">
                  <img :src="q.imageUrl" alt="Question diagram" class="max-h-40 rounded border border-gray-200 object-contain bg-gray-50" />
                </div>

                <!-- Multiple Choice Options -->
                <div v-if="q.type === 'multiple_choice' && q.options" class="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
                  <div 
                    v-for="(opt, oIdx) in q.options" 
                    :key="oIdx"
                    :class="[
                      'p-2.5 rounded-lg border text-sm flex items-center justify-between',
                      (Array.isArray(q.correctAnswer) && q.correctAnswer.includes(oIdx)) || q.correctAnswer === oIdx
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-medium'
                        : 'bg-white border-gray-200 text-gray-700'
                    ]"
                  >
                    <span><strong>{{ String.fromCharCode(65 + oIdx) }}.</strong> {{ opt.text || opt }}</span>
                    <Check v-if="(Array.isArray(q.correctAnswer) && q.correctAnswer.includes(oIdx)) || q.correctAnswer === oIdx" class="w-4 h-4 text-emerald-600" />
                  </div>
                </div>

                <!-- AI Audit Assistant Panel -->
                <div class="mt-3 bg-amber-50/70 border border-amber-200 rounded-lg p-3 text-xs space-y-2">
                  <div class="flex items-center gap-2 text-amber-900 font-semibold">
                    <Sparkles class="w-4 h-4 text-amber-600" />
                    <span>AI Cognitive Alignment Audit</span>
                  </div>
                  <p class="text-amber-800">{{ generateAiSuggestion(q).text }}</p>
                  
                  <div v-if="generateAiSuggestion(q).type === 'warning' && !q.retainedAi" class="flex items-center gap-2 pt-1">
                    <button 
                      @click="applyAiCorrection(q)" 
                      class="px-2.5 py-1 bg-amber-600 text-white rounded text-xs hover:bg-amber-700 transition"
                    >
                      Apply AI Recommended Level
                    </button>
                    <button 
                      @click="retainOriginalSettings(q)" 
                      class="px-2.5 py-1 bg-white border border-amber-300 text-amber-800 rounded text-xs hover:bg-amber-100 transition"
                    >
                      Retain Original Classification
                    </button>
                  </div>
                </div>
              </div>

              <!-- Assessor Verification Actions -->
              <div class="flex lg:flex-col items-center gap-2 pt-2 lg:pt-0">
                <button 
                  @click="updateQuestionStatus(q.id, 'Approved')"
                  class="flex-1 lg:w-32 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition"
                >
                  <CheckCircle class="w-3.5 h-3.5" />
                  Approve
                </button>
                <button 
                  @click="updateQuestionStatus(q.id, 'Disapproved')"
                  class="flex-1 lg:w-32 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition"
                >
                  <XCircle class="w-3.5 h-3.5" />
                  Disapprove
                </button>
                <button 
                  @click="deleteQuestion(q.id)"
                  class="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 transition"
                  title="Delete item"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: QUESTION ITEM BUILDER -->
    <div v-if="activeTab === 'create'" class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
      <h2 class="text-lg font-bold text-gray-900 border-b border-gray-200 pb-3">Create New Question Item</h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">Target Academic Program</label>
          <select v-model="form.program" @change="onProgramChange" class="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500">
            <option value="Both">Both (BSMT & BSMarE)</option>
            <option value="BSMT">BSMT (Marine Transportation)</option>
            <option value="BSMarE">BSMarE (Marine Engineering)</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">Examination Term</label>
          <select v-model="form.term" class="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500">
            <option value="Midterm">Midterm Examination</option>
            <option value="Final">Final Examination</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">Course / Subject Code *</label>
          <select v-model="form.courseId" @change="onCourseChange" class="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500">
            <option value="" disabled>Select Subject...</option>
            <option v-for="course in filteredCourses" :key="course.id" :value="course.id || course.code">
              {{ course.code }} — {{ course.title }}
            </option>
          </select>
        </div>
      </div>

      <!-- STCW Outcomes Cascading -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">Course Outcome (CO)</label>
          <select v-model="form.courseOutcomeId" @change="onCOChange" class="w-full border border-gray-300 rounded-lg p-2 text-sm">
            <option value="">Select CO...</option>
            <option v-for="co in availableCourseOutcomes" :key="co.id || co.code" :value="co.id || co.code">
              {{ co.code }}: {{ co.description || co.title }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">Learning Outcome (LO)</label>
          <select v-model="form.learningOutcomeId" class="w-full border border-gray-300 rounded-lg p-2 text-sm">
            <option value="">Select LO...</option>
            <option v-for="lo in availableLearningOutcomes" :key="lo.id || lo.code" :value="lo.id || lo.code">
              {{ lo.code }}: {{ lo.description || lo.title }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">Bloom's Taxonomy Level</label>
          <select v-model="form.bloomLevel" class="w-full border border-gray-300 rounded-lg p-2 text-sm">
            <option value="Remembering">Remembering (Knowledge Recall)</option>
            <option value="Understanding">Understanding (Comprehension)</option>
            <option value="Application">Application (Practical Calculation/Execution)</option>
            <option value="Analysis">Analysis (Analytical Comparison)</option>
            <option value="Evaluation">Evaluation (Assessment)</option>
            <option value="Creation">Creation (Synthesis)</option>
          </select>
        </div>
      </div>

      <!-- Question Type -->
      <div>
        <label class="block text-xs font-semibold text-gray-700 mb-1">Question Type</label>
        <div class="flex flex-wrap gap-4">
          <label class="inline-flex items-center text-sm cursor-pointer">
            <input type="radio" v-model="form.type" value="multiple_choice" class="text-emerald-600" />
            <span class="ml-2">Multiple Choice</span>
          </label>
          <label class="inline-flex items-center text-sm cursor-pointer">
            <input type="radio" v-model="form.type" value="true_false" class="text-emerald-600" />
            <span class="ml-2">True / False</span>
          </label>
          <label class="inline-flex items-center text-sm cursor-pointer">
            <input type="radio" v-model="form.type" value="short_answer" class="text-emerald-600" />
            <span class="ml-2">Short Answer</span>
          </label>
        </div>
      </div>

      <!-- Question Text Stem -->
      <div>
        <label class="block text-xs font-semibold text-gray-700 mb-1">Question Stem / Statement *</label>
        <textarea 
          v-model="form.text" 
          rows="3" 
          placeholder="Enter the item stem or question text here..."
          class="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-emerald-500"
        ></textarea>
        
        <div class="mt-2 flex items-center gap-3">
          <label class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded cursor-pointer transition">
            <ImageIcon class="w-3.5 h-3.5" />
            <span>Attach Diagram / Image</span>
            <input type="file" accept="image/*" @change="(e) => handleFileUpload(e, form, 'imageUrl')" class="hidden" />
          </label>
          <div v-if="form.imageUrl" class="flex items-center gap-2">
            <span class="text-xs text-emerald-600 font-medium">Image attached</span>
            <button @click="removeImage(form, 'imageUrl')" class="text-gray-400 hover:text-red-500"><X class="w-3.5 h-3.5" /></button>
          </div>
        </div>
      </div>

      <!-- Multiple Choice Options Input -->
      <div v-if="form.type === 'multiple_choice'" class="space-y-3 border-t border-gray-100 pt-4">
        <label class="block text-xs font-semibold text-gray-700">Answer Options (Check correct choice)</label>
        <div v-for="(opt, idx) in form.options" :key="idx" class="flex items-center gap-3 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
          <input 
            type="checkbox" 
            v-model="opt.isCorrect" 
            class="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" 
          />
          <span class="font-bold text-gray-600 text-sm w-4">{{ String.fromCharCode(65 + idx) }}.</span>
          <input 
            v-model="opt.text" 
            type="text" 
            :placeholder="'Option ' + String.fromCharCode(65 + idx) + ' text...'" 
            class="flex-1 border border-gray-300 rounded p-1.5 text-sm"
          />
          <button v-if="form.options.length > 2" @click="removeOption(idx)" class="text-gray-400 hover:text-red-500">
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
        <button @click="addOption" class="text-xs font-medium text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1">
          <Plus class="w-3.5 h-3.5" /> Add Choice Option
        </button>
      </div>

      <!-- True / False Input -->
      <div v-if="form.type === 'true_false'" class="space-y-2 border-t border-gray-100 pt-4">
        <label class="block text-xs font-semibold text-gray-700">Select Correct Answer</label>
        <div class="flex gap-4">
          <label class="inline-flex items-center text-sm">
            <input type="radio" v-model="form.tfCorrect" value="true" class="text-emerald-600" />
            <span class="ml-2 font-medium">True</span>
          </label>
          <label class="inline-flex items-center text-sm">
            <input type="radio" v-model="form.tfCorrect" value="false" class="text-emerald-600" />
            <span class="ml-2 font-medium">False</span>
          </label>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end gap-3 border-t border-gray-200 pt-4">
        <button @click="resetForm" class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Reset</button>
        <button 
          @click="saveQuestion" 
          :disabled="isSubmitting" 
          class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm shadow transition"
        >
          {{ isSubmitting ? 'Saving...' : 'Save Question Item' }}
        </button>
      </div>
    </div>

    <!-- TAB 3: ASSESSOR AUDIT SUMMARY -->
    <div v-if="activeTab === 'report'" class="space-y-6">
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Items</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ overallReportSummary.total }}</p>
        </div>
        <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
          <p class="text-xs font-medium text-green-600 uppercase tracking-wider">Approved</p>
          <p class="text-2xl font-bold text-green-700 mt-1">{{ overallReportSummary.approved }}</p>
        </div>
        <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
          <p class="text-xs font-medium text-red-600 uppercase tracking-wider">Disapproved</p>
          <p class="text-2xl font-bold text-red-700 mt-1">{{ overallReportSummary.disapproved }}</p>
        </div>
        <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
          <p class="text-xs font-medium text-yellow-600 uppercase tracking-wider">Pending Review</p>
          <p class="text-2xl font-bold text-yellow-700 mt-1">{{ overallReportSummary.pending }}</p>
        </div>
        <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
          <p class="text-xs font-medium text-indigo-600 uppercase tracking-wider">AI Overrides</p>
          <p class="text-2xl font-bold text-indigo-700 mt-1">{{ overallReportSummary.retainedAi }}</p>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="font-bold text-gray-900 text-base">Course Audit Summary Report</h3>
          <button 
            @click="exportCourseReportCSV" 
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition"
          >
            <Download class="w-3.5 h-3.5" />
            Export Audit CSV
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-gray-600">
            <thead class="bg-slate-50 text-xs text-gray-700 uppercase border-b border-gray-200">
              <tr>
                <th class="px-4 py-3">Course Code</th>
                <th class="px-4 py-3">Course Title</th>
                <th class="px-4 py-3">Program</th>
                <th class="px-4 py-3 text-center">Total Items</th>
                <th class="px-4 py-3 text-center">Approved</th>
                <th class="px-4 py-3 text-center">Disapproved</th>
                <th class="px-4 py-3 text-center">Pending</th>
                <th class="px-4 py-3 text-center">AI Overrides</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="rpt in courseReports" :key="rpt.code" class="hover:bg-gray-50 transition">
                <td class="px-4 py-3 font-semibold text-gray-900">{{ rpt.code }}</td>
                <td class="px-4 py-3">{{ rpt.title }}</td>
                <td class="px-4 py-3"><span class="bg-gray-100 px-2 py-0.5 rounded text-xs">{{ rpt.program }}</span></td>
                <td class="px-4 py-3 text-center font-bold text-gray-900">{{ rpt.total }}</td>
                <td class="px-4 py-3 text-center text-green-600 font-semibold">{{ rpt.approved }}</td>
                <td class="px-4 py-3 text-center text-red-600 font-semibold">{{ rpt.disapproved }}</td>
                <td class="px-4 py-3 text-center text-yellow-600 font-semibold">{{ rpt.pending }}</td>
                <td class="px-4 py-3 text-center text-indigo-600">{{ rpt.retainedAi }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { 
  HelpCircle, Plus, Trash2, ImageIcon, X, Upload, Download, 
  CheckCircle, XCircle, Sparkles, ChevronDown, ChevronRight, Check,
  Database, PlusCircle, BarChart2
} from 'lucide-vue-next'

const questions = ref([])
const courses = ref([])
const isSubmitting = ref(false)
const isUploadingBulk = ref(false)
const bulkFileInput = ref(null)

const activeTab = ref('repository')
const collapsedCourses = ref({})

const filterStatus = ref('All')
const filterProgram = ref('All')
const filterType = ref('All')
const searchQuery = ref('')

const STORAGE_COURSES_KEY = 'cams_courses_data'
const STORAGE_QUESTIONS_KEY = 'cams_questions_data'

const form = reactive({
  program: 'Both',
  term: 'Midterm',
  courseId: '',
  courseOutcomeId: '',
  learningOutcomeId: '',
  bloomLevel: 'Understanding',
  type: 'multiple_choice',
  text: '',
  imageUrl: '',
  options: [
    { text: '', imageUrl: '', isCorrect: false },
    { text: '', imageUrl: '', isCorrect: false },
    { text: '', imageUrl: '', isCorrect: false },
    { text: '', imageUrl: '', isCorrect: false }
  ],
  tfCorrect: 'true',
  shortAnswerKeywords: ''
})

function resetForm() {
  form.text = ''
  form.imageUrl = ''
  form.options = [
    { text: '', imageUrl: '', isCorrect: false },
    { text: '', imageUrl: '', isCorrect: false },
    { text: '', imageUrl: '', isCorrect: false },
    { text: '', imageUrl: '', isCorrect: false }
  ]
  form.tfCorrect = 'true'
  form.shortAnswerKeywords = ''
}

const filteredCourses = computed(() => {
  if (!courses.value || courses.value.length === 0) return []
  if (form.program === 'Both') return courses.value
  return courses.value.filter(c => c.program === form.program || c.program === 'Both' || !c.program)
})

const availableCourseOutcomes = computed(() => {
  const selectedCourse = courses.value.find(c => c.id === form.courseId || c.code === form.courseId)
  return selectedCourse?.courseOutcomes || []
})

const availableLearningOutcomes = computed(() => {
  const selectedCO = availableCourseOutcomes.value.find(co => (co.id || co.code) === form.courseOutcomeId)
  return selectedCO?.learningOutcomes || []
})

const filteredQuestions = computed(() => {
  return questions.value.filter(q => {
    const matchesStatus = filterStatus.value === 'All' || (q.status || 'Pending') === filterStatus.value
    const matchesProgram = filterProgram.value === 'All' || q.program === filterProgram.value || q.program === 'Both'
    const matchesType = filterType.value === 'All' || q.type === filterType.value
    const matchesSearch = !searchQuery.value || 
      (q.text && q.text.toLowerCase().includes(searchQuery.value.toLowerCase())) || 
      (q.courseId && q.courseId.toLowerCase().includes(searchQuery.value.toLowerCase()))
    return matchesStatus && matchesProgram && matchesType && matchesSearch
  })
})

const groupedQuestions = computed(() => {
  const groups = {}
  filteredQuestions.value.forEach(q => {
    const courseKey = q.courseId || 'Unassigned'
    if (!groups[courseKey]) {
      const courseObj = courses.value.find(c => c.id === q.courseId || c.code === q.courseId)
      groups[courseKey] = {
        courseKey,
        code: courseObj ? courseObj.code : (q.courseId || 'UNASSIGNED'),
        title: courseObj ? courseObj.title : 'General / Unassigned Course Items',
        questions: []
      }
    }
    groups[courseKey].questions.push(q)
  })
  return Object.values(groups)
})

const courseReports = computed(() => {
  const map = {}
  courses.value.forEach(course => {
    map[course.id || course.code] = {
      code: course.code || course.id,
      title: course.title || `Course ${course.code}`,
      program: course.program || 'Both',
      total: 0,
      approved: 0,
      disapproved: 0,
      pending: 0,
      retainedAi: 0
    }
  })

  questions.value.forEach(q => {
    const key = q.courseId || 'Unassigned'
    if (!map[key]) {
      map[key] = {
        code: key,
        title: 'Unassigned Course Items',
        program: 'N/A',
        total: 0,
        approved: 0,
        disapproved: 0,
        pending: 0,
        retainedAi: 0
      }
    }
    map[key].total++
    const status = q.status || 'Pending'
    if (status === 'Approved') map[key].approved++
    else if (status === 'Disapproved') map[key].disapproved++
    else map[key].pending++

    if (q.retainedAi) map[key].retainedAi++
  })

  return Object.values(map)
})

const overallReportSummary = computed(() => {
  const total = questions.value.length
  const approved = questions.value.filter(q => q.status === 'Approved').length
  const disapproved = questions.value.filter(q => q.status === 'Disapproved').length
  const pending = questions.value.filter(q => (q.status || 'Pending') === 'Pending').length
  const retainedAi = questions.value.filter(q => q.retainedAi).length
  return { total, approved, disapproved, pending, retainedAi }
})

function toggleCourseCollapse(courseKey) {
  collapsedCourses.value[courseKey] = !collapsedCourses.value[courseKey]
}

function exportCourseReportCSV() {
  const headers = ['Course Code', 'Course Title', 'Program', 'Total Questions', 'Approved', 'Disapproved', 'Pending Approval', 'AI Overrides Retained']
  const rows = courseReports.value.map(r => [
    r.code, r.title, r.program, r.total, r.approved, r.disapproved, r.pending, r.retainedAi
  ])
  const csvContent = [headers.join(','), ...rows.map(row => row.map(f => `"${String(f).replace(/"/g, '""')}"`).join(','))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.setAttribute('download', `course_question_report_${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function onProgramChange() {
  form.courseId = ''
  form.courseOutcomeId = ''
  form.learningOutcomeId = ''
}

function onCourseChange() {
  form.courseOutcomeId = ''
  form.learningOutcomeId = ''
}

function onCOChange() {
  form.learningOutcomeId = ''
}

function addOption() {
  form.options.push({ text: '', imageUrl: '', isCorrect: false })
}

function removeOption(index) {
  if (form.options.length > 2) form.options.splice(index, 1)
}

function handleFileUpload(event, targetObj, propertyName) {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => { targetObj[propertyName] = e.target.result }
  reader.readAsDataURL(file)
}

function removeImage(targetObj, propertyName) {
  targetObj[propertyName] = ''
}

function generateAiSuggestion(q) {
  if (q.retainedAi) {
    return { type: 'info', text: 'Original parameters retained by reviewer.' }
  }

  const suggestions = []
  const textLower = (q.text || '').toLowerCase().trim()
  const bloom = (q.bloomLevel || '').toLowerCase()

  if ((textLower.startsWith('what is') || textLower.startsWith('define') || textLower.startsWith('list') || textLower.startsWith('identify')) && bloom !== 'remembering') {
    suggestions.push(`Cognitive Level Mismatch: Stem uses recall verbs. Suggested Bloom's level is "Remembering" instead of "${q.bloomLevel}".`)
  } else if ((textLower.includes('calculate') || textLower.includes('solve') || textLower.includes('determine')) && bloom !== 'application' && bloom !== 'applying') {
    suggestions.push(`Cognitive Level Mismatch: Question involves calculation. Suggested Bloom's level is "Application" instead of "${q.bloomLevel}".`)
  }

  if (q.text && q.text.length < 15) {
    suggestions.push('Stem Clarity: Item statement is short. Consider expanding context.')
  }

  if (suggestions.length === 0) {
    return { type: 'success', text: "AI Audit: Item stem and Bloom's classification are well-aligned." }
  }

  return { type: 'warning', text: suggestions.join(' | ') }
}

function syncQuestionsStorage() {
  localStorage.setItem(STORAGE_QUESTIONS_KEY, JSON.stringify(questions.value))
}

function updateQuestionStatus(id, status) {
  const q = questions.value.find(item => item.id === id)
  if (q) {
    q.status = status
    syncQuestionsStorage()
  }
}

function applyAiCorrection(q) {
  const suggestion = generateAiSuggestion(q)
  if (suggestion.type === 'warning' && suggestion.text.includes('Suggested Bloom\'s level is')) {
    if (suggestion.text.includes('"Remembering"')) q.bloomLevel = 'Remembering'
    else if (suggestion.text.includes('"Application"')) q.bloomLevel = 'Application'
  }
  q.retainedAi = false
  syncQuestionsStorage()
}

function retainOriginalSettings(q) {
  q.retainedAi = true
  syncQuestionsStorage()
}

async function deleteQuestion(id) {
  if (confirm('Are you sure you want to remove this question item?')) {
    questions.value = questions.value.filter(q => q.id !== id)
    syncQuestionsStorage()
    try {
      await fetch('http://localhost:3001/api/questions/' + id, { method: 'DELETE' })
    } catch (err) {
      console.warn('Backend delete request skipped, updated local state.')
    }
  }
}

async function fetchQuestions() {
  try {
    const res = await fetch('http://localhost:3001/api/questions')
    const data = await res.json()
    if (data && data.success && Array.isArray(data.data)) {
      questions.value = data.data
      syncQuestionsStorage()
      return
    }
  } catch (err) {
    console.warn('Backend unavailable, reading questions from local storage')
  }

  const saved = localStorage.getItem(STORAGE_QUESTIONS_KEY)
  if (saved) {
    try { questions.value = JSON.parse(saved) } catch (e) { questions.value = [] }
  }
}

async function fetchCourses() {
  try {
    const res = await fetch('http://localhost:3001/api/courses')
    const data = await res.json()
    if (data && data.success && Array.isArray(data.data)) {
      courses.value = data.data
      localStorage.setItem(STORAGE_COURSES_KEY, JSON.stringify(data.data))
      return
    }
  } catch (err) {
    console.warn('Backend unavailable, reading courses from local storage')
  }

  const savedCourses = localStorage.getItem(STORAGE_COURSES_KEY)
  if (savedCourses) {
    try { courses.value = JSON.parse(savedCourses) } catch (e) { courses.value = [] }
  }
}

async function saveQuestion() {
  if (!form.courseId || !form.text) {
    alert('Please select a Course / Subject and enter Question Stem.')
    return
  }

  let formattedOptions = []
  let formattedCorrectAnswer = null

  if (form.type === 'multiple_choice') {
    formattedOptions = form.options.map(opt => ({ text: opt.text, imageUrl: opt.imageUrl }))
    formattedCorrectAnswer = form.options
      .map((opt, idx) => opt.isCorrect ? idx : null)
      .filter(val => val !== null)
    
    if (formattedCorrectAnswer.length === 0) {
      alert('Please check at least one correct option.')
      return
    }
  } else if (form.type === 'true_false') {
    formattedOptions = ['True', 'False']
    formattedCorrectAnswer = form.tfCorrect === 'true' ? 0 : 1
  }

  const payload = {
    id: Date.now().toString(),
    ...form,
    options: formattedOptions,
    correctAnswer: formattedCorrectAnswer,
    status: 'Pending'
  }

  isSubmitting.value = true
  try {
    const res = await fetch('http://localhost:3001/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    if (data.success) {
      alert('Question saved successfully!')
      await fetchQuestions()
      resetForm()
      activeTab.value = 'repository'
    } else {
      throw new Error(data.error)
    }
  } catch (err) {
    questions.value.unshift(payload)
    syncQuestionsStorage()
    alert('Question item saved locally!')
    resetForm()
    activeTab.value = 'repository'
  } finally {
    isSubmitting.value = false
  }
}

function downloadCSVTemplate() {
  const headers = ['Program', 'Term', 'CourseId', 'CourseOutcomeId', 'LearningOutcomeId', 'BloomLevel', 'QuestionType', 'QuestionText', 'OptionA', 'OptionB', 'OptionC', 'OptionD', 'CorrectAnswer']
  const sampleRows = [
    ['BSMT', 'Midterm', 'CRS-101', 'CO1', 'LO1.1', 'Understanding', 'multiple_choice', 'What is the primary function of an ECDIS?', 'Electronic Chart Display', 'Radar Display', 'Sonar System', 'GMDSS Radio', 'A'],
    ['BSMarE', 'Final', 'CRS-102', 'CO2', 'LO2.1', 'Remembering', 'true_false', 'Is a diesel engine an internal combustion engine?', 'True', 'False', '', '', 'A']
  ]

  const csvContent = [headers.join(','), ...sampleRows.map(r => r.map(f => `"${f.replace(/"/g, '""')}"`).join(','))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.setAttribute('download', 'question_bank_template.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function handleBulkCSVUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      isUploadingBulk.value = true
      const lines = e.target.result.split(/\r?\n/).filter(l => l.trim().length > 0)
      if (lines.length < 2) return alert('CSV file appears empty.')

      const parsedQuestions = []
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(s => s.trim().replace(/^"|"$/g, ''))
        if (cols.length >= 8) {
          parsedQuestions.push({
            id: Date.now().toString() + i,
            program: cols[0] || 'Both',
            term: cols[1] || 'Midterm',
            courseId: cols[2] || '',
            courseOutcomeId: cols[3] || '',
            learningOutcomeId: cols[4] || '',
            bloomLevel: cols[5] || 'Understanding',
            type: cols[6] || 'multiple_choice',
            text: cols[7] || '',
            options: [cols[8], cols[9], cols[10], cols[11]].filter(Boolean).map(t => ({ text: t, imageUrl: '' })),
            correctAnswer: [0],
            status: 'Pending'
          })
        }
      }

      questions.value = [...parsedQuestions, ...questions.value]
      syncQuestionsStorage()
      alert(`Imported ${parsedQuestions.length} questions successfully!`)
      activeTab.value = 'repository'
    } catch (err) {
      alert('Error parsing CSV file.')
    } finally {
      isUploadingBulk.value = false
      if (bulkFileInput.value) bulkFileInput.value.value = ''
    }
  }
  reader.readAsText(file)
}

onMounted(() => {
  fetchQuestions()
  fetchCourses()
})
</script>