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
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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

        <!-- Right Side Filter Controls -->
        <div class="flex flex-col items-end gap-2 w-full md:w-auto">
          <div class="w-full md:w-60">
            <input 
              v-model="searchQuery" 
              placeholder="Search questions..." 
              class="w-full px-3 py-1.5 border border-slate-300/80 rounded-lg bg-white text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 placeholder-slate-400 shadow-2xs"
            />
          </div>
          
          <div class="flex items-center gap-2 w-full md:w-auto">
            <select v-model="filterStatus" class="px-3 py-1.5 border border-slate-300/80 rounded-lg bg-white text-xs text-slate-700 font-medium outline-none cursor-pointer shadow-2xs">
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Disapproved">Disapproved</option>
            </select>

            <select v-model="filterProgram" class="px-3 py-1.5 border border-slate-300/80 rounded-lg bg-white text-xs text-slate-700 font-medium outline-none cursor-pointer shadow-2xs">
              <option value="All">All Programs</option>
              <option value="BSMT">BSMT</option>
              <option value="BSMarE">BSMarE</option>
              <option value="Both">Both</option>
            </select>
          </div>
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
              <!-- Badges & Controls -->
              <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-200/60 pb-2.5">
                <div class="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                  <span class="bg-slate-800 text-white px-2 py-0.5 rounded">{{ q.program || 'Both' }}</span>
                  <span class="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{{ q.term || 'Midterm' }}</span>
                  <span class="bg-purple-100 text-purple-800 px-2 py-0.5 rounded">{{ q.courseId || 'Unassigned' }}</span>
                  <span class="bg-amber-100 text-amber-900 px-2 py-0.5 rounded">Bloom's: {{ q.bloomLevel || 'Understanding' }}</span>
                  <span class="bg-slate-200 text-slate-700 px-2 py-0.5 rounded uppercase">{{ q.type }}</span>
                </div>

                <!-- Status & Action Buttons -->
                <div class="flex items-center gap-2">
                  <span :class="{
                    'bg-amber-100 text-amber-800 border-amber-300': (q.status || 'Pending') === 'Pending',
                    'bg-emerald-100 text-emerald-800 border-emerald-300': q.status === 'Approved',
                    'bg-red-100 text-red-800 border-red-300': q.status === 'Disapproved'
                  }" class="text-[11px] font-bold px-2.5 py-0.5 rounded-full border">
                    {{ q.status || 'Pending' }}
                  </span>

                  <button @click="updateQuestionStatus(q.id, 'Approved')" title="Approve Question" class="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg border border-emerald-200 transition">
                    <CheckCircle :size="15" />
                  </button>

                  <button @click="updateQuestionStatus(q.id, 'Disapproved')" title="Disapprove Question" class="p-1.5 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white rounded-lg border border-red-200 transition">
                    <XCircle :size="15" />
                  </button>

                  <button @click="deleteQuestion(q.id)" title="Delete Item" class="p-1.5 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-lg transition">
                    <Trash2 :size="15" />
                  </button>
                </div>
              </div>

              <!-- Stem -->
              <div>
                <p class="text-xs font-semibold text-slate-800">{{ q.text }}</p>
                <img v-if="q.imageUrl" :src="q.imageUrl" class="mt-2 h-24 object-cover rounded-lg border" />
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

                <div v-if="generateAiSuggestion(q).type === 'warning'" class="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <button @click="applyAiCorrection(q)" class="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition shadow-2xs flex items-center gap-1">
                    <Check :size="12" /> Apply Suggestion
                  </button>
                  <button @click="retainOriginalSettings(q)" class="px-3 py-1 bg-slate-600 hover:bg-slate-700 text-white font-bold text-[10px] rounded-lg transition shadow-2xs flex items-center gap-1">
                    <RotateCcw :size="12" /> Retain Original
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: AUTHORING FORM (ExamView Layout Matched) -->
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
              <option v-for="c in filteredCourses" :key="c.id" :value="c.id || c.code">
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
              <input type="file" accept="image/*" @change="e => handleFileUpload(e, form, 'imageUrl')" class="text-xs mt-1 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300" />
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
            <button @click="addOption" type="button" class="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1">
              <Plus :size="14" /> Add Option
            </button>
          </div>

          <div v-for="(opt, idx) in form.options" :key="idx" class="flex flex-col sm:flex-row sm:items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <div class="flex items-center gap-3 flex-1">
              <input type="checkbox" v-model="opt.isCorrect" title="Mark as correct answer" class="h-4 w-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 shrink-0" />
              <input v-model="opt.text" :placeholder="`Option ${idx + 1} text...`" class="flex-1 p-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500" />
            </div>

            <div class="flex items-center gap-2 self-end sm:self-auto">
              <!-- Option Image Upload Button -->
              <label class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300/80 cursor-pointer flex items-center gap-1.5 transition">
                <Image :size="14" class="text-slate-500" />
                <span>Image</span>
                <input type="file" accept="image/*" @change="e => handleFileUpload(e, opt, 'imageUrl')" class="hidden" />
              </label>

              <!-- Image Preview -->
              <div v-if="opt.imageUrl" class="relative">
                <img :src="opt.imageUrl" class="h-8 w-8 object-cover rounded border" />
                <button @click="removeImage(opt, 'imageUrl')" class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600">
                  <X :size="8" />
                </button>
              </div>

              <!-- Delete Option Button -->
              <button v-if="form.options.length > 2" @click="removeOption(idx)" title="Remove option" class="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition">
                <Trash2 :size="16" />
              </button>
            </div>
          </div>
        </div>

        <!-- MATCHING TYPE PAIRS -->
        <div v-if="form.type === 'matching'" class="space-y-3 border border-slate-200 p-4 rounded-xl bg-slate-50/30">
          <div class="flex justify-between items-center mb-1">
            <span class="text-xs font-bold text-slate-700">Matching Pairs (Item ⟶ Correct Match)</span>
            <button @click="addMatchingPair" type="button" class="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1">
              <Plus :size="14" /> Add Matching Pair
            </button>
          </div>

          <div v-for="(pair, idx) in form.matchingPairs" :key="idx" class="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-xs text-slate-600">Pair #{{ idx + 1 }}</span>
              <button v-if="form.matchingPairs.length > 2" @click="removeMatchingPair(idx)" title="Remove Pair" class="text-red-500 hover:bg-red-50 p-1 rounded">
                <Trash2 :size="14" />
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <!-- Left Side Item -->
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

              <!-- Right Side Match -->
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
          <p class="text-xs text-slate-500">View question counts, approval status, and AI overrides grouped per course.</p>
        </div>

        <button @click="exportCourseReportCSV" type="button" class="px-4 py-2 bg-[#00c068] hover:bg-[#00a358] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition shadow-2xs">
          <Download :size="14" /> Export Report CSV
        </button>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div class="bg-slate-50 border p-4 rounded-xl">
          <span class="text-[11px] font-bold text-slate-500 block uppercase">Total Questions</span>
          <span class="text-xl font-extrabold text-slate-900">{{ overallReportSummary.total }}</span>
        </div>
        <div class="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
          <span class="text-[11px] font-bold text-emerald-700 block uppercase">Approved</span>
          <span class="text-xl font-extrabold text-emerald-800">{{ overallReportSummary.approved }}</span>
        </div>
        <div class="bg-amber-50 border border-amber-100 p-4 rounded-xl">
          <span class="text-[11px] font-bold text-amber-700 block uppercase">Pending Review</span>
          <span class="text-xl font-extrabold text-amber-800">{{ overallReportSummary.pending }}</span>
        </div>
        <div class="bg-red-50 border border-red-100 p-4 rounded-xl">
          <span class="text-[11px] font-bold text-red-700 block uppercase">Disapproved</span>
          <span class="text-xl font-extrabold text-red-800">{{ overallReportSummary.disapproved }}</span>
        </div>
        <div class="bg-blue-50 border border-blue-100 p-4 rounded-xl">
          <span class="text-[11px] font-bold text-blue-700 block uppercase">AI Retained</span>
          <span class="text-xl font-extrabold text-blue-800">{{ overallReportSummary.retainedAi }}</span>
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
                <span class="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold text-[11px]">{{ report.retainedAi }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { 
  Plus, Trash2, X, Upload, Download, Image,
  CheckCircle, XCircle, Sparkles, ChevronDown, ChevronRight, Check,
  Database, PlusCircle, BarChart2, Save, FileText, RotateCcw
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
  } font-mediumally {
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