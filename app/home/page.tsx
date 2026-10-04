'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/layout/TopNav';
import MobileTabBar from '@/components/layout/MobileTabBar';
import { getSession, saveSession, UserProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';
import { Timer, ArrowRight, Verified, FileSearch, Upload, Calendar, CheckCircle2, Circle, Clock, FileText, Loader2 } from 'lucide-react';

export default function StudentHomePage() {
  const router = useRouter();
  const [restrictedNotice, setRestrictedNotice] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [latestAnalysis, setLatestAnalysis] = useState<any>(null);
  const [roadmapProgress, setRoadmapProgress] = useState({ completed: 0, total: 0, percentage: 0 });
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);
  const [upcomingDrives, setUpcomingDrives] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const restricted = params.get('restricted');
      if (restricted) {
        setRestrictedNotice(restricted);
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      const supabase = createClient();
      let session = getSession();
      const cookieRole = typeof document !== 'undefined'
        ? document.cookie.split('; ').find(row => row.startsWith('readiness_role='))?.split('=')[1]
        : null;
      const cookieUserId = typeof document !== 'undefined'
        ? document.cookie.split('; ').find(row => row.startsWith('readiness_user_id='))?.split('=')[1]
        : null;

      // 1. Fallback: check active Supabase Auth session if localStorage is empty
      if (!session) {
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', authUser.id)
              .maybeSingle();

            const role = profile?.role || (cookieRole as any) || 'student';
            const constructed: UserProfile = {
              id: authUser.id,
              name: profile?.name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Student',
              email: authUser.email || '',
              role: role as any,
              rollNumber: profile?.roll_number,
              branch: profile?.branch,
              degree: profile?.degree,
              graduationYear: profile?.graduation_year,
              cgpa: profile?.cgpa,
              collegeName: profile?.college_id === 'col_nie' ? 'National Institute of Engineering' : undefined,
              avatarUrl: profile?.avatar_url || authUser.user_metadata?.avatar_url,
            };
            saveSession(constructed);
            session = constructed;
          }
        } catch (authErr) {
          console.warn('Supabase auth fallback check warning:', authErr);
        }
      }

      // 2. Fallback: check cookie user ID if still no session
      if (!session && cookieUserId) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', cookieUserId)
            .maybeSingle();

          if (profile) {
            const constructed: UserProfile = {
              id: profile.id,
              name: profile.name,
              email: profile.email,
              role: profile.role || (cookieRole as any) || 'student',
              rollNumber: profile.roll_number,
              branch: profile.branch,
              degree: profile.degree,
              graduationYear: profile.graduation_year,
              cgpa: profile.cgpa,
              collegeName: 'National Institute of Engineering',
              avatarUrl: profile.avatar_url,
            };
            saveSession(constructed);
            session = constructed;
          }
        } catch (dbErr) {
          console.warn('Cookie profile lookup warning:', dbErr);
        }
      }

      if (!isMounted) return;

      if (session) {
        if (session.role === 'coordinator' && cookieRole === 'coordinator') {
          router.replace('/tpc');
        } else {
          setUser(session);
          fetchDashboardData(session.id);
        }
      } else {
        // Unauthenticated -> cleanly redirect to /login
        router.replace('/login');
      }
    }

    initSession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const fetchDashboardData = async (userId: string) => {
    try {
      const supabase = createClient();
      setLoading(true);

      // Resolve real user ID from Supabase auth session if available
      let effectiveId = userId;
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser?.id) {
        effectiveId = authUser.id;
      }

      // 1. Fetch latest analysis
      let { data: analysis } = await supabase
        .from('analyses')
        .select('*')
        .eq('user_id', effectiveId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Fallback: check original userId or cookie if different
      if (!analysis && effectiveId !== userId) {
        const { data: fallbackAnl } = await supabase
          .from('analyses')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (fallbackAnl) analysis = fallbackAnl;
      }

      if (analysis) {
        setLatestAnalysis(analysis);

        // 2 & 3. Fetch roadmap tasks for this analysis
        const { data: tasks } = await supabase
          .from('roadmap_tasks')
          .select('*')
          .eq('analysis_id', analysis.id);

        if (tasks) {
          const completed = tasks.filter(t => t.is_completed).length;
          const total = tasks.length;
          setRoadmapProgress({
            completed,
            total,
            percentage: total > 0 ? Math.round((completed / total) * 100) : 0
          });

          const pending = tasks
            .filter(t => !t.is_completed)
            .sort((a, b) => new Date(a.due_date || '9999-12-31').getTime() - new Date(b.due_date || '9999-12-31').getTime())
            .slice(0, 3);
          
          setPendingTasks(pending);
        }
      }

      // 4. Fetch upcoming placement drives
      const { data: drives } = await supabase
        .from('placement_drives')
        .select('*')
        .eq('status', 'upcoming')
        .order('drive_date', { ascending: true });

      if (drives) {
        setUpcomingDrives(drives);
      }
      
    } catch (err) {
      console.error('Error fetching dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <p className="font-mono text-xs text-on-surface-variant">Connecting to institutional portal...</p>
      </div>
    );
  }

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex flex-col pb-20 md:pb-10">
      <TopNav />

      <main className="flex-1 w-full pt-16 bg-surface">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 w-full">
          
          {/* Security Restriction Banner */}
          {restrictedNotice && (
            <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-3 text-amber-900 dark:text-amber-200">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-xl shrink-0 mt-0.5">shield_lock</span>
                <div>
                  <h4 className="font-semibold text-sm">Access Restricted</h4>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    You are currently authenticated as a <strong>Student</strong>. Access to the Training & Placement Cell coordinator portal (<code>/{restrictedNotice}</code>) is restricted.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRestrictedNotice(null)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
                title="Dismiss"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          )}

          {/* Greeting Section */}
          <section className="mb-8 pb-4 border-b border-surface-variant flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3">
            <div>
              <h1 className="font-headline text-2xl sm:text-3xl text-primary font-semibold">
                Good morning, {user.name.split(' ')[0]}
              </h1>
              <p className="font-body text-sm text-on-surface-variant mt-1 h-5 flex items-center">
                {loading ? (
                  <span className="animate-pulse bg-surface-variant h-4 w-48 rounded inline-block"></span>
                ) : latestAnalysis?.dream_role ? (
                  `Targeting: ${latestAnalysis.dream_role}`
                ) : (
                  'No target role set.'
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low text-primary font-mono text-xs border border-surface-variant">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Placement Cycle 2025–26
              </span>
            </div>
          </section>

          {/* 12-Column Asymmetric Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10 items-stretch">
            {/* Active Placement Sprint (8 Columns) */}
            <div className="lg:col-span-8 bg-surface-container-low border border-outline-variant rounded-xl p-6 sm:p-8 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between gap-4 mb-3 h-5">
                  <span className="font-mono text-xs tracking-wider uppercase text-secondary font-semibold">
                    MY PROGRESS CARD
                  </span>
                  {loading ? (
                    <span className="animate-pulse bg-surface-variant h-4 w-24 rounded inline-block"></span>
                  ) : (
                    <span className="font-mono text-xs text-on-surface-variant flex items-center gap-1">
                      <Timer className="w-4 h-4" />
                      {roadmapProgress.completed} of {roadmapProgress.total} Tasks Done
                    </span>
                  )}
                </div>

                <h2 className="font-headline text-xl sm:text-2xl text-primary font-semibold tracking-tight">
                  Continue your roadmap
                </h2>
                
                {/* Progress Bar */}
                <div className="bg-surface rounded-lg p-4 mb-5 border border-outline-variant mt-4">
                  {loading ? (
                    <div className="animate-pulse space-y-3">
                      <div className="h-3 bg-surface-variant rounded w-full"></div>
                      <div className="h-3 bg-surface-variant rounded w-2/3"></div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-xs font-mono mb-2">
                        <span className="text-primary font-medium">{roadmapProgress.completed} tasks completed</span>
                        <span className="text-primary font-semibold">{roadmapProgress.percentage}% complete</span>
                      </div>
                      <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500 ease-out bg-primary" style={{ width: `${roadmapProgress.percentage}%` }}></div>
                      </div>
                    </>
                  )}
                </div>

                {/* Today's Pending Tasks */}
                <div className="bg-surface border border-outline-variant rounded-lg p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-secondary font-semibold">
                      TODAY'S PENDING TASKS
                    </span>
                  </div>
                  {loading ? (
                     <div className="animate-pulse space-y-2">
                       <div className="h-4 bg-surface-variant rounded w-3/4"></div>
                       <div className="h-4 bg-surface-variant rounded w-1/2"></div>
                     </div>
                  ) : pendingTasks.length > 0 ? (
                    <ul className="space-y-3">
                      {pendingTasks.map((task: any) => (
                        <li key={task.id} className="flex items-start gap-2">
                          <Circle className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                          <div>
                            <h3 className="font-body text-sm text-primary font-medium">{task.title}</h3>
                            {task.due_date && (
                              <p className="font-mono text-[10px] text-on-surface-variant mt-0.5 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Due: {new Date(task.due_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="font-body text-sm text-on-surface-variant">No pending tasks for today. Great job!</p>
                  )}
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-5 mt-4 border-t border-outline-variant flex flex-wrap items-center justify-between gap-4">
                <Link
                  href="/analyses/default/roadmap"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary font-semibold text-xs hover:bg-primary/90 transition-colors shadow-sm"
                >
                  <span>Open roadmap</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <span className="font-body text-xs text-on-surface-variant flex items-center gap-1.5">
                  <Verified className="w-4 h-4 text-secondary" />
                  Verified syllabus synced with industry panel
                </span>
              </div>
            </div>

            {/* Start New Analysis (4 Columns) */}
            <div className="lg:col-span-4 bg-surface-container-low border border-outline-variant rounded-xl p-6 sm:p-8 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs tracking-wider uppercase text-secondary font-semibold">
                    NEW DIAGNOSIS
                  </span>
                  <FileSearch className="w-5 h-5 text-secondary" />
                </div>
                <h2 className="font-headline text-lg sm:text-xl text-primary font-semibold mb-2">
                  Start a new analysis
                </h2>
                <p className="font-body text-xs text-on-surface-variant leading-relaxed mb-6">
                  Upload an updated resume or target a new placement drive to recalculate your preparation roadmap.
                </p>

                {/* Upload Callout Box */}
                <div className="border border-dashed border-outline-variant rounded-lg p-5 flex flex-col items-center justify-center text-center bg-surface mb-6">
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center mb-2.5 text-primary">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-xs text-on-surface">Select JD or Resume</span>
                  <span className="font-mono text-[10px] text-on-surface-variant mt-1">Supports PDF, DOCX up to 5MB</span>
                </div>
              </div>

              <Link
                href="/analyses/new"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-primary text-primary hover:bg-primary hover:text-on-primary font-semibold text-xs transition-colors shadow-xs"
              >
                <Upload className="w-4 h-4" />
                <span>Upload a resume</span>
              </Link>
            </div>
          </section>

          {/* Latest Analysis & Upcoming Drives Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Latest Analysis Summary */}
            <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6 shadow-sm">
              <h2 className="font-headline text-lg text-primary font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-secondary" />
                Latest Analysis Summary
              </h2>
              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-surface-variant rounded w-1/3"></div>
                  <div className="h-4 bg-surface-variant rounded w-full"></div>
                  <div className="h-4 bg-surface-variant rounded w-5/6"></div>
                </div>
              ) : latestAnalysis ? (
                <div>
                  <div className="mb-4">
                    <span className="font-mono text-xs text-secondary uppercase tracking-wider block mb-1">Target Role</span>
                    <p className="font-body text-base text-primary font-medium">{latestAnalysis.dream_role || 'Not specified'}</p>
                  </div>
                  <div className="mb-4">
                    <span className="font-mono text-xs text-secondary uppercase tracking-wider block mb-1">Readiness Score</span>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-headline font-semibold text-primary">{latestAnalysis.readiness_score || 0}%</div>
                      <div className="w-full max-w-[150px] bg-surface-container-high h-2 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${latestAnalysis.readiness_score || 0}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className="font-mono text-xs text-secondary uppercase tracking-wider block mb-1">Summary</span>
                    <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                      {latestAnalysis.summary_sentence || 'No summary available for this analysis.'}
                    </p>
                  </div>
                  <div className="mt-5">
                    <Link href={`/analyses/${latestAnalysis.id}`} className="inline-flex items-center text-xs font-semibold text-primary hover:underline">
                      View full diagnostic <ArrowRight className="w-3 h-3 ml-1" />
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant font-body py-4">No analyses found. Start one to see your readiness score.</p>
              )}
            </div>

            {/* Upcoming Placement Drives */}
            <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col">
              <h2 className="font-headline text-lg text-primary font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-secondary" />
                Upcoming Placement Drives
              </h2>
              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-16 bg-surface-variant rounded-lg w-full"></div>
                  <div className="h-16 bg-surface-variant rounded-lg w-full"></div>
                </div>
              ) : upcomingDrives.length > 0 ? (
                <div className="space-y-4 overflow-y-auto pr-2 flex-1">
                  {upcomingDrives.map((drive) => (
                    <div key={drive.id} className="bg-surface p-4 rounded-lg border border-outline-variant">
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <div>
                          <h3 className="font-body font-semibold text-primary text-sm">{drive.company_name}</h3>
                          <p className="font-body text-xs text-on-surface-variant mt-0.5">{drive.role_title}</p>
                        </div>
                        <span className="px-2 py-1 rounded bg-surface-container-high text-primary font-mono text-[10px] font-semibold whitespace-nowrap">
                          {drive.ctc_range || 'CTC TBA'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-3 text-[10px] font-mono text-on-surface-variant">
                        <div>
                          <span className="text-secondary block mb-0.5 uppercase tracking-wider">Drive Date</span>
                          {drive.drive_date ? new Date(drive.drive_date).toLocaleDateString() : 'TBA'}
                        </div>
                        <div>
                          <span className="text-secondary block mb-0.5 uppercase tracking-wider">Deadline</span>
                          {drive.deadline ? new Date(drive.deadline).toLocaleDateString() : 'TBA'}
                        </div>
                        <div className="col-span-2 mt-1">
                          <span className="text-secondary block mb-0.5 uppercase tracking-wider">Eligibility</span>
                          {drive.eligibility_cgpa ? `${drive.eligibility_cgpa} CGPA` : 'Open'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-8 flex-1">
                  <Calendar className="w-8 h-8 text-on-surface-variant mb-2 opacity-20" />
                  <p className="text-sm text-on-surface-variant font-body">No upcoming placement drives at the moment.</p>
                </div>
              )}
            </div>

          </section>
        </div>
      </main>

      <MobileTabBar role="student" />
    </div>
  );
}
