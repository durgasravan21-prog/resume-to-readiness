'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/layout/TopNav';
import Sidebar from '@/components/layout/Sidebar';
import MobileTabBar from '@/components/layout/MobileTabBar';
import { getSession } from '@/lib/auth';

interface DepartmentReport {
  branch: string;
  code: string;
  totalStudents: number;
  avgReadiness: number;
  tier1ReadyPct: number;
  coreReadyPct: number;
  atRiskCount: number;
  topGap: string;
}

const DEPARTMENT_METRICS: DepartmentReport[] = [
  {
    branch: 'Computer Science & Engineering',
    code: 'CSE',
    totalStudents: 184,
    avgReadiness: 78.4,
    tier1ReadyPct: 62,
    coreReadyPct: 29,
    atRiskCount: 16,
    topGap: 'System Design & Redux Hydration',
  },
  {
    branch: 'Information Science & Engineering',
    code: 'ISE',
    totalStudents: 126,
    avgReadiness: 74.8,
    tier1ReadyPct: 54,
    coreReadyPct: 34,
    atRiskCount: 15,
    topGap: 'Distributed Caching & Redis',
  },
  {
    branch: 'Electronics & Communication',
    code: 'ECE',
    totalStudents: 142,
    avgReadiness: 76.2,
    tier1ReadyPct: 58,
    coreReadyPct: 31,
    atRiskCount: 16,
    topGap: 'FPGA Timing Constraints (STA)',
  },
  {
    branch: 'Mechanical Engineering',
    code: 'MECH',
    totalStudents: 98,
    avgReadiness: 71.0,
    tier1ReadyPct: 41,
    coreReadyPct: 44,
    atRiskCount: 15,
    topGap: 'Ansys FEA Non-Linear Mesh Refinement',
  },
  {
    branch: 'Civil Engineering',
    code: 'CIVIL',
    totalStudents: 86,
    avgReadiness: 69.5,
    tier1ReadyPct: 37,
    coreReadyPct: 48,
    atRiskCount: 13,
    topGap: 'STAAD.Pro IS 1893 Seismic Lateral Drift',
  },
];

export default function CoordinatorReportsPage() {
  const router = useRouter();
  const [selectedBranch, setSelectedBranch] = useState<string>('All');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    const cookieRole = typeof document !== 'undefined'
      ? document.cookie.split('; ').find(row => row.startsWith('readiness_role='))?.split('=')[1]
      : null;

    const effectiveRole = cookieRole || session?.role || 'student';

    if (effectiveRole !== 'coordinator' && effectiveRole !== 'admin') {
      const lastPath = typeof document !== 'undefined'
        ? document.cookie.split('; ').find(row => row.startsWith('readiness_last_student_path='))?.split('=')[1]
        : null;
      const target = (lastPath && lastPath.startsWith('/analyses'))
        ? `${lastPath}${lastPath.includes('?') ? '&' : '?'}restricted=tpc`
        : '/home?restricted=tpc';
      router.replace(target);
    }
  }, [router]);

  const filteredReports = selectedBranch === 'All'
    ? DEPARTMENT_METRICS
    : DEPARTMENT_METRICS.filter((d) => d.code === selectedBranch);

  const totalCohortSize = DEPARTMENT_METRICS.reduce((acc, d) => acc + d.totalStudents, 0);
  const aggregateAvgReadiness = (
    DEPARTMENT_METRICS.reduce((acc, d) => acc + d.avgReadiness * d.totalStudents, 0) / totalCohortSize
  ).toFixed(1);
  const aggregateTier1Ready = Math.round(
    (DEPARTMENT_METRICS.reduce((acc, d) => acc + (d.tier1ReadyPct / 100) * d.totalStudents, 0) / totalCohortSize) * 100
  );
  const totalAtRisk = DEPARTMENT_METRICS.reduce((acc, d) => acc + d.atRiskCount, 0);

  const handleExportSummary = () => {
    setExportNotice('Exporting institutional readiness audit report for academic review...');
    setTimeout(() => {
      window.print();
      setExportNotice(null);
    }, 800);
  };

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex flex-col pb-20 md:pb-12">
      <TopNav />
      <Sidebar />

      <div className="md:pl-[240px] flex-1">
        <main className="px-4 sm:px-6 lg:px-8 py-8 md:py-10 max-w-6xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-surface-variant">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant mb-1">
                <span>Placement Cell</span>
                <span>/</span>
                <span className="text-primary font-semibold">Institutional Reports</span>
              </div>
              <h1 className="font-headline text-2xl sm:text-3xl text-primary font-semibold tracking-tight">
                Cohort Readiness & Placement Diagnostics
              </h1>
              <p className="font-body text-xs sm:text-sm text-on-surface-variant mt-1">
                Aggregated institutional competency ledgers, benchmark compliance, and drive eligibility audits.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleExportSummary}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-surface-variant text-xs font-mono font-semibold text-primary transition-colors shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Print Executive Summary</span>
              </button>
            </div>
          </div>

          {/* Aggregate KPI Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-variant shadow-xs">
              <span className="text-on-surface-variant font-mono text-[11px] block mb-1">
                Total Cohort Census
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-headline text-2xl sm:text-3xl font-bold text-primary">
                  {totalCohortSize}
                </span>
                <span className="font-mono text-xs text-on-surface-variant">Candidates</span>
              </div>
              <span className="text-[10px] font-mono text-secondary mt-1 block">
                5 Engineering Streams
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-variant shadow-xs">
              <span className="text-on-surface-variant font-mono text-[11px] block mb-1">
                Cohort Average Readiness
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-headline text-2xl sm:text-3xl font-bold text-primary">
                  {aggregateAvgReadiness}%
                </span>
                <span className="font-mono text-xs text-[#4F7A5A] font-semibold">Verified</span>
              </div>
              <span className="text-[10px] font-mono text-on-surface-variant mt-1 block">
                Target Standard: 70.0%
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-variant shadow-xs">
              <span className="text-on-surface-variant font-mono text-[11px] block mb-1">
                Tier-1 Drive Ready
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-headline text-2xl sm:text-3xl font-bold text-[#4F7A5A]">
                  {aggregateTier1Ready}%
                </span>
                <span className="font-mono text-xs text-on-surface-variant">Qualified</span>
              </div>
              <span className="text-[10px] font-mono text-[#4F7A5A] mt-1 block">
                Readiness Score ≥ 80%
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-variant shadow-xs">
              <span className="text-on-surface-variant font-mono text-[11px] block mb-1">
                Faculty Interventions
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-headline text-2xl sm:text-3xl font-bold text-error">
                  {totalAtRisk}
                </span>
                <span className="font-mono text-xs text-on-surface-variant">Active</span>
              </div>
              <span className="text-[10px] font-mono text-error mt-1 block">
                Readiness Score &lt; 65%
              </span>
            </div>
          </div>

          {/* Department Filter Tabs */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
            <span className="font-mono text-xs text-on-surface-variant mr-2 shrink-0">Filter Stream:</span>
            {['All', 'CSE', 'ISE', 'ECE', 'MECH', 'CIVIL'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedBranch(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors shrink-0 ${
                  selectedBranch === tab
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container-low hover:bg-surface-container border border-surface-variant text-on-surface-variant'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Department Breakdown Ledger */}
          <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl shadow-xs overflow-hidden mb-8">
            <div className="p-5 sm:p-6 border-b border-surface-container-highest flex items-center justify-between">
              <div>
                <h3 className="font-headline text-lg font-semibold text-primary">
                  Departmental Readiness Matrix
                </h3>
                <p className="text-xs text-on-surface-variant font-body mt-0.5">
                  Comparative performance benchmarks and high-frequency curriculum interventions.
                </p>
              </div>
              <span className="font-mono text-xs text-on-surface-variant">
                AY 2024-25 Midterm Audit
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-container-low border-b border-surface-container font-mono text-on-surface-variant uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Department</th>
                    <th className="py-3 px-4 font-semibold">Cohort Size</th>
                    <th className="py-3 px-4 font-semibold">Avg Readiness</th>
                    <th className="py-3 px-4 font-semibold">Tier-1 Qualified</th>
                    <th className="py-3 px-4 font-semibold">Interventions</th>
                    <th className="py-3 px-4 font-semibold">Top Remediation Gap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container">
                  {filteredReports.map((dept) => (
                    <tr key={dept.code} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-4 px-4 font-title font-semibold text-primary">
                        <div>{dept.branch}</div>
                        <span className="font-mono text-[10px] text-on-surface-variant">{dept.code}</span>
                      </td>
                      <td className="py-4 px-4 font-mono">{dept.totalStudents} students</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-on-surface">{dept.avgReadiness}%</span>
                          <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${dept.avgReadiness}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono font-semibold text-[#4F7A5A]">
                        {dept.tier1ReadyPct}% ({Math.round((dept.tier1ReadyPct / 100) * dept.totalStudents)})
                      </td>
                      <td className="py-4 px-4 font-mono font-semibold text-error">
                        {dept.atRiskCount} candidates
                      </td>
                      <td className="py-4 px-4 font-body text-on-surface-variant max-w-xs truncate">
                        {dept.topGap}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Strategic Placement Funnel Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-variant shadow-xs">
              <h4 className="font-headline text-base font-semibold text-primary mb-2">
                Campus Drive Clearance Funnel
              </h4>
              <p className="text-xs text-on-surface-variant font-body mb-4">
                Institutional distribution of candidates against recruitment eligibility cutoffs.
              </p>
              
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-primary font-semibold">Tier-1 Product Engineering (≥80%)</span>
                    <span className="text-[#4F7A5A] font-bold">56% (356 candidates)</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-[#4F7A5A]" style={{ width: '56%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-primary font-semibold">Core & Services Track (65-79%)</span>
                    <span className="text-secondary font-bold">32% (204 candidates)</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-secondary" style={{ width: '32%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-primary font-semibold">Remediation Sprint Track (&lt;65%)</span>
                    <span className="text-error font-bold">12% (76 candidates)</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-error" style={{ width: '12%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-variant shadow-xs flex flex-col justify-between">
              <div>
                <h4 className="font-headline text-base font-semibold text-primary mb-2">
                  Faculty Mentor Intervention Protocol
                </h4>
                <p className="text-xs text-on-surface-variant font-body mb-3">
                  All 76 candidates scoring under 65% have been assigned to designated faculty coordinators for clinical interview drills and prescribed sprints.
                </p>
                <div className="p-3 rounded-xl bg-surface-container-low border border-surface-variant text-xs space-y-1.5 font-mono">
                  <div className="flex justify-between text-on-surface">
                    <span>Assigned Mentors:</span>
                    <span className="font-bold">Dr. Sunita Rao, Prof. Vikram Mehta</span>
                  </div>
                  <div className="flex justify-between text-on-surface">
                    <span>Prescribed Sprint Duration:</span>
                    <span className="font-bold">6 Weeks Prior to Campus Day 1</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-surface-container flex items-center justify-between">
                <Link
                  href="/tpc/students"
                  className="text-xs font-mono font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <span>View All Candidates in Roster</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>
                <Link
                  href="/mentor"
                  className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-mono font-semibold hover:bg-primary-container transition-colors"
                >
                  Open Mentorship
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>

      {exportNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-on-primary px-4 py-2.5 rounded-xl shadow-lg font-mono text-xs animate-fade-in flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-secondary">sync</span>
          <span>{exportNotice}</span>
        </div>
      )}

      <MobileTabBar role="coordinator" />
    </div>
  );
}
