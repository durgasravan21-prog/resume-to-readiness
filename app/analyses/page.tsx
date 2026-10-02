'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import TopNav from '@/components/layout/TopNav';
import MobileTabBar from '@/components/layout/MobileTabBar';
import EmptyState from '@/components/ui/EmptyState';

const SAMPLE_ANALYSES = [
  {
    id: 'jfd-01',
    role: 'Junior Frontend Developer',
    benchmark: 'Razorpay / Tier-1 Standard Rubric 2024',
    matchScore: 72,
    matchLabel: 'Needs stronger proof',
    matchType: 'proof',
    topGap: 'React state management',
    verifiedSkillsCount: 6,
    needsProofCount: 3,
    date: '12 Oct, 2025',
  },
  {
    id: 'ase-01',
    role: 'Associate Software Engineer',
    benchmark: 'TCS Digital / Infosys DSE Standard',
    matchScore: 84,
    matchLabel: 'Strong evidence',
    matchType: 'strong',
    topGap: 'Distributed caching & Redis',
    verifiedSkillsCount: 8,
    needsProofCount: 2,
    date: '28 Sep, 2025',
  },
  {
    id: 'react-01',
    role: 'React Developer',
    benchmark: 'Swiggy Frontend Core Rubric',
    matchScore: 54,
    matchLabel: 'Needs stronger proof',
    matchType: 'proof',
    topGap: 'Next.js SSR & Caching',
    verifiedSkillsCount: 4,
    needsProofCount: 5,
    date: '15 Sep, 2025',
  },
  {
    id: 'intern-01',
    role: 'Frontend Engineering Intern',
    benchmark: 'Cred Design Tech Foundation',
    matchScore: 91,
    matchLabel: 'Strong evidence',
    matchType: 'strong',
    topGap: 'TypeScript generics',
    verifiedSkillsCount: 9,
    needsProofCount: 1,
    date: '02 Aug, 2025',
  },
];

export default function AnalysesListPage() {
  const [analyses, setAnalyses] = useState(SAMPLE_ANALYSES);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAnalyses = analyses.filter((a) =>
    a.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.benchmark.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.topGap.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex flex-col pb-20 md:pb-12">
      <TopNav />

      <main className="flex-1 w-full pt-16 bg-surface">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-surface-variant">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant mb-1">
                <Link href="/home" className="hover:text-primary transition-colors">
                  Home
                </Link>
                <span>/</span>
                <span className="text-primary font-semibold">My Diagnostic Analyses</span>
              </div>
              <h1 className="font-headline text-2xl sm:text-3xl text-primary font-semibold tracking-tight">
                Historical Diagnostic Analyses
              </h1>
              <p className="font-body text-xs sm:text-sm text-on-surface-variant mt-0.5">
                Review past resume appraisals, calibrated benchmarks, and competency scores.
              </p>
            </div>

            <Link
              href="/analyses/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-colors shadow-sm self-start sm:self-auto"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>New analysis</span>
            </Link>
          </div>

          {analyses.length === 0 ? (
            <EmptyState
              title="No diagnostic analyses found"
              description="Upload your resume to compare your project portfolio against real placement benchmarks."
              actionText="Start First Analysis"
              actionHref="/analyses/new"
            />
          ) : (
            <div className="space-y-4">
              {/* Search input */}
              <div className="relative max-w-md">
                <span className="material-symbols-outlined text-[18px] text-outline absolute left-3 top-1/2 -translate-y-1/2">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Filter past analyses by role or top gap..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-surface-container-lowest border border-surface-variant rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary shadow-xs"
                />
              </div>

              {/* Analyses Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAnalyses.map((item) => (
                  <div
                    key={item.id}
                    className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-variant shadow-xs flex flex-col justify-between hover:border-primary/40 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className={`font-mono text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${
                            item.matchType === 'strong'
                              ? 'bg-[#E8F0EA] text-[#4F7A5A]'
                              : 'bg-[#F7EEDB] text-[#B7832F]'
                          }`}
                        >
                          {item.matchLabel} ({item.matchScore}%)
                        </span>
                        <span className="font-mono text-xs text-outline">{item.date}</span>
                      </div>

                      <h3 className="font-headline font-semibold text-base sm:text-lg text-primary mb-1">
                        {item.role}
                      </h3>
                      <p className="font-body text-xs text-on-surface-variant mb-4">
                        {item.benchmark}
                      </p>

                      <div className="p-3 rounded-xl bg-surface-container-low border border-surface-variant/60 text-xs space-y-1 mb-4">
                        <div className="flex justify-between text-on-surface font-medium">
                          <span>Primary Skill Deficit:</span>
                          <span className="text-secondary font-semibold">{item.topGap}</span>
                        </div>
                        <div className="flex justify-between text-on-surface-variant text-[11px] font-mono">
                          <span>Verified: {item.verifiedSkillsCount} skills</span>
                          <span>Needs Proof: {item.needsProofCount} skills</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-surface-container flex items-center justify-between text-xs">
                      <Link
                        href={`/analyses/default/roadmap`}
                        className="text-on-surface-variant hover:text-primary font-medium"
                      >
                        Action roadmap →
                      </Link>

                      <Link
                        href={`/analyses/default`}
                        className="inline-flex items-center gap-1 text-primary font-semibold hover:underline"
                      >
                        <span>View report</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      <MobileTabBar role="student" />
    </div>
  );
}
