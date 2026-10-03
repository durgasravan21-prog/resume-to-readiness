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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, grantedBy, reason } = body;

    if (!studentId || !reason?.trim()) {
      return NextResponse.json(
        { error: 'Student ID and justification reason are required.' },
        { status: 400 }
      );
    }

    const supabase = await getSupabase();

    // Check existing program status
    const { data: statusRow } = await supabase
      .from('program_status')
      .select('*')
      .eq('student_id', studentId)
      .single();

    const currentChances = statusRow?.chances_used ?? 0;
    if (currentChances >= 3) {
      return NextResponse.json(
        { error: 'Maximum limit of 3 chances already exhausted for this student.' },
        { status: 400 }
      );
    }

    const grantId = 'ch_' + Math.random().toString(36).substring(2, 9);

    // 1. Record chance grant
    await supabase.from('chance_grants').insert({
      id: grantId,
      student_id: studentId,
      granted_by: grantedBy || 'TPC Coordinator',
      reason: reason.trim(),
    });

    // 2. Void active flags
    await supabase
      .from('flags')
      .update({
        voided_by: grantedBy || 'TPC Coordinator',
        voided_reason: `Reinstated via Chance #${currentChances + 1}: ${reason.trim()}`,
        voided_at: new Date().toISOString(),
      })
      .eq('student_id', studentId)
      .is('voided_at', null);

    // 3. Reset status and increment chances
    await supabase.from('program_status').upsert({
      student_id: studentId,
      status: 'active',
      flag_count: 0,
      chances_used: currentChances + 1,
      updated_at: new Date().toISOString(),
    });

    // 4. Record in audit log
    await supabase.from('audit_log').insert({
      id: 'aud_' + Math.random().toString(36).substring(2, 9),
      action: 'CHANCE_GRANTED',
      target_id: studentId,
      details: {
        chance_number: currentChances + 1,
        reason: reason.trim(),
        granted_by: grantedBy,
      },
    });

    // 5. Notify student
    await supabase.from('notifications').insert({
      id: 'notif_' + Math.random().toString(36).substring(2, 9),
      user_id: studentId,
      type: 'CHANCE_GRANTED',
      title: 'Program Reinstatement Granted',
      message: `Your placement program access has been restored (Chance ${currentChances + 1} of 3). Reason: ${reason.trim()}`,
      link_url: '/home',
    });

    return NextResponse.json({
      success: true,
      chancesUsed: currentChances + 1,
      message: `Chance #${currentChances + 1} successfully granted. Flags reset to 0.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
