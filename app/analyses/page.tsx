'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import TopNav from '@/components/layout/TopNav';
import MobileTabBar from '@/components/layout/MobileTabBar';
import EmptyState from '@/components/ui/EmptyState';
import { createClient } from '@/lib/supabase/client';
import { getSession } from '@/lib/auth';

interface AnalysisRecord {
  id: string;
  role: string;
  benchmark: string;
  matchScore: number;
  matchLabel: string;
  matchType: 'strong' | 'proof' | 'gap';
  topGap: string;
  date: string;
}

export default function AnalysesListPage() {
  const [restrictedNotice, setRestrictedNotice] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const restricted = params.get('restricted');
      if (restricted) {
        setRestrictedNotice(restricted);
      }
    }
  }, []);

  const supabase = createClient();
  const session = getSession();

  useEffect(() => {
    async function loadUserAnalyses() {
      setLoading(true);
      try {
        const userId = session?.id;
        let query = supabase.from('analyses').select('*');

        if (userId) {
          query = query.eq('user_id', userId);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped: AnalysisRecord[] = data.map((a: any) => {
            const score = a.readiness_score || 0;
            const matchType = score >= 80 ? 'strong' : score >= 60 ? 'proof' : 'gap';
            const matchLabel = score >= 80 ? 'Strong match' : score >= 60 ? 'Needs stronger proof' : 'Critical gaps';
            return {
              id: a.id,
              role: a.dream_role || 'Software Engineer',
              benchmark: a.dream_company || 'Placement Benchmark Standard',
              matchScore: score,
              matchLabel,
              matchType,
              topGap: a.top_gap || 'System Architecture & Unit Tests',
              date: a.created_at ? new Date(a.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent',
            };
          });
          setAnalyses(mapped);
        } else {
          setAnalyses([]);
        }
      } catch (err) {
        console.warn('Error loading analyses:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUserAnalyses();
  }, [session?.id, supabase]);

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
          
          {/* Security Restriction Banner */}
          {restrictedNotice && (
            <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-3 text-amber-900 dark:text-amber-200">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-xl shrink-0 mt-0.5">shield_lock</span>
                <div>
                  <h4 className="font-semibold text-sm">Access Restricted</h4>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    You are currently viewing student analyses. Access to the Training & Placement Cell coordinator dashboard (<code>/{restrictedNotice}</code>) is restricted.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRestrictedNotice(null)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
                title="Dismiss"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          )}

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
                My Diagnostic Analyses
              </h1>
              <p className="font-body text-xs sm:text-sm text-on-surface-variant mt-0.5">
                Review past resume appraisals, calibrated benchmarks, and competency scores.
              </p>
            </div>

            <Link
              href="/analyses/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>New analysis</span>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-48 rounded-2xl bg-surface-container-low animate-pulse"></div>
              ))}
            </div>
          ) : analyses.length === 0 ? (
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
                              : item.matchType === 'proof'
                              ? 'bg-[#F7EEDB] text-[#B7832F]'
                              : 'bg-[#FFDAD6] text-error'
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
                          <span className="text-secondary font-semibold truncate max-w-[200px] text-right">{item.topGap}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-surface-container flex items-center justify-between text-xs">
                      <Link
                        href={`/analyses/${item.id}/roadmap`}
                        className="text-on-surface-variant hover:text-primary font-medium"
                      >
                        Action roadmap →
                      </Link>

                      <Link
                        href={`/analyses/${item.id}`}
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
