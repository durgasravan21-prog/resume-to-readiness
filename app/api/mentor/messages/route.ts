import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function getSupabase() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yslupcclthqltvvwjvjr.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzbHVwY2NsdGhxbHR2dndqdmpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MjA0MzYsImV4cCI6MjA5ODk5NjQzNn0.XN9oa1bOtXf0ZsqViLDk5OB_xVT-wFh7GPDEFzzgtPU';

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    db: { schema: 'readiness' },
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
    const { data: messages, error } = await supabase
      .from('mentor_messages')
      .select('*')
      .eq('analysis_id', analysisId)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Could not fetch mentor messages:', error);
      return NextResponse.json({ messages: [] });
    }

    return NextResponse.json({ messages: messages || [] });
  } catch (err: any) {
    return NextResponse.json({ messages: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { analysisId, userId, sender, senderName, messageText, actionCard } = body;

    if (!analysisId || !messageText) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const supabase = await getSupabase();
    const id = 'msg_' + Math.random().toString(36).substring(2, 9);

    const messageRecord = {
      id,
      analysis_id: analysisId,
      user_id: userId || 'usr_aarav_01',
      sender: sender || 'student',
      sender_name: senderName || (sender === 'mentor' ? 'Prof. Ravi Sharma' : 'Student Candidate'),
      message_text: messageText.trim(),
      action_card_json: actionCard || null,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('mentor_messages')
      .insert(messageRecord)
      .select()
      .single();

    if (error) {
      console.error('Error inserting message:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If sent by student, send an automated acknowledgment if this is a new inquiry
    if (sender === 'student') {
      const ackId = 'msg_ack_' + Math.random().toString(36).substring(2, 9);
      const ackMessage = {
        id: ackId,
        analysis_id: analysisId,
        user_id: 'usr_coord_01',
        sender: 'mentor',
        sender_name: 'Prof. Ravi Sharma (TPC Mentor)',
        message_text: 'Your query has been recorded and forwarded to your assigned mentor. Prof. Ravi Sharma will connect with you to review your roadmap milestones.',
        created_at: new Date(Date.now() + 1000).toISOString(),
      };

      await supabase.from('mentor_messages').insert(ackMessage);
    }

    return NextResponse.json({ success: true, message: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
