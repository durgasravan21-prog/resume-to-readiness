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
    const { searchParams } = new URL(request.url);
    const analysisId = searchParams.get('analysisId');

    if (!analysisId) {
      return NextResponse.json({ error: 'Missing analysisId parameter.' }, { status: 400 });
    }

    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from('roadmap_tasks')
      .select('*')
      .eq('analysis_id', analysisId)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ tasks: [], error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tasks: data || [] });
  } catch (err: any) {
    return NextResponse.json({ tasks: [], error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      analysisId,
      title,
      description,
      priority = 'High',
      hoursEstimate = '4 hours',
      evidenceOutcome,
      suggestedByMentor = true,
    } = body;

    if (!analysisId || !title) {
      return NextResponse.json({ error: 'Missing analysisId or title.' }, { status: 400 });
    }

    const supabase = await getSupabase();
    const taskId = 'task_mentor_' + Math.random().toString(36).substring(2, 9);

    const taskRecord = {
      id: taskId,
      analysis_id: analysisId,
      title: title.trim(),
      description: (description || '').trim(),
      priority,
      hours_estimate: hoursEstimate,
      evidence_outcome: (evidenceOutcome || '').trim(),
      is_completed: false,
      suggested_by_mentor: suggestedByMentor,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('roadmap_tasks')
      .insert(taskRecord)
      .select()
      .single();

    if (error) {
      console.error('Error creating roadmap task:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, task: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error creating task.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, title, description, isCompleted, suggestedByMentor, hoursEstimate } = body;

    if (!taskId) {
      return NextResponse.json({ error: 'Missing taskId.' }, { status: 400 });
    }

    const supabase = await getSupabase();
    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    const isDone = isCompleted !== undefined ? isCompleted : body.is_completed;
    if (isDone !== undefined) updateData.is_completed = Boolean(isDone);

    const { data, error } = await supabase
      .from('roadmap_tasks')
      .update(updateData)
      .eq('id', taskId)
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const taskResult = data || {
      id: taskId,
      ...updateData,
      title: title || 'Roadmap Task',
    };

    return NextResponse.json({ success: true, task: taskResult });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error updating task.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json({ error: 'Missing taskId.' }, { status: 400 });
    }

    const supabase = await getSupabase();
    const { error } = await supabase
      .from('roadmap_tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error deleting task.' }, { status: 500 });
  }
}
