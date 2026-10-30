/* ============================================
   File Up oad Handling
   ============================================ */

   let uploadedFiles = [];

   const dropZone             = document.getElementById('dropZone');
   const fileInput            = document.getElementById('fileInput');
   const fileList             = document.getElementById('fileList');
   const fileCount            = document.getElementById('fileCount');
   const loadSampleResumesBtn = document.getElementById('loadSampleResumes');
   
   function renderFileList() {
       fileList.innerHTML = '';
   
       if (uploadedFiles.length === 0) {
           fileList.innerHTML = '<p class="text-xs text-slate-400 italic">No files uploaded yet.</p>';
           fileCount.textContent = '0 files selected';
           return;
       }
   
       uploadedFiles.forEach((f, idx) => {
           const div = document.createElement('div');
           div.className = 'flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 text-sm border border-slate-200';
   
           const icon = f.name.endsWith('.pdf')
               ? 'fa-file-pdf text-red-500'
               : f.name.endsWith('.docx')
                   ? 'fa-file-word text-blue-500'
                   : 'fa-file-alt text-slate-500';
   
           div.innerHTML = `
               <div class="flex items-center gap-2">
                   <i class="fas ${icon}"></i>
                   <span class="text-slate-700 font-medium">${f.name}</span>
                   <span class="text-xs text-slate-400">${formatFileSize(f.size)}</span>
               </div>
               <button class="text-slate-400 hover:text-red-500 remove-file" data-index="${idx}" title="Remove">
                   <i class="fas fa-times"></i>
               </button>
           `;
           fileList.appendChild(div);
       });
   
       fileCount.textContent = `${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''} selected`;
   
       document.querySelectorAll('.remove-file').forEach(btn => {
           btn.addEventListener('click', (e) => {
               const index = parseInt(e.currentTarget.dataset.index);
               uploadedFiles.splice(index, 1);
               renderFileList();
           });
       });
   }
   
   function handleFiles(files) {
       const newFiles = Array.from(files);
       const accepted = [];
       const rejected = [];
   
       newFiles.forEach(f => {
           if (isAcceptedFile(f)) {
               accepted.push({
                   name: f.name,
                   size: f.size,
                   type: f.type,
                   file: f
               });
           } else {
               rejected.push(f.name);
           }
       });
   
       if (rejected.length > 0) {
           alert(`Rejected files (invalid type or >5MB):\n${rejected.join('\n')}`);
       }
   
       uploadedFiles = uploadedFiles.concat(accepted);
       renderFileList();
   }
   
   function bindUploadEvents() {
       dropZone.addEventListener('click', () => fileInput.click());
   
       dropZone.addEventListener('dragover', (e) => {
           e.preventDefault();
           dropZone.classList.add('active');
       });
   
       dropZone.addEventListener('dragleave', () => dropZone.classList.remove('active'));
   
       dropZone.addEventListener('drop', (e) => {
           e.preventDefault();
           dropZone.classList.remove('active');
           if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
       });
   
       fileInput.addEventListener('change', (e) => {
           if (e.target.files.length) handleFiles(e.target.files);
           fileInput.value = '';
       });
   
       loadSampleResumesBtn.addEventListener('click', () => {
           SAMPLE_RESUMES.forEach(r => {
               if (!uploadedFiles.some(f => f.name === r.filename)) {
                   uploadedFiles.push({
                       name: r.filename,
                       size: r.content.length,
                       type: 'text/plain',
                       content: r.content,
                       candidateName: r.name
                   });
               }
           });
           renderFileList();
       });
   }
   
   function getUploadedFiles() {
       return uploadedFiles;
   }