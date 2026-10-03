'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, saveSession } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';

interface TargetRole {
  id: string;
  title: string;
  category: string;
  companies?: string;
  description?: string;
  benchmark_code?: string;
  skills: string[];
  min_cgpa?: string;
}

interface Company {
  id: string;
  name: string;
  tier?: string;
  industry?: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Profile fields (as required by user)
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [school10th, setSchool10th] = useState('');
  const [school10thMarks, setSchool10thMarks] = useState('');
  const [school12th, setSchool12th] = useState('');
  const [school12thMarks, setSchool12thMarks] = useState('');
  const [collegeName, setCollegeName] = useState('National Institute of Engineering');
  const [degree, setDegree] = useState('B.Tech');
  const [branch, setBranch] = useState('Computer Science & Engineering');
  const [graduationYear, setGraduationYear] = useState('2025');
  const [cgpa, setCgpa] = useState('8.45');
  const [achievements, setAchievements] = useState('');

  // Resume file
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Target roles (uploaded by coordinator)
  const [roles, setRoles] = useState<TargetRole[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [customRoleTitle, setCustomRoleTitle] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [dreamCompany, setDreamCompany] = useState('');
  const [loadingRoles, setLoadingRoles] = useState(true);

  // Consent
  const [consentAgreed, setConsentAgreed] = useState(false);

  // Initialize from session if available
  useEffect(() => {
    const session = getSession();
    if (session) {
      if (session.name) setName(session.name);
      if (session.rollNumber) setRollNumber(session.rollNumber);
      if (session.degree) setDegree(session.degree);
      if (session.branch) setBranch(session.branch);
      if (session.graduationYear) setGraduationYear(session.graduationYear);
      if (session.cgpa) setCgpa(session.cgpa);
      if (session.collegeName) setCollegeName(session.collegeName);
    }

    // Fetch target roles uploaded by placement coordinator
    fetch('/api/roles')
      .then((res) => res.json())
      .then((data) => {
        if (data.roles && data.roles.length > 0) {
          setRoles(data.roles);
          setSelectedRoleId(data.roles[0].id);
        }
      })
      .catch((e) => console.warn('Could not load roles:', e))
      .finally(() => setLoadingRoles(false));

    // Fetch companies
    fetch('/api/companies')
      .then((res) => res.json())
      .then((data) => {
        if (data.companies) setCompanies(data.companies);
      })
      .catch((e) => console.warn('Could not load companies:', e));
  }, []);

  const handleFileChange = (incoming: File | null) => {
    setErrorMessage(null);
    if (!incoming) return;

    const ext = incoming.name.substring(incoming.name.lastIndexOf('.')).toLowerCase();
    if (ext !== '.pdf' && ext !== '.docx') {
      setErrorMessage('Please upload a PDF (.pdf) or Word document (.docx).');
      return;
    }
    if (incoming.size > 5 * 1024 * 1024) {
      setErrorMessage('File exceeds the 5MB size limit.');
      return;
    }
    setFile(incoming);
  };

  const selectedRoleObj = roles.find((r) => r.id === selectedRoleId);

  const handleSubmit = async () => {
    if (!consentAgreed) {
      setErrorMessage('Please check the consent box to authorize Placement Cell access.');
      return;
    }
    if (!file) {
      setErrorMessage('Please attach your verified resume document.');
      setStep(2);
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const session = getSession();
      const effectiveRoleTitle = selectedRoleId === 'custom' ? customRoleTitle : (selectedRoleObj?.title || 'Junior Frontend Developer');

      const profilePayload = {
        userId: user?.id || session?.id || 'usr_candidate_' + Date.now(),
        name: name.trim() || user?.user_metadata?.full_name || 'Candidate',
        email: user?.email || session?.email || 'student@nie.ac.in',
        rollNumber: rollNumber.trim(),
        school_10th: school10th.trim(),
        school_10th_marks: school10thMarks.trim(),
        school_12th: school12th.trim(),
        school_12th_marks: school12thMarks.trim(),
        college_name: collegeName.trim(),
        degree: degree.trim(),
        branch: branch.trim(),
        graduation_year: graduationYear.trim(),
        cgpa: cgpa.trim(),
        achievements_text: achievements.trim(),
        target_role_id: selectedRoleId,
        dream_role: effectiveRoleTitle,
        dream_company: dreamCompany.trim() || 'Tier-1 Hiring Benchmark',
        consent_agreed: true,
      };

      const formData = new FormData();
      formData.append('resume', file);
      formData.append('profile', JSON.stringify(profilePayload));

      const res = await fetch('/api/onboarding', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Server responded with ${res.status}: Failed to complete onboarding.`);
      }

      // Sync local session cache
      saveSession({
        id: user?.id || profilePayload.userId,
        name: profilePayload.name,
        email: profilePayload.email,
        role: 'student',
        collegeName: profilePayload.college_name,
      });

      // Route directly to waiting analysis screen
      router.push(`/analyses/waiting/${data.analysisId}`);
    } catch (err: any) {
      console.error('Onboarding submission notice:', err);
      setErrorMessage(err.message || 'Error completing onboarding. Please retry.');
      setSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between antialiased selection:bg-primary-container selection:text-on-primary">
      {/* Top Header */}
      <header className="px-6 lg:px-12 py-4 flex items-center justify-between border-b border-surface-container-highest bg-surface/90 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-display font-bold text-base shadow-xs">
            R
          </div>
          <span className="font-headline font-semibold text-lg text-primary tracking-tight">
            Readiness
          </span>
          <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-surface-container-high text-on-surface-variant border border-outline-variant/30">
            Student Onboarding & Verification
          </span>
        </div>

        <div className="text-xs font-mono text-on-surface-variant">
          Step {step} of 4: {step === 1 ? 'Academic Record' : step === 2 ? 'Resume Document' : step === 3 ? 'Target Placement Role' : 'TPC Consent'}
        </div>
      </header>

      {/* Stepper Indicator */}
      <div className="bg-surface-container-low border-b border-surface-container-highest py-3 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {[
            { s: 1, label: '1. Academic Profile' },
            { s: 2, label: '2. Resume Document' },
            { s: 3, label: '3. Placement Track' },
            { s: 4, label: '4. TPC Authorization' },
          ].map((item) => (
            <button
              key={item.s}
              onClick={() => {
                if (item.s < step) setStep(item.s as any);
              }}
              disabled={item.s > step}
              className={`flex items-center gap-2 text-xs font-mono transition-colors ${
                step === item.s
                  ? 'text-primary font-bold border-b-2 border-primary pb-1'
                  : item.s < step
                  ? 'text-secondary hover:underline cursor-pointer'
                  : 'text-outline cursor-not-allowed'
              }`}
            >
              <span>{item.label}</span>
              {item.s < step && (
                <span className="material-symbols-outlined text-[14px]">check</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Form Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 md:py-12">
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-error-container/20 border border-error/30 text-error text-xs font-body flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Academic & Personal Data */}
        {step === 1 && (
          <div className="bg-surface-container-lowest border border-surface-container-highest rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-secondary font-semibold">
                Candidate Credentials
              </span>
              <h1 className="font-headline text-2xl text-primary font-semibold mt-1">
                Personal & Academic History
              </h1>
              <p className="font-body text-xs text-on-surface-variant mt-1 leading-relaxed">
                Provide your verified academic scores and credentials. These are cross-referenced with your department placement records.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-on-surface-variant mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sundaram"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-surface-container-highest bg-surface-container-low text-on-surface text-xs focus:outline-none focus:border-primary font-body"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-on-surface-variant mb-1">
                  College Roll Number / USN *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 4NI21CS042"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-surface-container-highest bg-surface-container-low text-on-surface text-xs focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-on-surface-variant mb-1">
                  Class 10th School / Board *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Delhi Public School / CBSE"
                  value={school10th}
                  onChange={(e) => setSchool10th(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-surface-container-highest bg-surface-container-low text-on-surface text-xs focus:outline-none focus:border-primary font-body"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-on-surface-variant mb-1">
                  Class 10th Marks / Percentage *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 94.2% or 9.6 CGPA"
                  value={school10thMarks}
                  onChange={(e) => setSchool10thMarks(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-surface-container-highest bg-surface-container-low text-on-surface text-xs focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-on-surface-variant mb-1">
                  Class 12th / PUC College & Board *
                </label>
                <input
                  type="text"
                  placeholder="e.g. National PU College / State Board"
                  value={school12th}
                  onChange={(e) => setSchool12th(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-surface-container-highest bg-surface-container-low text-on-surface text-xs focus:outline-none focus:border-primary font-body"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-on-surface-variant mb-1">
                  Class 12th Marks / Percentage *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 96.0%"
                  value={school12thMarks}
                  onChange={(e) => setSchool12thMarks(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-surface-container-highest bg-surface-container-low text-on-surface text-xs focus:outline-none focus:border-primary font-mono"
                />
              </div>
            </div>

            {/* Undergraduate Section */}
            <div className="pt-4 border-t border-surface-container-highest">
              <span className="font-mono text-[10px] uppercase tracking-wider text-outline font-semibold">
                Undergraduate Information
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-mono uppercase text-on-surface-variant mb-1">
                    College / Institution
                  </label>
                  <input
                    type="text"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-surface-container-highest bg-surface-container-low text-on-surface text-xs font-body focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-on-surface-variant mb-1">
                    Degree
                  </label>
                  <input
                    type="text"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-surface-container-highest bg-surface-container-low text-on-surface text-xs font-mono focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-on-surface-variant mb-1">
                    Branch / Major
                  </label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-surface-container-highest bg-surface-container-low text-on-surface text-xs font-body focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-on-surface-variant mb-1">
                    Graduation Year
                  </label>
                  <input
                    type="text"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-surface-container-highest bg-surface-container-low text-on-surface text-xs font-mono focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-on-surface-variant mb-1">
                    Current CGPA *
                  </label>
                  <input
                    type="text"
                    required
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-surface-container-highest bg-surface-container-low text-on-surface text-xs font-mono focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* Achievements & Certifications */}
            <div className="pt-4 border-t border-surface-container-highest">
              <label className="block text-[11px] font-mono uppercase text-on-surface-variant mb-1">
                Achievements, Hackathons & Key Certifications
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Smart India Hackathon Finalist, AWS Certified Cloud Practitioner, LeetCode 350+ solved (Rating: 1740), Published paper in IEEE conference..."
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-surface-container-highest bg-surface-container-low text-on-surface text-xs font-body focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => {
                  if (!name.trim()) {
                    setErrorMessage('Please enter your full name.');
                    return;
                  }
                  setErrorMessage(null);
                  setStep(2);
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-semibold text-xs transition-all shadow-sm"
              >
                <span>Continue to Resume Upload</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Resume File Upload */}
        {step === 2 && (
          <div className="bg-surface-container-lowest border border-surface-container-highest rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-secondary font-semibold">
                Portfolio Ingestion
              </span>
              <h1 className="font-headline text-2xl text-primary font-semibold mt-1">
                Upload Engineering Resume
              </h1>
              <p className="font-body text-xs text-on-surface-variant mt-1 leading-relaxed">
                Accepted formats: PDF or DOCX (maximum 5MB). Scanned image PDFs without a selectable text layer will be rejected.
              </p>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileChange(e.dataTransfer.files[0]);
                }
              }}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all ${
                dragActive
                  ? 'border-primary bg-primary-container/10'
                  : file
                  ? 'border-secondary bg-secondary-container/10'
                  : 'border-surface-container-highest bg-surface-container-low hover:border-outline'
              }`}
            >
              <input
                type="file"
                id="resumeUploadInput"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              {file ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-secondary-container/30 text-secondary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[28px]">description</span>
                  </div>
                  <div>
                    <p className="font-headline text-base font-semibold text-primary">
                      {file.name}
                    </p>
                    <p className="font-mono text-xs text-on-surface-variant mt-0.5">
                      {Math.round(file.size / 1024)} KB · Ready for analysis
                    </p>
                  </div>
                  <label
                    htmlFor="resumeUploadInput"
                    className="text-xs font-mono text-secondary hover:underline cursor-pointer pt-2"
                  >
                    Change document
                  </label>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center">
                    <span className="material-symbols-outlined text-[28px]">upload_file</span>
                  </div>
                  <div>
                    <p className="font-headline text-base font-semibold text-primary">
                      Drag and drop your resume here
                    </p>
                    <p className="font-body text-xs text-on-surface-variant mt-0.5">
                      or browse from your computer
                    </p>
                  </div>
                  <label
                    htmlFor="resumeUploadInput"
                    className="px-4 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-primary font-semibold text-xs font-mono cursor-pointer transition-colors"
                  >
                    Select PDF / DOCX
                  </label>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-surface-container-highest">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl border border-surface-container-highest text-on-surface text-xs font-mono hover:bg-surface-container transition-colors"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!file) {
                    setErrorMessage('Please select a resume file before continuing.');
                    return;
                  }
                  setErrorMessage(null);
                  setStep(3);
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-semibold text-xs transition-all shadow-sm"
              >
                <span>Continue to Target Role</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Target Role Uploaded by Placement Coordinator */}
        {step === 3 && (
          <div className="bg-surface-container-lowest border border-surface-container-highest rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-secondary font-semibold">
                Campus Drive Mapping
              </span>
              <h1 className="font-headline text-2xl text-primary font-semibold mt-1">
                Select Coordinator-Uploaded Role
              </h1>
              <p className="font-body text-xs text-on-surface-variant mt-1 leading-relaxed">
                Roles are published directly by the Training & Placement Cell with verified minimum CGPA and syllabus benchmarks.
              </p>
            </div>

            {loadingRoles ? (
              <div className="py-8 text-center text-xs font-mono text-on-surface-variant flex items-center justify-center gap-2">
                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                <span>Loading active campus placement tracks...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {roles.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRoleId(r.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedRoleId === r.id
                        ? 'border-primary bg-primary-container/10 ring-1 ring-primary'
                        : 'border-surface-container-highest bg-surface-container-low hover:border-outline'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-headline text-sm font-semibold text-primary">
                            {r.title}
                          </h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface-container-high text-on-surface-variant">
                            {r.category}
                          </span>
                          {r.min_cgpa && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-secondary-container/30 text-secondary font-semibold">
                              Min CGPA: {r.min_cgpa}
                            </span>
                          )}
                        </div>
                        {r.companies && (
                          <p className="font-mono text-[11px] text-on-surface-variant mt-1">
                            Benchmark partners: {r.companies}
                          </p>
                        )}
                        {r.skills && r.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {r.skills.map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface-container text-on-surface border border-surface-container-highest"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="shrink-0 mt-1">
                        <span className={`material-symbols-outlined text-[20px] ${
                          selectedRoleId === r.id ? 'text-primary' : 'text-outline'
                        }`}>
                          {selectedRoleId === r.id ? 'radio_button_checked' : 'radio_button_unchecked'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Custom Role Option */}
                <div
                  onClick={() => setSelectedRoleId('custom')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedRoleId === 'custom'
                      ? 'border-primary bg-primary-container/10 ring-1 ring-primary'
                      : 'border-surface-container-highest bg-surface-container-low hover:border-outline'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-headline text-sm font-semibold text-primary">
                        Custom Role / Target JD
                      </h3>
                      <p className="font-body text-xs text-on-surface-variant">
                        Diagnostic against a specialized off-campus job description.
                      </p>
                    </div>
                    <span className={`material-symbols-outlined text-[20px] ${
                      selectedRoleId === 'custom' ? 'text-primary' : 'text-outline'
                    }`}>
                      {selectedRoleId === 'custom' ? 'radio_button_checked' : 'radio_button_unchecked'}
                    </span>
                  </div>

                  {selectedRoleId === 'custom' && (
                    <div className="mt-3 pt-3 border-t border-surface-container-highest">
                      <input
                        type="text"
                        placeholder="Enter specific role title (e.g. AI Systems Engineer)"
                        value={customRoleTitle}
                        onChange={(e) => setCustomRoleTitle(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-surface-container-highest bg-surface-container-low text-xs font-body focus:outline-none focus:border-primary"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Dream Company Target */}
            <div className="pt-4 border-t border-surface-container-highest">
              <label className="block text-[11px] font-mono uppercase text-on-surface-variant mb-1">
                Target / Dream Company (Optional)
              </label>
              <input
                type="text"
                list="companiesList"
                placeholder="e.g. Razorpay, Swiggy, Google, TCS Digital"
                value={dreamCompany}
                onChange={(e) => setDreamCompany(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-surface-container-highest bg-surface-container-low text-xs font-body focus:outline-none focus:border-primary"
              />
              <datalist id="companiesList">
                {companies.map((c) => (
                  <option key={c.id} value={c.name} />
                ))}
              </datalist>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-surface-container-highest">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl border border-surface-container-highest text-on-surface text-xs font-mono hover:bg-surface-container transition-colors"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setStep(4);
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-semibold text-xs transition-all shadow-sm"
              >
                <span>Continue to Authorization</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Institutional Consent & Submission */}
        {step === 4 && (
          <div className="bg-surface-container-lowest border border-surface-container-highest rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-secondary font-semibold">
                Institutional Policy
              </span>
              <h1 className="font-headline text-2xl text-primary font-semibold mt-1">
                Training & Placement Cell Authorization
              </h1>
              <p className="font-body text-xs text-on-surface-variant mt-1 leading-relaxed">
                Review your profile summary and sign the campus diagnostic placement consent before generating your readiness ledger.
              </p>
            </div>

            {/* Summary Review Card */}
            <div className="bg-surface-container-low border border-surface-container-highest rounded-xl p-5 space-y-3 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-surface-container-highest">
                <span className="text-on-surface-variant">Candidate Name:</span>
                <span className="text-primary font-semibold">{name || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-container-highest">
                <span className="text-on-surface-variant">Academic Stream:</span>
                <span className="text-primary">{degree} · {branch} ({graduationYear})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-container-highest">
                <span className="text-on-surface-variant">Cumulative CGPA:</span>
                <span className="text-primary font-bold">{cgpa}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-container-highest">
                <span className="text-on-surface-variant">Target Role:</span>
                <span className="text-secondary font-semibold">
                  {selectedRoleId === 'custom' ? customRoleTitle : selectedRoleObj?.title}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-on-surface-variant">Resume File:</span>
                <span className="text-primary">{file?.name} ({file ? Math.round(file.size / 1024) : 0} KB)</span>
              </div>
            </div>

            {/* Institutional Placement Consent Box */}
            <div className="p-4 rounded-xl border border-secondary/30 bg-secondary-container/10 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentAgreed}
                  onChange={(e) => setConsentAgreed(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-outline text-primary focus:ring-primary"
                />
                <div className="text-xs text-on-surface leading-relaxed">
                  <span className="font-semibold text-primary block mb-0.5">
                    Campus Diagnostic & Recruitment Disclosure Consent
                  </span>
                  I hereby authorize the institutional Training & Placement Cell (TPC), faculty coordinators, and assigned engineering mentors to inspect my verified academic records, uploaded resume, and AI-generated skill gap appraisals for placement shortlisting, mentoring interventions, and campus recruitment drives.
                </div>
              </label>
            </div>

            {errorMessage && (
              <div className="p-4 rounded-xl bg-error-container/20 border border-error/30 text-error text-xs font-body flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-surface-container-highest">
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl border border-surface-container-highest text-on-surface text-xs font-mono hover:bg-surface-container transition-colors disabled:opacity-50"
              >
                ← Back
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !consentAgreed}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-semibold text-xs transition-all shadow-sm disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    <span>Extracting & Ingesting Ledger...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Diagnostic Appraisal</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="px-6 lg:px-12 py-4 border-t border-surface-container-highest text-xs font-mono text-on-surface-variant flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>Readiness Institutional Intake</span>
        <span>Version 2025.1 · All records logged under audit ledger</span>
      </footer>
    </div>
  );
}
