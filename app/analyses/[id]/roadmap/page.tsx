'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import TopNav from '@/components/layout/TopNav';
import MobileTabBar from '@/components/layout/MobileTabBar';

interface RoadmapTask {
  id: string;
  phase: 'prioritize' | 'sequence' | 'prove';
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Foundational';
  hours: string;
  evidenceOutcome: string;
  done: boolean;
}

const INITIAL_TASKS: RoadmapTask[] = [
  // Phase 1: Prioritize
  {
    id: 'task_1',
    phase: 'prioritize',
    title: 'Migrate local cart state to Zustand with persistent storage',
    description: 'Centralize e-commerce state, eliminate prop-drilling, and add persistent local storage with hydration rollback.',
    priority: 'High',
    hours: '3.0h',
    evidenceOutcome: 'Recruiter Proof: Clean modular store file with typed actions on GitHub repo.',
    done: true,
  },
  {
    id: 'task_2',
    phase: 'prioritize',
    title: 'Implement asynchronous cart sync with optimistic UI updates',
    description: 'Create optimistic UI updates when adding/removing products with automated rollback on network failure.',
    priority: 'High',
    hours: '2.5h',
    evidenceOutcome: 'Recruiter Proof: Screen recording or live demo showcasing instant UX with network throttling.',
    done: true,
  },
  {
    id: 'task_3',
    phase: 'prioritize',
    title: 'Build checkout payment modal with client-side form validation',
    description: 'Controlled inputs, regex validation for UPI/cards, and resilient error boundary triggers.',
    priority: 'High',
    hours: '3.5h',
    evidenceOutcome: 'Recruiter Proof: Live demo modal with accessible keyboard tab traps and error alerts.',
    done: false,
  },

  // Phase 2: Sequence
  {
    id: 'task_4',
    phase: 'sequence',
    title: 'Write automated unit tests for state actions & store reducers',
    description: 'Author comprehensive Jest suites testing store mutations, mock async API calls, and edge cases.',
    priority: 'Medium',
    hours: '3.0h',
    evidenceOutcome: 'Recruiter Proof: Jest code coverage report badge (>80%) added to repository README.',
    done: false,
  },
  {
    id: 'task_5',
    phase: 'sequence',
    title: 'Implement React Testing Library integration tests for checkout flow',
    description: 'Test user events (input typing, button clicks, modal dismissals) using fireEvent and waitFor assertions.',
    priority: 'Medium',
    hours: '4.0h',
    evidenceOutcome: 'Recruiter Proof: Verified integration test suite running on pull requests.',
    done: false,
  },

  // Phase 3: Prove
  {
    id: 'task_6',
    phase: 'prove',
    title: 'Convert core components to strict TypeScript with interfaces',
    description: 'Replace any remaining PropTypes with strict TypeScript interfaces, generic props, and payload types.',
    priority: 'Foundational',
    hours: '4.5h',
    evidenceOutcome: 'Recruiter Proof: Zero type errors on tsc --noEmit; production .d.ts definitions.',
    done: false,
  },
  {
    id: 'task_7',
    phase: 'prove',
    title: 'Configure GitHub Actions CI pipeline and deploy to Vercel',
    description: 'Setup continuous integration YAML checking linting, formatting, and unit tests prior to deployment.',
    priority: 'Foundational',
    hours: '2.0h',
    evidenceOutcome: 'Recruiter Proof: Live production URL with passing CI status badge on GitHub.',
    done: false,
  },
];

export default function RoadmapPage() {
  const params = useParams();
  const analysisId = params?.id || 'default';

  const [tasks, setTasks] = useState<RoadmapTask[]>(INITIAL_TASKS);

  // Restore task progress on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(`readiness_roadmap_${analysisId}`);
      if (saved) {
        setTasks(JSON.parse(saved));
      }
    } catch (e) {}
  }, [analysisId]);

  const toggleTask = (taskId: string) => {
    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t));
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`readiness_roadmap_${analysisId}`, JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });
  };

  const completedCount = tasks.filter((t) => t.done).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);
  const nextIncompleteTask = tasks.find((t) => !t.done) || tasks[0];

  const prioritizeTasks = tasks.filter((t) => t.phase === 'prioritize');
  const sequenceTasks = tasks.filter((t) => t.phase === 'sequence');
  const proveTasks = tasks.filter((t) => t.phase === 'prove');

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex flex-col pb-20 md:pb-12">
      <TopNav />

      <main className="flex-1 w-full pt-16 bg-surface">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-3 mb-8 pb-4 border-b border-surface-variant">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant mb-1">
                <Link href={`/analyses/${analysisId}`} className="hover:text-primary transition-colors">
                  Skill Map
                </Link>
                <span>/</span>
                <span className="text-primary font-semibold">6-Week Action Roadmap</span>
              </div>
              <h1 className="font-headline text-2xl sm:text-3xl text-primary font-semibold tracking-tight">
                Preparation Action Roadmap
              </h1>
              <p className="font-body text-xs sm:text-sm text-on-surface-variant mt-0.5">
                Target Role: Junior Frontend Developer · Aligned with upcoming Razorpay & Tier-1 placement drives
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono text-xs px-3 py-1 rounded-full bg-surface-container text-primary border border-surface-variant font-semibold">
                Syllabus v3.2 Active
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 8 Columns: 3 Roadmap Phases */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Phase 1: Prioritize */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-surface-container">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                    <h2 className="font-headline text-base font-semibold text-primary">
                      Phase 1: Prioritize (High Interview Frequency Core)
                    </h2>
                  </div>
                  <span className="font-mono text-xs text-secondary font-semibold">Weeks 1–2</span>
                </div>

                <div className="space-y-3">
                  {prioritizeTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer shadow-xs flex items-start gap-3.5 ${
                        task.done
                          ? 'bg-surface-container-low/60 border-surface-variant/60'
                          : 'bg-surface-container-lowest border-surface-variant hover:border-primary/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() => toggleTask(task.id)}
                        className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className={`text-xs sm:text-sm font-semibold ${task.done ? 'line-through text-outline' : 'text-on-surface'}`}>
                            {task.title}
                          </h3>
                          <span className="font-mono text-[11px] text-outline shrink-0">{task.hours}</span>
                        </div>
                        <p className={`font-body text-xs mt-1 leading-relaxed ${task.done ? 'text-outline' : 'text-on-surface-variant'}`}>
                          {task.description}
                        </p>
                        <div className="mt-2.5 pt-2 border-t border-surface-container flex items-center justify-between text-[11px] font-mono">
                          <span className={task.done ? 'text-[#4F7A5A]' : 'text-primary font-medium'}>
                            {task.evidenceOutcome}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed font-semibold text-[10px]">
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phase 2: Sequence */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-surface-container">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span>
                    <h2 className="font-headline text-base font-semibold text-primary">
                      Phase 2: Sequence (Technical Differentiators)
                    </h2>
                  </div>
                  <span className="font-mono text-xs text-primary font-semibold">Weeks 3–4</span>
                </div>

                <div className="space-y-3">
                  {sequenceTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer shadow-xs flex items-start gap-3.5 ${
                        task.done
                          ? 'bg-surface-container-low/60 border-surface-variant/60'
                          : 'bg-surface-container-lowest border-surface-variant hover:border-primary/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() => toggleTask(task.id)}
                        className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className={`text-xs sm:text-sm font-semibold ${task.done ? 'line-through text-outline' : 'text-on-surface'}`}>
                            {task.title}
                          </h3>
                          <span className="font-mono text-[11px] text-outline shrink-0">{task.hours}</span>
                        </div>
                        <p className={`font-body text-xs mt-1 leading-relaxed ${task.done ? 'text-outline' : 'text-on-surface-variant'}`}>
                          {task.description}
                        </p>
                        <div className="mt-2.5 pt-2 border-t border-surface-container flex items-center justify-between text-[11px] font-mono">
                          <span className={task.done ? 'text-[#4F7A5A]' : 'text-primary font-medium'}>
                            {task.evidenceOutcome}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-semibold text-[10px]">
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phase 3: Prove */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-surface-container">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-outline"></span>
                    <h2 className="font-headline text-base font-semibold text-primary">
                      Phase 3: Prove (Recruiter-Visible Verification)
                    </h2>
                  </div>
                  <span className="font-mono text-xs text-outline font-semibold">Weeks 5–6</span>
                </div>

                <div className="space-y-3">
                  {proveTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer shadow-xs flex items-start gap-3.5 ${
                        task.done
                          ? 'bg-surface-container-low/60 border-surface-variant/60'
                          : 'bg-surface-container-lowest border-surface-variant hover:border-primary/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() => toggleTask(task.id)}
                        className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className={`text-xs sm:text-sm font-semibold ${task.done ? 'line-through text-outline' : 'text-on-surface'}`}>
                            {task.title}
                          </h3>
                          <span className="font-mono text-[11px] text-outline shrink-0">{task.hours}</span>
                        </div>
                        <p className={`font-body text-xs mt-1 leading-relaxed ${task.done ? 'text-outline' : 'text-on-surface-variant'}`}>
                          {task.description}
                        </p>
                        <div className="mt-2.5 pt-2 border-t border-surface-container flex items-center justify-between text-[11px] font-mono">
                          <span className={task.done ? 'text-[#4F7A5A]' : 'text-primary font-medium'}>
                            {task.evidenceOutcome}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-semibold text-[10px]">
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
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
                  Completing Phase 1 lifts your Target Role Fit Index from <span className="font-semibold text-secondary">72</span> to <span className="font-semibold text-primary">85 (High Match)</span>.
                </p>
              </div>

              {/* Next Best Action Card */}
              <div className="bg-surface-container-low border border-surface-variant rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-secondary font-semibold">
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
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
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  <span>Mark task completed</span>
                </button>
              </div>

              {/* Advisory Consultation Card */}
              <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-6 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <span className="material-symbols-outlined text-[18px]">event_available</span>
                  <h4 className="font-headline text-sm">Milestone Checkpoint</h4>
                </div>
                <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                  Have questions about architecture trade-offs or mock interview framing? Book a check with your campus TPC mentor.
                </p>
                <Link
                  href={`/analyses/${analysisId}/mentor`}
                  className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-surface-variant hover:bg-surface-container text-on-surface font-semibold text-xs transition-colors"
                >
                  <span>Open Mentor Guidance</span>
                  <span className="material-symbols-outlined text-[14px]">forum</span>
                </Link>
              </div>

            </div>

          </div>
        </div>
      </main>

      <MobileTabBar role="student" />
    </div>
  );
}
