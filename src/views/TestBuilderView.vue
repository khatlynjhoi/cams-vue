<template>
  <div class="p-4 md:p-6 max-w-8xl mx-auto space-y-6 font-sans text-slate-800 antialiased relative min-h-screen bg-slate-50">
    
    <!-- BRANDED SKELETON LOADER -->
    <div v-if="isLoading" class="space-y-6 animate-pulse">
      
      <!-- Top Banner Skeleton -->
      <div class="bg-linear-to-r from-[#123524] to-[#1b4d35] p-6 rounded-2xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shadow-xs">
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 bg-emerald-500/30 rounded-md"></div>
            <div class="h-6 w-80 max-w-full bg-white/20 rounded-md"></div>
          </div>
          <div class="h-3.5 w-96 max-w-full bg-white/10 rounded-md"></div>
        </div>
        <div class="flex items-center gap-2">
          <div class="h-10 w-36 bg-white/10 rounded-xl"></div>
          <div class="h-10 w-36 bg-white/10 rounded-xl"></div>
        </div>
      </div>

      <!-- Navigation Tabs Skeleton -->
      <div class="flex items-center gap-3 border-b border-slate-200 pb-3">
        <div class="h-10 w-36 bg-slate-200 rounded-full"></div>
        <div class="h-10 w-44 bg-slate-100 rounded-full"></div>
      </div>

      <!-- Grid Layout Skeleton -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column Skeleton -->
        <div class="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
          <div class="h-5 w-40 bg-slate-200 rounded-md"></div>
          <div class="space-y-4">
            <div v-for="i in 5" :key="i" class="space-y-2">
              <div class="h-3.5 w-24 bg-slate-200 rounded-md"></div>
              <div class="h-10 bg-slate-100 rounded-xl"></div>
            </div>
          </div>
        </div>

        <!-- Right Column Skeleton -->
        <div class="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
          <div class="flex justify-between items-center pb-3 border-b border-slate-100">
            <div class="space-y-2">
              <div class="h-5 w-48 bg-slate-200 rounded-md"></div>
              <div class="h-3.5 w-64 bg-slate-100 rounded-md"></div>
            </div>
            <div class="h-9 w-44 bg-slate-200 rounded-xl"></div>
          </div>

          <div class="space-y-3">
            <div v-for="i in 3" :key="i" class="p-4 border border-slate-200/80 rounded-2xl bg-slate-50/50 space-y-3">
              <div class="flex items-center gap-2">
                <div class="h-5 w-8 bg-slate-200 rounded"></div>
                <div class="h-5 w-16 bg-slate-300 rounded"></div>
                <div class="h-5 w-16 bg-slate-200 rounded"></div>
                <div class="h-5 w-20 bg-emerald-100 rounded"></div>
              </div>
              <div class="h-4 w-5/6 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- MAIN VIEW CONTENT -->
    <div v-else class="space-y-6">

      <!-- Header Hero Banner -->
      <div class="bg-[#123524] text-white p-6 rounded-2xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shadow-xs">
        <div class="space-y-1">
          <h1 class="text-xl font-bold flex items-center gap-2 text-white tracking-tight">
            <FileText class="text-emerald-400" :size="22" />
            Assessment Examination Builder
          </h1>
          <p class="text-sm text-slate-200 font-normal">
            Assemble examinations and auto-populate blueprints directly from accurate Question Bank data.
          </p>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button 
            v-if="activeTab === 'builder'"
            @click="isAiModalOpen = true"
            class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl flex items-center gap-2 transition shadow-xs cursor-pointer"
          >
            <Sparkles :size="14" />
            <span>AI Auto-Assemble</span>
          </button>

          <button 
            v-if="activeTab === 'builder'"
            @click="saveTest"
            class="px-4 py-2.5 bg-[#123524] hover:bg-[#0e2a1d] text-white text-sm font-bold rounded-xl flex items-center gap-2 transition shadow-xs border border-emerald-500/30 cursor-pointer"
          >
            <Save :size="14" />
            <span>Save Test Blueprint</span>
          </button>
        </div>
      </div>

      <!-- Navigation Tabs Bar -->
      <div class="flex items-center gap-3 border-b border-slate-200 pb-3">
        <button 
          @click="activeTab = 'builder'"
          :class="[
            'px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transition-all cursor-pointer',
            activeTab === 'builder' 
              ? 'bg-[#123524] text-white shadow-xs' 
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-xs'
          ]"
        >
          <FileText :size="15" />
          <span>Test Builder</span>
        </button>

        <button 
          @click="activeTab = 'saved'"
          :class="[
            'px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transition-all cursor-pointer',
            activeTab === 'saved' 
              ? 'bg-[#123524] text-white shadow-xs' 
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-xs'
          ]"
        >
          <List :size="15" />
          <span>Saved Tests Preview</span>
          <span 
            :class="[
              'px-2 py-0.5 text-[10px] rounded-full font-mono font-bold ml-0.5',
              activeTab === 'saved' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
            ]"
          >
            {{ savedTests.length }}
          </span>
        </button>
      </div>

      <!-- TAB 1: TEST BUILDER PAGE -->
      <div v-show="activeTab === 'builder'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left: Exam Parameters -->
        <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div class="border-b border-slate-100 pb-3">
            <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2 tracking-tight">
              <Sliders :size="18" class="text-emerald-700" /> Exam Parameters
            </h2>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1">Target Program</label>
              <select 
                v-model="examConfig.program" 
                @change="onProgramChange"
                class="w-full text-sm p-2 border border-slate-200 rounded-xl font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer text-slate-900"
              >
                <option value="" disabled selected>Select Program</option>
                <option value="BSMT">BSMT (Bachelor of Science in Marine Transportation)</option>
                <option value="BSMarE">BSMarE (Bachelor of Science in Marine Engineering)</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-1">Academic Year</label>
                <select 
                  v-model="examConfig.academicYear" 
                  @change="updateExamTitle"
                  class="w-full text-sm p-2 border border-slate-200 rounded-xl font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer text-slate-900"
                >
                  <option value="" disabled selected>Select Academic Year</option>
                  <option v-for="ay in academicYears" :key="ay" :value="ay">AY {{ ay }}</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-bold text-slate-700 mb-1">Semester</label>
                <select 
                  v-model="examConfig.semester" 
                  @change="updateExamTitle"
                  class="w-full text-sm p-2 border border-slate-200 rounded-xl font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer text-slate-900"
                >
                  <option value="" disabled selected>Select Semester</option>
                  <option value="First Semester">First Semester</option>
                  <option value="Second Semester">Second Semester</option>
                  <option value="Summer Semester">Summer Semester</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1">Course / Subject</label>
              <select 
                v-model="examConfig.course" 
                @change="onCourseChange"
                :disabled="isLoadingCourses"
                class="w-full text-sm p-2 border border-slate-200 rounded-xl font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer disabled:opacity-50 text-slate-900"
              >
                <option value="" disabled selected>Select Course</option>
                <option v-if="isLoadingCourses" value="" disabled>Loading registered courses...</option>
                <option v-else-if="filteredCourses.length === 0" value="" disabled>No courses available</option>
                <option v-for="c in filteredCourses" :key="c.id || c.code" :value="c.code">
                  {{ c.code }} - {{ c.title }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1">Assessment Term</label>
              <select 
                v-model="examConfig.term" 
                @change="onTermChange"
                class="w-full text-sm p-2 border border-slate-200 rounded-xl font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer text-slate-900"
              >
                <option value="" disabled selected>Select Term</option>
                <option value="Midterm Exam">Midterm Exam</option>
                <option value="Final Exam">Final Exam</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1">Assessment Title</label>
              <input 
                v-model="examConfig.title" 
                type="text" 
                placeholder="Select Course and Term to auto-generate title"
                class="w-full text-sm p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-900 bg-slate-50 focus:bg-white"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-1">Time Limit (Mins)</label>
                <input 
                  v-model.number="examConfig.durationMinutes" 
                  type="number" 
                  class="w-full text-sm p-2 border border-slate-200 rounded-xl font-bold text-center focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50 focus:bg-white text-slate-900"
                />
              </div>

              <div>
                <label class="block text-sm font-bold text-slate-700 mb-1">Passing Mark (%)</label>
                <input 
                  v-model.number="examConfig.passingScorePercent" 
                  type="number" 
                  class="w-full text-sm p-2 border border-slate-200 rounded-xl font-bold text-center focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50 focus:bg-white text-slate-900"
                />
              </div>
            </div>
          </div>

          <div class="border-t border-slate-100 pt-4 space-y-2.5 text-sm text-slate-600">
            <div class="flex justify-between items-center">
              <span class="font-semibold">Total Exam Items:</span>
              <span class="font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full font-mono text-[11px]">{{ totalItemsCount }} Questions</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="font-semibold">Total Points:</span>
              <span class="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-mono text-[11px]">{{ totalPoints }} Marks</span>
            </div>
          </div>
        </div>

        <!-- Right: Blueprint List -->
        <div class="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div class="space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 class="text-sm font-bold text-slate-900 tracking-tight">Assembled Test Blueprint</h2>
                <p class="text-sm text-slate-500">
                  Course: <span class="font-bold text-emerald-800">{{ examConfig.course || 'None Selected' }}</span> | 
                  Term: <span class="font-bold text-slate-700">{{ examConfig.term || 'None Selected' }}</span>
                </p>
              </div>

              <div class="flex items-center gap-2 flex-wrap">
                <!-- SORTING DROPDOWN FOR BLUEPRINT ITEMS -->
                <select 
                  v-model="blueprintSortBy"
                  @change="sortBlueprintItems"
                  :disabled="selectedItems.length === 0"
                  class="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 outline-none cursor-pointer text-slate-700 disabled:opacity-50"
                >
                  <option value="custom">Sort: Manual Order</option>
                  <option value="code_asc">Sort: Code (A-Z)</option>
                  <option value="code_desc">Sort: Code (Z-A)</option>
                  <option value="co">Sort: Course Outcome (CO)</option>
                  <option value="lo">Sort: Learning Outcome (LO)</option>
                  <option value="bloom">Sort: Bloom's Taxonomy</option>
                  <option value="type">Sort: Question Type</option>
                </select>

                <button 
                  @click="isQuestionModalOpen = true"
                  :disabled="!examConfig.course"
                  class="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed text-emerald-800 border border-emerald-300 font-bold text-sm rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus :size="14" />
                  <span>Add from Question Bank</span>
                </button>

                <span class="text-sm font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200">
                  {{ totalItemsCount }} Selected
                </span>
              </div>
            </div>

            <div v-if="isLoadingQuestions" class="p-8 text-center text-slate-500 text-sm font-semibold animate-pulse">
              Loading question bank items for {{ examConfig.course }}...
            </div>

            <div v-else-if="selectedItems.length === 0" class="p-8 text-center text-slate-400 text-sm italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              No questions selected for this exam. Click "Add from Question Bank" or use AI Auto-Assemble.
            </div>

            <div v-else class="space-y-3">
              <div 
                v-for="(item, idx) in selectedItems" 
                :key="item.id || idx"
                class="p-4 border border-slate-200 rounded-2xl hover:border-emerald-300 transition-all flex items-start justify-between gap-4 bg-slate-50/40 shadow-xs"
              >
                <div class="space-y-2 flex-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-sm font-mono font-bold text-slate-400">#{{ idx + 1 }}</span>
                    <span class="px-2 py-0.5 bg-[#123524] text-white font-mono text-[11px] font-bold rounded-md">
                      {{ item.code }}
                    </span>

                    <span 
                      :class="[
                        'text-[11px] font-bold border px-2 py-0.5 rounded-md flex items-center gap-1 font-mono',
                        item.co === 'Unassigned' 
                          ? 'bg-amber-50 text-amber-800 border-amber-200' 
                          : 'bg-slate-100 text-slate-800 border-slate-200'
                      ]"
                    >
                      <Target :size="11" :class="item.co === 'Unassigned' ? 'text-amber-600' : 'text-slate-600'" />
                      <span>CO: {{ item.co }}</span>
                    </span>

                    <span 
                      :class="[
                        'text-[11px] font-bold border px-2 py-0.5 rounded-md flex items-center gap-1 font-mono',
                        item.lo === 'Unassigned' 
                          ? 'bg-amber-50 text-amber-800 border-amber-200' 
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      ]"
                    >
                      <Layers :size="11" :class="item.lo === 'Unassigned' ? 'text-amber-600' : 'text-emerald-600'" />
                      <span>LO: {{ item.lo }}</span>
                    </span>

                    <span class="text-[11px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
                      {{ item.bloomLevel }}
                    </span>

                    <span class="text-[10px] font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded-md uppercase">
                      {{ item.type }}
                    </span>
                  </div>
                  <p class="text-sm font-semibold text-slate-800 pt-0.5 leading-relaxed">{{ item.text }}</p>
                  
                  <!-- Attachment Image Preview in Builder List -->
                  <div v-if="getQuestionImage(item)" class="pt-1">
                    <img 
                      :src="getQuestionImage(item)" 
                      alt="Question attachment" 
                      class="h-16 max-w-xs object-cover rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                </div>

                <div class="flex items-center gap-3 shrink-0">
                  <!-- REORDER QUESTION SEQUENCE CONTROLS -->
                  <div class="flex items-center gap-0.5 bg-slate-100 border border-slate-200 rounded-xl p-0.5">
                    <button 
                      @click="moveItemUp(idx)" 
                      :disabled="idx === 0"
                      class="p-1 text-slate-500 hover:text-emerald-700 hover:bg-white rounded-lg disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                      title="Move Question Up"
                    >
                      <ChevronUp :size="15" />
                    </button>
                    <button 
                      @click="moveItemDown(idx)" 
                      :disabled="idx === selectedItems.length - 1"
                      class="p-1 text-slate-500 hover:text-emerald-700 hover:bg-white rounded-lg disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                      title="Move Question Down"
                    >
                      <ChevronDown :size="15" />
                    </button>
                  </div>

                  <div class="text-right">
                    <span class="text-[10px] block text-slate-400 font-bold uppercase">Points</span>
                    <input 
                      v-model.number="item.points" 
                      type="number" 
                      min="1" 
                      class="w-14 border border-slate-200 rounded-xl text-center text-sm font-bold py-1 outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                  </div>

                  <button 
                    @click="removeItem(idx)" 
                    class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Remove Item"
                  >
                    <Trash2 :size="16" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="pt-4 border-t border-slate-100 flex justify-end">
            <button 
              @click="saveTest" 
              class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save :size="14" />
              <span>Save Test Blueprint</span>
            </button>
          </div>
        </div>
      </div>

      <!-- TAB 2: SAVED TESTS PREVIEW PAGE -->
      <div v-show="activeTab === 'saved'" class="space-y-6">
        
        <!-- Search, Filter & Sort Controls Bar -->
        <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            
            <div class="relative lg:col-span-2">
              <Search :size="14" class="absolute left-3 top-3 text-slate-400" />
              <input 
                v-model="savedSearchQuery"
                type="text"
                placeholder="Search by title, course, or program..."
                class="w-full text-sm pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
              />
            </div>

            <div>
              <select 
                v-model="savedFilterProgram"
                class="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="">All Programs</option>
                <option v-for="p in uniqueSavedPrograms" :key="p" :value="p">{{ p }}</option>
              </select>
            </div>

            <div>
              <select 
                v-model="savedFilterCourse"
                class="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="">All Courses</option>
                <option v-for="c in uniqueSavedCourses" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>

            <div>
              <select 
                v-model="savedSortBy"
                class="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="oldest">Sort: Oldest First</option>
                <option value="title_asc">Sort: Title A-Z</option>
                <option value="items_desc">Sort: Most Questions</option>
              </select>
            </div>
          </div>

          <div class="flex items-center justify-between text-sm pt-1 border-t border-slate-100">
            <span class="text-slate-500 font-medium">
              Showing <strong class="text-slate-800 font-bold">{{ filteredSavedTests.length }}</strong> of {{ savedTests.length }} saved test(s)
            </span>

            <button 
              v-if="savedSearchQuery || savedFilterProgram || savedFilterCourse || savedFilterTerm || savedSortBy !== 'newest'"
              @click="resetSavedFilters"
              class="text-emerald-800 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw :size="12" />
              <span>Clear Filters</span>
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredSavedTests.length === 0" class="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-xs">
          <div class="p-3 bg-slate-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto text-slate-400">
            <List :size="24" />
          </div>
          <h3 class="text-sm font-bold text-slate-800">No Saved Tests Match Criteria</h3>
          <p class="text-sm text-slate-500 max-w-sm mx-auto">
            Try adjusting or clearing your search filters, or construct a new examination blueprint in the Test Builder.
          </p>
          <button 
            @click="resetSavedFilters"
            class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition cursor-pointer"
          >
            Reset Filters
          </button>
        </div>

        <!-- Clean List View -->
        <div v-else class="space-y-3">
          <div 
            v-for="test in filteredSavedTests" 
            :key="test.id"
            class="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div class="space-y-1.5 flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="px-2.5 py-0.5 bg-[#123524] text-white font-mono text-[10px] font-bold rounded-md">
                  {{ test.program || 'GENERAL' }}
                </span>
                <span class="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 font-bold text-[10px] rounded-md border border-emerald-200">
                  {{ test.term || 'Exam' }}
                </span>
                <span class="text-[11px] font-bold text-slate-400 flex items-center gap-1 font-mono">
                  <Calendar :size="12" />
                  <span>Saved: {{ test.savedAt }}</span>
                </span>
              </div>

              <h3 class="text-base font-bold text-slate-900 leading-snug">{{ test.title }}</h3>

              <p class="text-sm text-slate-500 font-medium">
                Course: <strong class="text-emerald-800 font-bold">{{ test.course }}</strong>
                <span v-if="test.academicYear"> | AY: {{ test.academicYear }}</span>
                <span v-if="test.semester"> ({{ test.semester }})</span>
              </p>
            </div>

            <!-- Stats Metadata Pills -->
            <div class="flex items-center gap-3 shrink-0 text-sm">
              <div class="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-center">
                <span class="block text-[10px] text-slate-400 font-bold uppercase">Items</span>
                <span class="font-bold text-slate-800 font-mono text-sm">{{ test.totalItems }} Questions</span>
              </div>

              <div class="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-center">
                <span class="block text-[10px] text-slate-400 font-bold uppercase">Marks</span>
                <span class="font-bold text-emerald-800 font-mono text-sm">{{ test.totalPoints }} Points</span>
              </div>

              <div class="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-center">
                <span class="block text-[10px] text-slate-400 font-bold uppercase">Time</span>
                <span class="font-bold text-slate-800 text-sm">{{ test.durationMinutes }} Mins</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4 shrink-0">
              <button 
                @click="viewSavedTestDetails(test)"
                class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Open Exam Preview Modal"
              >
                <Eye :size="14" />
                <span>Exam Preview</span>
              </button>

              <button 
                @click="loadTestToBuilder(test)"
                class="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-sm font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                title="Edit in Test Builder"
              >
                <FileText :size="14" />
                <span>Load Builder</span>
              </button>

              <button 
                @click="deleteSavedTest(test.id)"
                class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                title="Delete Test Blueprint"
              >
                <Trash2 :size="16" />
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- BULK QUESTION SELECTION MODAL -->
    <div v-if="isQuestionModalOpen" class="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        <div class="p-5 bg-[#123524] text-white flex justify-between items-center">
          <div class="flex items-center gap-2.5">
            <BookOpen :size="20" class="text-emerald-400" />
            <div>
              <h3 class="text-base font-bold text-white">Select Questions from Question Bank</h3>
              <p class="text-sm text-slate-200">
                Course: <span class="font-bold text-emerald-300">{{ examConfig.course }}</span> (Approved Only)
              </p>
            </div>
          </div>
          <button @click="isQuestionModalOpen = false" class="text-slate-300 hover:text-white transition cursor-pointer">
            <X :size="20" />
          </button>
        </div>

        <div class="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div class="relative lg:col-span-2">
            <Search :size="14" class="absolute left-3 top-3 text-slate-400" />
            <input 
              v-model="searchQuery"
              type="text"
              placeholder="Search code, text, CO, or LO..."
              class="w-full text-sm pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Course Outcome</label>
            <select 
              v-model="filterCO"
              class="w-full text-sm py-1.5 px-2 bg-white border border-slate-200 rounded-xl outline-none font-bold focus:ring-2 focus:ring-emerald-500 cursor-pointer text-slate-800"
            >
              <option value="">All Course Outcomes</option>
              <option v-for="co in availableCOs" :key="co" :value="co">{{ co }}</option>
            </select>
          </div>

          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Learning Outcome</label>
            <select 
              v-model="filterLO"
              class="w-full text-sm py-1.5 px-2 bg-white border border-slate-200 rounded-xl outline-none font-bold focus:ring-2 focus:ring-emerald-500 cursor-pointer text-slate-800"
            >
              <option value="">All Learning Outcomes</option>
              <option v-for="lo in availableLOs" :key="lo" :value="lo">{{ lo }}</option>
            </select>
          </div>

          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Question Type</label>
            <select 
              v-model="filterType"
              class="w-full text-sm py-1.5 px-2 bg-white border border-slate-200 rounded-xl outline-none font-bold focus:ring-2 focus:ring-emerald-500 cursor-pointer text-slate-800"
            >
              <option value="">All Question Types</option>
              <option v-for="t in availableTypes" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
        </div>

        <div class="px-5 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between text-sm">
          <button 
            @click="toggleSelectAllFiltered"
            class="flex items-center gap-2 font-bold text-slate-700 hover:text-emerald-800 cursor-pointer"
          >
            <CheckSquare v-if="isAllFilteredSelected" :size="16" class="text-emerald-600" />
            <Square v-else :size="16" class="text-slate-400" />
            <span>Select All Filtered Items ({{ filteredQuestionBank.length }})</span>
          </button>

          <div class="flex items-center gap-2">
            <span class="text-slate-400 font-medium">Sort by:</span>
            <select v-model="sortBy" class="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-sm font-bold outline-none cursor-pointer text-slate-800">
              <option value="code_asc">Code (Ascending)</option>
              <option value="code_desc">Code (Descending)</option>
              <option value="co">Course Outcome (CO)</option>
              <option value="lo">Learning Outcome (LO)</option>
              <option value="type">Question Type</option>
            </select>
          </div>
        </div>

        <div class="p-5 overflow-y-auto flex-1 space-y-3 bg-slate-50/50">
          <div v-if="filteredQuestionBank.length === 0" class="p-10 text-center text-slate-400 text-sm italic">
            No approved questions found in the Question Bank matching your criteria.
          </div>

          <div 
            v-for="q in filteredQuestionBank" 
            :key="q.id"
            @click="togglePickerItem(q.id)"
            :class="[
              'p-4 border rounded-2xl transition-all cursor-pointer flex items-start gap-3',
              pickerSelectedIds.includes(q.id) 
                ? 'bg-emerald-50/80 border-emerald-300 shadow-xs' 
                : 'bg-white border-slate-200 hover:border-slate-300'
            ]"
          >
            <div class="pt-0.5">
              <CheckSquare v-if="pickerSelectedIds.includes(q.id)" :size="18" class="text-emerald-600" />
              <Square v-else :size="18" class="text-slate-300" />
            </div>

            <div class="space-y-2 flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="px-2 py-0.5 bg-[#123524] text-white font-mono text-sm font-bold rounded-md">
                  {{ q.code }}
                </span>

                <span 
                  :class="[
                    'text-[11px] font-bold border px-2 py-0.5 rounded-md flex items-center gap-1 font-mono',
                    q.co === 'Unassigned' 
                      ? 'bg-amber-50 text-amber-800 border-amber-200' 
                      : 'bg-slate-100 text-slate-800 border-slate-200'
                  ]"
                >
                  <Target :size="11" :class="q.co === 'Unassigned' ? 'text-amber-600' : 'text-slate-600'" />
                  <span>CO: {{ q.co }}</span>
                </span>

                <span 
                  :class="[
                    'text-[11px] font-bold border px-2 py-0.5 rounded-md flex items-center gap-1 font-mono',
                    q.lo === 'Unassigned' 
                      ? 'bg-amber-50 text-amber-800 border-amber-200' 
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  ]"
                >
                  <Layers :size="11" :class="q.lo === 'Unassigned' ? 'text-amber-600' : 'text-emerald-600'" />
                  <span>LO: {{ q.lo }}</span>
                </span>

                <span class="text-[11px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
                  {{ q.bloomLevel }}
                </span>

                <span class="text-[10px] font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded-md uppercase">
                  {{ q.type }}
                </span>
              </div>

              <p class="text-sm font-semibold text-slate-800 leading-relaxed">
                {{ q.text }}
              </p>

              <div v-if="getQuestionImage(q)" class="pt-1">
                <img 
                  :src="getQuestionImage(q)" 
                  alt="Attachment preview" 
                  class="h-14 max-w-xs object-cover rounded-xl border border-slate-200 bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 bg-white border-t border-slate-200 flex justify-between items-center">
          <span class="text-sm font-bold text-slate-700">
            {{ pickerSelectedIds.length }} question(s) checked
          </span>

          <div class="flex gap-2">
            <button 
              @click="isQuestionModalOpen = false"
              class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button 
              @click="importSelectedQuestions"
              :disabled="pickerSelectedIds.length === 0"
              class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <Plus :size="14" />
              <span>Add Selected to Blueprint</span>
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- SAVED TEST FULL EXAM PREVIEW MODAL -->
    <div v-if="isPreviewModalOpen && selectedTestPreview" class="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        <!-- Modal Header -->
        <div class="p-5 bg-[#123524] text-white flex justify-between items-center">
          <div>
            <h3 class="text-base font-bold text-white">{{ selectedTestPreview.title }}</h3>
            <p class="text-sm text-slate-200">
              Course: <span class="font-bold text-emerald-300">{{ selectedTestPreview.course }}</span> | 
              Total Items: <span class="font-bold text-emerald-300">{{ selectedTestPreview.totalItems }} Questions</span> ({{ selectedTestPreview.totalPoints }} Points)
            </p>
          </div>
          <button @click="isPreviewModalOpen = false" class="text-slate-300 hover:text-white transition cursor-pointer">
            <X :size="20" />
          </button>
        </div>

        <!-- Exam Questions Body -->
        <div class="p-5 overflow-y-auto flex-1 space-y-5 bg-slate-50">
          <div 
            v-for="(item, idx) in selectedTestPreview.items" 
            :key="item.id || idx"
            class="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs"
          >
            <!-- Item Meta Header -->
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-sm font-mono font-bold text-slate-400">#{{ idx + 1 }}</span>
              <span class="px-2 py-0.5 bg-[#123524] text-white font-mono text-sm font-bold rounded-md">
                {{ item.code }}
              </span>
              <span class="text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded-md font-mono">
                CO: {{ item.co }}
              </span>
              <span class="text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-mono">
                LO: {{ item.lo }}
              </span>
              <span class="text-[11px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
                {{ item.bloomLevel }}
              </span>
              <span class="text-[10px] font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded-md uppercase">
                {{ item.type }}
              </span>
              <span class="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md ml-auto">
                {{ item.points || 1 }} Marks
              </span>
            </div>

            <!-- Question Prompt Text -->
            <p class="text-sm font-bold text-slate-900 leading-relaxed">{{ item.text }}</p>

            <!-- Question Attachment Image -->
            <div v-if="getQuestionImage(item)" class="my-2">
              <img 
                :src="getQuestionImage(item)" 
                alt="Question diagram or visual attachment" 
                class="rounded-2xl border border-slate-200 max-h-60 object-contain bg-slate-50 p-1"
              />
            </div>

            <!-- MATCHING PAIRS DISPLAY GRID -->
            <div v-if="getMatchingPairs(item).length > 0" class="my-3 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers :size="13" class="text-emerald-700" />
                  Matching Pairs & Correct Answers ({{ getMatchingPairs(item).length }} Pairs)
                </span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div 
                  v-for="(pair, pIdx) in getMatchingPairs(item)" 
                  :key="pair.id || pIdx"
                  class="p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-sm"
                >
                  <div class="flex items-center gap-2 flex-1 min-w-0">
                    <span class="font-bold text-slate-400 font-mono text-[11px]">#{{ pIdx + 1 }}</span>
                    <img 
                      v-if="pair.leftImage" 
                      :src="pair.leftImage" 
                      alt="Pair visual" 
                      class="w-12 h-12 object-cover rounded-lg border border-slate-200 bg-white shrink-0"
                    />
                    <span class="font-semibold text-slate-800 truncate">{{ pair.leftText }}</span>
                  </div>

                  <ArrowRight :size="14" class="text-emerald-700 shrink-0" />

                  <div class="flex items-center gap-2 flex-1 justify-end min-w-0">
                    <span class="font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300 truncate font-mono text-[11px]">
                      {{ pair.rightText }}
                    </span>
                    <img 
                      v-if="pair.rightImage" 
                      :src="pair.rightImage" 
                      alt="Target visual" 
                      class="w-12 h-12 object-cover rounded-lg border border-slate-200 bg-white shrink-0"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- MULTIPLE CHOICE OPTIONS LIST -->
            <div v-else-if="getQuestionOptions(item).length > 0" class="space-y-1.5 pl-2 border-l-2 border-slate-200 my-2">
              <div 
                v-for="(opt, optIdx) in getQuestionOptions(item)" 
                :key="optIdx"
                :class="[
                  'text-sm p-2.5 rounded-xl flex items-start gap-2 font-medium transition-colors border',
                  isOptionCorrect(item, optIdx) 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' 
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                ]"
              >
                <span class="font-bold text-slate-500">{{ String.fromCharCode(65 + optIdx) }}.</span>
                <span class="flex-1">{{ opt.text }}</span>
                <span v-if="isOptionCorrect(item, optIdx)" class="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-md">
                  Correct Choice
                </span>
              </div>
            </div>

            <!-- EXPLICIT CORRECT ANSWER KEY BANNER -->
            <div class="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between text-sm text-emerald-900">
              <div class="flex items-center gap-1.5 font-bold">
                <CheckCircle2 :size="15" class="text-emerald-700" />
                <span>Correct Answer Key:</span>
              </div>
              <span class="font-bold font-mono text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300">
                {{ getCorrectAnswer(item) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="p-4 bg-white border-t border-slate-200 flex justify-end">
          <button 
            @click="isPreviewModalOpen = false"
            class="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>

    <!-- AI Blueprint Auto-Assemble Modal -->
    <div v-if="isAiModalOpen" class="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-slate-200">
        <div class="flex items-center gap-3 text-emerald-800">
          <div class="p-2.5 bg-emerald-100 rounded-2xl text-emerald-800">
            <Sparkles :size="24" />
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900">AI Blueprint Builder</h3>
            <p class="text-sm text-slate-500">Automatically select balanced items from approved questions.</p>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Target Item Count</label>
            <input 
              v-model.number="aiBlueprint.targetTotalItems" 
              type="number" 
              class="w-full text-sm p-2.5 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50 focus:bg-white text-slate-900"
            />
          </div>

          <div class="space-y-1.5">
            <span class="block text-sm font-bold text-slate-700">Cognitive Balance (Bloom's Taxonomy)</span>
            <div class="grid grid-cols-3 gap-2 text-center text-sm">
              <div class="bg-slate-50 border border-slate-200 p-2.5 rounded-2xl">
                <span class="block text-slate-500 text-[11px] font-medium">Easy</span>
                <span class="font-bold text-emerald-900 text-sm">{{ aiBlueprint.easyPercent }}%</span>
              </div>
              <div class="bg-slate-50 border border-slate-200 p-2.5 rounded-2xl">
                <span class="block text-slate-500 text-[11px] font-medium">Medium</span>
                <span class="font-bold text-emerald-900 text-sm">{{ aiBlueprint.mediumPercent }}%</span>
              </div>
              <div class="bg-slate-50 border border-slate-200 p-2.5 rounded-2xl">
                <span class="block text-slate-500 text-[11px] font-medium">Hard</span>
                <span class="font-bold text-emerald-900 text-sm">{{ aiBlueprint.hardPercent }}%</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <button 
            @click="isAiModalOpen = false" 
            class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
          <button 
            @click="autoAssembleTest" 
            :disabled="isAutoBuilding"
            class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-xs transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Sparkles :size="14" :class="{ 'animate-spin': isAutoBuilding }" />
            <span>{{ isAutoBuilding ? 'Assembling...' : 'Assemble Items' }}</span>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

import { 
  Sparkles, 
  Sliders, 
  Trash2, 
  Save,
  Plus,
  Search,
  X,
  CheckSquare,
  Square,
  BookOpen,
  Layers,
  Target,
  List,
  FileText,
  Eye,
  Calendar,
  RotateCcw,
  CheckCircle2,
  Image as ImageIcon,
  ArrowRight,
  ChevronUp,
  ChevronDown
} from 'lucide-vue-next'

// PURGE LEGACY STORAGE KEY TO PREVENT MOCK COURSE DESYNC
localStorage.removeItem('cams_courses')

// STATE
const activeTab = ref('builder')
const isLoading = ref(true)

// MASTER REGISTRIES
const masterCourseOutcomes = ref([])
const masterLearningOutcomes = ref([])

// COURSES & QUESTION BANK STATE
const courses = ref([])
const availableQuestionBank = ref([])
const isLoadingCourses = ref(false)
const isLoadingQuestions = ref(false)

// SAVED TESTS STATE
const savedTests = ref([])
const selectedTestPreview = ref(null)
const isPreviewModalOpen = ref(false)

// SEARCH & FILTER STATE
const savedSearchQuery = ref('')
const savedFilterProgram = ref('')
const savedFilterCourse = ref('')
const savedFilterTerm = ref('')
const savedSortBy = ref('newest')

// ACADEMIC YEARS
const currentYear = new Date().getFullYear()
const academicYears = computed(() => {
  const years = []
  for (let i = 0; i < 10; i++) {
    const start = currentYear + i
    const end = start + 1
    years.push(`${start}-${end}`)
  }
  return years
})

// EXAM CONFIG
const examConfig = ref({
  program: '',
  academicYear: '',
  semester: '',
  course: '',
  term: '',
  title: '',
  durationMinutes: 60,
  passingScorePercent: 75
})

// MODALS STATE
const isAiModalOpen = ref(false)
const isAutoBuilding = ref(false)
const isQuestionModalOpen = ref(false)

// QUESTION PICKER STATE
const searchQuery = ref('')
const filterCO = ref('')
const filterLO = ref('')
const filterType = ref('')
const sortBy = ref('code_asc')
const pickerSelectedIds = ref([])

const blueprintSortBy = ref('custom')

const aiBlueprint = ref({
  targetTotalItems: 10,
  easyPercent: 30,
  mediumPercent: 50,
  hardPercent: 20
})

const selectedItems = ref([])

const totalPoints = computed(() => selectedItems.value.reduce((sum, item) => sum + Number(item.points || 0), 0))
const totalItemsCount = computed(() => selectedItems.value.length)

// PROXY-AWARE API HELPER
async function fetchFromEndpoints(path, options = {}) {
  const token = localStorage.getItem('cams_token') || localStorage.getItem('token') || ''
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  }

  try {
    const res = await fetch(`/api${path}`, { ...options, headers })
    if (res.ok) {
      const json = await res.json()
      return json?.data ?? json
    }
  } catch (e) {
    // Local fallback
  }
  throw new Error(`Endpoint ${path} unreachable`)
}

function resolveImageUrl(path) {
  if (!path || typeof path !== 'string') return null
  const clean = path.trim()
  if (!clean) return null
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('data:')) {
    return clean
  }
  const relativePath = clean.startsWith('/') ? clean.substring(1) : clean
  return `${window.location.origin}/${relativePath}`
}

function getQuestionImage(item) {
  if (!item) return null
  const raw = item.image || item.image_url || item.imageUrl || item.picture || item.media_url || item.media || item.attachment || item.attachment_url || item.file_path || item.question_image || item.img
  return resolveImageUrl(raw)
}

function getMatchingPairs(item) {
  if (!item) return []

  const lefts = item.left_items || item.leftItems || item.prompts || item.left_side
  const rights = item.right_items || item.rightItems || item.matches || item.right_side
  if (Array.isArray(lefts) && Array.isArray(rights)) {
    return lefts.map((l, idx) => ({
      id: idx + 1,
      leftText: typeof l === 'object' ? (l.text || l.label || l.name || `Item ${idx + 1}`) : String(l),
      leftImage: resolveImageUrl(typeof l === 'object' ? (l.image || l.image_url || l.imageUrl || null) : null),
      rightText: typeof rights[idx] === 'object' ? (rights[idx].text || rights[idx].label || rights[idx].name || `Match ${idx + 1}`) : String(rights[idx] || ''),
      rightImage: resolveImageUrl(typeof rights[idx] === 'object' ? (rights[idx].image || rights[idx].image_url || rights[idx].imageUrl || null) : null)
    }))
  }

  const rawPairs = item.pairs || item.matching_pairs || item.matchingPairs || item.match_pairs || item.matches || item.pairs_data || item.question_pairs || item.match_items
  if (rawPairs && typeof rawPairs === 'object' && !Array.isArray(rawPairs)) {
    return Object.entries(rawPairs).map(([k, v], idx) => ({
      id: idx + 1,
      leftText: String(k),
      leftImage: resolveImageUrl(k),
      rightText: String(v),
      rightImage: resolveImageUrl(v)
    }))
  }

  let list = []
  if (Array.isArray(rawPairs)) {
    list = rawPairs
  } else if (Array.isArray(item.options)) {
    const isMatchingFormat = item.options.some(o => typeof o === 'object' && o !== null && (o.left || o.left_side || o.prompt || o.match || o.right || o.right_side || o.pair || o.left_text || o.left_image))
    if (isMatchingFormat) list = item.options
  }

  if (list.length > 0) {
    return list.map((p, index) => {
      if (typeof p === 'object' && p !== null) {
        const leftVal = p.left ?? p.left_text ?? p.leftText ?? p.left_side ?? p.prompt ?? p.question ?? p.term ?? p.item ?? p.left_content ?? p.key ?? p.text ?? ''
        const leftImg = p.left_image ?? p.leftImage ?? p.left_img ?? p.prompt_image ?? p.image ?? p.image_url ?? p.imageUrl ?? p.left_photo ?? null

        const rightVal = p.right ?? p.right_text ?? p.rightText ?? p.right_side ?? p.match ?? p.answer ?? p.definition ?? p.correct ?? p.right_content ?? p.value ?? p.response ?? p.target ?? ''
        const rightImg = p.right_image ?? p.rightImage ?? p.right_img ?? p.match_image ?? p.right_photo ?? null

        let resolvedLeftText = typeof leftVal === 'string' ? leftVal : String(leftVal)
        let resolvedLeftImg = resolveImageUrl(leftImg)
        if (!resolvedLeftImg && resolvedLeftText && (resolvedLeftText.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) || resolvedLeftText.includes('storage/') || resolvedLeftText.includes('uploads/'))) {
          resolvedLeftImg = resolveImageUrl(resolvedLeftText)
          resolvedLeftText = `Item ${index + 1}`
        }

        let resolvedRightText = typeof rightVal === 'string' ? rightVal : String(rightVal)
        let resolvedRightImg = resolveImageUrl(rightImg)
        if (!resolvedRightImg && resolvedRightText && (resolvedRightText.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) || resolvedRightText.includes('storage/') || resolvedRightText.includes('uploads/'))) {
          resolvedRightImg = resolveImageUrl(resolvedRightText)
          resolvedRightText = `Match ${index + 1}`
        }

        return {
          id: p.id || index + 1,
          leftText: resolvedLeftText || `Item ${index + 1}`,
          leftImage: resolvedLeftImg,
          rightText: resolvedRightText || `Match ${index + 1}`,
          rightImage: resolvedRightImg
        }
      }
      return { id: index + 1, leftText: String(p), leftImage: null, rightText: '', rightImage: null }
    })
  }

  return []
}

function getQuestionOptions(item) {
  if (!item) return []
  const opts = item.options || item.choices || item.answers || item.question_options
  if (Array.isArray(opts)) {
    const isMatching = getMatchingPairs(item).length > 0
    if (isMatching) return []

    return opts.map(o => {
      if (typeof o === 'string') return { text: o, isCorrect: false }
      if (typeof o === 'object' && o !== null) {
        return {
          text: o.text || o.option_text || o.choice_text || o.label || o.value || o.option || '',
          isCorrect: !!(o.is_correct || o.isCorrect || o.correct)
        }
      }
      return { text: String(o), isCorrect: false }
    })
  }
  return []
}

function isOptionCorrect(item, optIdx) {
  if (!item) return false
  const opts = getQuestionOptions(item)
  if (opts[optIdx] && opts[optIdx].isCorrect) return true

  let rawAns = item.correct_answer ?? item.correctAnswer ?? item.correct_answers ?? item.correctAnswers ?? item.answer
  if (typeof rawAns === 'string' && rawAns.trim().startsWith('[')) {
    try { rawAns = JSON.parse(rawAns) } catch (e) {}
  }

  if (Array.isArray(rawAns)) {
    return rawAns.some(a => String(a) === String(optIdx) || String(a).toUpperCase() === String.fromCharCode(65 + optIdx))
  }
  if (rawAns !== undefined && rawAns !== null) {
    return String(rawAns) === String(optIdx) || String(rawAns).toUpperCase() === String.fromCharCode(65 + optIdx)
  }

  return false
}

function getCorrectAnswer(item) {
  if (!item) return 'N/A'

  const pairs = getMatchingPairs(item)
  if (pairs.length > 0) {
    return `${pairs.length} Matched Pair(s)`
  }

  const options = getQuestionOptions(item)

  const formatOption = (val) => {
    if (typeof val === 'number' || (typeof val === 'string' && /^\d+$/.test(val.trim()))) {
      const idx = parseInt(val, 10)
      if (options.length > idx) {
        const letter = String.fromCharCode(65 + idx)
        const text = options[idx].text
        return text ? `${letter}. ${text}` : `Option ${letter}`
      }
      return `Option ${String.fromCharCode(65 + idx)}`
    }

    if (typeof val === 'string' && /^[a-dA-D]$/.test(val.trim())) {
      const letter = val.trim().toUpperCase()
      const idx = letter.charCodeAt(0) - 65
      if (options.length > idx && options[idx].text) {
        return `${letter}. ${options[idx].text}`
      }
      return `Option ${letter}`
    }

    return String(val)
  }

  let rawAns = item.correct_answer ?? item.correctAnswer ?? item.correct_answers ?? item.correctAnswers ?? item.answer

  if (typeof rawAns === 'string' && rawAns.trim().startsWith('[')) {
    try { rawAns = JSON.parse(rawAns) } catch (e) {}
  }

  if (Array.isArray(rawAns)) {
    if (rawAns.length === 0) return 'N/A'
    return rawAns.map(a => formatOption(a)).join(' | ')
  }

  if (rawAns !== undefined && rawAns !== null && rawAns !== '') {
    return formatOption(rawAns)
  }

  const correctOpts = options.filter(o => o.isCorrect)
  if (correctOpts.length > 0) {
    return correctOpts.map((o) => {
      const optIndex = options.indexOf(o)
      const letter = optIndex >= 0 ? String.fromCharCode(65 + optIndex) : ''
      return letter ? `${letter}. ${o.text}` : o.text
    }).join(' | ')
  }

  return 'N/A'
}

function safeParseStorage(key) {
  try {
    const val = localStorage.getItem(key)
    return val && val.trim() ? JSON.parse(val) : null
  } catch (e) {
    return null
  }
}

async function loadOutcomeMasters() {
  try {
    const coData = await fetchFromEndpoints('/course-outcomes')
    masterCourseOutcomes.value = Array.isArray(coData) ? coData : (coData?.data || [])
  } catch (e) {
    const saved = safeParseStorage('cams_course_outcomes') || safeParseStorage('cams_cos_data')
    masterCourseOutcomes.value = saved ? (Array.isArray(saved) ? saved : (saved.data || [])) : []
  }

  try {
    const loData = await fetchFromEndpoints('/learning-outcomes')
    masterLearningOutcomes.value = Array.isArray(loData) ? loData : (loData?.data || [])
  } catch (e) {
    const saved = safeParseStorage('cams_learning_outcomes') || safeParseStorage('cams_los_data')
    masterLearningOutcomes.value = saved ? (Array.isArray(saved) ? saved : (saved.data || [])) : []
  }
}

function loadSavedTests() {
  const loaded = safeParseStorage('cams_saved_tests')
  if (loaded && Array.isArray(loaded)) {
    savedTests.value = loaded
  }
}

function isQuestionApproved(q) {
  if (!q) return false
  const status = (q.status || q.approval_status || q.state || '').toString().toLowerCase().trim()
  return status === 'approved'
}

function resolveCO(q) {
  if (!q) return 'Unassigned'

  if (q.course_outcome && typeof q.course_outcome === 'object') {
    const code = q.course_outcome.code || q.course_outcome.co_code || q.course_outcome.name || q.course_outcome.title
    if (code) return String(code)
  }
  if (q.courseOutcome && typeof q.courseOutcome === 'object') {
    const code = q.courseOutcome.code || q.courseOutcome.co_code || q.courseOutcome.name || q.courseOutcome.title
    if (code) return String(code)
  }

  const directKeys = [
    'co', 'co_code', 'coCode', 'co_name', 'coName',
    'course_outcome_id', 'courseOutcomeId',
    'course_outcome_code', 'courseOutcomeCode', 'course_outcome', 'courseOutcome'
  ]

  for (const key of directKeys) {
    const val = q[key]
    if (val !== undefined && val !== null && val !== '' && val !== 'N/A') {
      if (typeof val === 'object') {
        const inner = val.code || val.co_code || val.name || val.title || val.co
        if (inner) return String(inner)
      } else {
        return String(val)
      }
    }
  }

  if (Array.isArray(q.course_outcomes) && q.course_outcomes.length > 0) {
    const first = q.course_outcomes[0]
    if (typeof first === 'object') {
      const inner = first.code || first.co_code || first.name || first.title
      if (inner) return String(inner)
    } else if (first) {
      return String(first)
    }
  }

  const coId = q.co_id || q.coId
  if (coId && masterCourseOutcomes.value.length > 0) {
    const found = masterCourseOutcomes.value.find(c => String(c.id) === String(coId) || String(c.co_id) === String(coId))
    if (found) return found.code || found.co_code || found.name || found.title || `CO-${found.id}`
  }

  return 'Unassigned'
}

function resolveLO(q) {
  if (!q) return 'Unassigned'

  if (q.learning_outcome && typeof q.learning_outcome === 'object') {
    const code = q.learning_outcome.code || q.learning_outcome.lo_code || q.learning_outcome.name || q.learning_outcome.title
    if (code) return String(code)
  }
  if (q.learningOutcome && typeof q.learningOutcome === 'object') {
    const code = q.learningOutcome.code || q.learningOutcome.lo_code || q.learningOutcome.name || q.learningOutcome.title
    if (code) return String(code)
  }

  const directKeys = [
    'lo', 'lo_code', 'loCode', 'lo_name', 'loName',
    'learning_outcome_id', 'learningOutcomeId',
    'learning_outcome_code', 'learningOutcomeCode', 'learning_outcome', 'learningOutcome'
  ]

  for (const key of directKeys) {
    const val = q[key]
    if (val !== undefined && val !== null && val !== '' && val !== 'N/A') {
      if (typeof val === 'object') {
        const inner = val.code || val.lo_code || val.name || val.title || val.lo
        if (inner) return String(inner)
      } else {
        return String(val)
      }
    }
  }

  if (Array.isArray(q.learning_outcomes) && q.learning_outcomes.length > 0) {
    const first = q.learning_outcomes[0]
    if (typeof first === 'object') {
      const inner = first.code || first.lo_code || first.name || first.title
      if (inner) return String(inner)
    } else if (first) {
      return String(first)
    }
  }

  const loId = q.lo_id || q.loId
  if (loId && masterLearningOutcomes.value.length > 0) {
    const found = masterLearningOutcomes.value.find(l => String(l.id) === String(loId) || String(l.lo_id) === String(loId))
    if (found) return found.code || found.lo_code || found.name || found.title || `LO-${found.id}`
  }

  return 'Unassigned'
}

function normalizeQuestion(q) {
  const co = resolveCO(q)
  const lo = resolveLO(q)

  const bloomLevel = 
    q.bloom_level || 
    q.bloomLevel || 
    q.blooms_level || 
    q.bloomsLevel || 
    q.bloom_taxonomy || 
    q.bloomTaxonomy || 
    q.bloom || 
    'Understanding'

  const rawType = q.question_type || q.questionType || q.type || 'multiple_choice'
  const type = rawType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

  const text = q.question_text || q.questionText || q.text || q.question || ''
  const points = q.points || q.default_points || q.score || 1
  const code = q.code || q.question_code || q.item_code || `Q-${q.id}`
  const status = q.status || q.approval_status || 'Pending'

  return {
    ...q,
    id: q.id,
    code,
    text,
    co,
    lo,
    bloomLevel,
    type,
    points,
    status
  }
}

const filteredCourses = computed(() => {
  if (!examConfig.value.program) return courses.value
  return courses.value.filter(c => {
    const prog = (c.program || '').toUpperCase()
    return prog === examConfig.value.program.toUpperCase() || prog === 'BOTH'
  })
})

const availableCOs = computed(() => {
  const cos = new Set()
  availableQuestionBank.value.forEach(q => { if (q.co) cos.add(q.co) })
  return Array.from(cos).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
})

const availableLOs = computed(() => {
  const los = new Set()
  availableQuestionBank.value.forEach(q => { if (q.lo) los.add(q.lo) })
  return Array.from(los).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
})

const availableTypes = computed(() => {
  const types = new Set()
  availableQuestionBank.value.forEach(q => { if (q.type) types.add(q.type) })
  return Array.from(types).sort()
})

const filteredQuestionBank = computed(() => {
  let result = [...availableQuestionBank.value]

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(q => 
      q.code.toLowerCase().includes(query) ||
      q.text.toLowerCase().includes(query) ||
      q.co.toLowerCase().includes(query) ||
      q.lo.toLowerCase().includes(query)
    )
  }

  if (filterCO.value) result = result.filter(q => q.co === filterCO.value)
  if (filterLO.value) result = result.filter(q => q.lo === filterLO.value)
  if (filterType.value) result = result.filter(q => q.type === filterType.value)

  if (sortBy.value === 'code_asc') {
    result.sort((a, b) => a.code.localeCompare(b.code))
  } else if (sortBy.value === 'code_desc') {
    result.sort((a, b) => b.code.localeCompare(a.code))
  } else if (sortBy.value === 'co') {
    result.sort((a, b) => a.co.localeCompare(b.co))
  } else if (sortBy.value === 'lo') {
    result.sort((a, b) => a.lo.localeCompare(b.lo))
  } else if (sortBy.value === 'type') {
    result.sort((a, b) => a.type.localeCompare(b.type))
  }

  return result
})

const uniqueSavedPrograms = computed(() => [...new Set(savedTests.value.map(t => t.program).filter(Boolean))].sort())
const uniqueSavedCourses = computed(() => [...new Set(savedTests.value.map(t => t.course).filter(Boolean))].sort())
const uniqueSavedTerms = computed(() => [...new Set(savedTests.value.map(t => t.term).filter(Boolean))].sort())

const filteredSavedTests = computed(() => {
  let result = [...savedTests.value]

  if (savedSearchQuery.value.trim()) {
    const q = savedSearchQuery.value.toLowerCase()
    result = result.filter(t => 
      (t.title && t.title.toLowerCase().includes(q)) ||
      (t.course && t.course.toLowerCase().includes(q)) ||
      (t.program && t.program.toLowerCase().includes(q))
    )
  }

  if (savedFilterProgram.value) {
    result = result.filter(t => t.program === savedFilterProgram.value)
  }

  if (savedFilterCourse.value) {
    result = result.filter(t => t.course === savedFilterCourse.value)
  }

  if (savedFilterTerm.value) {
    result = result.filter(t => t.term === savedFilterTerm.value)
  }

  if (savedSortBy.value === 'newest') {
    result.sort((a, b) => b.id - a.id)
  } else if (savedSortBy.value === 'oldest') {
    result.sort((a, b) => a.id - b.id)
  } else if (savedSortBy.value === 'title_asc') {
    result.sort((a, b) => a.title.localeCompare(b.title))
  } else if (savedSortBy.value === 'items_desc') {
    result.sort((a, b) => (b.totalItems || 0) - (a.totalItems || 0))
  }

  return result
})

function resetSavedFilters() {
  savedSearchQuery.value = ''
  savedFilterProgram.value = ''
  savedFilterCourse.value = ''
  savedFilterTerm.value = ''
  savedSortBy.value = 'newest'
}

const isAllFilteredSelected = computed(() => {
  if (filteredQuestionBank.value.length === 0) return false
  return filteredQuestionBank.value.every(q => pickerSelectedIds.value.includes(q.id))
})

function toggleSelectAllFiltered() {
  if (isAllFilteredSelected.value) {
    const filteredIds = filteredQuestionBank.value.map(q => q.id)
    pickerSelectedIds.value = pickerSelectedIds.value.filter(id => !filteredIds.includes(id))
  } else {
    const combined = new Set([...pickerSelectedIds.value, ...filteredQuestionBank.value.map(q => q.id)])
    pickerSelectedIds.value = Array.from(combined)
  }
}

function togglePickerItem(id) {
  if (pickerSelectedIds.value.includes(id)) {
    pickerSelectedIds.value = pickerSelectedIds.value.filter(item => item !== id)
  } else {
    pickerSelectedIds.value.push(id)
  }
}

function importSelectedQuestions() {
  const toAdd = availableQuestionBank.value.filter(q => pickerSelectedIds.value.includes(q.id))

  toAdd.forEach(q => {
    const exists = selectedItems.value.some(item => (item.id && item.id === q.id) || item.code === q.code)
    if (!exists) {
      selectedItems.value.push({ ...q })
    }
  })

  pickerSelectedIds.value = []
  isQuestionModalOpen.value = false
  sortBlueprintItems()
}

function moveItemUp(index) {
  if (index <= 0) return
  const temp = selectedItems.value[index]
  selectedItems.value[index] = selectedItems.value[index - 1]
  selectedItems.value[index - 1] = temp
  blueprintSortBy.value = 'custom'
}

function moveItemDown(index) {
  if (index >= selectedItems.value.length - 1) return
  const temp = selectedItems.value[index]
  selectedItems.value[index] = selectedItems.value[index + 1]
  selectedItems.value[index + 1] = temp
  blueprintSortBy.value = 'custom'
}

function sortBlueprintItems() {
  if (blueprintSortBy.value === 'custom' || selectedItems.value.length === 0) return

  const items = [...selectedItems.value]

  if (blueprintSortBy.value === 'code_asc') {
    items.sort((a, b) => (a.code || '').localeCompare(b.code || '', undefined, { numeric: true }))
  } else if (blueprintSortBy.value === 'code_desc') {
    items.sort((a, b) => (b.code || '').localeCompare(a.code || '', undefined, { numeric: true }))
  } else if (blueprintSortBy.value === 'co') {
    items.sort((a, b) => (a.co || '').localeCompare(b.co || '', undefined, { numeric: true }))
  } else if (blueprintSortBy.value === 'lo') {
    items.sort((a, b) => (a.lo || '').localeCompare(b.lo || '', undefined, { numeric: true }))
  } else if (blueprintSortBy.value === 'bloom') {
    items.sort((a, b) => (a.bloomLevel || '').localeCompare(b.bloomLevel || ''))
  } else if (blueprintSortBy.value === 'type') {
    items.sort((a, b) => (a.type || '').localeCompare(b.type || ''))
  }

  selectedItems.value = items
}

function resetFilters() {
  filterCO.value = ''
  filterLO.value = ''
  filterType.value = ''
  searchQuery.value = ''
  pickerSelectedIds.value = []
}

function updateExamTitle() {
  if (!examConfig.value.course || !examConfig.value.term) return
  const selectedCourseObj = courses.value.find(c => c.code === examConfig.value.course)
  const courseCodeStr = selectedCourseObj ? selectedCourseObj.code : examConfig.value.course
  const ayStr = examConfig.value.academicYear ? ` (${examConfig.value.academicYear}` : ''
  const semStr = examConfig.value.semester ? `, ${examConfig.value.semester})` : (ayStr ? ')' : '')

  examConfig.value.title = `${courseCodeStr} ${examConfig.value.term}${ayStr}${semStr}`
}

async function loadQuestionsForCourse(courseCode) {
  if (!courseCode) {
    availableQuestionBank.value = []
    return
  }

  resetFilters()
  isLoadingQuestions.value = true
  let rawQuestions = []

  try {
    const data = await fetchFromEndpoints(`/questions?course=${encodeURIComponent(courseCode)}&status=Approved`)
    rawQuestions = Array.isArray(data) ? data : (data?.data || [])
  } catch (err) {
    const savedBank = safeParseStorage('cams_question_bank_data') || safeParseStorage('cams_questions_data')
    if (savedBank) {
      const parsed = Array.isArray(savedBank) ? savedBank : (savedBank.data || [])
      rawQuestions = parsed.filter(q => {
        const c = (q.courseCode || q.course || q.course_code || q.course_id || '').toString().toUpperCase()
        return c === courseCode.toUpperCase() || courseCode.toUpperCase().includes(c)
      })
    }
  } finally {
    const targetProg = (examConfig.value.program || '').toUpperCase()
    const targetTerm = (examConfig.value.term || '').toLowerCase().replace('exam', '').trim()

    const approvedQuestions = rawQuestions.filter(q => {
      if (!isQuestionApproved(q)) return false

      const qCourse = (q.course?.code || q.courseCode || q.course_code || q.course_id || '').toString().toUpperCase()
      const matchesCourse = !courseCode || qCourse === courseCode.toUpperCase() || courseCode.toUpperCase().includes(qCourse) || qCourse.includes(courseCode.toUpperCase())

      const qProg = (q.program || '').toUpperCase()
      const matchesProgram = !targetProg || !qProg || qProg === 'BOTH' || qProg === 'ALL' || qProg.includes(targetProg) || targetProg.includes(qProg)

      const qTerm = (q.term || '').toLowerCase().replace('exam', '').trim()
      const matchesTerm = !targetTerm || !qTerm || qTerm === targetTerm || qTerm.includes(targetTerm) || targetTerm.includes(qTerm)

      return matchesCourse && matchesProgram && matchesTerm
    })

    availableQuestionBank.value = approvedQuestions.map(q => normalizeQuestion(q))
    isLoadingQuestions.value = false
  }
}

function onProgramChange() {
  examConfig.value.course = ''
  updateExamTitle()
}

function onCourseChange() {
  updateExamTitle()
  loadQuestionsForCourse(examConfig.value.course)
}

function onTermChange() {
  updateExamTitle()
  if (examConfig.value.course) {
    loadQuestionsForCourse(examConfig.value.course)
  }
}

async function loadCourses() {
  isLoadingCourses.value = true
  try {
    const data = await fetchFromEndpoints('/courses')
    let rawCourses = []
    if (Array.isArray(data)) {
      rawCourses = data
    } else {
      const saved = safeParseStorage('cams_courses_data')
      rawCourses = saved && Array.isArray(saved) ? saved : []
    }
    courses.value = rawCourses.filter(c => {
      if (!c || typeof c !== 'object') return false
      const code = c.code || c.course_code || c.courseCode
      const title = c.title || c.course_title || c.courseTitle || c.name
      return !!(code && String(code).trim() && title && String(title).trim())
    })
  } catch (err) {
    const saved = safeParseStorage('cams_courses_data')
    const rawCourses = saved && Array.isArray(saved) ? saved : []
    courses.value = rawCourses.filter(c => {
      if (!c || typeof c !== 'object') return false
      const code = c.code || c.course_code || c.courseCode
      const title = c.title || c.course_title || c.courseTitle || c.name
      return !!(code && String(code).trim() && title && String(title).trim())
    })
  } finally {
    isLoadingCourses.value = false
  }
}

onMounted(async () => {
  isLoading.value = true
  await loadOutcomeMasters()
  await loadCourses()
  loadSavedTests()
  setTimeout(() => {
    isLoading.value = false
  }, 400)
})

function autoAssembleTest() {
  isAutoBuilding.value = true
  setTimeout(() => {
    const available = availableQuestionBank.value.filter(
      q => !selectedItems.value.some(s => (s.id && s.id === q.id) || s.code === q.code)
    )

    const totalNeeded = aiBlueprint.value.targetTotalItems || 10
    const easyTarget = Math.round(totalNeeded * (aiBlueprint.value.easyPercent / 100))
    const hardTarget = Math.round(totalNeeded * (aiBlueprint.value.hardPercent / 100))
    const mediumTarget = totalNeeded - easyTarget - hardTarget

    const categorizeBloom = (level) => {
      const l = (level || '').toLowerCase()
      if (['remembering', 'remember', 'understanding', 'understand', 'easy'].some(k => l.includes(k))) return 'easy'
      if (['evaluating', 'evaluate', 'creating', 'create', 'hard'].some(k => l.includes(k))) return 'hard'
      return 'medium'
    }

    const easyPool = available.filter(q => categorizeBloom(q.bloomLevel) === 'easy')
    const mediumPool = available.filter(q => categorizeBloom(q.bloomLevel) === 'medium')
    const hardPool = available.filter(q => categorizeBloom(q.bloomLevel) === 'hard')

    const selected = [
      ...easyPool.slice(0, easyTarget),
      ...mediumPool.slice(0, mediumTarget),
      ...hardPool.slice(0, hardTarget)
    ]

    if (selected.length < totalNeeded) {
      const remaining = available.filter(q => !selected.some(s => (s.id && s.id === q.id) || s.code === q.code))
      selected.push(...remaining.slice(0, totalNeeded - selected.length))
    }

    selectedItems.value.push(...selected)
    isAutoBuilding.value = false
    isAiModalOpen.value = false
    sortBlueprintItems()
  }, 800)
}

function removeItem(index) {
  selectedItems.value.splice(index, 1)
}

function saveTest() {
  if (!examConfig.value.program || !examConfig.value.course || !examConfig.value.term) {
    alert('Please select Program, Course, and Term before saving.')
    return
  }

  if (selectedItems.value.length === 0) {
    alert('Please add at least one question to the exam blueprint before saving.')
    return
  }

  const newTest = {
    id: Date.now(),
    title: examConfig.value.title || `${examConfig.value.course} Exam`,
    program: examConfig.value.program,
    academicYear: examConfig.value.academicYear,
    semester: examConfig.value.semester,
    course: examConfig.value.course,
    term: examConfig.value.term,
    durationMinutes: examConfig.value.durationMinutes,
    passingScorePercent: examConfig.value.passingScorePercent,
    totalItems: totalItemsCount.value,
    totalPoints: totalPoints.value,
    items: JSON.parse(JSON.stringify(selectedItems.value)),
    savedAt: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  savedTests.value.unshift(newTest)
  localStorage.setItem('cams_saved_tests', JSON.stringify(savedTests.value))
  alert(`Test "${newTest.title}" saved successfully!`)

  selectedItems.value = []
  availableQuestionBank.value = []
  examConfig.value = {
    program: '',
    academicYear: '',
    semester: '',
    course: '',
    term: '',
    title: '',
    durationMinutes: 60,
    passingScorePercent: 75
  }
}

function deleteSavedTest(id) {
  if (confirm('Are you sure you want to delete this saved test blueprint?')) {
    savedTests.value = savedTests.value.filter(t => t.id !== id)
    localStorage.setItem('cams_saved_tests', JSON.stringify(savedTests.value))
  }
}

function loadTestToBuilder(test) {
  if (confirm('Loading this test will populate the builder with its parameters and items. Continue?')) {
    examConfig.value = {
      program: test.program || '',
      academicYear: test.academicYear || '',
      semester: test.semester || '',
      course: test.course || '',
      term: test.term || '',
      title: test.title || '',
      durationMinutes: test.durationMinutes || 60,
      passingScorePercent: test.passingScorePercent || 75
    }
    selectedItems.value = JSON.parse(JSON.stringify(test.items || []))
    if (test.course) {
      loadQuestionsForCourse(test.course)
    }
    activeTab.value = 'builder'
  }
}

function viewSavedTestDetails(test) {
  selectedTestPreview.value = test
  isPreviewModalOpen.value = true
}
</script>