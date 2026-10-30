/* ============================================
   NLP Mock + Scoring Engine
   Handles: 0 years, "no experience", "fresher",
            "N+ years", "not mentioned"
   ============================================ */

   const SKILL_DICTIONARY = {
    'Python':           ['python', 'py'],
    'Flask':            ['flask'],
    'Django':           ['django'],
    'FastAPI':          ['fastapi', 'fast api'],
    'REST APIs':        ['rest api', 'rest apis', 'restful', 'rest endpoint', 'rest endpoints', 'rest'],
    'SQL':              ['sql', 'mysql', 'postgresql', 'postgres', 'sqlite'],
    'Docker':           ['docker', 'container', 'containers'],
    'AWS':              ['aws', 'amazon web services', 'ec2', 's3'],
    'Kubernetes':       ['kubernetes', 'k8s'],
    'Git':              ['git', 'github', 'gitlab'],
    'CI/CD':            ['ci/cd', 'cicd', 'continuous integration'],
    'Agile':            ['agile', 'scrum'],
    'JavaScript':       ['javascript', 'js'],
    'React':            ['react', 'react.js', 'reactjs'],
    'HTML':             ['html'],
    'CSS':              ['css', 'tailwind', 'bootstrap'],
    'MongoDB':          ['mongodb', 'mongo'],
    'Redis':            ['redis'],
    'Celery':           ['celery'],
    'Linux':            ['linux', 'unix', 'bash'],
    'Terraform':        ['terraform'],
    'Pandas':           ['pandas'],
    'NumPy':            ['numpy'],
    'Machine Learning': ['machine learning', 'ml', 'scikit-learn', 'sklearn'],
    'Data Science':     ['data science', 'data scientist']
};

function extractSkillsFromText(text) {
    const lower = text.toLowerCase();
    const found = new Set();

    for (const [canonical, aliases] of Object.entries(SKILL_DICTIONARY)) {
        for (const alias of aliases) {
            const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escaped}\\b`, 'i');
            if (regex.test(lower)) {
                found.add(canonical);
                break;
            }
        }
    }
    return Array.from(found);
}

function parseJD(jdText) {
    return extractSkillsFromText(jdText);
}

/* ---------- Experience requirement parsing ---------- */
function parseRequiredYears(jdText) {
    const zeroPatterns = [
        /\b0\s*\+?\s*(?:years?|yrs?)\b/i,
        /\bzero\s+(?:years?|yrs?)\b/i,
        /\bno\s+(?:prior\s+|previous\s+)?experience\b/i,
        /\bwithout\s+(?:any\s+)?experience\b/i,
        /\bfresher?s?\b/i,
        /\bentry[\s-]?level\b/i,
        /\bfresh\s+graduate?s?\b/i,
        /\brecent\s+graduate?s?\b/i,
        /\bno\s+experience\s+required\b/i,
        /\bnew\s+grad(?:uate)?s?\b/i
    ];
    if (zeroPatterns.some(re => re.test(jdText))) return 0;

    const matches = [...jdText.matchAll(/(\d+)\+?\s*(?:years?|yrs?)/gi)];
    if (matches.length > 0) {
        const positives = matches.map(m => parseInt(m[1], 10)).filter(n => n > 0);
        if (positives.length > 0) return Math.max(...positives);
    }

    return null;
}

function extractExperienceYears(text) {
    const match = text.match(/(\d+)\+?\s*(?:years?|yrs?)/i);
    if (match) return parseInt(match[1], 10);

    if (/\b(fresher?s?|fresh(ly)?\s+graduat(?:ed|e)|recent\s+graduate|new\s+grad|no\s+work\s+experience)\b/i.test(text)) {
        return 0;
    }

    if (/\b(principal|staff|lead|senior|sr\.?)\b/i.test(text)) return 5;
    if (/\b(junior|jr\.?|intern|entry)\b/i.test(text))         return 1;

    const yearRanges = [...text.matchAll(/(19|20)\d{2}\s*[–\-—to]+\s*((19|20)\d{2}|present|current)/gi)];
    if (yearRanges.length > 0) {
        const now = new Date().getFullYear();
        let total = 0;
        yearRanges.forEach(m => {
            const start  = parseInt(m[0].substring(0, 4), 10);
            const endRaw = m[2].toLowerCase();
            const end    = /present|current/.test(endRaw) ? now : parseInt(endRaw, 10);
            if (end >= start) total += (end - start);
        });
        if (total > 0) return total;
    }

    return 2;
}

function parseRequiredEducation(jdText) {
    const lower = jdText.toLowerCase();
    if (lower.includes('phd') || lower.includes('ph.d'))                               return 'phd';
    if (lower.includes('master') || lower.includes('m.s') || lower.includes('m.tech')) return 'master';
    if (lower.includes('bachelor') || lower.includes('b.s') || lower.includes('b.tech') ||
        lower.includes('b.a') || lower.includes('degree'))                             return 'bachelor';
    return 'none';
}

function extractEducation(text) {
    const lower = text.toLowerCase();
    if (lower.includes('phd') || lower.includes('ph.d'))         return { level: 'phd',      label: "Ph.D." };
    if (lower.includes('m.s') || lower.includes('m.tech') ||
        lower.includes('master'))                                return { level: 'master',   label: "Master's" };
    if (lower.includes('b.s') || lower.includes('b.tech') ||
        lower.includes('b.a') || lower.includes('bachelor'))     return { level: 'bachelor', label: "Bachelor's" };
    return { level: 'none', label: 'Not specified' };
}

function extractEducationLabel(text) {
    const degrees = ['B.S.', 'B.A.', 'M.S.', 'M.Tech', 'B.Tech', 'PhD', 'Bachelor', 'Master'];
    for (const d of degrees) {
        if (text.includes(d)) {
            const idx = text.indexOf(d);
            return text.substring(idx, idx + 60).split('\n')[0].trim();
        }
    }
    return 'Not specified';
}

const EDUCATION_RANK = { none: 0, bachelor: 1, master: 2, phd: 3 };

function computeScore(resumeText, jdText, requiredSkills, requiredYears, requiredEdu) {
    const resSkills = extractSkillsFromText(resumeText);

    /* 1. Skill match */
    const matchedSkills = requiredSkills.filter(s => resSkills.includes(s));
    const missingSkills = requiredSkills.filter(s => !resSkills.includes(s));
    const skillScore = requiredSkills.length > 0
        ? matchedSkills.length / requiredSkills.length
        : 0;

    /* 2. Semantic similarity (cosine over token frequencies) */
    const jdTokens  = tokenize(jdText);
    const resTokens = tokenize(resumeText);

    const jdFreq = {};
    jdTokens.forEach(t => jdFreq[t] = (jdFreq[t] || 0) + 1);

    const resFreq = {};
    resTokens.forEach(t => resFreq[t] = (resFreq[t] || 0) + 1);

    let dot = 0, magA = 0, magB = 0;
    const vocab = new Set([...Object.keys(jdFreq), ...Object.keys(resFreq)]);
    vocab.forEach(t => {
        const a = jdFreq[t]  || 0;
        const b = resFreq[t] || 0;
        dot  += a * b;
        magA += a * a;
        magB += b * b;
    });
    const cosine = (magA > 0 && magB > 0)
        ? dot / (Math.sqrt(magA) * Math.sqrt(magB))
        : 0;

    /* 3. Experience score */
    const candidateYears = extractExperienceYears(resumeText);
    let expScore;

    if (requiredYears === 0) {
        expScore = 1;          // 0-years JD → everyone gets full credit
    } else if (requiredYears === null) {
        expScore = 0.7;        // Not mentioned → neutral
    } else if (candidateYears >= requiredYears) {
        expScore = 1;          // Meets or exceeds
    } else {
        expScore = candidateYears / requiredYears;
    }

    /* 4. Education score */
    const candidateEdu = extractEducation(resumeText);
    let eduScore;
    if (requiredEdu === 'none') {
        eduScore = 1;
    } else {
        const reqRank  = EDUCATION_RANK[requiredEdu];
        const candRank = EDUCATION_RANK[candidateEdu.level];
        eduScore = candRank >= reqRank ? 1 : (candRank / reqRank);
    }

    /* 5. Weighted combination */
    const WEIGHTS = {
        skills:     0.50,
        semantic:   0.20,
        experience: 0.20,
        education:  0.10
    };

    const rawScore =
        skillScore * WEIGHTS.skills +
        cosine     * WEIGHTS.semantic +
        expScore   * WEIGHTS.experience +
        eduScore   * WEIGHTS.education;

    const finalScore = Math.round(Math.pow(rawScore, 0.85) * 100);

    return {
        score: finalScore,
        matched: matchedSkills,
        missing: missingSkills,
        resSkills,
        breakdown: {
            skills:     Math.round(skillScore * 100),
            semantic:   Math.round(cosine * 100),
            experience: Math.round(expScore * 100),
            education:  Math.round(eduScore * 100)
        },
        candidateYears,
        candidateEdu: candidateEdu.label
    };
}

function runAnalysis(jdText, uploadedFiles) {
    const requiredSkills = parseJD(jdText);
    const requiredYears  = parseRequiredYears(jdText);
    const requiredEdu    = parseRequiredEducation(jdText);

    const results = uploadedFiles.map(f => {
        const text = f.content ||
            `Sample resume content for ${f.name}. Python, REST APIs, SQL, Docker. 3 years experience. B.S. Computer Science.`;

        const name = f.candidateName ||
            f.name.replace(/\.(pdf|docx|txt)$/i, '').replace(/_/g, ' ');

        const computed = computeScore(text, jdText, requiredSkills, requiredYears, requiredEdu);
        const educationLabel = extractEducationLabel(text);
        const topMatched = computed.matched.slice(0, 3);

        return {
            name,
            filename: f.name,
            score: computed.score,
            matched: computed.matched,
            missing: computed.missing,
            topMatched,
            experience: computed.candidateYears + ' years',
            education: educationLabel,
            candidateEdu: computed.candidateEdu,
            resSkills: computed.resSkills,
            breakdown: computed.breakdown,
            fullText: text
        };
    });

    results.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.matched.length - a.matched.length;
    });

    return results;
}