'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import TopNav from '@/components/layout/TopNav';
import MobileTabBar from '@/components/layout/MobileTabBar';
import { createClient } from '@/lib/supabase/client';
import { getSession } from '@/lib/auth';

interface FacultyMentor {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
}

interface StudentCandidate {
  id: string;
  name: string;
  rollNumber: string;
  branch: string;
  cgpa: string;
  targetRole: string;
  targetCompany: string;
  readinessScore: number;
  confidenceScore: number;
  analysisId: string;
  mentorId: string;
  mentorName: string;
  pendingMessage?: {
    id: string;
    text: string;
    time: string;
    waiting: boolean;
  };
}

const AVAILABLE_MENTORS: FacultyMentor[] = [
  {
    id: 'fac_cs_02',
    name: 'Dr. Sunita Rao',
    email: 'cs.placement@nie.ac.in',
    department: 'Computer Science & Engineering',
    role: 'Faculty Coordinator (CSE / ISE)',
  },
  {
    id: 'fac_core_03',
    name: 'Prof. Vikram Mehta',
    email: 'core.placement@nie.ac.in',
    department: 'Core Engineering (ECE / MECH)',
    role: 'Faculty Coordinator (Hardware & Robotics)',
  },
  {
    id: 'fac_dean_01',
    name: 'Prof. K. R. Sharma',
    email: 'placement.dean@nie.ac.in',
    department: 'Dean Office (CIVIL & Infrastructure)',
    role: 'Dean of Placements',
  },
  {
    id: '36ac8503-c1c5-4865-b3f5-51c302a3e1ee',
    name: 'Durga sravan Challagolla',
    email: 'durgasravan21@gmail.com',
    department: 'Training & Placement Lead',
    role: 'Lead Placement Administrator',
  },
];

export default function MentorConsolePage() {
  const supabase = createClient();
  const session = getSession();

  const [activeMentorFilter, setActiveMentorFilter] = useState<string>('all');
  const [students, setStudents] = useState<StudentCandidate[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick Reply Modal
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedStudentForReply, setSelectedStudentForReply] = useState<StudentCandidate | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

  // Prescribe Task Modal
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedStudentForTask, setSelectedStudentForTask] = useState<StudentCandidate | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskHours, setTaskHours] = useState('4 hours');
  const [taskOutcome, setTaskOutcome] = useState('');
  const [taskSubmitting, setTaskSubmitting] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch profiles, analyses, mentor assignments, and messages
      const [profilesRes, analysesRes, assignmentsRes, messagesRes] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('analyses').select('*'),
        supabase.from('mentor_assignments').select('*'),
        supabase.from('mentor_messages').select('*').order('created_at', { ascending: false }),
      ]);

      const profiles = profilesRes.data || [];
      const analyses = analysesRes.data || [];
      const assignments = assignmentsRes.data || [];
      const messages = messagesRes.data || [];

      // Build student candidate objects
      const candidates: StudentCandidate[] = [];

      for (const stProfile of profiles) {
        if (stProfile.role === 'coordinator' || stProfile.id === 'system') continue;

        const analysis = analyses.find((a: any) => a.user_id === stProfile.id) ||
                         analyses.find((a: any) => a.id === `ans_${stProfile.id.replace('usr_', '')}`) ||
                         analyses[0];

        const assignment = assignments.find((m: any) => m.student_id === stProfile.id);
        const mentorId = assignment?.mentor_id || (stProfile.branch?.includes('Electronics') || stProfile.branch?.includes('Mechanical') ? 'fac_core_03' : stProfile.branch?.includes('Civil') ? 'fac_dean_01' : 'fac_cs_02');
        const mentorObj = AVAILABLE_MENTORS.find((m) => m.id === mentorId) || AVAILABLE_MENTORS[0];

        // Check if there are messages for this analysis
        const studentMessages = messages.filter((m: any) => m.analysis_id === (analysis?.id || `ans_${stProfile.id}`));
        const studentSentMsg = studentMessages.find((m: any) => m.sender === 'student');
        const mentorReplied = studentMessages.some((m: any) => m.sender === 'mentor' && !m.message_text?.includes('Please wait'));

        let pendingMessage: any = undefined;
        if (studentSentMsg) {
          pendingMessage = {
            id: studentSentMsg.id,
            text: studentSentMsg.message_text,
            time: new Date(studentSentMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            waiting: !mentorReplied,
          };
        }

        candidates.push({
          id: stProfile.id,
          name: stProfile.name || 'Candidate',
          rollNumber: stProfile.roll_number || '4NI21CS' + Math.floor(10 + Math.random() * 89),
          branch: stProfile.branch || 'Computer Science & Engineering',
          cgpa: stProfile.cgpa || '8.2',
          targetRole: analysis?.dream_role || 'Software Development Engineer',
          targetCompany: analysis?.dream_company || 'Placement Drive Benchmark',
          readinessScore: analysis?.readiness_score || 74,
          confidenceScore: analysis?.confidence_score || 85,
          analysisId: analysis?.id || 'ans_durga_01',
          mentorId,
          mentorName: mentorObj.name,
          pendingMessage,
        });
      }

      setStudents(candidates);
    } catch (e) {
      console.warn('Error loading mentor data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter students based on selected mentor
  const displayedStudents = activeMentorFilter === 'all'
    ? students
    : students.filter((s) => s.mentorId === activeMentorFilter);

  const waitingCount = displayedStudents.filter((s) => s.pendingMessage?.waiting).length;

  // Handle Quick Reply Submission
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedStudentForReply) return;

    setReplySubmitting(true);
    try {
      const activeMentor = AVAILABLE_MENTORS.find((m) => m.id === (activeMentorFilter === 'all' ? selectedStudentForReply.mentorId : activeMentorFilter)) || AVAILABLE_MENTORS[0];

      const res = await fetch('/api/mentor/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisId: selectedStudentForReply.analysisId,
          userId: activeMentor.id,
          sender: 'mentor',
          senderName: activeMentor.name,
          messageText: replyText.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to send reply');
      }

      setToastMessage(`Response sent to ${selectedStudentForReply.name}. Student chat unlocked.`);
      setReplyModalOpen(false);
      setReplyText('');
      loadData();
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Error sending reply');
    } finally {
      setReplySubmitting(false);
    }
  };

  // Handle Task Prescription Submission
  const handlePrescribeTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !selectedStudentForTask) return;

    setTaskSubmitting(true);
    try {
      const res = await fetch('/api/roadmap/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisId: selectedStudentForTask.analysisId,
          title: taskTitle.trim(),
          description: taskDescription.trim(),
          hoursEstimate: taskHours.trim(),
          evidenceOutcome: taskOutcome.trim(),
          suggestedByMentor: true,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to prescribe task');
      }

      setToastMessage(`Prescribed task "${taskTitle}" dispatched to ${selectedStudentForTask.name}'s roadmap.`);
      setTaskModalOpen(false);
      setTaskTitle('');
      setTaskDescription('');
      setTaskOutcome('');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Error prescribing task');
    } finally {
      setTaskSubmitting(false);
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex flex-col pb-20 md:pb-12">
      <TopNav />

      <main className="flex-1 w-full pt-16 bg-surface px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="max-w-[1350px] mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-surface-variant">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant mb-1">
                <span>Faculty Advisory Console</span>
                <span>/</span>
                <span className="text-primary font-semibold">Assigned Cohort</span>
              </div>
              <h1 className="font-headline text-2xl sm:text-3xl text-primary font-semibold tracking-tight">
                Faculty Mentorship & Clinical Interventions
              </h1>
              <p className="font-body text-xs sm:text-sm text-on-surface-variant mt-0.5">
                Review candidate diagnostic appraisals, answer consultation inquiries directly, and prescribe verified roadmap tasks.
              </p>
            </div>

            {/* Mentor Persona Selector */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-surface-container-low border border-surface-variant rounded-xl p-1.5 text-xs font-mono">
                <span className="text-on-surface-variant pl-2">Faculty View:</span>
                <select
                  value={activeMentorFilter}
                  onChange={(e) => setActiveMentorFilter(e.target.value)}
                  className="bg-surface-container-highest text-primary font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none border-none cursor-pointer"
                >
                  <option value="all">All Mentors (Consolidated View)</option>
                  {AVAILABLE_MENTORS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.department.split(' ')[0]})
                    </option>
                  ))}
                </select>
              </div>

              {waitingCount > 0 && (
                <span className="px-3 py-1.5 rounded-xl bg-[#FBE8E8] text-[#9E3636] font-mono text-xs font-semibold flex items-center gap-1.5 animate-pulse">
                  <span className="material-symbols-outlined text-[15px]">mark_chat_unread</span>
                  <span>{waitingCount} Pending Response</span>
                </span>
              )}
            </div>
          </div>

          {/* Active Mentor Profile Bar */}
          {activeMentorFilter !== 'all' && (
            <div className="mb-6 p-4 rounded-xl bg-surface-container-lowest border border-surface-variant flex items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-display font-bold text-sm">
                  {AVAILABLE_MENTORS.find((m) => m.id === activeMentorFilter)?.name.charAt(0) || 'F'}
                </div>
                <div>
                  <h3 className="font-title text-sm font-semibold text-primary">
                    {AVAILABLE_MENTORS.find((m) => m.id === activeMentorFilter)?.name}
                  </h3>
                  <p className="font-mono text-[11px] text-on-surface-variant">
                    {AVAILABLE_MENTORS.find((m) => m.id === activeMentorFilter)?.role} · {AVAILABLE_MENTORS.find((m) => m.id === activeMentorFilter)?.email}
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs text-on-surface-variant">
                {displayedStudents.length} Assigned Mentees
              </span>
            </div>
          )}

          {/* Student Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 rounded-2xl bg-surface-container-low animate-pulse"></div>
              ))}
            </div>
          ) : displayedStudents.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-surface-container-lowest border border-dashed border-surface-variant">
              <p className="font-mono text-sm text-on-surface-variant">No candidates assigned to this faculty mentor currently.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayedStudents.map((student) => (
                <div
                  key={student.id}
                  className={`p-6 rounded-2xl bg-surface-container-lowest border shadow-xs flex flex-col justify-between transition-all ${
                    student.pendingMessage?.waiting
                      ? 'border-secondary/60 ring-1 ring-secondary/30'
                      : 'border-surface-variant'
                  }`}
                >
                  <div>
                    {/* Header */}
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
                          student.readinessScore < 70
                            ? 'bg-[#FBE8E8] text-[#9E3636]'
                            : 'bg-[#E8F0EA] text-[#4F7A5A]'
                        }`}
                      >
                        {student.readinessScore < 70 ? 'Intervention' : 'Active'}
                      </span>
                    </div>

                    {/* Assigned Mentor Tag */}
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-on-surface-variant mb-3 pb-2 border-b border-surface-container">
                      <span>Mentor:</span>
                      <span className="font-semibold text-primary">{student.mentorName}</span>
                    </div>

                    {/* Pending Consultation Alert if Student is Waiting */}
                    {student.pendingMessage?.waiting && (
                      <div className="mb-3 p-3 rounded-xl bg-secondary-fixed/15 border border-secondary/30 text-xs">
                        <div className="flex items-center justify-between text-secondary font-mono font-semibold mb-1">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">chat</span>
                            Waiting for Faculty Response
                          </span>
                          <span className="text-[10px] text-on-surface-variant">{student.pendingMessage.time}</span>
                        </div>
                        <p className="font-body text-on-surface italic line-clamp-2">
                          "{student.pendingMessage.text}"
                        </p>
                        <button
                          onClick={() => {
                            setSelectedStudentForReply(student);
                            setReplyModalOpen(true);
                          }}
                          className="mt-2 w-full py-1 px-2.5 rounded-lg bg-secondary hover:bg-secondary/90 text-on-secondary font-mono text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[13px]">reply</span>
                          <span>Reply to Student</span>
                        </button>
                      </div>
                    )}

                    {/* Target & Scores */}
                    <div className="space-y-2 py-2.5 border-b border-surface-container mb-3 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant">Target Role:</span>
                        <span className="text-primary font-semibold truncate max-w-[170px] text-right font-body">
                          {student.targetRole}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant">Target Drive:</span>
                        <span className="text-secondary font-medium truncate max-w-[170px] text-right">
                          {student.targetCompany}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant">CGPA:</span>
                        <span className="text-on-surface font-semibold">{student.cgpa}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-on-surface-variant">Readiness Score:</span>
                        <span className={`px-2 py-0.5 rounded font-bold text-xs ${
                          student.readinessScore >= 80
                            ? 'bg-[#E8F0EA] text-[#4F7A5A]'
                            : student.readinessScore >= 70
                            ? 'bg-primary text-on-primary'
                            : 'bg-[#FBE8E8] text-[#9E3636]'
                        }`}>
                          {student.readinessScore}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <Link
                      href={`/analyses/${student.analysisId}`}
                      className="flex-1 text-center py-2 px-2.5 rounded-lg border border-surface-variant hover:bg-surface-container text-xs font-semibold transition-colors"
                    >
                      Skill Map
                    </Link>
                    <Link
                      href={`/analyses/${student.analysisId}/mentor`}
                      className="flex-1 text-center py-2 px-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold transition-colors shadow-xs"
                    >
                      Open Chat
                    </Link>
                    <button
                      onClick={() => {
                        setSelectedStudentForTask(student);
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
          )}
        </div>
      </main>

      {/* Quick Reply Modal */}
      {replyModalOpen && selectedStudentForReply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-primary/30 backdrop-blur-xs"
            onClick={() => setReplyModalOpen(false)}
          ></div>

          <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-variant p-6 sm:p-7 z-10 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-surface-container pb-3">
              <div>
                <h3 className="font-headline text-lg font-semibold text-primary">
                  Reply to Consultation Inquiry
                </h3>
                <p className="font-body text-xs text-on-surface-variant">
                  Direct message to {selectedStudentForReply.name} ({selectedStudentForReply.rollNumber}).
                </p>
              </div>
              <button
                onClick={() => setReplyModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {selectedStudentForReply.pendingMessage && (
              <div className="p-3 rounded-xl bg-surface-container-low border border-surface-variant font-body">
                <span className="font-mono text-[10px] text-on-surface-variant block mb-1 uppercase">
                  Candidate's Question:
                </span>
                <p className="text-on-surface italic">
                  "{selectedStudentForReply.pendingMessage.text}"
                </p>
              </div>
            )}

            <form onSubmit={handleSendReply} className="space-y-3">
              <div>
                <label className="font-semibold text-on-surface block mb-1 font-title">
                  Faculty Mentor Clinical Response *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide clinical interview advice, specific code review pointers, or curriculum recommendations..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-surface-container-low border border-surface-variant text-on-surface focus:outline-none focus:border-primary font-body"
                />
              </div>

              <div className="pt-3 border-t border-surface-container flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setReplyModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-on-surface-variant hover:text-on-surface font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={replySubmitting}
                  className="px-5 py-2.5 rounded-lg bg-secondary hover:bg-secondary/90 text-on-secondary font-semibold shadow-sm disabled:opacity-50"
                >
                  {replySubmitting ? 'Sending Reply...' : 'Dispatch Reply & Unlock Chat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Prescription Modal */}
      {taskModalOpen && selectedStudentForTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-primary/30 backdrop-blur-xs"
            onClick={() => setTaskModalOpen(false)}
          ></div>

          <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-variant p-6 sm:p-7 z-10 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-surface-container pb-3">
              <div>
                <h3 className="font-headline text-lg font-semibold text-primary">
                  Prescribe Roadmap Task
                </h3>
                <p className="font-body text-xs text-on-surface-variant">
                  Adding directly to {selectedStudentForTask.name}'s prioritized sprint roadmap.
                </p>
              </div>
              <button
                onClick={() => setTaskModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handlePrescribeTask} className="space-y-3">
              <div>
                <label className="font-semibold text-on-surface block mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Build Redux Toolkit store with RTK Query and mutation rollback"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-surface-container-low border border-surface-variant text-on-surface focus:outline-none focus:border-primary font-body"
                />
              </div>

              <div>
                <label className="font-semibold text-on-surface block mb-1">
                  Implementation Guidance & Syllabus Context
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide precise technical specifications and references to campus technical interview criteria..."
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
                  disabled={taskSubmitting}
                  className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold shadow-sm disabled:opacity-50"
                >
                  {taskSubmitting ? 'Prescribing Task...' : 'Prescribe Task'}
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
