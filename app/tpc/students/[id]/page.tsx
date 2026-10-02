'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import TopNav from '@/components/layout/TopNav';
import Sidebar from '@/components/layout/Sidebar';
import MobileTabBar from '@/components/layout/MobileTabBar';

interface CoachingNote {
  id: string;
  author: string;
  timestamp: string;
  text: string;
}

const INITIAL_NOTES: CoachingNote[] = [
  {
    id: 'note_1',
    author: 'Prof. Ravi Sharma',
    timestamp: '14 Sept, 11:30 AM',
    text: '“Spoke to student after mock technical interview. Fundamentals are solid, but state management needs verifiable proof on GitHub before campus drives begin.”',
  },
  {
    id: 'note_2',
    author: 'Placement Desk',
    timestamp: '12 Sept, 04:15 PM',
    text: '“Initial resume parsed. Enrolled in Tier-1 Product Preparation Sprint.”',
  },
];

export default function StudentCoachingDetailPage() {
  const params = useParams();
  const studentId = (params?.id as string) || 'usr_aarav_01';

  const [notes, setNotes] = useState<CoachingNote[]>(INITIAL_NOTES);
  const [newNoteText, setNewNoteText] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'diagnosis' | 'roadmap' | 'academics' | 'flags' | 'notes'>('diagnosis');

  // Chance & Flag state
  const [flagCount, setFlagCount] = useState(1);
  const [chancesUsed, setChancesUsed] = useState(0);
  const [programStatus, setProgramStatus] = useState<'active' | 'at_risk' | 'terminated'>('at_risk');
  const [showChanceModal, setShowChanceModal] = useState(false);
  const [chanceReason, setChanceReason] = useState('');
  const [grantingChance, setGrantingChance] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSaveNote = () => {
    if (!newNoteText.trim()) return;
    const newNote: CoachingNote = {
      id: 'note_' + Date.now(),
      author: 'Prof. Ravi Sharma',
      timestamp: 'Just now',
      text: `“${newNoteText.trim()}”`,
    };
    setNotes([newNote, ...notes]);
    setNewNoteText('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleGrantChance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chanceReason.trim()) return;

    setGrantingChance(true);
    try {
      const res = await fetch('/api/tpc/chances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          grantedBy: 'Prof. Ravi Sharma (TPC Coordinator)',
          reason: chanceReason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to grant chance.');
      }

      setChancesUsed(data.chancesUsed ?? (chancesUsed + 1));
      setFlagCount(0);
      setProgramStatus('active');
      setShowChanceModal(false);
      setChanceReason('');
      setToastMessage(data.message || 'Chance successfully granted. Active flags reset.');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Error granting chance.');
    } finally {
      setGrantingChance(false);
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex flex-col pb-20 md:pb-12">
      <TopNav />
      <Sidebar />

      <div className="md:pl-[240px]">
        <main className="pt-16 bg-surface min-h-screen px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-[1300px] mx-auto w-full">
            
            {/* Header Identity Section */}
            <div className="flex flex-col gap-5 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant">
                    <Link href="/tpc" className="hover:text-primary transition-colors">
                      Placement Cell
                    </Link>
                    <span>/</span>
                    <span className="text-on-surface font-semibold">Candidate Dossier</span>
                  </div>

                  <div className="flex items-baseline gap-3 mt-1">
                    <h1 className="font-headline text-2xl sm:text-3xl text-primary font-semibold tracking-tight">
                      Aarav Sundaram
                    </h1>
                    <span className={`font-mono text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-semibold ${
                      programStatus === 'terminated'
                        ? 'bg-[#FBE8E8] text-[#9E3636]'
                        : programStatus === 'at_risk'
                        ? 'bg-[#F7EEDB] text-[#B7832F]'
                        : 'bg-[#E8F0EA] text-[#4F7A5A]'
                    }`}>
                      {programStatus === 'terminated' ? 'Suspended (3 Flags)' : programStatus === 'at_risk' ? 'At Risk' : 'Active'}
                    </span>
                  </div>
                  <p className="font-body text-xs sm:text-sm text-on-surface-variant">
                    B.Tech Computer Science & Engineering · USN: 4NI21CS042 · CGPA: 8.45 · Target: Junior Frontend Developer (Razorpay)
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href={`/analyses/${studentId}/mentor`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container-lowest text-primary font-semibold text-xs hover:bg-surface-container transition-colors shadow-xs border border-surface-variant"
                  >
                    <span className="material-symbols-outlined text-[16px]">chat_bubble_outline</span>
                    <span>Mentor consultation</span>
                  </Link>

                  <button
                    onClick={() => setShowChanceModal(true)}
                    disabled={chancesUsed >= 3}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                    <span>Give another chance ({3 - chancesUsed} left)</span>
                  </button>
                </div>
              </div>

              {/* View Tabs */}
              <div className="flex items-center gap-2 text-xs border-b border-surface-variant pb-2 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('diagnosis')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    activeTab === 'diagnosis'
                      ? 'bg-primary text-on-primary'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  Skill Map Diagnosis
                </button>
                <button
                  onClick={() => setActiveTab('academics')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    activeTab === 'academics'
                      ? 'bg-primary text-on-primary'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  Academic Credentials
                </button>
                <button
                  onClick={() => setActiveTab('roadmap')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    activeTab === 'roadmap'
                      ? 'bg-primary text-on-primary'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  Roadmap Sprints (2/6 Done)
                </button>
                <button
                  onClick={() => setActiveTab('flags')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                    activeTab === 'flags'
                      ? 'bg-primary text-on-primary'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span>Flags & Chances</span>
                  <span className={`px-1.5 py-0.2 rounded font-mono text-[10px] ${
                    flagCount > 0 ? 'bg-error-container text-error' : 'bg-surface-container'
                  }`}>
                    {flagCount}/3
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    activeTab === 'notes'
                      ? 'bg-primary text-on-primary'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  Coaching Notes ({notes.length})
                </button>
              </div>
            </div>

            {/* TAB: Academic Records */}
            {activeTab === 'academics' && (
              <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <span className="font-mono text-[10px] uppercase text-secondary font-semibold">
                    Verified Intake Records
                  </span>
                  <h2 className="font-headline text-xl text-primary font-semibold mt-0.5">
                    Academic Background & Qualifications
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                  {/* Secondary Schooling */}
                  <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-2">
                    <span className="font-mono text-[10px] uppercase text-outline font-semibold">
                      Class 10th Schooling
                    </span>
                    <p className="font-semibold text-primary text-sm">Delhi Public School, Bangalore (CBSE)</p>
                    <p className="font-mono text-on-surface-variant">Score: 94.2% (10.0 CGPA equivalent)</p>
                  </div>

                  {/* Higher Secondary */}
                  <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-2">
                    <span className="font-mono text-[10px] uppercase text-outline font-semibold">
                      Class 12th / Pre-University
                    </span>
                    <p className="font-semibold text-primary text-sm">National PU College, Bangalore (State Board)</p>
                    <p className="font-mono text-on-surface-variant">Score: 96.0% (Distinction)</p>
                  </div>

                  {/* Undergraduate */}
                  <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-2">
                    <span className="font-mono text-[10px] uppercase text-outline font-semibold">
                      Undergraduate Degree
                    </span>
                    <p className="font-semibold text-primary text-sm">National Institute of Engineering</p>
                    <p className="text-on-surface">B.Tech · Computer Science & Engineering (Class of 2025)</p>
                    <p className="font-mono text-primary font-bold">Cumulative CGPA: 8.45 / 10.0</p>
                  </div>

                  {/* Achievements */}
                  <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-2">
                    <span className="font-mono text-[10px] uppercase text-outline font-semibold">
                      Key Extracurriculars & Achievements
                    </span>
                    <p className="font-body text-on-surface leading-relaxed">
                      • Smart India Hackathon 2024 Finalist (Team Lead)<br />
                      • Solved 350+ problems on LeetCode (Contest Rating: 1740)<br />
                      • Open source contributor to React component libraries
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-surface-container flex items-center justify-between text-xs font-mono">
                  <span className="text-on-surface-variant">Uploaded Document: aarav_sundaram_resume.pdf (142 KB)</span>
                  <button
                    onClick={() => alert('Opening candidate verified resume in viewer.')}
                    className="text-secondary font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <span>View original resume PDF</span>
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB: Flags & Chances */}
            {activeTab === 'flags' && (
              <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-mono text-[10px] uppercase text-secondary font-semibold">
                      Institutional Compliance
                    </span>
                    <h2 className="font-headline text-xl text-primary font-semibold mt-0.5">
                      Program Flags & Chance Grant Ledger
                    </h2>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="font-mono text-[10px] uppercase text-outline block">Chances Used</span>
                      <span className="font-mono font-bold text-xs text-primary">{chancesUsed} of 3 maximum</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-surface-container bg-surface-container-low space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-on-surface font-semibold">
                      Current Active Flags: {flagCount} / 3
                    </span>
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold ${
                      flagCount >= 3 ? 'bg-error-container text-error' : 'bg-surface-container-high text-on-surface-variant'
                    }`}>
                      {flagCount >= 3 ? 'TERMINATION THRESHOLD MET' : 'WITHIN ACTIVE THRESHOLD'}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Students who accumulate 3 active flags for overdue roadmap task submissions are automatically suspended from placement drive matching. A TPC coordinator may grant up to 3 chances with a mandatory justification reason.
                  </p>
                </div>

                {/* Flag History Table */}
                <div className="space-y-3">
                  <h3 className="font-headline text-sm font-semibold text-primary">
                    Audit Log of Issued Flags
                  </h3>

                  {flagCount > 0 ? (
                    <div className="p-3.5 rounded-xl border border-error/30 bg-error-container/10 flex items-start justify-between gap-3 text-xs font-mono">
                      <div>
                        <div className="flex items-center gap-2 text-error font-semibold mb-1">
                          <span className="material-symbols-outlined text-[16px]">flag</span>
                          <span>Flag #1: Missed Task Deadline</span>
                        </div>
                        <p className="font-body text-on-surface text-xs">
                          Task "Build checkout payment modal with client-side form validation" exceeded due date by 72 hours without proof submission.
                        </p>
                        <span className="text-outline text-[10px] block mt-1">Issued: 28 Sept 2025 · Automated System Cron</span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-xs font-mono text-on-surface-variant bg-surface-container-low rounded-xl">
                      No active flags on candidate record. Clean compliance ledger.
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-surface-container flex justify-end">
                  <button
                    onClick={() => setShowChanceModal(true)}
                    disabled={chancesUsed >= 3}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                    <span>Grant Reinstatement Chance</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB: Diagnosis (Original) */}
            {activeTab === 'diagnosis' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left 8 Cols: Skill ledger */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-6 shadow-sm space-y-5">
                    <h3 className="font-headline font-semibold text-lg text-primary">
                      Technical Competency Ledger
                    </h3>

                    <div className="space-y-3">
                      <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-xs text-primary">Component Architecture</span>
                          <span className="font-mono text-[10px] text-[#4F7A5A] uppercase font-bold">Strong Evidence</span>
                        </div>
                        <p className="text-xs text-on-surface-variant">Verified in project repositories. Clean modular design and functional hooks.</p>
                      </div>

                      <div className="p-4 rounded-xl bg-surface-container-low border border-[#F7EEDB]">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-xs text-primary">React State Management</span>
                          <span className="font-mono text-[10px] text-[#B7832F] uppercase font-bold">Needs Proof</span>
                        </div>
                        <p className="text-xs text-on-surface-variant">Coursework relies on basic useState. Needs demonstration of Zustand or Redux store.</p>
                      </div>

                      <div className="p-4 rounded-xl bg-surface-container-low border border-error-container">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-xs text-primary">Automated Test Suites</span>
                          <span className="font-mono text-[10px] text-error uppercase font-bold">Placement Gap</span>
                        </div>
                        <p className="text-xs text-on-surface-variant">No Vitest/Jest unit tests or RTL specs found in candidate GitHub submissions.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right 4 Cols: Notes & Fit */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-6 shadow-sm space-y-4">
                    <h3 className="font-headline font-semibold text-sm text-primary">Coaching Journal</h3>
                    <div className="space-y-3 max-h-72 overflow-y-auto">
                      {notes.map((n) => (
                        <div key={n.id} className="p-3 rounded-lg bg-surface-container-low text-xs space-y-1">
                          <div className="flex justify-between font-mono text-[10px] text-outline">
                            <span className="font-semibold text-primary">{n.author}</span>
                            <span>{n.timestamp}</span>
                          </div>
                          <p className="text-on-surface">{n.text}</p>
                        </div>
                      ))}
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Add coaching note..."
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-surface-variant bg-surface-container-low text-xs text-on-surface focus:outline-none"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveNote}
                        disabled={!newNoteText.trim()}
                        className="px-4 py-2 rounded-lg bg-primary text-on-primary font-semibold text-xs shadow-xs disabled:opacity-50"
                      >
                        Save note
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Roadmap Progress */}
            {activeTab === 'roadmap' && (
              <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
                <h3 className="font-headline font-semibold text-lg text-primary">
                  Sprint Roadmap Tasks & Evidence Outcomes
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl border border-surface-container flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-primary">Migrate local cart state to Zustand store</h4>
                      <p className="text-on-surface-variant text-[11px] mt-0.5">Proof submitted: GitHub PR #14 merged with persistent storage hooks.</p>
                    </div>
                    <span className="font-mono text-[#4F7A5A] font-semibold">Completed ✓</span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-surface-container flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-primary">Implement asynchronous cart sync with optimistic UI updates</h4>
                      <p className="text-on-surface-variant text-[11px] mt-0.5">Proof submitted: Screen recording demo of rollback on 500 error.</p>
                    </div>
                    <span className="font-mono text-[#4F7A5A] font-semibold">Completed ✓</span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-error/40 bg-error-container/10 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-error">Build checkout payment modal with client-side form validation</h4>
                      <p className="text-on-surface-variant text-[11px] mt-0.5">Deadline: 25 Sept (Overdue by 3 days). Flag issued.</p>
                    </div>
                    <span className="font-mono text-error font-semibold">Overdue Flagged</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Notes */}
            {activeTab === 'notes' && (
              <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
                <h3 className="font-headline font-semibold text-lg text-primary">All Coaching Observations</h3>
                <div className="space-y-3">
                  {notes.map((n) => (
                    <div key={n.id} className="p-4 rounded-xl bg-surface-container-low border border-surface-container text-xs space-y-1">
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="font-semibold text-primary">{n.author}</span>
                        <span className="text-outline">{n.timestamp}</span>
                      </div>
                      <p className="font-body text-on-surface">{n.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Grant Chance Modal */}
      {showChanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-primary/30 backdrop-blur-xs"
            onClick={() => setShowChanceModal(false)}
          ></div>

          <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-variant p-6 sm:p-8 z-10 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-surface-container pb-3">
              <div>
                <h3 className="font-headline text-lg font-semibold text-primary">
                  Grant Reinstatement Chance
                </h3>
                <p className="font-body text-xs text-on-surface-variant">
                  Allows up to 3 chances. Clears active flags and restores program standing.
                </p>
              </div>
              <button
                onClick={() => setShowChanceModal(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleGrantChance} className="space-y-4">
              <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container font-mono text-[11px]">
                <div className="flex justify-between mb-1">
                  <span className="text-on-surface-variant">Candidate:</span>
                  <span className="text-primary font-semibold">Aarav Sundaram</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Chance Number:</span>
                  <span className="text-secondary font-bold">Chance #{chancesUsed + 1} of 3</span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-on-surface block mb-1">
                  Mandatory Coordinator Justification Reason *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Record formal institutional rationale (e.g. Student submitted documented medical leave certificate; approved extension on checkout modal sprint)..."
                  value={chanceReason}
                  onChange={(e) => setChanceReason(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-surface-container-low border border-surface-variant text-on-surface focus:outline-none focus:border-primary font-body"
                />
              </div>

              <div className="pt-3 border-t border-surface-container flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowChanceModal(false)}
                  disabled={grantingChance}
                  className="px-4 py-2 rounded-lg text-on-surface-variant hover:text-on-surface font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={grantingChance || !chanceReason.trim()}
                  className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  {grantingChance && <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>}
                  <span>Grant Chance & Clear Flags</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-on-primary px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-mono animate-fade-in">
          <span className="material-symbols-outlined text-[16px] text-[#4F7A5A]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <MobileTabBar role="coordinator" />
    </div>
  );
}
