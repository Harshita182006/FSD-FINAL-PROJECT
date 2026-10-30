/* ============================================
   Auth — Login & Signup (localStorage based)
   ============================================ */

   const USERS_KEY   = 'ai_resume_users';
   const SESSION_KEY = 'ai_resume_session';
   
   /* ---------- Storage helpers ---------- */
   function getUsers() {
       try {
           return JSON.parse(localStorage.getItem(USERS_KEY)) || {};
       } catch {
           return {};
       }
   }
   
   function saveUsers(users) {
       localStorage.setItem(USERS_KEY, JSON.stringify(users));
   }
   
   function setSession(username) {
       localStorage.setItem(SESSION_KEY, JSON.stringify({
           username,
           loginAt: Date.now()
       }));
   }
   
   function getSession() {
       try {
           return JSON.parse(localStorage.getItem(SESSION_KEY));
       } catch {
           return null;
       }
   }
   
   /* ---------- Light hash (demo only) ---------- */
   function hashPassword(pw) {
       let hash = 0;
       for (let i = 0; i < pw.length; i++) {
           hash = ((hash << 5) - hash) + pw.charCodeAt(i);
           hash |= 0;
       }
       return 'h' + Math.abs(hash).toString(36);
   }
   
   /* ---------- UI helpers ---------- */
   function showError(elId, msg) {
       const el = document.getElementById(elId);
       el.textContent = msg;
       el.classList.remove('hidden');
   }
   
   function clearMessages() {
       ['loginError', 'signupError', 'signupSuccess'].forEach(id => {
           const el = document.getElementById(id);
           if (el) {
               el.textContent = '';
               el.classList.add('hidden');
           }
       });
   }
   
   /* ---------- Tab switching ---------- */
   function switchTab(tab) {
       const loginForm  = document.getElementById('loginForm');
       const signupForm = document.getElementById('signupForm');
       const tabLogin   = document.getElementById('tabLogin');
       const tabSignup  = document.getElementById('tabSignup');
   
       clearMessages();
   
       if (tab === 'signup') {
           loginForm.classList.add('hidden');
           signupForm.classList.remove('hidden');
           tabLogin.classList.remove('active');
           tabSignup.classList.add('active');
       } else {
           signupForm.classList.add('hidden');
           loginForm.classList.remove('hidden');
           tabSignup.classList.remove('active');
           tabLogin.classList.add('active');
       }
   }
   
   /* ---------- Show / hide password ---------- */
   function bindPasswordToggles() {
       document.querySelectorAll('.toggle-pass').forEach(btn => {
           btn.addEventListener('click', () => {
               const input = document.getElementById(btn.dataset.target);
               const icon  = btn.querySelector('i');
               if (input.type === 'password') {
                   input.type = 'text';
                   icon.classList.replace('fa-eye', 'fa-eye-slash');
               } else {
                   input.type = 'password';
                   icon.classList.replace('fa-eye-slash', 'fa-eye');
               }
           });
       });
   }
   
   /* ---------- Signup ---------- */
   function handleSignup(e) {
       e.preventDefault();
       clearMessages();
   
       const username = document.getElementById('signupUsername').value.trim();
       const password = document.getElementById('signupPassword').value;
       const confirm  = document.getElementById('signupConfirm').value;
   
       if (username.length < 3) {
           showError('signupError', 'Username must be at least 3 characters.');
           return;
       }
       if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
           showError('signupError', 'Username can only contain letters, numbers, _, ., and -.');
           return;
       }
       if (password.length < 6) {
           showError('signupError', 'Password must be at least 6 characters.');
           return;
       }
       if (password !== confirm) {
           showError('signupError', 'Passwords do not match.');
           return;
       }
   
       const users = getUsers();
       const key = username.toLowerCase();
   
       if (users[key]) {
           showError('signupError', 'That username is already taken. Try another.');
           return;
       }
   
       users[key] = {
           username,
           passwordHash: hashPassword(password),
           createdAt: Date.now()
       };
       saveUsers(users);
   
       setSession(username);
       window.location.href = 'app.html';
   }
   
   /* ---------- Login ---------- */
   function handleLogin(e) {
       e.preventDefault();
       clearMessages();
   
       const username = document.getElementById('loginUsername').value.trim();
       const password = document.getElementById('loginPassword').value;
   
       if (!username || !password) {
           showError('loginError', 'Please enter both username and password.');
           return;
       }
   
       const users = getUsers();
       const user  = users[username.toLowerCase()];
   
       if (!user) {
           showError('loginError', 'No account found with that username.');
           return;
       }
   
       if (user.passwordHash !== hashPassword(password)) {
           showError('loginError', 'Incorrect password. Please try again.');
           return;
       }
   
       setSession(user.username);
       window.location.href = 'app.html';
   }
   
   /* ---------- Init ---------- */
   document.addEventListener('DOMContentLoaded', () => {
       // If already logged in, skip to app
       if (getSession()) {
           window.location.href = 'app.html';
           return;
       }
   
       document.getElementById('tabLogin').addEventListener('click',  () => switchTab('login'));
       document.getElementById('tabSignup').addEventListener('click', () => switchTab('signup'));
   
       document.querySelectorAll('[data-switch]').forEach(btn => {
           btn.addEventListener('click', () => switchTab(btn.dataset.switch));
       });
   
       document.getElementById('loginForm').addEventListener('submit', handleLogin);
       document.getElementById('signupForm').addEventListener('submit', handleSignup);
   
       bindPasswordToggles();
   });