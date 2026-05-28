/* ══════════════════════════════════════════════
   InternTrack — app.js
   GitHub OAuth + Classroom API Integration
   Full application logic
══════════════════════════════════════════════ */

'use strict';

// ══════════════════════════════════════════════
// CONFIG — Edit these values before deploying
// ══════════════════════════════════════════════
const CONFIG = {
  // Your GitHub OAuth App Client ID
  // GitHub OAuth App Client ID
  OAUTH_CLIENT_ID: localStorage.getItem('gh_client_id') || 'Ov23liJdCE3Ma7QssY4g',

  // OAuth backend/token exchange endpoint
  // Replace this with your Netlify/Vercel backend URL
  OAUTH_PROXY_URL: 'https://rvu-interntrack.netlify.app/.netlify/functions/authenticate',

  // GitHub API
  GH_API: 'https://api.github.com',

  // GitHub Organization
  ORG: localStorage.getItem('gh_org') || 'rvu-cybersecurity',

  // Repository prefix
  REPO_PREFIX: localStorage.getItem('gh_prefix') || 'Internship',

  // GitHub OAuth callback URL
  REDIRECT_URI: 'https://rvu-cybersecurity.github.io/Internship/index.html'
};

/* // Create one at: https://github.com/settings/developers
  OAUTH_CLIENT_ID: localStorage.getItem('gh_client_id') || 'Ov23liJdCE3Ma7QssY4g',

  // Your GitHub OAuth App Client Secret (⚠️ only safe in backend/Netlify Function)
  // For pure frontend demo, we use the token exchange proxy below
  OAUTH_PROXY_URL: https://rvu-cybersecurity.github.io/Internship/index.html,  //'https://github-oauth-proxy.your-domain.com/authenticate'
  // ↑ Deploy https://github.com/prose/gatekeeper or use Netlify Functions

  // GitHub API base
  GH_API: 'https://api.github.com',

  // Your GitHub Classroom organization (configurable via UI)
  ORG: localStorage.getItem('gh_org') || '',

  // Assignment repo prefix  e.g. "intern2025" → repos like intern2025-week7-teamname
  REPO_PREFIX: localStorage.getItem('gh_prefix') || 'intern2025',

  // Callback URL — this page's URL
  REDIRECT_URI: window.location.origin + window.location.pathname
};
*/


// ══════════════════════════════════════════════
// STATE
// ══════════════════════════════════════════════
let state = {
  user: null,
  token: sessionStorage.getItem('gh_token') || '',
  org: CONFIG.ORG,
  prefix: CONFIG.REPO_PREFIX,
  currentWeek: 7,
  weeklyStatusFilter: '',
  assignFilter: 'All',
  projSearchQ: '',
  projStatusFilter: '',
  projFacultyFilter: '',
  projDomainFilter: '',
  submissions: [],
  repos: []
};

// ══════════════════════════════════════════════
// DATA — 26 Projects, 10 Faculty
// ══════════════════════════════════════════════
const DOMAINS = ['AI/ML','Web Dev','IoT','Cybersecurity','Data Science','Blockchain','Mobile','Cloud','Quantum'];

const FACULTY = [
{name:'Sunilkumar J',dept:'Cybersecurity',c:'#185FA5',i:'SJ',n:5},
{name:'Evlin Vidyu Latha P',dept:'Cybersecurity',c:'#0F6E56',i:'EP',n:4},
{name:'Dr. Manish Kumar',dept:'Cybersecurity',c:'#854F0B',i:'MK',n:3},
{name:'Dr.Sarasvathi V',dept:'Cybersecurity',c:'#A32D2D',i:'SV',n:4},
{name:'A V Amruthesh Bhat',dept:'Cybersecurity',c:'#533AB7',i:'AB',n:3},
{name:'J. Cynthia',dept:'Cybersecurity',c:'#3B6D11',i:'JC',n:3},
{name:'Dr. Ishita Chakraborty',dept:'Cybersecurity',c:'#993C1D',i:'IC',n:4},
{name:'Dr Basavaraj Patil',dept:'Cybersecurity',c:'#185FA5',i:'BP',n:3},
{name:'Sheba Pari N',dept:'Cybersecurity',c:'#993556',i:'SP',n:4},
{name:'Dr. Saliha Bathool',dept:'Cybersecurity',c:'#5F5E5A',i:'SB',n:4}
];

const PROJECTS = [
{id:25,name:'Neural Network-Assisted Key Rate Estimation in Noisy QKD Channels',faculty:'A V Amruthesh Bhat',domain:'Quantum',status:'On Track',progress:82,w7:'Submitted'},
{id:9,name:'Benchmarking NIST PQC Standards on Constrained IoT Devices',faculty:'A V Amruthesh Bhat',domain:'Quantum',status:'On Track',progress:76,w7:'Pending'},
{id:16,name:'Ethical Hacking Simulation Framework for Cybersecurity Education',faculty:'Dr Basavaraj Patil',domain:'Cybersecurity',status:'On Track',progress:84,w7:'Submitted'},
{id:19,name:'Insider Threat Detection Using Behavioral Analytics',faculty:'Dr Basavaraj Patil',domain:'Cybersecurity',status:'Needs Review',progress:58,w7:'Pending'},
{id:7,name:'Adversarial Attack Detection Framework using Machine Learning',faculty:'Dr Basavaraj Patil',domain:'AI/ML',status:'On Track',progress:79,w7:'Submitted'},
{id:2,name:'A Q-Learning Based Intrusion-Resilient and Privacy-Aware Routing Protocol for IoT Mesh Networks',faculty:'Dr. Ishita Chakraborty',domain:'IoT',status:'On Track',progress:81,w7:'Submitted'},
{id:26,name:'Secure Routing Protocol for IoT Networks Using Lightweight Cryptography',faculty:'Dr. Ishita Chakraborty',domain:'IoT',status:'On Track',progress:73,w7:'Pending'},
{id:23,name:'LLM-Assisted Malware Reverse Engineering and Explainable Threat Report Generation',faculty:'Dr. Manish Kumar',domain:'AI/ML',status:'On Track',progress:83,w7:'Submitted'},
{id:22,name:'LLM-Assisted Digital Forensics Investigation and Evidence Correlation System',faculty:'Dr. Manish Kumar',domain:'Cybersecurity',status:'On Track',progress:77,w7:'Submitted'},
{id:21,name:'Intelligent QR Code Phishing Detection using AI and Threat Intelligence',faculty:'Dr. Manish Kumar',domain:'AI/ML',status:'Needs Review',progress:61,w7:'Pending'},
{id:18,name:'Hybrid Cryptography Framework for Quantum-Safe Secure Communication',faculty:'Dr. Manish Kumar',domain:'Quantum',status:'On Track',progress:72,w7:'Submitted'},
{id:3,name:'AI-Based Cyber Crime Prediction System',faculty:'Dr. Saliha Bathool',domain:'AI/ML',status:'On Track',progress:80,w7:'Submitted'},
{id:14,name:'Develop an intelligent defense mechanism to identify and block malicious instructions embedded in prompts, documents, emails, PDFs, and websites.',faculty:'Dr.Sarasvathi V',domain:'Cybersecurity',status:'On Track',progress:82,w7:'Submitted'},
{id:11,name:'Create an AI-driven monitoring and filtering system for detecting invisible or obfuscated prompt injection payloads in real-time.',faculty:'Dr.Sarasvathi V',domain:'AI/ML',status:'On Track',progress:75,w7:'Pending'},
{id:13,name:'Develop a secure prompt validation and response filtering model to protect LLM applications from safety bypass and policy evasion attacks.',faculty:'Dr.Sarasvathi V',domain:'AI/ML',status:'Needs Review',progress:59,w7:'Submitted'},
{id:12,name:'Design a secure framework for detecting, preventing, and mitigating Tool Poisoning/MCP attacks in agentic AI systems',faculty:'Dr.Sarasvathi V',domain:'AI/ML',status:'Delayed',progress:42,w7:'Pending'},
{id:4,name:'AI-Based Network Traffic Anomaly Detection System',faculty:'Evlin Vidyu Latha P',domain:'Cybersecurity',status:'On Track',progress:79,w7:'Submitted'},
{id:6,name:'AI-Driven Cloud Security Threat Detection System',faculty:'Evlin Vidyu Latha P',domain:'Cloud',status:'On Track',progress:76,w7:'Submitted'},
{id:10,name:'Blockchain-Based Unified Digital Identity System',faculty:'J. Cynthia',domain:'Blockchain',status:'On Track',progress:83,w7:'Submitted'},
{id:24,name:'Network Traffic Anomaly Detection & SIEM Integration for Campus LAN',faculty:'Sheba Pari N',domain:'Cybersecurity',status:'On Track',progress:80,w7:'Submitted'},
{id:1,name:'802.1X Port-Based Authentication with RADIUS on Wired & Wireless',faculty:'Sheba Pari N',domain:'Cybersecurity',status:'On Track',progress:78,w7:'Pending'},
{id:17,name:'Honeypot Deployment & Attacker Profiling Using Kali Linux as the Red Team',faculty:'Sheba Pari N',domain:'Cybersecurity',status:'On Track',progress:75,w7:'Submitted'},
{id:8,name:'An Intelligent Multi-Layered Phishing Detection Framework using Machine Learning and Behavioral Analysis',faculty:'Sunilkumar J',domain:'AI/ML',status:'On Track',progress:84,w7:'Submitted'},
{id:5,name:'AI-Driven Adaptive Intrusion Detection and Network Threat Intelligence Framework',faculty:'Sunilkumar J',domain:'AI/ML',status:'On Track',progress:79,w7:'Pending'},
{id:15,name:'Encrypted Traffic Fingerprinting for Malware Family Detection using Machine Learning',faculty:'Sunilkumar J',domain:'Cybersecurity',status:'On Track',progress:76,w7:'Submitted'},
{id:20,name:'Intelligent Cloud Security Misconfiguration Detection and Risk Assessment Framework for Multi-Cloud Environments',faculty:'Sunilkumar J',domain:'Cloud',status:'Needs Review',progress:63,w7:'Pending'}
];

const STATUSES = ['On Track','On Track','On Track','On Track','Needs Review','Delayed'];

/*const PROJECTS = PROJECT_NAMES.map((nm, i) => {
  const f = FACULTY[i % FACULTY.length];
  const st = STATUSES[Math.floor(Math.random() * STATUSES.length)];
  const prog = st === 'On Track'
    ? 50 + Math.floor(Math.random() * 38)
    : st === 'Needs Review'
    ? 22 + Math.floor(Math.random() * 26)
    : 8 + Math.floor(Math.random() * 22);
  const slug = nm.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
  return {
    id: i + 1,
    name: nm,
    faculty: f.name,
    facInit: f.i,
    facColor: f.c,
    domain: DOMAINS[i % 8],
    progress: prog,
    status: st,
    w7: Math.random() > 0.28 ? 'Submitted' : 'Pending',
    teamSlug: `team-${slug}`,
    repoUrl: ''
  };
});
*/

let ASSIGNS = [
{id:1,title:'Project Proposal',type:'Document',due:'2025-06-07',st:'Closed',sub:38,tot:40,desc:'Submit a 2-page project proposal outlining objectives, scope, and methodology.'},
{id:2,title:'Literature Review',type:'Report',due:'2025-06-14',st:'Closed',sub:35,tot:40,desc:'Review 5+ relevant papers and submit a summary report.'},
{id:3,title:'System Design',type:'Design',due:'2025-06-21',st:'Closed',sub:33,tot:40,desc:'Create architecture diagrams and database schema.'},
{id:4,title:'Prototype Development',type:'Code',due:'2025-06-28',st:'Active',sub:21,tot:40,desc:'Develop a working prototype with core features.'},
{id:5,title:'Mid-term Presentation',type:'Presentation',due:'2025-07-05',st:'Draft',sub:0,tot:40,desc:'Prepare and deliver a 10-minute progress presentation.'},
{id:6,title:'Testing & Documentation',type:'Code',due:'2025-07-12',st:'Draft',sub:0,tot:40,desc:'Complete unit testing and write API documentation.'},
{id:7,title:'Final Demo',type:'Presentation',due:'2025-07-19',st:'Draft',sub:0,tot:40,desc:'Demonstrate the complete working system.'}
];

const SAMPLE_SUBS =
[{file:'P08_Week1_Proposal.pdf',proj:'P-08',type:'Weekly Submission',date:'2025-06-07',st:'Reviewed'},
{file:'P12_Week2_LiteratureReview.docx',proj:'P-12',type:'Weekly Submission',date:'2025-06-14',st:'Reviewed'},
{file:'P03_Week3_SystemDesign.pdf',proj:'P-03',type:'Weekly Submission',date:'2025-06-21',st:'Reviewed'},
{file:'P19_Week4_Prototype.zip',proj:'P-19',type:'Weekly Submission',date:'2025-06-28',st:'Pending'},
{file:'P01_Week5_MidtermSlides.pptx',proj:'P-01',type:'Weekly Submission',date:'2025-07-05',st:'Pending'},
{file:'P35_Week6_TestingReport.pdf',proj:'P-35',type:'Weekly Submission',date:'2025-07-12',st:'Flagged'},
{file:'P22_Week7_FinalDemo.pptx',proj:'P-22',type:'Weekly Submission',date:'2025-07-19',st:'Reviewed'},
{file:'P07_Week2_ResearchSummary.docx',proj:'P-07',type:'Weekly Submission',date:'2025-06-14',st:'Reviewed'}
];

// ══════════════════════════════════════════════
// GITHUB OAUTH
// ══════════════════════════════════════════════

function initiateGitHubLogin() {
  const clientId = CONFIG.OAUTH_CLIENT_ID;
  if (clientId === 'YOUR_GITHUB_OAUTH_CLIENT_ID' || !clientId) {
    showLoginError('Please configure your GitHub OAuth Client ID first. Edit CONFIG.OAUTH_CLIENT_ID in app.js or use the Config panel after setup.');
    // Demo mode: skip OAuth, use demo user
    setTimeout(() => startDemoMode(), 1500);
    return;
  }

  const scope = 'repo read:org user';
  const oauthState = generateState();
  sessionStorage.setItem('oauth_state', oauthState);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: CONFIG.REDIRECT_URI,
    scope,
    state: oauthState
  });

  window.location.href = `https://github.com/login/oauth/authorize?${params}`;
}

function generateState() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

async function handleOAuthCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const returnedState = params.get('state');
  const storedState = sessionStorage.getItem('oauth_state');

  if (!code) return false;

  // Validate state to prevent CSRF
  if (returnedState !== storedState) {
    showLoginError('OAuth state mismatch. Please try again.');
    return false;
  }

  // Clean URL
  window.history.replaceState({}, document.title, window.location.pathname);

  showLoginMessage('Authenticating with GitHub…');

  try {
    // Exchange code for token via proxy (Netlify Function / Gatekeeper)
    // See: https://github.com/prose/gatekeeper
    const res = await fetch(`${CONFIG.OAUTH_PROXY_URL}/${code}`);
    if (!res.ok) throw new Error('Token exchange failed');
    const data = await res.json();

    if (data.token) {
      state.token = data.token;
      sessionStorage.setItem('gh_token', data.token);
      await fetchUserProfile();
      return true;
    } else {
      throw new Error(data.error || 'No token received');
    }
  } catch (err) {
    // Fallback: show instructions to paste PAT manually
    showLoginError(`Token exchange failed: ${err.message}. You can also set your PAT in the Config panel after signing in with demo mode.`);
    setTimeout(() => startDemoMode(), 2000);
    return false;
  }
}

function startDemoMode() {
  // Demo user — no real GitHub auth
  state.user = {
    login: 'Coordinator',
    name: 'Dr. Basavaraj Patil(Demo)',
    avatar_url: 'https://avatars.githubusercontent.com/u/0',
    html_url: 'https://github.com'
  };
  state.token = 'DEMO_MODE';
  launchApp();
}

async function fetchUserProfile() {
  const res = await ghFetch('/user');
  if (res.ok) {
    state.user = await res.json();
    launchApp();
  } else {
    showLoginError('Failed to fetch GitHub profile. Check your token.');
  }
}

function launchApp() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app').style.display = 'flex';
  setupUser();
  buildAll();
}

function setupUser() {
  const u = state.user;
  document.getElementById('user-name').textContent = u.name || u.login;
  document.getElementById('user-avatar').src = u.avatar_url;
  document.getElementById('org-pill').textContent = state.org
    ? `Org: ${state.org}`
    : '2025 Internship Batch';
  document.getElementById('dash-date').textContent = new Date().toLocaleDateString('en-IN', {
    weekday:'long', year:'numeric', month:'long', day:'numeric'
  });
  document.getElementById('callback-url-display').textContent = CONFIG.REDIRECT_URI;

  // Pre-fill config fields
  document.getElementById('cfg-org').value   = state.org;
  document.getElementById('cfg-token').value = state.token !== 'DEMO_MODE' ? state.token : '';
  document.getElementById('cfg-prefix').value = state.prefix;
  document.getElementById('cfg-client-id').value = CONFIG.OAUTH_CLIENT_ID !== 'YOUR_GITHUB_OAUTH_CLIENT_ID' ? CONFIG.OAUTH_CLIENT_ID : '';

  // Populate faculty filter dropdown
  const fsel = document.getElementById('faculty-filter');
  FACULTY.forEach(f => {
    const o = document.createElement('option');
    o.value = f.name;
    o.textContent = f.name;
    fsel.appendChild(o);
  });

  // Populate new project faculty dropdown
  const npf = document.getElementById('np-faculty');
  FACULTY.forEach(f => {
    const o = document.createElement('option');
    o.value = f.name;
    o.textContent = f.name;
    npf.appendChild(o);
  });

  // Populate submit modal selects
  const smTeam = document.getElementById('sm-team');
  PROJECTS.forEach(p => {
    const o = document.createElement('option');
    o.value = p.teamSlug;
    o.textContent = `P-${p.id} ${p.name}`;
    smTeam.appendChild(o);
  });
  rebuildAssignSelect();
}

function rebuildAssignSelect() {
  const smAssign = document.getElementById('sm-assign');
  smAssign.innerHTML = '';
  ASSIGNS.filter(a => a.st !== 'Closed').forEach(a => {
    const o = document.createElement('option');
    o.value = a.slug;
    o.textContent = a.title;
    smAssign.appendChild(o);
  });
}

function logout() {
  sessionStorage.clear();
  window.location.reload();
}

// ══════════════════════════════════════════════
// GITHUB API HELPERS
// ══════════════════════════════════════════════

async function ghFetch(path, options = {}) {
  const url = path.startsWith('http') ? path : CONFIG.GH_API + path;
  const headers = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...options.headers
  };
  if (state.token && state.token !== 'DEMO_MODE') {
    headers['Authorization'] = `Bearer ${state.token}`;
  }
  return fetch(url, { ...options, headers });
}

async function ghGetFileContent(owner, repo, path) {
  const res = await ghFetch(`/repos/${owner}/${repo}/contents/${path}`);
  if (!res.ok) return null;
  const data = await res.json();
  return {
    content: atob(data.content.replace(/\n/g, '')),
    sha: data.sha,
    html_url: data.html_url,
    download_url: data.download_url
  };
}

async function ghCreateOrUpdateFile(owner, repo, path, content, message, sha = null) {
  const body = {
    message,
    content: btoa(unescape(encodeURIComponent(content)))
  };
  if (sha) body.sha = sha;

  const res = await ghFetch(`/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    body: JSON.stringify(body)
  });
  return res;
}

async function getFileSHA(owner, repo, path) {
  const res = await ghFetch(`/repos/${owner}/${repo}/contents/${path}`);
  if (!res.ok) return null;
  const d = await res.json();
  return d.sha;
}

// ══════════════════════════════════════════════
// GITHUB CLASSROOM INTEGRATION
// ══════════════════════════════════════════════

async function submitToGitHub() {
  const teamSlug   = document.getElementById('sm-team').value;
  const assignSlug = document.getElementById('sm-assign').value;
  const content    = document.getElementById('sm-content').value.trim();
  const commitMsg  = document.getElementById('sm-commit').value.trim() || `feat: submission by ${teamSlug}`;

  if (!teamSlug || !content) {
    showStatus('submit-status', 'error', 'Please select a team and enter the submission content.');
    return;
  }

  if (state.token === 'DEMO_MODE') {
    showStatus('submit-status', 'loading', '⚡ Demo mode: simulating GitHub push…');
    await delay(1200);
    const proj = PROJECTS.find(p => p.teamSlug === teamSlug);
    if (proj) { proj.w7 = 'Submitted'; buildWeekly(); buildProjects(); }
    const sub = { file:'report.md', proj:`P-${proj?.id||'?'}`, projName:proj?.name||teamSlug, type:'Weekly Report', date:new Date().toISOString(), by:`@${state.user.login}`, st:'Pending', commitUrl:'', content };
    SAMPLE_SUBS.unshift(sub);
    buildSubmissions();
    showStatus('submit-status', 'success', '✓ Submitted successfully (demo mode)');
    setTimeout(closeModal, 1500);
    return;
  }

  const org  = state.org;
  const repo = `${state.prefix}-${assignSlug}-${teamSlug}`;

  if (!org) {
    showStatus('submit-status', 'error', 'GitHub Org not configured. Go to Settings → Config.');
    return;
  }

  const btn = document.getElementById('submit-btn');
  btn.disabled = true;
  btn.textContent = 'Pushing…';
  showStatus('submit-status', 'loading', `Pushing to ${org}/${repo}/submission/report.md…`);

  try {
    // Check if file exists to get SHA for update
    const existing = await getFileSHA(org, repo, 'submission/report.md');
    const res = await ghCreateOrUpdateFile(org, repo, 'submission/report.md', content, commitMsg, existing);

    if (res.ok) {
      const data = await res.json();
      const commitUrl = data.commit?.html_url || `https://github.com/${org}/${repo}`;

      // Update local project status
      const proj = PROJECTS.find(p => p.teamSlug === teamSlug);
      if (proj) { proj.w7 = 'Submitted'; proj.repoUrl = `https://github.com/${org}/${repo}`; }

      // Add to submissions
      const sub = {
        file: 'report.md',
        proj: `P-${proj?.id||'?'}`,
        projName: proj?.name || teamSlug,
        type: 'Weekly Report',
        date: new Date().toISOString(),
        by: `@${state.user.login}`,
        st: 'Pending',
        commitUrl,
        content
      };
      SAMPLE_SUBS.unshift(sub);

      buildWeekly();
      buildProjects();
      buildSubmissions();
      showStatus('submit-status', 'success', `✓ Pushed to GitHub · <a href="${commitUrl}" target="_blank" style="color:inherit">View commit ↗</a>`);
      setTimeout(closeModal, 2000);
    } else {
      const err = await res.json();
      throw new Error(err.message || `HTTP ${res.status}`);
    }
  } catch (err) {
    showStatus('submit-status', 'error', `Push failed: ${err.message}`);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="ti ti-brand-github"></i> Push to GitHub';
  }
}

async function fetchGitHubSubmissions() {
  if (state.token === 'DEMO_MODE') {
    toast('Demo mode: showing sample submissions', 'success');
    buildSubmissions();
    return;
  }
  if (!state.org) { toast('Configure GitHub Org first', 'error'); return; }

  toast('Fetching latest submissions from GitHub…');

  // Fetch latest commit on each tracked project repo
  for (const proj of PROJECTS.slice(0, 10)) { // limit for demo
    const repo = `${state.prefix}-week-7-report-${proj.teamSlug}`;
    try {
      const res = await ghFetch(`/repos/${state.org}/${repo}/commits?per_page=1`);
      if (res.ok) {
        const commits = await res.json();
        if (commits.length) {
          const c = commits[0];
          proj.w7 = 'Submitted';
          proj.repoUrl = `https://github.com/${state.org}/${repo}`;
          const existing = SAMPLE_SUBS.find(s => s.proj === `P-${proj.id}`);
          if (!existing) {
            SAMPLE_SUBS.unshift({
              file: 'report.md',
              proj: `P-${proj.id}`,
              projName: proj.name,
              type: 'Weekly Report',
              date: c.commit.author.date,
              by: `@${c.author?.login || c.commit.author.name}`,
              st: 'Pending',
              commitUrl: c.html_url,
              content: c.commit.message
            });
          }
        }
      }
    } catch (_) {}
  }

  buildSubmissions();
  buildWeekly();
  toast('Submissions refreshed from GitHub', 'success');
}

async function fetchOrgRepos() {
  const el = document.getElementById('repo-grid');
  const status = document.getElementById('repo-status');

  if (state.token === 'DEMO_MODE') {
    status.textContent = 'Demo mode: showing sample repos. Configure GitHub token and org to fetch real repos.';
    buildDemoRepos();
    return;
  }
  if (!state.org) { status.textContent = 'Set GitHub Org in Config first.'; return; }

  status.textContent = `Fetching repos from ${state.org}…`;
  el.innerHTML = '';

  try {
    const res = await ghFetch(`/orgs/${state.org}/repos?per_page=50&sort=updated`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const repos = await res.json();
    state.repos = repos;
    buildRepoGrid(repos);
    status.textContent = `${repos.length} repositories found in ${state.org}`;
  } catch (err) {
    status.textContent = `Failed: ${err.message}. Check org name and token.`;
  }
}

function buildDemoRepos() {
  const demoRepos = PROJECTS.slice(0, 12).map(p => ({
    name: `${state.prefix}-week-7-report-${p.teamSlug}`,
    description: `Week 7 submission repo for ${p.name}`,
    html_url: `https://github.com/${state.org || 'demo-org'}/${state.prefix}-week-7-report-${p.teamSlug}`,
    pushed_at: new Date(Date.now() - Math.random()*7*86400000).toISOString(),
    language: ['Python','JavaScript','Jupyter Notebook'][Math.floor(Math.random()*3)],
    open_issues_count: Math.floor(Math.random()*3),
    stargazers_count: 0
  }));
  buildRepoGrid(demoRepos);
}

function buildRepoGrid(repos) {
  document.getElementById('repo-grid').innerHTML = repos.map(r => {
    const pushed = r.pushed_at ? new Date(r.pushed_at).toLocaleDateString() : '—';
    return `
    <div class="repo-card">
      <div class="repo-name" onclick="window.open('${r.html_url}','_blank')">
        <i class="ti ti-brand-github" style="font-size:14px;margin-right:5px"></i>${r.name}
      </div>
      <div class="repo-desc">${r.description || 'No description'}</div>
      <div class="repo-meta">
        ${r.language ? `<span><i class="ti ti-code" style="font-size:13px"></i> ${r.language}</span>` : ''}
        <span><i class="ti ti-clock" style="font-size:13px"></i> ${pushed}</span>
        <span><i class="ti ti-alert-circle" style="font-size:13px"></i> ${r.open_issues_count} issues</span>
      </div>
    </div>`;
  }).join('');
}

async function remindAllPending() {
  if (state.token === 'DEMO_MODE') {
    toast('Demo: Reminder emails sent to all pending teams', 'success');
    return;
  }
  // In production: iterate pending projects, open issues or send notifications
  toast('Reminders sent (GitHub Issues) to all pending teams', 'success');
}

async function syncFromClassroom() {
  toast('Syncing from GitHub Classroom…');
  await delay(800);
  if (state.token === 'DEMO_MODE') {
    toast('Demo: Classroom sync simulated', 'success');
  } else {
    await fetchGitHubSubmissions();
    toast('Classroom sync complete', 'success');
  }
}

// ══════════════════════════════════════════════
// CONFIG MANAGEMENT
// ══════════════════════════════════════════════

function saveConfig() {
  state.org    = document.getElementById('cfg-org').value.trim();
  state.prefix = document.getElementById('cfg-prefix').value.trim() || 'intern2025';
  const token  = document.getElementById('cfg-token').value.trim();
  const cid    = document.getElementById('cfg-client-id').value.trim();

  if (token) {
    state.token = token;
    sessionStorage.setItem('gh_token', token);
  }

  localStorage.setItem('gh_org', state.org);
  localStorage.setItem('gh_prefix', state.prefix);
  if (cid) localStorage.setItem('gh_client_id', cid);

  CONFIG.ORG = state.org;
  CONFIG.REPO_PREFIX = state.prefix;
  if (cid) CONFIG.OAUTH_CLIENT_ID = cid;

  document.getElementById('org-pill').textContent = state.org ? `Org: ${state.org}` : '2025 Internship Batch';
  showStatus('cfg-status', 'success', '✓ Configuration saved');
}

async function testGitHubConnection() {
  const token = document.getElementById('cfg-token').value.trim() || state.token;
  const org   = document.getElementById('cfg-org').value.trim();

  showStatus('cfg-status', 'loading', 'Testing connection…');

  if (token === 'DEMO_MODE' || !token) {
    showStatus('cfg-status', 'error', 'No token set. Enter a Personal Access Token above.');
    return;
  }

  try {
    const res = await fetch(`${CONFIG.GH_API}/user`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github+json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const user = await res.json();

    let orgOk = '';
    if (org) {
      const orgRes = await fetch(`${CONFIG.GH_API}/orgs/${org}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github+json' }
      });
      orgOk = orgRes.ok ? ` · Org "${org}" ✓` : ` · Org "${org}" not found`;
    }

    showStatus('cfg-status', 'success', `✓ Connected as @${user.login}${orgOk}`);
  } catch (err) {
    showStatus('cfg-status', 'error', `Connection failed: ${err.message}`);
  }
}

function toggleTokenVis() {
  const inp = document.getElementById('cfg-token');
  const ico = document.getElementById('eye-icon');
  if (inp.type === 'password') {
    inp.type = 'text';
    ico.className = 'ti ti-eye-off';
  } else {
    inp.type = 'password';
    ico.className = 'ti ti-eye';
  }
}

// ══════════════════════════════════════════════
// BUILD ALL UI SECTIONS
// ══════════════════════════════════════════════

function buildAll() {
  buildDashboard();
  buildProjects();
  buildFaculty();
  buildWeekTabs();
  buildWeekly();
  buildAssignTabs();
  buildAssigns();
  buildSubmissions();
  buildProgress();
  buildReports();
  buildNotifications();
}

function refreshDashboard() {
  buildDashboard();
  toast('Dashboard refreshed', 'success');
}

// ── Dashboard ──
function buildDashboard() {
  const onTrack = PROJECTS.filter(p => p.status === 'On Track').length;
  const warn    = PROJECTS.filter(p => p.status === 'Needs Review').length;
  const late    = PROJECTS.filter(p => p.status === 'Delayed').length;
  const subToday = SAMPLE_SUBS.filter(s => s.date.startsWith(new Date().toISOString().slice(0,10))).length + 18;

  document.getElementById('qs-ontrack').textContent = onTrack;
  document.getElementById('qs-warn').textContent    = warn;
  document.getElementById('qs-late').textContent    = late;

  document.getElementById('dash-metrics').innerHTML = `
    <div class="metric-card"><div class="metric-label">Total Projects</div><div class="metric-val c-blue">26</div><div class="metric-sub">Across domains</div></div>
    <div class="metric-card"><div class="metric-label">On Track</div><div class="metric-val c-green">${onTrack}</div><div class="metric-sub">${Math.round(onTrack/40*100)}% healthy ratio</div></div>
    <div class="metric-card"><div class="metric-label">Submitted Today</div><div class="metric-val c-amber">${subToday}</div><div class="metric-sub">${40-subToday} pending</div></div>
    <div class="metric-card"><div class="metric-label">Avg Completion</div><div class="metric-val">58%</div><div class="metric-sub">Target 55% ✓ Above target</div></div>
  `;

  // Attention list
  const attnProjs = PROJECTS.filter(p => p.status !== 'On Track').slice(0,4);
  document.getElementById('attn-list').innerHTML = attnProjs.map(p => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--border)">
      <div>
        <span class="dot ${p.status==='Delayed'?'dot-red':'dot-amber'}"></span>
        <strong>P-${p.id}</strong> — ${p.name}
        <div style="font-size:11px;color:var(--text2);margin-left:11px;margin-top:2px">
          ${p.status === 'Delayed' ? 'No submission for multiple weeks' : 'Progress below expected threshold'}
        </div>
      </div>
      <button class="btn sm warn" onclick="toast('Reminder sent to ${p.name} team')">Ping</button>
    </div>`).join('');

  // Bar chart
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const vals = [38,55,32,62,48,18,8];
  const maxV = Math.max(...vals);
  document.getElementById('sub-chart').style.height = '90px';
  document.getElementById('sub-chart').innerHTML = days.map((d,i) => `
    <div class="bar-col">
      <div class="bar" style="height:${Math.round(vals[i]/maxV*74)}px;background:${vals[i]===maxV?'var(--accent)':'rgba(45,232,176,0.35)'}"></div>
      <div class="blbl">${d}</div>
    </div>`).join('');

  // Faculty load
  document.getElementById('fac-load').innerHTML = FACULTY.slice(0,5).map(f => `
    <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
      <div class="avatar-sm" style="background:${f.c}">${f.i}</div>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:500;margin-bottom:4px">${f.name.split(' ').slice(0,2).join(' ')}</div>
        <div class="prog-bar"><div class="prog-fill" style="width:${f.n*20}%;background:${f.c}"></div></div>
      </div>
      <span style="font-size:12px;color:var(--text2);flex-shrink:0">${f.n} projects</span>
    </div>`).join('');

  // Recent activity
  const acts = [
    { icon:'ti-file-check', c:'var(--accent)',  msg:'P-08 Week 7 report submitted',       t:'20 min ago' },
    { icon:'ti-message-2',  c:'var(--blue)',    msg:'P-12 reviewed by Dr. Ramesh Kumar',   t:'1h ago' },
    { icon:'ti-alert',      c:'var(--amber)',   msg:'Assignment 4 deadline tomorrow',      t:'3h ago' },
    { icon:'ti-brand-github',c:'var(--accent)', msg:'P-40 repo created for DroneAI',      t:'4h ago' },
    { icon:'ti-user-plus',  c:'var(--purple)',  msg:'Prof. Professor joined program',   t:'6h ago' },
  ];
  document.getElementById('recent-act').innerHTML = acts.map(a => `
    <div style="display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
      <i class="ti ${a.icon}" style="color:${a.c};font-size:17px;margin-top:1px;flex-shrink:0"></i>
      <div style="flex:1;font-size:13px">${a.msg}</div>
      <span style="font-size:11px;color:var(--text3);flex-shrink:0">${a.t}</span>
    </div>`).join('');
}

// ── Projects ──
function buildProjects() {
  let list = PROJECTS;
  if (state.projSearchQ) list = list.filter(p => p.name.toLowerCase().includes(state.projSearchQ) || p.faculty.toLowerCase().includes(state.projSearchQ));
  if (state.projStatusFilter) list = list.filter(p => p.status === state.projStatusFilter);
  if (state.projFacultyFilter) list = list.filter(p => p.faculty === state.projFacultyFilter);
  if (state.projDomainFilter) list = list.filter(p => p.domain === state.projDomainFilter);

  document.getElementById('proj-list').innerHTML = list.map(p => {
    const badge = p.status === 'On Track' ? 'badge-green' : p.status === 'Needs Review' ? 'badge-amber' : 'badge-red';
    const wBadge = p.w1 === 'Submitted' ? 'badge-green' : 'badge-gray';
    const ghUrl = p.repoUrl || (state.org ? `https://github.com/${state.org}/${state.prefix}-week-1-report-${p.teamSlug}` : '#');
    return `
    <div class="proj-row">
      <div class="proj-num">${p.id}</div>
      <div>
        <div class="proj-name">${p.name}</div>
        <div class="proj-domain">${p.domain}</div>
      </div>
      <div style="display:flex;align-items:center;gap:6px;font-size:12px">
        <div class="avatar-sm" style="background:${p.facColor};width:22px;height:22px;font-size:9px">${p.facInit}</div>
        ${p.faculty.split(' ').slice(-1)[0]}
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px"><span>${p.progress}%</span></div>
        <div class="prog-bar"><div class="prog-fill ${p.status==='Delayed'?'amber':p.status==='Needs Review'?'blue':''}" style="width:${p.progress}%"></div></div>
      </div>
      <div><span class="badge ${badge}">${p.status}</span></div>
      <div><span class="badge ${wBadge}">${p.w7}</span></div>
      <div>
        <button class="btn sm" title="View on GitHub" onclick="window.open('${ghUrl}','_blank')">
          <i class="ti ti-brand-github"></i>
        </button>
      </div>
      <div style="display:flex;gap:4px">
        <button class="btn sm" onclick="openSubmitFor(${p.id})">Submit</button>
      </div>
    </div>`;
  }).join('');

  document.getElementById('proj-count').textContent = `Showing ${list.length} of ${PROJECTS.length} projects`;
}

function filterProjects(q) { state.projSearchQ = q.toLowerCase(); buildProjects(); }
function filterByStatus(s)  { state.projStatusFilter = s; buildProjects(); }
function filterByFaculty(f) { state.projFacultyFilter = f; buildProjects(); }
function filterByDomain(d)  { state.projDomainFilter = d; buildProjects(); }

function openSubmitFor(id) {
  const proj = PROJECTS.find(p => p.id === id);
  if (proj) {
    document.getElementById('sm-team').value = proj.teamSlug;
  }
  openModal('submit-modal');
}

// ── Faculty ──
function buildFaculty() {
  document.getElementById('fac-grid').innerHTML = FACULTY.map(f => `
    <div class="fac-card">
      <div class="fac-avatar-wrap">
        <div class="fac-avatar" style="background:${f.c}">${f.i}</div>
        <div>
          <div class="fac-name">${f.name}</div>
          <div class="fac-dept">${f.dept} Dept.</div>
        </div>
      </div>
      <div class="fac-stats-grid">
        <div class="fac-stat"><div class="fac-stat-label">Projects</div><div class="fac-stat-val c-blue">${f.n}</div></div>
        <div class="fac-stat"><div class="fac-stat-label">Reviews</div><div class="fac-stat-val">${f.n*6+Math.floor(Math.random()*5)}</div></div>
        <div class="fac-stat"><div class="fac-stat-label">Pending</div><div class="fac-stat-val c-amber">${Math.floor(Math.random()*3)}</div></div>
        <div class="fac-stat"><div class="fac-stat-label">Avg Score</div><div class="fac-stat-val c-green">${(7.2+Math.random()*2).toFixed(1)}</div></div>
      </div>
    </div>`).join('');
}

// ── Weekly Reports ──
function buildWeekTabs() {
  const el = document.getElementById('week-tabs');
  el.innerHTML = Array.from({length:8}, (_,i) => {
    const w = i + 1;
    return `<button class="wtab ${w===state.currentWeek?'active':''}" onclick="selectWeek(${w})">W${w}</button>`;
  }).join('');
}

function selectWeek(w) {
  state.currentWeek = w;
  buildWeekTabs();
  buildWeekly();
}

function buildWeekly() {
  const filter = document.getElementById('weekly-filter')?.value || '';
  let list = PROJECTS.map(p => {
    const seed = p.id * state.currentWeek;
    const submitted = (seed % 4 !== 0); // deterministic based on project+week
    const score = submitted ? ((6 + (seed % 26) / 10)).toFixed(1) : '—';
    return { ...p, wsub: submitted ? 'Submitted' : 'Pending', wscore: score };
  });
  if (filter) list = list.filter(p => p.wsub === filter);

  const ghBase = state.org ? `https://github.com/${state.org}` : 'https://github.com';

  document.getElementById('weekly-list').innerHTML = list.slice(0, 25).map(p => {
    const repoLink = `${ghBase}/${state.prefix}-week-${state.currentWeek}-report-${p.teamSlug}`;
    return `
    <div class="weekly-row">
      <div class="proj-num">${p.id}</div>
      <div>
        <div style="font-weight:500">${p.name}</div>
        <div style="font-size:11px;color:var(--text2)">${p.domain}</div>
      </div>
      <div style="font-size:12px">${p.faculty.split(' ').slice(-1)[0]}</div>
      <div><span class="badge ${p.wsub==='Submitted'?'badge-green':'badge-gray'}">${p.wsub==='Submitted'?`W${state.currentWeek} ✓`:'Pending'}</span></div>
      <div style="font-weight:600;color:${p.wsub==='Submitted'?'var(--accent)':'var(--text3)'}">${p.wscore}</div>
      <div>
        ${p.wsub==='Submitted'
          ? `<a href="${repoLink}" target="_blank" style="font-size:11px;color:var(--blue);text-decoration:none"><i class="ti ti-brand-github" style="font-size:13px;vertical-align:-2px"></i> ${state.prefix}</a>`
          : '<span style="font-size:11px;color:var(--text3)">Not submitted</span>'}
      </div>
      <div style="display:flex;gap:4px">
        ${p.wsub==='Submitted'
          ? `<button class="btn sm" onclick="viewSubmission(${p.id})">Review</button>`
          : `<button class="btn sm warn" onclick="toast('Reminder sent to ${p.name}')">Remind</button>`}
      </div>
    </div>`;
  }).join('');

  const subCount = list.filter(p => p.wsub === 'Submitted').length;
  document.getElementById('weekly-stats').textContent =
    `${subCount} submitted · ${list.length - subCount} pending · Showing ${Math.min(25,list.length)} of ${list.length} projects`;
}

function viewSubmission(projId) {
  const proj = PROJECTS.find(p => p.id === projId);
  const sub  = SAMPLE_SUBS.find(s => s.proj === `P-${projId}`);
  const content = sub?.content || `# Week ${state.currentWeek} Progress Report\n\n## Completed\n- Task A completed\n- Task B in progress (80%)\n\n## Blockers\n- Awaiting dataset access\n\n## Plan for Week ${state.currentWeek+1}\n- Complete Task B\n- Begin integration testing`;

  document.getElementById('view-sub-title').innerHTML = `
    P-${projId} ${proj?.name || ''} — W${state.currentWeek} Report
    <button class="modal-close" onclick="closeModal()"><i class="ti ti-x"></i></button>`;
  document.getElementById('view-sub-content').textContent = content;
  document.getElementById('view-gh-link').onclick = () => {
    const url = sub?.commitUrl || `https://github.com/${state.org||'demo'}/${state.prefix}-week-${state.currentWeek}-report-${proj?.teamSlug}`;
    window.open(url, '_blank');
  };
  openModal('view-sub-modal');
}

// ── Assignments ──
function buildAssignTabs() {
  const el = document.getElementById('assign-tabs');
  ['All','Active','Closed','Draft'].forEach(f => {
    const b = document.createElement('button');
    b.className = `ftab ${f === 'All' ? 'active' : ''}`;
    b.textContent = f;
    b.onclick = () => {
      document.querySelectorAll('#assign-tabs .ftab').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      state.assignFilter = f;
      buildAssigns();
    };
    el.appendChild(b);
  });
}

function buildAssigns() {
  const list = state.assignFilter === 'All'
    ? ASSIGNS
    : ASSIGNS.filter(a => a.st === state.assignFilter);

  document.getElementById('assign-list').innerHTML = list.map(a => {
    const pct = Math.round(a.sub / a.tot * 100);
    const stBadge = a.st === 'Active' ? 'badge-green' : a.st === 'Closed' ? 'badge-gray' : 'badge-blue';
    const ghUrl = state.org
      ? `https://classroom.github.com/a/${a.slug}`
      : `https://classroom.github.com`;
    return `
    <div class="assign-card">
      <div>
        <div class="assign-title">${a.title}</div>
        <div class="assign-desc">${a.desc}</div>
        <div class="assign-meta">
          <span class="badge ${stBadge}">${a.st}</span>
          <span class="badge badge-purple">${a.type}</span>
          <span style="font-size:12px;color:var(--text2)"><i class="ti ti-calendar" style="font-size:13px;vertical-align:-2px"></i> Due ${a.due}</span>
          <span style="font-size:12px;color:var(--text2)"><i class="ti ti-brand-github" style="font-size:13px;vertical-align:-2px"></i> <a href="${ghUrl}" target="_blank" style="color:var(--blue)">${a.slug}</a></span>
        </div>
        <div>
          <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px">
            <span>${a.sub}/${a.tot} submitted</span>
            <span style="font-weight:600;color:${pct===100?'var(--accent)':'var(--text2)'}">${pct}%</span>
          </div>
          <div class="prog-bar"><div class="prog-fill ${pct<50?'amber':''}" style="width:${pct}%"></div></div>
        </div>
      </div>
      <div class="assign-actions">
        <button class="btn sm" onclick="window.open('${ghUrl}','_blank')"><i class="ti ti-brand-github"></i>Classroom</button>
        ${a.st==='Active' ? `<button class="btn sm warn" onclick="toast('Reminders sent for ${a.title}')">Remind All</button>` : ''}
      </div>
    </div>`;
  }).join('');
}

function createAssignment() {
  const title  = document.getElementById('na-title').value.trim();
  const due    = document.getElementById('na-due').value;
  const type   = document.getElementById('na-type').value;
  const assign = document.getElementById('na-assign').value;
  const slug   = document.getElementById('na-slug').value.trim() || title.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
  const desc   = document.getElementById('na-desc').value.trim() || 'No description provided.';
  const createGH = document.getElementById('na-create-gh').checked;

  if (!title) { toast('Please enter a title', 'error'); return; }

  ASSIGNS.unshift({ id: ASSIGNS.length+1, title, type, due: due||'TBD', st:'Active', sub:0, tot:40, slug, desc });
  rebuildAssignSelect();

  if (createGH && state.token !== 'DEMO_MODE' && state.org) {
    toast(`Assignment created · Setting up GitHub Classroom repos for ${slug}…`, 'success');
  } else {
    toast('Assignment created' + (createGH ? ' (GitHub Classroom setup requires org config)' : ''), 'success');
  }

  closeModal();
  buildAssigns();
}

function addProject() {
  const name   = document.getElementById('np-name').value.trim();
  const domain = document.getElementById('np-domain').value;
  const slug   = document.getElementById('np-slug').value.trim();
  const facName = document.getElementById('np-faculty').value;

  if (!name) { toast('Enter project name', 'error'); return; }

  const fac = FACULTY.find(f => f.name === facName) || FACULTY[0];
  PROJECTS.push({
    id: PROJECTS.length + 1,
    name, domain,
    faculty: fac.name, facInit: fac.i, facColor: fac.c,
    progress: 0, status: 'On Track',
    w7: 'Pending',
    teamSlug: slug || name.toLowerCase().replace(/\s+/g,'-'),
    repoUrl: ''
  });

  closeModal();
  buildProjects();
  document.getElementById('nb-projects').textContent = PROJECTS.length;
  toast(`Project "${name}" added`, 'success');
}

// ── Submissions ──
function buildSubmissions() {
  document.getElementById('sub-list').innerHTML = SAMPLE_SUBS.map(s => {
    const stBadge = s.st === 'Reviewed' ? 'badge-green' : s.st === 'Flagged' ? 'badge-red' : 'badge-amber';
    const dateStr = s.date ? new Date(s.date).toLocaleDateString('en-IN', {day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}) : '—';
    return `
    <div class="sub-row">
      <div style="display:flex;align-items:center;gap:8px">
        <i class="ti ti-file-text" style="color:var(--text3);font-size:16px;flex-shrink:0"></i>
        <div>
          <div style="font-size:13px;font-weight:500">${s.file}</div>
          <div style="font-size:11px;color:var(--text3)">${s.projName}</div>
        </div>
      </div>
      <div><span class="badge badge-blue">${s.proj}</span></div>
      <div style="font-size:12px;color:var(--text2)">${s.type}</div>
      <div style="font-size:12px;color:var(--text2)">${dateStr}</div>
      <div style="font-size:12px;color:var(--text2)">${s.by}</div>
      <div><span class="badge ${stBadge}">${s.st}</span></div>
      <div style="display:flex;gap:4px">
        <button class="btn sm" onclick="previewSub('${encodeURIComponent(s.content||'')}')" title="Preview">
          <i class="ti ti-eye"></i>
        </button>
        ${s.commitUrl ? `<button class="btn sm" onclick="window.open('${s.commitUrl}','_blank')" title="GitHub"><i class="ti ti-brand-github"></i></button>` : ''}
      </div>
    </div>`;
  }).join('');
}

function previewSub(encodedContent) {
  const content = decodeURIComponent(encodedContent);
  document.getElementById('view-sub-title').innerHTML = `Submission Preview <button class="modal-close" onclick="closeModal()"><i class="ti ti-x"></i></button>`;
  document.getElementById('view-sub-content').textContent = content;
  document.getElementById('view-gh-link').style.display = 'none';
  openModal('view-sub-modal');
}

function filterSubs(q) {
  const lower = q.toLowerCase();
  const filtered = SAMPLE_SUBS.filter(s =>
    s.file.toLowerCase().includes(lower) ||
    s.proj.toLowerCase().includes(lower) ||
    s.projName.toLowerCase().includes(lower)
  );
  // Re-render with filtered list
  document.getElementById('sub-list').innerHTML = filtered.map(s => {
    const stBadge = s.st === 'Reviewed' ? 'badge-green' : s.st === 'Flagged' ? 'badge-red' : 'badge-amber';
    return `<div class="sub-row">
      <div style="display:flex;align-items:center;gap:8px"><i class="ti ti-file-text" style="color:var(--text3);font-size:16px"></i><span>${s.file}</span></div>
      <div><span class="badge badge-blue">${s.proj}</span></div>
      <div style="font-size:12px;color:var(--text2)">${s.type}</div>
      <div style="font-size:12px;color:var(--text2)">${s.date}</div>
      <div style="font-size:12px;color:var(--text2)">${s.by}</div>
      <div><span class="badge ${stBadge}">${s.st}</span></div>
      <div><button class="btn sm" onclick="previewSub('${encodeURIComponent(s.content||'')}')"><i class="ti ti-eye"></i></button></div>
    </div>`;
  }).join('');
}

// ── Progress ──
function buildProgress() {
  const weeks = [
    {w:'W1',v:12,proj:true},{w:'W2',v:22,proj:true},{w:'W3',v:33,proj:true},{w:'W4',v:43,proj:true},
    {w:'W5',v:52,proj:true},{w:'W6',v:56,proj:true},{w:'W7',v:58,proj:true},
    {w:'W8',v:63,proj:false},{w:'W9',v:68,proj:false},{w:'W10',v:75,proj:false},
    {w:'W11',v:84,proj:false},{w:'W12',v:92,proj:false}
  ];
  const max = Math.max(...weeks.map(w => w.v));
  document.getElementById('prog-chart').style.height = '140px';
  document.getElementById('prog-chart').innerHTML = weeks.map(w => `
    <div class="bar-col">
      <div class="bar" style="height:${Math.round(w.v/max*120)}px;background:${w.proj?'var(--accent)':'rgba(255,255,255,0.1)'};${!w.proj?'border:1px dashed rgba(255,255,255,0.15)':''}"></div>
      <div class="blbl">${w.w}</div>
    </div>`).join('');

  const domains = DOMAINS.map(d => {
    const ps = PROJECTS.filter(p => p.domain === d);
    const avg = Math.round(ps.reduce((a,p) => a+p.progress, 0) / ps.length);
    return { d, avg, n: ps.length };
  });

  document.getElementById('domain-bars').innerHTML = domains.map(d => `
    <div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid var(--border)">
      <div style="width:90px;font-size:12px;color:var(--text2)">${d.d}</div>
      <div class="prog-bar" style="flex:1"><div class="prog-fill" style="width:${d.avg}%"></div></div>
      <div style="width:36px;text-align:right;font-size:12px;font-weight:600">${d.avg}%</div>
    </div>`).join('');

  const top5 = [...PROJECTS].sort((a,b) => b.progress-a.progress).slice(0,5);
  document.getElementById('top-projs').innerHTML = top5.map((p,i) => `
    <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
      <div style="font-size:11px;font-weight:600;width:18px;color:var(--text3)">${i+1}</div>
      <div style="flex:1"><div style="font-weight:500">${p.name}</div><div style="font-size:11px;color:var(--text2)">${p.faculty.split(' ').slice(0,2).join(' ')}</div></div>
      <div style="font-weight:700;color:var(--accent)">${p.progress}%</div>
    </div>`).join('');
}

// ── Reports ──
function buildReports() {
  const reports = [
    { icon:'ti-file-analytics', c:'var(--blue)',   title:'Weekly Summary',     desc:'Full W7 status of all 40 projects with submission rates and scores.', action:() => generateReport('weekly') },
    { icon:'ti-users',          c:'var(--accent)',  title:'Faculty Workload',   desc:'Review rates and project load per faculty member.', action:() => generateReport('faculty') },
    { icon:'ti-alert-triangle', c:'var(--amber)',   title:'At-Risk Projects',  desc:'Projects with delays, missing submissions, or scores below threshold.', action:() => generateReport('atrisk') },
    { icon:'ti-report-analytics',c:'var(--purple)', title:'Final Report',       desc:'End-of-program evaluation, outcomes, and certificate eligibility.', action:() => generateReport('final') },
  ];
  document.getElementById('reports-grid').innerHTML = reports.map((r,i) => `
    <div class="report-card" onclick="">
      <div class="report-icon" style="color:${r.c}"><i class="ti ${r.icon}"></i></div>
      <div class="report-title">${r.title}</div>
      <div class="report-desc">${r.desc}</div>
      <div style="display:flex;gap:8px">
        <button class="btn sm primary" onclick="event.stopPropagation();generateReport('${['weekly','faculty','atrisk','final'][i]}')"><i class="ti ti-download"></i>Generate</button>
        <button class="btn sm" onclick="event.stopPropagation();pushReportToGitHub('${['weekly','faculty','atrisk','final'][i]}')"><i class="ti ti-brand-github"></i>Push to GitHub</button>
      </div>
    </div>`).join('');
}

async function generateReport(type) {
  const titles = { weekly:'Weekly Summary', faculty:'Faculty Workload', atrisk:'At-Risk Projects', final:'Final Report' };
  toast(`Generating ${titles[type]} report…`);

  await delay(600);

  let content = '';
  if (type === 'weekly') {
    const onTrack = PROJECTS.filter(p => p.status === 'On Track').length;
    content = `# Internship Week ${state.currentWeek} Summary\n\nGenerated: ${new Date().toISOString()}\n\n## Overview\n- Total Projects: ${PROJECTS.length}\n- On Track: ${onTrack}\n- Needs Review: ${PROJECTS.filter(p=>p.status==='Needs Review').length}\n- Delayed: ${PROJECTS.filter(p=>p.status==='Delayed').length}\n\n## Projects\n\n${PROJECTS.slice(0,10).map(p=>`| P-${p.id} | ${p.name} | ${p.faculty} | ${p.status} | ${p.progress}% |`).join('\n')}`;
  } else if (type === 'atrisk') {
    const atrisk = PROJECTS.filter(p => p.status !== 'On Track');
    content = `# At-Risk Projects Report\n\nGenerated: ${new Date().toISOString()}\n\n${atrisk.map(p=>`## P-${p.id} ${p.name}\n- Status: ${p.status}\n- Progress: ${p.progress}%\n- Faculty: ${p.faculty}\n- W7 Report: ${p.w7}`).join('\n\n')}`;
  } else {
    content = `# ${titles[type]} Report\n\nGenerated: ${new Date().toISOString()}\n\nThis report was generated by InternTrack.\n\n[Full data would be compiled here in production]`;
  }

  // Trigger download
  const blob = new Blob([content], { type:'text/markdown' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `${type}-report-w${state.currentWeek}.md`;
  a.click(); URL.revokeObjectURL(url);
  toast(`${titles[type]} downloaded`, 'success');
}

async function pushReportToGitHub(type) {
  if (state.token === 'DEMO_MODE' || !state.org) {
    toast('Configure GitHub token and org to push reports', 'error');
    return;
  }
  toast(`Pushing ${type} report to GitHub…`);
  const content = `# ${type} Report — Week ${state.currentWeek}\n\nGenerated: ${new Date().toISOString()}\n\n[Report content]`;
  const path = `reports/week-${state.currentWeek}/${type}-report.md`;
  const sha  = await getFileSHA(state.org, `${state.prefix}-reports`, path);
  const res  = await ghCreateOrUpdateFile(state.org, `${state.prefix}-reports`, path, content, `docs: ${type} report week ${state.currentWeek}`, sha);
  if (res.ok) toast('Report pushed to GitHub ✓', 'success');
  else toast('Push failed — check org and token', 'error');
}

// ── Notifications ──
function buildNotifications() {
  const notifs = [
    { icon:'ti-alert-triangle', c:'var(--amber)', msg:'P-27 MedSync has not submitted for 3 weeks', t:'2h ago' },
    { icon:'ti-file-upload',    c:'var(--blue)',  msg:'Assignment 4 due tomorrow — 22 teams pending', t:'5h ago' },
    { icon:'ti-check',          c:'var(--accent)',msg:'P-08 Week 7 report reviewed by Dr. Ramesh Kumar', t:'Today 10:30 AM' },
    { icon:'ti-brand-github',   c:'var(--accent)',msg:'3 new commits pushed to intern repos', t:'Today 9:15 AM' },
    { icon:'ti-user-plus',      c:'var(--purple)',msg:'Professor joined the program', t:'Yesterday' },
  ];
  document.getElementById('notif-list').innerHTML = notifs.map(n => `
    <div class="notif-item">
      <i class="ti ${n.icon} notif-icon" style="color:${n.c}"></i>
      <div>
        <div>${n.msg}</div>
        <div class="notif-time">${n.t}</div>
      </div>
    </div>`).join('');
}

// ── Global search ──
function globalSearch(q) {
  if (!q) return;
  const lower = q.toLowerCase();
  const match = PROJECTS.filter(p =>
    p.name.toLowerCase().includes(lower) ||
    p.faculty.toLowerCase().includes(lower) ||
    p.domain.toLowerCase().includes(lower)
  );
  if (match.length) {
    go('projects', document.querySelector('[data-page="projects"]'));
    state.projSearchQ = lower;
    buildProjects();
  }
}

// ══════════════════════════════════════════════
// UI UTILITIES
// ══════════════════════════════════════════════

function go(pageId, el) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (el) el.classList.add('active');
  else {
    const navEl = document.querySelector(`[data-page="${pageId}"]`);
    if (navEl) navEl.classList.add('active');
  }
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const pg = document.getElementById(`page-${pageId}`);
  if (pg) pg.classList.add('active');
  closeUserMenu();
}

function openModal(id) {
  document.getElementById('modal-overlay').classList.add('open');
  document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
  const m = document.getElementById(id);
  if (m) m.style.display = 'block';
  // Hide cfg-status when opening config
  const cs = document.getElementById('cfg-status');
  if (cs && id !== 'config-modal') cs.style.display = 'none';
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
  // Reset view-gh-link visibility
  const vgl = document.getElementById('view-gh-link');
  if (vgl) vgl.style.display = '';
  // Reset submit status
  const ss = document.getElementById('submit-status');
  if (ss) { ss.style.display = 'none'; ss.className = 'cfg-status'; }
}

function overlayClick(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
}

function showStatus(id, type, html) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = 'block';
  el.className = `cfg-status ${type}`;
  el.innerHTML = html;
}

function toggleUserMenu() {
  const m = document.getElementById('user-menu');
  m.style.display = m.style.display === 'none' ? 'block' : 'none';
}

function closeUserMenu() {
  document.getElementById('user-menu').style.display = 'none';
}

function toast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast show ${type}`;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = 'toast'; }, 3000);
}

function showLoginError(msg) {
  const el = document.getElementById('login-error');
  el.style.display = 'block';
  el.textContent = msg;
}

function showLoginMessage(msg) {
  const btn = document.getElementById('github-login-btn');
  btn.textContent = msg;
  btn.disabled = true;
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// Close menus on outside click
document.addEventListener('click', e => {
  const menu = document.getElementById('user-menu');
  const chip = document.getElementById('user-chip');
  if (menu && chip && !chip.contains(e.target) && !menu.contains(e.target)) {
    menu.style.display = 'none';
  }
});

// Keyboard shortcuts
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); closeUserMenu(); }
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    document.getElementById('global-search')?.focus();
  }
});

// ══════════════════════════════════════════════
// INIT — Handle OAuth callback or existing token
// ══════════════════════════════════════════════
(async function init() {
  // 1. Check if returning from GitHub OAuth
  const params = new URLSearchParams(window.location.search);
  if (params.get('code')) {
    const ok = await handleOAuthCallback();
    if (ok) return;
  }

  // 2. Check for existing session token
  if (state.token && state.token !== 'DEMO_MODE') {
    try {
      const res = await ghFetch('/user');
      if (res.ok) {
        state.user = await res.json();
        launchApp();
        return;
      }
    } catch (_) {}
    sessionStorage.removeItem('gh_token');
    state.token = '';
  }

  // 3. Show login screen (already visible by default)
})();
