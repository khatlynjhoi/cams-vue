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
          <Download :size="14" class="text-slate-300" /> 
          Download CSV Template
        </button>

        <label class="px-4 py-2.5 bg-[#00c068] hover:bg-[#00a358] text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-2 transition shadow-sm">
          <Upload :size="14" /> 
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
        <Database :size="14" :class="activeTab === 'repository' ? 'text-white' : 'text-slate-500'" /> 
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
        <PlusCircle :size="14" :class="activeTab === 'create' ? 'text-white' : 'text-slate-500'" /> 
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
        <FileText :size="14" :class="activeTab === 'report' ? 'text-white' : 'text-slate-500'" /> 
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
            <CheckCircle :size="13" /> Bulk Approve
          </button>
          <button @click="bulkUpdateStatus('Disapproved')" class="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition shadow-2xs flex items-center gap-1.5 cursor-pointer">
            <XCircle :size="13" /> Bulk Disapprove
          </button>
          <button @click="bulkDeleteQuestions" class="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-lg transition shadow-2xs flex items-center gap-1.5 cursor-pointer">
            <Trash2 :size="13" /> Bulk Delete
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
              <component :is="collapsedCourses[group.courseKey] ? ChevronRight : ChevronDown" :size="16" class="text-slate-600" />
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
                    @change="toggleSelectQuestion(q.id)" 
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
                      <CheckCircle :size="15" />
                    </button>

                    <button @click="updateQuestionStatus(q.id, 'Disapproved')" title="Disapprove Question" class="p-1.5 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white rounded-lg border border-red-200 transition cursor-pointer">
                      <XCircle :size="15" />
                    </button>

                    <!-- Edit Button -->
                    <button @click="openEditModal(q)" title="Edit / Revise Item" class="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-lg border border-blue-200 transition cursor-pointer">
                      <Edit :size="15" />
                    </button>
                  </template>

                  <button @click="deleteQuestion(q.id)" title="Delete Item" class="p-1.5 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-lg transition cursor-pointer">
                    <Trash2 :size="15" />
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
                class="p-2.5 rounded-xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border" 
                :class="{
                  'bg-amber-50/80 border-amber-200 text-amber-900': generateAiSuggestion(q).type === 'warning',
                  'bg-blue-50/80 border-blue-200 text-blue-900': generateAiSuggestion(q).type === 'info',
                  'bg-emerald-50/50 border-emerald-200 text-emerald-900': generateAiSuggestion(q).type === 'success'
                }"
              >
                <div class="flex items-start gap-2">
                  <Sparkles :size="16" class="mt-0.5 shrink-0 text-amber-600" />
                  <div>
                    <span class="font-bold block text-[11px]">AI Validation & Suggestion:</span>
                    <span class="text-[11px] leading-tight block">{{ generateAiSuggestion(q).text }}</span>
                  </div>
                </div>

                <div v-if="generateAiSuggestion(q).type === 'warning' && q.status !== 'Approved'" class="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <button @click="applyAiCorrection(q)" class="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition shadow-2xs flex items-center gap-1 cursor-pointer">
                    <Check :size="12" /> Apply Suggestion
                  </button>
                  <button @click="retainOriginalSettings(q)" class="px-3 py-1 bg-slate-600 hover:bg-slate-700 text-white font-bold text-[10px] rounded-lg transition shadow-2xs flex items-center gap-1 cursor-pointer">
                    <RotateCcw :size="12" /> Retain Original
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
            <select v-model="form.program" @change="onProgramChange" class="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none">
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
            <select v-model="form.courseId" @change="onCourseChange" class="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none">
              <option value="" disabled>Select Subject...</option>
              <option v-for="c in filteredCourses" :key="c.id" :value="c.code || c.id">
                {{ c.code }} — {{ c.title }}
              </option>
            </select>
          </div>

          <div>
            <label class="font-bold text-slate-700 block mb-1">Course Outcome (CO)</label>
            <select v-model="form.courseOutcomeId" @change="onCOChange" class="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none">
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
              <input type="file" accept="image/*" @change="e => handleFileUpload(e, form, 'imageUrl')" class="text-xs mt-1 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer" />
            </div>
            <div v-if="form.imageUrl" class="relative shrink-0">
              <img :src="form.imageUrl" class="h-16 w-16 object-cover rounded-lg border shadow-2xs" />
              <button @click="removeImage(form, 'imageUrl')" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-2xs">
                <X :size="10" />
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
              <Plus :size="14" /> Add Option
            </button>
          </div>

          <div v-for="(opt, idx) in form.options" :key="idx" class="flex flex-col sm:flex-row sm:items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <div class="flex items-center gap-3 flex-1">
              <input type="checkbox" v-model="opt.isCorrect" title="Mark as correct answer" class="h-4 w-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 shrink-0 cursor-pointer" />
              <input v-model="opt.text" :placeholder="`Option ${idx + 1} text...`" class="flex-1 p-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500" />
            </div>

            <div class="flex items-center gap-2 self-end sm:self-auto">
              <label class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300/80 cursor-pointer flex items-center gap-1.5 transition">
                <Image :size="14" class="text-slate-500" />
                <span>Image</span>
                <input type="file" accept="image/*" @change="e => handleFileUpload(e, opt, 'imageUrl')" class="hidden" />
              </label>

              <div v-if="opt.imageUrl" class="relative">
                <img :src="opt.imageUrl" class="h-8 w-8 object-cover rounded border" />
                <button @click="removeImage(opt, 'imageUrl')" class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600">
                  <X :size="8" />
                </button>
              </div>

              <button v-if="form.options.length > 2" @click="removeOption(idx)" title="Remove option" class="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer">
                <Trash2 :size="16" />
              </button>
            </div>
          </div>
        </div>

        <!-- MATCHING TYPE PAIRS -->
        <div v-if="form.type === 'matching'" class="space-y-3 border border-slate-200 p-4 rounded-xl bg-slate-50/30">
          <div class="flex justify-between items-center mb-1">
            <span class="text-xs font-bold text-slate-700">Matching Pairs (Item ⟶ Correct Match)</span>
            <button @click="addMatchingPair" type="button" class="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer">
              <Plus :size="14" /> Add Matching Pair
            </button>
          </div>

          <div v-for="(pair, idx) in form.matchingPairs" :key="idx" class="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-xs text-slate-600">Pair #{{ idx + 1 }}</span>
              <button v-if="form.matchingPairs.length > 2" @click="removeMatchingPair(idx)" title="Remove Pair" class="text-red-500 hover:bg-red-50 p-1 rounded cursor-pointer">
                <Trash2 :size="14" />
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div class="space-y-2 border p-2.5 rounded-lg bg-slate-50/50">
                <span class="font-bold text-[11px] text-slate-500">Premise Item / Question</span>
                <input v-model="pair.leftText" placeholder="Left item text..." class="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none bg-white" />
                
                <div class="flex items-center justify-between">
                  <label class="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold rounded border cursor-pointer flex items-center gap-1">
                    <Image :size="12" /> Image
                    <input type="file" accept="image/*" @change="e => handleFileUpload(e, pair, 'leftImageUrl')" class="hidden" />
                  </label>
                  <div v-if="pair.leftImageUrl" class="relative">
                    <img :src="pair.leftImageUrl" class="h-8 w-8 object-cover rounded border" />
                    <button @click="removeImage(pair, 'leftImageUrl')" class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5">
                      <X :size="8" />
                    </button>
                  </div>
                </div>
              </div>

              <div class="space-y-2 border p-2.5 rounded-lg bg-slate-50/50">
                <span class="font-bold text-[11px] text-slate-500">Matching Target / Answer</span>
                <input v-model="pair.rightText" placeholder="Right matching text..." class="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none bg-white" />
                
                <div class="flex items-center justify-between">
                  <label class="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold rounded border cursor-pointer flex items-center gap-1">
                    <Image :size="12" /> Image
                    <input type="file" accept="image/*" @change="e => handleFileUpload(e, pair, 'rightImageUrl')" class="hidden" />
                  </label>
                  <div v-if="pair.rightImageUrl" class="relative">
                    <img :src="pair.rightImageUrl" class="h-8 w-8 object-cover rounded border" />
                    <button @click="removeImage(pair, 'rightImageUrl')" class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5">
                      <X :size="8" />
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
          <Save :size="16" /> 
          <span>{{ isSubmitting ? 'Saving...' : 'Save Question Item' }}</span>
        </button>
      </div>

    </div>

    <!-- TAB 3: COURSE REPORTS & AUDITS -->
    <div v-show="activeTab === 'report'" class="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-6">
      <div class="flex flex-col md:flex-row justify-between md:items-center border-b pb-4 gap-4">
        <div>
          <h2 class="text-base font-bold text-slate-900 flex items-center gap-2 tracking-tight">
            <BarChart2 class="text-emerald-600" :size="20" /> Course Question Changes & Audit Report
          </h2>
          <p class="text-xs text-slate-500">View question counts, approval status, accepted AI suggestions, and AI overrides grouped per course.</p>
        </div>

        <button @click="exportCourseReportCSV" type="button" class="px-4 py-2 bg-[#00c068] hover:bg-[#00a358] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition shadow-2xs cursor-pointer">
          <Download :size="14" /> Export Report CSV
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
            <Edit class="text-blue-600" :size="18" /> Edit / Revise Question Item
          </h3>
          <button @click="closeEditModal" class="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
            <X :size="18" />
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
              <input type="file" accept="image/*" @change="e => handleFileUpload(e, editingQuestion, 'imageUrl')" class="text-xs mt-1 cursor-pointer" />
            </div>
            <div v-if="editingQuestion.imageUrl" class="relative">
              <img :src="editingQuestion.imageUrl" class="h-14 w-14 object-cover rounded border" />
              <button @click="removeImage(editingQuestion, 'imageUrl')" class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 cursor-pointer">
                <X :size="10" />
              </button>
            </div>
          </div>

          <!-- Edit Multiple Choice Options -->
          <div v-if="editingQuestion.type === 'multiple_choice'" class="space-y-3 border p-3 rounded-xl bg-slate-50/50">
            <div class="flex justify-between items-center">
              <span class="font-bold text-slate-700">Multiple Choice Options</span>
              <button @click="editingQuestion.options.push({ text: '', imageUrl: '' })" type="button" class="text-emerald-600 font-bold text-xs flex items-center gap-1 cursor-pointer">
                <Plus :size="12" /> Add Option
              </button>
            </div>

            <div v-for="(opt, oIdx) in editingQuestion.options" :key="oIdx" class="p-2.5 bg-white border rounded-lg space-y-2 shadow-2xs">
              <div class="flex items-center gap-2">
                <input type="checkbox" :checked="Array.isArray(editingQuestion.correctAnswer) ? editingQuestion.correctAnswer.includes(oIdx) : editingQuestion.correctAnswer === oIdx" @change="toggleEditCorrectOption(oIdx)" class="h-4 w-4 text-emerald-600 rounded cursor-pointer" />
                <input v-model="opt.text" class="flex-1 p-1.5 border rounded text-xs outline-none" :placeholder="`Option ${oIdx + 1} text...`" />
                <button v-if="editingQuestion.options.length > 2" @click="editingQuestion.options.splice(oIdx, 1)" class="text-red-500 p-1 cursor-pointer">
                  <Trash2 :size="14" />
                </button>
              </div>

              <div class="flex items-center justify-between pt-1 border-t border-slate-100">
                <label class="px-2 py-1 bg-slate-100 text-slate-700 text-[11px] font-semibold rounded cursor-pointer flex items-center gap-1">
                  <Image :size="12" /> {{ opt.imageUrl ? 'Change Image' : 'Add Image' }}
                  <input type="file" accept="image/*" @change="e => handleFileUpload(e, opt, 'imageUrl')" class="hidden" />
                </label>
                <div v-if="opt.imageUrl" class="relative">
                  <img :src="opt.imageUrl" class="h-8 w-8 object-cover rounded border" />
                  <button @click="removeImage(opt, 'imageUrl')" class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 cursor-pointer">
                    <X :size="8" />
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
                <Plus :size="12" /> Add Pair
              </button>
            </div>

            <div v-for="(pair, pIdx) in editingQuestion.matchingPairs" :key="pIdx" class="p-2.5 bg-white border rounded-lg space-y-2 shadow-2xs">
              <div class="flex items-center justify-between">
                <span class="font-bold text-slate-500">Pair #{{ pIdx + 1 }}</span>
                <button v-if="editingQuestion.matchingPairs.length > 2" @click="editingQuestion.matchingPairs.splice(pIdx, 1)" class="text-red-500 p-1 cursor-pointer">
                  <Trash2 :size="14" />
                </button>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <!-- Left side -->
                <div class="space-y-1 border p-2 rounded bg-slate-50/50">
                  <span class="font-semibold text-[10px] text-slate-500">Left Item</span>
                  <input v-model="pair.leftText" class="w-full p-1.5 border rounded text-xs bg-white outline-none" />
                  <div class="flex items-center justify-between pt-1">
                    <label class="px-2 py-0.5 bg-white border text-[10px] font-semibold rounded cursor-pointer flex items-center gap-1">
                      <Image :size="10" /> Image
                      <input type="file" accept="image/*" @change="e => handleFileUpload(e, pair, 'leftImageUrl')" class="hidden" />
                    </label>
                    <div v-if="pair.leftImageUrl" class="relative">
                      <img :src="pair.leftImageUrl" class="h-6 w-6 object-cover rounded border" />
                      <button @click="removeImage(pair, 'leftImageUrl')" class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 cursor-pointer">
                        <X :size="6" />
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
                      <Image :size="10" /> Image
                      <input type="file" accept="image/*" @change="e => handleFileUpload(e, pair, 'rightImageUrl')" class="hidden" />
                    </label>
                    <div v-if="pair.rightImageUrl" class="relative">
                      <img :src="pair.rightImageUrl" class="h-6 w-6 object-cover rounded border" />
                      <button @click="removeImage(pair, 'rightImageUrl')" class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 cursor-pointer">
                        <X :size="6" />
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
            <Save :size="14" /> Save Changes
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { 
  Plus, Trash2, X, Upload, Download, Image,
  CheckCircle, XCircle, Sparkles, ChevronDown, ChevronRight, Check,
  Database, PlusCircle, BarChart2, Save, FileText, RotateCcw, Edit
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
const sortBy = ref('default')
const searchQuery = ref('')

const selectedQuestionIds = ref([])
const editingQuestion = ref(null)

const STORAGE_COURSES_KEY = 'cams_courses_data'
const STORAGE_QUESTIONS_KEY = 'cams_questions_data'

async function getApiError(response) {
  let data = {}

  try {
    data = await response.json()
  } catch (_) {}

  if (response.status === 401) {
    return new Error('Your session has expired. Please log in again.')
  }

  if (response.status === 422 && data.errors) {
    const firstError = Object.values(data.errors).flat()[0]

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
    throw new Error('No authentication token found. Please log in again.')
  }

  return {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
    ...(includeJson ? { 'Content-Type': 'application/json' } : {})
  }
}

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
  matchingPairs: [
    { leftText: '', leftImageUrl: '', rightText: '', rightImageUrl: '' },
    { leftText: '', leftImageUrl: '', rightText: '', rightImageUrl: '' }
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
  form.matchingPairs = [
    { leftText: '', leftImageUrl: '', rightText: '', rightImageUrl: '' },
    { leftText: '', leftImageUrl: '', rightText: '', rightImageUrl: '' }
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
  let list = questions.value.filter(q => {
    const matchesStatus = filterStatus.value === 'All' || (q.status || 'Pending') === filterStatus.value
    const matchesProgram = filterProgram.value === 'All' || q.program === filterProgram.value || q.program === 'Both'
    const matchesType = filterType.value === 'All' || q.type === filterType.value
    const matchesSearch = !searchQuery.value || 
      (q.text && q.text.toLowerCase().includes(searchQuery.value.toLowerCase())) || 
      (q.courseId && q.courseId.toLowerCase().includes(searchQuery.value.toLowerCase()))
    return matchesStatus && matchesProgram && matchesType && matchesSearch
  })

  if (sortBy.value === 'type') {
    list.sort((a, b) => (a.type || '').localeCompare(b.type || ''))
  } else if (sortBy.value === 'co') {
    list.sort((a, b) => (a.courseOutcomeId || '').localeCompare(b.courseOutcomeId || ''))
  } else if (sortBy.value === 'lo') {
    list.sort((a, b) => (a.learningOutcomeId || '').localeCompare(b.learningOutcomeId || ''))
  }

  return list
})

const isAllSelected = computed(() => {
  if (filteredQuestions.value.length === 0) return false
  return filteredQuestions.value.every(q => selectedQuestionIds.value.includes(q.id))
})

function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedQuestionIds.value = []
  } else {
    selectedQuestionIds.value = filteredQuestions.value.map(q => q.id)
  }
}

function toggleSelectQuestion(id) {
  const idx = selectedQuestionIds.value.indexOf(id)
  if (idx > -1) {
    selectedQuestionIds.value.splice(idx, 1)
  } else {
    selectedQuestionIds.value.push(id)
  }
}

function bulkUpdateStatus(status) {
  if (!confirm(`Are you sure you want to set status to "${status}" for the ${selectedQuestionIds.value.length} selected items?`)) {
    return
  }
  questions.value.forEach(q => {
    if (selectedQuestionIds.value.includes(q.id)) {
      q.status = status
    }
  })
  syncQuestionsStorage()
  alert(`Successfully updated status to ${status} for ${selectedQuestionIds.value.length} items.`)
}

function bulkDeleteQuestions() {
  if (confirm(`Are you sure you want to delete ${selectedQuestionIds.value.length} selected items?`)) {
    questions.value = questions.value.filter(q => !selectedQuestionIds.value.includes(q.id))
    selectedQuestionIds.value = []
    syncQuestionsStorage()
    alert('Selected items deleted successfully.')
  }
}

function openEditModal(q) {
  editingQuestion.value = JSON.parse(JSON.stringify(q))
  if (!editingQuestion.value.options) editingQuestion.value.options = []
  if (!editingQuestion.value.matchingPairs) editingQuestion.value.matchingPairs = []
}

function closeEditModal() {
  editingQuestion.value = null
}

function toggleEditCorrectOption(index) {
  if (!editingQuestion.value) return
  let currentAnswers = editingQuestion.value.correctAnswer
  if (!Array.isArray(currentAnswers)) {
    currentAnswers = currentAnswers !== null && currentAnswers !== undefined ? [currentAnswers] : []
  }
  const pos = currentAnswers.indexOf(index)
  if (pos > -1) {
    currentAnswers.splice(pos, 1)
  } else {
    currentAnswers.push(index)
  }
  editingQuestion.value.correctAnswer = currentAnswers
}

async function saveEditedQuestion() {
  if (!editingQuestion.value) {
    return
  }

  if (
    !editingQuestion.value.courseId ||
    !editingQuestion.value.text?.trim()
  ) {
    alert('Please select a Course / Subject and enter Question Stem.')
    return
  }

  if (!confirm('Are you sure you want to save the changes to this question?')) {
    return
  }

  const numericCourseId = resolveCourseId(
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

  // MULTIPLE CHOICE
  if (editingQuestion.value.type === 'multiple_choice') {
    formattedOptions = (editingQuestion.value.options || []).map(opt => ({
      text: opt.text,
      imageUrl: opt.imageUrl || null
    }))

    formattedCorrectAnswer = formattedOptions
      .map((_, idx) =>
        editingQuestion.value.correctAnswer?.includes(idx)
          ? idx
          : null
      )
      .filter(val => val !== null)

    if (formattedCorrectAnswer.length === 0) {
      alert('Please check at least one correct option.')
      return
    }
  }

  // TRUE / FALSE
  else if (editingQuestion.value.type === 'true_false') {
    formattedOptions = ['True', 'False']

    formattedCorrectAnswer =
      editingQuestion.value.correctAnswer?.[0] === 1
        ? [1]
        : [0]
  }

  // SHORT ANSWER
  else if (editingQuestion.value.type === 'short_answer') {
    if (Array.isArray(editingQuestion.value.correctAnswer)) {
      formattedCorrectAnswer =
        editingQuestion.value.correctAnswer
    } else {
      formattedCorrectAnswer =
        String(editingQuestion.value.correctAnswer || '')
          .split(',')
          .map(keyword => keyword.trim())
          .filter(Boolean)
    }

    if (formattedCorrectAnswer.length === 0) {
      alert('Please enter at least one expected answer keyword.')
      return
    }
  }

  // MATCHING TYPE
  else if (editingQuestion.value.type === 'matching') {
    formattedMatchingPairs =
      editingQuestion.value.matchingPairs || []

    formattedCorrectAnswer = null
  }

  const payload = {
    program: editingQuestion.value.program || null,
    term: editingQuestion.value.term || null,

    course_id: numericCourseId,

    course_outcome_id:
      editingQuestion.value.courseOutcomeId || null,

    learning_outcome_id:
      editingQuestion.value.learningOutcomeId || null,

    code: editingQuestion.value.code,

    type: editingQuestion.value.type,

    text: editingQuestion.value.text.trim(),

    image_url:
      editingQuestion.value.imageUrl || null,

    options: formattedOptions,

    correct_answer: formattedCorrectAnswer
      ? JSON.stringify(formattedCorrectAnswer)
      : null,

    matching_pairs: formattedMatchingPairs,

    stcw_standard:
      editingQuestion.value.stcwStandard || null,

    bloom_level:
      editingQuestion.value.bloomLevel || 'Understanding',

    status:
      editingQuestion.value.status || 'Pending',

    ai_accepted:
      Boolean(editingQuestion.value.aiAccepted),

    retained_ai:
      Boolean(editingQuestion.value.retainedAi)
  }

  try {
    const res = await fetch(
      `${API_BASE_URL}/questions/${editingQuestion.value.id}`,
      {
        method: 'PUT',
        headers: getAuthHeaders(true),
        body: JSON.stringify(payload)
      }
    )

    if (!res.ok) {
      throw await getApiError(res)
    }

    const data = await res.json()

    const updatedQuestion = normalizeQuestion(data)

    const index = questions.value.findIndex(
      q => q.id === editingQuestion.value.id
    )

    if (index !== -1) {
      questions.value[index] = updatedQuestion
    }

    syncQuestionsStorage()

    closeEditModal()

    alert('Question updated successfully in CAMS.')
  } catch (err) {
    console.error('Failed to update question:', err)

    alert(
      err.message ||
      'Unable to update the question.'
    )
  }
}

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
    map[course.code || course.id] = {
      code: course.code || course.id,
      title: course.title || `Course ${course.code}`,
      program: course.program || 'Both',
      total: 0,
      approved: 0,
      disapproved: 0,
      pending: 0,
      retainedAi: 0,
      acceptedAi: 0
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
        retainedAi: 0,
        acceptedAi: 0
      }
    }
    map[key].total++
    const status = q.status || 'Pending'
    if (status === 'Approved') map[key].approved++
    else if (status === 'Disapproved') map[key].disapproved++
    else map[key].pending++

    if (q.aiAccepted) map[key].acceptedAi++
    if (q.retainedAi) map[key].retainedAi++
  })

  return Object.values(map)
})

const overallReportSummary = computed(() => {
  const total = questions.value.length
  const approved = questions.value.filter(q => q.status === 'Approved').length
  const disapproved = questions.value.filter(q => q.status === 'Disapproved').length
  const pending = questions.value.filter(q => (q.status || 'Pending') === 'Pending').length
  const acceptedAi = questions.value.filter(q => q.aiAccepted).length
  const retainedAi = questions.value.filter(q => q.retainedAi).length
  return { total, approved, disapproved, pending, acceptedAi, retainedAi }
})

function toggleCourseCollapse(courseKey) {
  collapsedCourses.value[courseKey] = !collapsedCourses.value[courseKey]
}

function exportCourseReportCSV() {
  if (!confirm('Are you sure you want to export the Course Report CSV?')) {
    return
  }
  const headers = ['Course Code', 'Course Title', 'Program', 'Total Questions', 'Approved', 'Disapproved', 'Pending Approval', 'AI Suggestions Accepted', 'AI Overrides Retained']
  const rows = courseReports.value.map(r => [
    r.code, r.title, r.program, r.total, r.approved, r.disapproved, r.pending, r.acceptedAi, r.retainedAi
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

function addMatchingPair() {
  form.matchingPairs.push({ leftText: '', leftImageUrl: '', rightText: '', rightImageUrl: '' })
}

function removeMatchingPair(index) {
  if (form.matchingPairs.length > 2) form.matchingPairs.splice(index, 1)
}

function handleFileUpload(event, targetObj, propertyName) {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => { targetObj[propertyName] = e.target.result }
  reader.readAsDataURL(file)
}

function removeImage(targetObj, propertyName) {
  if (confirm('Are you sure you want to remove this image?')) {
    targetObj[propertyName] = ''
  }
}

function generateAiSuggestion(q) {
  if (q.aiAccepted) {
    return { type: 'success', text: 'AI Suggestion Accepted and Applied.' }
  }
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
  if (!confirm(`Are you sure you want to set status to "${status}" for this question item?`)) {
    return
  }
  const q = questions.value.find(item => item.id === id)
  if (q) {
    q.status = status
    syncQuestionsStorage()
    alert(`Status successfully updated to "${status}".`)
  }
}

function applyAiCorrection(q) {
  if (!confirm('Are you sure you want to accept and apply the AI suggestion for this question item?')) {
    return
  }
  const suggestion = generateAiSuggestion(q)
  if (suggestion.type === 'warning' && suggestion.text.includes('Suggested Bloom\'s level is')) {
    if (suggestion.text.includes('"Remembering"')) q.bloomLevel = 'Remembering'
    else if (suggestion.text.includes('"Application"')) q.bloomLevel = 'Application'
  }
  q.retainedAi = false
  q.aiAccepted = true
  syncQuestionsStorage()
  alert('AI suggestion applied and recorded successfully!')
}

function retainOriginalSettings(q) {
  if (!confirm('Are you sure you want to retain the original question settings and reject AI changes?')) {
    return
  }
  q.retainedAi = true
  q.aiAccepted = false
  syncQuestionsStorage()
  alert('Original settings retained.')
}

async function deleteQuestion(id) {
  if (!confirm('Are you sure you want to remove this question item?')) return

  try {
    const response = await fetch(
      'http://localhost:3001/api/questions/' + id,
      {
        method: 'DELETE'
      }
    )

    const result = await response.json()

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to delete question.')
    }

    questions.value = questions.value.filter(q => q.id !== id)

    selectedQuestionIds.value =
      selectedQuestionIds.value.filter(
        selectedId => selectedId !== id
      )

    syncQuestionsStorage()

    alert('Question item deleted successfully.')

  } catch (err) {
    console.error('Delete question failed:', err)
    alert('Unable to delete the question item. Please try again.')
  }
}

const API_BASE_URL = 'http://127.0.0.1:8000/api'

function parseCorrectAnswer(value) {
  if (Array.isArray(value)) {
    return value
  }

  if (value === null || value === undefined || value === '') {
    return null
  }

  try {
    const parsed = JSON.parse(value)
    return parsed
  } catch (e) {
    return value
  }
}

function normalizeCourse(course) {
  return {
    ...course,
    courseOutcomes: course.course_outcomes || []
  }
}

function normalizeQuestion(question) {
  const course = courses.value.find(
    c => String(c.id) === String(question.course_id)
  )

  return {
    ...question,
    courseId: course?.code || question.course_id || '',
    courseDbId: question.course_id || null,
    courseOutcomeId: question.course_outcome_id || '',
    learningOutcomeId: question.learning_outcome_id || '',
    imageUrl: question.image_url || '',
    correctAnswer: parseCorrectAnswer(question.correct_answer),
    matchingPairs: question.matching_pairs || [],
    bloomLevel: question.bloom_level || 'Understanding',
    stcwStandard: question.stcw_standard || '',
    aiAccepted: Boolean(question.ai_accepted),
    retainedAi: Boolean(question.retained_ai)
  }
}

async function fetchCourses() {
  try {
    const res = await fetch(`${API_BASE_URL}/courses`, {
      method: 'GET',
      headers: getAuthHeaders()
    })

    if (res.status === 401) {
      throw new Error('Your session has expired. Please log in again.')
    }

    if (!res.ok) {
      throw new Error(`Failed to load courses. HTTP ${res.status}`)
    }

    const data = await res.json()

    if (!Array.isArray(data)) {
      throw new Error('Invalid course data received from Laravel.')
    }

    courses.value = data.map(normalizeCourse)

    localStorage.setItem(
      STORAGE_COURSES_KEY,
      JSON.stringify(courses.value)
    )

    console.log(`CAMS: Loaded ${courses.value.length} courses from Laravel.`)
  } catch (err) {
    console.error('Failed to load courses from Laravel:', err)

    // Only use local storage as a fallback
    const savedCourses = localStorage.getItem(STORAGE_COURSES_KEY)

    if (savedCourses) {
      try {
        const parsed = JSON.parse(savedCourses)

        courses.value = Array.isArray(parsed)
          ? parsed.map(normalizeCourse)
          : []
      } catch (e) {
        courses.value = []
      }
    }
  }
}

async function fetchQuestions() {
  try {
    const res = await fetch(`${API_BASE_URL}/questions`, {
      method: 'GET',
      headers: getAuthHeaders()
    })

    if (res.status === 401) {
      throw new Error('Your session has expired. Please log in again.')
    }

    if (!res.ok) {
      throw new Error(`Failed to load questions. HTTP ${res.status}`)
    }

    const data = await res.json()

    if (!Array.isArray(data)) {
      throw new Error('Invalid question data received from Laravel.')
    }

    questions.value = data.map(normalizeQuestion)

    syncQuestionsStorage()

    console.log(`CAMS: Loaded ${questions.value.length} questions from Laravel.`)
  } catch (err) {
    console.error('Failed to load questions from Laravel:', err)

    // Only use local storage as a fallback
    const saved = localStorage.getItem(STORAGE_QUESTIONS_KEY)

    if (saved) {
      try {
        const parsed = JSON.parse(saved)

        questions.value = Array.isArray(parsed)
          ? parsed
          : []
      } catch (e) {
        questions.value = []
      }
    }
  }
}

function resolveCourseId(courseValue) {
  const course = courses.value.find(
    c =>
      String(c.id) === String(courseValue) ||
      String(c.code) === String(courseValue)
  )

  return course?.id || null
}

function generateQuestionCode() {
  return `Q-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase()}`
}

async function saveQuestion() {
  if (!form.courseId || !form.text.trim()) {
    alert('Please select a Course / Subject and enter Question Stem.')
    return
  }

  if (
    !confirm(
      'Are you sure you want to save this new assessment question?'
    )
  ) {
    return
  }

  const numericCourseId = resolveCourseId(form.courseId)

  if (!numericCourseId) {
    alert(
      'The selected course could not be matched to the Laravel course record.'
    )
    return
  }

  let formattedOptions = null
  let formattedCorrectAnswer = null
  let formattedMatchingPairs = null

  // MULTIPLE CHOICE
  if (form.type === 'multiple_choice') {
    formattedOptions = form.options.map(opt => ({
      text: opt.text,
      imageUrl: opt.imageUrl
    }))

    formattedCorrectAnswer = form.options
      .map((opt, idx) => (opt.isCorrect ? idx : null))
      .filter(val => val !== null)

    if (formattedCorrectAnswer.length === 0) {
      alert('Please check at least one correct option.')
      return
    }
  }

  // TRUE / FALSE
  else if (form.type === 'true_false') {
    formattedOptions = ['True', 'False']

    formattedCorrectAnswer =
      form.tfCorrect === 'true'
        ? [0]
        : [1]
  }

  // SHORT ANSWER
  else if (form.type === 'short_answer') {
    formattedCorrectAnswer = form.shortAnswerKeywords
      .split(',')
      .map(keyword => keyword.trim())
      .filter(Boolean)

    if (formattedCorrectAnswer.length === 0) {
      alert('Please enter at least one expected answer keyword.')
      return
    }
  }

  // MATCHING TYPE
  else if (form.type === 'matching') {
    formattedMatchingPairs = form.matchingPairs
    formattedCorrectAnswer = null
  }

  const payload = {
    program: form.program,
    term: form.term,

    // Laravel expects numeric course_id
    course_id: numericCourseId,

    course_outcome_id: form.courseOutcomeId || null,
    learning_outcome_id: form.learningOutcomeId || null,

    // Required unique question code
    code: generateQuestionCode(),

    type: form.type,
    text: form.text.trim(),

    image_url: form.imageUrl || null,

    options: formattedOptions,

    // Laravel database field is text,
    // so arrays are stored as JSON strings.
    correct_answer: formattedCorrectAnswer
      ? JSON.stringify(formattedCorrectAnswer)
      : null,

    matching_pairs: formattedMatchingPairs,

    stcw_standard: null,
    bloom_level: form.bloomLevel,

    status: 'Pending',

    // AI audit fields
    ai_accepted: false,
    retained_ai: false
  }

  isSubmitting.value = true

  try {
    const res = await fetch(`${API_BASE_URL}/questions`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      throw await getApiError(res)
    }

    const data = await res.json()

    // Use the actual Laravel/MySQL record returned by the server
    const savedQuestion = normalizeQuestion(data)

    questions.value.unshift(savedQuestion)

    syncQuestionsStorage()

    alert('Question saved successfully to CAMS.')

    resetForm()

    activeTab.value = 'repository'
  } catch (err) {
    console.error('Failed to save question:', err)

    alert(
      err.message ||
      'Unable to save the question.'
    )
  } finally {
    isSubmitting.value = false
  }
}

function downloadCSVTemplate() {
  if (!confirm('Are you sure you want to download the CSV template?')) {
    return
  }
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

  if (!confirm(`Are you sure you want to process and bulk upload questions from "${file.name}"?`)) {
    if (bulkFileInput.value) bulkFileInput.value.value = ''
    return
  }

  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      isUploadingBulk.value = true
      const lines = e.target.result.split(/\r?\n/).filter(l => l.trim().length > 0)
      if (lines.length < 2) return alert('CSV file appears empty.')

      // Map valid courses from the system (by code or id)
      const validCoursesMap = new Map()
      courses.value.forEach(c => {
        if (c.code) validCoursesMap.set(c.code.toString().trim().toLowerCase(), c.code)
        if (c.id) validCoursesMap.set(c.id.toString().trim().toLowerCase(), c.code || c.id)
      })

      // Map existing questions to identify and reject duplicates
      const existingQuestionKeys = new Set(
        questions.value.map(q => `${(q.courseId || '').toString().trim().toLowerCase()}|${(q.text || '').toString().trim().toLowerCase()}`)
      )

      const parsedQuestions = []
      let skippedInvalidCourseCount = 0
      let skippedDuplicateCount = 0

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(s => s.trim().replace(/^"|"$/g, ''))
        if (cols.length >= 8) {
          const rawCourseId = (cols[2] || '').trim()
          const questionText = (cols[7] || '').trim()

          // 1. Verify course existence in system
          const normalizedCourseKey = rawCourseId.toLowerCase()
          if (!rawCourseId || !validCoursesMap.has(normalizedCourseKey)) {
            skippedInvalidCourseCount++
            continue
          }

          // 2. Identify and eliminate duplicate questions
          const matchedCourseCode = validCoursesMap.get(normalizedCourseKey)
          const duplicateKey = `${matchedCourseCode.toLowerCase()}|${questionText.toLowerCase()}`

          if (existingQuestionKeys.has(duplicateKey)) {
            skippedDuplicateCount++
            continue
          }

          // Track question key to prevent duplicates within the same batch file
          existingQuestionKeys.add(duplicateKey)

          parsedQuestions.push({
            id: Date.now().toString() + i,
            program: cols[0] || 'Both',
            term: cols[1] || 'Midterm',
            courseId: matchedCourseCode,
            courseOutcomeId: cols[3] || '',
            learningOutcomeId: cols[4] || '',
            bloomLevel: cols[5] || 'Understanding',
            type: cols[6] || 'multiple_choice',
            text: questionText,
            options: [cols[8], cols[9], cols[10], cols[11]].filter(Boolean).map(t => ({ text: t, imageUrl: '' })),
            correctAnswer: [0],
            status: 'Pending',
            aiAccepted: false,
            retainedAi: false
          })
        }
      }

      if (parsedQuestions.length === 0) {
        let msg = 'No questions were uploaded.'
        if (skippedInvalidCourseCount > 0 || skippedDuplicateCount > 0) {
          msg += `\n\nSkipped summary:\n- Non-existent courses: ${skippedInvalidCourseCount}\n- Duplicate questions: ${skippedDuplicateCount}`
        }
        alert(msg)
        return
      }

      questions.value = [...parsedQuestions, ...questions.value]
      syncQuestionsStorage()

      let successMsg = `Imported ${parsedQuestions.length} questions successfully!`
      if (skippedInvalidCourseCount > 0 || skippedDuplicateCount > 0) {
        successMsg += `\n\nSkipped summary:\n- Course not in system: ${skippedInvalidCourseCount}\n- Duplicate question: ${skippedDuplicateCount}`
      }
      alert(successMsg)
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

onMounted(async () => {
  await fetchCourses()
  await fetchQuestions()
})
</script>