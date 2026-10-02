'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import TopNav from '@/components/layout/TopNav';
import MobileTabBar from '@/components/layout/MobileTabBar';
import LowConfidenceBanner from '@/components/ui/LowConfidenceBanner';

interface SkillItem {
  id: string;
  name: string;
  status: 'strong' | 'proof' | 'missing';
  statusLabel: string;
  jdText: string;
  resumeText: string;
  sourceRef: string;
  advisorNote: string;
}

const SKILL_ITEMS: SkillItem[] = [
  // Strong
  {
    id: 'skill_html',
    name: 'Semantic HTML & Accessibility',
    status: 'strong',
    statusLabel: 'Strong evidence',
    sourceRef: 'Resume p.1 line 14',
    jdText: 'Must understand accessible semantic markup, ARIA roles, and keyboard navigation standards.',
    resumeText: '“Built accessible component library complying with WCAG 2.1 AA standards including screen reader landmarks.”',
    advisorNote: 'Direct alignment with campus placement technical requirements. Clear implementation proof.',
  },
  {
    id: 'skill_css',
    name: 'CSS Layouts & Flexbox/Grid',
    status: 'strong',
    statusLabel: 'Strong evidence',
    sourceRef: 'Resume p.1 line 22',
    jdText: 'Proficiency in complex responsive layouts, CSS Grid, Flexbox, and Tailwind CSS utility architectures.',
    resumeText: '“Architected pixel-perfect dashboard layouts with CSS Grid and Tailwind, reducing CSS payload by 40%.”',
    advisorNote: 'Verified in multiple projects. Strong understanding of modern layout primitives.',
  },
  {
    id: 'skill_js',
    name: 'JavaScript ES6+ & Async',
    status: 'strong',
    statusLabel: 'Strong evidence',
    sourceRef: 'Resume p.1 line 31',
    jdText: 'Deep understanding of modern JS, Promises, async/await, closures, and DOM manipulation.',
    resumeText: '“Implemented asynchronous data pagination and debounced search filters handling 10k items smoothly.”',
    advisorNote: 'Clear proof of async event handling and performance considerations.',
  },
  {
    id: 'skill_comp',
    name: 'Component Architecture',
    status: 'strong',
    statusLabel: 'Strong evidence',
    sourceRef: 'Resume p.2 line 8',
    jdText: 'Modular React component design, custom hooks, and separation of UI from business logic.',
    resumeText: '“Authored 15+ reusable React components with encapsulated hooks and controlled input patterns.”',
    advisorNote: 'Meets junior frontend engineering design standards cleanly.',
  },
  {
    id: 'skill_rest',
    name: 'REST API Integration',
    status: 'strong',
    statusLabel: 'Strong evidence',
    sourceRef: 'Resume p.2 line 19',
    jdText: 'Consuming REST APIs, handling error boundaries, loading skeletons, and HTTP status handling.',
    resumeText: '“Integrated Axios with interceptors for JWT token refresh, network error retries, and modal notifications.”',
    advisorNote: 'Demonstrates real-world network lifecycle awareness.',
  },
  {
    id: 'skill_git',
    name: 'Git & PR Collaboration',
    status: 'strong',
    statusLabel: 'Strong evidence',
    sourceRef: 'Resume p.2 line 27',
    jdText: 'Experience working with Git branches, PR code reviews, and conventional commit messages.',
    resumeText: '“Contributed to team monorepo via feature branches, resolving merge conflicts and maintaining 95% pass rate on CI.”',
    advisorNote: 'Verifiable collaborative engineering practices.',
  },

  // Needs Proof
  {
    id: 'react-state-management',
    name: 'React state management',
    status: 'proof',
    statusLabel: 'Needs stronger proof',
    sourceRef: 'Resume p.1 line 19',
    jdText: 'Proficiency in global state synchronization (Redux Toolkit, Zustand, or Context API) across complex multi-step flows.',
    resumeText: '“Utilized React useState and useContext for local widget states in coursework e-commerce store.”',
    advisorNote: 'Campus interviewers test normalized cache and reducer patterns. Simple useState does not prove mastery for production apps.',
  },
  {
    id: 'automated-unit-testing',
    name: 'Automated Unit Testing (Jest/RTL)',
    status: 'proof',
    statusLabel: 'Needs stronger proof',
    sourceRef: 'Resume p.2 line 11',
    jdText: 'Writing unit and integration tests using Jest and React Testing Library; achieving test coverage targets.',
    resumeText: '“Wrote basic Jest snapshot tests for header navigation component.”',
    advisorNote: 'Lacks behavioral user event assertions and mocking tests (e.g. fireEvent, waitFor, mock handlers).',
  },
  {
    id: 'performance-opt',
    name: 'Client-side Performance Optimization',
    status: 'proof',
    statusLabel: 'Needs stronger proof',
    sourceRef: 'Resume p.2 line 14',
    jdText: 'Diagnosing render bottlenecks, React memoization (useMemo/useCallback), code-splitting, and Lighthouse audits.',
    resumeText: '“Mentioned Lighthouse 90+ score in personal portfolio.”',
    advisorNote: 'No metrics showing optimization of dynamic data feeds or bundle size reduction techniques.',
  },

  // Missing
  {
    id: 'typescript-production',
    name: 'TypeScript in Production',
    status: 'missing',
    statusLabel: 'Missing',
    sourceRef: 'Diagnostic ledger scan',
    jdText: 'Strict type safety, generics, discriminated unions, and typing third-party API payloads.',
    resumeText: 'No TypeScript code or typing mentions discovered in parsed resume text.',
    advisorNote: 'High frequency in round 1 technical screen. Adding TypeScript to one existing React project will clear this gap.',
  },
  {
    id: 'cicd-workflows',
    name: 'CI/CD & Deployment Workflows',
    status: 'missing',
    statusLabel: 'Missing',
    sourceRef: 'Diagnostic ledger scan',
    jdText: 'GitHub Actions pipelines, automated test runs before merge, and production hosting on Vercel/AWS.',
    resumeText: 'No automated workflow files, GitHub Action scripts, or pipeline configs referenced.',
    advisorNote: 'Recruiters favor candidates with live verified deployment URLs and automated lint/test badges.',
  },
];

export default function SkillMapPage() {
  const router = useRouter();
  const params = useParams();
  const analysisId = params?.id || 'default';

  const [activeDrawerSkill, setActiveDrawerSkill] = useState<SkillItem | null>(null);

  const strongSkills = SKILL_ITEMS.filter((s) => s.status === 'strong');
  const proofSkills = SKILL_ITEMS.filter((s) => s.status === 'proof');
  const missingSkills = SKILL_ITEMS.filter((s) => s.status === 'missing');

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex flex-col pb-12">
      <TopNav />

      <main className="flex-1 w-full pt-16 bg-surface">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          
          {/* Header Summary Box */}
          <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-6 sm:p-8 mb-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-3 mb-3">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-secondary font-semibold">
                  Competency Appraisal Ledger
                </span>
                <h1 className="font-headline text-2xl sm:text-3xl text-primary font-semibold tracking-tight mt-1">
                  Junior Frontend Developer
                </h1>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs text-on-surface-variant">
                <span>Target: Razorpay Standard</span>
                <span>•</span>
                <span className="font-semibold text-primary">Readiness Index: 72/100</span>
              </div>
            </div>

            <p className="font-body text-sm sm:text-base text-on-surface leading-relaxed max-w-4xl border-t border-surface-container pt-3">
              Your resume demonstrates solid foundational web competence (HTML, CSS layout, JavaScript async, and REST consumption), but lacks verifiable production proof for complex state synchronization and automated behavioral testing.
            </p>

            {/* Low-confidence Disclaimer */}
            <div className="mt-5">
              <LowConfidenceBanner
                message="Evaluation Notice: 2 competency vectors require deeper implementation proof to reach High Match status before campus drives."
                actionText="View target gap →"
                actionHref={`/analyses/${analysisId}/gap/react-state-management`}
              />
            </div>
          </div>

          {/* 3-Column Honest Report */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            
            {/* Column 1: Strong Evidence */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4F7A5A]"></span>
                  <h2 className="font-headline text-sm font-semibold text-primary">
                    Strong Evidence ({strongSkills.length})
                  </h2>
                </div>
                <span className="font-mono text-[11px] text-on-surface-variant">Verified</span>
              </div>

              <div className="space-y-3">
                {strongSkills.map((skill) => (
                  <div
                    key={skill.id}
                    onClick={() => setActiveDrawerSkill(skill)}
                    className="p-4 rounded-xl bg-surface-container-lowest border border-surface-variant hover:border-primary/50 transition-all cursor-pointer shadow-xs group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-title text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
                        {skill.name}
                      </h3>
                      <span className="material-symbols-outlined text-[18px] text-[#4F7A5A] shrink-0">
                        check_circle
                      </span>
                    </div>
                    <p className="font-mono text-[11px] text-outline mt-2 truncate">
                      {skill.sourceRef}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Needs Stronger Proof */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                  <h2 className="font-headline text-sm font-semibold text-primary">
                    Needs Stronger Proof ({proofSkills.length})
                  </h2>
                </div>
                <span className="font-mono text-[11px] text-secondary font-semibold">Priority</span>
              </div>

              <div className="space-y-3">
                {proofSkills.map((skill) => (
                  <div
                    key={skill.id}
                    onClick={() => setActiveDrawerSkill(skill)}
                    className="p-4 rounded-xl bg-surface-container-lowest border border-secondary/40 hover:border-secondary transition-all cursor-pointer shadow-xs group bg-gradient-to-r from-secondary-fixed/10 to-transparent"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-title text-sm font-semibold text-on-surface group-hover:text-secondary transition-colors">
                        {skill.name}
                      </h3>
                      <span className="material-symbols-outlined text-[18px] text-secondary shrink-0">
                        help_outline
                      </span>
                    </div>
                    <p className="font-body text-xs text-on-surface-variant mt-2 line-clamp-2 leading-relaxed">
                      {skill.advisorNote}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-secondary font-semibold">
                      <span>Click for evidence audit</span>
                      <span>→</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Missing */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-error"></span>
                  <h2 className="font-headline text-sm font-semibold text-primary">
                    Missing Proofs ({missingSkills.length})
                  </h2>
                </div>
                <span className="font-mono text-[11px] text-error font-semibold">Unverified</span>
              </div>

              <div className="space-y-3">
                {missingSkills.map((skill) => (
                  <div
                    key={skill.id}
                    onClick={() => setActiveDrawerSkill(skill)}
                    className="p-4 rounded-xl bg-surface-container-lowest border border-error-container hover:border-error transition-all cursor-pointer shadow-xs group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-title text-sm font-semibold text-on-surface group-hover:text-error transition-colors">
                        {skill.name}
                      </h3>
                      <span className="material-symbols-outlined text-[18px] text-error shrink-0">
                        cancel
                      </span>
                    </div>
                    <p className="font-body text-xs text-on-surface-variant mt-2 line-clamp-2 leading-relaxed">
                      {skill.advisorNote}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* In-flow Action Bar (No floating sticky bar) */}
            <div className="pt-6 border-t border-surface-variant flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-surface-variant text-on-surface font-semibold text-xs hover:bg-surface-container transition-colors shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Download summary (PDF)</span>
              </button>

              <Link
                href={`/analyses/${analysisId}/roadmap`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-colors shadow-sm"
              >
                <span>See my roadmap</span>
                <span className="material-symbols-outlined text-[16px]">east</span>
              </Link>
            </div>

          </div>
        </div>
      </main>

      {/* Interactive Evidence Drawer */}
      {activeDrawerSkill && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-primary/20 backdrop-blur-xs transition-opacity"
            onClick={() => setActiveDrawerSkill(null)}
          ></div>

          <div className="relative w-full max-w-md bg-surface-container-lowest h-full shadow-2xl flex flex-col justify-between border-l border-surface-variant p-6 sm:p-8 z-10 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase font-semibold ${
                  activeDrawerSkill.status === 'strong'
                    ? 'bg-[#E8F0EA] text-[#4F7A5A]'
                    : activeDrawerSkill.status === 'proof'
                    ? 'bg-[#F7EEDB] text-[#B7832F]'
                    : 'bg-[#FFDAD6] text-error'
                }`}>
                  {activeDrawerSkill.statusLabel}
                </span>

                <button
                  onClick={() => setActiveDrawerSkill(null)}
                  className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <h2 className="font-headline text-xl text-primary font-semibold mb-6">
                {activeDrawerSkill.name}
              </h2>

              {/* Requirement Section */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-mono text-[10px] uppercase text-outline font-semibold tracking-wider mb-1.5">
                    Job Requirement (Benchmark)
                  </h4>
                  <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-variant text-xs text-on-surface leading-relaxed">
                    {activeDrawerSkill.jdText}
                  </div>
                </div>

                {/* Resume Evidence Section */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="font-mono text-[10px] uppercase text-outline font-semibold tracking-wider">
                      Extracted Evidence (From Resume)
                    </h4>
                    <span className="font-mono text-[10px] text-outline">{activeDrawerSkill.sourceRef}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-variant font-mono text-xs text-on-surface leading-relaxed italic">
                    {activeDrawerSkill.resumeText}
                  </div>
                </div>

                {/* Plain Explanation Section */}
                <div>
                  <h4 className="font-mono text-[10px] uppercase text-outline font-semibold tracking-wider mb-1.5">
                    Advisor Observation & Plain Explanation
                  </h4>
                  <div className="p-3.5 rounded-xl bg-surface-container border border-surface-variant/70 text-xs text-on-surface leading-relaxed">
                    {activeDrawerSkill.advisorNote}
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Action Button */}
            <div className="pt-6 mt-6 border-t border-surface-container flex flex-col gap-2">
              <Link
                href={`/analyses/${analysisId}/gap/${activeDrawerSkill.id}`}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-colors shadow-sm"
              >
                <span>Add targeted fix to roadmap</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      <MobileTabBar role="student" />
    </div>
  );
}
