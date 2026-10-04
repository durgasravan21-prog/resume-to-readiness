'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { saveSession, DEFAULT_STUDENT, DEFAULT_COORDINATOR, UserProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';
import {
  ShieldCheck,
  Mail,
  Lock,
  KeyRound,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  Building2,
  Users,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  // Mode: 'password' | 'otp'
  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>('password');
  const [otpStep, setOtpStep] = useState<'request' | 'verify'>('request');

  // Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // States
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // OTP Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Direct login with email and password
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      setErrorMessage('Please provide both institutional email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      // 1. Supabase Auth signInWithPassword
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPass,
      });

      if (error) {
        // Check for Durga or demo user bypass
        if (cleanEmail === 'durgasravan21@gmail.com') {
          handleDirectPersona({
            id: '36ac8503-c1c5-4865-b3f5-51c302a3e1ee',
            name: 'Durga sravan Challagolla',
            email: 'durgasravan21@gmail.com',
            role: 'student',
            rollNumber: '2021BCS0101',
            branch: 'Computer Science & Engineering',
            graduationYear: '2025',
          });
          return;
        }
        throw error;
      }

      if (data.user) {
        // Fetch or create profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        const role = profile?.role || 'student';
        const userObj: UserProfile = {
          id: data.user.id,
          name: profile?.name || data.user.user_metadata?.full_name || cleanEmail.split('@')[0],
          email: cleanEmail,
          role: role as any,
          rollNumber: profile?.roll_number,
          branch: profile?.branch,
          degree: profile?.degree,
          graduationYear: profile?.graduation_year,
          cgpa: profile?.cgpa,
          collegeName: 'National Institute of Engineering',
          avatarUrl: profile?.avatar_url || data.user.user_metadata?.avatar_url,
        };

        saveSession(userObj);
        document.cookie = `readiness_role=${role}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `readiness_user_id=${data.user.id}; path=/; max-age=604800; SameSite=Lax`;

        if (profile?.onboarding_completed || role === 'coordinator') {
          document.cookie = `readiness_onboarding_completed=true; path=/; max-age=604800; SameSite=Lax`;
        }

        const destination = role === 'coordinator' ? '/tpc' : (profile?.onboarding_completed ? '/home' : '/onboarding');
        window.location.href = destination;
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
      setLoading(false);
    }
  };

  // Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid college email address.');
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

      if (error && !cleanEmail.includes('nie.ac.in') && cleanEmail !== 'durgasravan21@gmail.com') {
        throw error;
      }

      setOtpStep('verify');
      setCountdown(60);
      setInfoMessage(`Verification code sent to ${cleanEmail}. Use code 123456 for instant bypass.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not send verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP via API endpoint
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanToken = otpCode.trim();

    if (!cleanToken) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, token: cleanToken }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Verification failed.');
      }

      if (data.user) {
        saveSession(data.user);
        window.location.href = data.redirectTo || '/home';
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid or expired verification code.');
      setLoading(false);
    }
  };

  // Google OAuth
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
      setErrorMessage(err.message || 'Google SSO failed.');
      setLoading(false);
    }
  };

  // Direct Persona Quick Login
  const handleDirectPersona = (persona: Partial<UserProfile>) => {
    setLoading(true);
    const completeProfile: UserProfile = {
      id: persona.id || 'usr_student_01',
      name: persona.name || 'Candidate',
      email: persona.email || 'student@college.edu',
      role: persona.role || 'student',
      rollNumber: persona.rollNumber || '2021BCS0089',
      degree: persona.degree || 'B.Tech',
      branch: persona.branch || 'Computer Science & Engineering',
      graduationYear: persona.graduationYear || '2025',
      cgpa: persona.cgpa || '8.5',
      collegeName: 'National Institute of Engineering',
      avatarUrl: persona.avatarUrl,
    };

    saveSession(completeProfile);
    document.cookie = `readiness_role=${completeProfile.role}; path=/; max-age=604800; SameSite=Lax`;
    document.cookie = `readiness_user_id=${completeProfile.id}; path=/; max-age=604800; SameSite=Lax`;
    document.cookie = `readiness_onboarding_completed=true; path=/; max-age=604800; SameSite=Lax`;

    const dest = completeProfile.role === 'coordinator' ? '/tpc' : '/home';
    window.location.href = dest;
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between font-body antialiased">
      {/* Top Bar */}
      <header className="border-b border-surface-variant bg-surface/90 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center font-display font-bold text-base">
              R
            </div>
            <div>
              <span className="font-headline text-lg font-semibold text-primary tracking-tight">
                Readiness
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-mono text-on-surface-variant border-l border-surface-variant pl-2">
                NIE Campus Placement Portal
              </span>
            </div>
          </Link>

          <Link
            href="/signup"
            className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
          >
            Create New Account
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md bg-surface-container-low border border-surface-variant rounded-2xl shadow-sm p-6 sm:p-8">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="font-headline text-2xl text-primary font-bold">
              Sign In to Readiness
            </h1>
            <p className="font-body text-xs text-on-surface-variant mt-1.5">
              Authorized access for students, placement cells & faculty mentors
            </p>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-error-container/40 border border-error/30 text-error flex items-start gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {infoMessage && (
            <div className="mb-4 p-3 rounded-lg bg-secondary-container/40 border border-secondary/30 text-secondary flex items-start gap-2.5 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* Method Selector Tabs */}
          <div className="grid grid-cols-2 p-1 bg-surface-container rounded-xl mb-5 text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('password');
                setErrorMessage(null);
              }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMethod === 'password'
                  ? 'bg-surface shadow-xs text-primary font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              Password
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod('otp');
                setErrorMessage(null);
              }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMethod === 'otp'
                  ? 'bg-surface shadow-xs text-primary font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              Passcode / OTP
            </button>
          </div>

          {/* Password Login Form */}
          {authMethod === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Institutional Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-on-surface-variant absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@nie.ac.in or durga@..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-surface-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-body text-on-surface"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-on-surface-variant absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-surface-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-body text-on-surface"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-primary text-on-primary font-semibold text-xs hover:bg-primary/95 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In with Password'}
                {!loading && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </form>
          )}

          {/* OTP Login Form */}
          {authMethod === 'otp' && (
            <div>
              {otpStep === 'request' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      Institutional Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-on-surface-variant absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@nie.ac.in"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-surface-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-body text-on-surface"
                      />
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-1 font-mono">
                      We'll send a 6-digit login token to this address.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl bg-primary text-on-primary font-semibold text-xs hover:bg-primary/95 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Verification Code'}
                    {!loading && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      6-Digit Verification Code
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-on-surface-variant absolute left-3 top-2.5" />
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="123456"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-surface-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono text-center tracking-widest text-on-surface font-semibold text-sm"
                      />
                    </div>
                    <div className="flex justify-between items-center mt-1.5 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setOtpStep('request')}
                        className="text-primary hover:underline font-mono"
                      >
                        Change email
                      </button>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={countdown > 0}
                        className="text-on-surface-variant hover:text-primary disabled:opacity-50 font-mono"
                      >
                        {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code'}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl bg-primary text-on-primary font-semibold text-xs hover:bg-primary/95 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify Code & Sign In'}
                    {!loading && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Single Sign-On Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-variant" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-mono text-on-surface-variant">
              <span className="bg-surface-container-low px-2">or continue with</span>
            </div>
          </div>

          {/* Google SSO Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl border border-surface-variant bg-surface hover:bg-surface-container text-on-surface font-semibold text-xs transition-all flex items-center justify-center gap-2.5 shadow-2xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Sign In with Google SSO
          </button>

          {/* Quick Demo Personas Section */}
          <div className="mt-6 pt-5 border-t border-surface-variant">
            <p className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant font-semibold mb-2.5 text-center">
              Instant Institutional Switcher
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() =>
                  handleDirectPersona({
                    id: '36ac8503-c1c5-4865-b3f5-51c302a3e1ee',
                    name: 'Durga sravan Challagolla',
                    email: 'durgasravan21@gmail.com',
                    role: 'student',
                    rollNumber: '2021BCS0101',
                    branch: 'Computer Science & Engineering',
                    graduationYear: '2025',
                  })
                }
                className="p-2 rounded-lg bg-surface border border-surface-variant hover:border-primary text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-primary font-semibold text-[11px] group-hover:text-primary">
                  <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Durga sravan C.</span>
                </div>
                <div className="text-[10px] text-on-surface-variant font-mono truncate">Candidate / Lead</div>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleDirectPersona({
                    id: 'usr_student_01',
                    name: 'Ananya Reddy',
                    email: 'ananya.reddy@college.edu',
                    role: 'student',
                    rollNumber: '2021BCS0089',
                    branch: 'Computer Science & Engineering',
                    graduationYear: '2025',
                  })
                }
                className="p-2 rounded-lg bg-surface border border-surface-variant hover:border-primary text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-primary font-semibold text-[11px] group-hover:text-primary">
                  <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Ananya Reddy</span>
                </div>
                <div className="text-[10px] text-on-surface-variant font-mono truncate">Candidate #2021BCS</div>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleDirectPersona({
                    id: 'fac_cs_02',
                    name: 'Dr. Sunita Rao',
                    email: 'cs.placement@nie.ac.in',
                    role: 'coordinator',
                    collegeName: 'National Institute of Engineering',
                  })
                }
                className="p-2 rounded-lg bg-surface border border-surface-variant hover:border-primary text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-secondary font-semibold text-[11px] group-hover:text-secondary">
                  <Briefcase className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Dr. Sunita Rao</span>
                </div>
                <div className="text-[10px] text-on-surface-variant font-mono truncate">Faculty Mentor (CS)</div>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleDirectPersona({
                    id: 'fac_dean_01',
                    name: 'Prof. K. R. Sharma',
                    email: 'placement.dean@nie.ac.in',
                    role: 'coordinator',
                    collegeName: 'National Institute of Engineering',
                  })
                }
                className="p-2 rounded-lg bg-surface border border-surface-variant hover:border-primary text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-secondary font-semibold text-[11px] group-hover:text-secondary">
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Prof. K. R. Sharma</span>
                </div>
                <div className="text-[10px] text-on-surface-variant font-mono truncate">Head - TPC Cell</div>
              </button>
            </div>
          </div>

          {/* Bottom Signup Link */}
          <div className="mt-6 text-center text-xs text-on-surface-variant">
            <span>Don't have an institutional account yet? </span>
            <Link href="/signup" className="text-primary font-semibold hover:underline">
              Register here
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-variant py-4 px-6 text-center text-[11px] text-on-surface-variant font-mono">
        Readiness Institutional Verification System • NIRF / NBA Accredited Rubric
      </footer>
    </div>
  );
}
