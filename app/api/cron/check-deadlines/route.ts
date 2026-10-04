import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function getSupabase() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yslupcclthqltvvwjvjr.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzbHVwY2NsdGhxbHR2dndqdmpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MjA0MzYsImV4cCI6MjA5ODk5NjQzNn0.XN9oa1bOtXf0ZsqViLDk5OB_xVT-wFh7GPDEFzzgtPU';

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // In production enforce CRON_SECRET, in development allow manual trigger
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const supabase = await getSupabase();
    const now = new Date().toISOString();

    // Find overdue tasks
    const { data: overdueTasks } = await supabase
      .from('roadmap_tasks')
      .select('id, analysis_id, title, due_date, analyses(user_id)')
      .lt('due_date', now)
      .eq('is_completed', false);

    let flaggedCount = 0;

    if (overdueTasks && overdueTasks.length > 0) {
      for (const task of overdueTasks) {
        const studentId = (task as any).analyses?.user_id;
        if (!studentId) continue;

        // Check if flag already issued for this task
        const { data: existingFlag } = await supabase
          .from('flags')
          .select('id')
          .eq('task_id', task.id)
          .is('voided_at', null)
          .maybeSingle();

        if (!existingFlag) {
          // Issue flag
          const flagId = 'flg_' + Math.random().toString(36).substring(2, 9);
          await supabase.from('flags').insert({
            id: flagId,
            student_id: studentId,
            task_id: task.id,
            reason: `Missed roadmap task deadline: "${task.title}"`,
            issued_at: now,
          });

          // Update program status
          const { data: statusRow } = await supabase
            .from('program_status')
            .select('*')
            .eq('student_id', studentId)
            .maybeSingle();

          const newFlagCount = (statusRow?.flag_count ?? 0) + 1;
          const isTerminated = newFlagCount >= 3;

          await supabase.from('program_status').upsert({
            student_id: studentId,
            status: isTerminated ? 'terminated' : 'at_risk',
            flag_count: newFlagCount,
            chances_used: statusRow?.chances_used ?? 0,
            updated_at: now,
          });

          // Notify student
          await supabase.from('notifications').insert({
            id: 'notif_' + Math.random().toString(36).substring(2, 9),
            user_id: studentId,
            type: isTerminated ? 'PROGRAM_TERMINATED' : 'FLAG_ISSUED',
            title: isTerminated ? 'Placement Program Access Suspended' : 'Roadmap Deadline Warning',
            message: isTerminated
              ? `You have reached 3 program flags due to missed deadlines. Your diagnostic access is suspended. Contact your Placement Coordinator for review.`
              : `A flag has been issued for missing task deadline "${task.title}". Current flags: ${newFlagCount} of 3.`,
            link_url: '/home',
          });

          flaggedCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      processedOverdue: overdueTasks?.length ?? 0,
      newFlagsIssued: flaggedCount,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error checking deadlines' }, { status: 500 });
  }
}
