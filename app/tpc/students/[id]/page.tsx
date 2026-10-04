'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import TopNav from '@/components/layout/TopNav';
import Sidebar from '@/components/layout/Sidebar';
import MobileTabBar from '@/components/layout/MobileTabBar';
import { getSession } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';

interface CoachingNote {
  id: string;
  author: string;
  timestamp: string;
  text: string;
}

interface CompetencyItem {
  id: string;
  name: string;
  status: 'strong' | 'needs_proof' | 'missing';
  status_label?: string;
  jd_requirement?: string;
  evidence_quote?: string;
  plain_explanation?: string;
}

const FALLBACK_CANDIDATE: Record<string, any> = {
  '36ac8503-c1c5-4865-b3f5-51c302a3e1ee': {
    name: 'Durga sravan Challagolla',
    rollNumber: '2021BCS0089',
    branch: 'Computer Science & Engineering',
    degree: 'B.Tech',
    cgpa: '8.45',
    targetRole: 'Junior Frontend Developer',
    targetCompany: 'Razorpay',
    readinessScore: 78,
    school10th: 'Delhi Public School (CBSE)',
    school10thMarks: '94.2%',
    school12th: 'Narayana PU College (State Board)',
    school12thMarks: '96.5%',
    achievements: '• Smart India Hackathon Finalist\n• Solved 350+ problems on LeetCode\n• Open source contributor to React libraries',
    resumeFileName: 'durga_sravan_resume.pdf',
    resumeFileSize: '142 KB',
  },
  usr_ananya: {
    name: 'Ananya Reddy',
    rollNumber: '2021BCS0089',
    branch: 'Computer Science & Engineering',
    degree: 'B.Tech',
    cgpa: '8.74',
    targetRole: 'Junior Frontend Developer',
    targetCompany: 'Razorpay',
    readinessScore: 72,
    school10th: 'DPS Bangalore (CBSE)',
    school10thMarks: '95.0%',
    school12th: 'Christ Junior College (State Board)',
    school12thMarks: '96.2%',
    achievements: '• Lead Organizer, IEEE NIE Student Branch\n• Built Campus Connect full stack portal\n• Google Summer of Code 2024 Contributor',
    resumeFileName: 'ananya_reddy_resume.pdf',
    resumeFileSize: '156 KB',
  },
  usr_aarav_01: {
    name: 'Aarav Sundaram',
    rollNumber: '4NI21EC042',
    branch: 'Electronics & Communication',
    degree: 'B.Tech',
    cgpa: '8.45',
    targetRole: 'Embedded Systems Engineer',
    targetCompany: 'Qualcomm',
    readinessScore: 74,
    school10th: 'Delhi Public School, Bangalore (CBSE)',
    school10thMarks: '94.2%',
    school12th: 'National PU College, Bangalore (State Board)',
    school12thMarks: '96.0%',
    achievements: '• Smart India Hackathon 2024 Finalist (Team Lead)\n• Solved 350+ problems on LeetCode (Contest Rating: 1740)\n• Open source contributor to FreeRTOS ESP32 drivers',
    resumeFileName: 'aarav_sundaram_resume.pdf',
    resumeFileSize: '142 KB',
  },
};

const INITIAL_NOTES: CoachingNote[] = [
  {
    id: 'note_1',
    author: 'Prof. Ravi Sharma',
    timestamp: '14 Sept, 11:30 AM',
    text: '“Spoke to student after mock technical interview. Fundamentals are solid, but state management needs verifiable proof on GitHub before campus drives begin.”',
  },
  {
    id: 'note_2',
    author: 'Placement Desk',
    timestamp: '12 Sept, 04:15 PM',
    text: '“Initial resume parsed. Enrolled in Tier-1 Product Preparation Sprint.”',
  },
];

export default function StudentCoachingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = (params?.id as string) || 'usr_aarav_01';

  // Candidate Data State
  const [candidate, setCandidate] = useState<any>(FALLBACK_CANDIDATE[studentId] || FALLBACK_CANDIDATE['usr_aarav_01']);
  const [analysisId, setAnalysisId] = useState<string>('default');
  const [competencies, setCompetencies] = useState<CompetencyItem[]>([]);
  const [roadmapTasks, setRoadmapTasks] = useState<any[]>([]);
  const [notes, setNotes] = useState<CoachingNote[]>(INITIAL_NOTES);
  const [newNoteText, setNewNoteText] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'diagnosis' | 'roadmap' | 'academics' | 'flags' | 'notes'>('diagnosis');
  const [loading, setLoading] = useState(true);

  // Chance & Flag state
  const [flagCount, setFlagCount] = useState(1);
  const [chancesUsed, setChancesUsed] = useState(0);
  const [programStatus, setProgramStatus] = useState<'active' | 'at_risk' | 'terminated'>('at_risk');
  const [showChanceModal, setShowChanceModal] = useState(false);
  const [chanceReason, setChanceReason] = useState('');
  const [grantingChance, setGrantingChance] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Guard against unauthorized student access
  useEffect(() => {
    const session = getSession();
    const cookieRole = typeof document !== 'undefined'
      ? document.cookie.split('; ').find(row => row.startsWith('readiness_role='))?.split('=')[1]
      : null;

    const effectiveRole = cookieRole || session?.role || 'student';

    if (effectiveRole !== 'coordinator' && effectiveRole !== 'admin') {
      const lastPath = typeof document !== 'undefined'
        ? document.cookie.split('; ').find(row => row.startsWith('readiness_last_student_path='))?.split('=')[1]
        : null;
      const target = (lastPath && lastPath.startsWith('/analyses'))
        ? `${lastPath}${lastPath.includes('?') ? '&' : '?'}restricted=tpc`
        : '/home?restricted=tpc';
      router.replace(target);
      return;
    }
  }, [router]);

  // Fetch candidate profile, analysis, and notes from Supabase
  useEffect(() => {
    async function fetchCandidateData() {
      try {
        const supabase = createClient();

        // 1. Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .or(`id.eq.${studentId},email.eq.${studentId}`)
          .maybeSingle();

        // 2. Fetch analysis
        const { data: analyses } = await supabase
          .from('analyses')
          .select('*')
          .or(`user_id.eq.${studentId},id.eq.${studentId}`)
          .order('created_at', { ascending: false });

        const latestAnalysis = analyses && analyses.length > 0 ? analyses[0] : null;
        if (latestAnalysis) {
          setAnalysisId(latestAnalysis.id);

          // 3. Fetch analysis items (competencies)
          const { data: items } = await supabase
            .from('analysis_items')
            .select('*')
            .eq('analysis_id', latestAnalysis.id)
            .order('created_at', { ascending: true });

          if (items && items.length > 0) {
            setCompetencies(items);
          }

          // 4. Fetch roadmap tasks
          const { data: tasks } = await supabase
            .from('roadmap_tasks')
            .select('*')
            .eq('analysis_id', latestAnalysis.id)
            .order('created_at', { ascending: true });

          if (tasks && tasks.length > 0) {
            setRoadmapTasks(tasks);
          }
        }

        // 5. Fetch program status
        const { data: pStatus } = await supabase
          .from('program_status')
          .select('*')
          .eq('student_id', studentId)
          .maybeSingle();

        if (pStatus) {
          setProgramStatus((pStatus.status as any) || 'active');
          setFlagCount(pStatus.flag_count ?? 0);
          setChancesUsed(pStatus.chances_used ?? 0);
        }

        // 6. Fetch coaching notes from API
        try {
          const notesRes = await fetch(`/api/tpc/notes?studentId=${studentId}`);
          const notesData = await notesRes.json();
          if (notesData.notes && notesData.notes.length > 0) {
            const mappedNotes: CoachingNote[] = notesData.notes.map((n: any) => ({
              id: n.id,
              author: n.coordinator_id || 'Prof. Ravi Sharma',
              timestamp: new Date(n.created_at).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }),
              text: `“${n.note_text}”`,
            }));
            setNotes(mappedNotes);
          }
        } catch (e) {
          console.warn('Could not fetch coach notes:', e);
        }

        // Merge profile into candidate state
        if (profile) {
          setCandidate({
            name: profile.name || FALLBACK_CANDIDATE[studentId]?.name || 'Engineering Candidate',
            rollNumber: profile.roll_number || FALLBACK_CANDIDATE[studentId]?.rollNumber || '2021BCS0000',
            branch: profile.branch || FALLBACK_CANDIDATE[studentId]?.branch || 'Computer Science & Engineering',
            degree: profile.degree || 'B.Tech',
            cgpa: profile.cgpa || '8.45',
            targetRole: latestAnalysis?.dream_role || FALLBACK_CANDIDATE[studentId]?.targetRole || 'Software Engineer',
            targetCompany: latestAnalysis?.dream_company || FALLBACK_CANDIDATE[studentId]?.targetCompany || 'Tier-1 Tech',
            readinessScore: latestAnalysis?.readiness_score || FALLBACK_CANDIDATE[studentId]?.readinessScore || 75,
            school10th: profile.school_10th || 'Delhi Public School (CBSE)',
            school10thMarks: profile.school_10th_marks || '94.2%',
            school12th: profile.school_12th || 'National PU College (State Board)',
            school12thMarks: profile.school_12th_marks || '96.0%',
            achievements: profile.achievements_text || FALLBACK_CANDIDATE[studentId]?.achievements || '• Hackathon Participant\n• Active coder on LeetCode',
            resumeFileName: `${profile.name?.toLowerCase().replace(/\s+/g, '_') || 'candidate'}_resume.pdf`,
            resumeFileSize: '142 KB',
          });
        }
      } catch (err) {
        console.warn('Error fetching candidate audit data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCandidateData();
  }, [studentId]);

  const handleSaveNote = async () => {
    if (!newNoteText.trim()) return;
    const session = getSession();
    const authorName = session?.name || 'TPC Coordinator';

    const tempNote: CoachingNote = {
      id: 'note_' + Date.now(),
      author: authorName,
      timestamp: 'Just now',
      text: `“${newNoteText.trim()}”`,
    };

    setNotes([tempNote, ...notes]);
    const noteToSend = newNoteText.trim();
    setNewNoteText('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);

    try {
      await fetch('/api/tpc/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          coordinatorId: authorName,
          noteText: noteToSend,
        }),
      });
      setToastMessage('Coaching note recorded in audit journal');
      setTimeout(() => setToastMessage(null), 2500);
    } catch (e) {
      console.error('Error saving note:', e);
    }
  };

  const handleGrantChance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chanceReason.trim()) return;

    setGrantingChance(true);
    const session = getSession();
    const coordinatorIdentity = session?.name ? `${session.name} (TPC Coordinator)` : 'Prof. Ravi Sharma (TPC Coordinator)';

    try {
      const res = await fetch('/api/tpc/chances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          grantedBy: coordinatorIdentity,
          reason: chanceReason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to grant chance.');
      }

      setChancesUsed(data.chancesUsed ?? (chancesUsed + 1));
      setFlagCount(0);
      setProgramStatus('active');
      setShowChanceModal(false);
      setChanceReason('');
      setToastMessage(data.message || 'Chance successfully granted. Active flags reset.');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Error granting chance.');
    } finally {
      setGrantingChance(false);
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex flex-col pb-20 md:pb-12">
      <TopNav />
      <Sidebar />

      <div className="md:pl-[240px]">
        <main className="pt-16 bg-surface min-h-screen px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-[1300px] mx-auto w-full">
            {/* Header Identity Section */}
            <div className="flex flex-col gap-5 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant">
                    <Link href="/tpc" className="hover:text-primary transition-colors">
                      Placement Cell
                    </Link>
                    <span>/</span>
                    <Link href="/tpc/students" className="hover:text-primary transition-colors">
                      Candidate Directory
                    </Link>
                    <span>/</span>
                    <span className="text-on-surface font-semibold">Candidate Dossier</span>
                  </div>

                  <div className="flex items-baseline gap-3 mt-1">
                    <h1 className="font-headline text-2xl sm:text-3xl text-primary font-semibold tracking-tight">
                      {candidate.name}
                    </h1>
                    <span
                      className={`font-mono text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-semibold ${
                        programStatus === 'terminated'
                          ? 'bg-[#FBE8E8] text-[#9E3636]'
                          : programStatus === 'at_risk'
                          ? 'bg-[#F7EEDB] text-[#B7832F]'
                          : 'bg-[#E8F0EA] text-[#4F7A5A]'
                      }`}
                    >
                      {programStatus === 'terminated' ? 'Suspended (3 Flags)' : programStatus === 'at_risk' ? 'At Risk' : 'Active'}
                    </span>
                  </div>
                  <p className="font-body text-xs sm:text-sm text-on-surface-variant">
                    {candidate.degree} {candidate.branch} · USN: {candidate.rollNumber} · CGPA: {candidate.cgpa} · Target: {candidate.targetRole} ({candidate.targetCompany})
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href={`/analyses/${analysisId}/mentor`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container-lowest text-primary font-semibold text-xs hover:bg-surface-container transition-colors shadow-xs border border-surface-variant"
                  >
                    <span className="material-symbols-outlined text-[16px]">chat_bubble_outline</span>
                    <span>Mentor consultation</span>
                  </Link>

                  <button
                    onClick={() => setShowChanceModal(true)}
                    disabled={chancesUsed >= 3}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                    <span>Give another chance ({3 - chancesUsed} left)</span>
                  </button>
                </div>
              </div>

              {/* View Tabs */}
              <div className="flex items-center gap-2 text-xs border-b border-surface-variant pb-2 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('diagnosis')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    activeTab === 'diagnosis'
                      ? 'bg-primary text-on-primary'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  Skill Map Diagnosis
                </button>
                <button
                  onClick={() => setActiveTab('academics')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    activeTab === 'academics'
                      ? 'bg-primary text-on-primary'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  Academic Credentials
                </button>
                <button
                  onClick={() => setActiveTab('roadmap')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    activeTab === 'roadmap'
                      ? 'bg-primary text-on-primary'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  Roadmap Sprints ({roadmapTasks.filter(t => t.is_completed).length}/{roadmapTasks.length || 6} Done)
                </button>
                <button
                  onClick={() => setActiveTab('flags')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                    activeTab === 'flags'
                      ? 'bg-primary text-on-primary'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span>Flags & Chances</span>
                  <span
                    className={`px-1.5 py-0.2 rounded font-mono text-[10px] ${
                      flagCount > 0 ? 'bg-error-container text-error' : 'bg-surface-container'
                    }`}
                  >
                    {flagCount}/3
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    activeTab === 'notes'
                      ? 'bg-primary text-on-primary'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  Coaching Notes ({notes.length})
                </button>
              </div>
            </div>

            {/* TAB: Academic Records */}
            {activeTab === 'academics' && (
              <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <span className="font-mono text-[10px] uppercase text-secondary font-semibold">
                    Verified Intake Records
                  </span>
                  <h2 className="font-headline text-xl text-primary font-semibold mt-0.5">
                    Academic Background & Qualifications
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                  {/* Secondary Schooling */}
                  <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-2">
                    <span className="font-mono text-[10px] uppercase text-outline font-semibold">
                      Class 10th Schooling
                    </span>
                    <p className="font-semibold text-primary text-sm">{candidate.school10th}</p>
                    <p className="font-mono text-on-surface-variant">Score: {candidate.school10thMarks}</p>
                  </div>

                  {/* Higher Secondary */}
                  <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-2">
                    <span className="font-mono text-[10px] uppercase text-outline font-semibold">
                      Class 12th / Pre-University
                    </span>
                    <p className="font-semibold text-primary text-sm">{candidate.school12th}</p>
                    <p className="font-mono text-on-surface-variant">Score: {candidate.school12thMarks}</p>
                  </div>

                  {/* Undergraduate */}
                  <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-2">
                    <span className="font-mono text-[10px] uppercase text-outline font-semibold">
                      Undergraduate Degree
                    </span>
                    <p className="font-semibold text-primary text-sm">National Institute of Engineering</p>
                    <p className="text-on-surface">
                      {candidate.degree} · {candidate.branch} (Class of 2025)
                    </p>
                    <p className="font-mono text-primary font-bold">Cumulative CGPA: {candidate.cgpa} / 10.0</p>
                  </div>

                  {/* Achievements */}
                  <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-2">
                    <span className="font-mono text-[10px] uppercase text-outline font-semibold">
                      Key Extracurriculars & Achievements
                    </span>
                    <p className="font-body text-on-surface leading-relaxed whitespace-pre-line">
                      {candidate.achievements}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-surface-container flex items-center justify-between text-xs font-mono">
                  <span className="text-on-surface-variant">
                    Uploaded Document: {candidate.resumeFileName} ({candidate.resumeFileSize})
                  </span>
                  <Link
                    href={`/analyses/${analysisId}`}
                    className="text-secondary font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <span>View candidate skill map</span>
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </Link>
                </div>
              </div>
            )}

            {/* TAB: Flags & Chances */}
            {activeTab === 'flags' && (
              <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-mono text-[10px] uppercase text-secondary font-semibold">
                      Institutional Compliance
                    </span>
                    <h2 className="font-headline text-xl text-primary font-semibold mt-0.5">
                      Program Flags & Chance Grant Ledger
                    </h2>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="font-mono text-xs text-on-surface-variant block">
                        Chances Consumed: {chancesUsed}/3
                      </span>
                      <span className="font-mono text-xs text-on-surface-variant block">
                        Active Flags: {flagCount}/3
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-xs text-primary">Compliance Status</h4>
                    <span
                      className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded font-bold ${
                        programStatus === 'active'
                          ? 'bg-[#E8F0EA] text-[#4F7A5A]'
                          : programStatus === 'at_risk'
                          ? 'bg-[#F7EEDB] text-[#B7832F]'
                          : 'bg-[#FFDAD6] text-error'
                      }`}
                    >
                      {programStatus.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    Candidates who miss 3 consecutive roadmap milestone deadlines receive program suspension flags. Placement coordinators hold discretionary authority to grant up to 3 reinstatement chances upon student appeal.
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setShowChanceModal(true)}
                    disabled={chancesUsed >= 3}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                    <span>Grant Reinstatement Chance</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB: Diagnosis (Skill Map Competency Ledger) */}
            {activeTab === 'diagnosis' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left 8 Cols: Skill ledger */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-6 shadow-sm space-y-5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-headline font-semibold text-lg text-primary">
                        Technical Competency Ledger
                      </h3>
                      <Link
                        href={`/analyses/${analysisId}`}
                        className="font-mono text-xs text-secondary hover:underline font-semibold"
                      >
                        Open full interactive diagnosis →
                      </Link>
                    </div>

                    <div className="space-y-3">
                      {competencies.length === 0 ? (
                        <>
                          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-xs text-primary">Component Architecture & Modular Design</span>
                              <span className="font-mono text-[10px] text-[#4F7A5A] uppercase font-bold">Strong Evidence</span>
                            </div>
                            <p className="text-xs text-on-surface-variant">
                              Verified in candidate code repositories. Clean modular design and functional hooks.
                            </p>
                          </div>

                          <div className="p-4 rounded-xl bg-surface-container-low border border-[#F7EEDB]">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-xs text-primary">State Management & Store Hydration</span>
                              <span className="font-mono text-[10px] text-[#B7832F] uppercase font-bold">Needs Proof</span>
                            </div>
                            <p className="text-xs text-on-surface-variant">
                              Coursework relies on basic component state. Needs demonstration of Zustand or Redux store.
                            </p>
                          </div>

                          <div className="p-4 rounded-xl bg-surface-container-low border border-error-container">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-xs text-primary">Automated Test Suites (Jest/Vitest)</span>
                              <span className="font-mono text-[10px] text-error uppercase font-bold">Placement Gap</span>
                            </div>
                            <p className="text-xs text-on-surface-variant">
                              No automated unit tests or RTL specs found in candidate GitHub repositories.
                            </p>
                          </div>
                        </>
                      ) : (
                        competencies.map((comp) => (
                          <div
                            key={comp.id}
                            className={`p-4 rounded-xl bg-surface-container-low border ${
                              comp.status === 'strong'
                                ? 'border-surface-container'
                                : comp.status === 'needs_proof'
                                ? 'border-[#F7EEDB]'
                                : 'border-error-container'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-xs text-primary">{comp.name}</span>
                              <span
                                className={`font-mono text-[10px] uppercase font-bold ${
                                  comp.status === 'strong'
                                    ? 'text-[#4F7A5A]'
                                    : comp.status === 'needs_proof'
                                    ? 'text-[#B7832F]'
                                    : 'text-error'
                                }`}
                              >
                                {comp.status_label || (comp.status === 'strong' ? 'Strong Evidence' : comp.status === 'needs_proof' ? 'Needs Proof' : 'Placement Gap')}
                              </span>
                            </div>
                            <p className="text-xs text-on-surface-variant">
                              {comp.plain_explanation || comp.jd_requirement}
                            </p>
                            {comp.evidence_quote && (
                              <p className="text-[11px] font-mono text-outline mt-1 italic">
                                Evidence: &ldquo;{comp.evidence_quote}&rdquo;
                              </p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Right 4 Cols: Coaching Journal */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-6 shadow-sm space-y-4">
                    <h3 className="font-headline font-semibold text-sm text-primary">Coaching Journal</h3>
                    <div className="space-y-3 max-h-72 overflow-y-auto">
                      {notes.map((n) => (
                        <div key={n.id} className="p-3 rounded-lg bg-surface-container-low text-xs space-y-1">
                          <div className="flex justify-between font-mono text-[10px] text-outline">
                            <span className="font-semibold text-primary">{n.author}</span>
                            <span>{n.timestamp}</span>
                          </div>
                          <p className="text-on-surface">{n.text}</p>
                        </div>
                      ))}
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Add coaching note..."
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-surface-variant bg-surface-container-low text-xs text-on-surface focus:outline-none focus:border-primary"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveNote}
                        disabled={!newNoteText.trim()}
                        className="px-4 py-2 rounded-lg bg-primary text-on-primary font-semibold text-xs shadow-xs disabled:opacity-50"
                      >
                        Save note
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Roadmap Progress */}
            {activeTab === 'roadmap' && (
              <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-headline font-semibold text-lg text-primary">
                    Sprint Roadmap Tasks & Evidence Outcomes
                  </h3>
                  <Link
                    href={`/analyses/${analysisId}/roadmap`}
                    className="font-mono text-xs text-secondary hover:underline font-semibold"
                  >
                    View candidate roadmap →
                  </Link>
                </div>

                <div className="space-y-3 text-xs">
                  {roadmapTasks.length === 0 ? (
                    <>
                      <div className="p-3.5 rounded-xl border border-surface-container flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-primary">Migrate local cart state to Zustand store</h4>
                          <p className="text-on-surface-variant text-[11px] mt-0.5">
                            Proof submitted: GitHub PR #14 merged with persistent storage hooks.
                          </p>
                        </div>
                        <span className="font-mono text-[#4F7A5A] font-semibold">Completed ✓</span>
                      </div>
                      <div className="p-3.5 rounded-xl border border-surface-container flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-primary">Write automated Vitest unit tests for webhook signature validation</h4>
                          <p className="text-on-surface-variant text-[11px] mt-0.5">
                            Proof submitted: Test suite with 100% branch coverage over HMAC SHA256 signatures.
                          </p>
                        </div>
                        <span className="font-mono text-[#4F7A5A] font-semibold">Completed ✓</span>
                      </div>
                      <div className="p-3.5 rounded-xl border border-surface-container flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-primary">Deploy Docker containerized microservice to staging cluster</h4>
                          <p className="text-on-surface-variant text-[11px] mt-0.5">
                            In progress: Multi-stage Dockerfile authored, awaiting cluster health check.
                          </p>
                        </div>
                        <span className="font-mono text-secondary font-semibold">In Progress</span>
                      </div>
                    </>
                  ) : (
                    roadmapTasks.map((t) => (
                      <div
                        key={t.id}
                        className="p-3.5 rounded-xl border border-surface-container flex items-center justify-between"
                      >
                        <div>
                          <h4 className="font-semibold text-primary">{t.title}</h4>
                          <p className="text-on-surface-variant text-[11px] mt-0.5">
                            {t.description || t.evidence_outcome || 'Scheduled sprint task'}
                          </p>
                        </div>
                        <span
                          className={`font-mono text-xs font-semibold ${
                            t.is_completed ? 'text-[#4F7A5A]' : 'text-secondary'
                          }`}
                        >
                          {t.is_completed ? 'Completed ✓' : 'Pending'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB: Coaching Notes Dedicated */}
            {activeTab === 'notes' && (
              <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <span className="font-mono text-[10px] uppercase text-secondary font-semibold">
                    Advisory Records
                  </span>
                  <h2 className="font-headline text-xl text-primary font-semibold mt-0.5">
                    Coaching & Placement Desk Interventions
                  </h2>
                </div>

                <div className="space-y-4">
                  {notes.map((n) => (
                    <div key={n.id} className="p-4 rounded-xl bg-surface-container-low border border-surface-container space-y-1">
                      <div className="flex justify-between font-mono text-xs text-outline">
                        <span className="font-semibold text-primary">{n.author}</span>
                        <span>{n.timestamp}</span>
                      </div>
                      <p className="text-sm text-on-surface leading-relaxed">{n.text}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-surface-container space-y-3">
                  <textarea
                    rows={3}
                    placeholder="Record formal coaching note or placement interview remarks..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    className="w-full p-3 rounded-xl border border-surface-variant bg-surface-container-low text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveNote}
                      disabled={!newNoteText.trim()}
                      className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-xs shadow-xs disabled:opacity-50"
                    >
                      Record note in journal
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Grant Chance Modal */}
      {showChanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-primary/30 backdrop-blur-xs"
            onClick={() => setShowChanceModal(false)}
          ></div>

          <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-variant p-6 sm:p-8 z-10 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-surface-container pb-3">
              <div>
                <h3 className="font-headline text-lg font-semibold text-primary">
                  Grant Reinstatement Chance
                </h3>
                <p className="font-body text-xs text-on-surface-variant">
                  Candidate: {candidate.name} ({candidate.rollNumber})
                </p>
              </div>
              <button
                onClick={() => setShowChanceModal(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleGrantChance} className="space-y-4">
              <div>
                <label className="font-semibold text-on-surface block mb-1">
                  Justification Reason *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide institutional rationale (e.g. Approved medical leave, completed catch-up milestone, academic review)..."
                  value={chanceReason}
                  onChange={(e) => setChanceReason(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-surface-container-low border border-surface-variant text-on-surface focus:outline-none focus:border-primary font-body"
                />
              </div>

              <div className="p-3 rounded-lg bg-surface-container-low border border-surface-container text-[11px] text-on-surface-variant">
                Granting a chance voids all active program flags and restores the candidate&apos;s standing to Active. A formal compliance log entry is recorded in the institutional audit ledger.
              </div>

              <div className="pt-3 border-t border-surface-container flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowChanceModal(false)}
                  className="px-4 py-2 rounded-lg text-on-surface-variant hover:text-on-surface font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={grantingChance}
                  className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold shadow-sm disabled:opacity-50"
                >
                  {grantingChance ? 'Granting...' : 'Grant Chance & Void Flags'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-on-primary px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-mono animate-fade-in">
          <span className="material-symbols-outlined text-[16px] text-[#4F7A5A]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <MobileTabBar role="coordinator" />
    </div>
  );
}
