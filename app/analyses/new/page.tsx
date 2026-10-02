'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/layout/TopNav';
import MobileTabBar from '@/components/layout/MobileTabBar';
import ErrorState from '@/components/ui/ErrorState';

const CURATED_ROLES = [
  {
    id: 'role_jfd',
    title: 'Junior Frontend Developer',
    subtitle: 'Razorpay / Urban Company track',
    category: 'Product Engineering',
    skills: ['React', 'TypeScript', 'CSS Grid', 'Tailwind', 'Redux / State', 'Unit Testing'],
    benchmark: 'Tier-1 Product Frontend v3.2',
  },
  {
    id: 'role_ase',
    title: 'Associate Software Engineer',
    subtitle: 'TCS Digital / Infosys DSE track',
    category: 'Enterprise IT Services',
    skills: ['Java', 'Spring Boot', 'SQL Joins', 'REST APIs', 'Data Structures', 'Git'],
    benchmark: 'Standard Campus Syllabus 2024',
  },
  {
    id: 'role_da',
    title: 'Data Analyst',
    subtitle: 'Mu Sigma / Fractal track',
    category: 'Analytics & BI',
    skills: ['Python', 'Pandas', 'PostgreSQL', 'Tableau / PowerBI', 'A/B Testing', 'Statistics'],
    benchmark: 'Analytics Associate Standard v2.8',
  },
  {
    id: 'role_pe',
    title: 'Product Engineer (Backend)',
    subtitle: 'Swiggy / Zomato track',
    category: 'Backend & Distributed',
    skills: ['Node.js', 'PostgreSQL', 'Redis Caching', 'Docker', 'System Design', 'Kafka'],
    benchmark: 'Backend Tier-1 Rubric v4.0',
  },
  {
    id: 'role_se',
    title: 'Systems & Cloud Engineer',
    subtitle: 'AWS / Cisco track',
    category: 'Infrastructure',
    skills: ['Linux Kernel', 'Bash Scripting', 'Networking', 'AWS / GCP', 'Kubernetes', 'CI/CD'],
    benchmark: 'Cloud Operations Standard v1.9',
  },
  {
    id: 'role_qa',
    title: 'QA & Automation Engineer',
    subtitle: 'BrowserStack / Postman track',
    category: 'Quality Engineering',
    skills: ['Selenium', 'Cypress', 'Playwright', 'Jest', 'API Testing', 'Performance'],
    benchmark: 'SDET Campus Benchmark v2.1',
  },
];

export default function NewAnalysisPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1 State: Resume File
  const [resumeFile, setResumeFile] = useState<{ name: string; size: string } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Step 2 State: Target Role
  const [roleTab, setRoleTab] = useState<'curated' | 'custom'>('curated');
  const [selectedRole, setSelectedRole] = useState<string>('role_jfd');
  const [searchQuery, setSearchQuery] = useState('');
  const [customJD, setCustomJD] = useState('');

  // Handle File Input
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setFileError(null);
    const validExtensions = ['.pdf', '.docx'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(ext)) {
      setFileError('Invalid file format. Please upload a PDF or DOCX document.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFileError('File exceeds 5MB limit. Please upload a smaller document.');
      return;
    }

    // Simulation of scanned image check
    if (file.name.toLowerCase().includes('scanned')) {
      setFileError('Unreadable text layer. Scanned images cannot be parsed. Please use an export from Word or Docs.');
      return;
    }

    const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    setResumeFile({ name: file.name, size: sizeStr });
  };

  const activeRoleData = CURATED_ROLES.find((r) => r.id === selectedRole) || CURATED_ROLES[0];

  const handleStartAnalysis = () => {
    const analysisId = 'anl_' + Date.now();
    router.push(`/analyses/waiting/${analysisId}`);
  };

  const filteredRoles = CURATED_ROLES.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex flex-col pb-20 md:pb-12">
      <TopNav />

      <main className="flex-1 w-full pt-16 bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          
          {/* 3-Step Archival Stepper */}
          <nav aria-label="Analysis Progress" className="w-full mb-8">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-[1px] bg-outline-variant/40 -z-0"></div>

              {/* Step 1 */}
              <div className="relative z-10 flex items-center gap-2 bg-surface pr-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs shadow-sm ${
                    currentStep > 1
                      ? 'bg-[#E8F0EA] text-[#4F7A5A]'
                      : 'bg-primary-container text-on-primary font-bold'
                  }`}
                >
                  {currentStep > 1 ? (
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  ) : (
                    '01'
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">Step 01</span>
                  <span className={`text-xs font-semibold ${currentStep === 1 ? 'text-primary' : 'text-on-surface'}`}>
                    Upload resume
                  </span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative z-10 flex items-center gap-2 bg-surface px-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs shadow-sm ${
                    currentStep > 2
                      ? 'bg-[#E8F0EA] text-[#4F7A5A]'
                      : currentStep === 2
                      ? 'bg-primary-container text-on-primary font-bold ring-2 ring-primary/20'
                      : 'bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  {currentStep > 2 ? (
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  ) : (
                    '02'
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">Step 02</span>
                  <span className={`text-xs font-semibold ${currentStep === 2 ? 'text-primary' : 'text-on-surface'}`}>
                    Target role
                  </span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative z-10 flex items-center gap-2 bg-surface pl-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs shadow-sm ${
                    currentStep === 3
                      ? 'bg-primary-container text-on-primary font-bold ring-2 ring-primary/20'
                      : 'bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  03
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">Step 03</span>
                  <span className={`text-xs font-semibold ${currentStep === 3 ? 'text-primary' : 'text-on-surface-variant'}`}>
                    Review & Diagnose
                  </span>
                </div>
              </div>
            </div>
          </nav>

          {/* Step 1: Upload Resume */}
          {currentStep === 1 && (
            <div className="bg-surface-container-lowest border border-surface-container-highest rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 sm:p-8 border-b border-surface-container-highest">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-surface-container font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
                    Intake Protocol
                  </span>
                  <span className="text-outline-variant">•</span>
                  <span className="font-mono text-[10px] text-on-surface-variant">Confidential Parse 1.0</span>
                </div>
                <h1 className="font-headline text-2xl text-primary font-semibold">
                  Upload your engineering resume
                </h1>
                <p className="font-body text-xs sm:text-sm text-on-surface-variant mt-1 max-w-2xl">
                  We parse your project descriptions, technology mentions, and work experience verbatim to match against placement rubrics.
                </p>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                {fileError && (
                  <ErrorState
                    errorMessage={fileError}
                    onRetry={() => setFileError(null)}
                    onRemove={() => setFileError(null)}
                  />
                )}

                {/* Dropzone */}
                {!resumeFile ? (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleFileDrop}
                    className={`border-2 border-dashed rounded-xl p-8 sm:p-12 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                      isDragging
                        ? 'border-primary bg-primary-fixed/20'
                        : 'border-outline-variant/60 hover:border-primary/50 bg-surface-container-low/40'
                    }`}
                  >
                    <input
                      type="file"
                      id="resume-upload-input"
                      accept=".pdf,.docx"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                    <label htmlFor="resume-upload-input" className="cursor-pointer flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center mb-4 text-primary shadow-xs">
                        <span className="material-symbols-outlined text-[28px]">upload_file</span>
                      </div>
                      <span className="font-headline text-base font-semibold text-primary mb-1">
                        Click to select resume or drag and drop
                      </span>
                      <p className="font-body text-xs text-on-surface-variant max-w-sm">
                        Supports text-based PDF or DOCX up to 5MB. Password-protected or image-only scanned files cannot be processed.
                      </p>
                    </label>
                  </div>
                ) : (
                  /* Uploaded File Pill */
                  <div className="bg-surface-container-low rounded-xl p-4 sm:p-5 flex items-center justify-between border border-surface-variant">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                        <span className="material-symbols-outlined text-[24px]">picture_as_pdf</span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-sm text-on-surface truncate">{resumeFile.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-xs text-on-surface-variant">{resumeFile.size}</span>
                          <span className="text-outline-variant">•</span>
                          <span className="font-mono text-xs text-[#4F7A5A] flex items-center gap-1 font-semibold">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            Text Layer Verified
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setResumeFile(null)}
                      className="text-on-surface-variant hover:text-error p-2 rounded-lg hover:bg-surface-container-high transition-colors"
                      title="Remove file"
                    >
                      <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                  </div>
                )}

                {/* Continue Bar */}
                <div className="pt-4 border-t border-surface-container-highest flex items-center justify-between">
                  <Link
                    href="/home"
                    className="text-on-surface-variant hover:text-on-surface text-xs font-semibold"
                  >
                    Cancel
                  </Link>

                  <button
                    onClick={() => setCurrentStep(2)}
                    disabled={!resumeFile}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span>Proceed to target role</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Choose Target Role */}
          {currentStep === 2 && (
            <div className="bg-surface-container-lowest border border-surface-container-highest rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 sm:p-8 border-b border-surface-container-highest">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-surface-container font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
                    Calibration Matrix
                  </span>
                  <span className="text-outline-variant">•</span>
                  <span className="font-mono text-[10px] text-on-surface-variant">Syllabus 2024.2</span>
                </div>
                <h1 className="font-headline text-2xl text-primary font-semibold">
                  Which role are you aiming for?
                </h1>
                <p className="font-body text-xs sm:text-sm text-on-surface-variant mt-1">
                  Select a curated industry benchmark or supply a job description to calibrate diagnostic weights.
                </p>

                {/* Switcher Tabs */}
                <div className="flex items-center gap-4 mt-6 border-b border-surface-container-highest">
                  <button
                    onClick={() => setRoleTab('curated')}
                    className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors ${
                      roleTab === 'curated'
                        ? 'border-primary text-primary font-bold'
                        : 'border-transparent text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Curated Placement Roles ({CURATED_ROLES.length})
                  </button>
                  <button
                    onClick={() => setRoleTab('custom')}
                    className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors ${
                      roleTab === 'custom'
                        ? 'border-primary text-primary font-bold'
                        : 'border-transparent text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Paste Custom Job Description
                  </button>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                {roleTab === 'curated' ? (
                  <>
                    {/* Search */}
                    <div className="relative">
                      <span className="material-symbols-outlined text-[18px] text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2">
                        search
                      </span>
                      <input
                        type="text"
                        placeholder="Search roles or technologies (React, Java, SQL, Python)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-lg bg-surface-container-low border border-surface-container-highest text-xs text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>

                    {/* Roles Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredRoles.map((role) => {
                        const isSelected = selectedRole === role.id;
                        return (
                          <div
                            key={role.id}
                            onClick={() => setSelectedRole(role.id)}
                            className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'border-primary bg-primary-fixed/20 shadow-xs'
                                : 'border-surface-container-highest bg-surface-container-lowest hover:bg-surface-container-low/50'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="font-mono text-[10px] text-secondary font-semibold uppercase">
                                  {role.category}
                                </span>
                                <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-primary bg-primary text-on-primary' : 'border-outline-variant'}`}>
                                  {isSelected && <span className="material-symbols-outlined text-[12px]">check</span>}
                                </span>
                              </div>
                              <h3 className="font-headline font-semibold text-sm text-primary">{role.title}</h3>
                              <p className="font-body text-xs text-on-surface-variant mt-0.5">{role.subtitle}</p>

                              <div className="flex flex-wrap gap-1.5 mt-3">
                                {role.skills.map((s) => (
                                  <span key={s} className="px-2 py-0.5 rounded bg-surface-container text-[10px] font-mono text-on-surface">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <span className="font-mono text-[9px] text-outline mt-3 block">
                              Benchmark: {role.benchmark}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  /* Custom JD Textarea */
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-on-surface">
                      Paste the Job Description or Placement Notification
                    </label>
                    <textarea
                      rows={8}
                      placeholder="Paste requirement text from recruiter JD (responsibilities, required qualifications, technical stack)..."
                      value={customJD}
                      onChange={(e) => setCustomJD(e.target.value)}
                      className="w-full p-4 rounded-xl border border-surface-container-highest bg-surface-container-low text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
                    />
                    <div className="flex items-center justify-between text-[11px] font-mono text-on-surface-variant">
                      <span>Minimum 300 characters for statistical confidence</span>
                      <span className={customJD.length >= 300 ? 'text-[#4F7A5A] font-semibold' : 'text-secondary'}>
                        {customJD.length} / 300 min
                      </span>
                    </div>
                  </div>
                )}

                {/* Stepper Navigation Buttons */}
                <div className="pt-4 border-t border-surface-container-highest flex items-center justify-between">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="text-on-surface-variant hover:text-on-surface text-xs font-semibold"
                  >
                    ← Back to resume
                  </button>

                  <button
                    onClick={() => setCurrentStep(3)}
                    disabled={roleTab === 'custom' && customJD.length < 300}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span>Review & confirm</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review & Diagnose */}
          {currentStep === 3 && (
            <div className="bg-surface-container-lowest border border-surface-container-highest rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 sm:p-8 border-b border-surface-container-highest">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-surface-container font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
                    Pre-Diagnostic Review
                  </span>
                  <span className="text-outline-variant">•</span>
                  <span className="font-mono text-[10px] text-on-surface-variant">Step 03 of 03</span>
                </div>
                <h1 className="font-headline text-2xl text-primary font-semibold">
                  Confirm diagnostic parameters
                </h1>
                <p className="font-body text-xs sm:text-sm text-on-surface-variant mt-1">
                  Verify the intake document and benchmark syllabus before queuing the evaluation ledger.
                </p>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* File Review Card */}
                  <div className="p-4 rounded-xl bg-surface-container-low border border-surface-variant">
                    <span className="font-mono text-[10px] uppercase text-outline font-semibold">Intake Document</span>
                    <h3 className="font-semibold text-sm text-primary mt-1">{resumeFile?.name || 'Resume.pdf'}</h3>
                    <p className="font-mono text-xs text-on-surface-variant mt-0.5">{resumeFile?.size || '1.8 MB'} • Selectable text confirmed</p>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="text-primary hover:underline text-xs font-semibold mt-3 block"
                    >
                      Change file →
                    </button>
                  </div>

                  {/* Role Review Card */}
                  <div className="p-4 rounded-xl bg-surface-container-low border border-surface-variant">
                    <span className="font-mono text-[10px] uppercase text-outline font-semibold">Target Evaluation Benchmark</span>
                    <h3 className="font-semibold text-sm text-primary mt-1">
                      {roleTab === 'curated' ? activeRoleData.title : 'Custom Job Description'}
                    </h3>
                    <p className="font-body text-xs text-on-surface-variant mt-0.5">
                      {roleTab === 'curated' ? activeRoleData.subtitle : `${customJD.substring(0, 60)}...`}
                    </p>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="text-primary hover:underline text-xs font-semibold mt-3 block"
                    >
                      Change role →
                    </button>
                  </div>
                </div>

                {/* Audit Standard Note */}
                <div className="p-4 rounded-xl bg-surface-container border border-surface-variant/70 text-xs text-on-surface-variant leading-relaxed">
                  <div className="flex items-center gap-2 text-primary font-semibold mb-1">
                    <span className="material-symbols-outlined text-[16px]">info</span>
                    <span>AI First-Pass Audit Guarantee</span>
                  </div>
                  Our background extraction checks for verbatim source sentences in your resume. If a skill has no metrics or demonstrated implementation, it will be marked as "Needs stronger proof" rather than arbitrarily penalizing your readiness score.
                </div>

                {/* Navigation Bar */}
                <div className="pt-4 border-t border-surface-container-highest flex items-center justify-between">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="text-on-surface-variant hover:text-on-surface text-xs font-semibold"
                  >
                    ← Back to role selection
                  </button>

                  <button
                    onClick={handleStartAnalysis}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-colors shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                    <span>Analyse my resume</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      <MobileTabBar role="student" />
    </div>
  );
}
