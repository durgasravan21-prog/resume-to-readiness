'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import TopNav from '@/components/layout/TopNav';
import MobileTabBar from '@/components/layout/MobileTabBar';
import { createClient } from '@/lib/supabase/client';
import { getSession } from '@/lib/auth';
import { Check, PlusSquare, ArrowRight, Verified, FileSearch, TrendingUp, ListChecks } from 'lucide-react';

interface SkillItem {
  id: string;
  name: string;
  status: 'strong' | 'proof' | 'missing';
  status_label: string;
  jd_requirement: string;
  evidence_quote: string;
  source_ref: string;
  plain_explanation: string;
}

export default function GapDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const analysisId = params?.id as string;
  const itemId = params?.itemId as string;
  const supabase = createClient();
  const session = getSession();

  // Read role cookie to respect TopNav persona toggle
  const [cookieRole, setCookieRole] = useState<string>('student');
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/readiness_role=([^;]+)/);
      if (match) setCookieRole(match[1]);
    }
  }, []);

  const isFacultyMode = searchParams.get('view') === 'faculty' || cookieRole === 'coordinator';

  const [item, setItem] = useState<SkillItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [addedToRoadmap, setAddedToRoadmap] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!itemId) return;
      setLoading(true);
      try {
        // Access Control: If student visits analysis not belonging to them, redirect to their own
        if (analysisId && analysisId !== 'default' && !isFacultyMode) {
          const { data: an } = await supabase.from('analyses').select('user_id').eq('id', analysisId).single();
          if (an?.user_id && session?.id && an.user_id !== session.id) {
            const { data: myAn } = await supabase
              .from('analyses')
              .select('id')
              .eq('user_id', session.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            if (myAn?.id) {
              router.replace(`/analyses/${myAn.id}`);
              return;
            } else {
              router.replace('/home');
              return;
            }
          }
        }
        const { data } = await supabase.from('analysis_items').select('*').eq('id', itemId).single();
        if (data) {
          setItem(data);
        } else {
          // Fallback: try finding first item of this analysis or any gap item
          const { data: altItems } = await supabase.from('analysis_items').select('*').limit(1);
          if (altItems && altItems.length > 0) {
            setItem(altItems[0]);
          } else {
            setItem({
              id: itemId,
              name: 'State Management & Store Hydration',
              status: 'proof',
              status_label: 'Needs Stronger Proof',
              jd_requirement: 'Demonstrated proficiency in global stores, asynchronous action thunks, and cache invalidation.',
              evidence_quote: 'Utilized React state hooks for local UI toggles and form input bindings.',
              source_ref: 'Resume Section: Technical Proficiencies',
              plain_explanation: 'Coursework uses local component state. Requires verifiable proof of Zustand, Redux Toolkit, or TanStack Query.',
            });
          }
        }
      } catch {
        setItem({
          id: itemId,
          name: 'State Management & Store Hydration',
          status: 'proof',
          status_label: 'Needs Stronger Proof',
          jd_requirement: 'Demonstrated proficiency in global stores, asynchronous action thunks, and cache invalidation.',
          evidence_quote: 'Utilized React state hooks for local UI toggles and form input bindings.',
          source_ref: 'Resume Section: Technical Proficiencies',
          plain_explanation: 'Coursework uses local component state. Requires verifiable proof of Zustand, Redux Toolkit, or TanStack Query.',
        });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [itemId, supabase]);

  if (loading) {
    return (
      <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex flex-col pb-20 md:pb-12">
        <TopNav />
        <main className="flex-1 w-full pt-16 bg-surface">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 animate-pulse">
             <div className="h-48 bg-surface-container-low rounded-2xl w-full mb-8"></div>
             <div className="space-y-6">
               <div className="h-32 bg-surface-container-low rounded-xl w-full"></div>
               <div className="h-32 bg-surface-container-low rounded-xl w-full"></div>
               <div className="h-32 bg-surface-container-low rounded-xl w-full"></div>
             </div>
          </div>
        </main>
      </div>
    );
  }

  if (!item) {
    return <div className="p-8 text-center">Item not found</div>;
  }

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex flex-col pb-20 md:pb-12">
      <TopNav />

      <main className="flex-1 w-full pt-16 bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-mono text-on-surface-variant mb-6">
            <Link href={isFacultyMode ? `/analyses/${analysisId}?view=faculty` : `/analyses/${analysisId}`} className="hover:text-primary transition-colors">
              Skill Map
            </Link>
            <span>/</span>
            <span className="text-primary font-semibold">{item.name}</span>
          </nav>

          {/* Header Card */}
          <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-6 sm:p-8 mb-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <span className={`font-mono text-xs uppercase px-2.5 py-0.5 rounded-full font-semibold self-start ${
                item.status === 'strong'
                  ? 'bg-[#E8F0EA] text-[#4F7A5A]'
                  : item.status === 'proof'
                  ? 'bg-[#F7EEDB] text-[#B7832F]'
                  : 'bg-[#FFDAD6] text-error'
              }`}>
                {item.status_label}
              </span>
              <span className="font-mono text-xs text-on-surface-variant">
                Campus Round 2 Frequency: High
              </span>
            </div>

            <h1 className="font-headline text-2xl sm:text-3xl text-primary font-semibold tracking-tight">
              {item.name}
            </h1>
            <p className="font-body text-xs sm:text-sm text-on-surface-variant mt-1">
              Based on your target role benchmark requirements
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
                {addedToRoadmap ? <Check className="w-4 h-4" /> : <PlusSquare className="w-4 h-4" />}
                <span>{addedToRoadmap ? 'Added to Roadmap ✓' : 'Add to my roadmap'}</span>
              </button>

              <Link
                href={isFacultyMode ? `/analyses/${analysisId}/mentor?view=faculty` : `/analyses/${analysisId}/mentor`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-surface-variant text-on-surface hover:bg-surface-container text-xs font-semibold transition-colors"
              >
                <span>{isFacultyMode ? 'Open Consultation Channel' : 'Discuss with TPC Mentor'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* The Structural Analysis Blocks */}
          <div className="space-y-6">
            {/* 1. What the role expects */}
            <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-primary font-semibold">
                <Verified className="w-4.5 h-4.5" />
                <h3 className="font-headline text-base">What the role expects</h3>
              </div>
              <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                {item.jd_requirement}
              </p>
            </div>

            {/* 2. What your resume shows */}
            <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-secondary font-semibold">
                <FileSearch className="w-4.5 h-4.5" />
                <h3 className="font-headline text-base">What your resume shows</h3>
              </div>
              <div className="p-3.5 rounded-lg bg-surface-container-low font-mono text-xs text-on-surface italic mb-3 border border-surface-variant/60">
                “{item.evidence_quote || 'No specific evidence found.'}”
              </div>
              <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                {item.plain_explanation}
              </p>
            </div>

            {/* 3. Why it matters in placement */}
            <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-primary font-semibold">
                <TrendingUp className="w-4.5 h-4.5" />
                <h3 className="font-headline text-base">Why it matters in campus drives</h3>
              </div>
              <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                Frontend interviewers at Tier-1 companies routinely test this during live coding rounds. Demonstrating clear proficiency in this area distinguishes top candidates from baseline applicants.
              </p>
            </div>

            {/* 4. Concrete Remediation Steps - Simplified for dynamic */}
            <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <ListChecks className="w-4.5 h-4.5" />
                  <h3 className="font-headline text-base">Suggested Remediation Checkpoints</h3>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-surface-container-low border border-surface-variant flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-mono text-xs font-semibold shrink-0">
                      1
                    </span>
                    <div>
                      <h4 className="font-semibold text-xs sm:text-sm text-on-surface">
                        Add structured proof to portfolio
                      </h4>
                      <p className="font-body text-xs text-on-surface-variant mt-1 leading-relaxed">
                        Implement a mini-project or feature in your repository that specifically highlights this skill. Ensure the code is clean and documented.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <MobileTabBar role={isFacultyMode ? 'coordinator' : 'student'} />
    </div>
  );
}
