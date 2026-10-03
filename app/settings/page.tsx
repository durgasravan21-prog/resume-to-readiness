'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/layout/TopNav';
import MobileTabBar from '@/components/layout/MobileTabBar';
import { getSession, UserProfile } from '@/lib/auth';

interface ProfileData {
  id?: string;
  name?: string;
  dob?: string;
  email?: string;
  phone_number?: string;
  github_url?: string;
  linkedin_url?: string;
  roll_number?: string;
  college_name?: string;
  degree?: string;
  branch?: string;
  graduation_year?: string;
  cgpa?: string;
  school_10th?: string;
  school_10th_marks?: string;
  school_12th?: string;
  school_12th_marks?: string;
  onboarding_completed?: boolean;
}

interface ResumeMetadata {
  id: string;
  file_name: string;
  file_size: string;
  created_at?: string;
}

export default function StudentSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [latestResume, setLatestResume] = useState<ResumeMetadata | null>(null);

  // Editable Form Fields
  const [phoneNumber, setPhoneNumber] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push('/');
      return;
    }
    setUser(session);

    async function loadProfile() {
      try {
        setLoading(true);
        const res = await fetch(`/api/settings?userId=${encodeURIComponent(session?.id || '')}`);
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setProfile(data.profile);
            setPhoneNumber(data.profile.phone_number || '');
            setGithubUrl(data.profile.github_url || '');
            setLinkedinUrl(data.profile.linkedin_url || '');
          }
          if (data.latestResume) {
            setLatestResume(data.latestResume);
          }
        } else {
          // Fallback to local session data
          setProfile({
            id: session?.id,
            name: session?.name,
            email: session?.email,
            roll_number: session?.rollNumber || '2021BCS0089',
            college_name: session?.collegeName || 'National Institute of Engineering',
            degree: session?.degree || 'B.Tech',
            branch: session?.branch || 'Computer Science & Engineering',
            graduation_year: session?.graduationYear || '2025',
            cgpa: session?.cgpa || '8.74',
            school_10th: 'Delhi Public School',
            school_10th_marks: '94.2%',
            school_12th: 'Narayana Junior College',
            school_12th_marks: '96.5%',
            dob: '2003-05-14',
          });
        }
      } catch (err) {
        console.error('Failed to load profile in settings:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (ext !== '.pdf' && ext !== '.docx' && ext !== '.doc') {
      setErrorMessage('Please upload a PDF (.pdf) or Word document (.docx, .doc).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Resume file size exceeds the 5MB institutional limit.');
      return;
    }
    setResumeFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    setSaveSuccess(null);

    // Basic URL format normalization
    let normalizedGithub = githubUrl.trim();
    if (normalizedGithub && !normalizedGithub.startsWith('http://') && !normalizedGithub.startsWith('https://')) {
      normalizedGithub = 'https://' + normalizedGithub;
    }

    let normalizedLinkedin = linkedinUrl.trim();
    if (normalizedLinkedin && !normalizedLinkedin.startsWith('http://') && !normalizedLinkedin.startsWith('https://')) {
      normalizedLinkedin = 'https://' + normalizedLinkedin;
    }

    try {
      const formData = new FormData();
      formData.append('userId', profile?.id || user?.id || '');
      formData.append('phone_number', phoneNumber.trim());
      formData.append('github_url', normalizedGithub);
      formData.append('linkedin_url', normalizedLinkedin);
      if (resumeFile) {
        formData.append('resume', resumeFile);
      }

      const res = await fetch('/api/settings', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile settings.');
      }

      setSaveSuccess('Your contact details, profile links, and placement resume have been updated successfully.');
      if (data.resume) {
        setLatestResume(data.resume);
        setResumeFile(null);
      }
      // Re-normalize displayed values
      setGithubUrl(normalizedGithub);
      setLinkedinUrl(normalizedLinkedin);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMessage(err.message || 'Error updating settings. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  if (!user && loading) {
    return (
      <div className="bg-surface font-body text-on-surface min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-mono text-xs text-on-surface-variant">Loading student profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex flex-col pb-24 md:pb-12">
      <TopNav />

      <main className="flex-1 w-full pt-16 bg-surface">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 w-full">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant mb-4">
            <Link href="/home" className="hover:text-primary transition-colors">Portal</Link>
            <span>/</span>
            <span className="text-on-surface font-medium">Profile & Placement Settings</span>
          </div>

          {/* Header Title Section */}
          <section className="mb-8 pb-4 border-b border-surface-variant flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[11px] uppercase tracking-wider text-secondary font-semibold">
                  STUDENT PORTAL · PLACEMENT CYCLE 2024–25
                </span>
              </div>
              <h1 className="font-headline text-2xl sm:text-3xl text-primary font-semibold">
                Profile & Placement Settings
              </h1>
              <p className="font-body text-sm text-on-surface-variant mt-1">
                Manage your recruiter-facing contact information and placement resume.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-tertiary font-mono text-xs border border-surface-variant">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                Institutional Identity Verified
              </span>
            </div>
          </section>

          {/* Feedback Alerts */}
          {saveSuccess && (
            <div className="mb-6 p-4 rounded-xl bg-secondary-container/40 border border-secondary/30 flex items-start gap-3 text-secondary animate-in fade-in duration-300">
              <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">check_circle</span>
              <div className="text-sm">
                <p className="font-semibold">{saveSuccess}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Institutional verification records remain protected. Recruitment coordinators and mentors now see your latest details.
                </p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-error-container/40 border border-error/30 flex items-start gap-3 text-error animate-in fade-in duration-300">
              <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">error</span>
              <div className="text-sm">
                <p className="font-semibold">{errorMessage}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT / TOP: Locked Institutional Credentials (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Institutional Credentials Card */}
              <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-6 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-surface-container-high/40 rounded-bl-full pointer-events-none -mr-4 -mt-4"></div>

                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-tertiary">verified_user</span>
                    <h2 className="font-headline text-base font-semibold text-primary">
                      Verified Academic Record
                    </h2>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-surface-container-high text-on-surface-variant border border-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">lock</span>
                    Strictly Locked
                  </span>
                </div>

                <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
                  The credentials below are certified by your university registrar and Training & Placement Cell. To prevent fraudulent alterations during recruitment drives, these fields cannot be edited online.
                </p>

                <div className="space-y-4 text-xs">
                  {/* Full Name */}
                  <div className="bg-surface-container-low/60 rounded-lg p-3 border border-surface-variant/70">
                    <span className="text-on-surface-variant font-mono block text-[10px] uppercase tracking-wider mb-1">
                      Legal Candidate Name
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-primary text-sm">{profile?.name || user?.name || '—'}</span>
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant/70">lock</span>
                    </div>
                  </div>

                  {/* DOB */}
                  <div className="bg-surface-container-low/60 rounded-lg p-3 border border-surface-variant/70">
                    <span className="text-on-surface-variant font-mono block text-[10px] uppercase tracking-wider mb-1">
                      Date of Birth (DOB)
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm text-primary font-medium">
                        {profile?.dob || 'Not recorded'}
                      </span>
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant/70">lock</span>
                    </div>
                  </div>

                  {/* Official Campus Email */}
                  <div className="bg-surface-container-low/60 rounded-lg p-3 border border-surface-variant/70">
                    <span className="text-on-surface-variant font-mono block text-[10px] uppercase tracking-wider mb-1">
                      Official Campus Email
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-primary truncate max-w-[240px]">
                        {profile?.email || user?.email || '—'}
                      </span>
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant/70">lock</span>
                    </div>
                  </div>

                  {/* Roll Number */}
                  <div className="bg-surface-container-low/60 rounded-lg p-3 border border-surface-variant/70">
                    <span className="text-on-surface-variant font-mono block text-[10px] uppercase tracking-wider mb-1">
                      University Roll / PRN Number
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm text-primary font-semibold">
                        {profile?.roll_number || user?.rollNumber || '—'}
                      </span>
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant/70">lock</span>
                    </div>
                  </div>

                  {/* College & Degree */}
                  <div className="bg-surface-container-low/60 rounded-lg p-3 border border-surface-variant/70">
                    <span className="text-on-surface-variant font-mono block text-[10px] uppercase tracking-wider mb-1">
                      College & Degree Program
                    </span>
                    <p className="font-medium text-primary text-xs leading-snug">
                      {profile?.degree || 'B.Tech'} in {profile?.branch || 'Computer Science & Engineering'}
                    </p>
                    <p className="text-[11px] text-on-surface-variant font-mono mt-0.5">
                      {profile?.college_name || user?.collegeName || 'National Institute of Engineering'} · Class of {profile?.graduation_year || '2025'}
                    </p>
                  </div>

                  {/* CGPA */}
                  <div className="bg-surface-container-low/60 rounded-lg p-3 border border-surface-variant/70">
                    <span className="text-on-surface-variant font-mono block text-[10px] uppercase tracking-wider mb-1">
                      Cumulative Grade Point Average (CGPA)
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm text-secondary font-bold">
                        {profile?.cgpa || '8.74'} / 10.0
                      </span>
                      <span className="text-[10px] font-mono text-on-surface-variant">Verified by Exam Cell</span>
                    </div>
                  </div>

                  {/* 10th & 12th Schooling */}
                  <div className="bg-surface-container-low/60 rounded-lg p-3 border border-surface-variant/70 space-y-2">
                    <span className="text-on-surface-variant font-mono block text-[10px] uppercase tracking-wider">
                      Secondary & Higher Secondary Schooling
                    </span>
                    
                    <div className="pt-1 border-t border-surface-variant/40 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-primary text-xs">Class 10 (Secondary):</p>
                        <p className="text-[11px] text-on-surface-variant truncate max-w-[200px]">
                          {profile?.school_10th || 'State / CBSE Board School'}
                        </p>
                      </div>
                      <span className="font-mono text-xs font-semibold text-primary">
                        {profile?.school_10th_marks || '94.2%'}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-surface-variant/40 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-primary text-xs">Class 12 / Diploma:</p>
                        <p className="text-[11px] text-on-surface-variant truncate max-w-[200px]">
                          {profile?.school_12th || 'Junior College / Polytechnic'}
                        </p>
                      </div>
                      <span className="font-mono text-xs font-semibold text-primary">
                        {profile?.school_12th_marks || '96.5%'}
                      </span>
                    </div>
                  </div>

                </div>

                {/* TPC Assistance Callout */}
                <div className="mt-5 p-3 rounded-lg bg-surface-container text-on-surface-variant text-[11px] flex items-start gap-2 border border-surface-variant">
                  <span className="material-symbols-outlined text-[16px] text-secondary shrink-0 mt-0.5">info</span>
                  <p>
                    Found an error in your verified academic details? Please visit the Training & Placement Cell (Room 204) with original marksheets to request an official record update.
                  </p>
                </div>
              </div>

            </div>

            {/* RIGHT / MAIN: Editable Placement Profile (7 Cols) */}
            <div className="lg:col-span-7">
              <form onSubmit={handleSubmit} className="bg-surface-container-lowest border border-surface-variant rounded-xl p-6 sm:p-8 shadow-xs">
                
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[22px] text-secondary">edit_note</span>
                    <h2 className="font-headline text-lg font-semibold text-primary">
                      Placement & Career Information
                    </h2>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-secondary-container/40 text-secondary border border-secondary/20">
                    Editable Fields
                  </span>
                </div>

                <p className="text-xs text-on-surface-variant mb-6">
                  Keep your recruiter contact channels, professional profiles, and placement resume up-to-date for upcoming placement drive shortlists.
                </p>

                <div className="space-y-6">

                  {/* 1. Contact Mobile Number */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-on-surface font-semibold mb-1.5">
                      Contact Mobile / WhatsApp Number <span className="text-secondary">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-on-surface-variant pointer-events-none">
                        <span className="material-symbols-outlined text-[18px]">call</span>
                      </span>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-surface-variant bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all font-mono"
                      />
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-1">
                      Used for SMS alerts, campus recruitment schedule calls, and WhatsApp drive notifications.
                    </p>
                  </div>

                  {/* 2. LinkedIn Profile URL */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-on-surface font-semibold mb-1.5">
                      LinkedIn Profile Link
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-on-surface-variant pointer-events-none">
                        <span className="material-symbols-outlined text-[18px]">badge</span>
                      </span>
                      <input
                        type="text"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-surface-variant bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all font-mono"
                      />
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-1">
                      Recruiters inspect this for extracurricular leadership, recommendations, and internships.
                    </p>
                  </div>

                  {/* 3. GitHub Profile URL */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-on-surface font-semibold mb-1.5">
                      GitHub Profile Link
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-on-surface-variant pointer-events-none">
                        <span className="material-symbols-outlined text-[18px]">code</span>
                      </span>
                      <input
                        type="text"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/username"
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-surface-variant bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all font-mono"
                      />
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-1">
                      Used by engineering hiring managers to review your open-source projects and code commits.
                    </p>
                  </div>

                  {/* 4. Placement Resume Document */}
                  <div className="pt-2 border-t border-surface-variant">
                    <label className="block text-xs font-mono uppercase tracking-wider text-on-surface font-semibold mb-1.5">
                      Verified Placement Resume (.pdf, .docx, .doc)
                    </label>

                    {/* Currently Active Resume */}
                    {latestResume ? (
                      <div className="mb-3 p-3.5 rounded-lg bg-surface-container-low border border-surface-variant flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[20px]">description</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-primary truncate max-w-[260px] sm:max-w-[340px]">
                              {latestResume.file_name}
                            </p>
                            <p className="text-[11px] font-mono text-on-surface-variant mt-0.5">
                              {latestResume.file_size} · Active in TPC Candidate Pool
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-secondary-container/40 text-secondary font-semibold border border-secondary/20 shrink-0">
                          Active
                        </span>
                      </div>
                    ) : (
                      <div className="mb-3 p-3 rounded-lg bg-surface-container-low border border-dashed border-surface-variant text-xs text-on-surface-variant">
                        No resume uploaded yet. Attach your placement resume below.
                      </div>
                    )}

                    {/* Upload New Resume */}
                    <div className="border border-surface-variant rounded-lg p-4 bg-surface hover:bg-surface-container-low/50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-[24px] text-secondary shrink-0">upload_file</span>
                          <div>
                            <p className="text-xs font-medium text-primary">
                              {resumeFile ? resumeFile.name : 'Upload New Resume Version'}
                            </p>
                            <p className="text-[11px] text-on-surface-variant font-mono">
                              {resumeFile ? `${Math.round(resumeFile.size / 1024)} KB` : 'PDF, DOCX, or DOC up to 5MB'}
                            </p>
                          </div>
                        </div>

                        <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-surface-variant bg-surface hover:bg-surface-container font-mono text-xs text-primary font-medium transition-colors shrink-0">
                          <span>{resumeFile ? 'Change File' : 'Browse File'}</span>
                          <input
                            type="file"
                            accept=".pdf,.docx,.doc"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {resumeFile && (
                        <div className="mt-3 pt-3 border-t border-surface-variant flex items-center justify-between text-xs">
                          <span className="text-secondary font-mono flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">task_alt</span>
                            Ready to upload on save
                          </span>
                          <button
                            type="button"
                            onClick={() => setResumeFile(null)}
                            className="text-error hover:underline text-[11px] font-mono"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Form Buttons */}
                <div className="mt-8 pt-5 border-t border-surface-variant flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
                  <Link
                    href="/home"
                    className="px-5 py-2.5 rounded-lg border border-surface-variant text-xs font-mono text-on-surface hover:bg-surface-container transition-colors text-center"
                  >
                    Back to Portal
                  </Link>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary/90 font-mono text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[16px]">save</span>
                        <span>Save Profile Changes</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>

          </div>

        </div>
      </main>

      <MobileTabBar role="student" />
    </div>
  );
}
