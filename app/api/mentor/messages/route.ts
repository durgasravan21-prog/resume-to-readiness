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
      return NextResponse.json({ messages: [], chatStatus: 'open' });
    }

    // Determine chat status: if only student messages exist and no mentor reply, status is 'waiting'
    const allMessages = messages || [];
    const hasMentorReply = allMessages.some(
      (m: any) => m.sender === 'mentor' && !m.message_text?.includes('Please wait')
    );
    const hasStudentMessage = allMessages.some((m: any) => m.sender === 'student');
    const chatStatus = hasStudentMessage && !hasMentorReply ? 'waiting_for_mentor' : 'open';

    return NextResponse.json({ messages: allMessages, chatStatus });
  } catch (err: any) {
    return NextResponse.json({ messages: [], chatStatus: 'open' });
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

    // If student is sending and chat is in waiting state, block further student messages
    if (sender === 'student' || !sender) {
      const { data: existingMessages } = await supabase
        .from('mentor_messages')
        .select('sender, message_text')
        .eq('analysis_id', analysisId)
        .order('created_at', { ascending: true });

      const msgs = existingMessages || [];
      const hasStudentMessage = msgs.some((m: any) => m.sender === 'student');
      const hasMentorReply = msgs.some(
        (m: any) => m.sender === 'mentor' && !m.message_text?.includes('Please wait')
      );

      // If student already sent a message and mentor hasn't replied yet, block
      if (hasStudentMessage && !hasMentorReply) {
        return NextResponse.json({
          error: 'Please wait for your mentor to respond before sending another message.',
          chatStatus: 'waiting_for_mentor',
        }, { status: 429 });
      }
    }

    const id = 'msg_' + Math.random().toString(36).substring(2, 9);

    const messageRecord = {
      id,
      analysis_id: analysisId,
      user_id: userId || 'anonymous',
      sender: sender || 'student',
      sender_name: senderName || (sender === 'mentor' ? 'Faculty Mentor' : 'Student Candidate'),
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

    // If sent by student, send the automated "please wait" acknowledgment
    if (sender === 'student' || !sender) {
      const ackId = 'msg_sys_' + Math.random().toString(36).substring(2, 9);
      const ackMessage = {
        id: ackId,
        analysis_id: analysisId,
        user_id: 'system',
        sender: 'system',
        sender_name: 'Readiness Platform',
        message_text: 'Please wait, the faculty mentor will join shortly. Your message has been forwarded to the Training & Placement Cell. You will be notified when the mentor responds.',
        created_at: new Date(Date.now() + 500).toISOString(),
      };

      await supabase.from('mentor_messages').insert(ackMessage);

      return NextResponse.json({
        success: true,
        message: data,
        chatStatus: 'waiting_for_mentor',
      });
    }

    // If sent by mentor, the chat is now open for two-way conversation
    return NextResponse.json({
      success: true,
      message: data,
      chatStatus: 'open',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
