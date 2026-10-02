'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import TopNav from '@/components/layout/TopNav';
import MobileTabBar from '@/components/layout/MobileTabBar';

interface AssignedStudent {
  id: string;
  name: string;
  rollNumber: string;
  branch: string;
  cgpa: string;
  targetRole: string;
  targetCompany: string;
  readinessScore: number;
  confidenceScore: number;
  status: 'active' | 'at_risk' | 'needs_review';
  flagCount: number;
  analysisId: string;
}

const MOCK_ASSIGNED: AssignedStudent[] = [
  {
    id: 'usr_aarav_01',
    name: 'Aarav Sundaram',
    rollNumber: '4NI21CS042',
    branch: 'Computer Science & Engineering',
    cgpa: '8.45',
    targetRole: 'Junior Frontend Developer',
    targetCompany: 'Razorpay',
    readinessScore: 72,
    confidenceScore: 88,
    status: 'active',
    flagCount: 0,
    analysisId: 'ans_aarav_01',
  },
  {
    id: 'usr_ananya_02',
    name: 'Ananya Reddy',
    rollNumber: '4NI21CS089',
    branch: 'Computer Science & Engineering',
    cgpa: '8.74',
    targetRole: 'Product Engineer (Backend)',
    targetCompany: 'Swiggy',
    readinessScore: 84,
    confidenceScore: 92,
    status: 'active',
    flagCount: 1,
    analysisId: 'ans_ananya_02',
  },
  {
    id: 'usr_rohan_03',
    name: 'Rohan Verma',
    rollNumber: '4NI21IS019',
    branch: 'Information Science',
    cgpa: '7.60',
    targetRole: 'Associate Software Engineer',
    targetCompany: 'TCS Digital',
    readinessScore: 64,
    confidenceScore: 80,
    status: 'at_risk',
    flagCount: 2,
    analysisId: 'ans_rohan_03',
  },
];

export default function MentorConsolePage() {
  const [students] = useState<AssignedStudent[]>(MOCK_ASSIGNED);
  const [selectedStudent, setSelectedStudent] = useState<AssignedStudent | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskHours, setTaskHours] = useState('4 hours');
  const [taskOutcome, setTaskOutcome] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSuggestTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !selectedStudent) return;

    setToastMessage(`Prescribed task "${taskTitle}" dispatched to ${selectedStudent.name}'s roadmap.`);
    setTaskModalOpen(false);
    setTaskTitle('');
    setTaskDescription('');
    setTaskOutcome('');
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex flex-col pb-20 md:pb-12">
      <TopNav />

      <main className="flex-1 w-full pt-16 bg-surface px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-[1300px] mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-surface-variant">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant mb-1">
                <span>Faculty Advisory Console</span>
                <span>/</span>
                <span className="text-primary font-semibold">Assigned Cohort</span>
              </div>
              <h1 className="font-headline text-2xl sm:text-3xl text-primary font-semibold tracking-tight">
                Mentorship & Skill Interventions
              </h1>
              <p className="font-body text-xs sm:text-sm text-on-surface-variant mt-0.5">
                Review candidate diagnostic appraisals, answer consultation inquiries, and prescribe roadmap tasks.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 rounded-lg bg-surface-container-high font-mono text-xs text-primary font-semibold">
                3 Mentees Assigned
              </span>
            </div>
          </div>

          {/* Student Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {students.map((student) => (
              <div
                key={student.id}
                className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-variant shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-headline text-lg font-semibold text-primary">
                        {student.name}
                      </h3>
                      <p className="font-mono text-xs text-on-surface-variant">
                        {student.rollNumber} · {student.branch}
                      </p>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                        student.status === 'at_risk'
                          ? 'bg-[#FBE8E8] text-[#9E3636]'
                          : 'bg-[#E8F0EA] text-[#4F7A5A]'
                      }`}
                    >
                      {student.status === 'at_risk' ? 'At Risk' : 'Active'}
                    </span>
                  </div>

                  {/* Target & Scores */}
                  <div className="space-y-2 py-3 border-y border-surface-container my-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant font-mono">Target Role:</span>
                      <span className="text-primary font-semibold">{student.targetRole}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant font-mono">Target Drive:</span>
                      <span className="text-secondary font-medium">{student.targetCompany}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant font-mono">CGPA:</span>
                      <span className="text-on-surface font-mono font-semibold">{student.cgpa}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-on-surface-variant font-mono">Readiness Score:</span>
                      <span className="px-2 py-0.5 rounded bg-primary text-on-primary font-mono font-bold text-xs">
                        {student.readinessScore}%
                      </span>
                    </div>
                  </div>

                  {student.flagCount > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-error font-mono mb-3">
                      <span className="material-symbols-outlined text-[16px]">flag</span>
                      <span>{student.flagCount} Program Deadline Flag(s)</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-surface-container flex flex-wrap items-center gap-2">
                  <Link
                    href={`/analyses/${student.analysisId}`}
                    className="flex-1 text-center py-2 px-3 rounded-lg border border-surface-variant hover:bg-surface-container text-xs font-semibold transition-colors"
                  >
                    Skill Map
                  </Link>
                  <Link
                    href={`/analyses/${student.analysisId}/mentor`}
                    className="flex-1 text-center py-2 px-3 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold transition-colors shadow-xs"
                  >
                    Open Chat
                  </Link>
                  <button
                    onClick={() => {
                      setSelectedStudent(student);
                      setTaskModalOpen(true);
                    }}
                    className="w-full text-center py-1.5 px-3 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-secondary text-xs font-mono transition-colors"
                  >
                    + Prescribe Roadmap Task
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Task Suggestion Modal */}
      {taskModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-primary/30 backdrop-blur-xs"
            onClick={() => setTaskModalOpen(false)}
          ></div>

          <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-variant p-6 sm:p-8 z-10 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-surface-container pb-3">
              <div>
                <h3 className="font-headline text-lg font-semibold text-primary">
                  Prescribe Roadmap Task
                </h3>
                <p className="font-body text-xs text-on-surface-variant">
                  Adding directly to {selectedStudent.name}'s prioritized sprint roadmap.
                </p>
              </div>
              <button
                onClick={() => setTaskModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSuggestTask} className="space-y-3">
              <div>
                <label className="font-semibold text-on-surface block mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Build Redux Toolkit store with RTK Query and mutation optimistic rollback"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-surface-container-low border border-surface-variant text-on-surface focus:outline-none focus:border-primary font-body"
                />
              </div>

              <div>
                <label className="font-semibold text-on-surface block mb-1">
                  Clinical Action & Context
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide precise implementation guidance and references to campus technical interview criteria..."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-surface-container-low border border-surface-variant text-on-surface focus:outline-none focus:border-primary font-body"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-on-surface block mb-1">
                    Estimated Time
                  </label>
                  <input
                    type="text"
                    value={taskHours}
                    onChange={(e) => setTaskHours(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-surface-container-low border border-surface-variant text-on-surface focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-on-surface block mb-1">
                    Verifiable Outcome Proof
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. GitHub PR with unit tests"
                    value={taskOutcome}
                    onChange={(e) => setTaskOutcome(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-surface-container-low border border-surface-variant text-on-surface focus:outline-none font-body"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-surface-container flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setTaskModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-on-surface-variant hover:text-on-surface font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold shadow-sm"
                >
                  Prescribe Task
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
