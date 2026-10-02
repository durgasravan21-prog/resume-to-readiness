'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/layout/TopNav';
import MobileTabBar from '@/components/layout/MobileTabBar';
import { getSession, UserProfile } from '@/lib/auth';

export default function StudentHomePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const session = getSession();
    if (session) {
      if (session.role === 'coordinator') {
        router.push('/tpc');
      } else {
        setUser(session);
      }
    } else {
      router.push('/');
    }
  }, [router]);

  if (!user) return null;

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex flex-col pb-20 md:pb-10">
      <TopNav />

      <main className="flex-1 w-full pt-16 bg-surface">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 w-full">
          
          {/* Greeting Section */}
          <section className="mb-8 pb-4 border-b border-surface-variant flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3">
            <div>
              <h1 className="font-headline text-2xl sm:text-3xl text-tertiary font-semibold">
                Good morning, {user.name.split(' ')[0]}
              </h1>
              <p className="font-body text-sm text-on-surface-variant mt-1">
                You have one placement roadmap in progress.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-tertiary font-mono text-xs border border-surface-variant">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                Placement Cycle 2025–26
              </span>
            </div>
          </section>

          {/* 12-Column Asymmetric Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10 items-stretch">
            {/* Active Placement Sprint (8 Columns) */}
            <div className="lg:col-span-8 bg-surface-container-lowest border border-surface-variant rounded-xl p-6 sm:p-8 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between gap-4 mb-3">
                  <span className="font-mono text-xs tracking-wider uppercase text-secondary font-semibold">
                    ACTIVE PLACEMENT SPRINT
                  </span>
                  <span className="font-mono text-xs text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">timer</span>
                    Checkpoint 4 of 8 Active
                  </span>
                </div>

                <h2 className="font-headline text-xl sm:text-2xl text-tertiary font-semibold tracking-tight">
                  Continue your roadmap for Junior Frontend Developer
                </h2>
                <p className="font-body text-xs sm:text-sm text-on-surface-variant mt-1 mb-5">
                  Razorpay / Urban Company track · Target drive: Dec 2025
                </p>

                {/* Progress Bar (Sand track with Sage fill) */}
                <div className="bg-surface-container-low rounded-lg p-4 mb-5 border border-surface-variant/70">
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-tertiary font-medium">3 of 8 checkpoints done</span>
                    <span className="text-tertiary font-semibold">38% complete</span>
                  </div>
                  <div className="w-full bg-surface-variant h-1.5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500 ease-out" style={{ width: '37.5%', backgroundColor: '#4F7A5A' }}></div>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono text-on-surface-variant">
                    <span>Started Oct 1, 2025</span>
                    <span>Est. completion: Nov 24, 2025</span>
                  </div>
                </div>

                {/* Next Action Box */}
                <div className="bg-surface-bright border border-surface-variant rounded-lg p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-secondary font-semibold">
                      UP NEXT · CHECKPOINT 4
                    </span>
                  </div>
                  <h3 className="font-title text-sm sm:text-base text-tertiary font-semibold">
                    Build a form with validation in React
                  </h3>
                  <p className="font-body text-xs text-on-surface-variant mt-1 leading-relaxed">
                    Implement controlled inputs, client-side validation logic, and error boundaries for payment checkout modal.
                  </p>
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-5 mt-4 border-t border-surface-variant flex flex-wrap items-center justify-between gap-4">
                <Link
                  href="/analyses/default/roadmap"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary-container text-on-primary font-semibold text-xs hover:bg-primary transition-colors shadow-sm"
                >
                  <span>Open roadmap</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
                <span className="font-body text-xs text-on-surface-variant flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-outline">verified</span>
                  Verified syllabus synced with industry panel
                </span>
              </div>
            </div>

            {/* Start New Analysis (4 Columns) */}
            <div className="lg:col-span-4 bg-surface-container-lowest border border-surface-variant rounded-xl p-6 sm:p-8 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs tracking-wider uppercase text-secondary font-semibold">
                    NEW DIAGNOSIS
                  </span>
                  <span className="material-symbols-outlined text-[20px] text-outline">document_scanner</span>
                </div>
                <h2 className="font-headline text-lg sm:text-xl text-tertiary font-semibold mb-2">
                  Start a new analysis
                </h2>
                <p className="font-body text-xs text-on-surface-variant leading-relaxed mb-6">
                  Upload an updated resume or target a new placement drive to recalculate your preparation roadmap.
                </p>

                {/* Upload Callout Box */}
                <div className="border border-dashed border-outline-variant rounded-lg p-5 flex flex-col items-center justify-center text-center bg-surface-container-low mb-6">
                  <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center mb-2.5 text-primary">
                    <span className="material-symbols-outlined text-[20px]">upload_file</span>
                  </div>
                  <span className="font-medium text-xs text-on-surface">Select JD or Resume</span>
                  <span className="font-mono text-[10px] text-on-surface-variant mt-1">Supports PDF, DOCX up to 5MB</span>
                </div>
              </div>

              <Link
                href="/analyses/new"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-primary text-primary hover:bg-primary hover:text-on-primary font-semibold text-xs transition-colors shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">upload_file</span>
                <span>Upload a resume</span>
              </Link>
            </div>
          </section>

          {/* Recent Analyses Section */}
          <section className="bg-surface-container-lowest border border-surface-variant rounded-xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-surface-variant">
              <div>
                <h2 className="font-headline text-lg sm:text-xl text-primary font-semibold">
                  Recent analyses
                </h2>
                <p className="font-body text-xs text-on-surface-variant mt-0.5">
                  Historical gap assessments and credential verifications
                </p>
              </div>
              <Link
                href="/analyses"
                className="font-mono text-xs text-primary hover:underline flex items-center gap-1 font-semibold"
              >
                <span>View all (4)</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-surface-container text-on-surface-variant font-mono">
                    <th className="py-2.5 px-3">Target Role</th>
                    <th className="py-2.5 px-3">Benchmark</th>
                    <th className="py-2.5 px-3">Readiness Match</th>
                    <th className="py-2.5 px-3">Top Skill Gap</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container">
                  <tr className="hover:bg-surface-container-low transition-colors">
                    <td className="py-3 px-3 font-semibold text-primary">Junior Frontend Developer</td>
                    <td className="py-3 px-3 text-on-surface-variant">Razorpay Rubric 2024</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full font-mono text-[10px] bg-[#F7EEDB] text-[#B7832F] font-semibold">
                        Needs stronger proof (72%)
                      </span>
                    </td>
                    <td className="py-3 px-3 text-on-surface-variant">React state management</td>
                    <td className="py-3 px-3 font-mono text-outline">12 Oct, 2025</td>
                    <td className="py-3 px-3 text-right">
                      <Link href="/analyses/default" className="text-primary hover:underline font-semibold">
                        View diagnostic →
                      </Link>
                    </td>
                  </tr>

                  <tr className="hover:bg-surface-container-low transition-colors">
                    <td className="py-3 px-3 font-semibold text-primary">Associate Software Engineer</td>
                    <td className="py-3 px-3 text-on-surface-variant">TCS Digital Bench</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full font-mono text-[10px] bg-[#E8F0EA] text-[#4F7A5A] font-semibold">
                        Strong evidence (84%)
                      </span>
                    </td>
                    <td className="py-3 px-3 text-on-surface-variant">Distributed caching</td>
                    <td className="py-3 px-3 font-mono text-outline">28 Sep, 2025</td>
                    <td className="py-3 px-3 text-right">
                      <Link href="/analyses/default" className="text-primary hover:underline font-semibold">
                        View diagnostic →
                      </Link>
                    </td>
                  </tr>

                  <tr className="hover:bg-surface-container-low transition-colors">
                    <td className="py-3 px-3 font-semibold text-primary">React Developer</td>
                    <td className="py-3 px-3 text-on-surface-variant">Swiggy Frontend Core</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full font-mono text-[10px] bg-[#F7EEDB] text-[#B7832F] font-semibold">
                        Needs stronger proof (54%)
                      </span>
                    </td>
                    <td className="py-3 px-3 text-on-surface-variant">Next.js SSR & Caching</td>
                    <td className="py-3 px-3 font-mono text-outline">15 Sep, 2025</td>
                    <td className="py-3 px-3 text-right">
                      <Link href="/analyses/default" className="text-primary hover:underline font-semibold">
                        View diagnostic →
                      </Link>
                    </td>
                  </tr>

                  <tr className="hover:bg-surface-container-low transition-colors">
                    <td className="py-3 px-3 font-semibold text-primary">Frontend Engineering Intern</td>
                    <td className="py-3 px-3 text-on-surface-variant">Cred Design Tech</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full font-mono text-[10px] bg-[#E8F0EA] text-[#4F7A5A] font-semibold">
                        Strong evidence (91%)
                      </span>
                    </td>
                    <td className="py-3 px-3 text-on-surface-variant">TypeScript generics</td>
                    <td className="py-3 px-3 font-mono text-outline">02 Aug, 2025</td>
                    <td className="py-3 px-3 text-right">
                      <Link href="/analyses/default" className="text-primary hover:underline font-semibold">
                        View diagnostic →
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </main>

      <MobileTabBar role="student" />
    </div>
  );
}
