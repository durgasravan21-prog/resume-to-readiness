'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/layout/TopNav';
import Sidebar from '@/components/layout/Sidebar';
import MobileTabBar from '@/components/layout/MobileTabBar';
import { getSession } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';

interface StudentRow {
  id: string;
  name: string;
  rollNumber: string;
  branch: string;
  role: string;
  company: string;
  match: string;
  matchType: 'strong' | 'proof' | 'missing';
  topGap: string;
  lastActivity: string;
  readinessScore: number;
}

const ALL_ROSTER_STUDENTS: StudentRow[] = [
  {
    id: '36ac8503-c1c5-4865-b3f5-51c302a3e1ee',
    name: 'Durga sravan Challagolla',
    rollNumber: '2021BCS0089',
    branch: 'Computer Science & Engineering',
    role: 'Junior Frontend Developer',
    company: 'Razorpay',
    match: 'Needs stronger proof',
    matchType: 'proof',
    topGap: 'Webpack chunk-splitting',
    lastActivity: 'Just now',
    readinessScore: 78,
  },
  {
    id: 'usr_ananya',
    name: 'Ananya Reddy',
    rollNumber: '2021BCS0089',
    branch: 'Computer Science & Engineering',
    role: 'Junior Frontend Developer',
    company: 'Razorpay',
    match: 'Needs stronger proof',
    matchType: 'proof',
    topGap: 'React state management',
    lastActivity: 'Today, 10:24',
    readinessScore: 72,
  },
  {
    id: 'usr_rahul',
    name: 'Rahul Verma',
    rollNumber: '2021BCS0142',
    branch: 'Computer Science & Engineering',
    role: 'Data Analyst',
    company: 'Fractal Analytics',
    match: 'Needs stronger proof',
    matchType: 'proof',
    topGap: 'Dashboard & BI tools',
    lastActivity: '12 Sept, 14:20',
    readinessScore: 68,
  },
  {
    id: 'usr_devansh',
    name: 'Devansh Mathur',
    rollNumber: '2021BCS0312',
    branch: 'Computer Science & Engineering',
    role: 'Product Engineer (Backend)',
    company: 'Swiggy',
    match: 'Needs stronger proof',
    matchType: 'proof',
    topGap: 'Distributed tracing',
    lastActivity: 'Yesterday, 18:15',
    readinessScore: 71,
  },
  {
    id: 'usr_meera',
    name: 'Meera Venkatesh',
    rollNumber: '2021BCS0044',
    branch: 'Computer Science & Engineering',
    role: 'Data Scientist',
    company: 'Flipkart',
    match: 'Strong evidence',
    matchType: 'strong',
    topGap: 'Model deployment latency',
    lastActivity: 'Oct 21, 11:05',
    readinessScore: 89,
  },
  {
    id: 'usr_priya_cs',
    name: 'Priya Nair',
    rollNumber: '2021BCS0188',
    branch: 'Computer Science & Engineering',
    role: 'Product Analyst',
    company: 'Groww',
    match: 'Strong evidence',
    matchType: 'strong',
    topGap: 'A/B testing statistical rigor',
    lastActivity: 'Oct 18, 16:40',
    readinessScore: 84,
  },
  {
    id: 'usr_siddharth',
    name: 'Siddharth Sen',
    rollNumber: '2021BCS0401',
    branch: 'Computer Science & Engineering',
    role: 'Full Stack Engineer',
    company: 'CRED',
    match: 'Needs stronger proof',
    matchType: 'proof',
    topGap: 'CI/CD pipeline test gates',
    lastActivity: 'Oct 17, 12:10',
    readinessScore: 73,
  },
  // ECE Students
  {
    id: 'usr_aarav_01',
    name: 'Aarav Sundaram',
    rollNumber: '4NI21EC042',
    branch: 'Electronics & Communication',
    role: 'Embedded Systems Engineer',
    company: 'Qualcomm',
    match: 'Needs stronger proof',
    matchType: 'proof',
    topGap: 'FreeRTOS concurrency',
    lastActivity: 'Today, 07:30',
    readinessScore: 74,
  },
  {
    id: 'usr_priya',
    name: 'Priya Nair (ECE)',
    rollNumber: '4NI21EC088',
    branch: 'Electronics & Communication',
    role: 'VLSI Design & Verification Engineer',
    company: 'NVIDIA',
    match: 'Strong evidence',
    matchType: 'strong',
    topGap: 'CDC verification & timing closure',
    lastActivity: 'Oct 18, 16:40',
    readinessScore: 86,
  },
  {
    id: 'usr_karthik',
    name: 'Karthik Subramanian',
    rollNumber: '4NI21EC019',
    branch: 'Electronics & Communication',
    role: 'IoT & Firmware Specialist',
    company: 'Bosch',
    match: 'Early stage',
    matchType: 'missing',
    topGap: 'TLS/SSL on microcontrollers',
    lastActivity: 'Oct 15, 12:00',
    readinessScore: 65,
  },
  // Information Science
  {
    id: 'usr_rohan',
    name: 'Rohan Kulkarni',
    rollNumber: '4NI21IS019',
    branch: 'Information Science',
    role: 'Systems & Cloud Engineer',
    company: 'AWS',
    match: 'Early stage',
    matchType: 'missing',
    topGap: 'Linux kernel & memory',
    lastActivity: 'Oct 19, 09:30',
    readinessScore: 62,
  },
  {
    id: 'usr_shreya',
    name: 'Shreya Joshi',
    rollNumber: '4NI21IS077',
    branch: 'Information Science',
    role: 'Full Stack Engineer',
    company: 'CRED',
    match: 'Strong evidence',
    matchType: 'strong',
    topGap: 'End-to-end Cypress test suites',
    lastActivity: 'Oct 20, 15:10',
    readinessScore: 84,
  },
  // Mechanical
  {
    id: 'usr_aditya',
    name: 'Aditya Joshi',
    rollNumber: '4NI21ME034',
    branch: 'Mechanical Engineering',
    role: 'Robotics & Automation Engineer',
    company: 'ABB',
    match: 'Needs stronger proof',
    matchType: 'proof',
    topGap: 'Industrial PLC ladder logic',
    lastActivity: 'Oct 16, 14:00',
    readinessScore: 76,
  },
  {
    id: 'usr_vikram',
    name: 'Vikram Solanki',
    rollNumber: '4NI21ME092',
    branch: 'Mechanical Engineering',
    role: 'CAD/CAE Design Engineer',
    company: 'Tata Motors',
    match: 'Needs stronger proof',
    matchType: 'proof',
    topGap: 'Non-linear ANSYS FEA',
    lastActivity: 'Oct 14, 11:30',
    readinessScore: 70,
  },
  // Civil
  {
    id: 'usr_neha',
    name: 'Neha Patil',
    rollNumber: '4NI21CV021',
    branch: 'Civil Engineering',
    role: 'Structural Design Engineer',
    company: 'L&T Construction',
    match: 'Strong evidence',
    matchType: 'strong',
    topGap: 'Ductile detailing IS 13920',
    lastActivity: 'Oct 17, 10:15',
    readinessScore: 81,
  },
  {
    id: 'usr_rajesh',
    name: 'Rajesh Gowda',
    rollNumber: '4NI21CV055',
    branch: 'Civil Engineering',
    role: 'BIM & Project Planning Specialist',
    company: 'Atkins',
    match: 'Early stage',
    matchType: 'missing',
    topGap: 'Navisworks clash detection',
    lastActivity: 'Oct 13, 09:45',
    readinessScore: 67,
  },
];

const BRANCH_CONFIGS: Record<string, {
  name: string;
  totalResumes: number;
  roles: string[];
  gaps: { title: string; count: number; percent: number }[];
  workshopTitle: string;
}> = {
  'Computer Science & Engineering': {
    name: 'Computer Science & Engineering',
    totalResumes: 480,
    roles: [
      'All Roles',
      'Junior Frontend Developer',
      'Product Engineer (Backend)',
      'Full Stack Engineer',
      'Data Analyst',
      'Data Scientist',
      'Systems & Cloud Engineer',
      'Product Analyst',
    ],
    gaps: [
      { title: '1. System design & microservices', count: 185, percent: 38.5 },
      { title: '2. SQL joins & query plan tuning', count: 160, percent: 33.3 },
      { title: '3. Testing & test coverage (Jest/Cypress)', count: 148, percent: 30.8 },
      { title: '4. Dashboard & BI storytelling', count: 120, percent: 25.0 },
      { title: '5. Cloud deployment & Docker', count: 105, percent: 21.9 },
      { title: '6. Distributed tracing & logs', count: 76, percent: 15.8 },
    ],
    workshopTitle: 'Batch Kafka & System Design Workshop',
  },
  'Electronics & Communication': {
    name: 'Electronics & Communication',
    totalResumes: 340,
    roles: [
      'All Roles',
      'Embedded Systems Engineer',
      'VLSI Design & Verification Engineer',
      'IoT & Firmware Specialist',
    ],
    gaps: [
      { title: '1. FreeRTOS concurrency & memory pools', count: 142, percent: 41.8 },
      { title: '2. SystemVerilog UVM testbenches', count: 122, percent: 35.9 },
      { title: '3. SPI / I2C / CAN bus oscilloscope debug', count: 104, percent: 30.6 },
      { title: '4. Secure MQTT TLS on microcontrollers', count: 88, percent: 25.9 },
      { title: '5. Clock-domain crossing (CDC) timing closure', count: 68, percent: 20.0 },
      { title: '6. Bare-metal ARM Cortex peripheral interrupts', count: 52, percent: 15.3 },
    ],
    workshopTitle: 'FreeRTOS & Embedded Telemetry Bootcamp',
  },
  'Information Science': {
    name: 'Information Science',
    totalResumes: 220,
    roles: [
      'All Roles',
      'Full Stack Engineer',
      'Systems & Cloud Engineer',
      'Data Analyst',
    ],
    gaps: [
      { title: '1. Distributed caching & Redis cluster setups', count: 86, percent: 39.1 },
      { title: '2. OAuth2 / OpenID Connect security flows', count: 74, percent: 33.6 },
      { title: '3. CI/CD test automation gates', count: 65, percent: 29.5 },
      { title: '4. Database indexing & query execution plans', count: 52, percent: 23.6 },
      { title: '5. Linux kernel internals & memory profiling', count: 41, percent: 18.6 },
    ],
    workshopTitle: 'Distributed Systems & Cloud DevOps Workshop',
  },
  'Mechanical Engineering': {
    name: 'Mechanical Engineering',
    totalResumes: 180,
    roles: [
      'All Roles',
      'Robotics & Automation Engineer',
      'CAD/CAE Design Engineer',
    ],
    gaps: [
      { title: '1. Non-linear FEA structural analysis (ANSYS)', count: 78, percent: 43.3 },
      { title: '2. SolidWorks parametric modeling & GD&T', count: 68, percent: 37.8 },
      { title: '3. PLC ladder logic & industrial Modbus', count: 56, percent: 31.1 },
      { title: '4. Thermal dissipation & CFD fluent meshing', count: 44, percent: 24.4 },
      { title: '5. ROS2 robot kinematics simulation', count: 32, percent: 17.8 },
    ],
    workshopTitle: 'Industrial Robotics & ANSYS Simulation Sprint',
  },
  'Civil Engineering': {
    name: 'Civil Engineering',
    totalResumes: 150,
    roles: [
      'All Roles',
      'Structural Design Engineer',
      'BIM & Project Planning Specialist',
    ],
    gaps: [
      { title: '1. ETABS multi-story seismic analysis & ductile detailing', count: 63, percent: 42.0 },
      { title: '2. AutoCAD structural drafting & IS codes', count: 55, percent: 36.7 },
      { title: '3. Revit BIM 360 & Navisworks clash detection', count: 47, percent: 31.3 },
      { title: '4. Concrete mix design & durability testing (IS 456)', count: 38, percent: 25.3 },
      { title: '5. Primavera P6 critical path scheduling', count: 28, percent: 18.7 },
    ],
    workshopTitle: 'BIM & Advanced Seismic Structural Design Clinic',
  },
  All: {
    name: 'All Engineering Departments',
    totalResumes: 1370,
    roles: [
      'All Roles',
      'Junior Frontend Developer',
      'Product Engineer (Backend)',
      'Full Stack Engineer',
      'Data Analyst',
      'Data Scientist',
      'Embedded Systems Engineer',
      'VLSI Design & Verification Engineer',
      'IoT & Firmware Specialist',
      'Robotics & Automation Engineer',
      'CAD/CAE Design Engineer',
      'Structural Design Engineer',
      'BIM & Project Planning Specialist',
    ],
    gaps: [
      { title: '1. System design & real-time architecture', count: 482, percent: 35.2 },
      { title: '2. Verifiable GitHub implementation proof', count: 415, percent: 30.3 },
      { title: '3. Automated unit & integration testing', count: 389, percent: 28.4 },
      { title: '4. Domain-specific tooling (Docker, RTOS, ANSYS)', count: 312, percent: 22.8 },
      { title: '5. Technical communication & interview articulation', count: 274, percent: 20.0 },
    ],
    workshopTitle: 'Campus Placement Readiness & Interview Mastery Summit',
  },
};

export default function CoordinatorDashboardPage() {
  const router = useRouter();
  const [branchFilter, setBranchFilter] = useState('Computer Science & Engineering');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<StudentRow[]>(ALL_ROSTER_STUDENTS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    const cookieRole = typeof document !== 'undefined'
      ? document.cookie.split('; ').find(row => row.startsWith('readiness_role='))?.split('=')[1]
      : null;

    const isAllowedCoordinator =
      session?.email === 'durgasravan21@gmail.com' ||
      session?.role === 'coordinator' ||
      cookieRole === 'coordinator';

    if (session && session.role === 'student' && !isAllowedCoordinator) {
      router.push('/home');
    }
  }, [router]);

  // Load real profiles & analyses from Supabase
  useEffect(() => {
    async function loadRealData() {
      try {
        const supabase = createClient();
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name, email, roll_number, branch, cgpa, role')
          .neq('id', 'system');

        const { data: analyses } = await supabase
          .from('analyses')
          .select('id, user_id, dream_role, dream_company, readiness_score, top_gap, created_at');

        if (profiles && profiles.length > 0) {
          const liveRows: StudentRow[] = profiles
            .filter((p: any) => p.role === 'student' || p.id === '36ac8503-c1c5-4865-b3f5-51c302a3e1ee')
            .map((p: any) => {
              const userAnalysis = analyses?.find((a: any) => a.user_id === p.id);
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
                role: userAnalysis?.dream_role || 'Software Engineer',
                company: userAnalysis?.dream_company || 'Tier-1 Tech',
                match: matchLabel,
                matchType,
                topGap: userAnalysis?.top_gap || 'State Management',
                lastActivity: userAnalysis?.created_at
                  ? new Date(userAnalysis.created_at).toLocaleDateString()
                  : 'Today',
                readinessScore: score,
              };
            });

          const liveIdSet = new Set(liveRows.map(r => r.id));
          const combined = [...liveRows, ...ALL_ROSTER_STUDENTS.filter(s => !liveIdSet.has(s.id))];
          setStudents(combined);
        }
      } catch (err) {
        console.warn('Could not sync DB students for TPC overview:', err);
      }
    }

    loadRealData();
  }, []);

  const branchConfig = useMemo(() => {
    return BRANCH_CONFIGS[branchFilter] || BRANCH_CONFIGS.All;
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
        s.role.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBranch =
        branchFilter === 'All' || s.branch.toLowerCase().includes(branchFilter.toLowerCase());

      const matchesRole =
        roleFilter === 'All Roles' ||
        s.role.toLowerCase().includes(roleFilter.toLowerCase());

      return matchesSearch && matchesBranch && matchesRole;
    });
  }, [students, searchQuery, branchFilter, roleFilter]);

  // Dynamic Metrics per active branch & filter
  const metrics = useMemo(() => {
    const totalCensus = branchConfig.totalResumes;
    const strongPct = 25 + (branchFilter === 'Electronics & Communication' ? 4 : branchFilter === 'Mechanical Engineering' ? -3 : 0);
    const proofPct = 47 + (branchFilter === 'Information Science' ? 2 : branchFilter === 'Civil Engineering' ? 1 : 0);
    const missingPct = 100 - strongPct - proofPct;

    const strongCount = Math.round((totalCensus * strongPct) / 100);
    const proofCount = Math.round((totalCensus * proofPct) / 100);
    const missingCount = totalCensus - strongCount - proofCount;

    return {
      total: totalCensus,
      strongCount,
      strongPct,
      proofCount,
      proofPct,
      missingCount,
      missingPct,
    };
  }, [branchConfig, branchFilter]);

  const exportCSV = () => {
    const headers = [
      'Student Name',
      'Roll Number',
      'Branch',
      'Target Role',
      'Readiness Match',
      'Top Skill Gap',
      'Last Activity',
    ];
    const rows = filteredStudents.map((s) => [
      s.name,
      s.rollNumber,
      s.branch,
      s.role,
      s.match,
      s.topGap,
      s.lastActivity,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `readiness_cohort_${branchFilter.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage('Exported roster CSV successfully');
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex flex-col pb-20 md:pb-12">
      <TopNav />
      <Sidebar />

      {/* Main Content Area offset by Sidebar */}
      <div className="md:pl-[240px]">
        <main className="pt-16 bg-surface min-h-screen px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-[1300px] mx-auto w-full">
            {/* Header Title */}
            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-4">
              <div>
                <h1 className="font-headline text-2xl sm:text-3xl text-primary font-semibold tracking-tight">
                  {branchFilter === 'All' ? 'All Engineering Departments' : `Final Year, ${branchConfig.name}`}
                </h1>
                <p className="font-body text-xs sm:text-sm text-on-surface-variant mt-0.5">
                  Evaluation ledger and competency diagnosis across graduating engineering candidates
                </p>
              </div>

              <div className="mt-2 md:mt-0 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                <span className="font-mono text-xs text-on-surface-variant">
                  Batch 2021–2025 • Active Institutional Evaluation
                </span>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-surface-container-lowest rounded-xl p-3 sm:p-4 mb-6 flex flex-wrap items-center justify-between gap-4 border border-surface-variant shadow-xs">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                {/* Branch Selection */}
                <div className="flex items-center gap-2">
                  <label className="text-on-surface-variant font-medium">Branch:</label>
                  <select
                    value={branchFilter}
                    onChange={(e) => handleBranchChange(e.target.value)}
                    className="bg-surface-container-low text-on-surface font-medium py-1.5 px-3 rounded-lg border border-surface-variant focus:outline-none focus:border-primary"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Information Science">Information Science & Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="All">All Departments</option>
                  </select>
                </div>

                <div className="h-4 w-px bg-surface-variant hidden sm:block"></div>

                {/* Target Role Selector - Dynamically Populated By Branch */}
                <div className="flex items-center gap-2">
                  <label className="text-on-surface-variant font-medium">Target role:</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="bg-surface-container-low text-on-surface font-medium py-1.5 px-3 rounded-lg border border-surface-variant focus:outline-none focus:border-primary"
                  >
                    {branchConfig.roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="h-4 w-px bg-surface-variant hidden sm:block"></div>

                {/* Quick Link to Full Student Roster */}
                <Link
                  href="/tpc/students"
                  className="font-mono text-xs text-secondary hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Open candidate directory</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] text-outline">history</span>
                <span>Active Cohort Sync</span>
              </div>
            </div>

            {/* 4 Summary Metric Cards (Dynamic by Branch) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-surface-container-lowest rounded-xl p-5 border border-surface-variant shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3 text-xs text-on-surface-variant font-mono uppercase tracking-wider">
                  <span>Cohort Census</span>
                  <span className="material-symbols-outlined text-[20px] text-outline">description</span>
                </div>
                <div>
                  <div className="font-headline text-3xl font-bold text-primary leading-none mb-1">
                    {metrics.total.toLocaleString()}
                  </div>
                  <div className="font-body text-xs text-on-surface-variant">Resumes analysed</div>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-xl p-5 border border-surface-variant shadow-xs flex flex-col justify-between">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs text-on-surface-variant font-mono uppercase tracking-wider">Benchmark Met</span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#E8F0EA] text-[#4F7A5A] font-semibold">
                    Strong evidence
                  </span>
                </div>
                <div>
                  <div className="font-headline text-3xl font-bold text-primary leading-none mb-1">
                    {metrics.strongCount.toLocaleString()}
                  </div>
                  <div className="font-body text-xs text-on-surface-variant">
                    Ready for target role ({metrics.strongPct}%)
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-xl p-5 border border-surface-variant shadow-xs flex flex-col justify-between">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs text-on-surface-variant font-mono uppercase tracking-wider">Intervention Required</span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#F7EEDB] text-[#B7832F] font-semibold">
                    Needs stronger proof
                  </span>
                </div>
                <div>
                  <div className="font-headline text-3xl font-bold text-primary leading-none mb-1">
                    {metrics.proofCount.toLocaleString()}
                  </div>
                  <div className="font-body text-xs text-on-surface-variant">
                    Need stronger proof ({metrics.proofPct}%)
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-xl p-5 border border-surface-variant shadow-xs flex flex-col justify-between">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs text-on-surface-variant font-mono uppercase tracking-wider">Under-Substantiated</span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#FFDAD6] text-error font-semibold">
                    Missing proofs
                  </span>
                </div>
                <div>
                  <div className="font-headline text-3xl font-bold text-primary leading-none mb-1">
                    {metrics.missingCount.toLocaleString()}
                  </div>
                  <div className="font-body text-xs text-on-surface-variant">
                    Early stage ({metrics.missingPct}%)
                  </div>
                </div>
              </div>
            </div>

            {/* Split Section: Roster Table & Common Gaps */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left 8 Cols: Candidate Roster */}
              <div className="lg:col-span-8 space-y-3" id="roster">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-container-lowest p-3 rounded-xl border border-surface-variant shadow-xs">
                  <div className="flex items-center gap-3 flex-1 max-w-md">
                    <span className="font-headline text-sm font-semibold text-on-surface whitespace-nowrap">
                      Candidate Roster <span className="font-mono text-outline font-normal">({filteredStudents.length})</span>
                    </span>
                    <div className="relative w-full">
                      <span className="material-symbols-outlined text-[18px] text-outline absolute left-3 top-1/2 -translate-y-1/2">
                        search
                      </span>
                      <input
                        type="text"
                        placeholder="Search student name, ID or role..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-surface-container-low text-on-surface placeholder:text-outline text-xs pl-9 pr-3 py-1.5 rounded-lg border border-surface-variant focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <button
                    onClick={exportCSV}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary font-semibold text-xs transition-colors self-end sm:self-auto border border-surface-variant"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    <span>Export CSV</span>
                  </button>
                </div>

                {/* Table */}
                <div className="bg-surface-container-lowest rounded-xl border border-surface-variant overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-surface-container-low text-on-surface-variant font-mono">
                          <th className="py-3 px-4">Student</th>
                          <th className="py-3 px-3 hidden xl:table-cell">Branch</th>
                          <th className="py-3 px-3">Target role</th>
                          <th className="py-3 px-3">Match</th>
                          <th className="py-3 px-3">Top gap</th>
                          <th className="py-3 px-3 hidden md:table-cell">Last activity</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-container">
                        {filteredStudents.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-on-surface-variant">
                              No candidates found in this department/role filter.
                            </td>
                          </tr>
                        ) : (
                          filteredStudents.map((st) => (
                            <tr key={st.id} className="hover:bg-surface-container-low/60 transition-colors">
                              <td className="py-2.5 px-4">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-on-surface">{st.name}</span>
                                  <span className="font-mono text-outline text-[11px]">{st.rollNumber}</span>
                                </div>
                              </td>
                              <td className="py-2.5 px-3 font-body text-on-surface-variant hidden xl:table-cell">
                                {st.branch}
                              </td>
                              <td className="py-2.5 px-3 font-semibold text-primary">
                                {st.role}
                              </td>
                              <td className="py-2.5 px-3">
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
                              <td className="py-2.5 px-3 text-on-surface-variant truncate max-w-[150px]">
                                {st.topGap}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-on-surface-variant hidden md:table-cell whitespace-nowrap">
                                {st.lastActivity}
                              </td>
                              <td className="py-2.5 px-4 text-right">
                                <Link
                                  href={`/tpc/students/${st.id}`}
                                  className="font-semibold text-primary hover:underline inline-flex items-center gap-0.5"
                                >
                                  <span>View audit</span>
                                  <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                                </Link>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between px-4 py-3 bg-surface-container-low border-t border-surface-container text-xs font-mono text-on-surface-variant">
                    <span>
                      Showing {filteredStudents.length} candidate(s) in {branchConfig.name}
                    </span>
                    <Link
                      href="/tpc/students"
                      className="text-primary hover:underline font-semibold"
                    >
                      View full student roster →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right 4 Cols: Most Common Gaps (Dynamic by Branch) */}
              <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl p-5 border border-surface-variant shadow-xs flex flex-col justify-between">
                <div>
                  <div className="mb-4">
                    <h2 className="font-headline text-base font-semibold text-primary mb-0.5">
                      Most common gaps · {branchConfig.name}
                    </h2>
                    <p className="font-body text-xs text-on-surface-variant">
                      Aggregated from {metrics.total} candidate diagnoses in this department.
                    </p>
                  </div>

                  <div className="space-y-4 my-3">
                    {branchConfig.gaps.map((gap, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex items-baseline justify-between text-xs text-on-surface">
                          <span className="font-medium truncate pr-2">{gap.title}</span>
                          <span className="font-mono text-on-surface-variant shrink-0">
                            {gap.count} <span className="text-outline">({gap.percent}%)</span>
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                          <div
                            className="h-full bg-primary-container rounded-full"
                            style={{ width: `${gap.percent}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-surface-container flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setToastMessage(`${branchConfig.workshopTitle} scheduled for next Saturday`);
                      setTimeout(() => setToastMessage(null), 3000);
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-primary text-on-primary font-semibold text-xs hover:bg-primary-container transition-colors shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">event</span>
                    <span>Schedule {branchFilter === 'All' ? 'Workshop' : `${branchFilter.split(' ')[0]} Workshop`}</span>
                  </button>

                  <Link
                    href="/tpc/roles"
                    className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold text-xs transition-colors border border-surface-variant"
                  >
                    <span className="material-symbols-outlined text-[16px] text-outline">add_circle</span>
                    <span>Configure target roles</span>
                  </Link>
                </div>
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
