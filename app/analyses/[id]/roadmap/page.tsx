'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import TopNav from '@/components/layout/TopNav';
import MobileTabBar from '@/components/layout/MobileTabBar';
import { createClient } from '@/lib/supabase/client';
import { Check, MessageSquare, Zap, CalendarDays } from 'lucide-react';

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
  const params = useParams();
  const analysisId = params?.id as string;
  const supabase = createClient();

  const [tasks, setTasks] = useState<RoadmapTask[]>([]);
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!analysisId) return;
      setLoading(true);
      
      const [tasksRes, itemsRes] = await Promise.all([
        supabase.from('roadmap_tasks').select('*').eq('analysis_id', analysisId).order('order_index', { ascending: true }),
        supabase.from('roadmap_items').select('*').eq('analysis_id', analysisId)
      ]);

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
              analysis_id: analysisId,
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
              analysis_id: analysisId,
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
              analysis_id: analysisId,
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
      
      setLoading(false);
    }
    loadData();
  }, [analysisId, supabase]);

  const toggleTask = async (taskId: string) => {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;
    
    const currentStatus = tasks[taskIndex].is_completed;
    const newStatus = !currentStatus;

    // Optimistic update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, is_completed: newStatus } : t));

    // Persist to Supabase
    const { error } = await supabase
      .from('roadmap_tasks')
      .update({ is_completed: newStatus })
      .eq('id', taskId);

    if (error) {
      console.error('Failed to update task', error);
      // Revert on error
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, is_completed: currentStatus } : t));
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
                <span className="text-primary font-semibold">Action Roadmap</span>
              </div>
              <h1 className="font-headline text-2xl sm:text-3xl text-primary font-semibold tracking-tight">
                Preparation Action Roadmap
              </h1>
              <p className="font-body text-xs sm:text-sm text-on-surface-variant mt-0.5">
                Target Role: Junior Frontend Developer · Aligned with upcoming placement drives
              </p>
            </div>

            <div className="flex items-center gap-3">
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
                          {(task as any).suggested_by_mentor && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-secondary-fixed/20 text-secondary font-semibold border border-secondary/30 shrink-0">
                              Prescribed by Mentor
                            </span>
                          )}
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
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-colors shadow-sm"
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
                  <MessageSquare className="w-3.5 h-3.5" />
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
