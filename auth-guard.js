/* ============================================
   Sample Data — 10 resumes + 1 JD
   ============================================ */

   const SAMPLE_JD = `Backend Developer — Python, REST APIs, SQL, 2+ years
   We are looking for a Backend Developer with strong Python skills, experience building REST APIs, and solid SQL knowledge. 
   Must have 2+ years of professional experience. Familiarity with Docker and AWS is a plus. 
   Bachelor's degree in Computer Science or related field preferred.`;
   
   const SAMPLE_RESUMES = [
       {
           name: "Alice Chen",
           filename: "alice_chen_resume.txt",
           content: `Alice Chen
   Email: alice@example.com | Phone: (555) 123-4567
   Education: B.S. Computer Science, Stanford University, 2018
   Experience:
   - Backend Developer at TechCorp (2020–Present): Built REST APIs with Python Flask, optimized SQL queries, deployed on AWS with Docker.
   - Junior Developer at StartupXYZ (2018–2020): Python scripting, PostgreSQL.
   Skills: Python, Flask, REST APIs, SQL, Docker, AWS, Git, Agile
   Certifications: AWS Certified Developer Associate`
       },
       {
           name: "Bob Martinez",
           filename: "bob_martinez_resume.txt",
           content: `Bob Martinez
   Email: bob@example.com | Phone: (555) 987-6543
   Education: B.A. Information Systems, NYU, 2019
   Experience:
   - Software Engineer at WebSolutions (2021–Present): Developed microservices in Python, designed REST endpoints, worked with MySQL.
   - Intern at DataInc (2019–2021): Python scripting, data processing.
   Skills: Python, REST APIs, MySQL, Git, JavaScript, HTML/CSS
   Certifications: None`
       },
       {
           name: "Carol Davis",
           filename: "carol_davis_resume.txt",
           content: `Carol Davis
   Email: carol@example.com | Phone: (555) 456-7890
   Education: M.S. Computer Science, MIT, 2020
   Experience:
   - Senior Backend Engineer at CloudScale (2020–Present): Led Python development, built scalable REST APIs, managed PostgreSQL, containerized with Docker, deployed on AWS.
   - Software Engineer at FinTech (2016–2020): Python, SQL, financial APIs.
   Skills: Python, Django, Flask, REST APIs, PostgreSQL, Docker, AWS, Kubernetes, CI/CD
   Certifications: AWS Solutions Architect, CKA`
       },
       {
           name: "David Kim",
           filename: "david_kim_resume.txt",
           content: `David Kim
   Email: david@example.com | Phone: (555) 222-3333
   Education: B.S. Software Engineering, University of Washington, 2021
   Experience:
   - Backend Developer at AppWorks (2021–Present): Python (FastAPI), SQL, REST APIs, Docker.
   - Junior Developer at CodeLabs (2020–2021): Python, Flask, SQLite.
   Skills: Python, FastAPI, REST APIs, SQL, Docker, Git, Linux
   Certifications: None`
       },
       {
           name: "Eva Singh",
           filename: "eva_singh_resume.txt",
           content: `Eva Singh
   Email: eva@example.com | Phone: (555) 777-8888
   Education: B.Tech Computer Science, IIT Delhi, 2017
   Experience:
   - Lead Backend Engineer at ScaleUp (2020–Present): Architected Python microservices, REST APIs, PostgreSQL, AWS, Docker, mentored juniors.
   - Backend Developer at InfoSys (2017–2020): Python, Django, SQL, REST APIs.
   Skills: Python, Django, Flask, REST APIs, SQL, PostgreSQL, Docker, AWS, Redis, Celery
   Certifications: AWS Certified Developer, MongoDB Certified`
       },
       {
           name: "Frank Nguyen",
           filename: "frank_nguyen_resume.txt",
           content: `Frank Nguyen
   Email: frank@example.com | Phone: (555) 111-2222
   Education: B.A. Graphic Design, Parsons School of Design, 2020
   Experience:
   - Frontend Developer at CreativeStudio (2021–Present): Built responsive UIs with React and Tailwind CSS, integrated with REST endpoints.
   - Freelance Web Designer (2019–2021): HTML, CSS, JavaScript, WordPress.
   Skills: JavaScript, React, HTML, CSS, Tailwind, Figma, REST
   Certifications: None`
       },
       {
           name: "Grace Patel",
           filename: "grace_patel_resume.txt",
           content: `Grace Patel
   Email: grace@example.com | Phone: (555) 333-4444
   Education: M.S. Data Science, Columbia University, 2021
   Experience:
   - Data Scientist at AnalytiCo (2021–Present): Built ML models in Python, worked with Pandas and NumPy, queried data using SQL.
   - Research Assistant at Columbia (2019–2021): Python for scientific computing, data visualization.
   Skills: Python, Pandas, NumPy, SQL, Scikit-learn, Matplotlib, Jupyter
   Certifications: None`
       },
       {
           name: "Henry Okafor",
           filename: "henry_okafor_resume.txt",
           content: `Henry Okafor
   Email: henry@example.com | Phone: (555) 555-6666
   Education: B.S. Computer Science, University of Lagos, 2023
   Experience:
   - Intern at LocalTech (2023–2024): Assisted with Python scripts and basic SQL queries.
   - Personal Projects: Built a small Flask app for task management.
   Skills: Python, Flask, SQL, Git
   Certifications: None`
       },
       {
           name: "Isabella Rossi",
           filename: "isabella_rossi_resume.txt",
           content: `Isabella Rossi
   Email: isabella@example.com | Phone: (555) 888-9999
   Education: B.S. Information Technology, Politecnico di Milano, 2018
   Experience:
   - DevOps Engineer at CloudWorks (2020–Present): Managed Kubernetes clusters, built CI/CD pipelines, automated deployment on AWS with Docker and Terraform.
   - Systems Administrator at HostCo (2018–2020): Linux administration, shell scripting, monitoring.
   Skills: Docker, Kubernetes, AWS, Terraform, CI/CD, Linux, Bash, Git
   Certifications: AWS Solutions Architect, CKA`
       },
       {
           name: "Jamal Wright",
           filename: "jamal_wright_resume.txt",
           content: `Jamal Wright
   Email: jamal@example.com | Phone: (555) 444-5555
   Education: B.S. Computer Engineering, Georgia Tech, 2019
   Experience:
   - Full Stack Developer at BrightApps (2020–Present): Built features across React frontend and Python Flask backend, integrated REST APIs, used PostgreSQL.
   - Junior Developer at CodeWorks (2019–2020): JavaScript, Node.js, MongoDB.
   Skills: Python, Flask, JavaScript, React, REST APIs, PostgreSQL, MongoDB, Git, Docker
   Certifications: None`
       }
   ];
   /* ============================================
   Auth Guard — protects app.html
   Attaches logout handler reliably regardless
   of when this script loads.
   ============================================ */

(function () {
    const SESSION_KEY = 'ai_resume_session';

    /* ---------- 1. Check session ---------- */
    let session = null;
    try {
        session = JSON.parse(localStorage.getItem(SESSION_KEY));
    } catch {
        session = null;
    }

    if (!session || !session.username) {
        window.location.replace('index.html');
        return;
    }

    /* ---------- 2. Setup UI (works whether DOM is ready or not) ---------- */
    function setupUI() {
        const userEl = document.getElementById('currentUser');
        if (userEl) userEl.textContent = session.username;

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            // Prevent duplicate handlers if setup runs twice
            logoutBtn.replaceWith(logoutBtn.cloneNode(true));
            const freshBtn = document.getElementById('logoutBtn');

            freshBtn.addEventListener('click', function (e) {
                e.preventDefault();
                if (confirm('Log out of AI Resume Analyzer?')) {
                    localStorage.removeItem(SESSION_KEY);
                    window.location.replace('index.html');
                }
            });
        }
    }

    // If DOM is already parsed (script at end of body), run immediately.
    // Otherwise wait for DOMContentLoaded.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupUI);
    } else {
        setupUI();
    }
})();