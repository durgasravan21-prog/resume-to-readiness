const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const DEFAULT_PORT = parseInt(process.env.PORT || '3000', 10);
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

// SSE clients
const sseClients = new Set();

function broadcastReload() {
  for (const client of sseClients) {
    try { client.write('data: reload\n\n'); } catch { sseClients.delete(client); }
  }
}

let debounceTimer = null;
try {
  fs.watch(ROOT_DIR, { recursive: true }, (eventType, filename) => {
    if (!filename || filename.includes('.git') || filename.includes('node_modules')) return;
    const ext = path.extname(filename).toLowerCase();
    if (['.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.svg', '.md'].includes(ext)) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        console.log(`[LiveServer] Change: ${filename} → reloading`);
        broadcastReload();
      }, 150);
    }
  });
} catch (err) {
  console.warn('[LiveServer] Watcher warning:', err.message);
}

// =============================================================================
// COMPREHENSIVE INJECTION: Flow Nav + CTA Wiring + Height Reporting + SSE
// =============================================================================
const INJECTED_SCRIPT = `
<!-- Readiness Platform: Navigation System & Live Reload -->
<script>
(function() {
  'use strict';

  // ── SSE Live Reload ──────────────────────────────────────────────────────────
  try {
    var es = new EventSource('/__live_reload');
    es.onmessage = function(e) { if (e.data === 'reload') window.location.reload(); };
  } catch(e) {}

  // ── Height Reporter (for parent iframe auto-sizing) ──────────────────────────
  function reportHeight() {
    if (window.parent !== window) {
      var h = Math.max(
        document.body.scrollHeight || 0,
        document.body.offsetHeight || 0,
        document.documentElement.scrollHeight || 0,
        document.documentElement.offsetHeight || 0
      );
      window.parent.postMessage({ type: 'readiness-frame-height', height: h }, '*');
    }
  }

  // ── Flow Definitions ─────────────────────────────────────────────────────────
  var DESKTOP_FLOW = [
    { path: '/welcome_sign_in_readiness/code.html', title: 'Welcome & Sign In', short: 'Welcome' },
    { path: '/step_2_of_3_target_role_selection/code.html', title: 'Target Role Selection', short: 'Role' },
    { path: '/analyzing_resume_reading_in_progress/code.html', title: 'Resume Analysis', short: 'Audit' },
    { path: '/student_home_readiness/code.html', title: 'Student Dashboard', short: 'Home' },
    { path: '/diagnostic_gap_analysis_aarav_sundaram/code.html', title: 'Gap Analysis', short: 'Gaps' },
    { path: '/skill_map_junior_frontend_developer/code.html', title: 'Skill Map', short: 'Skills' },
    { path: '/gap_detail_react_state_management/code.html', title: 'Gap Detail', short: 'Detail' },
    { path: '/prioritized_roadmap_junior_frontend_developer/code.html', title: 'Prioritized Roadmap', short: 'Priority' },
    { path: '/action_roadmap_6_week_placement_plan/code.html', title: '6-Week Action Plan', short: '6-Week' },
    { path: '/advisory_mentor_guidance_readiness/code.html', title: 'Advisory & Mentor', short: 'Mentor' },
    { path: '/cohort_readiness_tpc_coordinator_view/code.html', title: 'TPC Coordinator', short: 'TPC' },
    { path: '/placement_coordinator_dashboard/code.html', title: 'Coordinator Dashboard', short: 'Dashboard' },
    { path: '/student_coaching_rahul_verma/code.html', title: 'Student Coaching', short: 'Coaching' },
    { path: '/system_states_edge_cases/code.html', title: 'System States', short: 'States' }
  ];

  var MOBILE_FLOW = [
    { path: '/welcome_sign_in_readiness_mobile/code.html', title: 'Welcome (Mobile)', short: 'Welcome' },
    { path: '/student_home_mobile_view/code.html', title: 'Home (Mobile)', short: 'Home' },
    { path: '/skill_diagnosis_mobile_view/code.html', title: 'Diagnosis (Mobile)', short: 'Diagnosis' },
    { path: '/action_roadmap_mobile_view/code.html', title: 'Roadmap (Mobile)', short: 'Roadmap' },
    { path: '/cohort_readiness_mobile_view/code.html', title: 'Cohort (Mobile)', short: 'Cohort' }
  ];

  var ALL_SCREENS = DESKTOP_FLOW.concat(MOBILE_FLOW);

  // ── Header Nav Link Mapping ──────────────────────────────────────────────────
  var NAV_MAP = {
    'home': '/student_home_readiness/code.html',
    'my-analyses': '/diagnostic_gap_analysis_aarav_sundaram/code.html',
    'analyses': '/diagnostic_gap_analysis_aarav_sundaram/code.html',
    'roadmap': '/action_roadmap_6_week_placement_plan/code.html',
    'mentor': '/advisory_mentor_guidance_readiness/code.html',
    'diagnostic-and-gap-analysis': '/diagnostic_gap_analysis_aarav_sundaram/code.html',
    'action-roadmap': '/action_roadmap_6_week_placement_plan/code.html',
    'cohort-readiness-tpc': '/cohort_readiness_tpc_coordinator_view/code.html',
    'resume-evidence': '/student_home_readiness/code.html',
    // TPC sidebar nav
    'overview': '/placement_coordinator_dashboard/code.html',
    'students': '/student_coaching_rahul_verma/code.html',
    'roles': '/cohort_readiness_tpc_coordinator_view/code.html',
    'reports': '/system_states_edge_cases/code.html',
    'settings': '/system_states_edge_cases/code.html',
    // Mobile bottom nav
    'diagnosis': '/skill_diagnosis_mobile_view/code.html',
    'cohort-tpc': '/cohort_readiness_mobile_view/code.html',
    'evidence': '/student_home_readiness/code.html'
  };

  var pagePath = window.location.pathname;

  // Skip injection entirely on the hub index page
  if (pagePath === '/' || pagePath === '/index.html') {
    reportHeight();
    return;
  }

  // ── Determine Current Flow & Position ────────────────────────────────────────
  var isMobilePage = pagePath.includes('mobile');
  var flow = isMobilePage ? MOBILE_FLOW : DESKTOP_FLOW;
  var currentIdx = -1;
  for (var i = 0; i < flow.length; i++) {
    if (pagePath === flow[i].path) { currentIdx = i; break; }
  }

  var prevScreen = currentIdx > 0 ? flow[currentIdx - 1] : null;
  var nextScreen = currentIdx >= 0 && currentIdx < flow.length - 1 ? flow[currentIdx + 1] : null;

  // ── Wait for DOM Ready ───────────────────────────────────────────────────────
  function onReady(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  onReady(function() {

    // ── Report Height ──────────────────────────────────────────────────────────
    setTimeout(reportHeight, 100);
    setTimeout(reportHeight, 500);
    setTimeout(reportHeight, 1500);
    window.addEventListener('resize', reportHeight);
    try {
      new MutationObserver(function() { setTimeout(reportHeight, 50); })
        .observe(document.body, { childList: true, subtree: true, attributes: true });
    } catch(e) {}

    // ── Wire Header Nav Links ──────────────────────────────────────────────────
    document.querySelectorAll('a[data-path]').forEach(function(link) {
      var dp = link.getAttribute('data-path');
      if (NAV_MAP[dp]) {
        link.href = NAV_MAP[dp];
        link.addEventListener('click', function(e) {
          e.preventDefault();
          window.location.href = NAV_MAP[dp];
        });
      }
    });

    // ── Wire the Brand Logo / "Readiness" text to hub ──────────────────────────
    document.querySelectorAll('header img[alt*="logo"], header img[alt*="Brand"], header img[alt*="Readiness"]').forEach(function(logo) {
      logo.style.cursor = 'pointer';
      logo.addEventListener('click', function() { window.location.href = '/'; });
    });

    // ══════════════════════════════════════════════════════════════════════════
    //  PAGE-SPECIFIC CTA WIRING
    // ══════════════════════════════════════════════════════════════════════════

    // ── Welcome & Sign In (Desktop) ────────────────────────────────────────────
    if (pagePath.includes('welcome_sign_in_readiness') && !pagePath.includes('mobile')) {
      window.__handleAuth = function(role) {
        var feedback = document.createElement('div');
        feedback.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-5 py-3 rounded-lg text-body-sm shadow-lg transition-opacity z-50 flex items-center gap-2.5';
        feedback.innerHTML = '<span class="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>' +
          (role === 'student' ? 'Authenticating… Redirecting to your dashboard' : 'Opening Placement Cell Dashboard…');
        document.body.appendChild(feedback);
        setTimeout(function() {
          feedback.style.opacity = '0';
          setTimeout(function() {
            window.location.href = role === 'student'
              ? '/step_2_of_3_target_role_selection/code.html'
              : '/cohort_readiness_tpc_coordinator_view/code.html';
          }, 300);
        }, 1200);
      };
    }

    // ── Welcome (Mobile) ───────────────────────────────────────────────────────
    if (pagePath.includes('welcome_sign_in_readiness_mobile')) {
      window.__handleAuth = function(role) {
        var feedback = document.createElement('div');
        feedback.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-lg text-body-sm shadow-lg z-50 flex items-center gap-2';
        feedback.innerHTML = '<span class="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> Redirecting…';
        document.body.appendChild(feedback);
        setTimeout(function() {
          window.location.href = role === 'student'
            ? '/student_home_mobile_view/code.html'
            : '/cohort_readiness_mobile_view/code.html';
        }, 1000);
      };
      // Also wire any buttons that call __handleAuth
      document.querySelectorAll('button').forEach(function(btn) {
        var text = btn.textContent.toLowerCase();
        if (text.includes('college email') || text.includes('continue') || text.includes('sign in')) {
          btn.addEventListener('click', function() {
            if (!window.__handleAuth) return;
            window.__handleAuth('student');
          });
        }
        if (text.includes('coordinator') || text.includes('placement')) {
          btn.addEventListener('click', function() {
            if (!window.__handleAuth) return;
            window.__handleAuth('coordinator');
          });
        }
      });
    }

    // ── Step 2: Target Role Selection ──────────────────────────────────────────
    if (pagePath.includes('step_2_of_3_target_role_selection')) {
      // Override proceedToAnalysis
      window.proceedToAnalysis = function() {
        var btn = event ? event.currentTarget : null;
        if (btn) {
          btn.innerHTML = '<span class="material-symbols-outlined text-[18px] animate-spin">progress_activity</span><span>Calibrating…</span>';
        }
        setTimeout(function() {
          if (btn) btn.innerHTML = '<span class="material-symbols-outlined text-[18px]">check_circle</span><span>Calibrated! Redirecting…</span>';
          setTimeout(function() {
            window.location.href = '/analyzing_resume_reading_in_progress/code.html';
          }, 600);
        }, 800);
      };
    }

    // ── Analyzing Resume (auto-progress then redirect) ─────────────────────────
    if (pagePath.includes('analyzing_resume_reading_in_progress')) {
      setTimeout(function() {
        // Show completion state
        var h1 = document.querySelector('h1');
        if (h1) h1.textContent = 'Analysis Complete ✓';

        var toast = document.createElement('div');
        toast.className = 'fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#E8F0EA] text-[#2D5A3A] px-6 py-3 rounded-xl shadow-lg z-50 flex items-center gap-3 font-semibold';
        toast.innerHTML = '<span class="material-symbols-outlined text-[20px]">check_circle</span> Diagnostic complete — opening your dashboard…';
        document.body.appendChild(toast);

        setTimeout(function() {
          window.location.href = '/student_home_readiness/code.html';
        }, 1800);
      }, 6000);
    }

    // ── Student Home Dashboard (Desktop) ───────────────────────────────────────
    if (pagePath.includes('student_home_readiness') && !pagePath.includes('mobile')) {
      document.querySelectorAll('button, a').forEach(function(el) {
        var text = el.textContent.toLowerCase();
        if (text.includes('continue') && text.includes('roadmap')) {
          el.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/diagnostic_gap_analysis_aarav_sundaram/code.html';
          });
        }
        if (text.includes('view full diagnostic') || text.includes('view diagnostic') || text.includes('gap analysis')) {
          el.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/diagnostic_gap_analysis_aarav_sundaram/code.html';
          });
        }
        if (text.includes('skill map') || text.includes('view skills')) {
          el.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/skill_map_junior_frontend_developer/code.html';
          });
        }
        if (text.includes('action plan') || text.includes('6-week') || text.includes('view roadmap') || text.includes('view plan')) {
          el.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/action_roadmap_6_week_placement_plan/code.html';
          });
        }
      });
    }

    // ── Student Home Mobile ────────────────────────────────────────────────────
    if (pagePath.includes('student_home_mobile')) {
      document.querySelectorAll('button, a').forEach(function(el) {
        var text = el.textContent.toLowerCase();
        if (text.includes('continue') || text.includes('diagnostic') || text.includes('gap')) {
          el.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/skill_diagnosis_mobile_view/code.html';
          });
        }
        if (text.includes('roadmap') || text.includes('plan') || text.includes('action')) {
          el.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/action_roadmap_mobile_view/code.html';
          });
        }
      });
    }

    // ── Diagnostic Gap Analysis ────────────────────────────────────────────────
    if (pagePath.includes('diagnostic_gap_analysis')) {
      document.querySelectorAll('button, a').forEach(function(el) {
        var text = el.textContent.toLowerCase();
        if (text.includes('skill map') || text.includes('view map') || text.includes('explore skills')) {
          el.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/skill_map_junior_frontend_developer/code.html';
          });
        }
        if (text.includes('roadmap') || text.includes('action plan') || text.includes('build roadmap') || text.includes('generate roadmap')) {
          el.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/prioritized_roadmap_junior_frontend_developer/code.html';
          });
        }
        if (text.includes('react') || text.includes('state management') || text.includes('deep dive')) {
          el.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/gap_detail_react_state_management/code.html';
          });
        }
      });
    }

    // ── Skill Map ──────────────────────────────────────────────────────────────
    if (pagePath.includes('skill_map_junior_frontend_developer')) {
      document.querySelectorAll('button, a').forEach(function(el) {
        var text = el.textContent.toLowerCase();
        if (text.includes('gap') || text.includes('detail') || text.includes('deep dive') || text.includes('drill')) {
          el.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/gap_detail_react_state_management/code.html';
          });
        }
        if (text.includes('roadmap') || text.includes('action') || text.includes('build plan')) {
          el.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/prioritized_roadmap_junior_frontend_developer/code.html';
          });
        }
      });
    }

    // ── Gap Detail (React State Management) ────────────────────────────────────
    if (pagePath.includes('gap_detail_react_state_management')) {
      document.querySelectorAll('button, a').forEach(function(el) {
        var text = el.textContent.toLowerCase();
        if (text.includes('roadmap') || text.includes('plan') || text.includes('next step') || text.includes('proceed')) {
          el.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/prioritized_roadmap_junior_frontend_developer/code.html';
          });
        }
        if (text.includes('back') && (text.includes('skill') || text.includes('map') || text.includes('diagnosis'))) {
          el.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/skill_map_junior_frontend_developer/code.html';
          });
        }
      });
    }

    // ── Prioritized Roadmap ────────────────────────────────────────────────────
    if (pagePath.includes('prioritized_roadmap_junior_frontend_developer')) {
      document.querySelectorAll('button, a').forEach(function(el) {
        var text = el.textContent.toLowerCase();
        if (text.includes('6-week') || text.includes('action plan') || text.includes('start plan') || text.includes('generate plan') || text.includes('create plan')) {
          el.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/action_roadmap_6_week_placement_plan/code.html';
          });
        }
      });
    }

    // ── 6-Week Action Roadmap ──────────────────────────────────────────────────
    if (pagePath.includes('action_roadmap_6_week_placement_plan')) {
      document.querySelectorAll('button, a').forEach(function(el) {
        var text = el.textContent.toLowerCase();
        if (text.includes('mentor') || text.includes('advisory') || text.includes('guidance') || text.includes('book session') || text.includes('schedule')) {
          el.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/advisory_mentor_guidance_readiness/code.html';
          });
        }
      });
    }

    // ── Advisory & Mentor ──────────────────────────────────────────────────────
    if (pagePath.includes('advisory_mentor_guidance')) {
      document.querySelectorAll('button, a').forEach(function(el) {
        var text = el.textContent.toLowerCase();
        if (text.includes('dashboard') || text.includes('home') || text.includes('back to home')) {
          el.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/student_home_readiness/code.html';
          });
        }
      });
    }

    // ── Skill Diagnosis Mobile ─────────────────────────────────────────────────
    if (pagePath.includes('skill_diagnosis_mobile')) {
      document.querySelectorAll('button, a').forEach(function(el) {
        var text = el.textContent.toLowerCase();
        if (text.includes('roadmap') || text.includes('plan') || text.includes('action') || text.includes('next')) {
          el.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/action_roadmap_mobile_view/code.html';
          });
        }
      });
    }

    // ── Action Roadmap Mobile ──────────────────────────────────────────────────
    if (pagePath.includes('action_roadmap_mobile') && !pagePath.includes('6_week')) {
      document.querySelectorAll('button, a').forEach(function(el) {
        var text = el.textContent.toLowerCase();
        if (text.includes('cohort') || text.includes('coordinator') || text.includes('placement cell')) {
          el.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/cohort_readiness_mobile_view/code.html';
          });
        }
      });
    }
    // ── Placement Coordinator Dashboard ──────────────────────────────────────
    if (pagePath.includes('placement_coordinator_dashboard')) {
      document.querySelectorAll('a, button').forEach(function(el) {
        var text = el.textContent.toLowerCase();
        var href = el.getAttribute('href') || '';
        // Wire "View" links in table to student coaching
        if (href.includes('student_coaching') || href.includes('diagnostic_gap') || href.includes('candidate')) {
          // Already has href, just ensure it works
        }
        if (text.includes('schedule cohort workshop') || text.includes('workshop')) {
          el.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/system_states_edge_cases/code.html';
          });
        }
        if (text.includes('export gap report') || text.includes('export')) {
          el.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/cohort_readiness_tpc_coordinator_view/code.html';
          });
        }
      });
    }

    // ── Student Coaching (Rahul Verma) ──────────────────────────────────────
    if (pagePath.includes('student_coaching_rahul_verma')) {
      document.querySelectorAll('a, button').forEach(function(el) {
        var text = el.textContent.toLowerCase();
        if (text.includes('assign dashboard') || text.includes('practice assignment')) {
          el.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/diagnostic_gap_analysis_aarav_sundaram/code.html';
          });
        }
        if (text.includes('message student')) {
          el.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/advisory_mentor_guidance_readiness/code.html';
          });
        }
      });
      // Wire Students breadcrumb
      document.querySelectorAll('a').forEach(function(el) {
        if (el.textContent.trim() === 'Students') {
          el.href = '/placement_coordinator_dashboard/code.html';
          el.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/placement_coordinator_dashboard/code.html';
          });
        }
      });
    }

    // ── System States & Edge Cases ─────────────────────────────────────────
    if (pagePath.includes('system_states_edge_cases')) {
      document.querySelectorAll('button, a').forEach(function(el) {
        var text = el.textContent.toLowerCase();
        if (text.includes('upload a resume') || text.includes('upload')) {
          el.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/analyzing_resume_reading_in_progress/code.html';
          });
        }
        if (text.includes('retry upload')) {
          el.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/welcome_sign_in_readiness/code.html';
          });
        }
        if (text.includes('update project details') || text.includes('upload updated cv')) {
          el.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/step_2_of_3_target_role_selection/code.html';
          });
        }
      });
    }

  }); // end onReady
})();
</script>
`;

// =============================================================================
// HTTP SERVER
// =============================================================================
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // SSE endpoint
  if (pathname === '/__live_reload') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    res.write('retry: 1000\n\n');
    sseClients.add(res);
    req.on('close', () => sseClients.delete(res));
    return;
  }

  if (pathname === '/' || pathname === '') pathname = '/index.html';

  let filePath = path.join(ROOT_DIR, pathname);

  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err) {
      const potentialHtml = path.join(filePath, 'code.html');
      if (fs.existsSync(potentialHtml)) {
        filePath = potentialHtml;
      } else {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<!DOCTYPE html><html><body style="font-family:sans-serif;padding:40px;background:#fcf9f4;color:#1c1c19;">
          <h2>404 — Not Found</h2><p>Path: <code>${pathname}</code></p>
          <p><a href="/" style="color:#032448;font-weight:600;">← Return to Platform Hub</a></p></body></html>`);
        return;
      }
    } else if (stats.isDirectory()) {
      const codeHtml = path.join(filePath, 'code.html');
      const indexHtml = path.join(filePath, 'index.html');
      if (fs.existsSync(codeHtml)) filePath = codeHtml;
      else if (fs.existsSync(indexHtml)) filePath = indexHtml;
      else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Directory missing index');
        return;
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Error: ' + readErr.message);
        return;
      }

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

      if (contentType.startsWith('text/html')) {
        let html = data.toString('utf-8');
        if (html.includes('</body>')) {
          html = html.replace('</body>', INJECTED_SCRIPT + '\n</body>');
        } else {
          html += INJECTED_SCRIPT;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(html);
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      }
    });
  });
});

function startServer(port) {
  server.listen(port, () => {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  🚀  Readiness Platform — Live Server Running');
    console.log('───────────────────────────────────────────────────────────');
    console.log('  🌐  Hub:         http://localhost:' + port);
    console.log('  ⚡  Live Reload: Active (SSE)');
    console.log('  🧭  Flow Nav:    Connected across 16 screens');
    console.log('  📐  Auto-Fit:    Responsive iframe + height reporting');
    console.log('  ⌨️   Keyboard:   ← → arrow keys to navigate flow');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log('[LiveServer] Port ' + port + ' busy, trying ' + (port + 1));
      startServer(port + 1);
    } else {
      console.error('[LiveServer] Error:', err);
    }
  });
}

startServer(DEFAULT_PORT);
