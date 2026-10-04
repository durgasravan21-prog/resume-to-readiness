'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import TopNav from '@/components/layout/TopNav';
import MobileTabBar from '@/components/layout/MobileTabBar';
import { createClient } from '@/lib/supabase/client';
import { getSession } from '@/lib/auth';
import { Check, MessageSquare, Zap, CalendarDays, Trash2 } from 'lucide-react';

interface RoadmapTask {
  id: string;
  roadmap_id: string;
  title: string;
  description: string;
  status: string;
  is_completed: boolean;
  order_index: number;
}

interface RoadmapItem {
  id: string;
  analysis_id: string;
  phase: string;
  title: string;
}

export default function RoadmapPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const analysisId = params?.id as string;
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

  const isFacultyMode =
    searchParams.get('view') === 'faculty' ||
    cookieRole === 'coordinator' ||
    (typeof document !== 'undefined' && document.cookie.includes('readiness_role=coordinator')) ||
    session?.role === 'coordinator' ||
    session?.role === 'admin' ||
    session?.email === 'durgasravan21@gmail.com' ||
    Boolean(session?.email?.includes('placement'));

  const [activeAnalysisId, setActiveAnalysisId] = useState<string>(analysisId);
  const [tasks, setTasks] = useState<RoadmapTask[]>([]);
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [candidateProfile, setCandidateProfile] = useState<{ name: string; roll: string; branch: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Prescribe Task Modal for Faculty
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskHours, setTaskHours] = useState('4 hours');
  const [taskOutcome, setTaskOutcome] = useState('');
  const [taskSubmitting, setTaskSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleDeleteTask = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isFacultyMode) return;
    if (!confirm('Are you sure you want to remove this roadmap task?')) return;

    try {
      const res = await fetch(`/api/roadmap/tasks?taskId=${taskId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete task');

      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      setToastMsg('Task removed from roadmap by Faculty Mentor.');
      setTimeout(() => setToastMsg(null), 3000);
    } catch (err) {
      console.error('Delete task error:', err);
    }
  };

  const loadData = async () => {
    if (!analysisId) return;
    setLoading(true);

    try {
      const targetStudentId = searchParams.get('studentId');
      let effectiveId = analysisId;

      // If viewing as faculty or coordinator and candidate studentId is supplied:
      if ((analysisId === 'default' || !analysisId) && targetStudentId) {
        const { data: stAn } = await supabase
          .from('analyses')
          .select('id, dream_role, user_id')
          .eq('user_id', targetStudentId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (stAn?.id) {
          effectiveId = stAn.id;
        }
      }

      // Access Control: If student visits 'default', find their latest analysis and navigate there
      if (effectiveId === 'default' && session?.id && !isFacultyMode) {
        const { data: myAn } = await supabase
          .from('analyses')
          .select('id')
          .eq('user_id', session.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (myAn?.id && myAn.id !== 'default') {
          router.replace(`/analyses/${myAn.id}/roadmap`);
          return;
        }
      }

      setActiveAnalysisId(effectiveId);

      const [tasksRes, itemsRes, analysisRes] = await Promise.all([
        supabase.from('roadmap_tasks').select('*').eq('analysis_id', effectiveId).order('created_at', { ascending: true }),
        supabase.from('roadmap_items').select('*').eq('analysis_id', effectiveId),
        supabase.from('analyses').select('user_id, dream_role').eq('id', effectiveId).maybeSingle(),
      ]);

      // Student Access Restriction: A student CANNOT view another student's progress or roadmap
      if (analysisRes.data?.user_id && session?.id && analysisRes.data.user_id !== session.id && !isFacultyMode) {
        const { data: myAn } = await supabase
          .from('analyses')
          .select('id')
          .eq('user_id', session.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (myAn?.id) {
          router.replace(`/analyses/${myAn.id}/roadmap`);
          return;
        } else {
          router.replace('/home');
          return;
        }
      }

      let loadedTasks = tasksRes.data || [];
      if (loadedTasks.length === 0) {
        const { data: fallbackTasks } = await supabase.from('roadmap_tasks').select('*').limit(6);
        if (fallbackTasks && fallbackTasks.length > 0) {
          loadedTasks = fallbackTasks;
        } else {
          loadedTasks = [
            {
              id: 'task_default_1',
              roadmap_id: 'rmi_prioritize',
              analysis_id: effectiveId,
              title: 'Build Global Redux Toolkit Store with Async Thunks & Query Cache',
              description: 'Implement centralized state slices, typed selectors, and mutation handlers with optimistic rollback.',
              status: 'in_progress',
              is_completed: false,
              order_index: 1,
              suggested_by_mentor: true,
            },
            {
              id: 'task_default_2',
              roadmap_id: 'rmi_sequence',
              analysis_id: effectiveId,
              title: 'Configure Vitest & React Testing Library User Flow Specs',
              description: 'Cover auth state transitions, form validation edge cases, and asynchronous error boundaries.',
              status: 'todo',
              is_completed: false,
              order_index: 2,
              suggested_by_mentor: false,
            },
            {
              id: 'task_default_3',
              roadmap_id: 'rmi_prove',
              analysis_id: effectiveId,
              title: 'Production Bundle Analyzer & Route-level Code Splitting',
              description: 'Optimize bundle size using React.lazy, dynamic imports, and measure Core Web Vitals.',
              status: 'todo',
              is_completed: false,
              order_index: 3,
              suggested_by_mentor: false,
            },
          ] as any;
        }
      }

      setTasks(loadedTasks);
      if (itemsRes.data) setItems(itemsRes.data);

      const candidateUserId = analysisRes.data?.user_id || targetStudentId;
      if (candidateUserId) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('name, roll_number, branch')
          .eq('id', candidateUserId)
          .maybeSingle();

        if (prof) {
          setCandidateProfile({
            name: prof.name || 'Candidate',
            roll: prof.roll_number || '',
            branch: prof.branch || 'Engineering',
            role: analysisRes.data?.dream_role || 'Junior Frontend Developer',
          });
        }
      }
    } catch (e) {
      console.warn('Roadmap data load warning:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [analysisId, searchParams.get('studentId'), searchParams.get('view')]);

  const toggleTask = async (taskId: string) => {
    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return;

    const currentStatus = tasks[taskIndex].is_completed;
    const newStatus = !currentStatus;

    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, is_completed: newStatus } : t)));

    try {
      const res = await fetch('/api/roadmap/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, isCompleted: newStatus }),
      });
      if (!res.ok) {
        throw new Error('API task update failed');
      }
    } catch (err) {
      console.warn('API task update fallback to direct supabase:', err);
      const { error } = await supabase
        .from('roadmap_tasks')
        .update({ is_completed: newStatus })
        .eq('id', taskId);

      if (error) {
        console.error('Failed to update task', error);
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, is_completed: currentStatus } : t)));
      }
    }
  };

  const handlePrescribeTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    setTaskSubmitting(true);
    try {
      const res = await fetch('/api/roadmap/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisId: activeAnalysisId || analysisId,
          title: taskTitle.trim(),
          description: taskDescription.trim(),
          hoursEstimate: taskHours.trim(),
          evidenceOutcome: taskOutcome.trim(),
          suggestedByMentor: true,
        }),
      });

      if (!res.ok) throw new Error('Failed to prescribe task');

      setToastMsg(`Prescribed task added to candidate roadmap.`);
      setTaskModalOpen(false);
      setTaskTitle('');
      setTaskDescription('');
      setTaskOutcome('');
      loadData();
      setTimeout(() => setToastMsg(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Error prescribing task');
    } finally {
      setTaskSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex flex-col pb-20 md:pb-12">
        <TopNav />
        <main className="flex-1 w-full pt-16 bg-surface">
          <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 animate-pulse">
            <div className="h-32 bg-surface-container-low rounded-2xl w-full mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-4">
                <div className="h-24 bg-surface-container-low rounded-xl"></div>
                <div className="h-24 bg-surface-container-low rounded-xl"></div>
                <div className="h-24 bg-surface-container-low rounded-xl"></div>
              </div>
              <div className="lg:col-span-4 space-y-6">
                <div className="h-48 bg-surface-container-lowest rounded-2xl"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const completedCount = tasks.filter((t) => t.is_completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  const nextIncompleteTask = tasks.find((t) => !t.is_completed) || tasks[0];

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex flex-col pb-20 md:pb-12">
      <TopNav />

      {/* Faculty Mode Context Banner */}
      {isFacultyMode && (
        <div className="bg-primary text-on-primary px-4 sm:px-8 py-2.5 flex items-center justify-between text-xs font-mono shadow-sm mt-16">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E8F0EA] animate-pulse"></span>
            <span className="font-semibold uppercase tracking-wider">Faculty Roadmap Oversight</span>
            <span>•</span>
            <span>Candidate: <strong>{candidateProfile?.name || 'Candidate'}</strong> ({candidateProfile?.roll || ''} · {candidateProfile?.branch || ''})</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTaskModalOpen(true)}
              className="px-2.5 py-1 rounded bg-secondary text-on-secondary font-semibold hover:bg-secondary/90 transition-colors cursor-pointer"
            >
              + Prescribe Task
            </button>
            <Link
              href={`/analyses/${analysisId}?view=faculty`}
              className="px-2.5 py-1 rounded bg-on-primary/10 hover:bg-on-primary/20 text-on-primary font-semibold transition-colors"
            >
              Skill Map
            </Link>
            <Link
              href={`/analyses/${analysisId}/mentor?view=faculty`}
              className="px-2.5 py-1 rounded bg-on-primary/10 hover:bg-on-primary/20 text-on-primary font-semibold transition-colors"
            >
              Consultation Chat
            </Link>
            <Link
              href="/mentor"
              className="px-2.5 py-1 rounded bg-on-primary/10 hover:bg-on-primary/20 text-on-primary font-semibold transition-colors"
            >
              ← Mentor Console
            </Link>
          </div>
        </div>
      )}

      <main className={`flex-1 w-full ${isFacultyMode ? 'pt-4' : 'pt-16'} bg-surface`}>
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-3 mb-8 pb-4 border-b border-surface-variant">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant mb-1">
                <Link
                  href={isFacultyMode ? `/analyses/${analysisId}?view=faculty` : `/analyses/${analysisId}`}
                  className="hover:text-primary transition-colors"
                >
                  Skill Map
                </Link>
                <span>/</span>
                <span className="text-primary font-semibold">Action Roadmap</span>
              </div>
              <h1 className="font-headline text-2xl sm:text-3xl text-primary font-semibold tracking-tight">
                {isFacultyMode ? `Candidate Roadmap: ${candidateProfile?.name || 'Student'}` : 'Preparation Action Roadmap'}
              </h1>
              <p className="font-body text-xs sm:text-sm text-on-surface-variant mt-0.5">
                Target Role: {candidateProfile?.role || 'Junior Frontend Developer'} · Aligned with upcoming placement drives
              </p>
            </div>

            <div className="flex items-center gap-3">
              {isFacultyMode && (
                <button
                  onClick={() => setTaskModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary/90 text-on-secondary font-mono text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>+ Prescribe Verified Task</span>
                </button>
              )}
              <span className="font-mono text-xs px-3 py-1 rounded-full bg-surface-container text-primary border border-surface-variant font-semibold">
                Syllabus v3.2 Active
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 8 Columns: Roadmap Phases */}
            <div className="lg:col-span-8 space-y-8">
              
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-surface-container">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                    <h2 className="font-headline text-base font-semibold text-primary">
                      Prioritized Execution Tasks
                    </h2>
                  </div>
                  <span className="text-xs font-mono text-on-surface-variant">
                    {completedCount}/{tasks.length} Verified
                  </span>
                </div>

                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer shadow-xs flex items-start gap-3.5 ${
                        task.is_completed
                          ? 'bg-surface-container-low/60 border-surface-variant/60'
                          : 'bg-surface-container-lowest border-surface-variant hover:border-primary/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={task.is_completed}
                        onChange={() => toggleTask(task.id)}
                        className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <h3 className={`text-xs sm:text-sm font-semibold ${task.is_completed ? 'line-through text-outline' : 'text-on-surface'}`}>
                            {task.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            {(task as any).suggested_by_mentor && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-secondary-fixed/20 text-secondary font-semibold border border-secondary/30 shrink-0">
                                Prescribed by Mentor
                              </span>
                            )}
                            {isFacultyMode && (
                              <button
                                onClick={(e) => handleDeleteTask(task.id, e)}
                                title="Remove task from candidate roadmap"
                                className="p-1 rounded hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors shrink-0 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className={`font-body text-xs mt-1 leading-relaxed ${task.is_completed ? 'text-outline' : 'text-on-surface-variant'}`}>
                          {task.description}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {tasks.length === 0 && (
                    <div className="p-8 text-center text-on-surface-variant text-sm border rounded-xl border-dashed">
                      No tasks found for this roadmap yet.
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Right 4 Columns: Progress Metrics & Next Action */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Progress Card */}
              <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-6 shadow-sm">
                <span className="font-mono text-[10px] uppercase text-outline font-semibold tracking-wider block mb-2">
                  Sprint Completion
                </span>

                <div className="flex items-end justify-between mb-3">
                  <span className="font-headline text-3xl font-bold text-primary">
                    {progressPercent}%
                  </span>
                  <span className="font-mono text-xs text-on-surface-variant">
                    {completedCount} of {tasks.length} tasks completed
                  </span>
                </div>

                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-[#4F7A5A] rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>

                <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                  Completing this phase lifts your Target Role Fit Index to <span className="font-semibold text-primary">High Match</span>.
                </p>
              </div>

              {/* Next Best Action Card */}
              {nextIncompleteTask && (
                <div className="bg-surface-container-low border border-surface-variant rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-2 text-secondary font-semibold">
                    <Zap className="w-4.5 h-4.5" />
                    <span className="font-mono text-xs uppercase tracking-wider">Next Best Action</span>
                  </div>

                  <h3 className="font-headline font-semibold text-sm text-primary mb-1">
                    {nextIncompleteTask.title}
                  </h3>
                  <p className="font-body text-xs text-on-surface-variant leading-relaxed mb-4">
                    {nextIncompleteTask.description}
                  </p>

                  <button
                    onClick={() => toggleTask(nextIncompleteTask.id)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-colors shadow-sm cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Mark task completed</span>
                  </button>
                </div>
              )}

              {/* Advisory Consultation Card */}
              <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-6 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <CalendarDays className="w-4.5 h-4.5" />
                  <h4 className="font-headline text-sm">
                    {isFacultyMode ? 'Intervention Action' : 'Milestone Checkpoint'}
                  </h4>
                </div>
                <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                  {isFacultyMode
                    ? 'Review direct consultation inquiries from this candidate or provide clinical remediation advice.'
                    : 'Have questions about architecture trade-offs or mock interview framing? Book a check with your campus TPC mentor.'}
                </p>
                <Link
                  href={isFacultyMode ? `/analyses/${analysisId}/mentor?view=faculty` : `/analyses/${analysisId}/mentor`}
                  className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-surface-variant hover:bg-surface-container text-on-surface font-semibold text-xs transition-colors"
                >
                  <span>{isFacultyMode ? 'Open Consultation Channel' : 'Open Mentor Guidance'}</span>
                  <MessageSquare className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>

          </div>
        </div>
      </main>

      {/* Task Prescription Modal */}
      {taskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-primary/30 backdrop-blur-xs"
            onClick={() => setTaskModalOpen(false)}
          ></div>

          <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-variant p-6 sm:p-7 z-10 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-surface-container pb-3">
              <div>
                <h3 className="font-headline text-lg font-semibold text-primary">
                  Prescribe Verified Roadmap Task
                </h3>
                <p className="font-body text-xs text-on-surface-variant">
                  Adding directly to candidate roadmap.
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
                  placeholder="Provide technical specifications and references to campus interview criteria..."
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
                  {taskSubmitting ? 'Prescribing...' : 'Prescribe Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-on-primary px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-mono animate-fade-in">
          <span className="material-symbols-outlined text-[16px] text-[#4F7A5A]">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      <MobileTabBar role={isFacultyMode ? 'coordinator' : 'student'} />
    </div>
  );
}
