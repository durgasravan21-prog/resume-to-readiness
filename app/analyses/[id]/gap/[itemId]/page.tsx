'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import TopNav from '@/components/layout/TopNav';
import MobileTabBar from '@/components/layout/MobileTabBar';

export default function GapDetailPage() {
  const router = useRouter();
  const params = useParams();
  const analysisId = params?.id || 'default';
  const itemId = params?.itemId || 'react-state-management';

  const [addedToRoadmap, setAddedToRoadmap] = useState(false);

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex flex-col pb-20 md:pb-12">
      <TopNav />

      <main className="flex-1 w-full pt-16 bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-mono text-on-surface-variant mb-6">
            <Link href={`/analyses/${analysisId}`} className="hover:text-primary transition-colors">
              Skill Map
            </Link>
            <span>/</span>
            <span className="text-primary font-semibold">React state management</span>
          </nav>

          {/* Header Card */}
          <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-6 sm:p-8 mb-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <span className="font-mono text-xs uppercase px-2.5 py-0.5 rounded-full bg-[#F7EEDB] text-[#B7832F] font-semibold self-start">
                Needs Stronger Proof
              </span>
              <span className="font-mono text-xs text-on-surface-variant">
                Campus Round 2 Frequency: 84%
              </span>
            </div>

            <h1 className="font-headline text-2xl sm:text-3xl text-primary font-semibold tracking-tight">
              React state management
            </h1>
            <p className="font-body text-xs sm:text-sm text-on-surface-variant mt-1">
              Junior Frontend Developer benchmark · Razorpay & Urban Company technical track
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-6 pt-5 border-t border-surface-container">
              <button
                onClick={() => setAddedToRoadmap(true)}
                disabled={addedToRoadmap}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
                  addedToRoadmap
                    ? 'bg-[#4F7A5A] text-white cursor-default'
                    : 'bg-primary hover:bg-primary-container text-on-primary'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {addedToRoadmap ? 'done' : 'add_task'}
                </span>
                <span>{addedToRoadmap ? 'Added to Roadmap ✓' : 'Add to my roadmap'}</span>
              </button>

              <Link
                href={`/analyses/${analysisId}/mentor`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-surface-variant text-on-surface hover:bg-surface-container text-xs font-semibold transition-colors"
              >
                <span>Discuss with TPC Mentor</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* The 4 Structural Analysis Blocks */}
          <div className="space-y-6">
            {/* 1. What the role expects */}
            <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-primary font-semibold">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <h3 className="font-headline text-base">What the role expects</h3>
              </div>
              <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                Production web applications require synchronized global client state without prop drilling. Candidates must demonstrate familiarity with normalized cache patterns, predictable state transitions, and server-cache synchronization using tools such as Zustand, Redux Toolkit, or React Context with performance optimizations.
              </p>
            </div>

            {/* 2. What your resume shows */}
            <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-secondary font-semibold">
                <span className="material-symbols-outlined text-[18px]">find_in_page</span>
                <h3 className="font-headline text-base">What your resume shows</h3>
              </div>
              <div className="p-3.5 rounded-lg bg-surface-container-low font-mono text-xs text-on-surface italic mb-3 border border-surface-variant/60">
                “Utilized React useState and useContext for local widget states in coursework e-commerce store.”
              </div>
              <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                The parsed resume mentions basic component hooks (<code className="font-mono bg-surface-container px-1 py-0.5 rounded">useState</code>), but lacks evidence of managing multi-page stores, handling optimistic UI updates, or preventing unnecessary parent re-renders.
              </p>
            </div>

            {/* 3. Why it matters in placement */}
            <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-primary font-semibold">
                <span className="material-symbols-outlined text-[18px]">trending_up</span>
                <h3 className="font-headline text-base">Why it matters in campus drives</h3>
              </div>
              <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                Frontend interviewers at Tier-1 companies routinely ask candidates to implement a small shopping cart, notification queue, or multi-step checkout during round 2 live coding. Demonstrating clean state separation distinguishes top candidates from baseline applicants.
              </p>
            </div>

            {/* 4. Concrete Remediation Steps */}
            <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <span className="material-symbols-outlined text-[18px]">checklist</span>
                  <h3 className="font-headline text-base">3 Concrete Remediation Steps</h3>
                </div>
                <span className="font-mono text-xs text-outline">Total Est: ~9.5 Hours</span>
              </div>

              <div className="space-y-4">
                {/* Step 1 */}
                <div className="p-4 rounded-xl bg-surface-container-low border border-surface-variant flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-mono text-xs font-semibold shrink-0">
                      1
                    </span>
                    <div>
                      <h4 className="font-semibold text-xs sm:text-sm text-on-surface">
                        Refactor local cart state to a centralized Zustand store
                      </h4>
                      <p className="font-body text-xs text-on-surface-variant mt-1 leading-relaxed">
                        Convert your existing e-commerce course project from prop-drilling to a lightweight Zustand store with action selectors.
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-xs px-2.5 py-1 rounded bg-surface-container text-primary font-semibold shrink-0 self-start sm:self-auto">
                    Est. 2.5 hrs
                  </span>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-xl bg-surface-container-low border border-surface-variant flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-mono text-xs font-semibold shrink-0">
                      2
                    </span>
                    <div>
                      <h4 className="font-semibold text-xs sm:text-sm text-on-surface">
                        Add persistent local storage & optimistic UI updates
                      </h4>
                      <p className="font-body text-xs text-on-surface-variant mt-1 leading-relaxed">
                        Implement persistent cart storage across reloads and optimistic item quantity adjustments with rollback error handling.
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-xs px-2.5 py-1 rounded bg-surface-container text-primary font-semibold shrink-0 self-start sm:self-auto">
                    Est. 4.0 hrs
                  </span>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-xl bg-surface-container-low border border-surface-variant flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-mono text-xs font-semibold shrink-0">
                      3
                    </span>
                    <div>
                      <h4 className="font-semibold text-xs sm:text-sm text-on-surface">
                        Write unit tests for state reducers and checkout transitions
                      </h4>
                      <p className="font-body text-xs text-on-surface-variant mt-1 leading-relaxed">
                        Test store initialization, action dispatches, and edge cases (e.g. empty cart checkout) with Jest.
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-xs px-2.5 py-1 rounded bg-surface-container text-primary font-semibold shrink-0 self-start sm:self-auto">
                    Est. 3.0 hrs
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <MobileTabBar role="student" />
    </div>
  );
}
