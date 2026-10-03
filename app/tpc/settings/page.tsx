'use client';

import React, { useState } from 'react';
import TopNav from '@/components/layout/TopNav';
import Sidebar from '@/components/layout/Sidebar';
import MobileTabBar from '@/components/layout/MobileTabBar';

export default function CoordinatorSettingsPage() {
  const [minCgpa, setMinCgpa] = useState('7.0');
  const [minReadiness, setMinReadiness] = useState('75');
  const [tier1Readiness, setTier1Readiness] = useState('80');
  const [academicYear, setAcademicYear] = useState('AY 2024-25');
  const [autoAssignMentors, setAutoAssignMentors] = useState(true);
  const [strictProofVerification, setStrictProofVerification] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setToastMessage('Institutional placement policies and compliance parameters updated successfully.');
      setTimeout(() => setToastMessage(null), 3500);
    }, 600);
  };

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex flex-col pb-20 md:pb-12">
      <TopNav />
      <Sidebar />

      <div className="md:pl-[240px] flex-1">
        <main className="px-4 sm:px-6 lg:px-8 py-8 md:py-10 max-w-4xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-surface-variant">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant mb-1">
                <span>Placement Cell</span>
                <span>/</span>
                <span className="text-primary font-semibold">Institutional Governance</span>
              </div>
              <h1 className="font-headline text-2xl sm:text-3xl text-primary font-semibold tracking-tight">
                Placement Cell Policies & Settings
              </h1>
              <p className="font-body text-xs sm:text-sm text-on-surface-variant mt-1">
                Configure candidate clearance criteria, drive authorization thresholds, and mentor escalation protocols.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* Academic Session */}
            <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-variant shadow-xs space-y-4">
              <h3 className="font-headline text-base font-semibold text-primary">
                1. Institutional Session & Accreditation
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-on-surface block mb-1.5 font-title">
                    Active Placement Season
                  </label>
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-surface-container-low border border-surface-variant text-on-surface font-mono"
                  >
                    <option value="AY 2024-25">AY 2024-25 (Current Graduating Batch)</option>
                    <option value="AY 2025-26">AY 2025-26 (Pre-final Year)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-on-surface block mb-1.5 font-title">
                    Institutional Benchmark Syllabus Version
                  </label>
                  <input
                    type="text"
                    disabled
                    value="v4.2-2025 (NAAC / AICTE Aligned)"
                    className="w-full p-2.5 rounded-lg bg-surface-container-high border border-surface-variant text-on-surface-variant font-mono cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Placement Eligibility Thresholds */}
            <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-variant shadow-xs space-y-4">
              <h3 className="font-headline text-base font-semibold text-primary">
                2. Drive Eligibility & Clearance Cutoffs
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-on-surface block mb-1.5 font-title">
                    Minimum Cumulative CGPA Cutoff
                  </label>
                  <input
                    type="text"
                    value={minCgpa}
                    onChange={(e) => setMinCgpa(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-surface-container-low border border-surface-variant text-on-surface font-mono"
                  />
                  <span className="text-[10px] text-on-surface-variant mt-1 block">
                    Campus drive baseline requirement.
                  </span>
                </div>

                <div>
                  <label className="font-semibold text-on-surface block mb-1.5 font-title">
                    General Clearance Readiness (%)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={minReadiness}
                    onChange={(e) => setMinReadiness(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-surface-container-low border border-surface-variant text-on-surface font-mono"
                  />
                  <span className="text-[10px] text-on-surface-variant mt-1 block">
                    Minimum score for standard campus drives.
                  </span>
                </div>

                <div>
                  <label className="font-semibold text-on-surface block mb-1.5 font-title">
                    Tier-1 Dream Company Clearance (%)
                  </label>
                  <input
                    type="number"
                    min="60"
                    max="100"
                    value={tier1Readiness}
                    onChange={(e) => setTier1Readiness(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-surface-container-low border border-surface-variant text-on-surface font-mono"
                  />
                  <span className="text-[10px] text-on-surface-variant mt-1 block">
                    Required for Razorpay, Swiggy, NVIDIA.
                  </span>
                </div>
              </div>
            </div>

            {/* Quality & Audit Controls */}
            <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-variant shadow-xs space-y-4">
              <h3 className="font-headline text-base font-semibold text-primary">
                3. Quality Controls & Faculty Mentorship Rules
              </h3>

              <div className="space-y-3 text-xs">
                <label className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low border border-surface-variant cursor-pointer hover:bg-surface-container transition-colors">
                  <input
                    type="checkbox"
                    checked={autoAssignMentors}
                    onChange={(e) => setAutoAssignMentors(e.target.checked)}
                    className="mt-0.5 rounded text-primary focus:ring-primary h-4 w-4"
                  />
                  <div>
                    <span className="font-semibold text-on-surface block">
                      Automatic Department Faculty Assignment
                    </span>
                    <span className="text-on-surface-variant text-[11px] block mt-0.5">
                      Automatically map students scoring under 65% or with high-risk gaps to designated department mentors (Dr. Sunita Rao, Prof. Vikram Mehta).
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low border border-surface-variant cursor-pointer hover:bg-surface-container transition-colors">
                  <input
                    type="checkbox"
                    checked={strictProofVerification}
                    onChange={(e) => setStrictProofVerification(e.target.checked)}
                    className="mt-0.5 rounded text-primary focus:ring-primary h-4 w-4"
                  />
                  <div>
                    <span className="font-semibold text-on-surface block">
                      Enforce Verifiable GitHub & Project Outcome Proofs
                    </span>
                    <span className="text-on-surface-variant text-[11px] block mt-0.5">
                      Flag skills that do not provide verbatim repository quotes or deployment URLs before issuing placement clearance certificates.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low border border-surface-variant cursor-pointer hover:bg-surface-container transition-colors">
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="mt-0.5 rounded text-primary focus:ring-primary h-4 w-4"
                  />
                  <div>
                    <span className="font-semibold text-on-surface block">
                      Dean & TPC Coordinator Email Summaries
                    </span>
                    <span className="text-on-surface-variant text-[11px] block mt-0.5">
                      Dispatch weekly cohort census digest and newly flagged student audits to placement.dean@nie.ac.in.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
              >
                {saving ? 'Updating Compliance Policies...' : 'Save Placement Policies'}
              </button>
            </div>
          </form>
        </main>
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-on-primary px-4 py-2.5 rounded-xl shadow-lg font-mono text-xs animate-fade-in flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-[#4F7A5A]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <MobileTabBar role="coordinator" />
    </div>
  );
}
