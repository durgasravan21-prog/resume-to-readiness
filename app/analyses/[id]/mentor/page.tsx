'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import TopNav from '@/components/layout/TopNav';
import MobileTabBar from '@/components/layout/MobileTabBar';
import { createClient } from '@/lib/supabase/client';
import { getSession } from '@/lib/auth';

interface ChatMessage {
  id: string;
  sender: 'mentor' | 'student';
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
  sender_name: 'Prof. Ravi Sharma (TPC Mentor)',
  created_at: new Date().toISOString(),
  message_text: 'Hello. I have reviewed your parsed diagnostic ledger against the campus placement benchmark. Your foundational component architecture is solid, but state management and automated test proofs require demonstration. What questions do you have regarding your preparation plan?',
};

const SUGGESTED_PROMPTS = [
  'Why is React state management rated Needs stronger proof?',
  'What should I build first to clear this gap?',
  'How do I explain my state choices in a round 2 interview?',
];

export default function MentorPage() {
  const params = useParams();
  const analysisId = (params?.id as string) || 'default';
  const supabase = createClient();
  const session = getSession();

  const [messages, setMessages] = useState<ChatMessage[]>([DEFAULT_WELCOME]);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Fetch initial messages from API
  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/mentor/messages?analysisId=${analysisId}`);
      const data = await res.json();
      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages);
      }
    } catch (e) {
      console.warn('Could not fetch messages:', e);
    }
  };

  useEffect(() => {
    fetchMessages();

    // Supabase Realtime channel subscription
    const channel = supabase
      .channel(`mentor_chat_${analysisId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'readiness',
          table: 'mentor_messages',
          filter: `analysis_id=eq.${analysisId}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [analysisId]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue.trim();
    if (!text || sending) return;

    setSending(true);
    if (!textToSend) setInputValue('');

    const optimisticId = 'msg_opt_' + Date.now();
    const optimisticMsg: ChatMessage = {
      id: optimisticId,
      sender: 'student',
      sender_name: session?.name || 'Aarav Sundaram',
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
          userId: session?.id || 'usr_aarav_01',
          sender: 'student',
          senderName: session?.name || 'Aarav Sundaram',
          messageText: text,
        }),
      });

      if (!res.ok) {
        console.error('Failed to post message to backend');
      } else {
        // Refresh to pick up auto-acknowledgment
        setTimeout(fetchMessages, 1200);
      }
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
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col">
          {/* Breadcrumb & Header */}
          <div className="mb-4">
            <nav className="flex items-center gap-2 text-xs font-mono text-on-surface-variant mb-2">
              <Link href={`/analyses/${analysisId}`} className="hover:text-primary transition-colors">
                Skill Map
              </Link>
              <span>/</span>
              <span className="text-primary font-semibold">Human Mentor Consultation</span>
            </nav>

            <div className="flex items-center justify-between pb-3 border-b border-surface-variant">
              <div>
                <h1 className="font-headline text-xl sm:text-2xl text-primary font-semibold">
                  Assigned Faculty Mentor Guidance
                </h1>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Direct consultation with verified campus placement advisors.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-[#4F7A5A] animate-pulse"></span>
                <span className="text-on-surface-variant hidden sm:inline">Advisor Active:</span>
                <span className="text-primary font-semibold">Prof. Ravi Sharma</span>
              </div>
            </div>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 bg-surface-container-lowest border border-surface-variant rounded-2xl p-4 sm:p-6 mb-4 overflow-y-auto min-h-[350px] max-h-[550px] space-y-4 shadow-xs">
            {messages.map((msg) => {
              const isStudent = msg.sender === 'student';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isStudent ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[11px] font-mono text-on-surface-variant">
                      {msg.sender_name}
                    </span>
                    <span className="text-[10px] font-mono text-outline">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                      isStudent
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
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Discussion Starters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-2 no-scrollbar">
            <span className="text-[10px] font-mono uppercase text-outline shrink-0">
              Prompt Mentor:
            </span>
            {SUGGESTED_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={sending}
                className="px-3 py-1.5 rounded-full border border-surface-variant bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-body transition-colors shrink-0 disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input Field */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="Ask your mentor about specific skill gaps, project architectures, or campus rounds..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-surface-variant bg-surface-container-low text-on-surface placeholder:text-outline text-xs sm:text-sm focus:outline-none focus:border-primary font-body"
            />
            <button
              type="submit"
              disabled={sending || !inputValue.trim()}
              className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-all shadow-sm disabled:opacity-50 flex items-center gap-1.5 shrink-0"
            >
              {sending && <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>}
              <span>Send Message</span>
              <span className="material-symbols-outlined text-[16px]">send</span>
            </button>
          </form>
        </div>
      </main>

      <MobileTabBar role="student" />
    </div>
  );
}
