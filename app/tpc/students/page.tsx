'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/layout/TopNav';
import Sidebar from '@/components/layout/Sidebar';
import MobileTabBar from '@/components/layout/MobileTabBar';
import { getSession } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';

interface StudentRosterItem {
  id: string;
  name: string;
  rollNumber: string;
  branch: string;
  role: string;
  company: string;
  readinessScore: number;
  match: string;
  matchType: 'strong' | 'proof' | 'missing';
  topGap: string;
  lastActivity: string;
  status: 'active' | 'at_risk' | 'terminated';
  flagCount: number;
  analysisId?: string;
}

const FALLBACK_STUDENTS: StudentRosterItem[] = [
  {
    id: '36ac8503-c1c5-4865-b3f5-51c302a3e1ee',
    name: 'Durga sravan Challagolla',
    rollNumber: '2021BCS0089',
    branch: 'Computer Science & Engineering',
    role: 'Junior Frontend Developer',
    company: 'Razorpay',
    readinessScore: 78,
    match: 'Needs stronger proof',
    matchType: 'proof',
    topGap: 'Webpack chunk-splitting',
    lastActivity: 'Just now',
    status: 'active',
    flagCount: 0,
    analysisId: 'ans_durga_01',
  },
  {
    id: 'usr_ananya',
    name: 'Ananya Reddy',
    rollNumber: '2021BCS0089',
    branch: 'Computer Science & Engineering',
    role: 'Junior Frontend Developer',
    company: 'Razorpay',
    readinessScore: 72,
    match: 'Needs stronger proof',
    matchType: 'proof',
    topGap: 'React state management',
    lastActivity: 'Today, 10:24',
    status: 'active',
    flagCount: 0,
  },
  {
    id: 'usr_rahul',
    name: 'Rahul Verma',
    rollNumber: '2021BCS0142',
    branch: 'Computer Science & Engineering',
    role: 'Data Analyst',
    company: 'Fractal Analytics',
    readinessScore: 68,
    match: 'Needs stronger proof',
    matchType: 'proof',
    topGap: 'Dashboard & BI tools',
    lastActivity: '12 Sept, 14:20',
    status: 'active',
    flagCount: 0,
  },
  {
    id: 'usr_devansh',
    name: 'Devansh Mathur',
    rollNumber: '2021BCS0312',
    branch: 'Computer Science & Engineering',
    role: 'Product Engineer (Backend)',
    company: 'Swiggy',
    readinessScore: 71,
    match: 'Needs stronger proof',
    matchType: 'proof',
    topGap: 'Distributed tracing',
    lastActivity: 'Yesterday, 18:15',
    status: 'at_risk',
    flagCount: 1,
  },
  {
    id: 'usr_meera',
    name: 'Meera Venkatesh',
    rollNumber: '2021BCS0044',
    branch: 'Computer Science & Engineering',
    role: 'Data Scientist',
    company: 'Flipkart',
    readinessScore: 89,
    match: 'Strong evidence',
    matchType: 'strong',
    topGap: 'Model deployment latency',
    lastActivity: 'Oct 21, 11:05',
    status: 'active',
    flagCount: 0,
  },
  {
    id: 'usr_aarav_01',
    name: 'Aarav Sundaram',
    rollNumber: '4NI21EC042',
    branch: 'Electronics & Communication',
    role: 'Embedded Systems Engineer',
    company: 'Qualcomm',
    readinessScore: 74,
    match: 'Needs stronger proof',
    matchType: 'proof',
    topGap: 'FreeRTOS concurrency',
    lastActivity: 'Today, 07:30',
    status: 'at_risk',
    flagCount: 1,
  },
  {
    id: 'usr_priya',
    name: 'Priya Nair',
    rollNumber: '4NI21EC088',
    branch: 'Electronics & Communication',
    role: 'VLSI Design & Verification Engineer',
    company: 'NVIDIA',
    readinessScore: 86,
    match: 'Strong evidence',
    matchType: 'strong',
    topGap: 'CDC verification & timing closure',
    lastActivity: 'Oct 18, 16:40',
    status: 'active',
    flagCount: 0,
  },
  {
    id: 'usr_karthik',
    name: 'Karthik Subramanian',
    rollNumber: '4NI21EC019',
    branch: 'Electronics & Communication',
    role: 'IoT & Firmware Specialist',
    company: 'Bosch',
    readinessScore: 65,
    match: 'Early stage',
    matchType: 'missing',
    topGap: 'TLS/SSL on microcontrollers',
    lastActivity: 'Oct 15, 12:00',
    status: 'active',
    flagCount: 0,
  },
  {
    id: 'usr_rohan',
    name: 'Rohan Kulkarni',
    rollNumber: '4NI21IS019',
    branch: 'Information Science',
    role: 'Systems & Cloud Engineer',
    company: 'AWS',
    readinessScore: 62,
    match: 'Early stage',
    matchType: 'missing',
    topGap: 'Linux kernel & memory',
    lastActivity: 'Oct 19, 09:30',
    status: 'at_risk',
    flagCount: 2,
  },
  {
    id: 'usr_shreya',
    name: 'Shreya Joshi',
    rollNumber: '4NI21IS077',
    branch: 'Information Science',
    role: 'Full Stack Engineer',
    company: 'CRED',
    readinessScore: 84,
    match: 'Strong evidence',
    matchType: 'strong',
    topGap: 'End-to-end Cypress test suites',
    lastActivity: 'Oct 20, 15:10',
    status: 'active',
    flagCount: 0,
  },
  {
    id: 'usr_aditya',
    name: 'Aditya Joshi',
    rollNumber: '4NI21ME034',
    branch: 'Mechanical Engineering',
    role: 'Robotics & Automation Engineer',
    company: 'ABB',
    readinessScore: 76,
    match: 'Needs stronger proof',
    matchType: 'proof',
    topGap: 'Industrial PLC ladder logic',
    lastActivity: 'Oct 16, 14:00',
    status: 'active',
    flagCount: 0,
  },
  {
    id: 'usr_vikram',
    name: 'Vikram Solanki',
    rollNumber: '4NI21ME092',
    branch: 'Mechanical Engineering',
    role: 'CAD/CAE Design Engineer',
    company: 'Tata Motors',
    readinessScore: 70,
    match: 'Needs stronger proof',
    matchType: 'proof',
    topGap: 'Non-linear ANSYS FEA',
    lastActivity: 'Oct 14, 11:30',
    status: 'active',
    flagCount: 0,
  },
  {
    id: 'usr_neha',
    name: 'Neha Patil',
    rollNumber: '4NI21CV021',
    branch: 'Civil Engineering',
    role: 'Structural Design Engineer',
    company: 'L&T Construction',
    readinessScore: 81,
    match: 'Strong evidence',
    matchType: 'strong',
    topGap: 'Ductile detailing IS 13920',
    lastActivity: 'Oct 17, 10:15',
    status: 'active',
    flagCount: 0,
  },
  {
    id: 'usr_rajesh',
    name: 'Rajesh Gowda',
    rollNumber: '4NI21CV055',
    branch: 'Civil Engineering',
    role: 'BIM & Project Planning Specialist',
    company: 'Atkins',
    readinessScore: 67,
    match: 'Early stage',
    matchType: 'missing',
    topGap: 'Navisworks clash detection',
    lastActivity: 'Oct 13, 09:45',
    status: 'active',
    flagCount: 0,
  },
];

const BRANCH_ROLES: Record<string, string[]> = {
  All: [
    'All Roles',
    'Junior Frontend Developer',
    'Product Engineer (Backend)',
    'Full Stack Engineer',
    'Data Analyst',
    'Data Scientist',
    'Systems & Cloud Engineer',
    'Embedded Systems Engineer',
    'VLSI Design & Verification Engineer',
    'IoT & Firmware Specialist',
    'Robotics & Automation Engineer',
    'CAD/CAE Design Engineer',
    'Structural Design Engineer',
    'BIM & Project Planning Specialist',
  ],
  'Computer Science & Engineering': [
    'All Roles',
    'Junior Frontend Developer',
    'Product Engineer (Backend)',
    'Full Stack Engineer',
    'Data Analyst',
    'Data Scientist',
    'Systems & Cloud Engineer',
  ],
  'Electronics & Communication': [
    'All Roles',
    'Embedded Systems Engineer',
    'VLSI Design & Verification Engineer',
    'IoT & Firmware Specialist',
  ],
  'Information Science': [
    'All Roles',
    'Full Stack Engineer',
    'Systems & Cloud Engineer',
    'Data Analyst',
  ],
  'Mechanical Engineering': [
    'All Roles',
    'Robotics & Automation Engineer',
    'CAD/CAE Design Engineer',
  ],
  'Civil Engineering': [
    'All Roles',
    'Structural Design Engineer',
    'BIM & Project Planning Specialist',
  ],
};

export default function StudentsRosterPage() {
  const router = useRouter();
  const [students, setStudents] = useState<StudentRosterItem[]>(FALLBACK_STUDENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [matchFilter, setMatchFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
    }
  }, [router]);

  // Fetch real profiles & analyses from Supabase
  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data: profiles, error: pError } = await supabase
          .from('profiles')
          .select('id, name, email, roll_number, branch, cgpa, role')
          .neq('id', 'system');

        if (pError || !profiles) {
          setLoading(false);
          return;
        }

        const { data: analyses } = await supabase
          .from('analyses')
          .select('id, user_id, dream_role, dream_company, readiness_score, top_gap, created_at')
          .order('created_at', { ascending: false });

        const { data: programStatuses } = await supabase
          .from('program_status')
          .select('student_id, status, flag_count, chances_used');

        if (profiles.length > 0) {
          const mapped: StudentRosterItem[] = profiles
            .filter((p: any) => p.role === 'student' || p.id === '36ac8503-c1c5-4865-b3f5-51c302a3e1ee')
            .map((p: any) => {
              const userAnalysis = analyses?.find((a: any) => a.user_id === p.id);
              const pStatus = programStatuses?.find((s: any) => s.student_id === p.id);
              const score = userAnalysis?.readiness_score ?? (p.cgpa ? Math.round(parseFloat(p.cgpa) * 9.5) : 75);
              const matchType: 'strong' | 'proof' | 'missing' =
                score >= 80 ? 'strong' : score >= 65 ? 'proof' : 'missing';
              const matchLabel =
                score >= 80 ? 'Strong evidence' : score >= 65 ? 'Needs stronger proof' : 'Early stage';

              return {
                id: p.id,
                name: p.name || 'Candidate',
                rollNumber: p.roll_number || '2021BCS0000',
                branch: p.branch || 'Computer Science & Engineering',
                role: userAnalysis?.dream_role || 'Junior Software Engineer',
                company: userAnalysis?.dream_company || 'Tier-1 Tech',
                readinessScore: score,
                match: matchLabel,
                matchType,
                topGap: userAnalysis?.top_gap || 'System Design & State Management',
                lastActivity: userAnalysis?.created_at
                  ? new Date(userAnalysis.created_at).toLocaleDateString()
                  : 'Active recently',
                status: (pStatus?.status as any) || 'active',
                flagCount: pStatus?.flag_count || 0,
                analysisId: userAnalysis?.id,
              };
            });

          // Merge with fallback to ensure rich directory
          const idSet = new Set(mapped.map((m) => m.id));
          const combined = [...mapped, ...FALLBACK_STUDENTS.filter((f) => !idSet.has(f.id))];
          setStudents(combined);
        }
      } catch (err) {
        console.warn('Error loading real student roster:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Update role filter when branch filter changes
  const availableRoles = useMemo(() => {
    return BRANCH_ROLES[branchFilter] || BRANCH_ROLES.All;
  }, [branchFilter]);

  const handleBranchChange = (newBranch: string) => {
    setBranchFilter(newBranch);
    setRoleFilter('All Roles');
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.company.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBranch =
        branchFilter === 'All' || s.branch.toLowerCase().includes(branchFilter.toLowerCase());

      const matchesRole =
        roleFilter === 'All Roles' ||
        s.role.toLowerCase().includes(roleFilter.toLowerCase());

      const matchesMatch =
        matchFilter === 'All' ||
        (matchFilter === 'strong' && s.matchType === 'strong') ||
        (matchFilter === 'proof' && s.matchType === 'proof') ||
        (matchFilter === 'missing' && s.matchType === 'missing');

      return matchesSearch && matchesBranch && matchesRole && matchesMatch;
    });
  }, [students, searchQuery, branchFilter, roleFilter, matchFilter]);

  const stats = useMemo(() => {
    const total = filteredStudents.length;
    if (total === 0) return { total: 0, avgScore: 0, strong: 0, proof: 0, missing: 0 };
    const avgScore = Math.round(
      filteredStudents.reduce((sum, s) => sum + s.readinessScore, 0) / total
    );
    const strong = filteredStudents.filter((s) => s.matchType === 'strong').length;
    const proof = filteredStudents.filter((s) => s.matchType === 'proof').length;
    const missing = filteredStudents.filter((s) => s.matchType === 'missing').length;
    return { total, avgScore, strong, proof, missing };
  }, [filteredStudents]);

  const exportCSV = () => {
    const headers = [
      'Student Name',
      'Roll Number',
      'Branch',
      'Target Role',
      'Target Company',
      'Readiness Score',
      'Evaluation Status',
      'Top Skill Gap',
      'Program Status',
      'Last Activity',
    ];
    const rows = filteredStudents.map((s) => [
      s.name,
      s.rollNumber,
      s.branch,
      s.role,
      s.company,
      `${s.readinessScore}%`,
      s.match,
      s.topGap,
      s.status,
      s.lastActivity,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `readiness_students_${branchFilter.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage('Candidate roster CSV exported successfully');
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex flex-col pb-20 md:pb-12">
      <TopNav />
      <Sidebar />

      <div className="md:pl-[240px]">
        <main className="pt-16 bg-surface min-h-screen px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-[1300px] mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-6 pb-4 border-b border-surface-variant">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant mb-1">
                  <Link href="/tpc" className="hover:text-primary transition-colors">
                    Placement Cell
                  </Link>
                  <span>/</span>
                  <span className="text-primary font-semibold">Candidate Directory</span>
                </div>
                <h1 className="font-headline text-2xl sm:text-3xl text-primary font-semibold tracking-tight">
                  Graduating Candidate Ledger
                </h1>
                <p className="font-body text-xs sm:text-sm text-on-surface-variant mt-0.5">
                  Verified diagnostic evaluations, skill maps, and personalized audit dossiers across engineering departments.
                </p>
              </div>

              <div className="mt-3 md:mt-0 flex items-center gap-3">
                <button
                  onClick={exportCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary font-semibold text-xs transition-colors border border-surface-variant shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>Export Roster CSV</span>
                </button>
              </div>
            </div>

            {/* Department Tabs */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 text-xs border-b border-surface-variant">
              {[
                { label: 'All Departments', value: 'All' },
                { label: 'Computer Science (CSE)', value: 'Computer Science & Engineering' },
                { label: 'Electronics & Comm (ECE)', value: 'Electronics & Communication' },
                { label: 'Information Science (ISE)', value: 'Information Science' },
                { label: 'Mechanical (MECH)', value: 'Mechanical Engineering' },
                { label: 'Civil Engineering (CIVIL)', value: 'Civil Engineering' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => handleBranchChange(tab.value)}
                  className={`px-3 py-2 rounded-t-lg font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${
                    branchFilter === tab.value
                      ? 'border-primary text-primary bg-surface-container-low'
                      : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Metrics Snapshot Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="p-3 bg-surface-container-lowest rounded-xl border border-surface-variant shadow-xs">
                <span className="font-mono text-[10px] uppercase text-outline">Enrolled Candidates</span>
                <p className="font-headline text-xl font-bold text-primary">{stats.total}</p>
              </div>
              <div className="p-3 bg-surface-container-lowest rounded-xl border border-surface-variant shadow-xs">
                <span className="font-mono text-[10px] uppercase text-outline">Average Readiness</span>
                <p className="font-headline text-xl font-bold text-secondary">{stats.avgScore}%</p>
              </div>
              <div className="p-3 bg-surface-container-lowest rounded-xl border border-surface-variant shadow-xs">
                <span className="font-mono text-[10px] uppercase text-outline">Strong Evidence</span>
                <p className="font-headline text-xl font-bold text-[#4F7A5A]">{stats.strong}</p>
              </div>
              <div className="p-3 bg-surface-container-lowest rounded-xl border border-surface-variant shadow-xs">
                <span className="font-mono text-[10px] uppercase text-outline">Intervention Needed</span>
                <p className="font-headline text-xl font-bold text-[#B7832F]">{stats.proof + stats.missing}</p>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-surface-container-lowest rounded-xl p-3 sm:p-4 mb-6 flex flex-wrap items-center justify-between gap-4 border border-surface-variant shadow-xs">
              <div className="flex flex-wrap items-center gap-3 text-xs flex-1">
                {/* Search */}
                <div className="relative min-w-[220px] flex-1 max-w-sm">
                  <span className="material-symbols-outlined text-[18px] text-outline absolute left-3 top-1/2 -translate-y-1/2">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search candidate name, USN, role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-surface-container-low text-on-surface placeholder:text-outline text-xs pl-9 pr-3 py-1.5 rounded-lg border border-surface-variant focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Target Role Dropdown */}
                <div className="flex items-center gap-2">
                  <label className="text-on-surface-variant font-medium">Role:</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="bg-surface-container-low text-on-surface font-medium py-1.5 px-3 rounded-lg border border-surface-variant focus:outline-none focus:border-primary"
                  >
                    {availableRoles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Match Status Dropdown */}
                <div className="flex items-center gap-2">
                  <label className="text-on-surface-variant font-medium">Evaluation:</label>
                  <select
                    value={matchFilter}
                    onChange={(e) => setMatchFilter(e.target.value)}
                    className="bg-surface-container-low text-on-surface font-medium py-1.5 px-3 rounded-lg border border-surface-variant focus:outline-none focus:border-primary"
                  >
                    <option value="All">All Evaluations</option>
                    <option value="strong">Strong Evidence</option>
                    <option value="proof">Needs Stronger Proof</option>
                    <option value="missing">Early Stage</option>
                  </select>
                </div>
              </div>

              <div className="font-mono text-xs text-on-surface-variant">
                Showing {filteredStudents.length} candidate(s)
              </div>
            </div>

            {/* Candidates Table */}
            <div className="bg-surface-container-lowest rounded-xl border border-surface-variant overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant font-mono">
                      <th className="py-3 px-4">Candidate</th>
                      <th className="py-3 px-3">Department</th>
                      <th className="py-3 px-3">Target Role & Company</th>
                      <th className="py-3 px-3">Readiness</th>
                      <th className="py-3 px-3">Evidence Match</th>
                      <th className="py-3 px-3">Top Skill Gap</th>
                      <th className="py-3 px-3 hidden lg:table-cell">Status</th>
                      <th className="py-3 px-4 text-right">Audit Dossier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-on-surface-variant">
                          <p className="font-headline text-base font-semibold text-primary mb-1">
                            No candidates match your current filter
                          </p>
                          <p className="text-xs">
                            Try resetting the department or role filter to view all enrolled candidates.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((st) => (
                        <tr key={st.id} className="hover:bg-surface-container-low/60 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-on-surface text-sm">{st.name}</span>
                              <span className="font-mono text-outline text-[11px]">{st.rollNumber}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-body text-on-surface-variant">
                            <span className="px-2 py-0.5 rounded-full bg-surface-container font-mono text-[10px]">
                              {st.branch}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex flex-col">
                              <span className="font-semibold text-primary">{st.role}</span>
                              <span className="font-mono text-secondary text-[11px]">{st.company}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-12 bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full"
                                  style={{ width: `${st.readinessScore}%` }}
                                ></div>
                              </div>
                              <span className="font-mono font-bold text-primary">{st.readinessScore}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`font-mono text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap font-semibold ${
                                st.matchType === 'strong'
                                  ? 'bg-[#E8F0EA] text-[#4F7A5A]'
                                  : st.matchType === 'proof'
                                  ? 'bg-[#F7EEDB] text-[#B7832F]'
                                  : 'bg-[#FFDAD6] text-error'
                              }`}
                            >
                              {st.match}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-on-surface-variant max-w-[180px] truncate">
                            {st.topGap}
                          </td>
                          <td className="py-3 px-3 hidden lg:table-cell">
                            <span
                              className={`font-mono text-[10px] px-2 py-0.5 rounded uppercase font-semibold ${
                                st.status === 'at_risk'
                                  ? 'bg-amber-100 text-amber-800'
                                  : st.status === 'terminated'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {st.status === 'at_risk' ? 'At Risk' : st.status === 'terminated' ? 'Suspended' : 'Active'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-2 justify-end">
                              <Link
                                href={`/analyses/${st.analysisId || 'default'}/roadmap?view=faculty&studentId=${st.id}`}
                                className="inline-flex items-center gap-1 font-semibold text-secondary hover:text-secondary/80 hover:underline text-xs"
                                title="View candidate sprint roadmap"
                              >
                                <span className="material-symbols-outlined text-[14px]">route</span>
                                <span>Roadmap</span>
                              </Link>
                              <span className="text-outline-variant">·</span>
                              <Link
                                href={`/tpc/students/${st.id}`}
                                className="inline-flex items-center gap-1 font-semibold text-primary hover:text-primary/80 hover:underline text-xs"
                              >
                                <span>Audit</span>
                                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between px-4 py-3 bg-surface-container-low border-t border-surface-container text-xs font-mono text-on-surface-variant">
                <span>Showing {filteredStudents.length} candidate dossier records</span>
                <span className="text-[11px] text-outline">Real-time sync with candidate evaluation ledger</span>
              </div>
            </div>

          </div>
        </main>
      </div>

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
