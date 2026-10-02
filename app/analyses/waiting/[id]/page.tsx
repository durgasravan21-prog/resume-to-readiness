'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import TopNav from '@/components/layout/TopNav';
import MobileTabBar from '@/components/layout/MobileTabBar';

const STAGES = [
  { id: 1, label: 'Extracting skill tokens from document structure', detail: 'Parsing text layer, section headers, and project bullets...' },
  { id: 2, label: 'Reading benchmark role requirements', detail: 'Calibrating against Junior Frontend Developer syllabus v3.2...' },
  { id: 3, label: 'Matching evidence & verifying verbatim quotes', detail: 'Found 14 skill occurrences and 3 demonstrated projects...' },
  { id: 4, label: 'Synthesizing honest diagnostic & 6-week roadmap', detail: 'Scoring confidence ledger and ordering high-frequency milestones...' },
];

export default function AnalysisWaitingPage() {
  const router = useRouter();
  const params = useParams();
  const analysisId = params?.id || 'default';

  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [percent, setPercent] = useState(15);
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([
    'Initialized session audit #AR-2025-09',
    'Uploaded document: Text layer validated successfully (OCR bypass verified)',
    'Extracting semantic tokens for React, JavaScript ES6+, CSS Grid, REST APIs...',
  ]);

  useEffect(() => {
    // Stage 1 -> 2
    const t1 = setTimeout(() => {
      setCurrentStageIdx(1);
      setPercent(42);
      setTelemetryLogs((prev) => [
        ...prev,
        'Found 14 extracted technical skills and 3 applied project repositories',
        'Cross-referencing campus placement round 2 technical question frequency...',
      ]);
    }, 1800);

    // Stage 2 -> 3
    const t2 = setTimeout(() => {
      setCurrentStageIdx(2);
      setPercent(74);
      setTelemetryLogs((prev) => [
        ...prev,
        'Verifying verbatim evidence quotes: "Optimized complex PostgreSQL queries with window functions"',
        'Flagging signal deficiency: React state management lacks production store proof',
      ]);
    }, 3800);

    // Stage 3 -> 4
    const t3 = setTimeout(() => {
      setCurrentStageIdx(3);
      setPercent(95);
      setTelemetryLogs((prev) => [
        ...prev,
        'Compiling prioritized 6-week action sprint roadmap...',
        'Audit complete. Preparing competency lattice report.',
      ]);
    }, 5600);

    // Completion -> Route to Skill Map
    const t4 = setTimeout(() => {
      setPercent(100);
      router.push(`/analyses/${analysisId}`);
    }, 7200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [router, analysisId]);

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex flex-col pb-20 md:pb-12">
      <TopNav />

      <main className="flex-1 w-full pt-16 bg-surface flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        {/* Stepper Header */}
        <div className="w-full max-w-[600px] mb-6">
          <nav aria-label="Analysis Process Stages" className="w-full bg-surface-container-low rounded-xl p-3 border border-surface-variant/70">
            <ol className="flex items-center justify-between text-left">
              <li className="flex items-center gap-2 flex-1">
                <span className="w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-[15px]">check</span>
                </span>
                <div className="flex flex-col min-w-0 pr-1">
                  <span className="font-mono text-[9px] uppercase text-outline">Phase 01</span>
                  <span className="text-xs font-semibold text-on-surface truncate">Upload</span>
                </div>
                <span className="h-[1px] bg-outline-variant/40 flex-1 mx-2 hidden sm:block"></span>
              </li>

              <li className="flex items-center gap-2 flex-1">
                <span className="w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-[15px]">check</span>
                </span>
                <div className="flex flex-col min-w-0 pr-1">
                  <span className="font-mono text-[9px] uppercase text-outline">Phase 02</span>
                  <span className="text-xs font-semibold text-on-surface truncate">Benchmark</span>
                </div>
                <span className="h-[1px] bg-outline-variant/40 flex-1 mx-2 hidden sm:block"></span>
              </li>

              <li className="flex items-center gap-2 shrink-0">
                <span className="w-6 h-6 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-mono text-xs font-semibold shrink-0">
                  03
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="font-mono text-[9px] uppercase text-secondary font-semibold">Live Audit</span>
                  <span className="text-xs font-semibold text-primary">Diagnostic</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        {/* Audit Card */}
        <div className="w-full max-w-[600px] bg-surface-container-lowest rounded-2xl border border-surface-variant shadow-sm overflow-hidden">
          <div className="px-6 sm:px-8 pt-7 pb-5 border-b border-surface-container-highest">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary-container animate-pulse"></span>
                <span className="font-mono text-xs uppercase text-outline font-semibold">
                  Session Audit #{analysisId.toString().substring(0, 10).toUpperCase()}
                </span>
              </div>
              <span className="font-mono text-[10px] text-outline px-2 py-0.5 bg-surface-container rounded">
                Protocol 4.2-A
              </span>
            </div>

            <h1 className="font-headline text-xl sm:text-2xl text-primary font-semibold tracking-tight">
              Reading resume against Junior Frontend Developer benchmark
            </h1>
            <p className="font-body text-xs text-on-surface-variant mt-1">
              Calibrating evidence vectors across 7 core competency domains with institutional precision.
            </p>

            {/* Progress Bar */}
            <div className="mt-5">
              <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                <span className="text-primary font-semibold">Overall Diagnostic Progress</span>
                <span className="text-secondary font-bold">{percent}%</span>
              </div>
              <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-700 ease-out rounded-full"
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Stages List */}
          <div className="p-6 sm:p-8 space-y-4">
            <span className="font-mono text-[10px] uppercase text-outline font-semibold tracking-wider block">
              Active Evaluation Stages
            </span>

            <div className="space-y-3">
              {STAGES.map((stg, i) => {
                const isDone = i < currentStageIdx;
                const isCurrent = i === currentStageIdx;
                return (
                  <div
                    key={stg.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isCurrent
                        ? 'border-primary bg-primary-fixed/20 shadow-xs'
                        : isDone
                        ? 'border-surface-variant bg-surface-container-low/50'
                        : 'border-surface-container opacity-50 bg-surface-container-lowest'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isDone ? (
                        <span className="w-5 h-5 rounded-full bg-[#E8F0EA] text-[#4F7A5A] flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        </span>
                      ) : isCurrent ? (
                        <span className="w-5 h-5 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0 animate-spin">
                          <span className="material-symbols-outlined text-[13px]">refresh</span>
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-surface-container flex items-center justify-center font-mono text-[10px] text-outline shrink-0">
                          {stg.id}
                        </span>
                      )}

                      <div className="min-w-0 flex-1">
                        <h4 className={`text-xs font-semibold ${isCurrent ? 'text-primary font-bold' : 'text-on-surface'}`}>
                          {stg.label}
                        </h4>
                        {isCurrent && (
                          <p className="font-mono text-[11px] text-on-surface-variant mt-0.5">
                            {stg.detail}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Telemetry Terminal Box */}
            <div className="mt-5 p-3.5 rounded-xl bg-surface-container-high/60 border border-surface-variant font-mono text-[11px] space-y-1">
              <span className="text-[10px] uppercase text-outline block mb-1 font-semibold">Live Audit Ledger</span>
              {telemetryLogs.map((log, idx) => (
                <div key={idx} className="text-on-surface-variant flex items-start gap-1.5 leading-snug">
                  <span className="text-primary font-bold">›</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <MobileTabBar role="student" />
    </div>
  );
}
