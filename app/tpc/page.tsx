'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/layout/TopNav';
import Sidebar from '@/components/layout/Sidebar';
import MobileTabBar from '@/components/layout/MobileTabBar';
import { getSession } from '@/lib/auth';

const ROSTER_STUDENTS = [
  {
    id: 'usr_rahul',
    name: 'Rahul Verma',
    rollNumber: '2021BCS0142',
    branch: 'B.Tech CSE',
    role: 'Data Analyst',
    match: 'Needs stronger proof',
    matchType: 'proof',
    topGap: 'Dashboard & BI tools',
    lastActivity: '12 Sept, 14:20',
  },
  {
    id: 'usr_ananya',
    name: 'Ananya Reddy',
    rollNumber: '2021BCS0089',
    branch: 'B.Tech CSE',
    role: 'Junior Frontend Developer',
    match: 'Strong evidence',
    matchType: 'strong',
    topGap: 'React state management',
    lastActivity: 'Today, 10:24',
  },
  {
    id: 'usr_devansh',
    name: 'Devansh Mathur',
    rollNumber: '2021BCS0312',
    branch: 'B.Tech CSE',
    role: 'Backend Engineer',
    match: 'Needs stronger proof',
    matchType: 'proof',
    topGap: 'Distributed tracing',
    lastActivity: 'Yesterday, 18:15',
  },
  {
    id: 'usr_meera',
    name: 'Meera Venkatesh',
    rollNumber: '2021BCS0044',
    branch: 'B.Tech CSE',
    role: 'Data Scientist',
    match: 'Strong evidence',
    matchType: 'strong',
    topGap: 'Model deployment latency',
    lastActivity: 'Oct 21, 11:05',
  },
  {
    id: 'usr_rohan',
    name: 'Rohan Kulkarni',
    rollNumber: '2021BCS0219',
    branch: 'B.Tech CSE',
    role: 'Systems Engineer',
    match: 'Early stage',
    matchType: 'missing',
    topGap: 'Linux kernel & memory',
    lastActivity: 'Oct 19, 09:30',
  },
  {
    id: 'usr_priya',
    name: 'Priya Nair',
    rollNumber: '2021BCS0188',
    branch: 'B.Tech CSE',
    role: 'Product Analyst',
    match: 'Strong evidence',
    matchType: 'strong',
    topGap: 'A/B testing statistical rigor',
    lastActivity: 'Oct 18, 16:40',
  },
  {
    id: 'usr_siddharth',
    name: 'Siddharth Sen',
    rollNumber: '2021BCS0401',
    branch: 'B.Tech CSE',
    role: 'Full Stack Engineer',
    match: 'Needs stronger proof',
    matchType: 'proof',
    topGap: 'CI/CD pipeline test gates',
    lastActivity: 'Oct 17, 12:10',
  },
];

const COMMON_GAPS = [
  { title: '1. System design basics', count: 482, percent: 38.6 },
  { title: '2. SQL joins & query tuning', count: 415, percent: 33.2 },
  { title: '3. Testing & test coverage', count: 389, percent: 31.1 },
  { title: '4. Dashboard & BI storytelling', count: 312, percent: 25.0 },
  { title: '5. Cloud deployment & Docker', count: 274, percent: 21.9 },
  { title: '6. Distributed tracing & logs', count: 198, percent: 15.8 },
];

export default function CoordinatorDashboardPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    // Route protection: students cannot open /tpc
    if (session && session.role === 'student') {
      router.push('/home');
    }
  }, [router]);

  const filteredStudents = ROSTER_STUDENTS.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || s.role.toLowerCase().includes(roleFilter.toLowerCase());
    return matchesSearch && matchesRole;
  });

  const exportCSV = () => {
    const headers = ['Student Name', 'Roll Number', 'Branch', 'Target Role', 'Readiness Match', 'Top Skill Gap', 'Last Activity'];
    const rows = filteredStudents.map((s) => [s.name, s.rollNumber, s.branch, s.role, s.match, s.topGap, s.lastActivity]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'readiness_cohort_roster.csv');
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
                  Final year, Computer Science
                </h1>
                <p className="font-body text-xs sm:text-sm text-on-surface-variant mt-0.5">
                  Evaluation ledger and competency diagnosis across graduating engineering candidates
                </p>
              </div>

              <div className="mt-2 md:mt-0 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                <span className="font-mono text-xs text-on-surface-variant">
                  Batch 2021–2025 • Active Evaluation
                </span>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-surface-container-lowest rounded-xl p-3 sm:p-4 mb-6 flex flex-wrap items-center justify-between gap-4 border border-surface-variant shadow-xs">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <label className="text-on-surface-variant font-medium">Branch:</label>
                  <select className="bg-surface-container-low text-on-surface font-medium py-1.5 px-3 rounded-lg border border-surface-variant focus:outline-none">
                    <option>Computer Science & Engineering</option>
                    <option>Information Technology</option>
                    <option>Electronics & Communication</option>
                  </select>
                </div>

                <div className="h-4 w-px bg-surface-variant hidden sm:block"></div>

                <div className="flex items-center gap-2">
                  <label className="text-on-surface-variant font-medium">Year:</label>
                  <select className="bg-surface-container-low text-on-surface font-medium py-1.5 px-3 rounded-lg border border-surface-variant focus:outline-none">
                    <option>Final Year 2025</option>
                    <option>Pre-Final Year 2026</option>
                  </select>
                </div>

                <div className="h-4 w-px bg-surface-variant hidden sm:block"></div>

                <div className="flex items-center gap-2">
                  <label className="text-on-surface-variant font-medium">Target role:</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="bg-surface-container-low text-on-surface font-medium py-1.5 px-3 rounded-lg border border-surface-variant focus:outline-none"
                  >
                    <option value="All">All Roles</option>
                    <option value="Frontend">Frontend Developer</option>
                    <option value="Backend">Backend Engineer</option>
                    <option value="Data Analyst">Data Analyst</option>
                    <option value="Data Scientist">Data Scientist</option>
                    <option value="Systems">Systems Engineer</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] text-outline">history</span>
                <span>Last sync 14 mins ago</span>
              </div>
            </div>

            {/* 4 Summary Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-surface-container-lowest rounded-xl p-5 border border-surface-variant shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3 text-xs text-on-surface-variant font-mono uppercase tracking-wider">
                  <span>Cohort Census</span>
                  <span className="material-symbols-outlined text-[20px] text-outline">description</span>
                </div>
                <div>
                  <div className="font-headline text-3xl font-bold text-primary leading-none mb-1">1,248</div>
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
                  <div className="font-headline text-3xl font-bold text-primary leading-none mb-1">312</div>
                  <div className="font-body text-xs text-on-surface-variant">Ready for target role (25%)</div>
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
                  <div className="font-headline text-3xl font-bold text-primary leading-none mb-1">587</div>
                  <div className="font-body text-xs text-on-surface-variant">Need stronger proof (47%)</div>
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
                  <div className="font-headline text-3xl font-bold text-primary leading-none mb-1">349</div>
                  <div className="font-body text-xs text-on-surface-variant">Early stage (28%)</div>
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
                        className="w-full bg-surface-container-low text-on-surface placeholder:text-outline text-xs pl-9 pr-3 py-1.5 rounded-lg border border-surface-variant focus:outline-none"
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
                        {filteredStudents.map((st) => (
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
                                className="font-semibold text-primary hover:underline"
                              >
                                View audit →
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between px-4 py-3 bg-surface-container-low border-t border-surface-container text-xs font-mono text-on-surface-variant">
                    <span>Showing 1–{filteredStudents.length} of 1,248 students</span>
                    <div className="flex items-center gap-2">
                      <button disabled className="px-2.5 py-1 rounded bg-surface-container-lowest text-outline opacity-50 cursor-not-allowed">
                        Previous
                      </button>
                      <button className="px-2.5 py-1 rounded bg-surface-container-lowest text-primary hover:bg-surface-container font-semibold transition-colors">
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right 4 Cols: Most Common Gaps */}
              <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl p-5 border border-surface-variant shadow-xs flex flex-col justify-between">
                <div>
                  <div className="mb-4">
                    <h2 className="font-headline text-base font-semibold text-primary mb-0.5">
                      Most common gaps this cohort
                    </h2>
                    <p className="font-body text-xs text-on-surface-variant">
                      Aggregated from 1,248 analyzed student resumes.
                    </p>
                  </div>

                  <div className="space-y-4 my-3">
                    {COMMON_GAPS.map((gap, i) => (
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
                      setToastMessage('Batch Kafka & System Design Workshop scheduled for Sat, Nov 8');
                      setTimeout(() => setToastMessage(null), 3000);
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-primary text-on-primary font-semibold text-xs hover:bg-primary-container transition-colors shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">event</span>
                    <span>Schedule cohort workshop</span>
                  </button>

                  <Link
                    href="/tpc/roles"
                    className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold text-xs transition-colors border border-surface-variant"
                  >
                    <span className="material-symbols-outlined text-[16px] text-outline">add_circle</span>
                    <span>Upload new target roles</span>
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
