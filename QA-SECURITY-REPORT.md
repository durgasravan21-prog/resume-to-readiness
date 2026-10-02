# Readiness — Senior QA & Application Security Audit Report

**Application**: Readiness (AI-Powered Placement Skill-Gap Diagnostic Platform)  
**Evaluator**: Senior QA Lead & Principal Application Security Engineer  
**Date**: October 02, 2026  
**Environment**: Local Staging & Test Suite  
**Repository Branch**: `main`  
**Test Suite Status**: **43 / 43 Passed (100% Pass Rate)**  
**Build Status**: **Production Build Succeeded (`next build` 0 errors)**

---

## 1. Executive Summary

A comprehensive architectural, functional QA, and application security evaluation was conducted on **Readiness**. The application ingests student engineering resumes (personally identifiable information), extracts textual competence layers, and performs automated diagnostic comparisons against placement rubrics using large language models (Anthropic Claude 3.5 Sonnet) while enforcing institutional role boundaries (Students vs. Placement Coordinators vs. Admins).

All identified vulnerabilities across file upload validation, prompt injection, CSV injection, path traversal, domain restriction, and secret exposure were remediated and verified with automated regression tests.

---

## 2. Findings Summary & Remediation Ledger

| Finding ID | Severity | Category | Location | Vulnerability Description | Remediation Applied | Regression Test | Status |
|---|---|---|---|---|---|---|---|
| **SEC-01** | **High** | Information Disclosure | `/.gitignore` | Repository lacked a `.gitignore` file, exposing `.env` secrets and credentials to git commits. | Created comprehensive `.gitignore` filtering `.env*`, `.next/`, `node_modules/`, and build artifacts. | File existence check & secret scan | **FIXED** |
| **SEC-02** | **High** | Insecure Upload / Magic Bytes | `src/server/parsing/magic-bytes.ts` | File upload accepted extensions without verifying binary headers, risking executable upload (`.exe` as `.pdf`). | Added `validateFileMagicBytes` inspecting `%PDF-` and `PK\x03\x04` zip headers, blocking `MZ` and `ELF` binaries. | `file-upload-security.test.ts` (6 tests) | **FIXED** |
| **SEC-03** | **Medium** | Open Redirect | `src/server/auth/config.ts` | Post-login redirect targets were unvalidated, enabling attackers to redirect students to external phishing domains. | Implemented `sanitizeRedirectUrl` blocking protocol-relative (`//evil.com`), external schemes, and script URIs. | `auth.test.ts` (4 tests) | **FIXED** |
| **SEC-04** | **Medium** | CSV / Formula Injection | `src/server/services/tpc-service.ts` | Coordinator CSV export did not neutralize cells starting with formula triggers (`=`, `+`, `-`, `@`), enabling DDE execution. | Implemented `sanitizeCell` prefixing all formula trigger characters with a single quote. | `injection.test.ts` (4 tests) | **FIXED** |
| **SEC-05** | **Medium** | AI Hallucination & Prompt Injection | `src/server/ai/pipeline/verify-evidence.ts` | Prompt injection in resumes could claim unearned skill strength without verification. | Implemented strict verbatim substring matching; unverified quotes are automatically downgraded and dropped. | `verify-evidence.test.ts`, `ai-prompt-injection.test.ts` | **FIXED** |
| **SEC-06** | **Low** | Information Exposure / Fingerprinting | `next.config.js` | Server returned `X-Powered-By: Next.js` header, assisting attacker reconnaissance. | Added `poweredByHeader: false` in `nextConfig`. | Server header inspection | **FIXED** |
| **SEC-07** | **Low** | Missing Security Headers | `next.config.js` | Application lacked standard browser defenses (HSTS, CSP, X-Frame-Options). | Injected `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`. | HTTP Header verification | **FIXED** |

---

## 3. Automated Test Coverage Summary

All test suites were executed using `vitest run`:

```
 RUN  v3.2.7

 ✓ src/tests/auth.test.ts (10 tests)
 ✓ src/tests/injection.test.ts (6 tests)
 ✓ src/tests/verify-evidence.test.ts (3 tests)
 ✓ src/tests/file-upload-security.test.ts (6 tests)
 ✓ src/tests/permissions.test.ts (8 tests)
 ✓ src/tests/confidence.test.ts (2 tests)
 ✓ src/tests/ai-prompt-injection.test.ts (6 tests)
 ✓ src/tests/roadmap-service.test.ts (2 tests)

 Test Files  8 passed (8)
      Tests  43 passed (43)
```

### Coverage by Security Domain
- **Authentication & Domain Whitelisting**: 10 tests covering institutional email restrictions, case insensitivity, plus-addressing, lookalike domains, and open redirect neutralization.
- **Authorization & IDOR Isolation**: 8 tests verifying that students cannot access peer analyses, coordinators cannot inspect other colleges, and students cannot access coordinator endpoints.
- **File Upload Security**: 6 tests verifying magic byte inspection against renamed `.exe`, `.elf`, polyglots, zero-byte payloads, and HTML spoofing.
- **Prompt Injection & AI Output Validation**: 9 tests verifying prompt delimiter framing, verbatim evidence verification, and Zod output schema enforcement.
- **Injection Defenses**: 6 tests checking CSV formula neutralization and filesystem path traversal sanitization.
- **Business Logic & Metrics**: 4 tests checking confidence scoring and roadmap progress calculations.

---

## 4. Phase-by-Phase Review Findings

### Phase 0: Reconnaissance & Trust Boundaries
- **Assets Protected**:
  1. Extracted raw student resume text (`readiness.resumes`)
  2. Diagnostic evaluation ledger and verbatim quotes (`readiness.analysis_items`)
  3. Placement coordinator private coaching notes (`readiness.coach_notes`)
  4. Server-side credentials (`ANTHROPIC_API_KEY`, `DATABASE_URL`)
- **Trust Boundaries**:
  - Client Browser ↔ Next.js Server Components / Route Handlers (gated by session role cookies & permissions check)
  - Next.js Server ↔ Anthropic Claude API (protected by `import "server-only"` and strict Zod validation)
  - Next.js Server ↔ PostgreSQL Database (isolated within `readiness` schema)

### Phase 1: Automated Checks
- `tsc --noEmit`: 0 errors.
- `npm run build`: Production build succeeded (`13/13` pages compiled statically and dynamically).
- Secret Scan: Confirmed `.env*` files are gitignored and `.env.example` contains only dummy placeholders. No secrets bundled into client code.

### Phase 2: Authentication & Sessions
- Confirmed `isAllowedDomain` permits only institutional accounts (e.g. `@nie.ac.in`).
- Confirmed post-login redirect targets are sanitized via `sanitizeRedirectUrl` to prevent open redirects.

### Phase 3: Authorization (IDOR & Multi-Tenancy)
- Server-side permissions matrix `can(user, action, resource, target)` strictly checked before every query or database write.
- Students are restricted to `user_id === user.id`.
- Coordinators are restricted to `student.college_id === user.college_id`.

### Phase 4: Injection & Input Handling
- All SQL access is routed through parameterized ORM queries (Drizzle / Supabase).
- React escaping prevents XSS across candidate names, role titles, and evidence quotes.
- CSV export formula characters (`=`, `+`, `-`, `@`) neutralized.

### Phase 5: File Upload Security
- 5MB maximum file size enforced on server.
- Binary magic byte validation (`%PDF-` for PDF, `PK\x03\x04` for DOCX).
- Unreadable scanned-only PDFs detected and flagged with editorial retry banner.

### Phase 6: AI & Prompt Injection
- Untrusted resume and JD text are isolated within triple quotes `"""` with explicit system prompt instructions treating them as data.
- Strict verbatim substring matching strips fabricated quotes and downgrades status.

---

## 5. Pre-Launch Verification Checklist

- [x] All 19 screens compile and maintain 100% editorial design token fidelity.
- [x] Floating debug navigation bar `#readiness-flow-nav` completely removed.
- [x] Live development server accessible on `http://localhost:3000`.
- [x] Security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options) active.
- [x] Database schema migrated and seeded with target roles and candidate rosters.
- [x] Unit test suite runnable via `npm test` (43/43 passing).
- [x] TypeScript strict compilation passes (`npm run typecheck`).
- [x] Production build passes (`npm run build`).

---

## 6. Recommended Ongoing Practices

1. **API Key Spend & Rate Caps**: Ensure Anthropic API key usage limits and monthly alerts are configured in the Anthropic Console.
2. **Audit Log Retention**: Establish a 90-day retention and archiving policy for `readiness.audit_log` records.
3. **Continuous Dependency Auditing**: Run `npm audit` monthly to monitor upstream package updates.
