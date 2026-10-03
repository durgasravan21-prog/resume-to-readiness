'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import TopNav from '@/components/layout/TopNav';
import MobileTabBar from '@/components/layout/MobileTabBar';
import LowConfidenceBanner from '@/components/ui/LowConfidenceBanner';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle, HelpCircle, XCircle, Download, ArrowRight, X } from 'lucide-react';

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

interface AnalysisData {
  id: string;
  readiness_score: number;
  confidence_score: number;
  summary_sentence: string;
  top_gap: string;
  dream_role: string;
  dream_company: string;
}

export default function SkillMapPage() {
  const router = useRouter();
  const params = useParams();
  const analysisId = params?.id as string;
  const supabase = createClient();

  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [skillItems, setSkillItems] = useState<SkillItem[]>([]);
  const [activeDrawerSkill, setActiveDrawerSkill] = useState<SkillItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!analysisId) return;
      setLoading(true);
      
      try {
        const [analysisRes, itemsRes] = await Promise.all([
          supabase.from('analyses').select('*').eq('id', analysisId).single(),
          supabase.from('analysis_items').select('*').eq('analysis_id', analysisId)
        ]);

        let anData = analysisRes.data;
        let itData = itemsRes.data || [];

        // If not found by exact ID, fallback to most recent analysis
        if (!anData) {
          const { data: latestAnalysis } = await supabase
            .from('analyses')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (latestAnalysis) {
            anData = latestAnalysis;
            const { data: fallbackItems } = await supabase
              .from('analysis_items')
              .select('*')
              .eq('analysis_id', latestAnalysis.id);
            itData = fallbackItems || [];
          }
        }

        if (anData) setAnalysis(anData);
        if (itData.length > 0) setSkillItems(itData);
      } catch (e) {
        console.warn('Error loading skill map:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [analysisId, supabase]);

  if (loading) {
    return (
      <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex flex-col pb-12">
        <TopNav />
        <main className="flex-1 w-full pt-16 bg-surface">
          <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
            <div className="animate-pulse flex flex-col gap-8">
              <div className="h-48 bg-surface-container-low rounded-2xl w-full"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="h-[400px] bg-surface-container-lowest rounded-xl"></div>
                <div className="h-[400px] bg-surface-container-lowest rounded-xl"></div>
                <div className="h-[400px] bg-surface-container-lowest rounded-xl"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const strongSkills = skillItems.filter((s) => s.status === 'strong');
  const proofSkills = skillItems.filter((s) => s.status === 'proof');
  const missingSkills = skillItems.filter((s) => s.status === 'missing');

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
                  {analysis?.dream_role || 'Junior Frontend Developer'}
                </h1>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs text-on-surface-variant">
                <span>Target: {analysis?.dream_company || 'Standard'}</span>
                <span>•</span>
                <span className="font-semibold text-primary">Readiness Index: {analysis?.readiness_score || 0}/100</span>
              </div>
            </div>

            <p className="font-body text-sm sm:text-base text-on-surface leading-relaxed max-w-4xl border-t border-surface-container pt-3">
              {analysis?.summary_sentence}
            </p>

            {/* Low-confidence Disclaimer */}
            {(analysis?.confidence_score ?? 100) < 80 && (
              <div className="mt-5">
                <LowConfidenceBanner
                  message="Evaluation Notice: Some competency vectors require deeper implementation proof to reach High Match status before campus drives."
                  actionText="View target gap →"
                  actionHref={`/analyses/${analysisId}/gap/${analysis?.top_gap || 'default'}`}
                />
              </div>
            )}
          </div>

          {/* Empty State or 3-Column Honest Report */}
          {skillItems.length === 0 ? (
            <div className="p-10 sm:p-14 rounded-2xl bg-surface-container-lowest border border-surface-variant text-center max-w-lg mx-auto space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-surface-container-high mx-auto flex items-center justify-center text-primary">
                <HelpCircle className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-headline text-lg font-semibold text-primary">
                No Diagnostic Ledger for this ID
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Upload your resume (PDF or DOCX) to extract technical competencies, verify evidence quotes, and generate your 6-week placement roadmap.
              </p>
              <div className="pt-2">
                <Link
                  href="/analyses/new"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-colors shadow-sm"
                >
                  <span>Upload Resume Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
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
                      <CheckCircle className="w-[18px] h-[18px] text-[#4F7A5A] shrink-0" />
                    </div>
                    <p className="font-mono text-[11px] text-outline mt-2 truncate">
                      {skill.source_ref}
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
                      <HelpCircle className="w-[18px] h-[18px] text-secondary shrink-0" />
                    </div>
                    <p className="font-body text-xs text-on-surface-variant mt-2 line-clamp-2 leading-relaxed">
                      {skill.plain_explanation}
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
                      <XCircle className="w-[18px] h-[18px] text-error shrink-0" />
                    </div>
                    <p className="font-body text-xs text-on-surface-variant mt-2 line-clamp-2 leading-relaxed">
                      {skill.plain_explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* In-flow Action Bar (No floating sticky bar) */}
            <div className="pt-6 border-t border-surface-variant flex flex-col sm:flex-row items-center justify-between gap-4 md:col-span-3">
              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-surface-variant text-on-surface font-semibold text-xs hover:bg-surface-container transition-colors shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Download summary (PDF)</span>
              </button>

              <Link
                href={`/analyses/${analysisId}/roadmap`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-colors shadow-sm"
              >
                <span>See my roadmap</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
          )}
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
                  {activeDrawerSkill.status_label}
                </span>

                <button
                  onClick={() => setActiveDrawerSkill(null)}
                  className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant"
                >
                  <X className="w-5 h-5" />
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
                    {activeDrawerSkill.jd_requirement}
                  </div>
                </div>

                {/* Resume Evidence Section */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="font-mono text-[10px] uppercase text-outline font-semibold tracking-wider">
                      Extracted Evidence (From Resume)
                    </h4>
                    <span className="font-mono text-[10px] text-outline">{activeDrawerSkill.source_ref}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-variant font-mono text-xs text-on-surface leading-relaxed italic">
                    {activeDrawerSkill.evidence_quote}
                  </div>
                </div>

                {/* Plain Explanation Section */}
                <div>
                  <h4 className="font-mono text-[10px] uppercase text-outline font-semibold tracking-wider mb-1.5">
                    Advisor Observation & Plain Explanation
                  </h4>
                  <div className="p-3.5 rounded-xl bg-surface-container border border-surface-variant/70 text-xs text-on-surface leading-relaxed">
                    {activeDrawerSkill.plain_explanation}
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
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      <MobileTabBar role="student" />
    </div>
  );
}
