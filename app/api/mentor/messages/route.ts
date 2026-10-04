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
    const studentUserIdParam = searchParams.get('userId');
    const all = searchParams.get('all');

    const supabase = await getSupabase();

    // If all=true or no specific analysisId, return recent messages for faculty inbox
    if (all === 'true' || !analysisId) {
      const { data: messages, error } = await supabase
        .from('mentor_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json({ messages: [], chatStatus: 'open' });
      }

      return NextResponse.json({ messages: messages || [], chatStatus: 'open' });
    }

    // Determine target student identity & related analysis IDs to unify chat history
    let studentUserId = studentUserIdParam || '';
    const relatedAnalysisIds = [analysisId];

    const { data: currentAnalysis } = await supabase
      .from('analyses')
      .select('user_id')
      .eq('id', analysisId)
      .single();

    if (currentAnalysis?.user_id) {
      studentUserId = currentAnalysis.user_id;
    }

    if (studentUserId) {
      const { data: userAnalyses } = await supabase
        .from('analyses')
        .select('id')
        .eq('user_id', studentUserId);

      if (userAnalyses && userAnalyses.length > 0) {
        userAnalyses.forEach((a: any) => {
          if (!relatedAnalysisIds.includes(a.id)) relatedAnalysisIds.push(a.id);
        });
      }

      // Consolidate legacy / demo threads for Durga
      if (studentUserId === '36ac8503-c1c5-4865-b3f5-51c302a3e1ee') {
        if (!relatedAnalysisIds.includes('ans_7s4yk27')) relatedAnalysisIds.push('ans_7s4yk27');
        if (!relatedAnalysisIds.includes('ans_durga_01')) relatedAnalysisIds.push('ans_durga_01');
        if (!relatedAnalysisIds.includes('default')) relatedAnalysisIds.push('default');
      }
    }

    // Query messages across all relevant threads
    let query = supabase.from('mentor_messages').select('*');
    if (studentUserId) {
      query = query.or(`analysis_id.in.(${relatedAnalysisIds.join(',')}),user_id.eq.${studentUserId}`);
    } else {
      query = query.in('analysis_id', relatedAnalysisIds);
    }

    const { data: messages, error } = await query.order('created_at', { ascending: true });

    if (error) {
      console.warn('Could not fetch mentor messages:', error);
      return NextResponse.json({ messages: [], chatStatus: 'open' });
    }

    const rawMessages = messages || [];
    // Deduplicate by id if returned multiple times via OR filter
    const uniqueMessages = Array.from(new Map(rawMessages.map((m: any) => [m.id, m])).values());

    // Chat is unlocked if any real mentor has replied (ignoring automated wait messages)
    const hasMentorReply = uniqueMessages.some(
      (m: any) => m.sender === 'mentor' && !m.message_text?.includes('Please wait')
    );
    const hasStudentMessage = uniqueMessages.some((m: any) => m.sender === 'student');

    // Only waiting if student initiated and mentor hasn't replied yet
    const chatStatus = (hasStudentMessage && !hasMentorReply) ? 'waiting_for_mentor' : 'open';

    return NextResponse.json({ messages: uniqueMessages, chatStatus });
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

    // Check existing messages in this thread or for this student
    let hasMentorReply = false;
    const { data: existingMessages } = await supabase
      .from('mentor_messages')
      .select('sender, message_text')
      .or(`analysis_id.eq.${analysisId},user_id.eq.${userId || 'none'}`)
      .order('created_at', { ascending: true });

    const msgs = existingMessages || [];
    hasMentorReply = msgs.some(
      (m: any) => m.sender === 'mentor' && !m.message_text?.includes('Please wait')
    );

    const isStudent = sender === 'student' || !sender;

    // Validate effectiveUserId against profiles to satisfy foreign key constraint
    let effectiveUserId = userId || 'usr_student_01';
    const { data: profileCheck } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', effectiveUserId)
      .maybeSingle();

    if (!profileCheck) {
      effectiveUserId = isStudent ? 'usr_student_01' : 'fac_cs_02';
    }

    const id = 'msg_' + Math.random().toString(36).substring(2, 9);

    const messageRecord = {
      id,
      analysis_id: analysisId,
      user_id: effectiveUserId,
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
      .maybeSingle();

    if (error) {
      console.warn('Notice inserting message in DB:', error.message);
    }

    // If sent by student: automatically generate and insert faculty mentor response
    if (isStudent) {
      const lowerText = messageText.toLowerCase();
      let replyText = '';

      if (lowerText.includes('roadmap') || lowerText.includes('priorit')) {
        replyText = "I reviewed your 6-week roadmap. For Tier-1 Product & Services campus drives, focus heavily on Weeks 1 and 2: React state management (Redux Toolkit/Zustand) and resilient API error handling. Don't just watch videos — ensure you build a real project with live Vercel deployment. Reviewers look for deployed URLs and clean Git commit history.";
      } else if (lowerText.includes('gap') || lowerText.includes('rubric') || lowerText.includes('assess')) {
        replyText = "In your diagnostic rubric, competencies marked as 'Needs Proof' mean you listed the skill, but lack quantifiable evidence (like test coverage or a deployed URL). Building a small feature this week with unit tests will convert that gap into 'Strong' before the placement cell finalizes drive eligibility.";
      } else if (lowerText.includes('drive') || lowerText.includes('first') || lowerText.includes('upcoming') || lowerText.includes('prepar')) {
        replyText = "For the upcoming campus recruitment drives: 1) Practice standard DSA (Arrays, Strings, HashMaps, and Trees) daily on LeetCode, 2) Be ready to explain your system architecture in detail during technical round 1, and 3) Review core CS fundamentals (OS, DBMS, Computer Networks). Check the TPC drives tab on your home portal for eligibility cutoffs.";
      } else if (lowerText.includes('resume') || lowerText.includes('project')) {
        replyText = "Format your project bullets using the Google X-Y-Z formula ('Accomplished [X] measured by [Y] by doing [Z]'). Include quantifiable metrics like API latency or test coverage. Drop your updated repository link here once ready for review!";
      } else {
        replyText = `Thank you for reaching out regarding "${messageText.trim()}". As your CSE placement mentor, I recommend breaking this down into concrete tasks on your roadmap. Keep your project repositories public and maintain a steady commit streak. Let me know if you need specific practice problems or a mock interview session!`;
      }

      const replyId = 'msg_reply_' + Math.random().toString(36).substring(2, 9);
      const replyRecord = {
        id: replyId,
        analysis_id: analysisId,
        user_id: 'fac_cs_02',
        sender: 'mentor',
        sender_name: 'Dr. Sunita Rao (Placement Mentor)',
        message_text: replyText,
        created_at: new Date(Date.now() + 1000).toISOString(),
      };

      try {
        await supabase.from('mentor_messages').insert(replyRecord);
      } catch (insertErr) {
        console.warn('Could not insert mentor reply into DB:', insertErr);
      }

      return NextResponse.json({
        success: true,
        message: data || messageRecord,
        reply: replyRecord,
        chatStatus: 'open',
      });
    }

    // If sent by mentor: conversation is fully unlocked
    return NextResponse.json({
      success: true,
      message: data || messageRecord,
      chatStatus: 'open',
    });
  } catch (err: any) {
    console.error('Error in mentor messages route:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
