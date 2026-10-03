'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import TopNav from '@/components/layout/TopNav';
import MobileTabBar from '@/components/layout/MobileTabBar';
import { createClient } from '@/lib/supabase/client';
import { getSession } from '@/lib/auth';

interface ChatMessage {
  id: string;
  sender: 'mentor' | 'student' | 'system';
  sender_name: string;
  created_at: string;
  message_text: string;
  action_card_json?: {
    title: string;
    description: string;
    linkHref: string;
    linkText: string;
  };
}

const DEFAULT_WELCOME: ChatMessage = {
  id: 'msg_welcome',
  sender: 'mentor',
  sender_name: 'Training & Placement Cell',
  created_at: new Date().toISOString(),
  message_text: 'Welcome to the faculty mentor consultation channel. Send a message describing your query, and your assigned department placement mentor will respond directly.',
};

const SUGGESTED_PROMPTS = [
  'I need guidance on my roadmap priorities.',
  'Can you clarify my skill gap assessment?',
  'What should I prepare first for the upcoming campus drive?',
];

export default function MentorPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const rawAnalysisId = (params?.id as string) || 'default';
  const isFacultyViewParam = searchParams.get('view') === 'faculty';

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

  // Faculty mode is explicitly enabled by ?view=faculty or when user has switched to coordinator view
  const isFacultyMode = isFacultyViewParam || (cookieRole === 'coordinator');

  const [analysisId, setAnalysisId] = useState<string>(rawAnalysisId);
  const [studentInfo, setStudentInfo] = useState<{ name: string; branch: string; roll: string } | null>(null);
  const [mentorName, setMentorName] = useState<string>('Dr. Sunita Rao');
  const [mentorDept, setMentorDept] = useState<string>('Computer Science & Engineering');
  const [messages, setMessages] = useState<ChatMessage[]>([DEFAULT_WELCOME]);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const [chatStatus, setChatStatus] = useState<'open' | 'waiting_for_mentor'>('open');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Resolve effective analysis ID if visiting 'default' as a logged-in student
  useEffect(() => {
    async function resolveAnalysis() {
      if ((rawAnalysisId === 'default' || !rawAnalysisId) && session?.id && !isFacultyMode) {
        try {
          const { data } = await supabase
            .from('analyses')
            .select('id')
            .eq('user_id', session.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (data?.id) {
            setAnalysisId(data.id);
            return;
          }
        } catch {
          // Keep default
        }
      }
      setAnalysisId(rawAnalysisId);
    }
    resolveAnalysis();
  }, [rawAnalysisId, session?.id, isFacultyMode, supabase]);

  // Load student & assigned faculty details
  useEffect(() => {
    async function loadMetadata() {
      try {
        const { data: analysis } = await supabase
          .from('analyses')
          .select('user_id, dream_role')
          .eq('id', analysisId)
          .single();

        if (analysis?.user_id) {
          const [profileRes, assignRes] = await Promise.all([
            supabase.from('profiles').select('name, branch, roll_number').eq('id', analysis.user_id).single(),
            supabase.from('mentor_assignments').select('mentor_id').eq('student_id', analysis.user_id).single(),
          ]);

          if (profileRes.data) {
            setStudentInfo({
              name: profileRes.data.name || 'Candidate',
              branch: profileRes.data.branch || 'Engineering',
              roll: profileRes.data.roll_number || '4NI21CS001',
            });
          }

          const mentorId = assignRes.data?.mentor_id || 'fac_cs_02';
          const { data: mentorProfile } = await supabase
            .from('profiles')
            .select('name, branch, role')
            .eq('id', mentorId)
            .single();

          if (mentorProfile) {
            setMentorName(mentorProfile.name || 'Dr. Sunita Rao');
            setMentorDept(mentorProfile.branch || 'Placement Mentor');
          }
        }
      } catch (e) {
        console.warn('Metadata load notice:', e);
      }
    }
    if (analysisId) loadMetadata();
  }, [analysisId, supabase]);

  // Fetch messages from API with student user ID for cross-thread consolidation
  const fetchMessages = useCallback(async () => {
    try {
      const userIdParam = session?.id ? `&userId=${session.id}` : '';
      const res = await fetch(`/api/mentor/messages?analysisId=${analysisId}${userIdParam}`);
      const data = await res.json();
      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages);
      }
      if (data.chatStatus) {
        setChatStatus(data.chatStatus);
      }
    } catch (e) {
      console.warn('Could not fetch messages:', e);
    }
  }, [analysisId, session?.id]);

  useEffect(() => {
    fetchMessages();

    // 1. Supabase Realtime channel subscription for instant two-way messaging
    const channel = supabase
      .channel(`mentor_chat_realtime_${analysisId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mentor_messages',
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    // 2. Fallback polling every 3.5 seconds to guarantee synchronization
    const interval = setInterval(fetchMessages, 3500);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [analysisId, fetchMessages, supabase]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue.trim();
    if (!text || sending) return;

    setSending(true);
    if (!textToSend) setInputValue('');

    const senderType = isFacultyMode ? 'mentor' : 'student';
    const senderName = isFacultyMode
      ? (session?.name || mentorName || 'Faculty Mentor')
      : (session?.name || 'Student Candidate');

    const optimisticId = 'msg_opt_' + Date.now();
    const optimisticMsg: ChatMessage = {
      id: optimisticId,
      sender: senderType,
      sender_name: senderName,
      created_at: new Date().toISOString(),
      message_text: text,
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await fetch('/api/mentor/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisId,
          userId: session?.id || (isFacultyMode ? 'fac_cs_02' : 'student_user'),
          sender: senderType,
          senderName: senderName,
          messageText: text,
        }),
      });

      const data = await res.json();

      if (data.chatStatus) {
        setChatStatus(data.chatStatus);
      }

      // If faculty replied, chat is unlocked
      if (isFacultyMode) {
        setChatStatus('open');
      }

      setTimeout(fetchMessages, 400);
    } catch (err) {
      console.error('Network error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex flex-col pb-20 md:pb-12">
      <TopNav />

      <main className="flex-1 w-full pt-16 bg-surface flex flex-col">
        {/* Faculty Mode Context Banner */}
        {isFacultyMode && (
          <div className="bg-primary text-on-primary px-4 sm:px-8 py-2.5 flex items-center justify-between text-xs font-mono shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E8F0EA] animate-pulse"></span>
              <span className="font-semibold uppercase tracking-wider">Faculty Consultation Console</span>
              <span>•</span>
              <span>Reviewing candidate: {studentInfo?.name || 'Candidate'} ({studentInfo?.branch || 'Department'})</span>
            </div>
            <Link
              href="/mentor"
              className="px-2.5 py-1 rounded bg-on-primary/10 hover:bg-on-primary/20 text-on-primary font-semibold flex items-center gap-1 transition-colors"
            >
              <span>← Back to Mentor Console</span>
            </Link>
          </div>
        )}

        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col">
          {/* Breadcrumb & Header */}
          <div className="mb-4">
            <nav className="flex items-center gap-2 text-xs font-mono text-on-surface-variant mb-2">
              {isFacultyMode ? (
                <>
                  <Link href="/mentor" className="hover:text-primary transition-colors">
                    Faculty Console
                  </Link>
                  <span>/</span>
                  <Link href={`/analyses/${analysisId}?view=faculty`} className="hover:text-primary transition-colors">
                    Mentee Appraisal
                  </Link>
                  <span>/</span>
                  <span className="text-primary font-semibold">Active Consultation</span>
                </>
              ) : (
                <>
                  <Link href={`/analyses/${analysisId}`} className="hover:text-primary transition-colors">
                    Skill Map
                  </Link>
                  <span>/</span>
                  <span className="text-primary font-semibold">Faculty Mentor Consultation</span>
                </>
              )}
            </nav>

            <div className="flex items-center justify-between pb-3 border-b border-surface-variant">
              <div>
                <h1 className="font-headline text-xl sm:text-2xl text-primary font-semibold">
                  {isFacultyMode
                    ? `Mentorship Consultation with ${studentInfo?.name || 'Candidate'}`
                    : 'Assigned Faculty Mentor Guidance'}
                </h1>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {isFacultyMode
                    ? `Direct verified intervention channel for candidate ${studentInfo?.roll || ''} · ${studentInfo?.branch || ''}`
                    : 'Direct consultation with your verified campus placement advisor.'}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-[#4F7A5A] animate-pulse"></span>
                <span className="text-on-surface-variant hidden sm:inline">
                  {isFacultyMode ? 'Logged in as:' : 'Advisor Active:'}
                </span>
                <span className="text-primary font-semibold">
                  {isFacultyMode ? (session?.name || 'Faculty Mentor') : mentorName}
                </span>
              </div>
            </div>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 bg-surface-container-lowest border border-surface-variant rounded-2xl p-4 sm:p-6 mb-4 overflow-y-auto min-h-[350px] max-h-[550px] space-y-4 shadow-xs">
            {messages.map((msg) => {
              const isStudent = msg.sender === 'student';
              const isSystem = msg.sender === 'system';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    isFacultyMode
                      ? isStudent ? 'items-start' : isSystem ? 'items-center' : 'items-end'
                      : isStudent ? 'items-end' : isSystem ? 'items-center' : 'items-start'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className={`text-[11px] font-mono ${isSystem ? 'text-secondary font-semibold' : 'text-on-surface-variant'}`}>
                      {msg.sender_name}
                      {msg.sender === 'mentor' && ' (Placement Mentor)'}
                    </span>
                    <span className="text-[10px] font-mono text-outline">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                      isSystem
                        ? 'bg-secondary/10 text-on-surface border border-secondary/30 rounded-xl text-center italic text-xs'
                        : isFacultyMode
                          ? isStudent
                            ? 'bg-surface-container-low text-on-surface border border-surface-variant rounded-tl-none'
                            : 'bg-primary text-on-primary rounded-tr-none'
                          : isStudent
                            ? 'bg-primary text-on-primary rounded-tr-none'
                            : 'bg-surface-container-low text-on-surface border border-surface-variant rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.message_text}</p>

                    {msg.action_card_json && (
                      <div className="mt-3 p-3 rounded-xl bg-surface-container-lowest border border-surface-variant text-on-surface">
                        <p className="font-headline font-semibold text-xs text-primary mb-1">
                          {msg.action_card_json.title}
                        </p>
                        <p className="text-[11px] text-on-surface-variant mb-2">
                          {msg.action_card_json.description}
                        </p>
                        <Link
                          href={msg.action_card_json.linkHref}
                          className="font-mono text-[11px] text-secondary font-semibold hover:underline inline-flex items-center gap-1"
                        >
                          <span>{msg.action_card_json.linkText}</span>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Waiting for Mentor Indicator (Visible only to students when actively waiting) */}
            {!isFacultyMode && chatStatus === 'waiting_for_mentor' && (
              <div className="flex flex-col items-start">
                <div className="max-w-[80%] rounded-2xl p-4 bg-surface-container-high border border-outline-variant/30 rounded-tl-none">
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                    <span className="font-mono font-semibold">Waiting for faculty mentor to join...</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-1">
                    Your consultation query has been logged. Messaging will resume once your mentor replies.
                  </p>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Quick Prompts (Visible to students when chat is open) */}
          {!isFacultyMode && chatStatus !== 'waiting_for_mentor' && (
            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-2 no-scrollbar">
              <span className="text-[10px] font-mono uppercase text-outline shrink-0">
                Prompt Mentor:
              </span>
              {SUGGESTED_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={sending}
                  className="px-3 py-1.5 rounded-full border border-surface-variant bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-body transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Status Banner when awaiting initial mentor response */}
          {!isFacultyMode && chatStatus === 'waiting_for_mentor' && (
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-container-high border border-secondary/30 text-on-surface-variant mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse shrink-0"></span>
              <p className="text-xs font-body">
                Initial query logged. Your assigned faculty mentor will join shortly. You can add additional questions or project details below.
              </p>
            </div>
          )}

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder={
                isFacultyMode
                  ? `Reply as ${session?.name || mentorName} (Placement Faculty)...`
                  : 'Ask your mentor about specific skill gaps, project architectures, or campus rounds...'
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-surface-variant bg-surface-container-low text-on-surface placeholder:text-outline text-xs sm:text-sm focus:outline-none focus:border-primary font-body"
            />
            <button
              type="submit"
              disabled={sending || !inputValue.trim()}
              className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-all shadow-sm disabled:opacity-50 flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              {sending && <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>}
              <span>{isFacultyMode ? 'Send Reply' : 'Send Message'}</span>
              <span className="material-symbols-outlined text-[16px]">send</span>
            </button>
          </form>
        </div>
      </main>

      <MobileTabBar role={isFacultyMode ? 'coordinator' : 'student'} />
    </div>
  );
}
