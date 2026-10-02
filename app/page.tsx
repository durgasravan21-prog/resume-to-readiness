'use client';

import React, { useState, useEffect } from 'react';
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
  const [authStep, setAuthStep] = useState<'input' | 'otp'>('input');
  const [emailInput, setEmailInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for OTP resend
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

  // Send Email OTP Handler
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
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) throw error;

      setAuthStep('otp');
      setCountdown(60);
      setInfoMessage(`A 6-digit login code has been sent to ${cleanEmail}.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not send verification code. Please check your email or use demo bypass.');
    } finally {
      setLoading(false);
    }
  };

  // Verify Email OTP Handler
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanToken = otpInput.trim();
    if (cleanToken.length < 6) {
      setErrorMessage('Please enter the complete 6-digit code.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: emailInput.trim().toLowerCase(),
        token: cleanToken,
        type: 'email',
      });

      if (error) throw error;

      if (data.user) {
        // Fetch or create profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, onboarding_completed')
          .eq('id', data.user.id)
          .single();

        if (!profile) {
          await supabase.from('profiles').insert({
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || emailInput.split('@')[0],
            role: 'student',
            onboarding_completed: false,
            college_id: 'col_nie',
          });
          router.push('/onboarding');
          return;
        }

        if (!profile.onboarding_completed && profile.role === 'student') {
          router.push('/onboarding');
          return;
        }

        if (profile.role === 'coordinator') {
          router.push('/tpc');
        } else if (profile.role === 'mentor') {
          router.push('/mentor');
        } else if (profile.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/home');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid or expired code. Please verify and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Demo bypass helpers
  const handleDemoSignIn = (role: 'student' | 'coordinator' | 'mentor' | 'admin' | 'new_student') => {
    setLoading(true);
    if (role === 'coordinator') {
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

        <div className="flex items-center gap-4 text-xs font-mono text-on-surface-variant">
          <span className="hidden md:inline">Placement Cycle 2025–26</span>
          <button
            onClick={() => handleDemoSignIn('coordinator')}
            className="text-primary hover:underline font-semibold flex items-center gap-1"
          >
            <span>Coordinator Portal</span>
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

            <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-semibold text-primary mt-2 mb-4 tracking-tight leading-tight">
              Know exactly where your skills stand before campus drives begin.
            </h1>

            <p className="font-body text-sm sm:text-base text-on-surface-variant leading-relaxed mb-6">
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

                  {/* Email OTP Input Form */}
                  <form onSubmit={handleSendOtp} className="space-y-2">
                    <label className="block text-[11px] font-mono uppercase text-on-surface-variant">
                      Campus Email Address
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        required
                        placeholder="student@nie.ac.in"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="flex-1 px-3.5 py-2.5 rounded-lg border border-surface-container-highest bg-surface-container-low text-on-surface placeholder:text-outline text-xs focus:outline-none focus:border-primary font-mono"
                      />
                      <button
                        type="submit"
                        disabled={loading || !emailInput.trim()}
                        className="px-4 py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-primary font-semibold text-xs transition-colors shrink-0 disabled:opacity-50"
                      >
                        Send Code
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* Step 2: 6-Digit OTP Verification Screen */
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-on-surface-variant mb-1">
                      Enter 6-Digit Verification Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      autoFocus
                      required
                      placeholder="123456"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                      className="w-full text-center tracking-[0.5em] text-xl font-mono py-3 px-4 rounded-xl border border-surface-container-highest bg-surface-container-low text-primary focus:outline-none focus:border-primary font-semibold"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpInput.trim().length !== 6}
                    className="w-full py-3 px-4 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-semibold text-sm transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span>Verify & Continue</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-xs font-mono pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthStep('input');
                        setOtpInput('');
                        setErrorMessage(null);
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
                        Resend Code
                      </button>
                    )}
                  </div>
                </form>
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDemoSignIn('student')}
                    className="py-1.5 px-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary font-mono text-[11px] border border-surface-container-highest transition-colors text-center"
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoSignIn('new_student')}
                    className="py-1.5 px-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-secondary font-mono text-[11px] border border-surface-container-highest transition-colors text-center"
                  >
                    + Onboarding
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoSignIn('coordinator')}
                    className="py-1.5 px-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary font-mono text-[11px] border border-surface-container-highest transition-colors text-center"
                  >
                    Coordinator
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
          <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl border border-surface-container-highest p-6 shadow-sm space-y-5">
            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-surface-container-low relative">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDv37OrsHEsAbKUphjT_YMfY-GU_zQrMaBrYm4WnzCJDENkgU9qSgHl_BzgGJ8fJ6_5DUmnEOMTrViQoNsXe3bYPcdbo70RHDPO0aty9cxcLeBUPlWeNfDjINQuQx7EYBTpqi3IchqgHnzd66kY9-geLWeFkQ80E-B54fB1y0EFg69ZlesuJlwAWwFNY5X6rARjn4KLbeG4j1o3uaQCVDc9anbAkcC4bKBDYBIHNzdNzBvsStCCcSJwAA"
                alt="Institutional Campus Advisory"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent flex items-end p-5">
                <div className="text-on-primary">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-secondary-fixed font-semibold">Verified Syllabus</span>
                  <p className="font-headline text-lg font-medium leading-snug mt-0.5">Benchmarked against Tier-1 Product & IT Services hiring rubrics</p>
                </div>
              </div>
            </div>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0 mt-0.5">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-headline text-xs font-semibold text-primary">Granular Evidence Extraction</h3>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">Line-by-line verification against technical hiring rubrics.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary shrink-0 mt-0.5">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-headline text-xs font-semibold text-primary">Sequential Preparation Sprints</h3>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">Prioritized by recruitment frequency in upcoming drives.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Editorial Footer */}
      <footer className="px-6 lg:px-12 py-4 border-t border-surface-container-highest text-xs font-mono text-on-surface-variant flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>Readiness · Skill Gap Diagnostic Platform</span>
        <span>Strict Institutional Privacy Standard 2025–26</span>
      </footer>
    </div>
  );
}
