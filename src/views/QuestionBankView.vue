<template>
  <div class="p-6 md:p-8 space-y-6 min-h-screen bg-[#f4f6f9] text-slate-800">
    
    <!-- Dark Hero Banner -->
    <div class="bg-[#0b132b] text-white p-6 rounded-2xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shadow-sm">
      <div class="space-y-1">
        <h1 class="text-xl font-bold flex items-center gap-2 text-white tracking-tight">
          <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">?</span>
          Assessment Question Authoring
        </h1>
        <p class="text-xs text-slate-300 font-normal">
          Map items by Program, Term, Course Code, Outcomes, and Bloom's Taxonomy.
        </p>
      </div>

      <!-- Top Action Buttons -->
      <div class="flex items-center gap-3 shrink-0">
        <button 
          @click="downloadCSVTemplate" 
          type="button" 
          class="px-4 py-2.5 bg-[#1c2538] hover:bg-[#25314a] text-slate-200 text-xs font-semibold rounded-xl border border-slate-700/60 flex items-center gap-2 transition shadow-sm"
        >
          <Download :size="14" class="text-slate-300"></Download> 
          Download CSV Template
        </button>

        <label class="px-4 py-2.5 bg-[#00c068] hover:bg-[#00a358] text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-2 transition shadow-sm">
          <Upload :size="14"></Upload> 
          <span>{{ isUploadingBulk ? 'Uploading...' : 'Bulk Upload CSV' }}</span>
          <input ref="bulkFileInput" type="file" accept=".csv" @change="handleBulkCSVUpload" :disabled="isUploadingBulk" class="hidden" />
        </label>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex items-center gap-3">
      <button 
        @click="activeTab = 'repository'"
        :class="[
          'px-5 py-2.5 rounded-full font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer',
          activeTab === 'repository' 
            ? 'bg-[#0b132b] text-white shadow-sm' 
            : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80 shadow-2xs'
        ]"
      >
        <Database :size="14" :class="activeTab === 'repository' ? 'text-white' : 'text-slate-500'"></Database> 
        Question Bank Repository
        <span 
          :class="activeTab === 'repository' ? 'bg-[#00c068] text-white' : 'bg-slate-100 text-slate-600'"
          class="text-[10px] px-2 py-0.5 rounded-full font-bold ml-0.5"
        >
          {{ questions.length }}
        </span>
      </button>

      <button 
        @click="activeTab = 'create'"
        :class="[
          'px-5 py-2.5 rounded-full font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer',
          activeTab === 'create' 
            ? 'bg-[#0b132b] text-white shadow-sm' 
            : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80 shadow-2xs'
        ]"
      >
        <PlusCircle :size="14" :class="activeTab === 'create' ? 'text-white' : 'text-slate-500'"></PlusCircle> 
        Author New Question
      </button>

      <button 
        @click="activeTab = 'report'"
        :class="[
          'px-5 py-2.5 rounded-full font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer',
          activeTab === 'report' 
            ? 'bg-[#0b132b] text-white shadow-sm' 
            : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80 shadow-2xs'
        ]"
      >
        <FileText :size="14" :class="activeTab === 'report' ? 'text-white' : 'text-slate-500'"></FileText> 
        Course Reports & Audits
      </button>
    </div>

    <!-- TAB 1: QUESTION BANK REPOSITORY -->
    <div v-show="activeTab === 'repository'" class="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-5">
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div class="flex items-center gap-2.5">
            <h2 class="text-base font-bold text-slate-900 tracking-tight">Question Bank Repository</h2>
            <span class="bg-emerald-100 text-emerald-800 text-[11px] px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200/60">
              {{ filteredQuestions.length }} items
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">
            Review, approve/disapprove, or apply AI cognitive suggestions organized by Course Code and Title.
          </p>
        </div>

        <!-- Right Side Filter & Sort Controls -->
        <div class="flex flex-col items-end gap-2 w-full lg:w-auto">
          <div class="w-full lg:w-64">
            <input 
              v-model="searchQuery" 
              placeholder="Search questions..." 
              class="w-full px-3 py-1.5 border border-slate-300/80 rounded-lg bg-white text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 placeholder-slate-400 shadow-2xs"
            />
          </div>
          
          <div class="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <select v-model="filterStatus" class="px-2.5 py-1.5 border border-slate-300/80 rounded-lg bg-white text-xs text-slate-700 font-medium outline-none cursor-pointer shadow-2xs">
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Disapproved">Disapproved</option>
            </select>

            <select v-model="filterProgram" class="px-2.5 py-1.5 border border-slate-300/80 rounded-lg bg-white text-xs text-slate-700 font-medium outline-none cursor-pointer shadow-2xs">
              <option value="All">All Programs</option>
              <option value="BSMT">BSMT</option>
              <option value="BSMarE">BSMarE</option>
              <option value="Both">Both</option>
            </select>

            <select v-model="filterType" class="px-2.5 py-1.5 border border-slate-300/80 rounded-lg bg-white text-xs text-slate-700 font-medium outline-none cursor-pointer shadow-2xs">
              <option value="All">All Types</option>
              <option value="multiple_choice">Multiple Choice</option>
              <option value="matching">Matching Type</option>
              <option value="true_false">True / False</option>
              <option value="short_answer">Short Answer</option>
            </select>

            <!-- Sorting Dropdown -->
            <select v-model="sortBy" class="px-2.5 py-1.5 border border-slate-300/80 rounded-lg bg-slate-100 text-xs text-slate-800 font-bold outline-none cursor-pointer shadow-2xs border-slate-400">
              <option value="default">Sort: Default</option>
              <option value="type">Sort by Question Type</option>
              <option value="co">Sort by Course Outcome (CO)</option>
              <option value="lo">Sort by Learning Outcome (LO)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Bulk Actions Bar & Select All Button -->
      <div class="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/90 text-xs">
        <div class="flex items-center gap-3">
          <label class="flex items-center gap-2 cursor-pointer font-bold text-slate-700 select-none">
            <input 
              type="checkbox" 
              :checked="isAllSelected" 
              @change="toggleSelectAll" 
              class="h-4 w-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer" 
            />
            <span>Select All Visible ({{ filteredQuestions.length }})</span>
          </label>
          <span v-if="selectedQuestionIds.length > 0" class="text-slate-500 font-semibold">
            ({{ selectedQuestionIds.length }} selected)
          </span>
        </div>

        <div v-if="selectedQuestionIds.length > 0" class="flex items-center gap-2">
          <button @click="bulkUpdateStatus('Approved')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition shadow-2xs flex items-center gap-1.5 cursor-pointer">
            <CheckCircle :size="13"></CheckCircle> Bulk Approve
          </button>
          <button @click="bulkUpdateStatus('Disapproved')" class="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition shadow-2xs flex items-center gap-1.5 cursor-pointer">
            <XCircle :size="13"></XCircle> Bulk Disapprove
          </button>
          <button @click="bulkDeleteQuestions" class="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-lg transition shadow-2xs flex items-center gap-1.5 cursor-pointer">
            <Trash2 :size="13"></Trash2> Bulk Delete
          </button>
        </div>
      </div>

      <hr class="border-slate-200/80" />

      <!-- Questions List Empty State -->
      <div v-if="groupedQuestions.length === 0" class="text-center py-20 text-slate-400 text-xs font-normal">
        No questions found matching selected criteria.
      </div>

      <!-- Collapsible Course Groups Loop -->
      <div v-else class="space-y-4">
        <div 
          v-for="group in groupedQuestions" 
          :key="group.courseKey" 
          class="border border-slate-200/80 rounded-xl bg-slate-50/50 overflow-hidden shadow-2xs"
        >
          <!-- Collapsible Header -->
          <div 
            @click="toggleCourseCollapse(group.courseKey)"
            class="flex items-center justify-between p-4 bg-slate-100/80 hover:bg-slate-100 cursor-pointer select-none transition border-b border-slate-200/80"
          >
            <div class="flex items-center gap-3">
              <component :is="collapsedCourses[group.courseKey] ? ChevronRight : ChevronDown" :size="16" class="text-slate-600"></component>
              <div>
                <h3 class="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span class="bg-[#0b132b] text-white px-2.5 py-0.5 rounded text-[11px] font-mono tracking-wide">{{ group.code }}</span>
                  <span>{{ group.title }}</span>
                </h3>
              </div>
            </div>
            <span class="bg-slate-200/80 text-slate-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-slate-300/50">
              {{ group.questions.length }} {{ group.questions.length === 1 ? 'item' : 'items' }}
            </span>
          </div>

          <!-- Collapsible Group Content -->
          <div v-show="!collapsedCourses[group.courseKey]" class="p-4 space-y-4 bg-white">
            <div 
              v-for="(q, idx) in group.questions" 
              :key="q.id || idx" 
              class="border border-slate-200 rounded-xl p-4 bg-slate-50/40 hover:bg-white hover:shadow-sm transition space-y-3"
            >
              <!-- Checkbox, Badges & Controls -->
              <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-200/60 pb-2.5">
                <div class="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                  <input 
                    type="checkbox" 
                    :checked="selectedQuestionIds.includes(q.id)" 
                    @change="toggleQuestionSelection(q.id)" 
                    class="h-4 w-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer mr-1" 
                  />
                  <span class="bg-slate-800 text-white px-2 py-0.5 rounded">{{ q.program || 'Both' }}</span>
                  <span class="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{{ q.term || 'Midterm' }}</span>
                  <span class="bg-purple-100 text-purple-800 px-2 py-0.5 rounded">{{ q.courseId || 'Unassigned' }}</span>
                  <span v-if="q.courseOutcomeId" class="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">CO: {{ q.courseOutcomeId }}</span>
                  <span v-if="q.learningOutcomeId" class="bg-teal-100 text-teal-800 px-2 py-0.5 rounded">LO: {{ q.learningOutcomeId }}</span>
                  <span class="bg-amber-100 text-amber-900 px-2 py-0.5 rounded">Bloom's: {{ q.bloomLevel || 'Understanding' }}</span>
                  <span class="bg-slate-200 text-slate-700 px-2 py-0.5 rounded uppercase">{{ q.type }}</span>
                </div>

                <!-- Status & Action Buttons -->
                <div class="flex items-center gap-1.5">
                  <span :class="{
                    'bg-amber-100 text-amber-800 border-amber-300': (q.status || 'Pending') === 'Pending',
                    'bg-emerald-100 text-emerald-800 border-emerald-300': q.status === 'Approved',
                    'bg-red-100 text-red-800 border-red-300': q.status === 'Disapproved'
                  }" class="text-[11px] font-bold px-2.5 py-0.5 rounded-full border mr-1">
                    {{ q.status || 'Pending' }}
                  </span>

                  <!-- Approval/Disapproval & Edit Buttons (Hidden if Already Approved) -->
                  <template v-if="q.status !== 'Approved'">
                    <button @click="updateQuestionStatus(q.id, 'Approved')" title="Approve Question" class="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg border border-emerald-200 transition cursor-pointer">
                      <CheckCircle :size="15"></CheckCircle>
                    </button>

                    <button @click="updateQuestionStatus(q.id, 'Disapproved')" title="Disapprove Question" class="p-1.5 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white rounded-lg border border-red-200 transition cursor-pointer">
                      <XCircle :size="15"></XCircle>
                    </button>

                    <!-- Edit Button -->
                    <button @click="editQuestion(q)" title="Edit / Revise Item" class="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-lg border border-blue-200 transition cursor-pointer">
                      <Edit :size="15"></Edit>
                    </button>
                  </template>

                  <button @click="deleteQuestion(q.id)" title="Delete Item" class="p-1.5 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-lg transition cursor-pointer">
                    <Trash2 :size="15"></Trash2>
                  </button>
                </div>
              </div>

              <!-- Stem -->
              <div>
                <p class="text-xs font-semibold text-slate-800">{{ q.text }}</p>
                <img v-if="q.imageUrl" :src="q.imageUrl" class="mt-2 h-28 object-cover rounded-lg border shadow-2xs" />
              </div>

              <!-- Multiple Choice Options -->
              <div v-if="q.options && q.options.length > 0 && q.type === 'multiple_choice'" class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div v-for="(opt, oIdx) in q.options" :key="oIdx" class="p-2 rounded-lg border text-[11px] flex flex-col gap-1" :class="(Array.isArray(q.correctAnswer) && q.correctAnswer.includes(oIdx)) || q.correctAnswer === oIdx ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900' : 'bg-white text-slate-700'">
                  <div>
                    <span class="font-bold mr-1">{{ String.fromCharCode(65 + oIdx) }}.</span> {{ typeof opt === 'string' ? opt : opt.text }}
                  </div>
                  <img v-if="opt.imageUrl" :src="opt.imageUrl" class="h-16 w-16 object-cover rounded border" />
                </div>
              </div>

              <!-- Matching Type Pairs -->
              <div v-if="q.type === 'matching' && q.matchingPairs" class="space-y-2 text-xs">
                <div v-for="(pair, pIdx) in q.matchingPairs" :key="pIdx" class="p-2.5 rounded-lg border bg-white flex items-center justify-between text-[11px]">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-slate-500">{{ pIdx + 1 }}.</span>
                    <span>{{ pair.leftText }}</span>
                    <img v-if="pair.leftImageUrl" :src="pair.leftImageUrl" class="h-10 w-10 object-cover rounded border" />
                  </div>
                  <span class="font-bold text-slate-400">⟶</span>
                  <div class="flex items-center gap-2">
                    <span>{{ pair.rightText }}</span>
                    <img v-if="pair.rightImageUrl" :src="pair.rightImageUrl" class="h-10 w-10 object-cover rounded border" />
                  </div>
                </div>
              </div>

              <!-- AI Audit Bar -->
              <div
                class="p-3 rounded-xl text-xs border"
                :class="{
                  'bg-amber-50/80 border-amber-200 text-amber-900': generateAiSuggestion(q).type === 'warning',
                  'bg-blue-50/80 border-blue-200 text-blue-900': generateAiSuggestion(q).type === 'info',
                  'bg-emerald-50/50 border-emerald-200 text-emerald-900': generateAiSuggestion(q).type === 'success'
                }"
              >
                <div class="flex items-start gap-2">
                  <Sparkles :size="16" class="mt-0.5 shrink-0 text-amber-600"></Sparkles>

                  <div class="flex-1 min-w-0">
                    <span class="font-bold block text-[11px] mb-2">
                      AI Validation & Suggestion:
                    </span>

                    <div class="space-y-1.5 text-[11px] leading-relaxed">
                      <div>{{ generateAiSuggestion(q).bloom }}</div>
                      <div>{{ generateAiSuggestion(q).loAlignment }}</div>
                      <div>{{ generateAiSuggestion(q).coAlignment }}</div>
                      <div>{{ generateAiSuggestion(q).construction }}</div>
                      <div>{{ generateAiSuggestion(q).answer }}</div>

                      <div v-if="generateAiSuggestion(q).suggestions.length" class="pt-1.5">
                        <span class="font-semibold">💡 AI Suggestion:</span>
                        <span>{{ generateAiSuggestion(q).suggestions.slice(0, 2).join(' ') }}</span>
                      </div>

                      <div v-else class="pt-1.5">
                        <span class="font-semibold">💡 AI Suggestion:</span>
                        <span>No major revision is recommended based on the current validation.</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Latest AI Decision: choose refined version or retain original -->
                <div
                  v-if="generateAiSuggestion(q).type === 'warning' && q.status !== 'Approved'"
                  class="flex items-center gap-2 mt-3 ml-6"
                >
                  <button
                    @click="useAiRefinement(q)"
                    type="button"
                    class="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition shadow-2xs flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles :size="12"></Sparkles>
                    Use AI Refinement
                  </button>

                  <button
                    @click="retainOriginalSettings(q)"
                    type="button"
                    class="px-3 py-1 bg-slate-600 hover:bg-slate-700 text-white font-bold text-[10px] rounded-lg transition shadow-2xs flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw :size="12"></RotateCcw>
                    Retain Original
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: AUTHORING FORM -->
    <div v-show="activeTab === 'create'" class="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6 max-w-5xl mx-auto">
      
      <!-- 1. PROGRAM & CURRICULUM MAPPING -->
      <div>
        <h2 class="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">
          1. PROGRAM & CURRICULUM MAPPING
        </h2>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div>
            <label class="font-bold text-slate-700 block mb-1">Program</label>
            <select v-model="form.program" @change="handleProgramChange" class="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none">
              <option value="Both">Both (BSMT & BSMarE)</option>
              <option value="BSMT">BSMT</option>
              <option value="BSMarE">BSMarE</option>
            </select>
          </div>

          <div>
            <label class="font-bold text-slate-700 block mb-1">Academic Term</label>
            <select v-model="form.term" class="w-full p-2.5 border border-slate-300 rounded-xl bg-emerald-50/60 font-medium text-emerald-900 focus:ring-2 focus:ring-emerald-500 outline-none">
              <option value="Midterm">Midterm</option>
              <option value="Final">Final</option>
            </select>
          </div>

          <div>
            <label class="font-bold text-slate-700 block mb-1">Course / Subject</label>
            <select v-model="form.courseId" @change="handleCourseChange" class="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none">
              <option value="" disabled>Select Subject...</option>
              <option v-for="c in filteredCourses" :key="c.id" :value="c.code || c.id">
                {{ c.code }} — {{ c.title }}
              </option>
            </select>
          </div>

          <div>
            <label class="font-bold text-slate-700 block mb-1">Course Outcome (CO)</label>
            <select v-model="form.courseOutcomeId" @change="handleCourseOutcomeChange" class="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none">
              <option value="">Select CO...</option>
              <option v-for="co in availableCourseOutcomes" :key="co.id || co.code" :value="co.id || co.code">
                {{ co.code }}: {{ co.description || co.title }}
              </option>
            </select>
          </div>

          <div>
            <label class="font-bold text-slate-700 block mb-1">Learning Outcome (LO)</label>
            <select v-model="form.learningOutcomeId" class="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none">
              <option value="">Select LO...</option>
              <option v-for="lo in availableLearningOutcomes" :key="lo.id || lo.code" :value="lo.id || lo.code">
                {{ lo.code }}: {{ lo.description || lo.title }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- 2. ITEM CLASSIFICATION -->
      <div>
        <h2 class="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">
          2. ITEM CLASSIFICATION
        </h2>

        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label class="font-bold text-slate-700 block mb-1">Bloom's Taxonomy</label>
              <select v-model="form.bloomLevel" class="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none">
                <option value="Remembering">Remembering</option>
                <option value="Understanding">Understanding</option>
                <option value="Application">Application</option>
                <option value="Analysis">Analysis</option>
                <option value="Evaluation">Evaluation</option>
              </select>
            </div>

            <div>
              <label class="font-bold text-slate-700 block mb-1">Question Type</label>
              <select v-model="form.type" class="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none">
                <option value="multiple_choice">Multiple Choice</option>
                <option value="matching">Matching Type</option>
                <option value="true_false">True / False</option>
                <option value="short_answer">Short Answer</option>
              </select>
            </div>
          </div>

          <!-- Question Stem Input -->
          <div>
            <label class="font-bold text-xs text-slate-700 block mb-1">Question Stem</label>
            <textarea 
              v-model="form.text" 
              rows="3" 
              placeholder="Enter question statement..." 
              class="w-full p-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
            ></textarea>
          </div>

          <!-- Question Image Picker Box -->
          <div class="border border-dashed border-slate-300 rounded-xl p-3 text-xs bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span class="font-bold text-slate-700 block">Question Image (Optional)</span>
              <input type="file" accept="image/*" @change="e => handleImageUpload(e, form, 'imageUrl')" class="text-xs mt-1 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer" />
            </div>
            <div v-if="form.imageUrl" class="relative shrink-0">
              <img :src="form.imageUrl" class="h-16 w-16 object-cover rounded-lg border shadow-2xs" />
              <button @click="removeImage(form, 'imageUrl')" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-2xs">
                <X :size="10"></X>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. OPTIONS & CORRECT ANSWERS -->
      <div>
        <h2 class="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">
          3. OPTIONS & CORRECT ANSWERS
        </h2>

        <!-- MULTIPLE CHOICE OPTIONS -->
        <div v-if="form.type === 'multiple_choice'" class="space-y-3 border border-slate-200 p-4 rounded-xl bg-slate-50/30">
          <div class="flex justify-between items-center mb-1">
            <span class="text-xs font-bold text-slate-700">Options & Correct Answer(s) (Check all that apply)</span>
            <button @click="addOption" type="button" class="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer">
              <Plus :size="14"></Plus> Add Option
            </button>
          </div>

          <div v-for="(opt, idx) in form.options" :key="idx" class="flex flex-col sm:flex-row sm:items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <div class="flex items-center gap-3 flex-1">
              <input type="checkbox" v-model="opt.isCorrect" title="Mark as correct answer" class="h-4 w-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 shrink-0 cursor-pointer" />
              <input v-model="opt.text" :placeholder="`Option ${idx + 1} text...`" class="flex-1 p-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500" />
            </div>

            <div class="flex items-center gap-2 self-end sm:self-auto">
              <label class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300/80 cursor-pointer flex items-center gap-1.5 transition">
                <Image :size="14" class="text-slate-500"></Image>
                <span>Image</span>
                <input type="file" accept="image/*" @change="e => handleImageUpload(e, opt, 'imageUrl')" class="hidden" />
              </label>

              <div v-if="opt.imageUrl" class="relative">
                <img :src="opt.imageUrl" class="h-8 w-8 object-cover rounded border" />
                <button @click="removeImage(opt, 'imageUrl')" class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600">
                  <X :size="8"></X>
                </button>
              </div>

              <button v-if="form.options.length > 2" @click="removeOption(idx)" title="Remove option" class="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer">
                <Trash2 :size="16"></Trash2>
              </button>
            </div>
          </div>
        </div>

        <!-- MATCHING TYPE PAIRS -->
        <div v-if="form.type === 'matching'" class="space-y-3 border border-slate-200 p-4 rounded-xl bg-slate-50/30">
          <div class="flex justify-between items-center mb-1">
            <span class="text-xs font-bold text-slate-700">Matching Pairs (Item ⟶ Correct Match)</span>
            <button @click="addMatchingPair" type="button" class="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer">
              <Plus :size="14"></Plus> Add Matching Pair
            </button>
          </div>

          <div v-for="(pair, idx) in form.matchingPairs" :key="idx" class="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-xs text-slate-600">Pair #{{ idx + 1 }}</span>
              <button v-if="form.matchingPairs.length > 2" @click="removeMatchingPair(idx)" title="Remove Pair" class="text-red-500 hover:bg-red-50 p-1 rounded cursor-pointer">
                <Trash2 :size="14"></Trash2>
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div class="space-y-2 border p-2.5 rounded-lg bg-slate-50/50">
                <span class="font-bold text-[11px] text-slate-500">Premise Item / Question</span>
                <input v-model="pair.leftText" placeholder="Left item text..." class="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none bg-white" />
                
                <div class="flex items-center justify-between">
                  <label class="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold rounded border cursor-pointer flex items-center gap-1">
                    <Image :size="12"></Image> Image
                    <input type="file" accept="image/*" @change="e => handleImageUpload(e, pair, 'leftImageUrl')" class="hidden" />
                  </label>
                  <div v-if="pair.leftImageUrl" class="relative">
                    <img :src="pair.leftImageUrl" class="h-8 w-8 object-cover rounded border" />
                    <button @click="removeImage(pair, 'leftImageUrl')" class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5">
                      <X :size="8"></X>
                    </button>
                  </div>
                </div>
              </div>

              <div class="space-y-2 border p-2.5 rounded-lg bg-slate-50/50">
                <span class="font-bold text-[11px] text-slate-500">Matching Target / Answer</span>
                <input v-model="pair.rightText" placeholder="Right matching text..." class="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none bg-white" />
                
                <div class="flex items-center justify-between">
                  <label class="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold rounded border cursor-pointer flex items-center gap-1">
                    <Image :size="12"></Image> Image
                    <input type="file" accept="image/*" @change="e => handleImageUpload(e, pair, 'rightImageUrl')" class="hidden" />
                  </label>
                  <div v-if="pair.rightImageUrl" class="relative">
                    <img :src="pair.rightImageUrl" class="h-8 w-8 object-cover rounded border" />
                    <button @click="removeImage(pair, 'rightImageUrl')" class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5">
                      <X :size="8"></X>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- TRUE / FALSE -->
        <div v-if="form.type === 'true_false'" class="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label class="font-bold text-xs text-slate-700 block">Select Correct Answer</label>
          <div class="flex gap-6 text-xs font-bold text-slate-800">
            <label class="flex items-center gap-2 cursor-pointer bg-white px-4 py-2.5 rounded-xl border border-slate-300 hover:border-emerald-500">
              <input type="radio" value="true" v-model="form.tfCorrect" name="tf_answer" class="text-emerald-600" /> True
            </label>
            <label class="flex items-center gap-2 cursor-pointer bg-white px-4 py-2.5 rounded-xl border border-slate-300 hover:border-emerald-500">
              <input type="radio" value="false" v-model="form.tfCorrect" name="tf_answer" class="text-emerald-600" /> False
            </label>
          </div>
        </div>

        <!-- SHORT ANSWER -->
        <div v-if="form.type === 'short_answer'" class="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label class="font-bold text-xs text-slate-700 block">Expected Answer Keywords (Comma Separated)</label>
          <input v-model="form.shortAnswerKeywords" placeholder="e.g. ECDIS, navigation, chart" class="w-full p-2.5 border border-slate-300 rounded-xl text-xs bg-white outline-none focus:ring-1 focus:ring-emerald-500" />
        </div>
      </div>

      <!-- Save Button Block -->
      <div class="pt-4">
        <button 
          @click="saveQuestion" 
          :disabled="isSubmitting" 
          class="w-full py-3.5 bg-[#00c068] hover:bg-[#00a358] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Save :size="16"></Save> 
          <span>{{ isSubmitting ? 'Saving...' : 'Save Question Item' }}</span>
        </button>
      </div>

    </div>

    <!-- TAB 3: COURSE REPORTS & AUDITS -->
    <div v-show="activeTab === 'report'" class="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-6">
      <div class="flex flex-col md:flex-row justify-between md:items-center border-b pb-4 gap-4">
        <div>
          <h2 class="text-base font-bold text-slate-900 flex items-center gap-2 tracking-tight">
            <BarChart2 class="text-emerald-600" :size="20"></BarChart2> Course Question Changes & Audit Report
          </h2>
          <p class="text-xs text-slate-500">View question counts, approval status, accepted AI suggestions, and AI overrides grouped per course.</p>
        </div>

        <button @click="exportCourseReportCSV" type="button" class="px-4 py-2 bg-[#00c068] hover:bg-[#00a358] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition shadow-2xs cursor-pointer">
          <Download :size="14"></Download> Export Report CSV
        </button>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <div class="bg-slate-50 border p-3 rounded-xl">
          <span class="text-[10px] font-bold text-slate-500 block uppercase">Total Questions</span>
          <span class="text-lg font-extrabold text-slate-900">{{ overallReportSummary.total }}</span>
        </div>
        <div class="bg-emerald-50 border border-emerald-100 p-3 rounded-xl">
          <span class="text-[10px] font-bold text-emerald-700 block uppercase">Approved</span>
          <span class="text-lg font-extrabold text-emerald-800">{{ overallReportSummary.approved }}</span>
        </div>
        <div class="bg-amber-50 border border-amber-100 p-3 rounded-xl">
          <span class="text-[10px] font-bold text-amber-700 block uppercase">Pending Review</span>
          <span class="text-lg font-extrabold text-amber-800">{{ overallReportSummary.pending }}</span>
        </div>
        <div class="bg-red-50 border border-red-100 p-3 rounded-xl">
          <span class="text-[10px] font-bold text-red-700 block uppercase">Disapproved</span>
          <span class="text-lg font-extrabold text-red-800">{{ overallReportSummary.disapproved }}</span>
        </div>
        <div class="bg-teal-50 border border-teal-100 p-3 rounded-xl">
          <span class="text-[10px] font-bold text-teal-700 block uppercase">AI Accepted</span>
          <span class="text-lg font-extrabold text-teal-800">{{ overallReportSummary.acceptedAi }}</span>
        </div>
        <div class="bg-blue-50 border border-blue-100 p-3 rounded-xl">
          <span class="text-[10px] font-bold text-blue-700 block uppercase">AI Retained</span>
          <span class="text-lg font-extrabold text-blue-800">{{ overallReportSummary.retainedAi }}</span>
        </div>
      </div>

      <div class="overflow-x-auto border rounded-xl">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-100 text-slate-700 uppercase font-bold border-b">
            <tr>
              <th class="p-3">Course Code</th>
              <th class="p-3">Course Title</th>
              <th class="p-3">Program</th>
              <th class="p-3 text-center">Total Items</th>
              <th class="p-3 text-center">Approved</th>
              <th class="p-3 text-center">Pending</th>
              <th class="p-3 text-center">Disapproved</th>
              <th class="p-3 text-center">AI Accepted</th>
              <th class="p-3 text-center">AI Overrides</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium text-slate-800">
            <tr v-for="report in courseReports" :key="report.code" class="hover:bg-slate-50/80">
              <td class="p-3 font-mono font-bold text-slate-900">{{ report.code }}</td>
              <td class="p-3 font-bold">{{ report.title }}</td>
              <td class="p-3"><span class="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold">{{ report.program }}</span></td>
              <td class="p-3 text-center font-bold">{{ report.total }}</td>
              <td class="p-3 text-center">
                <span class="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold text-[11px]">{{ report.approved }}</span>
              </td>
              <td class="p-3 text-center">
                <span class="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold text-[11px]">{{ report.pending }}</span>
              </td>
              <td class="p-3 text-center">
                <span class="bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold text-[11px]">{{ report.disapproved }}</span>
              </td>
              <td class="p-3 text-center">
                <span class="bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-bold text-[11px]">{{ report.acceptedAi }}</span>
              </td>
              <td class="p-3 text-center">
                <span class="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold text-[11px]">{{ report.retainedAi }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- EDIT QUESTION MODAL -->
    <div v-if="editingQuestion" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div class="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <Edit class="text-blue-600" :size="18"></Edit> Edit / Revise Question Item
          </h3>
          <button @click="closeEditModal" class="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
            <X :size="18"></X>
          </button>
        </div>

        <div class="space-y-4 text-xs">
          <!-- Mapping Metadata -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="font-bold text-slate-700 block mb-1">Program</label>
              <select v-model="editingQuestion.program" class="w-full p-2 border rounded-lg bg-white">
                <option value="Both">Both</option>
                <option value="BSMT">BSMT</option>
                <option value="BSMarE">BSMarE</option>
              </select>
            </div>
            <div>
              <label class="font-bold text-slate-700 block mb-1">Term</label>
              <select v-model="editingQuestion.term" class="w-full p-2 border rounded-lg bg-white">
                <option value="Midterm">Midterm</option>
                <option value="Final">Final</option>
              </select>
            </div>
            <div>
              <label class="font-bold text-slate-700 block mb-1">Course Code</label>
              <input v-model="editingQuestion.courseId" class="w-full p-2 border rounded-lg bg-white" placeholder="e.g. CRS-101" />
            </div>
            <div>
              <label class="font-bold text-slate-700 block mb-1">Course Outcome (CO)</label>
              <input v-model="editingQuestion.courseOutcomeId" class="w-full p-2 border rounded-lg bg-white" placeholder="e.g. CO1" />
            </div>
            <div>
              <label class="font-bold text-slate-700 block mb-1">Learning Outcome (LO)</label>
              <input v-model="editingQuestion.learningOutcomeId" class="w-full p-2 border rounded-lg bg-white" placeholder="e.g. LO1.1" />
            </div>
            <div>
              <label class="font-bold text-slate-700 block mb-1">Bloom's Level</label>
              <select v-model="editingQuestion.bloomLevel" class="w-full p-2 border rounded-lg bg-white">
                <option value="Remembering">Remembering</option>
                <option value="Understanding">Understanding</option>
                <option value="Application">Application</option>
                <option value="Analysis">Analysis</option>
                <option value="Evaluation">Evaluation</option>
              </select>
            </div>
          </div>

          <!-- Question Stem Text -->
          <div>
            <label class="font-bold text-slate-700 block mb-1">Question Stem</label>
            <textarea v-model="editingQuestion.text" rows="3" class="w-full p-2.5 border rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"></textarea>
          </div>

          <!-- Question Image Upload / Preview -->
          <div class="border border-dashed p-3 rounded-xl bg-slate-50/80 flex items-center justify-between">
            <div>
              <span class="font-bold text-slate-700 block">Stem Image</span>
              <input type="file" accept="image/*" @change="e => handleImageUpload(e, editingQuestion, 'imageUrl')" class="text-xs mt-1 cursor-pointer" />
            </div>
            <div v-if="editingQuestion.imageUrl" class="relative">
              <img :src="editingQuestion.imageUrl" class="h-14 w-14 object-cover rounded border" />
              <button @click="removeImage(editingQuestion, 'imageUrl')" class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 cursor-pointer">
                <X :size="10"></X>
              </button>
            </div>
          </div>

          <!-- Edit Multiple Choice Options -->
          <div v-if="editingQuestion.type === 'multiple_choice'" class="space-y-3 border p-3 rounded-xl bg-slate-50/50">
            <div class="flex justify-between items-center">
              <span class="font-bold text-slate-700">Multiple Choice Options</span>
              <button @click="editingQuestion.options.push({ text: '', imageUrl: '' })" type="button" class="text-emerald-600 font-bold text-xs flex items-center gap-1 cursor-pointer">
                <Plus :size="12"></Plus> Add Option
              </button>
            </div>

            <div v-for="(opt, oIdx) in editingQuestion.options" :key="oIdx" class="p-2.5 bg-white border rounded-lg space-y-2 shadow-2xs">
              <div class="flex items-center gap-2">
                <input type="checkbox" :checked="Array.isArray(editingQuestion.correctAnswer) ? editingQuestion.correctAnswer.includes(oIdx) : editingQuestion.correctAnswer === oIdx" @change="toggleEditCorrectOption(oIdx)" class="h-4 w-4 text-emerald-600 rounded cursor-pointer" />
                <input v-model="opt.text" class="flex-1 p-1.5 border rounded text-xs outline-none" :placeholder="`Option ${oIdx + 1} text...`" />
                <button v-if="editingQuestion.options.length > 2" @click="editingQuestion.options.splice(oIdx, 1)" class="text-red-500 p-1 cursor-pointer">
                  <Trash2 :size="14"></Trash2>
                </button>
              </div>

              <div class="flex items-center justify-between pt-1 border-t border-slate-100">
                <label class="px-2 py-1 bg-slate-100 text-slate-700 text-[11px] font-semibold rounded cursor-pointer flex items-center gap-1">
                  <Image :size="12"></Image> {{ opt.imageUrl ? 'Change Image' : 'Add Image' }}
                  <input type="file" accept="image/*" @change="e => handleImageUpload(e, opt, 'imageUrl')" class="hidden" />
                </label>
                <div v-if="opt.imageUrl" class="relative">
                  <img :src="opt.imageUrl" class="h-8 w-8 object-cover rounded border" />
                  <button @click="removeImage(opt, 'imageUrl')" class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 cursor-pointer">
                    <X :size="8"></X>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Edit Matching Type Pairs -->
          <div v-if="editingQuestion.type === 'matching'" class="space-y-3 border p-3 rounded-xl bg-slate-50/50">
            <div class="flex justify-between items-center">
              <span class="font-bold text-slate-700">Matching Type Pairs</span>
              <button @click="editingQuestion.matchingPairs.push({ leftText: '', leftImageUrl: '', rightText: '', rightImageUrl: '' })" type="button" class="text-emerald-600 font-bold text-xs flex items-center gap-1 cursor-pointer">
                <Plus :size="12"></Plus> Add Pair
              </button>
            </div>

            <div v-for="(pair, pIdx) in editingQuestion.matchingPairs" :key="pIdx" class="p-2.5 bg-white border rounded-lg space-y-2 shadow-2xs">
              <div class="flex items-center justify-between">
                <span class="font-bold text-slate-500">Pair #{{ pIdx + 1 }}</span>
                <button v-if="editingQuestion.matchingPairs.length > 2" @click="editingQuestion.matchingPairs.splice(pIdx, 1)" class="text-red-500 p-1 cursor-pointer">
                  <Trash2 :size="14"></Trash2>
                </button>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <!-- Left side -->
                <div class="space-y-1 border p-2 rounded bg-slate-50/50">
                  <span class="font-semibold text-[10px] text-slate-500">Left Item</span>
                  <input v-model="pair.leftText" class="w-full p-1.5 border rounded text-xs bg-white outline-none" />
                  <div class="flex items-center justify-between pt-1">
                    <label class="px-2 py-0.5 bg-white border text-[10px] font-semibold rounded cursor-pointer flex items-center gap-1">
                      <Image :size="10"></Image> Image
                      <input type="file" accept="image/*" @change="e => handleImageUpload(e, pair, 'leftImageUrl')" class="hidden" />
                    </label>
                    <div v-if="pair.leftImageUrl" class="relative">
                      <img :src="pair.leftImageUrl" class="h-6 w-6 object-cover rounded border" />
                      <button @click="removeImage(pair, 'leftImageUrl')" class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 cursor-pointer">
                        <X :size="6"></X>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Right side -->
                <div class="space-y-1 border p-2 rounded bg-slate-50/50">
                  <span class="font-semibold text-[10px] text-slate-500">Right Target</span>
                  <input v-model="pair.rightText" class="w-full p-1.5 border rounded text-xs bg-white outline-none" />
                  <div class="flex items-center justify-between pt-1">
                    <label class="px-2 py-0.5 bg-white border text-[10px] font-semibold rounded cursor-pointer flex items-center gap-1">
                      <Image :size="10"></Image> Image
                      <input type="file" accept="image/*" @change="e => handleImageUpload(e, pair, 'rightImageUrl')" class="hidden" />
                    </label>
                    <div v-if="pair.rightImageUrl" class="relative">
                      <img :src="pair.rightImageUrl" class="h-6 w-6 object-cover rounded border" />
                      <button @click="removeImage(pair, 'rightImageUrl')" class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 cursor-pointer">
                        <X :size="6"></X>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-3 border-t">
          <button @click="closeEditModal" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer">
            Cancel
          </button>
          <button @click="saveEditedQuestion" class="px-4 py-2 bg-[#00c068] hover:bg-[#00a358] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs">
            <Save :size="14"></Save> Save Changes
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

import {
  Plus,
  Trash2,
  X,
  Upload,
  Download,
  Image,
  CheckCircle,
  XCircle,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Check,
  Database,
  PlusCircle,
  BarChart2,
  Save,
  FileText,
  RotateCcw,
  Edit
} from 'lucide-vue-next'


// ============================================================
// API / STORAGE
// ============================================================

const API_BASE_URL = 'http://127.0.0.1:8000/api'

const STORAGE_COURSES_KEY = 'cams_courses_data'
const STORAGE_QUESTIONS_KEY = 'cams_questions_data'


// ============================================================
// REACTIVE DATA
// ============================================================

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
const sortBy = ref('default')
const searchQuery = ref('')

const selectedQuestionIds = ref([])
const editingQuestion = ref(null)


// ============================================================
// QUESTION FORM
// ============================================================

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
    {
      text: '',
      imageUrl: '',
      isCorrect: false
    },
    {
      text: '',
      imageUrl: '',
      isCorrect: false
    },
    {
      text: '',
      imageUrl: '',
      isCorrect: false
    },
    {
      text: '',
      imageUrl: '',
      isCorrect: false
    }
  ],

  matchingPairs: [
    {
      leftText: '',
      leftImageUrl: '',
      rightText: '',
      rightImageUrl: ''
    },
    {
      leftText: '',
      leftImageUrl: '',
      rightText: '',
      rightImageUrl: ''
    }
  ],

  tfCorrect: 'true',

  shortAnswerKeywords: ''
})


// ============================================================
// API HELPERS
// ============================================================

async function getApiError(response) {
  let data = {}

  try {
    data = await response.json()
  } catch (_) {}

  if (response.status === 401) {
    return new Error(
      'Your session has expired. Please log in again.'
    )
  }

  if (response.status === 422 && data.duplicate) {
    const error = new Error(
      data.message || 'Duplicate question detected.'
    )

    error.status = 422
    error.duplicate = true
    error.existingQuestion =
      data.existing_question || null

    return error
  }

  if (response.status === 422 && data.errors) {
    const firstError =
      Object.values(data.errors).flat()[0]

    return new Error(
      firstError ||
      data.message ||
      'Please check the submitted information.'
    )
  }

  return new Error(
    data.message ||
    `Request failed. HTTP ${response.status}`
  )
}


function getAuthHeaders(includeJson = false) {
  const token = localStorage.getItem('token')

  if (!token) {
    throw new Error(
      'No authentication token found. Please log in again.'
    )
  }

  return {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,

    ...(includeJson
      ? {
          'Content-Type': 'application/json'
        }
      : {})
  }
}


// ============================================================
// FORM RESET
// ============================================================

function resetForm() {
  form.program = 'Both'
  form.term = 'Midterm'

  form.courseId = ''
  form.courseOutcomeId = ''
  form.learningOutcomeId = ''

  form.bloomLevel = 'Understanding'
  form.type = 'multiple_choice'

  form.text = ''
  form.imageUrl = ''

  form.options = [
    {
      text: '',
      imageUrl: '',
      isCorrect: false
    },
    {
      text: '',
      imageUrl: '',
      isCorrect: false
    },
    {
      text: '',
      imageUrl: '',
      isCorrect: false
    },
    {
      text: '',
      imageUrl: '',
      isCorrect: false
    }
  ]

  form.matchingPairs = [
    {
      leftText: '',
      leftImageUrl: '',
      rightText: '',
      rightImageUrl: ''
    },
    {
      leftText: '',
      leftImageUrl: '',
      rightText: '',
      rightImageUrl: ''
    }
  ]

  form.tfCorrect = 'true'
  form.shortAnswerKeywords = ''
}


// ============================================================
// COURSE COMPUTED PROPERTIES
// ============================================================

const filteredCourses = computed(() => {
  let result = [...courses.value]

  if (filterProgram.value !== 'All') {
    result = result.filter(course =>
      course.program === filterProgram.value ||
      course.program === 'Both'
    )
  }

  return result
})


const availableCourseOutcomes = computed(() => {
  const selectedCourse = courses.value.find(
    course =>
      String(course.id) === String(form.courseId) ||
      String(course.code) === String(form.courseId)
  )

  return selectedCourse?.courseOutcomes || []
})


const availableLearningOutcomes = computed(() => {
  const selectedCO =
    availableCourseOutcomes.value.find(
      co =>
        String(co.id || co.code) ===
        String(form.courseOutcomeId)
    )

  return selectedCO?.learningOutcomes || []
})


// ============================================================
// QUESTION FILTERING
// ============================================================

const filteredQuestions = computed(() => {
  let result = [...questions.value]

  if (filterStatus.value !== 'All') {
    result = result.filter(
      question =>
        question.status === filterStatus.value
    )
  }

  if (filterProgram.value !== 'All') {
    result = result.filter(
      question =>
        question.program === filterProgram.value ||
        question.program === 'Both'
    )
  }

  if (filterType.value !== 'All') {
    result = result.filter(
      question =>
        question.type === filterType.value
    )
  }

  const search = searchQuery.value
    .trim()
    .toLowerCase()

  if (search) {
    result = result.filter(question => {
      const searchable = [
        question.code,
        question.text,
        question.courseId,
        question.courseOutcomeId,
        question.learningOutcomeId,
        question.bloomLevel
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return searchable.includes(search)
    })
  }

  if (sortBy.value === 'code') {
    result.sort((a, b) =>
      String(a.code || '').localeCompare(
        String(b.code || '')
      )
    )
  }

  if (sortBy.value === 'newest') {
    result.sort((a, b) =>
      new Date(b.created_at || 0) -
      new Date(a.created_at || 0)
    )
  }

  if (sortBy.value === 'oldest') {
    result.sort((a, b) =>
      new Date(a.created_at || 0) -
      new Date(b.created_at || 0)
    )
  }

  return result
})


// ============================================================
// SELECTION
// ============================================================

const isAllSelected = computed(() => {
  if (!filteredQuestions.value.length) {
    return false
  }

  return filteredQuestions.value.every(
    question =>
      selectedQuestionIds.value.includes(
        question.id
      )
  )
})


function toggleQuestionSelection(id) {
function toggleSelectQuestion(id) {
  toggleQuestionSelection(id)
}

function onProgramChange() {
  handleProgramChange()
}

function onCourseChange() {
  handleCourseChange()
}

function onCOChange() {
  handleCourseOutcomeChange()
}

function handleFileUpload(event, targetObj, propertyName) {
  handleImageUpload(event, targetObj, propertyName)
}

function openEditModal(question) {
  editQuestion(question)
}

function exportCourseReportCSV() {
  const firstReport = courseReports.value[0]

  if (!firstReport) {
    alert('There are no course reports to export.')
    return
  }

  const rows = [
    [
      'Course Code',
      'Course Title',
      'Program',
      'Total Items',
      'Approved',
      'Pending',
      'Disapproved',
      'AI Accepted',
      'AI Overrides'
    ]
  ]

  courseReports.value.forEach(report => {
    rows.push([
      report.code || '',
      report.title || '',
      report.program || '',
      report.total || 0,
      report.approved || 0,
      report.pending || 0,
      report.disapproved || 0,
      report.acceptedAi || 0,
      report.retainedAi || 0
    ])
  })

  const csv = rows
    .map(row =>
      row
        .map(value =>
          `"${String(value).replace(/"/g, '""')}"`
        )
        .join(',')
    )
    .join('\n')

  const blob = new Blob(
    [csv],
    { type: 'text/csv;charset=utf-8;' }
  )

  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'CAMS_Course_Question_Report.csv'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(link.href)
}

function toggleEditCorrectOption(index) {
  if (!editingQuestion.value) {
    return
  }

  const current =
    Array.isArray(editingQuestion.value.correctAnswer)
      ? [...editingQuestion.value.correctAnswer]
      : []

  const position =
    current.indexOf(index)

  if (position >= 0) {
    current.splice(position, 1)
  } else {
    current.push(index)
  }

  editingQuestion.value.correctAnswer = current.sort(
    (a, b) => a - b
  )
}

  if (
    selectedQuestionIds.value.includes(id)
  ) {
    selectedQuestionIds.value =
      selectedQuestionIds.value.filter(
        selectedId => selectedId !== id
      )
  } else {
    selectedQuestionIds.value.push(id)
  }
}


function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedQuestionIds.value = []
    return
  }

  selectedQuestionIds.value =
    filteredQuestions.value.map(
      question => question.id
    )
}


// ============================================================
// LOCAL STORAGE
// ============================================================

function syncQuestionsStorage() {
  localStorage.setItem(
    STORAGE_QUESTIONS_KEY,
    JSON.stringify(questions.value)
  )
}


function syncCoursesStorage() {
  localStorage.setItem(
    STORAGE_COURSES_KEY,
    JSON.stringify(courses.value)
  )
}


// ============================================================
// NORMALIZATION
// ============================================================

function parseCorrectAnswer(value) {
  if (Array.isArray(value)) {
    return value
  }

  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return null
  }

  try {
    return JSON.parse(value)
  } catch (e) {
    return value
  }
}


function normalizeCourse(course) {
  return {
    ...course,
    courseOutcomes:
      course.course_outcomes || []
  }
}

function normalizeQuestion(question) {
  const course = courses.value.find(
    course =>
      String(course.id) ===
      String(question.course_id)
  )

  let matchingPairs =
    question.matching_pairs

  if (
    typeof matchingPairs === 'string'
  ) {
    matchingPairs =
      parseCorrectAnswer(
        matchingPairs
      )
  }

  if (!Array.isArray(matchingPairs)) {
    matchingPairs = []
  }

  let options = question.options

  if (typeof options === 'string') {
    options = parseCorrectAnswer(options)
  }

  if (!Array.isArray(options)) {
    options = []
  }

  return {
    ...question,

    id:
      question.id,

    courseId:
      course?.code ||
      question.course_id ||
      '',

    courseDbId:
      question.course_id || null,

    courseOutcomeId:
      question.course_outcome_id || '',

    learningOutcomeId:
      question.learning_outcome_id || '',

    imageUrl:
      question.image_url || '',

    options,

    correctAnswer:
      parseCorrectAnswer(
        question.correct_answer
      ),

    matchingPairs,

    bloomLevel:
      question.bloom_level ||
      'Understanding',

    stcwStandard:
      question.stcw_standard || '',

    aiAccepted:
      Boolean(question.ai_accepted),

    retainedAi:
      Boolean(question.retained_ai),

    status:
      question.status || 'Pending'
  }
}

// ============================================================
// COURSE RESOLUTION
// ============================================================

function resolveCourseId(courseValue) {
  const course = courses.value.find(
    course =>
      String(course.id) ===
        String(courseValue) ||
      String(course.code) ===
        String(courseValue)
  )

  return course?.id || null
}


function getQuestionCourse(q) {
  return courses.value.find(course =>
    String(course.id) ===
      String(q.courseDbId || q.course_id) ||
    String(course.code) ===
      String(q.courseId)
  )
}


function getQuestionCO(q) {
  const course = getQuestionCourse(q)

  if (!course) {
    return null
  }

  const outcomes =
    course.courseOutcomes ||
    course.course_outcomes ||
    []

  return outcomes.find(co =>
    String(co.id || co.code) ===
    String(
      q.courseOutcomeId ||
      q.course_outcome_id
    )
  ) || null
}


function getQuestionLO(q) {
  const co = getQuestionCO(q)

  if (!co) {
    return null
  }

  const learningOutcomes =
    co.learningOutcomes ||
    co.learning_outcomes ||
    []

  return learningOutcomes.find(lo =>
    String(lo.id || lo.code) ===
    String(
      q.learningOutcomeId ||
      q.learning_outcome_id
    )
  ) || null
}


// ============================================================
// COURSE / FORM HANDLERS
// ============================================================

function handleProgramChange() {
  form.courseId = ''
  form.courseOutcomeId = ''
  form.learningOutcomeId = ''
}


function handleCourseChange() {
  form.courseOutcomeId = ''
  form.learningOutcomeId = ''
}


function handleCourseOutcomeChange() {
  form.learningOutcomeId = ''
}


// ============================================================
// OPTIONS
// ============================================================

function addOption() {
  form.options.push({
    text: '',
    imageUrl: '',
    isCorrect: false
  })
}


function removeOption(index) {
  if (form.options.length <= 2) {
    alert(
      'A multiple-choice question must have at least two choices.'
    )
    return
  }

  form.options.splice(index, 1)
}


// ============================================================
// MATCHING PAIRS
// ============================================================

function addMatchingPair() {
  form.matchingPairs.push({
    leftText: '',
    leftImageUrl: '',
    rightText: '',
    rightImageUrl: ''
  })
}


function removeMatchingPair(index) {
  if (form.matchingPairs.length <= 2) {
    alert(
      'A matching question must have at least two pairs.'
    )
    return
  }

  form.matchingPairs.splice(index, 1)
}


// ============================================================
// IMAGE HANDLING
// ============================================================

function handleImageUpload(event, targetObj, propertyName) {
  const file = event.target.files?.[0]

  if (!file) {
    return
  }

  if (!file.type.startsWith('image/')) {
    alert('Please select a valid image file.')
    event.target.value = ''
    return
  }

  const reader = new FileReader()

  reader.onload = () => {
    targetObj[propertyName] =
      reader.result
  }

  reader.readAsDataURL(file)

  event.target.value = ''
}


function removeImage(targetObj, propertyName) {
  if (
    confirm(
      'Are you sure you want to remove this image?'
    )
  ) {
    targetObj[propertyName] = ''
  }
}


// ============================================================
// QUESTION CODE
// ============================================================

function generateQuestionCode() {
  return `Q-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase()}`
}


// ============================================================
// SAVE NEW QUESTION
// ============================================================

async function saveQuestion() {
  if (
    !form.courseId ||
    !form.text.trim()
  ) {
    alert(
      'Please select a Course / Subject and enter Question Stem.'
    )
    return
  }

  if (
    !confirm(
      'Are you sure you want to save this new assessment question?'
    )
  ) {
    return
  }

  const numericCourseId =
    resolveCourseId(form.courseId)

  if (!numericCourseId) {
    alert(
      'The selected course could not be matched to the Laravel course record.'
    )
    return
  }

  let formattedOptions = null
  let formattedCorrectAnswer = null
  let formattedMatchingPairs = null

  // ----------------------------------------------------------
  // MULTIPLE CHOICE
  // ----------------------------------------------------------

  if (form.type === 'multiple_choice') {
    formattedOptions =
      form.options.map(option => ({
        text: option.text,
        imageUrl:
          option.imageUrl || null
      }))

    formattedCorrectAnswer =
      form.options
        .map((option, index) =>
          option.isCorrect
            ? index
            : null
        )
        .filter(
          value => value !== null
        )

    if (
      formattedCorrectAnswer.length === 0
    ) {
      alert(
        'Please check at least one correct option.'
      )
      return
    }
  }

  // ----------------------------------------------------------
  // TRUE / FALSE
  // ----------------------------------------------------------

  else if (
    form.type === 'true_false'
  ) {
    formattedOptions = [
      'True',
      'False'
    ]

    formattedCorrectAnswer =
      form.tfCorrect === 'true'
        ? [0]
        : [1]
  }

  // ----------------------------------------------------------
  // SHORT ANSWER
  // ----------------------------------------------------------

  else if (
    form.type === 'short_answer'
  ) {
    formattedCorrectAnswer =
      form.shortAnswerKeywords
        .split(',')
        .map(keyword =>
          keyword.trim()
        )
        .filter(Boolean)

    if (
      formattedCorrectAnswer.length === 0
    ) {
      alert(
        'Please enter at least one expected answer keyword.'
      )
      return
    }
  }

  // ----------------------------------------------------------
  // MATCHING
  // ----------------------------------------------------------

  else if (
    form.type === 'matching'
  ) {
    formattedMatchingPairs =
      form.matchingPairs

    formattedCorrectAnswer = null
  }

  const payload = {
    program:
      form.program || null,

    term:
      form.term || null,

    course_id:
      numericCourseId,

    course_outcome_id:
      form.courseOutcomeId || null,

    learning_outcome_id:
      form.learningOutcomeId || null,

    code:
      generateQuestionCode(),

    type:
      form.type,

    text:
      form.text.trim(),

    image_url:
      form.imageUrl || null,

    options:
      formattedOptions,

    correct_answer:
      formattedCorrectAnswer
        ? JSON.stringify(
            formattedCorrectAnswer
          )
        : null,

    matching_pairs:
      formattedMatchingPairs,

    stcw_standard:
      null,

    bloom_level:
      form.bloomLevel,

    status:
      'Pending',

    ai_accepted:
      false,

    retained_ai:
      false
  }

  isSubmitting.value = true

  try {
    const response =
      await fetch(
        `${API_BASE_URL}/questions`,
        {
          method: 'POST',
          headers:
            getAuthHeaders(true),
          body:
            JSON.stringify(payload)
        }
      )

    if (!response.ok) {
      throw await getApiError(
        response
      )
    }

    const data =
      await response.json()

    const savedQuestion =
      normalizeQuestion(data)

    questions.value.unshift(
      savedQuestion
    )

    syncQuestionsStorage()

    alert(
      'Question saved successfully to CAMS.'
    )

    resetForm()

    activeTab.value =
      'repository'

  } catch (err) {
    console.error(
      'Failed to save question:',
      err
    )

    if (
      err?.status === 422 &&
      err?.duplicate
    ) {
      const duplicate =
        err.existingQuestion

      alert(
        `Duplicate Question Detected!\n\n` +
        `This question already exists in the Question Bank.\n\n` +
        `Question Code: ${
          duplicate?.code || 'N/A'
        }\n\n` +
        `Existing Question:\n${
          duplicate?.text || 'N/A'
        }\n\n` +
        `Please revise the question before saving.`
      )

      return
    }

    alert(
      err.message ||
      'Unable to save the question.'
    )

  } finally {
    isSubmitting.value = false
  }
}


// ============================================================
// EDIT QUESTION
// ============================================================

function editQuestion(question) {
  editingQuestion.value = {
    ...question,

    options:
      Array.isArray(question.options)
        ? question.options.map(
            option => ({
              ...option
            })
          )
        : [],

    matchingPairs:
      Array.isArray(
        question.matchingPairs
      )
        ? question.matchingPairs.map(
            pair => ({
              ...pair
            })
          )
        : [],

    correctAnswer:
      Array.isArray(
        question.correctAnswer
      )
        ? [
            ...question.correctAnswer
          ]
        : question.correctAnswer
  }
}


function closeEditModal() {
  editingQuestion.value = null
}


// ============================================================
// SAVE EDITED QUESTION
// ============================================================

async function saveEditedQuestion() {
  if (!editingQuestion.value) {
    return
  }

  if (
    !editingQuestion.value.courseId ||
    !editingQuestion.value.text?.trim()
  ) {
    alert(
      'Please select a Course / Subject and enter Question Stem.'
    )
    return
  }

  if (
    !confirm(
      'Are you sure you want to save the changes to this question?'
    )
  ) {
    return
  }

  const numericCourseId =
    resolveCourseId(
      editingQuestion.value.courseId
    )

  if (!numericCourseId) {
    alert(
      'The selected course could not be matched to the Laravel course record.'
    )
    return
  }

  let formattedOptions = null
  let formattedCorrectAnswer = null
  let formattedMatchingPairs = null

  if (
    editingQuestion.value.type ===
    'multiple_choice'
  ) {
    formattedOptions =
      (
        editingQuestion.value.options ||
        []
      ).map(option => ({
        text:
          option.text,
        imageUrl:
          option.imageUrl ||
          null
      }))

    formattedCorrectAnswer =
      formattedOptions
        .map((_, index) =>
          editingQuestion.value
            .correctAnswer
            ?.includes(index)
            ? index
            : null
        )
        .filter(
          value => value !== null
        )

    if (
      formattedCorrectAnswer.length ===
      0
    ) {
      alert(
        'Please check at least one correct option.'
      )
      return
    }
  }

  else if (
    editingQuestion.value.type ===
    'true_false'
  ) {
    formattedOptions = [
      'True',
      'False'
    ]

    formattedCorrectAnswer =
      editingQuestion.value
        .correctAnswer?.[0] === 1
        ? [1]
        : [0]
  }

  else if (
    editingQuestion.value.type ===
    'short_answer'
  ) {
    if (
      Array.isArray(
        editingQuestion.value
          .correctAnswer
      )
    ) {
      formattedCorrectAnswer =
        editingQuestion.value
          .correctAnswer
    } else {
      formattedCorrectAnswer =
        String(
          editingQuestion.value
            .correctAnswer || ''
        )
          .split(',')
          .map(keyword =>
            keyword.trim()
          )
          .filter(Boolean)
    }

    if (
      formattedCorrectAnswer.length ===
      0
    ) {
      alert(
        'Please enter at least one expected answer keyword.'
      )
      return
    }
  }

  else if (
    editingQuestion.value.type ===
    'matching'
  ) {
    formattedMatchingPairs =
      editingQuestion.value
        .matchingPairs || []

    formattedCorrectAnswer = null
  }

  const payload = {
    program:
      editingQuestion.value
        .program || null,

    term:
      editingQuestion.value
        .term || null,

    course_id:
      numericCourseId,

    course_outcome_id:
      editingQuestion.value
        .courseOutcomeId || null,

    learning_outcome_id:
      editingQuestion.value
        .learningOutcomeId || null,

    code:
      editingQuestion.value.code,

    type:
      editingQuestion.value.type,

    text:
      editingQuestion.value
        .text.trim(),

    image_url:
      editingQuestion.value
        .imageUrl || null,

    options:
      formattedOptions,

    correct_answer:
      formattedCorrectAnswer
        ? JSON.stringify(
            formattedCorrectAnswer
          )
        : null,

    matching_pairs:
      formattedMatchingPairs,

    stcw_standard:
      editingQuestion.value
        .stcwStandard || null,

    bloom_level:
      editingQuestion.value
        .bloomLevel ||
      'Understanding',

    status:
      editingQuestion.value
        .status || 'Pending',

    ai_accepted:
      Boolean(
        editingQuestion.value
          .aiAccepted
      ),

    retained_ai:
      Boolean(
        editingQuestion.value
          .retainedAi
      )
  }

  try {
    const response =
      await fetch(
        `${API_BASE_URL}/questions/${editingQuestion.value.id}`,
        {
          method: 'PUT',
          headers:
            getAuthHeaders(true),
          body:
            JSON.stringify(payload)
        }
      )

    if (!response.ok) {
      throw await getApiError(
        response
      )
    }

    const data =
      await response.json()

    const updatedQuestion =
      normalizeQuestion(data)

    const index =
      questions.value.findIndex(
        question =>
          question.id ===
          editingQuestion.value.id
      )

    if (index !== -1) {
      questions.value[index] =
        updatedQuestion
    }

    syncQuestionsStorage()

    closeEditModal()

    alert(
      'Question updated successfully in CAMS.'
    )

  } catch (err) {
    console.error(
      'Failed to update question:',
      err
    )

    alert(
      err.message ||
      'Unable to update the question.'
    )
  }
}


// ============================================================
// SINGLE QUESTION STATUS UPDATE
// ============================================================

async function updateQuestionStatus(id, status) {
  if (!id || !status) return

  if (!confirm(`Are you sure you want to mark this question as ${status}?`)) {
    return
  }

  const question = questions.value.find(item => item.id === id)

  if (!question) {
    alert('Question not found.')
    return
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/questions/${id}`,
      {
        method: 'PUT',
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          program: question.program || null,
          term: question.term || null,
          course_id: question.courseDbId || resolveCourseId(question.courseId),
          course_outcome_id: question.courseOutcomeId || null,
          learning_outcome_id: question.learningOutcomeId || null,
          code: question.code,
          type: question.type,
          text: question.text,
          image_url: question.imageUrl || null,
          options: question.options || null,
          correct_answer:
            question.correctAnswer !== null && question.correctAnswer !== undefined
              ? JSON.stringify(question.correctAnswer)
              : null,
          matching_pairs: question.matchingPairs || null,
          stcw_standard: question.stcwStandard || null,
          bloom_level: question.bloomLevel || 'Understanding',
          status,
          ai_accepted: Boolean(question.aiAccepted),
          retained_ai: Boolean(question.retainedAi)
        })
      }
    )

    if (!response.ok) {
      throw await getApiError(response)
    }

    const updated = normalizeQuestion(await response.json())
    const index = questions.value.findIndex(item => item.id === id)

    if (index !== -1) {
      questions.value[index] = updated
    }

    syncQuestionsStorage()
  } catch (err) {
    console.error('Failed to update question status:', err)
    alert(err.message || 'Unable to update the question status.')
  }
}


// ============================================================
// DELETE QUESTION
// ============================================================

async function deleteQuestion(id) {
  if (
    !confirm(
      'Are you sure you want to remove this question item?'
    )
  ) {
    return
  }

  try {
    const response =
      await fetch(
        `${API_BASE_URL}/questions/${id}`,
        {
          method: 'DELETE',
          headers:
            getAuthHeaders()
        }
      )

    if (!response.ok) {
      throw await getApiError(
        response
      )
    }

    questions.value =
      questions.value.filter(
        question =>
          question.id !== id
      )

    selectedQuestionIds.value =
      selectedQuestionIds.value.filter(
        selectedId =>
          selectedId !== id
      )

    syncQuestionsStorage()

    alert(
      'Question item deleted successfully from CAMS.'
    )

  } catch (err) {
    console.error(
      'Failed to delete question:',
      err
    )

    alert(
      err.message ||
      'Unable to delete the question.'
    )
  }
}


// ============================================================
// BULK STATUS UPDATE
// ============================================================

async function bulkUpdateStatus(status) {
  if (
    !selectedQuestionIds.value.length
  ) {
    alert(
      'Please select at least one question.'
    )
    return
  }

  if (
    !confirm(
      `Are you sure you want to mark ${selectedQuestionIds.value.length} question(s) as ${status}?`
    )
  ) {
    return
  }

  try {
    for (
      const id of
      selectedQuestionIds.value
    ) {
      const question =
        questions.value.find(
          item => item.id === id
        )

      if (!question) {
        continue
      }

      const response =
        await fetch(
          `${API_BASE_URL}/questions/${id}`,
          {
            method: 'PUT',
            headers:
              getAuthHeaders(true),
            body: JSON.stringify({
              program:
                question.program ||
                null,

              term:
                question.term ||
                null,

              course_id:
                question.courseDbId ||
                resolveCourseId(
                  question.courseId
                ),

              course_outcome_id:
                question.courseOutcomeId ||
                null,

              learning_outcome_id:
                question.learningOutcomeId ||
                null,

              code:
                question.code,

              type:
                question.type,

              text:
                question.text,

              image_url:
                question.imageUrl ||
                null,

              options:
                question.options ||
                null,

              correct_answer:
                question.correctAnswer
                  ? JSON.stringify(
                      question.correctAnswer
                    )
                  : null,

              matching_pairs:
                question.matchingPairs ||
                null,

              stcw_standard:
                question.stcwStandard ||
                null,

              bloom_level:
                question.bloomLevel ||
                'Understanding',

              status,

              ai_accepted:
                Boolean(
                  question.aiAccepted
                ),

              retained_ai:
                Boolean(
                  question.retainedAi
                )
            })
          }
        )

      if (!response.ok) {
        throw await getApiError(
          response
        )
      }

      const updated =
        normalizeQuestion(
          await response.json()
        )

      const index =
        questions.value.findIndex(
          item => item.id === id
        )

      if (index !== -1) {
        questions.value[index] =
          updated
      }
    }

    selectedQuestionIds.value = []

    syncQuestionsStorage()

    alert(
      `Selected question(s) successfully marked as ${status}.`
    )

  } catch (err) {
    console.error(
      'Bulk status update failed:',
      err
    )

    alert(
      err.message ||
      'Unable to update selected questions.'
    )
  }
}


// ============================================================
// BULK DELETE
// ============================================================

async function bulkDeleteQuestions() {
  if (
    !selectedQuestionIds.value.length
  ) {
    alert(
      'Please select at least one question.'
    )
    return
  }

  if (
    !confirm(
      `Are you sure you want to permanently delete ${selectedQuestionIds.value.length} selected question(s)?`
    )
  ) {
    return
  }

  try {
    for (
      const id of
      selectedQuestionIds.value
    ) {
      const response =
        await fetch(
          `${API_BASE_URL}/questions/${id}`,
          {
            method: 'DELETE',
            headers:
              getAuthHeaders()
          }
        )

      if (!response.ok) {
        throw await getApiError(
          response
        )
      }
    }

    questions.value =
      questions.value.filter(
        question =>
          !selectedQuestionIds.value.includes(
            question.id
          )
      )

    selectedQuestionIds.value = []

    syncQuestionsStorage()

    alert(
      'Selected question(s) deleted successfully from CAMS.'
    )

  } catch (err) {
    console.error(
      'Bulk delete failed:',
      err
    )

    alert(
      err.message ||
      'Unable to delete selected questions.'
    )
  }
}


// ============================================================
// GROUP QUESTIONS BY COURSE
// ============================================================

const groupedQuestions = computed(() => {
  const groups = {}

  filteredQuestions.value.forEach(
    question => {
      const courseKey =
        question.courseId ||
        'Unassigned'

      if (!groups[courseKey]) {
        const courseObj =
          courses.value.find(
            course =>
              String(course.id) ===
                String(
                  question.courseDbId ||
                  question.course_id
                ) ||
              String(course.code) ===
                String(question.courseId)
          )

        groups[courseKey] = {
          courseKey,

          code:
            courseObj?.code ||
            question.courseId ||
            'UNASSIGNED',

          title:
            courseObj?.title ||
            'General / Unassigned Course Items',

          questions: []
        }
      }

      groups[courseKey]
        .questions
        .push(question)
    }
  )

  return Object.values(groups)
})


// ============================================================
// COLLAPSE COURSE
// ============================================================

function toggleCourseCollapse(
  courseKey
) {
  collapsedCourses.value[courseKey] =
    !collapsedCourses.value[
      courseKey
    ]
}


// Support either naming convention.
function collapseCourse(courseKey) {
  toggleCourseCollapse(courseKey)
}


// ============================================================
// COURSE REPORTS
// ============================================================

const courseReports = computed(() => {
  const map = {}

  courses.value.forEach(course => {
    const key =
      course.code ||
      course.id

    map[key] = {
      code:
        course.code ||
        course.id,

      title:
        course.title ||
        `Course ${course.code}`,

      program:
        course.program ||
        'Both',

      total: 0,
      approved: 0,
      disapproved: 0,
      pending: 0,

      retainedAi: 0,
      acceptedAi: 0
    }
  })

  questions.value.forEach(
    question => {
      const key =
        question.courseId ||
        question.courseDbId

      if (!map[key]) {
        return
      }

      map[key].total++

      if (
        question.status ===
        'Approved'
      ) {
        map[key].approved++
      }

      else if (
        question.status ===
        'Disapproved'
      ) {
        map[key].disapproved++
      }

      else {
        map[key].pending++
      }

      if (question.retainedAi) {
        map[key].retainedAi++
      }

      if (question.aiAccepted) {
        map[key].acceptedAi++
      }
    }
  )

  return Object.values(map)
})


const overallReportSummary = computed(() => {
  return {
    total:
      questions.value.length,

    approved:
      questions.value.filter(
        question =>
          question.status ===
          'Approved'
      ).length,

    disapproved:
      questions.value.filter(
        question =>
          question.status ===
          'Disapproved'
      ).length,

    pending:
      questions.value.filter(
        question =>
          question.status !==
            'Approved' &&
          question.status !==
            'Disapproved'
      ).length,

    acceptedAi:
      questions.value.filter(
        question =>
          question.aiAccepted
      ).length,

    retainedAi:
      questions.value.filter(
        question =>
          question.retainedAi
      ).length
  }
})


// ============================================================
// EXPORT COURSE REPORT
// ============================================================

function exportCourseReport(report) {
  const courseQuestions =
    questions.value.filter(
      question =>
        String(
          question.courseId
        ) === String(report.code)
    )

  const rows = [
    [
      'Question Code',
      'Question Type',
      'Question',
      'CO',
      'LO',
      'Bloom Level',
      'Status',
      'AI Accepted',
      'Retained Original'
    ]
  ]

  courseQuestions.forEach(
    question => {
      rows.push([
        question.code || '',
        question.type || '',
        question.text || '',
        question.courseOutcomeId || '',
        question.learningOutcomeId || '',
        question.bloomLevel || '',
        question.status || '',
        question.aiAccepted
          ? 'Yes'
          : 'No',
        question.retainedAi
          ? 'Yes'
          : 'No'
      ])
    }
  )

  const csv = rows
    .map(row =>
      row
        .map(value =>
          `"${String(value)
            .replace(/"/g, '""')}"`
        )
        .join(',')
    )
    .join('\n')

  const blob =
    new Blob(
      [csv],
      {
        type:
          'text/csv;charset=utf-8;'
      }
    )

  const link =
    document.createElement('a')

  link.href =
    URL.createObjectURL(blob)

  link.download =
    `${report.code || 'course'}_question_report.csv`

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}


// ============================================================
// CSV TEMPLATE
// ============================================================

function downloadCSVTemplate() {
  if (
    !confirm(
      'Are you sure you want to download the CSV template?'
    )
  ) {
    return
  }

  const headers = [
    'Program',
    'Term',
    'CourseId',
    'CourseOutcomeId',
    'LearningOutcomeId',
    'BloomLevel',
    'QuestionType',
    'QuestionText',
    'OptionA',
    'OptionB',
    'OptionC',
    'OptionD',
    'CorrectAnswer'
  ]

  const sampleRows = [
    [
      'BSMT',
      'Midterm',
      'ICT',
      'CO1',
      'LO1.1',
      'Understanding',
      'multiple_choice',
      'What is the primary function of an ECDIS?',
      'Electronic Chart Display',
      'Radar Display',
      'Sonar System',
      'GMDSS Radio',
      'A'
    ],

    [
      'BSMarE',
      'Final',
      'ICT',
      'CO2',
      'LO2.1',
      'Remember',
      'true_false',
      'Is a diesel engine an internal combustion engine?',
      'True',
      'False',
      '',
      '',
      'A'
    ]
  ]

  const csvContent =
    [
      headers.join(','),

      ...sampleRows.map(row =>
        row
          .map(field =>
            `"${String(field)
              .replace(/"/g, '""')}"`
          )
          .join(',')
      )
    ].join('\n')

  const blob =
    new Blob(
      [csvContent],
      {
        type:
          'text/csv;charset=utf-8;'
      }
    )

  const link =
    document.createElement('a')

  link.href =
    URL.createObjectURL(blob)

  link.download =
    'question_bank_template.csv'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}


// ============================================================
// BULK CSV UPLOAD
// ============================================================

async function handleBulkCSVUpload(event) {
  const file =
    event.target.files?.[0]

  if (!file) {
    return
  }

  if (
    !file.name
      .toLowerCase()
      .endsWith('.csv')
  ) {
    alert(
      'Please select a CSV file.'
    )

    event.target.value = ''
    return
  }

  if (
    !confirm(
      'Are you sure you want to upload these assessment questions to CAMS?'
    )
  ) {
    event.target.value = ''
    return
  }

  isUploadingBulk.value = true

  try {
    const csvText =
      await file.text()

    // --------------------------------------------------------
    // CSV PARSER
    // Supports:
    // - commas inside quoted fields
    // - quoted text
    // - line breaks inside quoted fields
    // --------------------------------------------------------

    function parseCSV(text) {
      const rows = []

      let currentRow = []
      let currentValue = ''
      let insideQuotes = false

      for (
        let i = 0;
        i < text.length;
        i++
      ) {
        const char = text[i]

        if (char === '"') {
          if (
            insideQuotes &&
            text[i + 1] === '"'
          ) {
            currentValue += '"'
            i++
          } else {
            insideQuotes =
              !insideQuotes
          }

          continue
        }

        if (
          char === ',' &&
          !insideQuotes
        ) {
          currentRow.push(
            currentValue.trim()
          )

          currentValue = ''

          continue
        }

        if (
          (
            char === '\n' ||
            char === '\r'
          ) &&
          !insideQuotes
        ) {
          if (
            char === '\r' &&
            text[i + 1] === '\n'
          ) {
            i++
          }

          currentRow.push(
            currentValue.trim()
          )

          currentValue = ''

          if (
            currentRow.some(
              value =>
                value !== ''
            )
          ) {
            rows.push(
              currentRow
            )
          }

          currentRow = []

          continue
        }

        currentValue += char
      }

      if (
        currentValue !== '' ||
        currentRow.length > 0
      ) {
        currentRow.push(
          currentValue.trim()
        )

        if (
          currentRow.some(
            value =>
              value !== ''
          )
        ) {
          rows.push(
            currentRow
          )
        }
      }

      return rows
    }

    const rows =
      parseCSV(csvText)

    if (rows.length < 2) {
      alert(
        'The CSV file does not contain any question records.'
      )
      return
    }

    // --------------------------------------------------------
    // EXPECTED HEADER
    // --------------------------------------------------------

    const expectedHeaders = [
      'Program',
      'Term',
      'CourseId',
      'CourseOutcomeId',
      'LearningOutcomeId',
      'BloomLevel',
      'QuestionType',
      'QuestionText',
      'OptionA',
      'OptionB',
      'OptionC',
      'OptionD',
      'CorrectAnswer'
    ]

    const headers =
      rows[0].map(header =>
        header
          .replace(/^\uFEFF/, '')
          .trim()
      )

    const headersAreValid =
      expectedHeaders.length ===
        headers.length &&
      expectedHeaders.every(
        (header, index) =>
          header ===
          headers[index]
      )

    if (!headersAreValid) {
      alert(
        `Invalid CSV header.\n\nExpected:\n${expectedHeaders.join(',')}`
      )
      return
    }

    // --------------------------------------------------------
    // HELPERS
    // --------------------------------------------------------

    function clean(value) {
      return String(
        value ?? ''
      ).trim()
    }

    function generateBulkQuestionCode(
      rowIndex
    ) {
      return `Q-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)
        .toUpperCase()}-${rowIndex}`
    }

    function normalizeQuestionType(
      type
    ) {
      const value =
        clean(type).toLowerCase()

      if (
        value ===
          'multiple_choice' ||
        value ===
          'multiple choice' ||
        value === 'mcq'
      ) {
        return 'multiple_choice'
      }

      if (
        value ===
          'true_false' ||
        value ===
          'true/false' ||
        value ===
          'true or false'
      ) {
        return 'true_false'
      }

      if (
        value ===
          'short_answer' ||
        value ===
          'short answer'
      ) {
        return 'short_answer'
      }

      if (
        value ===
        'matching'
      ) {
        return 'matching'
      }

      return value
    }

    // --------------------------------------------------------
    // DUPLICATE CHECKING
    // --------------------------------------------------------

    const existingQuestionTexts =
      new Set(
        questions.value
          .map(q =>
            clean(q.text)
              .toLowerCase()
          )
          .filter(Boolean)
      )

    const uploadedQuestionTexts =
      new Set()

    let successCount = 0
    let skippedCount = 0
    let failedCount = 0

    const failedRows = []

    // --------------------------------------------------------
    // PROCESS EACH ROW
    // --------------------------------------------------------

    for (
      let rowIndex = 1;
      rowIndex < rows.length;
      rowIndex++
    ) {
      const row =
        rows[rowIndex]

      if (
        !row ||
        row.every(
          value =>
            clean(value) === ''
        )
      ) {
        continue
      }

      try {
        if (
          row.length !==
          expectedHeaders.length
        ) {
          throw new Error(
            `Expected ${expectedHeaders.length} columns but found ${row.length}.`
          )
        }

        const [
          program,
          term,
          courseId,
          courseOutcomeId,
          learningOutcomeId,
          bloomLevel,
          questionTypeRaw,
          questionText,
          optionA,
          optionB,
          optionC,
          optionD,
          correctAnswerRaw
        ] = row

        const type =
          normalizeQuestionType(
            questionTypeRaw
          )

        if (
          !clean(questionText)
        ) {
          throw new Error(
            'QuestionText is empty.'
          )
        }

        if (
          !clean(courseId)
        ) {
          throw new Error(
            'CourseId is empty.'
          )
        }

        // ----------------------------------------------------
        // FIND COURSE
        // ----------------------------------------------------

        const course =
          courses.value.find(
            course =>
              String(course.id) ===
                String(
                  courseId
                ).trim() ||
              String(
                course.code
              ).toLowerCase() ===
                String(
                  courseId
                )
                  .trim()
                  .toLowerCase()
          )

        if (!course) {
          throw new Error(
            `CourseId "${courseId}" could not be matched to a CAMS course.`
          )
        }

        const numericCourseId =
          course.id

        // ----------------------------------------------------
        // DUPLICATE CHECK
        // ----------------------------------------------------

        const normalizedText =
          clean(
            questionText
          ).toLowerCase()

        if (
          existingQuestionTexts.has(
            normalizedText
          ) ||
          uploadedQuestionTexts.has(
            normalizedText
          )
        ) {
          skippedCount++
          continue
        }

        uploadedQuestionTexts.add(
          normalizedText
        )

        // ----------------------------------------------------
        // PREPARE DATA
        // ----------------------------------------------------

        let formattedOptions = null
        let formattedCorrectAnswer = null
        let formattedMatchingPairs = null

        // ----------------------------------------------------
        // MULTIPLE CHOICE
        // ----------------------------------------------------

        if (
          type ===
          'multiple_choice'
        ) {
          formattedOptions = [
            {
              text: clean(optionA),
              imageUrl: null
            },
            {
              text: clean(optionB),
              imageUrl: null
            },
            {
              text: clean(optionC),
              imageUrl: null
            },
            {
              text: clean(optionD),
              imageUrl: null
            }
          ]

          const answerLetters =
            clean(
              correctAnswerRaw
            )
              .split('|')
              .map(answer =>
                answer
                  .trim()
                  .toUpperCase()
              )
              .filter(Boolean)

          if (
            answerLetters.length ===
            0
          ) {
            throw new Error(
              'CorrectAnswer is empty.'
            )
          }

          const answerIndexes = []

          for (
            const letter of
            answerLetters
          ) {
            const index =
              [
                'A',
                'B',
                'C',
                'D'
              ].indexOf(
                letter
              )

            if (index === -1) {
              throw new Error(
                `Invalid multiple-choice answer "${letter}". Use A, B, C, or D.`
              )
            }

            if (
              !answerIndexes.includes(
                index
              )
            ) {
              answerIndexes.push(
                index
              )
            }
          }

          formattedCorrectAnswer =
            answerIndexes
        }

        // ----------------------------------------------------
        // TRUE / FALSE
        // ----------------------------------------------------

        else if (
          type ===
          'true_false'
        ) {
          formattedOptions = [
            'True',
            'False'
          ]

          const answer =
            clean(
              correctAnswerRaw
            ).toUpperCase()

          if (
            answer === 'A' ||
            answer === 'TRUE'
          ) {
            formattedCorrectAnswer =
              [0]
          }

          else if (
            answer === 'B' ||
            answer === 'FALSE'
          ) {
            formattedCorrectAnswer =
              [1]
          }

          else {
            throw new Error(
              'True/False CorrectAnswer must be A/True or B/False.'
            )
          }
        }

        // ----------------------------------------------------
        // SHORT ANSWER
        // ----------------------------------------------------

        else if (
          type ===
          'short_answer'
        ) {
          const possibleAnswers =
            clean(
              correctAnswerRaw
            )
              .split('|')
              .map(answer =>
                answer.trim()
              )
              .filter(Boolean)

          if (
            possibleAnswers.length ===
            0
          ) {
            throw new Error(
              'CorrectAnswer is empty for the short-answer question.'
            )
          }

          formattedCorrectAnswer =
            possibleAnswers
        }

        // ----------------------------------------------------
        // MATCHING
        // ----------------------------------------------------

        else if (
          type ===
          'matching'
        ) {
          formattedMatchingPairs =
            null

          formattedCorrectAnswer =
            null
        }

        else {
          throw new Error(
            `Unsupported QuestionType "${questionTypeRaw}".`
          )
        }

        // ----------------------------------------------------
        // LARAVEL PAYLOAD
        // ----------------------------------------------------

        const payload = {
          program:
            clean(program) ||
            null,

          term:
            clean(term) ||
            null,

          course_id:
            numericCourseId,

          course_outcome_id:
            clean(
              courseOutcomeId
            ) || null,

          learning_outcome_id:
            clean(
              learningOutcomeId
            ) || null,

          code:
            generateBulkQuestionCode(
              rowIndex
            ),

          type,

          text:
            clean(questionText),

          image_url:
            null,

          options:
            formattedOptions,

          correct_answer:
            formattedCorrectAnswer !==
            null
              ? JSON.stringify(
                  formattedCorrectAnswer
                )
              : null,

          matching_pairs:
            formattedMatchingPairs,

          stcw_standard:
            null,

          bloom_level:
            clean(bloomLevel) ||
            'Understanding',

          status:
            'Pending',

          ai_accepted:
            false,

          retained_ai:
            false
        }

        // ----------------------------------------------------
        // SAVE TO LARAVEL
        // ----------------------------------------------------

        const response =
          await fetch(
            `${API_BASE_URL}/questions`,
            {
              method: 'POST',
              headers:
                getAuthHeaders(
                  true
                ),
              body:
                JSON.stringify(
                  payload
                )
            }
          )

        if (!response.ok) {
          let errorData = {}

          try {
            errorData =
              await response.json()
          } catch (_) {}

          // Laravel duplicate
          if (
            response.status ===
              422 &&
            errorData.duplicate ===
              true
          ) {
            skippedCount++

            uploadedQuestionTexts.delete(
              normalizedText
            )

            continue
          }

          if (
            response.status ===
            401
          ) {
            throw new Error(
              'Your session has expired. Please log in again.'
            )
          }

          if (
            response.status ===
              422 &&
            errorData.errors
          ) {
            const firstError =
              Object.values(
                errorData.errors
              ).flat()[0]

            throw new Error(
              firstError ||
              errorData.message ||
              'Please check the submitted information.'
            )
          }

          throw new Error(
            errorData.message ||
            `Request failed. HTTP ${response.status}`
          )
        }

        const savedQuestion =
          await response.json()

        questions.value.unshift(
          normalizeQuestion(
            savedQuestion
          )
        )

        successCount++

        // Prevent excessive requests
        await new Promise(
          resolve =>
            setTimeout(
              resolve,
              50
            )
        )

      } catch (rowError) {
        failedCount++

        failedRows.push(
          `Row ${rowIndex + 1}: ${rowError.message}`
        )
      }
    }

    // --------------------------------------------------------
    // SAVE LOCAL CACHE
    // --------------------------------------------------------

    syncQuestionsStorage()

    // --------------------------------------------------------
    // SUMMARY
    // --------------------------------------------------------

    let message =
      `Bulk upload completed.\n\n` +
      `Successfully saved: ${successCount}\n` +
      `Skipped duplicates: ${skippedCount}\n` +
      `Failed: ${failedCount}`

    if (
      failedRows.length > 0
    ) {
      message +=
        `\n\nFailed rows:\n` +
        failedRows
          .slice(0, 10)
          .join('\n')

      if (
        failedRows.length > 10
      ) {
        message +=
          `\n...and ${
            failedRows.length - 10
          } more.`
      }
    }

    alert(message)

  } catch (err) {
    console.error(
      'Bulk CSV upload failed:',
      err
    )

    alert(
      err.message ||
      'Unable to process the CSV file.'
    )

  } finally {
    isUploadingBulk.value =
      false

    event.target.value = ''
  }
}


// ============================================================
// LOAD COURSES
// ============================================================

async function loadCachedCourses() {
  const savedCourses = localStorage.getItem(STORAGE_COURSES_KEY)

  if (!savedCourses) return false

  try {
    const parsed = JSON.parse(savedCourses)

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return false
    }

    courses.value = parsed.map(normalizeCourse)
    return true
  } catch (err) {
    console.warn('CAMS: Unable to read cached courses.', err)
    return false
  }
}


async function loadCachedQuestions() {
  const savedQuestions = localStorage.getItem(STORAGE_QUESTIONS_KEY)

  if (!savedQuestions) return false

  try {
    const parsed = JSON.parse(savedQuestions)

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return false
    }

    questions.value = parsed
    return true
  } catch (err) {
    console.warn('CAMS: Unable to read cached questions.', err)
    return false
  }
}


// ============================================================
// LOAD COURSES
// ============================================================
//
// Local cache is loaded first so existing data never disappears
// while the Laravel API is empty or temporarily unavailable.
// Laravel data replaces the cache only when Laravel actually
// returns one or more course records.
// ============================================================

async function fetchCourses() {
  await loadCachedCourses()

  try {
    const response = await fetch(
      `${API_BASE_URL}/courses`,
      {
        method: 'GET',
        headers: getAuthHeaders()
      }
    )

    if (response.status === 401) {
      throw new Error(
        'Your session has expired. Please log in again.'
      )
    }

    if (!response.ok) {
      throw new Error(
        `Failed to load courses. HTTP ${response.status}`
      )
    }

    const data = await response.json()

    if (!Array.isArray(data)) {
      throw new Error(
        'Invalid course data received from Laravel.'
      )
    }

    if (data.length > 0) {
      courses.value = data.map(normalizeCourse)
      syncCoursesStorage()
      console.log(
        `CAMS: Loaded ${courses.value.length} courses from Laravel.`
      )
    } else {
      console.warn(
        'CAMS: Laravel returned no courses. Existing local courses were preserved.'
      )
    }

  } catch (err) {
    console.error(
      'Failed to load courses from Laravel:',
      err
    )

    if (!courses.value.length) {
      console.warn(
        'CAMS: No courses are currently available.'
      )
    }
  }
}


// ============================================================
// LOAD QUESTIONS
// ============================================================
//
// Local cache is loaded first so existing data never disappears
// while the Laravel API is empty or temporarily unavailable.
// Laravel data replaces the cache only when Laravel actually
// returns one or more question records.
// ============================================================

async function fetchQuestions() {
  const saved = localStorage.getItem(
    STORAGE_QUESTIONS_KEY
  )

  if (saved) {
    try {
      const parsed = JSON.parse(saved)

      if (Array.isArray(parsed)) {
        questions.value = parsed
      }
    } catch (error) {
      console.warn(
        'CAMS: Unable to read cached questions.',
        error
      )
    }
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/questions`,
      {
        method: 'GET',
        headers: getAuthHeaders()
      }
    )

    if (response.status === 401) {
      throw new Error(
        'Your session has expired. Please log in again.'
      )
    }

    if (!response.ok) {
      throw new Error(
        `Failed to load questions. HTTP ${response.status}`
      )
    }

    const data = await response.json()

    console.log('CAMS API /questions response:', data)

    const questionData =
      Array.isArray(data)
        ? data
        : Array.isArray(data.data)
          ? data.data
          : null

    if (!questionData) {
      throw new Error(
        'Invalid question data received from Laravel.'
      )
    }

    questions.value = questionData.map(
      normalizeQuestion
    )

    syncQuestionsStorage()

    console.log(
      `CAMS: Loaded ${questions.value.length} questions from Laravel.`
    )

  } catch (error) {
    console.error(
      'Failed to load questions from Laravel:',
      error
    )

    // Do not destroy already loaded questions.
    if (!questions.value.length && saved) {
      try {
        const parsed = JSON.parse(saved)

        if (Array.isArray(parsed)) {
          questions.value = parsed
        }
      } catch (cacheError) {
        console.warn(
          'CAMS: Cached questions could not be restored.',
          cacheError
        )
      }
    }
  }
}

// ============================================================
// AI VALIDATION ENGINE
// ============================================================
//
// CAMS Question Quality Assistant
//
// Rule-based validation checks:
//
// 1. Bloom's Level
// 2. LO Alignment
// 3. CO Alignment
// 4. Question Construction
// 5. Answer & Distractor Quality
// 6. AI Suggestions
//
// No numerical score.
// No external AI API yet.
// ============================================================


// ============================================================
// BASIC TEXT HELPERS
// ============================================================

function normalizeAuditText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(
      /[^a-z0-9\s.-]/gi,
      ' '
    )
    .replace(
      /\s+/g,
      ' '
    )
    .trim()
}


function getWords(value) {
  return normalizeAuditText(value)
    .split(/\s+/)
    .filter(
      word =>
        word.length >= 4
    )
}


function removeCommonWords(words) {
  const stopWords =
    new Set([
      'about',
      'after',
      'again',
      'against',
      'among',
      'also',
      'based',
      'being',
      'between',
      'could',
      'different',
      'during',
      'explain',
      'following',
      'from',
      'have',
      'into',
      'more',
      'most',
      'other',
      'purpose',
      'should',
      'such',
      'than',
      'that',
      'their',
      'these',
      'this',
      'those',
      'through',
      'used',
      'using',
      'what',
      'when',
      'which',
      'with'
    ])

  return words.filter(
    word =>
      !stopWords.has(word)
  )
}


function calculateWordOverlap(
  questionText,
  targetText
) {
  const questionWords =
    new Set(
      removeCommonWords(
        getWords(questionText)
      )
    )

  const targetWords =
    new Set(
      removeCommonWords(
        getWords(targetText)
      )
    )

  if (
    !questionWords.size ||
    !targetWords.size
  ) {
    return 0
  }

  let matches = 0

  questionWords.forEach(
    word => {
      if (
        targetWords.has(word)
      ) {
        matches++
      }
    }
  )

  return (
    matches /
    Math.max(
      targetWords.size,
      1
    )
  )
}


// ============================================================
// BLOOM'S TAXONOMY
// ============================================================

const BLOOM_VERBS = {
  Remember: [
    'define',
    'identify',
    'list',
    'name',
    'recall',
    'recognize',
    'state',
    'label',
    'select'
  ],

  Understanding: [
    'describe',
    'discuss',
    'explain',
    'classify',
    'summarize',
    'interpret',
    'compare',
    'identify',
    'outline'
  ],

  Applying: [
    'apply',
    'demonstrate',
    'use',
    'operate',
    'implement',
    'execute',
    'solve',
    'perform',
    'calculate'
  ],

  Analyzing: [
    'analyze',
    'differentiate',
    'examine',
    'compare',
    'contrast',
    'investigate',
    'categorize',
    'distinguish'
  ],

  Evaluating: [
    'evaluate',
    'assess',
    'judge',
    'justify',
    'critique',
    'defend',
    'recommend',
    'verify'
  ],

  Creating: [
    'create',
    'design',
    'develop',
    'construct',
    'formulate',
    'plan',
    'produce'
  ]
}


const BLOOM_ORDER = [
  'Remember',
  'Understanding',
  'Applying',
  'Analyzing',
  'Evaluating',
  'Creating'
]


function detectQuestionAction(text) {
  const normalized =
    normalizeAuditText(text)

  for (
    const [level, verbs] of
    Object.entries(
      BLOOM_VERBS
    )
  ) {
    for (
      const verb of verbs
    ) {
      const pattern =
        new RegExp(
          `\\b${verb}\\b`,
          'i'
        )

      if (
        pattern.test(
          normalized
        )
      ) {
        return {
          verb,
          level
        }
      }
    }
  }

  if (
    /^(what|who|when|where|which|name|identify)\b/i.test(
      normalized
    )
  ) {
    return {
      verb: null,
      level: 'Remember'
    }
  }

  return {
    verb: null,
    level: null
  }
}


// ============================================================
// BLOOM VALIDATION
// ============================================================

function evaluateBloomSimple(q) {
  const selectedLevel =
    q.bloomLevel ||
    q.bloom_level ||
    'Understanding'

  const questionText =
    q.text || ''

  const detected =
    detectQuestionAction(
      questionText
    )

  const selectedIndex =
    BLOOM_ORDER.indexOf(
      selectedLevel
    )

  if (
    !questionText.trim()
  ) {
    return {
      status: 'Review',
      label: '⚠️ Review',
      reason:
        'The question stem is empty.',
      suggestion:
        'Complete the question stem before validating its Bloom level.'
    }
  }

  if (
    !detected.level
  ) {
    return {
      status: 'Review',
      label: '⚠️ Review',
      reason:
        `The cognitive action for "${selectedLevel}" could not be clearly detected.`,
      suggestion:
        `Use a clear ${selectedLevel.toLowerCase()}-level action in the question.`
    }
  }

  const detectedIndex =
    BLOOM_ORDER.indexOf(
      detected.level
    )

  if (
    detectedIndex ===
    selectedIndex
  ) {
    return {
      status: 'Appropriate',
      label: '✅ Appropriate',
      reason:
        `The question appears consistent with the selected Bloom level "${selectedLevel}".`,
      suggestion: null
    }
  }

  if (
    Math.abs(
      detectedIndex -
      selectedIndex
    ) === 1
  ) {
    return {
      status: 'Review',
      label: '⚠️ Review',
      reason:
        `The question appears to assess "${detected.level}" while "${selectedLevel}" is selected.`,
      suggestion:
        `Review the question verb and cognitive demand so it better matches ${selectedLevel}.`
    }
  }

  return {
    status: 'Review',
    label: '⚠️ Review',
    reason:
      `The question appears to assess "${detected.level}", which differs significantly from the selected Bloom level "${selectedLevel}".`,
    suggestion:
      `Revise the question so its required thinking process matches ${selectedLevel}.`
  }
}


// ============================================================
// LO ALIGNMENT
// ============================================================

function evaluateLOAlignmentSimple(q) {
  const lo =
    getQuestionLO(q)

  if (!lo) {
    return {
      status: 'Not Aligned',
      label: '❌ Not Aligned',
      reason:
        'The selected Learning Outcome could not be found.',
      suggestion:
        'Select a valid Learning Outcome before approving this question.'
    }
  }

  const loText =
    lo.description ||
    lo.title ||
    ''

  const questionText =
    q.text || ''

  const overlap =
    calculateWordOverlap(
      questionText,
      loText
    )

  const action =
    detectQuestionAction(
      questionText
    )

  const loAction =
    detectQuestionAction(
      loText
    )

  if (
    overlap >= 0.30
  ) {
    if (
      !loAction.level ||
      !action.level ||
      Math.abs(
        BLOOM_ORDER.indexOf(
          action.level
        ) -
        BLOOM_ORDER.indexOf(
          loAction.level
        )
      ) <= 1
    ) {
      return {
        status: 'Aligned',
        label: '✅ Aligned',
        reason:
          `The question directly addresses the selected LO: ${lo.id || ''}.`,
        suggestion: null
      }
    }

    return {
      status: 'Partially Aligned',
      label: '⚠️ Partially Aligned',
      reason:
        'The question addresses the LO topic, but its cognitive action may not fully match the LO.',
      suggestion:
        `Revise the question so students perform the action required by ${lo.id || 'the selected LO'}.`
    }
  }

  if (
    overlap >= 0.15
  ) {
    return {
      status: 'Partially Aligned',
      label: '⚠️ Partially Aligned',
      reason:
        'The question has some connection to the selected LO, but the alignment is not sufficiently direct.',
      suggestion:
        `Make the question more directly assess the knowledge or skill stated in ${lo.id || 'the selected LO'}.`
    }
  }

  return {
    status: 'Not Aligned',
    label: '❌ Not Aligned',
    reason:
      `The question does not clearly assess the selected Learning Outcome ${lo.id || ''}.`,
    suggestion:
      `Revise the question so it directly measures the knowledge or skill described in ${lo.id || 'the selected LO'}.`
  }
}


// ============================================================
// CO ALIGNMENT
// ============================================================

function evaluateCOAlignmentSimple(q) {
  const co =
    getQuestionCO(q)

  const lo =
    getQuestionLO(q)

  if (!co) {
    return {
      status: 'Not Aligned',
      label: '❌ Not Aligned',
      reason:
        'The selected Course Outcome could not be found.',
      suggestion:
        'Select a valid Course Outcome and Learning Outcome.'
    }
  }

  const coText =
    co.title ||
    co.description ||
    ''

  const questionText =
    q.text || ''

  const selectedLOBelongsToCO =
    Boolean(lo)

  const overlap =
    calculateWordOverlap(
      questionText,
      coText
    )

  if (
    selectedLOBelongsToCO &&
    overlap >= 0.10
  ) {
    return {
      status: 'Aligned',
      label: '✅ Aligned',
      reason:
        `The question supports ${co.id || 'the selected CO'} through the selected Learning Outcome.`,
      suggestion: null
    }
  }

  if (
    selectedLOBelongsToCO
  ) {
    return {
      status: 'Aligned',
      label: '✅ Aligned',
      reason:
        `The question is mapped to a valid Learning Outcome under ${co.id || 'the selected CO'}.`,
      suggestion: null
    }
  }

  if (
    overlap >= 0.15
  ) {
    return {
      status: 'Partially Aligned',
      label: '⚠️ Partially Aligned',
      reason:
        'The question has some relationship to the selected Course Outcome, but the mapping should be reviewed.',
      suggestion:
        'Confirm that the selected Learning Outcome belongs to this Course Outcome.'
    }
  }

  return {
    status: 'Not Aligned',
    label: '❌ Not Aligned',
    reason:
      'The question does not clearly contribute to the selected Course Outcome.',
    suggestion:
      `Revise the question so it contributes directly to ${co.id || 'the selected Course Outcome'}.`
  }
}


// ============================================================
// QUESTION CONSTRUCTION
// ============================================================

function evaluateQuestionConstruction(q) {
  const text =
    String(q.text || '').trim()

  if (!text) {
    return {
      status: 'Review',
      label: '⚠️ Review',
      reason:
        'The question has no stem.',
      suggestion:
        'Write a complete and specific question stem.'
    }
  }

  const suggestions = []

  if (
    text.length < 15
  ) {
    suggestions.push(
      'The question may be too short or lack sufficient context.'
    )
  }

  if (
    text.length > 500
  ) {
    suggestions.push(
      'The question stem is lengthy and may be simplified.'
    )
  }

  if (
    /[?]{2,}|!{2,}/.test(
      text
    )
  ) {
    suggestions.push(
      'Remove unnecessary repeated punctuation.'
    )
  }

  if (
    /^(what is|what are|which of the following)\s*$/i.test(
      text
    )
  ) {
    suggestions.push(
      'Make the question more specific.'
    )
  }

  if (
    q.type ===
    'multiple_choice'
  ) {
    const options =
      q.options || []

    if (
      options.length < 2
    ) {
      suggestions.push(
        'Provide enough answer choices for a multiple-choice question.'
      )
    }
  }

  if (
    suggestions.length
  ) {
    return {
      status: 'Review',
      label: '⚠️ Review',
      reason:
        suggestions[0],
      suggestion:
        suggestions[0]
    }
  }

  return {
    status: 'Good',
    label: '✅ Good',
    reason:
      'The question stem is clear and sufficiently structured.',
    suggestion: null
  }
}


// ============================================================
// ANSWER & DISTRACTOR QUALITY
// ============================================================

function evaluateAnswerAndDistractors(q) {
  const type = q.type

  // ----------------------------------------------------------
  // MULTIPLE CHOICE
  // ----------------------------------------------------------

  if (
    type ===
    'multiple_choice'
  ) {
    const options =
      Array.isArray(
        q.options
      )
        ? q.options
        : []

    if (
      options.length < 2
    ) {
      return {
        status: 'Review',
        label: '⚠️ Review',
        reason:
          'There are not enough answer choices.',
        suggestion:
          'Provide meaningful answer choices before approving the question.'
      }
    }

    const texts =
      options.map(option =>
        String(
          option?.text || ''
        ).trim()
      )

    const normalizedTexts =
      texts.map(text =>
        normalizeAuditText(
          text
        )
      )

    if (
      texts.some(
        text => !text
      )
    ) {
      return {
        status: 'Review',
        label: '⚠️ Review',
        reason:
          'One or more answer choices are empty.',
        suggestion:
          'Complete all answer choices with meaningful alternatives.'
      }
    }

    const placeholderPattern =
      /^(a|b|c|d|answer\s*[a-d]?|option\s*[a-d]?|choice\s*[a-d]?)$/i

    if (
      texts.some(text =>
        placeholderPattern.test(
          text
        )
      )
    ) {
      return {
        status: 'Review',
        label: '❌ Review',
        reason:
          'One or more choices appear to be placeholders rather than real answers.',
        suggestion:
          'Replace placeholder choices with meaningful and content-related alternatives.'
      }
    }

    const uniqueChoices =
      new Set(
        normalizedTexts
      )

    if (
      uniqueChoices.size !==
      normalizedTexts.length
    ) {
      return {
        status: 'Review',
        label: '❌ Review',
        reason:
          'Two or more answer choices are identical or substantially duplicated.',
        suggestion:
          'Replace duplicated choices with distinct alternatives.'
      }
    }

    const correctAnswers =
      Array.isArray(
        q.correctAnswer
      )
        ? q.correctAnswer
        : []

    if (
      !correctAnswers.length
    ) {
      return {
        status: 'Review',
        label: '⚠️ Review',
        reason:
          'No correct answer is identified.',
        suggestion:
          'Mark the correct answer before approving the question.'
      }
    }

    const veryShortChoices =
      texts.filter(
        text =>
          text.length <= 1
      )

    if (
      veryShortChoices.length >=
      2
    ) {
      return {
        status: 'Review',
        label: '⚠️ Review',
        reason:
          'Several choices are extremely short and may not function as meaningful distractors.',
        suggestion:
          'Use realistic alternatives that require students to distinguish between concepts.'
      }
    }

    return {
      status: 'Good',
      label: '✅ Good',
      reason:
        'The answer choices are populated, distinct, and a correct answer is identified.',
      suggestion:
        'Ensure distractors remain plausible and represent common misconceptions.'
    }
  }


  // ----------------------------------------------------------
  // TRUE / FALSE
  // ----------------------------------------------------------

  if (
    type ===
    'true_false'
  ) {
    const correctAnswers =
      Array.isArray(
        q.correctAnswer
      )
        ? q.correctAnswer
        : []

    if (
      !correctAnswers.length
    ) {
      return {
        status: 'Review',
        label: '⚠️ Review',
        reason:
          'The correct True/False answer is not identified.',
        suggestion:
          'Identify whether the statement should be True or False.'
      }
    }

    return {
      status: 'Good',
      label: '✅ Good',
      reason:
        'A correct True/False answer is identified.',
      suggestion:
        'Ensure the statement is clearly true or clearly false and avoids unnecessary clues.'
    }
  }


  // ----------------------------------------------------------
  // SHORT ANSWER
  // ----------------------------------------------------------

  if (
    type ===
    'short_answer'
  ) {
    const answers =
      Array.isArray(
        q.correctAnswer
      )
        ? q.correctAnswer
        : []

    if (
      !answers.length
    ) {
      return {
        status: 'Review',
        label: '⚠️ Review',
        reason:
          'No expected answer has been identified.',
        suggestion:
          'Provide the expected answer or acceptable answer keywords.'
      }
    }

    return {
      status: 'Good',
      label: '✅ Good',
      reason:
        'Expected answer information is available.',
      suggestion:
        'Include reasonable alternative answers or keywords when appropriate.'
    }
  }


  // ----------------------------------------------------------
  // MATCHING
  // ----------------------------------------------------------

  if (
    type ===
    'matching'
  ) {
    const pairs =
      Array.isArray(
        q.matchingPairs
      )
        ? q.matchingPairs
        : []

    if (
      pairs.length < 2
    ) {
      return {
        status: 'Review',
        label: '⚠️ Review',
        reason:
          'The matching question contains too few valid pairs.',
        suggestion:
          'Provide at least two complete and meaningful matching pairs.'
      }
    }

    const incompletePair =
      pairs.some(pair =>
        !String(
          pair?.leftText || ''
        ).trim() ||
        !String(
          pair?.rightText || ''
        ).trim()
      )

    if (
      incompletePair
    ) {
      return {
        status: 'Review',
        label: '⚠️ Review',
        reason:
          'One or more matching pairs are incomplete.',
        suggestion:
          'Complete both sides of every matching pair.'
      }
    }

    return {
      status: 'Good',
      label: '✅ Good',
      reason:
        'The matching question contains complete pairs.',
      suggestion:
        'Ensure the pairs are conceptually distinct and not obvious from wording alone.'
    }
  }


  return {
    status: 'Good',
    label: '✅ Good',
    reason:
      'No major answer-format issue was detected.',
    suggestion: null
  }
}


// ============================================================
// COMPLETE AI AUDIT
// ============================================================

function buildAiAudit(q) {
  const bloom =
    evaluateBloomSimple(q)

  const lo =
    evaluateLOAlignmentSimple(q)

  const co =
    evaluateCOAlignmentSimple(q)

  const construction =
    evaluateQuestionConstruction(q)

  const answer =
    evaluateAnswerAndDistractors(q)

  const suggestions = [
    bloom.suggestion,
    lo.suggestion,
    co.suggestion,
    construction.suggestion,
    answer.suggestion
  ].filter(Boolean)

  let overallType =
    'success'

  if (
    bloom.status === 'Review' ||
    lo.status ===
      'Partially Aligned' ||
    co.status ===
      'Partially Aligned' ||
    construction.status ===
      'Review' ||
    answer.status ===
      'Review'
  ) {
    overallType =
      'warning'
  }

  if (
    lo.status ===
      'Not Aligned' ||
    co.status ===
      'Not Aligned'
  ) {
    overallType =
      'warning'
  }

  return {
    type:
      overallType,

    bloom,

    loAlignment:
      lo,

    coAlignment:
      co,

    construction,

    answer,

    suggestions,

    // No numerical scoring.
    score: null,

    rating:
      overallType ===
      'success'
        ? 'Ready'
        : 'Needs Review'
  }
}


// ============================================================
// AI DISPLAY MESSAGE
// ============================================================

function getCanonicalBloom(level) {
  const value = String(level || 'Understanding').trim()
  const map = {
    Remembering: 'Remember',
    Remember: 'Remember',
    Understanding: 'Understanding',
    Application: 'Applying',
    Applying: 'Applying',
    Analysis: 'Analyzing',
    Analyzing: 'Analyzing',
    Evaluation: 'Evaluating',
    Evaluating: 'Evaluating',
    Creating: 'Creating'
  }
  return map[value] || 'Understanding'
}

function getDisplayBloom(level) {
  const map = {
    Remember: 'Remembering',
    Understanding: 'Understanding',
    Applying: 'Application',
    Analyzing: 'Analysis',
    Evaluating: 'Evaluation',
    Creating: 'Creating'
  }
  return map[level] || level || 'Understanding'
}

function cleanQuestionText(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .replace(/([!?])\1+/g, '$1')
    .trim()
}

function getRefinementTargetBloom(q) {
  const selected = getCanonicalBloom(q.bloomLevel || 'Understanding')
  const detected = detectQuestionAction(q.text || '')

  if (detected.level && detected.level !== selected) {
    return detected.level
  }

  return selected
}

function refineQuestionStem(text, targetBloom) {
  const original = cleanQuestionText(text)
  if (!original) return ''

  const noQuestionMark = original.replace(/[?]+$/, '').trim()
  const content = noQuestionMark
    .replace(
      /^(what is|what are|who is|who are|when|where|which|identify|define|name|list|state|explain|describe|discuss|analyze|analyse|evaluate|assess)\s+/i,
      ''
    )
    .trim()

  if (targetBloom === 'Remember') {
    if (/^(what is|what are|who is|who are|when|where|which|identify|define|name|list|state)\b/i.test(original)) {
      return original.endsWith('?') ? original : `${original}?`
    }
    return `Identify ${content}.`
  }

  if (targetBloom === 'Understanding') {
    if (/^(explain|describe|discuss)\b/i.test(original)) {
      return /[.!?]$/.test(original) ? original : `${original}.`
    }
    return `Explain ${content}.`
  }

  // Safe prototype: do not invent technical facts or answers for higher Bloom levels.
  return original
}

function buildAiRefinement(q) {
  const targetBloom = getRefinementTargetBloom(q)
  const originalText = cleanQuestionText(q.text)
  const refinedText = refineQuestionStem(originalText, targetBloom)

  const options = Array.isArray(q.options)
    ? q.options.map(option => ({ ...option }))
    : []

  const correctAnswer = cloneCorrectAnswer(parseCorrectAnswer(q.correctAnswer))
  const matchingPairs = Array.isArray(q.matchingPairs)
    ? q.matchingPairs.map(pair => ({ ...pair }))
    : []

  const changes = []
  const originalBloom = getCanonicalBloom(q.bloomLevel || 'Understanding')

  if (originalBloom !== targetBloom) {
    changes.push(
      `Bloom level adjusted from ${getDisplayBloom(originalBloom)} to ${getDisplayBloom(targetBloom)}.`
    )
  }

  if (refinedText !== originalText) {
    changes.push(
      'Question wording refined to better reflect the detected cognitive action.'
    )
  }

  return {
    available: Boolean(refinedText),
    changed: Boolean(refinedText) && (
      refinedText !== originalText ||
      originalBloom !== targetBloom
    ),
    bloomLevel: getDisplayBloom(targetBloom),
    text: refinedText,
    options,
    correctAnswer,
    matchingPairs,
    explanation: changes
  }
}

function generateAiSuggestion(q) {
  const audit = buildAiAudit(q)

  return {
    type: audit.type,

    bloom: audit.bloom,
    loAlignment: audit.loAlignment,
    coAlignment: audit.coAlignment,
    construction: audit.construction,
    answer: audit.answer,

    suggestions: audit.suggestions || [],

    score: null,

    rating:
      audit.type === 'success'
        ? 'Ready'
        : 'Needs Review'
  }
}

async function useAiRefinement(q) {
  const suggestion = generateAiSuggestion(q)
  const refinement = suggestion.refinement

  if (!refinement?.available || !refinement.changed) {
    alert(
      'A safe AI refinement could not be prepared for this question. Please review the item manually.'
    )
    return
  }

  const changes = refinement.explanation.length
    ? `\n\nPrepared changes:\n- ${refinement.explanation.join('\n- ')}`
    : ''

  if (!confirm(
    `Use AI Refinement?\n\nThe refined version will replace the current working version.${changes}`
  )) {
    return
  }

  const courseId = q.courseDbId || resolveCourseId(q.courseId)

  if (!courseId) {
    alert('The question course could not be identified.')
    return
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/questions/${q.id}`,
      {
        method: 'PUT',
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          program: q.program || null,
          term: q.term || null,
          course_id: courseId,
          course_outcome_id: q.courseOutcomeId || null,
          learning_outcome_id: q.learningOutcomeId || null,
          code: q.code,
          type: q.type,
          text: refinement.text,
          image_url: q.imageUrl || null,
          options: refinement.options.length ? refinement.options : null,
          correct_answer:
            refinement.correctAnswer !== null && refinement.correctAnswer !== undefined
              ? JSON.stringify(refinement.correctAnswer)
              : null,
          matching_pairs: refinement.matchingPairs.length ? refinement.matchingPairs : null,
          stcw_standard: q.stcwStandard || null,
          bloom_level: refinement.bloomLevel,
          status: q.status || 'Pending',
          ai_accepted: true,
          retained_ai: false
        })
      }
    )

    if (!response.ok) {
      throw await getApiError(response)
    }

    const updated = normalizeQuestion(await response.json())
    const index = questions.value.findIndex(
      question => question.id === q.id
    )

    if (index !== -1) {
      questions.value[index] = updated
    }

    syncQuestionsStorage()

    alert(
      'AI Refinement applied successfully. The refined version is now the official working question.'
    )
  } catch (err) {
    console.error('Failed to use AI refinement:', err)
    alert(err.message || 'Unable to apply the AI refinement.')
  }
}

async function retainOriginalSettings(q) {
  if (!confirm(
    'Retain Original?\n\nThe instructor-created or uploaded question will remain unchanged and will be recorded as the retained original.'
  )) {
    return
  }

  const courseId = q.courseDbId || resolveCourseId(q.courseId)

  if (!courseId) {
    alert('The question course could not be identified.')
    return
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/questions/${q.id}`,
      {
        method: 'PUT',
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          program: q.program || null,
          term: q.term || null,
          course_id: courseId,
          course_outcome_id: q.courseOutcomeId || null,
          learning_outcome_id: q.learningOutcomeId || null,
          code: q.code,
          type: q.type,
          text: q.text,
          image_url: q.imageUrl || null,
          options: q.options || null,
          correct_answer:
            q.correctAnswer !== null && q.correctAnswer !== undefined
              ? JSON.stringify(q.correctAnswer)
              : null,
          matching_pairs: q.matchingPairs || null,
          stcw_standard: q.stcwStandard || null,
          bloom_level: q.bloomLevel || 'Understanding',
          status: q.status || 'Pending',
          ai_accepted: false,
          retained_ai: true
        })
      }
    )

    if (!response.ok) {
      throw await getApiError(response)
    }

    const updated = normalizeQuestion(await response.json())
    const index = questions.value.findIndex(
      question => question.id === q.id
    )

    if (index !== -1) {
      questions.value[index] = updated
    }

    syncQuestionsStorage()

    alert('Original question retained successfully.')
  } catch (err) {
    console.error('Failed to retain original question:', err)
    alert(err.message || 'Unable to retain the original question.')
  }
}


// ============================================================
// ON MOUNT
// ============================================================

onMounted(async () => {
  await fetchCourses()
  await fetchQuestions()
})
</script>