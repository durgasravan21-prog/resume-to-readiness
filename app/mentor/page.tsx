'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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

interface ChatMessage {
  id: string;
  analysis_id: string;
  sender: 'mentor' | 'student' | 'system';
  sender_name: string;
  message_text: string;
  created_at: string;
  user_id?: string;
}

export default function MentorConsolePage() {
  const supabase = createClient();
  const session = getSession();

  // Active view tab: 'cohort' | 'inbox'
  const [activeTab, setActiveTab] = useState<'cohort' | 'inbox'>('cohort');

  // Available mentors loaded from DB
  const [availableMentors, setAvailableMentors] = useState<FacultyMentor[]>([]);
  const [activeMentorFilter, setActiveMentorFilter] = useState<string>('all');
  const [students, setStudents] = useState<StudentCandidate[]>([]);
  const [loading, setLoading] = useState(true);

  // All messages for the Consultation Inbox
  const [allMessages, setAllMessages] = useState<ChatMessage[]>([]);
  const [selectedStudentForChat, setSelectedStudentForChat] = useState<StudentCandidate | null>(null);
  const [inboxReplyText, setInboxReplyText] = useState('');
  const [inboxSending, setInboxSending] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

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
  const hasLoadedRef = useRef(false);

  // Load faculty mentors directly from database profiles
  const loadMentors = useCallback(async () => {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, email, branch, role')
        .in('role', ['coordinator', 'mentor', 'admin'])
        .neq('id', 'system')
        .neq('id', 'usr_coord_01'); // Filter out Ravi Sharma as requested by user

      if (profiles && profiles.length > 0) {
        const mapped: FacultyMentor[] = profiles.map((p) => {
          let dept = p.branch || 'Training & Placement';
          let roleTitle = 'Placement Mentor';
          if (p.id === '36ac8503-c1c5-4865-b3f5-51c302a3e1ee') {
            dept = 'Training & Placement Lead';
            roleTitle = 'Lead Placement Administrator';
          } else if (p.id === 'fac_cs_02') {
            dept = 'Computer Science & Engineering';
            roleTitle = 'Faculty Coordinator (CSE / ISE)';
          } else if (p.id === 'fac_core_03') {
            dept = 'Core Engineering (ECE / MECH)';
            roleTitle = 'Faculty Coordinator (Hardware & Embedded)';
          } else if (p.id === 'fac_dean_01') {
            dept = 'Dean Office (CIVIL & Infrastructure)';
            roleTitle = 'Dean of Placements';
          }

          return {
            id: p.id,
            name: p.name || 'Faculty Mentor',
            email: p.email || 'placement@nie.ac.in',
            department: dept,
            role: roleTitle,
          };
        });

        setAvailableMentors(mapped);

        // Default to 'all' so consolidated view of all cohort consultations is visible
        setActiveMentorFilter('all');
      }
    } catch (e) {
      console.warn('Error loading mentors from DB:', e);
    }
  }, [supabase]);

  const loadData = useCallback(async (silent = false) => {
    if (!hasLoadedRef.current && !silent) {
      setLoading(true);
    }
    try {
      const [profilesRes, analysesRes, assignmentsRes, messagesRes] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('analyses').select('*'),
        supabase.from('mentor_assignments').select('*'),
        supabase.from('mentor_messages').select('*').order('created_at', { ascending: false }),
      ]);

      const profiles = profilesRes.data || [];
      const analyses = analysesRes.data || [];
      const assignments = assignmentsRes.data || [];
      const messages: ChatMessage[] = messagesRes.data || [];

      setAllMessages(messages);

      // Build student candidate objects
      const candidates: StudentCandidate[] = [];

      for (const stProfile of profiles) {
        // Exclude system accounts and non-candidate faculty accounts
        if (stProfile.id === 'system' || stProfile.id === 'usr_coord_01' || stProfile.id === 'fac_cs_02' || stProfile.id === 'fac_core_03' || stProfile.id === 'fac_dean_01') {
          continue;
        }

        // Find candidate analyses (sorted newest first)
        const userAnalyses = analyses.filter((a: any) => a.user_id === stProfile.id);
        const latestAnalysis = userAnalyses.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] ||
          analyses.find((a: any) => a.id === `ans_${stProfile.id.replace('usr_', '')}`) ||
          analyses[0];

        const assignment = assignments.find((m: any) => m.student_id === stProfile.id);
        const defaultMentorId = (stProfile.branch?.includes('Electronics') || stProfile.branch?.includes('Mechanical'))
          ? 'fac_core_03'
          : stProfile.branch?.includes('Civil')
          ? 'fac_dean_01'
          : 'fac_cs_02';

        const mentorId = assignment?.mentor_id || defaultMentorId;
        const mentorObj = availableMentors.find((m) => m.id === mentorId) || availableMentors.find((m) => m.id === 'fac_cs_02') || {
          id: mentorId,
          name: 'Dr. Sunita Rao',
          email: 'cs.placement@nie.ac.in',
          department: 'Computer Science & Engineering',
          role: 'Faculty Coordinator (CSE / ISE)',
        };

        const effectiveAnalysisId = latestAnalysis?.id || `ans_${stProfile.id}`;

        // Collect all related analysis IDs for this student
        const relatedAnalysisIds = userAnalyses.map((a: any) => a.id);
        if (!relatedAnalysisIds.includes(effectiveAnalysisId)) relatedAnalysisIds.push(effectiveAnalysisId);
        if (stProfile.id === '36ac8503-c1c5-4865-b3f5-51c302a3e1ee') {
          relatedAnalysisIds.push('ans_7s4yk27');
          relatedAnalysisIds.push('ans_durga_01');
          relatedAnalysisIds.push('default');
        }

        // Check messages for this student across all their consultation threads
        const studentMessages = messages.filter((m: any) =>
          relatedAnalysisIds.includes(m.analysis_id) || m.user_id === stProfile.id
        ).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        const lastStudentMsg = studentMessages.find((m: any) => m.sender === 'student');
        const lastMentorMsg = studentMessages.find((m: any) => m.sender === 'mentor' && !m.message_text?.includes('Please wait'));

        let isWaiting = false;
        if (lastStudentMsg) {
          if (!lastMentorMsg) {
            isWaiting = true;
          } else {
            isWaiting = new Date(lastStudentMsg.created_at).getTime() > new Date(lastMentorMsg.created_at).getTime();
          }
        }

        let pendingMessage: any = undefined;
        if (lastStudentMsg) {
          pendingMessage = {
            id: lastStudentMsg.id,
            text: lastStudentMsg.message_text,
            time: new Date(lastStudentMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            waiting: isWaiting,
          };
        }

        candidates.push({
          id: stProfile.id,
          name: stProfile.name || 'Candidate',
          rollNumber: stProfile.roll_number || ('4NI21CS' + (stProfile.id.slice(-2).replace(/[^0-9]/g, '42') || '01')),
          branch: stProfile.branch || 'Computer Science & Engineering',
          cgpa: stProfile.cgpa || '8.2',
          targetRole: latestAnalysis?.dream_role || 'Software Development Engineer',
          targetCompany: latestAnalysis?.dream_company || 'Placement Drive Benchmark',
          readinessScore: latestAnalysis?.readiness_score || 74,
          confidenceScore: latestAnalysis?.confidence_score || 85,
          analysisId: effectiveAnalysisId,
          mentorId,
          mentorName: mentorObj.name,
          pendingMessage,
        });
      }

      setStudents(candidates);

      // Select student with waiting message first, or first candidate
      if (candidates.length > 0) {
        setSelectedStudentForChat((prev) => {
          if (prev) {
            const updated = candidates.find((c) => c.id === prev.id);
            if (updated) return updated;
          }
          const waitingOne = candidates.find((c) => c.pendingMessage?.waiting) || candidates[0];
          return waitingOne;
        });
      }
    } catch (e) {
      console.warn('Error loading mentor data:', e);
    } finally {
      hasLoadedRef.current = true;
      setLoading(false);
    }
  }, [availableMentors, supabase]);

  useEffect(() => {
    loadMentors();
  }, [loadMentors]);

  useEffect(() => {
    if (availableMentors.length > 0) {
      loadData();
    }
  }, [availableMentors, loadData]);

  // Realtime subscription to mentor_messages
  useEffect(() => {
    const channel = supabase
      .channel('faculty_mentor_inbox')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mentor_messages',
        },
        () => {
          loadData(true);
        }
      )
      .subscribe();

    const interval = setInterval(() => {
      loadData(true);
    }, 4000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [loadData, supabase]);

  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages, selectedStudentForChat]);

  // Filter students based on selected faculty persona
  // If Lead Administrator (Durga) is selected or All Mentors, show all candidates
  const displayedStudents = (activeMentorFilter === 'all' || activeMentorFilter === '36ac8503-c1c5-4865-b3f5-51c302a3e1ee')
    ? students
    : students.filter((s) => s.mentorId === activeMentorFilter);

  const waitingCount = displayedStudents.filter((s) => s.pendingMessage?.waiting).length;

  // Active mentor object for sending messages
  const currentActiveMentor = availableMentors.find((m) => m.id === activeMentorFilter) ||
    availableMentors.find((m) => m.id === 'fac_cs_02') ||
    availableMentors[0] || {
      id: 'fac_cs_02',
      name: 'Dr. Sunita Rao',
      email: 'cs.placement@nie.ac.in',
      department: 'Computer Science & Engineering',
      role: 'Faculty Coordinator (CSE / ISE)',
    };

  // Handle Quick Reply Submission
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedStudentForReply) return;

    setReplySubmitting(true);
    try {
      const targetAnalysisId = selectedStudentForReply.pendingMessage?.id
        ? (allMessages.find((m) => m.id === selectedStudentForReply.pendingMessage?.id)?.analysis_id || selectedStudentForReply.analysisId)
        : selectedStudentForReply.analysisId;

      const res = await fetch('/api/mentor/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisId: targetAnalysisId,
          userId: currentActiveMentor.id,
          sender: 'mentor',
          senderName: currentActiveMentor.name,
          messageText: replyText.trim(),
        }),
      });

      if (!res.ok) throw new Error('Failed to send reply');

      setToastMessage(`Response dispatched as ${currentActiveMentor.name} to ${selectedStudentForReply.name}. Student chat unlocked.`);
      setReplyModalOpen(false);
      setReplyText('');
      loadData(true);
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Error sending reply');
    } finally {
      setReplySubmitting(false);
    }
  };

  // Handle Inline Inbox Reply Submission
  const handleSendInboxReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inboxReplyText.trim() || !selectedStudentForChat) return;

    setInboxSending(true);
    try {
      const targetAnalysisId = selectedStudentForChat.pendingMessage?.id
        ? (allMessages.find((m) => m.id === selectedStudentForChat.pendingMessage?.id)?.analysis_id || selectedStudentForChat.analysisId)
        : selectedStudentForChat.analysisId;

      const res = await fetch('/api/mentor/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisId: targetAnalysisId,
          userId: currentActiveMentor.id,
          sender: 'mentor',
          senderName: currentActiveMentor.name,
          messageText: inboxReplyText.trim(),
        }),
      });

      if (!res.ok) throw new Error('Failed to send reply');

      setToastMessage(`Reply sent as ${currentActiveMentor.name} to ${selectedStudentForChat.name}. Student chat unlocked.`);
      setInboxReplyText('');
      loadData(true);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error sending reply');
    } finally {
      setInboxSending(false);
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

      if (!res.ok) throw new Error('Failed to prescribe task');

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

  // Filter messages for selected student in inbox across all threads
  const activeConversationMessages = selectedStudentForChat
    ? allMessages
        .filter((m) => {
          if (m.analysis_id === selectedStudentForChat.analysisId) return true;
          if (m.user_id === selectedStudentForChat.id) return true;
          if (selectedStudentForChat.id === '36ac8503-c1c5-4865-b3f5-51c302a3e1ee') {
            return m.analysis_id === 'ans_7s4yk27' || m.analysis_id === 'ans_durga_01' || m.analysis_id === 'default';
          }
          return false;
        })
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    : [];

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
                <span className="text-primary font-semibold">Institutional Mentorship</span>
              </div>
              <h1 className="font-headline text-2xl sm:text-3xl text-primary font-semibold tracking-tight">
                Faculty Mentorship & Clinical Interventions
              </h1>
              <p className="font-body text-xs sm:text-sm text-on-surface-variant mt-0.5">
                Review candidate diagnostic appraisals, answer consultation inquiries in real-time, and prescribe verified roadmap tasks.
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
                  {availableMentors.map((m) => (
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
                  {currentActiveMentor.name.charAt(0) || 'F'}
                </div>
                <div>
                  <h3 className="font-title text-sm font-semibold text-primary">
                    {currentActiveMentor.name}
                  </h3>
                  <p className="font-mono text-[11px] text-on-surface-variant">
                    {currentActiveMentor.role} · {currentActiveMentor.email}
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs text-on-surface-variant">
                Messages sent will be authored as <strong className="text-primary">{currentActiveMentor.name}</strong>
              </span>
            </div>
          )}

          {/* Tab Navigation Switcher */}
          <div className="flex items-center gap-2 mb-6 border-b border-surface-variant pb-2">
            <button
              onClick={() => setActiveTab('cohort')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold font-mono flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'cohort'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">school</span>
              <span>Assigned Cohort & Diagnostics ({displayedStudents.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('inbox')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold font-mono flex items-center gap-2 transition-all cursor-pointer relative ${
                activeTab === 'inbox'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">forum</span>
              <span>Consultation Inbox (Live Student Messages)</span>
              {waitingCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-secondary text-on-secondary text-[10px] font-bold flex items-center justify-center">
                  {waitingCount}
                </span>
              )}
            </button>
          </div>

          {/* TAB 1: COHORT CANDIDATES GRID */}
          {activeTab === 'cohort' && (
            <div>
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
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => {
                                  setSelectedStudentForReply(student);
                                  setReplyModalOpen(true);
                                }}
                                className="flex-1 py-1 px-2.5 rounded-lg bg-secondary hover:bg-secondary/90 text-on-secondary font-mono text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[13px]">reply</span>
                                <span>Quick Reply</span>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedStudentForChat(student);
                                  setActiveTab('inbox');
                                }}
                                className="py-1 px-2.5 rounded-lg border border-secondary/40 text-secondary hover:bg-secondary/10 font-mono text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                              >
                                <span>Open in Inbox</span>
                              </button>
                            </div>
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

                      {/* Action Buttons with ?view=faculty */}
                      <div className="pt-2 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/analyses/${student.analysisId}?view=faculty`}
                            className="flex-1 text-center py-2 px-2.5 rounded-lg border border-surface-variant hover:bg-surface-container text-xs font-semibold transition-colors"
                          >
                            Skill Map
                          </Link>
                          <Link
                            href={`/analyses/${student.analysisId}/roadmap?view=faculty`}
                            className="flex-1 text-center py-2 px-2.5 rounded-lg border border-surface-variant hover:bg-surface-container text-xs font-semibold transition-colors"
                          >
                            Roadmap
                          </Link>
                          <Link
                            href={`/analyses/${student.analysisId}/mentor?view=faculty`}
                            className="flex-1 text-center py-2 px-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold transition-colors shadow-xs"
                          >
                            Live Chat
                          </Link>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedStudentForTask(student);
                            setTaskModalOpen(true);
                          }}
                          className="w-full text-center py-1.5 px-3 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-secondary text-xs font-mono transition-colors cursor-pointer"
                        >
                          + Prescribe Roadmap Task
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CONSULTATION INBOX (VIEW MESSAGES SECTION) */}
          {activeTab === 'inbox' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Student Conversations List */}
              <div className="lg:col-span-4 bg-surface-container-lowest border border-surface-variant rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-surface-variant">
                  <h3 className="font-headline font-semibold text-sm text-primary">
                    Student Consultations ({displayedStudents.length})
                  </h3>
                  <span className="text-[11px] font-mono text-on-surface-variant">
                    {waitingCount} waiting
                  </span>
                </div>

                <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
                  {displayedStudents.map((st) => {
                    const isSelected = selectedStudentForChat?.id === st.id;
                    const stMsgs = allMessages.filter((m) => {
                      if (m.analysis_id === st.analysisId) return true;
                      if (m.user_id === st.id) return true;
                      if (st.id === '36ac8503-c1c5-4865-b3f5-51c302a3e1ee') {
                        return m.analysis_id === 'ans_7s4yk27' || m.analysis_id === 'ans_durga_01' || m.analysis_id === 'default';
                      }
                      return false;
                    });
                    const lastMsg = stMsgs[0];

                    return (
                      <div
                        key={st.id}
                        onClick={() => setSelectedStudentForChat(st)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-surface-container border-primary shadow-xs'
                            : 'bg-surface-container-low hover:bg-surface-container/60 border-surface-variant'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <span className="font-headline font-semibold text-xs text-primary truncate">
                            {st.name}
                          </span>
                          {st.pendingMessage?.waiting ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#FBE8E8] text-[#9E3636] font-bold uppercase animate-pulse shrink-0">
                              Waiting
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-outline shrink-0">
                              {lastMsg ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          )}
                        </div>

                        <p className="font-mono text-[10px] text-on-surface-variant mb-1">
                          {st.rollNumber} · {st.branch.split(' ')[0]}
                        </p>

                        <p className="text-[11px] text-on-surface font-body line-clamp-1 italic">
                          {lastMsg ? lastMsg.message_text : 'No consultation messages yet.'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Live Chat Interface */}
              <div className="lg:col-span-8 bg-surface-container-lowest border border-surface-variant rounded-2xl shadow-xs flex flex-col h-[670px] overflow-hidden">
                {selectedStudentForChat ? (
                  <>
                    {/* Header */}
                    <div className="p-4 sm:p-5 border-b border-surface-variant flex items-center justify-between gap-3 bg-surface-container-low">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-headline font-semibold text-base text-primary">
                            {selectedStudentForChat.name}
                          </h2>
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-container text-on-surface border border-surface-variant">
                            {selectedStudentForChat.rollNumber}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          Target: <strong className="text-primary">{selectedStudentForChat.targetRole}</strong> · Score: <strong>{selectedStudentForChat.readinessScore}%</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/analyses/${selectedStudentForChat.analysisId}?view=faculty`}
                          className="px-2.5 py-1.5 rounded-lg border border-surface-variant hover:bg-surface-container text-xs font-semibold transition-colors"
                        >
                          Skill Map
                        </Link>
                        <Link
                          href={`/analyses/${selectedStudentForChat.analysisId}/roadmap?view=faculty`}
                          className="px-2.5 py-1.5 rounded-lg border border-surface-variant hover:bg-surface-container text-xs font-semibold transition-colors"
                        >
                          Roadmap
                        </Link>
                      </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
                      {activeConversationMessages.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-center p-8">
                          <p className="text-xs font-mono text-on-surface-variant">
                            No consultation inquiries from this student yet. You can initiate feedback below.
                          </p>
                        </div>
                      ) : (
                        activeConversationMessages.map((msg) => {
                          const isStudent = msg.sender === 'student';
                          const isSystem = msg.sender === 'system';

                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col ${
                                isStudent ? 'items-start' : isSystem ? 'items-center' : 'items-end'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1 px-1">
                                <span className={`text-[10px] font-mono ${isSystem ? 'text-secondary font-semibold' : 'text-on-surface-variant'}`}>
                                  {msg.sender_name}
                                  {msg.sender === 'mentor' && ' (Placement Mentor)'}
                                </span>
                                <span className="text-[10px] font-mono text-outline">
                                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>

                              <div
                                className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                                  isSystem
                                    ? 'bg-secondary/10 text-on-surface border border-secondary/30 rounded-xl text-center italic text-xs'
                                    : isStudent
                                    ? 'bg-surface-container-low text-on-surface border border-surface-variant rounded-tl-none'
                                    : 'bg-primary text-on-primary rounded-tr-none'
                                }`}
                              >
                                <p className="whitespace-pre-wrap">{msg.message_text}</p>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={chatScrollRef} />
                    </div>

                    {/* Reply Bar */}
                    <div className="p-4 border-t border-surface-variant bg-surface-container-low">
                      <form onSubmit={handleSendInboxReply} className="flex gap-2">
                        <input
                          type="text"
                          required
                          placeholder={`Reply to ${selectedStudentForChat.name} as ${currentActiveMentor.name}...`}
                          value={inboxReplyText}
                          onChange={(e) => setInboxReplyText(e.target.value)}
                          className="flex-1 px-4 py-2.5 rounded-xl border border-surface-variant bg-surface-container-lowest text-on-surface text-xs focus:outline-none focus:border-primary font-body"
                        />
                        <button
                          type="submit"
                          disabled={inboxSending || !inboxReplyText.trim()}
                          className="px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary/90 text-on-secondary font-semibold text-xs transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                          {inboxSending && <span className="material-symbols-outlined text-[15px] animate-spin">progress_activity</span>}
                          <span>Send Reply</span>
                          <span className="material-symbols-outlined text-[15px]">send</span>
                        </button>
                      </form>
                      <div className="flex items-center justify-between text-[10px] font-mono text-on-surface-variant mt-1.5 px-1">
                        <span>Dispatch identity: <strong className="text-primary">{currentActiveMentor.name}</strong></span>
                        <span>Direct real-time sync</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center p-8 text-center text-on-surface-variant font-mono text-sm">
                    Select a student consultation from the left to view messages.
                  </div>
                )}
              </div>
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
                  Sending as <strong className="text-primary">{currentActiveMentor.name}</strong> to {selectedStudentForReply.name}.
                </p>
              </div>
              <button
                onClick={() => setReplyModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {selectedStudentForReply.pendingMessage && (
              <div className="p-3 rounded-xl bg-surface-container-low border border-surface-variant font-body">
                <span className="font-mono text-[10px] text-on-surface-variant block mb-1 uppercase">
                  Candidate's Inquiry:
                </span>
                <p className="text-on-surface italic">
                  "{selectedStudentForReply.pendingMessage.text}"
                </p>
              </div>
            )}

            <form onSubmit={handleSendReply} className="space-y-3">
              <div>
                <label className="font-semibold text-on-surface block mb-1 font-title">
                  Faculty Mentor Response *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide interview advice, project architecture guidance, or meeting instructions..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-surface-container-low border border-surface-variant text-on-surface focus:outline-none focus:border-primary font-body"
                />
              </div>

              <div className="pt-3 border-t border-surface-container flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setReplyModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-on-surface-variant hover:text-on-surface font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={replySubmitting}
                  className="px-5 py-2.5 rounded-lg bg-secondary hover:bg-secondary/90 text-on-secondary font-semibold shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {replySubmitting ? 'Sending...' : 'Dispatch Reply & Unlock Chat'}
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
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg cursor-pointer"
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
                  className="px-4 py-2 rounded-lg text-on-surface-variant hover:text-on-surface font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={taskSubmitting}
                  className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold shadow-sm disabled:opacity-50 cursor-pointer"
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
