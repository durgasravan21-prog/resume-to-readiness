# Overall Status Report (Step 0) — Readiness Platform

**Audit Date**: October 02, 2026  
**Auditor**: Senior Full-Stack Engineer, QA Lead & Product Designer  
**Scope**: Codebase audit against Master Prompt requirements (Single-Service Supabase Backend, Human Mentor Chat, 4-Step Onboarding, Program Flags & 3-Chance System, Coordinator & Admin Portals, Performance & Realtime Sync).

---

## 1. Feature Status Matrix

| Feature ID | Master Prompt Feature Description | Current Status | Primary File Location | Reason & Current Gap |
|---|---|---|---|---|
| **3.1** | **Supabase Auth with Email OTP** (6-digit code, 60s cooldown, server session, domain whitelist from `settings` table) | **Missing** | `app/page.tsx`, `middleware.ts`, `lib/auth.ts` | Currently uses demo single-click login with client cookies (`readiness_role`) and `localStorage`. No Supabase OTP screen, no 60s cooldown timer, no `settings` table lookup. |
| **3.2** | **Mandatory 4-Step Onboarding** (1: Resume upload, 2: Dream role, 3: Dream company with suggestions, 4: Consent checkbox & timestamp) | **Partial** | `app/analyses/new/page.tsx` | Currently a 3-step diagnostic flow (Resume, Role, Review). Missing mandatory dream company suggestions step, missing consent checkbox for TPC sharing, missing onboarding state redirect. |
| **3.3** | **Resume Scanning & Security** (Magic bytes, PDF/DOCX extract, scanned error, resume classifier, Aadhaar/PAN stripping) | **Partial** | `src/server/parsing/` (`magic-bytes.ts`, `detect-scanned.ts`, `extract-pdf.ts`) | Magic bytes and scanned text detection are implemented. Missing automated resume classifier (heuristics + model check) to reject non-resumes (invoices/certificates), and missing Aadhaar/PAN/Govt ID regex stripper. |
| **3.4** | **Skill Gap Analysis (Dream Role + Company)** (Multi-stage DB status, company context adjustment, verbatim quote check, Zod validation) | **Partial** | `src/server/ai/pipeline/run-analysis.ts`, `app/analyses/waiting/[id]/page.tsx` | Pipeline runs 5 stages and verifies verbatim quotes. However, dream company expectations adjustment is missing, and status updates are polled instead of powered by Supabase Realtime. |
| **3.5** | **Action Roadmap & Proof Submissions** (Prioritize, Sequence, Prove, task proof submission [repo/link/file/text], mentor review) | **Partial** | `app/analyses/[id]/roadmap/page.tsx` | Tasks exist with hours and phases, but are stored in local component `useState` and lack the "Submit Proof" control and `task_submissions` database table. |
| **3.6** | **Placement Cell Sharing & Outstanding Resumes** (Consent coverage, auto-push to TPC if score >= 85 + high confidence, audit log) | **Partial** | `app/tpc/page.tsx`, `src/server/services/tpc-service.ts` | Coordinators can view student roster, but automated classification into "Outstanding candidates" (score >= 85) without per-event student notification is not wired. |
| **3.7** | **Real Mentor Chat (Human Only)** (Assigned mentor, Supabase Realtime, offline auto-acknowledgment, mentor portal `/mentor`, task suggestions) | **Broken** | `app/analyses/[id]/mentor/page.tsx` | Current code uses an AI mentor reply simulation (`setTimeout` with AI responses) which directly violates the specification. Missing real human mentor assignment, Realtime chat, notification bell, and `/mentor` portal. |
| **3.8** | **Flags, Deadlines & 3-Chance System** (Hourly cron, 48h/24h reminders, 1-2 flags = at_risk, 3 flags = terminated, max 3 chances with written reason) | **Missing** | N/A (Tables & routes not yet created) | No `flags`, `program_status`, or `chance_grants` tables. No hourly cron job to flag past-due tasks. No coordinator "Give another chance" interface. |
| **Step 4** | **Coordinator & Admin Portals** (Cohort census, outstanding list, flags/at-risk filter, mentor assignment, CSV export, Admin console `/admin`) | **Partial** | `app/tpc/page.tsx`, `app/tpc/students/[id]/page.tsx` | Coordinator overview and student details exist with mock data. Flags column, mentor assign modal, and submission reviews are missing. The entire `/admin` portal (roles, users, settings, audit log) is missing. |
| **Step 1** | **Lag & Realtime Sync** (One DB source of truth, TanStack Query / SWR, Supabase Realtime subscriptions, no localStorage server copies) | **Partial** | Entire application | State relies on local `useState` and `localStorage` (`readiness_auth_session`). No client query caching (TanStack Query/SWR) or Supabase Realtime listeners. |

---

## 2. Hardcoded and Mocked Data Locations

1. **`app/page.tsx`**:
   - Lines 13–31: Hardcoded `DEFAULT_STUDENT` (Ananya Reddy) and `DEFAULT_COORDINATOR` (Prof. Ravi Sharma) login shortcuts saving to `localStorage`.
2. **`app/home/page.tsx`**:
   - Lines 14–25: Reads session from `localStorage` rather than server cookie session.
   - Lines 70–90: Hardcoded sprint card ("Junior Frontend Developer", "3 of 8 checkpoints done", "38% complete").
   - Lines 98–101: Hardcoded next action ("Build a form with validation in React").
   - Lines 130–180: Hardcoded recent analyses table (Razorpay, TCS Digital, Mu Sigma).
3. **`app/analyses/[id]/page.tsx`**:
   - Lines 10–137: Hardcoded `SKILL_ITEMS` array (6 hardcoded skills across Strong, Needs Proof, Missing) rendered instead of querying database `analysis_items`.
   - Lines 169–178: Hardcoded readiness index `72/100` and target role description.
4. **`app/analyses/[id]/gap/[itemId]/page.tsx`**:
   - Lines 10–60: Hardcoded gap details for React State Management.
5. **`app/analyses/[id]/roadmap/page.tsx`**:
   - Lines 20–96: Hardcoded `INITIAL_TASKS` array (7 hardcoded tasks) loaded into client `useState`. Checkbox toggling does not persist to database.
6. **`app/analyses/[id]/mentor/page.tsx`**:
   - Lines 23–31: Hardcoded initial mentor message from "Prof. Ravi Sharma".
   - Lines 69–96: Hardcoded mock AI reply generator simulating mentor responses via `setTimeout`.
7. **`app/tpc/page.tsx`**:
   - Lines 11–89: Hardcoded `ROSTER_STUDENTS` (7 students) rendered instead of dynamic database query.
   - Lines 91–98: Hardcoded `COMMON_GAPS` statistics.
   - Lines 223–260: Hardcoded census numbers (1,248 analysed, 312 ready, 587 need proof).
   - Line 413: "Schedule cohort workshop" triggers an in-memory toast notification with no backend action.
8. **`app/tpc/students/[id]/page.tsx`**:
   - Lines 17–30: Hardcoded `INITIAL_NOTES` for Rahul Verma.
   - Lines 41–53: `handleSaveNote` prepends note to local `useState` only; discarded on refresh.

---

## 3. State Desynchronization Risks

1. **Client `localStorage` vs. Database Session**:
   - `lib/auth.ts` stores user identity in `localStorage.setItem('readiness_auth_session', ...)`. If a user's role, college, or program status (e.g. terminated) changes in PostgreSQL, client state continues using stale local cache without re-validation.
2. **Roadmap Task Checkbox State**:
   - `app/analyses/[id]/roadmap/page.tsx` keeps task completion in local `useState`. When a student checks a task, leaves the page, or refreshes, all changes are lost. Coordinators cannot see actual completed tasks.
3. **Coaching Notes Persistence**:
   - In `app/tpc/students/[id]/page.tsx`, coordinator notes are saved only to React state, leading to immediate data loss on navigation.
4. **Polling vs. Realtime on Waiting Screen**:
   - `app/analyses/waiting/[id]/page.tsx` currently simulates a timer instead of listening to real database status transitions via Supabase Realtime, risking premature redirects before analysis rows are written.

---

## 4. Measured Route Load Times

Measured via HTTP local benchmark on `http://localhost:3000`:

| Route | Function / Screen | Response Time (TTFB) | Status |
|---|---|---|---|
| `/` | Welcome & Sign-In | 971 ms | 200 OK |
| `/home` | Student Dashboard | 253 ms | 200 OK |
| `/analyses/new` | Diagnostic Intake | 335 ms | 200 OK |
| `/analyses/[id]` | Skill Map & Evidence Drawer | 123 ms | 200 OK |
| `/analyses/[id]/gap/[itemId]` | Gap Remediation Deep-Dive | 145 ms | 200 OK |
| `/analyses/[id]/roadmap` | 3-Phase Action Roadmap | 154 ms | 200 OK |
| `/analyses/[id]/mentor` | Advisor Consultation | 169 ms | 200 OK |
| `/tpc` | Coordinator Cohort Roster | 113 ms | 200 OK |
| `/tpc/students/usr_rahul` | Student Coaching Audit | 183 ms | 200 OK |
| `/tpc/roles` | Benchmark Roles Management | 216 ms | 200 OK |

*Note: Initial cold page compilation on `/` reflects initial dev server module tree resolution (971ms), while hydrated warm routes respond within 110–250ms.*

---

## 5. Dead Buttons and Incomplete Links

1. **TopNav.tsx**:
   - Search input in header has no submit handler or query trigger.
   - Notification bell icon has no dropdown menu or unread notifications count.
2. **`app/home/page.tsx`**:
   - "Sprint Checkpoint 04" card "Continue" button navigates to generic `/analyses/default/roadmap` without linking to the student's active analysis ID.
3. **`app/analyses/[id]/page.tsx`**:
   - Header "Export PDF" action button is missing from the view.
4. **`app/analyses/[id]/gap/[itemId]/page.tsx`**:
   - "Add to Roadmap" button modifies local UI state only and does not create an item in `readiness.roadmap_items`.
5. **`app/analyses/[id]/roadmap/page.tsx`**:
   - No "Submit Proof" button on tasks (students cannot attach GitHub repos, deployment links, or written verification).
6. **`app/tpc/page.tsx`**:
   - "Schedule cohort workshop" button (line 412) triggers a dummy toast with no database event or notification.
   - Filter dropdowns ("Batch 2025", "Class of 2026") are cosmetic and do not filter database rows.
7. **`app/tpc/students/[id]/page.tsx`**:
   - "Give another chance" button does not exist.
   - "Void flag" action does not exist.
   - "Message student" button links to `/analyses/default/mentor` instead of opening the student's thread in the mentor console.

---

## 6. Prioritized Implementation & Fix Plan

### **Priority 1: Supabase Unified Infrastructure (STEP 1 & STEP 2)**
1. **Supabase Auth with Email OTP**: Implement `@supabase/ssr` email OTP flow on `/` (email entry, 6-digit code, 60s resend cooldown, server session cookies). Read roles from server-side `profiles` table.
2. **Supabase Database & Storage Migration**: Replace Neon/Auth.js/Vercel Blob with Supabase Postgres + private `resumes` bucket (`{user_id}/{uuid}.pdf` with signed URLs) + Row Level Security (RLS) on all tables.
3. **TanStack Query & Supabase Realtime**: Add TanStack Query for client caching, optimistic updates, and instant invalidation. Enable Supabase Realtime on `mentor_messages`, `notifications`, and `analyses` status.

### **Priority 2: 4-Step Onboarding & Input Sanitization (STEP 3.1 - 3.4)**
1. **Mandatory 4-Step Onboarding Wizard**:
   - Step 1: Resume Upload (PDF/DOCX 5MB).
   - Step 2: Dream Role (search role library or custom JD).
   - Step 3: Dream Company (with company suggestion dropdown).
   - Step 4: Consent Checkbox (explicit TPC data sharing agreement with version and timestamp).
2. **Resume Classification & PII Sanitizer**: Heuristic + lightweight model classifier to reject non-resumes (invoices/certificates) and strip Aadhaar/PAN/Passport numbers before prompt framing.
3. **Real AI Skill Gap Analysis**: Company-adjusted requirements, verbatim quote verification with downgrading, and live Realtime status transitions on `/analyses/waiting/[id]`.

### **Priority 3: Action Roadmap & Proof Submissions (STEP 3.5 - 3.6)**
1. **Task Proof Submissions**: Add `task_submissions` table and proof submission UI (repo link, live URL, file, or written proof) to `/analyses/[id]/roadmap`.
2. **Outstanding Resumes Auto-Share**: Automatically push students with readiness >= 85 and high confidence to Coordinator's Outstanding Candidates list without individual notification (covered by onboarding consent).

### **Priority 4: Real Human Mentor Chat & Portal (STEP 3.7)**
1. **Remove AI Mentor Code Path**: Replace simulated AI replies with real human-to-human mentor chat.
2. **Mentor Thread & Auto-Acknowledgment**: If mentor is offline/unresponsive, post one automated system message: *"Your message has been sent to your mentor. They will connect with you soon."*
3. **Realtime Notifications & Portal**: Implement `/mentor` portal for mentors with assigned students, chat, skill map side panel, and "Suggest a task" form.

### **Priority 5: Program Flags, Deadlines & 3-Chance System (STEP 3.8)**
1. **Hourly Cron Job**: Implement `/api/cron/check-deadlines` (secured with `CRON_SECRET`) issuing one flag per overdue task without submission.
2. **Termination & 3 Chances**: 1-2 flags = `at_risk`; 3 flags = `terminated`. On Coordinator student detail, implement "Give another chance" (max 3 chances, requires written reason, resets flags to 0, logged in `audit_log`).
3. **Coordinator Flags Column & Filters**: Display flag counts, at-risk filters, and flag history journal.

### **Priority 6: Admin Portal & Pre-Launch Hardening (STEP 4 - STEP 6)**
1. **Admin Console (`/admin`)**: Build role management, companies list, settings (allowed domains, threshold, flag limits), and audit log viewer.
2. **Automated Test Suite**: End-to-end Playwright tests, RLS policy unit tests, prompt-injection tests, and deployment verification.

---

*Awaiting your explicit "go" to proceed with Step 1: Fix Lag and Sync (Performance & Data Integrity).*
