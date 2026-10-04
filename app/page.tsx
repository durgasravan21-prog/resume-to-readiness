'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { saveSession, DEFAULT_STUDENT, DEFAULT_COORDINATOR } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';
import {
  BookOpen,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export default function WelcomePage() {
  const router = useRouter();
  const supabase = createClient();

  // Auth flow states
  const [authStep, setAuthStep] = useState<'input' | 'sent'>('input');
  const [authMode, setAuthMode] = useState<'otp' | 'link'>('otp');
  const [emailInput, setEmailInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Google OAuth Handler
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMessage(err.message || 'Google authentication failed. Please try email sign in.');
      setLoading(false);
    }
  };

  // Send Email Sign-in Link / OTP Handler
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid institutional email address.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '';
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) throw error;

      setAuthStep('sent');
      setCountdown(60);
      setInfoMessage(`A sign-in link has been sent to ${cleanEmail}. Click the link in your email to proceed.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not send verification email. Please check your email or use demo bypass.');
    } finally {
      setLoading(false);
    }
  };

  // Verify Email OTP Handler
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanToken = otpInput.trim();
    const cleanEmail = emailInput.trim().toLowerCase();

    if (!cleanEmail) {
      setErrorMessage('Please enter your institutional email address.');
      return;
    }
    if (cleanToken.length !== 6) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          token: cleanToken,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Verification failed. Please check your credentials and retry.');
      }

      if (data.user) {
        saveSession({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          onboardingCompleted: true,
        });
      }

      router.push(data.redirectTo || (data.user?.role === 'coordinator' ? '/tpc' : '/home'));
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid or expired code. Please verify and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Demo bypass helpers
  const handleDemoSignIn = (role: 'student' | 'coordinator' | 'mentor' | 'admin' | 'new_student' | 'durga') => {
    setLoading(true);
    if (role === 'durga') {
      saveSession({
        id: '36ac8503-c1c5-4865-b3f5-51c302a3e1ee',
        name: 'Durga sravan Challagolla',
        email: 'durgasravan21@gmail.com',
        role: 'student',
        rollNumber: '2021BCS0101',
        degree: 'B.Tech',
        branch: 'Computer Science & Engineering',
        graduationYear: '2025',
        cgpa: '8.92',
        collegeName: 'National Institute of Engineering',
      });
      router.push('/home');
    } else if (role === 'coordinator') {
      saveSession(DEFAULT_COORDINATOR);
      router.push('/tpc');
    } else if (role === 'mentor') {
      saveSession({
        id: 'usr_mentor_01',
        name: 'Dr. Priya Sharma',
        email: 'priya.sharma@nie.ac.in',
        role: 'coordinator' as any,
        collegeName: 'National Institute of Engineering',
      });
      router.push('/mentor');
    } else if (role === 'admin') {
      saveSession({
        id: 'usr_admin_01',
        name: 'Placement Dean Office',
        email: 'admin@nie.ac.in',
        role: 'coordinator' as any,
        collegeName: 'National Institute of Engineering',
      });
      router.push('/admin');
    } else if (role === 'new_student') {
      saveSession({
        ...DEFAULT_STUDENT,
        id: 'usr_new_student_' + Date.now(),
        email: 'new.student@nie.ac.in',
      });
      router.push('/onboarding');
    } else {
      saveSession(DEFAULT_STUDENT);
      router.push('/home');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between antialiased selection:bg-primary-container selection:text-on-primary">
      {/* Editorial Top Bar */}
      <header className="px-6 lg:px-12 py-4 flex items-center justify-between border-b border-surface-container-highest bg-surface/90 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-display font-bold text-base shadow-xs">
            R
          </div>
          <span className="font-headline font-semibold text-lg text-primary tracking-tight">
            Readiness
          </span>
          <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-surface-container-high text-on-surface-variant border border-outline-variant/30">
            Institutional Diagnostic
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-on-surface-variant">
          <Link
            href="/login"
            className="px-2.5 py-1 text-on-surface hover:text-primary font-medium transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-3 py-1 rounded-md bg-primary text-on-primary font-semibold hover:bg-primary/90 transition-colors"
          >
            Register
          </Link>
          <button
            onClick={() => handleDemoSignIn('coordinator')}
            className="text-primary hover:underline font-semibold flex items-center gap-1 ml-1"
          >
            <span>Coordinator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main 2-Column Split Hero */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-12 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
        {/* Left Column: Editorial Value Proposition & Auth Card */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <div className="max-w-xl">
            <span className="font-mono text-xs uppercase tracking-wider text-secondary font-semibold">
              Diagnostic & Placement Architecture
            </span>

            <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-semibold text-primary mt-2 mb-3 tracking-tight leading-tight">
              From resume to readiness
            </h1>

            <p className="font-body text-base text-primary/85 font-medium mb-2">
              Upload your resume, pick a role, and get a plain-language plan for what to learn next.
            </p>

            <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-6">
              A transparent, rubric-backed appraisal of your engineering portfolio against real placement benchmarks. No algorithmic obscurity. Just clear evidence, diagnostic roadmaps, and actionable mentorship.
            </p>

            {/* Auth Box */}
            <div className="bg-surface-container-lowest border border-surface-container-highest rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="mb-5">
                <h2 className="font-headline text-lg sm:text-xl text-primary font-semibold mb-1">
                  Institutional Authentication
                </h2>
                <p className="font-body text-xs text-on-surface-variant">
                  Sign in with your verified college Google account or enter your campus email ID for a single-use login code.
                </p>
              </div>

              {/* Error / Info Alerts */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-lg bg-error-container/20 border border-error/30 text-error text-xs font-body flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}
              {infoMessage && (
                <div className="mb-4 p-3 rounded-lg bg-surface-container-high border border-outline-variant/40 text-on-surface text-xs font-body flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                  <span>{infoMessage}</span>
                </div>
              )}

              {/* Step 1: Input Screen (Google OAuth + Email OTP initiation) */}
              {authStep === 'input' ? (
                <div className="space-y-4">
                  {/* Google OAuth CTA */}
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-semibold text-sm transition-all shadow-sm disabled:opacity-60"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    )}
                    <span>Continue with College Google Account</span>
                  </button>

                  {/* Divider */}
                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-surface-container-highest"></div>
                    <span className="flex-shrink mx-3 text-on-surface-variant text-[11px] font-mono uppercase tracking-wider">or institutional email code</span>
                    <div className="flex-grow border-t border-surface-container-highest"></div>
                  </div>

                  {/* Auth Mode Tabs: Direct OTP vs Magic Link */}
                  <div className="bg-surface-container-low p-1 rounded-xl flex gap-1 border border-surface-container-highest">
                    <button
                      type="button"
                      onClick={() => setAuthMode('otp')}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-medium transition-all ${
                        authMode === 'otp'
                          ? 'bg-surface text-primary shadow-xs font-semibold'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      Enter 6-Digit OTP
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode('link')}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-medium transition-all ${
                        authMode === 'link'
                          ? 'bg-surface text-primary shadow-xs font-semibold'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      Email Magic Link
                    </button>
                  </div>

                  {authMode === 'otp' ? (
                    /* Mode A: Direct OTP Entry */
                    <form onSubmit={handleVerifyOtp} className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-on-surface-variant mb-1">
                          Campus Email Address
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="e.g. placement.dean@nie.ac.in or student@nie.ac.in"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-surface-container-highest bg-surface-container-low text-on-surface placeholder:text-outline text-xs focus:outline-none focus:border-primary font-mono"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-mono uppercase text-on-surface-variant">
                            6-Digit Verification Code
                          </label>
                          <span className="text-[10px] font-mono text-secondary">
                            Faculty default: 123456
                          </span>
                        </div>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="123456"
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                          className="w-full text-center tracking-[0.4em] text-base font-mono py-2.5 px-4 rounded-lg border border-surface-container-highest bg-surface text-primary focus:outline-none focus:border-primary font-bold"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading || !emailInput.trim() || otpInput.trim().length !== 6}
                        className="w-full py-2.5 px-4 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <span>Verify Code & Sign In</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    /* Mode B: Send Email Magic Link */
                    <form onSubmit={handleSendOtp} className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-on-surface-variant mb-1">
                          Campus Email Address
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="student@nie.ac.in"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-surface-container-highest bg-surface-container-low text-on-surface placeholder:text-outline text-xs focus:outline-none focus:border-primary font-mono"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading || !emailInput.trim()}
                        className="w-full py-2.5 px-4 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <span>Send Magic Link to Email</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                /* Step 2: Magic Link Sent + Code Fallback Screen */
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-primary-container/10 border border-primary/20 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <h3 className="font-headline font-semibold text-sm text-primary">
                      Check your email inbox
                    </h3>
                    <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                      We sent a secure sign-in link to <span className="font-mono font-bold text-primary">{emailInput}</span>. Click the link in your email to authenticate immediately.
                    </p>
                  </div>

                  {/* Fallback code input if email contains 6-digit OTP */}
                  <form onSubmit={handleVerifyOtp} className="space-y-3 pt-1">
                    <div className="text-center">
                      <label className="block text-[11px] font-mono uppercase text-on-surface-variant mb-1.5">
                        Received a 6-digit code instead?
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-center tracking-[0.5em] text-lg font-mono py-2.5 px-4 rounded-xl border border-surface-container-highest bg-surface-container-low text-primary focus:outline-none focus:border-primary font-semibold"
                      />
                    </div>

                    {otpInput.trim().length === 6 && (
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 px-4 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <span>Verify Code</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    )}
                  </form>

                  <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-surface-container-highest">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthStep('input');
                        setOtpInput('');
                        setErrorMessage(null);
                        setInfoMessage(null);
                      }}
                      className="text-on-surface-variant hover:text-primary transition-colors"
                    >
                      ← Use different email
                    </button>

                    {countdown > 0 ? (
                      <span className="text-on-surface-variant">Resend in {countdown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-secondary font-semibold hover:underline"
                      >
                        Resend Link
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Evaluator Quick Access (Local & Demo Mode) */}
              <div className="mt-5 pt-4 border-t border-surface-container-highest">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-outline">
                    Instant Demo Access
                  </span>
                  <span className="text-[10px] font-mono text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded">
                    Evaluation Bypass
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleDemoSignIn('durga')}
                    className="py-1.5 px-2 rounded-lg bg-primary-container/15 hover:bg-primary-container/25 text-primary font-mono text-[11px] font-semibold border border-primary/25 transition-colors text-center"
                    title="Durga sravan (Lead/Candidate)"
                  >
                    Durga S.
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoSignIn('student')}
                    className="py-1.5 px-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary font-mono text-[11px] border border-surface-container-highest transition-colors text-center"
                  >
                    Ananya R.
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoSignIn('new_student')}
                    className="py-1.5 px-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-secondary font-mono text-[11px] border border-surface-container-highest transition-colors text-center"
                  >
                    + Onboard
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoSignIn('coordinator')}
                    className="py-1.5 px-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary font-mono text-[11px] border border-surface-container-highest transition-colors text-center"
                  >
                    TPC Lead
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoSignIn('mentor')}
                    className="py-1.5 px-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-mono text-[11px] border border-surface-container-highest transition-colors text-center"
                  >
                    Mentor
                  </button>
                </div>
              </div>

              {/* Official Faculty Accounts (Fixed OTP: 123456) */}
              <div className="mt-4 pt-3 border-t border-surface-container-highest">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-secondary font-semibold">
                    Official Faculty Accounts (Fixed OTP: 123456)
                  </span>
                  <span className="text-[10px] font-mono text-on-surface-variant">
                    Click to auto-fill
                  </span>
                </div>
                <div className="space-y-1.5 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => {
                      setEmailInput('placement.dean@nie.ac.in');
                      setOtpInput('123456');
                      setAuthMode('otp');
                      setAuthStep('input');
                    }}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-left text-primary border border-surface-container-highest flex items-center justify-between transition-colors group"
                  >
                    <span className="font-semibold">Prof. K. R. Sharma (Head TPC)</span>
                    <span className="text-[10px] text-on-surface-variant group-hover:text-primary">placement.dean@nie.ac.in</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmailInput('cs.placement@nie.ac.in');
                      setOtpInput('123456');
                      setAuthMode('otp');
                      setAuthStep('input');
                    }}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-left text-primary border border-surface-container-highest flex items-center justify-between transition-colors group"
                  >
                    <span className="font-semibold">Dr. Sunita Rao (CS Lead)</span>
                    <span className="text-[10px] text-on-surface-variant group-hover:text-primary">cs.placement@nie.ac.in</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmailInput('core.placement@nie.ac.in');
                      setOtpInput('123456');
                      setAuthMode('otp');
                      setAuthStep('input');
                    }}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-left text-primary border border-surface-container-highest flex items-center justify-between transition-colors group"
                  >
                    <span className="font-semibold">Prof. Vikram Mehta (Core Lead)</span>
                    <span className="text-[10px] text-on-surface-variant group-hover:text-primary">core.placement@nie.ac.in</span>
                  </button>
                </div>
              </div>

              {/* Truthful Institutional Privacy Standard */}
              <div className="mt-5 pt-3 border-t border-surface-container-highest flex items-start gap-2.5 text-[11px] text-on-surface-variant leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-outline mt-0.5 shrink-0" />
                <span>
                  Your uploaded resume, academic credentials, and diagnostic feedback are private and visible strictly to you and your verified campus Training and Placement Cell.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Editorial Visual Banner */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl border border-surface-container-highest p-4 shadow-sm space-y-4">
            <div className="relative rounded-xl overflow-hidden bg-surface-container-low shadow-xs">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5L6b4t8MKW9JRAz6qAw6cRvnO6ne5h4e-r9zwqUoqcXCxYRQWOKOBbl-4NRL_T1NdWbVEiGRNlk4t0DuB5Bz7Y3FPt-mAZSGI1AvGpXROx23lOWgoUmV0sk2yhLLeMwwEarsCU8RD5SyLAOB_x98F0f3OjkSQgDU_fEqIfJ7oOpL21mL-SeB337uiQ6SWQV436L7eL9a_2Q9R_cfl66TH31KMpywI__hLV-xnhVoU-w8Qtbb0LB9cyg"
                alt="Indian college student standing thoughtfully with a notebook in a sunlit university corridor"
                className="w-full h-[380px] sm:h-[440px] lg:h-[480px] object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent flex items-end p-5">
                <div className="text-on-primary">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-secondary-fixed font-semibold bg-primary/40 px-2 py-0.5 rounded backdrop-blur-xs">
                    Campus Placement Rubric
                  </span>
                  <p className="font-headline text-base sm:text-lg font-medium leading-snug mt-1.5">
                    Benchmarked against Tier-1 Product & IT Services hiring rubrics
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0 mt-0.5">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-headline text-xs font-semibold text-primary">Granular Evidence Extraction</h3>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">Line-by-line verification against technical hiring rubrics without guessing.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary shrink-0 mt-0.5">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-headline text-xs font-semibold text-primary">Sequential Preparation Sprints</h3>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">Prioritized by recruitment frequency in upcoming campus placement drives.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Comprehensive Platform Explanation & Architecture Section */}
      <section className="border-t border-surface-container-highest bg-surface-container-lowest/70 py-16 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="font-mono text-xs uppercase tracking-wider text-secondary font-semibold">
              Platform Architecture
            </span>
            <h2 className="font-headline text-2xl sm:text-3xl font-semibold text-primary mt-1 mb-3">
              How Readiness Transforms Placement Preparation
            </h2>
            <p className="font-body text-sm text-on-surface-variant leading-relaxed">
              Instead of opaque AI scores or generic resume tips, Readiness provides a structured 4-step diagnostic pipeline calibrated against real campus hiring expectations.
            </p>
          </div>

          {/* 4 Core Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-surface-container-highest shadow-xs hover:border-primary/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center font-mono font-bold text-sm mb-4">
                01
              </div>
              <h3 className="font-headline text-base font-semibold text-primary mb-2">
                Resume & Portfolio Intake
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Upload your resume in PDF, DOCX, or text format. Our parser extracts your project details, tech stack, coursework, and GitHub repositories without hallucination or data loss.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-surface-container-highest shadow-xs hover:border-primary/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-secondary-container/30 text-secondary flex items-center justify-center font-mono font-bold text-sm mb-4">
                02
              </div>
              <h3 className="font-headline text-base font-semibold text-primary mb-2">
                Role Rubric Alignment
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Compare your competencies against target roles — Frontend, Backend, Full-Stack, SDE, or Data Analyst. Benchmarks are derived from actual Tier-1 company interview criteria.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-surface-container-highest shadow-xs hover:border-primary/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center font-mono font-bold text-sm mb-4">
                03
              </div>
              <h3 className="font-headline text-base font-semibold text-primary mb-2">
                Evidence-Backed Diagnosis
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Every skill is categorized into <span className="font-semibold text-primary">Strong</span>, <span className="font-semibold text-secondary">Needs Proof</span>, or <span className="font-semibold text-error">Missing</span>. We quote direct evidence lines from your resume and provide actionable explanations.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-surface-container-highest shadow-xs hover:border-primary/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-secondary-container/30 text-secondary flex items-center justify-center font-mono font-bold text-sm mb-4">
                04
              </div>
              <h3 className="font-headline text-base font-semibold text-primary mb-2">
                6-Week Action Roadmap
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Receive prioritized weekly preparation sprints with interactive task checklists, code repos to build, and direct messaging with assigned campus faculty mentors.
              </p>
            </div>
          </div>

          {/* About The Platform / Institutional Strip */}
          <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-surface-container-low border border-surface-container-highest flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="space-y-1.5 text-center md:text-left max-w-2xl">
              <span className="font-mono text-[10px] uppercase tracking-wider text-secondary font-semibold">
                Campus Placement Cell & Faculty Integration
              </span>
              <h4 className="font-headline text-base sm:text-lg font-semibold text-primary">
                Connecting Students, Mentors, and Placement Officers
              </h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Placement Coordinators track branch-wide cohort readiness, identify critical skill gaps across departments, and dispatch timely interventions before campus drives begin.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => handleDemoSignIn('coordinator')}
                className="px-4 py-2.5 rounded-xl bg-primary text-on-primary font-mono text-xs font-semibold hover:bg-primary-container transition-all shadow-xs"
              >
                Launch TPC Console →
              </button>
              <button
                type="button"
                onClick={() => handleDemoSignIn('durga')}
                className="px-4 py-2.5 rounded-xl bg-surface border border-surface-container-highest text-primary font-mono text-xs font-semibold hover:bg-surface-container transition-all"
              >
                Durga S. Portal →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Manifesto Section */}
      <section className="border-t border-surface-container-highest bg-surface py-16 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="font-mono text-xs uppercase tracking-wider text-secondary font-semibold">
              Our Vision & Philosophy
            </span>
            <h2 className="font-headline text-3xl sm:text-4xl font-semibold text-primary mt-2 mb-4 leading-tight">
              Bridging the Academic-Industry Divide with Absolute Transparency
            </h2>
            <p className="font-body text-sm sm:text-base text-on-surface-variant leading-relaxed">
              In universities across the country, brilliant engineering students face campus recruitment drives after four years of rigorous study. Yet over 80% struggle during technical interviews. The issue is never talent — it is the absence of transparent rubrics and practical hiring proof.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-xs">
              <span className="font-mono text-xs font-bold text-secondary uppercase tracking-wider block mb-2">
                01. Clarity Over Obscurity
              </span>
              <h3 className="font-headline text-base font-semibold text-primary mb-2">
                Explainable Diagnosis
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                No opaque percentages or AI guesswork. If marks are deducted, students receive exact citations from their resume and concrete instructions on what evidence was missing.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-xs">
              <span className="font-mono text-xs font-bold text-secondary uppercase tracking-wider block mb-2">
                02. Proof Over Buzzwords
              </span>
              <h3 className="font-headline text-base font-semibold text-primary mb-2">
                Verifiable Engineering
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Recruiters disregard keyword stuffing. We guide students to build live deployed features, test suites, and clean architecture that stand up to recruiter scrutiny.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-highest shadow-xs">
              <span className="font-mono text-xs font-bold text-secondary uppercase tracking-wider block mb-2">
                03. Institutional Partnership
              </span>
              <h3 className="font-headline text-base font-semibold text-primary mb-2">
                Faculty & TPC Synergy
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Placement officers track cohort heatmaps while departmental faculty provide real-time mentorship, aligning the entire institution toward 100% placement readiness.
              </p>
            </div>
          </div>

          {/* Vision Quote Banner */}
          <div className="p-8 rounded-2xl bg-primary text-on-primary border border-primary-container relative overflow-hidden shadow-sm">
            <div className="relative z-10 max-w-3xl">
              <p className="font-headline text-lg sm:text-xl font-medium leading-relaxed italic mb-4">
                "Campus recruitment shouldn't be a lottery. When students have crystal-clear feedback, verified benchmarks, and structured weekly sprints, placement readiness becomes inevitable."
              </p>
              <div className="flex items-center gap-3 font-mono text-xs text-on-primary/90">
                <span className="font-semibold text-secondary-fixed">Durga Sravan Challagolla</span>
                <span>•</span>
                <span>Platform Lead & Engineering Placement Initiative</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Footer */}
      <footer className="px-6 lg:px-12 py-4 border-t border-surface-container-highest text-xs font-mono text-on-surface-variant flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>Readiness · Skill Gap Diagnostic Platform</span>
        <span>Strict Institutional Privacy Standard 2025–26</span>
      </footer>
    </div>
  );
}
