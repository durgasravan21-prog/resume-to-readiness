'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { saveSession } from '@/lib/auth';
import {
  GraduationCap,
  Briefcase,
  User,
  Mail,
  Lock,
  Hash,
  BookOpen,
  Calendar,
  Building2,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();

  // Role: 'student' | 'coordinator'
  const [role, setRole] = useState<'student' | 'coordinator'>('student');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [branch, setBranch] = useState('Computer Science & Engineering');
  const [degree, setDegree] = useState('B.Tech');
  const [graduationYear, setGraduationYear] = useState('2025');
  const [targetRole, setTargetRole] = useState('Junior Frontend Developer');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [designation, setDesignation] = useState('Associate Professor & Placement Lead');

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanName || !cleanEmail || !cleanPassword) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (cleanPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const payload: Record<string, any> = {
        name: cleanName,
        email: cleanEmail,
        password: cleanPassword,
        role,
      };

      if (role === 'student') {
        payload.rollNumber = rollNumber.trim() || '2021BCS' + Math.floor(1000 + Math.random() * 9000);
        payload.branch = branch;
        payload.degree = degree;
        payload.graduationYear = graduationYear;
        payload.targetRole = targetRole;
      } else {
        payload.department = department;
        payload.designation = designation;
      }

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Account registration failed.');
      }

      if (data.user) {
        saveSession(data.user);
        setSuccessMessage('Account registered successfully! Redirecting...');
        setTimeout(() => {
          window.location.href = data.redirectTo || (role === 'coordinator' ? '/tpc' : '/onboarding');
        }, 1000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during registration.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between font-body antialiased">
      {/* Top Header */}
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
                Candidate & Faculty Onboarding
              </span>
            </div>
          </Link>

          <Link
            href="/login"
            className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
          >
            Sign In to Existing Account
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Registration Form */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-lg bg-surface-container-low border border-surface-variant rounded-2xl shadow-sm p-6 sm:p-8">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="font-headline text-2xl text-primary font-bold">
              Institutional Registration
            </h1>
            <p className="font-body text-xs text-on-surface-variant mt-1.5">
              Create your profile to access automated readiness diagnostics and placement sprints
            </p>
          </div>

          {/* Messages */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-error-container/40 border border-error/30 text-error flex items-start gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-secondary-container/40 border border-secondary/30 text-secondary flex items-start gap-2.5 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Role Picker */}
          <div className="grid grid-cols-2 p-1 bg-surface-container rounded-xl mb-5 text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setRole('student');
                setErrorMessage(null);
              }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                role === 'student'
                  ? 'bg-surface shadow-xs text-primary font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Student Candidate
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('coordinator');
                setErrorMessage(null);
              }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                role === 'coordinator'
                  ? 'bg-surface shadow-xs text-primary font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Faculty / Coordinator
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Common Fields */}
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Full Name <span className="text-error">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-on-surface-variant absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={role === 'student' ? 'e.g. Durga Sravan' : 'e.g. Dr. Sunita Rao'}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-surface-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-body text-on-surface"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Institutional Email <span className="text-error">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-on-surface-variant absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === 'student' ? 'candidate@nie.ac.in or gmail' : 'cs.placement@nie.ac.in'}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-surface-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-body text-on-surface"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Password <span className="text-error">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-on-surface-variant absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-surface-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-body text-on-surface"
                />
              </div>
            </div>

            {/* Student Specific Fields */}
            {role === 'student' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      Roll Number / USN
                    </label>
                    <div className="relative">
                      <Hash className="w-4 h-4 text-on-surface-variant absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value)}
                        placeholder="2021BCS0089"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-surface-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono text-on-surface"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      Graduation Year
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-on-surface-variant absolute left-3 top-2.5" />
                      <select
                        value={graduationYear}
                        onChange={(e) => setGraduationYear(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-surface-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-body text-on-surface"
                      >
                        <option value="2025">Class of 2025</option>
                        <option value="2026">Class of 2026</option>
                        <option value="2027">Class of 2027</option>
                        <option value="2028">Class of 2028</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      Branch / Department
                    </label>
                    <div className="relative">
                      <BookOpen className="w-4 h-4 text-on-surface-variant absolute left-3 top-2.5" />
                      <select
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-surface-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-body text-on-surface"
                      >
                        <option value="Computer Science & Engineering">Computer Science</option>
                        <option value="Information Science & Engineering">Information Science</option>
                        <option value="Electronics & Communication">ECE</option>
                        <option value="Mechanical Engineering">Mechanical</option>
                        <option value="Electrical & Electronics">Electrical</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      Target Role Benchmark
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-on-surface-variant absolute left-3 top-2.5" />
                      <select
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-surface-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-body text-on-surface"
                      >
                        <option value="Junior Frontend Developer">Junior Frontend Dev</option>
                        <option value="Associate Software Engineer">Associate SWE</option>
                        <option value="Product Engineer (Backend)">Backend Engineer</option>
                        <option value="Data Analyst & BI Specialist">Data Analyst</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Coordinator Specific Fields */}
            {role === 'coordinator' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Department / Division
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-on-surface-variant absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Training & Placement Cell"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-surface-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-body text-on-surface"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Faculty Designation
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-on-surface-variant absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="e.g. Placement Officer / Professor"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-surface-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-body text-on-surface"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-primary text-on-primary font-semibold text-xs hover:bg-primary/95 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Institutional Account'}
              {!loading && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </form>

          {/* Bottom Login Link */}
          <div className="mt-6 text-center text-xs text-on-surface-variant border-t border-surface-variant pt-4">
            <span>Already have an account? </span>
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign In here
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
