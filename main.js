/* ============================================
   Main Orchestration — UI state & event wiring
   ============================================ */

   let currentResults = [];

   const analyzeBtn      = document.getElementById('analyzeBtn');
   const loadingState    = document.getElementById('loadingState');
   const resultsSection  = document.getElementById('resultsSection');
   const resultsBody     = document.getElementById('resultsBody');
   const noResults       = document.getElementById('noResults');
   const tableContainer  = document.getElementById('tableContainer');
   const candidateCount  = document.getElementById('candidateCount');
   const jobTitleInput   = document.getElementById('jobTitle');
   const jobDescInput    = document.getElementById('jobDescription');
   const loadSampleJdBtn = document.getElementById('loadSampleJd');
   
   function renderResults(results) {
       resultsBody.innerHTML = '';
       candidateCount.textContent = results.length;
   
       if (results.length === 0) {
           noResults.classList.remove('hidden');
           tableContainer.classList.add('hidden');
           return;
       }
   
       noResults.classList.add('hidden');
       tableContainer.classList.remove('hidden');
   
       results.forEach((r, idx) => {
           const row = document.createElement('tr');
           row.className = 'cursor-pointer transition';
           row.dataset.index = idx;
   
           const barColor = r.score > 70
               ? '#0d9488'
               : r.score > 40
                   ? '#f59e0b'
                   : '#ef4444';
   
           const scoreColor = r.score > 70
               ? 'text-teal-700'
               : r.score > 40
                   ? 'text-amber-600'
                   : 'text-red-600';
   
           row.innerHTML = `
               <td class="px-4 py-3 font-medium text-slate-800">${r.name}</td>
               <td class="px-4 py-3">
                   <div class="flex items-center gap-3">
                       <span class="font-bold ${scoreColor}">${r.score}</span>
                       <div class="score-bar-bg w-20">
                           <div class="score-bar-fill" style="width:${r.score}%; background:${barColor};"></div>
                       </div>
                   </div>
               </td>
               <td class="px-4 py-3">
                   ${r.topMatched.map(s => `<span class="skill-tag">${s}</span>`).join('') ||
                     '<span class="text-slate-400 text-xs">—</span>'}
               </td>
               <td class="px-4 py-3 text-slate-600">${r.experience}</td>
               <td class="px-4 py-3 text-center text-slate-400">
                   <i class="fas fa-chevron-down text-xs"></i>
               </td>
           `;
           row.addEventListener('click', () => toggleExpand(row, idx));
           resultsBody.appendChild(row);
       });
   }
   
   function toggleExpand(row, idx) {
       const next = row.nextElementSibling;
   
       if (next && next.classList.contains('expand-row')) {
           next.remove();
           return;
       }
   
       document.querySelectorAll('.expand-row').forEach(el => el.remove());
   
       const r = currentResults[idx];
       const bd = r.breakdown || {};
       const expandRow = document.createElement('tr');
       expandRow.className = 'expand-row';
       expandRow.innerHTML = `
           <td colspan="5" class="px-6 py-5">
               <div class="grid md:grid-cols-3 gap-6 text-sm">
                   <div>
                       <h4 class="font-semibold text-slate-700 mb-2 flex items-center gap-1">
                           <i class="fas fa-check-circle text-teal-600"></i> Matched Skills
                       </h4>
                       <div>${r.matched.map(s => `<span class="skill-tag">${s}</span>`).join('') ||
                           '<span class="text-slate-400">None</span>'}</div>
                   </div>
                   <div>
                       <h4 class="font-semibold text-slate-700 mb-2 flex items-center gap-1">
                           <i class="fas fa-times-circle text-red-500"></i> Missing Skills
                       </h4>
                       <div>${r.missing.map(s => `<span class="missing-tag">${s}</span>`).join('') ||
                           '<span class="text-slate-400">None</span>'}</div>
                   </div>
                   <div>
                       <h4 class="font-semibold text-slate-700 mb-2 flex items-center gap-1">
                           <i class="fas fa-graduation-cap text-slate-500"></i> Education
                       </h4>
                       <p class="text-slate-600">${r.education}</p>
   
                       <h4 class="font-semibold text-slate-700 mb-2 mt-3 flex items-center gap-1">
                           <i class="fas fa-briefcase text-slate-500"></i> Experience
                       </h4>
                       <p class="text-slate-600">${r.experience}</p>
   
                       <h4 class="font-semibold text-slate-700 mb-2 mt-3 flex items-center gap-1">
                           <i class="fas fa-chart-pie text-slate-500"></i> Score Breakdown
                       </h4>
                       <div class="text-xs text-slate-600 space-y-1">
                           <div>Skills: ${bd.skills || 0}%</div>
                           <div>Semantic: ${bd.semantic || 0}%</div>
                           <div>Experience: ${bd.experience || 0}%</div>
                           <div>Education: ${bd.education || 0}%</div>
                       </div>
                   </div>
               </div>
           </td>
       `;
       row.parentNode.insertBefore(expandRow, row.nextSibling);
   }
   
   function handleAnalyze() {
       const jdText = jobDescInput.value.trim();
       const files  = getUploadedFiles();
   
       if (!jdText) {
           alert('Please enter a job description.');
           return;
       }
       if (files.length === 0) {
           alert('Please upload at least one resume (or load sample resumes).');
           return;
       }
   
       loadingState.classList.remove('hidden');
       resultsSection.classList.add('hidden');
       analyzeBtn.disabled = true;
   
       setTimeout(() => {
           const results = runAnalysis(jdText, files);
           currentResults = results;
           renderResults(results);
   
           loadingState.classList.add('hidden');
           resultsSection.classList.remove('hidden');
           analyzeBtn.disabled = false;
       }, 1200);
   }
   
   function bindMainEvents() {
       analyzeBtn.addEventListener('click', handleAnalyze);
   
       loadSampleJdBtn.addEventListener('click', () => {
           jobTitleInput.value = 'Backend Developer';
           jobDescInput.value  = SAMPLE_JD;
       });
   }
   
   document.addEventListener('DOMContentLoaded', () => {
       bindUploadEvents();
       bindMainEvents();
       renderFileList();
   
       resultsSection.classList.add('hidden');
       noResults.classList.add('hidden');
   });